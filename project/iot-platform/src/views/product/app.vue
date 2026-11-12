<template>
  <div class="page-container">
    <div class="page-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="page-title">App功能配置</span>
        </template>
      </el-page-header>
      <span class="page-subtitle">{{ productName }} ({{ productId }})</span>
    </div>

    <div class="config-layout">
      <div class="config-sidebar">
        <el-segmented
          v-model="activeTab"
          :options="tabOptions"
          direction="vertical"
          class="module-segmented"
        />
      </div>
      <div class="config-detail card">
        <el-form label-position="right" label-width="140px" class="config-form">

            <!-- Tab 1: 安装指引 -->
            <template v-if="activeTab === 'install'">
              <div class="tab-section">
                <div class="tab-section-header">
                  <span class="tab-section-title">安装指引步骤</span>
                  <el-button type="primary" size="small" @click="addInstallStep">
                    <el-icon><Plus /></el-icon>添加步骤
                  </el-button>
                </div>
                <div v-if="installSteps.length === 0" class="empty-state">暂无安装步骤，点击上方按钮添加</div>
                <div v-else class="step-list">
                  <div v-for="(step, idx) in installSteps" :key="idx" class="step-item">
                    <span class="step-num">{{ idx + 1 }}</span>
                    <el-input v-model="step.title" placeholder="步骤标题" style="width:200px" />
                    <el-input v-model="step.descr" placeholder="步骤描述" style="flex:1" />
                    <el-button size="small" text type="danger" @click="removeInstallStep(idx)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Tab 2: App使用范围 -->
            <template v-if="activeTab === 'scope'">
              <div class="tab-section">
                <div class="config-item">
                  <el-form-item label="指定App">
                    <el-switch v-model="scopeConfig.specifyApp" active-text="仅限指定App使用" inactive-text="不限App" />
                  </el-form-item>
                  <div v-if="scopeConfig.specifyApp" class="scope-extra">
                    <el-form-item label="指定App列表">
                      <el-select v-model="scopeConfig.appList" multiple placeholder="请选择App" style="width:400px">
                        <el-option label="IPC Viewer" value="ipc_viewer" />
                        <el-option label="Smart Home" value="smart_home" />
                        <el-option label="CareCam Pro" value="carecam_pro" />
                        <el-option label="NVR Client" value="nvr_client" />
                      </el-select>
                    </el-form-item>
                  </div>
                </div>
                <div class="config-descr">配置App使用范围后，仅限指定App可以绑定该产品下的设备</div>
              </div>
            </template>

            <!-- Tab 3: 默认配置 -->
            <template v-if="activeTab === 'defaults'">
              <div class="tab-section">
                <div class="config-item">
                  <el-form-item label="默认分辨率">
                    <el-radio-group v-model="defaultConfig.resolution">
                      <el-radio label="uhd">超清 (2K/4K)</el-radio>
                      <el-radio label="sd">标清 (1080P及以下)</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>

                <div class="config-item">
                  <el-form-item label="图片插值">
                    <div class="inline-switch-group">
                      <el-switch v-model="defaultConfig.imageInterp.enabled" size="small" />
                      <span class="switch-label">{{ defaultConfig.imageInterp.enabled ? '开启' : '关闭' }}</span>
                      <template v-if="defaultConfig.imageInterp.enabled">
                        <span class="sub-label">默认尺寸</span>
                        <el-select v-model="defaultConfig.imageInterp.size" size="small" style="width:140px">
                          <el-option label="1920×1080" value="1920x1080" />
                          <el-option label="2560×1440" value="2560x1440" />
                          <el-option label="3840×2160" value="3840x2160" />
                        </el-select>
                      </template>
                    </div>
                  </el-form-item>
                </div>

                <div class="config-item">
                  <el-form-item label="视频插值">
                    <div class="inline-switch-group">
                      <el-switch v-model="defaultConfig.videoInterp" size="small" />
                      <span class="switch-label">{{ defaultConfig.videoInterp ? '开启' : '关闭' }}</span>
                    </div>
                  </el-form-item>
                </div>

                <div class="config-item">
                  <el-form-item label="画面拼接/拆分">
                    <div class="split-wrapper">
                      <div class="inline-switch-group">
                        <el-switch v-model="layoutConfig.enabled" size="small" />
                        <span class="switch-label">{{ layoutConfig.enabled ? '开启' : '关闭' }}</span>
                      </div>

                      <div v-if="layoutConfig.enabled" class="sub-config">
                        <div class="sub-config-row">
                          <span class="sub-config-label">模式</span>
                          <el-radio-group v-model="layoutConfig.mode" size="small">
                            <el-radio label="stitch">拼接</el-radio>
                            <el-radio label="split">拆分</el-radio>
                          </el-radio-group>
                        </div>

                        <!-- 拼接：选择拼接路数与参与的 Camera -->
                        <template v-if="layoutConfig.mode === 'stitch'">
                          <div class="sub-config-row">
                            <span class="sub-config-label">拼接路数</span>
                            <el-select
                              :model-value="layoutConfig.stitchCount"
                              size="small"
                              style="width:170px"
                              @update:model-value="setStitchCount"
                            >
                              <el-option v-for="n in stitchCountOptions" :key="n" :label="`${n} 路`" :value="n" />
                            </el-select>
                          </div>
                          <div class="sub-config-row">
                            <span class="sub-config-label">拼接 Camera</span>
                            <el-select
                              v-model="layoutConfig.stitchCameras"
                              multiple
                              collapse-tags
                              :multiple-limit="layoutConfig.stitchCount"
                              placeholder="选择需要拼接的 Camera"
                              size="small"
                              style="width:240px"
                            >
                              <el-option v-for="n in cameraOptions" :key="n" :label="`Camera ${n}`" :value="n" />
                            </el-select>
                          </div>
                          <div class="sub-config-hint ratio-summary">
                            已选 {{ layoutConfig.stitchCameras.length }} / {{ layoutConfig.stitchCount }} 路
                          </div>
                        </template>

                        <!-- 拆分：每条配置一块完整表单 -->
                        <template v-else>
                          <div v-for="(cfg, i) in splitConfigs" :key="cfg.id" class="split-card">
                            <div class="sub-config-row">
                              <span class="sub-config-label">Camera</span>
                              <el-select v-model="cfg.camera" size="small" style="width:170px">
                                <el-option
                                  v-for="n in cameraOptions"
                                  :key="n"
                                  :label="`Camera ${n}`"
                                  :value="n"
                                  :disabled="isCameraUsed(n, cfg.id)"
                                />
                              </el-select>
                              <el-button size="small" text type="danger" class="row-end" @click="removeSplitConfig(i)">删除</el-button>
                            </div>
                            <div class="sub-config-row">
                              <span class="sub-config-label">子画面数量</span>
                              <el-select
                                :model-value="cfg.paneCount"
                                size="small"
                                style="width:170px"
                                @update:model-value="(v) => setPaneCount(cfg, v)"
                              >
                                <el-option v-for="n in paneOptions" :key="n" :label="`${n} 路`" :value="n" />
                              </el-select>
                            </div>
                            <div class="sub-config-row">
                              <span class="sub-config-label">分割点</span>
                              <div class="ratio-list">
                                <span v-for="(v, j) in cfg.splits" :key="j" class="ratio-item">
                                  <el-input-number
                                    v-model="cfg.splits[j]"
                                    :min="1"
                                    :max="99"
                                    :step="1"
                                    size="small"
                                    controls-position="right"
                                    style="width:96px"
                                    @change="normalizeSplits(cfg)"
                                  />
                                  <span class="sub-config-unit">%</span>
                                </span>
                              </div>
                            </div>
                            <div class="sub-config-hint ratio-summary">{{ splitRatioHint(cfg) }}</div>
                          </div>
                          <el-button size="small" class="split-add" @click="addSplitConfig">
                            <el-icon><Plus /></el-icon>添加配置
                          </el-button>
                        </template>
                      </div>

                      <div class="config-descr split-descr">
                        拼接：多路视频流合成为一个画面；拆分：一路视频流按分割点拆分为多个画面。
                      </div>
                    </div>
                  </el-form-item>
                </div>

                <div class="config-item">
                  <el-form-item label="全彩模式时段">
                    <el-radio-group v-model="defaultConfig.fullColorMode">
                      <el-radio label="auto">夜间智能感知</el-radio>
                      <el-radio label="scheduled">定时开启</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>

                <div class="config-item">
                  <el-form-item label="一键报警配置">
                    <el-radio-group v-model="defaultConfig.alarmConfig">
                      <el-radio label="enabled">启用</el-radio>
                      <el-radio label="disabled">禁用</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>

                <div class="config-item">
                  <el-form-item label="假三目设置">
                    <el-radio-group v-model="defaultConfig.fakeTriple">
                      <el-radio label="on">开启</el-radio>
                      <el-radio label="off">关闭</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>

                <div class="config-item">
                  <el-form-item label="灯控开关显示">
                    <el-radio-group v-model="defaultConfig.lightSwitch">
                      <el-radio label="hide">不显示</el-radio>
                      <el-radio label="show">显示</el-radio>
                    </el-radio-group>
                    <template v-if="defaultConfig.lightSwitch === 'show'">
                      <span class="sub-label" style="margin-left:12px">默认时长(秒)</span>
                      <el-input-number
                        v-model="defaultConfig.lightDuration"
                        :min="5"
                        :max="300"
                        :step="5"
                        size="small"
                        style="width:120px;margin-left:8px"
                      />
                    </template>
                  </el-form-item>
                </div>

                <div class="config-item">
                  <el-form-item label="低电量保护策略">
                    <div class="policy-wrapper">
                      <div class="inline-switch-group">
                        <el-switch v-model="defaultConfig.lowBatteryPolicy.enabled" size="small" />
                        <span class="switch-label">{{ defaultConfig.lowBatteryPolicy.enabled ? '开启' : '关闭' }}</span>
                      </div>
                      <template v-if="defaultConfig.lowBatteryPolicy.enabled">
                        <div class="policy-extra">
                          <div class="policy-row">
                            <span class="policy-label">低电量阈值</span>
                            <el-input-number
                              v-model="defaultConfig.lowBatteryPolicy.threshold"
                              :min="1"
                              :max="100"
                              size="small"
                              style="width:100px"
                            />
                            <span class="policy-unit">%</span>
                            <span class="policy-hint">低于此电量将禁用所选功能</span>
                          </div>
                          <div class="policy-row">
                            <span class="policy-label">禁用功能</span>
                            <el-checkbox-group v-model="defaultConfig.lowBatteryPolicy.disabledFeatures" class="policy-checkbox-group">
                              <el-checkbox label="ptz">PTZ控制</el-checkbox>
                              <el-checkbox label="talk">语音对讲</el-checkbox>
                              <el-checkbox label="call">一键呼叫</el-checkbox>
                            </el-checkbox-group>
                          </div>
                        </div>
                      </template>
                    </div>
                  </el-form-item>
                </div>

              </div>
            </template>

          </el-form>

        <!-- 保存按钮 -->
        <div class="save-bar">
          <el-button type="primary" @click="handleSave">保存配置</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const productId = computed(() => route.query.productId || '')
