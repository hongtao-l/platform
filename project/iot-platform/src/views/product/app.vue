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

    <div class="card app-config-card">
      <div class="config-layout">
        <el-segmented
          v-model="activeTab"
          :options="tabOptions"
          direction="vertical"
          block
          class="module-segmented"
        />
        <div class="config-detail">
          <el-scrollbar height="520px">
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
                  <el-form-item label="说明">
                    <span class="form-tip">配置App使用范围后，仅限指定App可以绑定该产品下的设备</span>
                  </el-form-item>
                </div>
              </template>

              <!-- Tab 3: 默认配置 -->
              <template v-if="activeTab === 'defaults'">
                <div class="tab-section">
                  <el-form-item label="默认分辨率">
                    <el-radio-group v-model="defaultConfig.resolution">
                      <el-radio label="uhd">超清 (2K/4K)</el-radio>
                      <el-radio label="sd">标清 (1080P及以下)</el-radio>
                    </el-radio-group>
                  </el-form-item>

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

                  <el-form-item label="视频插值">
                    <div class="inline-switch-group">
                      <el-switch v-model="defaultConfig.videoInterp" size="small" />
                      <span class="switch-label">{{ defaultConfig.videoInterp ? '开启' : '关闭' }}</span>
                    </div>
                  </el-form-item>

                  <el-form-item label="全彩模式时段">
                    <el-radio-group v-model="defaultConfig.fullColorMode">
                      <el-radio label="auto">夜间智能感知</el-radio>
                      <el-radio label="scheduled">定时开启</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="一键报警配置">
                    <el-radio-group v-model="defaultConfig.alarmConfig">
                      <el-radio label="enabled">启用</el-radio>
                      <el-radio label="disabled">禁用</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="假三目设置">
                    <el-radio-group v-model="defaultConfig.fakeTriple">
                      <el-radio label="on">开启</el-radio>
                      <el-radio label="off">关闭</el-radio>
                    </el-radio-group>
                  </el-form-item>

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
              </template>

            </el-form>
          </el-scrollbar>

          <!-- 保存按钮 -->
          <div class="save-bar">
            <el-button type="primary" @click="handleSave">保存配置</el-button>
          </div>
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
  lightDuration: 60
})

// ===== Actions =====
function handleSave() {
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

.app-config-card {
  padding: var(--spacing-lg);
}

.config-layout {
  display: flex;
  gap: 24px;
  min-height: 400px;
}

.module-segmented {
  flex-shrink: 0;
  width: 130px;
  background: #F5F7FA;
  border-radius: 6px;
  padding: 8px;
  :deep(.el-segmented__group) { width: 100%; }
  :deep(.el-segmented) { background: transparent; }
  :deep(.el-segmented__item) {
    padding: 10px 12px;
    justify-content: center;
    font-size: 13px;
    text-align: center;
    border-radius: 4px;
    color: #606266;
    transition: all .2s;
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
}

.tab-section {
  padding: 4px 0;
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
</style>
