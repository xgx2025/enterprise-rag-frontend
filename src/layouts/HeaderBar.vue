<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowDown, Setting, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const authStore = useAuthStore()

const breadcrumbs = computed(() => {
  const meta = route.meta as { breadcrumb?: string[] }
  return meta.breadcrumb ?? []
})

const userInitials = computed(() => {
  const name = authStore.userInfo?.realName || authStore.userInfo?.username || 'U'
  return name.slice(0, 2).toUpperCase()
})

const pageTitle = computed(() => {
  const meta = route.meta as { title?: string }
  return meta.title ?? ''
})

async function handleLogout() {
  await authStore.logout()
}
</script>

<template>
  <header class="header-bar">
    <div class="header-left">
      <div class="page-title" v-if="pageTitle">{{ pageTitle }}</div>
      <el-breadcrumb separator="">
        <el-breadcrumb-item>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" class="home-icon">
            <path d="M2 6l6-4 6 4v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="crumb in breadcrumbs" :key="crumb">
          {{ crumb }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <!-- Tenant badge -->
      <div class="tenant-badge" v-if="authStore.currentTenant">
        <span class="tenant-label">当前企业</span>
        <span class="tenant-name">{{ authStore.currentTenant }}</span>
      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <el-tooltip content="设置" placement="bottom" :show-after="500">
          <button class="action-btn">
            <el-icon><Setting /></el-icon>
          </button>
        </el-tooltip>
      </div>

      <!-- User dropdown -->
      <el-dropdown trigger="click" popper-class="user-dropdown-menu">
        <div class="user-trigger">
          <div class="avatar-wrapper">
            <div class="avatar-circle">{{ userInitials }}</div>
            <div class="avatar-dot"></div>
          </div>
          <div class="user-info">
            <span class="user-name">{{ authStore.userInfo?.realName || authStore.userInfo?.username }}</span>
            <span class="user-role">{{ authStore.currentRole }}</span>
          </div>
          <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <div class="dropdown-header">
              <span class="dh-label">已登录身份</span>
            </div>
            <el-dropdown-item disabled>
              <div class="dropdown-profile">
                <div class="dp-avatar">{{ userInitials }}</div>
                <div class="dp-info">
                  <span class="dp-name">{{ authStore.userInfo?.realName }}</span>
                  <span class="dp-email">@{{ authStore.userInfo?.username }}</span>
                </div>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <div class="logout-row">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  z-index: 10;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
  letter-spacing: -0.01em;
}

/* Breadcrumb */
:deep(.el-breadcrumb) {
  display: flex;
  align-items: center;
}
:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}
:deep(.el-breadcrumb__separator) {
  display: inline-flex;
  margin: 0 6px;
  color: var(--color-border-strong, #d1d5db);
  font-size: 11px;
}
:deep(.el-breadcrumb__separator::after) {
  content: '/';
}
:deep(.el-breadcrumb__inner) {
  color: var(--color-text-tertiary, #6b7280);
  font-size: 13px;
  font-weight: 400;
  transition: color 0.2s;
}
:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--color-text-secondary, #374151);
  font-weight: 500;
}
:deep(.el-breadcrumb__inner:hover) {
  color: var(--color-primary, #6366f1);
}

.home-icon {
  color: var(--color-text-muted, #9ca3af);
  transition: color 0.2s;
}
:deep(.el-breadcrumb__inner):hover .home-icon {
  color: var(--color-primary, #6366f1);
}

/* ── Right ── */
.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Tenant badge */
.tenant-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--color-primary-bg, #eef2ff);
  border: 1px solid var(--color-primary-lighter, #c7d2fe);
  border-radius: 8px;
  margin-right: 8px;
  font-size: 12px;
}

.tenant-label {
  color: var(--color-text-tertiary, #6b7280);
  font-size: 11px;
}

.tenant-name {
  color: var(--color-primary-dark, #4f46e5);
  font-weight: 600;
}

/* Quick action buttons */
.quick-actions {
  display: flex;
  gap: 2px;
  margin-right: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-tertiary, #6b7280);
  cursor: pointer;
  font-size: 17px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--color-bg-muted, #f5f7fa);
  color: var(--color-text-secondary, #374151);
}

/* ── User trigger ── */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px 4px 6px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.user-trigger:hover {
  background: var(--color-bg-muted, #f5f7fa);
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-primary, linear-gradient(135deg,#6366f1,#8b5cf6));
  color: var(--color-bg-white, #fff);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(99,102,241,0.3);
}

.avatar-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success, #10b981);
  border: 1.5px solid var(--color-bg-white, #fff);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.user-name {
  font-size: 13px;
  color: var(--color-text-primary, #111827);
  font-weight: 600;
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: var(--color-text-muted, #9ca3af);
  line-height: 1.2;
}

.dropdown-arrow {
  font-size: 11px;
  color: var(--color-text-muted, #9ca3af);
  transition: transform 0.2s ease;
}

/* ── Dropdown content ── */
.dropdown-header {
  padding: 6px 12px 4px;
}

.dh-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dropdown-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}

.dp-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gradient-primary, linear-gradient(135deg,#6366f1,#8b5cf6));
  color: var(--color-bg-white, #fff);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dp-info {
  display: flex;
  flex-direction: column;
}

.dp-name {
  font-size: 13px;
  color: var(--color-text-primary, #111827);
  font-weight: 600;
}

.dp-email {
  font-size: 11px;
  color: var(--color-text-muted, #9ca3af);
}

.logout-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-danger, #ef4444);
  font-weight: 500;
}
</style>

<style>
.user-dropdown-menu {
  border-radius: 14px !important;
  box-shadow: 0 16px 48px rgba(0,0,0,0.1) !important;
  border: 1px solid var(--color-border-light, #f3f4f6) !important;
  padding: 4px !important;
  min-width: 200px !important;
}
</style>