const productName = computed(() => route.query.name || '')

const tabOptions = [
  { label: '安装指引', value: 'install' },
  { label: 'App使用范围', value: 'scope' },
  { label: '默认配置', value: 'defaults' }
]

const activeTab = ref('install')

// ===== 安装指引 =====
const installSteps = ref([
  { title: '下载App', descr: '扫描二维码或在应用商店搜索下载对应App' },
  { title: '注册账号', descr: '打开App使用手机号注册并登录' },
  { title: '添加设备', descr: '点击右上角"+"按钮，扫描设备二维码添加设备' }
])

function addInstallStep() {
  installSteps.value.push({ title: '', descr: '' })
}
function removeInstallStep(idx) {
  installSteps.value.splice(idx, 1)
}

// ===== App使用范围 =====
const scopeConfig = reactive({
  specifyApp: false,
  appList: []
})

// ===== 默认配置 =====
const defaultConfig = reactive({
  resolution: 'uhd',
  imageInterp: { enabled: true, size: '1920x1080' },
  videoInterp: true,
  fullColorMode: 'auto',
  alarmConfig: 'enabled',
  fakeTriple: 'off',
  lightSwitch: 'show',
  lightDuration: 60,
  lowBatteryPolicy: {
    enabled: false,
    threshold: 20,
    disabledFeatures: []
  }
})

