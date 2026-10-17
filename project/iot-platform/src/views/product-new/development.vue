<template>
  <div class="page-container">
    <!-- 页头 -->
    <div class="page-header">
      <div class="page-header-title">产品开发</div>
      <div class="page-header-row">
        <span class="page-header-desc">产品是一组具有相关功能定义的设备集合，创建产品是使用平台的开始。创建产品后通过功能定义 → 设备交互 → 硬件开发 → 产品配置 → 产品调试，简单五步即可完成产品智能化。</span>
        <a class="doc-link" @click="openDocs">产品开发操作文档</a>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="card filter-bar">
      <el-form :model="filter" inline class="filter-form">
        <el-form-item>
          <el-select v-model="filter.tag" placeholder="标签" clearable style="width:110px">
            <el-option label="全部" value="" />
            <el-option label="wifi" value="wifi" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filter.sortType" placeholder="创建时间顺序" clearable style="width:150px">
            <el-option label="创建时间" value="createTime" />
            <el-option label="更新时间" value="updateTime" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品ID">
          <el-input v-model="filter.productId" placeholder="产品ID" clearable style="width:120px" />
        </el-form-item>
        <el-form-item label="产品ID / 产品名称 / 产品型号">
          <el-input v-model="filter.name" placeholder="产品ID / 产品名称 / 产品型号" clearable style="width:260px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <div style="flex:1"></div>
        <el-form-item>
          <el-button type="plain" @click="handleCreate">
            <el-icon><Plus /></el-icon>创建产品
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 引用提示条 -->
    <div v-if="hasReferenced" class="tip-bar">
      <el-icon><InfoFilled /></el-icon>
      <span>引用产品为只读状态，不支持编辑和发布操作。如需修改请联系来源企业获取最新版本。</span>
    </div>

    <!-- 创建产品弹窗 -->
    <el-dialog v-model="createDialogVisible" title="创建产品" width="560px" top="8vh" :close-on-click-modal="false" class="app-dialog">
      <el-form ref="createFormRef" :model="createForm" label-width="80px">
        <el-form-item label="产品ID" required>
          <el-input v-model="createForm.productId" placeholder="例: IPC_PRO_001" maxlength="64" />
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

    <!-- 表格卡片 -->
    <div class="card" style="margin-top:12px;overflow:hidden">
      <div class="card-header">
        <span class="card-title">产品信息</span>
      </div>
      <el-table v-if="filteredData.length" :data="pagedData" stripe>
        <el-table-column label="产品信息" min-width="260">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-icon">{{ row.name.charAt(0) }}</div>
              <div class="product-meta">
                <div class="product-line1">
                  <span class="product-name" @click="handleManageProduct(row)">{{ row.name }}</span>
                </div>
                <div class="product-id">产品ID: {{ row.productId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类目" width="120" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.category }}</span>
          </template>
        </el-table-column>
        <el-table-column label="开发方式" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ devMethodLabel(row.devMethod) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源企业" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="cell-text">{{ row.sourceCompany }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', statusCls(row.status)]">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="授权信息" width="110" align="center">
          <template #default="{ row }">
            <span :class="{ 'auth-text': row.status === 'referenced' }">{{ row.authInfo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" width="90" align="center">
          <template #default="{ row }">
            <span class="cell-text">{{ row.operator }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属企业" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="cell-text">{{ row.company }}</span>
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
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <template v-if="row.status === 'published'">
                <el-button size="small" text type="primary" @click="handleAppConfig(row)">App配置</el-button>
                <el-button size="small" text type="primary" @click="handleAddFirmware(row)">添加固件</el-button>
                <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                  <el-button size="small" text type="primary">
                    更多<el-icon><ArrowDown /></el-icon>
                  </el-button>
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
                <el-button size="small" text type="primary" @click="handleCopy(row)">复制产品</el-button>
                <el-button size="small" text type="primary" @click="handleAddFirmware(row)">添加固件</el-button>
                <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                  <el-button size="small" text type="primary">
                    更多<el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="viewDetail">查看详情</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template v-else-if="row.status === 'developing'">
                <el-button size="small" text type="primary" @click="handleContinueDev(row)">继续开发</el-button>
                <el-button size="small" text type="primary" @click="handleAddFirmware(row)">添加固件</el-button>
                <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                  <el-button size="small" text type="primary">
                    更多<el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="copy">复制产品</el-dropdown-item>
                      <el-dropdown-item command="viewDetail">查看详情</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template v-else>
                <span class="no-action">—</span>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">暂无产品数据</div>

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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, ArrowDown, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi } from '@/api/index'

const router = useRouter()

// ===== 筛选 =====
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

function handleSearch() {
  pagination.page = 1
}

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

// ===== Mock 数据 =====
const productList = ref([
  {
    id: 0, productId: 'AROMA_001', name: '智能香薰机',
    category: '香薰机', devMethod: 'standard', sourceCompany: '本公司',
    status: 'developing', authInfo: '未授权', operator: '张三',
    company: '本公司', createTime: '2026-09-01', updateTime: '2026-09-05'
  },
  {
    id: 1, productId: 'IPC_PRO_001', name: 'IPC Pro 智能摄像机',
    category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '本公司',
    status: 'published', authInfo: '已授权 3/5', operator: '张三',
    company: '本公司', createTime: '2026-01-15', updateTime: '2026-05-20'
  },
  {
    id: 2, productId: 'DOORBELL_001', name: '智能门铃 Pro',
    category: '智能门铃', devMethod: 'custom', sourceCompany: '本公司',
    status: 'developing', authInfo: '未授权', operator: '李四',
    company: '本公司', createTime: '2026-03-01', updateTime: '2026-05-18'
  },
  {
    id: 3, productId: 'SENSOR_001', name: '烟感传感器',
    category: '传感安防', devMethod: 'standard', sourceCompany: '合作企业A',
    status: 'referenced', authInfo: '只读引用', operator: '王五',
    company: '合作企业A', createTime: '2026-02-10', updateTime: '2026-04-01'
  },
  {
    id: 4, productId: 'IPC_LITE_001', name: 'IPC Lite 室内摄像机',
    category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '本公司',
    status: 'publishing', authInfo: '已授权 2/3', operator: '赵六',
    company: '本公司', createTime: '2026-04-10', updateTime: '2026-05-22'
  },
  {
    id: 5, productId: 'LOCK_001', name: '智能门锁 T1',
    category: '智能门铃', devMethod: 'custom', sourceCompany: '合作企业B',
    status: 'developing', authInfo: '未授权', operator: '孙七',
    company: '合作企业B', createTime: '2026-04-20', updateTime: '2026-05-19'
  },
  {
    id: 6, productId: 'ALARM_001', name: '安防告警套装',
    category: '传感安防', devMethod: 'standard', sourceCompany: '本公司',
    status: 'published', authInfo: '已授权 5/5', operator: '张三',
    company: '本公司', createTime: '2026-01-20', updateTime: '2026-05-21'
  },
  {
    id: 7, productId: 'CAM_OUT_001', name: '户外球机',
    category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '合作企业C',
    status: 'referenced', authInfo: '只读引用', operator: '周八',
    company: '合作企业C', createTime: '2026-03-15', updateTime: '2026-03-15'
  },
  {
    id: 8, productId: 'IPC_AI_001', name: 'AI 智能分析摄像机',
    category: 'IPC摄像机', devMethod: 'custom', sourceCompany: '本公司',
    status: 'developing', authInfo: '未授权', operator: '李四',
    company: '本公司', createTime: '2026-05-01', updateTime: '2026-05-23'
  },
  {
    id: 9, productId: 'BELL_002', name: '可视门铃 Mini',
    category: '智能门铃', devMethod: 'standard', sourceCompany: '本公司',
    status: 'published', authInfo: '已授权 1/2', operator: '赵六',
    company: '本公司', createTime: '2026-02-28', updateTime: '2026-05-17'
  },
  {
    id: 10, productId: 'GAS_001', name: '燃气泄漏检测器',
    category: '传感安防', devMethod: 'standard', sourceCompany: '本公司',
    status: 'publishing', authInfo: '已授权 4/5', operator: '张三',
    company: '本公司', createTime: '2026-04-05', updateTime: '2026-05-24'
  },
  {
    id: 11, productId: 'IPC_5G_001', name: '5G 超高清摄像机',
    category: 'IPC摄像机', devMethod: 'custom', sourceCompany: '本公司',
    status: 'developing', authInfo: '未授权', operator: '孙七',
    company: '本公司', createTime: '2026-05-10', updateTime: '2026-05-25'
  },
  {
    id: 12, productId: 'DOOR_002', name: '智能门磁传感器',
    category: '传感安防', devMethod: 'standard', sourceCompany: '合作企业A',
    status: 'referenced', authInfo: '只读引用', operator: '王五',
    company: '合作企业A', createTime: '2026-03-20', updateTime: '2026-03-20'
  }
])

// ===== 筛选逻辑 =====
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

// ===== 分页 =====
const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

// ===== 标签映射 =====
const statusMap = { developing: '开发中', publishing: '发布中', published: '已发布', referenced: '引用产品' }
const statusClsMap = { developing: 's-dev', publishing: 's-pubing', published: 's-pubed', referenced: 's-ref' }
const devMethodMap = { standard: '标准开发', custom: '自定义开发' }

function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }
function devMethodLabel(m) { return devMethodMap[m] || m }

// ===== 创建产品弹窗 =====
const createDialogVisible = ref(false)
const createForm = reactive({
  productId: '',
  name: '',
  category: '',
  devMethod: 'standard',
  description: ''
})
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
    const data = {
      productId: createForm.productId.trim(),
      name: createForm.name.trim(),
      category: createForm.category,
      devMethod: createForm.devMethod,
      description: createForm.description.trim()
    }
    // 调用API创建
    await productApi.create(data)
    // 成功后加入本地列表
    productList.value.unshift({
      id: Date.now(),
      ...data,
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
  } catch (e) {
    ElMessage.error('创建失败：' + (e.message || '未知错误'))
  } finally {
    createSubmitting.value = false
  }
}

function handleContinueDev(row) {
  router.push(`/product-new/config?id=${row.productId}&name=${row.name}&category=${row.category}`)
}

function handleManageProduct(row) {
  router.push({ path: '/product-new/audit/detail', query: { productId: row.productId, name: row.name } })
}

function handleAppConfig(row) {
  router.push({ path: '/product/app', query: { productId: row.productId, name: row.name } })
}

function handleAddFirmware(row) {
  ElMessage.info(`添加固件 - ${row.name}`)
}

function handleCopy(row) {
  ElMessage.success(`已复制产品「${row.name}」`)
}

function handleMore(cmd, row) {
  switch (cmd) {
    case 'copy':
      handleCopy(row)
      break
    case 'viewDetail':
      ElMessage.info(`查看详情 - ${row.name}`)
      break
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

<style lang="scss" scoped>

.filter-bar {
  padding: var(--spacing-md) var(--spacing-lg);

  .filter-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    width: 100%;

    :deep(.el-form-item) {
      margin-right: 0;
      margin-bottom: 0;
    }
  }
}

.page-header {
  margin-bottom: 12px;
  .page-header-title { font-size: 20px; font-weight: 600; color: var(--text-primary); }
  .page-header-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-top: 8px;
    .page-header-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .doc-link { font-size: 13px; color: var(--primary-color); cursor: pointer; white-space: nowrap; &:hover { text-decoration: underline; } }
  }
}

.tip-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-top: 12px;
  background: #F0F7FF;
  border: 1px solid #B3D8FF;
  border-radius: 6px;
  font-size: 13px;
  color: #2563EB;
  .el-icon { flex-shrink: 0; font-size: 16px; }
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .product-icon {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: #EFF2F7;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 500;
    flex-shrink: 0;
  }

  .product-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;

    .product-line1 {
      display: flex;
      align-items: center;
      gap: 8px;

      .product-name {
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        &:hover { color: var(--primary-color); }
      }

    }

    .product-id {
      font-size: 12px;
      color: var(--text-placeholder);
      font-family: monospace;
    }
  }
}

.status-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  &.s-dev { background: #EFF6FF; color: #2563EB; }
  &.s-pubing { background: #FFF7ED; color: #EA580C; }
  &.s-pubed { background: #F0FDF4; color: #16A34A; }
  &.s-ref { background: #F3F4F6; color: #6B7280; }
}

.auth-text { color: var(--text-placeholder); }

.cell-time { font-size: 13px; color: var(--text-secondary); }

.action-btns {
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

.cell-text { font-size: 13px; color: var(--text-regular); }
.no-action { color: var(--text-placeholder); }

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
</style>

<style lang="scss">
// 弹窗样式（非 scoped，因 el-dialog 被 teleport 到 body）：顶部留白，避免第一个字段紧贴分割线
// 弹窗顶部留白（非 scoped，弹窗被 teleport 到 body）
.app-dialog .el-dialog__body { padding-top: 20px; }
</style>
