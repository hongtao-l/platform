# 设备设置与物模型能力映射表

> 基于 `ZJ_Viewer.framework` SDK，分析项目中设备设置页面的功能调用字段及其对应的物模型能力（IOT Type）。

---

## 1. SDK 架构概述

项目使用 **ZJ_Viewer SDK** 与设备进行通信，核心入口类：

| SDK 类 | 用途 |
|--------|------|
| `ZJViewerDevice` | 设备基础信息、镜头控制、网络/时间/存储设置、PTZ 控制 |
| `ZJViewerIOT` | 内置/外接 IOT 能力的状态读取与属性设置 |
| `ZJViewerPolicy` | 报警策略、定时策略管理 |
| `ZJDeviceConfigManager` | 设备统一配置管理器（静态方法） |
| `ZJ_PropModel` | IOT 属性模型，定义了各 IOT 类型的参数字段 |

**关键 API 调用方式：**

| API 方法 | 适用场景 |
|----------|----------|
| `setInIoTProp` | 设置内置 IOT 属性（propInfo 字典/JSON） |
| `setInIoTBuss` | 设置内置 IOT 业务属性（bussInfo 字典/JSON） |
| `setInIoTOpenFlag` | 设置内置 IOT 开关状态 |
| `setAIIoTOutputParam` | 设置外接 IOT 输出属性 |
| `setAIIoTPropInHub` | 设置外接 IOT 属性 |
| `setAIIoTOpenFlagInHub` | 设置外接 IOT 开关状态 |
| `ctrlDevFunc` | 泛用设备功能控制信令（传入 iotType + JSON 参数） |
| `setAlarmPolicy` | 设置报警策略 |
| `setTimerPolicy` | 设置定时策略 |

---

## 2. 内置 IOT 能力与字段映射（EN_ZJ_VIEWER_AIIOT_TYPE）

### 2.1 运动侦测 (MOTION = 1000)

**对应设置页：** 报警设置 → 移动侦测

**属性模型：** `ZJ_PropModel.initWithMotionModel` + `ZJ_MotionModel`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 开关状态（0 关闭 / 1 打开） |
| `Sensitive` | NSInteger | 灵敏度（0-100） |
| `Trace` | NSInteger | 是否跟踪 |
| `Interval` | NSInteger | 检测间隔（秒） |
| `ActiveTime` | NSInteger | 持续时长（秒） |

**propInfo JSON 示例：**
```json
{
  "Motion": {
    "Status": 1,
    "Sensitive": 80,
    "Trace": 1,
    "Interval": 10,
    "ActiveTime": 5
  }
}
```

---

### 2.2 人形侦测 (HUMANOID，通过报警策略关联)

**对应设置页：** 报警设置 → 人形侦测

**属性字段：** 通过 `ZJ_HumanModel` 承载，嵌套在 `ZJ_PropModel.Human` 中

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 开关状态 |
| `Sensitive` | NSInteger | 灵敏度（0-100） |
| `Trace` | NSInteger | 是否跟踪 |
| `Interval` | NSInteger | 检测间隔（秒） |
| `ActiveTime` | NSInteger | 持续时长（秒） |

**相关文件：** `HYPAlarmSettingViewController.m`, `HYPNewAlarmSettingViewController.m`

---

### 2.3 人脸侦测 (FACE，通过报警策略关联)

**对应设置页：** 人脸识别设置

**属性字段：** 通过 `ZJ_FaceModel` 承载

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 开关状态 |
| `Sensitive` | NSInteger | 灵敏度 |
| `Trace` | NSInteger | 是否跟踪 |
| `Interval` | NSInteger | 检测间隔（秒） |
| `ActiveTime` | NSInteger | 持续时长（秒） |

**相关文件：** `HYPAIFaceManager.m`, `HYPFaceRecognitionAddViewController.m`

---

### 2.4 区域侦测 (FENCE/AREA = 1067)

**对应设置页：** 检测区域设置

**属性字段：** 通过 `ZJ_FenceModel` 承载

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 开关状态 |
| `OnlyFlag` | NSInteger | 是否只在区域内触发（1: 区域内 / 0: 整个画面） |
| `Regions` | NSArray<ZJ_Region *> | 区域数组 |

**ZJ_Region：**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `RegionId` | NSInteger | 区域 ID |
| `RegionPoints` | NSArray<ZJ_RegionPoint *> | 区域顶点坐标列表 |

**ZJ_RegionPoint：**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `x` | double | X 坐标比值（0-1） |
| `y` | double | Y 坐标比值（0-1） |

