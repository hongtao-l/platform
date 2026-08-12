<template>
  <div class="page-container">
    <div class="service-layout">
      <!-- 左侧面板：服务分类 -->
      <div class="category-panel">
        <div class="category-header">
          <span class="category-title">服务分类</span>
          <el-button size="small" @click="openCategoryDialog('add')">新建分类</el-button>
        </div>
        <div class="category-list">
          <div
            v-for="cat in categoryList"
            :key="cat.id"
            class="category-item"
            :class="{ active: activeCategory === cat.id }"
            @click="activeCategory = cat.id"
          >
            <el-icon class="category-icon"><Folder /></el-icon>
            <span class="category-name">{{ cat.name }}</span>
            <el-tag size="small" class="category-count">{{ cat.count }}</el-tag>
            <el-button
              size="small"
              text
              class="category-edit-btn"
              @click.stop="openCategoryDialog('edit', cat)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧主区域：服务管理 -->
      <div class="service-main">
        <div class="service-toolbar">
          <el-button disabled>批量移动</el-button>
          <el-button type="primary" @click="openServiceDialog('add')">
            <el-icon><Plus /></el-icon>
            新增服务
          </el-button>
        </div>

        <div class="card">
          <el-table
            ref="tableRef"
            :data="filteredServiceList"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="服务名称" min-width="160">
              <template #default="{ row }">
                <span style="font-weight:500;color:var(--text-primary)">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="服务ID" width="120" align="center">
              <template #default="{ row }">
                <span>{{ row.serviceId }}</span>
              </template>
            </el-table-column>
            <el-table-column width="200" align="center">
              <template #header>
                <span>互斥服务</span>
                <el-popover placement="bottom" :width="420" trigger="click">
                  <template #reference>
                    <el-icon style="margin-left:4px;cursor:pointer;font-size:14px;color:var(--text-secondary);vertical-align:middle"><QuestionFilled /></el-icon>
                  </template>
                  <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">互斥服务无法同时生效，设备购买时的校验与生效策略如下：</div>
                  <table class="mutex-pop-table">
                    <thead>
                      <tr>
                        <th>套餐类型</th>
                        <th>相同/互斥服务</th>
                        <th>不同且不互斥</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>订阅</td>
                        <td>不可重复，弹窗拦截</td>
                        <td>不限制</td>
                      </tr>
                      <tr>
                        <td>非订阅</td>
                        <td>可重复，直接下单，按序生效</td>
                        <td>不限制</td>
                      </tr>
                      <tr>
                        <td>不同套餐类型</td>
                        <td>可重复，优先生效订阅，非订阅暂停</td>
                        <td>不限制</td>
                      </tr>
                    </tbody>
                  </table>
                </el-popover>
              </template>
              <template #default="{ row }">
                <template v-if="row.mutexServiceIds && row.mutexServiceIds.length">
                  <el-tag
                    v-for="(sid, i) in row.mutexServiceIds"
                    :key="i"
                    size="small"
                    style="margin:1px 2px;cursor:pointer"
                    @click="openMutexDrawer(row)"
                  >{{ sid }}</el-tag>
                </template>
                <el-button v-else size="small" text type="primary" @click="openMutexDrawer(row)">配置</el-button>
              </template>
            </el-table-column>
            <el-table-column label="所属分类" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ categoryName(row.categoryId) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最后更新" width="160">
              <template #default="{ row }">
                <span style="font-size:13px;color:var(--text-secondary)">{{ row.updatedAt }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="openServiceDialog('edit', row)">修改</el-button>
                <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-footer">
            <span class="total-text">共 {{ filteredServiceList.length }} 条</span>
            <el-pagination
              small
              background
              layout="prev, pager, next"
              :total="filteredServiceList.length"
              :page-size="10"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑分类弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryDialogMode === 'add' ? '新建分类' : '编辑分类'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top">
        <el-form-item label="* 分类名称" required>
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="categoryForm.sort" :min="0" style="width:200px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 创建/修改服务类型侧边弹窗 -->
    <el-drawer
      v-model="serviceDialogVisible"
      :title="serviceDialogMode === 'add' ? '创建服务类型' : '修改服务类型'"
      size="800px"
      :close-on-click-modal="false"
      @closed="handleServiceDialogClosed"
    >
      <div class="service-drawer-body">
        <!-- 基础字段 -->
        <el-form label-width="90px" class="service-basic-form">
          <el-form-item label="* 服务名称" required>
            <el-input v-model="serviceForm.name" placeholder="例如：全天云存" />
          </el-form-item>
          <el-form-item label="* 服务ID" required>
            <el-input
              v-model="serviceForm.serviceId"
              placeholder="例如：300010"
              :disabled="serviceDialogMode === 'edit'"
            />
          </el-form-item>
          <el-form-item label="所属分类">
            <el-select v-model="serviceForm.categoryId" style="width:100%">
              <el-option
                v-for="cat in categoryList"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="互斥服务">
            <el-select
              v-model="serviceForm.mutexServiceIds"
              multiple
              filterable
              placeholder="选择互斥服务，同互斥服务下仅可生效一个"
              style="width:100%"
            >
              <el-option
                v-for="s in mutexServiceOptions"
                :key="s.serviceId"
                :label="`${s.name} (${s.serviceId})`"
                :value="s.serviceId"
              />
            </el-select>
            <div class="form-tip">同互斥服务下仅可生效一个，用于 Agent 类服务的设备互斥控制</div>
          </el-form-item>
        </el-form>

        <!-- 已绑定物模型（只读，由算法库绑定自动关联） -->
        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span class="transfer-panel-title">已绑定物模型 {{ boundAlgorithms.length }}</span>
          </div>
          <div class="transfer-list">
            <div
              v-for="item in boundAlgorithms"
              :key="item.id"
              class="transfer-item"
            >
              <span>{{ item.algorithmId }} - {{ item._displayName }}</span>
            </div>
            <div v-if="boundAlgorithms.length === 0" class="transfer-empty">前往算法库绑定后自动关联</div>
          </div>
        </div>

      </div>

      <template #footer>
        <el-button @click="serviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveService">保存</el-button>
      </template>
    </el-drawer>

    <!-- 互斥服务配置侧边弹窗 -->
    <el-drawer
      v-model="mutexDrawerVisible"
      title="配置互斥服务"
      size="500px"
      :close-on-click-modal="false"
    >
      <div class="mutex-drawer-body">
        <div class="mutex-drawer-tip">
          互斥服务无法同时生效，设备购买时的校验与生效策略如下：
          <el-button
            size="small"
            text
            type="primary"
            style="padding:0;margin-left:4px"
            @click="mutexTipExpanded = !mutexTipExpanded"
          >
            {{ mutexTipExpanded ? '收起' : '展开' }}
          </el-button>
          <div v-show="mutexTipExpanded" class="mutex-matrix">
            <table class="mutex-matrix-table">
              <thead>
                <tr>
                  <th>套餐类型</th>
                  <th>相同/互斥服务</th>
                  <th>不同且不互斥</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>订阅</td>
                  <td>不可重复，弹窗拦截</td>
                  <td>不限制</td>
                </tr>
                <tr>
                  <td>非订阅</td>
                  <td>可重复，直接下单，按序生效</td>
                  <td>不限制</td>
                </tr>
                <tr>
                  <td>不同套餐类型</td>
                  <td>可重复，优先生效订阅，非订阅暂停</td>
                  <td>不限制</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <el-checkbox-group v-model="mutexForm.selectedIds">
          <div
            v-for="s in mutexConfigOptions"
            :key="s.serviceId"
            class="mutex-checkbox-item"
          >
            <el-checkbox :label="s.serviceId" :value="s.serviceId">
              {{ s.name }}（{{ s.serviceId }}）
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <div v-if="mutexConfigOptions.length === 0" class="transfer-empty">暂无可选服务</div>
      </div>
      <template #footer>
        <el-button @click="mutexDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMutexConfig">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Folder, Edit, QuestionFilled } from '@element-plus/icons-vue'
