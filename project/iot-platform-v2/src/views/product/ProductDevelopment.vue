<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      <!-- Page intro -->
      <div class="px-5 pt-4 pb-3 border-b border-slate-200 bg-white">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-base font-bold text-slate-900 tracking-tight">产品开发</h1>
            <p class="text-[11px] text-slate-500 leading-relaxed mt-1 max-w-3xl">
              产品是一组具有相关功能定义的设备集合，创建产品是使用平台的开始。创建产品后通过功能定义 → 设备交互 → 硬件开发 → 产品配置 → 产品调试，简单五步即可完成产品智能化。
            </p>
          </div>
          <button class="link-action whitespace-nowrap" @click="openDocs">产品开发操作文档 →</button>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="px-4 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2">
        <el-select v-model="filter.tag" placeholder="标签" clearable size="small" style="width:105px">
          <el-option label="全部" value="" />
          <el-option label="wifi" value="wifi" />
        </el-select>
        <el-select v-model="filter.sortType" placeholder="创建时间顺序" clearable size="small" style="width:140px">
          <el-option label="创建时间" value="createTime" />
          <el-option label="更新时间" value="updateTime" />
        </el-select>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-medium text-slate-500">产品ID</span>
          <el-input v-model="filter.productId" placeholder="产品ID" clearable size="small" style="width:130px" />
        </div>
        <el-input v-model="filter.name" placeholder="产品ID / 产品名称 / 产品型号" clearable size="small" style="width:240px" />
        <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
        <el-button size="small" @click="handleReset">重置</el-button>
        <div class="flex-1" />
        <button class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all" @click="handleCreate">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" /></svg>
          <span>创建产品</span>
        </button>
      </div>

      <!-- Criteria chips -->
      <div class="px-4 py-2 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-semibold text-slate-500">筛选条件:</span>
          <span class="criteria-chip"><span class="text-slate-400">产品类目:</span><span class="font-medium text-slate-700">{{ filter.category || '全部' }}</span></span>
          <span class="criteria-chip"><span class="text-slate-400">开发状态:</span><span class="font-medium text-slate-700">{{ filter.status || '全部' }}</span></span>
          <span class="criteria-chip"><span class="text-slate-400">开发方式:</span><span class="font-medium text-slate-700">{{ filter.devMethod || '全部' }}</span></span>
        </div>
        <button class="text-[11px] text-slate-500 hover:text-sky-600 transition-colors" @click="handleReset">重置筛选</button>
      </div>

      <!-- Referenced tip -->
      <div v-if="hasReferenced" class="mx-4 mt-3 tip-bar">
        <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
        <span>引用产品为只读状态，不支持编辑和发布操作。如需修改请联系来源企业获取最新版本。</span>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-auto bg-white mt-3">
        <el-table :data="pagedData" class="stitch-table">
          <el-table-column label="产品信息" min-width="250">
            <template #default="{ row }">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 text-sm font-bold flex-shrink-0">{{ row.name.charAt(0) }}</div>
                <div class="min-w-0">
                  <button class="cell-name hover:text-sky-700 transition-colors" @click="handleManageProduct(row)">{{ row.name }}</button>
                  <div class="font-mono text-[10px] text-slate-400 mt-0.5">产品ID: {{ row.productId }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类目" width="120"><template #default="{ row }"><span class="cell-text">{{ row.category }}</span></template></el-table-column>
          <el-table-column label="开发方式" width="110"><template #default="{ row }"><span class="cell-text">{{ devMethodLabel(row.devMethod) }}</span></template></el-table-column>
          <el-table-column label="来源企业" width="120" show-overflow-tooltip><template #default="{ row }"><span class="cell-text">{{ row.sourceCompany }}</span></template></el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }"><span class="status-tag" :class="statusCls(row.status)">{{ statusLabel(row.status) }}</span></template>
          </el-table-column>
          <el-table-column label="授权信息" width="110">
            <template #default="{ row }"><span class="text-[11px]" :class="row.status === 'referenced' ? 'text-slate-400' : 'text-slate-600'">{{ row.authInfo }}</span></template>
          </el-table-column>
          <el-table-column label="操作人" width="90"><template #default="{ row }"><span class="cell-text">{{ row.operator }}</span></template></el-table-column>
          <el-table-column label="所属企业" width="120" show-overflow-tooltip><template #default="{ row }"><span class="cell-text">{{ row.company }}</span></template></el-table-column>
          <el-table-column label="创建时间" width="110"><template #default="{ row }"><span class="cell-time">{{ row.createTime }}</span></template></el-table-column>
          <el-table-column label="更新时间" width="110"><template #default="{ row }"><span class="cell-time">{{ row.updateTime }}</span></template></el-table-column>
          <el-table-column label="操作" width="230" align="right" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <template v-if="row.status === 'published'">
                  <button class="link-action" @click="handleAppConfig(row)">App配置</button>
                  <button class="link-action" @click="handleAddFirmware(row)">添加固件</button>
                  <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                    <button class="link-action inline-flex items-center gap-0.5">更多
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="copy">复制产品</el-dropdown-item>
                        <el-dropdown-item command="viewDetail">查看详情</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <template v-else-if="row.status === 'publishing'">
                  <button class="link-action" @click="handleCopy(row)">复制产品</button>
                  <button class="link-action" @click="handleAddFirmware(row)">添加固件</button>
                  <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                    <button class="link-action inline-flex items-center gap-0.5">更多
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="viewDetail">查看详情</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <template v-else-if="row.status === 'developing'">
                  <button class="link-action" @click="handleContinueDev(row)">继续开发</button>
                  <button class="link-action" @click="handleAddFirmware(row)">添加固件</button>
                  <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                    <button class="link-action inline-flex items-center gap-0.5">更多
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="copy">复制产品</el-dropdown-item>
                        <el-dropdown-item command="viewDetail">查看详情</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <span v-else class="text-xs text-slate-300">—</span>
              </div>
            </template>
          </el-table-column>
          <template #empty><div class="empty-box"><span>暂无产品数据</span><button class="link-action" @click="handleCreate">+ 创建产品</button></div></template>
        </el-table>
      </div>

      <footer class="h-12 border-t border-slate-200 bg-white px-5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span>共 <strong class="font-semibold text-slate-700">{{ filteredData.length }}</strong> 个产品</span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="sizes, prev, pager, next, jumper"
          size="small"
        />
      </footer>
    </main>

    <!-- Create dialog -->
    <el-dialog v-model="createDialogVisible" title="创建产品" width="560px" top="8vh" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" label-width="90px">
        <el-form-item label="产品ID" required>
          <el-input v-model="createForm.productId" placeholder="例: IPC_PRO_001" maxlength="64" class="!font-mono" />
        </el-form-item>
        <el-form-item label="产品名称" required>
          <el-input v-model="createForm.name" placeholder="请输入产品名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="产品类目" required>
          <el-select v-model="createForm.category" placeholder="请选择产品类目" style="width:100%">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="开发方式" required>
          <el-select v-model="createForm.devMethod" placeholder="请选择开发方式" style="width:100%">
            <el-option label="标准开发" value="standard" />
            <el-option label="自定义开发" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入产品描述（选填）" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createSubmitting" @click="handleCreateSubmit">确定创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// ===== Filters =====
const filter = reactive({
  name: '',
  status: '',
  devMethod: '',
  category: '',
  dateRange: null,
  tag: '',
  productId: '',
  sortType: 'createTime'
})
const categoryOptions = ['香薰机', 'IPC摄像机', '智能门铃', '传感安防', '低功耗摄像机', '长电球机']

function handleSearch() { pagination.page = 1 }
function handleReset() {
  filter.name = ''
  filter.status = ''
  filter.devMethod = ''
  filter.category = ''
  filter.dateRange = null
  filter.tag = ''
  filter.productId = ''
  filter.sortType = 'createTime'
  pagination.page = 1
}
function openDocs() {
  ElMessage.info('打开产品开发操作文档')
}

// ===== Mock data =====
const productList = ref([
  { id: 0, productId: 'AROMA_001', name: '智能香薰机', category: '香薰机', devMethod: 'standard', sourceCompany: '本公司', status: 'developing', authInfo: '未授权', operator: '张三', company: '本公司', createTime: '2026-09-01', updateTime: '2026-09-05' },
  { id: 1, productId: 'IPC_PRO_001', name: 'IPC Pro 智能摄像机', category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '本公司', status: 'published', authInfo: '已授权 3/5', operator: '张三', company: '本公司', createTime: '2026-01-15', updateTime: '2026-05-20' },
  { id: 2, productId: 'DOORBELL_001', name: '智能门铃 Pro', category: '智能门铃', devMethod: 'custom', sourceCompany: '本公司', status: 'developing', authInfo: '未授权', operator: '李四', company: '本公司', createTime: '2026-03-01', updateTime: '2026-05-18' },
  { id: 3, productId: 'SENSOR_001', name: '烟感传感器', category: '传感安防', devMethod: 'standard', sourceCompany: '合作企业A', status: 'referenced', authInfo: '只读引用', operator: '王五', company: '合作企业A', createTime: '2026-02-10', updateTime: '2026-04-01' },
  { id: 4, productId: 'IPC_LITE_001', name: 'IPC Lite 室内摄像机', category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '本公司', status: 'publishing', authInfo: '已授权 2/3', operator: '赵六', company: '本公司', createTime: '2026-04-10', updateTime: '2026-05-22' },
  { id: 5, productId: 'LOCK_001', name: '智能门锁 T1', category: '智能门铃', devMethod: 'custom', sourceCompany: '合作企业B', status: 'developing', authInfo: '未授权', operator: '孙七', company: '合作企业B', createTime: '2026-04-20', updateTime: '2026-05-19' },
  { id: 6, productId: 'ALARM_001', name: '安防告警套装', category: '传感安防', devMethod: 'standard', sourceCompany: '本公司', status: 'published', authInfo: '已授权 5/5', operator: '张三', company: '本公司', createTime: '2026-01-20', updateTime: '2026-05-21' },
  { id: 7, productId: 'CAM_OUT_001', name: '户外球机', category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '合作企业C', status: 'referenced', authInfo: '只读引用', operator: '周八', company: '合作企业C', createTime: '2026-03-15', updateTime: '2026-03-15' },
  { id: 8, productId: 'IPC_AI_001', name: 'AI 智能分析摄像机', category: 'IPC摄像机', devMethod: 'custom', sourceCompany: '本公司', status: 'developing', authInfo: '未授权', operator: '李四', company: '本公司', createTime: '2026-05-01', updateTime: '2026-05-23' },
  { id: 9, productId: 'BELL_002', name: '可视门铃 Mini', category: '智能门铃', devMethod: 'standard', sourceCompany: '本公司', status: 'published', authInfo: '已授权 1/2', operator: '赵六', company: '本公司', createTime: '2026-02-28', updateTime: '2026-05-17' },
  { id: 10, productId: 'GAS_001', name: '燃气泄漏检测器', category: '传感安防', devMethod: 'standard', sourceCompany: '本公司', status: 'publishing', authInfo: '已授权 4/5', operator: '张三', company: '本公司', createTime: '2026-04-05', updateTime: '2026-05-24' },
  { id: 11, productId: 'IPC_5G_001', name: '5G 超高清摄像机', category: 'IPC摄像机', devMethod: 'custom', sourceCompany: '本公司', status: 'developing', authInfo: '未授权', operator: '孙七', company: '本公司', createTime: '2026-05-10', updateTime: '2026-05-25' },
  { id: 12, productId: 'DOOR_002', name: '智能门磁传感器', category: '传感安防', devMethod: 'standard', sourceCompany: '合作企业A', status: 'referenced', authInfo: '只读引用', operator: '王五', company: '合作企业A', createTime: '2026-03-20', updateTime: '2026-03-20' }
])

const filteredData = computed(() => {
  let list = productList.value
  if (filter.name) {
    const kw = filter.name.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(kw) || p.productId.toLowerCase().includes(kw))
  }
  if (filter.productId) {
    const pid = filter.productId.toLowerCase()
    list = list.filter(p => p.productId.toLowerCase().includes(pid))
  }
  if (filter.status) list = list.filter(p => p.status === filter.status)
  if (filter.devMethod) list = list.filter(p => p.devMethod === filter.devMethod)
  if (filter.category) list = list.filter(p => p.category === filter.category)
  if (filter.dateRange && filter.dateRange.length === 2) {
    const [s, e] = filter.dateRange
    list = list.filter(p => p.createTime >= s && p.createTime <= e)
  }
  return list
})
const hasReferenced = computed(() => filteredData.value.some(p => p.status === 'referenced'))

