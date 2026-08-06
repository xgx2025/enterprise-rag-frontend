<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
}
</script>

<template>
  <div class="home-container">
    <header class="header">
      <h1>Enterprise RAG Hub</h1>
      <div class="user-area">
        <span class="user-name">{{ authStore.userInfo?.realName || authStore.userInfo?.username }}</span>
        <el-button type="danger" text @click="handleLogout">退出登录</el-button>
      </div>
    </header>
    <main class="main">
      <el-card>
        <template #header>
          <span>欢迎使用企业可信知识检索平台</span>
        </template>
        <p>登录成功！当前用户信息：</p>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">{{ authStore.userInfo?.userId }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ authStore.userInfo?.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ authStore.userInfo?.realName }}</el-descriptions-item>
          <el-descriptions-item label="租户ID">{{ authStore.userInfo?.tenantId }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header h1 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  color: #606266;
}

.main {
  max-width: 800px;
  margin: 24px auto;
  padding: 0 16px;
}
</style>