// ===== 分类管理 =====
const activeCategory = ref(1)
const categoryList = ref([
  { id: 1, name: '未分类', count: 46, sort: 0 },
  { id: 2, name: '云存储', count: 3, sort: 1 },
  { id: 3, name: 'AI服务', count: 3, sort: 2 }
])

const categoryDialogVisible = ref(false)
const categoryDialogMode = ref('add')
const editingCategory = ref(null)
const categoryForm = reactive({ name: '', sort: 0 })

const categoryName = (id) => {
  const cat = categoryList.value.find(c => c.id === id)
  return cat ? cat.name : '未分类'
}

const openCategoryDialog = (mode, cat) => {
  categoryDialogMode.value = mode
  if (mode === 'edit' && cat) {
    editingCategory.value = cat
    categoryForm.name = cat.name
    categoryForm.sort = cat.sort
  } else {
    editingCategory.value = null
    categoryForm.name = ''
    categoryForm.sort = 0
  }
  categoryDialogVisible.value = true
}

const saveCategory = () => {
  if (!categoryForm.name.trim()) return ElMessage.warning('请输入分类名称')
  if (categoryDialogMode.value === 'add') {
    const newCat = {
      id: Date.now(),
      name: categoryForm.name,
      count: 0,
      sort: categoryForm.sort
    }
    categoryList.value.push(newCat)
    ElMessage.success('分类已创建')
  } else {
    if (editingCategory.value) {
      editingCategory.value.name = categoryForm.name
      editingCategory.value.sort = categoryForm.sort
    }
    ElMessage.success('分类已更新')
  }
  categoryDialogVisible.value = false
}

