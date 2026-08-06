import request from '@/utils/request'
import { useMockData, mockDelay, mockId } from '@/composables/useMockData'
import type {
  DocumentItem,
  DocumentQueryParams,
  PaginatedResult,
  ChunkItem,
} from '@/api/types'

// ========== Mock Data ==========

const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-1001', knowledgeBaseId: 'kb-finance', title: '2026年差旅管理制度', fileName: 'travel-policy-2026-v3.pdf',
    fileType: 'PDF', version: 'V3.0', status: 'ACTIVE', department: '财务部', securityLevel: 1,
    chunkCount: 47, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2026-01-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-12-15T10:30:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'doc-1002', knowledgeBaseId: 'kb-finance', title: '2025年差旅管理制度', fileName: 'travel-policy-2025-v2.pdf',
    fileType: 'PDF', version: 'V2.0', status: 'EXPIRED', department: '财务部', securityLevel: 1,
    chunkCount: 41, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-01-01', effectiveTo: '2025-12-31', createdBy: 'admin',
    createdAt: '2024-12-10T08:00:00Z', updatedAt: '2025-12-31T23:59:00Z',
  },
  {
    id: 'doc-1003', knowledgeBaseId: 'kb-finance', title: '网约车报销实施细则', fileName: 'ride-hailing-reimburse.docx',
    fileType: 'DOCX', version: 'V1.2', status: 'ACTIVE', department: '财务部', securityLevel: 1,
    chunkCount: 18, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-06-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-05-20T14:00:00Z', updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'doc-1004', knowledgeBaseId: 'kb-finance', title: '采购审批流程规范', fileName: 'procurement-approval-v1.pdf',
    fileType: 'PDF', version: 'V1.0', status: 'ACTIVE', department: '财务部', securityLevel: 2,
    chunkCount: 23, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-03-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-02-15T09:00:00Z', updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'doc-1005', knowledgeBaseId: 'kb-finance', title: '固定资产管理制度', fileName: 'fixed-assets-mgmt.md',
    fileType: 'Markdown', version: 'V2.1', status: 'ACTIVE', department: '财务部', securityLevel: 2,
    chunkCount: 31, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-09-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-08-10T16:30:00Z', updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'doc-1006', knowledgeBaseId: 'kb-hr', title: '薪酬管理制度', fileName: 'compensation-policy-v4.pdf',
    fileType: 'PDF', version: 'V4.0', status: 'ACTIVE', department: '人力资源部', securityLevel: 3,
    chunkCount: 52, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2026-01-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-12-01T10:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'doc-1007', knowledgeBaseId: 'kb-hr', title: '绩效考核管理办法', fileName: 'performance-review-v2.pdf',
    fileType: 'PDF', version: 'V2.0', status: 'ACTIVE', department: '人力资源部', securityLevel: 2,
    chunkCount: 36, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-07-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-06-01T09:00:00Z', updatedAt: '2025-07-01T00:00:00Z',
  },
  {
    id: 'doc-1008', knowledgeBaseId: 'kb-hr', title: '员工考勤与休假制度', fileName: 'attendance-leave-v3.docx',
    fileType: 'DOCX', version: 'V3.0', status: 'ACTIVE', department: '人力资源部', securityLevel: 1,
    chunkCount: 28, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-04-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-03-15T11:00:00Z', updatedAt: '2025-04-01T00:00:00Z',
  },
  {
    id: 'doc-1009', knowledgeBaseId: 'kb-hr', title: '培训与发展管理规定', fileName: 'training-policy-v1.pdf',
    fileType: 'PDF', version: 'V1.1', status: 'ACTIVE', department: '人力资源部', securityLevel: 1,
    chunkCount: 22, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-05-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-04-10T14:00:00Z', updatedAt: '2025-05-01T00:00:00Z',
  },
  {
    id: 'doc-1010', knowledgeBaseId: 'kb-hr', title: '新员工入职指引', fileName: 'onboarding-guide.md',
    fileType: 'Markdown', version: 'V5.0', status: 'PROCESSING', department: '人力资源部', securityLevel: 1,
    chunkCount: 0, parseStatus: 'PARSING', embeddingStatus: 'PENDING',
    effectiveFrom: '2026-03-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2026-02-20T08:00:00Z', updatedAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'doc-1011', knowledgeBaseId: 'kb-admin', title: '办公场所管理规定', fileName: 'office-mgmt-v2.pdf',
    fileType: 'PDF', version: 'V2.0', status: 'ACTIVE', department: '行政部', securityLevel: 1,
    chunkCount: 15, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-02-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'doc-1012', knowledgeBaseId: 'kb-admin', title: '信息安全管理制度', fileName: 'infosec-policy-v3.pdf',
    fileType: 'PDF', version: 'V3.0', status: 'ACTIVE', department: '行政部', securityLevel: 3,
    chunkCount: 39, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-08-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-07-01T09:00:00Z', updatedAt: '2025-08-01T00:00:00Z',
  },
  {
    id: 'doc-1013', knowledgeBaseId: 'kb-admin', title: '资产领用与归还流程', fileName: 'asset-checkout.docx',
    fileType: 'DOCX', version: 'V1.0', status: 'ACTIVE', department: '行政部', securityLevel: 1,
    chunkCount: 12, parseStatus: 'COMPLETED', embeddingStatus: 'COMPLETED',
    effectiveFrom: '2025-03-15', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-03-01T13:00:00Z', updatedAt: '2025-03-15T00:00:00Z',
  },
  {
    id: 'doc-1014', knowledgeBaseId: 'kb-finance', title: 'Q4预算调整申请模板', fileName: 'q4-budget-template.xlsx',
    fileType: 'XLSX', version: 'V1.0', status: 'FAILED', department: '财务部', securityLevel: 2,
    chunkCount: 0, parseStatus: 'FAILED', embeddingStatus: 'PENDING',
    effectiveFrom: '2025-10-01', effectiveTo: null, createdBy: 'admin',
    createdAt: '2025-09-25T16:00:00Z', updatedAt: '2025-09-25T16:05:00Z',
  },
]

