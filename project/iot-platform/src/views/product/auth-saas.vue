<template>
  <div class="page-container">
    <div class="card filter-bar">
      <el-form :model="filter" inline>
        <el-form-item label="SaaS名称">
          <el-input v-model="filter.name" placeholder="请输入SaaS名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="授权状态">
          <el-select v-model="filter.status" placeholder="全部" clearable style="width:130px">
            <el-option label="已授权" value="authorized" />
            <el-option label="未授权" value="unauthorized" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker v-model="filter.dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card" style="margin-top:12px;overflow:hidden">
      <div class="card-header">
        <span class="card-title">授权SaaS列表</span>
        <el-button type="primary" size="small" @click="handleGrant">
          <el-icon><Plus /></el-icon>新增授权
        </el-button>
      </div>
      <el-table v-if="filteredData.length" :data="pagedData" stripe>
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">{{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="SaaS平台" min-width="160">
          <template #default="{ row }">
            <div class="item-info">
              <span class="item-name">{{ row.name }}</span>
              <span class="item-id">{{ row.platform }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="授权产品" min-width="160">
          <template #default="{ row }">
            <span class="cell-text">{{ row.productName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="授权类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="authTypeTagMap[row.authType]" size="small">{{ authTypeLabel(row.authType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="授权状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', statusCls(row.status)]">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="授权有效期" width="180" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.startDate }} 至 {{ row.endDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-time">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button size="small" text type="primary" @click="handleView(row)">查看</el-button>
              <el-button size="small" text type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" text type="danger" @click="handleRevoke(row)">撤销</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">暂无数据</div>
      <div class="pagination-wrap">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper" background />
      </div>
    </div>

    <!-- 新增/编辑授权弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'grant' ? '新增SaaS授权' : '编辑SaaS授权'" width="550px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="SaaS平台" required>
          <el-select v-model="form.platform" placeholder="请选择SaaS平台" style="width:100%">
            <el-option label="ALEXA" value="ALEXA" />
            <el-option label="GOOGLE_HOME" value="GOOGLE_HOME" />
            <el-option label="小米IoT" value="MIOT" />
            <el-option label="华为HiLink" value="HILINK" />
            <el-option label="HomeKit" value="HOMEKIT" />
          </el-select>
        </el-form-item>
        <el-form-item label="授权产品" required>
          <el-select v-model="form.productId" placeholder="请选择授权产品" filterable style="width:100%">
            <el-option v-for="p in productOptions" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="授权类型" required>
          <el-select v-model="form.authType" placeholder="请选择授权类型" style="width:100%">
            <el-option label="基础授权" value="basic" />
            <el-option label="标准授权" value="standard" />
            <el-option label="高级授权" value="advanced" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker v-model="form.dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filter = reactive({ name: '', status: '', dateRange: null })

const authTypeLabelMap = { basic: '基础授权', standard: '标准授权', advanced: '高级授权' }
const authTypeTagMap = { basic: 'info', standard: '', advanced: 'warning' }
function authTypeLabel(t) { return authTypeLabelMap[t] || t }

const statusMap = { authorized: '已授权', unauthorized: '未授权', expired: '已过期' }
const statusClsMap = { authorized: 's-pubed', unauthorized: 's-dev', expired: 's-ref' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }

const productOptions = [
  { id: 1, name: 'IPC Pro 智能摄像机' },
  { id: 2, name: '智能门铃 Pro' },
  { id: 3, name: '4G产品设备0601' }
]

const saasList = ref([
  { id: 1, name: 'Amazon Alexa', platform: 'ALEXA', productName: 'IPC Pro 智能摄像机', authType: 'standard', status: 'authorized', startDate: '2026-01-01', endDate: '2027-01-01', createTime: '2026-01-01 10:00:00' },
  { id: 2, name: 'Google Home', platform: 'GOOGLE_HOME', productName: '智能门铃 Pro', authType: 'basic', status: 'authorized', startDate: '2026-03-15', endDate: '2027-03-15', createTime: '2026-03-15 14:00:00' },
  { id: 3, name: '小米IoT', platform: 'MIOT', productName: '4G产品设备0601', authType: 'advanced', status: 'expired', startDate: '2025-06-01', endDate: '2026-06-01', createTime: '2025-06-01 09:00:00' },
  { id: 4, name: '华为HiLink', platform: 'HILINK', productName: 'IPC Pro 智能摄像机', authType: 'standard', status: 'unauthorized', startDate: '—', endDate: '—', createTime: '2026-06-05 16:00:00' }
])

const filteredData = computed(() => {
  let list = saasList.value
  if (filter.name) { const kw = filter.name.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(kw) || s.platform.toLowerCase().includes(kw)) }
  if (filter.status) list = list.filter(s => s.status === filter.status)
  if (filter.dateRange && filter.dateRange.length === 2) { const [s, e] = filter.dateRange; list = list.filter(s => s.createTime >= s && s.createTime <= e) }
  return list
})

const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

function handleSearch() { pagination.page = 1 }
function handleReset() { filter.name = ''; filter.status = ''; filter.dateRange = null; pagination.page = 1 }

const dialogVisible = ref(false)
const dialogMode = ref('grant')
const form = reactive({ platform: '', productId: '', authType: '', dateRange: null })
let editingId = null

function handleGrant() {
  dialogMode.value = 'grant'; editingId = null
  Object.assign(form, { platform: '', productId: '', authType: '', dateRange: null })
  dialogVisible.value = true
}
function handleEdit(row) {
  dialogMode.value = 'edit'; editingId = row.id
  Object.assign(form, { platform: row.platform, productId: productOptions.find(p => p.name === row.productName)?.id || '', authType: row.authType, dateRange: row.startDate === '—' ? null : [row.startDate, row.endDate] })
  dialogVisible.value = true
}
function handleSubmit() {
  if (!form.platform || !form.productId || !form.authType) { ElMessage.warning('请填写必填项'); return }
  if (dialogMode.value === 'grant') {
    const product = productOptions.find(p => p.id === form.productId)
    saasList.value.unshift({
      id: Date.now(), name: form.platform, platform: form.platform, productName: product?.name || '—',
      authType: form.authType, status: 'authorized',
      startDate: form.dateRange?.[0] || new Date().toISOString().slice(0, 10),
      endDate: form.dateRange?.[1] || '—', createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
    ElMessage.success('授权成功')
  } else {
    ElMessage.success('保存成功')
  }
  dialogVisible.value = false
}
function handleView(row) { ElMessage.info(`查看 - ${row.name}`) }
function handleRevoke(row) {
  ElMessageBox.confirm(`确定撤销「${row.name}」的授权？`, '撤销确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { row.status = 'unauthorized'; ElMessage.success('已撤销') }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.filter-bar { padding: var(--spacing-md) var(--spacing-lg); }
.item-info { display: flex; flex-direction: column; .item-name { font-weight: 500; color: var(--text-primary); } .item-id { font-size: 13px; color: var(--text-placeholder); font-family: monospace; margin-top: 2px; } }
.cell-time { font-size: 13px; color: var(--text-secondary); }
.cell-text { font-size: 13px; color: var(--text-regular); }
.status-tag { display: inline-flex; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; &.s-pubed { background: #F0FDF4; color: #16A34A; } &.s-dev { background: #EFF6FF; color: #2563EB; } &.s-ref { background: #F3F4F6; color: #6B7280; } }
.action-btns { display: flex; align-items: center; gap: 2px; white-space: nowrap; }
.empty-state { display: flex; align-items: center; justify-content: center; padding: 60px 0; color: var(--text-placeholder); font-size: var(--font-md); }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 0; }
</style>
