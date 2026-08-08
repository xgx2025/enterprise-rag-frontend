<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import KnowledgeBaseList from '@/components/qa/KnowledgeBaseList.vue'
import ConversationHistory from '@/components/qa/ConversationHistory.vue'
import ChatMessage from '@/components/qa/ChatMessage.vue'
import CitationPanel from '@/components/qa/CitationPanel.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Promotion, Cpu } from '@element-plus/icons-vue'

const chatStore = useChatStore()
const kbStore = useKnowledgeBaseStore()

const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const inputFocused = ref(false)

function scrollToBottom(smooth = true) {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  })
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || chatStore.sending) return
  if (chatStore.activeKnowledgeBaseIds.length === 0) return

  inputText.value = ''
  await chatStore.sendMessage(text)
  scrollToBottom(true)
}

async function handleRegenerate() {
  await chatStore.regenerateLastMessage()
  scrollToBottom(true)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault()
    handleSend()
  }
}

function handleCite(sourceId: string) {
  const citation = chatStore.messages
    .flatMap(m => m.citations || [])
    .find(c => c.sourceId === sourceId)
  if (citation) {
    chatStore.selectCitation(citation)
  }
}

const sampleQuestions = [
  { q: '深圳出差住宿标准是多少？', icon: '🏨' },
  { q: '报销网约车需要哪些凭证？', icon: '🚗' },
  { q: '新版差旅制度相比旧版有哪些变化？', icon: '📋' },
  { q: '员工入职需要办理哪些手续？', icon: '👋' },
]

onMounted(async () => {
  await kbStore.fetchKnowledgeBases()
  await chatStore.loadConversations()
})

watch(() => chatStore.messages.length, () => scrollToBottom(false))
</script>

