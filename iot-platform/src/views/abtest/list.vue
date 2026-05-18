<template>
  <div class="page-container">
    <div class="card">
        <div class="card-header">
          <span class="card-title">实验列表</span>
          <el-button type="primary" @click="openDrawer('add')">
            <el-icon><Plus /></el-icon>
            创建实验
          </el-button>
        </div>
        <el-table :data="experiments" stripe>
          <el-table-column label="实验名称" min-width="180">
            <template #default="{ row }">
              <span class="text-medium">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="实验Key" width="180">
            <template #default="{ row }">
              <code class="key-tag">{{ row.key }}</code>
            </template>
          </el-table-column>
          <!-- TODO: 目标分群和变体URL暂时隐藏 -->
          <el-table-column label="流量" width="120">
            <template #default="{ row }">
              A {{ row.trafficA }}% / B {{ 100 - row.trafficA }}%
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="120" />
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                size="small" text type="primary" @click="startExperiment(row)"
              >启动</el-button>
              <el-button
                v-if="row.status !== 'ended'"
                size="small" text type="primary" @click="openDrawer('edit', row)"
              >编辑</el-button>
              <el-button
                v-if="row.status === 'running'"
                size="small" text type="warning" @click="pauseExperiment(row)"
              >暂停</el-button>
              <el-button
                v-if="row.status === 'paused'"
                size="small" text type="success" @click="resumeExperiment(row)"
              >恢复</el-button>
              <el-button
                size="small" text type="primary" @click="goDashboard(row)"
              >数据</el-button>
              <el-button
                v-if="row.status === 'ended' && row.winner"
                size="small" text type="success" @click="applyWinner(row)"
              >应用{{ row.winner }}(胜出)</el-button>
              <el-button
                size="small" text type="danger" @click="deleteExperiment(row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

    <!-- 创建/编辑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerMode === 'add' ? '创建实验' : '编辑实验'"
      size="560px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <span class="section-label">基础信息</span>

        <el-form-item label="实验名称" prop="name">
          <el-input v-model="form.name" placeholder="如：全能AI落地页v1 vs v2" />
        </el-form-item>

        <el-form-item label="实验Key" prop="key">
          <el-input
            v-model="form.key"
            placeholder="如：ai_landing_test_01"
            :disabled="drawerMode === 'edit'"
            class="mono-input"
          />
          <span class="form-hint">系统唯一标识，创建后不可修改</span>
        </el-form-item>

        <!-- TODO: 目标分群和变体URL暂时隐藏，后续开放 -->

        <span class="section-label">流量分配</span>

        <el-form-item label="变体A流量占比">
          <div class="slider-labels">
            <span>B 端</span>
            <span>A 端</span>
          </div>
          <el-slider v-model="form.trafficA" :min="0" :max="100" />
          <div class="traffic-display">
            <span class="traffic-a">A <strong>{{ form.trafficA }}</strong>%</span>
            <span class="traffic-b">B <strong>{{ 100 - form.trafficA }}</strong>%</span>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="2"
            placeholder="实验目的和假设说明（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveExperiment" :loading="saving">
          {{ drawerMode === 'add' ? '保存并启动' : '保存修改' }}
        </el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

const experiments = ref([
  {
    id: 1,
    name: '全能AI落地页 v1 vs v2',
    key: 'ai_landing_test_01',
    segment: '新注册用户',
    urlA: 'https://xxx.com/landing/ai_v1.html',
    urlB: 'https://xxx.com/landing/ai_v2.html',
    trafficA: 50,
    status: 'running',
    createdAt: '2026-05-14',
    winner: null
  },
  {
    id: 2,
    name: 'Pro套餐文案测试',
    key: 'ai_pro_copy_test',
    segment: '高价值用户',
    urlA: 'https://xxx.com/landing/ai_pro_v1.html',
    urlB: 'https://xxx.com/landing/ai_pro_v2.html',
    trafficA: 50,
    status: 'paused',
    createdAt: '2026-05-10',
    winner: null
  },
  {
    id: 3,
    name: '全量新用户落地页优化',
    key: 'ai_all_new_test',
    segment: '全部用户',
    urlA: 'https://xxx.com/landing/ai_all_v1.html',
    urlB: 'https://xxx.com/landing/ai_all_v2.html',
    trafficA: 50,
    status: 'ended',
    createdAt: '2026-04-20',
    winner: 'B'
  },
  {
    id: 4,
    name: '沉默用户触达实验',
    key: 'ai_silent_test',
    segment: '沉默用户',
    urlA: 'https://xxx.com/landing/ai_silent_v1.html',
    urlB: 'https://xxx.com/landing/ai_silent_v2.html',
    trafficA: 50,
    status: 'pending',
    createdAt: '2026-05-16',
    winner: null
  }
])

const drawerVisible = ref(false)
const drawerMode = ref('add')
const editingId = ref(null)
const saving = ref(false)
const formRef = ref(null)

const form = reactive({
  name: '',
  key: '',
  segment: 'new_user',
  urlA: '',
  urlB: '',
  trafficA: 50,
  note: ''
})

