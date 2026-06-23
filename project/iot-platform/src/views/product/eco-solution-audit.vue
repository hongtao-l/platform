<template>
  <div class="page-container">
    <div class="card filter-bar">
      <el-form :model="filter" inline>
        <el-form-item label="方案名称">
          <el-input v-model="filter.name" placeholder="请输入方案名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="filter.status" placeholder="全部" clearable style="width:130px">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交企业">
          <el-select v-model="filter.company" placeholder="全部" clearable filterable style="width:200px">
            <el-option v-for="c in companyOptions" :key="c" :label="c" :value="c" />
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
        <span class="card-title">方案审核列表</span>
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
        <el-table-column label="提交企业" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="cell-text">{{ row.company }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提交人" width="90" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.submitter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-time">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-btns" v-if="row.status === 'pending'">
              <el-button size="small" text type="primary" @click="handleAudit(row, 'approved')">审核通过</el-button>
              <el-button size="small" text type="danger" @click="handleAudit(row, 'rejected')">拒绝</el-button>
              <el-button size="small" text type="primary" @click="handleView(row)">查看</el-button>
            </div>
            <div class="action-btns" v-else>
              <el-button size="small" text type="primary" @click="handleView(row)">查看详情</el-button>
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

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="审核方案" width="500px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="80px">
        <el-form-item label="审核意见">
          <el-input v-model="auditComment" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const filter = reactive({ name: '', status: '', company: '', dateRange: null })
const companyOptions = ['深圳市汇云通讯科技有限公司', '深圳市安嘉科技有限公司', '东莞康林物联有限公司']

const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
const statusClsMap = { pending: 's-pending', approved: 's-approved', rejected: 's-rejected' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }

const solutionList = ref([
  { id: 1, solutionId: 'SOL_SUB_001', name: 'IPC安防方案V3', category: 'IPC摄像机', status: 'pending', company: '深圳市安嘉科技有限公司', submitter: '张三', createTime: '2026-06-08 15:30:00' },
  { id: 2, solutionId: 'SOL_SUB_002', name: '智能门铃标准方案', category: '智能门铃', status: 'pending', company: '东莞康林物联有限公司', submitter: '李四', createTime: '2026-06-08 14:00:00' },
  { id: 3, solutionId: 'SOL_SUB_003', name: '4G安防行业方案', category: '4G设备', status: 'approved', company: '深圳市汇云通讯科技有限公司', submitter: '王五', createTime: '2026-06-07 10:00:00' },
  { id: 4, solutionId: 'SOL_SUB_004', name: '传感安防一体方案', category: '传感安防', status: 'rejected', company: '深圳市安嘉科技有限公司', submitter: '赵六', createTime: '2026-06-05 09:00:00' }
])

const filteredData = computed(() => {
  let list = solutionList.value
  if (filter.name) { const kw = filter.name.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(kw) || s.solutionId.toLowerCase().includes(kw)) }
  if (filter.status) list = list.filter(s => s.status === filter.status)
  if (filter.company) list = list.filter(s => s.company.includes(filter.company))
  if (filter.dateRange && filter.dateRange.length === 2) { const [s, e] = filter.dateRange; list = list.filter(s => s.createTime >= s && s.createTime <= e) }
  return list
})

const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

function handleSearch() { pagination.page = 1 }
function handleReset() { filter.name = ''; filter.status = ''; filter.company = ''; filter.dateRange = null; pagination.page = 1 }

const auditDialogVisible = ref(false)
const auditComment = ref('')
let auditingId = null
let auditingAction = ''

function handleAudit(row, action) {
  auditingId = row.id; auditingAction = action
  auditComment.value = ''; auditDialogVisible.value = true
}

function confirmAudit() {
  const s = solutionList.value.find(s => s.id === auditingId)
  if (s) s.status = auditingAction
  ElMessage.success(auditingAction === 'approved' ? '审核通过' : '已拒绝')
  auditDialogVisible.value = false
}

function handleView(row) { ElMessage.info(`查看方案详情 - ${row.name}`) }
</script>

<style lang="scss" scoped>
.filter-bar { padding: var(--spacing-md) var(--spacing-lg); }
.item-info { display: flex; flex-direction: column; .item-name { font-weight: 500; color: var(--text-primary); cursor: pointer; } .item-id { font-size: 13px; color: var(--text-placeholder); font-family: monospace; margin-top: 2px; } }
.cell-time { font-size: 13px; color: var(--text-secondary); }
.cell-text { font-size: 13px; color: var(--text-regular); }
.status-tag { display: inline-flex; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; &.s-pending { background: #FFF7ED; color: #EA580C; } &.s-approved { background: #F0FDF4; color: #16A34A; } &.s-rejected { background: #FEF2F2; color: #DC2626; } }
.action-btns { display: flex; align-items: center; gap: 2px; white-space: nowrap; }
.empty-state { display: flex; align-items: center; justify-content: center; padding: 60px 0; color: var(--text-placeholder); font-size: var(--font-md); }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 0; }
</style>
