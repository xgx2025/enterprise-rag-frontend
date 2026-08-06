<script setup lang="ts">
defineProps<{
  rows?: number
  animated?: boolean
}>()
</script>

<template>
  <div class="loading-block">
    <el-skeleton :rows="rows || 5" :animated="animated ?? true" />
  </div>
</template>

<style scoped>
.loading-block {
  padding: 20px;
}
</style>
