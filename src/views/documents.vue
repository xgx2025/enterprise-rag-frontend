<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { usePagination } from '@/composables/usePagination'
import { ErrorBlock, EmptyState } from '@/components/common'
import { DOCUMENT_STATUS_OPTIONS, DEPARTMENTS } from '@/api/types'
import type { DocumentQueryParams, DocumentItem } from '@/api/types'
import { Upload, Search, FolderOpened } from '@element-plus/icons-vue'
import DocumentTable from '@/components/documents/DocumentTable.vue'
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog.vue'
import DocumentChunkViewer from '@/components/documents/DocumentChunkViewer.vue'

const kbStore = useKnowledgeBaseStore()
const pagination = usePagination(10)

const filters = ref<DocumentQueryParams>({
  status: undefined,
  department: undefined,
  knowledgeBaseId: undefined,
  keyword: undefined,
})

const uploadVisible = ref(false)
const chunkDoc = ref<DocumentItem | null>(null)
const chunkVisible = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function loadDocuments() {
  await kbStore.fetchDocuments({
    ...filters.value,
    page: pagination.state.page,
    pageSize: pagination.state.pageSize,
  })
  pagination.setTotal(kbStore.docTotal)
}

function onFilterChange() {
  pagination.reset()
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadDocuments(), 300)
}

watch(
  () => [filters.value.status, filters.value.department, filters.value.knowledgeBaseId, filters.value.keyword],
  onFilterChange
)

watch(() => pagination.state.page, loadDocuments)
watch(() => pagination.state.pageSize, loadDocuments)

function onUploaded() { loadDocuments() }
function viewChunks(doc: DocumentItem) {
  chunkDoc.value = doc
  chunkVisible.value = true
}

onMounted(async () => {
  await kbStore.fetchKnowledgeBases()
  await loadDocuments()
})

const activeFilterCount = ref(0)
watch(
  () => [filters.value.status, filters.value.department, filters.value.knowledgeBaseId, filters.value.keyword],
  (vals) => { activeFilterCount.value = vals.filter(Boolean).length }
)
</script>

<template>
  <div class="documents-page">
    <!-- Page header -->
    <div class="page-hero">
      <div class="hero-info">
        <h2 class="hero-title">文档管理</h2>
        <p class="hero-sub">管理企业知识库文档，支持 PDF、DOCX、Markdown 等多种格式</p>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-num">{{ kbStore.docTotal }}</span>
          <span class="stat-label">文档总数</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ kbStore.activeKBCount }}</span>
          <span class="stat-label">知识库</span>
        </div>
      </div>
    </div>

    <!-- Toolbar card -->
    <div class="toolbar-card">
      <div class="toolbar-main">
        <el-button type="primary" size="large" class="upload-btn" @click="uploadVisible = true">
          <el-icon><Upload /></el-icon>
          上传文档
        </el-button>

        <div class="filter-group">
          <el-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            size="default"
            style="width: 120px"
          >
            <el-option v-for="opt in DOCUMENT_STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-select
            v-model="filters.department"
            placeholder="全部部门"
            clearable
            size="default"
            style="width: 120px"
          >
            <el-option v-for="d in DEPARTMENTS" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
          <el-select
            v-model="filters.knowledgeBaseId"
            placeholder="全部知识库"
            clearable
            size="default"
            style="width: 150px"
          >
            <el-option v-for="kb in kbStore.knowledgeBases" :key="kb.id" :label="kb.name" :value="kb.id" />
          </el-select>
        </div>

        <el-input
          v-model="filters.keyword"
          placeholder="搜索文件名称..."
          clearable
          size="default"
          style="width: 220px"
          :prefix-icon="Search"
          class="search-input"
        />
      </div>

      <div v-if="activeFilterCount > 0" class="toolbar-active-filters">
        <span class="filter-badge">
          已应用 {{ activeFilterCount }} 个筛选
          <button class="filter-clear" @click="filters.status = undefined; filters.department = undefined; filters.knowledgeBaseId = undefined; filters.keyword = undefined">清除全部</button>
        </span>
      </div>
    </div>

    <!-- Error -->
    <ErrorBlock v-if="kbStore.docError" :message="kbStore.docError" @retry="loadDocuments" />

    <!-- Empty -->
    <div v-else-if="!kbStore.docLoading && kbStore.documents.length === 0 && !filters.keyword && !filters.status" class="empty-wrapper">
      <div class="empty-card">
        <FolderOpened class="empty-icon" />
        <h3>开始构建知识库</h3>
        <p>上传企业制度、流程规范等 PDF/DOCX 文档，系统将自动解析、分块并向量化</p>
        <el-button type="primary" @click="uploadVisible = true">
          <el-icon><Upload /></el-icon>
          上传第一份文档
        </el-button>
      </div>
    </div>

    <!-- Empty search -->
    <EmptyState
      v-else-if="!kbStore.docLoading && kbStore.documents.length === 0"
      title="未找到匹配文档"
      description="尝试调整筛选条件或搜索关键词"
      @action="filters.status = undefined; filters.department = undefined; filters.knowledgeBaseId = undefined; filters.keyword = undefined"
      action-label="清除筛选"
    />

    <!-- Table -->
    <template v-else>
      <div class="table-card">
        <DocumentTable
          :documents="kbStore.documents"
          :loading="kbStore.docLoading"
          @view-chunks="viewChunks"
          @refresh="loadDocuments"
        />
      </div>

      <div class="pagination-wrap" v-if="kbStore.docTotal > 0">
        <el-pagination
          v-model:current-page="pagination.state.page"
          v-model:page-size="pagination.state.pageSize"
          :total="kbStore.docTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </template>

    <!-- Dialogs -->
    <DocumentUploadDialog v-model:visible="uploadVisible" @uploaded="onUploaded" />
    <DocumentChunkViewer
      v-model:visible="chunkVisible"
      :document-id="chunkDoc?.id ?? null"
      :document-title="chunkDoc?.title ?? ''"
    />
  </div>
</template>

<style scoped>
.documents-page {
  padding: 24px 28px;
  min-height: 100%;
  max-width: 1500px;
}

/* Hero */
.page-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.hero-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 750;
  color: #111827;
  letter-spacing: -0.01em;
}

.hero-sub {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.hero-stats {
  display: flex;
  gap: 24px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-num {
  font-size: 24px;
  font-weight: 750;
  color: #111827;
  font-family: var(--font-mono, monospace);
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* Toolbar card */
.toolbar-card {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.toolbar-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-btn {
  border-radius: 10px;
  font-weight: 600;
  padding: 10px 20px;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: #f9fafb;
}

.toolbar-active-filters {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.filter-badge {
  font-size: 12.5px;
  color: #6b7280;
}

.filter-clear {
  border: none;
  background: none;
  color: #6366f1;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 500;
  padding: 0 4px;
}

.filter-clear:hover {
  text-decoration: underline;
}

/* Empty card */
.empty-wrapper {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.empty-card {
  text-align: center;
  max-width: 400px;
}

.empty-card .empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 650;
  color: #111827;
}

.empty-card p {
  margin: 0 0 20px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

/* Table card */
.table-card {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
