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
      <el-step title="事件配置" @click="currentStep = 1" />
      <el-step title="设备算法配置" @click="currentStep = 2" />
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

          <!-- 设备能力 -->
          <template v-if="ft.key === 'deviceCap'">
                  <div class="config-layout">
                    <el-segmented
                      v-model="selectedCapModule"
                      :options="segmentedOptions"
                      direction="vertical"
                      block
                      class="module-segmented"
                    />
                    <div class="config-detail">
                      <el-scrollbar height="500px">
                        <!-- 联网方式 -->
                        <div v-show="selectedCapModule === 'network'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="联网方式">
                              <el-checkbox-group v-model="networkCfg.netTypes">
                                <el-checkbox label="有线">有线</el-checkbox>
                                <el-checkbox label="WIFI">WIFI</el-checkbox>
                                <el-checkbox label="移动网络">移动网络</el-checkbox>
                              </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="配网方式">
                              <el-checkbox-group v-model="networkCfg.distMethods">
                                <el-checkbox label="AP">AP</el-checkbox>
                                <el-checkbox label="声音">声音</el-checkbox>
                                <el-checkbox label="smartlink">smartlink</el-checkbox>
                                <el-checkbox label="摄像机识别二维码添加">摄像机识别二维码添加</el-checkbox>
                                <el-checkbox label="局域网">局域网</el-checkbox>
                                <el-checkbox label="APP扫码添加">APP扫码添加</el-checkbox>
                                <el-checkbox label="蓝牙添加">蓝牙添加</el-checkbox>
                              </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="默认配网方式">
                              <el-select v-model="networkCfg.defaultDistMethod" size="small" style="width:200px">
                                <el-option label="AP" value="AP" />
                                <el-option label="smartlink" value="smartlink" />
                                <el-option label="局域网" value="局域网" />
                              </el-select>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 对讲设置 -->
                        <div v-show="selectedCapModule === 'intercom'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="支持对讲方式">
                              <el-radio-group v-model="intercomCfg.mode">
                                <el-radio value="none">不支持对讲</el-radio>
                                <el-radio value="half">半双工</el-radio>
                                <el-radio value="full">全双工</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 存储设置 -->
                        <div v-show="selectedCapModule === 'storage'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="存储方式">
                              <el-radio-group v-model="storageCfg.method">
                                <el-radio value="none">不支持</el-radio>
                                <el-radio value="tf">TF卡存储</el-radio>
                                <el-radio value="disk">磁盘存储</el-radio>
                              </el-radio-group>
                            </el-form-item>
                            <el-form-item label="常规录制方式">
                              <el-radio-group v-model="storageCfg.recordMode">
                                <el-radio value="scheduled">定时录制</el-radio>
                                <el-radio value="none">不录制</el-radio>
                              </el-radio-group>
                            </el-form-item>
                            <template v-if="storageCfg.recordMode === 'scheduled'">
                              <el-form-item label="开始时间">
                                <el-time-picker v-model="storageCfg.startTime" format="HH:mm:ss" placeholder="00:00:00" size="small" style="width:160px" />
                              </el-form-item>
                              <el-form-item label="结束时间">
                                <el-time-picker v-model="storageCfg.endTime" format="HH:mm:ss" placeholder="23:59:59" size="small" style="width:160px" />
                              </el-form-item>
                            </template>
                            <el-form-item label="重复">
                              <el-checkbox-group v-model="storageCfg.repeatDays">
                                <el-checkbox v-for="d in weekDays" :key="d" :label="d">{{ d }}</el-checkbox>
                              </el-checkbox-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 电池设置 -->
                        <div v-show="selectedCapModule === 'battery'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="是否有电池">
                              <el-radio-group v-model="batteryCfg.hasBattery">
                                <el-radio :value="true">有</el-radio>
                                <el-radio :value="false">无</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 工作模式 -->
                        <div v-show="selectedCapModule === 'workMode'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="是否支持切换工作模式">
                              <el-radio-group v-model="workModeCfg.supportSwitch">
                                <el-radio :value="true">支持</el-radio>
                                <el-radio :value="false">不支持</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 唤醒能力 -->
                        <div v-show="selectedCapModule === 'wakeup'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="是否支持唤醒">
                              <el-radio-group v-model="wakeupCfg.mode">
                                <el-radio value="none">不支持</el-radio>
                                <el-radio value="local">本地唤醒</el-radio>
                                <el-radio value="remote">远程唤醒</el-radio>
                                <el-radio value="both">本地和远程</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- OTA能力 -->
                        <div v-show="selectedCapModule === 'ota'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="是否支持远程OTA">
                              <el-radio-group v-model="otaCfg.supportRemote">
                                <el-radio :value="true">支持</el-radio>
                                <el-radio :value="false">不支持</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 指示灯 -->
                        <div v-show="selectedCapModule === 'indicator'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="是否有状态指示灯">
                              <el-radio-group v-model="indicatorCfg.hasIndicator">
                                <el-radio :value="true">有</el-radio>
                                <el-radio :value="false">无</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 报警录制 -->
                        <div v-show="selectedCapModule === 'alarmRecord'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-alert title="该报警配置仅针对卡录像生效" type="info" :closable="false" show-icon style="margin-bottom:16px" />
                            <el-form-item label="是否打开报警录制">
                              <el-switch v-model="alarmRecordCfg.enabled" />
                            </el-form-item>
                            <el-form-item v-if="alarmRecordCfg.enabled" label="报警时长（秒）">
                              <el-input-number v-model="alarmRecordCfg.duration" :min="5" :max="300" :step="5" size="small" />
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 红外灯 -->
                        <div v-show="selectedCapModule === 'irLight'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="是否支持">
                              <el-radio-group v-model="irLightCfg.supported">
                                <el-radio :value="true">是</el-radio>
                                <el-radio :value="false">否</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 屏显配置 -->
                        <div v-show="selectedCapModule === 'display'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="是否有屏显">
                              <el-radio-group v-model="displayCfg.hasDisplay">
                                <el-radio :value="true">是</el-radio>
                                <el-radio :value="false">否</el-radio>
                              </el-radio-group>
                            </el-form-item>
                            <el-form-item label="支持的分辨率">
                              <el-checkbox-group v-model="displayCfg.resolutions">
                                <el-checkbox label="1920*1080">1920*1080</el-checkbox>
                                <el-checkbox label="1280*720">1280*720</el-checkbox>
                                <el-checkbox label="640*480">640*480</el-checkbox>
                                <el-checkbox label="640*360">640*360</el-checkbox>
                                <el-checkbox label="320*240">320*240</el-checkbox>
                              </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="屏息时间（秒）">
                              <el-input-number v-model="displayCfg.sleepTime" :min="1" :max="3600" size="small" style="width:200px" />
                            </el-form-item>
                            <el-form-item label="支持的解码方式">
                              <el-checkbox-group v-model="displayCfg.decodeTypes">
                                <el-checkbox label="H264">H264</el-checkbox>
                                <el-checkbox label="H265">H265</el-checkbox>
                                <el-checkbox label="MJPG">MJPG</el-checkbox>
                              </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="支持的屏显类型">
                              <el-checkbox-group v-model="displayCfg.displayTypes">
                                <el-checkbox label="文字">文字</el-checkbox>
                                <el-checkbox label="背景图">背景图</el-checkbox>
                                <el-checkbox label="图片">图片</el-checkbox>
                                <el-checkbox label="视频">视频</el-checkbox>
                              </el-checkbox-group>
                            </el-form-item>
                          </el-form>
                        </div>

                        <!-- 喇叭配置 -->
                        <div v-show="selectedCapModule === 'speaker'">
                          <el-form label-position="right" label-width="140px" class="config-form">
                            <el-form-item label="是否有喇叭">
                              <el-radio-group v-model="speakerCfg.hasSpeaker">
                                <el-radio :value="true">是</el-radio>
                                <el-radio :value="false">否</el-radio>
                              </el-radio-group>
                            </el-form-item>
                            <el-form-item label="支持的编码方式">
                              <el-checkbox-group v-model="speakerCfg.encodeTypes">
                                <el-checkbox label="PCM">PCM</el-checkbox>
                                <el-checkbox label="G711A">G711A</el-checkbox>
                                <el-checkbox label="g711u">g711u</el-checkbox>
                                <el-checkbox label="ACC">ACC</el-checkbox>
                              </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="音量调节">
                              <el-radio-group v-model="speakerCfg.volumeAdjust">
                                <el-radio :value="true">支持</el-radio>
                                <el-radio :value="false">不支持</el-radio>
                              </el-radio-group>
                            </el-form-item>
                            <el-form-item label="音量">
                              <el-input-number v-model="speakerCfg.volume" :min="0" :max="100" size="small" style="width:200px" />
                            </el-form-item>
                            <el-form-item label="自定义铃声">
                              <el-radio-group v-model="speakerCfg.customRing">
                                <el-radio :value="true">支持</el-radio>
                                <el-radio :value="false">不支持</el-radio>
                              </el-radio-group>
                            </el-form-item>
                            <el-form-item label="采样位深">
                              <el-radio-group v-model="speakerCfg.sampleDepth">
                                <el-radio value="16bit">16bit</el-radio>
                                <el-radio value="24bit">24bit</el-radio>
                              </el-radio-group>
                            </el-form-item>
                            <el-form-item label="采样率">
                              <el-radio-group v-model="speakerCfg.sampleRate">
                                <el-radio value="8000">8000 (电话音质)</el-radio>
                                <el-radio value="16000">16000 (语音识别常用)</el-radio>
                                <el-radio value="44100">44100 (CD音质)</el-radio>
                                <el-radio value="48000">48000 (专业音频常用)</el-radio>
                              </el-radio-group>
                            </el-form-item>
                            <el-form-item label="声道数">
                              <el-radio-group v-model="speakerCfg.channels">
                                <el-radio value="单声道">单声道</el-radio>
                                <el-radio value="双声道">双声道</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-form>
                        </div>
                      </el-scrollbar>
                    </div>
                  </div>

                  <!-- 标准能力 + 自定义能力 -->
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
                </template>

                <!-- 镜头配置 -->
                <div v-if="ft.key === 'lens'" class="config-section">
                  <div v-if="activeCamera" class="lens-config-body">
                    <!-- 全局配置 -->
                    <div class="config-divider" style="margin-top:0">
                      <el-divider>
                        <el-icon><Setting /></el-icon>
                        <span class="section-title">全局配置</span>
                      </el-divider>
                    </div>
                    <el-form label-position="right" label-width="140px" class="config-form">
                      <el-form-item label="摄像机工作模式">
                        <el-radio-group v-model="activeCamera.cfg.workMode">
                          <el-radio value="independent">独立工作</el-radio>
                          <el-radio value="linked">联动工作</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-form>

                    <!-- 单目配置 -->
                    <div class="config-divider">
                      <el-divider>
                        <el-icon><Setting /></el-icon>
                        <span class="section-title">单目配置</span>
                      </el-divider>
                    </div>
                    <div class="lens-header">
                      <h3 class="camera-name">{{ activeCamera.name }}</h3>
                      <el-select v-model="activeCameraIdx" size="small" style="width:200px" @change="switchCamera">
                        <el-option v-for="(cam, i) in cameraList" :key="cam.id" :label="cam.name" :value="i" />
                      </el-select>
                      <el-button size="small" text type="danger" @click="removeCamera(activeCameraIdx)">删除</el-button>
                      <el-button size="small" @click="addCamera"><el-icon><Plus /></el-icon>添加镜头</el-button>
                    </div>

                    <div class="config-layout">
                      <el-segmented
                        v-model="activeLensModule"
                        :options="lensModuleOptions"
                        direction="vertical"
                        block
                        class="module-segmented"
                      />
                      <div class="config-detail">
                        <el-scrollbar height="500px">
                          <el-form label-position="right" label-width="140px" class="config-form camera-form">

                            <!-- ===== 多目配置 ===== -->
                            <template v-if="activeLensModule === 'multiLens'">
                              <el-button type="primary" size="small" @click="addLensItem">
                                <el-icon><Plus /></el-icon>添加镜头
                              </el-button>
                              <el-card v-for="(lens, li) in activeCamera.cfg.lensItems" :key="li" shadow="hover" class="lens-item-card">
                                <template #header>
                                  <div class="card-header-row">
                                    <span class="card-title">镜头 {{ li + 1 }}</span>
                                    <el-button size="small" text type="danger" @click="removeLensItem(li)">删除</el-button>
                                  </div>
                                </template>
                                <el-form-item label="镜头类型">
                                  <el-select v-model="lens.type" size="small" style="width:100%">
                                    <el-option label="普通镜头" value="普通镜头" />
                                    <el-option label="广角镜头" value="广角镜头" />
                                    <el-option label="长焦镜头" value="长焦镜头" />
                                    <el-option label="鱼眼镜头" value="鱼眼镜头" />
                                  </el-select>
                                </el-form-item>
                                <el-row :gutter="16">
                                  <el-col :span="12">
                                    <el-form-item label="最大焦距">
                                      <el-input-number v-model="lens.maxFocalLength" :min="0" :max="100" :precision="1" size="small" style="width:100%" />
                                    </el-form-item>
                                  </el-col>
                                  <el-col :span="12">
                                    <el-form-item label="最小焦距">
                                      <el-input-number v-model="lens.minFocalLength" :min="0" :max="100" :precision="1" size="small" style="width:100%" />
                                    </el-form-item>
                                  </el-col>
                                </el-row>
                              </el-card>
                            </template>

                            <!-- ===== PTZ控制 ===== -->
                            <template v-if="activeLensModule === 'ptz'">
                              <el-form-item label="是否支持PTZ">
                                <el-radio-group v-model="activeCamera.cfg.ptz.supported">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.ptz.supported" label="PTZ能力">
                                <el-checkbox-group v-model="activeCamera.cfg.ptz.capabilities">
                                  <el-checkbox label="平移">平移</el-checkbox>
                                  <el-checkbox label="倾斜">倾斜</el-checkbox>
                                  <el-checkbox label="变焦">变焦</el-checkbox>
                                </el-checkbox-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.ptz.supported" label="是否支持预置位">
                                <el-radio-group v-model="activeCamera.cfg.ptz.presetSupported">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.ptz.supported" label="是否支持自动巡航">
                                <el-radio-group v-model="activeCamera.cfg.ptz.cruiseSupported">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.ptz.supported" label="空间定位能力">
                                <el-radio-group v-model="activeCamera.cfg.ptz.spatialPositioning">
                                  <el-radio value="none">不支持</el-radio>
                                  <el-radio value="3d">支持3D居中</el-radio>
                                  <el-radio value="gps">支持GPS定位</el-radio>
                                </el-radio-group>
                              </el-form-item>
                            </template>

                            <!-- ===== 视频码流 ===== -->
                            <template v-if="activeLensModule === 'stream'">
                              <el-button type="primary" size="small" @click="addStream">
                                <el-icon><Plus /></el-icon>添加码流
                              </el-button>
                              <el-card v-for="(stream, si) in activeCamera.cfg.streams" :key="si" shadow="hover" class="stream-item-card">
                                <template #header>
                                  <div class="card-header-row">
                                    <span class="card-title">码流 {{ si + 1 }}</span>
                                    <el-tag v-if="stream.isStorage" size="small" type="success" style="margin-left:8px">存储码流</el-tag>
                                    <el-button v-else size="small" text type="primary" @click="setStorageStream(si)">设为存储码流</el-button>
                                    <el-button size="small" text type="danger" style="margin-left:auto" @click="removeStream(si)">删除</el-button>
                                  </div>
                                </template>
                                <el-form-item label="支持的分辨率及描述">
                                  <div class="resolution-list">
                                    <div v-for="r in resolutions" :key="r.val" class="resolution-item">
                                      <el-checkbox :model-value="stream.resolutions.some(s => s.res === r.val)" @change="v => {
                                        if (v) stream.resolutions.push({ res: r.val, selected: true, descr: '' })
                                        else stream.resolutions = stream.resolutions.filter(s => s.res !== r.val)
                                      }">
                                        <div style="display:flex;align-items:center">
                                          <span style="width:80px">{{ r.val }}</span>
                                          <el-input v-if="stream.resolutions.some(s => s.res === r.val)" v-model="stream.resolutions.find(s => s.res === r.val).descr" size="small" placeholder="分辨率描述" style="width:120px;margin-left:8px" />
                                        </div>
                                      </el-checkbox>
                                    </div>
                                  </div>
                                </el-form-item>
                                <el-form-item label="默认分辨率">
                                  <el-select v-model="stream.defaultResolution" size="small" style="width:160px">
                                    <el-option v-for="r in resolutions" :key="r.val" :label="r.val" :value="r.val" />
                                  </el-select>
                                </el-form-item>
                                <el-form-item label="码率控制类型">
                                  <el-radio-group v-model="stream.bitrateControl">
                                    <el-radio value="CBR">CBR</el-radio>
                                    <el-radio value="VBR">VBR</el-radio>
                                  </el-radio-group>
                                </el-form-item>
                                <el-form-item label="码率值kbps">
                                  <el-input-number v-model="stream.bitrateValue" :min="64" :max="20480" size="small" style="width:100%" />
                                </el-form-item>
                                <el-form-item label="支持码率类型">
                                  <el-checkbox-group v-model="stream.encodeTypes">
                                    <el-checkbox label="H264">H.264</el-checkbox>
                                    <el-checkbox label="H265">H.265</el-checkbox>
                                    <el-checkbox label="MJPEG">MJPEG</el-checkbox>
                                    <el-checkbox label="VP8">VP8</el-checkbox>
                                  </el-checkbox-group>
                                </el-form-item>
                                <el-form-item label="默认编码类型">
                                  <el-select v-model="stream.defaultEncodeType" size="small" style="width:160px">
                                    <el-option label="H.264" value="H264" />
                                    <el-option label="H.265" value="H265" />
                                    <el-option label="MJPEG" value="MJPEG" />
                                  </el-select>
                                </el-form-item>
                                <el-form-item label="智能编码">
                                  <el-switch v-model="stream.smartEncode" size="small" />
                                </el-form-item>
                                <el-form-item label="关键帧间隔">
                                  <el-input-number v-model="stream.keyFrameInterval" :min="1" :max="250" size="small" style="width:100%" />
                                </el-form-item>
                                <el-form-item label="帧率">
                                  <el-input-number v-model="stream.frameRate" :min="1" :max="60" size="small" style="width:100%" />
                                </el-form-item>
                              </el-card>
                            </template>

                            <!-- ===== 图像参数 ===== -->
                            <template v-if="activeLensModule === 'image'">
                              <el-form-item label="图像翻转">
                                <el-radio-group v-model="activeCamera.cfg.image.flip">
                                  <el-radio value="1">支持</el-radio>
                                  <el-radio value="0">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.image.flip === '1'" label="默认状态">
                                <el-radio-group v-model="activeCamera.cfg.image.flipDefault">
                                  <el-radio value="正放">正放</el-radio>
                                  <el-radio value="翻转">翻转</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="镜像能力">
                                <el-radio-group v-model="activeCamera.cfg.image.mirror">
                                  <el-radio value="1">支持</el-radio>
                                  <el-radio value="0">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.image.mirror === '1'" label="图像镜像">
                                <el-radio-group v-model="activeCamera.cfg.image.mirrorDefault">
                                  <el-radio value="打开">打开</el-radio>
                                  <el-radio value="关闭">关闭</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="是否支持夜视能力">
                                <el-radio-group v-model="activeCamera.cfg.image.nightVision">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="宽动态">
                                <el-radio-group v-model="activeCamera.cfg.image.wdr">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.image.wdr" label="默认状态">
                                <el-switch v-model="activeCamera.cfg.image.wdrDefault" size="small" />
                              </el-form-item>
                              <el-form-item label="高动态">
                                <el-radio-group v-model="activeCamera.cfg.image.hdr">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.image.hdr" label="默认状态">
                                <el-switch v-model="activeCamera.cfg.image.hdrDefault" size="small" />
                              </el-form-item>
                              <el-form-item label="抗闪烁">
                                <el-radio-group v-model="activeCamera.cfg.image.antiFlicker">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item v-if="activeCamera.cfg.image.antiFlicker" label="默认扫描频率">
                                <el-radio-group v-model="activeCamera.cfg.image.antiFlickerFreq">
                                  <el-radio value="50">50</el-radio>
                                  <el-radio value="60">60</el-radio>
                                </el-radio-group>
                              </el-form-item>
                            </template>

                            <!-- ===== 隐私区域 ===== -->
                            <template v-if="activeLensModule === 'privacy'">
                              <el-form-item label="是否支持隐私区域">
                                <el-radio-group v-model="activeCamera.cfg.privacyZone.supported">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                            </template>

                            <!-- ===== 水印 ===== -->
                            <template v-if="activeLensModule === 'watermark'">
                              <el-form-item label="水印能力">
                                <el-radio-group v-model="activeCamera.cfg.watermark.type">
                                  <el-radio value="device">设备水印</el-radio>
                                  <el-radio value="app">App水印</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="是否支持自定义水印">
                                <el-radio-group v-model="activeCamera.cfg.watermark.customSupported">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="水印内容">
                                <el-input v-model="activeCamera.cfg.watermark.content" size="small" placeholder="请输入水印内容" style="width:240px" />
                              </el-form-item>
                              <el-form-item label="水印位置">
                                <el-radio-group v-model="activeCamera.cfg.watermark.position">
                                  <el-radio value="device_default">设备默认</el-radio>
                                  <el-radio value="top_left">左上</el-radio>
                                  <el-radio value="top_right">右上</el-radio>
                                  <el-radio value="bottom_left">左下</el-radio>
                                  <el-radio value="bottom_right">右下</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="是否默认打开水印">
                                <el-switch v-model="activeCamera.cfg.watermark.defaultOn" size="small" />
                              </el-form-item>
                            </template>

                            <!-- ===== 鱼眼矫正 ===== -->
                            <template v-if="activeLensModule === 'fisheye'">
                              <el-form-item label="鱼眼矫正">
                                <div class="flex-col">
                                  <el-radio-group v-model="activeCamera.cfg.fisheye.mode">
                                    <el-radio value="device">设备矫正</el-radio>
                                    <el-radio value="app">App矫正</el-radio>
                                  </el-radio-group>
                                  <span class="form-tip">如设备不支持此能力，则APP会进行矫正处理</span>
                                </div>
                              </el-form-item>
                            </template>

                            <!-- ===== 高级配置项 ===== -->
                            <template v-if="activeLensModule === 'advanced'">
                              <el-form-item label="抓图能力">
                                <el-radio-group v-model="activeCamera.cfg.advanced.snapshot">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="人形坐标写入">
                                <el-radio-group v-model="activeCamera.cfg.advanced.humanoidCoord">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="是否是合成流">
                                <div class="flex-col">
                                  <el-radio-group v-model="activeCamera.cfg.advanced.compositeStream">
                                    <el-radio :value="true">支持</el-radio>
                                    <el-radio :value="false">不支持</el-radio>
                                  </el-radio-group>
                                  <span class="form-tip">如果app上需要画中画功能，设备需要支持合成流</span>
                                </div>
                              </el-form-item>
                            </template>

                          </el-form>
                        </el-scrollbar>
                      </div>
                    </div>

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

                  <div v-else class="empty-state" style="padding:40px 0">暂无镜头配置，请先添加镜头</div>
                </div>

                <!-- 麦克风配置 -->
                <div v-if="ft.key === 'mic'" class="config-section">
                  <div v-if="activeMic" class="lens-config-body">
                    <div class="config-divider" style="margin-top:0">
                      <el-divider>
                        <el-icon><Setting /></el-icon>
                        <span class="section-title">Microphone配置</span>
                      </el-divider>
                    </div>
                    <div class="lens-header">
                      <h3 class="camera-name">{{ activeMic.name }}</h3>
                      <el-select v-model="activeMicIdx" size="small" style="width:200px" @change="activeMicModule = 'micParam'">
                        <el-option v-for="(m, i) in micList" :key="m.id" :label="m.name" :value="i" />
                      </el-select>
                      <el-button size="small" text type="danger" @click="removeMic(activeMicIdx)">删除</el-button>
                      <el-button size="small" @click="addMic"><el-icon><Plus /></el-icon>添加Microphone</el-button>
                    </div>

                    <div class="config-layout">
                      <el-segmented
                        v-model="activeMicModule"
                        :options="micModuleOptions"
                        direction="vertical"
                        block
                        class="module-segmented"
                      />
                      <div class="config-detail">
                        <el-scrollbar height="500px">
                          <el-form label-position="right" label-width="140px" class="config-form">

                            <!-- 麦克风参数配置 -->
                            <template v-if="activeMicModule === 'micParam'">
                              <el-form-item label="麦克风开关">
                                <el-switch v-model="activeMic.cfg.micSwitch" size="small" />
                              </el-form-item>
                              <el-form-item label="音量调节">
                                <el-radio-group v-model="activeMic.cfg.volumeAdjust">
                                  <el-radio :value="true">支持</el-radio>
                                  <el-radio :value="false">不支持</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="采集音量">
                                <el-input-number v-model="activeMic.cfg.captureVolume" :min="0" :max="100" size="small" style="width:200px" />
                              </el-form-item>
                              <el-form-item label="采样位深">
                                <el-radio-group v-model="activeMic.cfg.sampleDepth">
                                  <el-radio value="16bit">16bit</el-radio>
                                  <el-radio value="24bit">24bit</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="采样率">
                                <el-radio-group v-model="activeMic.cfg.sampleRate">
                                  <el-radio value="8000">8000 (电话音质)</el-radio>
                                  <el-radio value="16000">16000 (语音识别常用)</el-radio>
                                  <el-radio value="44100">44100 (CD音质)</el-radio>
                                  <el-radio value="48000">48000 (专业音频常用)</el-radio>
                                </el-radio-group>
                              </el-form-item>
                              <el-form-item label="声道数">
                                <el-radio-group v-model="activeMic.cfg.channels">
                                  <el-radio value="单声道">单声道</el-radio>
                                  <el-radio value="双声道">双声道</el-radio>
                                </el-radio-group>
                              </el-form-item>
                            </template>

                            <!-- 音频码流配置 -->
                            <template v-if="activeMicModule === 'audioStream'">
                              <el-button type="primary" size="small" @click="addAudioStream">
                                <el-icon><Plus /></el-icon>添加音频码流
                              </el-button>
                              <el-card v-for="(stream, si) in activeMic.cfg.audioStreams" :key="si" shadow="hover" class="stream-item-card">
                                <template #header>
                                  <div class="card-header-row">
                                    <span class="card-title">码流 {{ si + 1 }}</span>
                                    <el-button size="small" text type="danger" style="margin-left:auto" @click="removeAudioStream(si)">删除</el-button>
                                  </div>
                                </template>
                                <el-form-item label="支持的编码类型">
                                  <el-checkbox-group v-model="stream.encodeTypes">
                                    <el-checkbox label="PCM">PCM</el-checkbox>
                                    <el-checkbox label="G711A">G711A</el-checkbox>
                                    <el-checkbox label="G711U">G711U</el-checkbox>
                                    <el-checkbox label="AAC">AAC</el-checkbox>
                                    <el-checkbox label="MP3">MP3</el-checkbox>
                                  </el-checkbox-group>
                                </el-form-item>
                                <el-form-item label="默认编码类型">
                                  <el-select v-model="stream.defaultEncodeType" size="small" style="width:160px">
                                    <el-option label="PCM" value="PCM" />
                                    <el-option label="G711A" value="G711A" />
                                    <el-option label="G711U" value="G711U" />
                                    <el-option label="AAC" value="AAC" />
                                    <el-option label="MP3" value="MP3" />
                                  </el-select>
                                </el-form-item>
                              </el-card>
                            </template>

                          </el-form>
                        </el-scrollbar>
                      </div>
                    </div>

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
            <el-table-column label="EventID" width="150" align="center">
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
          <el-button class="w-160" @click="currentStep = 1">上一步</el-button>
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

        <!-- 算法列表 -->
        <div class="algo-service-section">
          <el-table :data="algoList" stripe>
            <el-table-column label="AlgorithmID" width="150" align="center">
              <template #default="{ row }">{{ row.algorithmId }}</template>
            </el-table-column>
            <el-table-column label="算法名称" min-width="160">
              <template #default="{ row }">
                <span class="cell-name">{{ row._name?.['1'] || row.algorithmId }}</span>
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
            <el-table-column label="计费模式" width="120" align="center">
              <template #default="{ row }">
                <el-select v-model="row.billing" size="small" style="width:100px">
                  <el-option label="免费默认" value="free" />
                  <el-option label="套餐购买" value="paid" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="能力配置" width="100" align="center">
              <template #default="{ row }">
                <el-button v-if="row.hasConfig" size="small" text type="primary" @click="openAlgoConfig(row)">配置</el-button>
              </template>
            </el-table-column>
            <el-table-column label="关联事件" width="100" align="center">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="openEventLink(row)">编辑</el-button>
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

        <!-- 平台服务列表 -->
        <div class="algo-service-section">
          <el-table :data="[...cloudRecordServices, ...aiServices]" stripe>
            <el-table-column label="服务ID" width="100" prop="serviceId" />
            <el-table-column label="服务名称" width="140" prop="name" />
            <el-table-column label="是否支持" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.supported" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="说明" min-width="280" prop="descr" />
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
    <el-dialog v-model="eventLinkVisible" :title="'关联事件 - ' + (editingAlgo?._name?.['1'] || editingAlgo?.algorithmId)" width="560px" top="5vh" :close-on-click-modal="false">
      <el-checkbox-group v-if="editingAlgo" v-model="editingAlgo.linkedEvents">
        <div v-for="evt in eventOptions" :key="evt.id" class="event-check-item">
          <el-checkbox :label="evt.id" :value="evt.id">
            <span class="event-name">{{ evt.name }}</span>
            <span class="event-desc">{{ evt.descr }}</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, ArrowLeft, ArrowRight, Edit, Switch, Check, Setting, QuestionFilled, Delete, Search, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listAlgorithms, allEvents, getCapabilitiesByIds, getModules, getAllCapabilities } from '@/views/iot/thing-model/data'

