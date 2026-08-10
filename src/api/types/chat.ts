// ============================================================
// Chat / Q&A types
// ============================================================

export type AnswerStatus = 'SUPPORTED' | 'PARTIAL' | 'INSUFFICIENT'

export interface Citation {
  sourceId: string
  documentId: string
  title: string
  version: string
  effectiveDate: string | null
  sectionPath: string
  pageNumber: number | null
  quote: string
  securityLevel: number
  score?: number
}

export interface RetrievalStats {
  totalRetrieved: number
  permissionFiltered: number
  fusionCandidates: number
  rerankKept: number
  totalTimeMs: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  answerStatus?: AnswerStatus
  retrievalStats?: RetrievalStats
  timestamp: string
  isStreaming?: boolean
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'SUPERSEDED'
  traceId?: string
  errorCode?: string
  errorMessage?: string
}

export interface Conversation {
  id: string
  title: string
  knowledgeBaseIds: string[]
  retrievalStrategy?: 'hybrid' | 'dense' | 'sparse'
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface SendMessageRequest {
  query: string
  conversationId?: string
  knowledgeBaseIds: string[]
  strategy?: {
    dense?: boolean
    sparse?: boolean
    rerank?: boolean
  }
  topK?: number
  contextMaxCharacters?: number
}
