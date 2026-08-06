<script setup lang="ts">
import type { EvalMetrics } from '@/api/types'
import MetricCard from './MetricCard.vue'

defineProps<{
  metrics: EvalMetrics
}>()
</script>

<template>
  <div class="metrics-grid">
    <MetricCard label="Recall@1" :value="metrics.recallAtK[1] ?? 0" :delta="0.03" />
    <MetricCard label="Recall@3" :value="metrics.recallAtK[3] ?? 0" :delta="0.02" />
    <MetricCard label="Recall@5" :value="metrics.recallAtK[5] ?? 0" :delta="0.03" />
    <MetricCard label="MRR" :value="metrics.mrr" :delta="0.02" />
    <MetricCard label="nDCG@5" :value="metrics.nDCG[5] ?? 0" :delta="0.01" />
    <MetricCard label="nDCG@10" :value="metrics.nDCG[10] ?? 0" :delta="0.02" />
    <MetricCard label="引用正确率" :value="metrics.citationAccuracy" :delta="0.01" />
    <MetricCard label="证据支持率" :value="metrics.evidenceSupportRate" :delta="0.02" />
    <MetricCard label="拒答准确率" :value="metrics.refusalAccuracy" />
    <MetricCard label="P50 延迟" :value="metrics.latencyP50" unit="ms" :delta="-0.08" />
    <MetricCard label="P95 延迟" :value="metrics.latencyP95" unit="ms" :delta="-0.05" />
    <MetricCard label="Token 消耗" :value="metrics.totalTokens.toLocaleString()" />
  </div>
</template>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1400px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1000px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
