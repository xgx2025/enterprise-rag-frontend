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
  const sending = ref(false)
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
    if (!query.trim()) return

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

    // Send and get response
    sending.value = true
    try {
      const response = await sendMsgApi({
        query,
        conversationId: conv.id,
        knowledgeBaseIds: activeKnowledgeBaseIds.value,
      })
      conv.messages.push(response)
      conv.updatedAt = new Date().toISOString()
    } catch (e: any) {
      ElMessage.error(e?.message || '发送失败，请重试')
      // Remove the user message on error? No, keep it with an error state
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: '抱歉，消息发送失败。请稍后重试。',
        timestamp: new Date().toISOString(),
        answerStatus: 'INSUFFICIENT',
      }
      conv.messages.push(errorMsg)
    } finally {
      sending.value = false
    }
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
    selectCitation,
    setActiveKnowledgeBases,
    setRetrievalStrategy,
    resetCurrentConversation,
  }
})
