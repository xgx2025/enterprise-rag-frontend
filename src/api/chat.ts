import request from '@/utils/request'
import { streamPost } from '@/utils/stream'
import { useMockData, mockDelay, mockId } from '@/composables/useMockData'
import type { Conversation, ChatMessage, Citation, RetrievalStats, SendMessageRequest } from '@/api/types'
import type { SSEEvent } from '@/api/sse-events'

// ========== Mock Data ==========

const mockCitation1: Citation = {
  sourceId: 'S1', documentId: 'doc-1001', title: '2026年差旅管理制度',
  version: 'V3.0', effectiveDate: '2026-01-01', sectionPath: '第三章/住宿标准',
  pageNumber: 7, quote: '一线城市（北京、上海、广州、深圳）住宿标准为每人每天不超过600元...',
  securityLevel: 1,
}

const mockCitation2: Citation = {
  sourceId: 'S2', documentId: 'doc-1001', title: '2026年差旅管理制度',
  version: 'V3.0', effectiveDate: '2026-01-01', sectionPath: '第三章/住宿标准',
  pageNumber: 7, quote: '二线城市住宿标准为每人每天不超过400元，三四线城市不超过300元...',
  securityLevel: 1,
}

const mockCitation3: Citation = {
  sourceId: 'S3', documentId: 'doc-1003', title: '网约车报销实施细则',
  version: 'V1.2', effectiveDate: '2025-06-01', sectionPath: '第二章/报销凭证',
  pageNumber: 3, quote: '报销网约车费用需提供行程单截图及支付凭证，单次金额超过200元需备注事由...',
  securityLevel: 1,
}

const mockStats: RetrievalStats = {
  totalRetrieved: 63,
  permissionFiltered: 12,
  fusionCandidates: 20,
  rerankKept: 6,
  totalTimeMs: 2800,
}

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: '深圳出差住宿标准咨询',
    knowledgeBaseIds: ['kb-finance'],
    messages: [
      {
        id: 'msg-1-1', role: 'user',
        content: '华东区员工去深圳出差，住宿标准是多少？',
        timestamp: '2026-08-05T09:30:00Z',
      },
      {
        id: 'msg-1-2', role: 'assistant',
        content: '根据2026年差旅管理制度（V3.0），深圳属于一线城市，住宿标准为每人每天不超过600元。该标准适用于华东区及其他所有区域的员工[S1]。同时，二线城市住宿标准为每人每天不超过400元，三四线城市不超过300元[S2]。',
        citations: [mockCitation1, mockCitation2],
        answerStatus: 'SUPPORTED',
        retrievalStats: mockStats,
        timestamp: '2026-08-05T09:30:05Z',
      },
    ],
    createdAt: '2026-08-05T09:30:00Z',
    updatedAt: '2026-08-05T09:30:05Z',
  },
  {
    id: 'conv-2',
    title: '网约车报销凭证咨询',
    knowledgeBaseIds: ['kb-finance', 'kb-admin'],
    messages: [
      {
        id: 'msg-2-1', role: 'user',
        content: '报销网约车需要提供哪些附件？',
        timestamp: '2026-08-05T14:00:00Z',
      },
      {
        id: 'msg-2-2', role: 'assistant',
        content: '根据网约车报销实施细则[S3]，报销网约车费用需提供：\n1. 行程单截图（显示起终点及路线）\n2. 支付凭证（微信/支付宝/银行卡）\n3. 单次金额超过200元的，需在报销备注中注明事由',
        citations: [mockCitation3],
        answerStatus: 'SUPPORTED',
        retrievalStats: { ...mockStats, totalRetrieved: 45, totalTimeMs: 2100 },
        timestamp: '2026-08-05T14:00:04Z',
      },
    ],
    createdAt: '2026-08-05T14:00:00Z',
    updatedAt: '2026-08-05T14:00:04Z',
  },
]

// ========== API Functions ==========

export function getConversations(): Promise<Conversation[]> {
  if (useMockData()) {
    return mockDelay().then(() => mockConversations.map(c => ({
      ...c,
      messages: [], // summaries only — load full messages per conversation
    })))
  }
  return request.get('/chat/conversations').then(res => res.data)
}

export function getConversation(id: string): Promise<Conversation> {
  if (useMockData()) {
    return mockDelay().then(() => {
      const conv = mockConversations.find(c => c.id === id)
      if (!conv) throw new Error('会话不存在')
      return { ...conv, messages: [...conv.messages] }
    })
  }
  return request.get(`/chat/conversations/${id}`).then(res => res.data)
}

export function createConversation(): Promise<Conversation> {
  if (useMockData()) {
    return mockDelay().then(() => {
      const conv: Conversation = {
        id: mockId('conv'),
        title: '新对话',
        knowledgeBaseIds: [],
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockConversations.unshift(conv)
      return { ...conv }
    })
  }
  return request.post('/chat/conversations').then(res => res.data)
}

export function deleteConversation(id: string): Promise<void> {
  if (useMockData()) {
    return mockDelay().then(() => {
      const idx = mockConversations.findIndex(c => c.id === id)
      if (idx !== -1) mockConversations.splice(idx, 1)
    })
  }
  return request.delete(`/chat/conversations/${id}`)
}

export function sendMessage(data: SendMessageRequest): Promise<ChatMessage> {
  if (useMockData()) {
    return mockDelay(600, 400).then(() => {
      const userMsg: ChatMessage = {
        id: mockId('msg'),
        role: 'user',
        content: data.query,
        timestamp: new Date().toISOString(),
      }
      // Generate a mock assistant response
      const hasKnowledge = true
      const assistantMsg: ChatMessage = {
        id: mockId('msg'),
        role: 'assistant',
        content: hasKnowledge
          ? `关于"${data.query}"，根据企业制度文档，以下是相关回答：\\n\\n系统在知识库中检索到了相关制度依据。具体的回答将基于检索到的文档片段生成，并附上来源引用 [S1][S2]。`
          : '当前知识库未检索到相关制度依据，无法确认该信息。建议联系相关部门进行确认。',
        citations: hasKnowledge ? [mockCitation1] : undefined,
        answerStatus: hasKnowledge ? 'SUPPORTED' : 'INSUFFICIENT',
        retrievalStats: hasKnowledge ? mockStats : undefined,
        timestamp: new Date().toISOString(),
      }
      return assistantMsg
    })
  }
  return request.post('/chat/send', data).then(res => res.data)
}

export interface ChatStreamCallbacks {
  onEvent: (event: SSEEvent) => void
  onDone: () => void
  onAbort: () => void
  onError: (error: Error) => void
}

/** 使用后端 SSE 事件流发送新问题。 */
export function streamMessage(data: SendMessageRequest, callbacks: ChatStreamCallbacks): AbortController {
  return streamPost({
    url: '/api/v1/chat/stream',
    body: data,
    ...callbacks,
  })
}

/** 使用原用户问题流式重新生成回答。 */
export function streamRegenerate(messageId: string, callbacks: ChatStreamCallbacks): AbortController {
  return streamPost({
    url: `/api/v1/chat/messages/${messageId}/regenerate/stream`,
    body: {},
    ...callbacks,
  })
}

/** 流式重试失败或已取消的回答。 */
export function streamRetry(messageId: string, callbacks: ChatStreamCallbacks): AbortController {
  return streamPost({
    url: `/api/v1/chat/messages/${messageId}/retry/stream`,
    body: {},
    ...callbacks,
  })
}
