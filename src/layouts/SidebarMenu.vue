<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChatDotRound, Document, Monitor, DataAnalysis, Fold, Expand,
} from '@element-plus/icons-vue'

const emit = defineEmits<{
  collapse: [collapsed: boolean]
}>()

const route = useRoute()
const isCollapsed = ref(false)
const isTransitioning = ref(false)

const menuItems = [
  { path: '/qa', icon: ChatDotRound, label: '企业问答', desc: '智能知识检索' },
  { path: '/documents', icon: Document, label: '知识库', desc: '文档与配置' },
  { path: '/debug', icon: Monitor, label: '检索实验室', desc: '召回分析' },
  { path: '/evaluation', icon: DataAnalysis, label: '评测中心', desc: '质量度量' },
]

const activeMenu = computed(() => {
  const path = route.path
  // Sort by path length descending so longer (more specific) paths match first
  const sorted = [...menuItems].sort((a, b) => b.path.length - a.path.length)
  for (const item of sorted) {
    // Exact match or prefix match with '/' boundary (safe for nested routes)
    if (path === item.path || path.startsWith(item.path + '/')) {
      return item.path
    }
  }
  return '/qa'
})

function toggleCollapse() {
  // Guard against rapid clicks during the collapse/expand transition
  if (isTransitioning.value) return
  isTransitioning.value = true
  isCollapsed.value = !isCollapsed.value
  emit('collapse', isCollapsed.value)
  setTimeout(() => {
    isTransitioning.value = false
  }, 400) // Covers the longest enter animation (text: 60ms delay + 280ms = 340ms)
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
      <el-menu
        :default-active="activeMenu"
        router
        class="nav-menu"
        background-color="transparent"
        text-color="#c7d2fe"
        active-text-color="#ffffff"
      >
        <!--
          el-menu-item MUST be a direct child of el-menu so router mode and
          is-active tracking work correctly.
          We deliberately do NOT bind el-menu's :collapse prop. Its built-in
          collapse-transition wraps the item content and animates width on a
          separate timeline, clipping the text until the very end — that is
          what made the title "pop in" after the icon on expand. Instead,
          every collapsed visual (icon centering, text hiding, tooltip) is
          driven by the .sidebar.collapsed class + our own el-tooltip below,
          so the whole sidebar animates on one synchronized timeline.
          el-tooltip lives INSIDE the item — it only wraps the visual content,
          not the entire menu-item component.
        -->
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-tooltip
            :content="item.label"
            placement="right"
            :show-after="300"
            effect="dark"
            :offset="12"
            :disabled="!isCollapsed"
          >
            <div class="menu-item-content">
              <el-icon :class="{ 'icon-active': activeMenu === item.path }">
                <component :is="item.icon" />
              </el-icon>
              <div class="menu-text">
                <span class="menu-label">{{ item.label }}</span>
                <span class="menu-desc">{{ item.desc }}</span>
              </div>
            </div>
          </el-tooltip>
          <div
            class="active-indicator"
            :class="{ 'indicator-visible': activeMenu === item.path }"
          />
        </el-menu-item>
      </el-menu>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <el-tooltip
        content="展开菜单"
        placement="right"
        :show-after="400"
        effect="dark"
        :offset="10"
        :disabled="!isCollapsed"
      >
        <button
          class="collapse-btn"
          type="button"
          :aria-label="isCollapsed ? '展开菜单' : '收起菜单'"
          @click="toggleCollapse"
        >
          <el-icon class="collapse-btn-icon">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <span class="collapse-btn-text">收起菜单</span>
        </button>
      </el-tooltip>
    </div>
  </nav>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════
   Design Tokens
   ═══════════════════════════════════════════════════════ */
.sidebar {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  display: flex;
  flex-direction: column;
  height: 100%;
  /* Fill parent — the AppLayout el-aside controls the visual width.
     This eliminates the dual-transition jank where sidebar and its
     parent animated width at different speeds. */
  width: 100%;
  background: linear-gradient(180deg, #1e1b4b 0%, #252166 40%, #312e81 100%);
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

/* ── Brand ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  min-height: 60px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: padding 280ms var(--ease-out);
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

.nav-menu {
  border-right: none !important;
  padding: 4px 8px;
  transition: padding 280ms var(--ease-out);
}

/* ── Menu Items ── */
.nav-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  margin: 2px 4px;
  border-radius: 10px;
  font-size: 14px;
  height: 48px;
  line-height: 1.2;
  padding: 0 10px !important;
  position: relative;
  overflow: visible;
  transition:
    transform 150ms var(--ease-out),
    background 200ms ease-out,
    box-shadow 200ms ease-out,
    margin 280ms var(--ease-out),
    height 280ms var(--ease-out),
    border-radius 280ms var(--ease-out),
    padding 280ms var(--ease-out);
}

/* ── Exit: text fades out AND shrinks to zero width before the sidebar clips it.
   max-width is used (instead of width) because it transitions smoothly to/from 0,
   removing the text from the layout so icons stay perfectly centered. ── */
.menu-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  max-width: 500px; /* large enough for any label + desc, just needs to be > real width */
  min-width: 0;     /* allow flex child to shrink below content size */
  /* ENTER (expand): the transition on the expanded (target) state drives the
     expand animation. It starts 60ms after the sidebar begins widening (so
     there is room for the text) and eases in over 280ms in lockstep with the
     sidebar width - no sudden pop. */
  transition:
    opacity 280ms var(--ease-out) 60ms,
    transform 280ms var(--ease-out) 60ms,
    max-width 320ms var(--ease-out) 60ms;
}

.sidebar.collapsed .menu-text {
  opacity: 0;
  transform: translateX(-8px);
  pointer-events: none;
  max-width: 0;
  /* LEAVE (collapse): the transition on the collapsed (target) state drives
     the collapse animation. Fast and immediate so the text is gone well
     before the shrinking sidebar can clip it. */
  transition:
    opacity 140ms ease-out,
    transform 140ms ease-out,
    max-width 180ms ease-out;
}

/* Hover — gated behind fine-pointer (no false positives on touch) */
@media (hover: hover) and (pointer: fine) {
  .nav-menu :deep(.el-menu-item:hover) {
    background: rgba(255,255,255,0.08) !important;
    transform: translateX(3px);
  }

  .nav-menu :deep(.el-menu-item:hover) .menu-item-content :deep(.el-icon) {
    transform: scale(1.06);
  }
}

/* Press feedback */
.nav-menu :deep(.el-menu-item:active) {
  transform: scale(0.97) !important;
  transition: transform 100ms ease-out;
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: rgba(99,102,241,0.4) !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* Focus-visible for accessibility */
.nav-menu :deep(.el-menu-item:focus-visible) {
  outline: 2px solid rgba(165,180,252,0.6);
  outline-offset: -2px;
  border-radius: 10px;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  transition:
    width 280ms var(--ease-out),
    justify-content 280ms var(--ease-out),
    gap 250ms var(--ease-out);
}

/* Icon — font-size transitions smoothly between 19px↔22px */
.menu-item-content :deep(.el-icon) {
  font-size: 19px;
  flex-shrink: 0;
  transition:
    font-size 280ms var(--ease-out),
    transform 150ms var(--ease-spring),
    color 200ms ease,
    filter 250ms ease;
}

.icon-active {
  color: #fff;
  filter: drop-shadow(0 0 6px rgba(165,180,252,0.5));
}

.menu-label {
  font-size: 13.5px;
  white-space: nowrap;
}

.menu-desc {
  font-size: 11px;
  color: rgba(199,210,254,0.65);
  white-space: nowrap;
}

/* ── Active indicator (left accent bar) ── */
.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  border-radius: 0 3px 3px 0;
  background: #a5b4fc;
  box-shadow: 0 0 10px rgba(165,180,252,0.5);
  opacity: 0;
  transition:
    opacity 200ms var(--ease-out),
    height 250ms var(--ease-out);
}

.active-indicator.indicator-visible {
  opacity: 1;
  height: 20px;
}

/* ═══════════════════════════════════════════════════════
   Collapsed State
   ═══════════════════════════════════════════════════════ */

/* Brand — center the icon */
.sidebar.collapsed .sidebar-brand {
  justify-content: center;
  padding: 18px 0;
}

/* Nav — tighter padding */
.sidebar.collapsed .nav-menu {
  padding: 6px 6px;
}

/* Menu items — icon buttons */
.sidebar.collapsed .nav-menu :deep(.el-menu-item) {
  justify-content: center;
  padding: 0 !important;
  margin: 3px 5px;
  height: 44px;
  border-radius: 12px;
  opacity: 1;
}

/* Content wrapper shrinks to icon width */
.sidebar.collapsed .menu-item-content {
  width: auto;
  justify-content: center;
  gap: 0; /* eliminate gap so icon is perfectly centered */
}

/* Active pill replaces side bar in icon-only mode */
.sidebar.collapsed .nav-menu :deep(.el-menu-item.is-active) {
  background: rgba(99,102,241,0.5) !important;
  box-shadow:
    0 0 18px rgba(99,102,241,0.3),
    inset 0 1px 0 rgba(255,255,255,0.08);
}

.sidebar.collapsed .active-indicator {
  display: none;
}

/* Larger icons */
.sidebar.collapsed .menu-item-content :deep(.el-icon) {
  font-size: 22px;
}

/* Collapsed hover — scale instead of translate */
@media (hover: hover) and (pointer: fine) {
  .sidebar.collapsed .nav-menu :deep(.el-menu-item:hover) {
    transform: scale(1.08);
    background: rgba(255,255,255,0.1) !important;
  }
}

/* Collapsed press feedback */
.sidebar.collapsed .nav-menu :deep(.el-menu-item:active) {
  transform: scale(0.93) !important;
}

/* ── Footer ── */
.sidebar-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  transition: padding 280ms var(--ease-out);
}

