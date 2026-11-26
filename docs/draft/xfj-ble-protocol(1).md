# 香氛机（XIANGFENJI）蓝牙交互协议

> 本文定义香氛机（`XIANGFENJI`）与 App 之间的**全部 JSON 命令与属性**。

---

## 一、命名约定

| 部分 | 风格 |
|---|---|
| `cmd`（命令名） | snake_case |
| `data` 内的属性名 | **PascalCase**（产品定稿） |
| 信封字段 | `cmd` / `req_id` / `code` / `data` |

---

## 二、帧格式

- UTF-8 JSON，**每帧必须以 `\n`（0x0A）结尾** —— 缺了它设备零回复。
- 请求：`{"cmd":"<命令名>","req_id":N,"data":{…}}`
- 回复：设备通过 **FFE6 通知**推 `{"cmd":"<命令名>","req_id":N,"code":0,"data":{…}}`
- 通道：写 `FFE5`（无响应写）、通知 `FFE6`；MTU 247；**单帧 ≤ 244 字节**。
- `req_id` 由 App 分配，会话内从 1 递增；**回复必须回带请求的 `cmd` 与 `req_id`**。
- 同一时刻只允许**一条在途命令**；设备须在 **5 秒**内回复，否则视为无响应。

**回复 `data` 的回显要求**：

1. **必须逐字段回显请求 `data` 里的每一个字段**，键名与值完全一致 —— 缺一个或值不同即判为「回复与请求不一致」。
2. **允许附加只读字段**（如 `GearSprayDuration`）。

---

## 三、属性定义

### 3.1 基础组

| 字段 | 类型 | 取值/范围 | 单位 | 读写 | 说明 |
|---|---|---|---|---|---|
| `WakeSwitch` | int | `0` / `1` | — | 读写 | **休眠唤醒控制**。`0`=休眠（停止雾化，关闭屏显与指示灯）；`1`=唤醒（恢复正常工作） |
| `NozzleSelect` | int | `0` / `1` / `2` | — | 读写 | **雾化喷口选择**。`0`=混合（左右喷口同时工作）；`1`=左喷雾口（仅左喷口工作）；`2`=右喷雾口（仅右喷口工作） |
| `ScreenSwitch` | int | `0` / `1` | — | 读写 | **屏显开关**。`0`=关闭；`1`=开启 |
| `TimerSchedule` | **object** | `{"StartTime":…,"EndTime":…}` | — | 读写 | **喷雾定时时段**。对象类型（**非 JSON 字符串**），每日单个时段、无开关、无星期周期 |
| `TimerSchedule.StartTime` | int | `0` ~ `86399`（**必须 < 86400**） | 秒 | — | 开始时间（`28800` = 08:00）。**永远落在当天**，即使时段跨天 |
| `TimerSchedule.EndTime` | int | `1` ~ `172799`（**必须 > `StartTime`**） | 秒 | — | 结束时间。`≤ 86399` = 当天内结束（`72000` = 20:00）；**`≥ 86400` = 跨天** |

**跨天怎么表示**：第二天的时间**从 `86400` 往上加**（即 `86400 + 次日秒数`）。
`22:00 → 次日 06:00` 写成 `{"StartTime":79200,"EndTime":108000}`（`108000 = 86400 + 21600`）。
`StartTime` 始终 `< 86400`，跨天只体现在 `EndTime` 上。

**全天（不限制）**：`{"StartTime":0,"EndTime":86399}` —— 当天内覆盖满，**不跨天**。定时没有独立的开关属性，不限制时段就用全天表示。

### 3.2 喷雾组

| 字段 | 类型 | 取值/范围 | 单位 | 读写 | 说明 |
|---|---|---|---|---|---|
| `SprayMode` | int | `0` / `1` | — | 读写 | **喷雾模式**。`0`=标准（喷香时长/间隔由档位决定）；`1`=自定义（由用户手动设置） |
| `GearLevel` | int | `1` / `2` / `3` | — | 读写 | **喷雾档位**。仅 `SprayMode=0` 时生效 |
| `GearSprayDuration` | int | 由固件内置 | 秒 | **只读** | 当前档位对应的喷香时长，设备上报。仅 `SprayMode=0` 时有效；档位 → 参数的映射由固件内置 |
| `GearSprayInterval` | int | 由固件内置 | 分钟 | **只读** | 当前档位对应的喷香间隔，设备上报。仅 `SprayMode=0` 时有效 |
| `LeftSprayDuration` | int | `3` ~ `20` | 秒 | 读写 | 左喷口单次喷香时长 |
| `LeftSprayInterval` | int | `3` ~ `50` | 分钟 | 读写 | 左喷口两次喷香之间的停喷间隔 |
| `RightSprayDuration` | int | `3` ~ `20` | 秒 | 读写 | 右喷口单次喷香时长 |
| `RightSprayInterval` | int | `3` ~ `50` | 分钟 | 读写 | 右喷口两次喷香之间的停喷间隔 |

