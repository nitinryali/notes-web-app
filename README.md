# Interview Notes

A small, fast notes site for SDE interview prep. Content lives in Markdown, the app is a static
Vite + React build, and GitHub Pages serves it.

Currently included: **DSA → Sorting Algorithms** (bubble, selection, insertion, cyclic, merge and
quick sort).

## Features

- Sections and notes are generated automatically from Markdown files.
- C++ / Java syntax highlighting with a copy button on every code block.
- Full-text search across all notes (`⌘K` / `Ctrl K`).
- On-page table of contents with scroll tracking.
- Light and dark themes, remembered per browser.
- “Mark as revised” checkmarks (stored in `localStorage`) and a reading progress bar.
- Responsive layout with an off-canvas sidebar on mobile.
- Hash-based routing, so deep links work on GitHub Pages without a 404 fallback.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

## Add a note

Create a Markdown file under `src/content/<section>/<slug>.md`:

```
src/content/java/collections.md
```

```md
---
title: Collections Framework
description: Lists, sets, maps and the trade-offs between them.
section: java
order: 1
tags: [collections, lists, maps]
updated: 2026-10-26
---

## ArrayList

...
```

That is all that is needed. The note appears in the sidebar, on its section page, in search and in
the table of contents. The URL becomes `#/java/collections`.

- `section` can be a new id (`java`, `dbms`, `os`, `system-design`, …). If it is not configured yet,
  the id is title-cased for display.
- To set a nicer section title and description, add it to `sectionConfig` in
  `src/lib/notes.ts`.
- `order` controls the position inside a section.
- `updated` is optional and accepts `YYYY-MM-DD`.
- Use fenced code blocks with a language, e.g. ` ```cpp ` or ` ```java `.

## Deploy to GitHub Pages

The included workflow builds the site and publishes it with GitHub Actions.

1. Create an empty repository on GitHub.
2. Push this project to it:

   ```bash
   git remote add origin https://github.com/<your-user>/<repo>.git
   git push -u origin main
   ```

3. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Push again (or run the workflow manually from the **Actions** tab).

The site is published at `https://<your-user>.github.io/<repo>/`.

The Vite `base` path is detected automatically — from `GITHUB_REPOSITORY` in Actions, or from the
git remote locally — so no path configuration is required. A repository named
`<your-user>.github.io` is served from the root instead.

### Alternative: `gh-pages` branch

If you prefer publishing a branch instead of using Actions:

```bash
npm run deploy
```

This builds the site and pushes `dist/` to the `gh-pages` branch. Then choose
**Settings → Pages → Source: Deploy from a branch → `gh-pages` / root**.

Use one deployment method at a time.

## Project structure

```
src/
  content/
    dsa/sorting.md        # notes, one Markdown file per topic
  components/             # sidebar, search, note view, markdown renderer
  lib/
    notes.ts              # frontmatter parsing, sections, search index
    router.ts             # tiny hash router
    hooks.ts              # theme + revision state
  App.tsx
  styles.css
.github/workflows/deploy.yml
vite.config.ts            # auto-detects the GitHub Pages base path
```