**通过 `setInIoTBuss` 设置到 EN_ZJ_VIEWER_AIIOT_TYPE_CAMERA (1012)**

**相关文件：** `HYPNewDetectionAreaViewController.m:1084`

---

### 2.5 录像 (RECORD = 1002)

**对应设置页：** 录像设置 → SD 卡录像

**属性模型：** `ZJ_PropModel.initForLocalRecord`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 录像状态（0: 未录制 / 1: 录制中） |
| `RecordLoop` | NSInteger | 循环录像开关 |
| `RecordFull` | NSInteger | 全天录像标志（1: 开启 / 0: 停止） |
| `StreamID` | NSInteger | 录制码流（0: 主码流 / 1: 次码流） |

**另外通过 `ZJViewerDevice.setRecordPropOpenFlag` 设置：**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `openFlag` | NSUInteger | 存储开关 |
| `loopFlag` | NSUInteger | 循环录制（1: 循环 / 0: 不循环） |
| `recordType` | NSUInteger | 存储类型（0: 定时录制 / 1: 全天录制） |
| `streamId` | NSInteger | 码流 ID |

**相关文件：** `SaiboluzhiSettingViewController.m:180`

---

### 2.6 云端录像 (CLOUDRECORD = 1010)

**对应设置页：** 云存储设置

**属性模型：** `ZJ_PropModel.initForCloudRecord`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 云录像状态 |
| `LoopDays` | NSInteger | 保存天数 |
| `RecordType` | NSInteger | 云存套餐类型（1: 24小时 / 2: 报警云存） |
| `StreamID` | NSInteger | 录制码流 |

**相关文件：** `HYPRecordSettingViewController.m`, `HYPCloudStoreView.m`

---

### 2.7 内置 PIR (INNER_PIR = 1003)

**对应设置页：** PIR 设置（低功耗门铃）

**属性模型：** `ZJ_PropModel.initForPIR`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Sensitive` | NSInteger | 灵敏度（0-100） |

**相关文件：** `HYPAddDoorBellViewController.m`, `HYPPirQuyuzhenceViewController.m`

---

### 2.8 声音检测 (VOICEALARMDETECT = 1004)

**对应设置页：** 声音报警设置

**属性模型：** `ZJ_PropModel.initForVoice`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Sensitive` | NSInteger | 灵敏度（0-100） |

---

### 2.9 截图 (SNAPSHORT = 1005)

**对应设置页：** 抓图设置

**属性模型：** `ZJ_PropModel.initForLocalSnap`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 当前状态 |
| `LoopFlag` | NSInteger | 循环抓图（0: 不循环 / 1: 循环） |
| `Interval` | NSInteger | 定时抓图间隔 |
| `PicType` | NSInteger | 图片尺寸类型 |
| `FullFlag` | NSInteger | 全天抓图标志 |

---

### 2.10 云台控制 (PTZ = 1006)

**对应设置页：** PTZ 控制 / 预置位设置

**属性模型：** `ZJ_PropModel.initForPTZ`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Speed` | NSInteger | 转速 |
| `Step` | NSInteger | 步长 |

**PTZ 相关操作（ZJViewerDevice）：**
| API 方法 | 参数 | 说明 |
|----------|------|------|
| `startCtrlPtz` | step, speed, PTZMoveType | 控制云台方向 |
| `ctrlPtzToPresetPoint` | presetId | 转到预置位 |
| `ctrlPtzToCruise` | cruiseId | 转到巡航轨迹 |
| `stopCtrlPtz` | - | 停止 PTZ |
| `addPtzCruise` | cruise | 添加巡航 |
| `deletePtzCruise` | cruiseId | 删除巡航 |
| `setPtzWatchPoint` | presetId, watchTime | 设置看守位 |
| `deletePtzWatchPoint` | - | 删除看守位 |
| `setPtzCheck` | - | PTZ 自检 |

---

### 2.11 内置白光灯 (INNER_LAMP = 1007)

**对应设置页：** 灯光设置

**属性模型：** `ZJ_PropModel.initForWhiteLight`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Brightness` | NSInteger | 亮度 |
| `Flicker` | NSInteger | 闪烁模式（0: 不闪烁 / 1: 闪烁） |

**通过 `setInIoTBuss` 设置的额外字段（HYPLightingRegulationView）：**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `CtrlType` | NSString | 控制类型（0: 关闭 / 1: 白光 / 2: 红外 / 3: 全彩） |
| `ColorTemp` | NSInteger | 色温值 |
| `Level` | NSInteger | 亮度级别 |