// ===== 服务列表 =====
const tableRef = ref(null)
const selectedRows = ref([])

const serviceList = ref([
  { id: 1, name: '智能告警', serviceId: '110600', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 2, name: '低电检测服务', serviceId: '300028', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 3, name: '火焰检测', serviceId: '300022', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 4, name: '跌倒检测', serviceId: '300020', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 5, name: '宠物喂食器', serviceId: '300049', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 6, name: 'GPS定位', serviceId: '300050', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 7, name: '低功耗PIR检测', serviceId: '300048', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 8, name: '非机动车检测', serviceId: '300047', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 9, name: '鱼缸侦测', serviceId: '300046', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 10, name: '客流统计', serviceId: '300045', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 11, name: '儿童检测', serviceId: '300044', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 12, name: '离岗侦测', serviceId: '300043', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 13, name: '包裹侦测', serviceId: '300025', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 14, name: '哭声侦测', serviceId: '300023', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 15, name: '智能报警-家门监测', serviceId: '300041', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 16, name: '智能报警-厨房安全', serviceId: '300040', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 17, name: '智能报警-宠物监测', serviceId: '300042', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 18, name: '智能报警-老人看护', serviceId: '300039', categoryId: 1, updatedAt: '2026/6/17 17:54:52' }
])

const filteredServiceList = computed(() => {
  // TODO: 接入真实 API，按分类筛选
  return serviceList.value
})

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该服务吗？删除后不可恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = serviceList.value.findIndex(s => s.id === row.id)
    if (idx >= 0) serviceList.value.splice(idx, 1)
    ElMessage.success('服务已删除')
  }).catch(() => {})
}

// ===== 服务弹窗 =====
const serviceDialogVisible = ref(false)
const serviceDialogMode = ref('add')
const editingService = ref(null)
const serviceForm = reactive({
  name: '',
  serviceId: '',
  categoryId: 1,
  mutexServiceIds: []
})

const mutexServiceOptions = computed(() => {
  return serviceList.value.filter(s => s.serviceId !== serviceForm.serviceId)
})

// 已绑定算法 — 由算法库绑定自动关联，只读
const boundAlgorithms = computed(() => {
  const allAlgs = listAlgorithms({ page: 1, pageSize: 999 }).data?.list || []
  const allSvcs = listServices().data?.list || []
  const svcId = serviceForm.serviceId
  if (!svcId) return []
  const thisSvc = allSvcs.find(s => s.serviceId === svcId)
  if (!thisSvc) return []
  return allAlgs
    .filter(alg => {
      try { return JSON.parse(alg.serviceIds || '[]').includes(thisSvc.id) } catch { return false }
    })
    .map(alg => {
      let name = alg.algorithmId
      try { name = JSON.parse(alg.algorithmName || '{}')['1'] || alg.algorithmId } catch { /* */ }
      return { ...alg, _displayName: name }
    })
})

const openServiceDialog = (mode, row) => {
  serviceDialogMode.value = mode

  if (mode === 'add') {
    editingService.value = null
    serviceForm.name = ''
    serviceForm.serviceId = ''
    serviceForm.categoryId = activeCategory.value
    serviceForm.mutexServiceIds = []
  } else {
    editingService.value = row
    serviceForm.name = row.name
    serviceForm.serviceId = row.serviceId
    serviceForm.categoryId = row.categoryId
    serviceForm.mutexServiceIds = row.mutexServiceIds || []
  }
  serviceDialogVisible.value = true
}

const handleServiceDialogClosed = () => {}

