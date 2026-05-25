<template>
  <div class="page-container">
    <!-- Page: Strategy List -->
    <div v-show="currentPage === 'strategy-list'" class="ops-panel" style="padding:0">
      <div class="card">
        <div class="card-header">
          <span class="card-title">商城位策略列表</span>
          <el-button type="primary" size="small" @click="openAddStrategy">
            <el-icon><Plus /></el-icon>添加策略
          </el-button>
        </div>
        <el-table :data="strategies" stripe :row-class-name="strategyRowClass">
          <el-table-column label="策略名称" min-width="160">
            <template #default="{ row }">
              <div class="strategy-name-cell">
                <div class="strategy-name">{{ row.name }}</div>
                <div v-if="row.isDefault" class="strategy-default-hint">未命中策略的用户展示此策略</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="投放区域" width="120">
            <template #default="{ row }">
              <el-tag v-for="r in row.regions" :key="r" size="small" type="info" class="cell-tag">{{ r }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="投放APP" width="140">
            <template #default="{ row }">
              <el-tag v-for="a in row.apps" :key="a" size="small" type="success" class="cell-tag">{{ a }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="投放用户分群" width="180">
            <template #default="{ row }">
              <span v-if="row.isDefault" class="cell-muted">—（默认策略不支持投放）</span>
              <template v-else>
                <el-tag v-for="g in row.groups" :key="g" size="small" type="primary" class="cell-tag cell-tag-block">{{ g }}</el-tag>
                <span v-if="!row.groups.length" class="cell-muted">未绑定</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="套餐配置" width="120">
            <template #default="{ row }">
              <span class="clickable-cell" @click="enterPkgManage(row)">{{ row.pkgCount }} 个套餐</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="160" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button size="small" text type="primary" @click="openEditStrategy(row)">编辑</el-button>
              <el-button v-if="!row.isDefault" size="small" text type="danger" @click="deleteStrategy(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Page: Package Management -->
    <div v-show="currentPage === 'pkg-manage'" class="ops-panel" style="padding:0">
      <div class="pkg-manage-header">
        <div class="pkg-manage-left">
          <el-button @click="currentPage = 'strategy-list'">
            <el-icon><ArrowLeft /></el-icon>返回
          </el-button>
          <div>
            <div class="pkg-manage-title">{{ pkgManageName }}</div>
            <div class="pkg-manage-subtitle">
              套餐配置 · 当前已配置 <span class="pkg-count">{{ pkgTotalCount }}</span> 个套餐 · <span class="color-gray-400">拖拽可调整分类内排序</span>
            </div>
          </div>
        </div>
        <div class="pkg-manage-actions">
          <el-button size="small" @click="openCategoryManagement">分类管理</el-button>
          <el-button type="primary" size="small" @click="openAddPackages">
            <el-icon><Plus /></el-icon>添加套餐
          </el-button>
        </div>
      </div>

      <!-- Category tables -->
      <div v-for="cat in categories" :key="cat.key" class="card category-card">
        <div class="card-header category-card-header">
          <span class="card-title category-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="category-icon">
              <path v-if="cat.key === 'cloud'" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <circle v-else-if="cat.key === 'ai'" cx="12" cy="12" r="10"/><path v-else-if="cat.key === 'ai'" d="M12 16v-4M12 8h.01"/>
              <path v-else d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
            </svg>
            {{ cat.name }}
            <span class="cat-pkg-count">{{ cat.packages.length }} 个套餐</span>
          </span>
        </div>
        <el-table :data="cat.packages" stripe row-key="id">
          <el-table-column width="40">
            <template #default>
              <span class="drag-handle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/></svg>
              </span>
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
              <el-button size="small" text type="danger" @click="removePkgFromCategory(cat.key, $index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Drawer: Add Strategy (2-step) -->
    <el-drawer v-model="addDrawerVisible" title="添加策略" size="720px">
      <div class="step-bar">
        <div class="step-item" :class="{ active: addStep >= 1, current: addStep === 1 }" @click="addStep = 1">
          <span class="step-num">
            <svg v-if="addStep > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            <template v-else>1</template>
          </span>
          <span class="step-label">基础信息</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: addStep >= 2 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: addStep >= 2, current: addStep === 2 }" @click="addStep = 2">
          <span class="step-num">
            <template>2</template>
          </span>
          <span class="step-label">投放配置</span>
        </div>
      </div>

      <div v-show="addStep === 1" class="step-content">
        <el-form label-position="top">
          <el-form-item label="策略名称" required>
            <el-input v-model="addForm.name" placeholder="请输入策略名称" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="addForm.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>

      <div v-show="addStep === 2" class="step-content">
        <el-form label-position="top">
          <el-form-item label="投放区域" required>
            <div class="checkbox-group">
              <label class="checkbox-item"><el-checkbox v-model="addForm.regions" value="国内" />国内</label>
              <label class="checkbox-item"><el-checkbox v-model="addForm.regions" value="海外" />海外</label>
            </div>
          </el-form-item>
          <el-form-item label="投放APP" required>
            <div class="checkbox-group">
              <label class="checkbox-item"><el-checkbox v-model="addForm.apps" value="牵心PRO" />牵心PRO <span class="checkbox-hint">QX_PRO_001</span></label>
              <label class="checkbox-item"><el-checkbox v-model="addForm.apps" value="鹤梦之家" />鹤梦之家 <span class="checkbox-hint">HM_HOME_001</span></label>
            </div>
          </el-form-item>
          <el-form-item label="投放用户分群" required>
            <div class="checkbox-group">
              <label v-for="g in mallUserGroups" :key="g.name" class="checkbox-item">
                <el-checkbox v-model="addForm.groups" :value="g.name" />{{ g.name }}
                <span class="checkbox-hint">{{ g.code }}</span>
              </label>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button v-if="addStep > 1" @click="addStep--">上一步</el-button>
        <span class="footer-spacer"></span>
        <el-button @click="addDrawerVisible = false">取消</el-button>
        <el-button v-if="addStep < 2" type="primary" @click="addStep++">下一步</el-button>
        <el-button v-else type="primary" @click="confirmAddStrategy">提交</el-button>
      </template>
    </el-drawer>

    <!-- Drawer: Edit Strategy (2-step) -->
    <el-drawer v-model="editDrawerVisible" title="编辑策略" size="720px">
      <div class="step-bar">
        <div class="step-item" :class="{ active: editStep >= 1, current: editStep === 1 }" @click="editStep = 1">
          <span class="step-num">
            <svg v-if="editStep > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            <template v-else>1</template>
          </span>
          <span class="step-label">基础信息</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: editStep >= 2 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: editStep >= 2, current: editStep === 2 }" @click="editStep = 2">
          <span class="step-num">
            <template>2</template>
          </span>
          <span class="step-label">投放配置</span>
        </div>
      </div>

      <div v-show="editStep === 1" class="step-content">
        <el-form label-position="top">
          <el-form-item label="策略名称" required>
            <el-input v-model="editForm.name" placeholder="请输入策略名称" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="editForm.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>

      <div v-show="editStep === 2" class="step-content">
        <el-form label-position="top">
          <el-form-item label="投放区域" required>
            <div class="checkbox-group" :class="{ 'is-disabled': editingIsDefault }">
              <label class="checkbox-item"><el-checkbox v-model="editForm.regions" value="国内" :disabled="editingIsDefault" />国内</label>
              <label class="checkbox-item"><el-checkbox v-model="editForm.regions" value="海外" :disabled="editingIsDefault" />海外</label>
            </div>
          </el-form-item>
          <el-form-item label="投放APP" required>
            <div class="checkbox-group" :class="{ 'is-disabled': editingIsDefault }">
              <label class="checkbox-item"><el-checkbox v-model="editForm.apps" value="牵心PRO" :disabled="editingIsDefault" />牵心PRO <span class="checkbox-hint">QX_PRO_001</span></label>
              <label class="checkbox-item"><el-checkbox v-model="editForm.apps" value="鹤梦之家" :disabled="editingIsDefault" />鹤梦之家 <span class="checkbox-hint">HM_HOME_001</span></label>
            </div>
          </el-form-item>
          <el-form-item label="投放用户分群" required>
            <div class="checkbox-group" :class="{ 'is-disabled': editingIsDefault }">
              <label v-for="g in mallUserGroups" :key="g.name" class="checkbox-item">
                <el-checkbox v-model="editForm.groups" :value="g.name" :disabled="editingIsDefault" />{{ g.name }}
                <span class="checkbox-hint">{{ g.code }}</span>
              </label>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button v-if="editStep > 1" @click="editStep--">上一步</el-button>
        <span class="footer-spacer"></span>
        <el-button @click="editDrawerVisible = false">取消</el-button>
        <el-button v-if="editStep < 2" type="primary" @click="editStep++">下一步</el-button>
        <el-button v-else type="primary" @click="confirmEditStrategy">保存</el-button>
      </template>
    </el-drawer>

    <!-- Dialog: 分类管理 -->
    <el-dialog v-model="categoryMgmtVisible" title="分类管理" width="600px">
      <div class="category-mgmt-toolbar">
        <div class="color-gray-400" style="font-size:var(--font-xs)">拖拽可调整排序</div>
        <el-button type="primary" size="small" @click="openAddCategory">
          <el-icon><Plus /></el-icon>添加分类
        </el-button>
      </div>
      <el-table :data="categories" stripe>
        <el-table-column width="40">
          <template #default>
            <span class="drag-handle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/></svg>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="分类名称" min-width="200">
          <template #default="{ row }">
            <span class="text-medium">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="套餐数量" width="120">
          <template #default="{ row }">{{ row.packages.length }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="openEditCategory(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="categoryMgmtVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: Add/Edit Category -->
    <el-dialog v-model="addCategoryVisible" :title="editingCategory ? '编辑分类' : '添加分类'" width="400px">
      <el-form-item label="分类名称" required>
        <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
      </el-form-item>
      <template #footer>
        <el-button @click="addCategoryVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">{{ editingCategory ? '保存' : '确定' }}</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: Add Packages (Transfer) -->
    <el-dialog v-model="addPkgVisible" title="添加套餐" width="900px" top="5vh">
      <div class="transfer-filter-bar">
        <el-select v-model="pkgTransferFilter.type" placeholder="全部分类" size="small" class="filter-select" clearable>
          <el-option v-for="cat in categories" :key="cat.key" :label="cat.name" :value="cat.key" />
        </el-select>
        <el-select v-model="pkgTransferFilter.region" placeholder="投放区域" size="small" class="filter-select-sm" clearable>
          <el-option label="国内" value="domestic" />
          <el-option label="海外" value="overseas" />
        </el-select>
        <el-select v-model="pkgTransferFilter.app" placeholder="投放APP" size="small" class="filter-select-md" clearable>
          <el-option label="牵心PRO" value="qx" />
          <el-option label="鹤梦之家" value="hm" />
        </el-select>
        <el-select v-model="pkgTransferFilter.slot" placeholder="投放运营位" size="small" class="filter-select-md" clearable>
          <el-option label="商城位" value="mall" />
          <el-option label="推荐位" value="recommend" />
        </el-select>
        <el-input v-model="pkgTransferFilter.keyword" placeholder="搜索套餐名称或ID" size="small" class="filter-input" clearable />
      </div>

      <div class="transfer-container">
        <!-- Left: Available packages -->
        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>可选套餐</span>
            <span class="transfer-selected-count">已选 <span class="count-num">{{ selectedPkgIds.length }}</span> 个</span>
          </div>
          <div class="transfer-panel-body">
            <label
              v-for="pkg in filteredTransferPkgs"
              :key="pkg.id"
              :class="['transfer-pkg-item', { selected: selectedPkgIds.includes(pkg.id), hidden: !isPkgVisible(pkg) }]"
            >
              <el-checkbox :model-value="selectedPkgIds.includes(pkg.id)" @change="togglePkgSelect(pkg.id)" />
              <div class="transfer-pkg-info">
                <div class="transfer-pkg-name">{{ pkg.name }}</div>
                <div class="transfer-pkg-meta">{{ pkg.id }} · {{ pkg.direction }} · <span class="transfer-pkg-cat">{{ pkg.category }}</span> · {{ pkg.price }}</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Center: Transfer buttons -->
        <div class="transfer-actions">
          <el-button size="small" :disabled="!selectedPkgIds.length" @click="addSelectedPkgs">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button size="small" @click="removeSelectedPkgs">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>

        <!-- Right: Target categories -->
        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>目标分类</span>
            <el-button size="small" text @click="openCategoryFromTransfer">管理</el-button>
          </div>
          <div class="transfer-panel-body">
            <div v-for="cat in categories" :key="cat.key" :class="['transfer-category-item', { expanded: expandedCats.includes(cat.key) }]">
              <div class="transfer-cat-header" @click="toggleCatExpand(cat.key)">
                <el-checkbox :model-value="transferCats.includes(cat.key)" @change="toggleCatSelect(cat.key)" @click.stop />
                <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                <span class="transfer-cat-name">{{ cat.name }}</span>
                <span class="transfer-cat-count">{{ getCatAddedPkgCount(cat.key) }} 个套餐</span>
              </div>
              <div class="transfer-cat-body">
                <span v-for="pkg in getCatAddedPkgs(cat.key)" :key="pkg.id" class="transfer-tag">
                  {{ pkg.name }}<span class="transfer-tag-close" @click="removeCatPkg(cat.key, pkg.id)">×</span>
                </span>
                <div v-if="!getCatAddedPkgCount(cat.key)" class="transfer-empty">暂未添加套餐</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="addPkgVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddPackages">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// Page state
