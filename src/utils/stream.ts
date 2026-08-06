// ============================================================
// SSE (Server-Sent Events) streaming utility
// Uses fetch() with ReadableStream for streaming responses
// ============================================================

import { useAuthStore } from '@/stores/auth'
import { parseSSEEvent } from '@/api/sse-events'
import type { SSEEvent } from '@/api/sse-events'

export interface StreamOptions {
  url: string
  body: object
  signal?: AbortSignal
  /** Raw string chunks (legacy / fallback) */
  onChunk?: (chunk: string) => void
  /** Typed structured events */
  onEvent?: (event: SSEEvent) => void
  onDone?: () => void
  onError?: (error: Error) => void
}

/**
 * Post to an SSE endpoint and stream results via callbacks.
 * Returns an AbortController for cancellation.
 */
export function streamPost(opts: StreamOptions): AbortController {
  const controller = new AbortController()
  const signal = opts.signal || controller.signal
  const authStore = useAuthStore()

  fetch(opts.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.accessToken}`,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify(opts.body),
    signal,
  })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      if (!response.body) {
        throw new Error('Response body is empty')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          opts.onDone?.()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              opts.onDone?.()
              return
            }
            opts.onChunk?.(data)
            if (opts.onEvent) {
              const event = parseSSEEvent(data)
              if (event) opts.onEvent(event)
            }
          }
        }
      }
    })
    .catch(err => {
      if (err.name === 'AbortError') return
      opts.onError?.(err)
    })

  return controller
}

/**
 * Async generator version — yields chunks as they arrive.
 */
export async function* streamChat(url: string, body: object, signal?: AbortSignal): AsyncGenerator<string> {
  const authStore = useAuthStore()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.accessToken}`,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') return
        yield data
      }
    }
  }
}
