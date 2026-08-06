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
    <div class="retrieval-detail" v-show="expanded">
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
</template>

<style scoped>
.retrieval-footer {
  margin-top: 12px;
  border-top: 1px solid #f3f4f6;
  padding-top: 10px;
}

.retrieval-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  user-select: none;
}

.retrieval-toggle:hover {
  color: #6366f1;
}

.toggle-arrow {
  transition: transform 0.2s;
  font-size: 10px;
}

.toggle-arrow.expanded {
  transform: rotate(180deg);
}

.retrieval-detail {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.stat-label {
  color: #9ca3af;
}

.stat-value {
  color: #374151;
  font-weight: 500;
}

.stat-value.warn {
  color: #f59e0b;
}

.stat-value.highlight {
  color: #6366f1;
}

.stat-total {
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px dashed #e5e7eb;
}

.stat-total .stat-label,
.stat-total .stat-value {
  font-weight: 600;
  color: #111827;
}
</style>
