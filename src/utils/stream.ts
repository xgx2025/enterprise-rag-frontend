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
  onAbort?: () => void
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

  let finished = false
  const finish = () => {
    if (!finished) {
      finished = true
      opts.onDone?.()
    }
  }

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
          buffer += decoder.decode()
          consumeFrames(buffer, opts, finish)
          finish()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const normalized = buffer.replace(/\r\n/g, '\n')
        const frames = normalized.split('\n\n')
        buffer = frames.pop() || ''
        for (const frame of frames) consumeFrames(frame, opts, finish)
      }
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        opts.onAbort?.()
        return
      }
      opts.onError?.(err)
    })

  return controller
}

function consumeFrames(frame: string, opts: StreamOptions, finish: () => void) {
  if (!frame.trim()) return
  const data = frame
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trimStart())
    .join('\n')
    .trim()
  if (!data) return
  if (data === '[DONE]') {
    finish()
    return
  }
  opts.onChunk?.(data)
  const event = parseSSEEvent(data)
  if (event) opts.onEvent?.(event)
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
