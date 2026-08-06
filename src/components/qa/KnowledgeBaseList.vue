<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { Folder } from '@element-plus/icons-vue'

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
</script>

<template>
  <div class="kb-panel">
    <div class="panel-header">
      <span class="panel-title">知识库</span>
      <span class="panel-count">{{ kbStore.knowledgeBases.length }} 个可用</span>
    </div>

    <el-checkbox-group v-model="selectedIds" class="kb-group">
      <div
        v-for="kb in kbStore.knowledgeBases"
        :key="kb.id"
        class="kb-item"
        :class="{ active: selectedIds.includes(kb.id) }"
      >
        <el-checkbox :value="kb.id" :label="kb.id" class="kb-checkbox">
          <div class="kb-content">
            <div class="kb-icon-dot" :style="{ background: kbColorMap[kb.id] || '#6366f1' }"></div>
            <div class="kb-info">
              <span class="kb-name">{{ kb.name }}</span>
              <span class="kb-desc">{{ kb.description }}</span>
            </div>
          </div>
        </el-checkbox>
        <span class="kb-badge">{{ kb.documentCount }}</span>
      </div>
    </el-checkbox-group>

    <transition name="hint-fade">
      <div v-if="selectedIds.length === 0" class="kb-hint">
        <span>选择知识库以开始提问</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.kb-panel {
  padding: 18px 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.panel-count {
  font-size: 11px;
  color: #c7d2fe;
  background: rgba(99,102,241,0.15);
  padding: 2px 8px;
  border-radius: 10px;
}

/* Checkbox group */
.kb-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kb-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.kb-item:hover { background: #f9fafb; }
.kb-item.active { background: #eef2ff; }

.kb-checkbox {
  flex: 1;
}

.kb-checkbox :deep(.el-checkbox__label) {
  width: 100%;
  padding-left: 8px;
}

.kb-content {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.kb-icon-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
  opacity: 0.8;
}

.kb-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.kb-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.kb-desc {
  font-size: 11.5px;
  color: #9ca3af;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kb-badge {
  font-size: 11px;
  font-weight: 600;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 8px;
  flex-shrink: 0;
}

/* Hint */
.kb-hint {
  margin-top: 14px;
  padding: 12px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  border-radius: 10px;
  font-size: 12.5px;
  color: #92400e;
  text-align: center;
  font-weight: 500;
}

.hint-fade-enter-active { transition: all 0.3s ease; }
.hint-fade-leave-active { transition: all 0.2s ease; }
.hint-fade-enter-from,
.hint-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