const route = useRoute()
const router = useRouter()

const productName = ref(route.query.name || 'API测试产品_388537')
const productId = ref(route.query.id || 'PDRSAs9HaSQzNPrG')

// ===== 步骤导航 =====
const currentStep = ref(0)

// ===== 功能配置子 Tab =====
const funcTabs = [
  { key: 'deviceCap', label: '设备能力' },
  { key: 'lens', label: '镜头配置' },
  { key: 'mic', label: '麦克风配置' }
]
const activeFuncTab = ref('deviceCap')

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
    currentStep.value = 1
    ElMessage.success('功能配置已完成，进入事件配置')
  }
}

// ===== 模块分段控制器 =====
const selectedCapModule = ref('network')
const segmentedOptions = [
  { label: '联网方式', value: 'network' },
  { label: '对讲设置', value: 'intercom' },
  { label: '存储设置', value: 'storage' },
  { label: '电池设置', value: 'battery' },
  { label: '工作模式', value: 'workMode' },
  { label: '唤醒能力', value: 'wakeup' },
  { label: 'OTA能力', value: 'ota' },
  { label: '指示灯', value: 'indicator' },
  { label: '报警录制', value: 'alarmRecord' },
  { label: '红外灯', value: 'irLight' },
  { label: '屏显配置', value: 'display' },
  { label: '喇叭配置', value: 'speaker' }
]

