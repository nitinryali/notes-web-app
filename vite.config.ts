import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Work out the GitHub Pages base path.
 *
 * - In GitHub Actions, GITHUB_REPOSITORY is available.
 * - Locally we read the git remote so `npm run deploy` / `npm run build`
 *   produce correct asset URLs without extra configuration.
 * - User sites (username.github.io) are served from the root.
 */
function githubRepo(): { name: string; url: string } | null {
  const fromCi = process.env.GITHUB_REPOSITORY

  if (fromCi) {
    const [owner, name] = fromCi.split('/')
    if (owner && name) {
      return { name, url: `https://github.com/${owner}/${name}` }
    }
  }

  try {
    const remote = execSync('git config --get remote.origin.url', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()

    const match = /github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/.exec(remote)
    if (match) {
      const [, owner, name] = match
      return { name, url: `https://github.com/${owner}/${name}` }
    }
  } catch {
    // No git remote yet — local dev uses the root path.
  }

  return null
}

const repo = githubRepo()
const base = repo && !repo.name.endsWith('.github.io') ? `/${repo.name}/` : '/'

export default defineConfig({
  base,
  plugins: [react()],
  define: {
    __REPO_URL__: JSON.stringify(repo?.url ?? ''),
  },
})