// ===== 画面合分配置（按 Camera 维度）=====
const paneOptions = [2, 3, 4]
const CN_NUM = ['一', '二', '三', '四']

// Camera 编号 0~6
const cameraOptions = Array.from({ length: 7 }, (_, i) => i)
// 拼接路数 1~7，上限不超过可选 Camera 数量
const stitchCountOptions = cameraOptions.map(n => n + 1)

// 按画面数生成均分的分割点，如 3 路 → [33, 66]
function evenSplits(count) {
  const arr = []
  for (let i = 1; i < count; i++) arr.push(Math.round((100 / count) * i))
  return arr
}

function newSplitConfig(camera) {
  return {
    id: Date.now() + Math.random(),
    camera,
    paneCount: 2,
    splits: evenSplits(2)
  }
}

const layoutConfig = reactive({
  enabled: false,
  mode: 'split',
  stitchCount: 2,
  stitchCameras: []
})

const splitConfigs = ref([newSplitConfig(0)])

// 该 Camera 编号是否已被其他配置占用
function isCameraUsed(num, exceptId) {
  return splitConfigs.value.some(c => c.id !== exceptId && c.camera === num)
}

function nextCameraNumber() {
  const used = splitConfigs.value.map(c => c.camera)
  for (const n of cameraOptions) if (!used.includes(n)) return n
  return 0
}

function addSplitConfig() {
  if (splitConfigs.value.length >= 4) {
    ElMessage.warning('最多添加 4 个拆分配置')
    return
  }
  splitConfigs.value.push(newSplitConfig(nextCameraNumber()))
}

function removeSplitConfig(idx) {
  if (splitConfigs.value.length <= 1) {
    ElMessage.warning('至少保留一个拆分配置')
    return
  }
  splitConfigs.value.splice(idx, 1)
}