**相关文件：** `HYPLightingRegulationView.m`, `HYPLightModeSelectViewController.m`

---

### 2.12 内置状态指示灯 (INNER_STATELAMP = 1008)

**对应设置页：** 相机设置 → 状态灯

**属性模型：** `ZJ_PropModel.initForStatusLight`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Brightness` | NSInteger | 指示灯亮度 |
| `Flicker` | NSInteger | 闪烁模式（0: 不闪烁 / 1: 闪烁） |

**API 调用：** `setAIIoTOutputParamWithIOTType:EN_ZJ_VIEWER_AIIOT_TYPE_INNER_STATELAMP`

**相关文件：** `HYPLiveVideo_ViewController.m:9801`

---

### 2.13 内置蜂鸣器 (BUZZER = 1009)

**对应设置页：** 报警提示音 / 声音设置 / 定时提醒播报

**属性模型：** `ZJ_PropModel.initForBuzzer`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Volume` | NSInteger | 音量 |

**通过 OutPutEvent 承载的蜂鸣器属性：**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `HYPbuzzerStatus` | int | 蜂鸣器开关（1: 打开 / 非1: 关闭） |
| `HYPcustomSoundName` | NSString | 自定义铃声文件名 |
| `HYPloopCount` | int | 铃声循环播放次数 |

**铃声通过 ZJViewerDevice 管理：**
| API | 说明 |
|-----|------|
| `getSoundList` | 获取设备铃声列表 |
| `pushSoundFile` | 上传铃声文件 |
| `deleteSound` | 删除铃声 |
| `getCloudSoundList` | 获取云端铃声列表 |

**相关文件：** `HYPAlarmSettingViewController.m`, `HYPDeviceAlwaysOnTableViewController.m`, `HYPBroadcastTaskAddViewController.m`

---

### 2.14 云端截图 (CLOUDSNAP = 1011)

**对应设置页：** 云抓图设置

**属性模型：** `ZJ_PropModel.initForCloudSnap`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 云抓图状态 |
| `LoopDays` | NSInteger | 保存天数 |
| `Interval` | NSInteger | 抓图间隔 |
| `PicType` | NSInteger | 图片尺寸类型 |
| `RecordType` | NSInteger | 抓图类型（1: 事件抓图 / 2: 全天抓图） |
| `GifFlag` | NSInteger | 动图能力 |
| `GifOpenFlag` | NSInteger | 动图开关 |
| `StorageType` | NSInteger | 存储格式（0: 私有格式 / 1: 标准格式） |

---

### 2.15 摄像机 (CAMERA = 1012)

**对应设置页：** 相机设置 / 画面设置

**通过 `setInIoTBuss` 设置的属性（bussInfo 字典）：**

| 字段名 | 说明 |
|--------|------|
| `CtrlType` | 控制类型 |
| 区域检测坐标 | `DetectAreaList[]` |

**相关文件：** `HYPNewDetectionAreaViewController.m`, `ScreenAndRingBellSetViewController.m`

---

### 2.16 事件记录 (EVENT = 1013)

**对应设置页：** 推送设置

**属性模型：** `ZJ_PropModel.initForEvent`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `PushFlag` | NSInteger | 推送总开关 |
| `SMSFlag` | NSInteger | 短信报警开关 |
| `EmailFlag` | NSInteger | 邮件报警开关 |
| `EmailAddr` | NSString | 接收邮箱地址 |
| `Interval` | NSInteger | 默认推送间隔 |
| `Week` | NSInteger | 星期（16进制位） |
| `SpanFlag` | NSInteger | 是否跨天 |
| `StartTime` | NSInteger | 开始时间（当天秒数） |
| `EndTime` | NSInteger | 结束时间（当天秒数） |

**相关文件：** `HYPAlarmNotificaitonViewController.m`

---

### 2.17 红外灯/夜视模式 (DNSET = 1014)

**对应设置页：** 夜视设置 / 红外模式

**属性模型：** `ZJ_PropModel.initForInfraredLight`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `IrcutType` | NSInteger | 模式（0x01: 自动 / 0x02: 手动+自动 / 0x03: 手动） |
| `IDRMax` | NSInteger | 最大取值 |
| `IDRDay` | NSInteger | 切白天阈值 |
| `IDRNight` | NSInteger | 切夜晚阈值 |

