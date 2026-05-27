<template>
  <div class="page-container config-page">
    <!-- 顶部区域 -->
    <div class="top-bar card">
      <div class="top-left">
        <el-button @click="handleBack" :icon="ArrowLeft">返回产品列表</el-button>
        <span class="product-title">{{ productName }}</span>
        <el-button size="small" text type="primary" @click="handleEditProduct">
          <el-icon><Edit /></el-icon>编辑
        </el-button>
      </div>
      <div class="top-meta">
        <span v-for="m in metaList" :key="m.label" class="meta-item">
          <span class="meta-label">{{ m.label }}</span>
          <span class="meta-value">{{ m.value }}</span>
        </span>
      </div>
    </div>

    <!-- Tab 切换栏 -->
    <div class="tab-bar card" style="margin-top:12px">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Tab 1: 功能定义与配置 -->
    <div v-show="activeTab === 'funcConfig'" class="func-config card" style="margin-top:12px">
      <!-- 设备能力配置选项：左模块列表 + 右配置区 -->
      <div class="config-section">
        <div class="section-title">设备能力配置</div>
        <div class="config-split">
          <!-- 左侧模块列表 -->
          <div class="config-left">
            <div
              v-for="group in configGroups"
              :key="group.key"
              class="config-left-item"
              :class="{ active: selectedGroup === group.key }"
              @click="selectedGroup = group.key"
            >
              <span class="left-item-label">{{ group.label }}</span>
              <el-icon class="left-item-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <!-- 右侧选中模块的配置内容 -->
          <div class="config-right">
            <template v-for="group in configGroups" :key="group.key">
              <div v-show="selectedGroup === group.key" class="config-group-panel">
                <div class="config-right-title">{{ group.label }}</div>
                <div v-for="item in group.items" :key="item.key" class="config-row">
                  <span class="config-label">{{ item.label }}</span>
                  <template v-if="item.type === 'switch'">
                    <el-switch v-model="item.value" size="small" />
                  </template>
                  <template v-else-if="item.type === 'checkbox'">
                    <el-checkbox-group v-model="item.value" size="small">
                      <el-checkbox v-for="opt in item.options" :key="opt" :label="opt" :value="opt" />
                    </el-checkbox-group>
                  </template>
                  <template v-else-if="item.type === 'placeholder'">
                    <span class="placeholder-text">待补充</span>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- 标准能力列表 -->
      <div class="capability-section">
        <div class="panel-header">
          <span class="section-title" style="margin-bottom:0">标准能力列表</span>
          <el-button type="primary" size="small" @click="openCapabilityDialog">
            <el-icon><Plus /></el-icon>添加标准能力
          </el-button>
        </div>
        <el-table v-if="capabilityList.length" :data="capabilityList" stripe>
          <el-table-column label="类型" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="capTypeTag(row.capType)" size="small">{{ capTypeLabel(row.capType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="能力名称" min-width="120">
            <template #default="{ row }">
              <span class="cell-name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数据定义" min-width="200">
            <template #default="{ row }">
              <span class="cell-desc">{{ dataDefSummary(row.dataDef) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="140">
            <template #default="{ row }">
              <span class="cell-desc">{{ row.descr }}</span>
            </template>
          </el-table-column>
          <el-table-column label="所属模块" width="130" align="center">
            <template #default="{ row }">
              <span class="cell-text">{{ row.moduleName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row, $index }">
              <el-button size="small" text type="primary" @click="editCapability(row, $index)">编辑</el-button>
              <el-button size="small" text type="danger" @click="removeCapability($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-state">暂无数据</div>
      </div>
    </div>

    <!-- Tab 2: 算法联动配置 -->
    <div v-show="activeTab === 'algoConfig'" class="card" style="margin-top:12px;overflow:hidden">
      <div class="card-header">
        <span class="card-title">算法联动配置</span>
      </div>
      <el-table :data="algoList" stripe>
        <el-table-column label="ID（AlloTTip）" width="120" align="center">
          <template #default="{ row }">
            <span class="cell-id">{{ row.alloTTip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="算法名称" min-width="160">
          <template #default="{ row }">
            <span class="cell-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="200">
          <template #default="{ row }">
            <span class="cell-desc">{{ row.descr }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否支持" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.supported" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="算法配置" width="100" align="center">
          <template #default="{ row }">
            <el-button size="small" text type="primary" :disabled="!row.supported" @click="openAlgoConfig(row)">
              配置
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="关联事件" width="100" align="center">
          <template #default="{ row }">
            <el-button size="small" text type="primary" :disabled="!row.supported" @click="openEventLink(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openAlgoConfig(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Tab 3: 语音助手 -->
    <div v-show="activeTab === 'voiceConfig'" class="card" style="margin-top:12px;overflow:hidden">
      <div class="card-header">
        <span class="card-title">语音助手</span>
      </div>
      <el-table :data="voiceList" stripe>
        <el-table-column label="AlloTType" width="120" align="center">
          <template #default="{ row }">
            <span class="cell-id">{{ row.alloTType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="语音平台" min-width="160">
          <template #default="{ row }">
            <span class="cell-name">{{ row.platform }}</span>
          </template>
        </el-table-column>
        <el-table-column label="功能描述" min-width="200">
          <template #default="{ row }">
            <span class="cell-desc">{{ row.descr }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否支持" width="120" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.supported" size="small" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部操作按钮 -->
    <div class="bottom-bar">
      <el-button v-if="activeTab !== tabs[0].key" @click="prevTab">上一步</el-button>
      <div class="bottom-right">
        <el-button @click="skipTab">跳过</el-button>
        <el-button v-if="activeTab !== tabs[tabs.length-1].key" type="primary" @click="saveNext">
          保存，下一步
        </el-button>
        <el-button v-else type="primary" @click="finishDev">开发完成</el-button>
      </div>
    </div>

    <!-- 添加标准能力弹窗（穿梭框） -->
    <el-dialog v-model="capDialogVisible" title="添加标准能力" width="780px" top="5vh" :close-on-click-modal="false">
      <el-transfer
        v-model="selectedCapKeys"
        :data="transferData"
        :titles="['能力库', '已选择']"
        :props="{ key: 'key', label: 'label' }"
        filterable
        :filter-method="transferFilter"
        filter-placeholder="搜索能力名称"
        style="display:flex;justify-content:center"
      >
        <template #default="{ option }">
          <div class="transfer-item">
            <el-tag :type="capTypeTag(option.capType)" size="small" style="margin-right:6px">{{ capTypeLabel(option.capType) }}</el-tag>
            <span>{{ option.name }}</span>
            <span class="transfer-meta">{{ option.moduleName }}</span>
          </div>
        </template>
      </el-transfer>
      <template #footer>
        <el-button @click="capDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddCapabilities">确定添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑能力弹窗 -->
    <el-dialog v-model="editCapDialogVisible" title="编辑能力" width="600px" top="5vh" :close-on-click-modal="false">
      <el-form v-if="editingCap" label-width="80px">
        <el-form-item label="能力名称">
          <el-input v-model="editingCap.name" placeholder="请输入能力名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editingCap.descr" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editCapDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditCap">保存</el-button>
      </template>
    </el-dialog>

    <!-- 算法配置弹窗 -->
    <el-dialog v-model="algoConfigVisible" :title="'算法配置 - ' + editingAlgo?.name" width="560px" top="5vh" :close-on-click-modal="false">
      <el-form v-if="editingAlgo" label-width="100px">
        <el-form-item label="算法参数">
          <el-input v-model="editingAlgo.params" type="textarea" :rows="4" placeholder="请输入算法参数配置（JSON格式）" />
        </el-form-item>
        <el-form-item label="阈值设置">
          <el-input-number v-model="editingAlgo.threshold" :min="0" :max="100" placeholder="灵敏度阈值" style="width:200px" />
          <span style="margin-left:8px;color:var(--text-secondary);font-size:13px">%</span>
        </el-form-item>
        <el-form-item label="启用时段">
          <el-select v-model="editingAlgo.timeRange" placeholder="选择时段" style="width:200px">
            <el-option label="全天" value="all" />
            <el-option label="仅白天" value="day" />
            <el-option label="仅夜间" value="night" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="algoConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlgoConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 关联事件弹窗 -->
    <el-dialog v-model="eventLinkVisible" :title="'关联事件 - ' + editingAlgo?.name" width="560px" top="5vh" :close-on-click-modal="false">
      <el-checkbox-group v-if="editingAlgo" v-model="editingAlgo.linkedEvents">
        <div v-for="evt in eventOptions" :key="evt.id" class="event-check-item">
          <el-checkbox :label="evt.id" :value="evt.id">
            <span style="font-weight:500">{{ evt.name }}</span>
            <span style="color:var(--text-secondary);margin-left:8px;font-size:13px">{{ evt.descr }}</span>
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="eventLinkVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEventLink">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, ArrowLeft, Edit, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const productName = ref(route.query.name || '更新后的产品名_987988')
const productId = ref(route.query.id || 'IPC_PRO_001')

// ===== 产品元信息 =====
const metaList = [
  { label: '产品ID', value: productId },
  { label: '产品型号', value: 'IPC-X200' },
  { label: '产品类目', value: 'IPC摄像机' },
  { label: '联网方式', value: 'WiFi / 有线' }
]

// ===== Tab =====
const tabs = [
  { key: 'funcConfig', label: '功能定义与配置' },
  { key: 'algoConfig', label: '算法联动配置' },
  { key: 'voiceConfig', label: '语音助手' }
]
const activeTab = ref('funcConfig')

// ===== Tab 1: 左侧配置项 =====
const configGroups = reactive([
  {
    key: 'network', label: '联网方式',
    items: [
      { key: 'net_wired', label: '有线', type: 'checkbox', value: ['有线'], options: ['有线', 'WiFi', '移动网络', 'AP'] }
    ]
  },
  {
    key: 'intercom', label: '对讲设置',
    items: [
      { key: 'voice', label: '声音', type: 'switch', value: true },
      { key: 'smartink', label: 'Smartink', type: 'switch', value: false },
      { key: 'qr_add', label: '摄像机识别二维码添加', type: 'switch', value: true },
      { key: 'lan', label: '局域网', type: 'switch', value: true },
      { key: 'app_scan', label: 'APP扫码添加', type: 'switch', value: true },
      { key: 'ble_add', label: '蓝牙添加', type: 'switch', value: false }
    ]
  },
  {
    key: 'storage', label: '存储设置',
    items: [{ key: 'storage_cfg', label: '存储配置', type: 'placeholder' }]
  },
  {
    key: 'battery', label: '电池设置',
    items: [{ key: 'battery_cfg', label: '电池配置', type: 'placeholder' }]
  },
  {
    key: 'workMode', label: '工作模式',
    items: [{ key: 'work_mode_cfg', label: '工作模式配置', type: 'placeholder' }]
  },
  {
    key: 'wakeup', label: '唤醒能力',
    items: [{ key: 'wakeup_cfg', label: '唤醒配置', type: 'placeholder' }]
  },
  {
    key: 'ota', label: 'OTA能力',
    items: [{ key: 'ota_cfg', label: 'OTA配置', type: 'placeholder' }]
  },
  {
    key: 'indicator', label: '指示灯',
    items: [{ key: 'indicator_switch', label: '指示灯', type: 'switch', value: true }]
  },
  {
    key: 'alarmRecord', label: '报警录制',
    items: [{ key: 'alarm_record_switch', label: '报警录制', type: 'switch', value: true }]
  },
  {
    key: 'irLight', label: '红外灯',
    items: [{ key: 'ir_light_switch', label: '红外灯', type: 'switch', value: true }]
  }
])

// 默认选中第一个模块
const selectedGroup = ref(configGroups[0].key)

// ===== Tab 1: 右侧能力列表 =====
const capabilityList = ref([
  {
    id: 1, capType: 'prop', name: '工作模式', identifier: 'work_mode',
    descr: '设备工作模式切换（低功耗/AOV/长电/自定义）',
    dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{ name: '低功耗模式', val: 0 }, { name: 'AOV模式', val: 1 }, { name: '长电模式', val: 2 }, { name: '自定义模式', val: 3 }] },
    moduleName: '工作模式模块'
  },
  {
    id: 2, capType: 'prop', name: '灯光模式', identifier: 'light_mode',
    descr: '灯光模式切换（全彩/红外/智能/自定义/关闭）',
    dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{ name: '全彩模式', val: 0 }, { name: '红外模式', val: 1 }, { name: '智能模式', val: 2 }, { name: '自定义模式', val: 3 }, { name: '关闭', val: 4 }] },
    moduleName: '灯光模式模块'
  },
  {
    id: 3, capType: 'prop', name: '常规录制', identifier: 'normal_record',
    descr: '常规录制模式设置（全天/自定义/关闭）',
    dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{ name: '全天', val: 0 }, { name: '自定义时段', val: 1 }, { name: '关闭', val: 2 }] },
    moduleName: '录制模式模块'
  },
  {
    id: 4, capType: 'evt', name: '移动侦测', identifier: 'motion_detect',
    descr: '设备检测到物体移动时上报告警事件',
    dataDef: { dataType: 'event', eventType: 'alarm', outputParams: [] },
    moduleName: '事件侦测模块'
  },
  {
    id: 5, capType: 'svc', name: '格式化存储', identifier: 'format_storage',
    descr: '远程格式化设备存储卡',
    dataDef: { dataType: 'service', inputParams: [], outputParams: [{ name: '操作结果', identifier: 'result', dataType: 'boolean' }] },
    moduleName: '录制模式模块'
  }
])

const capTypeMap = { prop: '属性', svc: '服务', evt: '事件' }
const capTypeTagMap = { prop: '', svc: 'success', evt: 'warning' }
function capTypeLabel(t) { return capTypeMap[t] || t }
function capTypeTag(t) { return capTypeTagMap[t] || '' }

function dataDefSummary(dd) {
  if (!dd) return '—'
  if (dd.dataType === 'enum' && dd.enumValues) return '枚举: ' + dd.enumValues.map(e => e.name).join(' / ')
  if (dd.dataType === 'boolean') return '布尔型'
  if (dd.dataType === 'int') return `整数 (${dd.min || 0}~${dd.max || 100}${dd.unit ? ' ' + dd.unit : ''})`
  if (dd.dataType === 'event') return '事件' + (dd.eventType ? ` (${dd.eventType})` : '')
  if (dd.dataType === 'service') return '服务' + (dd.inputParams?.length || dd.outputParams?.length ? ` (入参${dd.inputParams?.length||0}/出参${dd.outputParams?.length||0})` : '')
  return dd.dataType || '—'
}

// ===== 能力库穿梭框 =====
const capDialogVisible = ref(false)
const selectedCapKeys = ref([])

const libCapabilities = [
  { capType: 'prop', name: '录像开关', identifier: 'record_switch', descr: '控制设备录像功能的启用与关闭', dataDef: { dataType: 'boolean' }, moduleName: '录制模式模块' },
  { capType: 'prop', name: '夜视模式', identifier: 'night_vision', descr: '夜视模式切换（自动/强制/关闭）', dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{ name: '自动', val: 0 }, { name: '强制', val: 1 }, { name: '关闭', val: 2 }] }, moduleName: '基础设置模块' },
  { capType: 'prop', name: '音量控制', identifier: 'volume', descr: '设备扬声器音量调节', dataDef: { dataType: 'int', accessMode: 'rw', min: 0, max: 100, step: 1, unit: '%' }, moduleName: '对讲模块' },
  { capType: 'svc', name: '远程重启', identifier: 'remote_reboot', descr: '远程控制设备重新启动', dataDef: { dataType: 'service', inputParams: [], outputParams: [{ name: '重启结果', identifier: 'result', dataType: 'boolean' }] }, moduleName: '系统管理模块' },
  { capType: 'evt', name: '电量不足告警', identifier: 'low_battery', descr: '设备电量低于阈值时上报', dataDef: { dataType: 'event', eventType: 'alarm', outputParams: [{ name: '当前电量', identifier: 'battery', dataType: 'int', min: 0, max: 100, unit: '%' }] }, moduleName: '事件侦测模块' },
  { capType: 'svc', name: '云台控制', identifier: 'ptz_control', descr: '控制设备云台旋转/倾斜', dataDef: { dataType: 'service', inputParams: [{ name: '方向', identifier: 'direction', dataType: 'enum', enumValues: [{ name: '上', val: 0 }, { name: '下', val: 1 }, { name: '左', val: 2 }, { name: '右', val: 3 }] }], outputParams: [] }, moduleName: '云台模块' },
  { capType: 'prop', name: '人脸识别', identifier: 'face_detect', descr: '是否启用人脸检测与识别功能', dataDef: { dataType: 'boolean' }, moduleName: 'AI算法模块' },
  { capType: 'prop', name: '声音检测', identifier: 'sound_detect', descr: '检测异常声音并触发告警', dataDef: { dataType: 'boolean' }, moduleName: '事件侦测模块' },
  { capType: 'svc', name: '固件升级', identifier: 'firmware_upgrade', descr: '远程触发设备固件OTA升级', dataDef: { dataType: 'service', inputParams: [{ name: '固件URL', identifier: 'firmware_url', dataType: 'string' }], outputParams: [{ name: '升级状态', identifier: 'status', dataType: 'enum', enumValues: [{ name: '成功', val: 0 }, { name: '失败', val: 1 }] }] }, moduleName: '系统管理模块' },
  { capType: 'prop', name: '隐私模式', identifier: 'privacy_mode', descr: '隐私模式开关（关闭摄像头画面）', dataDef: { dataType: 'boolean' }, moduleName: '基础设置模块' }
]

const existingCapIds = computed(() => capabilityList.value.map(c => c.identifier))

const transferData = computed(() =>
  libCapabilities
    .filter(c => !existingCapIds.value.includes(c.identifier))
    .map(c => ({
      key: c.identifier,
      label: `${c.name} [${c.moduleName}]`,
      name: c.name,
      capType: c.capType,
      moduleName: c.moduleName,
      descr: c.descr,
      dataDef: c.dataDef,
      identifier: c.identifier
    }))
)

function transferFilter(query, item) {
  return item.label.toLowerCase().includes(query.toLowerCase())
}

function openCapabilityDialog() {
  selectedCapKeys.value = []
  capDialogVisible.value = true
}

function confirmAddCapabilities() {
  if (!selectedCapKeys.value.length) { ElMessage.warning('请选择要添加的能力'); return }
  selectedCapKeys.value.forEach(key => {
    const c = libCapabilities.find(c => c.identifier === key)
    if (!c) return
    capabilityList.value.push({
      id: Date.now() + Math.random(),
      capType: c.capType, name: c.name, identifier: c.identifier,
      descr: c.descr, dataDef: JSON.parse(JSON.stringify(c.dataDef)),
      moduleName: c.moduleName
    })
  })
  ElMessage.success(`已添加 ${selectedCapKeys.value.length} 项能力`)
  capDialogVisible.value = false
}

// ===== 能力编辑 =====
const editCapDialogVisible = ref(false)
const editingCap = ref(null)
const editingCapIdx = ref(-1)

function editCapability(row, idx) {
  editingCap.value = { name: row.name, descr: row.descr }
  editingCapIdx.value = idx
  editCapDialogVisible.value = true
}

function saveEditCap() {
  const cap = capabilityList.value[editingCapIdx.value]
  if (cap) {
    cap.name = editingCap.value.name
    cap.descr = editingCap.value.descr
  }
  ElMessage.success('已保存')
  editCapDialogVisible.value = false
}

function removeCapability(idx) {
  capabilityList.value.splice(idx, 1)
  ElMessage.success('已删除')
}

// ===== Tab 2: 算法联动配置 =====
const algoList = ref([
  { alloTTip: 1013, name: '事件记录', descr: '记录设备触发的事件', supported: true, params: '', threshold: 50, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1000, name: '人形/运动检测', descr: '检测画面中的人形或移动物体', supported: true, params: '', threshold: 60, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1088, name: '车牌识别', descr: '自动读取并识别车牌信息', supported: false, params: '', threshold: 70, timeRange: 'day', linkedEvents: [] },
  { alloTTip: 1003, name: 'PIR红外检测', descr: '基于红外热释电的人体活动监测', supported: true, params: '', threshold: 40, timeRange: 'night', linkedEvents: [] },
  { alloTTip: 1090, name: '客流统计', descr: '进入/出去行为识别与计数', supported: false, params: '', threshold: 50, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1093, name: '离线监控', descr: '设备断电或离线时的状态监测', supported: true, params: '', threshold: 30, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1095, name: '智能告警-儿童检测', descr: '综合全天候的儿童看护识别', supported: false, params: '', threshold: 60, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1096, name: '智能告警服务', descr: '基于多维参数的综合告警策略', supported: true, params: '', threshold: 50, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1103, name: '智能告警-老人看护', descr: '针对老年用户的异常行为识别', supported: false, params: '', threshold: 60, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1104, name: '智能告警-厨房监测', descr: '全方位监测厨房油烟和火情', supported: true, params: '', threshold: 70, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1105, name: '智能告警-家门检测', descr: '门口落扇、门磁检测等安防预警', supported: true, params: '', threshold: 50, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1106, name: '智能告警-宠物检测', descr: '整合宠物的多项健康活动和活动指标', supported: false, params: '', threshold: 50, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1108, name: 'GPS信息处理', descr: '设备地理位置定位与上报', supported: true, params: '', threshold: 0, timeRange: 'all', linkedEvents: [] },
  { alloTTip: 1109, name: '包裹侦测', descr: '检测门口或指定区域堆放的包裹', supported: false, params: '', threshold: 50, timeRange: 'day', linkedEvents: [] },
  { alloTTip: 1111, name: '鱼类检测', descr: '针对水族箱场景的特征识别', supported: false, params: '', threshold: 40, timeRange: 'all', linkedEvents: [] }
])

const eventOptions = [
  { id: 'evt_motion', name: '移动侦测', descr: '物体移动触发' },
  { id: 'evt_human', name: '人形侦测', descr: '检测到人形触发' },
  { id: 'evt_smoke', name: '烟雾告警', descr: '检测到烟雾触发' },
  { id: 'evt_battery', name: '电量不足', descr: '电量低于阈值触发' },
  { id: 'evt_online', name: '设备上线', descr: '设备从离线变为在线' },
  { id: 'evt_tamper', name: '防拆告警', descr: '设备被拆卸触发' },
  { id: 'evt_sound', name: '声音异常', descr: '检测到异常声音触发' },
  { id: 'evt_water', name: '水浸告警', descr: '检测到水浸触发' }
]

const algoConfigVisible = ref(false)
const editingAlgo = ref(null)

function openAlgoConfig(row) {
  editingAlgo.value = row
  algoConfigVisible.value = true
}

function saveAlgoConfig() {
  ElMessage.success('算法配置已保存')
  algoConfigVisible.value = false
}

const eventLinkVisible = ref(false)

function openEventLink(row) {
  editingAlgo.value = row
  eventLinkVisible.value = true
}

function saveEventLink() {
  ElMessage.success('关联事件已保存')
  eventLinkVisible.value = false
}

// ===== Tab 3: 语音助手 =====
const voiceList = ref([
  { alloTType: 1063, platform: 'ALEXA', descr: 'Amazon Alexa 语音助手，支持语音控制设备基本功能', supported: true },
  { alloTType: 1063, platform: 'GOOGLE_HOME', descr: 'Google Home 语音助手，支持语音控制设备基本功能', supported: false }
])

// ===== 底部导航 =====
const tabKeys = computed(() => tabs.map(t => t.key))

function prevTab() {
  const idx = tabKeys.value.indexOf(activeTab.value)
  if (idx > 0) activeTab.value = tabKeys.value[idx - 1]
}

function skipTab() {
  const idx = tabKeys.value.indexOf(activeTab.value)
  if (idx < tabKeys.value.length - 1) {
    activeTab.value = tabKeys.value[idx + 1]
    ElMessage.info('已跳过当前步骤')
  }
}

function saveNext() {
  const idx = tabKeys.value.indexOf(activeTab.value)
  if (idx < tabKeys.value.length - 1) {
    activeTab.value = tabKeys.value[idx + 1]
    ElMessage.success('已保存，进入下一步')
  }
}

function finishDev() {
  ElMessage.success('产品配置已完成，即将返回产品列表')
  setTimeout(() => router.push('/product/development'), 1200)
}

function handleBack() {
  router.push('/product/development')
}

function handleEditProduct() {
  ElMessage.info('编辑产品基础信息')
}
</script>

<style lang="scss" scoped>
.config-page {
  padding-bottom: 80px;
}

// ===== 顶部 =====
.top-bar {
  padding: 16px var(--spacing-lg);
  .top-left {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    .product-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  .top-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 24px;
    .meta-item {
      font-size: 13px;
      .meta-label { color: var(--text-secondary); margin-right: 6px; }
      .meta-value { color: var(--text-regular); }
    }
  }
}

// ===== Tab 栏 =====
.tab-bar {
  display: flex;
  padding: 0;
  overflow: hidden;
  .tab-item {
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    &:hover { color: var(--primary-color); }
    &.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      background: var(--primary-bg);
    }
  }
}

// ===== 设备能力配置：左模块列表 + 右配置区 =====
.config-section {
  padding: 16px var(--spacing-lg);
  border-bottom: 1px solid var(--border-lighter);
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-lighter);
  }
}

.config-split {
  display: flex;
  gap: 0;
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.config-left {
  width: 180px;
  flex-shrink: 0;
  background: var(--bg-page);
  border-right: 1px solid var(--border-lighter);
}

.config-left-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--text-regular);
  cursor: pointer;
  border-bottom: 1px solid var(--border-lighter);
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--primary-bg); }
  &.active {
    color: var(--primary-color);
    font-weight: 500;
    background: #fff;
    border-right: 2px solid var(--primary-color);
    margin-right: -1px;
  }
  .left-item-arrow {
    font-size: 12px;
    color: var(--text-placeholder);
  }
  &.active .left-item-arrow {
    color: var(--primary-color);
  }
}