// 拼接路数变化：多选上限跟随，超出部分截断
function setStitchCount(n) {
  layoutConfig.stitchCount = n
  if (layoutConfig.stitchCameras.length > n) {
    layoutConfig.stitchCameras = layoutConfig.stitchCameras.slice(0, n)
  }
}

function setPaneCount(cfg, n) {
  cfg.paneCount = n
  cfg.splits = evenSplits(n)
}

// 保证分割点递增、且后续还有空间，始终落在 1~99
function normalizeSplits(cfg) {
  if (!cfg) return
  const len = cfg.splits.length
  const next = []
  cfg.splits.forEach((v, i) => {
    const min = i === 0 ? 1 : next[i - 1] + 1
    const max = 99 - (len - 1 - i)
    const val = Number(v) || min
    next.push(Math.min(max, Math.max(min, Math.round(val))))
  })
  cfg.splits = next
}

// 分割点 → 每个子画面的占比
function splitRatioHint(cfg) {
  if (!cfg) return ''
  const bounds = [0, ...cfg.splits, 100]
  const parts = []
  for (let i = 0; i < bounds.length - 1; i++) {
    parts.push(`画面${CN_NUM[i]} ${bounds[i + 1] - bounds[i]}%`)
  }
  return parts.join('，')
}

// ===== Actions =====
function handleSave() {
  if (layoutConfig.enabled && layoutConfig.mode === 'stitch'
    && layoutConfig.stitchCameras.length !== layoutConfig.stitchCount) {
    ElMessage.warning(`请选择 ${layoutConfig.stitchCount} 个 Camera 参与拼接`)
    return
  }
  const tabLabel = tabOptions.find(t => t.value === activeTab.value)?.label || ''
  ElMessage.success(`${tabLabel}配置已保存`)
}

function goBack() {
  router.back()
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.config-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.config-sidebar {
  flex-shrink: 0;
  width: 140px;
}

.module-segmented {
  background: #fff;
  border-radius: 6px;
  padding: 4px;
  width: 100%;
  box-shadow: var(--box-shadow-light, 0 1px 4px rgba(0,0,0,.06));
  :deep(.el-segmented__group) { width: 100%; }
  :deep(.el-segmented) { background: transparent; }
  :deep(.el-segmented__item) {
    padding: 11px 14px;
    justify-content: center;
    font-size: 14px;
    text-align: center;
    border-radius: 4px;
    color: #606266;
    transition: all .2s;
    margin-bottom: 2px;
    &:last-child { margin-bottom: 0; }
    &:hover { color: #4992FE; }
    &.is-selected {
      background: #4992FE;
      color: #fff;
      border-radius: 4px;
    }
  }
}

.config-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 480px;
  padding: var(--spacing-lg);
}

.tab-section {
  padding: 4px 0;
}

.config-item {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-lighter);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.config-descr {
  font-size: 13px;
  color: var(--text-placeholder);
  margin-top: -8px;
  padding-bottom: 4px;
}

.tab-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.tab-section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.config-form {
  :deep(.el-form-item) { margin-bottom: 20px; }
  :deep(.el-form-item__label) {
    color: var(--text-regular);
    font-weight: 400;
    font-size: 14px;
  }
  :deep(.el-radio) { margin-right: 24px; }
  :deep(.el-form-item:last-child) { margin-bottom: 0; }
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.inline-switch-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.switch-label {
  font-size: 13px;
  color: var(--text-regular);
}
.sub-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.scope-extra {
  margin-top: -8px;
}

.unit-text {
  margin-left: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.form-tip {
  font-size: 13px;
  color: var(--text-placeholder);
}

.form-tip-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-placeholder);
  width: 100%;
}

.save-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border-lighter);
  margin-top: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-placeholder);
  font-size: 14px;
}

// ===== 分屏显示 =====
.split-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--gray-50);
  border-radius: 6px;
}

.sub-config-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-config-label {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 100px;
}

.sub-config-unit {
  font-size: 13px;
  color: var(--text-secondary);
}

.sub-config-hint {
  font-size: 12px;
  color: var(--text-placeholder);
  margin-left: 4px;
}

.split-descr {
  margin-top: 0;
}

.ratio-list {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.ratio-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ratio-summary {
  margin-left: 0;
}

.split-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
}

.split-add {
  align-self: flex-start;
}

.row-end {
  margin-left: auto;
}


// ===== 低电量保护策略 =====
.policy-extra {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--gray-50);
  border-radius: 6px;
}

.policy-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.policy-label {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 70px;
}

.policy-unit {
  font-size: 13px;
  color: var(--text-secondary);
}

.policy-hint {
  font-size: 12px;
  color: var(--text-placeholder);
  margin-left: 4px;
}

.policy-checkbox-group {
  display: flex;
  gap: 16px;
}
</style>