const rules = {
  name: [{ required: true, message: '请输入实验名称', trigger: 'blur' }],
  key: [
    { required: true, message: '请输入实验Key', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: '仅支持小写字母、数字、下划线', trigger: 'blur' }
  ],
  // segment/urlA/urlB 校验暂时隐藏
}

const statusType = (s) => {
  const map = { running: 'success', paused: 'warning', ended: 'info', pending: '' }
  return map[s] || 'info'
}

const statusLabel = (s) => {
  const map = { running: '运行中', paused: '已暂停', ended: '已结束', pending: '待启动' }
  return map[s] || s
}

const resetForm = () => {
  form.name = ''
  form.key = ''
  form.segment = 'new_user'
  form.urlA = ''
  form.urlB = ''
  form.trafficA = 50
  form.note = ''
  editingId.value = null
}

const openDrawer = (mode, row) => {
  resetForm()
  drawerMode.value = mode
  if (mode === 'edit' && row) {
    editingId.value = row.id
    form.name = row.name
    form.key = row.key
    form.segment = segmentValue(row.segment)
    form.urlA = row.urlA
    form.urlB = row.urlB
    form.trafficA = row.trafficA
    form.note = row.note || ''
  }
  drawerVisible.value = true
}

const saveExperiment = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  setTimeout(() => {
    if (drawerMode.value === 'add') {
      experiments.value.unshift({
        id: Date.now(),
        name: form.name,
        key: form.key,
        segment: segmentLabel(form.segment),
        urlA: form.urlA,
        urlB: form.urlB,
        trafficA: form.trafficA,
        status: 'running',
        createdAt: new Date().toISOString().slice(0, 10),
        winner: null
      })
      ElMessage.success('实验已创建并启动')
    } else {
      const exp = experiments.value.find(e => e.id === editingId.value)
      if (exp) {
        Object.assign(exp, {
          name: form.name,
          segment: segmentLabel(form.segment),
          urlA: form.urlA,
          urlB: form.urlB,
          trafficA: form.trafficA,
          note: form.note
        })
      }
      ElMessage.success('实验已更新')
    }
    drawerVisible.value = false
    saving.value = false
  }, 500)
}

const segmentLabel = (key) => {
  const map = { all: '全部用户', new_user: '新注册用户', high_value: '高价值用户', active: '活跃用户', silent: '沉默用户' }
  return map[key] || key
}

const segmentValue = (label) => {
  const map = { '全部用户': 'all', '新注册用户': 'new_user', '高价值用户': 'high_value', '活跃用户': 'active', '沉默用户': 'silent' }
  return map[label] || 'new_user'
}

const startExperiment = (row) => {
  ElMessageBox.confirm('确定启动该实验？启动后用户将被分流到变体A/B。', '启动实验', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    row.status = 'running'
    ElMessage.success('实验已启动')
  }).catch(() => {})
}

const pauseExperiment = (row) => {
  ElMessageBox.confirm('确定暂停该实验？暂停后所有用户将看到默认版本。', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    row.status = 'paused'
    ElMessage.success('实验已暂停')
  }).catch(() => {})
}

const resumeExperiment = (row) => {
  row.status = 'running'
  ElMessage.success('实验已恢复')
}

const applyWinner = (row) => {
  ElMessageBox.confirm(`确定将变体${row.winner}应用为默认配置？所有用户将立即看到该版本。`, '应用胜出变体', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    ElMessage.success(`变体${row.winner}已应用为默认配置`)
  }).catch(() => {})
}

const deleteExperiment = (row) => {
  ElMessageBox.confirm('确定删除该实验？此操作不可撤销。', '删除实验', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const idx = experiments.value.findIndex(e => e.id === row.id)
    if (idx >= 0) experiments.value.splice(idx, 1)
    ElMessage.success('实验已删除')
  }).catch(() => {})
}

const goDashboard = (row) => {
  router.push(`/abtest/${row.id}`)
}
</script>

<style lang="scss" scoped>
// ===== Table =====
.text-medium { font-weight: 500; color: var(--text-primary); }

.key-tag {
  font-size: var(--font-xs);
  color: var(--primary-color);
  background: var(--primary-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

.url-stack { display: flex; flex-direction: column; gap: 2px; }

.url-cell {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  font-family: monospace;
  max-width: 220px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ===== Drawer Form =====
.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  margin-top: 16px;

  &:first-child { margin-top: 0; }
}

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.form-hint { font-size: var(--font-xs); color: var(--text-placeholder); margin-top: 4px; display: block; }

// ===== Slider =====
.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-xs);
  color: var(--text-placeholder);
  margin-bottom: 4px;
}

.traffic-display {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: var(--font-md);
}

.traffic-a {
  color: var(--primary-color);
  strong { font-size: 18px; }
}

.traffic-b {
  color: var(--text-secondary);
  strong { font-size: 18px; }
}

// ===== Utilities =====
.w-full { width: 100%; }
.mono-input :deep(.el-input__inner) { font-family: monospace; }
.mono-input-sm :deep(.el-input__inner) { font-family: monospace; font-size: 12px; }
</style>
