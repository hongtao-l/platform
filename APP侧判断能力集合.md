# 设备设置模块 — Item 显隐 × 接口 × 判断字段对照

> 范围：设备设置首页（`DeviceSettingPage` / `DeviceSettingFigmaShell`）及主要子页面。
> 能力字段统一收敛在 `DeviceSettingProvider`（`lib/modules/settings/device_setting_provider.dart`），
> UI 显隐由 `DeviceSettingUiMapper`（`widgets/device_setting_shell/device_setting_ui_mapper.dart`）映射。

## 一、首屏数据来源（进入设置页时拉取）

设置页数据编排在 `DeviceSettingPageCoordinator.fetchApiSnapshot`，接口并行拉取：

| 数据 | 接口 | 说明 |
|---|---|---|
| 物模型批量查询 | `POST /v3/Device/GetDeviceModel`（7.1.1） | `Modules[]` 按 `AIIoTType` 拉取，`initialDeviceConfigTypes` 共 14 类（见附录） |
| 云存储套餐 | `getDeviceCloudInfo`（云套餐服务，6.4.3） | → `provider.purchased` |
| 快速报警配置 | `POST /v3/Device/GetAlarmConfig` | → `provider.alarmConfig`（侦测开关状态） |
| 网关子设备列表 | `POST /v3/Device/GetDeviceHubList`（7.5.1） | → `provider.deviceHubList` |
| 灯光模式当前值 | `POST /v3/Device/GetDeviceCustomAbility` | → `LightModelModule` |
| 产品自定义能力 | `POST /v3/Device/GetProductCustomAbility` | 解析 `LightMode`（灯光模式）与 `WorkMode`（省电模式）产品能力；入参 `ProductID` 取自物模型 1050 `Buss.AppID` |
| 固件升级检查 | SDK P2P 检查（后台不阻塞首屏） | → `provider.hasNewFirmware` |

另外，`DevItem`（`isOwner` / `presence` / `DevicePermission` / `batteryType` / `awakeAbility`）
来自**首页设备列表**（非设置页接口），页面内通过 `syncDeviceItemFromHomeList` 持续对齐。

## 二、设置首页 Item 显隐总表

### 2.1 整页级别开关

| 条件 | 判断字段 | 来源 |
|---|---|---|
| 设备在线才展示完整设置列表（`showFullSettingsList`） | `presence == '1' / '3' / '5'` | `DevItem.presence`（首页列表） |
| 有「设备设置」进入权限（`canAccessSettings`） | `hasEntryPermission(HomeEntryPermission.settings)`：属主恒 true；被分享者看 `DevicePermission` 是否含 `settings`（或 `all`） | `DevItem.devicePermission`（首页列表） |
| 「仅可使用」解绑按钮 | `isViewOnlySharedDevice` = 非属主 且 `DevicePermission == "[]"` | `DevItem.devicePermission`（首页列表） |
| 功能区整体（云存储 / 侦测卡片带） | 在线 且（云存储 / 基础侦测 / PIR 任一支持） | 见 2.2 |

### 2.2 功能区卡片带（FeatureBand）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 云存储卡片 | `isSupportCloud` | 物模型 **1050**（basicDevice）`Buss.SupportCloudFlag == '1'` | GetDeviceModel |
| 云存储卡片「已购买」态 | `purchased` | 云套餐 `hasActiveCloudPackage` | `getDeviceCloudInfo`（6.4.3） |
| 基础侦测高亮卡 | `isSupportBasicDetection` | 物模型 **1057**（eventServiceConfig）`Buss.ServiceIDs` 含 ServiceID `300026` 或 `300027` 且对应 `OpenFlag == '1'` | GetDeviceModel |
| PIR 侦测高亮卡 | `isSupportPIR` | 物模型 **1057** `Buss.ServiceIDs` 含 ServiceID `300048` 且对应 `OpenFlag == '1'` | GetDeviceModel |

### 2.3 分组列表项

#### 「智能告警与通知」分组（Section 1）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 智能报警 | `listVisibility.basicDetection` | 同 2.2 基础侦测：1057 `ServiceID 300026/300027` + `OpenFlag=='1'` | GetDeviceModel |
| 通知设置 | **始终显示**（在线且有权限时） | — | — |

