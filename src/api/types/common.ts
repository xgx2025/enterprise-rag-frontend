// ============================================================
// Common types and constants shared across domains
// ============================================================

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
  { label: '待发布', value: 'READY' },
  { label: '已生效', value: 'ACTIVE' },
  { label: '已失效', value: 'EXPIRED' },
  { label: '失败', value: 'FAILED' },
  { label: '已归档', value: 'ARCHIVED' },
]

export const SECURITY_LEVELS: Option[] = [
  { label: '公开', value: '1' },
  { label: '内部', value: '2' },
  { label: '机密', value: '3' },
]

export const DOCUMENT_ROLES: Option[] = [
  { label: '普通员工', value: 'EMPLOYEE' },
  { label: '部门经理', value: 'MANAGER' },
  { label: 'HR 管理员', value: 'HR_ADMIN' },
  { label: '知识库管理员', value: 'KB_ADMIN' },
]

export const AUTHORITY_LEVELS: Option[] = [
  { label: '一般资料', value: '1' },
  { label: '部门制度', value: '2' },
  { label: '公司正式制度', value: '3' },
]
