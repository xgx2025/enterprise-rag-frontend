<script setup lang="ts">
import { watch } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { ElMessage } from 'element-plus'
import { Link } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  documentId: string | null
  documentTitle: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const kbStore = useKnowledgeBaseStore()

function chunkType(metadata: Record<string, unknown> | string): string {
  if (typeof metadata === 'string') {
    try { return String(JSON.parse(metadata).chunkType || 'CHILD') } catch { return 'CHILD' }
  }
  return String(metadata?.chunkType || 'CHILD')
}

async function previewOriginal() {
  if (!props.documentId) return
  try {
    await kbStore.openDocumentPreview(props.documentId)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '获取预览地址失败')
  }
}

watch(() => props.visible, (val) => {
  if (val && props.documentId) {
    kbStore.fetchChunks(props.documentId)
  } else {
    kbStore.clearChunks()
  }
})
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="文档分块详情"
    size="520px"
    @update:model-value="emit('update:visible', $event)"
  >
    <template #header>
      <div class="drawer-header">
        <div>
          <span class="drawer-title">文档分块详情</span>
          <span class="drawer-subtitle">{{ documentTitle }}</span>
        </div>
        <el-button link type="primary" @click="previewOriginal"><el-icon><Link /></el-icon>查看原文</el-button>
      </div>
    </template>

    <div v-loading="kbStore.chunksLoading" class="chunk-list">
      <template v-if="kbStore.chunks.length === 0 && !kbStore.chunksLoading">
        <div class="empty-chunks">暂无分块数据</div>
      </template>

      <div
        v-for="chunk in kbStore.chunks"
        :key="chunk.id"
        class="chunk-card"
      >
        <div class="chunk-header">
          <span class="chunk-index">#{{ chunk.chunkIndex + 1 }}</span>
          <el-tag :type="chunkType(chunk.metadataJson) === 'PARENT' ? 'warning' : 'info'" size="small">
            {{ chunkType(chunk.metadataJson) === 'PARENT' ? '父块' : '子块' }}
          </el-tag>
          <span class="chunk-section">{{ chunk.sectionPath }}</span>
          <span v-if="chunk.pageNumber" class="chunk-page">第{{ chunk.pageNumber }}页</span>
          <el-tag
            :type="chunk.embeddingStatus === 'COMPLETED' ? 'success' : 'info'"
            size="small"
            class="chunk-status"
          >
            {{ chunk.embeddingStatus === 'COMPLETED' ? '已向量化' : '待处理' }}
          </el-tag>
        </div>
        <div class="chunk-content">{{ chunk.content }}</div>
        <div class="chunk-meta">
          <span>Token 数: {{ chunk.tokenCount }}</span>
          <span v-if="chunk.parentChunkId">父块: {{ chunk.parentChunkId }}</span>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.drawer-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
}

.drawer-subtitle {
  font-size: 13px;
  color: #6b7280;
}

.chunk-list {
  padding: 0 4px;
}

.empty-chunks {
  text-align: center;
  color: #9ca3af;
  padding: 60px 0;
}

.chunk-card {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.chunk-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.chunk-index {
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.chunk-section {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.chunk-page {
  font-size: 12px;
  color: #9ca3af;
  margin-left: auto;
}

.chunk-status {
  margin-left: 0;
}

.chunk-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}

.chunk-meta {
  margin-top: 10px;
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
