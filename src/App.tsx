import { useCallback, useEffect, useState } from 'react'
import { Home } from './components/Home'
import { NoteView } from './components/NoteView'
import { SearchDialog } from './components/SearchDialog'
import { SectionView } from './components/SectionView'
import { Sidebar } from './components/Sidebar'
import {
  IconArrowRight,
  IconChevronRight,
  IconGitHub,
  IconMenu,
  IconMoon,
  IconSearch,
  IconSun,
} from './components/icons'
import { useRevisedNotes, useTheme } from './lib/hooks'
import { getNote, getSection, sections } from './lib/notes'
import { hrefFor, useRoute } from './lib/router'

function NotFound() {
  return (
    <div className="page not-found">
      <p className="eyebrow">404</p>
      <h1>This note doesn&apos;t exist.</h1>
      <p>It may have been renamed, or it hasn&apos;t been written yet.</p>
      <a className="ghost-btn" href="#/">
        Back to all notes
        <IconArrowRight size={16} />
      </a>
    </div>
  )
}

export default function App() {
  const route = useRoute()
  const { theme, toggleTheme } = useTheme()
  const { revised, isRevised, toggleRevised } = useRevisedNotes()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const note = getNote(route.path)
  const sectionPage = !note ? getSection(route.path) : undefined
  const crumbSection = note ? getSection(note.section) : sectionPage

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)

    if (route.anchor) {
      const timer = window.setTimeout(() => {
        document
          .getElementById(route.anchor)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 30)

      return () => window.clearTimeout(timer)
    }

    window.scrollTo({ top: 0, left: 0 })
  }, [route.path, route.anchor])

  useEffect(() => {
    if (!menuOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    const title = note ? note.title : sectionPage ? sectionPage.title : 'All notes'
    document.title = `${title} · Interview Notes`
  }, [note, sectionPage])

  return (
    <div className="app">
      <Sidebar
        sections={sections}
        currentPath={route.path}
        revised={revised}
        open={menuOpen}
        onClose={closeMenu}
        onSearch={openSearch}
      />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <IconMenu size={19} />
          </button>

          <nav className="crumbs" aria-label="Breadcrumb">
            <a href="#/" className="crumb-home">
              All notes
            </a>

            {crumbSection && (
              <>
                <IconChevronRight size={12} className="crumb-sep" />
                {note ? (
                  <a href={hrefFor(crumbSection.id)}>{crumbSection.title}</a>
                ) : (
                  <span aria-current="page">{crumbSection.title}</span>
                )}
              </>
            )}

            {note && (
              <>
                <IconChevronRight size={12} className="crumb-sep" />
                <span className="crumb-current" aria-current="page">
                  {note.title}
                </span>
              </>
            )}
          </nav>

          <div className="topbar-actions">
            <button
              type="button"
              className="topbar-search"
              onClick={openSearch}
              aria-label="Search notes"
            >
              <IconSearch size={16} />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>

            {__REPO_URL__ && (
              <a
                className="icon-btn"
                href={__REPO_URL__}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub repository"
                title="GitHub repository"
              >
                <IconGitHub size={18} />
              </a>
            )}
          </div>
        </header>

        <main className="content">
          {note ? (
            <NoteView
              note={note}
              revised={isRevised(note.slug)}
              onToggleRevised={() => toggleRevised(note.slug)}
            />
          ) : sectionPage ? (
            <SectionView section={sectionPage} revised={revised} />
          ) : route.path === '' ? (
            <Home sections={sections} revised={revised} />
          ) : (
            <NotFound />
          )}
        </main>
      </div>

      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </div>
  )
}
