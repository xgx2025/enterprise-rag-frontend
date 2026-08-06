<script setup lang="ts">
import { ref } from 'vue'

const model = defineModel<string>({ required: true })

const emit = defineEmits<{
  search: []
}>()

defineProps<{
  loading: boolean
}>()

const examples = ['深圳出差住宿标准是多少？', '报销网约车需要哪些凭证？', '新版差旅制度相比旧版变化？']
</script>

<template>
  <div class="debug-input">
    <div class="input-wrapper">
      <el-input
        v-model="model"
        placeholder="输入测试查询，例如：深圳出差住宿标准是多少？"
        size="large"
        clearable
        @keyup.enter="emit('search')"
        class="query-input"
      >
        <template #suffix>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!model.trim()"
            @click="emit('search')"
            class="search-btn"
          >
            检索
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="example-chips">
      <span
        v-for="q in examples"
        :key="q"
        class="example-chip"
        @click="model = q; emit('search')"
      >{{ q }}</span>
    </div>
  </div>
</template>

<style scoped>
.debug-input {
  margin-bottom: 24px;
}

.input-wrapper {
  max-width: 100%;
}

.query-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding-right: 90px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.search-btn {
  border-radius: 8px;
  margin-right: 4px;
}

.example-chips {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.example-chip {
  padding: 6px 14px;
  background: #f5f7fa;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.example-chip:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #6366f1;
}
</style>
