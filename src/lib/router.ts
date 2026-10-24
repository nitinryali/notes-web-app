import { useEffect, useState } from 'react'

export interface Route {
  path: string
  anchor: string
}

export function parseHash(hash: string): Route {
  const fragment = hash.replace(/^#/, '')
  const withoutSlash = fragment.startsWith('/') ? fragment.slice(1) : fragment
  const [path = '', anchor = ''] = withoutSlash.split('#')

  return { path: decodeURIComponent(path), anchor }
}

export function hrefFor(slug: string, anchor?: string): string {
  return `#/${slug}${anchor ? `#${anchor}` : ''}`
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
