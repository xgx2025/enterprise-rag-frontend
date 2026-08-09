import request from '@/utils/request'
import { useMockData, mockDelay, mockId } from '@/composables/useMockData'
import type { KnowledgeBase, KnowledgeBasePayload } from '@/api/types'

const mockKBs: KnowledgeBase[] = [
  { id: 'kb-finance', name: '财务制度库', documentCount: 12, description: '差旅、报销、采购等财务相关制度', department: '财务部', securityLevel: 1, status: 'ACTIVE' },
  { id: 'kb-hr', name: '人力资源制度库', documentCount: 8, description: '薪酬、绩效、考勤、培训等人事制度', department: '人力资源部', securityLevel: 2, status: 'ACTIVE' },
  { id: 'kb-admin', name: '行政管理制度库', documentCount: 6, description: '办公、安全、资产管理等行政制度', department: '行政部', securityLevel: 1, status: 'ACTIVE' },
]

export function getKnowledgeBases(includeDisabled = false): Promise<KnowledgeBase[]> {
  if (useMockData()) {
    return mockDelay().then(() => mockKBs.filter(kb => includeDisabled || kb.status === 'ACTIVE').map(kb => ({ ...kb })))
  }
  return request.get('/knowledge-bases', { params: { includeDisabled } }).then(res => res.data)
}

export function createKnowledgeBase(data: KnowledgeBasePayload): Promise<KnowledgeBase> {
  if (useMockData()) {
    return mockDelay().then(() => {
      const kb: KnowledgeBase = {
        id: mockId('kb'),
        name: data.name,
        description: data.description || '',
        department: data.department,
        securityLevel: data.securityLevel,
        documentCount: 0,
        status: 'ACTIVE',
      }
      mockKBs.unshift(kb)
      return { ...kb }
    })
  }
  return request.post('/knowledge-bases', data).then(res => res.data)
}

export function updateKnowledgeBase(id: string, data: KnowledgeBasePayload): Promise<KnowledgeBase> {
  if (useMockData()) {
    return mockDelay().then(() => {
      const kb = mockKBs.find(item => item.id === id)
      if (!kb) throw new Error('知识库不存在')
      Object.assign(kb, data)
      return { ...kb }
    })
  }
  return request.put(`/knowledge-bases/${id}`, data).then(res => res.data)
}

export function updateKnowledgeBaseStatus(id: string, status: 'ACTIVE' | 'DISABLED'): Promise<void> {
  if (useMockData()) {
    return mockDelay().then(() => {
      const kb = mockKBs.find(item => item.id === id)
      if (kb) kb.status = status
    })
  }
  return request.put(`/knowledge-bases/${id}/status`, { status }).then(() => undefined)
}