.sidebar.collapsed .sidebar-footer {
  padding: 14px 0;
}

/* ── Collapse button ── */
.collapse-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 16px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  color: rgba(199,210,254,0.7);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  outline: none;
  transition:
    all 0.28s var(--ease-out),
    transform 0.2s var(--ease-out),
    box-shadow 0.25s var(--ease-out);
}

/* Icon-only circle when sidebar collapsed */
.sidebar.collapsed .collapse-btn {
  width: 34px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  gap: 0;
}

.collapse-btn:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.18);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
}

.collapse-btn:active {
  transform: scale(0.96) !important;
  transition: transform 0.1s ease-out;
}

/* Focus-visible ring for keyboard users */
.collapse-btn:focus-visible {
  outline: 2px solid rgba(165,180,252,0.6);
  outline-offset: 2px;
}

.collapse-btn-icon {
  font-size: 15px;
  flex-shrink: 0;
}

/* Text: always in DOM, fades/shrinks via CSS driven by .sidebar.collapsed */
.collapse-btn-text {
  display: inline-block;
  overflow: hidden;
  max-width: 100px;
  opacity: 1;
  transition:
    opacity 200ms var(--ease-out) 80ms,
    max-width 250ms var(--ease-out) 80ms;
}

.sidebar.collapsed .collapse-btn-text {
  opacity: 0;
  max-width: 0;
  transition:
    opacity 100ms ease-out,
    max-width 150ms ease-out;
}

