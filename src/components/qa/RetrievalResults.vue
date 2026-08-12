<script setup lang="ts">
import { ref } from 'vue'
import type { RetrievalResult } from '@/api/types'
import { ArrowRight, Document } from '@element-plus/icons-vue'

defineProps<{
  results: RetrievalResult[]
}>()

const expanded = ref(false)
const openedSourceIds = ref<string[]>([])

function toggleResult(sourceId: string) {
  openedSourceIds.value = openedSourceIds.value.includes(sourceId)
    ? openedSourceIds.value.filter(id => id !== sourceId)
    : [...openedSourceIds.value, sourceId]
}

function formatScore(score: number) {
  return Number.isFinite(score) ? score.toFixed(4) : '0.0000'
}
</script>

<template>
  <section class="retrieval-results">
    <button
      class="results-trigger"
      type="button"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="results-title">最终检索结果</span>
      <span class="results-count">{{ results.length }} 个片段</span>
      <el-icon class="results-arrow" :class="{ expanded }"><ArrowRight /></el-icon>
    </button>

    <div v-show="expanded" class="results-list">
      <article v-for="(result, index) in results" :key="result.sourceId" class="result-card">
        <button
          class="result-summary"
          type="button"
          :aria-expanded="openedSourceIds.includes(result.sourceId)"
          @click="toggleResult(result.sourceId)"
        >
          <span class="result-rank">{{ index + 1 }}</span>
          <span class="result-main">
            <span class="result-document">
              <el-icon><Document /></el-icon>
              <strong>{{ result.title || '未命名文档' }}</strong>
            </span>
            <span class="result-location">
              {{ result.sectionPath || '未标注章节' }}
              <template v-if="result.pageNumber"> · 第 {{ result.pageNumber }} 页</template>
            </span>
          </span>
          <span class="score-badge" :title="`最终重排分数：${result.score}`">
            分数 {{ formatScore(result.score) }}
          </span>
          <el-icon
            class="result-arrow"
            :class="{ expanded: openedSourceIds.includes(result.sourceId) }"
          ><ArrowRight /></el-icon>
        </button>
        <div v-show="openedSourceIds.includes(result.sourceId)" class="result-content">
          {{ result.quote }}
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.retrieval-results {
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-light, #f3f4f6);
}

.results-trigger,
.result-summary {
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.results-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  text-align: left;
}

.results-title {
  color: var(--color-text-secondary, #374151);
  font-size: 12.5px;
  font-weight: 650;
}

.results-count {
  flex: 1;
  color: var(--color-text-muted, #9ca3af);
  font-size: 11.5px;
}

.results-arrow,
.result-arrow {
  flex-shrink: 0;
  color: var(--color-text-muted, #9ca3af);
  transition: transform 0.2s ease;
}

.results-arrow.expanded,
.result-arrow.expanded {
  transform: rotate(90deg);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.result-card {
  overflow: hidden;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 10px;
  background: var(--color-bg-subtle, #f9fafb);
}

.result-summary {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  text-align: left;
}

.result-summary:hover {
  background: var(--color-primary-bg, #eef2ff);
}

.result-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 7px;
  background: var(--color-primary-bg, #eef2ff);
  color: var(--color-primary, #6366f1);
  font-size: 11px;
  font-weight: 700;
}

.result-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  line-height: 1.35;
}

.result-document {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 5px;
  color: var(--color-text-secondary, #374151);
  font-size: 12px;
}

.result-document strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-location {
  overflow: hidden;
  color: var(--color-text-muted, #9ca3af);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-badge {
  flex-shrink: 0;
  padding: 3px 7px;
  border-radius: 6px;
  background: #ecfdf5;
  color: #047857;
  font-family: var(--font-mono, monospace);
  font-size: 10.5px;
  font-weight: 650;
}

.result-content {
  max-height: 220px;
  overflow-y: auto;
  padding: 10px 12px;
  border-top: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-bg-white, #fff);
  color: var(--color-text-tertiary, #6b7280);
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 720px) {
  .score-badge { font-size: 10px; }
  .result-location { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .results-arrow,
  .result-arrow { transition: none; }
}
</style>
