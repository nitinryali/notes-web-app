export interface Heading {
  depth: number
  text: string
  id: string
}

export interface Note {
  slug: string
  section: string
  title: string
  description: string
  tags: string[]
  order: number
  updated: string
  body: string
  plain: string
  prose: string
  headings: Heading[]
  readingMinutes: number
}

export interface Section {
  id: string
  title: string
  blurb: string
  order: number
  notes: Note[]
}

interface SectionConfig {
  title: string
  blurb: string
  order: number
}

const sectionConfig: Record<string, SectionConfig> = {
  dsa: {
    title: 'DSA',
    blurb: 'Data structures, algorithms and the patterns behind them.',
    order: 1,
  },
  java: {
    title: 'Java',
    blurb: 'Language internals, collections, generics and concurrency.',
    order: 2,
  },
  dbms: {
    title: 'DBMS',
    blurb: 'SQL, indexing, transactions and normalisation.',
    order: 3,
  },
  os: {
    title: 'Operating Systems',
    blurb: 'Processes, scheduling, memory and concurrency.',
    order: 4,
  },
  'system-design': {
    title: 'System Design',
    blurb: 'Building blocks, trade-offs and classic interview problems.',
    order: 5,
  },
}

type FrontmatterValue = string | number | string[]
type Frontmatter = Record<string, FrontmatterValue>

const rawFiles = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function unquote(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseValue(value: string): FrontmatterValue {
  const trimmed = value.trim()

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => unquote(item))
      .filter(Boolean)
  }

  if (/^-?\d+$/.test(trimmed)) return Number(trimmed)

  return unquote(trimmed)
}

function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  if (!raw.startsWith('---')) return { data: {}, body: raw }

  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { data: {}, body: raw }

  const header = raw.slice(3, end)
  const body = raw.slice(end + 4).replace(/^\s+/, '')
  const data: Frontmatter = {}

  for (const line of header.split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue

    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()
    if (key && value) data[key] = parseValue(value)
  }

  return { data, body }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  let inFence = false

  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{2,3})\s+(.+)$/.exec(line)
    if (!match) continue

    const text = match[2].replace(/[`*_]/g, '').trim()
    headings.push({ depth: match[1].length, text, id: slugify(text) })
  }

  return headings
}

export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[^\n]*\n?/g, ' ')
    .replace(/`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Plain text with table rows removed — used for readable search snippets. */
function toProseText(markdown: string): string {
  const withoutTables = markdown
    .split('\n')
    .filter((line) => !/^\s*\|/.test(line))
    .join('\n')

  return toPlainText(withoutTables)
}

function readingMinutes(body: string): number {
  const prose = body.replace(/```[\s\S]*?```/g, ' ')
  const words = prose.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function asString(value: FrontmatterValue | undefined, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return fallback
}

function buildNotes(): Note[] {
  return Object.entries(rawFiles)
    .map(([path, raw]) => {
      const { data, body } = parseFrontmatter(raw)
      const slug = path
        .replace(/^.*\/content\//, '')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '')

      const pathSection = slug.includes('/') ? slug.split('/')[0] : 'general'
      const section = asString(data.section, pathSection) || pathSection

      return {
        slug,
        section,
        title: asString(data.title, 'Untitled note'),
        description: asString(data.description),
        tags: Array.isArray(data.tags) ? data.tags : [],
        order: typeof data.order === 'number' ? data.order : 999,
        updated: asString(data.updated),
        body,
        plain: toPlainText(body),
        prose: toProseText(body),
        headings: extractHeadings(body),
        readingMinutes: readingMinutes(body),
      }
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export const notes: Note[] = buildNotes()

function sectionMeta(id: string): SectionConfig {
  return (
    sectionConfig[id] ?? {
      title: id
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      blurb: '',
      order: 99,
    }
  )
}

export const sections: Section[] = Array.from(new Set(notes.map((note) => note.section)))
  .map((id) => {
    const meta = sectionMeta(id)
    return {
      id,
      title: meta.title,
      blurb: meta.blurb,
      order: meta.order,
      notes: notes.filter((note) => note.section === id),
    }
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export function getNote(slug: string): Note | undefined {
  return notes.find((note) => note.slug === slug)
}

export function getSection(id: string): Section | undefined {
  return sections.find((section) => section.id === id)
}

export function getSectionNotes(sectionId: string): Note[] {
  return notes.filter((note) => note.section === sectionId)
}

export function neighbours(note: Note): { previous?: Note; next?: Note } {
  const siblings = notes.filter((item) => item.section === note.section)
  const index = siblings.findIndex((item) => item.slug === note.slug)
  return {
    previous: index > 0 ? siblings[index - 1] : undefined,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined,
  }
}

export interface SearchHit {
  note: Note
  snippet: string
  score: number
}

export function searchNotes(query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return []

  const hits: SearchHit[] = []

  for (const note of notes) {
    const title = note.title.toLowerCase()
    const description = note.description.toLowerCase()
    const haystack = note.plain.toLowerCase()

    let score = 0
    if (title === q) score += 200
    else if (title.startsWith(q)) score += 120
    else if (title.includes(q)) score += 80

    if (note.tags.some((tag) => tag.toLowerCase().includes(q))) score += 40
    if (description.includes(q)) score += 20

    let occurrences = 0
    let cursor = haystack.indexOf(q)
    while (cursor !== -1 && occurrences < 20) {
      occurrences += 1
      cursor = haystack.indexOf(q, cursor + q.length)
    }
    if (occurrences > 0) score += 10 + Math.min(occurrences, 5)

    if (score === 0) continue

    const snippetSource = note.prose.toLowerCase().includes(q) ? note.prose : note.plain
    const snippetIndex = snippetSource.toLowerCase().indexOf(q)
    let start = Math.max(0, snippetIndex - 80)
    let end = Math.min(snippetSource.length, snippetIndex + q.length + 120)

    if (start > 0) {
      const boundary = snippetSource.indexOf(' ', start)
      if (boundary !== -1 && boundary < snippetIndex) start = boundary + 1
    }

    if (end < snippetSource.length) {
      const boundary = snippetSource.lastIndexOf(' ', end)
      if (boundary > snippetIndex + q.length) end = boundary
    }

    const snippet =
      (start > 0 ? '…' : '') +
      snippetSource.slice(start, end).trim() +
      (end < snippetSource.length ? '…' : '')

    hits.push({ note, snippet, score })
  }

  return hits.sort((a, b) => b.score - a.score || a.note.title.localeCompare(b.note.title))
}

export function formatDate(value: string): string {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
