<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  output: string
}>()

const showRaw = ref(false)
</script>

<template>
  <div class="model-output">
    <div class="output-header">
      <el-button size="small" text @click="showRaw = !showRaw">
        {{ showRaw ? '查看渲染' : '查看原始 JSON' }}
      </el-button>
    </div>
    <div v-if="!output" class="no-data">暂无模型输出</div>
    <pre v-else-if="showRaw" class="output-raw">{{ output }}</pre>
    <div v-else class="output-rendered">{{ output }}</div>
  </div>
</template>

<style scoped>
.model-output {
  min-height: 200px;
}

.output-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.no-data {
  text-align: center;
  color: #9ca3af;
  padding: 40px;
}

.output-raw {
  font-size: 12px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-all;
  background: #1e1b4b;
  color: #c7d2fe;
  border-radius: 10px;
  padding: 16px;
  margin: 0;
  overflow-x: auto;
}

.output-rendered {
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 16px;
  white-space: pre-wrap;
}
</style>
