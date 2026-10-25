import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { hrefFor } from '../lib/router'
import { slugify } from '../lib/notes'
import { IconCheck, IconCopy } from './icons'

const languageLabels: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  java: 'Java',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  python: 'Python',
  py: 'Python',
  sql: 'SQL',
  bash: 'Bash',
  sh: 'Shell',
  json: 'JSON',
  text: 'Text',
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const child = Array.isArray(children) ? children[0] : children
  const childProps =
    child && typeof child === 'object' && 'props' in child
      ? (child as { props: { className?: string; children?: ReactNode } }).props
      : undefined

  const language = /language-([\w-]+)/.exec(childProps?.className ?? '')?.[1] ?? ''
  const code = textOf(childProps?.children ?? '')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard access can be denied — leave the button unchanged.
    }
  }

  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{languageLabels[language] ?? language ?? 'Code'}</span>
        <button type="button" className="code-copy" onClick={copy} aria-label="Copy code">
          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  )
}

interface Tab {
  label: string
  lang: string
  code: string
}

type Segment = { kind: 'markdown'; content: string } | { kind: 'tabs'; tabs: Tab[] }

const FENCE_OPEN = /^\s{0,3}(`{3,}|~{3,})\s*([\w+-]*)\s*(.*)$/
const FENCE_CLOSE = /^\s{0,3}(`{3,}|~{3,})\s*$/

function tabLabel(meta: string): string | null {
  const match = /\btab\s*=\s*"([^"]+)"/.exec(meta) ?? /\btab\s*=\s*'([^']+)'/.exec(meta)
  return match ? match[1].trim() : null
}

/**
 * Splits note markdown into plain chunks and runs of consecutive fenced code blocks that carry
 * `tab="Label"` in their info string. Each run becomes one tabbed code widget.
 */
function splitSegments(markdown: string): Segment[] {
  const lines = markdown.split('\n')
  const segments: Segment[] = []
  let markdownLines: string[] = []
  let pendingTabs: Tab[] = []

  const flushTabs = () => {
    if (pendingTabs.length > 0) {
      segments.push({ kind: 'tabs', tabs: pendingTabs })
      pendingTabs = []
    }
  }

  const flushMarkdown = () => {
    const content = markdownLines.join('\n')
    if (content.trim()) segments.push({ kind: 'markdown', content })
    markdownLines = []
  }

  let index = 0
  while (index < lines.length) {
    const open = FENCE_OPEN.exec(lines[index])
    if (!open) {
      if (pendingTabs.length > 0 && lines[index].trim() !== '') flushTabs()
      markdownLines.push(lines[index])
      index += 1
      continue
    }

    const fence = open[1]
    const language = open[2]
    const label = tabLabel(open[3])

    const body: string[] = []
    let close = index + 1
    while (close < lines.length) {
      const marker = FENCE_CLOSE.exec(lines[close])
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length) break
      body.push(lines[close])
      close += 1
    }

    if (close >= lines.length) {
      // Unterminated fence — leave the rest untouched.
      markdownLines.push(...lines.slice(index))
      break
    }

    if (label) {
      flushMarkdown()
      pendingTabs.push({ label, lang: language || 'text', code: body.join('\n') })
    } else {
      flushTabs()
      markdownLines.push(...lines.slice(index, close + 1))
    }

    index = close + 1
  }

  flushMarkdown()
  flushTabs()
  return segments
}

function CodeTabs({ tabs, components }: { tabs: Tab[]; components: Components }) {
  const [active, setActive] = useState(0)
  const groupId = useId()
  const current = tabs[Math.min(active, tabs.length - 1)]

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1
    let next = index

    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return

    event.preventDefault()
    setActive(next)
    const buttons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons?.[next]?.focus()
  }

  return (
    <div className="code-tabs">
      <div className="code-tablist" role="tablist" aria-label="Code variants">
        {tabs.map((tab, index) => {
          const selected = index === active

          return (
            <button
              key={`${tab.label}-${index}`}
              type="button"
              role="tab"
              id={`${groupId}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${groupId}-panel`}
              tabIndex={selected ? 0 : -1}
              className={`code-tab${selected ? ' is-active' : ''}`}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        id={`${groupId}-panel`}
        role="tabpanel"
        aria-labelledby={`${groupId}-tab-${active}`}
        tabIndex={0}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
          components={components}
        >
          {`\`\`\`${current.lang}\n${current.code}\n\`\`\``}
        </ReactMarkdown>
      </div>
    </div>
  )
}

function makeHeading(level: 2 | 3, slug: string) {
  return function Heading({ children }: { children?: ReactNode }) {
    const id = slugify(textOf(children))
    const Tag = level === 2 ? 'h2' : 'h3'

    return (
      <Tag id={id}>
        <a className="heading-anchor" href={hrefFor(slug, id)} aria-label="Link to this section">
          #
        </a>
        {children}
      </Tag>
    )
  }
}

export function Markdown({ content, slug }: { content: string; slug: string }) {
  const segments = useMemo(() => splitSegments(content), [content])

  const components: Components = {
    h2: makeHeading(2, slug),
    h3: makeHeading(3, slug),
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    table: ({ children }) => (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    ),
    a: ({ href, children }) => {
      if (!href) return <>{children}</>

      if (href.startsWith('#')) {
        return <a href={hrefFor(slug, href.slice(1))}>{children}</a>
      }

      const external = href.startsWith('http')
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
          {children}
        </a>
      )
    },
  }

  return (
    <div className="prose">
      {segments.map((segment, index) =>
        segment.kind === 'tabs' ? (
          <CodeTabs key={`tabs-${index}`} tabs={segment.tabs} components={components} />
        ) : (
          <ReactMarkdown
            key={`markdown-${index}`}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
            components={components}
          >
            {segment.content}
          </ReactMarkdown>
        ),
      )}
    </div>
  )
}