**另外通过 `ZJViewerDevice.setCamIRMode` 设置红外模式：**
| 模式值 | 说明 |
|--------|------|
| `EN_ZJ_VIEWER_IRMODE_AUTO = 0` | 智能 |
| `EN_ZJ_VIEWER_IRMODE_AUTO_NOLAMP = 1` | 红外自动，不联动白光灯 |
| `EN_ZJ_VIEWER_IRMODE_FULLCOLOR = 2` | 全彩 |
| `EN_ZJ_VIEWER_IRMODE_NATURAL = 3` | 星光夜视 |
| `EN_ZJ_VIEWER_IRMODE_IR = 4` | 强制红外 |

**相关文件：** `HYPCameraSettingViewController.m:337`, `HYPLightModeSelectViewController.m:291`

---

### 2.18 逗留检测 (STAY = 1016 / DWELL = 1032)

**对应设置页：** 逗留检测设置

**属性模型：** `ZJ_PropModel.initForStay`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `ActiveTime` | NSInteger | 逗留时长 |

**API：** `ZJViewerPolicy.setStayTime`

---

### 2.19 摔倒检测 (FALLDOWN = 1024)

**对应设置页：** 老人看护 → 摔倒检测

**属性模型：** `ZJ_PropModel.initForFall`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Sensitive` | NSInteger | 灵敏度（0-100） |
| `Interval` | NSInteger | 检测间隔 |

---

### 2.20 火焰检测 (FLAMEDETECT = 1025)

**对应设置页：** AI 检测 → 火焰检测

**属性模型：** `ZJ_PropModel.initForFire`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Sensitive` | NSInteger | 灵敏度（0-100） |

---

### 2.21 烟雾检测 (SMOKEDETECT = 1026)

**对应设置页：** AI 检测 → 烟雾检测

**属性模型：** `ZJ_PropModel.initForSmoke`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Sensitive` | NSInteger | 灵敏度（0-100） |

---

### 2.22 哭声检测 (CRYALARM = 1028)

**对应设置页：** AI 检测 → 哭声检测

**属性模型：** `ZJ_PropModel.initForCry`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Sensitive` | NSInteger | 灵敏度（0-100） |

---

### 2.23 宠物检测 (PETDETET = 1029)

**对应设置页：** AI 检测 → 宠物检测

**通过 bussInfo 设置的属性（PetdetefBussInfo）：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSString | 开关状态 |
| `Sensitive` | NSString | 灵敏度 |
| `Interval` | NSString | 间隔时间 |
| `Schedule` | NSMutableArray<ScheduleInfo *> | 定时时间段 |
| `Action` | NSMutableArray<ActionBussInfo *> | 联动动作 |
| `DetectAreaList` | NSMutableArray<DetectAreaListInfo *> | 检测区域列表 |

**相关文件：** `HYPNewDetectionAreaViewController.m:252`

---

### 2.24 报警灯 (ALARM_LAMP = 1030)

**对应设置页：** 报警设置 → 报警灯联动

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `alarmLampStatus` | BOOL | 报警灯开关 |
| `alarmLampDuration` | NSInteger | 报警灯时长 |

**相关文件：** `HYPAlarmSettingViewController.m:1500`, `HYPAlarmNotificaitonViewController.m:755`

---

### 2.25 全抓图 (SNAPJPG = 1033)

**对应设置页：** 抓图设置

**属性模型：** `ZJ_PropModel.initForFullSnap`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `PicType` | NSInteger | 图片尺寸类型 |
| `Interval` | NSInteger | 抓图间隔 |
| `SnapCnt` | NSInteger | 抓图次数 |
| `StorageType` | NSInteger | 存储格式（0: 私有 / 1: 标准） |

---

### 2.26 手势/手语 (SIGNLANGUAGE = 1034)

**对应设置页：** 手势呼叫 / OK 手势

**相关文件：** `VideoDoorBellSettingViewController.m:1501`

---

### 2.27 一键呼叫 (TOUCHCALL = 1037)

**对应设置页：** 一键呼叫 / 设备报警按钮

**通过 `ctrlDeviceClickAlarm` API 控制：**

| 参数 | 说明 |
|------|------|
| `status` | BOOL（YES: 打开 / NO: 关闭） |

**一键报警的额外属性（通过 ClickAlarmInfo）：**
| 字段名 | 说明 |
|--------|------|
| `fileName` | 报警音频文件名 |
| `alarmDuration` | 报警持续时长（秒） |
| `alarmLampFlag` | 报警灯同步标志 |

---

### 2.28 灯光模式 (LIGHTING = 1038)

**对应设置页：** 灯光模式选择 / 多灯光场景

