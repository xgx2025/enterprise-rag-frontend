<script setup lang="ts">
defineProps<{
  p50: number
  p95: number
}>()

const maxVal = 5000 // ms scale
const p50Percent = (2800 / maxVal) * 100
const p95Percent = (4200 / maxVal) * 100
</script>

<template>
  <div class="latency-chart">
    <h4 class="chart-title">延迟分布</h4>
    <div class="bar-group">
      <div class="bar-row">
        <span class="bar-label">P50</span>
        <div class="bar-track">
          <div class="bar-fill p50" :style="{ width: Math.min(p50Percent, 100) + '%' }"></div>
        </div>
        <span class="bar-value">{{ p50 }}ms</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">P95</span>
        <div class="bar-track">
          <div class="bar-fill p95" :style="{ width: Math.min(p95Percent, 100) + '%' }"></div>
        </div>
        <span class="bar-value">{{ p95 }}ms</span>
      </div>
    </div>
    <div class="chart-scale">
      <span>0ms</span>
      <span>2500ms</span>
      <span>5000ms</span>
    </div>
  </div>
</template>

<style scoped>
.latency-chart {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 20px;
}

.chart-title {
  margin: 0 0 20px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.bar-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 40px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-align: right;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 28px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s ease;
}

.bar-fill.p50 {
  background: linear-gradient(90deg, #818cf8, #6366f1);
}

.bar-fill.p95 {
  background: linear-gradient(90deg, #c4b5fd, #8b5cf6);
}

.bar-value {
  width: 60px;
  font-size: 12px;
  color: #6b7280;
  font-family: 'SF Mono', 'Fira Code', monospace;
  flex-shrink: 0;
}

.chart-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-left: 52px;
  padding-right: 72px;
  font-size: 11px;
  color: #d1d5db;
}
</style>
