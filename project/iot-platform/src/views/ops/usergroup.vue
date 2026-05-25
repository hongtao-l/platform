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

    <!-- Panel: 活动位分群 -->
    <div v-show="activeTab === 'activity'" class="ops-panel">
      <div class="card">
        <div class="card-header"><span class="card-title">活动位分群列表</span></div>
        <el-table :data="activityGroups" stripe>
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
          <el-table-column label="绑定策略" min-width="200">
            <template #default="{ row }">
              <div class="bind-strategy-cell">
                <template v-if="row.bindStrategy">
                  <el-tag type="success" size="small">已绑定</el-tag>
                  <el-button size="small" text type="primary" @click="viewStrategy(row, 'activity')">查看</el-button>
                </template>
                <span v-else class="cell-muted">未绑定</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Drawer: 查看绑定策略（推荐位-原始样式） -->
    <el-drawer v-model="strategyDrawerVisible" title="查看绑定策略" size="560px">
      <template v-if="currentType === 'recommend'">
        <div v-if="currentStrategy" class="strategy-detail">
          <div class="strategy-context">
            当前分群：<span class="strategy-context-name">{{ currentStrategy.name }}</span>（{{ currentStrategy.code }} · {{ currentStrategy.userCount }} 用户）
          </div>
          <div v-if="!currentStrategy.apps || currentStrategy.apps.length === 0" class="strategy-empty">
            该分群暂未绑定任何策略
          </div>
          <div
            v-for="(app, ai) in currentStrategy.apps"
            :key="ai"
            class="strategy-app-card"
          >
            <div class="strategy-app-title">
              {{ app.name }} <span class="strategy-app-code">{{ app.code }}</span>
            </div>
            <div
              v-for="slot in app.slots"
              :key="slot.code"
              class="strategy-slot-card"
            >
              <div class="strategy-slot-title">
                {{ slot.label }} <span class="strategy-slot-code">{{ slot.code }}</span>
              </div>
              <div
                v-for="s in slot.strategies"
                :key="s.id"
                class="strategy-card"
              >
                <div class="strategy-card-header">
                  <span class="strategy-card-name">{{ s.name }}</span>
                  <span class="strategy-card-id">{{ s.id }}</span>
                  <span :class="['status-tag-sm', s.status === 'active' ? 's-active' : s.status === 'draft' ? 's-draft' : s.status === 'paused' ? 's-paused' : s.status === 'ended' ? 's-ended' : 's-expired']">{{ s.statusLabel }}</span>
                </div>
                <div class="strategy-card-body">
                  <div class="strategy-info-row">
                    <span class="s-label">投放区域</span>
                    <span class="s-value">{{ s.regions.join(' / ') }}</span>
                  </div>
                  <div class="strategy-info-row" v-if="s.remark">
                    <span class="s-label">备注</span>
                    <span class="s-value s-remark">{{ s.remark }}</span>
                  </div>
                  <div v-if="s.conditions && s.conditions.length" class="strategy-conditions">
                    <el-table :data="s.conditions" size="small" class="strategy-cond-table">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 商城位 / 活动位 - 策略卡片样式 -->
      <template v-else>
        <div v-if="currentStrategy" class="strategy-detail">
          <div class="strategy-context">
            当前分群：<span class="strategy-context-name">{{ currentStrategy.name }}</span>（{{ currentStrategy.code }} · {{ currentStrategy.userCount }} 用户）
          </div>
          <div v-if="currentStrategy.strategies.length === 0" class="strategy-empty">
            该分群暂未绑定任何策略
          </div>
          <div
            v-for="s in currentStrategy.strategies"
            :key="s.id"
            class="strategy-card"
          >
            <div class="strategy-card-header">
              <span class="strategy-card-name">{{ s.name }}</span>
              <span class="strategy-card-id">{{ s.id }}</span>
              <span :class="['status-tag-sm', s.status === 'active' ? 's-active' : s.status === 'draft' ? 's-draft' : s.status === 'paused' ? 's-paused' : s.status === 'ended' ? 's-ended' : 's-expired']">{{ s.statusLabel }}</span>
            </div>
            <div class="strategy-card-body">
              <div class="strategy-info-row" v-if="currentType !== 'mall'">
                <span class="s-label">投放位置</span>
                <span class="s-value">{{ s.positionLabel }}</span>
              </div>
              <div class="strategy-info-row" v-if="currentType !== 'mall'">
                <span class="s-label">有效周期</span>
                <span class="s-value">{{ s.startTime }} ~ {{ s.endTime }}</span>
              </div>
              <div class="strategy-info-row">
                <span class="s-label">投放区域</span>
                <span class="s-value">{{ s.regions.join(' / ') }}</span>
                <span class="s-label">投放APP</span>
                <span class="s-value">{{ s.apps.join(' / ') }}</span>
              </div>
              <div class="strategy-info-row" v-if="s.activityUrl">
                <span class="s-label">活动链接</span>
                <span class="s-value s-link">{{ s.activityUrl }}</span>
              </div>
              <div class="strategy-info-row" v-if="s.packages && s.packages.length">
                <span class="s-label">关联套餐</span>
                <div class="s-packages">
                  <el-tag v-for="(p, pi) in s.packages" :key="pi" size="small" type="primary" class="s-pkg-tag">{{ p.name }}</el-tag>
                </div>
              </div>
              <div class="strategy-info-row" v-if="s.remark">
                <span class="s-label">备注</span>
                <span class="s-value s-remark">{{ s.remark }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="strategyDrawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('mall')
const tabs = [
  { key: 'mall', label: '商城用户分群' },
  { key: 'recommend', label: '推荐用户分群' },
  { key: 'activity', label: '活动位分群' }
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

const activityGroups = ref([
  { name: '高价值用户', code: 'ug_activity_high_value', userCount: '12,580', bindStrategy: true },
  { name: '活跃用户', code: 'ug_activity_active', userCount: '45,230', bindStrategy: true },
  { name: '新注册用户', code: 'ug_activity_new_reg', userCount: '18,920', bindStrategy: true },
  { name: '沉默用户', code: 'ug_activity_silent', userCount: '6,180', bindStrategy: false },
  { name: '付费用户', code: 'ug_activity_paid', userCount: '3,450', bindStrategy: true }
])

const strategyDrawerVisible = ref(false)
const currentStrategy = ref(null)
const currentType = ref('')

const strategyData = {
  mall: {
    name: '商城高消费用户',
    code: 'ug_mall_high_spend',
    userCount: '8,320',
    strategies: [
      {
        id: 'MS_001', name: '高价值用户专属套餐', status: 'active', statusLabel: '进行中',
        position: 'mall_slot_home', positionLabel: '商城首页位',
        startTime: '2026-05-15', endTime: '2026-11-15',
        regions: ['国内'], apps: ['牵心PRO'],
        packages: [
          { name: '云存储7天版' }, { name: '云存储30天版' },
          { name: 'AI智能检测月卡' }, { name: 'AI智能检测季卡' }
        ],
        remark: '高消费用户专属商城套餐推荐'
      },
      {
        id: 'MS_002', name: '商城推广策略', status: 'active', statusLabel: '进行中',
        position: 'mall_slot_banner', positionLabel: '商城Banner',
        startTime: '2026-06-01', endTime: '2026-12-31',
        regions: ['国内', '海外'], apps: ['鹤梦之家'],
        packages: [
          { name: '云存储年卡' }, { name: 'AI全家桶年卡' }
        ],
        remark: ''
      }
    ]
  },
  recommend: {
    name: '高价值推荐用户',
    code: 'ug_rec_high_value',
    userCount: '12,580',
    apps: [
      {
        name: '牵心PRO',
        code: 'qianxin_pro',
        slots: [
          {
            label: '首页推荐位', code: 'rec_slot_home',
            strategies: [
              {
                id: 'RS_001', name: '首页推广策略', status: 'active', statusLabel: '进行中',
                regions: ['国内'],
                conditions: [
                  { condition: '条件一：未购买云存储', funnel: '首页基础漏斗' },
                  { condition: '条件二：3 ≤ 循环时长 ＜ 7', funnel: '升级推荐漏斗' }
                ],
                remark: '首页推荐位基础推广策略'
              }
            ]
          },
          {
            label: '活动推荐位', code: 'rec_slot_activity',
            strategies: [
              {
                id: 'RS_002', name: '活动推荐策略', status: 'active', statusLabel: '进行中',
                regions: ['国内'],
                conditions: [
                  { condition: '条件一：未购买云存储', funnel: '活动基础漏斗' }
                ],
                remark: '暑期活动推荐'
              }
            ]
          }
        ]
      },
      {
        name: '鹤梦之家',
        code: 'hemeng_home',
        slots: [
          {
            label: '首页推荐位', code: 'rec_slot_home',
            strategies: [
              {
                id: 'RS_003', name: '首页基础策略', status: 'active', statusLabel: '进行中',
                regions: ['国内', '海外'],
                conditions: [
                  { condition: '条件一：未购买云存储', funnel: '首页基础漏斗' }
                ],
                remark: '鹤梦之家首页推荐'
              }
            ]
          }
        ]
      }
    ]
  },
  activity: {
    name: '高价值用户',
    code: 'ug_activity_high_value',
    userCount: '12,580',
    strategies: [
      {
        id: 'AS_001', name: '618大促Banner活动', status: 'active', statusLabel: '进行中',
        position: 'slot_banner', positionLabel: '首页Banner (ACT_SLOT_BANNER)',
        startTime: '2026-06-01', endTime: '2026-06-18',
        regions: ['国内'], apps: ['牵心PRO'],
        activityUrl: 'https://m.example.com/activity/618',
        packages: [{ name: '618特惠云存储' }, { name: '618AI包月' }, { name: '618超值全家桶' }],
        remark: '618大促首页Banner'
      },
      {
        id: 'AS_002', name: '双11大促预售', status: 'active', statusLabel: '进行中',
        position: 'slot_popup', positionLabel: '启动弹窗 (ACT_SLOT_POPUP) · 每次启动',
        startTime: '2026-10-20', endTime: '2026-11-11',
        regions: ['国内', '海外'], apps: ['牵心PRO', '鹤梦之家'],
        activityUrl: 'https://m.example.com/activity/double11',
        packages: [{ name: '双11限定云存储' }, { name: 'AI体验包' }, { name: '双11年卡' }, { name: '全家桶特惠' }],
        remark: '双11大促预售弹窗'
      },
      {
        id: 'AS_003', name: '五一特惠', status: 'ended', statusLabel: '已结束',
        position: 'slot_floating', positionLabel: '悬浮按钮 (ACT_SLOT_FLOATING)',
        startTime: '2026-05-01', endTime: '2026-05-07',
        regions: ['国内'], apps: ['牵心PRO'],
        activityUrl: 'https://m.example.com/activity/mayday',
        packages: [{ name: '五一限定包' }],
        remark: '五一特惠悬浮推广'
      }
    ]
  }
}

const viewStrategy = (row, type) => {
  currentType.value = type
  currentStrategy.value = { ...strategyData[type], name: row.name, code: row.code, userCount: row.userCount }
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
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-100);
}

.strategy-context-name {
  color: var(--text-primary);
  font-weight: 600;
}

.strategy-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--gray-400);
  font-size: var(--font-md);
}