const currentPage = ref('strategy-list')
const pkgManageName = ref('')
const pkgManageIdx = ref(-1)

// Strategies
const strategies = ref([
  { id: 0, name: '国内默认策略', regions: ['国内'], apps: ['牵心PRO', '鹤梦之家'], groups: [], pkgCount: 3, remark: '国内默认策略，兜底展示', isDefault: true },
  { id: -1, name: '海外默认策略', regions: ['海外'], apps: ['牵心PRO', '鹤梦之家'], groups: [], pkgCount: 3, remark: '海外默认策略，兜底展示', isDefault: true },
  { id: 1, name: '高价值用户专属', regions: ['国内'], apps: ['牵心PRO'], groups: ['高价值用户'], pkgCount: 5, remark: '针对高价值用户的专属套餐推荐' },
  { id: 2, name: '新用户引导策略', regions: ['国内', '海外'], apps: ['牵心PRO', '鹤梦之家'], groups: ['新注册用户', '活跃用户', '付费用户'], pkgCount: 2, remark: '新用户首次进入商城的引导套餐' }
])

const strategyRowClass = ({ row }) => row.isDefault ? 'default-row' : ''

const mallUserGroups = [
  { name: '高价值用户', code: 'ug_high_value' },
  { name: '新注册用户', code: 'ug_new_reg' },
  { name: '活跃用户', code: 'ug_active' },
  { name: '付费用户', code: 'ug_paid' }
]

