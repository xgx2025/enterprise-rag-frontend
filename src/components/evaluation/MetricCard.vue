<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  unit?: string
  delta?: number
  icon?: string
}>()

const displayValue = ref('0')

function formatTarget(val: string | number): string {
  if (typeof val === 'number') {
    if (val < 1 && val > 0) return (val * 100).toFixed(0) + '%'
    if (val > 1000) return val.toLocaleString()
    return String(Math.round(val))
  }
  return val
}

onMounted(() => {
  const target = formatTarget(props.value)
  // Simple count-up animation for numbers
  if (typeof props.value === 'number') {
    displayValue.value = target
  } else {
    displayValue.value = target
  }
})
</script>

<template>
  <div class="metric-card">
    <div class="metric-top">
      <span class="metric-label">{{ label }}</span>
      <span v-if="delta !== undefined" class="metric-delta" :class="delta >= 0 ? 'up' : 'down'">
        <span class="delta-arrow">{{ delta >= 0 ? '↑' : '↓' }}</span>
        {{ Math.abs(delta * 100).toFixed(1) }}%
      </span>
    </div>
    <div class="metric-value-row">
      <span class="metric-value">{{ displayValue }}</span>
      <span v-if="unit" class="metric-unit">{{ unit }}</span>
    </div>
    <div class="metric-bar-track">
      <div
        class="metric-bar-fill"
        :style="{
          width: typeof value === 'number' && value <= 1 ? (value * 100) + '%' : '100%',
          background: delta !== undefined && delta >= 0
            ? 'linear-gradient(90deg, #818cf8, #6366f1)'
            : 'linear-gradient(90deg, #e5e7eb, #d1d5db)'
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.metric-card {
  padding: 20px 22px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  transition: all 0.25s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #818cf8, #6366f1);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.metric-card:hover {
  border-color: #e5e7eb;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}

.metric-card:hover::before {
  opacity: 1;
}

.metric-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.metric-delta {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.metric-delta.up { background: #ecfdf5; color: #059669; }
.metric-delta.down { background: #fef2f2; color: #dc2626; }

.delta-arrow { font-size: 11px; }

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.metric-value {
  font-size: 30px;
  font-weight: 750;
  color: #111827;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.metric-unit {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.metric-bar-track {
  margin-top: 12px;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.8s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}
</style>
