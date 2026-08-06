// ============================================================
// Shared TypeScript interfaces for Enterprise RAG Hub
// Used by API modules, stores, and components
// ============================================================

// ---------- Knowledge Base ----------

export interface KnowledgeBase {
  id: string
  name: string
  documentCount: number
  description: string
}

// ---------- Document ----------

export type DocumentStatus = 'DRAFT' | 'PROCESSING' | 'ACTIVE' | 'EXPIRED' | 'FAILED'

export interface DocumentItem {
  id: string
  knowledgeBaseId: string
  title: string
  fileName: string
  fileType: string
  version: string
  status: DocumentStatus
  department: string
  securityLevel: number
  chunkCount: number
  parseStatus: string
  embeddingStatus: string
  effectiveFrom: string
  effectiveTo: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DocumentQueryParams {
  status?: DocumentStatus
  department?: string
  knowledgeBaseId?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ---------- Chunk ----------

export interface ChunkItem {
  id: string
  documentId: string
  parentChunkId: string | null
  chunkIndex: number
  content: string
  sectionPath: string
  pageNumber: number
  tokenCount: number
  embeddingStatus: string
  metadataJson: Record<string, unknown>
}

// ---------- Chat / Q&A ----------

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

// ---------- Debug / Retrieval ----------

export interface ScoredChunk {
  rank: number
  score: number
  content: string
  documentTitle: string
  sectionPath: string
  chunkIndex: number
}

export interface DebugResult {
  traceId: string
  query: string
  denseResults: ScoredChunk[]
  sparseResults: ScoredChunk[]
  rrfResults: ScoredChunk[]
  rerankResults: ScoredChunk[]
  finalContext: string
  modelOutput: string
  timing: Record<string, number>
}

// ---------- Evaluation ----------

export interface EvalMetrics {
  recallAtK: Record<number, number>
  mrr: number
  nDCG: Record<number, number>
  citationAccuracy: number
  evidenceSupportRate: number
  refusalAccuracy: number
  latencyP50: number
  latencyP95: number
  totalTokens: number
}

export interface StrategyComparison {
  strategyName: string
  recallAt5: number
  mrr: number
  nDCG: number
  latencyP95: number
}

export interface EvalCategoryBreakdown {
  category: string
  recallAt5: number
  mrr: number
  refusalAccuracy: number
}

export interface EvalRunResult {
  runId: string
  metrics: EvalMetrics
  strategyComparisons: StrategyComparison[]
  categoryBreakdown: EvalCategoryBreakdown[]
  runAt: string
  status: 'idle' | 'running' | 'completed' | 'failed'
}

// ---------- Common ----------

export interface Option {
  label: string
  value: string
}

export type Department =
  | '财务部'
  | '人力资源部'
  | '研发部'
  | '销售部'
  | '市场部'
  | '行政部'
  | '法务部'
  | '全部'

export const DEPARTMENTS: Option[] = [
  { label: '财务部', value: '财务部' },
  { label: '人力资源部', value: '人力资源部' },
  { label: '研发部', value: '研发部' },
  { label: '销售部', value: '销售部' },
  { label: '市场部', value: '市场部' },
  { label: '行政部', value: '行政部' },
  { label: '法务部', value: '法务部' },
]

export const DOCUMENT_STATUS_OPTIONS: Option[] = [
  { label: '草稿', value: 'DRAFT' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已生效', value: 'ACTIVE' },
  { label: '已失效', value: 'EXPIRED' },
  { label: '失败', value: 'FAILED' },
]

export const SECURITY_LEVELS: Option[] = [
  { label: '公开', value: '1' },
  { label: '内部', value: '2' },
  { label: '机密', value: '3' },
]