**只读字段不出现在任何请求里**：`GearSprayDuration` / `GearSprayInterval` 只在 `get_spray_config` 的回复中出现。

**`SprayMode=1`（自定义）时这两个字段可回可不回** —— 它们只在标准模式下有意义。

> **分组的用途**：这两组决定了下面两条读命令的划分（见 §四-1）。分组只影响**读取**；写入各属性各有自己的 `set_*` 命令。

---

## 四、命令清单

共 **8 条**：2 条读 + 6 条写。字节数均为**含帧尾 `\n`** 的实测值（`req_id` 按 1 位算，实际最长 6 位，需 +5）。

### 4.1 `get_config` — 读取基础配置

**📌 本条是从原单条 `get_config` 拆出来的两条之一。**
原因：12 个属性拼一帧是 **318 字节**，超过单帧上限 **244 字节**。因此把**喷雾组字段单独抽成 `get_spray_config`**（见 4.2）。

返回**基础组 4 个属性**：

```
→ {"cmd":"get_config","req_id":1,"data":{}}\n                              （41 字节）
← {"cmd":"get_config","req_id":1,"code":0,"data":{ …见下… }}\n            （150 字节，req_id 6 位时 155）
```

```json
{
  "WakeSwitch": 1,
  "NozzleSelect": 0,
  "ScreenSwitch": 1,
  "TimerSchedule": {"StartTime": 28800, "EndTime": 72000}
}
```

---

### 4.2 `get_spray_config` — 读取喷雾参数 📌

**📌 拆出来的第二条**，承载全部喷雾组字段。

```
→ {"cmd":"get_spray_config","req_id":2,"data":{}}\n                        （47 字节）
← {"cmd":"get_spray_config","req_id":2,"code":0,"data":{ …见下… }}\n      （223 字节，req_id 6 位时 228）
```

```json
{
  "SprayMode": 0,
  "GearLevel": 2,
  "GearSprayDuration": 10,
  "GearSprayInterval": 20,
  "LeftSprayDuration": 10,
  "LeftSprayInterval": 20,
  "RightSprayDuration": 10,
  "RightSprayInterval": 20
}
```

> `SprayMode=1`（自定义）时 `GearSprayDuration` / `GearSprayInterval` 可回可不回。
>
> ⚠️ 本帧占 **223 字节**（按最长 `req_id` 算 **228**），距 244 上限仅余 **16 字节**。

---

### 4.3 `set_wake_switch` — 设置休眠唤醒开关

**替代原 `set_power`。**

```
→ {"cmd":"set_wake_switch","req_id":3,"data":{"WakeSwitch":1}}\n          （60 字节）
← {"cmd":"set_wake_switch","req_id":3,"code":0,"data":{"WakeSwitch":1}}\n （69 字节）
```

- `WakeSwitch=0`：休眠 —— 停止雾化，屏显与指示灯关闭
- `WakeSwitch=1`：唤醒 —— 恢复正常工作

> 🔑 **休眠是「假」休眠，不是掉电。** 设备常电、靠蓝牙取数，**蓝牙始终在线**；
> 休眠期间**所有命令照常收发**，**不因休眠返回 `code:3`**。
>
> `ScreenSwitch` 的值**不被休眠改写** —— 休眠只是让屏显物理关闭，唤醒后按 `ScreenSwitch` 的值显示。

---

### 4.4 `set_nozzle_select` — 设置雾化喷口选择

```
→ {"cmd":"set_nozzle_select","req_id":4,"data":{"NozzleSelect":0}}\n          （64 字节）
← {"cmd":"set_nozzle_select","req_id":4,"code":0,"data":{"NozzleSelect":0}}\n （73 字节）
```

- `0`=混合（左右喷口同时工作）
- `1`=左喷雾口（仅左喷口工作）
- `2`=右喷雾口（仅右喷口工作）

> 切到 `1`/`2` 后，被停用那一侧的 `*SprayDuration` / `*SprayInterval` **原样保留，不清零**；
> 切回 `0`（混合）时两侧各按保留的参数工作。