const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const statusMap = { developing: '开发中', publishing: '发布中', published: '已发布', referenced: '引用产品' }
const statusClsMap = { developing: 's-dev', publishing: 's-pubing', published: 's-pubed', referenced: 's-ref' }
const devMethodMap = { standard: '标准开发', custom: '自定义开发' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }
function devMethodLabel(m) { return devMethodMap[m] || m }

// ===== Create product =====
const createDialogVisible = ref(false)
const createForm = reactive({ productId: '', name: '', category: '', devMethod: 'standard', description: '' })
const createFormRef = ref(null)
const createSubmitting = ref(false)

function handleCreate() {
  Object.assign(createForm, { productId: '', name: '', category: '', devMethod: 'standard', description: '' })
  createDialogVisible.value = true
}
async function handleCreateSubmit() {
  if (!createForm.productId.trim() || !createForm.name.trim() || !createForm.category) {
    ElMessage.warning('请填写产品ID、产品名称和产品类目')
    return
  }
  createSubmitting.value = true
  try {
    const now = new Date().toISOString().slice(0, 10)
    productList.value.unshift({
      id: Date.now(),
      productId: createForm.productId.trim(),
      name: createForm.name.trim(),
      category: createForm.category,
      devMethod: createForm.devMethod,
      description: createForm.description.trim(),
      sourceCompany: '本公司',
      status: 'developing',
      authInfo: '未授权',
      operator: '当前用户',
      company: '本公司',
      createTime: now,
      updateTime: now
    })
    ElMessage.success(`产品「${createForm.name}」创建成功`)
    createDialogVisible.value = false
  } finally {
    createSubmitting.value = false
  }
}

