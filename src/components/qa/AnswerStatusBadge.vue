<script setup lang="ts">
import type { AnswerStatus } from '@/api/types'

defineProps<{
  status: AnswerStatus
}>()

const config: Record<AnswerStatus, { text: string; type: 'success' | 'warning' | 'danger' }> = {
  SUPPORTED: { text: '证据充分', type: 'success' },
  PARTIAL: { text: '部分回答', type: 'warning' },
  INSUFFICIENT: { text: '证据不足', type: 'danger' },
}
</script>

<template>
  <el-tag
    :type="config[status].type"
    size="small"
    effect="plain"
    class="answer-badge"
  >
    {{ config[status].text }}
  </el-tag>
</template>

<style scoped>
.answer-badge {
  font-size: 12px;
  border-radius: 6px;
}
</style>