#### 「设备设置」分组（Section 2）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 视频设置（录像设置） | **始终显示** | — | — |
| 画面声音设置 | **始终显示** | — | — |
| *云台设置（验证通过） | `listVisibility.ptz` | 物模型 **1006**（ptzMotor）`Prop.PTZAbility != 0` | GetDeviceModel |
| 存储卡设置 | **暂隐藏**（`DeviceSettingUiMapper.showSdCardSettingEntry = false`） | 常量开关 | — |
| 省电模式 | `listVisibility.operatingMode` | `GetProductCustomAbility` → `Device.Properties[]` 中 `Identifier == 'WorkMode'` 且 `ModuleIdentifier` 为空或 `'WorkModeModule'`（兼容旧结构：响应树含 `WorkModeModule` key）；有本地缓存 `WorkModeEntryCache` 兜底 | GetProductCustomAbility |
| *电池管理（验证未通过） | `listVisibility.battery` | 物模型 **1040**（battery）`Prop.EnergyType == '1'` | GetDeviceModel |
| 报警设置（独立入口） | **暂隐藏**（`DeviceSettingUiMapper.showAlarmSettingEntry = false`），已并入「智能告警」 | 常量开关 | — |

#### 「设备分享与转移」分组（Section 3）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 分享与转移设备 | 属主 且 设备在线 | `DevItem.isOwner` + `presence`（首页列表） | — |

### 2.4 顶部设备信息卡

| 元素 | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 云存储图标（开/关态） | `purchased` | 云套餐 `hasActiveCloudPackage` | `getDeviceCloudInfo` |
| SD 卡图标（有卡/无卡态） | `hasTFCard` | 物模型 **1002**（tfCardStorage）`Buss.StorageStatus == '1'` | GetDeviceModel |
| WiFi 图标 | `isWifiSupported` | 物模型 **1041**（networkConfig）`Prop.NetAccessAbility == 0x02`（精确等于，非按位） | GetDeviceModel |
| SIM 卡号行 | `supports4g \|\| sim 非空` | 1041 `Prop.NetAccessAbility & 0x08 != 0`（支持 4G）或 `Buss.SimSlots[].ICCID` 非空 | GetDeviceModel |
| 固件新版本角标 | `hasNewFirmware` | `firmwareUpgradeStatus == 1` | SDK 固件检查（后台） |
| 复制按钮 / 右箭头 | `canAccessSettings` | 同 2.1 | 首页列表 |

## 三、子页面 Item 显隐

### 3.1 通知设置页（NotificationSettingPage）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| APP 推送开关 | 始终显示 | — | — |
| 推送频率 | APP 推送开启（`showPushFrequency: appPushEnabled`） | `notificationAppPushEnabled`（由策略推导） | `GetEventTiggerActionPolicy`（EventID 100000/100001 → Action 1013 `Output.PushFlag` 任一非 0） |
| 仅人经过时通知我 | **暂隐藏**（`showHumanOnlyPush: false` 硬编码） | 常量 | — |
| 推送时间（全天/自定义） | **暂隐藏**（`showPushTimeSection: false` 硬编码） | 常量 | — |
| 系统通知权限提示条 | 本地系统推送权限未开（`_notifyFlagShow`） | 本地权限检查，非接口 | — |

### 3.2 视频设置页（StorageSettingPage）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 整页 | `hasTFCard == false` → 渲染**无卡页** `SdCardStorageNoCardPage` | 物模型 **1002** `Buss.StorageStatus == '1'` | GetDeviceModel |
| 录像模式 | **暂隐藏**（前端固定） | — | — |
| 录像清晰度 | 固定「超清」且禁用点击（`recordingQualityLockedToUltra`） | — | — |
| 存储空间区 | 仅展示容量，不可点击（存储卡页入口暂隐藏） | — | `GetSDCardInfo`（7.4.17，容量） |

