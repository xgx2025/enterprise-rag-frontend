<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase'
import { DEPARTMENTS, SECURITY_LEVELS, DOCUMENT_ROLES, AUTHORITY_LEVELS } from '@/api/types'
import type { UploadFile, UploadRawFile } from 'element-plus'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'uploaded': []
}>()

const kbStore = useKnowledgeBaseStore()
const formRef = ref()
const uploading = ref(false)

const form = reactive({
  title: '',
  knowledgeBaseId: '',
  department: '',
  securityLevel: '1',
  version: 'V1.0',
  effectiveFrom: new Date().toISOString().split('T')[0],
  effectiveTo: '',
  allowedRoles: ['EMPLOYEE'],
  authorityLevel: '1',
})

const fileList = ref<UploadFile[]>([])

const rules = {
  title: [{ required: true, message: '请输入文档标题', trigger: 'blur' }],
  knowledgeBaseId: [{ required: true, message: '请选择知识库', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

function beforeUpload(file: UploadRawFile) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const allowedExts = ['pdf', 'docx', 'md', 'txt', 'html']

  if (ext && !allowedExts.includes(ext)) {
    ElMessage.error('仅支持 PDF、DOCX、MD、TXT、HTML 格式')
    return false
  }

  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 50MB')
    return false
  }

  return true
}

function onFileChange(file: UploadFile) {
  if (!form.title && file.name) {
    form.title = file.name.replace(/\.[^.]+$/, '')
  }
}

function disableEffectiveDate(date: Date): boolean {
  return !!form.effectiveFrom && date < new Date(`${form.effectiveFrom}T00:00:00`)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  uploading.value = true
  try {
    const fd = new FormData()
    const rawFile = fileList.value[0]?.raw
    if (!rawFile) {
      ElMessage.warning('请选择要上传的文件')
      return
    }
    fd.append('file', rawFile)
    fd.append('title', form.title)
    fd.append('knowledgeBaseId', form.knowledgeBaseId)
    fd.append('department', form.department)
    fd.append('securityLevel', form.securityLevel)
    fd.append('version', form.version)
    if (form.effectiveFrom) fd.append('effectiveFrom', form.effectiveFrom)
    if (form.effectiveTo) fd.append('effectiveTo', form.effectiveTo)
    form.allowedRoles.forEach(role => fd.append('allowedRoles', role))
    fd.append('authorityLevel', form.authorityLevel)

    await kbStore.uploadDocument(fd)
    ElMessage.success('上传成功，文档正在处理中')
    emit('uploaded')
    handleClose()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

function handleClose() {
  form.title = ''
  form.knowledgeBaseId = ''
  form.department = ''
  form.securityLevel = '1'
  form.version = 'V1.0'
  form.effectiveFrom = new Date().toISOString().split('T')[0]
  form.effectiveTo = ''
  form.allowedRoles = ['EMPLOYEE']
  form.authorityLevel = '1'
  fileList.value = []
  formRef.value?.resetFields()
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="上传文档"
    width="680px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      label-width="auto"
    >
      <el-form-item label="上传文件" required>
        <el-upload
          v-model:file-list="fileList"
          :auto-upload="false"
          :limit="1"
          :before-upload="beforeUpload"
          @change="onFileChange"
          drag
          class="upload-area"
        >
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            <p class="upload-hint">将文件拖拽到此处，或<em>点击上传</em></p>
            <p class="upload-formats">支持 PDF、DOCX、Markdown、TXT、HTML，最大 50MB</p>
            <p class="upload-storage">原文件将加密传输至企业私有阿里云 OSS Bucket</p>
          </div>
        </el-upload>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="文档标题" prop="title">
            <el-input v-model="form.title" placeholder="如：2026年差旅管理制度" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" placeholder="V1.0" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属知识库" prop="knowledgeBaseId">
            <el-select v-model="form.knowledgeBaseId" placeholder="选择知识库" class="w-full">
              <el-option
                v-for="kb in kbStore.activeKnowledgeBases"
                :key="kb.id"
                :label="kb.name"
                :value="kb.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="department">
            <el-select v-model="form.department" placeholder="选择部门" class="w-full">
              <el-option
                v-for="d in DEPARTMENTS"
                :key="d.value"
                :label="d.label"
                :value="d.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="安全等级" prop="securityLevel">
            <el-select v-model="form.securityLevel" class="w-full">
              <el-option
                v-for="s in SECURITY_LEVELS"
                :key="s.value"
                :label="s.label"
                :value="s.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生效日期" prop="effectiveFrom">
            <el-date-picker
              v-model="form.effectiveFrom"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="失效日期" prop="effectiveTo">
            <el-date-picker
              v-model="form.effectiveTo"
              type="date"
              placeholder="长期有效"
              value-format="YYYY-MM-DD"
              class="w-full"
              :disabled-date="disableEffectiveDate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权威等级" prop="authorityLevel">
            <el-select v-model="form.authorityLevel" class="w-full">
              <el-option v-for="item in AUTHORITY_LEVELS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="允许访问的角色" prop="allowedRoles">
        <el-select v-model="form.allowedRoles" multiple collapse-tags collapse-tags-tooltip class="w-full" placeholder="选择角色">
          <el-option v-for="item in DOCUMENT_ROLES" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div class="field-tip">权限将在检索阶段应用；未选择角色时仅知识库管理员可管理该文档。</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="uploading" @click="handleSubmit">
        {{ uploading ? '上传中...' : '确认上传' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  border-radius: 10px;
  border: 2px dashed #d1d5db;
  padding: 28px 20px;
  transition: border-color 0.2s;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: #6366f1;
}

.upload-icon {
  font-size: 40px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.upload-text {
  text-align: center;
}

.upload-hint {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.upload-hint em {
  color: #6366f1;
  font-style: normal;
  cursor: pointer;
}

.upload-formats {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.upload-storage {
  margin: 4px 0 0;
  font-size: 11px;
  color: #6366f1;
}

.field-tip {
  margin-top: 5px;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.4;
}

.w-full {
  width: 100%;
}
</style>
