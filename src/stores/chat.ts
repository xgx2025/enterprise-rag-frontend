import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  createConversation as createConvApi,
  deleteConversation as deleteConvApi,
  getConversation,
  getConversations,
  sendMessage as sendMsgApi,
  streamMessage,
  streamRegenerate,
  streamRetry,
} from '@/api/chat'
import { useMockData } from '@/composables/useMockData'
import type { ChatStreamCallbacks } from '@/api/chat'
import type { SSEEvent } from '@/api/sse-events'
import type { Citation, ChatMessage, Conversation, SendMessageRequest } from '@/api/types'

type StreamStarter = (callbacks: ChatStreamCallbacks) => AbortController

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const conversationsLoading = ref(false)
  const sending = ref(false)
  const thinking = ref(false)
  const streamStage = ref<string | null>(null)
  const selectedCitation = ref<Citation | null>(null)
  const activeKnowledgeBaseIds = ref<string[]>([])
  const retrievalStrategy = ref<'hybrid' | 'dense' | 'sparse'>('hybrid')
  const activeRequest = ref<AbortController | null>(null)
  const streamingMessageId = ref<string | null>(null)
  let cancelRequested = false

  const hasActiveConversation = computed(() => currentConversation.value !== null)
  const messages = computed(() => currentConversation.value?.messages ?? [])

  async function loadConversations() {
    conversationsLoading.value = true
    try {
      conversations.value = await getConversations()
    } finally {
      conversationsLoading.value = false
    }
  }

  async function loadConversation(id: string) {
    if (sending.value) cancelGeneration()
    conversationsLoading.value = true
    try {
      const conversation = await getConversation(id)
      currentConversation.value = conversation
      activeKnowledgeBaseIds.value = [...conversation.knowledgeBaseIds]
      retrievalStrategy.value = conversation.retrievalStrategy ?? 'hybrid'
    } finally {
      conversationsLoading.value = false
    }
  }

  async function createConversation(): Promise<Conversation> {
    const conversation = await createConvApi()
    conversations.value = [conversation, ...conversations.value.filter(item => item.id !== conversation.id)]
    currentConversation.value = conversation
    return conversation
  }

  async function startNewConversation() {
    if (sending.value) cancelGeneration()
    currentConversation.value = null
    selectedCitation.value = null
  }

  async function deleteConversation(id: string) {
    try {
      if (currentConversation.value?.id === id && sending.value) cancelGeneration()
      await deleteConvApi(id)
      conversations.value = conversations.value.filter(conversation => conversation.id !== id)
      if (currentConversation.value?.id === id) currentConversation.value = null
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.message || error?.message || '删除失败')
    }
  }

  async function sendMessage(query: string) {
    if (!query.trim() || sending.value) return
    if (!currentConversation.value) await createConversation()

    const conversation = currentConversation.value!
    conversation.knowledgeBaseIds = [...activeKnowledgeBaseIds.value]
    conversation.retrievalStrategy = retrievalStrategy.value
    const userMessage: ChatMessage = {
      id: `local-${Date.now()}-user`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    }
    conversation.messages.push(userMessage)
    if (conversation.messages.length === 1) {
      conversation.title = query.length > 40 ? `${query.slice(0, 40)}…` : query
    }

    if (useMockData()) {
      await runMockTurn(query)
      return
    }
    const request = requestBody(query, conversation.id)
    await runStream(callbacks => streamMessage(request, callbacks))
  }

  async function regenerateLastMessage() {
    if (sending.value) return
    const conversation = currentConversation.value
    if (!conversation) return
    const index = findLastAssistantIndex(conversation)
    if (index < 0) return
    const message = conversation.messages[index]
    if (message) await regenerateMessage(message.id)
  }

  async function regenerateMessage(messageId: string) {
    if (sending.value) return
    const conversation = currentConversation.value
    if (!conversation) return
    const index = conversation.messages.findIndex(message => message.id === messageId && message.role === 'assistant')
    if (index < 0) return
    const previous = conversation.messages[index]
    if (!previous) return
    const failed = previous.status === 'FAILED' || previous.status === 'CANCELLED'
    await runStream(callbacks => failed
      ? streamRetry(previous.id, callbacks)
      : streamRegenerate(previous.id, callbacks))
  }

  function cancelGeneration() {
    if (!sending.value) return
    cancelRequested = true
    activeRequest.value?.abort()
    const message = findStreamingMessage()
    if (message) {
      message.isStreaming = false
      message.status = 'CANCELLED'
      if (!message.content) message.content = '回答生成已取消。'
    }
    thinking.value = false
    streamStage.value = null
  }

  async function runMockTurn(query: string) {
    const conversation = currentConversation.value!
    sending.value = true
    thinking.value = true
    try {
      const response = await sendMsgApi(requestBody(query, conversation.id))
      conversation.messages.push({ ...response, isStreaming: false })
      conversation.updatedAt = new Date().toISOString()
    } catch (error: any) {
      ElMessage.error(error?.message || '发送失败，请重试')
    } finally {
      sending.value = false
      thinking.value = false
    }
  }

  async function runStream(start: StreamStarter) {
    const conversation = currentConversation.value!
    const temporaryId = `local-${Date.now()}-assistant`
    const assistantMessage: ChatMessage = {
      id: temporaryId,
      role: 'assistant',
      content: '',
      citations: [],
      timestamp: new Date().toISOString(),
      isStreaming: true,
      status: 'RUNNING',
    }
    conversation.messages.push(assistantMessage)
    cancelRequested = false
    streamingMessageId.value = temporaryId
    sending.value = true
    thinking.value = true
    streamStage.value = '正在检索知识库'

    try {
      await consumeStream(start)
      conversation.updatedAt = new Date().toISOString()
      if (!cancelRequested && currentConversation.value?.id === conversation.id) {
        currentConversation.value = await getConversation(conversation.id)
        activeKnowledgeBaseIds.value = [...currentConversation.value.knowledgeBaseIds]
      }
      if (!cancelRequested) await loadConversations()
    } catch (error: any) {
      const message = findStreamingMessage() ?? assistantMessage
      message.isStreaming = false
      message.status = 'FAILED'
      if (!message.content) message.content = '抱歉，回答生成失败。请稍后重试。'
      message.answerStatus = 'INSUFFICIENT'
      ElMessage.error(error?.message || '发送失败，请重试')
    } finally {
      activeRequest.value = null
      streamingMessageId.value = null
      sending.value = false
      thinking.value = false
      streamStage.value = null
    }
  }

  function consumeStream(start: StreamStarter): Promise<void> {
    return new Promise((resolve, reject) => {
      let terminal = false
      const finish = (callback: () => void) => {
        if (terminal) return
        terminal = true
        callback()
      }
      activeRequest.value = start({
        onEvent: event => handleEvent(event, () => finish(resolve), error => finish(() => reject(error))),
        onDone: () => finish(resolve),
        onAbort: () => finish(resolve),
        onError: error => finish(() => reject(error)),
      })
    })
  }

  function handleEvent(event: SSEEvent, done: () => void, fail: (error: Error) => void) {
    const message = findStreamingMessage()
    switch (event.type) {
      case 'message.start':
        if (message) {
          message.id = event.data.messageId
          streamingMessageId.value = event.data.messageId
        }
        if (currentConversation.value) currentConversation.value.id = event.data.conversationId
        break
      case 'retrieval.started':
        streamStage.value = '正在检索知识库'
        break
      case 'retrieval.completed':
        streamStage.value = '检索完成，正在重排'
        break
      case 'rerank.completed':
        streamStage.value = '重排完成，正在生成回答'
        break
      case 'generation.started':
        streamStage.value = '正在生成可信回答'
        break
      case 'citation.completed':
        streamStage.value = '正在校验引用'
        break
      case 'answer.delta':
        thinking.value = false
        streamStage.value = '正在生成回答'
        if (message) message.content += event.data.content
        break
      case 'citation.add':
        if (message && !message.citations?.some(item => item.sourceId === event.data.sourceId)) {
          message.citations = [...(message.citations ?? []), {
            sourceId: event.data.sourceId,
            documentId: event.data.documentId,
            title: event.data.title,
            version: event.data.version,
            effectiveDate: event.data.effectiveDate || null,
            sectionPath: event.data.sectionPath,
            pageNumber: event.data.pageNumber || null,
            quote: event.data.quote,
            securityLevel: event.data.securityLevel,
            score: event.data.score,
          }]
        }
        break
      case 'retrieval.summary':
        if (message) message.retrievalStats = event.data
        break
      case 'answer.status':
        if (message) message.answerStatus = event.data.status
        break
      case 'usage':
        break
      case 'message.done':
        if (message) {
          message.isStreaming = false
          message.status = 'COMPLETED'
          message.traceId = event.data.traceId
        }
        done()
        break
      case 'message.cancelled':
        if (message) {
          message.isStreaming = false
          message.status = 'CANCELLED'
          if (!message.content) message.content = '回答生成已取消。'
        }
        done()
        break
      case 'message.error':
        if (message) {
          message.isStreaming = false
          message.status = 'FAILED'
          message.errorCode = event.data.code
          message.errorMessage = event.data.message
        }
        fail(new Error(event.data.message))
        break
    }
  }

  function requestBody(query: string, conversationId: string): SendMessageRequest {
    return {
      query,
      requestId: createRequestId(),
      conversationId,
      knowledgeBaseIds: [...activeKnowledgeBaseIds.value],
      strategy: {
        dense: retrievalStrategy.value !== 'sparse',
        sparse: retrievalStrategy.value !== 'dense',
        rerank: true,
      },
    }
  }

  function createRequestId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `${Date.now()}_${Math.random().toString(36).slice(2, 14)}`
  }

  function findStreamingMessage(): ChatMessage | undefined {
    const conversation = currentConversation.value
    if (!conversation || !streamingMessageId.value) return undefined
    return conversation.messages.find(message => message.id === streamingMessageId.value)
  }

  function findLastAssistantIndex(conversation: Conversation): number {
    for (let index = conversation.messages.length - 1; index >= 0; index--) {
      if (conversation.messages[index]?.role === 'assistant') return index
    }
    return -1
  }

  function appendDelta(messageId: string, delta: string) {
    const message = currentConversation.value?.messages.find(item => item.id === messageId)
    if (message) message.content += delta
  }

  function selectCitation(citation: Citation | null) {
    selectedCitation.value = citation
  }

  function setActiveKnowledgeBases(ids: string[]) {
    activeKnowledgeBaseIds.value = ids
  }

  function setRetrievalStrategy(strategy: string) {
    if (strategy === 'hybrid' || strategy === 'dense' || strategy === 'sparse') {
      retrievalStrategy.value = strategy
    }
  }

  function resetCurrentConversation() {
    startNewConversation()
  }

  return {
    conversations,
    currentConversation,
    conversationsLoading,
    sending,
    thinking,
    streamStage,
    selectedCitation,
    activeKnowledgeBaseIds,
    retrievalStrategy,
    hasActiveConversation,
    messages,
    loadConversations,
    loadConversation,
    createConversation,
    startNewConversation,
    deleteConversation,
    sendMessage,
    regenerateLastMessage,
    regenerateMessage,
    cancelGeneration,
    appendDelta,
    selectCitation,
    setActiveKnowledgeBases,
    setRetrievalStrategy,
    resetCurrentConversation,
  }
})
