<script setup lang="ts">
defineProps<{
  message?: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-block">
    <div class="error-icon">
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="#fca5a5" stroke-width="2" fill="#fef2f2" />
        <path d="M24 16v10M24 30v.5" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    </div>
    <p class="error-message">{{ message || '加载失败，请稍后重试' }}</p>
    <el-button size="small" class="error-retry" @click="emit('retry')">重新加载</el-button>
  </div>
</template>

<style scoped>
.error-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  margin-bottom: 12px;
}

.error-message {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--color-text-tertiary, #6b7280);
}

.error-retry {
  border-radius: 8px;
}
</style>