const pkgTotalCount = computed(() => {
  return categories.value.reduce((sum, c) => sum + c.packages.length, 0)
})

// Categories with their packages
const categories = ref([
  {
    key: 'cloud', name: '云存储套餐',
    packages: [
      { id: 'PKG20220001', name: '事件录像7天', direction: '设备', subType: '订阅制', price: '¥6.90 / $0.95', enabled: true },
      { id: 'PKG20220015', name: '国内专享·极简云存', direction: '用户', subType: '订阅制', price: '¥59.00 / $8.50', enabled: true },
      { id: 'PKG20220011', name: 'Overseas-Pro', direction: '设备', subType: '订阅制', price: '$12.99', enabled: false }
    ]
  },
  {
    key: 'ai', name: 'AI智能服务',
    packages: [
      { id: 'PKG20220020', name: 'AI智能检测月卡', direction: '设备', subType: '订阅制', price: '¥19.90 / $2.99', enabled: true }
    ]
  },
  {
    key: 'bundle', name: '综合套餐',
    packages: [
      { id: 'PKG20220025', name: '全家桶年度套餐', direction: '用户', subType: '非订阅', price: '¥199.00 / $29.99', enabled: true }
    ]
  }
])

const enterPkgManage = (row) => {
  pkgManageName.value = row.name
  pkgManageIdx.value = row.id
  currentPage.value = 'pkg-manage'
}

