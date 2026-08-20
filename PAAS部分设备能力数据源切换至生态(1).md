# 产品功能点清单 — 功能定义与配置

> 从 iot-platform 产品管理 → 继续开发 → 功能定义与配置 提取，按功能点+所属模块组织。
> 江能发/广春APP通过HTTP协议获取设备能力。
> 返回字段对应代码：`CPDeviceShadow/internal/service/grpc.model.go` → `buildMergeDeviceConfigAndeDeviceModel`

---

## 返回结构说明

接口返回 `StruDeviceModel`，核心结构：

```
SupportFlag   // 是否支持该能力（"0"不支持 / "1"支持）
ModelInfo {
    AIIoTType  // 能力类型ID
    AIIoTID
    Prop       // 属性/能力定义（是否支持）
    Buss       // 业务配置（当前状态值）
    OpenFlag   // 开关（"0"/"1"）
}
```

---

## 一、设备能力

### 1. 联网方式
- 联网方式（有线 / WIFI / 移动网络）
- 配网方式（AP / 声音 / smartlink / 摄像机识别二维码添加 / 局域网 / APP扫码添加 / 蓝牙添加）
- 默认配网方式

**返回字段：**
| 能力项 | 字段 | 说明 |
|-------|------|------|
| 联网方式 | `Prop.NetAccessAbility` | 位掩码：8=具备4G能力，其余由产品网络方式叠加 |
| 配网方式 | `Prop.WifiSetAbility` | 配网方式能力 |
| 当前网络类型 | `Buss.NetAccessType` | 当前实际联网类型 |

---

### 2. 对讲设置
- 支持对讲方式（不支持 / 半双工 / 全双工）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 支持对讲方式 | `Prop.AudioEncAbility` |

---

### 3. 电池设置
- 是否有电池（有 / 无）
- 充电状态显示电量能力（支持 / 不支持）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 是否有电池 | `Prop.EnergyType` |
| 充电状态显示电量能力 | `Prop.SupplyShowPowerAbility` |

---

### 4. 工作模式
- 是否支持切换工作模式（支持 / 不支持）
- AOV能力（支持 / 不支持）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 是否支持切换工作模式 | `Prop.SwithAbility` |
| AOV能力 | `Prop.AOVAbility` |

---

### 5. 唤醒能力
- 是否支持唤醒（不支持 / 本地 / 远程 / 本地+远程）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 是否支持唤醒 | `Prop.AwakeAbility` |

---

### 6. 指示灯
- 是否有状态指示灯

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 是否有状态指示灯 | `Prop.StatusLampAbility` |
| 指示灯模式 | `Buss.StatusLedMode` |

---

### 7. 红外灯
- 是否支持红外灯（是 / 否）
- 红外切换模式（自动 / 手动+自动 / 手动）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 是否支持红外灯 | `SupportFlag`（是否找到 InAIIoT 中 1014 类型） |
| 红外切换模式 | `Prop.IrcutType` |

---

### 8. 喇叭配置
- 是否有喇叭（是 / 否）
- 一键报警能力（支持 / 不支持）
- 音量调节（支持 / 不支持）
- 自定义铃声（支持 / 不支持）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 是否有喇叭 | `Prop.VoicePlayAbility` |
| 一键报警能力 | `Prop.ClickAlarm` |
| 音量调节 | `Prop.VolumeSetAbility` |
| 自定义铃声 | `Prop.RingToneDecAbility` / `Prop.RingToneSetAbility` |

---

## 二、镜头配置

### 1. PTZ控制
- 是否支持PTZ（支持 / 不支持）
- PTZ能力（平移 / 倾斜 / 变焦）
- *PTZ转速（支持 / 不支持）
- 预置位支持（支持 / 不支持）
- 自动巡航支持（支持 / 不支持）
- 空间定位能力（不支持 / 3D居中 / GPS定位）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 是否支持PTZ | `Prop.PTZAbility` |
| PTZ能力（平移/倾斜/变焦） | `Prop.CamList[].Sensor.ZoomAbility` |
| 预置位支持 | `Prop.SetPresetAbility` |
| 自动巡航支持 | `Prop.CruiseAbility` |
| 空间定位能力 | `Prop.CamList[].PositionAbility` |

---

### 2. 图像参数
- 图像翻转（支持 / 不支持）
- 镜像能力（支持 / 不支持）
- 夜视能力（支持 / 不支持）
- 宽动态WDR（支持 / 不支持）
- 高动态HDR（支持 / 不支持）
- 抗闪烁（支持 / 不支持）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 图像翻转/镜像/夜视/WDR/HDR/抗闪烁 | `Prop.CamList[]` 内透传（设备能力原始字段，具体字段名以设备上报为准） |

