<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentItem } from '@/api/types'
import StatusTag from '@/components/common/StatusTag.vue'
import { showConfirm } from '@/components/common'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { ElMessage } from 'element-plus'
import { View } from '@element-plus/icons-vue'

const props = defineProps<{
  documents: DocumentItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  'view-chunks': [doc: DocumentItem]
  'refresh': []
}>()

const kbStore = useKnowledgeBaseStore()

function getKnowledgeBaseName(kbId: string): string {
  return kbStore.knowledgeBases.find(kb => kb.id === kbId)?.name || kbId
}

function getSecurityLabel(level: number): string {
  const map: Record<number, string> = { 1: '公开', 2: '内部', 3: '机密' }
  return map[level] || '未知'
}

function getSecurityType(level: number): 'success' | 'warning' | 'danger' | '' {
  const map: Record<number, 'success' | 'warning' | 'danger' | ''> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return map[level] || ''
}

async function handleDelete(doc: DocumentItem) {
  const confirmed = await showConfirm({
    message: `确定删除文档「${doc.title}」吗？此操作不可撤销。`,
    title: '删除确认',
    type: 'danger',
  })
  if (confirmed) {
    try {
      await kbStore.deleteDocument(doc.id)
      ElMessage.success('删除成功')
      emit('refresh')
    } catch (e: any) {
      ElMessage.error(e?.message || '删除失败')
    }
  }
}

async function handleToggleStatus(doc: DocumentItem) {
  const newStatus = doc.status === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE'
  const action = newStatus === 'ACTIVE' ? '启用' : '停用'
  const confirmed = await showConfirm({
    message: `确定${action}文档「${doc.title}」吗？`,
    title: `${action}确认`,
    type: 'warning',
  })
  if (confirmed) {
    try {
      // await updateDocumentStatus(doc.id, newStatus)
      ElMessage.success(`${action}成功`)
      emit('refresh')
    } catch (e: any) {
      ElMessage.error(e?.message || `${action}失败`)
    }
  }
}
</script>

<template>
  <el-table
    :data="documents"
    v-loading="loading"
    stripe
    style="width: 100%"
    :default-sort="{ prop: 'updatedAt', order: 'descending' }"
    table-layout="auto"
  >
    <el-table-column prop="title" label="文件名称" min-width="180" show-overflow-tooltip>
      <template #default="{ row }">
        <div class="doc-title-cell">
          <span class="doc-title">{{ row.title }}</span>
          <span class="doc-version">{{ row.version }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="status" label="状态" width="90">
      <template #default="{ row }">
        <StatusTag :status="row.status" />
      </template>
    </el-table-column>

    <el-table-column label="知识库" width="120" show-overflow-tooltip>
      <template #default="{ row }">
        {{ getKnowledgeBaseName(row.knowledgeBaseId) }}
      </template>
    </el-table-column>

    <el-table-column prop="department" label="部门" width="100" />

    <el-table-column label="安全等级" width="90">
      <template #default="{ row }">
        <el-tag :type="getSecurityType(row.securityLevel) || undefined" size="small">
          {{ getSecurityLabel(row.securityLevel) }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="chunkCount" label="分块数" width="80" align="center" sortable />

    <el-table-column label="解析状态" width="90">
      <template #default="{ row }">
        <el-tag
          :type="row.parseStatus === 'COMPLETED' ? 'success' : row.parseStatus === 'FAILED' ? 'danger' : 'warning'"
          size="small"
        >
          {{ row.parseStatus === 'COMPLETED' ? '已完成' : row.parseStatus === 'FAILED' ? '失败' : '处理中' }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="向量化" width="90">
      <template #default="{ row }">
        <el-tag
          :type="row.embeddingStatus === 'COMPLETED' ? 'success' : row.embeddingStatus === 'PENDING' ? 'info' : 'warning'"
          size="small"
        >
          {{ row.embeddingStatus === 'COMPLETED' ? '已完成' : row.embeddingStatus === 'PENDING' ? '待处理' : '处理中' }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="updatedAt" label="更新时间" width="170" sortable>
      <template #default="{ row }">
        {{ new Date(row.updatedAt).toLocaleString('zh-CN') }}
      </template>
    </el-table-column>

    <el-table-column label="操作" width="180" fixed="right">
      <template #default="{ row }">
        <el-button
          type="primary"
          link
          size="small"
          @click="emit('view-chunks', row)"
        >
          <el-icon><View /></el-icon>
          查看分块
        </el-button>
        <el-button
          type="warning"
          link
          size="small"
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 'ACTIVE' ? '停用' : '启用' }}
        </el-button>
        <el-button
          type="danger"
          link
          size="small"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.doc-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-title {
  font-weight: 500;
  color: #111827;
}

.doc-version {
  font-size: 12px;
  color: #6366f1;
  background: #eef2ff;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

:deep(.el-table th.el-table__cell) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  font-size: 13px;
}
</style>
