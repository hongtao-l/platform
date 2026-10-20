<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      <!-- Filter bar -->
      <div class="px-4 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-medium text-slate-500">产品名称</span>
          <el-input v-model="filter.name" placeholder="请输入" clearable size="small" style="width:160px" />
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-medium text-slate-500">产品类目</span>
          <el-select v-model="filter.category" placeholder="请选择" clearable size="small" style="width:160px">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-medium text-slate-500">产品状态</span>
          <el-select v-model="filter.status" placeholder="请选择" clearable size="small" style="width:120px">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-medium text-slate-500">所属企业</span>
          <el-select v-model="filter.company" placeholder="企业名称或ID" filterable clearable size="small" style="width:200px">
            <el-option v-for="c in companyOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-medium text-slate-500">创建时间</span>
          <el-date-picker v-model="filter.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" size="small" style="width:230px" />
        </div>
        <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
        <el-button size="small" @click="handleReset">重置</el-button>
      </div>

      <!-- Auto auth bar -->
      <div class="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold text-slate-700">自动赠送授权</span>
          <el-switch v-model="autoAuthEnabled" size="small" />
          <span class="text-[11px] font-medium" :class="autoAuthEnabled ? 'text-emerald-600' : 'text-slate-400'">{{ autoAuthEnabled ? '已开启' : '已关闭' }}</span>
          <button v-if="autoAuthEnabled" class="link-action" @click="handleAuthConfig">配置</button>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-slate-400">
          <span>待审核 <strong class="text-amber-600 font-mono">{{ pendingCount }}</strong></span>
          <span class="text-slate-300">|</span>
          <span>共 <strong class="text-slate-600 font-mono">{{ filteredData.length }}</strong> 条</span>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-auto bg-white">
        <el-table :data="pagedData" class="stitch-table">
          <el-table-column label="序号" width="60" align="center">
            <template #default="{ $index }"><span class="font-mono text-[11px] text-slate-400">{{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}</span></template>
          </el-table-column>
          <el-table-column label="产品信息" min-width="190">
            <template #default="{ row }">
              <div class="min-w-0">
                <div class="cell-name truncate">{{ row.name }}</div>
                <div class="font-mono text-[10px] text-slate-400 mt-0.5">{{ row.productId }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="产品类目" width="150"><template #default="{ row }"><span class="cell-text">{{ row.category }}</span></template></el-table-column>
          <el-table-column label="产品状态" width="100">
            <template #default="{ row }"><span class="status-tag" :class="statusCls(row.status)">{{ statusLabel(row.status) }}</span></template>
          </el-table-column>
          <el-table-column label="开发方式" width="90"><template #default="{ row }"><span class="cell-text">{{ row.devMethod || '—' }}</span></template></el-table-column>
          <el-table-column label="授权单价" width="100" align="center"><template #default="{ row }"><span class="font-mono text-[11px] text-slate-600">{{ row.unitPrice?.toFixed(2) || '0.00' }}</span></template></el-table-column>
          <el-table-column label="赠送授权" width="130" align="center">
            <template #default="{ row }">
              <span class="font-mono text-[11px] text-slate-500">测试 {{ row.testAuthCount || 0 }} · 生产 {{ row.prodAuthCount || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="采购生产授权" width="110" align="center"><template #default="{ row }"><span class="cell-text">{{ row.prodPurchaseCount || 0 }}</span></template></el-table-column>
          <el-table-column label="所属企业" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="cell-text truncate">{{ row.company }}</div>
              <div class="font-mono text-[10px] text-slate-400">{{ row.companyId }}</div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="150"><template #default="{ row }"><span class="cell-time">{{ row.createTime }}</span></template></el-table-column>
          <el-table-column label="操作" width="300" align="right" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <template v-if="row.status === 'pending'">
                  <button class="link-action" @click="handleAudit(row)">审核</button>
                  <button class="link-action" @click="handleGrantAuth(row)">赠送授权</button>
                  <button class="link-action" @click="handleManageProduct(row)">管理产品</button>
                  <button class="link-danger" @click="handleDelete(row)">删除产品</button>
                </template>
                <template v-else>
                  <button class="link-action" @click="handleManageProduct(row)">管理产品</button>
                  <button class="link-danger" @click="handleDelete(row)">删除产品</button>
                </template>
              </div>
            </template>
          </el-table-column>
          <template #empty><div class="empty-box"><span>暂无审核数据</span></div></template>
        </el-table>
      </div>

      <footer class="h-12 border-t border-slate-200 bg-white px-5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span>待审核 <strong class="font-semibold text-amber-600">{{ pendingCount }}</strong> 条，共 <strong class="font-semibold text-slate-700">{{ filteredData.length }}</strong> 条</span>
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

    <!-- Audit dialog -->
    <el-dialog v-model="auditDialogVisible" :title="'审核产品 - ' + (auditingProduct?.name || '')" width="520px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="90px">
        <el-form-item label="审核结果">
          <div class="seg-control">
            <span class="seg-item !px-4" :class="{ active: auditResult === 'approve' }" @click="auditResult = 'approve'">通过</span>
            <span class="seg-item !px-4" :class="{ active: auditResult === 'reject' }" @click="auditResult = 'reject'">拒绝</span>
          </div>
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

    <!-- Grant dialog -->
    <el-dialog v-model="grantDialogVisible" :title="'赠送授权 - ' + (grantingProduct?.name || '')" width="500px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="110px">
        <el-form-item label="测试授权数量"><el-input-number v-model="grantForm.testCount" :min="0" :max="999" /></el-form-item>
        <el-form-item label="生产授权数量"><el-input-number v-model="grantForm.prodCount" :min="0" :max="999" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGrant">确定</el-button>
      </template>
    </el-dialog>

    <!-- Auto auth config -->
    <el-dialog v-model="autoAuthConfigVisible" title="自动赠送授权配置" width="520px" top="8vh" :close-on-click-modal="false">
      <el-form label-width="130px">
        <el-form-item label="赠送测试授权">
          <el-input-number v-model="autoAuthConfig.testCount" :min="0" :max="999" />
          <span class="text-xs text-slate-400 ml-2">个</span>
        </el-form-item>
        <el-form-item label="赠送生产授权">
          <el-input-number v-model="autoAuthConfig.prodCount" :min="0" :max="999" />
          <span class="text-xs text-slate-400 ml-2">个</span>
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

const filter = reactive({ name: '', category: '', status: '', company: '', dateRange: null })
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

// Auto auth
const autoAuthEnabled = ref(true)
const autoAuthConfigVisible = ref(false)
const autoAuthConfig = reactive({ testCount: 10, prodCount: 5, categories: [] })
function handleAuthConfig() { autoAuthConfigVisible.value = true }
function confirmAutoAuthConfig() {
  ElMessage.success('自动赠送授权配置已保存')
  autoAuthConfigVisible.value = false
}

// Data
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
const pendingCount = computed(() => productList.value.filter(p => p.status === 'pending').length)

const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
const statusClsMap = { pending: 's-pending', approved: 's-approved', rejected: 's-rejected' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }

// Audit
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

// Grant
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

// Manage / delete
function handleManageProduct(row) {
  router.push({ path: '/product-new/audit/detail', query: { productId: row.productId, name: row.name } })
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

<style scoped>
.cell-name { font-size: 12px; font-weight: 600; color: #0f172a; }
.cell-text { font-size: 12px; color: #475569; }
.cell-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; }
.row-actions { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
</style>