---

### 3. 隐私区域
- 是否支持隐私区域（支持 / 不支持）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 是否支持隐私区域 | `Prop.CamList[]` 内透传（设备能力原始字段） |

---

### 4. 水印
- *OSD LOGO显示开关能力（OSDLogoAblity）（支持 / 不支持）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| OSD LOGO显示开关能力 | `Prop.CamList[].OSDLogoAblity`（透传） |

---

### 5. 高级配置项
- 人形坐标能力（支持 / 不支持）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 人形坐标能力 | `Prop.CamList[]` 内透传（设备能力原始字段） |

---

## 三、麦克风配置

### 1. 麦克风参数配置
- 麦克风能力（支持 / 不支持）
- 麦克风音量调节（支持 / 不支持）

**返回字段：**
| 能力项 | 字段 |
|-------|------|
| 麦克风能力 | `Prop.MicroPhoneAbility` |
| 麦克风音量调节 | `Buss.Volumn` |

---

*生成日期: 2026-07-31*

---

# 数据源切换改造总结（2026-08-18）

> 改造范围：`buildMergeDeviceConfigAndeDeviceModel` 中本文档列出的能力字段，数据源由 hmd（设备上报/配置）切换为 CM 生态平台（产品 V3 物模型配置，`Resource.GetProductV3ModelConfig`）。
> 优先级：**生态优先、hmd 兜底**（生态模块配置了就用生态值，含明确 0；未配置才回退 hmd）。
> 涉及代码：`internal/service/grpc.model.go`（七处分支覆盖）、`internal/service/grpc.model.eco.go`（新增，生态获取+helper）、`internal/model/v3/model.product.v3.go`（补充 IrcutOpenFlag/IrcutType 字段）。

## 一、已切换至生态（对照生态 JSON 样例已核实字段存在）

| 文档章节 | 能力项 | 对外字段 | 生态字段 |
|-------|------|------|------|
| 3. 电池设置 | 是否有电池 | `Prop.EnergyType` | `DeviceInfo.BatteryAbility` |
| 3. 电池设置 | 充电状态显示电量能力 | `Prop.SupplyShowPowerAbility` | `DeviceInfo.ShowPowerInChargeAbility` |
| 5. 唤醒能力 | 是否支持唤醒 | `Prop.AwakeAbility` | `DeviceInfo.AwakeAbility` |
| 6. 指示灯 | 是否有状态指示灯 | `Prop.StatusLampAbility` | `DeviceInfo.IndicatorLightAbility` |
| 7. 红外灯 | 红外切换模式 | `Prop.IrcutType` | `DeviceInfo.IrcutType` |
| 7. 红外灯 | 是否支持红外灯 | `SupportFlag` | `DeviceInfo.IrcutOpenFlag > 0`（或 `IrcutType > 0`） |
| 8. 喇叭配置 | 是否有喇叭 | `Prop.VoicePlayAbility` | `DeviceInfo.VoicePlayAbility` |
| 8. 喇叭配置 | 音量调节 | `Prop.VolumeSetAbility` | `SpeakerInfo.SetVolumeAbility` |
| 8. 喇叭配置 | 自定义铃声 | `Prop.RingToneSetAbility` | `SpeakerInfo.RingToneAbility` |
| 二.1 PTZ控制 | 是否支持PTZ | `Prop.PTZAbility` | `CamList[0].PTZAbility`（位掩码原值透传） |
| 二.1 PTZ控制 | 预置位支持 | `Prop.SetPresetAbility` | `CamList[0].SetPresetAbility` |
| 二.1 PTZ控制 | 自动巡航支持 | `Prop.CruiseAbility` | `CamList[0].CruiseAbility` |
| 二.1 PTZ控制 | 空间定位能力 | `Prop.CamList[].PositionAbility` | `CamList[i].PositionAbility` |
| 二.1 PTZ控制 | PTZ能力（平移/倾斜/变焦） | `Prop.CamList[].Sensor.ZoomAbility` | `CamList[i].SupportPTZMode` 位掩码含 4(Z) 推导 |
| 二.2 图像参数 | 翻转/镜像/夜视/WDR/HDR/抗闪烁 | `Prop.CamList[]` 透传 | `CamList[i]` 同名（InversionAbility/MirrorAbility/NightVisionAbility/WDRAbility/HDRAbility/AntiFlickerAbility） |
| 二.3 隐私区域 | 是否支持隐私区域 | `Prop.CamList[]` 透传 | `CamList[i].PrivacyMaskAbility` |
| 二.4 水印 | OSD LOGO显示开关能力 | `Prop.CamList[].OSDSetAbility`/`OSDAblity` | `CamList[i].CustomOSDAbility`/`ShowOSDAbility`（字段名映射） |
| 二.5 高级配置项 | 人形坐标能力 | `Prop.CamList[].HumanRgnAblity`（注意拼写） | `CamList[i].HumanRgnAbility` |
| 二.1 PTZ控制 | 鱼眼矫正能力 | `Prop.CamList[].Sensor.RectifyAbility` | `CamList[i].RectifyAbility`（生态在 Camera 顶层，对外在 Sensor 内） |

