import type { Section } from '../lib/notes'
import { hrefFor } from '../lib/router'
import { IconChevronRight, IconClock } from './icons'

interface HomeProps {
  sections: Section[]
  revised: string[]
}

function monogram(title: string): string {
  const words = title.split(' ').filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function Home({ sections, revised }: HomeProps) {
  return (
    <div className="home">
      <section className="sections-block">
        <div className="block-head">
          <h2>Sections</h2>
          <span>{sections.length} active</span>
        </div>

        <div className="section-grid">
          {sections.map((section) => {
            const done = section.notes.filter((note) => revised.includes(note.slug)).length
            const percent =
              section.notes.length === 0 ? 0 : Math.round((done / section.notes.length) * 100)

            return (
              <article className="section-card" key={section.id}>
                <div className="section-card-head">
                  <span className="section-badge">{monogram(section.title)}</span>
                  <span className="section-count">
                    {section.notes.length} {section.notes.length === 1 ? 'note' : 'notes'}
                  </span>
                </div>

                <h3>
                  <a href={hrefFor(section.id)}>{section.title}</a>
                </h3>
                <p className="section-blurb">{section.blurb}</p>

                <ul className="section-notes">
                  {section.notes.slice(0, 4).map((note) => (
                    <li key={note.slug}>
                      <a href={hrefFor(note.slug)}>
                        <span className="section-note-title">{note.title}</span>
                        <IconChevronRight size={15} />
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="section-card-foot">
                  <div className="mini-progress" aria-hidden="true">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <a href={hrefFor(section.id)} className="card-link">
                    Open section
                    <IconChevronRight size={14} />
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <p className="home-foot">
        <IconClock size={14} />
        Notes live as Markdown in the repo — edit a file, push, and the site redeploys.
      </p>
    </div>
  )
}
