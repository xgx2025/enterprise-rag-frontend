<script setup lang="ts">
defineProps<{
  context: string
}>()
</script>

<template>
  <div class="final-context">
    <div v-if="!context" class="no-data">暂无上下文数据</div>
    <pre v-else class="context-text">{{ context }}</pre>
  </div>
</template>

<style scoped>
.final-context {
  min-height: 200px;
}

.no-data {
  text-align: center;
  color: #9ca3af;
  padding: 40px;
}

.context-text {
  font-size: 13px;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 16px;
  margin: 0;
}
</style>