---

### 4.5 `set_screen_switch` — 设置屏显开关

```
→ {"cmd":"set_screen_switch","req_id":5,"data":{"ScreenSwitch":1}}\n          （64 字节）
← {"cmd":"set_screen_switch","req_id":5,"code":0,"data":{"ScreenSwitch":1}}\n （73 字节）
```

- `0`=关闭；`1`=开启

> 休眠态下照常接受（见 §4.3），值照常写入并记忆。

---

### 4.6 `set_spray_mode` — 设置喷雾模式

一条命令两种形态，靠 `SprayMode` 区分，**携带的字段不同**。

**标准模式**（`SprayMode=0`）—— 携带档位：

```
→ {"cmd":"set_spray_mode","req_id":6,"data":{"SprayMode":0,"GearLevel":2}}\n          （72 字节）
← {"cmd":"set_spray_mode","req_id":6,"code":0,"data":{"SprayMode":0,"GearLevel":2}}\n （81 字节）
```

**自定义模式**（`SprayMode=1`）—— 携带左右喷口的时长与间隔：

```
→ {"cmd":"set_spray_mode","req_id":7,"data":{"SprayMode":1,"LeftSprayDuration":10,"LeftSprayInterval":20,"RightSprayDuration":10,"RightSprayInterval":20}}\n          （152 字节）
← {"cmd":"set_spray_mode","req_id":7,"code":0,"data":{"SprayMode":1,"LeftSprayDuration":10,"LeftSprayInterval":20,"RightSprayDuration":10,"RightSprayInterval":20}}\n （161 字节）
```

**约定的字段组合**：

| `SprayMode` | 必须携带 | 不得携带 |
|---|---|---|
| `0`（标准） | `GearLevel` | 四个自定义字段 |
| `1`（自定义） | `LeftSprayDuration` `LeftSprayInterval` `RightSprayDuration` `RightSprayInterval` | `GearLevel` |

> **标准模式的回复必须附带 `GearSprayDuration` / `GearSprayInterval`**（该帧 127 字节，仍在限内）。

---

### 4.7 `set_timer_schedule` — 设置喷雾定时时段

```
→ {"cmd":"set_timer_schedule","req_id":8,"data":{"TimerSchedule":{"StartTime":28800,"EndTime":72000}}}\n          （100 字节）
← {"cmd":"set_timer_schedule","req_id":8,"code":0,"data":{"TimerSchedule":{"StartTime":28800,"EndTime":72000}}}\n （109 字节）
```

- 整段替换，不是增量修改。
- `TimerSchedule` 是**对象**，不是 JSON 字符串 —— 不要写成 `"TimerSchedule":"{\"StartTime\":…}"`。
- 全天不限制：`{"StartTime":0,"EndTime":86399}`。
- 校验：`0 ≤ StartTime < 86400` 且 `StartTime < EndTime ≤ 172799`，越界或倒置回 `code:3`（见 §五）。
- 跨天示例：`22:00 → 次日 06:00` 写成 `{"StartTime":79200,"EndTime":108000}`。

---

### 4.8 `reset_config` — 重置设备配置

```
→ {"cmd":"reset_config","req_id":10,"data":{}}\n                    （44 字节）
← {"cmd":"reset_config","req_id":10,"code":0,"data":{}}\n           （53 字节）
```

- 无参数，`data` 为空对象。
- 把设备上保存的**配置信息**恢复为默认值。
- **不含 `WakeSwitch`** —— 休眠/唤醒是运行状态，不是配置。
- **不重启**，链路保持不断。

---

## 五、错误码

| `code` | 含义 | 说明 |
|---|---|---|
| `0` | 成功 | |
| `1` | 帧格式错误 | JSON 解析失败，或缺 `cmd` / `req_id` / `data` |
| `2` | 命令不支持 | 实测行为：固件对不认识的命令秒回 `2`，保持不变 |
| `3` | 参数不合法 | 取值越界、类型不符、`StartTime ≥ EndTime`、字段组合与模式不符（如 `SprayMode=1` 却带 `GearLevel`） |
| `4` | 参数缺失 | 该模式必需的字段没带 |
| 其他 | 保留 | |

- `code != 0` 时**不带 `data` 字段**。
- ⚠️ 旧固件里 `3` 的含义是「关机态拒绝档位」；本版 `3` 的含义是「参数不合法」。

---

## 六、交互约束与业务规则