// ===== 设备能力配置 =====
const networkCfg = reactive({ netTypes: [], distMethods: [], defaultDistMethod: 'AP' })
const intercomCfg = reactive({ mode: 'none' })
const storageCfg = reactive({
  method: 'none', recordMode: 'scheduled',
  startTime: new Date(2000, 0, 1, 0, 0, 0),
  endTime: new Date(2000, 0, 1, 23, 59, 59),
  repeatDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
})
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const batteryCfg = reactive({ hasBattery: false })
const workModeCfg = reactive({ supportSwitch: false })
const wakeupCfg = reactive({ mode: 'none' })
const otaCfg = reactive({ supportRemote: false })
const indicatorCfg = reactive({ hasIndicator: false })
const alarmRecordCfg = reactive({ enabled: false, duration: 15 })
const irLightCfg = reactive({ supported: false })

// ===== 镜头配置 =====
const resolutions = [
  { val: '320*240' }, { val: '640*360' }, { val: '640*480' },
  { val: '1280*720' }, { val: '1280*960' }, { val: '1920*1080' },
  { val: '1600*1200' }, { val: '2048*1536' }, { val: '2560*1440' },
  { val: '2688*1520' }, { val: '2560*1920' }
]

const activeCameraIdx = ref(0)
const activeLensModule = ref('multiLens')
const lensModuleOptions = [
  { label: '多目配置', value: 'multiLens' },
  { label: 'PTZ控制', value: 'ptz' },
  { label: '视频码流', value: 'stream' },
  { label: '图像参数', value: 'image' },
  { label: '隐私区域', value: 'privacy' },
  { label: '水印', value: 'watermark' },
  { label: '鱼眼矫正', value: 'fisheye' },
  { label: '高级配置项', value: 'advanced' }
]

