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

const menuItems = [
  { path: '/qa', icon: ChatDotRound, label: '企业问答', desc: '智能知识检索' },
  { path: '/documents', icon: Document, label: '知识库', desc: '文档与配置' },
  { path: '/debug', icon: Monitor, label: '检索实验室', desc: '召回分析' },
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
      <div
        class="nav-section-label"
        :class="{ 'label-hidden': isCollapsed }"
      >导航菜单</div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        router
        class="nav-menu"
        background-color="transparent"
        text-color="#c7d2fe"
        active-text-color="#ffffff"
      >
        <template v-for="item in menuItems" :key="item.path">
          <!-- Single template — tooltip disabled when expanded so the
               DOM stays stable and text can transition in/out smoothly -->
          <el-tooltip
            :content="item.label"
            placement="right"
            :show-after="300"
            effect="dark"
            :offset="12"
            :disabled="!isCollapsed"
          >
            <el-menu-item :index="item.path">
              <div class="menu-item-content">
                <el-icon :class="{ 'icon-active': activeMenu === item.path }">
                  <component :is="item.icon" />
                </el-icon>
                <div class="menu-text">
                  <span class="menu-label">{{ item.label }}</span>
                  <span class="menu-desc">{{ item.desc }}</span>
                </div>
              </div>
              <div
                class="active-indicator"
                :class="{ 'indicator-visible': activeMenu === item.path }"
              />
            </el-menu-item>
          </el-tooltip>
        </template>
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
  transition: padding 280ms var(--ease-out), justify-content 280ms var(--ease-out);
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

/* Section label — always in DOM, transitions in/out with opacity+height */
.nav-section-label {
  padding: 16px 18px 8px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(199,210,254,0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  max-height: 40px;
  overflow: hidden;
  transition:
    opacity 150ms var(--ease-out),
    transform 150ms var(--ease-out),
    max-height 250ms var(--ease-out),
    padding 250ms var(--ease-out);
}

.nav-section-label.label-hidden {
  opacity: 0;
  transform: translateX(-6px);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
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
    justify-content 280ms var(--ease-out),
    padding 280ms var(--ease-out);
}

/* ── Enter: staggered slide-in on expand ── */
.sidebar:not(.collapsed) .nav-menu :deep(.el-menu-item) {
  animation: menuItemEnter 220ms var(--ease-out) forwards;
  opacity: 0;
}
/* Tight stagger — all items complete near the 280ms sidebar expansion */
.sidebar:not(.collapsed) .nav-menu :deep(.el-menu-item):nth-child(1) { animation-delay: 50ms; }
.sidebar:not(.collapsed) .nav-menu :deep(.el-menu-item):nth-child(2) { animation-delay: 95ms; }
.sidebar:not(.collapsed) .nav-menu :deep(.el-menu-item):nth-child(3) { animation-delay: 140ms; }
.sidebar:not(.collapsed) .nav-menu :deep(.el-menu-item):nth-child(4) { animation-delay: 185ms; }

@keyframes menuItemEnter {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ── Exit: text fades out before the sidebar clips it ── */
.menu-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out;
}

.sidebar.collapsed .menu-text {
  opacity: 0;
  transform: translateX(-6px);
  pointer-events: none;
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
  transition: width 280ms var(--ease-out), justify-content 280ms var(--ease-out);
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
  /* Kill the enter animation so exit is transition-driven */
  animation: none;
  opacity: 1;
}

/* Content wrapper shrinks to icon width */
.sidebar.collapsed .menu-item-content {
  width: auto;
  justify-content: center;
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

/* Footer — center chevron */
.sidebar.collapsed .sidebar-footer {
  justify-content: center;
  padding: 14px 0;
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
  transition:
    color 200ms ease,
    background 200ms ease,
    padding 280ms var(--ease-out),
    justify-content 280ms var(--ease-out);
  user-select: none;
}

.sidebar-footer:hover {
  color: #fff;
  background: rgba(255,255,255,0.04);
}

.sidebar-footer:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}

.footer-icon {
  flex-shrink: 0;
  display: flex;
  transition: transform 280ms var(--ease-out);
}

.footer-icon.rotated {
  transform: rotate(180deg);
}

.footer-text {
  white-space: nowrap;
}

/* ── Brand & footer text enter/leave ── */
/* Enter: delayed so the sidebar has already started expanding */
.brand-fade-enter-active {
  transition:
    opacity 200ms var(--ease-out) 80ms,
    transform 200ms var(--ease-out) 80ms;
}
/* Leave: fast — text vanishes before the shrinking sidebar clips it */
.brand-fade-leave-active {
  transition:
    opacity 120ms ease-out,
    transform 120ms ease-out;
}
.brand-fade-enter-from,
.brand-fade-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}

/* ═══════════════════════════════════════════════════════
   Accessibility: prefers-reduced-motion
   ═══════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  /* Kill all transform motion and animations */
  .sidebar,
  .sidebar-brand,
  .nav-menu,
  .nav-section-label,
  .sidebar-footer,
  .footer-icon,
  .menu-item-content,
  .menu-item-content :deep(.el-icon),
  .menu-text {
    transition: none !important;
  }

  .sidebar:not(.collapsed) .nav-menu :deep(.el-menu-item) {
    animation: none;
    opacity: 1;
    transform: none;
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

  .sidebar-footer:active {
    transform: none;
  }

  .sidebar.collapsed .menu-text {
    opacity: 0;
    transform: none;
  }

  .nav-section-label.label-hidden {
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
