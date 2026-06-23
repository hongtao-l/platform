<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <div class="card filter-bar">
      <el-form :model="filter" inline>
        <el-form-item label="产品名称">
          <el-input v-model="filter.name" placeholder="请输入" clearable style="width:180px" />
        </el-form-item>
        <el-form-item label="产品类目">
          <el-select v-model="filter.category" placeholder="请选择产品类目" clearable style="width:180px">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品状态">
          <el-select v-model="filter.status" placeholder="请选择" clearable style="width:130px">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属企业">
          <el-select v-model="filter.company" placeholder="可输入企业名称或企业Id查询" filterable clearable style="width:220px">
            <el-option v-for="c in companyOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width:240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 自动赠送授权区域 -->
    <div class="card" style="margin-top:12px;overflow:hidden">
      <div class="auto-auth-bar">
        <span class="auto-auth-label">自动赠送授权</span>
        <el-switch v-model="autoAuthEnabled" active-color="#1A73E8" active-text="已开启" inactive-text="已关闭" />
        <el-button v-if="autoAuthEnabled" size="small" type="primary" link @click="handleAuthConfig">配置</el-button>
      </div>

      <!-- 表格 -->
      <el-table v-if="filteredData.length" :data="pagedData" stripe>
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            <span class="cell-text">{{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-info">
              <span class="product-name">{{ row.name }}</span>
              <span class="product-id">{{ row.productId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="产品类目" width="140" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.category }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', statusCls(row.status)]">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="开发方式" width="90" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.devMethod || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="授权单价" width="100" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.unitPrice?.toFixed(2) || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="赠送授权" width="120" align="center">
          <template #default="{ row }">
            <span class="cell-text">测试授权：{{ row.testAuthCount || 0 }}个</span>
            <br />
            <span class="cell-text">生产授权：{{ row.prodAuthCount || 0 }}个</span>
          </template>
        </el-table-column>
        <el-table-column label="采购生产授权" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.prodPurchaseCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属企业" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="company-info">
              <span class="company-name">{{ row.company }}</span>
              <span class="company-id">{{ row.companyId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-time">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div class="action-btns" v-if="row.status === 'pending'">
              <el-button size="small" text type="primary" @click="handleAudit(row)">审核</el-button>
              <el-button size="small" text type="primary" @click="handleGrantAuth(row)">赠送授权</el-button>
              <el-button size="small" text type="primary" @click="handleManageProduct(row)">管理产品</el-button>
              <el-button size="small" text type="danger" @click="handleDelete(row)">删除产品</el-button>
            </div>
            <div class="action-btns" v-else>
              <el-button size="small" text type="primary" @click="handleManageProduct(row)">管理产品</el-button>
              <el-button size="small" text type="danger" @click="handleDelete(row)">删除产品</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">暂无审核数据</div>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" :title="'审核产品 - ' + auditingProduct?.name" width="500px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditResult">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="auditComment" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 赠送授权弹窗 -->
    <el-dialog v-model="grantDialogVisible" :title="'赠送授权 - ' + grantingProduct?.name" width="500px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="测试授权数量">
          <el-input-number v-model="grantForm.testCount" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="生产授权数量">
          <el-input-number v-model="grantForm.prodCount" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGrant">确定</el-button>
      </template>
    </el-dialog>

    <!-- 自动赠送授权配置弹窗 -->
    <el-dialog v-model="autoAuthConfigVisible" title="自动赠送授权配置" width="500px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="120px">
        <el-form-item label="赠送测试授权">
          <el-input-number v-model="autoAuthConfig.testCount" :min="0" :max="999" />
          <span class="unit-text">个</span>
        </el-form-item>
        <el-form-item label="赠送生产授权">
          <el-input-number v-model="autoAuthConfig.prodCount" :min="0" :max="999" />
          <span class="unit-text">个</span>
        </el-form-item>
        <el-form-item label="适用产品类目">
          <el-select v-model="autoAuthConfig.categories" placeholder="请选择" multiple style="width:100%">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="autoAuthConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAutoAuthConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// ===== 筛选 =====
const filter = reactive({
  name: '',
  category: '',
  status: '',
  company: '',
  dateRange: null
})

const categoryOptions = ['UITest_Edit_285367', '4G设备', '普通摄像机', '智能门铃', '传感安防']
const companyOptions = ['深圳市汇云通讯科技有限公司', '深圳市安嘉科技有限公司', '东莞康林物联有限公司']

function handleSearch() { pagination.page = 1 }
function handleReset() {
  filter.name = ''
  filter.category = ''
  filter.status = ''
  filter.company = ''
  filter.dateRange = null
  pagination.page = 1
}

// ===== 自动赠送授权 =====
const autoAuthEnabled = ref(true)
const autoAuthConfigVisible = ref(false)
const autoAuthConfig = reactive({ testCount: 10, prodCount: 5, categories: [] })

function handleAuthConfig() {
  autoAuthConfigVisible.value = true
}
function confirmAutoAuthConfig() {
  ElMessage.success('自动赠送授权配置已保存')
  autoAuthConfigVisible.value = false
}

// ===== 数据 =====
const productList = ref([
  { id: 1, productId: 'PDRSAh5NV6PkRS6u', name: 'Session基础产品_319364', category: 'UITest_Edit_285367', status: 'pending', devMethod: '—', unitPrice: 0.00, testAuthCount: 9, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-05 14:29:34' },
  { id: 2, productId: 'PDRSAa6hsGHkqHFw', name: 'Session基础产品_465067', category: 'UITest_Edit_285367', status: 'pending', devMethod: '—', unitPrice: 0.00, testAuthCount: 9, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-05 14:15:27' },
  { id: 3, productId: 'PDRSAn6xygCybm5d', name: 'Session基础产品_593040', category: 'UITest_Edit_285367', status: 'pending', devMethod: '—', unitPrice: 0.00, testAuthCount: 9, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-05 13:52:31' },
  { id: 4, productId: 'PDRSAm77wmdQRvTC', name: 'Session基础产品_714235', category: 'UITest_Edit_285367', status: 'pending', devMethod: '—', unitPrice: 0.00, testAuthCount: 9, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-05 11:26:37' },
  { id: 5, productId: 'PDRSAs3EcgsCDHbu', name: 'Session基础产品_660582', category: 'UITest_Edit_285367', status: 'approved', devMethod: '—', unitPrice: 0.00, testAuthCount: 9, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-05 11:18:54' },
  { id: 6, productId: 'PDRSAn3QNqLBP3F9', name: 'Session基础产品_667093', category: 'UITest_Edit_285367', status: 'rejected', devMethod: '—', unitPrice: 0.00, testAuthCount: 9, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-05 11:17:03' },
  { id: 7, productId: 'PDRSAw37xYW6b7vP', name: 'Session基础产品_693322', category: 'UITest_Edit_285367', status: 'pending', devMethod: '—', unitPrice: 0.00, testAuthCount: 9, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-05 10:03:43' },
  { id: 8, productId: 'PDRSAq8P7JguKscj', name: '4G产品设备0601', category: '4G设备', status: 'pending', devMethod: '—', unitPrice: 0.00, testAuthCount: 9, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-01 13:49:54' },
  { id: 9, productId: 'PDRSAz5pAvRFtDxx', name: 'Session基础产品_226109', category: 'UITest_Edit_285367', status: 'pending', devMethod: '—', unitPrice: 0.00, testAuthCount: 7, prodAuthCount: 5, prodPurchaseCount: 0, company: '深圳市汇云通讯科技有限公司', companyId: 'DrS1623205604012', createTime: '2026-06-01 09:49:02' }
])

// ===== 筛选 + 分页 =====
const filteredData = computed(() => {
  let list = productList.value
  if (filter.name) {
    const kw = filter.name.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(kw) || p.productId.toLowerCase().includes(kw))
  }
  if (filter.status) list = list.filter(p => p.status === filter.status)
  if (filter.category) list = list.filter(p => p.category === filter.category)
  if (filter.company) list = list.filter(p => p.company.includes(filter.company))
  if (filter.dateRange && filter.dateRange.length === 2) {
    const [s, e] = filter.dateRange
    list = list.filter(p => p.createTime >= s && p.createTime <= e)
  }
  return list
})

const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

// ===== 标签 =====
const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
const statusClsMap = { pending: 's-pending', approved: 's-approved', rejected: 's-rejected' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }

// ===== 审核弹窗 =====
const auditDialogVisible = ref(false)
const auditingProduct = ref(null)
const auditResult = ref('approve')
const auditComment = ref('')

function handleAudit(row) {
  auditingProduct.value = row
  auditResult.value = 'approve'
  auditComment.value = ''
  auditDialogVisible.value = true
}

function confirmAudit() {
  if (auditingProduct.value) {
    auditingProduct.value.status = auditResult.value === 'approve' ? 'approved' : 'rejected'
  }
  ElMessage.success('审核完成')
  auditDialogVisible.value = false
}

// ===== 赠送授权弹窗 =====
const grantDialogVisible = ref(false)
const grantingProduct = ref(null)
const grantForm = reactive({ testCount: 10, prodCount: 5 })

function handleGrantAuth(row) {
  grantingProduct.value = row
  grantForm.testCount = row.testAuthCount || 10
  grantForm.prodCount = row.prodAuthCount || 5
  grantDialogVisible.value = true
}

function confirmGrant() {
  if (grantingProduct.value) {
    grantingProduct.value.testAuthCount = grantForm.testCount
    grantingProduct.value.prodAuthCount = grantForm.prodCount
  }
  ElMessage.success('授权赠送成功')
  grantDialogVisible.value = false
}

// ===== 管理产品 / 删除 =====
function handleManageProduct(row) {
  router.push({ path: '/product/audit/detail', query: { productId: row.productId, name: row.name } })
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除产品「${row.name}」？`, '删除确认', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    productList.value = productList.value.filter(p => p.id !== row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.filter-bar {
  padding: var(--spacing-md) var(--spacing-lg);
}

.auto-auth-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px var(--spacing-lg);
  border-bottom: 1px solid var(--border-lighter);
  .auto-auth-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.product-info {
  display: flex;
  flex-direction: column;
  .product-name { font-weight: 500; color: var(--text-primary); cursor: pointer; }
  .product-id { font-size: 13px; color: var(--text-placeholder); font-family: monospace; margin-top: 2px; }
}

.company-info {
  display: flex;
  flex-direction: column;
  .company-name { font-size: 13px; color: var(--text-primary); }
  .company-id { font-size: 12px; color: var(--text-placeholder); font-family: monospace; }
}

.status-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  &.s-pending { background: #FFF7ED; color: #EA580C; }
  &.s-approved { background: #F0FDF4; color: #16A34A; }
  &.s-rejected { background: #FEF2F2; color: #DC2626; }
}

.cell-time { font-size: 13px; color: var(--text-secondary); }
.cell-text { font-size: 13px; color: var(--text-regular); }

.action-btns {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  :deep(.el-button + .el-button) { margin-left: 0; }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-placeholder);
  font-size: var(--font-md);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

.unit-text {
  margin-left: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
