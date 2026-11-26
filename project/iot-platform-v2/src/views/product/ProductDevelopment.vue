<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      <!-- Page intro -->
      <div class="px-5 pt-4 pb-3 border-b border-slate-200 bg-white">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-base font-bold text-slate-900 tracking-tight">产品开发</h1>
            <p class="text-[11px] text-slate-500 leading-relaxed mt-1 max-w-3xl">
              产品是一组具有相关功能定义的设备集合，创建产品是使用平台的开始。创建产品后通过功能定义 → 设备交互 → 硬件开发 → 产品配置 → 产品调试，简单五步即可完成产品智能化。
            </p>
          </div>
          <button class="link-action whitespace-nowrap" @click="openDocs">产品开发操作文档 →</button>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="px-4 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2">
        <el-select v-model="filter.tag" placeholder="标签" clearable size="small" style="width:105px">
          <el-option label="全部" value="" />
          <el-option label="wifi" value="wifi" />
        </el-select>
        <el-select v-model="filter.sortType" placeholder="创建时间顺序" clearable size="small" style="width:140px">
          <el-option label="创建时间" value="createTime" />
          <el-option label="更新时间" value="updateTime" />
        </el-select>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-medium text-slate-500">产品ID</span>
          <el-input v-model="filter.productId" placeholder="产品ID" clearable size="small" style="width:130px" />
        </div>
        <el-input v-model="filter.name" placeholder="产品ID / 产品名称 / 产品型号" clearable size="small" style="width:240px" />
        <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
        <el-button size="small" @click="handleReset">重置</el-button>
        <div class="flex-1" />
        <button class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all" @click="handleCreate">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" /></svg>
          <span>创建产品</span>
        </button>
      </div>

      <!-- Criteria chips -->
      <div class="px-4 py-2 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-semibold text-slate-500">筛选条件:</span>
          <span class="criteria-chip"><span class="text-slate-400">产品类目:</span><span class="font-medium text-slate-700">{{ filter.category || '全部' }}</span></span>
          <span class="criteria-chip"><span class="text-slate-400">开发状态:</span><span class="font-medium text-slate-700">{{ filter.status || '全部' }}</span></span>
          <span class="criteria-chip"><span class="text-slate-400">开发方式:</span><span class="font-medium text-slate-700">{{ filter.devMethod || '全部' }}</span></span>
        </div>
        <button class="text-[11px] text-slate-500 hover:text-sky-600 transition-colors" @click="handleReset">重置筛选</button>
      </div>

      <!-- Referenced tip -->
      <div v-if="hasReferenced" class="mx-4 mt-3 tip-bar">
        <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
        <span>引用产品为只读状态，不支持编辑和发布操作。如需修改请联系来源企业获取最新版本。</span>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-auto bg-white mt-3">
        <el-table :data="pagedData" class="stitch-table">
          <el-table-column label="产品信息" min-width="250">
            <template #default="{ row }">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 text-sm font-bold flex-shrink-0">{{ row.name.charAt(0) }}</div>
                <div class="min-w-0">
                  <button class="cell-name hover:text-sky-700 transition-colors" @click="handleManageProduct(row)">{{ row.name }}</button>
                  <div class="font-mono text-[10px] text-slate-400 mt-0.5">产品ID: {{ row.productId }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类目" width="120"><template #default="{ row }"><span class="cell-text">{{ row.category }}</span></template></el-table-column>
          <el-table-column label="开发方式" width="110"><template #default="{ row }"><span class="cell-text">{{ devMethodLabel(row.devMethod) }}</span></template></el-table-column>
          <el-table-column label="来源企业" width="120" show-overflow-tooltip><template #default="{ row }"><span class="cell-text">{{ row.sourceCompany }}</span></template></el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }"><span class="status-tag" :class="statusCls(row.status)">{{ statusLabel(row.status) }}</span></template>
          </el-table-column>
          <el-table-column label="授权信息" width="110">
            <template #default="{ row }"><span class="text-[11px]" :class="row.status === 'referenced' ? 'text-slate-400' : 'text-slate-600'">{{ row.authInfo }}</span></template>
          </el-table-column>
          <el-table-column label="操作人" width="90"><template #default="{ row }"><span class="cell-text">{{ row.operator }}</span></template></el-table-column>
          <el-table-column label="所属企业" width="120" show-overflow-tooltip><template #default="{ row }"><span class="cell-text">{{ row.company }}</span></template></el-table-column>
          <el-table-column label="创建时间" width="110"><template #default="{ row }"><span class="cell-time">{{ row.createTime }}</span></template></el-table-column>
          <el-table-column label="更新时间" width="110"><template #default="{ row }"><span class="cell-time">{{ row.updateTime }}</span></template></el-table-column>
          <el-table-column label="操作" width="230" align="right" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <template v-if="row.status === 'published'">
                  <button class="link-action" @click="handleAppConfig(row)">App配置</button>
                  <button class="link-action" @click="handleAddFirmware(row)">添加固件</button>
                  <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                    <button class="link-action inline-flex items-center gap-0.5">更多
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                    </button>
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
                  <button class="link-action" @click="handleCopy(row)">复制产品</button>
                  <button class="link-action" @click="handleAddFirmware(row)">添加固件</button>
                  <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                    <button class="link-action inline-flex items-center gap-0.5">更多
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="viewDetail">查看详情</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <template v-else-if="row.status === 'developing'">
                  <button class="link-action" @click="handleContinueDev(row)">继续开发</button>
                  <button class="link-action" @click="handleAddFirmware(row)">添加固件</button>
                  <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                    <button class="link-action inline-flex items-center gap-0.5">更多
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="copy">复制产品</el-dropdown-item>
                        <el-dropdown-item command="viewDetail">查看详情</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <span v-else class="text-xs text-slate-300">—</span>
              </div>
            </template>
          </el-table-column>
          <template #empty><div class="empty-box"><span>暂无产品数据</span><button class="link-action" @click="handleCreate">+ 创建产品</button></div></template>
        </el-table>
      </div>

      <footer class="h-12 border-t border-slate-200 bg-white px-5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span>共 <strong class="font-semibold text-slate-700">{{ filteredData.length }}</strong> 个产品</span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="sizes, prev, pager, next, jumper"
          size="small"
        />
      </footer>
    </main>

    <!-- Create drawer -->
    <el-drawer
      v-model="createDialogVisible"
      title="创建产品"
      direction="rtl"
      size="560px"
      :close-on-click-modal="false"
      class="create-product-drawer"
    >
      <el-form ref="createFormRef" :model="createForm" label-width="120px">
        <el-form-item label="产品归属企业" required>
          <el-select
            v-model="createForm.company"
            filterable
            remote
            :remote-method="searchCompany"
            placeholder="可输入企业名称或企业ID查询"
            style="width:100%"
          >
            <el-option v-for="c in companyOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="开发方式" required>
          <el-radio-group v-model="createForm.devMethod">
            <el-radio value="self">自研发</el-radio>
            <el-radio value="solution">基于方案</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="产品类目" required>
          <el-select v-model="createForm.category" placeholder="请选择产品类目（需选到最末级）" style="width:100%">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>

        <el-form-item label="产品名称" required>
          <el-input v-model="createForm.name" placeholder="请输入产品名称" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="产品型号">
          <el-input v-model="createForm.model" placeholder="请输入产品型号" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="产品图">
          <el-upload
            v-model:file-list="imageFileList"
            drag
            :auto-upload="false"
            :limit="1"
            accept="image/*"
            class="product-image-upload"
            @change="onImageChange"
          >
            <div class="upload-inner">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
                <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
              </svg>
              <div class="upload-text">点击或拖拽产品图上传</div>
              <div class="upload-hint">最多可上传1个文件</div>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="产品描述">
          <el-input v-model="createForm.description" type="textarea" :rows="4" placeholder="请输入产品描述" maxlength="200" show-word-limit />
        </el-form-item>

        <!-- ===== 网络信息 ===== -->
        <div class="drawer-section-title">网络信息</div>

        <el-form-item label="联网方式" required>
          <el-checkbox-group v-model="createForm.netTypes">
            <el-checkbox v-for="t in NET_TYPES" :key="t.value" :value="t.value">{{ t.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="hasWifi" label="是否支持 5GHz">
          <el-radio-group v-model="createForm.supportDualBand">
            <el-radio value="no">否</el-radio>
            <el-radio value="yes">是</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="配网方式" required>
          <el-checkbox-group v-model="createForm.provisioningMethods" @change="syncDefaultProvision">
            <el-checkbox v-for="m in provisionOptions" :key="m.value" :value="m.value">{{ m.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="默认配网方式" required>
          <el-select v-model="createForm.defaultProvisioningMethod" placeholder="请选择默认配网方式" style="width:100%">
            <el-option
              v-for="m in selectedProvisionOptions"
              :key="m.value"
              :label="m.label"
              :value="m.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <div class="drawer-footer-right">
            <el-button :loading="createSubmitting" @click="handleCreateSubmit(false)">保存产品</el-button>
            <el-button type="primary" :loading="createSubmitting" @click="handleCreateSubmit(true)">保存并开发</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// ===== Filters =====
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

function handleSearch() { pagination.page = 1 }
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

// ===== Mock data =====
const productList = ref([
  { id: 0, productId: 'AROMA_001', name: '智能香薰机', category: '香薰机', devMethod: 'standard', sourceCompany: '本公司', status: 'developing', authInfo: '未授权', operator: '张三', company: '本公司', createTime: '2026-09-01', updateTime: '2026-09-05' },
  { id: 1, productId: 'IPC_PRO_001', name: 'IPC Pro 智能摄像机', category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '本公司', status: 'published', authInfo: '已授权 3/5', operator: '张三', company: '本公司', createTime: '2026-01-15', updateTime: '2026-05-20' },
  { id: 2, productId: 'DOORBELL_001', name: '智能门铃 Pro', category: '智能门铃', devMethod: 'custom', sourceCompany: '本公司', status: 'developing', authInfo: '未授权', operator: '李四', company: '本公司', createTime: '2026-03-01', updateTime: '2026-05-18' },
  { id: 3, productId: 'SENSOR_001', name: '烟感传感器', category: '传感安防', devMethod: 'standard', sourceCompany: '合作企业A', status: 'referenced', authInfo: '只读引用', operator: '王五', company: '合作企业A', createTime: '2026-02-10', updateTime: '2026-04-01' },
  { id: 4, productId: 'IPC_LITE_001', name: 'IPC Lite 室内摄像机', category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '本公司', status: 'publishing', authInfo: '已授权 2/3', operator: '赵六', company: '本公司', createTime: '2026-04-10', updateTime: '2026-05-22' },
  { id: 5, productId: 'LOCK_001', name: '智能门锁 T1', category: '智能门铃', devMethod: 'custom', sourceCompany: '合作企业B', status: 'developing', authInfo: '未授权', operator: '孙七', company: '合作企业B', createTime: '2026-04-20', updateTime: '2026-05-19' },
  { id: 6, productId: 'ALARM_001', name: '安防告警套装', category: '传感安防', devMethod: 'standard', sourceCompany: '本公司', status: 'published', authInfo: '已授权 5/5', operator: '张三', company: '本公司', createTime: '2026-01-20', updateTime: '2026-05-21' },
  { id: 7, productId: 'CAM_OUT_001', name: '户外球机', category: 'IPC摄像机', devMethod: 'standard', sourceCompany: '合作企业C', status: 'referenced', authInfo: '只读引用', operator: '周八', company: '合作企业C', createTime: '2026-03-15', updateTime: '2026-03-15' },
  { id: 8, productId: 'IPC_AI_001', name: 'AI 智能分析摄像机', category: 'IPC摄像机', devMethod: 'custom', sourceCompany: '本公司', status: 'developing', authInfo: '未授权', operator: '李四', company: '本公司', createTime: '2026-05-01', updateTime: '2026-05-23' },
  { id: 9, productId: 'BELL_002', name: '可视门铃 Mini', category: '智能门铃', devMethod: 'standard', sourceCompany: '本公司', status: 'published', authInfo: '已授权 1/2', operator: '赵六', company: '本公司', createTime: '2026-02-28', updateTime: '2026-05-17' },
  { id: 10, productId: 'GAS_001', name: '燃气泄漏检测器', category: '传感安防', devMethod: 'standard', sourceCompany: '本公司', status: 'publishing', authInfo: '已授权 4/5', operator: '张三', company: '本公司', createTime: '2026-04-05', updateTime: '2026-05-24' },
  { id: 11, productId: 'IPC_5G_001', name: '5G 超高清摄像机', category: 'IPC摄像机', devMethod: 'custom', sourceCompany: '本公司', status: 'developing', authInfo: '未授权', operator: '孙七', company: '本公司', createTime: '2026-05-10', updateTime: '2026-05-25' },
  { id: 12, productId: 'DOOR_002', name: '智能门磁传感器', category: '传感安防', devMethod: 'standard', sourceCompany: '合作企业A', status: 'referenced', authInfo: '只读引用', operator: '王五', company: '合作企业A', createTime: '2026-03-20', updateTime: '2026-03-20' }
])

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

const pagination = reactive({ page: 1, pageSize: 10 })
const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const statusMap = { developing: '开发中', publishing: '发布中', published: '已发布', referenced: '引用产品' }
const statusClsMap = { developing: 's-dev', publishing: 's-pubing', published: 's-pubed', referenced: 's-ref' }
const devMethodMap = { standard: '标准开发', custom: '自定义开发' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }
function devMethodLabel(m) { return devMethodMap[m] || m }

// ===== Create product =====
const createDialogVisible = ref(false)
const createForm = reactive({
  company: '',
  devMethod: 'self',
  category: '',
  name: '',
  model: '',
  description: '',
  // 网络信息
  netTypes: ['wifi'],
  supportDualBand: 'no',
  provisioningMethods: ['ap'],
  defaultProvisioningMethod: 'ap'
})
const createFormRef = ref(null)
const createSubmitting = ref(false)
const imageFileList = ref([])

// ===== 网络信息 =====
const NET_TYPES = [
  { label: '有线', value: 'wired' },
  { label: 'WIFI', value: 'wifi' },
  { label: '移动网络', value: 'cellular' }
]

const PROVISION_ALL = [
  { label: 'AP', value: 'ap' },
  { label: '声音', value: 'sound' },
  { label: 'smartlink', value: 'smartlink' },
  { label: '摄像机识别二维码添加', value: 'qr_camera' },
  { label: '局域网', value: 'lan' },
  { label: 'APP扫码添加', value: 'qr_app' },
  { label: '蓝牙添加', value: 'ble' }
]

// 不含 WIFI 时只保留扫码两类
const PROVISION_NON_WIFI = [
  { label: '扫描机身二维码', value: 'qr_app' },
  { label: '摄像头扫码', value: 'qr_camera' }
]

const hasWifi = computed(() => createForm.netTypes.includes('wifi'))
const provisionOptions = computed(() => (hasWifi.value ? PROVISION_ALL : PROVISION_NON_WIFI))
const selectedProvisionOptions = computed(() =>
  provisionOptions.value.filter(o => createForm.provisioningMethods.includes(o.value))
)

// 默认配网方式必须落在已选配网方式内
function syncDefaultProvision() {
  const allowed = selectedProvisionOptions.value.map(o => o.value)
  if (!allowed.includes(createForm.defaultProvisioningMethod)) {
    createForm.defaultProvisioningMethod = allowed[0] || ''
  }
}

// 联网方式变化 → 收敛配网方式
watch(() => createForm.netTypes.slice(), () => {
  const allowed = provisionOptions.value.map(o => o.value)
  const kept = createForm.provisioningMethods.filter(v => allowed.includes(v))
  if (kept.length) {
    createForm.provisioningMethods = kept
  } else {
    // 不含 WIFI：扫码两类默认全选；含 WIFI：默认 AP
    createForm.provisioningMethods = hasWifi.value ? ['ap'] : allowed.slice()
  }
  if (!hasWifi.value) createForm.supportDualBand = 'no'
  syncDefaultProvision()
}, { immediate: true })

// 企业远程搜索
const ALL_COMPANIES = [
  { label: '深圳市安嘉科技有限公司', value: '0000213ed0cdb8bc' },
  { label: '上海市经纬有限公司', value: 'AFEF9OTA9nl7xlVnW' },
  { label: '深圳市极目视讯技术有限公司', value: '739CSNveI5x6ebjY' },
  { label: '长沙市搬码创新科技有限公司', value: 'CV3vzzdgJWN1vQL' }
]
const companyOptions = ref(ALL_COMPANIES)
function searchCompany(keyword) {
  const k = (keyword || '').trim().toLowerCase()
  companyOptions.value = k
    ? ALL_COMPANIES.filter(c => c.label.toLowerCase().includes(k) || c.value.toLowerCase().includes(k))
    : ALL_COMPANIES
}

function onImageChange() {
  // el-upload 自身维护 file-list，这里只占位
}

function handleCreate() {
  Object.assign(createForm, {
    company: '',
    devMethod: 'self',
    category: '',
    name: '',
    model: '',
    description: '',
    netTypes: ['wifi'],
    supportDualBand: 'no',
    provisioningMethods: ['ap'],
    defaultProvisioningMethod: 'ap'
  })
  imageFileList.value = []
  createDialogVisible.value = true
}
async function handleCreateSubmit(andDevelop = false) {
  if (!createForm.company) { ElMessage.warning('请选择产品归属企业'); return }
  if (!createForm.category) { ElMessage.warning('请选择产品类目'); return }
  if (!createForm.name.trim()) { ElMessage.warning('请输入产品名称'); return }
  if (!createForm.netTypes.length) { ElMessage.warning('请至少选择一种联网方式'); return }
  if (!createForm.provisioningMethods.length) { ElMessage.warning('请至少选择一种配网方式'); return }
  if (!createForm.defaultProvisioningMethod) { ElMessage.warning('请选择默认配网方式'); return }

  createSubmitting.value = true
  try {
    const now = new Date().toISOString().slice(0, 10)
    const createdId = Date.now()
    productList.value.unshift({
      id: createdId,
      productId: createForm.model.trim() || `P${Date.now()}`,
      name: createForm.name.trim(),
      model: createForm.model.trim(),
      category: createForm.category,
      devMethod: createForm.devMethod,
      description: createForm.description.trim(),
      network: {
        types: [...createForm.netTypes],
        supportDualBand: hasWifi.value ? createForm.supportDualBand : 'no',
        provisioningMethods: [...createForm.provisioningMethods],
        defaultProvisioningMethod: createForm.defaultProvisioningMethod
      },
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
    if (andDevelop) router.push({ path: '/product-new/config', query: { id: createdId, name: createForm.name.trim() } })
  } finally {
    createSubmitting.value = false
  }
}

// ===== Actions =====
function handleContinueDev(row) {
  router.push(`/product-new/config?id=${row.productId}&name=${row.name}&category=${row.category}`)
}
function handleManageProduct(row) {
  router.push({ path: '/product-new/audit/detail', query: { productId: row.productId, name: row.name } })
}
function handleAppConfig(row) {
  router.push({ path: '/product-new/config', query: { id: row.productId, name: row.name, category: row.category, step: '2' } })
}
function handleAddFirmware(row) {
  ElMessage.info(`添加固件 - ${row.name}`)
}
function handleCopy(row) {
  const copy = { ...row, id: Date.now(), productId: row.productId + '_COPY', name: row.name + '（副本）' }
  productList.value.unshift(copy)
  ElMessage.success(`已复制产品「${row.name}」`)
}
function handleMore(cmd, row) {
  switch (cmd) {
    case 'copy': handleCopy(row); break
    case 'viewDetail': handleManageProduct(row); break
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

<style scoped>
.cell-name { font-size: 12px; font-weight: 600; color: #0f172a; }
.cell-text { font-size: 12px; color: #475569; }
.cell-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; }
.row-actions { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }

/* ===== 创建产品抽屉 ===== */
.create-product-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
.create-product-drawer :deep(.el-drawer__body) {
  padding: 20px;
  overflow-y: auto;
}
.create-product-drawer :deep(.el-drawer__footer) {
  border-top: 1px solid #f1f5f9;
  padding: 12px 20px;
}

.create-product-drawer :deep(.el-form-item) { align-items: flex-start; }
.create-product-drawer :deep(.el-form-item__label) {
  line-height: 20px;
  padding-top: 5px;
  white-space: normal;
  word-break: break-word;
}
.create-product-drawer :deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  padding-top: 4px;
}
.create-product-drawer :deep(.el-checkbox) { margin-right: 0; }

.drawer-section-title {
  margin: 8px 0 14px;
  padding-left: 10px;
  border-left: 3px solid #0284c7;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}

.product-image-upload { width: 100%; }
.product-image-upload :deep(.el-upload) { width: 100%; }
.product-image-upload :deep(.el-upload-dragger) {
  width: 100%;
  padding: 28px 16px;
  border-radius: 8px;
  border: 1px dashed #dbe2ea;
  background: #fbfcfd;
}
.product-image-upload :deep(.el-upload-dragger:hover) { border-color: #7dd3fc; }

.upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
}
.upload-icon { width: 34px; height: 34px; color: #38bdf8; }
.upload-text { font-size: 13px; color: #475569; }
.upload-hint { font-size: 11px; color: #94a3b8; }

.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.drawer-footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
