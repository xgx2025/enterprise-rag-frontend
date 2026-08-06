<script setup lang="ts">
import type { DocumentStatus } from '@/api/types'

defineProps<{
  status: DocumentStatus
}>()

const statusConfig: Record<DocumentStatus, { text: string; type: '' | 'success' | 'warning' | 'info' | 'danger' }> = {
  DRAFT: { text: '草稿', type: 'info' },
  PROCESSING: { text: '处理中', type: 'warning' },
  ACTIVE: { text: '已生效', type: 'success' },
  EXPIRED: { text: '已失效', type: 'info' },
  FAILED: { text: '失败', type: 'danger' },
}
</script>

<template>
  <el-tag
    :type="statusConfig[status].type"
    size="small"
    :disable-transitions="false"
  >
    {{ statusConfig[status].text }}
  </el-tag>
</template>
