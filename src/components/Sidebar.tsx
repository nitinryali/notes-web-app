import type { Section } from '../lib/notes'
import { hrefFor } from '../lib/router'
import { IconArrowUpRight, IconGitHub, IconSearch } from './icons'

interface SidebarProps {
  sections: Section[]
  currentPath: string
  revised: string[]
  open: boolean
  onClose: () => void
  onSearch: () => void
}

export function Sidebar({
  sections,
  currentPath,
  revised,
  open,
  onClose,
  onSearch,
}: SidebarProps) {
  return (
    <>
      <button
        type="button"
        className={`sidebar-scrim ${open ? 'is-open' : ''}`}
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Notes navigation">
        <a className="brand" href="#/" onClick={onClose}>
          <span className="brand-mark" aria-hidden="true">
            N
          </span>
          <span className="brand-text">
            <span className="brand-title">Interview Notes</span>
            <span className="brand-sub">SDE prep notebook</span>
          </span>
        </a>

        <button type="button" className="sidebar-search" onClick={onSearch}>
          <IconSearch size={16} />
          <span>Search notes</span>
          <kbd>⌘K</kbd>
        </button>

        <nav className="nav">
          {sections.map((section) => {
            const sectionActive =
              currentPath === section.id || currentPath.startsWith(`${section.id}/`)

            return (
              <div className="nav-section" key={section.id}>
                <a
                  className={`nav-section-title ${currentPath === section.id ? 'is-active' : ''}`}
                  href={hrefFor(section.id)}
                  onClick={onClose}
                >
                  <span>{section.title}</span>
                  <span className="nav-count">{section.notes.length}</span>
                </a>

                <ul>
                  {section.notes.map((note) => {
                    const active = currentPath === note.slug
                    const done = revised.includes(note.slug)

                    return (
                      <li key={note.slug}>
                        <a
                          className={`nav-link ${active ? 'is-active' : ''}`}
                          href={hrefFor(note.slug)}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span className={`nav-dot ${done ? 'is-done' : ''}`} aria-hidden="true" />
                          <span className="nav-link-label">{note.title}</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>

                {!sectionActive && section.notes.length === 0 && (
                  <p className="nav-empty">No notes yet</p>
                )}
              </div>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          {__REPO_URL__ && (
            <a
              className="repo-link"
              href={__REPO_URL__}
              target="_blank"
              rel="noreferrer noopener"
            >
              <IconGitHub size={15} />
              <span>View source</span>
              <IconArrowUpRight size={14} />
            </a>
          )}
        </div>
      </aside>
    </>
  )
}