## 二、未切换（保持 hmd 原逻辑）

| 文档章节 | 能力项 | 对外字段 | 未切换原因 |
|-------|------|------|------|
| 1. 联网方式 | 联网方式/配网方式/当前网络类型 | `Prop.NetAccessAbility` 等 | **用户明确不要** |
| 4. 工作模式 | 切换工作模式/AOV能力 | `Prop.SwithAbility`/`AOVAbility` | **用户明确不要** |
| 2. 对讲设置 | 支持对讲方式 | `Prop.AudioEncAbility` | 生态 JSON 无对应字段（MicphoneInfo.MicList 为 null） |
| 8. 喇叭配置 | 一键报警能力 | `Prop.ClickAlarm` | 生态 JSON 无对应字段 |
| 8. 喇叭配置 | 自定义铃声（解码能力） | `Prop.RingToneDecAbility` | 生态只有 `RingToneAbility` 一个字段（已映射给 Set 能力） |
| 6. 指示灯 | 指示灯模式 | `Buss.StatusLedMode` | 生态 `IndicatorLightSwitch` 是"开关"非"模式"，语义不等价 |
| 三.1 麦克风 | 麦克风能力 | `Prop.MicroPhoneAbility` | 生态 JSON 无对应字段 |
| 三.1 麦克风 | 麦克风音量调节 | `Buss.Volumn` | 生态 JSON 无对应字段（且为设备动态状态值） |

另外所有 `Buss` 类动态状态值（PreSets/Cruises/WatchPoint/Sensor 动态值/StreamList/IDRDay/IDRNight/PowerLevel 等）均保持 hmd。

## 三、问题与风险

### 已切换项的问题
| # | 问题 | 处理 |
|---|------|------|
| 1 | **StatusLampAbility 语义方向冲突**：接口文档 6.30 注释写"0支持,1不支持"，生态定义"0:不支持,1:支持"，方向相反 | 当前按生态原值透传，**上线前需与生态/文档方确认**；若确认方向相反需在写入前取反 |
| 2 | **IrcutOpenFlag 语义未确认**：不确定是"支持红外"还是"开关状态" | 暂按 `>0` 判支持（与 IrcutType>0 取或），**上线前确认** |
| 3 | 生态 CamList 与设备 CamList 按**索引对应**，多目设备顺序不一致会错位 | 现状按索引，发现错位需加 CamID 匹配 |
| 4 | 生态给 Video 新增了设备原本没有的透传字段（如 HumanRgnAblity=0） | 下游按透传字段设计，兼容风险低，上线观察 APP 解析 |
| 5 | 生态 JSON 若 int 字段以字符串下发 → 整体 Unmarshal 失败 → **静默全量回退 hmd** | 降级方向安全，已有 Warning 日志 |
| 6 | `Resource.GetProductV3ModelConfig` 缓存无 TTL，生态改配置需重启服务生效 | 与现有 customability 用法一致，已知限制 |

### 未切换项的问题
| # | 问题 | 说明 |
|---|------|------|
| 1 | 对讲/麦克风/一键报警/铃声解码能力**无法切换到生态** | 生态 V3 物模型目前没有这些字段，若产品侧需要，需生态平台先补字段 |
| 2 | 指示灯模式 `StatusLedMode` 找不到等价生态字段 | 生态 `IndicatorLightSwitch` 语义不同，只能继续用设备上报值 |
| 3 | 联网方式/工作模式未切换 | 用户明确排除；注意接口文档 6.17 中"唤醒能力"与工作模式在同一章节，本次**唤醒已切换、工作模式未切换**，两者不要混淆 |

---

*改造总结生成日期: 2026-08-18*
