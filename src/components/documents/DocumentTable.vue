<script setup lang="ts">
import type { DocumentItem } from '@/api/types'
import StatusTag from '@/components/common/StatusTag.vue'
import { showConfirm } from '@/components/common'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { ElMessage } from 'element-plus'
import { View, Link, RefreshRight } from '@element-plus/icons-vue'

// 文件类型图标：按小写扩展名映射，缺失时回退到 default.svg
const iconModules = import.meta.glob('@/assets/icons/filetypes/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const iconMap: Record<string, string> = {}
for (const path in iconModules) {
  const url = iconModules[path]
  if (!url) continue
  const name = path.split('/').pop()!.replace(/\.svg$/, '').toLowerCase()
  iconMap[name] = url
}

// 已知别名归一：mock 数据用 'Markdown'，上传按后缀大写得到 'MD'
const fileTypeAliases: Record<string, string> = {
  md: 'markdown',
  doc: 'docx',
  xls: 'xlsx',
  ppt: 'pptx',
}

function fileIconUrl(fileType?: string): string {
  const key = (fileType || '').toLowerCase().trim()
  const resolved = fileTypeAliases[key] ?? key
  return iconMap[resolved] ?? iconMap['default'] ?? ''
}

const props = defineProps<{
  documents: DocumentItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  'preview': [doc: DocumentItem]
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
    message: `确定归档文档「${doc.title}」吗？归档后列表中不再显示，OSS 原文件暂时保留。`,
    title: '归档确认',
    type: 'danger',
  })
  if (confirmed) {
    try {
      await kbStore.deleteDocument(doc.id)
      ElMessage.success('文档已归档')
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
      await kbStore.updateDocumentStatus(doc.id, newStatus)
      ElMessage.success(`${action}成功`)
      emit('refresh')
    } catch (e: any) {
      ElMessage.error(e?.message || `${action}失败`)
    }
  }
}

async function handleRetry(doc: DocumentItem) {
  try {
    await kbStore.retryDocument(doc.id)
    ElMessage.success('已重新提交解析任务')
    emit('refresh')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '重试失败')
  }
}

function handlePreview(doc: DocumentItem) {
  emit('preview', doc)
}

function formatFileSize(size?: number): string {
  if (!size) return ''
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
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
          <img :src="fileIconUrl(row.fileType)" class="doc-type-icon" :alt="row.fileType" />
          <span class="doc-title">{{ row.title }}</span>
          <span class="doc-version">{{ row.version }} · {{ row.fileType }}<template v-if="row.fileSize"> · {{ formatFileSize(row.fileSize) }}</template></span>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="status" label="状态" width="90">
      <template #default="{ row }">
        <StatusTag :status="row.status" />
        <el-progress
          v-if="row.status === 'PROCESSING'"
          :percentage="row.processProgress || 0"
          :stroke-width="3"
          :show-text="false"
          style="margin-top: 5px"
        />
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

    <el-table-column prop="chunkCount" label="分块数" width="100" align="center" sortable />

    <el-table-column label="解析状态" width="90">
      <template #default="{ row }">
        <el-tag
          :type="row.parseStatus === 'COMPLETED' ? 'success' : row.parseStatus === 'FAILED' ? 'danger' : row.parseStatus === 'PENDING' ? 'info' : 'warning'"
          size="small"
        >
          {{ row.parseStatus === 'COMPLETED' ? '已完成' : row.parseStatus === 'FAILED' ? '失败' : row.parseStatus === 'PENDING' ? '待处理' : '处理中' }}
        </el-tag>
        <el-tooltip
          v-if="row.failureMessage && row.failureStage === 'PARSE_AND_CHUNK'"
          :content="row.failureMessage"
          placement="top"
        >
          <span class="failure-dot">!</span>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column label="向量化" width="90">
      <template #default="{ row }">
        <el-tag
          :type="row.embeddingStatus === 'COMPLETED' ? 'success' : row.embeddingStatus === 'FAILED' ? 'danger' : row.embeddingStatus === 'PENDING' ? 'info' : 'warning'"
          size="small"
        >
          {{ row.embeddingStatus === 'COMPLETED' ? '已完成' : row.embeddingStatus === 'FAILED' ? '失败' : row.embeddingStatus === 'PENDING' ? '待处理' : '处理中' }}
        </el-tag>
        <el-tooltip
          v-if="row.failureMessage && row.failureStage === 'EMBEDDING'"
          :content="row.failureMessage"
          placement="top"
        >
          <span class="failure-dot">!</span>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column prop="updatedAt" label="更新时间" width="170" sortable>
      <template #default="{ row }">
        {{ new Date(row.updatedAt).toLocaleString('zh-CN') }}
      </template>
    </el-table-column>

    <el-table-column label="操作" width="260" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link size="small" @click="handlePreview(row)">
          <el-icon><Link /></el-icon>原文
        </el-button>
        <el-button
          type="primary"
          link
          size="small"
          :disabled="row.chunkCount === 0"
          @click="emit('view-chunks', row)"
        >
          <el-icon><View /></el-icon>
          查看分块
        </el-button>
        <el-button
          v-if="row.status === 'READY' || row.status === 'ACTIVE' || row.status === 'EXPIRED'"
          type="warning"
          link
          size="small"
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 'ACTIVE' ? '停用' : '启用' }}
        </el-button>
        <el-button v-if="row.status === 'FAILED'" type="warning" link size="small" @click="handleRetry(row)">
          <el-icon><RefreshRight /></el-icon>重试
        </el-button>
        <el-button
          type="danger"
          link
          size="small"
          :disabled="row.status === 'ACTIVE'"
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

.doc-type-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

.doc-title {
  font-weight: 500;
  color: var(--color-text-primary, #111827);
}

.doc-version {
  font-size: 12px;
  color: var(--color-primary, #6366f1);
  background: var(--color-primary-bg, #eef2ff);
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.failure-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  border-radius: 50%;
  background: var(--color-danger-bg, #fee2e2);
  color: #dc2626;
  font-size: 11px;
  cursor: help;
}

:deep(.el-table th.el-table__cell) {
  background: var(--color-bg-subtle, #f9fafb);
  color: var(--color-text-secondary, #374151);
  font-weight: 600;
  font-size: 13px;
}

:deep(.el-table th.el-table__cell .cell) {
  white-space: nowrap;
}
</style>
