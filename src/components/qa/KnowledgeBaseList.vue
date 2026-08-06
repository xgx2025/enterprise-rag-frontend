<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'

const chatStore = useChatStore()
const kbStore = useKnowledgeBaseStore()

const selectedIds = computed({
  get: () => chatStore.activeKnowledgeBaseIds,
  set: (val: string[]) => chatStore.setActiveKnowledgeBases(val),
})

const kbColorMap: Record<string, string> = {
  'kb-finance': '#6366f1',
  'kb-hr': '#8b5cf6',
  'kb-admin': '#06b6d4',
}

function toggleKb(id: string) {
  const current = [...selectedIds.value]
  const idx = current.indexOf(id)
  if (idx === -1) {
    current.push(id)
  } else {
    current.splice(idx, 1)
  }
  chatStore.setActiveKnowledgeBases(current)
}

const retrievalStrategy = computed({
  get: () => chatStore.retrievalStrategy,
  set: (val: string) => chatStore.setRetrievalStrategy(val),
})

const strategyOptions = [
  { label: '混合检索', value: 'hybrid' },
  { label: '语义检索', value: 'dense' },
  { label: '关键词检索', value: 'sparse' },
]
</script>

<template>
  <div class="kb-bar">
    <div class="kb-bar-row">
      <span class="kb-bar-label">知识范围</span>
      <div class="kb-chips">
        <button
          v-for="kb in kbStore.activeKnowledgeBases"
          :key="kb.id"
          class="kb-chip"
          :class="{ active: selectedIds.includes(kb.id) }"
          :style="{ '--chip-color': kbColorMap[kb.id] || '#6366f1' }"
          @click="toggleKb(kb.id)"
        >
          <span class="chip-dot"></span>
          <span class="chip-name">{{ kb.name }}</span>
          <span class="chip-count">{{ kb.documentCount }}</span>
        </button>
      </div>

      <span class="kb-bar-label strategy-label">检索策略</span>
      <el-select
        v-model="retrievalStrategy"
        size="small"
        class="strategy-select"
      >
        <el-option
          v-for="opt in strategyOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>

    <transition name="hint-fade">
      <div v-if="selectedIds.length === 0" class="kb-hint">
        请选择至少一个知识库以开始提问
      </div>
    </transition>
  </div>
</template>

<style scoped>
.kb-bar {
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
}

.kb-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.kb-bar-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  flex-shrink: 0;
}

.kb-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.kb-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.kb-chip:hover {
  border-color: #c7d2fe;
  background: #f5f7ff;
}

.kb-chip.active {
  border-color: var(--chip-color);
  background: color-mix(in srgb, var(--chip-color) 8%, #fff);
  color: color-mix(in srgb, var(--chip-color) 70%, #111827);
  font-weight: 600;
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--chip-color);
  opacity: 0.6;
}

.kb-chip.active .chip-dot {
  opacity: 1;
}

.chip-count {
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #9ca3af;
  font-weight: 500;
}

.kb-chip.active .chip-count {
  background: color-mix(in srgb, var(--chip-color) 15%, #fff);
  color: color-mix(in srgb, var(--chip-color) 60%, #111827);
}

/* Strategy selector */
.strategy-label {
  margin-left: 8px;
  padding-left: 12px;
  border-left: 1px solid #e5e7eb;
}

.strategy-select {
  width: 130px;
}

/* Hint */
.kb-hint {
  margin-top: 8px;
  font-size: 12.5px;
  color: #d97706;
  padding: 6px 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  line-height: 1.5;
}

.hint-fade-enter-active { transition: all 0.3s ease; }
.hint-fade-leave-active { transition: all 0.2s ease; }
.hint-fade-enter-from,
.hint-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
