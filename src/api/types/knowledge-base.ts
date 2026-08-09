// ============================================================
// Knowledge base types
// ============================================================

export interface KnowledgeBase {
  id: string
  name: string
  documentCount: number
  description: string
  department?: string | null
  securityLevel?: number
  status?: 'ACTIVE' | 'DISABLED'
  createdAt?: string
  updatedAt?: string
}

export interface KnowledgeBasePayload {
  name: string
  description?: string
  department?: string
  securityLevel: number
}
