<script setup lang="ts">
import type { RetrievalStats } from '@/api/types'

defineProps<{
  stats: RetrievalStats
  expanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div class="retrieval-footer">
    <div class="retrieval-toggle" @click="emit('toggle')">
      <span>{{ expanded ? '收起检索过程' : '查看检索过程' }}</span>
      <span class="toggle-arrow" :class="{ expanded }">▾</span>
    </div>
    <transition name="expand">
      <div v-if="expanded" class="retrieval-detail">
        <div class="retrieval-detail-inner">
          <div class="stat-row">
            <span class="stat-label">已检索片段</span>
            <span class="stat-value">{{ stats.totalRetrieved }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">权限过滤</span>
            <span class="stat-value warn">{{ stats.permissionFiltered }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">融合候选</span>
            <span class="stat-value">{{ stats.fusionCandidates }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">重排保留</span>
            <span class="stat-value highlight">{{ stats.rerankKept }}</span>
          </div>
          <div class="stat-row stat-total">
            <span class="stat-label">总耗时</span>
            <span class="stat-value">{{ (stats.totalTimeMs / 1000).toFixed(1) }} 秒</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.retrieval-footer {
  margin-top: 12px;
  border-top: 1px solid var(--color-border-light, #f3f4f6);
  padding-top: 10px;
}

.retrieval-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted, #9ca3af);
  cursor: pointer;
  user-select: none;
}

.retrieval-toggle:hover {
  color: var(--color-primary, #6366f1);
}

.toggle-arrow {
  transition: transform 0.2s;
  font-size: 10px;
}

.toggle-arrow.expanded {
  transform: rotate(180deg);
}

.retrieval-detail {
  /* Grid-row accordion: the outer track animates 0fr↔1fr so the section
     grows/shrinks smoothly; overflow:hidden clips the inner while collapsed. */
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
}

.retrieval-detail-inner {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0; /* let the grid item collapse with its track */
}

.expand-enter-active,
.expand-leave-active {
  transition: grid-template-rows 250ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
              opacity 180ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

.expand-enter-from,
.expand-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .expand-enter-active,
  .expand-leave-active {
    transition: none;
  }
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.stat-label {
  color: var(--color-text-muted, #9ca3af);
}

.stat-value {
  color: var(--color-text-secondary, #374151);
  font-weight: 500;
}

.stat-value.warn {
  color: var(--color-warning, #f59e0b);
}

.stat-value.highlight {
  color: var(--color-primary, #6366f1);
}

.stat-total {
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px dashed var(--color-border, #e5e7eb);
}

.stat-total .stat-label,
.stat-total .stat-value {
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}
</style>