### 3.3 画面声音设置页（ImageAudioSettingPage）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 灯光设置（弹 LightMode 选择器） | `isSupportLightMode` | `GetProductCustomAbility` → `Identifier == 'LightMode'`（`ModuleIdentifier` 空或 `LightModelModule`），有 `LightModeEntryCache` 兜底 | GetProductCustomAbility |
| 夜视设置 | 无灯光模式时显示（`isSupportLegacyNightVision`） | `!isSupportLightMode` 且物模型 **1012**（videoManagement）`Prop` 首路 `IRRedAbility == 1/2` | GetDeviceModel |
| 白光灯开关 | 按产品要求**隐藏（仅 A）**；回退逻辑为 `isSupportLegacyWhiteLight` | `!isSupportLightMode` 且 物模型 **1007**（whiteLight）`Prop.LampAbility == '1'` | GetDeviceModel |
| *画面垂直翻转 | `supportScreenFlip` | 物模型 **1012** `Prop` 首路 `supportInversion`（缺省按 true） | GetDeviceModel |
| *设置麦克风音量 | `supportMicInput` | 物模型 **1051**（audioManagement）`Prop.MicVolumeAbility == '1'` | GetDeviceModel |
| *设置喇叭音量 | `supportSpeakerOutput` | 物模型 **1009**（speaker）`Prop.VolumeSetAbility == '1'` | GetDeviceModel |

### 3.4 云台设置页（PtzSettingPage）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 整页入口 | 首页 `isPtzSupported`（见 2.3） | 1006 `Prop.PTZAbility != 0` | GetDeviceModel |
| 转速分区 | **暂隐藏**（`PtzSettingFigmaShell.showRotationSpeed = false`） | 常量开关 | — |
| 高级设置 → 预置位 | 始终显示；进入预置位页若低功耗设备先走唤醒（`batteryType != 0 \|\| presence == '2'`） | `DevItem.batteryType` / `presence` | 首页列表 + `AwakeDevice` |

### 3.5 智能告警页（SmartAlarmPage，由「智能报警」进入）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 运动侦测行 | `MotionAbility == '1'` | 物模型 **1000**（imageAlgorithm）`Prop.MotionAbility` | GetDeviceModel |
| 人形侦测行 | `HumanAbility == '1'` | 物模型 **1000** `Prop.HumanAbility` | GetDeviceModel |
| 人形追踪 | `supportsHumanTrace` | 物模型 **1000** `Prop.TraceAbility & 0x02` | GetDeviceModel |
| 移动追踪 | `supportsMotionTrace` | 物模型 **1000** `Prop.TraceAbility & 0x01` | GetDeviceModel |
| 画面侦测区 | **暂隐藏**（`SmartAlarmUiMapper.showDetectionAreaRow: false`） | 常量开关 | — |
| 白光灯设置 | 任一事件含 Action `AIIoTType=1007` | `GetEventTiggerActionPolicy` EventID `100000/100001` 的 Action 列表 | GetEventTiggerActionPolicy |
| 报警铃声设置区块 | `isRingToneSetSupported` | 物模型 **1009**（speaker）`Prop.RingToneSetAbility != 0`（缺省按 0 隐藏） | GetDeviceModel |
| PIR 侦测入口（AppBar） | `isSupportPIR` | 1057 `ServiceID 300048` + `OpenFlag=='1'` | GetDeviceModel |

### 3.6 电池管理页（BatteryManagerPage）

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 工作模式选择区块 | `_isSupportPIR && _isSupportRecord` | PIR：物模型 **1003**（pirInfrared）`Buss` 含 `Interval`；录像：物模型 **1002**（tfCardStorage）`Buss.RecordMode` 与 `Duration` 非空 | GetDeviceModel |
| 低电量报警 | `isSupportLowBatteryAlarm` | `GetProductCustomAbility` → `Device.Properties[]` 含 `Identifier == 'LowBatteryAlarmThreshold'` | GetProductCustomAbility |
| 电量统计 | 恒显示（进入即拉取） | — | `GetDevicePowerStats` |

### 3.7 省电模式页 / 灯光设置页

| Item | 显示条件 | 判断字段 | 接口 |
|---|---|---|---|
| 省电模式入口（首页） | 见 2.3 `operatingMode` | GetProductCustomAbility `WorkMode` | GetProductCustomAbility |
| 可选模式列表 | 按产品 `Enum.Value` 过滤（未查到产品能力则展示全量 5 档） | `WorkModeProductProperty.enumValues` | GetProductCustomAbility |
| 灯光模式可选列表 | 按产品 `Enum.Value` 过滤（未查到则全量 5 档） | `LightModeProductProperty.enumValues` | GetProductCustomAbility |

## 四、附录：物模型 AIIoTType 对照（GetDeviceModel）

