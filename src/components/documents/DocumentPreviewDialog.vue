<script setup lang="ts">
// ============================================================
// In-app document preview.
// Renders the OSS presigned original by file type:
//   - PDF     -> <iframe> (browser-native viewer)
//   - image   -> <img>
//   - md/txt  -> fetch text + renderMarkdown (raw iframe on CORS)
//   - office  -> fallback panel + "download original"
// Mock mode shows simulated content without any network call.
// ============================================================

import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Download, RefreshRight } from '@element-plus/icons-vue'
import { getDocumentPreviewUrl } from '@/api/document'
import { useMockData } from '@/composables/useMockData'
import { renderMarkdown } from '@/utils/markdown'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import type { DocumentItem } from '@/api/types'

const props = defineProps<{
  visible: boolean
  doc: DocumentItem | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const kbStore = useKnowledgeBaseStore()
const isMock = useMockData()

const loading = ref(false)
const error = ref('')
const previewUrl = ref('')
const mdHtml = ref('')
const mdFallback = ref(false) // fetch failed -> show raw text via iframe

const IMAGE_TYPES = ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG', 'BMP']
const MARKDOWN_TYPES = ['MD', 'MARKDOWN', 'TXT', 'TEXT']
const OFFICE_TYPES = ['DOCX', 'DOC', 'XLSX', 'XLS', 'PPTX', 'PPT']

const fileType = computed(() => (props.doc?.fileType || '').toUpperCase())

const kind = computed<'pdf' | 'image' | 'markdown' | 'office' | 'unknown'>(() => {
  const ft = fileType.value
  if (ft === 'PDF') return 'pdf'
  if (IMAGE_TYPES.includes(ft)) return 'image'
  if (MARKDOWN_TYPES.includes(ft)) return 'markdown'
  if (OFFICE_TYPES.includes(ft)) return 'office'
  return 'unknown'
})

const fileSizeText = computed(() => {
  const size = props.doc?.fileSize
  if (!size) return ''
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
})

// Simulated markdown body for mock mode.
const sampleMarkdown = computed(() => {
  const d = props.doc
  if (!d) return ''
  return `# ${d.title}

> 模拟预览：以下为 Markdown 渲染示例，连接后端后将加载并渲染文档原文件。

## 文档信息

| 字段 | 值 |
| --- | --- |
| 文件名 | \`${d.fileName}\` |
| 版本 | ${d.version} |
| 部门 | ${d.department} |
| 状态 | ${d.status} |
| 分块数 | ${d.chunkCount ?? 0} |

## 概述

本文档为 **${d.title}** 的模拟正文内容。系统已对该文档完成解析、分块与向量化，可通过「查看分块」检索具体段落。

## 要点

- 支持 **加粗**、*斜体*、\`行内代码\`
- 支持表格、有序 / 无序列表与引用块
- 支持 [链接](https://example.com) 与代码块高亮

\`\`\`json
{
  "documentId": "${d.id}",
  "status": "${d.status}",
  "chunkCount": ${d.chunkCount ?? 0}
}
\`\`\`
`
})

function reset() {
  loading.value = false
  error.value = ''
  previewUrl.value = ''
  mdHtml.value = ''
  mdFallback.value = false
}

async function load() {
  const doc = props.doc
  if (!doc) return
  reset()
  if (isMock) {
    if (kind.value === 'markdown') {
      mdHtml.value = renderMarkdown(sampleMarkdown.value)
    }
    return
  }
  loading.value = true
  try {
    const res = await getDocumentPreviewUrl(doc.id)
    previewUrl.value = res.url
    if (kind.value === 'markdown') {
      await loadMarkdown(res.url)
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '获取预览地址失败'
  } finally {
    loading.value = false
  }
}

async function loadMarkdown(url: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    mdHtml.value = renderMarkdown(await res.text())
  } catch {
    // Cross-origin bucket without CORS, or network error -> fall back to
    // an iframe that displays the raw text (browser handles the fetch).
    mdFallback.value = true
  }
}

function openOriginal() {
  const doc = props.doc
  if (!doc) return
  if (isMock) {
    ElMessage.info('Mock 模式不提供原文件下载')
    return
  }
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank', 'noopener,noreferrer')
    return
  }
  // No url yet (e.g. unsupported type failed to load) -> fetch a fresh one.
  kbStore.openDocumentPreview(doc.id).catch((e: any) => {
    ElMessage.error(e?.response?.data?.message || e?.message || '获取预览地址失败')
  })
}