| 项 | 约定 |
|---|---|
| 单帧上限 | 244 字节（MTU 247 − 3） |
| 帧尾 | 必须 `\n` |
| 并发 | 同一时刻一条在途命令；回复须在 5 秒内 |
| 回复回显 | 必须逐字段回显请求字段；允许附加只读字段 |
| 只读字段 | `GearSprayDuration` / `GearSprayInterval` 只出现在 `get_spray_config` 回复里 |
| **休眠态** | 休眠是「假」休眠：设备常电、蓝牙始终在线。**所有命令照常接受**，**不因休眠返回 `code:3`** |
| **休眠 vs 定时** | 休眠态下定时**照常触发** —— 到了 `StartTime` 设备**自动唤醒**并进入喷雾 |
| **无主动上报** | 设备**不做**状态推送，状态只在连接期间可读。读取入口只有 `get_config` + `get_spray_config` 两条 |

---

## 七、附：完整报文样例

`→` 请求（FFE5 写入）　`←` 回复（FFE6 通知）　字节数含帧尾 `\n`
（为排版有换行，**实际发送不含换行**）

```
→ {"cmd":"get_config","req_id":1,"data":{}}                                                      41
← {"cmd":"get_config","req_id":1,"code":0,"data":{"WakeSwitch":1,"NozzleSelect":0,
   "ScreenSwitch":1,"TimerSchedule":{"StartTime":28800,"EndTime":72000}}}                        150

→ {"cmd":"get_spray_config","req_id":2,"data":{}}                                                 47
← {"cmd":"get_spray_config","req_id":2,"code":0,"data":{"SprayMode":0,"GearLevel":2,
   "GearSprayDuration":10,"GearSprayInterval":20,"LeftSprayDuration":10,
   "LeftSprayInterval":20,"RightSprayDuration":10,"RightSprayInterval":20}}                      223

→ {"cmd":"set_wake_switch","req_id":3,"data":{"WakeSwitch":1}}                                    60
← {"cmd":"set_wake_switch","req_id":3,"code":0,"data":{"WakeSwitch":1}}                           69

→ {"cmd":"set_nozzle_select","req_id":4,"data":{"NozzleSelect":0}}                                64
← {"cmd":"set_nozzle_select","req_id":4,"code":0,"data":{"NozzleSelect":0}}                       73

→ {"cmd":"set_screen_switch","req_id":5,"data":{"ScreenSwitch":1}}                                64
← {"cmd":"set_screen_switch","req_id":5,"code":0,"data":{"ScreenSwitch":1}}                       73

→ {"cmd":"set_spray_mode","req_id":6,"data":{"SprayMode":0,"GearLevel":2}}                        72
← {"cmd":"set_spray_mode","req_id":6,"code":0,"data":{"SprayMode":0,"GearLevel":2,
   "GearSprayDuration":10,"GearSprayInterval":20}}                                                127

→ {"cmd":"set_spray_mode","req_id":7,"data":{"SprayMode":1,"LeftSprayDuration":10,
   "LeftSprayInterval":20,"RightSprayDuration":10,"RightSprayInterval":20}}                       152
← {"cmd":"set_spray_mode","req_id":7,"code":0,"data":{"SprayMode":1,"LeftSprayDuration":10,
   "LeftSprayInterval":20,"RightSprayDuration":10,"RightSprayInterval":20}}                       161

→ {"cmd":"set_timer_schedule","req_id":8,"data":{"TimerSchedule":{"StartTime":28800,
   "EndTime":72000}}}                                                                            100
← {"cmd":"set_timer_schedule","req_id":8,"code":0,"data":{"TimerSchedule":{"StartTime":28800,
   "EndTime":72000}}}                                                                            109

→ {"cmd":"set_timer_schedule","req_id":9,"data":{"TimerSchedule":{"StartTime":79200,
   "EndTime":108000}}}      ← 跨天：22:00 → 次日 06:00                                          101
← {"cmd":"set_timer_schedule","req_id":9,"code":0,"data":{"TimerSchedule":{"StartTime":79200,
   "EndTime":108000}}}                                                                           110

→ {"cmd":"reset_config","req_id":10,"data":{}}                                                    44
← {"cmd":"reset_config","req_id":10,"code":0,"data":{}}                                           53
```

> 跨天取到上限（`StartTime=86399`、`EndTime=172799`）时，`get_config` 回复 **151** 字节、
> `set_timer_schedule` 回复 **110** 字节 —— 都在 244 限内，跨天只让每帧各长 1 字节。

