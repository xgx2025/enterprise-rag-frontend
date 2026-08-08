<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { usePagination } from '@/composables/usePagination'
import { ErrorBlock, EmptyState } from '@/components/common'
import { DOCUMENT_STATUS_OPTIONS, DEPARTMENTS } from '@/api/types'
import type { DocumentQueryParams, DocumentItem } from '@/api/types'
import { Upload, Search, FolderOpened, Setting } from '@element-plus/icons-vue'
import DocumentTable from '@/components/documents/DocumentTable.vue'
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog.vue'
import DocumentChunkViewer from '@/components/documents/DocumentChunkViewer.vue'
import KnowledgeBaseManager from '@/components/documents/KnowledgeBaseManager.vue'

const kbStore = useKnowledgeBaseStore()
const pagination = usePagination(10)

const filters = ref<DocumentQueryParams>({
  status: undefined,
  department: undefined,
  knowledgeBaseId: undefined,
  keyword: undefined,
})

const uploadVisible = ref(false)
const kbManagerVisible = ref(false)
const chunkDoc = ref<DocumentItem | null>(null)
const chunkVisible = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let pollingTimer: ReturnType<typeof setInterval> | null = null

async function loadDocuments() {
  await kbStore.fetchDocuments({
    ...filters.value,
    page: pagination.state.page,
    pageSize: pagination.state.pageSize,
  })
  pagination.setTotal(kbStore.docTotal)
  syncPolling()
}

function syncPolling() {
  const hasProcessing = kbStore.documents.some(doc => doc.status === 'PROCESSING')
  if (hasProcessing && !pollingTimer) {
    pollingTimer = setInterval(() => loadDocuments(), 3000)
  } else if (!hasProcessing && pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
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
async function onKnowledgeBasesChanged() {
  await loadDocuments()
}
function viewChunks(doc: DocumentItem) {
  chunkDoc.value = doc
  chunkVisible.value = true
}

onMounted(async () => {
  await kbStore.fetchKnowledgeBases()
  await loadDocuments()
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (pollingTimer) clearInterval(pollingTimer)
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
        <el-button size="large" @click="kbManagerVisible = true">
          <el-icon><Setting /></el-icon>
          管理知识库
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
            <el-option v-for="kb in kbStore.activeKnowledgeBases" :key="kb.id" :label="kb.name" :value="kb.id" />
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

      <transition name="filter-bar">
        <div v-if="activeFilterCount > 0" class="toolbar-active-filters">
          <div class="filter-bar-inner">
            <span class="filter-badge">
              已应用 {{ activeFilterCount }} 个筛选
              <button class="filter-clear" @click="filters.status = undefined; filters.department = undefined; filters.knowledgeBaseId = undefined; filters.keyword = undefined">清除全部</button>
            </span>
          </div>
        </div>
      </transition>
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
    <KnowledgeBaseManager v-model:visible="kbManagerVisible" @changed="onKnowledgeBasesChanged" />
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
  margin: 0 auto;
}

/* ── Hero ── */
.page-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* ── Toolbar ── */
.toolbar-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 18px;
}

.toolbar-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Push the search input to the right edge */
.toolbar-main .search-input {
  margin-left: auto;
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
  /* Grid-row accordion so the bar grows/shrinks smoothly; the border +
     padding live on the inner and are clipped while collapsed. */
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
}

.filter-bar-inner {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
  min-height: 0;
}

.filter-bar-enter-active,
.filter-bar-leave-active {
  transition: grid-template-rows 220ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
              opacity 180ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

.filter-bar-enter-from,
.filter-bar-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .filter-bar-enter-active,
  .filter-bar-leave-active {
    transition: none;
  }
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

/* ── Empty state ── */
.empty-wrapper {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.empty-card {
  text-align: center;
  max-width: 420px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 48px 32px;
  transform-origin: center;
  animation: empty-fade 350ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) backwards;
}

/* Use :deep() so scoped styles penetrate the icon component */
.empty-card :deep(.empty-icon) {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
  animation: empty-fade-up 450ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) backwards;
  animation-delay: 60ms;
}

.empty-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 650;
  color: #111827;
  animation: empty-fade-up 400ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) backwards;
  animation-delay: 130ms;
}

.empty-card p {
  margin: 0 0 20px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  animation: empty-fade-up 400ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) backwards;
  animation-delay: 200ms;
}

.empty-card :deep(.el-button) {
  animation: empty-fade-up 400ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) backwards;
  animation-delay: 270ms;
}

/* First-run empty state: a rare, high-emotion moment, so a gentle staggered
   entrance earns its place (the delight budget). */
@keyframes empty-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes empty-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .empty-card,
  .empty-card :deep(.empty-icon),
  .empty-card h3,
  .empty-card p,
  .empty-card :deep(.el-button) {
    animation: none;
  }
}

/* ── Table & pagination ── */
.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
