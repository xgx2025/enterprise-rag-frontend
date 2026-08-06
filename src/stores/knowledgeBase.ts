import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getKnowledgeBases } from '@/api/knowledgeBase'
import { getDocuments, getDocumentChunks, deleteDocument as deleteDocApi, uploadDocument as uploadDocApi } from '@/api/document'
import type { KnowledgeBase, DocumentItem, DocumentQueryParams, ChunkItem } from '@/api/types'

export const useKnowledgeBaseStore = defineStore('knowledgeBase', () => {
  // ---- Knowledge Bases ----
  const knowledgeBases = ref<KnowledgeBase[]>([])
  const kbLoading = ref(false)

  async function fetchKnowledgeBases() {
    if (knowledgeBases.value.length > 0) return
    kbLoading.value = true
    try {
      knowledgeBases.value = await getKnowledgeBases()
    } finally {
      kbLoading.value = false
    }
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
  const activeKBCount = computed(() => knowledgeBases.value.filter(kb => kb.documentCount > 0).length)

  return {
    knowledgeBases,
    kbLoading,
    fetchKnowledgeBases,
    documents,
    docTotal,
    docLoading,
    docError,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    chunks,
    chunksLoading,
    fetchChunks,
    clearChunks,
    activeKBCount,
  }
})