const mockChunks: Record<string, ChunkItem[]> = {
  'doc-1001': Array.from({ length: 10 }, (_, i) => ({
    id: `chunk-1001-${i}`,
    documentId: 'doc-1001',
    parentChunkId: i >= 2 ? `chunk-1001-0` : null,
    chunkIndex: i,
    content: `这是第${i + 1}个分块的内容。本章节介绍了差旅住宿标准的具体规定，包括一线城市与二线城市的住宿费用上限、不同级别员工的报销比例等内容...`,
    sectionPath: i < 3 ? '第三章/住宿标准' : '第四章/交通标准',
    pageNumber: 7 + Math.floor(i / 2),
    tokenCount: 250 + Math.floor(Math.random() * 200),
    embeddingStatus: 'COMPLETED',
    metadataJson: {},
  })),
}

// ========== API Functions ==========

export function getDocuments(params: DocumentQueryParams = {}): Promise<PaginatedResult<DocumentItem>> {
  const { status, department, knowledgeBaseId, keyword, page = 1, pageSize = 10 } = params

  if (useMockData()) {
    return mockDelay(300, 200).then(() => {
      let filtered = [...mockDocuments]

      if (status) filtered = filtered.filter(d => d.status === status)
      if (department) filtered = filtered.filter(d => d.department === department)
      if (knowledgeBaseId) filtered = filtered.filter(d => d.knowledgeBaseId === knowledgeBaseId)
      if (keyword) {
        const kw = keyword.toLowerCase()
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(kw) || d.fileName.toLowerCase().includes(kw)
        )
      }

      const total = filtered.length
      const start = (page - 1) * pageSize
      const items = filtered.slice(start, start + pageSize)

      return { items, total, page, pageSize }
    })
  }

  return request.get('/documents', { params }).then(res => res.data)
}

export function getDocument(id: string): Promise<DocumentItem> {
  if (useMockData()) {
    return mockDelay().then(() => {
      const doc = mockDocuments.find(d => d.id === id)
      if (!doc) throw new Error('文档不存在')
      return { ...doc }
    })
  }
  return request.get(`/documents/${id}`).then(res => res.data)
}

export function uploadDocument(_formData: FormData): Promise<DocumentItem> {
  if (useMockData()) {
    return mockDelay(800, 400).then((): DocumentItem => ({
      id: mockId('doc'),
      knowledgeBaseId: 'kb-finance',
      title: '新上传的文档',
      fileName: 'new-doc.pdf',
      fileType: 'PDF',
      version: 'V1.0',
      status: 'PROCESSING',
      department: '财务部',
      securityLevel: 1,
      chunkCount: 0,
      parseStatus: 'PENDING',
      embeddingStatus: 'PENDING',
      effectiveFrom: new Date().toISOString().split('T')[0]!,
      effectiveTo: null,
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DocumentItem))
  }
  return request.post('/documents', _formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data)
}

export function deleteDocument(_id: string): Promise<void> {
  if (useMockData()) {
    return mockDelay().then()
  }
  return request.delete(`/documents/${_id}`)
}

export function updateDocumentStatus(_id: string, _status: string): Promise<void> {
  if (useMockData()) {
    return mockDelay().then()
  }
  return request.put(`/documents/${_id}/status`, { status: _status })
}

export function getDocumentChunks(documentId: string): Promise<ChunkItem[]> {
  if (useMockData()) {
    return mockDelay().then(() => mockChunks[documentId] || [
      {
        id: `chunk-${documentId}-0`,
        documentId,
        parentChunkId: null,
        chunkIndex: 0,
        content: '这是文档的分块内容预览。实际内容将在文档解析完成后显示。',
        sectionPath: '第一章/概述',
        pageNumber: 1,
        tokenCount: 200,
        embeddingStatus: 'COMPLETED',
        metadataJson: {},
      },
    ])
  }
  return request.get(`/documents/${documentId}/chunks`).then(res => res.data)
}
