import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { hrefFor } from '../lib/router'
import { slugify } from '../lib/notes'
import { IconCheck, IconCopy } from './icons'

const languageLabels: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  java: 'Java',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  python: 'Python',
  py: 'Python',
  sql: 'SQL',
  bash: 'Bash',
  sh: 'Shell',
  json: 'JSON',
  text: 'Text',
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const child = Array.isArray(children) ? children[0] : children
  const childProps =
    child && typeof child === 'object' && 'props' in child
      ? (child as { props: { className?: string; children?: ReactNode } }).props
      : undefined

  const language = /language-([\w-]+)/.exec(childProps?.className ?? '')?.[1] ?? ''
  const code = textOf(childProps?.children ?? '')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard access can be denied — leave the button unchanged.
    }
  }

  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{languageLabels[language] ?? language ?? 'Code'}</span>
        <button type="button" className="code-copy" onClick={copy} aria-label="Copy code">
          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  )
}

function makeHeading(level: 2 | 3, slug: string) {
  return function Heading({ children }: { children?: ReactNode }) {
    const id = slugify(textOf(children))
    const Tag = level === 2 ? 'h2' : 'h3'

    return (
      <Tag id={id}>
        <a className="heading-anchor" href={hrefFor(slug, id)} aria-label="Link to this section">
          #
        </a>
        {children}
      </Tag>
    )
  }
}

export function Markdown({ content, slug }: { content: string; slug: string }) {
  const components: Components = {
    h2: makeHeading(2, slug),
    h3: makeHeading(3, slug),
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    table: ({ children }) => (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    ),
    a: ({ href, children }) => {
      if (!href) return <>{children}</>

      if (href.startsWith('#')) {
        return <a href={hrefFor(slug, href.slice(1))}>{children}</a>
      }

      const external = href.startsWith('http')
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
          {children}
        </a>
      )
    },
  }

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