const removePkgFromCategory = (catKey, idx) => {
  const cat = categories.value.find(c => c.key === catKey)
  if (cat) cat.packages.splice(idx, 1)
}

// Add Strategy
const addDrawerVisible = ref(false)
const addStep = ref(1)
const addForm = reactive({ name: '', remark: '', regions: ['国内'], apps: ['牵心PRO'], groups: [] })

const openAddStrategy = () => {
  addStep.value = 1
  addForm.name = ''
  addForm.remark = ''
  addForm.regions = ['国内']
  addForm.apps = ['牵心PRO']
  addForm.groups = []
  addDrawerVisible.value = true
}

const confirmAddStrategy = () => {
  const newId = strategies.value.length
  strategies.value.push({
    id: newId, name: addForm.name, regions: [...addForm.regions],
    apps: [...addForm.apps], groups: [...addForm.groups],
    pkgCount: 0, remark: addForm.remark, isDefault: false
  })
  addDrawerVisible.value = false
  pkgManageName.value = addForm.name
  pkgManageIdx.value = newId
  currentPage.value = 'pkg-manage'
}

// Edit Strategy
const editDrawerVisible = ref(false)
const editStep = ref(1)
const editingIdx = ref(-1)
const editingIsDefault = ref(false)
const editForm = reactive({ name: '', remark: '', regions: [], apps: [], groups: [] })

