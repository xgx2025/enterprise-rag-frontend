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

/** 面向用户的安全推理摘要，不包含模型隐式思维链或知识库正文。 */
export interface ReasoningStep {
  id: string
  title: string
  detail: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  reasoningSteps?: ReasoningStep[]
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
  /** 客户端生成的单次发送幂等键，网络重试不得复用为新的业务请求。 */
  requestId?: string
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