/* ── Brand & footer text enter/leave ── */
/* Enter: delayed so the sidebar has already started expanding */
.brand-fade-enter-active {
  transition:
    opacity 280ms var(--ease-out) 100ms,
    transform 280ms var(--ease-out) 100ms;
}
/* Leave: fast — text vanishes before the shrinking sidebar clips it */
.brand-fade-leave-active {
  transition:
    opacity 130ms ease-out,
    transform 130ms ease-out;
}
.brand-fade-enter-from,
.brand-fade-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

/* ═══════════════════════════════════════════════════════
   Accessibility: prefers-reduced-motion
   ═══════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  /* Kill all transform motion and animations */
  .sidebar,
  .sidebar-brand,
  .nav-menu,
  .sidebar-footer,
  .collapse-btn,
  .collapse-btn-icon,
  .collapse-btn-text,
  .menu-item-content,
  .menu-item-content :deep(.el-icon),
  .menu-text {
    transition: none !important;
  }


  .nav-menu :deep(.el-menu-item) {
    transition: background 200ms ease-out !important;
  }

  @media (hover: hover) and (pointer: fine) {
    .nav-menu :deep(.el-menu-item:hover),
    .sidebar.collapsed .nav-menu :deep(.el-menu-item:hover) {
      transform: none;
    }

    .nav-menu :deep(.el-menu-item:hover) .menu-item-content :deep(.el-icon) {
      transform: none;
    }
  }

  .nav-menu :deep(.el-menu-item:active),
  .sidebar.collapsed .nav-menu :deep(.el-menu-item:active) {
    transform: none !important;
  }

  .collapse-btn:active {
    transform: none !important;
  }

  .sidebar.collapsed .menu-text {
    opacity: 0;
    transform: none;
  }

  .brand-fade-enter-active {
    transition: opacity 200ms ease 80ms;
  }
  .brand-fade-leave-active {
    transition: opacity 120ms ease-out;
  }
  .brand-fade-enter-from,
  .brand-fade-leave-to {
    transform: none;
  }
}
</style>
