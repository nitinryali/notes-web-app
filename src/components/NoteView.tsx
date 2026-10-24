import { useEffect, useState } from 'react'
import type { Note } from '../lib/notes'
import { formatDate, getSection, neighbours } from '../lib/notes'
import { hrefFor } from '../lib/router'
import { Markdown } from './Markdown'
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
} from './icons'

interface NoteViewProps {
  note: Note
  revised: boolean
  onToggleRevised: () => void
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const value = max > 0 ? window.scrollY / max : 0
      setProgress(Math.min(1, Math.max(0, value)))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="reading-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}

function TableOfContents({ note }: { note: Note }) {
  const [active, setActive] = useState(note.headings[0]?.id ?? '')

  useEffect(() => {
    const first = note.headings[0]?.id ?? ''

    const onScroll = () => {
      const marker = window.scrollY + 140
      let current = first

      for (const heading of note.headings) {
        const element = document.getElementById(heading.id)
        if (!element) continue
        if (element.getBoundingClientRect().top + window.scrollY <= marker) {
          current = heading.id
        }
      }

      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [note])

  if (note.headings.length === 0) return null

  return (
    <aside className="toc-wrap">
      <nav className="toc" aria-label="On this page">
        <p className="toc-title">On this page</p>
        {note.headings.map((heading) => (
          <a
            key={heading.id}
            className={`toc-link depth-${heading.depth} ${active === heading.id ? 'is-active' : ''}`}
            href={hrefFor(note.slug, heading.id)}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export function NoteView({ note, revised, onToggleRevised }: NoteViewProps) {
  const section = getSection(note.section)
  const { previous, next } = neighbours(note)

  return (
    <div className="note-layout">
      <ReadingProgress />

      <article className="note">
        <header className="note-head">
          <div className="note-kicker">
            {section && (
              <>
                <a className="kicker-link" href={hrefFor(section.id)}>
                  {section.title}
                </a>
                <span className="dot-sep" />
              </>
            )}
            {note.updated && (
              <>
                <span>Updated {formatDate(note.updated)}</span>
                <span className="dot-sep" />
              </>
            )}
            <span className="meta-item">
              <IconClock size={13} />
              {note.readingMinutes} min read
            </span>
          </div>

          <h1>{note.title}</h1>
          {note.description && <p className="note-lead">{note.description}</p>}

          <div className="note-actions">
            <div className="tags">
              {note.tags.map((tag) => (
                <span className="tag" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              className={`revise-btn ${revised ? 'is-done' : ''}`}
              onClick={onToggleRevised}
              aria-pressed={revised}
            >
              <IconCheck size={15} />
              {revised ? 'Revised' : 'Mark as revised'}
            </button>
          </div>
        </header>

        <Markdown content={note.body} slug={note.slug} />

        <footer className="note-foot">
          <div className="pager-grid">
            {previous ? (
              <a className="pager is-prev" href={hrefFor(previous.slug)}>
                <span className="pager-dir">
                  <IconChevronLeft size={14} />
                  Previous
                </span>
                <span className="pager-title">{previous.title}</span>
              </a>
            ) : (
              <span />
            )}

            {next && (
              <a className="pager is-next" href={hrefFor(next.slug)}>
                <span className="pager-dir">
                  Next
                  <IconChevronRight size={14} />
                </span>
                <span className="pager-title">{next.title}</span>
              </a>
            )}
          </div>

          <p className="note-foot-note">
            Spotted a mistake? Edit <code>src/content/{note.slug}.md</code> and push — the site
            redeploys automatically.
          </p>
        </footer>
      </article>

      <TableOfContents note={note} />
    </div>
  )
}