const openEditStrategy = (row) => {
  editStep.value = 1
  editingIdx.value = row.id
  editingIsDefault.value = row.isDefault
  editForm.name = row.name
  editForm.remark = row.remark === '—' ? '' : row.remark
  editForm.regions = [...row.regions]
  editForm.apps = [...row.apps]
  editForm.groups = [...row.groups]
  editDrawerVisible.value = true
}

const confirmEditStrategy = () => {
  const s = strategies.value.find(s => s.id === editingIdx.value)
  if (s) {
    s.name = editForm.name
    s.remark = editForm.remark
    if (!editingIsDefault.value) {
      s.regions = [...editForm.regions]
      s.apps = [...editForm.apps]
      s.groups = [...editForm.groups]
    }
  }
  editDrawerVisible.value = false
}

const deleteStrategy = (row) => {
  strategies.value = strategies.value.filter(s => s.id !== row.id)
}

// Category management
const categoryMgmtVisible = ref(false)
const addCategoryVisible = ref(false)
const editingCategory = ref(null)
const categoryForm = reactive({ name: '' })
const _returnToAddPkg = ref(false)

const openCategoryManagement = () => { categoryMgmtVisible.value = true }
const openCategoryFromTransfer = () => {
  _returnToAddPkg.value = true
  addPkgVisible.value = false
  categoryMgmtVisible.value = true
}

const openAddCategory = () => {
  editingCategory.value = null
  categoryForm.name = ''
  addCategoryVisible.value = true
}

