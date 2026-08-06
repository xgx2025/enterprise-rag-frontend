import request from '@/utils/request'
import { useMockData, mockDelay } from '@/composables/useMockData'
import type { DebugResult, ScoredChunk } from './types'

// ========== Mock Data ==========

function makeMockChunks(prefix: string, count: number): ScoredChunk[] {
  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    score: parseFloat((0.95 - i * 0.03).toFixed(4)),
    content: `[${prefix}] 这是第${i + 1}个检索结果的内容片段。展示了与查询相关的文档段落，包含关键信息和上下文...`,
    documentTitle: i < 3 ? '2026年差旅管理制度' : i < 6 ? '网约车报销实施细则' : '员工考勤与休假制度',
    sectionPath: i < 3 ? '第三章/住宿标准' : '第二章/报销凭证',
    chunkIndex: i,
  }))
}

const mockDebugResult: DebugResult = {
  traceId: 'trace-20260806-001',
  query: '深圳出差住宿标准',
  denseResults: makeMockChunks('DENSE', 30),
  sparseResults: makeMockChunks('SPARSE', 30),
  rrfResults: makeMockChunks('RRF', 20),
  rerankResults: makeMockChunks('RERANK', 8),
  finalContext: `【来源 S1】2026年差旅管理制度 V3.0 | 第三章/住宿标准 | 第7页
一线城市（北京、上海、广州、深圳）住宿标准为每人每天不超过600元。

【来源 S2】2026年差旅管理制度 V3.0 | 第三章/住宿标准 | 第7页
二线城市住宿标准为每人每天不超过400元。三四线城市不超过300元。

【来源 S3】2026年差旅管理制度 V3.0 | 第三章/住宿标准 | 第8页
住宿费用由员工先行垫付，出差结束后5个工作日内提交报销申请。`,
  modelOutput: `{
  "answer": "根据2026年差旅管理制度（V3.0），深圳属于一线城市，住宿标准为每人每天不超过600元。",
  "confidence": 0.91,
  "answerStatus": "SUPPORTED",
  "citations": [
    {"sourceId": "S1", "title": "2026年差旅管理制度", "pageNumber": 7, "quote": "一线城市住宿标准为每人每天不超过600元"}
  ]
}`,
  timing: {
    'query.rewrite': 120,
    'permission.filter': 45,
    'dense.retrieve': 850,
    'sparse.retrieve': 620,
    'rrf.fusion': 180,
    'rerank': 420,
    'context.build': 95,
    'llm.generate': 2350,
    'citation.verify': 310,
  },
}

// ========== API Functions ==========

export function runDebugRetrieval(_query: string, _strategy?: {
  dense?: boolean
  sparse?: boolean
  rrf?: boolean
  rerank?: boolean
}): Promise<DebugResult> {
  if (useMockData()) {
    return mockDelay(800, 500).then(() => ({
      ...mockDebugResult,
      query: _query,
      traceId: `trace-${Date.now()}`,
    }))
  }
  return request.post('/debug/retrieve', { query: _query, strategy: _strategy }).then(res => res.data)
}

export function getDebugTrace(_traceId: string): Promise<DebugResult> {
  if (useMockData()) {
    return mockDelay().then(() => ({ ...mockDebugResult, traceId: _traceId }))
  }
  return request.get(`/debug/traces/${_traceId}`).then(res => res.data)
}
