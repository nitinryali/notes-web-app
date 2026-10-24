import { useEffect, useMemo, useRef, useState } from 'react'
import { getSection, notes, searchNotes } from '../lib/notes'
import { hrefFor } from '../lib/router'
import { IconClose, IconSearch } from './icons'

const suggestions = Array.from(new Set(notes.flatMap((note) => note.tags))).slice(0, 5)

function Highlight({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim()
  if (!trimmed) return <>{text}</>

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'))

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const hits = useMemo(() => searchNotes(query), [query])

  useEffect(() => {
    if (!open) return

    setQuery('')
    setActive(0)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 20)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    const element = listRef.current?.querySelector('.is-active')
    element?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const goTo = (slug: string) => {
    window.location.hash = hrefFor(slug)
    onClose()
  }

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => Math.min(current + 1, Math.max(hits.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      const hit = hits[active]
      if (hit) {
        event.preventDefault()
        goTo(hit.note.slug)
      }
    }
  }

  return (
    <div
      className="search-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search notes">
        <div className="search-input-row">
          <IconSearch size={19} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search notes, topics, code…"
            aria-label="Search notes"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="search-close" onClick={onClose} aria-label="Close search">
            <IconClose size={16} />
          </button>
        </div>

        <div className="search-results" ref={listRef}>
          {query.trim() === '' ? (
            <div className="search-hint">
              <p>Type to search across every note.</p>
              <div className="search-suggestions">
                {suggestions.map((tag) => (
                  <button type="button" key={tag} onClick={() => setQuery(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : hits.length === 0 ? (
            <p className="search-empty">No notes match “{query.trim()}”.</p>
          ) : (
            hits.map((hit, index) => {
              const section = getSection(hit.note.section)

              return (
                <a
                  key={hit.note.slug}
                  href={hrefFor(hit.note.slug)}
                  className={`search-result ${index === active ? 'is-active' : ''}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={onClose}
                >
                  <div className="search-result-top">
                    <span className="search-result-section">{section?.title ?? hit.note.section}</span>
                    <span className="search-result-title">{hit.note.title}</span>
                  </div>
                  <p>
                    <Highlight text={hit.snippet} query={query} />
                  </p>
                </a>
              )
            })
          )}
        </div>

        <div className="search-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
