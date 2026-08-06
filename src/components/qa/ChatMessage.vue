<script setup lang="ts">
import { ref } from 'vue'
import type { ChatMessage } from '@/api/types'
import AnswerStatusBadge from './AnswerStatusBadge.vue'
import RetrievalFooter from './RetrievalFooter.vue'
import { Cpu } from '@element-plus/icons-vue'

const props = defineProps<{
  message: ChatMessage
}>()

const emit = defineEmits<{
  'cite': [sourceId: string]
}>()

const statsExpanded = ref(false)
</script>

<template>
  <div class="chat-message" :class="message.role">
    <!-- Assistant avatar -->
    <div v-if="message.role === 'assistant'" class="msg-avatar">
      <Cpu />
    </div>

    <div class="message-body">
      <div class="message-bubble" :class="message.role">
        <div class="message-content">{{ message.content }}</div>

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
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: #111827;
  border-bottom-right-radius: 6px;
}

.message-bubble.assistant {
  background: #fff;
  color: #111827;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid #f3f4f6;
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Citations */
.message-citations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.cite-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 8px;
  background: #eef2ff;
  color: #6366f1;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  cursor: pointer;
  transition: all 0.2s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}

.cite-badge:hover {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
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
  color: #9ca3af;
  flex-shrink: 0;
}
</style>
