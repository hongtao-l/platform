<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <button class="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all" @click="handleAdd">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" /></svg>
            <span>添加产品</span>
          </button>
          <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600 shadow-2xs">
            <button class="px-2.5 py-1 rounded-[6px] hover:text-slate-900 hover:bg-white transition-all">批量导入</button>
            <button class="px-2.5 py-1 rounded-[6px] hover:text-slate-900 hover:bg-white transition-all">导出列表</button>
          </div>
          <div class="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-0.5 rounded-lg text-xs">
            <button
              class="px-2.5 py-1 rounded-md transition-all"
              :class="searchForm.status === '' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="setStatusFilter('')"
            >全部 ({{ tableData.length }})</button>
            <button
              class="px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
              :class="searchForm.status === 'developing' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="setStatusFilter('developing')"
            ><span class="w-1.5 h-1.5 rounded-full bg-sky-500" /><span>开发中 ({{ countBy('developing') }})</span></button>
            <button
              class="px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
              :class="searchForm.status === 'completed' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="setStatusFilter('completed')"
            ><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span>已完成 ({{ countBy('completed') }})</span></button>
            <button
              class="px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
              :class="searchForm.status === 'not_started' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="setStatusFilter('not_started')"
            ><span class="w-1.5 h-1.5 rounded-full bg-slate-400" /><span>未开始 ({{ countBy('not_started') }})</span></button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="relative w-44">
            <input v-model="searchForm.name" class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:bg-white" placeholder="搜索名称或ID..." @keyup.enter="handleSearch" />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </div>
          <el-select v-model="searchForm.type" placeholder="产品类型" clearable size="small" style="width: 108px">
            <el-option label="IPC" value="ipc" />
            <el-option label="门锁" value="lock" />
            <el-option label="传感器" value="sensor" />
            <el-option label="电工照明" value="lighting" />
          </el-select>
          <el-select v-model="searchForm.status" placeholder="开发状态" clearable size="small" style="width: 108px">
            <el-option label="开发中" value="developing" />
            <el-option label="已完成" value="completed" />
            <el-option label="未开始" value="not_started" />
          </el-select>
          <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-auto bg-white">
        <el-table :data="pagedData" v-loading="loading" class="stitch-table">
          <el-table-column label="产品ID" width="170">
            <template #default="{ row }"><code class="font-mono text-[11px] text-sky-700">{{ row.id }}</code></template>
          </el-table-column>
          <el-table-column label="产品名称" min-width="200">
            <template #default="{ row }"><span class="cell-name">{{ row.name }}</span></template>
          </el-table-column>
          <el-table-column label="产品类型" width="120">
            <template #default="{ row }">
              <span class="type-tag" :class="row.type === 'ipc' ? 'type-prop' : row.type === 'lock' ? 'type-evt' : row.type === 'sensor' ? 'type-svc' : 'type-prop'">{{ row.typeName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="功能点" width="100" align="center">
            <template #default="{ row }">
              <button v-if="row.functionCount > 0" class="link-action" @click="handleViewFunc(row)">{{ row.functionCount }} 项</button>
              <span v-else class="text-xs text-slate-300">—</span>
            </template>
          </el-table-column>
          <el-table-column label="开发状态" width="110" align="center">
            <template #default="{ row }">
              <span class="status-tag" :class="statusCls(row.status)">{{ row.statusName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="130">
            <template #default="{ row }"><span class="font-mono text-[11px] text-slate-400">{{ row.createTime }}</span></template>
          </el-table-column>
          <el-table-column label="操作" width="230" align="right" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <button class="link-action" @click="handleDev(row)">{{ getDevButtonText(row.status) }}</button>
                <button class="link-action" @click="handleEdit(row)">编辑</button>
                <button class="link-danger" @click="handleDelete(row)">删除</button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-box"><span>暂无产品数据</span><button class="link-action" @click="handleAdd">+ 添加产品</button></div>
          </template>
        </el-table>
      </div>

      <footer class="h-12 border-t border-slate-200 bg-white px-5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span>共 <strong class="font-semibold text-slate-700">{{ pagination.total }}</strong> 条记录</span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="sizes, prev, pager, next"
          size="small"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </footer>
    </main>

    <!-- Add/Edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加产品' : '编辑产品'"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="productForm" :rules="formRules" label-width="90px">
        <el-form-item v-if="dialogType === 'add'" label="产品ID" prop="id">
          <el-input v-model="productForm.id" placeholder="如 IPC_PRO_001" class="!font-mono" />
          <span class="form-hint">建议使用大写字母+下划线格式</span>
        </el-form-item>
        <el-form-item v-else label="产品ID">
          <el-input v-model="productForm.id" disabled class="!font-mono" />
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="产品类型" prop="type">
          <el-select v-model="productForm.type" placeholder="请选择产品类型" style="width: 100%">
            <el-option label="IPC" value="ipc" />
            <el-option label="门锁" value="lock" />
            <el-option label="传感器" value="sensor" />
            <el-option label="电工照明" value="lighting" />
          </el-select>
        </el-form-item>
        <el-form-item v-else label="产品类型">
          <el-input :model-value="getTypeName(productForm.type)" disabled />
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input v-model="productForm.description" type="textarea" :rows="3" placeholder="请输入产品描述" />
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const searchForm = reactive({ name: '', type: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 3 })
const loading = ref(false)

const tableData = ref([
  {
    id: 'IPC_PRO_001',
    name: 'IPC Pro 标准版',
    type: 'ipc',
    typeName: 'IPC',
    functionCount: 5,
    status: 'developing',
    statusName: '开发中',
    createTime: '2026-04-10',
    description: 'IPC Pro 标准版，支持夜视、白光灯、红外灯等能力'
  },
  {
    id: 'IPC_LITE_001',
    name: 'IPC Lite 简易版',
    type: 'ipc',
    typeName: 'IPC',
    functionCount: 3,
    status: 'completed',
    statusName: '已完成',
    createTime: '2026-04-12',
    description: 'IPC Lite 简易版'
  },
  {
    id: 'LOCK_001',
    name: '智能门锁标准版',
    type: 'lock',
    typeName: '门锁',
    functionCount: 0,
    status: 'not_started',
    statusName: '未开始',
    createTime: '2026-04-15',
    description: '智能门锁标准版'
  }
])

const pagedData = computed(() => {
  let list = tableData.value
  if (searchForm.name) {
    const kw = searchForm.name.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(kw) || p.id.toLowerCase().includes(kw))
  }
  if (searchForm.type) list = list.filter(p => p.type === searchForm.type)
  if (searchForm.status) list = list.filter(p => p.status === searchForm.status)
  pagination.total = list.length
  const start = (pagination.page - 1) * pagination.pageSize
  return list.slice(start, start + pagination.pageSize)
})

function countBy(status) {
  return tableData.value.filter(p => p.status === status).length
}

function setStatusFilter(status) {
  searchForm.status = status
  pagination.page = 1
}

// ===== Dialog =====
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const productForm = reactive({ id: '', name: '', type: '', description: '' })
const formRules = {
  id: [
    { required: true, message: '请输入产品ID', trigger: 'blur' },
    { pattern: /^[A-Z_0-9]+$/, message: '产品ID只能包含大写字母、数字和下划线', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择产品类型', trigger: 'change' }]
}

const statusClsMap = { developing: 's-dev', completed: 's-pubed', not_started: 's-ref' }
function statusCls(s) { return statusClsMap[s] || 's-ref' }

function getDevButtonText(status) {
  return { developing: '继续开发', completed: '查看配置', not_started: '开始开发' }[status] || '开始开发'
}
function getTypeName(type) {
  return { ipc: 'IPC', lock: '门锁', sensor: '传感器', lighting: '电工照明' }[type] || type
}

function handleSearch() {
  pagination.page = 1
  ElMessage.success('查询成功')
}
function handleAdd() {
  dialogType.value = 'add'
  Object.assign(productForm, { id: '', name: '', type: '', description: '' })
  dialogVisible.value = true
}
function handleEdit(row) {
  dialogType.value = 'edit'
  Object.assign(productForm, { id: row.id, name: row.name, type: row.type, description: row.description })
  dialogVisible.value = true
}
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '保存成功')
      dialogVisible.value = false
    }
  })
}
function handleDev(row) {
  router.push({ path: '/product-new/config', query: { id: row.id, name: row.name } })
}
function handleViewFunc(row) {
  router.push({ path: '/product-new/config', query: { id: row.id, name: row.name } })
}
function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除产品 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    tableData.value = tableData.value.filter(p => p.id !== row.id)
    pagination.total = tableData.value.length
    ElMessage.success('删除成功')
  }).catch(() => {})
}
function handleSizeChange(size) {
  pagination.pageSize = size
  handleSearch()
}
function handlePageChange(page) {
  pagination.page = page
}
</script>

<style scoped>
.cell-name { font-size: 12px; font-weight: 600; color: #0f172a; }
.row-actions { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
</style>