watch(() => props.visible, (val) => {
  if (val) load()
  else reset()
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    width="86vw"
    top="4vh"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    class="doc-preview-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <template #header>
      <div class="preview-header">
        <div class="preview-title-wrap">
          <el-icon class="preview-title-icon"><Document /></el-icon>
          <div class="preview-title-text">
            <div class="preview-title">{{ doc?.title || '文档预览' }}</div>
            <div class="preview-sub">
              <span class="preview-filename">{{ doc?.fileName }}</span>
              <el-tag size="small" effect="plain">{{ fileType || '未知' }}</el-tag>
              <span v-if="fileSizeText">· {{ fileSizeText }}</span>
              <span v-if="doc?.version">· {{ doc.version }}</span>
            </div>
          </div>
        </div>
        <el-button type="primary" plain size="small" class="preview-open-btn" @click="openOriginal">
          <el-icon><Download /></el-icon>打开原文件
        </el-button>
      </div>
    </template>

    <div v-loading="loading" class="preview-body">
      <!-- Load error -->
      <div v-if="error" class="preview-state">
        <el-icon class="state-icon state-icon-error"><RefreshRight /></el-icon>
        <p class="state-title">预览加载失败</p>
        <p class="state-desc">{{ error }}</p>
        <el-button type="primary" @click="load">重试</el-button>
      </div>

      <!-- PDF: native iframe -->
      <iframe
        v-else-if="kind === 'pdf' && previewUrl"
        :src="previewUrl"
        class="preview-frame"
        title="文档预览"
      />

      <!-- PDF (mock) -->
      <div v-else-if="kind === 'pdf' && isMock" class="preview-state">
        <el-icon class="state-icon"><Document /></el-icon>
        <p class="state-title">PDF 模拟预览</p>
        <p class="state-desc">Mock 模式下不加载真实文件，连接后端后可在此内嵌查看 PDF 原文。</p>
      </div>

      <!-- Image -->
      <div v-else-if="kind === 'image'" class="preview-image-wrap">
        <img v-if="previewUrl" :src="previewUrl" class="preview-image" alt="文档预览" />
        <div v-else class="preview-state">
          <el-icon class="state-icon"><Document /></el-icon>
          <p class="state-title">图片模拟预览</p>
          <p class="state-desc">Mock 模式下不加载真实文件。</p>
        </div>
      </div>

      <!-- Markdown rendered -->
      <div
        v-else-if="kind === 'markdown' && mdHtml"
        class="preview-md md-content"
        v-html="mdHtml"
      />

      <!-- Markdown raw fallback (CORS) -->
      <div v-else-if="kind === 'markdown' && mdFallback" class="preview-raw-wrap">
        <p class="preview-raw-note">无法获取原文进行渲染，已切换为原始文本展示：</p>
        <iframe v-if="previewUrl" :src="previewUrl" class="preview-frame preview-frame-raw" title="原始文本" />
      </div>

      <!-- Office / unsupported -->
      <div v-else-if="kind === 'office' || kind === 'unknown'" class="preview-state">
        <el-icon class="state-icon"><Document /></el-icon>
        <p class="state-title">该格式暂不支持在线预览</p>
        <p class="state-desc">
          {{ fileType || '该' }} 文件无法在浏览器中直接渲染，请下载原文件查看。
        </p>
        <el-button v-if="!isMock" type="primary" @click="openOriginal">
          <el-icon><Download /></el-icon>下载原文件
        </el-button>
      </div>

      <!-- Loading placeholder -->
      <div v-else class="preview-state">
        <el-icon class="state-icon"><Document /></el-icon>
        <p class="state-title">正在加载预览…</p>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__header) {
  padding: 14px 20px;
  margin: 0;
  border-bottom: 1px solid var(--color-border-light, #f3f4f6);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.preview-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.preview-title-icon {
  font-size: 22px;
  color: var(--color-primary, #6366f1);
  flex-shrink: 0;
}

.preview-title-text {
  min-width: 0;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60vw;
}

.preview-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary, #6b7280);
}

.preview-filename {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-open-btn {
  flex-shrink: 0;
}

.preview-body {
  height: calc(88vh - 62px);
  min-height: 320px;
  overflow: auto;
  background: var(--color-bg-subtle, #f9fafb);
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: #fff;
}

.preview-image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.04));
}

.preview-md {
  padding: 28px 36px;
  max-width: 880px;
  margin: 0 auto;
  background: var(--color-bg-white, #fff);
  min-height: 100%;
  box-sizing: border-box;
}

.preview-raw-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-raw-note {
  padding: 10px 16px;
  font-size: 12px;
  color: var(--color-text-tertiary, #6b7280);
  background: var(--color-warning-bg, #fffbeb);
  border-bottom: 1px solid var(--color-border-light, #f3f4f6);
  margin: 0;
}

.preview-frame-raw {
  flex: 1;
}

.preview-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
  text-align: center;
  padding: 40px;
  box-sizing: border-box;
}

.state-icon {
  font-size: 40px;
  color: var(--color-text-muted, #9ca3af);
  margin-bottom: 6px;
}

.state-icon-error {
  color: var(--color-danger, #ef4444);
}

.state-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  margin: 0;
}

.state-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-tertiary, #6b7280);
  margin: 0 0 10px;
  max-width: 440px;
}
</style>
