<script setup lang="ts">
import type { ScoredChunk } from '@/api/types'

defineProps<{
  before: ScoredChunk[]
  after: ScoredChunk[]
}>()
</script>

<template>
  <div class="ranking-change">
    <div v-if="before.length === 0 && after.length === 0" class="no-data">
      暂无重排数据
    </div>
    <div
      v-for="(item, i) in after.slice(0, 12)"
      :key="i"
      class="rank-item"
    >
      <div class="rank-before">
        <span class="rank-num">{{ before.find(b => b.content === item.content)?.rank ?? '-' }}</span>
      </div>
      <div class="rank-arrow">
        <span
          v-if="before.find(b => b.content === item.content)"
          class="arrow"
          :class="{
            up: (before.find(b => b.content === item.content)!.rank) > item.rank,
            down: (before.find(b => b.content === item.content)!.rank) < item.rank,
            same: (before.find(b => b.content === item.content)!.rank) === item.rank,
          }"
        >
          {{ (before.find(b => b.content === item.content)!.rank) > item.rank ? '↑' : (before.find(b => b.content === item.content)!.rank) < item.rank ? '↓' : '—' }}
        </span>
        <span v-else class="arrow new">+</span>
      </div>
      <div class="rank-after">
        <span class="rank-num current">{{ item.rank }}</span>
      </div>
      <div class="rank-info">
        <span class="rank-title">{{ item.documentTitle }}</span>
        <span class="rank-score">{{ item.score.toFixed(4) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ranking-change {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.no-data {
  text-align: center;
  color: #9ca3af;
  padding: 32px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
}

.rank-num {
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.rank-num.current {
  color: #6366f1;
  font-size: 15px;
}

.arrow {
  font-size: 20px;
  font-weight: 700;
}

.arrow.up { color: #10b981; }
.arrow.down { color: #ef4444; }
.arrow.same { color: #9ca3af; }
.arrow.new { color: #6366f1; font-size: 24px; }

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.rank-title {
  font-size: 13px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-score {
  font-size: 11px;
  color: #9ca3af;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
</style>
