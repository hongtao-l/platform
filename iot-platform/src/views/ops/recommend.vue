<template>
  <div class="page-container" style="display:flex;flex-direction:column;padding:0">
    <!-- Top Tabs -->
    <div class="ops-tabs">
      <div
        v-for="tab in opsTabs"
        :key="tab.key"
        :class="['ops-tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >{{ tab.label }}</div>
    </div>

    <!-- Panel Content -->
    <div class="ops-layout">
      <!-- Left Sidebar -->
      <div class="ops-left">
        <div class="ops-left-label">应用 / 推荐位</div>
        <div v-for="app in apps" :key="app.id" class="ops-tree-app">
          <div class="ops-tree-header" :class="{ collapsed: app.collapsed }" @click="app.collapsed = !app.collapsed">
            <el-icon class="arrow"><ArrowDown /></el-icon>
            <span>{{ app.name }}</span>
          </div>
          <div v-show="!app.collapsed" class="ops-tree-app-id">{{ app.code }}</div>
          <div v-show="!app.collapsed" class="ops-tree-slots">
            <div
              v-for="slot in app.slots"
              :key="slot.code"
              :class="['ops-tree-slot', { active: activeSlot === slot.code && activeApp === app.id }]"
              @click="selectSlot(app.id, slot)"
            >
              {{ slot.name }}
              <span class="slot-code">{{ slot.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content -->
      <div class="ops-right">
        <!-- Funnel Tab -->
        <div v-show="activeTab === 'funnel'">
          <div class="ops-panel-title">{{ currentSlotName }} · 漏斗列表</div>
          <div class="card">
            <div class="card-header">
              <span class="card-title">漏斗列表</span>
              <el-button type="primary" size="small" @click="openFunnelDrawer('add')">
                <el-icon><Plus /></el-icon>添加漏斗
              </el-button>
            </div>
            <el-table :data="funnels" stripe>
              <el-table-column label="漏斗名称" min-width="200">
                <template #default="{ row }">
                  <span class="text-medium">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="140" />
              <el-table-column label="操作" width="160">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" @click="openFunnelDrawer('edit', row)">编辑</el-button>
                  <el-button size="small" text type="danger">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- Strategy Tab -->
        <div v-show="activeTab === 'strategy'">
          <div class="ops-panel-title">{{ currentSlotName }} · 推荐位策略</div>
          <div class="card">
            <div class="card-header">
              <span class="card-title">策略列表</span>
              <el-button type="primary" size="small" @click="openStrategyDrawer('add')">
                <el-icon><Plus /></el-icon>添加策略
              </el-button>
            </div>
            <el-table :data="strategies" stripe :row-class-name="strategyRowClass">
              <el-table-column label="策略名称" min-width="160">
                <template #default="{ row }">
                  <div>
                    <div class="text-medium">{{ row.name }}</div>
                    <div v-if="row.isDefault" class="default-strategy-hint">未命中分群的用户展示此策略</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="投放区域" width="120">
                <template #default="{ row }">
                  <el-tag v-for="r in row.regions" :key="r" size="small" type="info" class="cell-tag">{{ r }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="投放用户分群" width="180">
                <template #default="{ row }">
                  <span v-if="row.isDefault" class="cell-muted">—</span>
                  <el-tag v-for="g in row.groups" :key="g" size="small" class="cell-tag cell-tag-block">{{ g }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="漏斗配置" min-width="200">
                <template #default="{ row }">
                  <div class="funnel-config-list">
                    <div v-for="(f, fi) in row.funnels" :key="fi">{{ f.condition }} → {{ f.funnel }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" width="140" />
              <el-table-column label="操作" width="160">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" @click="openStrategyDrawer('edit', row)">编辑</el-button>
                  <el-button v-if="!row.isDefault" size="small" text type="danger">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawer: Add/Edit Funnel -->
    <el-drawer v-model="funnelDrawerVisible" :title="funnelDrawerTitle" size="560px">
      <el-form :model="funnelForm" label-position="top">
        <el-form-item label="漏斗名称" required>
          <el-input v-model="funnelForm.name" placeholder="请输入漏斗名称" />
        </el-form-item>
        <div class="section-label">漏斗配置（固定4个漏斗位）</div>
        <div v-for="i in 4" :key="i" class="funnel-slot-block">
          <div class="funnel-slot-label">漏斗位 #{{ i }}</div>
          <div class="funnel-pkg-select" @click="openPkgSelect(i)">
            <span v-if="!funnelForm.slots[i-1]" class="funnel-pkg-placeholder">请选择套餐</span>
            <span v-else class="funnel-pkg-value">{{ funnelForm.slots[i-1].code }} · {{ funnelForm.slots[i-1].name }}</span>
            <el-icon class="funnel-pkg-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="funnelDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="funnelDrawerVisible = false">确定</el-button>
      </template>
    </el-drawer>

    <!-- Drawer: Package Selector (sub-drawer) -->
    <el-drawer v-model="pkgSelectVisible" title="选择套餐" size="640px" :z-index="9999">
      <div class="pkg-select-filter">
        <el-select v-model="pkgFilter.category" placeholder="全部分类" size="small" class="filter-select" clearable>
          <el-option label="云存储套餐" value="cloud" />
          <el-option label="AI智能服务" value="ai" />
          <el-option label="综合套餐" value="bundle" />
        </el-select>
        <el-select v-model="pkgFilter.region" placeholder="投放区域" size="small" class="filter-select" clearable>
          <el-option label="国内" value="domestic" />
          <el-option label="海外" value="overseas" />
        </el-select>
        <el-select v-model="pkgFilter.app" placeholder="投放APP" size="small" class="filter-select-md" clearable>
          <el-option label="牵心PRO" value="qxpro" />
          <el-option label="鹤梦之家" value="hmhome" />
        </el-select>
        <el-select v-model="pkgFilter.slot" placeholder="投放运营位" size="small" class="filter-select-md" clearable>
          <el-option label="商城位" value="mall" />
          <el-option label="推荐位" value="recommend" />
        </el-select>
        <el-input v-model="pkgFilter.keyword" placeholder="搜索套餐名称或ID" size="small" class="filter-input" clearable />
      </div>
      <div class="pkg-select-hint">从套餐配置模块的套餐列表中选择（单选）</div>
      <div class="pkg-select-list">
        <div
          v-for="pkg in filteredPkgList"
          :key="pkg.code"
          :class="['pkg-select-item', { selected: pkgSelectSlot === pkg.code }]"
          @click="selectPkg(pkg)"
        >
          <div class="pkg-radio"><span class="pkg-radio-dot" v-show="pkgSelectSlot === pkg.code"></span></div>
          <div class="pkg-info">
            <div class="pkg-name">{{ pkg.name }}</div>
            <div class="pkg-meta">
              <span class="pkg-meta-tag">{{ pkg.code }}</span>
              <span class="pkg-meta-tag">{{ pkg.category }}</span>
              <span class="pkg-price-text">{{ pkg.price }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="pkgSelectVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPkgSelect">确定</el-button>
      </template>
    </el-drawer>

    <!-- Drawer: Add/Edit Strategy (3-step wizard) -->
    <el-drawer v-model="strategyDrawerVisible" :title="strategyDrawerTitle" size="720px">
      <div class="step-bar">
        <div class="step-item" :class="{ active: strategyStep >= 1, current: strategyStep === 1 }" @click="strategyStep = 1">
          <span class="step-num">
            <svg v-if="strategyStep > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            <template v-else>1</template>
          </span>
          <span class="step-label">{{ stepLabels[0] }}</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: strategyStep >= 2 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: strategyStep >= 2, current: strategyStep === 2 }" @click="strategyStep = 2">
          <span class="step-num">
            <svg v-if="strategyStep > 2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            <template v-else>2</template>
          </span>
          <span class="step-label">{{ stepLabels[1] }}</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: strategyStep >= 3 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: strategyStep >= 3, current: strategyStep === 3 }" @click="strategyStep = 3">
          <span class="step-num">
            <template>3</template>
          </span>
          <span class="step-label">{{ stepLabels[2] }}</span>
        </div>
      </div>

      <div v-show="strategyStep === 1" class="step-content">
        <el-form label-position="top">
          <el-form-item label="策略名称" required>
            <el-input v-model="strategyForm.name" placeholder="请输入策略名称" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="strategyForm.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>

      <div v-show="strategyStep === 2" class="step-content">
        <div class="form-hint">
          如需变更漏斗，请至 <span class="form-hint-link" @click="switchToFunnel">【推荐位套餐漏斗】</span> 中配置
        </div>
        <div v-for="(cond, ci) in strategyForm.conditions" :key="ci" class="cond-block">
          <div class="cond-label">{{ cond.label }}</div>
          <el-form-item label="选择漏斗">
            <el-select v-model="cond.funnel" placeholder="请选择漏斗" class="w-full">
              <el-option label="首页基础漏斗" value="首页基础漏斗" />
              <el-option label="升级推荐漏斗" value="升级推荐漏斗" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="弹窗间隔（H）" required>
          <el-input-number v-model="strategyForm.popupInterval" :min="0" placeholder="如：2" class="w-full" />
        </el-form-item>
      </div>

      <div v-show="strategyStep === 3" class="step-content">
        <el-form-item label="投放区域" required>
          <div class="checkbox-group">
            <label v-for="r in regionOptions" :key="r" class="checkbox-item">
              <el-checkbox v-model="strategyForm.regions" :value="r" :disabled="isDefaultEdit" />{{ r }}
            </label>
          </div>
        </el-form-item>
        <el-form-item label="投放用户分群" required>
          <div class="checkbox-group">
            <label v-for="g in userGroupOptions" :key="g.name" class="checkbox-item">
              <el-checkbox v-model="strategyForm.groups" :value="g.name" :disabled="isDefaultEdit" />
              {{ g.name }}
              <span class="checkbox-hint">{{ g.code }}</span>
            </label>
          </div>
        </el-form-item>
      </div>

      <template #footer>
        <el-button v-if="strategyStep > 1" @click="strategyStep--">上一步</el-button>
        <span class="footer-spacer"></span>
        <el-button @click="strategyDrawerVisible = false">取消</el-button>
        <el-button v-if="strategyStep < 3" type="primary" @click="strategyStep++">下一步</el-button>
        <el-button v-else type="primary" @click="confirmStrategy">提交</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, ArrowDown, ArrowRight } from '@element-plus/icons-vue'

const activeTab = ref('funnel')
const opsTabs = [
  { key: 'funnel', label: '推荐位套餐漏斗' },
  { key: 'strategy', label: '推荐位策略' }
]

const stepLabels = ['基础信息', '漏斗配置', '投放配置']

// App tree
const apps = ref([
  {
    id: 'qxpro', name: '牵心PRO', code: 'QX_PRO_001', collapsed: false,
    slots: [
      { name: '首页推荐位', code: 'rec_slot_home' },
      { name: '活动推荐位', code: 'rec_slot_activity' }
    ]
  },
  {
    id: 'hmhome', name: '鹤梦之家', code: 'HM_HOME_001', collapsed: true,
    slots: [
      { name: '首页推荐位', code: 'rec_slot_home' }
    ]
  }
])

const activeApp = ref('qxpro')
const activeSlot = ref('rec_slot_home')
const currentSlotName = ref('首页推荐位')

const selectSlot = (appId, slot) => {
  activeApp.value = appId
  activeSlot.value = slot.code
  currentSlotName.value = slot.name
}

// Funnels
const funnels = ref([
  { name: '首页基础漏斗', createdAt: '2026-03-22' },
  { name: '升级推荐漏斗', createdAt: '2026-03-25' }
])

const funnelDrawerVisible = ref(false)
const funnelDrawerTitle = ref('添加漏斗')
const isFunnelEdit = ref(false)
const funnelForm = reactive({ name: '', slots: [] })

const openFunnelDrawer = (mode, row) => {
  if (mode === 'edit' && row) {
    funnelDrawerTitle.value = '编辑漏斗'
    isFunnelEdit.value = true
    funnelForm.name = row.name
  } else {
    funnelDrawerTitle.value = '添加漏斗'
    isFunnelEdit.value = false
    funnelForm.name = ''
    funnelForm.slots = []
  }
  funnelDrawerVisible.value = true
}

// Package selector
const pkgSelectVisible = ref(false)
const currentFunnelSlot = ref(0)
const pkgFilter = reactive({ category: '', region: '', app: '', slot: '', keyword: '' })
const pkgSelectSlot = ref('')

const allPkgList = [
  { code: 'REC_001', name: '7天事件云存储基础版', price: '¥6.90 / $0.95', category: '云存储套餐', type: 'cloud', region: 'domestic', app: 'qxpro', slot: 'recommend' },
  { code: 'REC_002', name: '30天全时云存储Pro版', price: '¥19.90 / $2.99', category: '云存储套餐', type: 'cloud', region: 'all', app: 'all', slot: 'mall' },
  { code: 'REC_003', name: 'AI智能检测月卡', price: '¥9.90 / $1.49', category: 'AI智能服务', type: 'ai', region: 'domestic', app: 'qxpro', slot: 'recommend' },
  { code: 'REC_004', name: '全家桶年度套餐', price: '¥199.00 / $29.99', category: '综合套餐', type: 'bundle', region: 'all', app: 'all', slot: 'all' },
  { code: 'REC_005', name: 'Overseas-Pro云存储', price: '$12.99', category: '云存储套餐', type: 'cloud', region: 'overseas', app: 'hmhome', slot: 'mall' },
  { code: 'REC_006', name: '国内专享·极简云存', price: '¥59.00', category: '云存储套餐', type: 'cloud', region: 'domestic', app: 'qxpro', slot: 'mall' }
]

const filteredPkgList = computed(() => {
  return allPkgList.filter(p => {
    if (pkgFilter.category && p.type !== pkgFilter.category) return false
    if (pkgFilter.region && p.region !== 'all' && p.region !== pkgFilter.region) return false
    if (pkgFilter.app && p.app !== 'all' && p.app !== pkgFilter.app) return false
    if (pkgFilter.slot && p.slot !== 'all' && p.slot !== pkgFilter.slot) return false
    if (pkgFilter.keyword) {
      const kw = pkgFilter.keyword.toLowerCase()
      if (!p.name.toLowerCase().includes(kw) && !p.code.toLowerCase().includes(kw)) return false
    }
    return true
  })
})

const openPkgSelect = (slotNum) => {
  currentFunnelSlot.value = slotNum
  pkgSelectSlot.value = funnelForm.slots[slotNum - 1]?.code || ''
  pkgFilter.category = ''
  pkgFilter.region = ''
  pkgFilter.app = ''
  pkgFilter.slot = ''
  pkgFilter.keyword = ''
  pkgSelectVisible.value = true
}

const selectPkg = (pkg) => {
  pkgSelectSlot.value = pkg.code
}

const confirmPkgSelect = () => {
  const pkg = allPkgList.find(p => p.code === pkgSelectSlot.value)
  if (!pkg) return
  funnelForm.slots[currentFunnelSlot.value - 1] = pkg
  pkgSelectVisible.value = false
}

// Strategies
const strategies = ref([
  {
    name: '默认策略', isDefault: true, regions: ['国内', '海外'], groups: [],
    funnels: [
      { condition: '条件一', funnel: '首页基础漏斗' },
      { condition: '条件二', funnel: '首页基础漏斗' },
      { condition: '条件三', funnel: '首页基础漏斗' }
    ],
    remark: '—'
  },
  {
    name: '首页推广策略', isDefault: false, regions: ['国内'],
    groups: ['高价值推荐用户', '活跃推荐用户'],
    funnels: [
      { condition: '条件一', funnel: '首页基础漏斗' },
      { condition: '条件二', funnel: '升级推荐漏斗' },
      { condition: '条件三', funnel: '首页基础漏斗' }
    ],
    remark: '首页推广专用'
  }
])

const strategyRowClass = ({ row }) => row.isDefault ? 'default-row' : ''

const strategyDrawerVisible = ref(false)
const strategyDrawerTitle = ref('添加推荐位策略')
const strategyStep = ref(1)
const isDefaultEdit = ref(false)
const strategyForm = reactive({
  name: '', remark: '', popupInterval: 2,
  regions: [], groups: [],
  conditions: [
    { label: '条件一：未购买云存储', funnel: '' },
    { label: '条件二：已购买云存储，3 ≤ 循环时长 ＜ 7', funnel: '' },
    { label: '条件三：已购买云存储，7 ≤ 循环时长 ＜ 15', funnel: '' }
  ]
})

const regionOptions = ['国内', '海外']
const userGroupOptions = [
  { name: '高价值推荐用户', code: 'ug_rec_high_value' },
  { name: '活跃推荐用户', code: 'ug_rec_active' },
  { name: '沉默推荐用户', code: 'ug_rec_silent' }
]

const openStrategyDrawer = (mode, row) => {
  strategyStep.value = 1
  if (mode === 'edit' && row) {
    strategyDrawerTitle.value = row.isDefault ? '编辑默认策略' : '编辑推荐位策略'
    isDefaultEdit.value = row.isDefault
    strategyForm.name = row.name
    strategyForm.remark = row.remark === '—' ? '' : row.remark
    strategyForm.regions = row.isDefault ? ['国内', '海外'] : [...row.regions]
    strategyForm.groups = [...row.groups]
    strategyForm.conditions.forEach((c, i) => {
      c.funnel = row.funnels[i]?.funnel || ''
    })
    strategyForm.popupInterval = 2
  } else {
    strategyDrawerTitle.value = '添加推荐位策略'
    isDefaultEdit.value = false
    strategyForm.name = ''
    strategyForm.remark = ''
    strategyForm.regions = ['国内']
    strategyForm.groups = []
    strategyForm.conditions.forEach(c => { c.funnel = '' })
    strategyForm.popupInterval = 2
  }
  strategyDrawerVisible.value = true
}

const confirmStrategy = () => {
  strategyDrawerVisible.value = false
}

const switchToFunnel = () => {
  strategyDrawerVisible.value = false
  activeTab.value = 'funnel'
}
</script>

<style lang="scss" scoped>
// ===== Sidebar Tree =====
.ops-left-label {
  padding: 0 12px 8px;
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--gray-400);
  text-transform: uppercase;
}

.ops-tree-app { padding: 0 12px; margin-bottom: 2px; }

.ops-tree-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-primary);
  transition: background .15s;

  &:hover { background: var(--gray-50); }

  .arrow { transition: transform .2s; color: var(--gray-400); }
  &.collapsed .arrow { transform: rotate(-90deg); }
}

