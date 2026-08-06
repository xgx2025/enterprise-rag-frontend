import { defineStore } from 'pinia'
import { ref } from 'vue'
import { runDebugRetrieval, getDebugTrace } from '@/api/debug'
import type { DebugResult } from '@/api/types'
import { ElMessage } from 'element-plus'

export const useDebugStore = defineStore('debug', () => {
  const result = ref<DebugResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function runDebug(query: string, strategy?: {
    dense?: boolean
    sparse?: boolean
    rrf?: boolean
    rerank?: boolean
  }) {
    if (!query.trim()) return

    loading.value = true
    error.value = null

    try {
      result.value = await runDebugRetrieval(query, strategy)
    } catch (e: any) {
      error.value = e?.message || '检索调试失败'
      ElMessage.error(error.value || '操作失败')
    } finally {
      loading.value = false
    }
  }

  async function loadTrace(traceId: string) {
    loading.value = true
    try {
      result.value = await getDebugTrace(traceId)
    } finally {
      loading.value = false
    }
  }

  function clearResult() {
    result.value = null
    error.value = null
  }

  return {
    result,
    loading,
    error,
    runDebug,
    loadTrace,
    clearResult,
  }
})