**通过 `setInIoTBuss` 设置的字段：**
| 字段名 | 说明 |
|--------|------|
| `CtrlType` | 模式类型（0: 关闭 / 1: 白光 / 2: 红外 / 3: 全彩） |
| `Brightness` | 亮度值 |
| `ColorTemperature` | 色温值 |

**定时策略 ID：**
| PolicyID | 说明 |
|----------|------|
| 20-23 | 白光灯时间段控制 |

**相关文件：** `HYPMutiLightModeViewController.m`, `HYPDengGuangV3ZiDiYingViewController.m`

---

### 2.29 双向视频 (RVSVIDEO = 1064)

**对应设置页：** 双向视频 / 设备常亮设置

**相关文件：** `HYPDeviceAlwaysOnTableViewController.m:49`

---

### 2.30 设备状态检测 (STATUS_DETECT = 1093)

**对应设置页：** 设备状态检测 / 在线检测

**通过 bussInfo 设置的属性（DeviceStatusBussInfo）：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Status` | NSInteger | 检测开关状态 |
| `TimeArea` | NSString | 时区 |
| `TimeZone` | NSString | 时间区域 |
| `Schedule` | NSMutableArray<TimeModel *> | 时间调度列表 |

**TimeModel：**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Week` | NSInteger | 星期 |
| `StartTime` | NSInteger | 开始时间（秒数） |
| `EndTime` | NSInteger | 结束时间（秒数） |

**相关文件：** `HYPModelConfigurationViewController.m:90`, `VideoDoorBellSettingViewController.m:1495`

---

### 2.31 智能检测 (AIDETECT = 1098)

**对应设置页：** AI 报警设置

**相关文件：** `HYPAlarmSettingViewController.m:353`

---

### 2.32 时光相册 (AlbumList = 1100)

**对应设置页：** 时光相册设置

**属性字段（通过 PhotoPropertiesInfo / VideoPropertiesInfo）：**

| 字段名 | 说明 |
|--------|------|
| `AlbumType` | 相册类型（0x01: 常规 / 0x02: 老人 / 0x03: 儿童 / 0x04: 宠物） |
| `videoMode` | 视频模式（1: 时光缩影 / 2: 轮播模式） |
| `AlertConf.OpenFlag` | 告警图片开关 |
| `TimerPolicys[]` | 定时策略列表 |
| `VideoProperties[]` | 视频属性 |

**相关文件：** `HYPTimeAlbumViewController.m`, `HYPAlbumSettingupViewController.m`

---

## 3. 外接 IOT 能力（EN_ZJ_VIEWER_AIIOT_TYPE 外接设备）

外部 IOT 子设备通过 `ZJViewerIOT.setAIIoTOutputParam` / `setAIIoTPropInHub` 等方法控制。

### 3.1 外接 IOT 类型枚举

| 枚举值 | ID | 设备类型 |
|--------|-----|---------|
| REMOTECTRLER | 0 | 遥控器 |
| DOORSWITCH | 1 | 门磁 |
| SMOKETRANSDUCER | 2 | 烟雾传感器 |
| GASSENSOR | 3 | 燃气探测器 |
| LIGHTSWITCH | 4 | 电灯 |
| CURTAIN | 5 | 窗帘 |
| JACK | 6 | 插座 |
| PIR | 7 | 人体红外 |
| WATER | 8 | 水浸 |
| ERG | 9 | 紧急按钮 |
| ALARMBEER | 10 | 警号 |
| JCAKHVAC | 11 | 空调插座 |
| MULTISWITCH | 12 | 多路开关 |
| SHUTTERMOTOR | 13 | 卷帘电动机 |
| GLASSBROKENSENSOR | 20 | 玻璃破碎传感器 |
| INFRAREDSENSOR | 23 | 红外对射 |
| BATTERYVALVE | 24 | 电磁阀门 |
| AIRFLOWSENSOR | 25 | 气流传感器 |
| MULTICTR | 32 | 多功能控制 |
| INTELLOCK | 33 | 智能锁 |
| DOORBELL | 34 | 门铃 |
| COSENSOR | 40 | 一氧化碳探测器 |
| TEMP_HUMI | 41 | 温湿度传感器 |

### 3.2 外接 IOT 通用控制字段

**通过 `OutputParamDict` 控制：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `OpenFlag` | NSNumber | 开关状态 |
| `Name` | NSString | 设备名称重命名 |