function defaultStreamCfg() {
  return {
    resolutions: [{ res: '320*240', selected: true, descr: '' }],
    defaultResolution: '320*240',
    bitrateControl: 'CBR',
    bitrateValue: 1024,
    encodeTypes: ['H264'],
    defaultEncodeType: 'H264',
    smartEncode: true,
    keyFrameInterval: 50,
    frameRate: 25
  }
}

function defaultLensItem() {
  return { type: '普通镜头', maxFocalLength: 6, minFocalLength: 2.8 }
}

function defaultCameraCfg() {
  return {
    // 全局配置
    workMode: 'independent',
    // 多目配置
    lensItems: [defaultLensItem()],
    // PTZ控制
    ptz: {
      supported: true,
      capabilities: ['平移'],
      presetSupported: true,
      cruiseSupported: true,
      spatialPositioning: 'none'
    },
    // 视频码流
    streams: [defaultStreamCfg()],
    // 图像参数
    image: {
      flip: '1', flipDefault: '正放',
      mirror: '1', mirrorDefault: '打开',
      nightVision: false,
      wdr: true, wdrDefault: true,
      hdr: true, hdrDefault: true,
      antiFlicker: true, antiFlickerFreq: '50'
    },
    // 隐私区域
    privacyZone: { supported: true },
    // 水印
    watermark: {
      type: 'device', customSupported: true,
      content: '', position: 'device_default', defaultOn: true
    },
    // 鱼眼矫正
    fisheye: { mode: 'device' },
    // 高级配置项
    advanced: {
      snapshot: true, humanoidCoord: true, compositeStream: true
    }
  }
}

