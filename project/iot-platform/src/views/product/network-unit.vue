<template>
  <div class="page-container">
    <div class="card filter-bar">
      <el-form :model="filter" inline>
        <el-form-item label="配网单元名称">
          <el-input v-model="filter.name" placeholder="请输入配网单元名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="配网类型">
          <el-select v-model="filter.type" placeholder="全部" clearable style="width:150px">
            <el-option label="蓝牙配网" value="ble" />
            <el-option label="AP配网" value="ap" />
            <el-option label="二维码配网" value="qr" />
            <el-option label="有线配网" value="wired" />
            <el-option label="Sonud配网" value="sound" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="filter.dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card" style="margin-top:12px;overflow:hidden">
      <div class="card-header">
        <span class="card-title">配网单元列表</span>
        <el-button type="primary" size="small" @click="handleCreate">
          <el-icon><Plus /></el-icon>创建配网单元
        </el-button>
      </div>
      <el-table v-if="filteredData.length" :data="pagedData" stripe>
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">{{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="配网单元名称" min-width="160">
          <template #default="{ row }">
            <span class="link-text">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="配网单元ID" width="160" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.unitId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="配网类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]" size="small">{{ typeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联产品" min-width="140">
          <template #default="{ row }">
            <span class="cell-text">{{ row.productName || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', row.status === 'enabled' ? 's-pubed' : 's-ref']">
              {{ row.status === 'enabled' ? '启用' : '停用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-time">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button size="small" text type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" text type="primary" @click="handleView(row)">查看</el-button>
              <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">暂无数据</div>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper" background
        />
      </div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '创建配网单元' : '编辑配网单元'" width="550px" top="8vh" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="配网单元名称" required>
          <el-input v-model="form.name" placeholder="请输入配网单元名称" maxlength="40" />
        </el-form-item>
        <el-form-item label="配网类型" required>
          <el-select v-model="form.type" placeholder="请选择配网类型" style="width:100%">
            <el-option label="蓝牙配网" value="ble" />
            <el-option label="AP配网" value="ap" />
            <el-option label="二维码配网" value="qr" />
            <el-option label="有线配网" value="wired" />
            <el-option label="Sonud配网" value="sound" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联产品">
          <el-select v-model="form.productId" placeholder="请选择关联产品（选填）" filterable style="width:100%">
            <el-option v-for="p in productOptions" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" maxlength="200" show-word-limit />
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

const filter = reactive({ name: '', type: '', dateRange: null })

const typeLabelMap = { ble: '蓝牙配网', ap: 'AP配网', qr: '二维码配网', wired: '有线配网', sound: 'Sonud配网' }
const typeTagMap = { ble: '', ap: 'success', qr: 'warning', wired: 'info', sound: 'danger' }
function typeLabel(t) { return typeLabelMap[t] || t }

const productOptions = [
  { id: 1, name: 'IPC Pro 智能摄像机' },
  { id: 2, name: '智能门铃 Pro' },
  { id: 3, name: '4G产品设备0601' }
]

const unitList = ref([
  { id: 1, name: 'BLE快速配网V2', unitId: 'NW_BLE_V2_001', type: 'ble', productName: 'IPC Pro 智能摄像机', status: 'enabled', createTime: '2026-05-10 09:30:00' },
  { id: 2, name: 'AP热点配网', unitId: 'NW_AP_001', type: 'ap', productName: '—', status: 'enabled', createTime: '2026-05-08 14:20:00' },
  { id: 3, name: '扫码配网方案', unitId: 'NW_QR_003', type: 'qr', productName: '智能门铃 Pro', status: 'enabled', createTime: '2026-04-25 11:00:00' },
  { id: 4, name: 'Sonud声波配网', unitId: 'NW_SOUND_001', type: 'sound', productName: '—', status: 'enabled', createTime: '2026-04-10 08:45:00' },
  { id: 5, name: '有线直连配网', unitId: 'NW_WIRED_002', type: 'wired', productName: '4G产品设备0601', status: 'enabled', createTime: '2026-06-01 16:30:00' }
])

const filteredData = computed(() => {
  let list = unitList.value
  if (filter.name) { const kw = filter.name.toLowerCase(); list = list.filter(u => u.name.toLowerCase().includes(kw)) }
  if (filter.type) list = list.filter(u => u.type === filter.type)
  if (filter.dateRange && filter.dateRange.length === 2) {
    const [s, e] = filter.dateRange; list = list.filter(u => u.createTime >= s && u.createTime <= e)
  }
  return list
})

const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

function handleSearch() { pagination.page = 1 }
function handleReset() { filter.name = ''; filter.type = ''; filter.dateRange = null; pagination.page = 1 }

const dialogVisible = ref(false)
const dialogMode = ref('create')
const form = reactive({ name: '', type: '', productId: '', description: '' })
let editingId = null

function handleCreate() {
  dialogMode.value = 'create'; editingId = null
  Object.assign(form, { name: '', type: '', productId: '', description: '' })
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogMode.value = 'edit'; editingId = row.id
  Object.assign(form, { name: row.name, type: row.type, productId: row.productId || '', description: row.description || '' })
  dialogVisible.value = true
}

function handleSubmit() {
  if (!form.name.trim() || !form.type) { ElMessage.warning('请填写配网单元名称和类型'); return }
  if (dialogMode.value === 'create') {
    unitList.value.unshift({
      id: Date.now(), name: form.name.trim(), unitId: 'NW_' + Date.now().toString(36).toUpperCase(),
      type: form.type, productName: productOptions.find(p => p.id === form.productId)?.name || '—',
      status: 'enabled', createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
    ElMessage.success('创建成功')
  } else {
    const u = unitList.value.find(u => u.id === editingId)
    if (u) { u.name = form.name.trim(); u.type = form.type }
    ElMessage.success('保存成功')
  }
  dialogVisible.value = false
}

function handleView(row) { ElMessage.info(`查看配网单元 - ${row.name}`) }

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除配网单元「${row.name}」？`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { unitList.value = unitList.value.filter(u => u.id !== row.id); ElMessage.success('已删除') }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.filter-bar { padding: var(--spacing-md) var(--spacing-lg); }
.link-text { color: var(--primary-color); cursor: pointer; font-weight: 500; &:hover { text-decoration: underline; } }
.mono-text { font-family: monospace; font-size: 13px; color: var(--text-secondary); }
.cell-time { font-size: 13px; color: var(--text-secondary); }
.cell-text { font-size: 13px; color: var(--text-regular); }
.status-tag { display: inline-flex; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; &.s-pubed { background: #F0FDF4; color: #16A34A; } &.s-ref { background: #F3F4F6; color: #6B7280; } }
.action-btns { display: flex; align-items: center; gap: 2px; white-space: nowrap; }
.empty-state { display: flex; align-items: center; justify-content: center; padding: 60px 0; color: var(--text-placeholder); font-size: var(--font-md); }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 0; }
</style>
