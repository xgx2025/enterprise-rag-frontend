import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getKnowledgeBases,
  createKnowledgeBase as createKbApi,
  updateKnowledgeBase as updateKbApi,
  updateKnowledgeBaseStatus as updateKbStatusApi,
} from '@/api/knowledgeBase'
import {
  getDocuments,
  getDocumentChunks,
  deleteDocument as deleteDocApi,
  uploadDocument as uploadDocApi,
  updateDocumentStatus as updateDocStatusApi,
  retryDocument as retryDocApi,
  getDocumentPreviewUrl,
} from '@/api/document'
import type { KnowledgeBase, KnowledgeBasePayload, DocumentItem, DocumentQueryParams, ChunkItem } from '@/api/types'

export const useKnowledgeBaseStore = defineStore('knowledgeBase', () => {
  // ---- Knowledge Bases ----
  const knowledgeBases = ref<KnowledgeBase[]>([])
  const kbLoading = ref(false)
  const kbError = ref<string | null>(null)

  async function fetchKnowledgeBases(force = false, includeDisabled = false) {
    if (!force && knowledgeBases.value.length > 0 && !includeDisabled) return
    kbLoading.value = true
    kbError.value = null
    try {
      knowledgeBases.value = await getKnowledgeBases(includeDisabled)
    } catch (e: any) {
      kbError.value = e?.response?.data?.message || e?.message || '加载知识库失败'
      throw e
    } finally {
      kbLoading.value = false
    }
  }

  async function createKnowledgeBase(data: KnowledgeBasePayload) {
    await createKbApi(data)
    await fetchKnowledgeBases(true, true)
  }

  async function updateKnowledgeBase(id: string, data: KnowledgeBasePayload) {
    await updateKbApi(id, data)
    await fetchKnowledgeBases(true, true)
  }

  async function updateKnowledgeBaseStatus(id: string, status: 'ACTIVE' | 'DISABLED') {
    await updateKbStatusApi(id, status)
    await fetchKnowledgeBases(true, true)
  }

  // ---- Documents ----
  const documents = ref<DocumentItem[]>([])
  const docTotal = ref(0)
  const docLoading = ref(false)
  const docError = ref<string | null>(null)

  async function fetchDocuments(params: DocumentQueryParams = {}) {
    docLoading.value = true
    docError.value = null
    try {
      const result = await getDocuments(params)
      documents.value = result.items
      docTotal.value = result.total
    } catch (e: any) {
      docError.value = e?.message || '加载文档列表失败'
      documents.value = []
    } finally {
      docLoading.value = false
    }
  }

  async function uploadDocument(formData: FormData): Promise<DocumentItem | null> {
    try {
      const doc = await uploadDocApi(formData)
      return doc
    } catch (e: any) {
      throw e
    }
  }

  async function deleteDocument(id: string): Promise<void> {
    await deleteDocApi(id)
  }

  async function updateDocumentStatus(id: string, status: 'ACTIVE' | 'EXPIRED'): Promise<void> {
    await updateDocStatusApi(id, status)
  }

  async function retryDocument(id: string): Promise<void> {
    await retryDocApi(id)
  }

  async function openDocumentPreview(id: string): Promise<void> {
    const result = await getDocumentPreviewUrl(id)
    window.open(result.url, '_blank', 'noopener,noreferrer')
  }

  // ---- Chunks ----
  const chunks = ref<ChunkItem[]>([])
  const chunksLoading = ref(false)

  async function fetchChunks(documentId: string) {
    chunksLoading.value = true
    try {
      chunks.value = await getDocumentChunks(documentId)
    } finally {
      chunksLoading.value = false
    }
  }

  function clearChunks() {
    chunks.value = []
  }

  // ---- Getters ----
  const activeKnowledgeBases = computed(() => knowledgeBases.value.filter(kb => kb.status !== 'DISABLED'))
  const activeKBCount = computed(() => activeKnowledgeBases.value.length)

  return {
    knowledgeBases,
    kbLoading,
    kbError,
    fetchKnowledgeBases,
    createKnowledgeBase,
    updateKnowledgeBase,
    updateKnowledgeBaseStatus,
    documents,
    docTotal,
    docLoading,
    docError,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    updateDocumentStatus,
    retryDocument,
    openDocumentPreview,
    chunks,
    chunksLoading,
    fetchChunks,
    clearChunks,
    activeKBCount,
    activeKnowledgeBases,
  }
})