const openEditCategory = (row) => {
  editingCategory.value = row
  categoryForm.name = row.name
  addCategoryVisible.value = true
}

const saveCategory = () => {
  if (!categoryForm.name) return
  if (editingCategory.value) {
    editingCategory.value.name = categoryForm.name
  } else {
    categories.value.push({ key: 'cat_' + Date.now(), name: categoryForm.name, packages: [] })
  }
  addCategoryVisible.value = false
}

const deleteCategory = (row) => {
  categories.value = categories.value.filter(c => c.key !== row.key)
}

// Package transfer
const addPkgVisible = ref(false)
const selectedPkgIds = ref([])
const pkgTransferFilter = reactive({ type: '', region: '', app: '', slot: '', keyword: '' })
const expandedCats = ref(['cloud', 'ai', 'bundle'])
const transferCats = ref([])
const catAddedPkgs = reactive({ cloud: [], ai: [], bundle: [] })

const allPkgList = [
  { id: 'PKG20220001', name: '事件录像7天', direction: '设备', category: '云存储套餐', price: '¥6.90/$0.95', type: 'cloud', region: 'domestic', app: 'qx', slot: 'mall' },
  { id: 'PKG20220015', name: '国内专享·极简云存', direction: '用户', category: '云存储套餐', price: '¥59.00', type: 'cloud', region: 'domestic', app: 'qx', slot: 'mall' },
  { id: 'PKG20220011', name: 'Overseas-Pro', direction: '设备', category: '云存储套餐', price: '$12.99', type: 'cloud', region: 'overseas', app: 'hm', slot: 'mall' },
  { id: 'PKG20220020', name: 'AI智能检测月卡', direction: '设备', category: 'AI智能服务', price: '¥19.90/$2.99', type: 'ai', region: 'all', app: 'qx', slot: 'all' },
  { id: 'PKG20220025', name: '全家桶年度套餐', direction: '用户', category: '综合套餐', price: '¥199.00/$29.99', type: 'bundle', region: 'all', app: 'qx', slot: 'all' },
  { id: 'PKG20220030', name: '30天全时云存储Pro版', direction: '设备', category: '云存储套餐', price: '¥29.90/$4.50', type: 'cloud', region: 'domestic', app: 'qx', slot: 'mall' }
]

const filteredTransferPkgs = computed(() => allPkgList)

const isPkgVisible = (pkg) => {
  if (pkgTransferFilter.type && pkg.type !== pkgTransferFilter.type) return false
  if (pkgTransferFilter.region && pkg.region !== 'all' && pkg.region !== pkgTransferFilter.region) return false
  if (pkgTransferFilter.app && pkg.app !== 'all' && pkg.app !== pkgTransferFilter.app) return false
  if (pkgTransferFilter.slot && pkg.slot !== 'all' && pkg.slot !== pkgTransferFilter.slot) return false
  if (pkgTransferFilter.keyword) {
    const kw = pkgTransferFilter.keyword.toLowerCase()
    if (!pkg.name.toLowerCase().includes(kw) && !pkg.id.toLowerCase().includes(kw)) return false
  }
  return true
}

const togglePkgSelect = (id) => {
  const idx = selectedPkgIds.value.indexOf(id)
  if (idx === -1) selectedPkgIds.value.push(id)
  else selectedPkgIds.value.splice(idx, 1)
}

const toggleCatExpand = (key) => {
  const idx = expandedCats.value.indexOf(key)
  if (idx === -1) expandedCats.value.push(key)
  else expandedCats.value.splice(idx, 1)
}

const toggleCatSelect = (key) => {
  const idx = transferCats.value.indexOf(key)
  if (idx === -1) transferCats.value.push(key)
  else transferCats.value.splice(idx, 1)
}

const getCatAddedPkgs = (catKey) => {
  return (catAddedPkgs[catKey] || []).map(id => allPkgList.find(p => p.id === id)).filter(Boolean)
}

