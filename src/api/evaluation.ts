import request from '@/utils/request'
import { useMockData, mockDelay } from '@/composables/useMockData'
import type { EvalRunResult, EvalMetrics, StrategyComparison, EvalCategoryBreakdown } from './types'

// ========== Mock Data ==========

const mockMetrics: EvalMetrics = {
  recallAtK: { 1: 0.72, 3: 0.85, 5: 0.91, 10: 0.94 },
  mrr: 0.84,
  nDCG: { 5: 0.79, 10: 0.83 },
  citationAccuracy: 0.92,
  evidenceSupportRate: 0.91,
  refusalAccuracy: 0.90,
  latencyP50: 1850,
  latencyP95: 4200,
  totalTokens: 285000,
}

const mockStrategyComparisons: StrategyComparison[] = [
  { strategyName: 'Dense Only', recallAt5: 0.82, mrr: 0.75, nDCG: 0.72, latencyP95: 2800 },
  { strategyName: 'Sparse Only', recallAt5: 0.71, mrr: 0.66, nDCG: 0.63, latencyP95: 1500 },
  { strategyName: 'Hybrid (Dense+Sparse)', recallAt5: 0.88, mrr: 0.82, nDCG: 0.77, latencyP95: 3800 },
  { strategyName: 'Hybrid + Rerank', recallAt5: 0.91, mrr: 0.84, nDCG: 0.79, latencyP95: 4200 },
  { strategyName: 'Hybrid + Rerank + QueryRewrite', recallAt5: 0.93, mrr: 0.86, nDCG: 0.82, latencyP95: 4800 },
]

const mockCategoryBreakdown: EvalCategoryBreakdown[] = [
  { category: '精确事实', recallAt5: 0.94, mrr: 0.88, refusalAccuracy: 1.0 },
  { category: '语义表达', recallAt5: 0.85, mrr: 0.79, refusalAccuracy: 1.0 },
  { category: '跨文档问题', recallAt5: 0.78, mrr: 0.72, refusalAccuracy: 1.0 },
  { category: '版本冲突', recallAt5: 0.88, mrr: 0.81, refusalAccuracy: 1.0 },
  { category: '权限问题', recallAt5: 0.91, mrr: 0.85, refusalAccuracy: 0.92 },
  { category: '无答案问题', recallAt5: 0.0, mrr: 0.0, refusalAccuracy: 0.90 },
]

const mockEvalResult: EvalRunResult = {
  runId: 'run-20260806-001',
  metrics: mockMetrics,
  strategyComparisons: mockStrategyComparisons,
  categoryBreakdown: mockCategoryBreakdown,
  runAt: '2026-08-06T10:00:00Z',
  status: 'completed',
}

// ========== API Functions ==========

export function getLatestResults(): Promise<EvalRunResult | null> {
  if (useMockData()) {
    return mockDelay(400, 200).then(() => ({ ...mockEvalResult }))
  }
  return request.get('/evaluation/results').then(res => res.data)
}

export function getRunResult(_runId: string): Promise<EvalRunResult> {
  if (useMockData()) {
    return mockDelay().then(() => ({ ...mockEvalResult, runId: _runId }))
  }
  return request.get(`/evaluation/results/${_runId}`).then(res => res.data)
}

export function runEvaluation(_datasetIds: string[] = []): Promise<{ runId: string }> {
  if (useMockData()) {
    return mockDelay(1200, 600).then(() => ({
      runId: `run-${Date.now()}`,
    }))
  }
  return request.post('/evaluation/run', { datasetIds: _datasetIds }).then(res => res.data)
}