<template>
  <div class="qa-page">
    <!-- Left Panel -->
    <div class="qa-left">
      <ConversationHistory />
    </div>

    <!-- Center: Chat -->
    <div class="qa-center">
      <!-- Knowledge base selector -->
      <KnowledgeBaseList />

      <!-- Empty state -->
      <transition name="empty-fade" mode="out-in">
        <div v-if="chatStore.messages.length === 0" key="empty" class="chat-empty">
          <div class="empty-hero">
            <div class="hero-icon">
              <Cpu />
            </div>
            <h2 class="hero-title">企业知识智能问答</h2>
            <p class="hero-desc">
              基于企业制度文档，为您提供可追溯、可信赖的精准回答
            </p>
          </div>
          <div class="sample-section">
            <p class="sample-label">💡 试试这些问题</p>
            <div class="sample-grid">
              <button
                v-for="item in sampleQuestions"
                :key="item.q"
                class="sample-card"
                :disabled="chatStore.activeKnowledgeBaseIds.length === 0"
                @click="inputText = item.q; handleSend()"
              >
                <span class="sample-icon">{{ item.icon }}</span>
                <span class="sample-text">{{ item.q }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div v-else key="messages" class="chat-messages" ref="messagesContainer">
          <transition-group name="msg-enter">
            <ChatMessage
              v-for="msg in chatStore.messages"
              :key="msg.id"
              :message="msg"
              @cite="handleCite"
              @regenerate="handleRegenerate"
            />
          </transition-group>

          <transition name="typing-fade">
            <div v-if="chatStore.thinking" class="typing-row">
              <div class="typing-avatar">
                <Cpu />
              </div>
              <div class="typing-bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </transition>
        </div>
      </transition>

      <!-- Input area -->
      <div class="chat-input" :class="{ focused: inputFocused }">
        <div class="input-row">
          <div class="input-wrapper">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="2"
              placeholder="输入您的问题，例如：深圳出差住宿标准是多少？"
              :disabled="chatStore.sending || chatStore.activeKnowledgeBaseIds.length === 0"
              @keydown="handleKeydown"
              @focus="inputFocused = true"
              @blur="inputFocused = false"
              resize="none"
              class="main-input"
            />
            <div class="input-actions">
              <span class="input-hint-keys">Ctrl + Enter 发送</span>
            </div>
          </div>
          <button
            class="send-btn"
            :class="{ ready: inputText.trim() && !chatStore.sending && chatStore.activeKnowledgeBaseIds.length > 0 }"
            :disabled="!inputText.trim() || chatStore.sending || chatStore.activeKnowledgeBaseIds.length === 0"
            @click="handleSend"
          >
            <el-icon v-if="!chatStore.sending" class="send-icon"><Promotion /></el-icon>
            <el-icon v-else class="send-icon spinning"><Cpu /></el-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <transition name="panel-slide">
      <div v-if="chatStore.selectedCitation" class="qa-right">
        <CitationPanel
          :citation="chatStore.selectedCitation"
          @close="chatStore.selectCitation(null)"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.qa-page {
  display: grid;
  grid-template-columns: 240px 1fr 0px;
  height: 100%;
  overflow: hidden;
  transition: grid-template-columns 0.35s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}

/* When citation panel is open, expand right column */
.qa-page:has(.qa-right) {
  grid-template-columns: 240px 1fr 400px;
}

/* ── Left Panel ── */
.qa-left {
  background: var(--color-bg-white, #fff);
  border-right: 1px solid var(--color-border-light, #f3f4f6);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* ── Center Panel ── */
.qa-center {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-stripe, #fafbfc);
}

/* ── Empty hero ── */
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 32px;
}

.empty-hero {
  text-align: center;
}

.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: var(--gradient-primary, linear-gradient(135deg,#6366f1,#8b5cf6));
  color: var(--color-bg-white, #fff);
  font-size: 28px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(99,102,241,0.25);
  animation: hero-float 3s ease-in-out infinite;
}

@keyframes hero-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.hero-title {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text-primary, #111827);
  letter-spacing: -0.02em;
}

.hero-desc {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-tertiary, #6b7280);
  max-width: 420px;
  line-height: 1.6;
}

/* ── Sample questions ── */
.sample-section {
  width: 100%;
  max-width: 560px;
}

.sample-label {
  font-size: 13px;
  color: var(--color-text-muted, #9ca3af);
  margin-bottom: 12px;
  font-weight: 500;
}

.sample-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.sample-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--color-bg-white, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 14px;
  font-size: 13.5px;
  color: var(--color-text-secondary, #374151);
  cursor: pointer;
  transition: all 0.25s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
  font-family: inherit;
  text-align: left;
}

.sample-card:hover:not(:disabled) {
  border-color: var(--color-primary-lighter, #c7d2fe);
  background: var(--color-primary-bg, #eef2ff);
  transform: translateY(-2px);
}

.sample-card:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sample-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.sample-text {
  line-height: 1.4;
}

/* ── Messages ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  scroll-behavior: smooth;
}

/* Message entry animation */
.msg-enter-enter-active {
  transition: opacity 0.35s ease, transform 0.35s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}
.msg-enter-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}

/* ── Typing indicator ── */
.typing-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 8px 0;
}

.typing-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--gradient-primary, linear-gradient(135deg,#6366f1,#8b5cf6));
  color: var(--color-bg-white, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.typing-bubble {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: var(--color-bg-white, #fff);
  border-radius: 14px 14px 14px 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-primary-lighter, #c7d2fe);
  animation: dot-pulse 1.5s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-pulse {
  0%, 60%, 100% { transform: scale(0.7); opacity: 0.4; background: var(--color-primary-lighter, #c7d2fe); }
  30% { transform: scale(1.3); opacity: 1; background: #6366f1; }
}

.typing-fade-enter-active { transition: opacity 0.3s ease; }
.typing-fade-leave-active { transition: opacity 0.2s ease; }
.typing-fade-enter-from,
.typing-fade-leave-to { opacity: 0; }

/* ── Input area ── */
.chat-input {
  border-top: 1px solid var(--color-border-light, #f3f4f6);
  padding: 16px 24px 20px;
  background: var(--color-bg-white, #fff);
  flex-shrink: 0;
  transition: box-shadow 0.3s ease;
}

.chat-input.focused {
  box-shadow: 0 -2px 12px rgba(99,102,241,0.04);
}

.input-hint {
  font-size: 12.5px;
  color: #d97706;
  margin-bottom: 10px;
  padding: 8px 14px;
  background: var(--color-bg-white, #fff)beb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  line-height: 1.5;
}

.hint-fade-enter-active { transition: all 0.3s var(--ease-out, cubic-bezier(0.16,1,0.3,1)); }
.hint-fade-leave-active { transition: all 0.2s ease; }
.hint-fade-enter-from,
.hint-fade-leave-to { opacity: 0; transform: translateY(-4px); }

.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.main-input :deep(.el-textarea__inner) {
  border-radius: 14px !important;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px 16px !important;
  background: var(--color-bg-subtle, #f9fafb);
  border: 1.5px solid var(--color-border, #e5e7eb);
  transition: all 0.25s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
  min-height: 52px !important;
  resize: none !important;
}

.main-input :deep(.el-textarea__inner):focus {
  background: var(--color-bg-white, #fff);
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99,102,241,0.06);
}

.main-input :deep(.el-textarea__inner):disabled {
  background: var(--color-border-light, #f3f4f6);
  color: var(--color-text-muted, #9ca3af);
}

.input-actions {
  position: absolute;
  right: 12px;
  bottom: 10px;
  pointer-events: none;
}

.input-hint-keys {
  font-size: 10px;
  color: var(--color-border-strong, #d1d5db);
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* Send button */
.send-btn {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: none;
  background: var(--color-border, #e5e7eb);
  color: var(--color-text-muted, #9ca3af);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}

.send-btn.ready {
  background: var(--gradient-primary, linear-gradient(135deg,#6366f1,#8b5cf6));
  color: var(--color-bg-white, #fff);
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
}

.send-btn.ready:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 20px rgba(99,102,241,0.45);
}

.send-btn.ready:active {
  transform: scale(0.96);
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.send-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.send-btn.ready:hover .send-icon {
  transform: translateX(1px) translateY(-1px);
}

.send-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Right Panel ── */
.qa-right {
  overflow: hidden;
  border-left: 1px solid var(--color-border-light, #f3f4f6);
  background: var(--color-bg-white, #fff);
}

/* Panel slide transition */
.panel-slide-enter-active {
  transition: all 0.35s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}
.panel-slide-leave-active {
  transition: all 0.25s ease;
}
.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Empty fade */
.empty-fade-enter-active { transition: opacity 0.3s ease; }
.empty-fade-leave-active { transition: opacity 0.2s ease; }
.empty-fade-enter-from,
.empty-fade-leave-to { opacity: 0; }

/* ── Reduced motion: stop ambient loops ── */
@media (prefers-reduced-motion: reduce) {
  .hero-icon { animation: none; }
  .typing-dot { animation: none; opacity: 0.6; }
}
</style>
