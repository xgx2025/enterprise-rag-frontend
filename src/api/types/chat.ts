// ============================================================
// Chat / Q&A types
// ============================================================

export type AnswerStatus = 'SUPPORTED' | 'PARTIAL' | 'INSUFFICIENT'

export interface Citation {
  sourceId: string
  documentId: string
  title: string
  version: string
  effectiveDate: string
  sectionPath: string
  pageNumber: number
  quote: string
  securityLevel: number
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
}

export interface Conversation {
  id: string
  title: string
  knowledgeBaseIds: string[]
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface SendMessageRequest {
  query: string
  conversationId?: string
  knowledgeBaseIds: string[]
}
