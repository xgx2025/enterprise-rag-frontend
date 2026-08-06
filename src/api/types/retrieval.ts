// ============================================================
// Retrieval / Debug types
// ============================================================

export interface ScoredChunk {
  rank: number
  score: number
  content: string
  documentTitle: string
  sectionPath: string
  chunkIndex: number
}

export interface DebugResult {
  traceId: string
  query: string
  denseResults: ScoredChunk[]
  sparseResults: ScoredChunk[]
  rrfResults: ScoredChunk[]
  rerankResults: ScoredChunk[]
  finalContext: string
  modelOutput: string
  timing: Record<string, number>
}
