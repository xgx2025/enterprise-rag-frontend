import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLatestResults, runEvaluation as runEvalApi, getRunResult } from '@/api/evaluation'
import type { EvalRunResult } from '@/api/types'
import { ElMessage } from 'element-plus'

export const useEvaluationStore = defineStore('evaluation', () => {
  const result = ref<EvalRunResult | null>(null)
  const loading = ref(false)
  const isRunning = ref(false)
  const error = ref<string | null>(null)

  async function fetchLatestResults() {
    loading.value = true
    error.value = null
    try {
      result.value = await getLatestResults()
    } catch (e: any) {
      error.value = e?.message || '加载评测结果失败'
    } finally {
      loading.value = false
    }
  }

  async function runEvaluation(datasetIds: string[] = []) {
    isRunning.value = true
    error.value = null
    try {
      const { runId } = await runEvalApi(datasetIds)
      ElMessage.success('评测已启动')
      // Poll for results
      await pollForResult(runId)
    } catch (e: any) {
      error.value = e?.message || '运行评测失败'
      ElMessage.error(error.value || '操作失败')
    } finally {
      isRunning.value = false
    }
  }

  async function pollForResult(runId: string, maxRetries = 15, intervalMs = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs))
      try {
        const res = await getRunResult(runId)
        if (res.status === 'completed' || res.status === 'failed') {
          result.value = res
          return
        }
      } catch {
        // continue polling
      }
    }
    // Timeout — fetch latest
    await fetchLatestResults()
  }

  function clearResult() {
    result.value = null
    error.value = null
  }

  return {
    result,
    loading,
    isRunning,
    error,
    fetchLatestResults,
    runEvaluation,
    clearResult,
  }
})