const getCatAddedPkgCount = (catKey) => (catAddedPkgs[catKey] || []).length

const addSelectedPkgs = () => {
  if (!selectedPkgIds.value.length) return
  const targetCats = transferCats.value.length ? transferCats.value : categories.value.map(c => c.key)
  for (const catKey of targetCats) {
    for (const id of selectedPkgIds.value) {
      if (!catAddedPkgs[catKey].includes(id)) {
        catAddedPkgs[catKey].push(id)
      }
    }
    if (!expandedCats.value.includes(catKey)) expandedCats.value.push(catKey)
  }
  selectedPkgIds.value = []
}

const removeSelectedPkgs = () => {
  for (const catKey of categories.value.map(c => c.key)) {
    catAddedPkgs[catKey] = (catAddedPkgs[catKey] || []).filter(id => !selectedPkgIds.value.includes(id))
  }
  selectedPkgIds.value = []
}

const removeCatPkg = (catKey, pkgId) => {
  const arr = catAddedPkgs[catKey] || []
  const idx = arr.indexOf(pkgId)
  if (idx !== -1) arr.splice(idx, 1)
}

const openAddPackages = () => {
  selectedPkgIds.value = []
  transferCats.value = []
  pkgTransferFilter.type = ''
  pkgTransferFilter.region = ''
  pkgTransferFilter.app = ''
  pkgTransferFilter.slot = ''
  pkgTransferFilter.keyword = ''
  for (const cat of categories.value) {
    catAddedPkgs[cat.key] = []
  }
  addPkgVisible.value = true
}

const confirmAddPackages = () => {
  let total = 0
  for (const cat of categories.value) {
    const ids = catAddedPkgs[cat.key] || []
    for (const id of ids) {
      const pkg = allPkgList.find(p => p.id === id)
      if (pkg && !cat.packages.find(p => p.id === id)) {
        cat.packages.push({ ...pkg, enabled: true })
        total++
      }
    }
    catAddedPkgs[cat.key] = []
  }
  if (total) {
    const s = strategies.value.find(s => s.id === pkgManageIdx.value)
    if (s) s.pkgCount = pkgTotalCount.value
  }
  addPkgVisible.value = false
}
</script>

<style lang="scss" scoped>
// ===== Strategy Table =====
.strategy-name-cell {
  .strategy-name { font-weight: 500; color: var(--text-primary); }
  .strategy-default-hint { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
}

.cell-tag { margin-right: 4px; }
.cell-tag-block { margin-bottom: 2px; }
.cell-muted { font-size: var(--font-sm); color: var(--gray-400); }

// ===== Package Management =====
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

// ===== Category Cards =====
.category-card { margin-bottom: var(--spacing-md); }
.category-card-header { background: var(--gray-50); }
.category-card-title { font-size: var(--font-md); }
.category-icon { margin-right: 6px; vertical-align: -2px; }
.cat-pkg-count { font-weight: 400; color: var(--gray-400); font-size: var(--font-xs); margin-left: 6px; }

// ===== Category Table =====
.pkg-info-cell {
  .pkg-info-name { font-weight: 500; color: var(--text-primary); }
  .pkg-info-id { font-size: var(--font-xs); color: var(--gray-400); margin-top: 2px; }
}

.price-cell { font-weight: 500; }

// ===== Category Management Dialog =====
.category-mgmt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

// ===== Transfer Filter Bar =====
.transfer-filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.filter-select { width: 120px; }
.filter-select-sm { width: 120px; }
.filter-select-md { width: 140px; }
.filter-input { flex: 1; min-width: 180px; }

.transfer-selected-count {
  font-weight: 400;
  color: var(--gray-400);

  .count-num { color: var(--primary-color); font-weight: 600; }
}

// ===== Utilities =====
.footer-spacer { flex: 1; }
.color-gray-400 { color: var(--gray-400); }
.text-medium { font-weight: 500; color: var(--text-primary); }

.checkbox-group.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
