<template>
  <div class="page-container">
    <div class="page-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="page-title">产品详情</span>
        </template>
      </el-page-header>
    </div>

    <div class="detail-content">
      <!-- 基本信息 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">基本信息</span>
        </div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="产品名称">{{ product.name }}</el-descriptions-item>
          <el-descriptions-item label="产品ID">{{ product.productId }}</el-descriptions-item>
          <el-descriptions-item label="产品类目">{{ product.category }}</el-descriptions-item>
          <el-descriptions-item label="所属企业">{{ product.company }}</el-descriptions-item>
          <el-descriptions-item label="产品状态">
            <span :class="['status-tag', statusCls(product.status)]">{{ statusLabel(product.status) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="授权单价">¥{{ product.unitPrice?.toFixed(2) || '0.00' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 物模型配置 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">物模型配置</span>
        </div>
        <div class="config-row">
          <div class="config-info">
            <el-icon :size="20" color="#1A73E8"><SetUp /></el-icon>
            <span class="config-text">已配置 {{ thingModelCount }} 个子项</span>
          </div>
          <el-button type="primary" link @click="onViewThingModel">查看/修改</el-button>
        </div>
      </div>

      <!-- 算法服务配置 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">算法服务配置</span>
        </div>
        <el-table :data="algoServices" stripe>
          <el-table-column label="算法ID" prop="id" width="100" />
          <el-table-column label="算法名称" prop="name" min-width="160" />
          <el-table-column label="服务ID" prop="serviceId" width="140" />
          <el-table-column label="描述" prop="descr" min-width="180" show-overflow-tooltip />
          <el-table-column label="是否支持" width="90" align="center">
            <template #default="{ row }">
              <el-switch :model-value="row.supported" disabled size="small" />
            </template>
          </el-table-column>
          <el-table-column label="是否免开通" width="100" align="center">
            <template #default="{ row }">
              <el-switch :model-value="row.free" disabled size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button size="small" text type="primary" @click="onAlgoConfig(row)">算法配置</el-button>
              <el-button size="small" text type="primary" @click="onAlgoEvent(row)">关联事件</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-state">暂无算法服务配置</div>
          </template>
        </el-table>
      </div>

      <!-- 平台服务 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">平台服务</span>
        </div>
        <div class="platform-section">
          <div class="platform-item">
            <div class="platform-label">
              <span>云存配置</span>
              <el-switch v-model="platform.cloudStorage" size="small" @change="onCloudStorageChange" />
            </div>
            <div v-if="platform.cloudStorage" class="platform-sub">
              <span class="sub-label">码流类型</span>
              <el-radio-group v-model="platform.streamType" size="small">
                <el-radio label="main">主码流</el-radio>
                <el-radio label="sub">子码流</el-radio>
              </el-radio-group>
            </div>
          </div>
          <div class="platform-item">
            <div class="platform-label">
              <span>时光相册</span>
              <el-switch v-model="platform.timeAlbum" size="small" @change="onTimeAlbumChange" />
            </div>
          </div>
        </div>
      </div>

      <!-- App配置 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">App配置</span>
        </div>
        <div class="config-row">
          <div class="config-info">
            <span class="config-text">安装指引：<em>{{ appConfig.installGuideStatus }}</em></span>
            <span class="config-divider">|</span>
            <span class="config-text">App使用范围：<em>{{ appConfig.scopeStatus }}</em></span>
          </div>
          <el-button type="primary" link @click="goToAppConfig">前往查看/修改</el-button>
        </div>
      </div>

      <!-- 语音助手配置 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">语音助手配置</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="唤醒词">{{ voiceConfig.wakeWord }}</el-descriptions-item>
          <el-descriptions-item label="支持语言">{{ voiceConfig.language }}</el-descriptions-item>
          <el-descriptions-item label="语音平台">{{ voiceConfig.platform }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-switch :model-value="voiceConfig.enabled" disabled size="small" />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 固件版本历史 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">固件版本历史</span>
        </div>
        <el-table :data="firmwareVersions" stripe>
          <el-table-column label="版本号" prop="version" width="140" />
          <el-table-column label="发布日期" prop="releaseDate" width="120" />
          <el-table-column label="文件大小" prop="size" width="100" />
          <el-table-column label="更新内容" prop="changelog" min-width="200" show-overflow-tooltip />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <span :class="['status-tag', row.active ? 's-approved' : 's-pending']">
                {{ row.active ? '当前版本' : '历史版本' }}
              </span>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-state">暂无固件版本数据</div>
          </template>
        </el-table>
      </div>
    </div>

    <!-- 物模型配置 对话框 -->
    <el-dialog
      v-model="thingModelDialogVisible"
      title="设备配置"
      width="900px"
      top="5vh"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-tabs v-model="thingModelActiveTab" type="border-card">
        <!-- Tab 1: 设备能力 -->
        <el-tab-pane label="设备能力" name="capability">
          <div class="tm-config-section">
            <div class="config-options-grid">
              <el-checkbox v-model="deviceCaps.network" label="联网方式" />
              <el-checkbox v-model="deviceCaps.intercom" label="对讲设置" />
              <el-checkbox v-model="deviceCaps.storage" label="存储设置" />
              <el-checkbox v-model="deviceCaps.battery" label="电池设置" />
              <el-checkbox v-model="deviceCaps.workMode" label="工作模式" />
              <el-checkbox v-model="deviceCaps.wakeup" label="唤醒能力" />
              <el-checkbox v-model="deviceCaps.ota" label="OTA能力" />
              <el-checkbox v-model="deviceCaps.indicator" label="指示灯" />
              <el-checkbox v-model="deviceCaps.alarm" label="报警" />
              <el-checkbox v-model="deviceCaps.record" label="录制" />
              <el-checkbox v-model="deviceCaps.irLight" label="红外灯" />
            </div>
            <el-divider />
            <div class="config-sub" v-if="deviceCaps.network">
              <div class="config-sub-title">联网方式</div>
              <div class="config-sub-row">
                <el-checkbox v-model="deviceNetConf.wired" label="有线" />
                <el-checkbox v-model="deviceNetConf.wifi" label="WIFI" />
                <el-checkbox v-model="deviceNetConf.mobile" label="移动网络" />
              </div>
              <div class="config-sub-row">
                <span class="config-label">是否支持双频路由器(5Ghz)</span>
                <el-radio-group v-model="deviceNetConf.dualBand">
                  <el-radio label="no">否</el-radio>
                  <el-radio label="yes">是</el-radio>
                </el-radio-group>
              </div>
              <div class="config-sub-title" style="margin-top:12px">配网方式</div>
              <div class="config-sub-row">
                <el-checkbox v-model="deviceNetConf.ap" label="AP" />
                <el-checkbox v-model="deviceNetConf.sound" label="声音" />
                <el-checkbox v-model="deviceNetConf.smartlink" label="smartlink" />
                <el-checkbox v-model="deviceNetConf.qrcode" label="摄像机识别二维码" />
              </div>
              <div class="config-sub-row">
                <el-checkbox v-model="deviceNetConf.lan" label="添加局域网" />
                <el-checkbox v-model="deviceNetConf.appScan" label="APP扫码添加" />
                <el-checkbox v-model="deviceNetConf.ble" label="蓝牙添加" />
                <el-checkbox v-model="deviceNetConf.hotspot" label="热点" />
              </div>
              <div class="config-sub-row">
                <span class="config-label">是否支持设置密码</span>
                <el-radio-group v-model="deviceNetConf.passwordEnabled">
                  <el-radio label="no">否</el-radio>
                  <el-radio label="yes">是</el-radio>
                </el-radio-group>
              </div>
            </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <span class="cap-section-title">标准能力</span>
                  <el-button size="small" type="primary">添加标准能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <div>
                    <span class="cap-section-title">自定义能力</span>
                    <p class="cap-tip">您所定义的每一个功能，都与固件、APP控制台面板相关</p>
                  </div>
                  <el-button size="small" type="primary">添加自定义能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
          </div>
        </el-tab-pane>

        <!-- Tab 2: 镜头配置 -->
        <el-tab-pane label="镜头配置" name="lens">
          <div class="tm-config-section">
            <div class="config-sub-title">单目配置</div>
            <div class="capability-actions">
              <el-button size="small">切换镜头</el-button>
              <el-button size="small">添加镜头</el-button>
            </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <span class="cap-section-title">标准能力</span>
                  <el-button size="small" type="primary">添加标准能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <div>
                    <span class="cap-section-title">自定义能力</span>
                    <p class="cap-tip">您所定义的每一个功能，都与固件、APP控制台面板相关</p>
                  </div>
                  <el-button size="small" type="primary">添加自定义能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3: 麦克风配置 -->
        <el-tab-pane label="麦克风配置" name="mic">
          <div class="tm-config-section">
            <div class="config-sub-title">Microphone配置</div>
            <div class="capability-actions">
              <el-button size="small">切换Microphone</el-button>
              <el-button size="small">添加Microphone</el-button>
            </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <span class="cap-section-title">标准能力</span>
                  <el-button size="small" type="primary">添加标准能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <div>
                    <span class="cap-section-title">自定义能力</span>
                    <p class="cap-tip">您所定义的每一个功能，都与固件、APP控制台面板相关</p>
                  </div>
                  <el-button size="small" type="primary">添加自定义能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
          </div>
        </el-tab-pane>

        <!-- Tab 4: 屏显配置 -->
        <el-tab-pane label="屏显配置" name="display">
          <div class="tm-config-section">
            <div class="config-sub-row">
              <span class="config-label">是否有屏显:</span>
              <el-radio-group v-model="displayConfig.hasDisplay">
                <el-radio label="no">否</el-radio>
                <el-radio label="yes">是</el-radio>
              </el-radio-group>
            </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <span class="cap-section-title">标准能力</span>
                  <el-button size="small" type="primary">添加标准能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <div>
                    <span class="cap-section-title">自定义能力</span>
                    <p class="cap-tip">您所定义的每一个功能，都与固件、APP控制台面板相关</p>
                  </div>
                  <el-button size="small" type="primary">添加自定义能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
          </div>
        </el-tab-pane>

        <!-- Tab 5: 喇叭配置 -->
        <el-tab-pane label="喇叭配置" name="speaker">
          <div class="tm-config-section">
            <div class="config-sub-row">
              <span class="config-label">是否有喇叭:</span>
              <el-radio-group v-model="speakerConfig.hasSpeaker">
                <el-radio label="no">否</el-radio>
                <el-radio label="yes">是</el-radio>
              </el-radio-group>
            </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <span class="cap-section-title">标准能力</span>
                  <el-button size="small" type="primary">添加标准能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <div>
                    <span class="cap-section-title">自定义能力</span>
                    <p class="cap-tip">您所定义的每一个功能，都与固件、APP控制台面板相关</p>
                  </div>
                  <el-button size="small" type="primary">添加自定义能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
          </div>
        </el-tab-pane>

        <!-- Tab 6: 云端抓图 -->
        <el-tab-pane label="云端抓图" name="cloudCapture">
          <div class="tm-config-section">
            <el-alert type="warning" :closable="false" show-icon class="cloud-alert">
              该配置会影响设备的报警抓图能力，请谨慎选择
            </el-alert>
            <el-form label-position="right" label-width="140px" class="cloud-form">
              <el-form-item label="默认开启">
                <el-radio-group v-model="cloudCaptureConfig.defaultOn">
                  <el-radio label="on">开启</el-radio>
                  <el-radio label="off">关闭</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="支持动图">
                <el-radio-group v-model="cloudCaptureConfig.supportGif">
                  <el-radio label="yes">是</el-radio>
                  <el-radio label="no">否</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="动图开关" v-if="cloudCaptureConfig.supportGif === 'yes'">
                <el-radio-group v-model="cloudCaptureConfig.gifEnabled">
                  <el-radio label="on">开启</el-radio>
                  <el-radio label="off">关闭</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="抓图质量">
                <el-select v-model="cloudCaptureConfig.quality" size="small" style="width:140px">
                  <el-option label="小图" value="small" />
                  <el-option label="标清" value="sd" />
                  <el-option label="高清" value="hd" />
                </el-select>
              </el-form-item>
              <el-form-item label="存储时长(天)">
                <el-input-number
                  v-model="cloudCaptureStorageDays"
                  :min="1"
                  :max="30"
                  :step="1"
                  size="small"
                  style="width:140px"
                />
                <span class="unit-text">天</span>
                <div class="form-tip-row">
                  <el-icon :size="14"><InfoFilled /></el-icon>
                  <span>设置云端抓图在服务器的存储时长（1-30天）。仅平台可见，涉及云存储成本，请谨慎配置。</span>
                </div>
              </el-form-item>
              <el-form-item label="存储方式">
                <el-radio-group v-model="cloudCaptureConfig.storageMode">
                  <el-radio label="event">事件</el-radio>
                  <el-radio label="timer">定时</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="存储格式">
                <el-radio-group v-model="cloudCaptureConfig.storageFormat">
                  <el-radio label="privateHeader">已有格式，带有私有头</el-radio>
                  <el-radio label="standardJpg">标准jpg</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="抓图数目">
                <el-input-number
                  v-model="cloudCaptureConfig.captureCount"
                  :min="0"
                  :max="99"
                  :step="1"
                  size="small"
                  style="width:140px"
                />
              </el-form-item>
              <el-form-item label="抓拍间隔">
                <el-input-number
                  v-model="cloudCaptureConfig.captureInterval"
                  :min="5"
                  :max="300"
                  :step="5"
                  size="small"
                  style="width:140px"
                />
                <span class="unit-text">秒</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="hasThingModelPrev" @click="onThingModelPrev">上一步</el-button>
          <el-button @click="onThingModelSkip">跳过</el-button>
          <el-button type="primary" @click="onThingModelNext">
            {{ isLastThingModelTab ? '保存,完成' : '保存,下一步' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 算法配置 抽屉 -->
    <el-drawer
      v-model="algoDrawerVisible"
      title="算法配置"
      direction="rtl"
      size="900px"
      destroy-on-close
    >
      <div class="algo-config-body">
        <template v-if="currentAlgo?.id === '1013'">
          <div class="algo-config-section">
            <h4 class="section-title">事件记录配置</h4>
            <el-form label-position="right" label-width="140px">
              <el-form-item label="存储天数">
                <el-input-number
                  v-model="eventRecordStorageDays"
                  :min="1"
                  :max="30"
                  :step="1"
                  size="small"
                  style="width:140px"
                />
                <span class="unit-text">天</span>
                <div class="form-tip-row">
                  <el-icon :size="14"><InfoFilled /></el-icon>
                  <span>设置该算法事件记录的云端存储天数（1-30天）。仅平台可见，涉及云存储成本，请谨慎配置。</span>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <div class="algo-config-section">
          <h4 class="section-title">能力绑定</h4>
          <el-tabs type="border-card">
            <el-tab-pane label="标准能力">
              <div class="capability-table-header">
                <el-button size="small" type="primary" @click="onAddStdCapability">添加标准能力</el-button>
              </div>
              <el-table :data="stdCapabilities" stripe>
                <el-table-column label="类型" prop="type" width="80" />
                <el-table-column label="能力名称" prop="name" min-width="140" />
                <el-table-column label="能力标识" prop="code" width="160" />
                <el-table-column label="数据类型" prop="dataType" width="100" />
                <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                <el-table-column label="描述" prop="descr" min-width="140" />
                <el-table-column label="所属模块" prop="module" width="100" />
                <el-table-column label="操作" width="60" align="center">
                  <template #default="{ $index }">
                    <el-button size="small" text type="danger" @click="onRemoveStdCapability($index)">删除</el-button>
                  </template>
                </el-table-column>
                <template #empty>
                  <div class="empty-state">暂无数据</div>
                </template>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="自定义能力">
              <div class="capability-table-header">
                <span class="capability-tip">您所定义的每一个功能，都与固件、APP控制台面板相关</span>
                <el-button size="small" type="primary" @click="onAddCustomCapability">添加自定义能力</el-button>
              </div>
              <el-table :data="customCapabilities" stripe>
                <el-table-column label="类型" prop="type" width="80" />
                <el-table-column label="能力名称" prop="name" min-width="140" />
                <el-table-column label="能力标识" prop="code" width="160" />
                <el-table-column label="数据类型" prop="dataType" width="100" />
                <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                <el-table-column label="描述" prop="descr" min-width="140" />
                <el-table-column label="所属模块" prop="module" width="100" />
                <el-table-column label="操作" width="60" align="center">
                  <template #default="{ $index }">
                    <el-button size="small" text type="danger" @click="onRemoveCustomCapability($index)">删除</el-button>
                  </template>
                </el-table-column>
                <template #empty>
                  <div class="empty-state">暂无数据</div>
                </template>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="algoDrawerVisible = false">取消</el-button>
          <el-button type="primary" @click="onSaveAlgoConfig">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SetUp, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const productId = computed(() => route.query.productId || '')
const productName = computed(() => route.query.name || '')

// ===== Mock product data =====
const product = reactive({
  name: productName,
  productId: productId,
  category: 'UITest_Edit_285367',
  company: '深圳市汇云通讯科技有限公司',
  status: 'approved',
  unitPrice: 0.00
})

// ===== 物模型 =====
const thingModelCount = ref(6)
const thingModelDialogVisible = ref(false)
const thingModelActiveTab = ref('capability')

const thingModelTabs = ['capability', 'lens', 'mic', 'display', 'speaker', 'cloudCapture']
const thingModelTabIndex = computed(() => thingModelTabs.indexOf(thingModelActiveTab.value))
const hasThingModelPrev = computed(() => thingModelTabIndex.value > 0)
const isLastThingModelTab = computed(() => thingModelTabIndex.value === thingModelTabs.length - 1)

function onThingModelPrev() {
  const idx = thingModelTabIndex.value
  if (idx > 0) thingModelActiveTab.value = thingModelTabs[idx - 1]
}
function onThingModelSkip() {
  const idx = thingModelTabIndex.value
  if (idx < thingModelTabs.length - 1) {
    thingModelActiveTab.value = thingModelTabs[idx + 1]
  }
}
function onThingModelNext() {
  if (isLastThingModelTab.value) {
    ElMessage.success('物模型配置已保存')
    thingModelDialogVisible.value = false
  } else {
    const idx = thingModelTabIndex.value
    thingModelActiveTab.value = thingModelTabs[idx + 1]
  }
}

// 设备能力
const deviceCaps = reactive({
  network: true, intercom: true, storage: true, battery: false,
  workMode: true, wakeup: false, ota: true, indicator: true,
  alarm: true, record: true, irLight: true
})
const deviceNetConf = reactive({
  wired: true, wifi: true, mobile: false, dualBand: 'no',
  ap: true, sound: true, smartlink: true, qrcode: true,
  lan: false, appScan: true, ble: false, hotspot: false,
  passwordEnabled: 'no'
})

// 屏显 / 喇叭
const displayConfig = reactive({ hasDisplay: 'no' })
const speakerConfig = reactive({ hasSpeaker: 'no' })

// 云端抓图
const cloudCaptureStorageDays = ref(1)
const cloudCaptureConfig = reactive({
  defaultOn: 'on',
  supportGif: 'no',
  gifEnabled: 'off',
  quality: 'small',
  storageMode: 'event',
  storageFormat: 'privateHeader',
  captureCount: 1,
  captureInterval: 30
})

function onViewThingModel() {
  thingModelActiveTab.value = 'capability'
  cloudCaptureStorageDays.value = 1
  thingModelDialogVisible.value = true
}

// ===== 算法服务 =====
const algoServices = ref([
  { id: '1013', name: '事件记录', serviceId: '300051', descr: '', supported: true, free: false },
  { id: '1000', name: '人形/运动检测', serviceId: '300026, 300012, 300013', descr: '检测画面中的人形或移动物体', supported: true, free: true },
  { id: '1011', name: '云端抓图', serviceId: '-', descr: '', supported: true, free: false },
  { id: '1003', name: 'PIR红外检测', serviceId: '300048', descr: '基于红外热释电的人体活动监测', supported: true, free: false },
  { id: '1004', name: '声音检测', serviceId: '300037', descr: '环境分贝异常或尖锐声响检测', supported: true, free: false }
])

// ===== 算法配置抽屉 =====
const algoDrawerVisible = ref(false)
const currentAlgo = ref(null)
const eventRecordStorageDays = ref(1)
const stdCapabilities = ref([])
const customCapabilities = ref([])

function onAlgoConfig(row) {
  currentAlgo.value = row
  eventRecordStorageDays.value = 1
  stdCapabilities.value = []
  customCapabilities.value = []
  algoDrawerVisible.value = true
}
function onSaveAlgoConfig() {
  if (currentAlgo.value?.id === '1013') {
    ElMessage.success(`事件记录存储天数已设为 ${eventRecordStorageDays.value} 天，算法配置已保存`)
  } else {
    ElMessage.success('算法配置已保存')
  }
  algoDrawerVisible.value = false
}
function onAddStdCapability() { ElMessage.info('添加标准能力') }
function onRemoveStdCapability(idx) { stdCapabilities.value.splice(idx, 1) }
function onAddCustomCapability() { ElMessage.info('添加自定义能力') }
function onRemoveCustomCapability(idx) { customCapabilities.value.splice(idx, 1) }

function onAlgoEvent(row) { ElMessage.info(`关联事件 - ${row.name}`) }

// ===== 平台服务 =====
const platform = reactive({
  cloudStorage: true,
  streamType: 'main',
  timeAlbum: false
})

function onCloudStorageChange(val) { ElMessage.info(`云存配置已${val ? '开启' : '关闭'}`) }
function onTimeAlbumChange(val) { ElMessage.info(`时光相册已${val ? '开启' : '关闭'}`) }

// ===== App配置 =====
const appConfig = reactive({
  installGuideStatus: '已配置',
  scopeStatus: '不限范围'
})
function goToAppConfig() {
  router.push({ path: '/product/app', query: { productId: productId.value, name: productName.value } })
}

// ===== 语音助手 =====
const voiceConfig = reactive({
  wakeWord: '你好小智',
  language: '中文普通话',
  platform: 'Alexa / Google Assistant',
  enabled: true
})

// ===== 固件版本 =====
const firmwareVersions = ref([
  { version: 'v2.5.1', releaseDate: '2026-06-10', size: '12.8 MB', changelog: '修复夜间模式白平衡异常；优化云存上传稳定性', active: true },
  { version: 'v2.5.0', releaseDate: '2026-05-20', size: '12.5 MB', changelog: '新增AI人形检测联动；优化P2P连接速度', active: false },
  { version: 'v2.4.0', releaseDate: '2026-04-15', size: '11.9 MB', changelog: '支持全彩夜视模式；修复设备唤醒延迟', active: false }
])

// ===== Helpers =====
const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
const statusClsMap = { pending: 's-pending', approved: 's-approved', rejected: 's-rejected' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }

function goBack() {
  router.push('/product/audit')
}
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 16px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}
.config-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.config-text {
  font-size: 14px;
  color: var(--text-regular);
  em {
    font-style: normal;
    font-weight: 500;
    color: var(--primary-color);
  }
}
.config-divider {
  color: var(--border-lighter);
}

.platform-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.platform-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.platform-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-primary);
}
.platform-sub {
  padding-left: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  .sub-label {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.status-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  &.s-pending { background: #FFF7ED; color: #EA580C; }
  &.s-approved { background: #F0FDF4; color: #16A34A; }
  &.s-rejected { background: #FEF2F2; color: #DC2626; }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-placeholder);
  font-size: 14px;
}

// 物模型配置 dialog
.tm-config-section {
  padding-top: 8px;
}

.config-options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-bottom: 8px;
}

.config-sub {
  padding: 12px 0;
  &-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  &-row {
    display: flex;
    align-items: center;
    gap: 8px 16px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }
}

.config-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-right: 4px;
}

.capability-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.cap-section {
  margin-top: 16px;
  &-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  &-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.cap-tip {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-placeholder);
}

.cloud-alert {
  margin-bottom: 16px;
}

.cloud-form {
  :deep(.el-form-item) { margin-bottom: 20px; }
  :deep(.el-form-item__label) {
    color: var(--text-regular);
    font-weight: 400;
  }
}

// 算法配置 drawer
.algo-config-body {
  padding: 0 4px;
}
.algo-config-section {
  margin-bottom: 24px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
}
.capability-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.capability-tip {
  font-size: 13px;
  color: var(--text-placeholder);
}

.unit-text {
  margin-left: 8px;
  font-size: 13px;
  color: var(--text-secondary);
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<style lang="scss">
.el-dialog__body {
  padding-top: 20px;
}
.el-drawer__body {
  padding: 20px 24px;
}
</style>
