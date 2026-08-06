<script setup lang="ts">
import type { StrategyComparison } from '@/api/types'

defineProps<{
  strategies: StrategyComparison[]
}>()
</script>

<template>
  <div class="strategy-comparison">
    <h4 class="section-title">策略对比</h4>
    <el-table :data="strategies" stripe style="width: 100%">
      <el-table-column prop="strategyName" label="策略" min-width="200">
        <template #default="{ row }">
          <span class="strategy-name">{{ row.strategyName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="recallAt5" label="Recall@5" width="120" align="center">
        <template #default="{ row }">
          <span class="metric-val">{{ (row.recallAt5 * 100).toFixed(0) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="mrr" label="MRR" width="100" align="center">
        <template #default="{ row }">
          <span class="metric-val">{{ (row.mrr * 100).toFixed(0) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="nDCG" label="nDCG" width="100" align="center">
        <template #default="{ row }">
          <span class="metric-val">{{ (row.nDCG * 100).toFixed(0) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="latencyP95" label="P95 延迟" width="120" align="center">
        <template #default="{ row }">
          <span class="metric-val">{{ row.latencyP95 }}ms</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.strategy-comparison {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.strategy-name {
  font-weight: 500;
  color: #111827;
}

.metric-val {
  font-weight: 500;
  color: #374151;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
</style>
