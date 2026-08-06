<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit } from '@element-plus/icons-vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { DEPARTMENTS, SECURITY_LEVELS } from '@/api/types'
import type { KnowledgeBase } from '@/api/types'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'changed': []
}>()

const kbStore = useKnowledgeBaseStore()
const editingId = ref<string | null>(null)
const formVisible = ref(false)
const saving = ref(false)
const formRef = ref()
const form = reactive({
  name: '',
  description: '',
  department: '',
  securityLevel: '1',
})

const rules = {
  name: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' },
    { max: 128, message: '名称不能超过 128 个字符', trigger: 'blur' },
  ],
}

watch(() => props.visible, async value => {
  if (value) {
    await kbStore.fetchKnowledgeBases(true, true).catch(() => undefined)
  }
})

function startCreate() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.department = ''
  form.securityLevel = '1'
  formVisible.value = true
}

function startEdit(kb: KnowledgeBase) {
  editingId.value = kb.id
  form.name = kb.name
  form.description = kb.description || ''
  form.department = kb.department || ''
  form.securityLevel = String(kb.securityLevel || 1)
  formVisible.value = true
}

async function save() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      department: form.department,
      securityLevel: Number(form.securityLevel),
    }
    if (editingId.value) {
      await kbStore.updateKnowledgeBase(editingId.value, payload)
      ElMessage.success('知识库已更新')
    } else {
      await kbStore.createKnowledgeBase(payload)
      ElMessage.success('知识库已创建')
    }
    formVisible.value = false
    emit('changed')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '保存知识库失败')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(kb: KnowledgeBase) {
  const status = kb.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED'
  try {
    await kbStore.updateKnowledgeBaseStatus(kb.id, status)
    ElMessage.success(status === 'ACTIVE' ? '知识库已启用' : '知识库已停用')
    emit('changed')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '更新状态失败')
  }
}

async function close() {
  formVisible.value = false
  await kbStore.fetchKnowledgeBases(true, false).catch(() => undefined)
  emit('update:visible', false)
}

function handleVisibleChange(value: boolean) {
  if (!value) close()
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="知识库管理"
    width="760px"
    :close-on-click-modal="false"
    @update:model-value="handleVisibleChange"
  >
    <div class="kb-toolbar">
      <p>知识库用于划分文档范围，停用前必须先处理其中的生效文档。</p>
      <el-button type="primary" @click="startCreate"><el-icon><Plus /></el-icon>新建知识库</el-button>
    </div>

    <el-table :data="kbStore.knowledgeBases" v-loading="kbStore.kbLoading" max-height="380">
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="department" label="部门" width="110">
        <template #default="{ row }">{{ row.department || '全部' }}</template>
      </el-table-column>
      <el-table-column prop="documentCount" label="文档数" width="80" align="center" />
      <el-table-column label="安全等级" width="100">
        <template #default="{ row }">{{ ['-', '公开', '内部', '机密'][row.securityLevel || 1] }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'DISABLED' ? 'info' : 'success'" size="small">
            {{ row.status === 'DISABLED' ? '已停用' : '使用中' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="startEdit(row)"><el-icon><Edit /></el-icon>编辑</el-button>
          <el-button link :type="row.status === 'DISABLED' ? 'success' : 'warning'" @click="toggleStatus(row)">
            {{ row.status === 'DISABLED' ? '启用' : '停用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="formVisible" class="editor-card">
      <div class="editor-title">{{ editingId ? '编辑知识库' : '新建知识库' }}</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属部门">
              <el-select v-model="form.department" clearable placeholder="全部部门">
                <el-option v-for="item in DEPARTMENTS" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="默认安全等级">
              <el-select v-model="form.securityLevel">
                <el-option v-for="item in SECURITY_LEVELS" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
        <div class="editor-actions">
          <el-button @click="formVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="save">保存</el-button>
        </div>
      </el-form>
    </div>
  </el-dialog>
</template>

<style scoped>
.kb-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.kb-toolbar p { margin: 0; color: #6b7280; font-size: 13px; }
.editor-card { margin-top: 18px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb; }
.editor-title { margin-bottom: 12px; font-weight: 650; color: #111827; }
.editor-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
