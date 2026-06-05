<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑算法' : '添加算法'" width="720px"
    :close-on-click-modal="false" destroy-on-close @open="handleOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="pageLoading">

      <!-- 基本信息 -->
      <div class="section-title">基本信息</div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="AlgorithmID" prop="algorithmId">
            <el-input v-model="form.algorithmId" placeholder="PascalCase，如 motion_detection" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="算法名称" prop="nameZh">
        <div class="lang-row">
          <span class="lang-label">中文名称：</span>
          <el-input v-model="form.algorithmName['1']" placeholder="请输入中文名称" style="flex:1" />
          <el-button text type="primary" @click="langType='name'; langDialogVisible=true">多语言</el-button>
        </div>
      </el-form-item>

      <el-form-item label="图标">
        <el-input v-model="form.algorithmIcon" placeholder="icon name 或 emoji" />
      </el-form-item>

      <!-- 能力配置 -->
      <div class="section-title">能力配置</div>
      <el-row :gutter="8">
        <el-col v-for="cap in capOptions" :key="cap.key" :span="6">
          <el-checkbox v-model="form.capabilities[cap.key]" style="margin-bottom:8px">
            {{ cap.label }}
          </el-checkbox>
        </el-col>
      </el-row>

      <el-checkbox v-model="hasDetectType" style="margin-bottom:8px">侦测类型（子类型配置）</el-checkbox>
      <div v-if="hasDetectType" class="sub-table-wrap">
        <el-table :data="detectTypeRows" border size="small">
          <el-table-column label="Key" width="200">
            <template #default="{ row }">
              <el-input v-model="row.key" placeholder="如 motion" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="Value（中文）" width="200">
            <template #default="{ row }">
              <el-input v-model="row.value" placeholder="如 运动" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ $index }">
              <el-button size="small" text type="danger" @click="detectTypeRows.splice($index,1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button size="small" style="margin-top:8px" @click="detectTypeRows.push({key:'',value:''})">
          + 添加子类型
        </el-button>
      </div>

      <!-- 关联事件 -->
      <div class="section-title">关联事件</div>
      <div class="shuttle">
        <div class="shuttle-panel">
          <div class="shuttle-header">可选事件</div>
          <div class="shuttle-body">
            <div v-for="evt in availableEvents" :key="evt.eventId"
              class="shuttle-item" @click="toggleEvent(evt.eventId)">
              <span class="shuttle-id">{{ evt.eventId }}</span>
              <span class="shuttle-name">{{ evt._name?.['1'] || evt.eventId }}</span>
            </div>
            <div v-if="availableEvents.length === 0" class="shuttle-empty">无可选事件</div>
          </div>
        </div>
        <div class="shuttle-panel">
          <div class="shuttle-header">已选事件 ({{ selectedEvents.length }})</div>
          <div class="shuttle-body">
            <div v-for="evt in selectedEvents" :key="evt.eventId"
              class="shuttle-item selected" @click="toggleEvent(evt.eventId)">
              <span class="shuttle-id">{{ evt.eventId }}</span>
              <span class="shuttle-name">{{ evt._name?.['1'] || evt.eventId }}</span>
            </div>
            <div v-if="selectedEvents.length === 0" class="shuttle-empty">暂未选择</div>
          </div>
        </div>
      </div>

      <!-- 扩展属性 -->
      <div class="section-title">扩展属性（JSON）</div>
      <el-form-item>
        <el-input v-model="form.extendedProps" type="textarea" :rows="4"
          placeholder='{ "StatLine": { "type": "number" } }' />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false" :disabled="loading">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEdit ? '确认保存' : '确认创建' }}
      </el-button>
    </template>
  </el-dialog>

  <!-- 多语言子弹窗 -->
  <LangDialog v-model:visible="langDialogVisible" v-model:data="langData" :title="langTitle" />
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { algorithmApi } from '@/api/index.js'
import LangDialog from './LangDialog.vue'

const visible = defineModel('visible', { default: false })
const props = defineProps({ editId: { type: [Number, String], default: null } })
const emit = defineEmits(['success'])

const formRef = ref()
const loading = ref(false)
const pageLoading = ref(false)
const isEdit = computed(() => !!props.editId)

// 多语言子弹窗
const langDialogVisible = ref(false)
const langType = ref('name')
const langTitle = computed(() => langType.value === 'name' ? '配置多语言算法名称' : '配置多语言推送文案')

const langData = computed({
  get: () => langType.value === 'name' ? form.algorithmName : {},
  set: (val) => { if (langType.value === 'name') form.algorithmName = val }
})

// 能力选项
const capOptions = [
  { key: 'Switch', label: '开关' }, { key: 'Sensitivity', label: '灵敏度' },
  { key: 'Schedule', label: '定时侦测' }, { key: 'DetectArea', label: '自定义侦测区域' },
  { key: 'SoundAlarm', label: '声音告警' }, { key: 'AlarmRepeatCnt', label: '告警循环次数' },
  { key: 'CustomAudio', label: '自定义音频' }, { key: 'LightAlarm', label: '灯光告警' }
]

const form = reactive({
  algorithmId: '', algorithmName: { '1': '' }, algorithmIcon: '', sortOrder: 0,
  capabilities: Object.fromEntries(capOptions.map(c => [c.key, false])),
  eventIds: [], extendedProps: ''
})