.strategy-card {
  background: var(--bg-color);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 0;
  margin-bottom: 12px;
  overflow: hidden;
}

.strategy-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-100);
}

.strategy-card-name {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
}

.strategy-card-id {
  font-size: var(--font-xs);
  color: var(--gray-400);
  font-family: monospace;
}

.strategy-card-body {
  padding: 12px 16px;
}

.strategy-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: var(--font-sm);
}

.s-label {
  color: var(--gray-400);
  min-width: 52px;
  flex-shrink: 0;
}

.s-value {
  color: var(--text-primary);
  font-weight: 500;
  margin-right: 16px;
}

.s-link {
  color: var(--primary-color);
  font-size: var(--font-xs);
  word-break: break-all;
}

.s-remark {
  color: var(--text-secondary);
  font-weight: 400;
}

.s-conditions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.strategy-slot-card {
  background: var(--gray-50);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.strategy-slot-title {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.strategy-slot-code {
  font-size: var(--font-xs);
  color: var(--gray-400);
  font-family: monospace;
  font-weight: 400;
}

.strategy-conditions {
  margin-top: 8px;
}

.strategy-cond-table {
  margin-top: 4px;
  border-radius: 6px;
  overflow: hidden;
}

.s-cond-item {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--gray-50);
  padding: 3px 8px;
  border-radius: 4px;
}

.s-packages {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.s-pkg-tag {
  margin: 0;
}

// ===== Mini status tags =====
.status-tag-sm {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
}

.s-active { background: #F0FDF4; color: #16A34A; }
.s-draft { background: #F1F5F9; color: #64748B; }
.s-paused { background: #FFFBEB; color: #D97706; }
.s-ended { background: #F1F5F9; color: #4A5568; }
.s-expired { background: #F8FAFC; color: #94A3B8; }

// ===== Mini position tags =====
.pos-tag-mini {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
}

.pos-banner { background: #2563EB; }
.pos-popup { background: #EA580C; }
.pos-floating { background: #16A34A; }
.pos-sidebar { background: #7C3AED; }
.pos-recommend { background: #0891B2; }
.pos-mall { background: #4F46E5; }

// ===== Utilities =====
.w-full { width: 100%; }
</style>