// ===== Actions =====
function handleContinueDev(row) {
  router.push(`/product-new/config?id=${row.productId}&name=${row.name}&category=${row.category}`)
}
function handleManageProduct(row) {
  router.push({ path: '/product-new/audit/detail', query: { productId: row.productId, name: row.name } })
}
function handleAppConfig(row) {
  router.push({ path: '/product-new/config', query: { id: row.productId, name: row.name, category: row.category, step: '2' } })
}
function handleAddFirmware(row) {
  ElMessage.info(`添加固件 - ${row.name}`)
}
function handleCopy(row) {
  const copy = { ...row, id: Date.now(), productId: row.productId + '_COPY', name: row.name + '（副本）' }
  productList.value.unshift(copy)
  ElMessage.success(`已复制产品「${row.name}」`)
}
function handleMore(cmd, row) {
  switch (cmd) {
    case 'copy': handleCopy(row); break
    case 'viewDetail': handleManageProduct(row); break
    case 'delete':
      ElMessageBox.confirm(`确定删除产品「${row.name}」？`, '删除确认', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        productList.value = productList.value.filter(p => p.id !== row.id)
        ElMessage.success('已删除')
      }).catch(() => {})
      break
  }
}
</script>

<style scoped>
.cell-name { font-size: 12px; font-weight: 600; color: #0f172a; }
.cell-text { font-size: 12px; color: #475569; }
.cell-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; }
.row-actions { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
</style>
