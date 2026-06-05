<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑事件' : '添加事件'" width="560px"
    :close-on-click-modal="false" destroy-on-close @open="handleOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="pageLoading">

      <el-form-item label="EventID" prop="eventId">
        <el-input-number v-model="form.eventId" :min="1" :disabled="isEdit"
          style="width:100%" placeholder="请输入事件 ID，如 100000" />
      </el-form-item>

      <el-form-item label="事件名称" prop="nameZh">
        <div class="lang-row">
          <el-input v-model="form.eventName['1']" placeholder="请输入中文事件名称" style="flex:1" />
          <span class="i18n-icon" title="多语言配置" @click="langType='name'; langDialogVisible=true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </span>
        </div>
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="form.eventRemark" placeholder="内部备注（选填）" />
      </el-form-item>

      <el-form-item label="推送文案" prop="pushZh">
        <div class="lang-row">
          <el-input v-model="form.pushCopy['1']" placeholder="APP 收到事件时展示的推送文案" style="flex:1" />
          <span class="i18n-icon" title="多语言配置" @click="langType='push'; langDialogVisible=true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </span>
        </div>
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button @click="visible = false" :disabled="loading">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEdit ? '确认保存' : '确认创建' }}
      </el-button>
    </template>
  </el-dialog>

  <LangDialog v-model:visible="langDialogVisible" v-model:data="langData" :title="langTitle" />
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import LangDialog from './LangDialog.vue'
import { getEvent, addEvent, updateEvent } from '@/views/iot/thing-model/data'

const visible = defineModel('visible', { default: false })
const props = defineProps({ editId: { type: [Number, String], default: null } })
const emit = defineEmits(['success'])

const formRef = ref()
const loading = ref(false)
const pageLoading = ref(false)
const isEdit = computed(() => !!props.editId)

const langDialogVisible = ref(false)
const langType = ref('name')
const langTitle = computed(() => langType.value === 'name' ? '配置多语言事件名称' : '配置多语言推送文案')
const langData = computed({
  get: () => langType.value === 'name' ? form.eventName : form.pushCopy,
  set: (val) => { if (langType.value === 'name') form.eventName = val; else form.pushCopy = val }
})

const form = reactive({
  eventId: null, eventName: { '1': '' }, eventRemark: '', pushCopy: { '1': '' }
})

const rules = {
  eventId: [{ required: true, message: '请输入 EventID', trigger: 'blur' }]
}

async function loadDetail() {
  if (!props.editId) return
  pageLoading.value = true
  try {
    const res = getEvent(props.editId)
    if (res.code === 0 && res.data) {
      const d = res.data
      form.eventId = d.eventId
      try { form.eventName = JSON.parse(d.eventName || '{}') } catch { form.eventName = { '1': '' } }
      form.eventRemark = d.eventRemark || ''
      try { form.pushCopy = JSON.parse(d.pushCopy || '{}') } catch { form.pushCopy = { '1': '' } }
    }
  } catch { /* ignore */ } finally { pageLoading.value = false }
}

function resetForm() { form.eventId = null; form.eventName = { '1': '' }; form.eventRemark = ''; form.pushCopy = { '1': '' } }
function handleOpen() { isEdit.value ? loadDetail() : resetForm() }

async function handleSubmit() {
  await formRef.value?.validate()
  if (!form.eventName['1']) { ElMessage.warning('请至少填写中文名称'); return }
  if (!form.pushCopy['1']) { ElMessage.warning('请至少填写中文推送文案'); return }

  loading.value = true
  try {
    const data = {
      eventId: form.eventId, eventRemark: form.eventRemark,
      eventName: JSON.stringify(form.eventName), pushCopy: JSON.stringify(form.pushCopy)
    }
    const res = isEdit.value
      ? updateEvent({ id: props.editId, ...data })
      : addEvent(data)
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '事件更新成功' : '事件创建成功')
      emit('success')
    }
  } catch { /* ignore */ } finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.lang-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.lang-label { font-size: 13px; color: var(--text-regular); white-space: nowrap; }
</style>
