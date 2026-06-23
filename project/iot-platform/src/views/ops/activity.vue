<template>
  <div class="page-container">
    <!-- ===== Filter Bar ===== -->
    <div v-show="currentPage === 'strategy-list'" class="filter-bar">
      <el-select v-model="filterStatus" placeholder="全部状态" size="small" style="width:120px" clearable @change="applyFilter">
        <el-option label="草稿" value="draft" />
        <el-option label="进行中" value="active" />
        <el-option label="已暂停" value="paused" />
        <el-option label="已结束" value="ended" />
        <el-option label="已过期" value="expired" />
      </el-select>
      <el-select v-model="filterRegion" placeholder="全部区域" size="small" style="width:120px" clearable @change="applyFilter">
        <el-option label="国内" value="国内" />
        <el-option label="海外" value="海外" />
      </el-select>
      <el-select v-model="filterApp" placeholder="全部APP" size="small" style="width:130px" clearable @change="applyFilter">
        <el-option label="牵心PRO" value="牵心PRO" />
        <el-option label="鹤梦之家" value="鹤梦之家" />
      </el-select>
      <el-input v-model="filterSearch" placeholder="搜索活动名称..." size="small" style="width:200px" clearable @input="applyFilter" />
    </div>

    <!-- ===== Page: Strategy List ===== -->
    <div v-show="currentPage === 'strategy-list'" class="ops-panel" style="padding:0">
      <div class="card">
        <div class="card-header">
          <span class="card-title">活动位策略列表</span>
          <div>
            <el-button size="small" @click="currentPage = 'address-config'">活动配置</el-button>
            <el-button type="primary" size="small" @click="openAddStrategy">
              <el-icon><Plus /></el-icon>添加活动
            </el-button>
          </div>
        </div>
        <el-table :data="filteredStrategies" stripe>
          <el-table-column label="活动名称" min-width="160">
            <template #default="{ row }">
              <div>
                <div class="strategy-name">{{ row.name }}</div>
                <div class="strategy-id">{{ row.id }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="弹窗频率" width="110">
            <template #default="{ row }">
              <span class="cell-muted">每 {{ row.popupInterval }} 小时</span>
            </template>
          </el-table-column>
          <el-table-column label="活动周期" width="220">
            <template #default="{ row }">
              <div v-if="row.startTime">
                <div class="period-text">{{ formatDate(row.startTime) }}</div>
                <div class="period-sub">至 {{ formatDate(row.endTime) }}</div>

              </div>
              <span v-else class="cell-muted">待定</span>
            </template>
          </el-table-column>
          <el-table-column label="活动状态" width="100">
            <template #default="{ row }">
              <span :class="['status-tag', 'status-' + row.status]">{{ statusMap[row.status]?.label }}</span>
            </template>
          </el-table-column>
          <el-table-column label="投放区域" width="100">
            <template #default="{ row }">
              <el-tag v-for="r in row.regions" :key="r" size="small" type="info" class="cell-tag">{{ r }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="投放APP" width="110">
            <template #default="{ row }">
              <el-tag v-for="a in row.apps" :key="a" size="small" type="success" class="cell-tag">{{ a }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="投放用户分群" width="150">
            <template #default="{ row }">
              <el-tag v-for="g in row.groups" :key="g" size="small" type="primary" class="cell-tag cell-tag-block">{{ g }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="130">
            <template #default="{ row }">
              <span class="text-ellipsis" style="max-width:120px;display:inline-block">{{ row.remark || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="套餐配置" width="110">
            <template #default="{ row }">
              <el-button size="small" text type="primary" @click="router.push({ path: '/ops/activity/pkg', query: { strategyId: row.id, name: row.name } })">配置</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row, $index }">
              <template v-if="row.status === 'draft'">
                <el-button size="small" text type="primary" @click="openEditStrategy(row)">编辑</el-button>
                <el-button size="small" text type="danger" @click="deleteStrategy(row)">删除</el-button>
                <el-button size="small" text type="success" @click="publishStrategy(row)">发布</el-button>
              </template>
              <template v-else-if="row.status === 'active'">
                <el-button size="small" text type="primary" @click="openDetailDrawer(row)">查看</el-button>
                <el-button size="small" text type="warning" @click="pauseStrategy(row)">暂停</el-button>
              </template>
              <template v-else-if="row.status === 'paused'">
                <el-button size="small" text type="primary" @click="openDetailDrawer(row)">查看</el-button>
                <el-button size="small" text type="success" @click="resumeStrategy(row)">恢复</el-button>
                <el-button size="small" text type="danger" @click="endStrategy(row)">结束</el-button>
              </template>
              <template v-else>
                <el-button size="small" text type="primary" @click="openDetailDrawer(row)">查看</el-button>
                <el-button size="small" text type="primary" @click="copyStrategy(row)">复制新建</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ===== Page: Address Config ===== -->
    <div v-show="currentPage === 'address-config'" class="ops-panel" style="padding:0">
      <div class="pkg-manage-header">
        <div class="pkg-manage-left">
          <el-button @click="currentPage = 'strategy-list'">
            <el-icon><ArrowLeft /></el-icon>返回
          </el-button>
          <div>
            <div class="pkg-manage-title">活动地址配置</div>
            <div class="pkg-manage-subtitle">
              管理活动跳转地址列表 · 当前共 <span class="pkg-count">{{ activityAddresses.length }}</span> 条
            </div>
          </div>
        </div>
        <div class="pkg-manage-actions">
          <el-button type="primary" size="small" @click="openAddAddress">
            <el-icon><Plus /></el-icon>添加地址
          </el-button>
        </div>
      </div>

      <div class="card">
        <el-table :data="activityAddresses" stripe>
          <el-table-column label="地址名称" min-width="200">
            <template #default="{ row }">
              <span class="strategy-name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="H5地址" min-width="280">
            <template #default="{ row }">
              <span class="cell-muted">{{ row.url }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row, $index }">
              <el-button size="small" text type="primary" @click="openEditAddress(row)">编辑</el-button>
              <el-button size="small" text type="danger" @click="deleteAddress(row, $index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ===== Drawer: Add Strategy (3-step) ===== -->
    <el-drawer v-model="addDrawerVisible" title="添加活动" size="720px">
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
          <span class="step-num"><template>2</template></span>
          <span class="step-label">投放配置</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: addStep >= 3 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: addStep >= 3, current: addStep === 3 }" @click="addStep = 3">
          <span class="step-num"><template>3</template></span>
          <span class="step-label">活动内容</span>
        </div>
      </div>

      <!-- Step 1: 基础信息 -->
      <div v-show="addStep === 1" class="step-content">
        <el-form label-position="top">
          <el-form-item label="活动名称" required>
            <el-input v-model="addForm.name" placeholder="请输入活动名称（最长50字符）" maxlength="50" />
          </el-form-item>
          <el-form-item label="活动周期" required>
            <div class="date-row">
              <el-date-picker v-model="addForm.startTime" type="datetime" placeholder="开始时间" style="flex:1" />
              <span class="date-sep">至</span>
              <el-date-picker v-model="addForm.endTime" type="datetime" placeholder="结束时间" style="flex:1" />
            </div>
            <div v-if="addForm.startTime && addForm.endTime && addForm.endTime <= addForm.startTime" class="form-error">结束时间必须晚于开始时间</div>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="addForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息（选填）" />
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2: 投放配置 -->
      <div v-show="addStep === 2" class="step-content">
        <el-form label-position="top">
          <el-form-item label="弹窗频率（小时）" required>
            <el-input-number v-model="addForm.popupInterval" :min="1" :max="720" :step="1" style="width:200px" />
            <span class="form-hint" style="margin-left:8px">每 N 小时弹出 1 次，建议 6-48 小时</span>
          </el-form-item>
          <el-form-item label="投放区域" required>
            <div class="checkbox-group">
              <el-checkbox v-for="r in regionOptions" :key="r.value" v-model="addForm.regions" :label="r.value" class="checkbox-item">
                {{ r.label }}
              </el-checkbox>
            </div>
          </el-form-item>
          <el-form-item label="投放APP" required>
            <div class="checkbox-group">
              <el-checkbox v-for="a in appOptions" :key="a.value" v-model="addForm.apps" :label="a.value" class="checkbox-item">
                {{ a.label }}
                <span class="checkbox-hint">{{ a.code }}</span>
              </el-checkbox>
            </div>
          </el-form-item>
          <el-form-item label="投放用户分群" required>
            <div class="checkbox-group">
              <el-checkbox v-for="g in userGroups" :key="g.code" v-model="addForm.groups" :label="g.name" class="checkbox-item">
                {{ g.name }}
                <span class="checkbox-hint">{{ g.code }}</span>
              </el-checkbox>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 3: 活动内容 -->
      <div v-show="addStep === 3" class="step-content">
        <el-form label-position="top">
          <el-form-item label="活动地址" required>
            <el-select v-model="addForm.addressId" placeholder="请选择活动跳转地址" style="width:100%">
              <el-option v-for="addr in activityAddresses" :key="addr.id" :label="`${addr.name} (${addr.url})`" :value="addr.id" />
            </el-select>
            <div class="form-hint" style="margin-top:4px">在「活动配置」中管理地址列表</div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button v-if="addStep > 1" @click="addStep--">上一步</el-button>
        <span class="footer-spacer"></span>
        <el-button @click="addDrawerVisible = false">取消</el-button>
        <el-button v-if="addStep < 3" type="primary" @click="addStep++">下一步</el-button>
        <el-button v-else type="primary" @click="confirmAddStrategy">提交</el-button>
      </template>
    </el-drawer>

    <!-- ===== Drawer: Edit Strategy (3-step) ===== -->
    <el-drawer v-model="editDrawerVisible" title="编辑活动" size="720px">
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
          <span class="step-num"><template>2</template></span>
          <span class="step-label">投放配置</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: editStep >= 3 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: editStep >= 3, current: editStep === 3 }" @click="editStep = 3">
          <span class="step-num"><template>3</template></span>
          <span class="step-label">活动内容</span>
        </div>
      </div>

      <div v-show="editStep === 1" class="step-content">
        <el-form label-position="top">
          <el-form-item label="活动名称" required>
            <el-input v-model="editForm.name" placeholder="请输入活动名称" maxlength="50" />
          </el-form-item>
          <el-form-item label="活动周期" required>
            <div class="date-row">
              <el-date-picker v-model="editForm.startTime" type="datetime" placeholder="开始时间" style="flex:1" />
              <span class="date-sep">至</span>
              <el-date-picker v-model="editForm.endTime" type="datetime" placeholder="结束时间" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="editForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>

      <div v-show="editStep === 2" class="step-content">
        <el-form label-position="top">
          <el-form-item label="弹窗频率（小时）" required>
            <el-input-number v-model="editForm.popupInterval" :min="1" :max="720" :step="1" style="width:200px" />
            <span class="form-hint" style="margin-left:8px">每 N 小时弹出 1 次</span>
          </el-form-item>
          <el-form-item label="投放区域" required>
            <div class="checkbox-group">
              <el-checkbox v-for="r in regionOptions" :key="r.value" v-model="editForm.regions" :label="r.value" class="checkbox-item">
                {{ r.label }}
              </el-checkbox>
            </div>
          </el-form-item>
          <el-form-item label="投放APP" required>
            <div class="checkbox-group">
              <el-checkbox v-for="a in appOptions" :key="a.value" v-model="editForm.apps" :label="a.value" class="checkbox-item">
                {{ a.label }}
                <span class="checkbox-hint">{{ a.code }}</span>
              </el-checkbox>
            </div>
          </el-form-item>
          <el-form-item label="投放用户分群" required>
            <div class="checkbox-group">
              <el-checkbox v-for="g in userGroups" :key="g.code" v-model="editForm.groups" :label="g.name" class="checkbox-item">
                {{ g.name }}
                <span class="checkbox-hint">{{ g.code }}</span>
              </el-checkbox>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div v-show="editStep === 3" class="step-content">
        <el-form label-position="top">
          <el-form-item label="活动地址" required>
            <el-select v-model="editForm.addressId" placeholder="请选择活动跳转地址" style="width:100%">
              <el-option v-for="addr in activityAddresses" :key="addr.id" :label="`${addr.name} (${addr.url})`" :value="addr.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button v-if="editStep > 1" @click="editStep--">上一步</el-button>
        <span class="footer-spacer"></span>
        <el-button @click="editDrawerVisible = false">取消</el-button>
        <el-button v-if="editStep < 3" type="primary" @click="editStep++">下一步</el-button>
        <el-button v-else type="primary" @click="confirmEditStrategy">保存</el-button>
      </template>
    </el-drawer>

    <!-- ===== Drawer: Detail View ===== -->
    <el-drawer v-model="detailDrawerVisible" title="活动详情" size="520px">
      <div v-if="detailStrategy" class="review-body">
        <div class="review-section">
          <div class="review-label">活动名称</div>
          <div class="review-value">{{ detailStrategy.name }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">活动ID</div>
          <div class="review-value">{{ detailStrategy.id }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">活动状态</div>
          <div class="review-value"><span :class="['status-tag', 'status-' + detailStrategy.status]">{{ statusMap[detailStrategy.status]?.label }}</span></div>
        </div>
        <div class="review-section">
          <div class="review-label">活动周期</div>
          <div class="review-value">{{ detailStrategy.startTime ? formatDate(detailStrategy.startTime) + ' ~ ' + formatDate(detailStrategy.endTime) : '待定' }}</div>        </div>
        <div class="review-section">
          <div class="review-label">弹窗频率</div>
          <div class="review-value">每 {{ detailStrategy.popupInterval }} 小时 1 次</div>
        </div>
        <div class="review-section">
          <div class="review-label">活动地址</div>
          <div class="review-value">{{ getAddressName(detailStrategy.addressId) }}<br /><span class="cell-muted">{{ getAddressUrl(detailStrategy.addressId) }}</span></div>
        </div>
        <div class="review-section">
          <div class="review-label">投放区域</div>
          <div class="review-value">{{ detailStrategy.regions.join('、') }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">投放APP</div>
          <div class="review-value">{{ detailStrategy.apps.join('、') }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">投放用户分群</div>
          <div class="review-value">{{ detailStrategy.groups.join('、') }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">备注</div>
          <div class="review-value">{{ detailStrategy.remark || '无' }}</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDrawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>

    <!-- ===== Dialog: Add/Edit Address ===== -->
    <el-dialog v-model="addressDialogVisible" :title="addressDialogTitle" width="500px" :close-on-click-modal="false">
      <el-form ref="addressFormRef" :model="addressForm" label-width="80px">
        <el-form-item label="地址名称" required>
          <el-input v-model="addressForm.name" placeholder="例如：618大促活动页" maxlength="30" />
        </el-form-item>
        <el-form-item label="H5地址" required>
          <el-input v-model="addressForm.url" placeholder="https://m.example.com/activity/618" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddress">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

// ===== Page State =====
const currentPage = ref('strategy-list')

// ===== Address helpers =====
const getAddressName = (id) => {
  const addr = activityAddresses.value.find(a => a.id === id)
  return addr ? addr.name : '—'
}
const getAddressUrl = (id) => {
  const addr = activityAddresses.value.find(a => a.id === id)
  return addr ? addr.url : ''
}

const regionOptions = [
  { value: '国内', label: '国内' },
  { value: '海外', label: '海外' }
]

const appOptions = [
  { value: '牵心PRO', label: '牵心PRO', code: 'QX_PRO_001' },
  { value: '鹤梦之家', label: '鹤梦之家', code: 'HM_HOME_001' }
]

const userGroups = [
  { name: '高价值用户', code: 'ug_high_value' },
  { name: '新注册用户', code: 'ug_new_reg' },
  { name: '活跃用户', code: 'ug_active' },
  { name: '沉默用户', code: 'ug_silent' },
  { name: '付费用户', code: 'ug_paid' }
]

const statusMap = {
  draft: { label: '草稿', color: '#909399' },
  active: { label: '进行中', color: '#67C23A' },
  paused: { label: '已暂停', color: '#F2C94C' },
  ended: { label: '已结束', color: '#4A5568' },
  expired: { label: '已过期', color: '#A0AEC0' }
}

// ===== Strategies =====
const strategies = ref([
  {
    id: 'AS001', name: '618大促弹窗活动', status: 'active',
    startTime: '2026-06-01T00:00', endTime: '2026-06-18T23:59',
    regions: ['国内'], apps: ['牵心PRO'],
    groups: ['高价值用户', '活跃用户'], addressId: 'ADDR001',
    popupInterval: 24,
    remark: '618大促首页弹窗'
  },
  {
    id: 'AS002', name: '新用户专享弹窗', status: 'active',
    startTime: '2026-05-20T00:00', endTime: '2026-06-20T23:59',
    regions: ['国内', '海外'], apps: ['牵心PRO', '鹤梦之家'],
    groups: ['新注册用户'], addressId: 'ADDR002',
    popupInterval: 12,
    remark: '新用户首次打开App展示'
  },
  {
    id: 'AS003', name: '五一弹窗活动', status: 'expired',
    startTime: '2026-04-28T00:00', endTime: '2026-05-05T23:59',
    regions: ['国内'], apps: ['牵心PRO'],
    groups: ['活跃用户', '付费用户'], addressId: 'ADDR003',
    popupInterval: 24,
    remark: '五一特惠'
  },
  {
    id: 'AS004', name: '双11预售弹窗', status: 'draft',
    startTime: '2026-11-01T00:00', endTime: '2026-11-11T23:59',
    regions: ['国内', '海外'], apps: ['牵心PRO', '鹤梦之家'],
    groups: ['高价值用户', '活跃用户', '付费用户'], addressId: 'ADDR001',
    popupInterval: 6,
    remark: '双11大促预售'
  }
])

// ===== Activity Addresses =====
const activityAddresses = ref([
  { id: 'ADDR001', name: '618大促活动页', url: 'https://m.example.com/activity/618' },
  { id: 'ADDR002', name: '新用户专享页', url: 'https://m.example.com/new-user' },
  { id: 'ADDR003', name: '五一特惠页', url: 'https://m.example.com/mayday' }
])

// ===== Filters =====
const filterStatus = ref('')
const filterRegion = ref('')
const filterApp = ref('')
const filterSearch = ref('')

const filteredStrategies = ref([])

const applyFilter = () => {
  let list = strategies.value

  // Auto-check expired
  const now = new Date().toISOString()
  list.forEach(s => {
    if (s.status === 'active' && s.endTime && s.endTime < now) {
      s.status = 'expired'
    }
  })

  if (filterStatus.value) list = list.filter(s => s.status === filterStatus.value)
  if (filterRegion.value) list = list.filter(s => s.regions.includes(filterRegion.value))
  if (filterApp.value) list = list.filter(s => s.apps.includes(filterApp.value))
  if (filterSearch.value) {
    const kw = filterSearch.value.toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(kw))
  }
  filteredStrategies.value = list
}

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.replace('T', ' ').substring(0, 16)
}

// ===== Add Strategy =====
const addDrawerVisible = ref(false)
const addStep = ref(1)
const addForm = reactive({
  name: '', startTime: '', endTime: '', remark: '',
  regions: ['国内'], apps: ['牵心PRO'],
  groups: [], addressId: '', popupInterval: 24
})

const openAddStrategy = () => {
  addStep.value = 1
  addForm.name = ''
  addForm.startTime = ''
  addForm.endTime = ''
  addForm.remark = ''
  addForm.regions = ['国内']
  addForm.apps = ['牵心PRO']
  addForm.groups = []
  addForm.addressId = ''
  addForm.popupInterval = 24
  addDrawerVisible.value = true
}

const confirmAddStrategy = () => {
  if (!addForm.name.trim()) { addStep.value = 1; return }
  if (addForm.startTime && addForm.endTime && addForm.endTime <= addForm.startTime) { addStep.value = 1; return }
  if (!addForm.addressId) { addStep.value = 3; return }
  if (!addForm.regions.length) { addStep.value = 2; return }
  if (!addForm.apps.length) { addStep.value = 2; return }
  if (!addForm.groups.length) { addStep.value = 2; return }

  const id = 'AS' + String(strategies.value.length + 1).padStart(3, '0')
  strategies.value.push({
    id, name: addForm.name, status: 'draft',
    startTime: addForm.startTime, endTime: addForm.endTime,
    regions: [...addForm.regions],
    apps: [...addForm.apps], groups: [...addForm.groups],
    addressId: addForm.addressId,
    popupInterval: addForm.popupInterval,
    remark: addForm.remark
  })
  addDrawerVisible.value = false
  applyFilter()
}

// ===== Edit Strategy =====
const editDrawerVisible = ref(false)
const editStep = ref(1)
const editingId = ref('')
const editForm = reactive({
  name: '', startTime: '', endTime: '', remark: '',
  regions: [], apps: [],
  groups: [], addressId: '', popupInterval: 24
})

const openEditStrategy = (row) => {
  editStep.value = 1
  editingId.value = row.id
  editForm.name = row.name
  editForm.startTime = row.startTime
  editForm.endTime = row.endTime
  editForm.remark = row.remark
  editForm.regions = [...row.regions]
  editForm.apps = [...row.apps]
  editForm.groups = [...row.groups]
  editForm.addressId = row.addressId || ''
  editForm.popupInterval = row.popupInterval || 24
  editDrawerVisible.value = true
}

const confirmEditStrategy = () => {
  const s = strategies.value.find(s => s.id === editingId.value)
  if (!s) return
  s.name = editForm.name
  s.startTime = editForm.startTime
  s.endTime = editForm.endTime
  s.remark = editForm.remark
  s.regions = [...editForm.regions]
  s.apps = [...editForm.apps]
  s.groups = [...editForm.groups]
  s.addressId = editForm.addressId
  s.popupInterval = editForm.popupInterval
  editDrawerVisible.value = false
  applyFilter()
}

const deleteStrategy = (row) => {
  strategies.value = strategies.value.filter(s => s.id !== row.id)
  applyFilter()
}

// ===== Status Flow =====
const checkConflict = (strategy) => {
  return strategies.value.filter(s => {
    if (s.id === strategy.id) return false
    if (s.status !== 'active') return false
    const hasRegion = s.regions.some(r => strategy.regions.includes(r))
    if (!hasRegion) return false
    const hasApp = s.apps.some(a => strategy.apps.includes(a))
    if (!hasApp) return false
    const hasGroup = s.groups.some(g => strategy.groups.includes(g))
    if (!hasGroup) return false
    return true
  })
}

const publishStrategy = async (row) => {
  const conflicts = checkConflict(row)
  if (conflicts.length > 0) {
    const names = conflicts.map(s => `「${s.name}(${s.id})」`).join('、')
    try {
      await ElMessageBox.confirm(
        `检测到与以下进行中活动存在投放冲突：${names}。同一用户在同一APP同一区域不可同时存在两个进行中活动。确定仍要发布吗？`,
        '冲突预警',
        { confirmButtonText: '仍要发布', cancelButtonText: '取消', type: 'warning' }
      )
    } catch {
      return
    }
  }
  row.status = 'active'
  applyFilter()
}
const pauseStrategy = (row) => { row.status = 'paused'; applyFilter() }
const resumeStrategy = (row) => { row.status = 'active'; applyFilter() }
const endStrategy = (row) => { row.status = 'ended'; applyFilter() }
const copyStrategy = (row) => {
  const id = 'AS' + String(strategies.value.length + 1).padStart(3, '0')
  strategies.value.push({ ...row, id, name: row.name + '（副本）', status: 'draft' })
  applyFilter()
}

// ===== Address CRUD =====
const addressDialogVisible = ref(false)
const editingAddressId = ref(null)
const addressForm = reactive({ name: '', url: '' })

const addressDialogTitle = computed(() => editingAddressId.value ? '编辑活动地址' : '添加活动地址')

function openAddAddress() {
  editingAddressId.value = null
  addressForm.name = ''
  addressForm.url = ''
  addressDialogVisible.value = true
}

function openEditAddress(row) {
  editingAddressId.value = row.id
  addressForm.name = row.name
  addressForm.url = row.url
  addressDialogVisible.value = true
}

function confirmAddress() {
  if (!addressForm.name.trim() || !addressForm.url.trim()) return
  if (editingAddressId.value) {
    const addr = activityAddresses.value.find(a => a.id === editingAddressId.value)
    if (addr) { addr.name = addressForm.name; addr.url = addressForm.url }
  } else {
    const id = 'ADDR' + String(activityAddresses.value.length + 1).padStart(3, '0')
    activityAddresses.value.push({ id, name: addressForm.name, url: addressForm.url })
  }
  addressDialogVisible.value = false
}

function deleteAddress(row, index) {
  activityAddresses.value.splice(index, 1)
}

// ===== Detail Drawer =====
const detailDrawerVisible = ref(false)
const detailStrategy = ref(null)

const openDetailDrawer = (row) => {
  detailStrategy.value = row
  detailDrawerVisible.value = true
}

// ===== Auto-expire check =====
let expireTimer = null
onMounted(() => {
  applyFilter()
  expireTimer = setInterval(applyFilter, 60000)
})
onUnmounted(() => {
  clearInterval(expireTimer)
})
</script>

<style lang="scss" scoped>
// ===== Filter Bar =====
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  flex-wrap: wrap;
}

// ===== Strategy Table =====
.strategy-name { font-weight: 500; color: var(--text-primary); }
.strategy-id { font-size: 11px; color: var(--gray-400); margin-top: 2px; }

.period-text { font-size: var(--font-sm); }
.period-sub { font-size: 11px; color: var(--text-secondary); }

.cell-muted { font-size: var(--font-sm); color: var(--gray-400); }
.cell-tag { margin-right: 4px; }

.tag-line { margin-bottom: 2px; }

// ===== Status Tags =====
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.status-draft { background: #F1F5F9; color: #64748B; }
.status-active { background: #F0FDF4; color: #16A34A; }
.status-paused { background: #FFFBEB; color: #D97706; }
.status-ended { background: #F1F5F9; color: #4A5568; }
.status-expired { background: #F8FAFC; color: #94A3B8; }

// ===== Position Tags =====
.pos-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.code-tag {
  font-size: 11px;
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-regular);
}
// ===== Date Row =====
.date-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.date-sep { color: var(--gray-400); font-size: var(--font-md); flex-shrink: 0; }

.form-error { color: var(--danger-color); font-size: var(--font-xs); margin-top: 4px; }

// ===== Package Management =====
.pkg-manage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.pkg-manage-left { display: flex; align-items: center; gap: 12px; }
.pkg-manage-actions { display: flex; gap: 8px; }
.pkg-manage-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.pkg-manage-subtitle { font-size: var(--font-xs); color: var(--text-secondary); margin-top: 2px; }
.pkg-count { color: var(--primary-color); font-weight: 600; }

// ===== Review =====
.review-body { padding: 0; }

.review-section { margin-bottom: 14px; }

.review-label {
  font-size: var(--font-xs);
  color: var(--gray-400);
  margin-bottom: 4px;
}

.review-value {
  font-size: var(--font-md);
  color: var(--text-primary);
}

// ===== Utilities =====
.footer-spacer { flex: 1; }
.color-gray-400 { color: var(--gray-400); }
</style>
