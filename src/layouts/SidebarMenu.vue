<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChatDotRound, Document, Monitor, DataAnalysis,
} from '@element-plus/icons-vue'

const emit = defineEmits<{
  collapse: [collapsed: boolean]
}>()

const route = useRoute()
const isCollapsed = ref(false)
const hoveredItem = ref<string | null>(null)

const menuItems = [
  { path: '/qa', icon: ChatDotRound, label: '企业问答', desc: '智能知识检索' },
  { path: '/documents', icon: Document, label: '文档管理', desc: '知识库维护' },
  { path: '/debug', icon: Monitor, label: '检索调试', desc: '召回可视化' },
  { path: '/evaluation', icon: DataAnalysis, label: '评测中心', desc: '质量度量' },
]

const activeMenu = computed(() => {
  const path = route.path
  for (const item of menuItems) {
    if (path.startsWith(item.path)) return item.path
  }
  return '/qa'
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  emit('collapse', isCollapsed.value)
}
</script>

<template>
  <nav class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="36" y2="36">
              <stop stop-color="#818cf8" />
              <stop offset="1" stop-color="#6366f1" />
            </linearGradient>
            <filter id="iconGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="36" height="36" rx="9" fill="url(#bgGrad)" filter="url(#iconGlow)" />
          <path d="M9 14l4.5-2.5 4.5 2.5v8l-4.5 2.5L9 22v-8z" fill="#fff" opacity="0.95" />
          <path d="M18 12l4.5-2 4.5 2v9.5l-4.5 2-4.5-2V12z" fill="#fff" opacity="0.75" />
        </svg>
      </div>
      <transition name="brand-fade">
        <div v-if="!isCollapsed" class="brand-text">
          <span class="brand-name">Enterprise RAG</span>
          <span class="brand-sub">知识检索平台</span>
        </div>
      </transition>
    </div>

    <!-- Navigation -->
    <div class="sidebar-nav">
      <div v-if="!isCollapsed" class="nav-section-label">导航菜单</div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        router
        class="nav-menu"
        background-color="transparent"
        text-color="#c7d2fe"
        active-text-color="#ffffff"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          @mouseenter="hoveredItem = item.path"
          @mouseleave="hoveredItem = null"
        >
          <div class="menu-item-content">
            <el-icon :class="{ 'icon-active': activeMenu === item.path }">
              <component :is="item.icon" />
            </el-icon>
            <template v-if="!isCollapsed">
              <div class="menu-text">
                <span class="menu-label">{{ item.label }}</span>
                <span class="menu-desc">{{ item.desc }}</span>
              </div>
            </template>
          </div>
          <div
            v-if="activeMenu === item.path"
            class="active-indicator"
          />
        </el-menu-item>
      </el-menu>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer" @click="toggleCollapse">
      <div class="footer-icon" :class="{ rotated: isCollapsed }">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 16l-6-6 6-6" />
        </svg>
      </div>
      <transition name="brand-fade">
        <span v-if="!isCollapsed" class="footer-text">收起菜单</span>
      </transition>
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #1e1b4b 0%, #252166 40%, #312e81 100%);
  transition: width 0.35s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
  width: 260px;
  overflow: hidden;
  position: relative;
}

/* Subtle noise texture overlay */
.sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.06) 0%, transparent 70%);
  pointer-events: none;
}

.sidebar.collapsed {
  width: 64px;
}

/* ── Brand ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  min-height: 60px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.brand-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.brand-sub {
  font-size: 11px;
  color: #a5b4fc;
  white-space: nowrap;
  letter-spacing: 0.03em;
}

/* ── Navigation ── */
.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-section-label {
  padding: 16px 18px 8px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(199,210,254,0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav-menu {
  border-right: none !important;
  padding: 4px 8px;
}

.nav-menu :deep(.el-menu-item) {
  margin: 2px 4px;
  border-radius: 10px;
  font-size: 14px;
  height: 48px;
  line-height: 1.2;
  padding: 0 10px !important;
  position: relative;
  overflow: visible;
  transition: all 0.25s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}

.nav-menu :deep(.el-menu-item:hover) {
  background: rgba(255,255,255,0.08) !important;
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: rgba(99,102,241,0.35) !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.menu-item-content :deep(.el-icon) {
  font-size: 19px;
  flex-shrink: 0;
  transition: transform 0.3s var(--ease-spring, cubic-bezier(0.34,1.56,0.64,1)), color 0.2s ease;
}

.icon-active {
  color: #fff;
}

.nav-menu :deep(.el-menu-item:hover) .menu-item-content :deep(.el-icon) {
  transform: scale(1.1);
}

.menu-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.menu-label {
  font-size: 13.5px;
  white-space: nowrap;
}

.menu-desc {
  font-size: 10.5px;
  color: rgba(199,210,254,0.5);
  white-space: nowrap;
}

/* Active indicator dot */
.active-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #a5b4fc;
  box-shadow: 0 0 8px rgba(165,180,252,0.6);
}

/* Collapsed: center icons */
.sidebar.collapsed .nav-menu :deep(.el-menu-item) {
  justify-content: center;
  padding: 0 !important;
}

.sidebar.collapsed .nav-menu :deep(.el-menu-item) .active-indicator {
  right: 6px;
}

/* ── Footer ── */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  color: rgba(199,210,254,0.55);
  font-size: 12.5px;
  transition: all 0.25s ease;
  user-select: none;
}

.sidebar-footer:hover {
  color: #fff;
  background: rgba(255,255,255,0.04);
}

.footer-icon {
  flex-shrink: 0;
  display: flex;
  transition: transform 0.35s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}

.footer-icon.rotated {
  transform: rotate(180deg);
}

.footer-text {
  white-space: nowrap;
}

/* ── Transitions ── */
.brand-fade-enter-active {
  transition: opacity 0.3s ease 0.05s, transform 0.3s var(--ease-out, cubic-bezier(0.16,1,0.3,1)) 0.05s;
}
.brand-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.brand-fade-enter-from {
  opacity: 0;
  transform: translateX(-4px);
}
.brand-fade-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