.ops-tree-app-id {
  font-size: 10px;
  color: var(--gray-400);
  margin-left: 32px;
  margin-bottom: 4px;
}

.ops-tree-slots { padding-left: 16px; }

.ops-tree-slot {
  display: flex;
  flex-direction: column;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-xs);
  color: var(--text-secondary);
  transition: all .15s;
  margin-bottom: 1px;

  &:hover { background: var(--gray-50); color: var(--text-primary); }
  &.active { background: var(--primary-light); color: var(--primary-color); font-weight: 500; }

  .slot-code { font-size: 10px; color: var(--gray-400); margin-top: 1px; }
  &.active .slot-code { color: var(--primary-color); }
}

// ===== Panel Content =====
.ops-panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

// ===== Table Cells =====
.text-medium { font-weight: 500; color: var(--text-primary); }
.cell-tag { margin-right: 4px; }
.cell-tag-block { margin-bottom: 2px; }
.cell-muted { font-size: var(--font-sm); color: var(--gray-400); }
.default-strategy-hint { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
.funnel-config-list { font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.6; }

// ===== Funnel Drawer =====
.section-label {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: var(--spacing-md) 0 8px;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.funnel-pkg-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

// ===== Package Selector =====
.pkg-select-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.pkg-select-hint {
  font-size: var(--font-xs);
  color: var(--gray-400);
  margin-bottom: 12px;
}

.pkg-info { flex: 1; min-width: 0; }
.pkg-name { font-size: var(--font-md); font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
.pkg-meta { display: flex; align-items: center; gap: 12px; font-size: var(--font-xs); }
.pkg-meta-tag { color: var(--gray-400); background: var(--gray-100); padding: 2px 6px; border-radius: 4px; }
.pkg-price-text { color: var(--primary-color); font-weight: 500; }

// ===== Strategy Form =====
.form-hint {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.form-hint-link {
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
}

// ===== Utilities =====
.w-full { width: 100%; }
.footer-spacer { flex: 1; }
.filter-select { width: 120px; }
.filter-select-md { width: 140px; }
.filter-input { flex: 1; min-width: 180px; }
</style>
