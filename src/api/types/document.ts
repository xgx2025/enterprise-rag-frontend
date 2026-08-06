// ============================================================
// Document & chunk types
// ============================================================

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
