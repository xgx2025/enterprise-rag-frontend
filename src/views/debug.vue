<script setup lang="ts">
import { ref } from 'vue'
import { useDebugStore } from '@/stores/debug'
import DebugInput from '@/components/debug/DebugInput.vue'
import ResultColumn from '@/components/debug/ResultColumn.vue'
import RankingChangeView from '@/components/debug/RankingChangeView.vue'
import FinalContextView from '@/components/debug/FinalContextView.vue'
import ModelOutputView from '@/components/debug/ModelOutputView.vue'
import ErrorBlock from '@/components/common/ErrorBlock.vue'
import { Search, Timer, TrendCharts } from '@element-plus/icons-vue'

const debugStore = useDebugStore()
const query = ref('')
const activeTab = ref('dense')

async function handleSearch() {
  if (!query.value.trim()) return
  activeTab.value = 'dense'
  await debugStore.runDebug(query.value)
}

function formatMs(ms: number): string {
  return ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

function getStageColor(stage: string): string {
  if (stage.includes('dense')) return 'stage-dense'
  if (stage.includes('sparse')) return 'stage-sparse'
  if (stage.includes('rrf')) return 'stage-rrf'
  if (stage.includes('rerank')) return 'stage-rerank'
  if (stage.includes('llm') || stage.includes('generate')) return 'stage-llm'
  return ''
}

const totalTime = () => {
  if (!debugStore.result) return 0
  return Object.values(debugStore.result.timing).reduce((a, b) => a + b, 0)
}
</script>

<template>
  <div class="debug-page">
    <div class="page-hero">
      <div class="hero-left">
        <h2 class="hero-title">检索调试</h2>
        <p class="hero-sub">可视化多路召回、RRF 融合、Rerank 重排全过程，观察每个阶段的检索质量</p>
      </div>
      <div v-if="debugStore.result" class="hero-total">
        <Timer />
        <span>总耗时 {{ formatMs(totalTime()) }}</span>
      </div>
    </div>

    <DebugInput v-model="query" :loading="debugStore.loading" @search="handleSearch" />

    <ErrorBlock v-if="debugStore.error" :message="debugStore.error" @retry="handleSearch" />

    <!-- Empty -->
    <div v-if="!debugStore.result && !debugStore.loading && !debugStore.error" class="debug-empty">
      <div class="empty-visual">
        <TrendCharts class="empty-chart-icon" />
      </div>
      <h3>输入测试查询</h3>
      <p>查看 Dense 语义检索、Sparse 关键词检索、RRF 融合排名和 Rerank 重排的全链路数据</p>
    </div>

    <!-- Results -->
    <div v-if="debugStore.result" class="debug-results">
      <!-- Timing waterfall -->
      <div class="timing-card">
        <div class="timing-title">
          <Timer class="timing-title-icon" />
          <span>调用链路耗时</span>
          <span class="timing-total">{{ formatMs(totalTime()) }}</span>
        </div>
        <div class="timing-flow">
          <span
            v-for="(ms, stage) in debugStore.result.timing"
            :key="stage"
            class="timing-chip"
            :class="getStageColor(stage)"
          >
            <span class="tc-stage">{{ stage }}</span>
            <span class="tc-ms">{{ formatMs(ms) }}</span>
          </span>
        </div>
      </div>

      <!-- Tabbed results -->
      <div class="results-card">
        <el-tabs v-model="activeTab" class="result-tabs">
          <el-tab-pane label="Dense 召回" name="dense">
            <div class="tab-badge">Top {{ debugStore.result.denseResults.length }}</div>
            <ResultColumn :chunks="debugStore.result.denseResults.slice(0, 15)" title="Dense 语义向量检索" />
          </el-tab-pane>

          <el-tab-pane label="Sparse 召回" name="sparse">
            <div class="tab-badge">Top {{ debugStore.result.sparseResults.length }}</div>
            <ResultColumn :chunks="debugStore.result.sparseResults.slice(0, 15)" title="Sparse 关键词检索 (BM25)" />
          </el-tab-pane>

          <el-tab-pane label="RRF 融合" name="rrf">
            <div class="tab-badge">融合 Top {{ debugStore.result.rrfResults.length }}</div>
            <ResultColumn :chunks="debugStore.result.rrfResults.slice(0, 15)" title="RRF 倒数排名融合" />
          </el-tab-pane>

          <el-tab-pane label="Rerank 重排" name="rerank">
            <div class="tab-badge">重排前后对比</div>
            <RankingChangeView
              :before="debugStore.result.rrfResults.slice(0, 12)"
              :after="debugStore.result.rerankResults.slice(0, 12)"
            />
          </el-tab-pane>

          <el-tab-pane label="最终上下文" name="context">
            <FinalContextView :context="debugStore.result.finalContext" />
          </el-tab-pane>

          <el-tab-pane label="模型输出" name="output">
            <ModelOutputView :output="debugStore.result.modelOutput" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- Skeleton loading -->
    <div v-if="debugStore.loading" class="debug-skeleton">
      <div class="sk-row" v-for="i in 5" :key="i">
        <div class="sk-bar"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.debug-page {
  padding: 24px 28px;
  max-width: 1500px;
  margin: 0 auto;
}

/* Hero */
.page-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.hero-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 750;
  color: #111827;
  letter-spacing: -0.01em;
}

.hero-sub {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  max-width: 560px;
  line-height: 1.5;
}

.hero-total {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #eef2ff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
  flex-shrink: 0;
}

/* Empty */
.debug-empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-visual {
  margin-bottom: 20px;
}

.empty-chart-icon {
  font-size: 56px;
  color: #d1d5db;
}

.debug-empty h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 650;
  color: #111827;
}

.debug-empty p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* Timing card */
.timing-card {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.timing-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.timing-title-icon { color: #6366f1; font-size: 16px; }

.timing-total {
  margin-left: auto;
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  color: #6366f1;
  font-weight: 700;
}

.timing-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.timing-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 12px;
  transition: all 0.15s ease;
  cursor: default;
}

.timing-chip:hover { background: #fff; border-color: #d1d5db; }

.tc-stage { color: #6b7280; font-size: 11px; }
.tc-ms { color: #374151; font-weight: 600; font-family: var(--font-mono, monospace); }

/* Stage color coding */
.stage-dense { border-left: 3px solid #818cf8; }
.stage-sparse { border-left: 3px solid #f59e0b; }
.stage-rrf { border-left: 3px solid #10b981; }
.stage-rerank { border-left: 3px solid #8b5cf6; }
.stage-llm { border-left: 3px solid #ef4444; }

/* Results card */
.results-card {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  padding: 8px 20px 20px;
}

.tab-badge {
  display: inline-flex;
  padding: 2px 10px;
  background: #eef2ff;
  color: #6366f1;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  margin-bottom: 12px;
}

.result-tabs :deep(.el-tabs__header) { margin-bottom: 12px; }
.result-tabs :deep(.el-tabs__item) { font-size: 14px; font-weight: 500; padding: 0 20px; }

/* Skeleton */
.debug-skeleton {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sk-row {
  display: flex;
  gap: 12px;
}

.sk-bar {
  flex: 1;
  height: 16px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
