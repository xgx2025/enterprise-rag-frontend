// ============================================================
// Document & chunk types
// ============================================================

export type DocumentStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'ACTIVE' | 'EXPIRED' | 'FAILED' | 'ARCHIVED'

export interface DocumentItem {
  id: string
  knowledgeBaseId: string
  title: string
  fileName: string
  fileType: string
  fileSize?: number
  contentType?: string | null
  version: string
  status: DocumentStatus
  department: string
  securityLevel: number
  allowedRoles?: string[]
  authorityLevel?: number
  chunkCount: number
  parseStatus: string
  embeddingStatus: string
  processProgress?: number
  failureStage?: string | null
  failureMessage?: string | null
  effectiveFrom: string
  effectiveTo: string | null
  replacesDocumentId?: string | null
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
  pageNumber: number | null
  tokenCount: number
  embeddingStatus: string
  metadataJson: Record<string, unknown> | string
}

export interface ObjectAccessResponse {
  url: string
  expiresAt: string
}