| AIIoTType | 用途 | 关键判断字段（显隐相关） |
|---|---|---|
| 1050 | 设备基础配置 | `Buss.SupportCloudFlag`、`Buss.AppID`（ProductID）、`Buss.DevVersion` |
| 1041 | 设备网络配置 | `Prop.NetAccessAbility`（0x01 有线 / 0x02 WiFi / 0x08 4G）、`Buss.SimSlots[].ICCID` |
| 1012 | 视频管理 | 首路 `Prop`：`IRRedAbility`、`supportInversion`；`Buss.IRRedMode` |
| 1051 | 音频管理 | `Prop.MicVolumeAbility` |
| 1009 | 喇叭管理 | `Prop.VolumeSetAbility`、`Prop.BuzzerAbility`、`Prop.RingToneSetAbility`、`Prop.VoicePlayAbility` |
| 1006 | PTZ 马达 | `Prop.PTZAbility` |
| 1007 | 白光灯管理 | `Prop.LampAbility`、`Prop.FullColorMode` |
| 1002 | TF 卡存储 | `Buss.StorageStatus`（1=有卡）、`Buss.RecordMode/Duration` |
| 1040 | 电池管理 | `Prop.EnergyType`（1=电池供电） |
| 1000 | 图像基本算法 | `Prop.MotionAbility`、`Prop.HumanAbility`、`Prop.FaceAbility`、`Prop.TraceAbility` |
| 1057 | 事件业务配置 | `Buss.ServiceIDs[]`：`ServiceID` + `OpenFlag`（300026/300027=基础侦测，300048=PIR） |
| 1008 | 状态灯管理 | `Prop.StatusLampAbility` |
| 1003 | PIR 人体红外 | `Buss.Interval` 等 |

## 五、判断字段速查

| Provider 字段 | 表达式 | 接口 |
|---|---|---|
| `isSupportCloud` | 1050 `SupportCloudFlag=='1'` | GetDeviceModel |
| `isSupportBasicDetection` | 1057 `300026/300027` + `OpenFlag=='1'` | GetDeviceModel |
| `isSupportPIR` | 1057 `300048` + `OpenFlag=='1'` | GetDeviceModel |
| `isPtzSupported` | 1006 `PTZAbility != 0` | GetDeviceModel |
| `isBatterySupported` | 1040 `EnergyType=='1'` | GetDeviceModel |
| `supportOperatingMode` | ProductCustomAbility `WorkMode`（+ 本地缓存） | GetProductCustomAbility |
| `isSupportLightMode` | ProductCustomAbility `LightMode`（+ 本地缓存） | GetProductCustomAbility |
| `isSupportStatusLamp` | 1008 `StatusLampAbility=='1'` | GetDeviceModel |
| `isSupportLegacyNightVision` | `!LightMode` 且 1012 `IRRedAbility ∈ {1,2}` | GetDeviceModel |
| `isSupportLegacyWhiteLight` | `!LightMode` 且 1007 `LampAbility=='1'` | GetDeviceModel |
| `isSupportLamp` | 1007 `LampAbility=='1'` | GetDeviceModel |
| `isSupportFullColorNightVision` | 1007 `FullColorMode != 0` | GetDeviceModel |
| `isWifiSupported` | 1041 `NetAccessAbility == 0x02` | GetDeviceModel |
| `hasTFCard` | 1002 `StorageStatus=='1'` | GetDeviceModel |
| `isSupportStorage` | 1002 `supportFlag=='1'` | GetDeviceModel |
| `purchased` | 云套餐 `hasActiveCloudPackage` | getDeviceCloudInfo |
| `hasNewFirmware` | SDK 检查 `firmwareUpgradeStatus==1` | SDK 固件检查 |
| `isSupportBuzzer` | 1009 `BuzzerAbility=='1'` | GetDeviceModel |
| `isRingToneSetSupported` | 1009 `RingToneSetAbility != 0` | GetDeviceModel |
| `voicePlayAbility` | 1009 `VoicePlayAbility`（0 不支持 / 1 半双工 / 2 全双工） | GetDeviceModel |
| `supportsMotionTrace / supportsHumanTrace` | 1000 `TraceAbility & 0x01 / 0x02` | GetDeviceModel |
| `isLowPowerDevice()` | `awakeAbility ∈ {1,2,3}` 或 `presence=='3'` 或 `batteryType != 0` | 首页列表 |
