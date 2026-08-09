<script setup lang="ts">
import { ref } from 'vue'
import SidebarMenu from './SidebarMenu.vue'
import HeaderBar from './HeaderBar.vue'

const sidebarCollapsed = ref(false)

function onSidebarCollapse(collapsed: boolean) {
  sidebarCollapsed.value = collapsed
}
</script>

<template>
  <el-container class="app-layout">
    <el-aside :width="sidebarCollapsed ? '64px' : '260px'" class="app-aside">
      <SidebarMenu @collapse="onSidebarCollapse" />
    </el-aside>
    <el-container class="app-body">
      <el-header height="60px" class="app-header">
        <HeaderBar />
      </el-header>
      <el-main class="app-main">
        <router-view v-slot="{ Component, route }">
          <transition
            name="page-fade"
            mode="out-in"
          >
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
  background: #f5f7fa;
}

.app-aside {
  transition: width 280ms var(--ease-out, cubic-bezier(0.23,1,0.32,1));
  overflow: hidden;
  flex-shrink: 0;
}

.app-body {
  overflow: hidden;
}

.app-header {
  padding: 0;
  height: 60px;
  flex-shrink: 0;
}

.app-main {
  background: #f5f7fa;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  position: relative;
}

/* ── Page transitions ── */
.page-fade-enter-active {
  transition: opacity 0.25s ease, transform 0.25s var(--ease-out, cubic-bezier(0.16,1,0.3,1));
}
.page-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
