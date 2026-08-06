<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  actionLabel?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-illustration">
      <svg viewBox="0 0 100 80" width="90" height="72" fill="none">
        <rect x="18" y="22" width="64" height="48" rx="8" stroke="#d1d5db" stroke-width="1.5" stroke-dasharray="4 3" />
        <rect x="24" y="30" width="52" height="5" rx="2.5" fill="#e5e7eb" />
        <rect x="24" y="41" width="36" height="4" rx="2" fill="#f3f4f6" />
        <rect x="24" y="50" width="44" height="4" rx="2" fill="#f3f4f6" />
        <circle cx="68" cy="60" r="14" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1.5" />
        <path d="M68 54v8M64 58h8" stroke="#6366f1" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </div>
    <h3 v-if="title" class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <el-button
      v-if="actionLabel"
      type="primary"
      class="empty-btn"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </el-button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-illustration {
  margin-bottom: 24px;
  opacity: 0.7;
}

.empty-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 650;
  color: #374151;
  letter-spacing: -0.01em;
}

.empty-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: #9ca3af;
  max-width: 380px;
  line-height: 1.65;
}

.empty-btn {
  border-radius: 10px;
  font-weight: 600;
  padding: 10px 22px;
  height: auto;
}
</style>
