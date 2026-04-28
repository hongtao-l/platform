<template>
  <div class="product-config-page">
    <!-- 面包屑导航 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/product' }">产品管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ productName }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 功能点列表 -->
    <div class="func-list card">
      <div class="card-header">
        <span class="card-title">已选功能点 ({{ funcList.length }}项)</span>
        <el-button type="primary" @click="handleAddFunc">
          <el-icon><Plus /></el-icon>
          添加功能
        </el-button>
      </div>

      <el-table :data="funcList" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="module" label="所属模块" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="功能名称" min-width="140">
          <template #default="{ row }">
            <span class="text-primary">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="identifier" label="功能标识" min-width="160">
          <template #default="{ row }">
            <span class="text-muted">{{ row.identifier }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dataType" label="数据类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.dataType === '枚举型' ? '' : row.dataType === '布尔型' ? 'warning' : 'success'" size="small">
              {{ row.dataType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="描述" min-width="180">
          <template #default="{ row }">
            <span class="text-muted">{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEditFunc(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteFunc(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 返回按钮 -->
    <div class="page-footer">
      <el-button @click="handleBack">返回列表</el-button>
    </div>

    <!-- 添加功能点弹窗 -->
    <el-dialog
      v-model="addFuncDialogVisible"
      title="添加标准功能点"
      width="720px"
      :close-on-click-modal="false"
    >
      <!-- 搜索框 -->
      <div class="search-input">
        <el-input
          v-model="funcSearchKeyword"
          placeholder="搜索功能点名称或标识"
          clearable
          @input="handleFuncSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 功能点列表 -->
      <div class="func-grid">
        <div
          v-for="func in filteredStandardFuncs"
          :key="func.identifier"
          class="func-card"
          :class="{
            selected: selectedFuncs.includes(func.identifier),
            disabled: existingFuncIds.includes(func.identifier)
          }"
          @click="toggleFuncSelect(func)"
        >
          <div class="func-checkbox">
            <el-icon v-if="selectedFuncs.includes(func.identifier) || existingFuncIds.includes(func.identifier)">
              <Check />
            </el-icon>
          </div>
          <div class="func-info">
            <div class="func-name">{{ func.name }}</div>
            <div class="func-meta">
              <span>标识: {{ func.identifier }}</span>
              <span>类型: {{ func.dataType }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 已选择提示 -->
      <div class="selected-tip">
        已选择: {{ selectedFuncs.length }} 个功能点
        <span v-if="selectedFuncs.length > 0">
          ({{ getSelectedFuncNames() }})
        </span>
      </div>

      <template #footer>
        <el-button @click="addFuncDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddFunc">确定添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑功能点抽屉 -->
    <el-drawer
      v-model="editDrawerVisible"
      :title="'编辑功能点 - ' + editingFunc?.name"
      size="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="80px"
        label-position="top"
      >
        <el-form-item label="功能名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入功能名称" />
        </el-form-item>

        <el-form-item label="功能标识">
          <el-input v-model="editForm.identifier" disabled />
          <div class="form-hint">功能点唯一标识，不可修改</div>
        </el-form-item>

        <el-form-item label="数据类型">
          <el-input v-model="editForm.dataType" disabled />
          <div class="form-hint">根据标准功能定义，不可修改</div>
        </el-form-item>

        <!-- 数值型配置 -->
        <template v-if="editForm.dataType === '数值型'">
          <el-divider content-position="left">数值配置</el-divider>
          <div class="enum-config-tip">
            <el-icon><InfoFilled /></el-icon>
            取值范围、步长及默认值配置将影响APP的面板功能
          </div>
          <div class="number-config">
            <el-form-item label="数值范围">
              <div class="range-input-group">
                <el-input-number
                  v-model="editForm.numberConfig.minValue"
                  placeholder="最小值"
                  controls-position="right"
                  style="width: 120px"
                />
                <span class="range-separator">-</span>
                <el-input-number
                  v-model="editForm.numberConfig.maxValue"
                  placeholder="最大值"
                  controls-position="right"
                  style="width: 120px"
                />
              </div>
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="步长">
                  <el-input-number
                    v-model="editForm.numberConfig.step"
                    :min="0.1"
                    :precision="1"
                    controls-position="right"
                    placeholder="请输入步长"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单位">
                  <el-input
                    v-model="editForm.numberConfig.unit"
                    placeholder="如：%、秒、帧等"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="默认值">
              <el-input-number
                v-model="editForm.numberConfig.defaultValue"
                :min="editForm.numberConfig.minValue"
                :max="editForm.numberConfig.maxValue"
                :step="editForm.numberConfig.step"
                controls-position="right"
                placeholder="请输入默认值"
                style="width: 100%"
              />
              <div class="form-hint">默认值需在取值范围内</div>
            </el-form-item>
          </div>
        </template>

        <!-- 布尔型配置 -->
        <template v-if="editForm.dataType === '布尔型'">
          <el-divider content-position="left">布尔配置</el-divider>
          <div class="enum-config-tip">
            <el-icon><InfoFilled /></el-icon>
            默认值配置将影响APP的面板功能
          </div>
          <div class="bool-config">
            <el-form-item label="默认值">
              <div class="bool-list">
                <div
                  class="bool-item"
                  :class="{ selected: editForm.boolConfig.defaultValue === true }"
                  @click="editForm.boolConfig.defaultValue = true"
                >
                  <div class="bool-checkbox">
                    <el-icon v-if="editForm.boolConfig.defaultValue === true">
                      <Check />
                    </el-icon>
                  </div>
                  <span class="bool-label">true</span>
                  <span class="bool-desc">开启</span>
                </div>
                <div
                  class="bool-item"
                  :class="{ selected: editForm.boolConfig.defaultValue === false }"
                  @click="editForm.boolConfig.defaultValue = false"
                >
                  <div class="bool-checkbox">
                    <el-icon v-if="editForm.boolConfig.defaultValue === false">
                      <Check />
                    </el-icon>
                  </div>
                  <span class="bool-label">false</span>
                  <span class="bool-desc">关闭</span>
                </div>
              </div>
              <div class="form-hint">设置APP端该功能的默认状态</div>
            </el-form-item>
          </div>
        </template>

        <!-- 枚举值配置 -->
        <template v-if="editForm.dataType === '枚举型'">
          <el-divider content-position="left">枚举值配置</el-divider>
          <div class="enum-config-tip">
            <el-icon><InfoFilled /></el-icon>
            默认值及描述配置将影响APP的面板功能
          </div>
          <div class="enum-list">
            <div
              v-for="(item, index) in editForm.enumValues"
              :key="index"
              class="enum-item"
              :class="{ disabled: !item.enabled }"
            >
              <!-- 启用/禁用复选框 -->
              <el-checkbox
                v-model="item.enabled"
                @change="handleEnumEnableChange(index)"
              />
              <el-input v-model="item.value" disabled style="width: 60px" />
              <el-input 
                v-model="item.label" 
                placeholder="描述（APP显示）" 
                style="flex: 1" 
                :disabled="!item.enabled" 
              />
              <!-- 设为默认 -->
              <template v-if="item.enabled && !item.disabledDefault">
                <el-tag
                  v-if="item.isDefault"
                  type="success"
                  size="small"
                  effect="dark"
                >
                  默认值
                </el-tag>
                <el-button
                  v-else
                  type="primary"
                  link
                  size="small"
                  @click="setDefaultEnum(index)"
                >
                  设为默认
                </el-button>
              </template>
            </div>
          </div>

          <!-- AOV模式配置 -->
          <template v-if="editForm.identifier === 'work_mode' && getSelectedEnumValue() === '1'">
            <el-divider content-position="left">AOV模式配置</el-divider>
            <div class="extra-config">
              <el-form-item label="低功耗模式电量阈值">
                <el-input-number
                  v-model="editForm.enumValues[1].aovConfig.powerThreshold"
                  :min="0"
                  :max="100"
                  placeholder="请输入百分比"
                  style="width: 100%"
                />
                <div class="form-hint">单位：百分比（%）</div>
              </el-form-item>
              <el-form-item label="拍照帧率">
                <el-input-number
                  v-model="editForm.enumValues[1].aovConfig.frameRate"
                  :min="0"
                  placeholder="请输入帧率"
                  style="width: 100%"
                />
                <div class="form-hint">单位：秒/帧</div>
              </el-form-item>
            </div>
          </template>

          <!-- 长电模式配置 -->
          <template v-if="editForm.identifier === 'work_mode' && getSelectedEnumValue() === '2'">
            <el-divider content-position="left">长电模式配置</el-divider>
            <div class="extra-config">
              <el-form-item label="低功耗模式电量阈值">
                <el-input-number
                  v-model="editForm.enumValues[2].longPowerConfig.powerThreshold"
                  :min="0"
                  :max="100"
                  placeholder="请输入百分比"
                  style="width: 100%"
                />
                <div class="form-hint">单位：百分比（%）</div>
              </el-form-item>
            </div>
          </template>

          <!-- 事件录制 - 仅图片配置 -->
          <template v-if="editForm.identifier === 'event_record' && getSelectedEnumValue() === '0'">
            <el-divider content-position="left">仅图片配置</el-divider>
            <div class="extra-config">
              <el-form-item label="抓图间隔">
                <el-input-number
                  v-model="editForm.enumValues[0].imageConfig.captureInterval"
                  :min="0"
                  placeholder="请输入抓图间隔"
                  style="width: 100%"
                />
                <div class="form-hint">单位：毫秒（ms）</div>
              </el-form-item>
            </div>
          </template>

          <!-- 事件录制 - 仅视频配置 -->
          <template v-if="editForm.identifier === 'event_record' && getSelectedEnumValue() === '1'">
            <el-divider content-position="left">仅视频配置</el-divider>
            <div class="extra-config">
              <el-form-item label="录制时长">
                <el-input-number
                  v-model="editForm.enumValues[1].videoConfig.recordDuration"
                  :min="0"
                  placeholder="请输入录制时长"
                  style="width: 100%"
                />
                <div class="form-hint">单位：秒（s）</div>
              </el-form-item>
              <el-form-item label="是否允许设备终止">
                <el-switch
                  v-model="editForm.enumValues[1].videoConfig.allowDeviceTerminate"
                  active-text="允许"
                  inactive-text="不允许"
                />
              </el-form-item>
            </div>
          </template>

          <!-- 事件录制 - 图片和视频配置 -->
          <template v-if="editForm.identifier === 'event_record' && getSelectedEnumValue() === '2'">
            <el-divider content-position="left">图片和视频配置</el-divider>
            <div class="extra-config">
              <el-form-item label="抓图间隔">
                <el-input-number
                  v-model="editForm.enumValues[2].bothConfig.captureInterval"
                  :min="0"
                  placeholder="请输入抓图间隔"
                  style="width: 100%"
                />
                <div class="form-hint">单位：毫秒（ms）</div>
              </el-form-item>
              <el-form-item label="录制时长">
                <el-input-number
                  v-model="editForm.enumValues[2].bothConfig.recordDuration"
                  :min="0"
                  placeholder="请输入录制时长"
                  style="width: 100%"
                />
                <div class="form-hint">单位：秒（s）</div>
              </el-form-item>
              <el-form-item label="是否允许设备终止">
                <el-switch
                  v-model="editForm.enumValues[2].bothConfig.allowDeviceTerminate"
                  active-text="允许"
                  inactive-text="不允许"
                />
              </el-form-item>
            </div>
          </template>
        </template>

        <el-divider content-position="left">备注</el-divider>
        <el-form-item>
          <el-input
            v-model="editForm.remark"
            type="textarea"
            :rows="3"
            placeholder="非必填，可记录功能点说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditFunc">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Search, Check, Close, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 产品名称
const productName = ref(route.query.name || '产品配置')

// 功能点列表
const funcList = ref([
  // 工作模式模块
  {
    id: 1,
    name: '工作模式',
    identifier: 'work_mode',
    module: '工作模式',
    dataType: '枚举型',
    enumValues: [
      { value: '0', label: '低功耗模式', isDefault: false, enabled: true },
      { value: '1', label: 'AOV模式', isDefault: false, enabled: true, aovConfig: { powerThreshold: '', frameRate: '' } },
      { value: '2', label: '长电模式', isDefault: false, enabled: true, longPowerConfig: { powerThreshold: '' } },
      { value: '3', label: '自定义模式', isDefault: false, enabled: true, disabledDefault: true }
    ],
    remark: '设备工作模式切换'
  },
  {
    id: 8,
    name: 'AOV自动切换低功耗电量',
    identifier: 'aov_auto_switch_power',
    module: '工作模式',
    dataType: '数值型',
    numberConfig: {
      minValue: 0,
      maxValue: 100,
      step: 1,
      unit: '%',
      defaultValue: 30
    },
    remark: 'AOV模式下自动切换到低功耗模式的电量阈值'
  },
  {
    id: 9,
    name: 'AOV模式拍照帧率',
    identifier: 'aov_capture_frame_rate',
    module: '工作模式',
    dataType: '数值型',
    numberConfig: {
      minValue: 1,
      maxValue: 10,
      step: 1,
      unit: '秒/帧',
      defaultValue: 1
    },
    remark: 'AOV模式下的拍照帧率间隔'
  },
  {
    id: 10,
    name: '长电自动切换低功耗电量',
    identifier: 'long_power_auto_switch_power',
    module: '工作模式',
    dataType: '数值型',
    numberConfig: {
      minValue: 0,
      maxValue: 100,
      step: 1,
      unit: '%',
      defaultValue: 20
    },
    remark: '长电模式下自动切换到低功耗模式的电量阈值'
  },
  // 录制模式模块
  {
    id: 2,
    name: '常规录制',
    identifier: 'normal_record',
    module: '录制模式',
    dataType: '枚举型',
    enumValues: [
      { value: '0', label: '全天', isDefault: false, enabled: true },
      { value: '1', label: '自定义时段', isDefault: false, enabled: true },
      { value: '2', label: '关闭', isDefault: false, enabled: true }
    ],
    remark: '常规录制模式设置'
  },
  {
    id: 3,
    name: '事件录制',
    identifier: 'event_record',
    module: '录制模式',
    dataType: '布尔型',
    boolConfig: {
      defaultValue: true
    },
    remark: '是否开启事件触发录制'
  },
  {
    id: 5,
    name: '录制媒体模式',
    identifier: 'record_media_mode',
    module: '录制模式',
    dataType: '枚举型',
    enumValues: [
      { value: '0', label: '仅图片', isDefault: false, enabled: true },
      { value: '1', label: '仅视频', isDefault: false, enabled: true },
      { value: '2', label: '图片+视频', isDefault: false, enabled: true }
    ],
    remark: '录制媒体类型选择'
  },
  {
    id: 6,
    name: '录制清晰度',
    identifier: 'record_resolution',
    module: '录制模式',
    dataType: '枚举型',
    enumValues: [
      { value: '0', label: '超清', isDefault: false, enabled: true },
      { value: '1', label: '高清', isDefault: false, enabled: true },
      { value: '2', label: '标清', isDefault: false, enabled: true }
    ],
    remark: '录制视频清晰度选择'
  },
  {
    id: 7,
    name: '抓拍清晰度',
    identifier: 'capture_resolution',
    module: '录制模式',
    dataType: '枚举型',
    enumValues: [
      { value: '0', label: '小图', isDefault: false, enabled: true },
      { value: '1', label: '中图', isDefault: false, enabled: true },
      { value: '2', label: '大图', isDefault: false, enabled: true }
    ],
    remark: '抓拍图片清晰度选择'
  },
  {
    id: 11,
    name: '抓拍间隔',
    identifier: 'capture_interval',
    module: '录制模式',
    dataType: '数值型',
    numberConfig: {
      minValue: 100,
      maxValue: 10000,
      step: 100,
      unit: 'ms',
      defaultValue: 500
    },
    remark: '事件触发时抓拍图片的时间间隔'
  },
  {
    id: 12,
    name: '事件录制时长',
    identifier: 'event_record_duration',
    module: '录制模式',
    dataType: '数值型',
    numberConfig: {
      minValue: 5,
      maxValue: 300,
      step: 5,
      unit: '秒',
      defaultValue: 30
    },
    remark: '事件触发时录制的视频时长'
  },
  {
    id: 13,
    name: '自动结束事件录制开关',
    identifier: 'auto_end_event_record',
    module: '录制模式',
    dataType: '布尔型',
    boolConfig: {
      defaultValue: true
    },
    remark: '是否允许设备自动结束事件录制'
  },
  // 灯光模式模块
  {
    id: 4,
    name: '灯光模式',
    identifier: 'light_mode',
    module: '灯光模式',
    dataType: '枚举型',
    enumValues: [
      { value: '0', label: '全彩模式', isDefault: false, enabled: true },
      { value: '1', label: '红外模式', isDefault: true, enabled: true },
      { value: '2', label: '智能模式', isDefault: false, enabled: true },
      { value: '3', label: '自定义模式', isDefault: false, enabled: true, disabledDefault: true },
      { value: '4', label: '关闭', isDefault: false, enabled: true }
    ],
    remark: '支持全彩/红外/智能/自定义/关闭'
  }
])

// 已存在的功能ID列表
const existingFuncIds = computed(() => funcList.value.map(f => f.identifier))

// 标准功能点库
const standardFuncs = ref([
  // 工作模式模块
  { name: '工作模式', identifier: 'work_mode', module: '工作模式', dataType: '枚举型' },
  { name: 'AOV自动切换低功耗电量', identifier: 'aov_auto_switch_power', module: '工作模式', dataType: '数值型' },
  { name: 'AOV模式拍照帧率', identifier: 'aov_capture_frame_rate', module: '工作模式', dataType: '数值型' },
  { name: '长电自动切换低功耗电量', identifier: 'long_power_auto_switch_power', module: '工作模式', dataType: '数值型' },
  // 录制模式模块
  { name: '常规录制', identifier: 'normal_record', module: '录制模式', dataType: '枚举型' },
  { name: '事件录制', identifier: 'event_record', module: '录制模式', dataType: '布尔型' },
  { name: '录制媒体模式', identifier: 'record_media_mode', module: '录制模式', dataType: '枚举型' },
  { name: '录制清晰度', identifier: 'record_resolution', module: '录制模式', dataType: '枚举型' },
  { name: '抓拍清晰度', identifier: 'capture_resolution', module: '录制模式', dataType: '枚举型' },
  { name: '抓拍间隔', identifier: 'capture_interval', module: '录制模式', dataType: '数值型' },
  { name: '事件录制时长', identifier: 'event_record_duration', module: '录制模式', dataType: '数值型' },
  { name: '自动结束事件录制开关', identifier: 'auto_end_event_record', module: '录制模式', dataType: '布尔型' },
  // 灯光模式模块
  { name: '灯光模式', identifier: 'light_mode', module: '灯光模式', dataType: '枚举型' },
  // 其他功能
  { name: '夜视模式', identifier: 'night_vision', module: '其他', dataType: '枚举型' },
  { name: '白光灯', identifier: 'white_light', module: '其他', dataType: '布尔型' },
  { name: '红外灯', identifier: 'infrared_light', module: '其他', dataType: '布尔型' },
  { name: '移动侦测', identifier: 'motion_detect', module: '其他', dataType: '布尔型' },
  { name: '云存储', identifier: 'cloud_storage', module: '其他', dataType: '布尔型' },
  { name: '双向语音', identifier: 'two_way_voice', module: '其他', dataType: '布尔型' },
  { name: '消息推送', identifier: 'msg_push', module: '其他', dataType: '布尔型' },
  { name: '人脸识别', identifier: 'face_recogn', module: '其他', dataType: '枚举型' },
  { name: '声音检测', identifier: 'sound_detect', module: '其他', dataType: '布尔型' }
])

// 添加功能点弹窗
const addFuncDialogVisible = ref(false)
const funcSearchKeyword = ref('')
const selectedFuncs = ref([])

// 过滤后的标准功能点
const filteredStandardFuncs = computed(() => {
  if (!funcSearchKeyword.value) return standardFuncs.value
  const keyword = funcSearchKeyword.value.toLowerCase()
  return standardFuncs.value.filter(func =>
    func.name.toLowerCase().includes(keyword) ||
    func.identifier.toLowerCase().includes(keyword)
  )
})

// 编辑功能点抽屉
const editDrawerVisible = ref(false)
const editingFunc = ref(null)
const editFormRef = ref(null)
const editForm = reactive({
  name: '',
  identifier: '',
  module: '',
  dataType: '',
  enumValues: [],
  numberConfig: {
    minValue: 0,
    maxValue: 100,
    step: 1,
    unit: '',
    defaultValue: 0
  },
  boolConfig: {
    defaultValue: true
  },
  remark: ''
})

// 返回列表
const handleBack = () => {
  router.push('/product')
}

// 打开添加功能点弹窗
const handleAddFunc = () => {
  selectedFuncs.value = []
  funcSearchKeyword.value = ''
  addFuncDialogVisible.value = true
}

// 搜索功能点
const handleFuncSearch = () => {
  // 搜索逻辑已通过 computed 实现
}

// 切换功能点选择
const toggleFuncSelect = (func) => {
  // 已存在的功能点不可选择
  if (existingFuncIds.value.includes(func.identifier)) return

  const index = selectedFuncs.value.indexOf(func.identifier)
  if (index > -1) {
    selectedFuncs.value.splice(index, 1)
  } else {
    selectedFuncs.value.push(func.identifier)
  }
}

// 获取已选择的功能点名称
const getSelectedFuncNames = () => {
  return selectedFuncs.value.map(id => {
    const func = standardFuncs.value.find(f => f.identifier === id)
    return func?.name
  }).filter(Boolean).join('、')
}

// 确认添加功能点
const confirmAddFunc = () => {
  if (selectedFuncs.value.length === 0) {
    ElMessage.warning('请选择要添加的功能点')
    return
  }

  selectedFuncs.value.forEach(identifier => {
    const func = standardFuncs.value.find(f => f.identifier === identifier)
    if (func) {
      funcList.value.push({
        id: Date.now() + Math.random(),
        name: func.name,
        identifier: func.identifier,
        module: func.module,
        dataType: func.dataType,
        enumValues: func.dataType === '枚举型' ? [] : undefined,
        numberConfig: func.dataType === '数值型' ? {
          minValue: 0,
          maxValue: 100,
          step: 1,
          unit: '',
          defaultValue: 0
        } : undefined,
        boolConfig: func.dataType === '布尔型' ? {
          defaultValue: true
        } : undefined,
        remark: ''
      })
    }
  })

  ElMessage.success(`成功添加 ${selectedFuncs.value.length} 个功能点`)
  addFuncDialogVisible.value = false
}

// 编辑功能点
const handleEditFunc = (row) => {
  editingFunc.value = row
  editForm.name = row.name
  editForm.identifier = row.identifier
  editForm.module = row.module
  editForm.dataType = row.dataType
  editForm.enumValues = row.enumValues ? JSON.parse(JSON.stringify(row.enumValues)) : []
  editForm.numberConfig = row.numberConfig ? JSON.parse(JSON.stringify(row.numberConfig)) : {
    minValue: 0,
    maxValue: 100,
    step: 1,
    unit: '',
    defaultValue: 0
  }
  editForm.boolConfig = row.boolConfig ? JSON.parse(JSON.stringify(row.boolConfig)) : {
    defaultValue: true
  }
  editForm.remark = row.remark || ''
  editDrawerVisible.value = true
}

// 设置默认枚举值
const setDefaultEnum = (index) => {
  // 检查是否为禁用默认值的枚举项
  if (editForm.enumValues[index].disabledDefault || !editForm.enumValues[index].enabled) return
  
  editForm.enumValues.forEach((item, i) => {
    item.isDefault = i === index
  })
}

// 获取当前选中的默认枚举值
const getSelectedEnumValue = () => {
  const defaultItem = editForm.enumValues.find(item => item.isDefault)
  return defaultItem?.value || null
}

// 枚举值启用/禁用变化
const handleEnumEnableChange = (index) => {
  const item = editForm.enumValues[index]
  // 如果禁用，且当前是默认值，则清除默认值
  if (!item.enabled && item.isDefault) {
    item.isDefault = false
  }
}

// 保存编辑
const saveEditFunc = () => {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入功能名称')
    return
  }

  // 数值型校验
  if (editForm.dataType === '数值型') {
    if (editForm.numberConfig.minValue >= editForm.numberConfig.maxValue) {
      ElMessage.warning('最小值必须小于最大值')
      return
    }
    if (editForm.numberConfig.defaultValue < editForm.numberConfig.minValue || 
        editForm.numberConfig.defaultValue > editForm.numberConfig.maxValue) {
      ElMessage.warning('默认值必须在取值范围内')
      return
    }
  }

  const func = funcList.value.find(f => f.id === editingFunc.value.id)
  if (func) {
    func.name = editForm.name
    func.module = editForm.module
    func.enumValues = editForm.enumValues
    func.numberConfig = editForm.numberConfig
    func.boolConfig = editForm.boolConfig
    func.remark = editForm.remark
  }

  ElMessage.success('保存成功')
  editDrawerVisible.value = false
}

// 删除功能点
const handleDeleteFunc = (row) => {
  ElMessageBox.confirm(`确定要删除功能点 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = funcList.value.findIndex(f => f.id === row.id)
    if (index > -1) {
      funcList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.product-config-page {
  padding: var(--spacing-lg);
  min-height: calc(100vh - 56px);

  .page-header {
    margin-bottom: var(--spacing-lg);
  }

  .func-list {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-lighter);

      .card-title {
        font-size: var(--font-lg);
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .text-primary {
      color: var(--text-primary);
      font-weight: 500;
    }

    .text-muted {
      color: var(--text-secondary);
    }
  }

  .page-footer {
    margin-top: var(--spacing-lg);
    text-align: right;
  }
}

// 添加功能点弹窗样式
.search-input {
  margin-bottom: var(--spacing-md);
}

.func-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-xs);

  .func-card {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(.disabled) {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
    }

    &.selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }

    &.disabled {
      background: var(--bg-disabled);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .func-checkbox {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: white;
      font-size: 12px;
    }

    &.selected .func-checkbox,
    &.disabled .func-checkbox {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    .func-info {
      flex: 1;

      .func-name {
        font-size: var(--font-md);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .func-meta {
        font-size: var(--font-xs);
        color: var(--text-secondary);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
    }
  }
}

.selected-tip {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: var(--primary-color);
}

// 编辑抽屉样式
.form-hint {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-top: 4px;
}

.enum-config-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--warning-light, #fffbe6);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);

  .el-icon {
    color: var(--warning-color, #faad14);
  }
}

.enum-list {
  .enum-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-page);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-sm);

    &:hover:not(.disabled) {
      background: var(--bg-hover);
    }

    &.disabled {
      opacity: 0.5;

      .el-input {
        cursor: not-allowed;
      }
    }
  }
}

// 额外配置样式
.extra-config {
  padding: var(--spacing-md);
  background: var(--bg-page);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-sm);
}

// 数值型配置样式
.number-config {
  padding: var(--spacing-md);
  background: var(--bg-page);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-sm);

  .range-input-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .range-separator {
      color: var(--text-secondary);
      font-weight: 500;
    }
  }
}

// 布尔型配置样式
.bool-config {
  padding: var(--spacing-md);
  background: var(--bg-page);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-sm);

  .bool-list {
    display: flex;
    gap: var(--spacing-md);

    .bool-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-color);
      }

      &.selected {
        border-color: var(--primary-color);
        background: var(--primary-light);

        .bool-checkbox {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }
      }

      .bool-checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid var(--border-color);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.2s;
      }

      .bool-label {
        font-weight: 500;
        color: var(--text-primary);
        font-family: monospace;
      }

      .bool-desc {
        color: var(--text-secondary);
        font-size: var(--font-sm);
      }
    }
  }
}
</style>