const cameraList = ref([
  { id: 1, name: 'Camera_ 1', cfg: defaultCameraCfg(), standardCaps: [], customCaps: [] }
])

const activeCamera = computed(() => cameraList.value[activeCameraIdx.value] || null)

function switchCamera() { activeLensModule.value = 'multiLens' }

// 多目配置 - 增删镜头子项
function addLensItem() {
  if (!activeCamera.value) return
  activeCamera.value.cfg.lensItems.push(defaultLensItem())
}
function removeLensItem(idx) {
  if (!activeCamera.value) return
  if (activeCamera.value.cfg.lensItems.length <= 1) { ElMessage.warning('至少保留一个镜头'); return }
  activeCamera.value.cfg.lensItems.splice(idx, 1)
}

// 视频码流 - 增删码流
function addStream() {
  if (!activeCamera.value) return
  activeCamera.value.cfg.streams.push(defaultStreamCfg())
}
function removeStream(idx) {
  if (!activeCamera.value) return
  if (activeCamera.value.cfg.streams.length <= 1) { ElMessage.warning('至少保留一个码流'); return }
  activeCamera.value.cfg.streams.splice(idx, 1)
}
function setStorageStream(idx) {
  if (!activeCamera.value) return
  activeCamera.value.cfg.streams.forEach((s, i) => { s.isStorage = i === idx })
}

