<script setup lang="ts">
import type { ScoredChunk } from '@/api/types'

defineProps<{
  chunks: ScoredChunk[]
  title: string
}>()
</script>

<template>
  <div class="result-column">
    <div v-if="chunks.length === 0" class="no-results">暂无结果</div>
    <div
      v-for="chunk in chunks"
      :key="chunk.rank"
      class="result-item"
    >
      <div class="result-header">
        <span class="result-rank">#{{ chunk.rank }}</span>
        <span class="result-score">{{ chunk.score.toFixed(4) }}</span>
        <span class="result-source">{{ chunk.documentTitle }}</span>
      </div>
      <div class="result-section">{{ chunk.sectionPath }}</div>
      <div class="result-content">{{ chunk.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.result-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.no-results {
  text-align: center;
  color: #9ca3af;
  padding: 32px;
  font-size: 14px;
}

.result-item {
  padding: 12px 14px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  transition: border-color 0.15s;
}

.result-item:hover {
  border-color: #e5e7eb;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.result-rank {
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
  background: #eef2ff;
  padding: 1px 8px;
  border-radius: 4px;
}

.result-score {
  font-size: 12px;
  color: #9ca3af;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.result-source {
  font-size: 12px;
  color: #374151;
  margin-left: auto;
  font-weight: 500;
}

.result-section {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.result-content {
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
