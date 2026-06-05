<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑算法' : '添加算法'" width="480px"
    :close-on-click-modal="false" destroy-on-close @open="handleOpen"
    class="alg-edit-dialog">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="pageLoading">

      <el-form-item label="AlgorithmID" prop="algorithmId">
        <el-input v-model="form.algorithmId" placeholder="PascalCase，如 motion_detection" />
      </el-form-item>

      <el-form-item label="算法名称" prop="nameZh">
        <div class="lang-row">
          <el-input v-model="form.algorithmName['1']" placeholder="请输入中文名称" style="flex:1" />
          <span class="i18n-icon" title="多语言配置" @click="langDialogVisible = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </span>
        </div>
      </el-form-item>

      <el-form-item label="图标">
        <el-upload
          class="icon-upload"
          action="#"
          :show-file-list="false"
          :before-upload="handleIconUpload"
          accept="image/*"
        >
          <div class="icon-upload-trigger">
            <img v-if="form.algorithmIcon" :src="form.algorithmIcon" class="icon-preview" />
            <div v-else class="icon-placeholder">
              <el-icon :size="28"><Plus /></el-icon>
              <span>上传图标</span>
            </div>
          </div>
        </el-upload>
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button @click="visible = false" :disabled="loading">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEdit ? '确认保存' : '确认创建' }}
      </el-button>
    </template>
  </el-dialog>

  <LangDialog v-model:visible="langDialogVisible" v-model:data="form.algorithmName" title="配置多语言算法名称" />
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import LangDialog from '@/views/algorithm/LangDialog.vue'
import { getAlgorithm, addAlgorithm, updateAlgorithm } from './data'

const visible = defineModel('visible', { default: false })
const props = defineProps({ editId: { type: [Number, String], default: null } })
const emit = defineEmits(['success'])

const formRef = ref()
const loading = ref(false)
const pageLoading = ref(false)
const isEdit = computed(() => !!props.editId)
const langDialogVisible = ref(false)

const form = reactive({
  algorithmId: '',
  algorithmName: { '1': '' },
  algorithmIcon: ''
})

const rules = {
  algorithmId: [{ required: true, message: '请输入 AlgorithmID', trigger: 'blur' }]
}

function handleIconUpload(file) {
  const reader = new FileReader()
  reader.onload = (e) => { form.algorithmIcon = e.target.result }
  reader.readAsDataURL(file)
  return false
}

async function loadDetail() {
  if (!props.editId) return
  pageLoading.value = true
  try {
    const res = getAlgorithm(props.editId)
    if (res.code === 0 && res.data) {
      const d = res.data
      form.algorithmId = d.algorithmId || ''
      try { form.algorithmName = JSON.parse(d.algorithmName || '{}') } catch { form.algorithmName = { '1': '' } }
      form.algorithmIcon = d.algorithmIcon || ''
    }
  } catch { /* ignore */ } finally { pageLoading.value = false }
}

function resetForm() {
  form.algorithmId = ''
  form.algorithmName = { '1': '' }
  form.algorithmIcon = ''
}

function handleOpen() { isEdit.value ? loadDetail() : resetForm() }

async function handleSubmit() {
  await formRef.value?.validate()
  if (!form.algorithmName['1']) { ElMessage.warning('请至少填写中文名称'); return }

  loading.value = true
  try {
    const data = {
      algorithmId: form.algorithmId,
      algorithmIcon: form.algorithmIcon,
      algorithmName: JSON.stringify(form.algorithmName)
    }
    const res = isEdit.value
      ? updateAlgorithm({ id: props.editId, ...data })
      : addAlgorithm(data)
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '算法更新成功' : '算法创建成功')
      emit('success')
    }
  } catch { /* ignore */ } finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.lang-row { display: flex; align-items: center; gap: 8px; width: 100%; }

.icon-upload { width: 100%; }
.icon-upload-trigger {
  width: 100px; height: 100px;
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color .2s;
  overflow: hidden;
  &:hover { border-color: var(--primary-color); }
}
.icon-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  color: var(--text-placeholder); font-size: 12px;
}
.icon-preview {
  width: 100%; height: 100%;
  object-fit: cover;
}
</style>

<style lang="scss">
.alg-edit-dialog .el-dialog__body { padding-top: 20px; }
</style>