function addCamera() {
  const idx = cameraList.value.length + 1
  cameraList.value.push({ id: Date.now(), name: `Camera_ ${idx}`, cfg: defaultCameraCfg(), standardCaps: [], customCaps: [] })
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
function defaultAudioStreamCfg() {
  return {
    encodeTypes: ['PCM'],
    defaultEncodeType: 'PCM'
  }
}

function defaultMicCfg() {
  return {
    micSwitch: true,
    volumeAdjust: true,
    captureVolume: 0,
    sampleDepth: '16bit',
    sampleRate: '8000',
    channels: '单声道',
    audioStreams: [defaultAudioStreamCfg()]
  }
}

const micList = ref([
  { id: 1, name: 'Microphone_ 1', cfg: defaultMicCfg(), standardCaps: [], customCaps: [] }
])
const activeMicIdx = ref(0)
const activeMicModule = ref('micParam')
const micModuleOptions = [
  { label: '麦克风参数配置', value: 'micParam' },
  { label: '音频码流配置', value: 'audioStream' }
]

const activeMic = computed(() => micList.value[activeMicIdx.value] || null)

function addAudioStream() {
  if (!activeMic.value) return
  activeMic.value.cfg.audioStreams.push(defaultAudioStreamCfg())
}
function removeAudioStream(idx) {
  if (!activeMic.value) return
  if (activeMic.value.cfg.audioStreams.length <= 1) { ElMessage.warning('至少保留一个音频码流'); return }
  activeMic.value.cfg.audioStreams.splice(idx, 1)
}

function addMic() {
  const idx = micList.value.length + 1
  micList.value.push({ id: Date.now(), name: `Microphone_ ${idx}`, cfg: defaultMicCfg(), standardCaps: [], customCaps: [] })
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

// ===== 屏显配置 =====
const displayCfg = reactive({
  hasDisplay: true,
  resolutions: ['1920*1080'],
  sleepTime: 1,
  decodeTypes: ['H264'],
  displayTypes: ['文字']
})

// ===== 喇叭配置 =====
const speakerCfg = reactive({
  hasSpeaker: true,
  encodeTypes: ['PCM'],
  volumeAdjust: true,
  volume: 1,
  customRing: true,
  sampleDepth: '16bit',
  sampleRate: '8000',
  channels: '单声道'
})

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
  algoList.value = (res.data?.list || []).map(a => {
    try { a._name = JSON.parse(a.algorithmName || '{}') } catch { a._name = {} }
    try { a._eventIds = JSON.parse(a.eventIds || '[]') } catch { a._eventIds = [] }
    return {
      ...a,
      supported: false,
      billing: 'paid',
      hasConfig: (() => { try { return JSON.parse(a.capabilityIds || '[]').length > 0 } catch { return false } })(),
      algoOptions: [],
      linkedEvents: [],
      standardCaps: [],
      customCaps: []
    }
  })
}

const cloudRecordServices = ref([
  { serviceId: '300010', name: '事件云存', supported: true, descr: '事件录像：产生告警时触发录像' },
  { serviceId: '300011', name: '全天云存', supported: true, descr: '全天录像：全天24小时持续录像' }
])

const aiServices = ref([
  { serviceId: '400001', name: '全能AI', supported: false, descr: '集成多种AI算法服务，支持人脸识别、移动侦测、声音检测等智能分析能力' }
])

const eventOptions = ref([])

function loadEvents() {
  const res = allEvents()
  eventOptions.value = (res.data?.list || []).map(e => {
    try { e._name = JSON.parse(e.eventName || '{}') } catch { e._name = {} }
    return { id: e.eventId, name: e._name?.['1'] || e.eventId, descr: e.eventRemark || '', _dbId: e.id }
  })
}

const algoConfigVisible = ref(false)
const editingAlgo = ref(null)

function openAlgoConfig(row) {
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
function saveAlgoTab() { ElMessage.success('设备算法配置已保存'); currentStep.value = 3 }
function savePlatformTab() { ElMessage.success('平台服务配置已保存'); currentStep.value = 4 }

const eventLinkVisible = ref(false)
function openEventLink(row) { editingAlgo.value = row; eventLinkVisible.value = true }
function saveEventLink() { ElMessage.success('关联事件已保存'); eventLinkVisible.value = false }

// ===== Tab 3: 语音 =====
const voiceList = ref([
  { alloTType: 1063, platform: 'ALEXA', descr: 'ALEXA', supported: false },
  { alloTType: 1063, platform: 'GOOGLE_HOME', descr: 'GOOGLE_HOME', supported: false }
])

function finishDev() {
  ElMessage.success('产品配置已完成，即将返回产品列表')
  setTimeout(() => router.push('/product/development'), 1200)
}

function handleBack() { router.push('/product/development') }
function handleEditProduct() { ElMessage.info('编辑产品基础信息') }

onMounted(() => { loadAlgorithms(); loadEvents(); loadEventConfig() })
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

// ===== 通用 =====
.cell-name { font-weight: 500; color: var(--text-primary); font-size: 13px; }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
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

</style>

<style lang="scss">
.algo-config-drawer {
  .el-drawer__body { padding: 20px 24px; }
}
.alg-cap-dialog .el-dialog__body { padding-top: 20px; }
.custom-cap-dialog .el-dialog__body { padding-top: 20px; }
.cap-dialog {
  .el-dialog__body { padding-top: 20px; }
  .el-form-item { margin-bottom: 18px; }
  .el-divider { margin: 24px 0 20px; }
}
</style>