const saveService = () => {
  if (!serviceForm.name.trim()) return ElMessage.warning('请输入服务名称')
  if (!serviceForm.serviceId.trim()) return ElMessage.warning('请输入服务ID')

  if (serviceDialogMode.value === 'add') {
    const newService = {
      id: Date.now(),
      name: serviceForm.name,
      serviceId: serviceForm.serviceId,
      categoryId: serviceForm.categoryId,
      mutexServiceIds: [...serviceForm.mutexServiceIds],
      updatedAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    serviceList.value.unshift(newService)
    ElMessage.success('服务已创建')
  } else {
    if (editingService.value) {
      editingService.value.name = serviceForm.name
      editingService.value.categoryId = serviceForm.categoryId
      editingService.value.mutexServiceIds = [...serviceForm.mutexServiceIds]
      editingService.value.updatedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    ElMessage.success('服务已更新')
  }
  serviceDialogVisible.value = false
}

// ===== 互斥服务配置 =====
const mutexDrawerVisible = ref(false)
const mutexEditingService = ref(null)
const mutexForm = reactive({ selectedIds: [] })
const mutexTipExpanded = ref(false)

const mutexConfigOptions = computed(() => {
  if (!mutexEditingService.value) return []
  return serviceList.value.filter(s => s.serviceId !== mutexEditingService.value.serviceId)
})

const openMutexDrawer = (row) => {
  mutexEditingService.value = row
  mutexForm.selectedIds = [...(row.mutexServiceIds || [])]
  mutexDrawerVisible.value = true
}

const saveMutexConfig = () => {
  if (mutexEditingService.value) {
    mutexEditingService.value.mutexServiceIds = [...mutexForm.selectedIds]
    mutexEditingService.value.updatedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    ElMessage.success('互斥服务已更新')
  }
  mutexDrawerVisible.value = false
}
</script>

<style lang="scss" scoped>
.service-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

// ===== 左侧分类面板 =====
.category-panel {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-lighter);
}

.category-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.category-list {
  padding: 4px 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background: var(--fill-light);
  }

  &.active {
    background: var(--fill-light);
  }

  .category-icon {
    color: var(--text-secondary);
    font-size: 16px;
    flex-shrink: 0;
  }

  .category-name {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
  }

  .category-count {
    flex-shrink: 0;
  }

  .category-edit-btn {
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s;
    color: var(--text-secondary);
  }

  &:hover .category-edit-btn {
    opacity: 1;
  }
}

// ===== 右侧服务管理 =====
.service-main {
  flex: 1;
  min-width: 0;
}

.service-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid var(--border-lighter);
}

.total-text {
  font-size: 13px;
  color: var(--text-secondary);
  margin-right: 12px;
}

// ===== 服务弹窗 =====
.service-drawer-body {
  padding-top: 20px;
}

.service-basic-form {
  .el-form-item {
    margin-bottom: 16px;
  }
}

.transfer-panel {
  flex: 1;
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.transfer-panel-header {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-lighter);
  font-size: 13px;
}

.transfer-list {
  flex: 1;
  max-height: 260px;
  overflow-y: auto;
  padding: 4px 8px 8px;
}

.transfer-item {
  padding: 3px 0;
  font-size: 13px;
}

.transfer-empty {
  text-align: center;
  color: var(--text-placeholder);
  padding: 40px 0;
  font-size: 13px;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

// ===== 互斥服务配置弹窗 =====
.mutex-drawer-body {
  padding-top: 20px;
}

.mutex-drawer-tip {
  padding: 10px 12px;
  margin-bottom: 16px;
  background: #EFF3FF;
  border: 1px solid #D6E4FD;
  border-radius: 8px;
  font-size: 12px;
  color: #4B5563;
  line-height: 1.5;
}

.mutex-matrix {
  margin-top: 10px;
}

.mutex-matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th, td {
    padding: 6px 8px;
    border: 1px solid var(--border-lighter);
    text-align: left;
  }

  th {
    background: var(--fill-light);
    font-weight: 500;
    color: var(--text-primary);
  }

  td {
    color: var(--text-secondary);
  }
}

.mutex-checkbox-item {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-lighter);

  &:last-child {
    border-bottom: none;
  }
}

</style>

<style lang="scss">
/* 服务弹窗内 el-form-item 间距 */
.service-drawer-body .el-form-item {
  margin-bottom: 16px;
}

.service-drawer-body .el-form-item__label {
  font-size: 13px;
}

/* 互斥服务说明弹窗内表格 */
.mutex-pop-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th, td {
    padding: 5px 8px;
    border: 1px solid #E5E7EB;
    text-align: left;
  }

  th {
    background: #F9FAFB;
    font-weight: 500;
    color: #374151;
  }

  td {
    color: #6B7280;
  }
}

</style>
