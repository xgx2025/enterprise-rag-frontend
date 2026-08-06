import request from '@/utils/request'
import { useMockData, mockDelay, mockId } from '@/composables/useMockData'
import type { KnowledgeBase } from '@/api/types'

const mockKBs: KnowledgeBase[] = [
  { id: 'kb-finance', name: '财务制度库', documentCount: 12, description: '差旅、报销、采购等财务相关制度' },
  { id: 'kb-hr', name: '人力资源制度库', documentCount: 8, description: '薪酬、绩效、考勤、培训等人事制度' },
  { id: 'kb-admin', name: '行政管理制度库', documentCount: 6, description: '办公、安全、资产管理等行政制度' },
]

export function getKnowledgeBases(): Promise<KnowledgeBase[]> {
  if (useMockData()) {
    return mockDelay().then(() => [...mockKBs])
  }
  return request.get('/knowledge-bases').then(res => res.data)
}
