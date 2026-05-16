<template>
  <div class="page-container" style="display:flex;flex-direction:column;padding:0">
    <!-- Tabs -->
    <div class="ops-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['ops-tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >{{ tab.label }}</div>
    </div>

    <!-- Panel: 商城用户分群 -->
    <div v-show="activeTab === 'mall'" class="ops-panel">
      <div class="card">
        <div class="card-header"><span class="card-title">商城用户分群列表</span></div>
        <el-table :data="mallGroups" stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="分群名称" min-width="160">
            <template #default="{ row }">
              <span class="text-medium">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分群编码" width="200">
            <template #default="{ row }">
              <code class="code-tag">{{ row.code }}</code>
            </template>
          </el-table-column>
          <el-table-column prop="userCount" label="用户数量" width="120" />
          <el-table-column label="绑定策略" width="160">
            <template #default="{ row }">
              <div class="bind-strategy-cell">
                <template v-if="row.bindStrategy">
                  <el-tag type="success" size="small">已绑定</el-tag>
                  <el-button size="small" text type="primary" @click="viewStrategy(row, 'mall')">查看</el-button>
                </template>
                <span v-else class="cell-muted">未绑定</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Panel: 推荐用户分群 -->
    <div v-show="activeTab === 'recommend'" class="ops-panel">
      <div class="card">
        <div class="card-header"><span class="card-title">推荐用户分群列表</span></div>
        <el-table :data="recommendGroups" stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="分群名称" min-width="160">
            <template #default="{ row }">
              <span class="text-medium">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分群编码" width="200">
            <template #default="{ row }">
              <code class="code-tag">{{ row.code }}</code>
            </template>
          </el-table-column>
          <el-table-column prop="userCount" label="用户数量" width="120" />
          <el-table-column label="绑定策略" width="160">
            <template #default="{ row }">
              <div class="bind-strategy-cell">
                <template v-if="row.bindStrategy">
                  <el-tag type="success" size="small">已绑定</el-tag>
                  <el-button size="small" text type="primary" @click="viewStrategy(row, 'recommend')">查看</el-button>
                </template>
                <span v-else class="cell-muted">未绑定</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Panel: 广告用户分群 -->
    <div v-show="activeTab === 'ad'" class="ops-panel">
      <div class="card">
        <div class="card-header">
          <span class="card-title">广告用户分群列表</span>
          <el-button type="primary" @click="openCreateDrawer">
            <el-icon><Plus /></el-icon>创建分群
          </el-button>
        </div>
        <el-table :data="adGroups" stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="分群名称" min-width="160">
            <template #default="{ row }">
              <span class="text-medium">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分群编码" width="200">
            <template #default="{ row }">
              <code class="code-tag">{{ row.code }}</code>
            </template>
          </el-table-column>
          <el-table-column prop="userCount" label="用户数量" width="120" />
          <el-table-column label="绑定策略" width="160">
            <template #default="{ row }">
              <div class="bind-strategy-cell">
                <template v-if="row.bindStrategy">
                  <el-tag type="success" size="small">已绑定</el-tag>
                  <el-button size="small" text type="primary" @click="viewStrategy(row, 'ad')">查看</el-button>
                </template>
                <span v-else class="cell-muted">未绑定</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Drawer: 创建分群 -->
    <el-drawer v-model="createDrawerVisible" title="创建分群" size="480px">
      <el-form :model="createForm" label-position="top">
        <el-form-item label="分群名称" required>
          <el-input v-model="createForm.name" placeholder="请输入分群名称" />
        </el-form-item>
        <el-form-item label="分群编码" required>
          <el-input v-model="createForm.code" placeholder="请输入分群编码，如 ug_high_value" />
        </el-form-item>
        <el-form-item label="分群描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入分群描述" />
        </el-form-item>
        <el-form-item label="分群规则">
          <el-select v-model="createForm.rule" placeholder="请选择分群规则" class="w-full">
            <el-option label="按消费金额" value="amount" />
            <el-option label="按注册时间" value="reg_time" />
            <el-option label="按活跃度" value="activity" />
            <el-option label="按设备数量" value="device_count" />
            <el-option label="自定义规则" value="custom" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="createDrawerVisible = false">确定</el-button>
      </template>
    </el-drawer>

    <!-- Drawer: 查看绑定策略 -->
    <el-drawer v-model="strategyDrawerVisible" title="查看绑定策略" size="560px">
      <div v-if="currentStrategy" class="strategy-detail">
        <div class="strategy-context">
          当前分群：<span class="strategy-context-name">{{ currentStrategy.name }}</span>（{{ currentStrategy.code }}）
        </div>
        <div
          v-for="(app, ai) in currentStrategy.apps"
          :key="ai"
          class="strategy-app-card"
        >
          <div class="strategy-app-title">
            {{ app.name }} <span class="strategy-app-code">{{ app.code }}</span>
          </div>
          <template v-if="app.slots && app.slots.length">
            <div
              v-for="(slot, si) in app.slots"
              :key="si"
              class="strategy-slot-card"
            >
              <div class="strategy-slot-title">
                {{ slot.label }} <span class="strategy-slot-code">{{ slot.code }}</span>
              </div>
              <div class="strategy-slot-name">策略名称：<span class="text-medium">{{ slot.strategyName }}</span></div>
              <el-table v-if="slot.conditions && slot.conditions.length" :data="slot.conditions" size="small" class="strategy-cond-table">
                <el-table-column label="条件" min-width="180">
                  <template #default="{ row: r }">
                    <span class="cell-text-sm">{{ r.condition }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="漏斗" min-width="120">
                  <template #default="{ row: r }">
                    <span class="text-medium-sm">{{ r.funnel }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
          <div v-else class="strategy-slot-name">
            策略名称：<span class="text-medium">{{ app.strategyName }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="strategyDrawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('mall')
const tabs = [
  { key: 'mall', label: '商城用户分群' },
  { key: 'recommend', label: '推荐用户分群' },
  { key: 'ad', label: '广告用户分群' }
]

const mallGroups = ref([
  { name: '商城高消费用户', code: 'ug_mall_high_spend', userCount: '8,320', bindStrategy: true },
  { name: '商城新注册用户', code: 'ug_mall_new_reg', userCount: '15,640', bindStrategy: false },
  { name: '商城沉默用户', code: 'ug_mall_silent', userCount: '6,180', bindStrategy: false }
])

const recommendGroups = ref([
  { name: '高价值推荐用户', code: 'ug_rec_high_value', userCount: '12,580', bindStrategy: true },
  { name: '活跃推荐用户', code: 'ug_rec_active', userCount: '45,230', bindStrategy: false }
])

const adGroups = ref([
  { name: '广告高转化用户', code: 'ug_ad_high_conv', userCount: '9,870', bindStrategy: true },
  { name: '广告新用户', code: 'ug_ad_new_user', userCount: '22,410', bindStrategy: false },
  { name: '广告沉默用户', code: 'ug_ad_silent', userCount: '5,340', bindStrategy: false }
])

const createDrawerVisible = ref(false)
const createForm = reactive({ name: '', code: '', description: '', rule: '' })

const openCreateDrawer = () => {
  createForm.name = ''
  createForm.code = ''
  createForm.description = ''
  createForm.rule = ''
  createDrawerVisible.value = true
}

const strategyDrawerVisible = ref(false)
const currentStrategy = ref(null)

const strategyData = {
  recommend: {
    name: '高价值推荐用户',
    code: 'ug_rec_high_value',
    apps: [
      {
        name: '牵心PRO', code: 'QX_PRO_001',
        slots: [
          { label: '首页推荐位', code: 'rec_slot_home', strategyName: '首页推广策略',
            conditions: [
              { condition: '条件一：未购买云存储', funnel: '首页基础漏斗' },
              { condition: '条件二：3 ≤ 循环时长 ＜ 7', funnel: '升级推荐漏斗' }
            ] },
          { label: '活动推荐位', code: 'rec_slot_activity', strategyName: '活动推荐策略',
            conditions: [
              { condition: '条件一：未购买云存储', funnel: '活动基础漏斗' }
            ] }
        ]
      },
      {
        name: '鹤梦之家', code: 'HM_HOME_001',
        slots: [
          { label: '首页推荐位', code: 'rec_slot_home', strategyName: '首页基础策略',
            conditions: [
              { condition: '条件一：未购买云存储', funnel: '首页基础漏斗' }
            ] }
        ]
      }
    ]
  },
  mall: {
    name: '商城高消费用户',
    code: 'ug_mall_high_spend',
    apps: [
      { name: '牵心PRO', code: 'QX_PRO_001', strategyName: '高价值用户专属' },
      { name: '鹤梦之家', code: 'HM_HOME_001', strategyName: '商城推广策略' }
    ]
  },
  ad: {
    name: '广告高转化用户',
    code: 'ug_ad_high_conv',
    apps: [
      { name: '牵心PRO', code: 'QX_PRO_001', strategyName: '广告推广策略' },
      { name: '鹤梦之家', code: 'HM_HOME_001', strategyName: '广告基础策略' }
    ]
  }
}

const viewStrategy = (row, type) => {
  currentStrategy.value = { ...strategyData[type], name: row.name, code: row.code }
  strategyDrawerVisible.value = true
}
</script>

<style lang="scss" scoped>
// ===== Table Cells =====
.text-medium { font-weight: 500; color: var(--text-primary); }
.text-medium-sm { font-size: 11px; color: var(--text-primary); }
.cell-muted { font-size: var(--font-md); color: var(--gray-400); }
.cell-text-sm { font-size: 11px; color: var(--text-secondary); }
.code-tag {
  font-size: var(--font-xs);
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: 4px;
}

.bind-strategy-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

// ===== Strategy Detail Drawer =====
.strategy-detail { padding: 0 4px; }

.strategy-context {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.strategy-context-name {
  color: var(--text-primary);
  font-weight: 500;
}

.strategy-app-card {
  background: var(--bg-color);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 12px;
}

.strategy-app-title {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.strategy-app-code {
  font-size: var(--font-xs);
  color: var(--gray-400);
  font-weight: 400;
}

.strategy-slot-card {
  background: var(--gray-50);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.strategy-slot-title {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.strategy-slot-code {
  font-size: 11px;
  color: var(--gray-400);
  font-weight: 400;
}

.strategy-slot-name {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.strategy-cond-table { margin-top: 8px; }

// ===== Utilities =====
.w-full { width: 100%; }
</style>