const detectTypeRows = ref([])
const allEvents = ref([])

const hasDetectType = computed({
  get: () => detectTypeRows.value.length > 0,
  set: (val) => {
    if (!val) { detectTypeRows.value = [] }
    else if (detectTypeRows.value.length === 0) detectTypeRows.value.push({ key: '', value: '' })
  }
})

const selectedEvents = computed(() => allEvents.value.filter(e => form.eventIds.includes(e.eventId)))
const availableEvents = computed(() => allEvents.value.filter(e => !form.eventIds.includes(e.eventId)))

function toggleEvent(eid) {
  const idx = form.eventIds.indexOf(eid)
  if (idx === -1) form.eventIds.push(eid)
  else form.eventIds.splice(idx, 1)
}

const rules = {
  algorithmId: [{ required: true, message: '请输入 AlgorithmID', trigger: 'blur' }]
}

async function loadEvents() {
  try {
    const res = await algorithmApi.allEvent()
    if (res.code === 0) {
      allEvents.value = (res.data?.list || []).map(e => {
        try { e._name = JSON.parse(e.eventName || '{}') } catch { e._name = {} }
        return e
      })
    }
  } catch { /* ignore */ }
}

async function loadDetail() {
  if (!props.editId) return
  pageLoading.value = true
  try {
    const res = await algorithmApi.detailAlgorithm(props.editId)
    if (res.code === 0 && res.data) {
      const d = res.data
      form.algorithmId = d.algorithmId || ''
      try { form.algorithmName = JSON.parse(d.algorithmName || '{}') } catch { form.algorithmName = { '1': '' } }
      form.algorithmIcon = d.algorithmIcon || ''
      form.sortOrder = d.sortOrder ?? 0
      try { form.capabilities = JSON.parse(d.capabilities || '{}') } catch { form.capabilities = {} }
      capOptions.forEach(c => { if (!(c.key in form.capabilities)) form.capabilities[c.key] = false })
      const caps = form.capabilities
      if (caps.DetectType && typeof caps.DetectType === 'object' && Object.keys(caps.DetectType).length > 0) {
        detectTypeRows.value = Object.entries(caps.DetectType).map(([k, v]) => ({ key: k, value: v }))
      }
      try { form.eventIds = JSON.parse(d.eventIds || '[]') } catch { form.eventIds = [] }
      form.extendedProps = d.extendedProps || ''
    }
  } catch { /* ignore */ } finally { pageLoading.value = false }
}

function resetForm() {
  form.algorithmId = ''; form.algorithmName = { '1': '' }; form.algorithmIcon = ''
  form.sortOrder = 0; form.extendedProps = ''; form.eventIds = []
  form.capabilities = Object.fromEntries(capOptions.map(c => [c.key, false]))
  detectTypeRows.value = []
}

function handleOpen() { loadEvents(); isEdit.value ? loadDetail() : resetForm() }

async function handleSubmit() {
  await formRef.value?.validate()
  if (!form.algorithmName['1']) { ElMessage.warning('请至少填写中文名称'); return }

  const detectType = {}
  detectTypeRows.value.forEach(r => { if (r.key.trim() && r.value.trim()) detectType[r.key.trim()] = r.value.trim() })

  loading.value = true
  try {
    const data = {
      algorithmId: form.algorithmId, algorithmIcon: form.algorithmIcon, sortOrder: form.sortOrder,
      algorithmName: JSON.stringify(form.algorithmName),
      capabilities: JSON.stringify({ ...form.capabilities, DetectType: detectType }),
      eventIds: JSON.stringify(form.eventIds),
      extendedProps: form.extendedProps || ''
    }
    const res = isEdit.value
      ? await algorithmApi.updateAlgorithm({ id: props.editId, ...data })
      : await algorithmApi.addAlgorithm(data)
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '算法更新成功' : '算法创建成功')
      emit('success')
    }
  } catch { /* ignore */ } finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.section-title {
  font-size: var(--font-sm); font-weight: 600; color: var(--text-secondary);
  margin: 16px 0 12px; padding-bottom: 8px;
  border-bottom: 1px solid var(--border-lighter);
  &:first-child { margin-top: 0; }
}
.lang-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.lang-label { font-size: 13px; color: var(--text-regular); white-space: nowrap; }
.sub-table-wrap { margin-left: 22px; margin-bottom: 8px; }

.shuttle { display: flex; gap: 12px; }
.shuttle-panel {
  flex: 1; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); overflow: hidden;
  display: flex; flex-direction: column; max-height: 200px;
}
.shuttle-header {
  padding: 8px 12px; background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--font-xs); font-weight: 500; color: var(--text-secondary);
}
.shuttle-body { flex: 1; overflow-y: auto; }
.shuttle-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; cursor: pointer; font-size: 13px; user-select: none;
  border-bottom: 1px solid var(--border-lighter);
  &:hover { background: var(--bg-hover); }
  &.selected { background: var(--primary-bg); }
}
.shuttle-id { font-weight: 500; color: var(--text-primary); min-width: 60px; }
.shuttle-name { color: var(--text-regular); }
.shuttle-empty { padding: 32px; text-align: center; color: var(--text-placeholder); font-size: 13px; }
</style>
