// ============================================================
// Tenant & workspace types — enterprise multi-tenancy context
// ============================================================

export interface Tenant {
  tenantId: number
  tenantName: string
  tenantCode: string
}

export interface Workspace {
  id: string
  tenantId: number
  name: string
  description: string
}

export type UserRole = 'admin' | 'knowledge_manager' | 'viewer'
