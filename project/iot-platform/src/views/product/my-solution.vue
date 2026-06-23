<template>
  <div class="page-container">
    <div class="card filter-bar">
      <el-form :model="filter" inline>
        <el-form-item label="方案名称">
          <el-input v-model="filter.name" placeholder="请输入方案名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="方案状态">
          <el-select v-model="filter.status" placeholder="全部" clearable style="width:130px">
            <el-option label="开发中" value="developing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已发布" value="published" />
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
        <span class="card-title">我的方案</span>
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
        <el-table-column label="产品类目" width="140" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.category }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', statusCls(row.status)]">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="引用次数" width="90" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.refCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-time">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-time">{{ row.updateTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button size="small" text type="primary" @click="handleDev(row)">继续开发</el-button>
              <el-button size="small" text type="primary" @click="handleView(row)">查看</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filter = reactive({ name: '', status: '', dateRange: null })

const statusMap = { developing: '开发中', completed: '已完成', published: '已发布' }
const statusClsMap = { developing: 's-dev', completed: 's-pubed', published: 's-pubed' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }

const solutionList = ref([
  { id: 1, solutionId: 'MY_SOL_001', name: '我的IPC安防方案', category: 'IPC摄像机', status: 'developing', refCount: 0, createTime: '2026-06-08 10:00:00', updateTime: '2026-06-08 10:00:00' },
  { id: 2, solutionId: 'MY_SOL_002', name: '智能门铃定制方案', category: '智能门铃', status: 'completed', refCount: 3, createTime: '2026-05-20 14:00:00', updateTime: '2026-06-01 09:00:00' },
  { id: 3, solutionId: 'MY_SOL_003', name: '4G安防方案v2', category: '4G设备', status: 'published', refCount: 12, createTime: '2026-05-01 08:30:00', updateTime: '2026-05-25 16:00:00' },
  { id: 4, solutionId: 'MY_SOL_004', name: '传感安防入门方案', category: '传感安防', status: 'developing', refCount: 0, createTime: '2026-06-05 11:20:00', updateTime: '2026-06-05 11:20:00' }
])

const filteredData = computed(() => {
  let list = solutionList.value
  if (filter.name) { const kw = filter.name.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(kw)) }
  if (filter.status) list = list.filter(s => s.status === filter.status)
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
function handleReset() { filter.name = ''; filter.status = ''; filter.dateRange = null; pagination.page = 1 }
function handleCreate() { ElMessage.info('创建方案') }
function handleDev(row) { ElMessage.info(`继续开发 - ${row.name}`) }
function handleView(row) { ElMessage.info(`查看 - ${row.name}`) }
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
.status-tag { display: inline-flex; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; &.s-dev { background: #EFF6FF; color: #2563EB; } &.s-pubed { background: #F0FDF4; color: #16A34A; } }
.action-btns { display: flex; align-items: center; gap: 2px; white-space: nowrap; }
.empty-state { display: flex; align-items: center; justify-content: center; padding: 60px 0; color: var(--text-placeholder); font-size: var(--font-md); }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 0; }
</style>
