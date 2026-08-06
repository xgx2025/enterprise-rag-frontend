<script setup lang="ts">
defineProps<{
  isRunning: boolean
  lastRunAt?: string
}>()

const emit = defineEmits<{
  run: []
}>()
</script>

<template>
  <div class="eval-panel">
    <div class="panel-info">
      <div class="panel-status">
        <span v-if="isRunning" class="status-dot running"></span>
        <span v-else class="status-dot idle"></span>
        <span class="status-text">{{ isRunning ? '评测运行中...' : lastRunAt ? `上次评测：${new Date(lastRunAt).toLocaleString('zh-CN')}` : '尚未运行评测' }}</span>
      </div>
    </div>
    <el-button
      type="primary"
      :loading="isRunning"
      :disabled="isRunning"
      @click="emit('run')"
    >
      {{ isRunning ? '运行中...' : '运行评测' }}
    </el-button>
  </div>
</template>

<style scoped>
.eval-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.panel-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.idle {
  background: #d1d5db;
}

.status-dot.running {
  background: #10b981;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  font-size: 13px;
  color: #6b7280;
}
</style>
