<template>
  <div class="page-container">
    <!-- Header -->
    <div class="pkg-manage-header">
      <div class="pkg-manage-left">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <div>
          <div class="pkg-manage-title">{{ strategyName }}</div>
          <div class="pkg-manage-subtitle">
            套餐配置 · 当前已配置 <span class="pkg-count">{{ packages.length }}</span> 个套餐 · <span class="color-gray-400">拖拽可调整排序</span>
          </div>
        </div>
      </div>
      <div class="pkg-manage-actions">
        <el-button type="primary" size="small" @click="openAddPackages">
          <el-icon><Plus /></el-icon>添加套餐
        </el-button>
      </div>
    </div>

    <!-- Package table -->
    <div class="card">
      <el-table :data="packages" stripe row-key="id">
        <el-table-column width="40">
          <template #default>
            <span class="drag-handle" draggable="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/></svg>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="60">
          <template #default="{ $index }">
            <span class="sort-index">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="套餐信息" min-width="200">
          <template #default="{ row }">
            <div class="pkg-info-cell">
              <div class="pkg-info-name">{{ row.name }}</div>
              <div class="pkg-info-id">{{ row.id }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="应用方向" width="100">
          <template #default="{ row }">{{ row.direction }}</template>
        </el-table-column>
        <el-table-column label="订阅类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.subType === '订阅制' ? 'success' : 'info'" size="small">{{ row.subType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="售价" width="140">
          <template #default="{ row }">
            <span class="price-cell">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上架状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row, $index }">
            <el-button size="small" text type="danger" @click="removePackage($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog: Add Packages -->
    <el-dialog v-model="addPkgVisible" title="添加套餐" width="700px" top="5vh">
      <div class="transfer-filter-bar">
        <el-select v-model="pkgTransferFilter.region" placeholder="投放区域" size="small" class="filter-select" clearable>
          <el-option label="国内" value="domestic" />
          <el-option label="海外" value="overseas" />
        </el-select>
        <el-select v-model="pkgTransferFilter.app" placeholder="投放APP" size="small" class="filter-select" clearable>
          <el-option label="牵心PRO" value="qx" />
          <el-option label="鹤梦之家" value="hm" />
        </el-select>
        <el-input v-model="pkgTransferFilter.keyword" placeholder="搜索套餐名称或ID" size="small" class="filter-input" clearable />
      </div>

      <el-table :data="filteredAvailablePkgs" stripe row-key="id" max-height="380" @selection-change="onSelectionChange">
        <el-table-column type="selection" width="40" />
        <el-table-column label="套餐信息" min-width="200">
          <template #default="{ row }">
            <div class="pkg-info-cell">
              <div class="pkg-info-name">{{ row.name }}</div>
              <div class="pkg-info-id">{{ row.id }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="应用方向" width="80">
          <template #default="{ row }">{{ row.direction }}</template>
        </el-table-column>
        <el-table-column label="订阅类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.subType === '订阅制' ? 'success' : 'info'" size="small">{{ row.subType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="售价" width="130">
          <template #default="{ row }">
            <span class="price-cell">{{ row.price }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="transfer-bottom-bar">
        <span class="transfer-selected-count">已选 <span class="count-num">{{ selectedPkgs.length }}</span> 个套餐</span>
      </div>

      <template #footer>
        <el-button @click="addPkgVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedPkgs.length" @click="confirmAddPackages">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const strategyId = ref(route.query.strategyId || '')
const strategyName = ref(route.query.name || '活动套餐配置')

function goBack() {
  router.push('/ops/activity')
}

// ===== Package list (flat, no categories) =====
const packages = ref([
  { id: 'PKG20220001', name: '事件录像7天', direction: '设备', subType: '订阅制', price: '¥6.90 / $0.95', enabled: true },
  { id: 'PKG20220020', name: 'AI智能检测月卡', direction: '设备', subType: '订阅制', price: '¥19.90 / $2.99', enabled: true },
  { id: 'PKG20220015', name: '国内专享·极简云存', direction: '用户', subType: '订阅制', price: '¥59.00 / $8.50', enabled: true },
  { id: 'PKG20220025', name: '全家桶年度套餐', direction: '用户', subType: '非订阅', price: '¥199.00 / $29.99', enabled: true },
])

function removePackage(idx) {
  packages.value.splice(idx, 1)
}

// ===== Drag & Drop sorting =====
let dragSourceIndex = -1

onMounted(() => {
  const tableEl = document.querySelector('.card .el-table__body-wrapper tbody')
  if (!tableEl) return

  tableEl.addEventListener('dragstart', (e) => {
    const handle = e.target.closest('.drag-handle')
    if (!handle) { e.preventDefault(); return }
    const row = handle.closest('tr')
    if (!row) { e.preventDefault(); return }
    dragSourceIndex = Array.from(tableEl.children).indexOf(row)
    e.dataTransfer.effectAllowed = 'move'
    row.classList.add('drag-source')
  })

  tableEl.addEventListener('dragover', (e) => {
    e.preventDefault()
    const row = e.target.closest('tr')
    if (!row || row.classList.contains('drag-source')) return
    e.dataTransfer.dropEffect = 'move'
  })

  tableEl.addEventListener('drop', (e) => {
    e.preventDefault()
    const row = e.target.closest('tr')
    if (!row || dragSourceIndex === -1) return
    const targetIndex = Array.from(tableEl.children).indexOf(row)
    if (targetIndex === -1 || targetIndex === dragSourceIndex) return

    const moved = packages.value.splice(dragSourceIndex, 1)[0]
    packages.value.splice(targetIndex, 0, moved)
    dragSourceIndex = -1
    document.querySelectorAll('.drag-source').forEach(el => el.classList.remove('drag-source'))
  })

  tableEl.addEventListener('dragend', () => {
    dragSourceIndex = -1
    document.querySelectorAll('.drag-source').forEach(el => el.classList.remove('drag-source'))
  })
})

// ===== Add Packages dialog =====
const addPkgVisible = ref(false)
const selectedPkgs = ref([])
const pkgTransferFilter = reactive({ region: '', app: '', keyword: '' })

const allPkgList = [
  { id: 'PKG20220001', name: '事件录像7天', direction: '设备', subType: '订阅制', price: '¥6.90 / $0.95', region: 'domestic', app: 'qx' },
  { id: 'PKG20220015', name: '国内专享·极简云存', direction: '用户', subType: '订阅制', price: '¥59.00 / $8.50', region: 'domestic', app: 'qx' },
  { id: 'PKG20220011', name: 'Overseas-Pro', direction: '设备', subType: '订阅制', price: '$12.99', region: 'overseas', app: 'hm' },
  { id: 'PKG20220020', name: 'AI智能检测月卡', direction: '设备', subType: '订阅制', price: '¥19.90 / $2.99', region: 'all', app: 'qx' },
  { id: 'PKG20220025', name: '全家桶年度套餐', direction: '用户', subType: '非订阅', price: '¥199.00 / $29.99', region: 'all', app: 'qx' },
  { id: 'PKG20220030', name: '30天全时云存储Pro版', direction: '设备', subType: '订阅制', price: '¥29.90 / $4.50', region: 'domestic', app: 'qx' },
  { id: 'PKG20220040', name: '智能看护基础版', direction: '设备', subType: '订阅制', price: '¥9.90 / $1.49', region: 'all', app: 'hm' },
]

const filteredAvailablePkgs = computed(() => {
  return allPkgList.filter(pkg => {
    if (pkgTransferFilter.region && pkg.region !== 'all' && pkg.region !== pkgTransferFilter.region) return false
    if (pkgTransferFilter.app && pkg.app !== 'all' && pkg.app !== pkgTransferFilter.app) return false
    if (pkgTransferFilter.keyword) {
      const kw = pkgTransferFilter.keyword.toLowerCase()
      if (!pkg.name.toLowerCase().includes(kw) && !pkg.id.toLowerCase().includes(kw)) return false
    }
    // Exclude already-added packages
    if (packages.value.some(p => p.id === pkg.id)) return false
    return true
  })
})

function onSelectionChange(val) {
  selectedPkgs.value = val
}

function openAddPackages() {
  selectedPkgs.value = []
  pkgTransferFilter.region = ''
  pkgTransferFilter.app = ''
  pkgTransferFilter.keyword = ''
  addPkgVisible.value = true
}

function confirmAddPackages() {
  for (const pkg of selectedPkgs.value) {
    if (!packages.value.find(p => p.id === pkg.id)) {
      packages.value.push({ ...pkg, enabled: true })
    }
  }
  selectedPkgs.value = []
  addPkgVisible.value = false
}
</script>

<style lang="scss" scoped>
// ===== Header =====
.pkg-manage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.pkg-manage-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pkg-manage-actions {
  display: flex;
  gap: 8px;
}

.pkg-manage-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.pkg-manage-subtitle { font-size: var(--font-xs); color: var(--text-secondary); margin-top: 2px; }
.pkg-count { color: var(--primary-color); font-weight: 600; }

// ===== Table =====
.drag-handle {
  cursor: grab;
  color: var(--gray-400);
  display: inline-flex;
  align-items: center;

  &:active { cursor: grabbing; }
}

.sort-index {
  font-size: var(--font-xs);
  color: var(--gray-400);
}

.pkg-info-cell {
  .pkg-info-name { font-weight: 500; color: var(--text-primary); }
  .pkg-info-id { font-size: var(--font-xs); color: var(--gray-400); margin-top: 2px; }
}

.price-cell { font-weight: 500; }

// ===== Add Packages Dialog =====
.transfer-filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: var(--spacing-md);
}

.filter-select { width: 120px; }
.filter-input { flex: 1; min-width: 180px; }

.transfer-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.transfer-selected-count {
  font-size: var(--font-sm);
  color: var(--gray-400);

  .count-num { color: var(--primary-color); font-weight: 600; }
}

// ===== Utilities =====
.color-gray-400 { color: var(--gray-400); }
</style>

<style lang="scss">
// Drag visual feedback — non-scoped to affect table rows
tr.drag-source {
  opacity: 0.4;
  background: var(--gray-100);
}
</style>