.config-right {
  flex: 1;
  min-height: 260px;
  background: #fff;
}

.config-group-panel {
  padding: 16px 20px;
}

.config-right-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-lighter);
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed var(--border-lighter);
  &:last-child { border-bottom: none; }
  .config-label {
    font-size: 13px;
    color: var(--text-regular);
    min-width: 140px;
  }
  .placeholder-text {
    font-size: 12px;
    color: var(--text-placeholder);
  }
}

.capability-section {
  padding: 16px var(--spacing-lg);
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

// ===== 底部栏 =====
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: var(--sidebar-width);
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-lighter);
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
  z-index: 100;
  .bottom-right {
    display: flex;
    gap: 12px;
  }
}

// ===== 通用 =====
.cell-name { font-weight: 500; color: var(--text-primary); font-size: 13px; }
.cell-id { font-size: 13px; color: var(--text-secondary); font-family: monospace; }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
.cell-text { font-size: 13px; color: var(--text-regular); }
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-placeholder);
  font-size: var(--font-md);
}

// ===== 事件关联 =====
.event-check-item {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-lighter);
  &:last-child { border-bottom: none; }
}

// ===== 穿梭框 =====
.transfer-item {
  display: flex;
  align-items: center;
  .transfer-meta {
    margin-left: auto;
    font-size: 12px;
    color: var(--text-placeholder);
  }
}

// 底部栏适配侧边栏宽度（默认220px，侧边栏折叠后由Layout组件控制）
</style>
