<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/api/types'
import AnswerStatusBadge from './AnswerStatusBadge.vue'
import RetrievalFooter from './RetrievalFooter.vue'
import RetrievalResults from './RetrievalResults.vue'
import { renderMarkdown, highlightAll } from '@/utils/markdown'
import { ElMessage } from 'element-plus'
import { ArrowRight, CopyDocument, Refresh } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import robotIcon from '@/assets/icons/robot.svg?url'

const props = defineProps<{
  message: ChatMessage
}>()

const emit = defineEmits<{
  'cite': [sourceId: string]
  'regenerate': [messageId: string]
}>()

const chatStore = useChatStore()

// The streaming stage is a single global value in the store; surface it only
// on the message currently being generated so completed history rows stay quiet.
const streamStage = computed(() =>
  props.message.isStreaming ? chatStore.streamStage : null,
)

const statsExpanded = ref(false)
const reasoningExpanded = ref(!!props.message.isStreaming)
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
const reasoningSteps = computed(() => props.message.reasoningSteps ?? [])
const reasoningSummary = computed(() => {
  if (props.message.isStreaming) return streamStage.value || '正在分析'
  const failed = reasoningSteps.value.some(step => step.status === 'FAILED')
  return failed ? '分析完成，部分校验未通过' : `已完成 ${reasoningSteps.value.length} 个分析步骤`
})

// Highlight code blocks once streaming settles (or on mount for history).
watch(
  () => props.message.isStreaming,
  (streaming) => {
    if (!streaming) nextTick(() => highlightAll(contentRef.value))
  },
  { immediate: true },
)

watch(
  () => props.message.isStreaming,
  (streaming, previous) => {
    if (streaming) reasoningExpanded.value = true
    else if (previous) reasoningExpanded.value = false
  },
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
      <img :src="robotIcon" class="msg-avatar-icon" alt="AI 助手" />
    </div>

    <div class="message-body">
      <div class="message-bubble" :class="message.role">
        <!-- 用户可见的是安全推理摘要，不包含模型隐式思维链、Prompt 或证据正文。 -->
        <div v-if="reasoningSteps.length" class="reasoning-panel">
          <button
            class="reasoning-trigger"
            type="button"
            :aria-expanded="reasoningExpanded"
            @click="reasoningExpanded = !reasoningExpanded"
          >
            <span v-if="message.isStreaming" class="process-dots" aria-hidden="true">
              <span class="process-dot"></span>
              <span class="process-dot"></span>
              <span class="process-dot"></span>
            </span>
            <span v-else class="reasoning-check" aria-hidden="true">✓</span>
            <span class="reasoning-label">
              <strong>思考过程</strong>
              <span>{{ reasoningSummary }}</span>
            </span>
            <el-icon class="reasoning-arrow" :class="{ expanded: reasoningExpanded }"><ArrowRight /></el-icon>
          </button>
          <div v-show="reasoningExpanded" class="reasoning-steps">
            <div v-for="step in reasoningSteps" :key="step.id" class="reasoning-step" :class="step.status.toLowerCase()">
              <span class="reasoning-step-marker" aria-hidden="true"></span>
              <span class="reasoning-step-copy">
                <strong>{{ step.title }}</strong>
                <span>{{ step.detail }}</span>
              </span>
            </div>
          </div>
        </div>
        <div v-else-if="streamStage" class="stream-process">
          <span class="process-dots">
            <span class="process-dot"></span>
            <span class="process-dot"></span>
            <span class="process-dot"></span>
          </span>
          <span class="stream-stage-text">{{ streamStage }}</span>
        </div>
        <RetrievalFooter
          v-if="message.retrievalStats"
          :stats="message.retrievalStats"
          :expanded="statsExpanded"
          @toggle="statsExpanded = !statsExpanded"
        />
        <RetrievalResults
          v-if="message.retrievalResults && message.retrievalResults.length > 0"
          :results="message.retrievalResults"
        />

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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /* Top-align so the avatar sits beside the bubble's process header (which now
     leads the message) instead of floating at the bottom next to the actions. */
  align-self: flex-start;
}

.msg-avatar-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
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

/* ── Streaming process (sits above the answer body while generating) ── */
.stream-process {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-light, #f3f4f6);
}

.process-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.process-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary-lighter, #c7d2fe);
  animation: process-dot-pulse 1.5s infinite ease-in-out;
}

.process-dot:nth-child(1) { animation-delay: 0s; }
.process-dot:nth-child(2) { animation-delay: 0.2s; }
.process-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes process-dot-pulse {
  0%, 60%, 100% { transform: scale(0.7); opacity: 0.4; background: var(--color-primary-lighter, #c7d2fe); }
  30% { transform: scale(1.2); opacity: 1; background: var(--color-primary, #6366f1); }
}

.stream-stage-text {
  font-size: 12.5px;
  color: var(--color-text-tertiary, #6b7280);
}

/* ── Safe reasoning summary ── */
.reasoning-panel {
  margin: -2px 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-light, #f3f4f6);
}

.reasoning-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #374151);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.reasoning-trigger:focus-visible {
  outline: 2px solid var(--color-primary-lighter, #c7d2fe);
  outline-offset: 3px;
  border-radius: 6px;
}

.reasoning-check {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #ecfdf5;
  color: #059669;
  font-size: 11px;
  font-weight: 800;
}

.reasoning-label {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.reasoning-label strong {
  flex-shrink: 0;
  font-size: 12.5px;
  font-weight: 650;
}

.reasoning-label span {
  overflow: hidden;
  color: var(--color-text-muted, #9ca3af);
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reasoning-arrow {
  flex-shrink: 0;
  color: var(--color-text-muted, #9ca3af);
  font-size: 13px;
  transition: transform 0.2s ease;
}

.reasoning-arrow.expanded { transform: rotate(90deg); }

.reasoning-steps {
  position: relative;
  margin: 10px 0 0 8px;
  padding-left: 17px;
}

.reasoning-steps::before {
  content: '';
  position: absolute;
  top: 7px;
  bottom: 9px;
  left: 3px;
  width: 1px;
  background: var(--color-border, #e5e7eb);
}

.reasoning-step {
  position: relative;
  display: flex;
  gap: 8px;
  padding: 0 0 10px;
}

.reasoning-step:last-child { padding-bottom: 0; }

.reasoning-step-marker {
  position: absolute;
  top: 6px;
  left: -17px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px var(--color-bg-white, #fff);
}

.reasoning-step.running .reasoning-step-marker {
  background: var(--color-primary, #6366f1);
  animation: reasoning-pulse 1.2s ease-in-out infinite;
}

.reasoning-step.failed .reasoning-step-marker { background: #f59e0b; }

.reasoning-step-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.45;
}

.reasoning-step-copy strong {
  color: var(--color-text-secondary, #374151);
  font-size: 12px;
  font-weight: 600;
}

.reasoning-step-copy span {
  color: var(--color-text-tertiary, #6b7280);
  font-size: 11.5px;
}

@keyframes reasoning-pulse {
  0%, 100% { opacity: 0.45; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.15); }
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

@media (prefers-reduced-motion: reduce) {
  .process-dot { animation: none; opacity: 0.6; }
  .reasoning-step.running .reasoning-step-marker { animation: none; }
}
</style>
