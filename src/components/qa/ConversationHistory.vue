<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { ChatDotRound, Delete, ArrowLeft, Plus } from '@element-plus/icons-vue'

defineProps<{ collapsed: boolean }>()
defineEmits<{ 'toggle-sidebar': [] }>()

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
      <button
        v-if="!collapsed"
        class="conv-toggle"
        type="button"
        title="收起历史会话栏"
        aria-label="收起历史会话栏"
        @click="$emit('toggle-sidebar')"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <span class="panel-title">历史会话</span>
      <button
        class="new-chat-btn"
        type="button"
        @click="chatStore.startNewConversation()"
      >
        <el-icon><Plus /></el-icon>
        <span>新对话</span>
      </button>
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
  /* Fill the .qa-left flex column instead of collapsing to content height. */
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.conv-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

/* Collapse button - sits at the top-left corner of the sidebar */
.conv-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 7px;
  background: var(--color-bg-white, #fff);
  color: var(--color-text-tertiary, #6b7280);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.conv-toggle:hover {
  border-color: var(--color-primary-lighter, #c7d2fe);
  background: var(--color-primary-bg, #eef2ff);
  color: var(--color-primary, #6366f1);
}

.conv-toggle .el-icon {
  font-size: 13px;
}

/* New chat - soft primary CTA pushed to the right edge */
.new-chat-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--color-primary-lighter, #c7d2fe);
  border-radius: 8px;
  background: var(--color-primary-bg, #eef2ff);
  color: var(--color-primary, #6366f1);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.new-chat-btn:hover {
  background: var(--color-primary, #6366f1);
  border-color: var(--color-primary, #6366f1);
  color: var(--color-bg-white, #fff);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(99,102,241,0.25);
}

.new-chat-btn .el-icon {
  font-size: 13px;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.conv-list {
  flex: 1;
  min-height: 0;
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
