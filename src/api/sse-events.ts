// ============================================================
// SSE (Server-Sent Events) event type protocol
// Defines the contract between frontend and backend for
// streaming chat / retrieval responses.
// ============================================================

export type SSEEventType =
  | 'message.start'
  | 'answer.delta'
  | 'citation.add'
  | 'retrieval.summary'
  | 'answer.status'
  | 'usage'
  | 'message.done'
  | 'message.error'

// ── Event payloads ──

export interface SSEMessageStart {
  type: 'message.start'
  data: {
    messageId: string
    conversationId: string
  }
}

export interface SSEAnswerDelta {
  type: 'answer.delta'
  data: {
    content: string
  }
}

export interface SSECitationAdd {
  type: 'citation.add'
  data: {
    sourceId: string
    documentId: string
    title: string
    version: string
    sectionPath: string
    pageNumber: number
    quote: string
  }
}

export interface SSERetrievalSummary {
  type: 'retrieval.summary'
  data: {
    totalRetrieved: number
    permissionFiltered: number
    fusionCandidates: number
    rerankKept: number
    totalTimeMs: number
  }
}

export interface SSEAnswerStatus {
  type: 'answer.status'
  data: {
    status: 'SUPPORTED' | 'PARTIAL' | 'INSUFFICIENT'
  }
}

export interface SSEUsage {
  type: 'usage'
  data: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface SSEMessageDone {
  type: 'message.done'
  data: {
    messageId: string
  }
}

export interface SSEMessageError {
  type: 'message.error'
  data: {
    code: string
    message: string
  }
}

/** Union of all SSE event payloads */
export type SSEEvent =
  | SSEMessageStart
  | SSEAnswerDelta
  | SSECitationAdd
  | SSERetrievalSummary
  | SSEAnswerStatus
  | SSEUsage
  | SSEMessageDone
  | SSEMessageError

/**
 * Parse a raw SSE data line into a typed event.
 * Returns null if the line cannot be parsed.
 */
export function parseSSEEvent(raw: string): SSEEvent | null {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.type === 'string') {
      return parsed as SSEEvent
    }
    return null
  } catch {
    return null
  }
}
