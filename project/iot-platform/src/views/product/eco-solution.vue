<template>
  <div class="page-container">
    <div class="card filter-bar">
      <el-form :model="filter" inline>
        <el-form-item label="方案名称">
          <el-input v-model="filter.name" placeholder="请输入方案名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="方案类型">
          <el-select v-model="filter.type" placeholder="全部" clearable style="width:150px">
            <el-option label="标准方案" value="standard" />
            <el-option label="行业方案" value="industry" />
            <el-option label="定制方案" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品类目">
          <el-select v-model="filter.category" placeholder="全部" clearable style="width:160px">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
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
        <span class="card-title">方案列表</span>
        <el-button type="primary" size="small" @click="handleCreate">
          <el-icon><Plus /></el-icon>创建方案
        </el-button>
      </div>
      <el-table v-if="filteredData.length" :data="pagedData" stripe>
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">{{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="方案信息" min-width="200">
          <template #default="{ row }">
            <div class="item-info">
              <span class="item-name">{{ row.name }}</span>
              <span class="item-id">{{ row.solutionId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="方案类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="typeTagMap[row.type]">{{ typeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品类目" width="140" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.category }}</span>
          </template>
        </el-table-column>
        <el-table-column label="关联能力数" width="100" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.capCount || 0 }} 项</span>
          </template>
        </el-table-column>
        <el-table-column label="创建企业" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="cell-text">{{ row.company }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-time">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button size="small" text type="primary" @click="handleView(row)">查看</el-button>
              <el-button size="small" text type="primary" @click="handleDerive(row)">派生产品</el-button>
              <el-button size="small" text type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 创建方案弹窗 -->
    <el-dialog v-model="dialogVisible" title="创建方案" width="600px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="方案名称" required>
          <el-input v-model="form.name" placeholder="请输入方案名称" maxlength="40" />
        </el-form-item>
        <el-form-item label="方案类型" required>
          <el-select v-model="form.type" placeholder="请选择方案类型" style="width:100%">
            <el-option label="标准方案" value="standard" />
            <el-option label="行业方案" value="industry" />
            <el-option label="定制方案" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品类目" required>
          <el-select v-model="form.category" placeholder="请选择产品类目" style="width:100%">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="方案描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入方案描述" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filter = reactive({ name: '', type: '', category: '', dateRange: null })
const categoryOptions = ['IPC摄像机', '智能门铃', '4G设备', '传感安防']

const typeLabelMap = { standard: '标准方案', industry: '行业方案', custom: '定制方案' }
const typeTagMap = { standard: '', industry: 'warning', custom: 'success' }
function typeLabel(t) { return typeLabelMap[t] || t }

const solutionList = ref([
  { id: 1, solutionId: 'SOL_STD_IPC_001', name: 'IPC标准安防方案', type: 'standard', category: 'IPC摄像机', capCount: 12, company: '深圳市汇云通讯科技有限公司', createTime: '2026-05-20 10:00:00' },
  { id: 2, solutionId: 'SOL_IND_DOOR_001', name: '智能门铃行业方案', type: 'industry', category: '智能门铃', capCount: 8, company: '深圳市安嘉科技有限公司', createTime: '2026-05-15 14:30:00' },
  { id: 3, solutionId: 'SOL_CUS_4G_001', name: '4G设备定制方案', type: 'custom', category: '4G设备', capCount: 15, company: '东莞康林物联有限公司', createTime: '2026-05-10 09:00:00' },
  { id: 4, solutionId: 'SOL_STD_SENSOR_001', name: '传感安防通用方案', type: 'standard', category: '传感安防', capCount: 6, company: '深圳市汇云通讯科技有限公司', createTime: '2026-04-28 11:20:00' },
  { id: 5, solutionId: 'SOL_STD_IPC_002', name: 'IPC Lite入门方案', type: 'standard', category: 'IPC摄像机', capCount: 5, company: '深圳市汇云通讯科技有限公司', createTime: '2026-04-20 08:45:00' }
])

const filteredData = computed(() => {
  let list = solutionList.value
  if (filter.name) { const kw = filter.name.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(kw)) }
  if (filter.type) list = list.filter(s => s.type === filter.type)
  if (filter.category) list = list.filter(s => s.category === filter.category)
  if (filter.dateRange && filter.dateRange.length === 2) {
    const [s, e] = filter.dateRange; list = list.filter(s => s.createTime >= s && s.createTime <= e)
  }
  return list
})

const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

function handleSearch() { pagination.page = 1 }
function handleReset() { filter.name = ''; filter.type = ''; filter.category = ''; filter.dateRange = null; pagination.page = 1 }

const dialogVisible = ref(false)
const form = reactive({ name: '', type: '', category: '', description: '' })

function handleCreate() { Object.assign(form, { name: '', type: '', category: '', description: '' }); dialogVisible.value = true }
function handleSubmit() {
  if (!form.name.trim() || !form.type || !form.category) { ElMessage.warning('请填写必填项'); return }
  solutionList.value.unshift({
    id: Date.now(), solutionId: 'SOL_' + Date.now().toString(36).toUpperCase(),
    name: form.name.trim(), type: form.type, category: form.category,
    capCount: 0, company: '本公司', createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
  })
  ElMessage.success('方案创建成功'); dialogVisible.value = false
}

function handleView(row) { ElMessage.info(`查看方案 - ${row.name}`) }
function handleDerive(row) { ElMessage.info(`派生产品 - ${row.name}`) }
function handleEdit(row) { ElMessage.info(`编辑方案 - ${row.name}`) }
function handleDelete(row) {
  ElMessageBox.confirm(`确定删除方案「${row.name}」？`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { solutionList.value = solutionList.value.filter(s => s.id !== row.id); ElMessage.success('已删除') }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.filter-bar { padding: var(--spacing-md) var(--spacing-lg); }
.item-info { display: flex; flex-direction: column; .item-name { font-weight: 500; color: var(--text-primary); cursor: pointer; } .item-id { font-size: 13px; color: var(--text-placeholder); font-family: monospace; margin-top: 2px; } }
.cell-time { font-size: 13px; color: var(--text-secondary); }
.cell-text { font-size: 13px; color: var(--text-regular); }
.action-btns { display: flex; align-items: center; gap: 2px; white-space: nowrap; }
.empty-state { display: flex; align-items: center; justify-content: center; padding: 60px 0; color: var(--text-placeholder); font-size: var(--font-md); }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 0; }
</style>
