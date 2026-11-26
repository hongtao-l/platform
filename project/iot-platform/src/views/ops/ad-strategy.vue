<template>
  <div class="page-container ad-page">
    <div class="ad-head">
      <div class="ad-title">广告投放策略</div>
      <div class="ad-bar">
        <div class="ad-search">
          <el-input
            v-model="keyword"
            placeholder="按策略名称/ID搜索"
            clearable
            style="width:220px"
            @keyup.enter="handleQuery"
          />
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </div>
        <div class="ad-actions">
          <el-button @click="openDefault">默认策略</el-button>
          <el-button type="primary" @click="openStrategy('add')">
            <el-icon><Plus /></el-icon>添加策略
          </el-button>
        </div>
      </div>
    </div>

    <div class="card">
      <el-table :data="filteredStrategies" stripe>
        <el-table-column label="策略名称" min-width="150">
          <template #default="{ row }">
            <span class="cell-strong">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="策略ID" width="130">
          <template #default="{ row }">
            <span class="cell-mono">{{ row.strategyId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="关联App" min-width="220">
          <template #default="{ row }">
            <div class="cell-lines">
              <div v-for="a in row.apps" :key="a" class="cell-line">{{ a }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分群配置" min-width="300">
          <template #default="{ row }">
            <div class="cell-lines">
              <div v-for="(s, i) in row.summaries.slice(0, 3)" :key="i" class="cell-line">{{ s }}</div>
              <div v-if="row.summaryTotal" class="cell-muted">共 {{ row.summaryTotal }} 条分群配置</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="groupCount" label="分群数" width="90" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openStrategy('edit', row)">编辑</el-button>
            <el-button size="small" text type="danger" @click="removeStrategy(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="cell-muted">没有匹配的策略</div>
        </template>
      </el-table>
    </div>

    <!-- ==================== Drawer：新建/编辑策略 ==================== -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerMode === 'edit' ? '编辑策略' : '新建策略'"
      size="760px"
    >
      <el-form label-width="88px" label-position="left" class="ad-form">
        <el-form-item label="策略名称" required>
          <el-input v-model="strategyForm.name" placeholder="请输入策略名称" />
        </el-form-item>

        <el-form-item label="投放App" required>
          <div class="app-picker">
            <div class="app-picker-top">
              <span class="picker-label">平台类型</span>
              <el-select v-model="strategyForm.platform" size="small" style="width:140px" @change="onPlatformChange">
                <el-option v-for="p in PLATFORMS" :key="p.value" :label="p.label" :value="p.value" />
              </el-select>
              <span class="tree-link" @click="selectAll(strategyForm)">全选</span>
              <span class="tree-link" @click="clearAll(strategyForm)">清空</span>
            </div>

            <div class="app-tree">
              <div v-for="app in formApps(strategyForm)" :key="app.id" class="app-node">
                <div class="app-node-row">
                  <span
                    class="tree-arrow"
                    :class="{ expanded: strategyForm.expanded.includes(app.id) }"
                    @click="toggleExpand(strategyForm, app.id)"
                  >
                    <el-icon><ArrowRight /></el-icon>
                  </span>
                  <el-checkbox
                    :model-value="isAppChecked(strategyForm, app)"
                    :indeterminate="isAppIndeterminate(strategyForm, app)"
                    @change="val => toggleAppAll(strategyForm, app, val)"
                  />
                  <span class="app-node-name">{{ app.name }}</span>
                  <span class="app-node-id">({{ app.id }})</span>
                </div>
                <div v-show="strategyForm.expanded.includes(app.id)" class="app-node-children">
                  <div v-for="reg in regionsOf(app.platform)" :key="reg.value" class="app-leaf">
                    <el-checkbox
                      :model-value="strategyForm.appKeys.includes(appKey(app, reg))"
                      @change="val => toggleRegion(strategyForm, app, reg, val)"
                    />
                    <span class="app-leaf-name">{{ reg.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <div class="tip-bar">
        <el-icon><InfoFilled /></el-icon>
        <span>请先选择平台类型，再勾选该类型下的 App。勾选的每个 App（系统-区域）会在每个广告位下生成一行广告源配置。</span>
      </div>

      <div class="section-divider"><span>广告配置</span></div>

      <el-form label-width="72px" label-position="left">
        <el-form-item label="用户分群">
          <el-select
            v-model="selectedGroupIds"
            multiple
            filterable
            placeholder="请选择用户分群"
            style="width:100%"
            @change="onGroupsChange"
          >
            <el-option v-for="g in USER_GROUPS" :key="g.value" :label="g.label" :value="g.value" />
          </el-select>
          <div class="form-hint">
            广告配置为全局一份，所有已选 App 统一生效 · 每个分群可独立配置广告位组与冷却间隔 · 每个广告位下按 App（系统-区域）分别选择广告源
          </div>
        </el-form-item>
      </el-form>

      <div v-if="!groupCards.length" class="ad-empty">请先选择用户分群，再配置广告位与广告源</div>

      <div v-for="card in groupCards" :key="card.uid" class="group-card">
        <div class="group-head">
          <span class="group-name">{{ groupLabel(card.groupId) }}</span>
          <el-button size="small" text type="danger" @click="removeGroupCard(card)">删除分群</el-button>
        </div>

        <div class="group-row">
          <span class="group-label">冷却间隔</span>
          <el-input-number v-model="card.cooldown" :min="0" :controls="false" size="small" style="width:110px" />
          <span class="group-unit">秒</span>
        </div>
        <div class="group-hint">0 表示不限制。同一用户命该分群两次广告之间的最小时间间隔。</div>

        <div v-for="(slot, si) in card.slots" :key="slot.uid" class="slot-block">
          <div class="slot-head">
            <el-select v-model="slot.slotId" placeholder="请选择广告位" size="small" class="slot-select">
              <el-option
                v-for="s in slotsOf(strategyForm.platform)"
                :key="s.value"
                :label="slotOptionLabel(s)"
                :value="s.value"
              />
            </el-select>
            <el-button size="small" text type="danger" @click="removeSlot(card, si)">删除</el-button>
          </div>

          <template v-if="slot.slotId">
            <div class="slot-hint">广告源（按App-系统-区域配置，非必填，留空则该组合不生效）</div>

            <div v-if="!formSelectedKeys(strategyForm).length" class="ad-empty small">
              请先在上方勾选投放 App
            </div>

            <div v-for="key in formSelectedKeys(strategyForm)" :key="key" class="src-item">
              <div class="src-row">
                <span class="src-app">{{ APP_REGION_MAP[key].label }}</span>
                <el-select
                  :model-value="slot.sources[key]"
                  placeholder="请选择广告源"
                  size="small"
                  clearable
                  class="src-select"
                  @update:model-value="val => (slot.sources[key] = val)"
                >
                  <el-option
                    v-for="s in sourcesOf(strategyForm.platform)"
                    :key="s.value"
                    :label="s.label"
                    :value="s.value"
                  />
                </el-select>
                <el-button size="small" text type="primary" @click="toggleVersion(slot, key)">
                  {{ isVersionOpen(slot, key) ? '收起版本' : '指定版本' }}
                </el-button>
              </div>

              <div v-if="isVersionOpen(slot, key)" class="ver-panel">
                <div class="ver-hint">指定版本区间使用独立广告源，未命中区间的版本回退到上方广告源。</div>
                <div v-for="(r, ri) in slot.ranges[key]" :key="ri" class="ver-row">
                  <el-input v-model="r.min" size="small" placeholder="起始版本" class="ver-input" />
                  <span class="ver-sep">~</span>
                  <el-input v-model="r.max" size="small" placeholder="结束版本" class="ver-input" />
                  <el-select v-model="r.source" size="small" placeholder="请选择广告源" class="ver-source">
                    <el-option
                      v-for="s in sourcesOf(strategyForm.platform)"
                      :key="s.value"
                      :label="s.label"
                      :value="s.value"
                    />
                  </el-select>
                  <el-button size="small" text type="danger" @click="removeRange(slot, key, ri)">删除</el-button>
                </div>
                <el-button size="small" text type="primary" @click="addRange(slot, key)">+ 添加版本区间</el-button>
              </div>
            </div>

            <div class="slot-foot">
              <div class="def-row">
                <span class="def-label">展示状态</span>
                <el-switch v-model="slot.enabled" size="small" />
                <span class="def-status-text">{{ slot.enabled ? '已开启' : '已关闭' }}</span>
              </div>

              <div v-if="slot.enabled" class="nums-row">
                <div class="num-item">
                  <span class="num-label">频次上限（次/小时）</span>
                  <el-input-number v-model="slot.freqLimit" :min="0" :controls="false" size="small" />
                </div>
                <div class="num-item">
                  <span class="num-label">展示间隔（秒）</span>
                  <el-input-number v-model="slot.showInterval" :min="0" :controls="false" size="small" />
                </div>
                <div class="num-item">
                  <span class="num-label">刷新间隔（秒）</span>
                  <el-input-number v-model="slot.refreshInterval" :min="0" :controls="false" size="small" />
                </div>
              </div>
              <div v-if="slot.enabled" class="group-hint">以上 0 表示不限制</div>
            </div>
          </template>
        </div>

        <el-button class="add-slot-btn" size="small" @click="addSlot(card)">
          <el-icon><Plus /></el-icon>添加广告位
        </el-button>
      </div>

      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStrategy">保存</el-button>
      </template>
    </el-drawer>

    <!-- ==================== Drawer：默认策略（平台 Tab 切换） ==================== -->
    <el-drawer v-model="defaultVisible" title="默认策略" size="760px">
      <div class="plat-tabs">
        <div
          v-for="p in PLATFORMS"
          :key="p.value"
          :class="['plat-tab', { active: defaultTab === p.value }]"
          @click="defaultTab = p.value"
        >{{ p.label }}</div>
      </div>

      <el-form label-width="88px" label-position="left" class="ad-form">
        <el-form-item label="投放App" required>
          <div class="app-picker">
            <div class="app-picker-top">
              <span class="tree-link" @click="selectAll(defForm)">全选</span>
              <span class="tree-link" @click="clearAll(defForm)">清空</span>
              <span class="app-count">已选 {{ defForm.appKeys.length }} 个</span>
            </div>

            <div class="app-tree">
              <div v-for="app in formApps(defForm)" :key="app.id" class="app-node">
                <div class="app-node-row">
                  <span
                    class="tree-arrow"
                    :class="{ expanded: defForm.expanded.includes(app.id) }"
                    @click="toggleExpand(defForm, app.id)"
                  >
                    <el-icon><ArrowRight /></el-icon>
                  </span>
                  <el-checkbox
                    :model-value="isAppChecked(defForm, app)"
                    :indeterminate="isAppIndeterminate(defForm, app)"
                    @change="val => toggleAppAll(defForm, app, val)"
                  />
                  <span class="app-node-name">{{ app.name }}</span>
                  <span class="app-node-id">({{ app.id }})</span>
                </div>
                <div v-show="defForm.expanded.includes(app.id)" class="app-node-children">
                  <div v-for="reg in regionsOf(app.platform)" :key="reg.value" class="app-leaf">
                    <el-checkbox
                      :model-value="defForm.appKeys.includes(appKey(app, reg))"
                      @change="val => toggleRegion(defForm, app, reg, val)"
                    />
                    <span class="app-leaf-name">{{ reg.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <div class="tip-bar">
        <el-icon><InfoFilled /></el-icon>
        <span>默认策略对该平台的全部 App 版本生效；如需对指定版本区间使用不同广告源，点击对应 App 行的「指定版本」新增。</span>
      </div>

      <div class="section-divider"><span>广告配置</span></div>

      <div v-if="!defForm.appKeys.length" class="ad-empty">请先在「投放App」中勾选需要投放的 App</div>

      <template v-else>
        <div v-for="(slot, si) in defForm.slots" :key="slot.uid" class="slot-block">
          <div class="slot-head">
            <el-select v-model="slot.slotId" placeholder="请选择广告位" size="small" class="slot-select">
              <el-option
                v-for="s in slotsOf(defForm.platform)"
                :key="s.value"
                :label="slotOptionLabel(s)"
                :value="s.value"
              />
            </el-select>
            <el-button size="small" text type="danger" @click="defForm.slots.splice(si, 1)">删除</el-button>
          </div>

          <template v-if="slot.slotId">
            <div class="slot-hint">广告源（按App-系统-区域配置，非必填，留空则该组合不生效）</div>

            <div v-for="key in formSelectedKeys(defForm)" :key="key" class="src-item">
              <div class="src-row">
                <span class="src-app">{{ APP_REGION_MAP[key].label }}</span>
                <el-select
                  :model-value="slot.sources[key]"
                  placeholder="请选择广告源"
                  size="small"
                  clearable
                  class="src-select"
                  @update:model-value="val => (slot.sources[key] = val)"
                >
                  <el-option
                    v-for="s in sourcesOf(defForm.platform)"
                    :key="s.value"
                    :label="s.label"
                    :value="s.value"
                  />
                </el-select>
                <el-button size="small" text type="primary" @click="toggleVersion(slot, key)">
                  {{ isVersionOpen(slot, key) ? '收起版本' : '指定版本' }}
                </el-button>
              </div>

              <div v-if="isVersionOpen(slot, key)" class="ver-panel">
                <div class="ver-hint">指定版本区间使用独立广告源，未命中区间的版本回退到上方广告源。</div>
                <div v-for="(r, ri) in slot.ranges[key]" :key="ri" class="ver-row">
                  <el-input v-model="r.min" size="small" placeholder="起始版本" class="ver-input" />
                  <span class="ver-sep">~</span>
                  <el-input v-model="r.max" size="small" placeholder="结束版本" class="ver-input" />
                  <el-select v-model="r.source" size="small" placeholder="请选择广告源" class="ver-source">
                    <el-option
                      v-for="s in sourcesOf(defForm.platform)"
                      :key="s.value"
                      :label="s.label"
                      :value="s.value"
                    />
                  </el-select>
                  <el-button size="small" text type="danger" @click="removeRange(slot, key, ri)">删除</el-button>
                </div>
                <el-button size="small" text type="primary" @click="addRange(slot, key)">+ 添加版本区间</el-button>
              </div>
            </div>

            <div class="slot-foot">
              <div class="def-row">
                <span class="def-label">展示状态</span>
                <el-switch v-model="slot.enabled" size="small" />
                <span class="def-status-text">{{ slot.enabled ? '已开启' : '已关闭' }}</span>
              </div>

              <div v-if="slot.enabled" class="nums-row">
                <div class="num-item">
                  <span class="num-label">频次上限（次/小时）</span>
                  <el-input-number v-model="slot.freqLimit" :min="0" :controls="false" size="small" />
                </div>
                <div class="num-item">
                  <span class="num-label">展示间隔（秒）</span>
                  <el-input-number v-model="slot.showInterval" :min="0" :controls="false" size="small" />
                </div>
                <div class="num-item">
                  <span class="num-label">刷新间隔（秒）</span>
                  <el-input-number v-model="slot.refreshInterval" :min="0" :controls="false" size="small" />
                </div>
              </div>
              <div v-if="slot.enabled" class="group-hint">以上 0 表示不限制</div>
            </div>
          </template>
        </div>

        <el-button class="add-slot-btn" size="small" @click="defForm.slots.push(makeSlot())">
          <el-icon><Plus /></el-icon>添加广告位
        </el-button>
      </template>

      <template #footer>
        <el-button @click="defaultVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDefault">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, InfoFilled, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/* ============================================================
   基础字典
   ============================================================ */
const PLATFORMS = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' }
]

const REGIONS = {
  ios: [
    { value: 'ios-global', label: 'iOS-全球' },
    { value: 'ios-cn', label: 'iOS-国内' },
    { value: 'ios-ov', label: 'iOS-海外' }
  ],
  android: [
    { value: 'android-global', label: 'Android-全球' },
    { value: 'android-cn', label: 'Android-国内' },
    { value: 'android-ov', label: 'Android-海外' }
  ]
}
const regionsOf = platform => REGIONS[platform] || []

const APPS = [
  { id: 'A4NFan58MMPVqF88', name: 'seedrcam', platform: 'ios' },
  { id: 'ADRSAf6tFEKxe5rC', name: '平台代收款_汇云', platform: 'ios' },
  { id: 'ADRSAy2TrG9DJpy5', name: '测试应用12138', platform: 'ios' },
  { id: 'ALLxAc6UxmBChwnQ', name: '江能发', platform: 'ios' },
  { id: 'AyYjAg5sDYadK3wU', name: 'Casacam', platform: 'ios' },
  { id: 'jJNVfOPHJV', name: 'Glascam', platform: 'ios' },
  { id: 'TqiiFP53br', name: 'VG Vision', platform: 'ios' },
  { id: 'urGUtb3fVW', name: 'Glascam eye', platform: 'ios' },
  { id: 'ZKnF1F57Ae', name: '牵心Pro', platform: 'ios' },
  { id: 'Qm82JdU9xLoP3vT', name: '牵心Pro', platform: 'android' },
  { id: 'Hs71KdG8pQzR2mN', name: 'Glascam eye', platform: 'android' },
  { id: 'Wb93LdM7fNtK5sR', name: 'seedrcam', platform: 'android' }
]

const appKey = (app, reg) => `${app.id}|${reg.value}`

// App × 系统-区域 扁平表
const APP_REGION_MAP = {}
APPS.forEach(app => {
  regionsOf(app.platform).forEach(reg => {
    const key = appKey(app, reg)
    APP_REGION_MAP[key] = {
      key,
      appId: app.id,
      appName: app.name,
      platform: app.platform,
      label: `${app.name}-${reg.label}`
    }
  })
})

const AD_SLOTS = [
  { value: 'pro_ios_cn_launch_screen3', label: '开屏·iOS开屏', type: '开屏', name: 'iOS开屏', platform: 'ios' },
  { value: 'pro_ios_cn_cold_screen', label: '冷启插屏·iOS冷启插屏', type: '冷启插屏', name: 'iOS冷启插屏', platform: 'ios' },
  { value: 'pro_ios_cn_hot_screen', label: '热启插屏·iOS热启插屏', type: '热启插屏', name: 'iOS热启插屏', platform: 'ios' },
  { value: 'pro_ios_ov_cold_screen', label: '冷启插屏·iOS海外冷启插屏', type: '冷启插屏', name: 'iOS海外冷启插屏', platform: 'ios' },
  { value: 'pro_ios_ov_banner', label: 'Banner·iOS海外原生Banner', type: 'Banner', name: 'iOS海外原生Banner', platform: 'ios' },
  { value: 'pro_android_cn_launch_screen', label: '开屏·Android开屏', type: '开屏', name: 'Android开屏', platform: 'android' },
  { value: 'pro_android_cn_cold_screen', label: '冷启插屏·Android冷启插屏', type: '冷启插屏', name: 'Android冷启插屏', platform: 'android' },
  { value: 'pro_android_cn_hot_screen', label: '热启插屏·Android热启插屏', type: '热启插屏', name: 'Android热启插屏', platform: 'android' },
  { value: 'pro_android_ov_banner', label: 'Banner·Android海外原生Banner', type: 'Banner', name: 'Android海外原生Banner', platform: 'android' }
]
const SLOT_MAP = Object.fromEntries(AD_SLOTS.map(s => [s.value, s]))
// 下拉展示带编码，表格摘要用短标签
const slotOptionLabel = s => `${s.type}·${s.name} (${s.value})`
const slotsOf = platform => AD_SLOTS.filter(s => s.platform === platform)

const AD_SOURCES = [
  { value: 'S53998', label: 'Taku开屏iOS (S53998)', platform: 'ios' },
  { value: 'S53999', label: 'TopOn开屏iOS (S53999)', platform: 'ios' },
  { value: 'S54013', label: '穿山甲插屏iOS (S54013)', platform: 'ios' },
  { value: 'S54027', label: 'Mintegral原生iOS (S54027)', platform: 'ios' },
  { value: 'S63801', label: 'Taku开屏Android (S63801)', platform: 'android' },
  { value: 'S63802', label: 'TopOn开屏Android (S63802)', platform: 'android' },
  { value: 'S63910', label: '穿山甲插屏Android (S63910)', platform: 'android' },
  { value: 'S63921', label: 'Mintegral原生Android (S63921)', platform: 'android' }
]
const sourcesOf = platform => AD_SOURCES.filter(s => s.platform === platform)

const USER_GROUPS = [
  { value: 'rev_based', label: 'rev_based (PRO)' },
  { value: 'ux_based', label: 'ux_based (PRO)' },
  { value: 'mild_ad', label: 'mild_ad' },
  { value: 'free_ad', label: 'free_ad' }
]
const groupLabel = id => (USER_GROUPS.find(g => g.value === id) || {}).label || id

let seed = 0
const uid = () => `u${++seed}`
const genStrategyId = () => `STR_${Math.floor(100000 + Math.random() * 899999)}`

/* ============================================================
   通用「投放App」表单状态与勾选逻辑（两个抽屉共用）
   ============================================================ */
function makeForm(platform) {
  return reactive({ platform, appKeys: [], expanded: [], slots: [] })
}

const formApps = form => APPS.filter(a => a.platform === form.platform)

// 已选 App（按字典顺序稳定排列，避免勾选顺序跳动）
const formSelectedKeys = form =>
  Object.keys(APP_REGION_MAP).filter(
    k => APP_REGION_MAP[k].platform === form.platform && form.appKeys.includes(k)
  )

function isAppChecked(form, app) {
  return regionsOf(app.platform).every(reg => form.appKeys.includes(appKey(app, reg)))
}

function isAppIndeterminate(form, app) {
  const keys = regionsOf(app.platform).map(reg => appKey(app, reg))
  const hit = keys.filter(k => form.appKeys.includes(k)).length
  return hit > 0 && hit < keys.length
}

function toggleAppAll(form, app, checked) {
  const keys = regionsOf(app.platform).map(reg => appKey(app, reg))
  const rest = form.appKeys.filter(k => !keys.includes(k))
  form.appKeys = checked ? [...rest, ...keys] : rest
}

function toggleRegion(form, app, reg, checked) {
  const key = appKey(app, reg)
  form.appKeys = checked
    ? [...new Set([...form.appKeys, key])]
    : form.appKeys.filter(k => k !== key)
}

function toggleExpand(form, id) {
  form.expanded = form.expanded.includes(id)
    ? form.expanded.filter(x => x !== id)
    : [...form.expanded, id]
}

function selectAll(form) {
  const keys = []
  formApps(form).forEach(app => {
    regionsOf(app.platform).forEach(reg => keys.push(appKey(app, reg)))
  })
  form.appKeys = keys
  form.expanded = formApps(form).map(a => a.id)
}

function clearAll(form) {
  form.appKeys = []
}

/* ============================================================
   广告位 / 版本区间（两个抽屉共用）
   ============================================================ */
function makeSlot() {
  return {
    uid: uid(),
    slotId: '',
    enabled: true,
    freqLimit: 0,
    showInterval: 0,
    refreshInterval: 0,
    sources: {},
    ranges: {}
  }
}

const openVersionKeys = ref([])
const versionKey = (slot, key) => `${slot.uid}::${key}`

function isVersionOpen(slot, key) {
  return openVersionKeys.value.includes(versionKey(slot, key))
}

function toggleVersion(slot, key) {
  const k = versionKey(slot, key)
  if (openVersionKeys.value.includes(k)) {
    openVersionKeys.value = openVersionKeys.value.filter(x => x !== k)
    return
  }
  if (!slot.ranges[key]) slot.ranges[key] = []
  if (!slot.ranges[key].length) slot.ranges[key].push({ min: '', max: '', source: '' })
  openVersionKeys.value = [...openVersionKeys.value, k]
}

function addRange(slot, key) {
  if (!slot.ranges[key]) slot.ranges[key] = []
  slot.ranges[key].push({ min: '', max: '', source: '' })
}

function removeRange(slot, key, index) {
  slot.ranges[key].splice(index, 1)
}

/* ============================================================
   投放策略列表
   ============================================================ */
const keyword = ref('')
const queryKeyword = ref('')

const strategies = ref([
  {
    strategyId: 'STR_365365',
    name: '收益为主',
    platform: 'ios',
    appKeys: ['ZKnF1F57Ae|ios-global', 'urGUtb3fVW|ios-global'],
    groupIds: ['rev_based'],
    summaries: [
      'rev_based · 冷启插屏(iOS海外冷启插屏)',
      'rev_based · Banner(iOS海外原生Banner)',
      'rev_based · 冷启插屏(iOS海外冷启插屏)'
    ],
    summaryTotal: 4,
    groupCount: 1
  },
  {
    strategyId: 'STR_470247',
    name: '体验优先',
    platform: 'ios',
    appKeys: ['ZKnF1F57Ae|ios-global', 'urGUtb3fVW|ios-global'],
    groupIds: ['ux_based'],
    summaries: [
      'ux_based · 开屏(iOS开屏)',
      'ux_based · 冷启插屏(iOS冷启插屏)',
      'ux_based · 开屏(iOS热启插屏)'
    ],
    summaryTotal: 12,
    groupCount: 1
  },
  {
    strategyId: 'STR_538193',
    name: '轻度广告',
    platform: 'ios',
    appKeys: ['ZKnF1F57Ae|ios-global'],
    groupIds: ['mild_ad'],
    summaries: [
      'mild_ad · 开屏(iOS开屏)',
      'mild_ad · 冷启插屏(iOS冷启插屏)',
      'mild_ad · 开屏(iOS热启插屏)'
    ],
    summaryTotal: 12,
    groupCount: 1
  },
  {
    strategyId: 'STR_837707',
    name: '无广告',
    platform: 'ios',
    appKeys: ['ZKnF1F57Ae|ios-global'],
    groupIds: ['free_ad'],
    summaries: [
      'free_ad · 开屏(iOS开屏)',
      'free_ad · 冷启插屏(iOS冷启插屏)',
      'free_ad · 开屏(iOS热启插屏)'
    ],
    summaryTotal: 9,
    groupCount: 1
  },
  {
    strategyId: 'STR_491250',
    name: '收益为主',
    platform: 'android',
    appKeys: ['Qm82JdU9xLoP3vT|android-global', 'Hs71KdG8pQzR2mN|android-ov'],
    groupIds: ['rev_based'],
    summaries: [
      'rev_based · 开屏(Android开屏)',
      'rev_based · 冷启插屏(Android冷启插屏)',
      'rev_based · 热启插屏(Android热启插屏)'
    ],
    summaryTotal: 13,
    groupCount: 1
  },
  {
    strategyId: 'STR_201280',
    name: '体验优先',
    platform: 'android',
    appKeys: ['Qm82JdU9xLoP3vT|android-global'],
    groupIds: ['ux_based'],
    summaries: [
      'ux_based · 开屏(Android开屏)',
      'ux_based · 冷启插屏(Android冷启插屏)',
      'ux_based · 热启插屏(Android热启插屏)'
    ],
    summaryTotal: 9,
    groupCount: 1
  }
])

strategies.value.forEach(s => {
  s.apps = s.appKeys.map(k => (APP_REGION_MAP[k] ? APP_REGION_MAP[k].label : k))
})

const filteredStrategies = computed(() => {
  const kw = queryKeyword.value.trim().toLowerCase()
  if (!kw) return strategies.value
  return strategies.value.filter(
    s => s.name.toLowerCase().includes(kw) || s.strategyId.toLowerCase().includes(kw)
  )
})

function handleQuery() {
  queryKeyword.value = keyword.value
}

function removeStrategy(row) {
  ElMessageBox.confirm(`确认删除策略「${row.name}」？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
    .then(() => {
      strategies.value = strategies.value.filter(s => s !== row)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}

/* ============================================================
   Drawer：新建 / 编辑策略
   ============================================================ */
const drawerVisible = ref(false)
const drawerMode = ref('add')
const editingRow = ref(null)

const strategyForm = reactive({
  name: '',
  platform: 'ios',
  appKeys: [],
  expanded: [],
  slots: []
})

const selectedGroupIds = ref([])
const groupStore = reactive({})

const groupCards = computed(() =>
  selectedGroupIds.value.map(id => groupStore[id]).filter(Boolean)
)

function ensureGroup(id) {
  if (!groupStore[id]) {
    groupStore[id] = { uid: uid(), groupId: id, cooldown: 0, slots: [makeSlot()] }
  }
  return groupStore[id]
}

function onGroupsChange(ids) {
  ids.forEach(ensureGroup)
}

function removeGroupCard(card) {
  selectedGroupIds.value = selectedGroupIds.value.filter(id => id !== card.groupId)
}

function addSlot(card) {
  card.slots.push(makeSlot())
}

function removeSlot(card, index) {
  card.slots.splice(index, 1)
}

function onPlatformChange() {
  strategyForm.appKeys = []
  strategyForm.expanded = []
}

function openStrategy(mode, row) {
  drawerMode.value = mode
  editingRow.value = row || null
  openVersionKeys.value = []

  strategyForm.name = row ? row.name : ''
  strategyForm.platform = row ? row.platform : 'ios'
  strategyForm.appKeys = row ? [...row.appKeys] : []
  strategyForm.expanded = strategyForm.appKeys.length
    ? [...new Set(strategyForm.appKeys.map(k => k.split('|')[0]))]
    : []

  // 清空上一轮的临时分群配置
  Object.keys(groupStore).forEach(k => delete groupStore[k])

  selectedGroupIds.value = row ? [...row.groupIds] : []
  selectedGroupIds.value.forEach(ensureGroup)

  if (row && row.draftGroups) {
    row.draftGroups.forEach(g => {
      groupStore[g.groupId] = JSON.parse(JSON.stringify({ uid: uid(), ...g }))
    })
  }

  drawerVisible.value = true
}

function saveStrategy() {
  const f = strategyForm
  if (!f.name.trim()) return ElMessage.warning('请输入策略名称')
  if (!f.appKeys.length) return ElMessage.warning('请至少勾选一个投放 App')
  if (!groupCards.value.length) return ElMessage.warning('请至少选择一个用户分群')

  const summaries = []
  groupCards.value.forEach(card => {
    card.slots.forEach(slot => {
      if (!slot.slotId) return
      const meta = SLOT_MAP[slot.slotId]
      summaries.push(`${card.groupId} · ${meta.type}(${meta.name})`)
    })
  })

  const draftGroups = groupCards.value.map(card =>
    JSON.parse(JSON.stringify({ groupId: card.groupId, cooldown: card.cooldown, slots: card.slots }))
  )

  const payload = {
    strategyId:
      drawerMode.value === 'edit' && editingRow.value
        ? editingRow.value.strategyId
        : genStrategyId(),
    name: f.name.trim(),
    platform: f.platform,
    appKeys: [...f.appKeys],
    apps: formSelectedKeys(f).map(k => APP_REGION_MAP[k].label),
    groupIds: [...selectedGroupIds.value],
    groupCount: selectedGroupIds.value.length,
    summaries,
    summaryTotal: summaries.length,
    draftGroups
  }

  if (drawerMode.value === 'edit' && editingRow.value) {
    Object.assign(editingRow.value, payload)
  } else {
    strategies.value.unshift(payload)
  }

  drawerVisible.value = false
  ElMessage.success('保存成功')
}

/* ============================================================
   Drawer：默认策略（每个平台一份）
   ============================================================ */
const defaultVisible = ref(false)
const defaultTab = ref('ios')

// 已保存的默认策略，按平台一份
const defaultStore = reactive({
  ios: { appKeys: [], slots: [] },
  android: { appKeys: [], slots: [] }
})

// 编辑中的副本（取消即丢弃）
const defaultForms = reactive({
  ios: makeForm('ios'),
  android: makeForm('android')
})

const defForm = computed(() => defaultForms[defaultTab.value])

function openDefault() {
  openVersionKeys.value = []
  PLATFORMS.forEach(p => {
    const saved = defaultStore[p.value]
    const form = makeForm(p.value)
    form.appKeys = [...saved.appKeys]
    form.expanded = [...new Set(saved.appKeys.map(k => k.split('|')[0]))]
    form.slots = JSON.parse(JSON.stringify(saved.slots))
    defaultForms[p.value] = form
  })
  defaultTab.value = 'ios'
  defaultVisible.value = true
}

function saveDefault() {
  const incomplete = PLATFORMS.filter(p => {
    const f = defaultForms[p.value]
    return !f.appKeys.length || !f.slots.some(s => s.slotId)
  })
  if (incomplete.length) {
    return ElMessage.warning(
      `请完善 ${incomplete.map(p => p.label).join('、')} 的投放 App 与广告位配置`
    )
  }

  PLATFORMS.forEach(p => {
    const f = defaultForms[p.value]
    defaultStore[p.value] = {
      appKeys: [...f.appKeys],
      slots: JSON.parse(JSON.stringify(f.slots))
    }
  })

  defaultVisible.value = false
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.ad-page {
  background: var(--bg-page);
}

/* ---------- 页头 ---------- */
.ad-head {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.ad-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.ad-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ad-search {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ad-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ---------- 表格单元 ---------- */
.cell-strong {
  font-weight: 500;
  color: var(--text-primary);
}

.cell-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--text-secondary);
}

.cell-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-line {
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.5;
  word-break: break-all;
}

.cell-muted {
  font-size: 12px;
  color: var(--text-placeholder);
  line-height: 1.5;
}

/* ---------- 提示条 ---------- */
.tip-bar {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  margin: 12px 0;
  background: #f0f7ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: #2563eb;
}

.tip-bar .el-icon {
  flex-shrink: 0;
  font-size: 15px;
  margin-top: 1px;
}

/* ---------- 抽屉表单 ---------- */
.ad-form :deep(.el-form-item__label) {
  font-size: 13px;
}

.form-hint {
  width: 100%;
  font-size: 12px;
  color: var(--text-placeholder);
  line-height: 1.6;
  margin-top: 6px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-lighter);
}

/* ---------- 平台 Tab（默认策略抽屉内） ---------- */
.plat-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 18px;
}

.plat-tab {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.plat-tab:hover {
  color: var(--text-primary);
}

.plat-tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 500;
}

/* ---------- App 选择树 ---------- */
.app-picker {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  overflow: hidden;
}

.app-picker-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  background: #fafbfc;
  border-bottom: 1px solid var(--border-lighter);
}

.picker-label {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.app-count {
  font-size: 12px;
  color: var(--text-placeholder);
  margin-left: auto;
}

.tree-link {
  font-size: 12px;
  color: var(--primary-color);
  cursor: pointer;
  white-space: nowrap;
}

.tree-link:hover {
  text-decoration: underline;
}

.app-tree {
  max-height: 356px;
  overflow-y: auto;
  padding: 6px 0;
}

.app-node-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  line-height: 20px;
}

.app-node-row .el-checkbox,
.app-leaf .el-checkbox {
  margin-right: 6px;
}

.app-node-row:hover {
  background: #f5f7fa;
}

.tree-arrow {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-placeholder);
  cursor: pointer;
  transition: transform 0.15s;
  flex-shrink: 0;
  font-size: 12px;
}

.tree-arrow.expanded {
  transform: rotate(90deg);
}

.app-node-name {
  font-size: 13px;
  color: var(--text-primary);
}

.app-node-id {
  font-size: 12px;
  color: var(--text-placeholder);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.app-node-children {
  padding-left: 46px;
}

.app-leaf {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px 12px;
  line-height: 20px;
}

.app-leaf-name {
  font-size: 13px;
  color: var(--text-secondary);
}

/* ---------- 分群卡片 ---------- */
.ad-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-placeholder);
  background: #fafbfc;
  border: 1px dashed var(--border-light);
  border-radius: 6px;
}

.ad-empty.small {
  padding: 12px;
  font-size: 12px;
}

.group-card {
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 14px;
  background: #fff;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.group-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.group-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.group-unit {
  font-size: 13px;
  color: var(--text-secondary);
}

.group-hint {
  font-size: 12px;
  color: var(--text-placeholder);
  line-height: 1.6;
  margin: 4px 0 12px;
}

/* ---------- 广告位 ---------- */
.slot-block {
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fafbfc;
}

.slot-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-select {
  flex: 1;
}

.slot-hint {
  font-size: 12px;
  color: var(--text-placeholder);
  line-height: 1.6;
  margin: 8px 0;
}

.src-item {
  border-top: 1px dashed var(--border-lighter);
  padding-top: 8px;
  margin-top: 8px;
}

.src-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.src-app {
  width: 168px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.src-select {
  flex: 1;
  max-width: 320px;
}

.ver-panel {
  margin: 8px 0 0 178px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
}

.ver-hint {
  font-size: 12px;
  color: var(--text-placeholder);
  line-height: 1.6;
  margin-bottom: 8px;
}

.ver-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ver-input {
  width: 100px;
}

.ver-sep {
  color: var(--text-placeholder);
}

.ver-source {
  flex: 1;
  max-width: 240px;
}

.slot-foot {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-lighter);
}

.add-slot-btn {
  width: 100%;
  border-style: dashed;
}

/* ---------- 展示状态 / 数值 ---------- */
.def-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.def-label {
  width: 68px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.def-status-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.nums-row {
  display: flex;
  gap: 18px;
  margin-top: 12px;
}

.num-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.num-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.num-item :deep(.el-input-number) {
  width: 100%;
}
</style>
