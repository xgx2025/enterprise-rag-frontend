<script setup lang="ts">
import type { Citation } from '@/api/types'
import { Close, Document, Clock, Lock, Files } from '@element-plus/icons-vue'

defineProps<{
  citation: Citation | null
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="citation-panel">
    <template v-if="citation">
      <div class="cite-header">
        <div class="cite-title-row">
          <el-icon class="cite-title-icon"><Document /></el-icon>
          <h3 class="cite-title">引用原文</h3>
        </div>
        <button class="cite-close" @click="emit('close')">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <div class="cite-body">
        <!-- Document name -->
        <div class="cite-doc-title">{{ citation.title }}</div>

        <!-- Meta grid -->
        <div class="cite-meta">
          <div class="cite-meta-item">
            <el-icon><Files /></el-icon>
            <div class="meta-text">
              <span class="meta-label">版本</span>
              <span class="meta-value">{{ citation.version }}</span>
            </div>
          </div>
          <div class="cite-meta-item">
            <el-icon><Clock /></el-icon>
            <div class="meta-text">
              <span class="meta-label">生效日期</span>
              <span class="meta-value">{{ citation.effectiveDate }}</span>
            </div>
          </div>
          <div class="cite-meta-item">
            <el-icon><Lock /></el-icon>
            <div class="meta-text">
              <span class="meta-label">安全等级</span>
              <span class="meta-value">
                <el-tag
                  :type="citation.securityLevel > 1 ? 'warning' : 'success'"
                  size="small"
                  effect="light"
                >
                  {{ citation.securityLevel === 1 ? '公开' : citation.securityLevel === 2 ? '内部' : '机密' }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- Section path -->
        <div class="cite-section">
          <div class="section-path">
            <span class="section-label">章节位置</span>
            <span class="section-value">{{ citation.sectionPath }}</span>
          </div>
          <span class="page-badge">第 {{ citation.pageNumber }} 页</span>
        </div>

        <!-- Quote -->
        <div class="cite-quote-block">
          <div class="quote-label">📌 原文引用</div>
          <div class="quote-content">{{ citation.quote }}</div>
        </div>
      </div>
    </template>

    <div v-else class="cite-empty">
      <div class="empty-icon-circle">
        <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
          <rect x="11" y="8" width="26" height="32" rx="4" stroke="#d1d5db" stroke-width="1.5" />
          <path d="M18 18h12M18 24h10M18 30h8" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </div>
      <p class="empty-text">点击答案中的引用编号<br/>查看原文详情</p>
    </div>
  </div>
</template>

<style scoped>
.citation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* Empty */
.cite-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 13.5px;
  color: #9ca3af;
  text-align: center;
  line-height: 1.7;
}

/* Header */
.cite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.cite-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cite-title-icon {
  color: #6366f1;
  font-size: 18px;
}

.cite-title {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  color: #111827;
}

.cite-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 18px;
  transition: all 0.2s ease;
}

.cite-close:hover {
  background: #f5f7fa;
  color: #374151;
}

/* Body */
.cite-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.cite-doc-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 20px;
  line-height: 1.4;
}

/* Meta grid */
.cite-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 4px;
}

.cite-meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.15s;
}

.cite-meta-item:hover { background: #fff; }

.cite-meta-item .el-icon {
  font-size: 16px;
  color: #9ca3af;
  flex-shrink: 0;
}

.meta-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.meta-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.meta-value {
  font-size: 13.5px;
  color: #111827;
  font-weight: 500;
}

/* Section */
.cite-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 16px;
}

.section-path {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-label {
  font-size: 11px;
  color: #9ca3af;
}

.section-value {
  font-size: 13px;
  color: #111827;
  font-weight: 500;
}

.page-badge {
  font-size: 11px;
  font-weight: 600;
  color: #6366f1;
  background: #eef2ff;
  padding: 4px 10px;
  border-radius: 6px;
}

/* Quote */
.cite-quote-block {
  padding: 16px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  border-radius: 12px;
}

.quote-label {
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 10px;
}

.quote-content {
  font-size: 13.5px;
  line-height: 1.8;
  color: #374151;
}
</style>
