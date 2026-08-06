// ============================================================
// Evaluation types
// ============================================================

export interface EvalMetrics {
  recallAtK: Record<number, number>
  mrr: number
  nDCG: Record<number, number>
  citationAccuracy: number
  evidenceSupportRate: number
  refusalAccuracy: number
  latencyP50: number
  latencyP95: number
  totalTokens: number
}

export interface StrategyComparison {
  strategyName: string
  recallAt5: number
  mrr: number
  nDCG: number
  latencyP95: number
}

export interface EvalCategoryBreakdown {
  category: string
  recallAt5: number
  mrr: number
  refusalAccuracy: number
}

export interface EvalRunResult {
  runId: string
  metrics: EvalMetrics
  strategyComparisons: StrategyComparison[]
  categoryBreakdown: EvalCategoryBreakdown[]
  runAt: string
  status: 'idle' | 'running' | 'completed' | 'failed'
}