**插座（JACK）特殊属性：**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Switch` | int | 插座开关 |

---

## 4. 设备基础设置（ZJViewerDevice API）

这些设置不通过 IOT 类型，而是直接调用 `ZJViewerDevice` 的方法。

### 4.1 设备信息

| API | 说明 |
|-----|------|
| `getDeviceInfo` | 获取设备信息（名称、版本、类型等） |
| `setDeviceName` | 修改设备名称 |

### 4.2 时间设置

| API | 参数 | 说明 |
|-----|------|------|
| `setZoneAndTime` | time, timeZone, syncFlag, timeMode, dstArea | 时区/时间设置 |
| `setDstZone` | dstZone, timeMode | 夏令时设置 |
| `getZoneAndTime` | - | 获取设备时区信息 |

### 4.3 网络设置

| API | 参数 | 说明 |
|-----|------|------|
| `getWiFiList` | - | 获取设备周围 WiFi 列表 |
| `setDeviceWiFiWithSSid` | ssid, pwd | 配置 WiFi |
| `getCurNetworkInfo` | - | 获取当前网络信息 |
| `setDeviceHotspotPwd` | pwd | 设置 AP 热点密码 |
| `setHotspotPwdAlert` | openFlag | 热点密码提示开关 |

### 4.4 存储管理

| API | 说明 |
|-----|------|
| `formatTFCard` | 格式化 TF 卡 |
| `getTFCardInfo` | 获取 TF 卡信息 |
| `setRecordPropOpenFlag` | 设置录像存储属性 |

### 4.5 镜头/画面设置

| API | 参数 | 说明 |
|-----|------|------|
| `setCamOpenflag` | openFlag | 摄像头开关 |
| `setMicStatus` | micStatus | 麦克风开关 |
| `switchCamFlash` | camFlash | 闪光灯开关 |
| `setCamIRMode` | irMode | 红外夜视模式 |
| `setCamInversionRotateType` | rotateType | 画面翻转 |
| `setCamMirrorRotateType` | rotateType | 镜像设置 |
| `setVideoParamStreamId` | streamId, videoParam | 视频编码参数 |
| `setAudioParam` | audioParam | 音频编码参数 |
| `switchCameraLensLenId` | lenId | 切换多目镜头 |
| `setDefaultLenId` | defaultLenId, autoFlag | 默认镜头设置 |
| `setFocalLenth` | lenId, ctrlType, direction, zoomValue | 变焦控制 |
| `setDeviceCamOsdInf` | osdInf, osdPosition | 水印设置 |
| `setDeviceOSDOpenFlag` | osdType, openFlag | 水印开关 |

### 4.6 设备维护

| API | 说明 |
|-----|------|
| `rebootDevice` | 重启设备 |
| `returnToFactorySettings` | 恢复出厂设置 |
| `setWaitSleepTime` | 设置休眠时间 |
| `awakeLowPowerDevice` | 唤醒低功耗设备 |
| `startCollectLogFile` | 收集设备日志 |

### 4.7 情景模式

| API | 参数 | 说明 |
|-----|------|------|
| `getProtectionMode` | - | 获取当前情景模式 |
| `setProtectionCurMode` | curMode | 设置情景模式（0: 撤防 / 1: 在家 / 2: 离家） |
| `setProtectionParam` | protectionParam (JSON) | 设置情景模式参数 |

### 4.8 电池/低功耗管理

| API | 参数 | 说明 |
|-----|------|------|
| `getEenergyModelInfo` | - | 获取功耗模式配置 |
| `setEnergyModel` | energyModel | 设置电池管理模式 |
| `setEnergyModelWorkType` | workType, modelId | 切换电池工作模式 |

**HYPEnergyModel 字段：**
| 字段名 | 说明 |
|--------|------|
| `modelId` | 模式 ID |
| `upLevel` | 上阈值 |
| `downLevel` | 下阈值 |

---

## 5. 报警策略体系

### 5.1 核心结构

**ZJ_AlarmPolicy（报警策略）：**

| 字段 | 说明 |
|------|------|
| `policyId` | 策略 ID |
| `policyName` | 策略名称 |
| `openFlag` | 开关 |
| `iotType` | 关联的 IOT 类型（如 MOTION = 1000） |
| `iotId` | 关联的 IOT ID |
| `weekFlag` | 生效星期 |
| `startTime` | 生效开始时间（秒） |
| `endTime` | 生效结束时间（秒） |
| `propInfo` | 属性 JSON（含 Motion/Human/Face model） |
| `policyEventList` | 策略事件列表（触发后联动哪些输出） |

**ZJ_PolicyEvent（策略事件）：**

| 字段 | 说明 |
|------|------|
| `eventId` | 事件 ID |
| `openFlag` | 事件开关 |
| `outPutEventList` | 输出事件列表（指定触发后执行的动作） |

**ZJ_OutPutEvent（输出事件）：**

| 字段 | 说明 |
|------|------|
| `iotType` | 输出到哪个 IOT（如 BUZZER = 1009, EVENT = 1013） |
| `iotId` | 输出 IOT ID |
| `param` | 参数 JSON（含蜂鸣器/推送/报警灯设置） |

### 5.2 报警策略与输出事件联动

最常见的报警链路：
```
MOTION(1000) 触发 → OutPutEvent → BUZZER(1009) 蜂鸣器响
                                → EVENT(1013) 推送通知
                                → ALARM_LAMP(1030) 报警灯亮
