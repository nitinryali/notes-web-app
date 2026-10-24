import type { Section } from '../lib/notes'
import { hrefFor } from '../lib/router'
import { IconArrowRight, IconCheck, IconClock } from './icons'

interface SectionViewProps {
  section: Section
  revised: string[]
}

export function SectionView({ section, revised }: SectionViewProps) {
  const done = section.notes.filter((note) => revised.includes(note.slug)).length
  const percent =
    section.notes.length === 0 ? 0 : Math.round((done / section.notes.length) * 100)

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Section</p>
        <h1>{section.title}</h1>
        <p className="page-sub">{section.blurb}</p>

        <div className="page-meta">
          <span>
            {section.notes.length} {section.notes.length === 1 ? 'note' : 'notes'}
          </span>
          <span className="dot-sep" />
          <span>{done} revised</span>
        </div>

        <div
          className="progress-bar wide"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </header>

      <div className="note-list">
        {section.notes.map((note, index) => (
          <a className="note-row" href={hrefFor(note.slug)} key={note.slug}>
            <span className="note-index">{String(index + 1).padStart(2, '0')}</span>

            <div className="note-row-body">
              <div className="note-row-top">
                <h2>{note.title}</h2>
                {revised.includes(note.slug) && (
                  <span className="revised-pill">
                    <IconCheck size={12} />
                    Revised
                  </span>
                )}
              </div>

              <p>{note.description}</p>

              <div className="note-row-meta">
                {note.tags.slice(0, 3).map((tag) => (
                  <span className="tag" key={tag}>
                    #{tag}
                  </span>
                ))}
                <span className="meta-item">
                  <IconClock size={13} />
                  {note.readingMinutes} min
                </span>
              </div>
            </div>

            <IconArrowRight className="note-row-arrow" size={18} />
          </a>
        ))}

        {section.notes.length === 0 && (
          <div className="empty-state">
            <h2>No notes here yet</h2>
            <p>Add a Markdown file to <code>src/content/{section.id}/</code> and it will show up.</p>
          </div>
        )}
      </div>
    </div>
  )
}
