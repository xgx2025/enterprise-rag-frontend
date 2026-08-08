<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { ChatDotRound, Delete } from '@element-plus/icons-vue'

const chatStore = useChatStore()

function formatDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[d.getDay()] ?? String(d.getDay())
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="conv-panel">
    <div class="conv-header">
      <span class="panel-title">历史会话</span>
      <el-button
        size="small"
        type="primary"
        text
        @click="chatStore.createConversation(); chatStore.resetCurrentConversation()"
      >
        新对话
      </el-button>
    </div>

    <div v-loading="chatStore.conversationsLoading" class="conv-list">
      <template v-if="chatStore.conversations.length === 0 && !chatStore.conversationsLoading">
        <div class="conv-empty">暂无历史会话</div>
      </template>

      <div
        v-for="(conv, i) in chatStore.conversations"
        :key="conv.id"
        class="conv-item"
        :class="{ active: chatStore.currentConversation?.id === conv.id }"
        :style="{ '--i': i }"
        @click="chatStore.loadConversation(conv.id)"
      >
        <el-icon class="conv-icon"><ChatDotRound /></el-icon>
        <div class="conv-body">
          <span class="conv-title">{{ conv.title }}</span>
          <span class="conv-date">{{ formatDate(conv.updatedAt || conv.createdAt) }}</span>
        </div>
        <el-button
          class="conv-delete"
          size="small"
          text
          @click.stop="chatStore.deleteConversation(conv.id)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conv-panel {
  padding: 16px;
  border-top: 1px solid var(--color-border-light, #f3f4f6);
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.conv-list {
  max-height: 300px;
  overflow-y: auto;
}

.conv-empty {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted, #9ca3af);
  padding: 20px 0;
}

.conv-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
  /* Staggered entrance - capped so long lists don't drag */
  animation: conv-in 300ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) backwards;
  animation-delay: calc(min(var(--i, 0), 12) * 28ms);
}

@keyframes conv-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.conv-item:hover {
  background: var(--color-bg-muted, #f5f7fa);
}

.conv-item.active {
  background: var(--color-primary-bg, #eef2ff);
}

.conv-icon {
  color: var(--color-text-muted, #9ca3af);
  flex-shrink: 0;
  font-size: 15px;
}

.conv-item.active .conv-icon {
  color: var(--color-primary, #6366f1);
}

.conv-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.conv-title {
  font-size: 13px;
  color: var(--color-text-primary, #111827);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-date {
  font-size: 11px;
  color: var(--color-text-muted, #9ca3af);
}

.conv-delete {
  opacity: 0;
  flex-shrink: 0;
  color: var(--color-text-muted, #9ca3af) !important;
}

.conv-item:hover .conv-delete {
  opacity: 1;
}

.conv-delete:hover {
  color: var(--color-danger, #ef4444) !important;
}

@media (prefers-reduced-motion: reduce) {
  .conv-item { animation: none; }
}
</style>
