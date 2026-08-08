import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getConversations,
  getConversation,
  createConversation as createConvApi,
  deleteConversation as deleteConvApi,
  sendMessage as sendMsgApi,
} from '@/api/chat'
import type { Conversation, ChatMessage, Citation } from '@/api/types'
import { ElMessage } from 'element-plus'

export const useChatStore = defineStore('chat', () => {
  // ---- State ----
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const conversationsLoading = ref(false)
  const sending = ref(false)   // whole send lifecycle (thinking + streaming)
  const thinking = ref(false)  // awaiting first content from the API
  const selectedCitation = ref<Citation | null>(null)
  const activeKnowledgeBaseIds = ref<string[]>([])
  const retrievalStrategy = ref<string>('hybrid')

  // ---- Getters ----
  const hasActiveConversation = computed(() => currentConversation.value !== null)
  const messages = computed(() => currentConversation.value?.messages ?? [])

  // ---- Actions ----
  async function loadConversations() {
    conversationsLoading.value = true
    try {
      conversations.value = await getConversations()
    } finally {
      conversationsLoading.value = false
    }
  }

  async function loadConversation(id: string) {
    conversationsLoading.value = true
    try {
      currentConversation.value = await getConversation(id)
    } finally {
      conversationsLoading.value = false
    }
  }

  async function createConversation(): Promise<Conversation> {
    const conv = await createConvApi()
    conversations.value.unshift(conv)
    currentConversation.value = conv
    return conv
  }

  async function deleteConversation(id: string) {
    try {
      await deleteConvApi(id)
      conversations.value = conversations.value.filter(c => c.id !== id)
      if (currentConversation.value?.id === id) {
        currentConversation.value = null
      }
    } catch (e: any) {
      ElMessage.error(e?.message || '删除失败')
    }
  }

  async function sendMessage(query: string) {
    if (!query.trim() || sending.value) return

    // Auto-create conversation if none active
    if (!currentConversation.value) {
      await createConversation()
    }

    const conv = currentConversation.value!
    conv.knowledgeBaseIds = [...activeKnowledgeBaseIds.value]

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    }
    conv.messages.push(userMsg)

    // Update conversation title based on first message
    if (conv.messages.length === 1) {
      conv.title = query.length > 20 ? query.slice(0, 20) + '...' : query
      conv.updatedAt = new Date().toISOString()
    }

    await runAssistantTurn(query)
  }

  /**
   * Drop the last assistant answer and re-run the most recent user question.
   */
  async function regenerateLastMessage() {
    if (sending.value) return
    const conv = currentConversation.value
    if (!conv) return

    let lastUserIdx = -1
    for (let i = conv.messages.length - 1; i >= 0; i--) {
      const m = conv.messages[i]
      if (m && m.role === 'user') { lastUserIdx = i; break }
    }
    if (lastUserIdx === -1) return

    const lastUserMsg = conv.messages[lastUserIdx]
    if (!lastUserMsg) return
    const query = lastUserMsg.content
    // Remove everything after the last user message (the stale answer)
    if (conv.messages.length > lastUserIdx + 1) {
      conv.messages.splice(lastUserIdx + 1)
    }
    await runAssistantTurn(query)
  }

  /**
   * Core assistant turn: call the API, then reveal the answer progressively
   * via a typewriter effect. Structured so a future true-SSE backend can
   * replace the typewriter driver with real `answer.delta` chunks without
   * touching the UI - just feed deltas through appendDelta().
   */
  async function runAssistantTurn(query: string) {
    const conv = currentConversation.value!
    const placeholderId = `msg-${Date.now()}-assistant`

    // Placeholder assistant message; content streams in via the proxy below.
    const assistantMsg: ChatMessage = {
      id: placeholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }

    sending.value = true
    thinking.value = true
    try {
      const response = await sendMsgApi({
        query,
        conversationId: conv.id,
        knowledgeBaseIds: activeKnowledgeBaseIds.value,
      })
      // Attach metadata before the message enters the list (reads are fine).
      assistantMsg.citations = response.citations
      assistantMsg.answerStatus = response.answerStatus
      assistantMsg.retrievalStats = response.retrievalStats

      thinking.value = false
      conv.messages.push(assistantMsg)

      // Reveal content progressively. Mutate via the reactive proxy found
      // in the array so the view updates on every slice.
      await streamReveal(conv, placeholderId, response.content)
      conv.updatedAt = new Date().toISOString()
    } catch (e: any) {
      thinking.value = false
      if (!conv.messages.some(m => m.id === placeholderId)) {
        conv.messages.push(assistantMsg)
      }
      const msg = conv.messages.find(m => m.id === placeholderId)
      if (msg) {
        msg.content = '抱歉，消息发送失败。请稍后重试。'
        msg.answerStatus = 'INSUFFICIENT'
        msg.isStreaming = false
      }
      ElMessage.error(e?.message || '发送失败，请重试')
    } finally {
      sending.value = false
      thinking.value = false
    }
  }

  /**
   * Typewriter reveal: slices `full` into growing prefixes on each animation
   * frame. Step size scales with length so long answers finish in a bounded
   * ~3-4s instead of crawling char-by-char. Honors reduced-motion by
   * dumping the full text immediately (no animation).
   */
  function streamReveal(conv: Conversation, msgId: string, full: string): Promise<void> {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    return new Promise((resolve) => {
      const finish = () => {
        const msg = conv.messages.find(m => m.id === msgId)
        if (msg) {
          msg.content = full
          msg.isStreaming = false
        }
        resolve()
      }
      if (prefersReduced || !full) { finish(); return }

      const total = full.length
      let i = 0
      const step = () => {
        const msg = conv.messages.find(m => m.id === msgId)
        if (!msg) { resolve(); return }
        if (i >= total) { msg.isStreaming = false; resolve(); return }
        // ~220 frames cap; min 2 chars/frame for short answers
        const inc = Math.max(2, Math.round(total / 220))
        i = Math.min(total, i + inc)
        msg.content = full.slice(0, i)
        if (i < total) requestAnimationFrame(step)
        else { msg.isStreaming = false; resolve() }
      }
      requestAnimationFrame(step)
    })
  }

  /** Future SSE hook: append a real delta chunk to a streaming message. */
  function appendDelta(msgId: string, delta: string) {
    const conv = currentConversation.value
    if (!conv) return
    const msg = conv.messages.find(m => m.id === msgId)
    if (msg) msg.content += delta
  }

  function selectCitation(citation: Citation | null) {
    selectedCitation.value = citation
  }

  function setActiveKnowledgeBases(ids: string[]) {
    activeKnowledgeBaseIds.value = ids
  }

  function setRetrievalStrategy(strategy: string) {
    retrievalStrategy.value = strategy
  }

  function resetCurrentConversation() {
    currentConversation.value = null
    selectedCitation.value = null
  }

  return {
    conversations,
    currentConversation,
    conversationsLoading,
    sending,
    thinking,
    selectedCitation,
    activeKnowledgeBaseIds,
    retrievalStrategy,
    hasActiveConversation,
    messages,
    loadConversations,
    loadConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    regenerateLastMessage,
    appendDelta,
    selectCitation,
    setActiveKnowledgeBases,
    setRetrievalStrategy,
    resetCurrentConversation,
  }
})
