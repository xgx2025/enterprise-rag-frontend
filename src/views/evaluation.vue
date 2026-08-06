<script setup lang="ts">
import { onMounted } from 'vue'
import { useEvaluationStore } from '@/stores/evaluation'
import MetricsGrid from '@/components/evaluation/MetricsGrid.vue'
import EvaluationRunPanel from '@/components/evaluation/EvaluationRunPanel.vue'
import LatencyChart from '@/components/evaluation/LatencyChart.vue'
import StrategyComparison from '@/components/evaluation/StrategyComparison.vue'
import ErrorBlock from '@/components/common/ErrorBlock.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { DataAnalysis } from '@element-plus/icons-vue'

const evalStore = useEvaluationStore()

onMounted(() => { evalStore.fetchLatestResults() })
</script>

<template>
  <div class="evaluation-page">
    <div class="page-hero">
      <div class="hero-left">
        <h2 class="hero-title">评测中心</h2>
        <p class="hero-sub">检索质量度量与策略对比，持续优化 RAG 系统表现</p>
      </div>
      <div v-if="evalStore.result" class="hero-status">
        <span class="status-dot" :class="evalStore.isRunning ? 'live' : 'done'"></span>
        <span>{{ evalStore.isRunning ? '评测进行中' : `上次评测 ${new Date(evalStore.result.runAt).toLocaleDateString('zh-CN')}` }}</span>
      </div>
    </div>

    <EvaluationRunPanel
      :is-running="evalStore.isRunning"
      :last-run-at="evalStore.result?.runAt"
      @run="evalStore.runEvaluation()"
    />

    <ErrorBlock v-if="evalStore.error && !evalStore.result" :message="evalStore.error" @retry="evalStore.fetchLatestResults()" />

    <!-- Loading skeleton -->
    <div v-if="evalStore.loading && !evalStore.result" class="skeleton-area">
      <div class="sk-grid">
        <div class="sk-card" v-for="i in 12" :key="i">
          <div class="sk-line short"></div>
          <div class="sk-line long"></div>
        </div>
      </div>
    </div>

    <EmptyState
      v-if="!evalStore.result && !evalStore.loading && !evalStore.error"
      title="暂无评测数据"
      description="运行评测任务以生成 Recall、MRR、nDCG、引用正确率等关键指标"
      action-label="运行首次评测"
      @action="evalStore.runEvaluation()"
    />

    <!-- Results -->
    <template v-if="evalStore.result">
      <div class="section-header">
        <h3>核心指标</h3>
      </div>
      <MetricsGrid :metrics="evalStore.result.metrics" />

      <div class="charts-row">
        <div class="chart-box">
          <LatencyChart :p50="evalStore.result.metrics.latencyP50" :p95="evalStore.result.metrics.latencyP95" />
        </div>
        <div class="chart-box chart-wide">
          <StrategyComparison :strategies="evalStore.result.strategyComparisons" />
        </div>
      </div>

      <!-- Category breakdown -->
      <div class="category-card">
        <h4 class="cat-title">分类评测得分</h4>
        <p class="cat-sub">不同问题类型在各指标上的表现</p>
        <div class="cat-grid">
          <div
            v-for="cat in evalStore.result.categoryBreakdown"
            :key="cat.category"
            class="cat-item"
          >
            <div class="cat-name">{{ cat.category }}</div>
            <div class="cat-metrics">
              <div class="cat-m">
                <span class="cat-m-val">{{ (cat.recallAt5 * 100).toFixed(0) }}<small>%</small></span>
                <span class="cat-m-label">Recall@5</span>
              </div>
              <div class="cat-m">
                <span class="cat-m-val">{{ (cat.mrr * 100).toFixed(0) }}<small>%</small></span>
                <span class="cat-m-label">MRR</span>
              </div>
              <div class="cat-m">
                <span class="cat-m-val">{{ (cat.refusalAccuracy * 100).toFixed(0) }}<small>%</small></span>
                <span class="cat-m-label">拒答准确率</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.evaluation-page {
  padding: 24px 28px;
  max-width: 1500px;
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
}

.hero-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.live { background: #10b981; animation: dot-pulse 1.5s infinite; }
.status-dot.done { background: #d1d5db; }

@keyframes dot-pulse {
  0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50% { opacity: 0.6; box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}

/* Skeleton */
.skeleton-area { margin-top: 16px; }

.sk-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.sk-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
}

.sk-line {
  height: 14px;
  background: #f3f4f6;
  border-radius: 6px;
  margin-bottom: 8px;
}
.sk-line.short { width: 50%; }
.sk-line.long { width: 70%; }

/* Section */
.section-header {
  margin: 24px 0 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
  color: #111827;
}

/* Charts row */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 16px;
  margin-top: 16px;
}

.chart-box {
  min-width: 0;
}

@media (max-width: 1200px) {
  .charts-row { grid-template-columns: 1fr; }
}

/* Category card */
.category-card {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  padding: 24px;
}

.cat-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 650;
  color: #111827;
}

.cat-sub {
  margin: 0 0 20px;
  font-size: 13px;
  color: #9ca3af;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.cat-item {
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.cat-item:hover {
  background: #fff;
  border-color: #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.cat-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.cat-metrics {
  display: flex;
  gap: 16px;
}

.cat-m {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-m-val {
  font-size: 22px;
  font-weight: 750;
  color: #111827;
  font-family: var(--font-mono, monospace);
  line-height: 1;
}

.cat-m-val small {
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
}

.cat-m-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
