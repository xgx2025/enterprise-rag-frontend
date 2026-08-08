<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  unit?: string
  delta?: number
  icon?: string
}>()

const displayValue = ref('')
const barPercent = ref(0) // 0–100, animated in lockstep with the number

let rafId: number | null = null
let currentNum = 0 // last displayed numeric value, so re-runs retarget smoothly

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Decompose the prop into a countable number + a renderer + the bar's target %.
// Percentage metrics (0..1) count up as their 0..100 form, matching how the bar
// already sized them (value * 100). Non-numbers render literally (no count-up).
interface Resolved {
  num: number | null
  render: (n: number) => string
  bar: number
}

function resolve(val: string | number): Resolved {
  if (typeof val !== 'number') {
    return { num: null, render: () => String(val), bar: 100 }
  }
  if (val < 1 && val > 0) {
    return { num: val * 100, render: (n) => `${Math.round(n)}%`, bar: val * 100 }
  }
  if (val > 1000) {
    return { num: val, render: (n) => Math.round(n).toLocaleString(), bar: 100 }
  }
  return { num: val, render: (n) => String(Math.round(n)), bar: val <= 1 ? val * 100 : 100 }
}

function countTo(target: number, render: (n: number) => string, barTarget: number) {
  const fromNum = currentNum
  const fromBar = barPercent.value
  // Render the starting frame synchronously to avoid an empty flash.
  displayValue.value = render(fromNum)

  if (prefersReducedMotion()) {
    currentNum = target
    barPercent.value = barTarget
    displayValue.value = render(target)
    return
  }

  const duration = 700 // matches the bar's intended reveal beat
  const start = performance.now()
  if (rafId != null) cancelAnimationFrame(rafId)

  const tick = (now: number) => {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
    currentNum = fromNum + (target - fromNum) * eased
    barPercent.value = fromBar + (barTarget - fromBar) * eased
    displayValue.value = render(currentNum)
    if (t < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      rafId = null
    }
  }
  rafId = requestAnimationFrame(tick)
}

function applyValue(val: string | number) {
  const { num, render, bar } = resolve(val)
  if (num === null) {
    displayValue.value = render(0)
    barPercent.value = bar
    return
  }
  countTo(num, render, bar)
}

onMounted(() => applyValue(props.value))
// The previous implementation only set the value onMounted, so a re-run that
// swapped the metrics object left the number stale while the bar updated.
// Watching the prop keeps them in sync and re-animates the transition.
watch(() => props.value, (val) => applyValue(val))

onUnmounted(() => {
  if (rafId != null) cancelAnimationFrame(rafId)
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
          width: barPercent + '%',
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
  /* Width is driven by the rAF count-up in lockstep with the number,
     so no CSS transition here (it would double-ease each frame). */
}
</style>
