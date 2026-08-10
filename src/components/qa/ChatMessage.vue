<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/api/types'
import AnswerStatusBadge from './AnswerStatusBadge.vue'
import RetrievalFooter from './RetrievalFooter.vue'
import { renderMarkdown, highlightAll } from '@/utils/markdown'
import { ElMessage } from 'element-plus'
import { Cpu, CopyDocument, Refresh } from '@element-plus/icons-vue'

const props = defineProps<{
  message: ChatMessage
}>()

const emit = defineEmits<{
  'cite': [sourceId: string]
  'regenerate': [messageId: string]
}>()

const statsExpanded = ref(false)
const contentRef = ref<HTMLElement | null>(null)

const isAssistant = computed(() => props.message.role === 'assistant')
const retryable = computed(() =>
  props.message.status === 'FAILED' || props.message.status === 'CANCELLED'
)
const effectiveContent = computed(() => {
  if (props.message.content) return props.message.content
  if (props.message.status === 'CANCELLED') return '回答生成已取消。'
  if (props.message.status === 'FAILED') {
    return props.message.errorMessage || '抱歉，回答生成失败。请稍后重试。'
  }
  return ''
})
const renderedContent = computed(() =>
  renderMarkdown(effectiveContent.value, !!props.message.isStreaming)
)
const showActions = computed(() =>
  isAssistant.value && !props.message.isStreaming && !!effectiveContent.value
)

// Highlight code blocks once streaming settles (or on mount for history).
watch(
  () => props.message.isStreaming,
  (streaming) => {
    if (!streaming) nextTick(() => highlightAll(contentRef.value))
  },
  { immediate: true },
)

// Click delegation for inline [S1] citation links produced by the renderer.
function onContentClick(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest('.md-cite') as HTMLElement | null
  if (target?.dataset.sourceId) {
    e.preventDefault()
    emit('cite', target.dataset.sourceId)
  }
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(effectiveContent.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动选择文本')
  }
}
</script>

<template>
  <div class="chat-message" :class="message.role">
    <!-- Assistant avatar -->
    <div v-if="isAssistant" class="msg-avatar">
      <Cpu />
    </div>

    <div class="message-body">
      <div class="message-bubble" :class="message.role">
        <!-- User keeps plain text (pre-wrap); assistant renders markdown -->
        <div v-if="isAssistant" class="message-content md-content" ref="contentRef" v-html="renderedContent" @click="onContentClick" />
        <div v-else class="message-content">{{ message.content }}</div>

        <!-- Citations -->
        <div v-if="message.citations && message.citations.length > 0" class="message-citations">
          <button
            v-for="cite in message.citations"
            :key="cite.sourceId"
            class="cite-badge"
            @click="emit('cite', cite.sourceId)"
          >
            {{ cite.sourceId }}
          </button>
        </div>

        <!-- Answer status + time -->
        <div class="message-footer" v-if="message.answerStatus">
          <AnswerStatusBadge :status="message.answerStatus" />
          <span class="msg-time">{{ new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour:'2-digit', minute:'2-digit' }) }}</span>
        </div>
      </div>

      <!-- Action toolbar (assistant, finished) -->
      <transition name="actions-fade">
        <div v-if="showActions" class="msg-actions">
          <button class="action-chip" @click="handleCopy" title="复制回答">
            <el-icon><CopyDocument /></el-icon>
            <span>复制</span>
          </button>
          <button
            class="action-chip"
            @click="emit('regenerate', message.id)"
            :title="retryable ? '重试回答' : '重新生成'"
          >
            <el-icon><Refresh /></el-icon>
            <span>{{ retryable ? '重试' : '重新生成' }}</span>
          </button>
        </div>
      </transition>

      <!-- Retrieval stats -->
      <RetrievalFooter
        v-if="message.retrievalStats"
        :stats="message.retrievalStats"
        :expanded="statsExpanded"
        @toggle="statsExpanded = !statsExpanded"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-message {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.assistant {
  justify-content: flex-start;
}

/* Avatar */
.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: var(--gradient-primary, linear-gradient(135deg,#6366f1,#8b5cf6));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  align-self: flex-end;
  margin-bottom: 2px;
}

/* Body */
.message-body {
  max-width: 78%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Bubble */
.message-bubble {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.7;
  position: relative;
}

.message-bubble.user {
  background: linear-gradient(135deg, var(--color-primary-bg, #eef2ff), var(--color-primary-lighter, #e0e7ff));
  color: var(--color-text-primary, #111827);
  border-bottom-right-radius: 6px;
}

.message-bubble.assistant {
  background: var(--color-bg-white, #fff);
  color: var(--color-text-primary, #111827);
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid var(--color-border-light, #f3f4f6);
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Assistant content is rendered markdown - let .md-content own the flow */
.message-bubble.assistant .message-content {
  white-space: normal;
}

/* Citations */
.message-citations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-light, #f3f4f6);
}

.cite-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 8px;
  background: var(--color-primary-bg, #eef2ff);
  color: var(--color-primary, #6366f1);
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  cursor: pointer;
  transition: all 0.2s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}

.cite-badge:hover {
  background: var(--color-primary, #6366f1);
  color: #fff;
  border-color: var(--color-primary, #6366f1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}

/* Footer */
.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  gap: 12px;
}

.msg-time {
  font-size: 11px;
  color: var(--color-text-muted, #9ca3af);
  flex-shrink: 0;
}

/* ── Action toolbar ── */
.msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  padding-left: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chat-message.assistant:hover .msg-actions {
  opacity: 1;
}

.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted, #9ca3af);
  font-size: 11.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-chip:hover {
  background: var(--color-bg-muted, #f5f7fa);
  color: var(--color-text-secondary, #374151);
}

.action-chip .el-icon {
  font-size: 13px;
}

.actions-fade-enter-active { transition: opacity 0.2s ease; }
.actions-fade-leave-active { transition: opacity 0.15s ease; }
.actions-fade-enter-from,
.actions-fade-leave-to { opacity: 0; }

/* Keep actions visible to keyboard/touch users even without hover */
@media (hover: none) {
  .msg-actions { opacity: 1; }
}
</style>
