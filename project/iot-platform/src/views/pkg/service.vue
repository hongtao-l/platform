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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Folder, Edit } from '@element-plus/icons-vue'
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
  categoryId: 1
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
  } else {
    editingService.value = row
    serviceForm.name = row.name
    serviceForm.serviceId = row.serviceId
    serviceForm.categoryId = row.categoryId
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
      updatedAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    serviceList.value.unshift(newService)
    ElMessage.success('服务已创建')
  } else {
    if (editingService.value) {
      editingService.value.name = serviceForm.name
      editingService.value.categoryId = serviceForm.categoryId
      editingService.value.updatedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    ElMessage.success('服务已更新')
  }
  serviceDialogVisible.value = false
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

</style>

<style lang="scss">
/* 服务弹窗内 el-form-item 间距 */
.service-drawer-body .el-form-item {
  margin-bottom: 16px;
}

.service-drawer-body .el-form-item__label {
  font-size: 13px;
}

</style>