```

**OutPutEvent 输出参数（蜂鸣器类）：**

| 字段名 | 说明 |
|--------|------|
| `buzzerStatus` | 蜂鸣器开关 |
| `alarmType` | 报警类型 |
| `customSoundName` | 铃声文件名 |
| `loopCount` | 循环次数 |

**OutPutEvent 输出参数（推送类）：**

| 字段名 | 说明 |
|--------|------|
| `pushFlag` | 推送开关 |
| `smsFlag` | 短信开关 |
| `emailFlag` | 邮件开关 |
| `pushInterval` | 推送间隔 |
| `pushWeek` | 生效星期 |
| `pushStartTime` | 推送开始时间 |
| `pushEndTime` | 推送结束时间 |

**OutPutEvent 输出参数（报警灯类）：**

| 字段名 | 说明 |
|--------|------|
| `alarmLampStatus` | 报警灯开关 |
| `alarmLampDuration` | 报警灯持续时长 |

**OutPutEvent 输出参数（灯光联动类）：**

| 字段名 | 说明 |
|--------|------|
| `lightingStatus` | 白光灯开关 |
| `lampColor` | 灯光颜色 |
| `lightingType` | 灯光模式（IR 模式） |

---

## 6. 定时策略体系

### 6.1 定时策略 ID（EN_ZJ_VIEWER_DEFAULT_POLICYID）

| PolicyID | 名称 | 用途 |
|----------|------|------|
| 1-2 | TIME_RECORD_TFCARD | TF 卡定时录像 |
| 3-4 | TIME_RECORD_CLOUD | 云定时录像 |
| 10-11 | TIME_DNSET | 红外灯时间段控制 |
| 20-23 | TIME_WHITE_LAMP_CTRL | 白光灯时间段控制 |
| 100 | MOTION_ALARM | 运动侦测报警 |
| 100600 | TIME_PRESET_PTZ_CRUISE | PTZ 巡航 |
| 100900-100904 | TIME_REMINDER_TASK | 定时提醒播报任务（1-5） |

### 6.2 定时策略参数（ZJ_TimePolicy）

| 字段 | 说明 |
|------|------|
| `policyId` | 策略 ID |
| `openFlag` | 开关 |
| `weekFlag` | 生效星期（按位标记） |
| `startTime` | 开始时间（秒数） |
| `endTime` | 结束时间（秒数） |
| `loopType` | 循环类型 |
| `outPutList` | 输出动作列表 |

---

## 7. 设置页面与能力对应汇总

| 设置页面 | 涉及的 IOT Type | 涉及的 API |
|----------|----------------|-----------|
| **报警设置 → 移动侦测** | MOTION(1000) | `setAlarmPolicy` |
| **报警设置 → 人形侦测** | MOTION(1000) + Human model | `setAlarmPolicy` |
| **报警设置 → 人脸侦测** | MOTION(1000) + Face model | `setAlarmPolicy` |
| **报警设置 → PIR** | INNER_PIR(1003) | `setInIoTProp` |
| **报警设置 → 声音检测** | VOICEALARMDETECT(1004) | `setInIoTProp` |
| **报警设置 → 蜂鸣器/提示音** | BUZZER(1009) | `setAlarmPolicy` → OutPutEvent |
| **报警设置 → 报警灯** | ALARM_LAMP(1030) | `setAlarmPolicy` → OutPutEvent |
| **报警设置 → 一键报警** | TOUCHCALL(1037) | `ctrlDeviceClickAlarm` |
| **报警设置 → 手势** | SIGNLANGUAGE(1034) | `setAlarmPolicy` |
| **报警设置 → AI 智能检测** | AIDETECT(1098) | `setInIoTBuss` |
| **推送通知设置** | EVENT(1013) | `setAlarmPolicy` → OutPutEvent |
| **录像设置** | RECORD(1002) | `setInIoTBuss` / `setRecordPropOpenFlag` |
| **云存储设置** | CLOUDRECORD(1010) | `setInIoTProp` |
| **抓图设置** | SNAPSHORT(1005), CLOUDSNAP(1011), SNAPJPG(1033) | `setInIoTProp` |
| **夜视/红外模式** | DNSET(1014) + `setCamIRMode` | `setInIoTProp` / OutPutEvent |
| **白光灯设置** | INNER_LAMP(1007) | `setInIoTBuss` |
| **灯光模式** | LIGHTING(1038) | `setInIoTBuss` |
| **状态指示灯** | INNER_STATELAMP(1008) | `setAIIoTOutputParam` |
| **PTZ/云台控制** | PTZ(1006) | `startCtrlPtz` / `setInIoTProp` |
| **检测区域设置** | AREA(1067) / CAMERA(1012) | `setInIoTBuss` |
| **逗留检测** | STAY(1016) | `setStayTime` |
| **摔倒检测** | FALLDOWN(1024) | `setInIoTProp` |
| **火焰检测** | FLAMEDETECT(1025) | `setInIoTProp` |
| **烟雾检测** | SMOKEDETECT(1026) | `setInIoTProp` |
| **哭声检测** | CRYALARM(1028) | `setInIoTProp` |
| **宠物检测** | PETDETET(1029) | `setInIoTBuss` |
| **设备状态检测** | STATUS_DETECT(1093) | `setInIoTBuss` |
| **双向视频** | RVSVIDEO(1064) | `setInIoTBuss` |
| **时光相册** | AlbumList(1100) | `setInIoTBuss` |
| **情景模式** | 聚合多个 IOT | `setProtectionCurMode` / `setProtectionParam` |
| **电池管理** | - | `setEnergyModel` / `setEnergyModelWorkType` |
| **设备信息/名称** | - | `setDeviceName` |
| **时间设置** | - | `setZoneAndTime` / `setDstZone` |
| **网络/WiFi 设置** | - | `setDeviceWiFiWithSSid` / `setDeviceHotspotPwd` |
| **TF 卡管理** | - | `formatTFCard` / `getTFCardInfo` |
| **镜头设置** | - | `setCamOpenflag` / `setMicStatus` / `setCamIRMode` / `setCamInversionRotateType` |
| **水印设置** | - | `setDeviceCamOsdInf` / `setDeviceOSDOpenFlag` |
| **外接传感器** | DOORSWITCH(1), SMOKE(2), GAS(3), PIR(7), JACK(6), WATER(8), ERG(9), DOORBELL(34), TEMP_HUMI(41) | `setAIIoTOutputParam` |
| **设备维护** | - | `rebootDevice` / `returnToFactorySettings` |
| **升级** | - | OTA manager |

---

## 8. 关键数据模型层级

```
HYPAVSConfigData (设备配置根对象)
├── DeviceInfo (HYPstreamerInfo)
│   ├── CameraSettings (HYPcameraInfo)      → 镜头配置
│   ├── InnerIotInfo (HYPinnerIotInfo)       → 内置 IOT 列表
│   │   └── InnerIot[] (HYPinnerIotList)
│   │       ├── HYPiotType                    → IOT 类型枚举
│   │       ├── HYPpropInfo / HYPpropInfoDic  → 属性参数
│   │       └── HYPbussInfo / HYPbussInfoDic  → 业务参数
│   ├── AIIOTHubInfo (HYPiOTHubInfo)         → 外接 IOT 列表
│   │   └── AIIOTHub[] (HYPiotHubList)
│   │       ├── HYPaiIOTType                 → 外接 IOT 类型
│   │       ├── HYPpropInfoDic               → 外接 IOT 属性
│   │       └── HYPopenFlag                  → 外接 IOT 开关
│   ├── AlarmPolicy[] (HYPAlarmPolicyList)   → 报警策略列表
│   │   ├── policyId / openFlag
│   │   └── PolicyEvent[] → OutPutEvent[]
│   ├── TimePolicy[] (HYPTimerPolicyList)    → 定时策略列表
│   ├── PTZPresetInfo (HYPptzPresetInfo)     → 预置位配置
│   ├── ProtectionMode (HYPprotectionMode)   → 情景模式
│   └── HYPEnergyModelInfo                   → 低功耗管理
└── HYPAppSetting (HYPappSetting)            → APP 配置
```

---

> 文档生成日期：2026-07-21  
> 基于分支：`feat_2.9.34`  
> SDK 版本：`ZJ_Viewer.framework`
