// ============================================================
// Markdown rendering for chat answers
// marked (GFM) + DOMPurify (XSS hardening) + highlight.js (code)
// Inline [S1] citation markers are turned into clickable links
// via a marked inline extension (kept out of code blocks).
// ============================================================

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'

marked.setOptions({ gfm: true, breaks: true })

// ── Inline citation extension: [S1] -> <a class="md-cite" data-source-id="S1">[S1]</a>
// Runs as an inline tokenizer so it never fires inside <pre>/<code>.
const citationExtension = {
  name: 'citation',
  level: 'inline' as const,
  start(src: string) {
    return src.match(/\[S[^\]]*\]/)?.index
  },
  tokenizer(src: string) {
    const match = /^\[S([^\]]+)\]/.exec(src)
    if (match) {
      const sourceId = 'S' + match[1]
      return { type: 'citation', raw: match[0], sourceId }
    }
    return undefined
  },
  renderer(token: { sourceId: string }) {
    return `<a class="md-cite" data-source-id="${token.sourceId}">[${token.sourceId}]</a>`
  },
}

marked.use({ extensions: [citationExtension] } as any)

const PURIFY_CONFIG = {
  ADD_ATTR: ['target', 'data-source-id'],
  // keep class on our citation links and code blocks
  ADD_TAGS: ['cite'],
}

/**
 * Render a markdown string to sanitized HTML.
 * Pass `streaming` to append a blinking caret at the end.
 */
export function renderMarkdown(src: string, streaming = false): string {
  if (!src) return streaming ? '<span class="stream-caret"></span>' : ''
  const raw = marked.parse(src, { async: false }) as string
  const html = DOMPurify.sanitize(raw, PURIFY_CONFIG)
  return streaming ? `${html}<span class="stream-caret"></span>` : html
}

/**
 * Highlight all <pre><code> blocks in a container that haven't been
 * highlighted yet. Safe to call repeatedly; idempotent per element.
 */
export function highlightAll(container: HTMLElement | null): void {
  if (!container) return
  const blocks = container.querySelectorAll('pre code:not([data-highlighted])')
  blocks.forEach((el) => {
    try {
      hljs.highlightElement(el as HTMLElement)
    } catch {
      // unknown language / parse error - leave uncolored
    }
    ;(el as HTMLElement).dataset.highlighted = 'true'
  })
}