---

## 八、广播数据解析（iOS）

iOS 通过 CoreBluetooth 扫描时**拿不到设备 MAC**（`CBPeripheral.identifier` 是系统生成的 UUID），必须从广播内容里反推设备身份。

### 8.1 实测样例

| 广播项 | 值 |
|---|---|
| Complete Local Name | `eDifusor_X01_52da3` |
| MAC | `18:24:39:95:2D:A3` |
| Service UUID | 实测解析为 `0x2418`，**应为 `0x1824`**（见 8.2） |
| Service Data | `0x39952DA3` |
| Manufacturer Company ID | `0x4D48`（Reserved ID） |
| Manufacturer Data | `0x50566B49417A34375243375A34524777`（ASCII `PVkIAz47RC7Z4RGw`） |

### 8.2 问题：Service UUID 字节序反了

APP 侧授权校验要求 Service UUID 为 **`0x1824`**，实测广播解析出来是 **`0x2418`**，导致「设备未授权」。

两个值互为字节颠倒：

```
期望 UUID   0x1824  →  空中应为小端字节  24 18
实测解析    0x2418  ←  空中实际字节      18 24  （大端写入）
```

BLE 协议规定 16-bit UUID 在广播中按**小端序**存放。固件把 `0x1824` 按大端写成 `18 24`，标准解析（iOS / nRF Connect）按小端读回来就变成了 `0x2418`。

**两种改法，二选一：**

| 方案 | 改哪里 | 说明 |
|---|---|---|
| **A（推荐）固件修正字节序** | 设备固件 | 空中改写为 `24 18`，所有标准客户端都解析成 `0x1824` |
| B. APP 侧做兼容 | APP | 读到的 UUID 若为 `0x2418`，交换高低字节后再比对。只能救这一版固件，新设备仍需 A |

> 注：`0x1824` 同时也是 MAC 的前两个字节（`18 24`），需与固件确认这个 UUID 是「产品固定值」还是「取 MAC 前两字节生成」。若是后者，换 OUI 的模组会导致 UUID 变化。

### 8.3 匹配规则

**① Service Data（4 字节）= MAC 去掉前 2 字节**

```
MAC          18 24 | 39 95 2D A3
Service Data        39 95 2D A3   → 0x39952DA3
```

从 MAC 第 3 字节起取 4 字节，高位在前（大端）。这条与 UUID 字节序问题无关，数据部分本身是对的。

**② 名称后缀 = MAC 后 5 位十六进制（小写）**

```
MAC  18:24:39:95:2D:A3
去分隔符  182439952DA3
取后 5 位   52DA3
广播名       eDifusor_X01_52da3
```

**③ Manufacturer Data 与 MAC 无对应关系**

实测值可解为 ASCII `PVkIAz47RC7Z4RGw`，推测为设备凭证/随机标识，暂不用于识别（用途待确认）。

### 8.4 使用建议

1. **先用 UUID 认设备、再用 Service Data 认具体哪一台**：
   - UUID（应为 `0x1824`）→ 判断是不是本产品，用于授权校验
   - Service Data 后 4 字节 / 名称后 5 位 → 匹配具体设备
2. **UUID 未通过时不要直接判「未授权」**：建议 APP 先做一次字节交换兜底（`0x2418 → 0x1824`），避免旧固件大规模不可用。
3. **名称后缀做二次校验**，两者都匹配才连接，避免同名设备误连。
4. **iOS 无法还原完整 MAC**：缺 OUI 前两字节，只能用后 4 字节与平台记录的 MAC 做尾段匹配。

### 8.5 取值示例（Swift）

```swift
/// 广播名后缀：MAC 后 5 位十六进制
func nameSuffix(from name: String) -> String? {
    guard let s = name.split(separator: "_").last, s.count == 5 else { return nil }
    return String(s).uppercased()                       // "52DA3"
}

/// Service Data 4 字节：等价于 MAC 后 4 字节
func deviceKey(from serviceData: Data) -> String? {
    guard serviceData.count == 4 else { return nil }
    return serviceData.map { String(format: "%02X", $0) }.joined()   // "39952DA3"
}

/// UUID 字节序兜底：0x2418 → 0x1824
func normalizedServiceUUID(_ uuid: UInt16) -> UInt16 {
    return (uuid >> 8) | (uuid << 8)
}
```

> Android 端可直接从 `BluetoothDevice.address` 拿到完整 MAC；以上规则仅在 iOS 上需要。
