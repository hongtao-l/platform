<template>
  <div class="page-container config-page">
    <!-- 页面头部 -->
    <el-page-header class="page-header-bar" @back="handleBack">
      <template #content>
        <span class="page-header-title">开发产品</span>
      </template>
    </el-page-header>
    <div class="product-info-bar">
      <div class="product-info-left">
        <h2 class="product-name">{{ productName }}</h2>
        <el-button text type="primary" @click="handleEditProduct">
          <el-icon><Edit /></el-icon>编辑产品
        </el-button>
      </div>
      <div class="product-info-meta">
        <span>产品Id: {{ productId }}</span>
        <span class="meta-sep">|</span>
        <span>产品型号: TEST-MODEL-388537</span>
        <span class="meta-sep">|</span>
        <span>产品类目: UITest_Edit_285367</span>
        <span class="meta-sep">|</span>
        <span>联网方式: -</span>
      </div>
    </div>

    <!-- 步骤条 -->
    <el-steps :active="currentStep" simple class="steps-bar">
      <el-step title="功能定义与配置" @click="currentStep = 0" />
      <!-- <el-step title="事件配置" @click="currentStep = 1" /> -->
      <el-step title="设备算法服务" @click="currentStep = 2" />
      <el-step title="平台服务" @click="currentStep = 3" />
      <el-step title="语音助手" @click="currentStep = 4" />
    </el-steps>

    <!-- ===== 步骤0: 功能定义与配置 (border-card tabs) ===== -->
    <template v-if="currentStep === 0">
      <el-tabs v-model="activeFuncTab" type="border-card" class="device-tabs">
        <el-tab-pane
          v-for="ft in funcTabs"
          :key="ft.key"
          :label="ft.label"
          :name="ft.key"
        >
          <!-- Step 按钮 -->
          <div class="step-btns-bar">
            <el-button :disabled="activeFuncTab === funcTabs[0].key" class="w-160" @click="prevFuncStep">上一步</el-button>
            <el-button class="w-160" @click="skipFuncStep">跳过</el-button>
            <el-button type="primary" class="w-160" @click="saveNextFuncStep">
              <el-icon><Check /></el-icon>保存,下一步
            </el-button>
          </div>

          <!-- 分隔线 -->
          <div class="config-divider">
            <el-divider>
              <el-icon><Setting /></el-icon>
              <span class="section-title">配置选项</span>
            </el-divider>
          </div>

          <!-- 网络配置 -->
          <template v-if="ft.key === 'network'">
            <div class="tip-bar" style="margin-bottom:16px">
              <el-icon><InfoFilled /></el-icon>
              <span>配置设备联网相关参数。</span>
            </div>
            <div class="card" style="padding:20px 24px;margin-bottom:16px">
              <el-form label-width="200px" class="config-form">
                <el-form-item v-for="p in visibleNetworkParams" :key="p.id" :label="p.name">
                  <CapControl :cap="p.cap" />
                </el-form-item>
              </el-form>
            </div>
          </template>

          <!-- 设备能力 -->
          <template v-if="ft.key === 'deviceCap'">
                  <div class="tip-bar" style="margin-bottom:16px">
                    <el-icon><InfoFilled /></el-icon>
                    <span>本配置需 APP 对接平台（走平台下发）才生效；若 APP 直接对接SDK（P2P方式）获取能力配置，则此处配置不生效。（具体可联系APP厂商）</span>
                    <el-button link type="primary" class="tip-bar-toggle" @click="showPhoneDemo = !showPhoneDemo">
                      {{ showPhoneDemo ? '收起示例' : '查看示例' }}
                    </el-button>
                  </div>
                  <div class="device-cap-layout">
                    <div class="device-cap-main">
                      <CapModules :modules="deviceCapModules" />

                  <div class="cap-section">
                    <div class="cap-section-header">
                      <h3 class="cap-section-title">
                        标准能力
                        <el-tooltip content="设备固件支持的标准能力列表" placement="top">
                          <el-icon style="margin-left:4px;color:var(--text-placeholder);cursor:help"><QuestionFilled /></el-icon>
                        </el-tooltip>
                      </h3>
                      <el-button type="primary" size="small" @click="openCapabilityDialog('standard')">添加标准能力</el-button>
                    </div>
                    <div class="tip-bar" style="margin:16px 0">
                      <el-icon><InfoFilled /></el-icon>
                      <span>标准/自定义能力共同定义产品物模型能力，影响APP控制面板和固件，请根据设备实际能力配置</span>
                    </div>
                    <el-table v-if="standardCapList.length" :data="standardCapList" stripe>
                      <el-table-column label="类型" width="80" align="center">
                        <template #default="{ row }">
                          <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="能力名称" min-width="120" prop="name" />
                      <el-table-column label="能力标识" min-width="120" prop="identifier" />
                      <el-table-column label="数据类型" width="100" prop="dataType" />
                      <el-table-column label="数据定义" min-width="160">
                        <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
                      </el-table-column>
                      <el-table-column label="描述" min-width="120" prop="descr" />
                      <el-table-column label="所属模块" width="120" prop="moduleName" align="center" />
                      <el-table-column label="操作" width="120" align="center" fixed="right">
                        <template #default="{ row, $index }">
                          <el-button size="small" text type="primary" @click="editCapability(row, $index)">编辑</el-button>
                          <el-button size="small" text type="danger" @click="removeCapability($index)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div v-else class="empty-state">暂无数据</div>
                  </div>

                  <div class="cap-section">
                    <div class="cap-section-header">
                      <div>
                        <h3 class="cap-section-title">
                          自定义能力
                          <el-tooltip content="用户自定义的扩展能力" placement="top">
                            <el-icon style="margin-left:4px;color:var(--text-placeholder);cursor:help"><QuestionFilled /></el-icon>
                          </el-tooltip>
                        </h3>
                        <span class="cap-section-desc">您所定义的每一个功能，都与固件、APP控制台面板相关</span>
                      </div>
                      <el-button type="primary" size="small" @click="openCustomCapCreate">添加自定义能力</el-button>
                    </div>
                    <el-table v-if="customCapList.length" :data="customCapList" stripe>
                      <el-table-column label="类型" width="80" align="center">
                        <template #default="{ row }">
                          <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="能力名称" min-width="120" prop="name" />
                      <el-table-column label="能力标识" min-width="120" prop="identifier" />
                      <el-table-column label="数据类型" width="100" prop="dataType" />
                      <el-table-column label="数据定义" min-width="160">
                        <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
                      </el-table-column>
                      <el-table-column label="描述" min-width="120" prop="descr" />
                      <el-table-column label="所属模块" width="120" prop="moduleName" align="center" />
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

                    <!-- APP 控制面板预览（右侧页内，可展开/收起） -->
                    <transition name="panel-slide">
                    <div v-if="showPhoneDemo" class="device-cap-side">
                      <AppPhonePreview />
                    </div>
                    </transition>
                  </div>
                </template>

                <!-- 镜头配置 -->
                <div v-if="ft.key === 'lens'" class="config-section">
                  <div v-if="activeCamera" class="lens-config-body">
                    <div class="lens-header">
                      <h3 class="camera-name">{{ activeCamera.name }}</h3>
                      <el-select v-model="activeCameraIdx" size="small" style="width:200px">
                        <el-option v-for="(cam, i) in cameraList" :key="cam.id" :label="cam.name" :value="i" />
                      </el-select>
                      <el-button size="small" text type="danger" @click="removeCamera(activeCameraIdx)">删除</el-button>
                      <el-button size="small" @click="addCamera"><el-icon><Plus /></el-icon>添加镜头</el-button>
                    </div>

                    <div class="tip-bar" style="margin-bottom:16px">
                      <el-icon><InfoFilled /></el-icon>
                      <span>本配置需 APP 对接平台（走平台下发）才生效；若 APP 直接对接SDK（P2P方式）获取能力配置，则此处配置不生效。（具体可联系APP厂商）</span>
                      <el-button link type="primary" class="tip-bar-toggle" @click="showPhoneDemo = !showPhoneDemo">
                        {{ showPhoneDemo ? '收起示例' : '查看示例' }}
                      </el-button>
                    </div>
                    <div class="device-cap-layout">
                    <div class="device-cap-main">
                    <CapModules :modules="activeCamera.capabilityConfig" />

                    <!-- 标准能力 -->
                    <div class="cap-section">
                      <div class="cap-section-header">
                        <h3 class="cap-section-title">
                          标准能力
                          <el-tooltip content="镜头固件支持的标准能力列表" placement="top">
                            <el-icon style="margin-left:4px;color:var(--text-placeholder);cursor:help"><QuestionFilled /></el-icon>
                          </el-tooltip>
                        </h3>
                        <el-button type="primary" size="small" @click="openLensCapDialog('standard')">添加标准能力</el-button>
                      </div>
                      <el-table v-if="activeCamera.standardCaps.length" :data="activeCamera.standardCaps" stripe>
                        <el-table-column label="类型" width="80" align="center">
                          <template #default="{ row }">
                            <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column label="能力名称" min-width="120" prop="name" />
                        <el-table-column label="能力标识" min-width="120" prop="identifier" />
                        <el-table-column label="数据类型" width="100" prop="dataType" />
                        <el-table-column label="数据定义" min-width="160">
                          <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
                        </el-table-column>
                        <el-table-column label="描述" min-width="120" prop="descr" />
                        <el-table-column label="操作" width="120" align="center" fixed="right">
                          <template #default="{ $index }">
                            <el-button size="small" text type="danger" @click="activeCamera.standardCaps.splice($index, 1)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div v-else class="empty-state">暂无数据</div>
                    </div>

                    <!-- 自定义能力 -->
                    <div class="cap-section">
                      <div class="cap-section-header">
                        <div>
                          <h3 class="cap-section-title">
                            自定义能力
                            <el-tooltip content="用户自定义的镜头扩展能力" placement="top">
                              <el-icon style="margin-left:4px;color:var(--text-placeholder);cursor:help"><QuestionFilled /></el-icon>
                            </el-tooltip>
                          </h3>
                          <span class="cap-section-desc">您所定义的每一个功能，都与固件、APP控制台面板相关</span>
                        </div>
                        <el-button type="primary" size="small" @click="openLensCapDialog('custom')">添加自定义能力</el-button>
                      </div>
                      <el-table v-if="activeCamera.customCaps.length" :data="activeCamera.customCaps" stripe>
                        <el-table-column label="类型" width="80" align="center">
                          <template #default="{ row }">
                            <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column label="能力名称" min-width="120" prop="name" />
                        <el-table-column label="能力标识" min-width="120" prop="identifier" />
                        <el-table-column label="数据类型" width="100" prop="dataType" />
                        <el-table-column label="数据定义" min-width="160">
                          <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
                        </el-table-column>
                        <el-table-column label="描述" min-width="120" prop="descr" />
                        <el-table-column label="操作" width="120" align="center" fixed="right">
                          <template #default="{ $index }">
                            <el-button size="small" text type="danger" @click="activeCamera.customCaps.splice($index, 1)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div v-else class="empty-state">暂无数据</div>
                    </div>
                    </div>

                    <!-- APP 控制面板预览（右侧页内，可展开/收起） -->
                    <transition name="panel-slide">
                    <div v-if="showPhoneDemo" class="device-cap-side">
                      <AppPhonePreview />
                    </div>
                    </transition>
                    </div>
                  </div>

                  <div v-else class="empty-state" style="padding:40px 0">暂无镜头配置，请先添加镜头</div>
                </div>

                <!-- 麦克风配置 -->
                <div v-if="ft.key === 'mic'" class="config-section">
                  <div v-if="activeMic" class="lens-config-body">
                    <div class="lens-header">
                      <h3 class="camera-name">{{ activeMic.name }}</h3>
                      <el-select v-model="activeMicIdx" size="small" style="width:200px">
                        <el-option v-for="(m, i) in micList" :key="m.id" :label="m.name" :value="i" />
                      </el-select>
                      <el-button size="small" text type="danger" @click="removeMic(activeMicIdx)">删除</el-button>
                      <el-button size="small" @click="addMic"><el-icon><Plus /></el-icon>添加Microphone</el-button>
                    </div>

                    <div class="tip-bar" style="margin-bottom:16px">
                      <el-icon><InfoFilled /></el-icon>
                      <span>本配置需 APP 对接平台（走平台下发）才生效；若 APP 直接对接SDK（P2P方式）获取能力配置，则此处配置不生效。（具体可联系APP厂商）</span>
                      <el-button link type="primary" class="tip-bar-toggle" @click="showPhoneDemo = !showPhoneDemo">
                        {{ showPhoneDemo ? '收起示例' : '查看示例' }}
                      </el-button>
                    </div>
                    <div class="device-cap-layout">
                    <div class="device-cap-main">
                    <CapModules :modules="activeMic.capabilityConfig" />

                    <!-- 标准能力 -->
                    <div class="cap-section">
                      <div class="cap-section-header">
                        <h3 class="cap-section-title">
                          标准能力
                          <el-tooltip content="麦克风固件支持的标准能力列表" placement="top">
                            <el-icon style="margin-left:4px;color:var(--text-placeholder);cursor:help"><QuestionFilled /></el-icon>
                          </el-tooltip>
                        </h3>
                        <el-button type="primary" size="small" @click="openMicCapDialog('standard')">添加标准能力</el-button>
                      </div>
                      <el-table v-if="activeMic.standardCaps.length" :data="activeMic.standardCaps" stripe>
                        <el-table-column label="类型" width="80" align="center">
                          <template #default="{ row }">
                            <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column label="能力名称" min-width="120" prop="name" />
                        <el-table-column label="能力标识" min-width="120" prop="identifier" />
                        <el-table-column label="数据类型" width="100" prop="dataType" />
                        <el-table-column label="数据定义" min-width="160">
                          <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
                        </el-table-column>
                        <el-table-column label="描述" min-width="120" prop="descr" />
                        <el-table-column label="操作" width="120" align="center" fixed="right">
                          <template #default="{ $index }">
                            <el-button size="small" text type="danger" @click="activeMic.standardCaps.splice($index, 1)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div v-else class="empty-state">暂无数据</div>
                    </div>

                    <!-- 自定义能力 -->
                    <div class="cap-section">
                      <div class="cap-section-header">
                        <div>
                          <h3 class="cap-section-title">
                            自定义能力
                            <el-tooltip content="用户自定义的麦克风扩展能力" placement="top">
                              <el-icon style="margin-left:4px;color:var(--text-placeholder);cursor:help"><QuestionFilled /></el-icon>
                            </el-tooltip>
                          </h3>
                          <span class="cap-section-desc">您所定义的每一个功能，都与固件、APP控制台面板相关</span>
                        </div>
                        <el-button type="primary" size="small" @click="openMicCapDialog('custom')">添加自定义能力</el-button>
                      </div>
                      <el-table v-if="activeMic.customCaps.length" :data="activeMic.customCaps" stripe>
                        <el-table-column label="类型" width="80" align="center">
                          <template #default="{ row }">
                            <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column label="能力名称" min-width="120" prop="name" />
                        <el-table-column label="能力标识" min-width="120" prop="identifier" />
                        <el-table-column label="数据类型" width="100" prop="dataType" />
                        <el-table-column label="数据定义" min-width="160">
                          <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
                        </el-table-column>
                        <el-table-column label="描述" min-width="120" prop="descr" />
                        <el-table-column label="操作" width="120" align="center" fixed="right">
                          <template #default="{ $index }">
                            <el-button size="small" text type="danger" @click="activeMic.customCaps.splice($index, 1)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div v-else class="empty-state">暂无数据</div>
                    </div>
                    </div>

                    <!-- APP 控制面板预览（右侧页内，可展开/收起） -->
                    <transition name="panel-slide">
                    <div v-if="showPhoneDemo" class="device-cap-side">
                      <AppPhonePreview />
                    </div>
                    </transition>
                    </div>
                  </div>

                  <div v-else class="empty-state" style="padding:40px 0">暂无Microphone配置，请先添加Microphone</div>
                </div>

              </el-tab-pane>
      </el-tabs>
    </template>

    <!-- ===== 步骤1: 事件配置 ===== -->
    <template v-if="currentStep === 1">
      <div class="step-content-card">
        <div class="step-btns-bar">
          <el-button class="w-160" @click="currentStep = 0">上一步</el-button>
          <el-button class="w-160" @click="currentStep = 2">跳过</el-button>
          <el-button type="primary" class="w-160" @click="saveEventTab">
            <el-icon><Check /></el-icon>保存，下一步
          </el-button>
        </div>
        <div class="config-divider">
          <el-divider>
            <el-icon><Setting /></el-icon>
            <span class="section-title">该产品支持的事件</span>
          </el-divider>
        </div>
        <div class="tip-bar">
          <el-icon><InfoFilled /></el-icon>
          <span>该模块用于配置端侧上报事件能力</span>
        </div>

        <!-- 事件列表 -->
        <div class="event-config-section">
          <el-table :data="eventConfigList" stripe>
            <el-table-column label="事件ID" width="150" align="center">
              <template #default="{ row }">{{ row.eventId }}</template>
            </el-table-column>
            <el-table-column label="事件名称" min-width="160">
              <template #default="{ row }">
                <span class="cell-name">{{ row._name?.['1'] || row.eventId }}</span>
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
          </el-table>
        </div>
      </div>
    </template>

    <!-- ===== 步骤2: 设备算法配置 ===== -->
    <template v-if="currentStep === 2">
      <div class="step-content-card">
        <div class="step-btns-bar">
          <el-button class="w-160" @click="currentStep = 0">上一步</el-button>
          <el-button class="w-160" @click="currentStep = 3">跳过</el-button>
          <el-button type="primary" class="w-160" @click="saveAlgoTab">
            <el-icon><Check /></el-icon>保存，下一步
          </el-button>
        </div>
        <div class="config-divider">
          <el-divider>
            <el-icon><Setting /></el-icon>
            <span class="section-title">配置选项</span>
          </el-divider>
        </div>
        <div class="tip-bar">
          <el-icon><InfoFilled /></el-icon>
          <span>该模块用于配置端侧算法，请根据设备实际能力配置</span>
        </div>

        <div class="algo-service-section">
          <el-table :data="algoList" stripe :span-method="algoSpanMethod">
            <el-table-column label="算法ID" width="110" align="center">
              <template #default="{ row }">
                <span :class="{ 'merged-cell': row._rowSpan > 1 }">{{ row.algorithmId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="算法名称" min-width="140">
              <template #default="{ row }">
                <span class="cell-name">{{ row._name?.['1'] || row.algorithmId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" min-width="100">
              <template #default="{ row }">
                <span class="cell-desc">{{ row.descr || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力配置" width="100" align="center">
              <template #default="{ row }">
                <el-button v-if="row.hasConfig && row._isFirstRow" size="small" text type="primary" @click="openAlgoConfig(row)">配置</el-button>
              </template>
            </el-table-column>
            <el-table-column label="关联事件" width="100" align="center">
              <template #default="{ row }">
                <el-button v-if="row._isFirstRow" size="small" text type="primary" @click="openEventLink(row)">配置</el-button>
              </template>
            </el-table-column>
            <el-table-column label="服务ID" width="120" align="center">
              <template #default="{ row }">
                <span :class="{ 'cell-service-id': true, 'text-muted': row.serviceId === '-' }">{{ row.serviceId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="是否支持" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.supported" size="small" />
              </template>
            </el-table-column>
            <el-table-column width="100" align="center">
              <template #header>
                <span>免开通</span>
                <el-tooltip placement="top" effect="dark">
                  <template #content>
                    <div style="max-width:220px;line-height:1.6;">
                      <div>开启：APP用户无需付费即可使用此功能</div>
                      <div>关闭：APP用户需付费使用此功能，具体服务流程需联系平台/APP厂商</div>
                    </div>
                  </template>
                  <el-icon class="header-tip-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </template>
              <template #default="{ row }">
                <el-switch v-model="row.free" size="small" :disabled="!row.supported" @change="onFreeChange(row)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- ===== 步骤3: 平台服务 ===== -->
    <template v-if="currentStep === 3">
      <div class="step-content-card">
        <div class="step-btns-bar">
          <el-button class="w-160" @click="currentStep = 2">上一步</el-button>
          <el-button class="w-160" @click="currentStep = 4">跳过</el-button>
          <el-button type="primary" class="w-160" @click="savePlatformTab">
            <el-icon><Check /></el-icon>保存，下一步
          </el-button>
        </div>
        <div class="config-divider">
          <el-divider>
            <el-icon><Setting /></el-icon>
            <span class="section-title">配置选项</span>
          </el-divider>
        </div>

        <div class="algo-service-section">
          <el-table :data="platformServices" stripe>
            <el-table-column label="算法名称" min-width="160">
              <template #default="{ row }">
                <template v-if="row.algoNames && row.algoNames.length">
                  <el-tag
                    v-for="name in row.algoNames"
                    :key="name"
                    size="small"
                    style="margin-right:4px;margin-bottom:2px"
                  >{{ name }}</el-tag>
                </template>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="服务ID" width="120" align="center">
              <template #default="{ row }">
                <span :class="{ 'cell-service-id': true, 'text-muted': row.serviceId === '-' }">{{ row.serviceId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="服务名称" min-width="120">
              <template #default="{ row }">
                <span>{{ row.serviceName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" min-width="100">
              <template #default="{ row }">
                <span class="text-muted">{{ row.descr || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="是否支持" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.supported" size="small" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- ===== 步骤4: 语音助手 ===== -->
    <template v-if="currentStep === 4">
      <div class="step-content-card">
        <div class="step-btns-bar">
          <el-button class="w-160" @click="currentStep = 3">上一步</el-button>
          <el-button class="w-160" @click="finishDev">跳过</el-button>
          <el-button type="primary" class="w-160" @click="finishDev">
            <el-icon><Check /></el-icon>开发完成
          </el-button>
        </div>
        <div class="config-divider">
          <el-divider>
            <el-icon><Setting /></el-icon>
            <span class="section-title">语音助手配置</span>
          </el-divider>
        </div>
        <el-alert title="您可以选择以下平台开通语音能力，后期可通过该平台智能音箱语音控制您的设备" type="info" :closable="false" show-icon style="margin-bottom:16px" />
        <el-table :data="voiceList" stripe>
          <el-table-column label="AlloTType" width="120" align="center">
            <template #default="{ row }">{{ row.alloTType }}</template>
          </el-table-column>
          <el-table-column label="语音平台" min-width="160" prop="platform" />
          <el-table-column label="功能描述" min-width="300" prop="descr" />
          <el-table-column label="是否支持" width="120" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.supported" size="small" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- ===== 弹窗 ===== -->

    <!-- 能力穿梭框弹窗（按模块选择） -->
    <el-dialog v-model="capDialogVisible" :title="capDialogTitle" width="960px" top="3vh" :close-on-click-modal="false">
      <div class="transfer-container">
        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>可选能力</span>
            <span v-if="importCheckedIds.length" class="transfer-selected-count">已选 <span class="count-num">{{ importCheckedIds.length }}</span> 个</span>
          </div>
          <div class="transfer-panel-search">
            <el-input v-model="importSearchText" placeholder="搜索能力名称或标识" clearable size="small">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="transfer-panel-body">
            <div v-if="!importAvailableByModule.length" class="transfer-empty">暂无可导入的能力</div>
            <div
              v-for="mod in importAvailableByModule"
              :key="mod.id"
              :class="['transfer-category-item', { expanded: expandedLeftModules.includes(mod.id) }]"
            >
              <div class="transfer-cat-header" @click="toggleLeftModuleExpand(mod.id)">
                <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                <el-checkbox
                  :model-value="isModuleAllChecked(mod)"
                  :indeterminate="isModuleIndeterminate(mod)"
                  @change="toggleModuleAllCheck(mod)"
                  @click.stop
                />
                <span class="transfer-cat-name">{{ mod.name }}</span>
                <span class="transfer-cat-count">{{ mod.caps.length }} 个能力</span>
              </div>
              <div class="transfer-cat-body">
                <label
                  v-for="cap in mod.caps"
                  :key="cap.identifier"
                  :class="['transfer-pkg-item', { selected: importCheckedIds.includes(cap.identifier), hidden: !isImportCapVisible(cap) }]"
                >
                  <el-checkbox :model-value="importCheckedIds.includes(cap.identifier)" @change="toggleImportCheck(cap.identifier)" />
                  <div class="transfer-pkg-info">
                    <div class="transfer-pkg-name">
                      <span :class="['type-tag', cap.capType === 'prop' ? 'type-prop' : cap.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(cap.capType) }}</span>
                      {{ cap.name }}
                    </div>
                    <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="transfer-actions">
          <el-button size="small" class="transfer-arrow-btn" :disabled="!importCheckedIds.length" @click="transferToRight">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button size="small" class="transfer-arrow-btn" :disabled="!importSelectedIds.length" @click="transferToLeft">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>

        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>待导入</span>
            <span class="transfer-count">{{ importSelectedIds.length }} 项</span>
          </div>
          <div class="transfer-panel-search-placeholder" />
          <div class="transfer-panel-body">
            <div v-if="!importSelectedIds.length" class="transfer-empty">请从左侧勾选能力后点击 → 添加</div>
            <div
              v-for="mod in importSelectedByModule"
              :key="mod.id"
              :class="['transfer-category-item', { expanded: expandedModules.includes(mod.id) }]"
            >
              <div class="transfer-cat-header" @click="toggleModuleExpand(mod.id)">
                <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                <span class="transfer-cat-name">{{ mod.name }}</span>
                <span class="transfer-cat-count">{{ mod.caps.length }} 个能力</span>
              </div>
              <div class="transfer-cat-body">
                <div
                  v-for="cap in mod.caps"
                  :key="cap.identifier"
                  class="transfer-pkg-item selected"
                >
                  <div class="transfer-pkg-info" style="flex:1">
                    <div class="transfer-pkg-name">
                      <span :class="['type-tag', cap.capType === 'prop' ? 'type-prop' : cap.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(cap.capType) }}</span>
                      {{ cap.name }}
                    </div>
                    <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                  </div>
                  <el-button size="small" text type="danger" @click="removeFromSelected(cap.identifier)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="capDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!importSelectedIds.length" @click="handleImportConfirm">
          导入（{{ importSelectedIds.length }}）
        </el-button>
      </template>
    </el-dialog>


    <!-- 算法配置抽屉 -->
    <el-drawer v-model="algoConfigVisible" :title="'能力配置 - ' + (editingAlgo?._name?.['1'] || editingAlgo?.algorithmId)" size="860px" :close-on-click-modal="false" @closed="algoCapScope = null" class="algo-config-drawer">
      <div class="algo-config-toolbar">
        <span class="algo-config-count">共 {{ allCapList.length }} 个能力</span>
      </div>
      <template v-if="allCapList.length">
        <div class="algo-cap-section">
          <div class="algo-cap-section-header">
            <span class="algo-cap-section-title">标准能力</span>
            <el-button size="small" @click="openCapabilityDialog('standard')">+ 标准能力</el-button>
          </div>
          <el-table v-if="standardCapList.length" :data="standardCapList" stripe>
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力名称" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">{{ row.name }}</template>
            </el-table-column>
            <el-table-column label="标识" width="170" show-overflow-tooltip>
              <template #default="{ row }">{{ row.identifier }}</template>
            </el-table-column>
            <el-table-column label="数据定义" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row, $index }">
                <el-button size="small" text type="primary" @click="openAlgoCapEdit({ cap: row, source: 'standard', idx: $index })">编辑</el-button>
                <el-button size="small" text type="danger" @click="standardCapList.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="algo-config-empty">暂无标准能力</div>
        </div>
        <div class="algo-cap-section">
          <div class="algo-cap-section-header">
            <span class="algo-cap-section-title">自定义能力</span>
            <el-button size="small" @click="openCustomCapCreate">+ 自定义能力</el-button>
          </div>
          <el-table v-if="customCapList.length" :data="customCapList" stripe>
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力名称" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">{{ row.name }}</template>
            </el-table-column>
            <el-table-column label="标识" width="170" show-overflow-tooltip>
              <template #default="{ row }">{{ row.identifier }}</template>
            </el-table-column>
            <el-table-column label="数据定义" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row, $index }">
                <el-button size="small" text type="primary" @click="openAlgoCapEdit({ cap: row, source: 'custom', idx: $index })">编辑</el-button>
                <el-button size="small" text type="danger" @click="customCapList.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="algo-config-empty">暂无自定义能力</div>
        </div>
      </template>
      <div v-else class="algo-config-empty">暂未添加能力，请点击上方按钮添加</div>
      <template #footer>
        <el-button @click="algoConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlgoConfig">确定</el-button>
      </template>
    </el-drawer>

    <!-- PIR侦测 能力配置侧边弹窗 -->
    <el-drawer v-model="pirConfigVisible" title="能力配置 - PIR侦测" size="860px" :close-on-click-modal="false" @closed="algoCapScope = null" class="algo-config-drawer">
      <div class="algo-config-toolbar">
        <span class="algo-config-count">固定配置项</span>
      </div>
      <div class="pir-config-section">
        <div class="tip-bar" style="margin-bottom:16px">
          <el-icon><InfoFilled /></el-icon>
          <span>以下为PIR侦测算法的固定配置项，请根据实际需求设置</span>
        </div>
        <el-form label-width="120px" label-position="right">
          <template v-for="item in pirConfigItems" :key="item.key">
            <el-form-item :label="item.label">
              <div>
                <div class="pir-item-row">
                  <span class="pir-item-label">是否支持</span>
                  <el-radio-group v-model="pirConfigForm[item.key].supported" size="small">
                    <el-radio label="1">支持</el-radio>
                    <el-radio label="0">不支持</el-radio>
                  </el-radio-group>
                </div>
                <div v-if="pirConfigForm[item.key].supported === '1'" class="pir-item-row" style="margin-top:8px">
                  <span class="pir-item-label">默认值</span>
                  <el-select v-if="item.key === 'sensitivity'" v-model="pirConfigForm[item.key].defaultVal" size="small" style="width:100px">
                    <el-option label="1档" value="1" />
                    <el-option label="2档" value="2" />
                    <el-option label="3档" value="3" />
                    <el-option label="4档" value="4" />
                    <el-option label="5档" value="5" />
                  </el-select>
                  <el-radio-group v-else v-model="pirConfigForm[item.key].defaultVal" size="small">
                    <el-radio label="1">开启</el-radio>
                    <el-radio label="0">关闭</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </el-form-item>
          </template>
        </el-form>
      </div>

      <el-divider />

      <!-- 标准能力 -->
      <div class="algo-cap-section">
        <div class="algo-cap-section-header">
          <span class="algo-cap-section-title">标准能力</span>
          <el-button size="small" @click="openCapabilityDialog('standard')">+ 标准能力</el-button>
        </div>
        <el-table v-if="standardCapList.length" :data="standardCapList" stripe>
          <el-table-column label="类型" width="80" align="center">
            <template #default="{ row }">
              <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="能力名称" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="标识" width="170" show-overflow-tooltip>
            <template #default="{ row }">{{ row.identifier }}</template>
          </el-table-column>
          <el-table-column label="数据定义" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row, $index }">
              <el-button size="small" text type="primary" @click="openAlgoCapEdit({ cap: row, source: 'standard', idx: $index })">编辑</el-button>
              <el-button size="small" text type="danger" @click="standardCapList.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="algo-config-empty">暂无标准能力</div>
      </div>

      <!-- 自定义能力 -->
      <div class="algo-cap-section">
        <div class="algo-cap-section-header">
          <span class="algo-cap-section-title">自定义能力</span>
          <el-button size="small" @click="openCustomCapCreate">+ 自定义能力</el-button>
        </div>
        <el-table v-if="customCapList.length" :data="customCapList" stripe>
          <el-table-column label="类型" width="80" align="center">
            <template #default="{ row }">
              <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="能力名称" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="标识" width="170" show-overflow-tooltip>
            <template #default="{ row }">{{ row.identifier }}</template>
          </el-table-column>
          <el-table-column label="数据定义" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row, $index }">
              <el-button size="small" text type="primary" @click="openAlgoCapEdit({ cap: row, source: 'custom', idx: $index })">编辑</el-button>
              <el-button size="small" text type="danger" @click="customCapList.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="algo-config-empty">暂无自定义能力</div>
      </div>

      <template #footer>
        <el-button @click="pirConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="savePirConfig">确定</el-button>
      </template>
    </el-drawer>

    <!-- 能力参数编辑/创建弹窗 -->
    <el-dialog v-model="algoCapEditVisible" :title="isAlgoCreateMode ? '创建自定义能力' : '编辑能力参数 - ' + (algoCapEditRef?.cap?.name || '')" width="860px" top="3vh" :close-on-click-modal="false" class="cap-dialog">
      <el-form v-if="isAlgoCreateMode || algoCapEditRef" label-width="100px">
        <el-form-item label="能力类型">
          <div class="type-cards">
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'prop' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && onAlgoCapTypeChange('prop')">属性</div>
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'svc' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && onAlgoCapTypeChange('svc')">服务</div>
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'evt' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && onAlgoCapTypeChange('evt')">事件</div>
          </div>
        </el-form-item>
        <el-form-item label="能力名称">
          <el-input v-if="isAlgoCreateMode" v-model="algoCapEditForm.name" placeholder="请输入能力名称" />
          <el-input v-else :model-value="algoCapEditRef?.cap?.name" disabled />
        </el-form-item>
        <el-form-item label="标识符">
          <el-input v-if="isAlgoCreateMode" v-model="algoCapEditForm.identifier" placeholder="请输入能力标识" />
          <el-input v-else :model-value="algoCapEditRef?.cap?.identifier" disabled />
        </el-form-item>

        <template v-if="(isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'prop'">
          <el-form-item label="数据类型">
            <el-select v-if="isAlgoCreateMode" v-model="algoCapEditForm.dataType" style="width:100%" @change="onAlgoDataTypeChange">
              <el-option label="枚举型 (enum)" value="enum" />
              <el-option label="数值型 (int)" value="int" />
              <el-option label="布尔型 (boolean)" value="boolean" />
              <el-option label="字符串 (string)" value="string" />
              <el-option label="数组型 (array)" value="array" />
              <el-option label="结构体型 (struct)" value="struct" />
            </el-select>
            <el-select v-else :model-value="dataTypeLabel(algoCapEditRef?.cap)" disabled style="width:100%" />
          </el-form-item>
          <el-form-item label="读写模式">
            <el-select v-if="isAlgoCreateMode" v-model="algoCapEditForm.accessMode" style="width:100%">
              <el-option label="读写 (Read/Write)" value="rw" />
              <el-option label="只读 (Read Only)" value="ro" />
            </el-select>
            <el-select v-else :model-value="algoCapEditForm.accessMode === 'ro' ? '只读 (Read Only)' : '读写 (Read/Write)'" disabled style="width:100%" />
          </el-form-item>
        </template>

        <el-form-item label="描述">
          <el-input v-model="algoCapEditForm.descr" type="textarea" placeholder="请输入能力描述" rows="2" />
        </el-form-item>

        <el-divider>数据定义</el-divider>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'enum'">
          <el-form-item label="枚举值定义" required>
            <div class="enum-list">
              <div v-for="(ev, i) in algoCapEditForm.enumValues" :key="i" class="enum-row">
                <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <el-button size="small" type="danger" :icon="Delete" circle @click="algoCapEditForm.enumValues.splice(i, 1)" />
              </div>
            </div>
            <el-button size="small" style="margin-top:8px" @click="algoCapEditForm.enumValues.push({ name: '', val: (algoCapEditForm.enumValues.length) })">+ 添加枚举值</el-button>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="algoCapEditForm.defaultVal" placeholder="请输入默认枚举值的 Value" />
          </el-form-item>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'int'">
          <el-form-item label="取值范围" required>
            <div class="range-row">
              <el-input-number v-model="algoCapEditForm.min" :max="algoCapEditForm.max - 1" style="flex:1" />
              <span style="color:var(--text-placeholder)">~</span>
              <el-input-number v-model="algoCapEditForm.max" :min="algoCapEditForm.min + 1" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="algoCapEditForm.step" :min="1" style="width:150px" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="algoCapEditForm.unit" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input-number v-model="algoCapEditForm.defaultVal" :min="algoCapEditForm.min" :max="algoCapEditForm.max" style="width:200px" />
          </el-form-item>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="bool-labels">
              <div style="flex:1">
                <span class="form-hint">true 标签</span>
                <el-input v-model="algoCapEditForm.trueLabel" />
              </div>
              <div style="flex:1">
                <span class="form-hint">false 标签</span>
                <el-input v-model="algoCapEditForm.falseLabel" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="默认值">
            <el-radio-group v-model="algoCapEditForm.defaultVal">
              <el-radio value="1">{{ algoCapEditForm.trueLabel || '开启' }} (true)</el-radio>
              <el-radio value="0">{{ algoCapEditForm.falseLabel || '关闭' }} (false)</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）" required>
            <el-input-number v-model="algoCapEditForm.maxLength" :min="1" :max="65535" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="algoCapEditForm.defaultVal" placeholder="请输入默认值" />
          </el-form-item>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="algoCapEditForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
              <el-option label="Struct (结构体)" value="struct" />
            </el-select>
          </el-form-item>
          <el-form-item label="最大长度" required>
            <el-input-number v-model="algoCapEditForm.arrayMaxLength" :min="1" :max="1000" style="width:150px" />
          </el-form-item>
          <template v-if="algoCapEditForm.elementType === 'struct'">
            <el-form-item label="元素结构体字段">
              <div style="width:100%">
                <div class="param-list">
                  <div v-for="(f, i) in algoCapEditForm.fields" :key="i" class="param-item">
                    <div class="param-info">
                      <span class="param-name">{{ f.name || '未命名' }}</span>
                      <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                    </div>
                    <el-button size="small" text @click="openEditStructField(i)"><el-icon><Edit /></el-icon></el-button>
                    <el-button size="small" text type="danger" @click="algoCapEditForm.fields.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                  </div>
                  <div v-if="!algoCapEditForm.fields.length" class="param-empty">暂无字段</div>
                </div>
                <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
              </div>
            </el-form-item>
          </template>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'struct'">
          <el-form-item label="结构体字段">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(f, i) in algoCapEditForm.fields" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ f.name || '未命名' }}</span>
                    <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditStructField(i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="algoCapEditForm.fields.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!algoCapEditForm.fields.length" class="param-empty">暂无字段</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
            </div>
          </el-form-item>
        </template>

        <template v-if="editCapType === 'svc'">
          <el-form-item label="输入参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in algoCapEditForm.inputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('input', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="algoCapEditForm.inputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!algoCapEditForm.inputParams.length" class="param-empty">暂无输入参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('input')">+ 添加参数</el-button>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in algoCapEditForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('output', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="algoCapEditForm.outputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!algoCapEditForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

        <template v-if="editCapType === 'evt'">
          <el-form-item label="事件类型" required>
            <div class="type-cards">
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'info' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'info')">信息 (Info)</div>
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'alarm' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'alarm')">告警 (Alarm)</div>
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'fault' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'fault')">故障 (Fault)</div>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in algoCapEditForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('output', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="algoCapEditForm.outputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!algoCapEditForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

      </el-form>

      <!-- 参数编辑子弹窗 -->
      <el-dialog v-model="paramDialogVisible" :title="paramDialogTitle" width="600px" :close-on-click-modal="false" class="alg-cap-dialog">
        <el-form ref="paramFormRef" :model="paramForm" label-width="100px">
          <el-form-item label="参数名称" required>
            <el-input v-model="paramForm.name" placeholder="请输入参数名称" />
          </el-form-item>
          <el-form-item label="参数标识" required>
            <el-input v-model="paramForm.identifier" placeholder="例如 result" />
          </el-form-item>
          <el-form-item label="数据类型" required>
            <el-select v-model="paramForm.dataType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
              <el-option label="Boolean (布尔)" value="boolean" />
              <el-option label="Enum (枚举)" value="enum" />
              <el-option label="Array (数组)" value="array" />
            </el-select>
          </el-form-item>
          <el-divider>类型定义</el-divider>
          <template v-if="paramForm.dataType === 'int'">
            <el-form-item label="取值范围">
              <div class="range-row">
                <el-input-number v-model="paramForm.min" :max="paramForm.max - 1" style="flex:1" />
                <span style="color:var(--text-placeholder)">~</span>
                <el-input-number v-model="paramForm.max" :min="paramForm.min + 1" style="flex:1" />
              </div>
            </el-form-item>
            <el-form-item label="步长">
              <el-input-number v-model="paramForm.step" :min="1" style="width:150px" />
            </el-form-item>
            <el-form-item label="单位">
              <el-input v-model="paramForm.unit" style="width:150px" />
            </el-form-item>
          </template>
          <template v-if="paramForm.dataType === 'string'">
            <el-form-item label="最大长度（字节）">
              <el-input-number v-model="paramForm.maxLength" :min="1" :max="65535" style="width:150px" />
            </el-form-item>
          </template>
          <template v-if="paramForm.dataType === 'boolean'">
            <el-form-item label="布尔值标签">
              <div class="bool-labels">
                <div style="flex:1">
                  <span class="form-hint">true 标签</span>
                  <el-input v-model="paramForm.trueLabel" placeholder="开启" />
                </div>
                <div style="flex:1">
                  <span class="form-hint">false 标签</span>
                  <el-input v-model="paramForm.falseLabel" placeholder="关闭" />
                </div>
              </div>
            </el-form-item>
          </template>
          <template v-if="paramForm.dataType === 'enum'">
            <el-form-item label="枚举值定义">
              <div class="enum-list">
                <div v-for="(ev, i) in paramForm.enumValues" :key="i" class="enum-row">
                  <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                  <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                  <el-button size="small" type="danger" :icon="Delete" circle @click="paramForm.enumValues.splice(i, 1)" />
                </div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="paramForm.enumValues.push({ name: '', val: (paramForm.enumValues.length) })">+ 添加枚举值</el-button>
            </el-form-item>
          </template>
          <template v-if="paramForm.dataType === 'array'">
            <el-form-item label="元素类型" required>
              <el-select v-model="paramForm.elementType" style="width:100%">
                <el-option label="Int (数字)" value="int" />
                <el-option label="String (字符串)" value="string" />
              </el-select>
            </el-form-item>
            <el-form-item label="最大长度">
              <el-input-number v-model="paramForm.arrayMaxLength" :min="1" :max="1000" style="width:150px" />
            </el-form-item>
            <el-form-item label="默认值">
              <el-input v-model="paramForm.defaultVal" placeholder="请输入默认值（逗号分隔）" />
            </el-form-item>
          </template>
        </el-form>
        <template #footer>
          <el-button @click="paramDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleParamConfirm">确定</el-button>
        </template>
      </el-dialog>

      <template #footer>
        <el-button @click="algoCapEditVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlgoCapEdit">{{ isAlgoCreateMode ? '创建' : '保存' }}</el-button>
      </template>
    </el-dialog>

    <!-- 关联事件弹窗 -->
    <el-drawer
      v-model="eventLinkVisible"
      :title="'关联事件 - ' + (editingAlgo?._name?.['1'] || editingAlgo?.algorithmId)"
      direction="rtl"
      size="640px"
      :close-on-click-modal="false"
      class="event-link-drawer"
    >
      <template v-if="editingAlgo">
<el-table
          ref="eventTableRef"
          :data="linkedEventOptions"
          stripe
          @selection-change="handleEventSelectionChange"
        >
          <el-table-column type="selection" width="44" />
          <el-table-column label="事件ID" width="110">
            <template #default="{ row }">
              <code class="event-id-code">{{ row.id }}</code>
            </template>
          </el-table-column>
          <el-table-column label="事件名称" min-width="140">
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="备注" min-width="160">
            <template #default="{ row }">{{ row.descr || '—' }}</template>
          </el-table-column>
          <el-table-column label="推送文案" min-width="160">
            <template #default="{ row }">{{ row._push?.['1'] || '—' }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-if="linkedEventOptions.length === 0" description="暂无关联事件" :image-size="80" />
      </template>
      <template #footer>
        <el-button @click="eventLinkVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEventLink">保存</el-button>
      </template>
    </el-drawer>

    <!-- 套餐绑定侧边弹窗 -->
    <el-drawer
      v-model="packageDrawerVisible"
      title="选择绑定套餐"
      direction="rtl"
      size="480px"
      :close-on-click-modal="false"
      class="package-bind-drawer"
    >
      <div class="package-list">
        <div
          v-for="pkg in packageOptions"
          :key="pkg.id"
          :class="['package-item', { active: packageDrawerRow?.boundPackage === pkg.id }]"
          @click="confirmPackageBinding(pkg.id)"
        >
          <div class="package-item-left">
            <span class="package-item-id">{{ pkg.id }}</span>
            <span class="package-item-name">{{ pkg.name }}</span>
          </div>
          <el-icon v-if="packageDrawerRow?.boundPackage === pkg.id" color="#1A73E8"><CircleCheck /></el-icon>
        </div>
      </div>
      <el-empty v-if="packageOptions.length === 0" description="暂无可用套餐" :image-size="80" />
    </el-drawer>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, ArrowLeft, ArrowRight, Edit, Switch, Check, Setting, QuestionFilled, Delete, Search, InfoFilled, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listAlgorithms, listServices, allEvents, getCapabilitiesByIds, getModules, getAllCapabilities, getAlgorithmServiceId, getAlgorithmEvents, getAllAlgorithmServices } from '@/views/iot/thing-model/data'
import CapControl from './cap-control.vue'
import CapModules from './cap-modules.vue'
import AppPhonePreview from './AppPhonePreview.vue'

const route = useRoute()
const router = useRouter()

const productName = ref(route.query.name || 'API测试产品_388537')
const productId = ref(route.query.id || 'PDRSAs9HaSQzNPrG')

// ===== 步骤导航 =====
const currentStep = ref(0)

// ===== 功能配置子 Tab =====
const funcTabs = [
  { key: 'network', label: '网络配置' },
  { key: 'deviceCap', label: '设备能力' },
  { key: 'lens', label: '镜头能力配置' },
  { key: 'mic', label: '麦克风能力配置' }
]
const activeFuncTab = ref('network')

// APP 控制面板示例展开状态
const showPhoneDemo = ref(false)

function prevFuncStep() {
  const idx = funcTabs.findIndex(t => t.key === activeFuncTab.value)
  if (idx > 0) activeFuncTab.value = funcTabs[idx - 1].key
}

function skipFuncStep() {
  const idx = funcTabs.findIndex(t => t.key === activeFuncTab.value)
  if (idx < funcTabs.length - 1) {
    activeFuncTab.value = funcTabs[idx + 1].key
    ElMessage.info('已跳过当前步骤')
  }
}

function saveNextFuncStep() {
  const idx = funcTabs.findIndex(t => t.key === activeFuncTab.value)
  if (idx < funcTabs.length - 1) {
    activeFuncTab.value = funcTabs[idx + 1].key
    ElMessage.success('已保存，进入下一步')
  } else {
    currentStep.value = 2
    ElMessage.success('功能配置已完成，进入设备算法配置')
  }
}

// ===== 能力项配置模型 =====
// 每个能力项：先选「支持/不支持」，选「支持」后展开默认值（下发固件）
//   supported   — '1' 支持 / '0' 不支持
//   defaultValue — 默认值控件，仅 supported==='1' 时显示
//   children     — 级联子项（如 音量调节 → 音量），仅 supported==='1' 时显示
// 控件 type: switch / checkbox / radio / select / number / time
function capSwitch(value) { return { type: 'switch', value } }
function capCheckbox(options, value) { return { type: 'checkbox', options, value } }
function capRadio(options, value) { return { type: 'radio', options, value } }
function capSelect(options, value) { return { type: 'select', options, value } }
function capNumber(value, min, max, unit) { return { type: 'number', value, min, max, unit } }
function capTime(value) { return { type: 'time', value } }

// ===== 网络配置（设备级网络相关参数）=====
const networkParams = reactive([
  { id: 'netTypes', name: '联网方式', cap: capCheckbox(['有线', 'WIFI', '移动网络'], ['WIFI']) },
  { id: 'dualBand', name: '是否支持双频路由器(5Ghz)', cap: capRadio(['是', '否'], '否'), when: 'wifi' },
  { id: 'distMethods', name: '配网方式', cap: capCheckbox(['AP', '声音', 'smartlink', '摄像机识别二维码添加', '局域网', 'APP扫码添加', '蓝牙添加'], ['AP']) },
  { id: 'apPassword', name: 'AP是否支持设置密码', cap: capRadio(['是', '否'], '否'), when: 'ap' },
  { id: 'defaultDistMethod', name: '默认配网方式', cap: capSelect(['AP', 'smartlink', '局域网'], 'AP') }
])

// 条件显隐：联网方式含 WIFI 显示双频路由器；配网方式含 AP 显示 AP 密码配置
const visibleNetworkParams = computed(() => {
  const netTypes = networkParams.find(p => p.id === 'netTypes')?.cap.value || []
  const distMethods = networkParams.find(p => p.id === 'distMethods')?.cap.value || []
  const conditions = {
    wifi: netTypes.includes('WIFI'),
    ap: distMethods.includes('AP')
  }
  return networkParams.filter(p => !p.when || conditions[p.when])
})

// ===== 设备能力（设备级单例，17 项，按 7 模块分组）=====
const deviceCapModules = reactive([
  {
    name: '扬声器模块',
    items: [
      { id: 'intercom', name: '对讲能力', supported: '0', defaultValue: capSelect(['半双工', '全双工'], '半双工'), access: 'ro' },
      { id: 'hasSpeaker', name: '喇叭能力', supported: '0', defaultValue: null },
      { id: 'volumeAdjust', name: '音量调节能力', supported: '0', defaultValue: null, children: [
        { id: 'volume', name: '音量', defaultValue: capNumber(1, 0, 100, '') }
      ] },
      { id: 'customRing', name: '自定义铃声能力', supported: '0', defaultValue: null }
    ]
  },
  {
    name: '录制模块',
    items: [
      { id: 'storageMethod', name: '存储能力', supported: '0', defaultValue: capRadio(['TF卡存储', '磁盘存储'], 'TF卡存储'), access: 'ro' },
      { id: 'recordMode', name: '常规录制能力', supported: '0', defaultValue: null, children: [
        { id: 'recordStart', name: '录制开始时间', defaultValue: capTime('00:00:00') },
        { id: 'recordEnd', name: '录制结束时间', defaultValue: capTime('23:59:59') },
        { id: 'repeatDays', name: '录制重复', defaultValue: capCheckbox(['周一', '周二', '周三', '周四', '周五', '周六', '周日'], ['周一', '周二', '周三', '周四', '周五', '周六', '周日']) }
      ] },
      { id: 'alarmRecord', name: '报警录制能力', supported: '0', defaultValue: null, children: [
        { id: 'alarmDuration', name: '报警时长', defaultValue: capNumber(15, 5, 300, '秒') }
      ] }
    ]
  },
  {
    name: '电池模块',
    items: [
      { id: 'hasBattery', name: '电池能力', supported: '0', defaultValue: null },
      { id: 'wakeup', name: '唤醒能力', supported: '0', defaultValue: capRadio(['本地唤醒', '远程唤醒', '本地和远程'], '本地唤醒'), access: 'ro' }
    ]
  },
  {
    name: '灯光模块',
    items: [
      { id: 'indicator', name: '状态指示灯能力', supported: '0', defaultValue: null },
      { id: 'irLight', name: '红外灯能力', supported: '0', defaultValue: null }
    ]
  }
])

// ===== 镜头能力项（每个镜头实例一份，17 项，按 2 模块分组）=====
function defaultLensCapabilityConfig() {
  return [
    {
      name: 'PTZ模块',
      items: [
        { id: 'ptzSupported', name: 'PTZ能力', supported: '0', defaultValue: null, children: [
          { id: 'ptzCaps', name: 'PTZ方向', defaultValue: capCheckbox(['平移', '倾斜', '变焦'], []), access: 'ro' }
        ] },
        { id: 'preset', name: '预置位能力', supported: '0', defaultValue: null },
        { id: 'cruise', name: '自动巡航能力', supported: '0', defaultValue: null },
        { id: 'spatial', name: '空间定位能力', supported: '0', defaultValue: capRadio(['支持3D居中', '支持GPS定位'], '支持3D居中'), access: 'ro' },
        { id: 'ptzSpeed', name: 'PTZ转速能力', supported: '0', defaultValue: null }
      ]
    },
    {
      name: '图像采集模块',
      items: [
        { id: 'flip', name: '图像翻转能力', supported: '0', defaultValue: capRadio(['正放', '翻转'], '正放'), access: 'rw' },
        { id: 'mirror', name: '镜像能力', supported: '0', defaultValue: capRadio(['打开', '关闭'], '关闭'), access: 'rw' },
        { id: 'nightVision', name: '夜视能力', supported: '0', defaultValue: null },
        { id: 'wdr', name: '宽动态能力', supported: '0', defaultValue: capSwitch(false), access: 'rw' },
        { id: 'hdr', name: '高动态能力', supported: '0', defaultValue: capSwitch(false), access: 'rw' },
        { id: 'antiFlicker', name: '抗闪烁能力', supported: '0', defaultValue: capRadio(['50', '60'], '50'), access: 'rw' },
        { id: 'privacyZone', name: '隐私区域能力', supported: '0', defaultValue: null },
        { id: 'logoWatermark', name: 'LOGO水印能力', supported: '0', defaultValue: null },
        { id: 'fisheye', name: '鱼眼矫正能力', supported: '0', defaultValue: capRadio(['设备矫正', 'App矫正'], '设备矫正'), access: 'rw' },
        { id: 'snapshot', name: '抓图能力', supported: '0', defaultValue: null },
        { id: 'humanoidCoord', name: '人形坐标写入能力', supported: '0', defaultValue: null },
        { id: 'compositeStream', name: '合成流能力', supported: '0', defaultValue: null }
      ]
    }
  ]
}

// ===== 麦克风能力项（每个麦克风实例一份，2 项，1 模块）=====
function defaultMicCapabilityConfig() {
  return [
    {
      name: '麦克风模块',
      items: [
        { id: 'micSwitch', name: '麦克风开关能力', supported: '0', defaultValue: null },
        { id: 'volumeAdjust', name: '音量调节能力', supported: '0', defaultValue: null, children: [
          { id: 'captureVolume', name: '采集音量', defaultValue: capNumber(0, 0, 100, ''), access: 'rw' }
        ] }
      ]
    }
  ]
}

// ===== 出厂参数（归档，不维护；由设备固件上报，页面不渲染，后续按需接回）=====
const factoryParams = [
  { id: 'lensType', name: '镜头类型', type: 'select', options: ['普通镜头', '广角镜头', '长焦镜头', '鱼眼镜头'] },
  { id: 'focalLength', name: '焦距', type: 'range', min: 0, max: 100 },
  { id: 'resolutions', name: '支持的分辨率', type: 'checkbox', options: ['320*240', '640*360', '640*480', '1280*720', '1280*960', '1920*1080', '1600*1200', '2048*1536', '2560*1440', '2688*1520', '2560*1920'] },
  { id: 'bitrateControl', name: '码率控制类型', type: 'radio', options: ['CBR', 'VBR'] },
  { id: 'bitrateValue', name: '码率值', type: 'number', min: 64, max: 20480, unit: 'kbps' },
  { id: 'streamEncodeTypes', name: '码流编码类型', type: 'checkbox', options: ['H264', 'H265', 'MJPEG', 'VP8'] },
  { id: 'streamDefaultEncode', name: '码流默认编码', type: 'select', options: ['H264', 'H265', 'MJPEG'] },
  { id: 'smartEncode', name: '智能编码', type: 'switch' },
  { id: 'keyFrameInterval', name: '关键帧间隔', type: 'number', min: 1, max: 250 },
  { id: 'frameRate', name: '帧率', type: 'number', min: 1, max: 60 },
  { id: 'defaultResolution', name: '默认分辨率', type: 'select', options: ['320*240', '640*360', '640*480', '1280*720', '1280*960', '1920*1080', '1600*1200', '2048*1536', '2560*1440', '2688*1520', '2560*1920'] },
  { id: 'otaSupport', name: '是否支持远程OTA', type: 'switch' },
  { id: 'workMode', name: '摄像机工作模式', type: 'radio', options: ['独立工作', '联动工作'] },
  { id: 'hasDisplay', name: '是否有屏显', type: 'switch' },
  { id: 'displayResolutions', name: '屏显分辨率', type: 'checkbox', options: ['1920*1080', '1280*720', '640*480', '640*360', '320*240'] },
  { id: 'displaySleepTime', name: '屏息时间', type: 'number', min: 1, max: 3600, unit: '秒' },
  { id: 'displayDecodeTypes', name: '屏显解码方式', type: 'checkbox', options: ['H264', 'H265', 'MJPG'] },
  { id: 'displayTypes', name: '屏显类型', type: 'checkbox', options: ['文字', '背景图', '图片', '视频'] },
  { id: 'speakerEncodeTypes', name: '喇叭编码方式', type: 'checkbox', options: ['PCM', 'G711A', 'g711u', 'ACC'] },
  { id: 'speakerSampleDepth', name: '喇叭采样位深', type: 'radio', options: ['16bit', '24bit'] },
  { id: 'speakerSampleRate', name: '喇叭采样率', type: 'radio', options: ['8000', '16000', '44100', '48000'] },
  { id: 'speakerChannels', name: '喇叭声道数', type: 'radio', options: ['单声道', '双声道'] },
  { id: 'micEncodeTypes', name: '麦克风编码方式', type: 'checkbox', options: ['PCM', 'G711A', 'G711U', 'AAC', 'MP3'] },
  { id: 'micDefaultEncode', name: '麦克风默认编码', type: 'select', options: ['PCM', 'G711A', 'G711U', 'AAC', 'MP3'] },
  { id: 'micSampleDepth', name: '麦克风采样位深', type: 'radio', options: ['16bit', '24bit'] },
  { id: 'micSampleRate', name: '麦克风采样率', type: 'radio', options: ['8000', '16000', '44100', '48000'] },
  { id: 'micChannels', name: '麦克风声道数', type: 'radio', options: ['单声道', '双声道'] }
]

// ===== 镜头配置 =====
const activeCameraIdx = ref(0)

const cameraList = ref([
  { id: 1, name: 'Camera_ 1', capabilityConfig: defaultLensCapabilityConfig(), standardCaps: [], customCaps: [] }
])

const activeCamera = computed(() => cameraList.value[activeCameraIdx.value] || null)

function addCamera() {
  const idx = cameraList.value.length + 1
  cameraList.value.push({ id: Date.now(), name: `Camera_ ${idx}`, capabilityConfig: defaultLensCapabilityConfig(), standardCaps: [], customCaps: [] })
  activeCameraIdx.value = cameraList.value.length - 1
  ElMessage.success(`镜头 Camera_ ${idx} 已添加`)
}

function removeCamera(idx) {
  if (cameraList.value.length <= 1) { ElMessage.warning('至少保留一个镜头'); return }
  cameraList.value.splice(idx, 1)
  if (activeCameraIdx.value >= cameraList.value.length) activeCameraIdx.value = cameraList.value.length - 1
  ElMessage.success('镜头已删除')
}

// 镜头能力穿梭框
const lensCapType = ref('standard')
function openLensCapDialog(type) {
  lensCapType.value = type
  // reuse the same transfer dialog and mechanism
  currentCapType.value = type
  capDialogTitle.value = type === 'standard' ? '添加标准能力' : '添加自定义能力'
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedLeftModules.value = capModules.map(m => m.id)
  capDialogVisible.value = true
}

// ===== 麦克风配置 =====
const micList = ref([
  { id: 1, name: 'Microphone_ 1', capabilityConfig: defaultMicCapabilityConfig(), standardCaps: [], customCaps: [] }
])
const activeMicIdx = ref(0)

const activeMic = computed(() => micList.value[activeMicIdx.value] || null)

function addMic() {
  const idx = micList.value.length + 1
  micList.value.push({ id: Date.now(), name: `Microphone_ ${idx}`, capabilityConfig: defaultMicCapabilityConfig(), standardCaps: [], customCaps: [] })
  activeMicIdx.value = micList.value.length - 1
  ElMessage.success(`Microphone_ ${idx} 已添加`)
}

function removeMic(idx) {
  if (micList.value.length <= 1) { ElMessage.warning('至少保留一个Microphone'); return }
  micList.value.splice(idx, 1)
  if (activeMicIdx.value >= micList.value.length) activeMicIdx.value = micList.value.length - 1
}

const micCapType = ref('standard')
function openMicCapDialog(type) {
  micCapType.value = type
  currentCapType.value = type
  capDialogTitle.value = type === 'standard' ? '添加标准能力' : '添加自定义能力'
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedLeftModules.value = capModules.map(m => m.id)
  capDialogVisible.value = true
}

// ===== 标准/自定义能力 =====
const standardCapList = ref([])
const customCapList = ref([])

// ===== 算法配置 — 能力列表 =====
const allCapList = computed(() => [
  ...standardCapList.value.map((c, i) => ({ cap: c, source: 'standard', idx: i })),
  ...customCapList.value.map((c, i) => ({ cap: c, source: 'custom', idx: i }))
])

function deleteCap(index) {
  const item = allCapList.value[index]
  if (!item) return
  if (item.source === 'standard') standardCapList.value.splice(item.idx, 1)
  else customCapList.value.splice(item.idx, 1)
}

const capTypeMap = { prop: '属性', svc: '服务', evt: '事件' }
function capTypeLabel(t) { return capTypeMap[t] || t }

function dataTypeLabel(cap) {
  if (cap.capType === 'prop') {
    const m = { enum: '枚举型', int: '数值型', boolean: '布尔型', string: '字符串', array: '数组型', struct: '结构体型' }
    return m[cap.dataDef?.dataType] || ''
  }
  if (cap.capType === 'svc') return '服务'
  if (cap.capType === 'evt') return '事件'
  return ''
}

// ===== 能力参数编辑/创建弹窗 =====
const algoCapEditVisible = ref(false)
const algoCapEditRef = ref(null)
const isAlgoCreateMode = ref(false)
const editCapType = computed(() => isAlgoCreateMode.value ? algoCapEditForm.capType : algoCapEditRef.value?.cap?.capType)

const algoCapEditForm = reactive({
  capType: 'prop', name: '', identifier: '',
  descr: '', accessMode: 'rw', defaultVal: '',
  dataType: 'int', enumValues: [], min: 0, max: 100, step: 1, unit: '',
  trueLabel: '开启', falseLabel: '关闭', maxLength: 64,
  elementType: 'int', arrayMaxLength: 100, fields: [],
  eventType: 'info', inputParams: [], outputParams: []
})

function resetAlgoCapForm() {
  algoCapEditForm.capType = 'prop'
  algoCapEditForm.name = ''
  algoCapEditForm.identifier = ''
  algoCapEditForm.descr = ''
  algoCapEditForm.accessMode = 'rw'
  algoCapEditForm.dataType = 'int'
  algoCapEditForm.defaultVal = ''
  algoCapEditForm.enumValues = [{ name: '', val: 0 }]
  algoCapEditForm.min = 0; algoCapEditForm.max = 100; algoCapEditForm.step = 1; algoCapEditForm.unit = ''
  algoCapEditForm.trueLabel = '开启'; algoCapEditForm.falseLabel = '关闭'; algoCapEditForm.maxLength = 64
  algoCapEditForm.elementType = 'int'; algoCapEditForm.arrayMaxLength = 100; algoCapEditForm.fields = []
  algoCapEditForm.eventType = 'info'; algoCapEditForm.inputParams = []; algoCapEditForm.outputParams = []
}

function getDefaultDataDef() {
  const f = algoCapEditForm
  if (f.capType === 'prop') {
    const base = { dataType: f.dataType, accessMode: f.accessMode }
    switch (f.dataType) {
      case 'enum': return { ...base, enumValues: [{ name: '', val: 0 }], defaultVal: '' }
      case 'int': return { ...base, min: 0, max: 100, step: 1, unit: '', defaultVal: 0 }
      case 'boolean': return { ...base, trueLabel: '开启', falseLabel: '关闭', defaultVal: '0' }
      case 'string': return { ...base, maxLength: 64, defaultVal: '' }
      case 'array': return { ...base, elementType: 'int', arrayMaxLength: 100, fields: [] }
      case 'struct': return { ...base, fields: [] }
      default: return base
    }
  }
  if (f.capType === 'svc') return { inputParams: [], outputParams: [] }
  if (f.capType === 'evt') return { eventType: 'info', outputParams: [] }
  return {}
}

function onAlgoCapTypeChange(type) {
  algoCapEditForm.capType = type
  Object.assign(algoCapEditForm, getDefaultDataDef())
}

function onAlgoDataTypeChange() {
  const def = getDefaultDataDef()
  Object.keys(def).forEach(k => { if (k !== 'dataType' && k !== 'accessMode') algoCapEditForm[k] = def[k] })
}

function openCustomCapCreate() {
  isAlgoCreateMode.value = true
  algoCapEditRef.value = null
  resetAlgoCapForm()
  algoCapEditVisible.value = true
}

function openAlgoCapEdit(item) {
  isAlgoCreateMode.value = false
  algoCapEditRef.value = item
  const cap = item.cap
  const dd = cap.dataDef || {}
  algoCapEditForm.capType = cap.capType
  algoCapEditForm.name = cap.name
  algoCapEditForm.identifier = cap.identifier
  algoCapEditForm.descr = cap.descr || ''
  if (cap.capType === 'prop') {
    algoCapEditForm.dataType = dd.dataType || ''
    algoCapEditForm.accessMode = dd.accessMode || 'rw'
    algoCapEditForm.defaultVal = dd.defaultVal ?? ''
    algoCapEditForm.enumValues = dd.enumValues ? JSON.parse(JSON.stringify(dd.enumValues)) : [{ name: '', val: 0 }]
    algoCapEditForm.min = dd.min ?? 0; algoCapEditForm.max = dd.max ?? 100; algoCapEditForm.step = dd.step ?? 1; algoCapEditForm.unit = dd.unit || ''
    algoCapEditForm.trueLabel = dd.trueLabel || '开启'; algoCapEditForm.falseLabel = dd.falseLabel || '关闭'
    algoCapEditForm.maxLength = dd.maxLength ?? 64
    algoCapEditForm.elementType = dd.elementType || 'int'; algoCapEditForm.arrayMaxLength = dd.arrayMaxLength ?? 100
    algoCapEditForm.fields = dd.fields ? JSON.parse(JSON.stringify(dd.fields)) : []
  } else if (cap.capType === 'svc') {
    algoCapEditForm.inputParams = JSON.parse(JSON.stringify(dd.inputParams || []))
    algoCapEditForm.outputParams = JSON.parse(JSON.stringify(dd.outputParams || []))
  } else {
    algoCapEditForm.eventType = dd.eventType || 'info'
    algoCapEditForm.outputParams = JSON.parse(JSON.stringify(dd.outputParams || []))
  }
  algoCapEditVisible.value = true
}

function buildDataDefFromForm() {
  const f = algoCapEditForm
  if (f.capType === 'prop') {
    const dd = { dataType: f.dataType, accessMode: f.accessMode, defaultVal: f.defaultVal }
    if (f.dataType === 'enum') dd.enumValues = f.enumValues.filter(ev => ev.name.trim())
    else if (f.dataType === 'int') { dd.min = f.min; dd.max = f.max; dd.step = f.step; dd.unit = f.unit }
    else if (f.dataType === 'boolean') { dd.trueLabel = f.trueLabel; dd.falseLabel = f.falseLabel }
    else if (f.dataType === 'string') dd.maxLength = f.maxLength
    else if (f.dataType === 'array') { dd.elementType = f.elementType; dd.arrayMaxLength = f.arrayMaxLength; if (f.elementType === 'struct') dd.fields = f.fields.filter(fi => fi.name.trim()) }
    else if (f.dataType === 'struct') dd.fields = f.fields.filter(fi => fi.name.trim())
    return dd
  }
  if (f.capType === 'svc') return { inputParams: f.inputParams, outputParams: f.outputParams }
  if (f.capType === 'evt') return { eventType: f.eventType, outputParams: f.outputParams }
  return {}
}

function saveAlgoCapEdit() {
  if (isAlgoCreateMode.value) {
    if (!algoCapEditForm.name.trim()) { ElMessage.warning('请输入能力名称'); return }
    if (!algoCapEditForm.identifier.trim()) { ElMessage.warning('请输入能力标识'); return }
    const cap = {
      id: Date.now() + Math.random(),
      capType: algoCapEditForm.capType,
      name: algoCapEditForm.name.trim(),
      identifier: algoCapEditForm.identifier.trim(),
      descr: algoCapEditForm.descr.trim(),
      dataDef: buildDataDefFromForm()
    }
    customCapList.value.push(cap)
    ElMessage.success('自定义能力已创建')
  } else {
    const cap = algoCapEditRef.value?.cap
    if (!cap) return
    cap.descr = algoCapEditForm.descr.trim()
    cap.dataDef = buildDataDefFromForm()
    ElMessage.success('参数已更新')
  }
  algoCapEditVisible.value = false
}

// ===== 参数编辑子弹窗 =====
const paramDialogVisible = ref(false)
const paramFormRef = ref(null)
const editingParamTarget = ref('output')
const editingParamIdx = ref(-1)

const paramForm = reactive({
  name: '', identifier: '', dataType: 'boolean',
  min: 0, max: 100, step: 1, unit: '',
  maxLength: 64, elementType: 'int', arrayMaxLength: 10, trueLabel: '是', falseLabel: '否',
  defaultVal: '',
  enumValues: [{ name: '', val: 0 }]
})

function paramTypeLabel(t) { const m = { int: 'Int', string: 'String', boolean: 'Boolean', enum: 'Enum', array: 'Array' }; return m[t] || t }

const paramDialogTitle = computed(() => {
  if (editingParamTarget.value === 'field') return editingParamIdx.value >= 0 ? '编辑结构体字段' : '添加结构体字段'
  const prefix = editingParamTarget.value === 'input' ? '输入' : '输出'
  return editingParamIdx.value >= 0 ? `编辑${prefix}参数` : `添加${prefix}参数`
})

function resetParamForm() {
  paramForm.name = ''; paramForm.identifier = ''; paramForm.dataType = 'boolean'
  paramForm.min = 0; paramForm.max = 100; paramForm.step = 1; paramForm.unit = ''
  paramForm.maxLength = 64; paramForm.elementType = 'int'; paramForm.arrayMaxLength = 10
  paramForm.trueLabel = '是'; paramForm.falseLabel = '否'; paramForm.defaultVal = ''
  paramForm.enumValues = [{ name: '', val: 0 }]
}

function openAddParam(target) {
  editingParamTarget.value = target; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}

function openEditParam(target, idx) {
  editingParamTarget.value = target; editingParamIdx.value = idx
  const p = target === 'field' ? algoCapEditForm.fields[idx] : algoCapEditForm[target + 'Params'][idx]
  paramForm.name = p.name || ''; paramForm.identifier = p.identifier || ''; paramForm.dataType = p.dataType || 'boolean'
  if (p.dataType === 'int') {
    paramForm.min = p.min || 0; paramForm.max = p.max || 100; paramForm.step = p.step || 1; paramForm.unit = p.unit || ''
  }
  paramForm.maxLength = p.maxLength || 64
  if (p.dataType === 'array') {
    paramForm.elementType = p.elementType || 'int'; paramForm.arrayMaxLength = p.maxLength || 10
  } else {
    paramForm.elementType = 'int'; paramForm.arrayMaxLength = 10
  }
  paramForm.trueLabel = p.trueLabel || '是'; paramForm.falseLabel = p.falseLabel || '否'
  paramForm.defaultVal = p.defaultVal || ''
  paramForm.enumValues = p.enumValues ? JSON.parse(JSON.stringify(p.enumValues)) : [{ name: '', val: 0 }]
  paramDialogVisible.value = true
}

function openAddStructField() {
  editingParamTarget.value = 'field'; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}

function openEditStructField(idx) {
  openEditParam('field', idx)
}

function buildParam() {
  const p = { name: paramForm.name.trim(), identifier: paramForm.identifier.trim(), dataType: paramForm.dataType }
  if (paramForm.dataType === 'int') {
    p.min = paramForm.min; p.max = paramForm.max; p.step = paramForm.step; p.unit = paramForm.unit
  } else if (paramForm.dataType === 'string') {
    p.maxLength = paramForm.maxLength
  } else if (paramForm.dataType === 'boolean') {
    p.trueLabel = paramForm.trueLabel; p.falseLabel = paramForm.falseLabel
  } else if (paramForm.dataType === 'enum') {
    p.enumValues = paramForm.enumValues.filter(ev => ev.name.trim())
  } else if (paramForm.dataType === 'array') {
    p.elementType = paramForm.elementType; p.maxLength = paramForm.arrayMaxLength
  }
  return p
}

function handleParamConfirm() {
  if (!paramForm.name.trim() || !paramForm.identifier.trim()) {
    ElMessage.warning('请填写完整参数信息'); return
  }
  const param = buildParam()
  if (editingParamTarget.value === 'field') {
    if (!algoCapEditForm.fields) algoCapEditForm.fields = []
    if (editingParamIdx.value >= 0) {
      algoCapEditForm.fields[editingParamIdx.value] = param
    } else {
      algoCapEditForm.fields.push(param)
    }
  } else {
    const key = editingParamTarget.value + 'Params'
    if (editingParamIdx.value >= 0) {
      algoCapEditForm[key][editingParamIdx.value] = param
    } else {
      algoCapEditForm[key].push(param)
    }
  }
  paramDialogVisible.value = false
}

function dataDefSummary(dd) {
  if (!dd) return '—'
  if (dd.dataType === 'enum' && dd.enumValues) return '枚举: ' + dd.enumValues.map(e => e.name).join(' / ')
  if (dd.dataType === 'boolean') return '布尔型'
  if (dd.dataType === 'int') return `整数 (${dd.min || 0}~${dd.max || 100}${dd.unit ? ' ' + dd.unit : ''})`
  if (dd.dataType === 'event') return '事件' + (dd.eventType ? ` (${dd.eventType})` : '')
  if (dd.dataType === 'service') return '服务'
  return dd.dataType || '—'
}

// ===== 能力模块 =====
const capModules = [
  { id: 'record', name: '录制模式模块', identifier: 'RecordModule' },
  { id: 'basic', name: '基础设置模块', identifier: 'BasicModule' },
  { id: 'intercom', name: '对讲模块', identifier: 'IntercomModule' },
  { id: 'system', name: '系统管理模块', identifier: 'SystemModule' },
  { id: 'event', name: '事件侦测模块', identifier: 'EventModule' },
  { id: 'ptz', name: '云台模块', identifier: 'PTZModule' },
  { id: 'ai', name: 'AI算法模块', identifier: 'AIModule' }
]

const libCapabilities = [
  { capType: 'prop', name: '录像开关', identifier: 'record_switch', descr: '控制设备录像功能的启用与关闭', dataDef: { dataType: 'boolean' }, moduleId: 'record', moduleName: '录制模式模块' },
  { capType: 'prop', name: '夜视模式', identifier: 'night_vision', descr: '夜视模式切换', dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{ name: '自动', val: 0 }, { name: '强制', val: 1 }, { name: '关闭', val: 2 }] }, moduleId: 'basic', moduleName: '基础设置模块' },
  { capType: 'prop', name: '音量控制', identifier: 'volume', descr: '设备扬声器音量调节', dataDef: { dataType: 'int', accessMode: 'rw', min: 0, max: 100, unit: '%' }, moduleId: 'intercom', moduleName: '对讲模块' },
  { capType: 'svc', name: '远程重启', identifier: 'remote_reboot', descr: '远程控制设备重新启动', dataDef: { dataType: 'service', inputParams: [], outputParams: [{ name: '结果', identifier: 'result', dataType: 'boolean' }] }, moduleId: 'system', moduleName: '系统管理模块' },
  { capType: 'evt', name: '电量不足告警', identifier: 'low_battery', descr: '电量低于阈值时上报', dataDef: { dataType: 'event', eventType: 'alarm', outputParams: [{ name: '电量', identifier: 'battery', dataType: 'int', min: 0, max: 100, unit: '%' }] }, moduleId: 'event', moduleName: '事件侦测模块' },
  { capType: 'svc', name: '云台控制', identifier: 'ptz_control', descr: '控制设备云台旋转/倾斜', dataDef: { dataType: 'service', inputParams: [{ name: '方向', identifier: 'direction', dataType: 'enum', enumValues: [{ name: '上', val: 0 }, { name: '下', val: 1 }, { name: '左', val: 2 }, { name: '右', val: 3 }] }], outputParams: [] }, moduleId: 'ptz', moduleName: '云台模块' },
  { capType: 'prop', name: '人脸识别', identifier: 'face_detect', descr: '是否启用人脸检测与识别', dataDef: { dataType: 'boolean' }, moduleId: 'ai', moduleName: 'AI算法模块' },
  { capType: 'prop', name: '声音检测', identifier: 'sound_detect', descr: '检测异常声音并触发告警', dataDef: { dataType: 'boolean' }, moduleId: 'event', moduleName: '事件侦测模块' },
  { capType: 'svc', name: '固件升级', identifier: 'firmware_upgrade', descr: '远程触发设备固件OTA升级', dataDef: { dataType: 'service', inputParams: [{ name: '固件URL', identifier: 'firmware_url', dataType: 'string' }], outputParams: [{ name: '状态', identifier: 'status', dataType: 'enum', enumValues: [{ name: '成功', val: 0 }, { name: '失败', val: 1 }] }] }, moduleId: 'system', moduleName: '系统管理模块' },
  { capType: 'prop', name: '隐私模式', identifier: 'privacy_mode', descr: '隐私模式开关', dataDef: { dataType: 'boolean' }, moduleId: 'basic', moduleName: '基础设置模块' }
]

// ===== 自定义导入穿梭框 =====
const capDialogVisible = ref(false)
const capDialogTitle = ref('添加标准能力')
const importSelectedIds = ref([])
const importCheckedIds = ref([])
const importSearchText = ref('')
const expandedLeftModules = ref([])
const expandedModules = ref([])
const currentCapType = ref('standard')
const algoCapScope = ref(null) // editing algorithm when algo config is active, for scoping capability transfer

function buildModuleGroups(capList) {
  const moduleMap = {}
  const orphanCaps = []
  capList.forEach(cap => {
    const mod = capModules.find(m => m.id === cap.moduleId)
    if (mod) {
      if (!moduleMap[cap.moduleId]) moduleMap[cap.moduleId] = { id: mod.id, name: mod.name + ' (' + mod.identifier + ')', caps: [] }
      moduleMap[cap.moduleId].caps.push(cap)
    } else {
      orphanCaps.push(cap)
    }
  })
  const groups = capModules
    .filter(m => moduleMap[m.id]?.caps.length)
    .map(m => ({ id: m.id, name: m.name + ' (' + m.identifier + ')', caps: moduleMap[m.id].caps }))
  if (orphanCaps.length) groups.push({ id: '_other', name: '其他', caps: orphanCaps })
  return groups
}

function getExistingIds() {
  if (algoCapScope.value) {
    return new Set(standardCapList.value.map(c => c.identifier).concat(customCapList.value.map(c => c.identifier)))
  }
  if (activeFuncTab.value === 'lens' && activeCamera.value) {
    return new Set(activeCamera.value.standardCaps.map(c => c.identifier).concat(activeCamera.value.customCaps.map(c => c.identifier)))
  }
  if (activeFuncTab.value === 'mic' && activeMic.value) {
    return new Set(activeMic.value.standardCaps.map(c => c.identifier).concat(activeMic.value.customCaps.map(c => c.identifier)))
  }
  return new Set(standardCapList.value.map(c => c.identifier).concat(customCapList.value.map(c => c.identifier)))
}

function getAlgoCapPool() {
  // Returns the capability pool scoped to the current algo config context
  if (!algoCapScope.value) return null
  const modules = getModules()
  const modMap = Object.fromEntries(modules.map(m => [m.id, m]))
  const normalize = (cap) => ({
    capType: cap.capType,
    name: cap.name,
    identifier: cap.identifier,
    descr: cap.descr || '',
    dataDef: cap.dataDef || {},
    moduleId: String(cap.moduleId),
    moduleName: modMap[cap.moduleId]?.name || ''
  })
  if (currentCapType.value === 'standard') {
    const ids = (() => { try { return JSON.parse(algoCapScope.value.capabilityIds || '[]') } catch { return [] } })()
    return getCapabilitiesByIds(ids).map(normalize)
  }
  // custom: all thing-model capabilities not already in standard scope
  const stdIds = new Set((() => { try { return JSON.parse(algoCapScope.value.capabilityIds || '[]') } catch { return [] } })())
  return getAllCapabilities().filter(c => !stdIds.has(c.identifier)).map(normalize)
}

const importAvailableByModule = computed(() => {
  const pool = getAlgoCapPool() || libCapabilities
  const existingIds = getExistingIds()
  const excludedIds = new Set([...existingIds, ...importSelectedIds.value])
  const available = pool.filter(c => !excludedIds.has(c.identifier))
  return buildModuleGroups(available)
})

const importSelectedByModule = computed(() => {
  const pool = getAlgoCapPool() || libCapabilities
  const caps = importSelectedIds.value.map(id => pool.find(c => c.identifier === id)).filter(Boolean)
  return buildModuleGroups(caps)
})

function isImportCapVisible(cap) {
  if (!importSearchText.value) return true
  const kw = importSearchText.value.toLowerCase()
  return cap.name.toLowerCase().includes(kw) || cap.identifier.toLowerCase().includes(kw)
}

function toggleImportCheck(id) {
  const idx = importCheckedIds.value.indexOf(id)
  if (idx > -1) importCheckedIds.value.splice(idx, 1)
  else importCheckedIds.value.push(id)
}

function toggleLeftModuleExpand(modId) {
  const idx = expandedLeftModules.value.indexOf(modId)
  if (idx > -1) expandedLeftModules.value.splice(idx, 1)
  else expandedLeftModules.value.push(modId)
}

function toggleModuleExpand(modId) {
  const idx = expandedModules.value.indexOf(modId)
  if (idx > -1) expandedModules.value.splice(idx, 1)
  else expandedModules.value.push(modId)
}

function getVisibleCaps(mod) {
  if (!importSearchText.value) return mod.caps
  return mod.caps.filter(c => isImportCapVisible(c))
}

function isModuleAllChecked(mod) {
  const visible = getVisibleCaps(mod)
  return visible.length > 0 && visible.every(c => importCheckedIds.value.includes(c.identifier))
}

function isModuleIndeterminate(mod) {
  const visible = getVisibleCaps(mod)
  const checked = visible.filter(c => importCheckedIds.value.includes(c.identifier))
  return checked.length > 0 && checked.length < visible.length
}

function toggleModuleAllCheck(mod) {
  const visible = getVisibleCaps(mod)
  if (isModuleAllChecked(mod)) {
    visible.forEach(c => { importCheckedIds.value = importCheckedIds.value.filter(id => id !== c.identifier) })
  } else {
    visible.forEach(c => { if (!importCheckedIds.value.includes(c.identifier)) importCheckedIds.value.push(c.identifier) })
  }
}

function transferToRight() {
  importCheckedIds.value.forEach(id => {
    if (!importSelectedIds.value.includes(id)) importSelectedIds.value.push(id)
    // expand target module
    const cap = libCapabilities.find(c => c.identifier === id)
    if (cap?.moduleId && !expandedModules.value.includes(cap.moduleId)) expandedModules.value.push(cap.moduleId)
  })
  importCheckedIds.value = []
}

function transferToLeft() {
  importSelectedIds.value = []
}

function removeFromSelected(id) {
  importSelectedIds.value = importSelectedIds.value.filter(i => i !== id)
}

function openCapabilityDialog(type) {
  currentCapType.value = type
  capDialogTitle.value = type === 'standard' ? '添加标准能力 — 导入能力' : '添加自定义能力 — 导入能力'
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedLeftModules.value = capModules.map(m => m.id)
  expandedModules.value = []
  capDialogVisible.value = true
}

function getCapTarget() {
  // Determine the target array for capability addition based on active tab
  if (activeFuncTab.value === 'lens' && activeCamera.value) {
    return lensCapType.value === 'standard' ? activeCamera.value.standardCaps : activeCamera.value.customCaps
  }
  if (activeFuncTab.value === 'mic' && activeMic.value) {
    return micCapType.value === 'standard' ? activeMic.value.standardCaps : activeMic.value.customCaps
  }
  return currentCapType.value === 'standard' ? standardCapList.value : customCapList.value
}

function handleImportConfirm() {
  if (!importSelectedIds.value.length) { ElMessage.warning('请选择要添加的能力'); return }
  const target = getCapTarget()
  const pool = getAlgoCapPool() || libCapabilities
  importSelectedIds.value.forEach(key => {
    const c = pool.find(c => c.identifier === key)
    if (!c) return
    const newCap = {
      id: Date.now() + Math.random(), capType: c.capType, name: c.name,
      identifier: c.identifier, descr: c.descr, dataType: c.dataDef?.dataType || '—',
      dataDef: JSON.parse(JSON.stringify(c.dataDef)), moduleName: c.moduleName
    }
    target.push(newCap)
  })
  ElMessage.success(`已添加 ${importSelectedIds.value.length} 项能力`)
  capDialogVisible.value = false
}

const currentCapList = computed(() => currentCapType.value === 'standard' ? standardCapList : customCapList)

function editCapability(row, idx) {
  openAlgoCapEdit({ cap: row, source: currentCapType.value, idx })
}

function removeCapability(idx) {
  currentCapList.value.splice(idx, 1)
  ElMessage.success('已删除')
}

// ===== Tab 2: 事件配置 =====
const eventConfigList = ref([])

function loadEventConfig() {
  const res = allEvents()
  eventConfigList.value = (res.data?.list || []).map(e => {
    try { e._name = JSON.parse(e.eventName || '{}') } catch { e._name = {} }
    return { ...e, supported: false, descr: e.eventRemark || '' }
  })
}

function saveEventTab() { ElMessage.success('事件配置已保存'); currentStep.value = 2 }

// ===== Tab 3: 算法 =====
const algoList = ref([])

function loadAlgorithms() {
  const res = listAlgorithms({ pageSize: 200 })
  const rows = []
  ;(res.data?.list || []).forEach(a => {
    try { a._name = JSON.parse(a.algorithmName || '{}') } catch { a._name = {} }
    try { a._eventIds = JSON.parse(a.eventIds || '[]') } catch { a._eventIds = [] }
    const hasConfig = (() => { try { return JSON.parse(a.capabilityIds || '[]').length > 0 } catch { return false } })()
    const algoEvents = getAlgorithmEvents(a.algorithmId)
    // 获取该算法对应的所有服务
    const services = getAllAlgorithmServices(a.algorithmId)
    if (services.length === 0) {
      // 无服务映射 → 单行占位
      rows.push({
        ...a,
        serviceId: a.serviceId || '-',
        serviceName: '',
        supported: false,
        free: false,
        boundPackage: '',
        hasConfig,
        algoOptions: [],
        linkedEvents: algoEvents,
        standardCaps: [],
        customCaps: [],
        _rowSpan: 1,
        _isFirstRow: true
      })
    } else {
      services.forEach((svc, si) => {
        rows.push({
          ...a,
          serviceId: svc.serviceId,
          serviceName: svc.name,
          supported: false,
          free: false,
          boundPackage: '',
          hasConfig,
          algoOptions: [],
          linkedEvents: algoEvents,
          standardCaps: [],
          customCaps: [],
          _rowSpan: services.length,
          _isFirstRow: si === 0
        })
      })
    }
  })
  algoList.value = rows
}

// 合并算法级单元格（算法ID/名称/描述/能力配置/关联事件）
function algoSpanMethod({ columnIndex, row }) {
  // 算法级列: 0=算法ID, 1=算法名称, 2=描述, 3=能力配置, 4=关联事件
  if (columnIndex <= 4) {
    if (row._isFirstRow) {
      return { rowspan: row._rowSpan, colspan: 1 }
    }
    return { rowspan: 0, colspan: 0 }
  }
  return { rowspan: 1, colspan: 1 }
}

// ===== 步骤3: 平台服务 =====
const platformServices = ref([])

function parseI18nName(jsonStr) {
  try { return JSON.parse(jsonStr || '{}')['1'] || '' } catch { return '' }
}

function getAlgoNamesForService(serviceId) {
  const svcs = listServices().data?.list || []
  const svc = svcs.find(s => s.serviceId === serviceId)
  if (!svc || !svc.algorithmIds?.length) return []
  const algos = listAlgorithms({ page: 1, pageSize: 999 }).data?.list || []
  return svc.algorithmIds
    .map(aid => algos.find(a => a.algorithmId === aid))
    .filter(Boolean)
    .map(a => parseI18nName(a.algorithmName) || a.algorithmId)
}

function loadPlatformServices() {
  const rows = []
  cloudRecordServices.value.forEach(svc => {
    rows.push({ serviceId: svc.serviceId, serviceName: svc.name, descr: svc.descr || '', supported: svc.supported, algoNames: getAlgoNamesForService(svc.serviceId) })
  })
  cloudSnapshotServices.value.forEach(svc => {
    rows.push({ serviceId: svc.serviceId, serviceName: svc.name, descr: svc.descr || '', supported: svc.supported, algoNames: getAlgoNamesForService(svc.serviceId) })
  })
  oldAlgoList.value.forEach(item => {
    rows.push({ serviceId: item.serviceId, serviceName: item.name, descr: item.descr || '', supported: item.supported, algoNames: getAlgoNamesForService(item.serviceId) })
  })
  platformServices.value = rows
}

const cloudRecordServices = ref([
  { serviceId: '300010', name: '事件云存', supported: true, descr: '事件录像：产生告警时触发录像' },
  { serviceId: '300011', name: '全天云存', supported: true, descr: '全天录像：全天24小时持续录像' }
])

const cloudSnapshotServices = ref([
  { serviceId: '300012', name: '鸟类检测', supported: false, descr: '云端抓图-鸟类识别与分类' },
  { serviceId: '300013', name: '松鼠检测', supported: false, descr: '云端抓图-松鼠识别与分类' }
])

const oldAlgoList = ref([
  { id: '1013', name: '全能AI', serviceId: '300051', descr: '集成多种AI算法服务', supported: true, hasConfig: true },
  { id: '1093', name: '离线监控', serviceId: '300008', descr: '设备断电或离线时的状态监测', supported: true, hasConfig: true },
  { id: '1096', name: '智能告警-儿童检测', serviceId: '300044', descr: '综合全天候的儿童看护识别', supported: false, hasConfig: true },
  { id: '1098', name: '智能告警服务', serviceId: '300009', descr: '基于多维参数的综合告警策略', supported: false, hasConfig: true },
  { id: '1103', name: '智能告警-老人看护', serviceId: '300039', descr: '针对老年用户的异常行为识别', supported: false, hasConfig: true },
  { id: '1104', name: '智能告警-厨房监测', serviceId: '300040', descr: '全方位监测厨房油烟和火情', supported: false, hasConfig: true },
  { id: '1105', name: '智能告警-家门检测', serviceId: '300041', descr: '门口逗留、门缝检测等安防预警', supported: false, hasConfig: true },
  { id: '1106', name: '智能告警-宠物检测', serviceId: '300042', descr: '整合宠物的多项健康和活动指标', supported: true, hasConfig: true },
  { id: '1016', name: '逗留提醒', serviceId: '300036', descr: '检测人员逗留并触发提醒', supported: false, hasConfig: true },
  { id: '1061', name: '设备算法', serviceId: '-', descr: '设备端算法能力配置', supported: false, hasConfig: false },
  { id: '2000', name: '短信套餐', serviceId: '300031', descr: '短信通知服务套餐', supported: false, hasConfig: false },
  { id: '2001', name: '去广告套餐', serviceId: '300030', descr: '去除APP内广告展示', supported: false, hasConfig: false }
])

const eventOptions = ref([])

function loadEvents() {
  const res = allEvents()
  eventOptions.value = (res.data?.list || []).map(e => {
    try { e._name = JSON.parse(e.eventName || '{}') } catch { e._name = {} }
    try { e._push = JSON.parse(e.pushCopy || '{}') } catch { e._push = {} }
    return { id: e.eventId, name: e._name?.['1'] || e.eventId, descr: e.eventRemark || '', _push: e._push, _dbId: e.id }
  })
}

const algoConfigVisible = ref(false)
const editingAlgo = ref(null)

// ===== PIR侦测 能力配置 =====
const pirConfigVisible = ref(false)
const pirConfigItems = [
  { key: 'abilitySwitch',   label: '能力开关' },
  { key: 'sensitivity',     label: '灵敏度' },
  { key: 'smartTracking',   label: '智能追踪开关' },
  { key: 'soundAlarm',      label: '声音报警' },
  { key: 'deviceLight',     label: '设备报警灯' },
  { key: 'personDetect',    label: '人形侦测' },
  { key: 'vehicleDetect',   label: '车辆检测' },
  { key: 'petDetect',       label: '宠物检测' },
  { key: 'motionDetect',    label: '移动检测' },
  { key: 'scheduledDetect', label: '定时设置' },
  { key: 'zoneDetect',      label: '自定义区域' }
]
const pirConfigForm = reactive({
  abilitySwitch:   { supported: '1', defaultVal: '1' },
  sensitivity:     { supported: '1', defaultVal: '3' },
  smartTracking:   { supported: '0', defaultVal: '0' },
  soundAlarm:      { supported: '1', defaultVal: '1' },
  deviceLight:     { supported: '1', defaultVal: '0' },
  personDetect:    { supported: '1', defaultVal: '1' },
  vehicleDetect:   { supported: '0', defaultVal: '0' },
  petDetect:       { supported: '0', defaultVal: '0' },
  motionDetect:    { supported: '1', defaultVal: '1' },
  scheduledDetect: { supported: '0', defaultVal: '0' },
  zoneDetect:      { supported: '0', defaultVal: '0' }
})

function savePirConfig() {
  if (editingAlgo.value) {
    editingAlgo.value._pirConfig = JSON.parse(JSON.stringify(pirConfigForm))
    editingAlgo.value.standardCaps = JSON.parse(JSON.stringify(standardCapList.value))
    editingAlgo.value.customCaps = JSON.parse(JSON.stringify(customCapList.value))
  }
  ElMessage.success('PIR侦测能力配置已保存')
  pirConfigVisible.value = false
  algoCapScope.value = null
}

function openAlgoConfig(row) {
  if (row.algorithmId === '4003') {
    editingAlgo.value = row
    algoCapScope.value = row
    // Reset PIR config from row data or defaults
    if (row._pirConfig) {
      Object.keys(pirConfigForm).forEach(key => {
        if (row._pirConfig[key]) {
          pirConfigForm[key].supported = row._pirConfig[key].supported
          pirConfigForm[key].defaultVal = row._pirConfig[key].defaultVal
        }
      })
    }
    // Initialize standard/custom caps from algorithm library
    if (!row.standardCaps || row.standardCaps.length === 0) {
      const ids = (() => { try { return JSON.parse(row.capabilityIds || '[]') } catch { return [] } })()
      const modules = getModules()
      const modMap = Object.fromEntries(modules.map(m => [m.id, m]))
      row.standardCaps = getCapabilitiesByIds(ids).map(c => ({
        id: Date.now() + Math.random(), capType: c.capType, name: c.name,
        identifier: c.identifier, descr: c.descr || '', dataType: c.dataDef?.dataType || '—',
        dataDef: JSON.parse(JSON.stringify(c.dataDef)),
        moduleName: modMap[c.moduleId]?.name || ''
      }))
    }
    standardCapList.value = JSON.parse(JSON.stringify(row.standardCaps || []))
    customCapList.value = JSON.parse(JSON.stringify(row.customCaps || []))
    pirConfigVisible.value = true
    return
  }
  editingAlgo.value = row
  algoCapScope.value = row
  // Initialize standard caps from algorithm library on first open
  if (!row.standardCaps || row.standardCaps.length === 0) {
    const ids = (() => { try { return JSON.parse(row.capabilityIds || '[]') } catch { return [] } })()
    const modules = getModules()
    const modMap = Object.fromEntries(modules.map(m => [m.id, m]))
    row.standardCaps = getCapabilitiesByIds(ids).map(c => ({
      id: Date.now() + Math.random(), capType: c.capType, name: c.name,
      identifier: c.identifier, descr: c.descr || '', dataType: c.dataDef?.dataType || '—',
      dataDef: JSON.parse(JSON.stringify(c.dataDef)),
      moduleName: modMap[c.moduleId]?.name || ''
    }))
  }
  standardCapList.value = JSON.parse(JSON.stringify(row.standardCaps || []))
  customCapList.value = JSON.parse(JSON.stringify(row.customCaps || []))
  algoConfigVisible.value = true
  // list populated from algorithm's standardCaps/customCaps
}
function saveAlgoConfig() {
  if (editingAlgo.value) {
    editingAlgo.value.standardCaps = JSON.parse(JSON.stringify(standardCapList.value))
    editingAlgo.value.customCaps = JSON.parse(JSON.stringify(customCapList.value))
  }
  ElMessage.success('算法配置已保存')
  algoConfigVisible.value = false
  algoCapScope.value = null
}
function saveAlgoTab() { ElMessage.success('设备算法服务已保存'); currentStep.value = 3 }
function savePlatformTab() { ElMessage.success('平台服务配置已保存'); currentStep.value = 4 }

const eventLinkVisible = ref(false)
const eventTableRef = ref(null)
const linkedEventOptions = computed(() => {
  if (!editingAlgo.value) return []
  const allSvcEventIds = getAlgorithmEvents(editingAlgo.value.algorithmId)
  return eventOptions.value.filter(e => allSvcEventIds.includes(e.id))
})
function handleEventSelectionChange(rows) {
  if (editingAlgo.value) {
    editingAlgo.value.linkedEvents = rows.map(r => r.id)
  }
}
function openEventLink(row) {
  editingAlgo.value = row
  eventLinkVisible.value = true
  nextTick(() => {
    const table = eventTableRef.value
    if (!table) return
    linkedEventOptions.value.forEach(evt => {
      table.toggleRowSelection(evt, row.linkedEvents.includes(evt.id))
    })
  })
}
function saveEventLink() { ElMessage.success('关联事件已保存'); eventLinkVisible.value = false }

// ===== Tab 3: 语音 =====
const voiceList = ref([
  { alloTType: 1063, platform: 'ALEXA', descr: 'ALEXA', supported: false },
  { alloTType: 1063, platform: 'GOOGLE_HOME', descr: 'GOOGLE_HOME', supported: false }
])

// ===== 套餐绑定 =====
const packageOptions = [
  { id: '300031', name: '短信套餐（300031）' },
  { id: '300030', name: '去广告套餐（300030）' },
  { id: '300010', name: '事件云存（300010）' },
  { id: '300011', name: '全天云存（300011）' }
]

const packageDrawerVisible = ref(false)
const packageDrawerRow = ref(null)

function onFreeChange(row) {
  if (!row.free) row.boundPackage = ''
}

function openPackageDrawer(row) {
  packageDrawerRow.value = row
  packageDrawerVisible.value = true
}

function confirmPackageBinding(pkgId) {
  if (packageDrawerRow.value) {
    packageDrawerRow.value.boundPackage = pkgId
  }
  packageDrawerVisible.value = false
}

function finishDev() {
  ElMessage.success('产品配置已完成，即将返回产品列表')
  setTimeout(() => router.push('/product/development'), 1200)
}

function handleBack() { router.push('/product/development') }
function handleEditProduct() { ElMessage.info('编辑产品基础信息') }

onMounted(() => { loadAlgorithms(); loadEvents(); loadEventConfig(); loadPlatformServices() })
</script>

<style lang="scss" scoped>

// ===== 页面头部 =====
.page-header-bar {
  margin-bottom: 6px;
  :deep(.el-page-header__back) {
    font-size: 14px; color: var(--text-regular);
  }
}

.page-header-title {
  font-weight: 600; font-size: 14px; color: var(--text-primary);
  margin-right: 12px;
}

// ===== 产品信息 =====
.product-info-bar {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 16px;
}

.product-info-left {
  display: flex; align-items: center; gap: 12px;
  .product-name { margin: 0; font-size: 20px; font-weight: 600; color: var(--text-primary); }
}

.product-info-meta {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-secondary);
  .meta-sep { color: var(--border-color); margin: 0 4px; }
}

// ===== 步骤条 =====
.steps-bar {
  background: #F5F7FA;
  padding: 13px 150px;
  margin-bottom: 20px;

  :deep(.el-step__title) {
    cursor: pointer; font-size: 14px; font-weight: 400;
    &.is-process { color: #4992FE; font-weight: 500; }
    &.is-wait { color: #909399; }
  }
  :deep(.el-step__head.is-process) { color: #4992FE; border-color: #4992FE; }
}

// ===== Border-card 设备 Tabs =====
.device-tabs {
  border: 1px solid #DDD;
  background: #fff;

  :deep(.el-tabs__header) {
    background: #F5F7FA;
    border-bottom: 1px solid #E4E7ED;
    margin: 0;
  }
  :deep(.el-tabs__nav) { border: none; }
  :deep(.el-tabs__item) {
    padding: 0 20px; height: 40px; line-height: 40px;
    font-size: 14px; color: #909399; border: none;
    &:hover { color: #4992FE; }
    &.is-active { color: #4992FE; background: #fff; font-weight: 500; }
  }
  :deep(.el-tabs__content) { padding: 20px 24px 0; }
}

// ===== 步骤内容卡片 (步骤1, 步骤2) =====
.step-content-card {
  background: #fff;
  border: 1px solid #DDD;
  padding: 0 0 20px;
}

// ===== Step 按钮栏 =====
.step-btns-bar {
  display: flex; justify-content: center; align-items: center; gap: 12px;
  padding: 16px 20px 13px;
  .w-160 { width: 160px; }
}

// ===== 配置分隔线 =====
.config-divider {
  :deep(.el-divider) { margin: 20px 0; }
  :deep(.el-divider__text) {
    display: flex; align-items: center; gap: 6px;
    color: var(--text-regular); font-weight: 500; font-size: 14px;
  }
}

.tip-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 0 0 16px;
  background: #F0F7FF;
  border: 1px solid #B3D8FF;
  border-radius: 6px;
  font-size: 13px;
  color: #2563EB;
  .el-icon { flex-shrink: 0; font-size: 16px; }
  .tip-bar-toggle {
    margin-left: auto;
    flex-shrink: 0;
    padding: 0;
    font-size: 13px;
  }
}

// ===== APP 控制面板预览（设备能力页内，右侧展开） =====
.device-cap-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.device-cap-main {
  flex: 1;
  min-width: 0;
}

.device-cap-side {
  width: 300px;
  max-width: 300px;
  flex-shrink: 0;
  overflow: hidden;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: max-width 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  max-width: 0;
  opacity: 0;
}


// ===== 配置布局 (分段控件 + 内容) =====
.config-layout {
  display: flex; gap: 24px;
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
    padding: 10px 12px; justify-content: center;
    font-size: 13px; text-align: center;
    border-radius: 4px; color: #606266;
    transition: all .2s;
    &:hover { color: #4992FE; }
    &.is-selected {
      background: #4992FE; color: #fff;
      border-radius: 4px;
    }
  }
}

.config-detail {
  flex: 1; padding: 0;
}

// ===== 配置表单 =====
.config-form {
  :deep(.el-form-item) { margin-bottom: 20px; }
  :deep(.el-form-item__label) {
    color: var(--text-regular); font-weight: 400; font-size: 14px;
  }
  :deep(.el-checkbox) { margin-right: 30px; }
  :deep(.el-checkbox__label) { font-weight: 400; }
  :deep(.el-radio) { margin-right: 24px; }
  :deep(.el-form-item:last-child) { margin-bottom: 0; }
}

// ===== 配置区域 =====
.config-section {
  padding: 0 0 24px;
}

.section-title {
  font-size: 14px; font-weight: 500;
}

.section-subtitle {
  font-size: 14px; font-weight: 600; color: var(--text-primary);
  margin-bottom: 12px;
}

// ===== 能力表格区域 =====
.cap-section {
  padding: 24px 0 0;
  &:first-of-type { border-top: 1px solid var(--border-lighter, #e4e7ed); margin-top: 24px; }
}

.cap-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
  .cap-section-title {
    display: inline-flex; align-items: center;
    margin: 0; font-size: 16px; font-weight: 500; color: var(--text-primary);
  }
  .cap-section-desc {
    font-size: 12px; color: var(--text-placeholder); margin-left: 12px;
  }
}

// ===== 类型标签 =====
.type-tag {
  display: inline-block; padding: 2px 8px; border-radius: 3px;
  font-size: 12px; font-weight: 500; line-height: 1.5;
  &.type-prop { background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff; }
  &.type-svc { background: #f0f9eb; color: #67c23a; border: 1px solid #e1f3d8; }
  &.type-evt { background: #fdf6ec; color: #e6a23c; border: 1px solid #faecd8; }
}

// ===== 算法 =====
.algo-service-section {
  padding: 20px 24px;
  &:first-of-type { border-bottom: 1px solid var(--border-lighter, #e4e7ed); }
  // 合并单元格居中
  .merged-cell {
    font-weight: 500;
  }
}
.algo-service-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  .algo-service-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .algo-service-sub { font-size: 13px; color: var(--text-secondary); }
}

// ===== 镜头/麦克风 =====
.lens-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}

.lens-config-body {
  padding-top: 4px;
}

.lens-actions { display: flex; gap: 12px; }

.camera-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }

// 镜头/码流卡片
.lens-item-card, .stream-item-card {
  margin-top: 16px;
  :deep(.el-card__header) { padding: 12px 16px; }
  :deep(.el-card__body) { padding: 16px 20px; }
}

.card-header-row {
  display: flex; align-items: center;
  .card-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-right: auto; }
}

// 分辨率列表
.resolution-list {
  display: flex; flex-wrap: wrap; gap: 4px 0;
}
.resolution-item {
  width: 50%;
}

// 表单提示
.flex-col { display: flex; flex-direction: column; gap: 4px; }
.form-tip { font-size: 12px; color: var(--text-placeholder); }

.camera-form {
  :deep(.el-card) {
    border: 1px solid var(--border-lighter, #e4e7ed);
    margin-bottom: 12px;
  }
}

// ===== 事件关联 =====
.event-check-item {
  padding: 8px 12px; border-bottom: 1px solid var(--border-lighter, #e4e7ed);
  &:last-child { border-bottom: none; }
  .event-name { font-weight: 500; }
  .event-desc { color: var(--text-secondary); margin-left: 8px; font-size: 13px; }
}

// ===== 穿梭框 =====
.transfer-item {
  display: flex; align-items: center;
  .transfer-meta { margin-left: auto; font-size: 12px; color: var(--text-placeholder); }
}

// ===== 算法配置弹窗 — 列表布局 =====
.algo-config-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.algo-config-count { font-size: 13px; color: var(--text-secondary); }
.algo-config-toolbar-actions { display: flex; gap: 8px; }
.algo-config-empty {
  text-align: center; padding: 40px 0; color: var(--text-placeholder); font-size: 14px;
}
.algo-cap-section { margin-bottom: 16px; }
.algo-cap-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.algo-cap-section-title {
  font-size: 14px; font-weight: 500; color: var(--text-primary);
  padding-left: 4px; border-left: 3px solid var(--el-color-primary);
}

// 能力类型卡片
.type-cards { display: flex; gap: 8px; }
.type-card {
  padding: 0 12px; border: 1px solid var(--border-light);
  border-radius: var(--el-border-radius-base); font-size: 12px; line-height: 26px;
  font-weight: 500; color: var(--text-secondary); background: var(--bg-body);
  &.active { border-color: var(--primary-color); background: var(--primary-bg); color: var(--primary-color); }
}

// 数据定义表单
.enum-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.enum-row { display: flex; align-items: center; gap: 8px; }
.range-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.bool-labels { display: flex; gap: 12px; width: 100%; }
.param-list { width: 100%; }
.param-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border: 1px solid var(--border-light); border-radius: 6px; margin-bottom: 6px;
}
.param-info { flex: 1; min-width: 0; }
.param-name { font-size: 13px; color: var(--text-primary); }
.param-meta { font-size: 11px; color: var(--text-placeholder); margin-left: 8px; }
.param-empty { font-size: 12px; color: var(--text-placeholder); padding: 8px 0; }
.form-hint { display: block; font-size: 11px; color: var(--text-placeholder); margin-bottom: 4px; }

// ===== PIR 配置 =====
.pir-config-section { padding: 0 20px; }
.pir-item-row { display: flex; align-items: center; gap: 8px; }
.pir-item-label { font-size: 12px; color: var(--text-secondary); flex-shrink: 0; }
.pir-item-sep { color: var(--border-light); margin: 0 4px; }

// ===== 通用 =====
.cell-name { font-weight: 500; color: var(--text-primary); font-size: 13px; }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
.cell-service-id { font-size: 13px; color: var(--text-primary); font-weight: 500; }
.text-muted { color: var(--text-placeholder); }
.header-tip-icon { margin-left: 4px; color: var(--text-placeholder); cursor: help; font-size: 14px; }
.empty-state {
  display: flex; align-items: center; justify-content: center;
  padding: 60px 0; color: var(--text-placeholder); font-size: 14px;
}

// 穿梭框搜索栏
.transfer-panel-search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-lighter, #e4e7ed);
  flex-shrink: 0;
}
.transfer-panel-search-placeholder {
  height: 48px; flex-shrink: 0;
  border-bottom: 1px solid var(--border-lighter, #e4e7ed);
}

// 穿梭框箭头按钮统一尺寸
.transfer-arrow-btn {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  :deep(.el-icon) { font-size: 14px; margin: 0; }
}

// ===== 算法服务 新/老 分区标题 =====
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin: 24px 0 12px;
  padding: 0 24px;
  &:first-child { margin-top: 0; }
}
.section-header-title {
  margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary);
}

// ===== 旧版算法卡片 =====
.old-algo-card {
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px 0;
  margin-top: 24px;
}
.legacy-tag {
  display: inline-block; vertical-align: middle;
  margin-left: 10px; padding: 1px 8px; border-radius: 3px;
  font-size: 12px; font-weight: 400; color: #909399;
  background: #f4f4f5; border: 1px solid #e9e9eb;
}

// ===== 老算法服务组 =====
.old-service-group {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-lighter, #e4e7ed);
}
.old-service-title {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}
.old-service-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.aiiot-tag {
  display: inline-block; padding: 2px 8px; border-radius: 3px;
  font-size: 12px; color: #909399; background: #f4f4f5; border: 1px solid #e9e9eb;
}
.old-algo-table {
  margin-top: 20px;
}

</style>

<style lang="scss">
.algo-config-drawer {
  .el-drawer__body { padding: 20px 24px; }
}
.event-link-drawer {
  .el-drawer__body { padding: 20px 24px; }
}
.event-id-code { font-size: 12px; color: var(--text-secondary); background: #f5f7fa; padding: 1px 6px; border-radius: 3px; }
.alg-cap-dialog .el-dialog__body { padding-top: 20px; }
.custom-cap-dialog .el-dialog__body { padding-top: 20px; }
.cap-dialog {
  .el-dialog__body { padding-top: 20px; }
  .el-form-item { margin-bottom: 18px; }
  .el-divider { margin: 24px 0 20px; }
}
.package-bind-drawer {
  .el-drawer__body { padding: 0; }
  .package-list { padding: 8px 0; }
  .package-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px; cursor: pointer; transition: background .15s;
    &:hover { background: var(--bg-elevated); }
    &.active { background: var(--primary-bg); }
    &-left { display: flex; align-items: center; gap: 12px; }
    &-id { font-size: 13px; font-weight: 500; color: var(--text-primary); font-family: monospace; }
    &-name { font-size: 13px; color: var(--text-secondary); }
  }
}
</style>
