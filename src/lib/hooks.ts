import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('notes:theme', theme)
    } catch {
      // Ignore storage failures (private mode).
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#14151a' : '#fbfaf8')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}

export function useRevisedNotes(): {
  revised: string[]
  isRevised: (slug: string) => boolean
  toggleRevised: (slug: string) => void
} {
  const [revised, setRevised] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('notes:revised')
      const parsed: unknown = stored ? JSON.parse(stored) : []
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
    } catch {
      return []
    }
  })

  const isRevised = useCallback((slug: string) => revised.includes(slug), [revised])

  const toggleRevised = useCallback((slug: string) => {
    setRevised((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]

      try {
        localStorage.setItem('notes:revised', JSON.stringify(next))
      } catch {
        // Ignore storage failures (private mode).
      }

      return next
    })
  }, [])

  return { revised, isRevised, toggleRevised }
}
