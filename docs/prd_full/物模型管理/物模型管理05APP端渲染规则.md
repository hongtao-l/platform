# 物模型 — APP 端渲染规则

## 修订记录

| 修订时间 | 修订内容 | 修订人 |
|------|------|------|
| 2026-05-28 | 初稿 | Kiro |

---

## 一、概述

本文档定义物模型中各项能力的 `dataDef`（数据定义）在 APP 端对应的 UI 控件渲染规则。

**基本原则**：APP 端不以硬编码方式处理能力参数，而是根据云平台下发的 `dataDef` 结构动态生成控件，确保新增能力时 APP 无需发版即可适配。

---

## 二、属性（Property）

属性对应设备可读写或只读的状态参数。APP 端根据 `dataType` 选择对应控件。

### 2.1 数值型（int）

#### 数据结构

```json
{
  "dataType": "int",
  "accessMode": "rw",
  "min": 1,
  "max": 10,
  "step": 1,
  "unit": "秒/帧",
  "defaultVal": "1"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `min` | number | 是 | 最小值 |
| `max` | number | 是 | 最大值 |
| `step` | number | 是 | 步长（增量粒度） |
| `unit` | string | 否 | 单位，如 `秒`、`%`、`ms`、`秒/帧` |
| `defaultVal` | string | 否 | 默认值 |

#### APP 端渲染

| 场景 | 控件 | 映射规则 |
|------|------|------|
| 可选值 ≤ 6 个 | **下拉选择（Dropdown / Picker）** | 按 step 从 min 到 max 生成选项列表，格式 `{ min, min+step, min+2×step, ..., max }`，每个选项显示「值 + unit」 |
| 可选值 > 6 且取值范围 ≤ 100 | **滑动条（Slider）** | min→最小值, max→最大值, step→步长, 值后显示 unit |
| 可选值 > 6 且取值范围 > 100 | **数字输入（Stepper / InputNumber）** | min→最小值, max→最大值, step→增减步长, 值后显示 unit |

> **可选值个数** = `floor((max - min) / step) + 1`

**展示格式**：控件当前值 + 单位（如 `5 秒/帧`）

**示例**：
- `min:0, max:2, step:1` → 3 个值 `[0, 1, 2]` → 下拉选择，选项 `0档、1档、2档`
- `min:1, max:10, step:1` → 10 个值 → 滑动条
- `min:100, max:10000, step:100` → 100 个值 → 数字输入

### 2.2 枚举型（enum）

#### 数据结构

```json
{
  "dataType": "enum",
  "accessMode": "rw",
  "enumValues": [
    { "name": "低功耗模式", "val": 0 },
    { "name": "AOV模式", "val": 1 },
    { "name": "长电模式", "val": 2 },
    { "name": "自定义模式", "val": 3 }
  ],
  "defaultVal": "0"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `enumValues` | array | 是 | 枚举项列表，至少 1 项 |
| `enumValues[].name` | string | 是 | 枚举项显示名称 |
| `enumValues[].val` | number | 是 | 枚举项值（下发到设备的实际值） |
| `defaultVal` | string | 否 | 默认值（对应 val） |

#### APP 端渲染

| 场景 | 控件 | 映射规则 |
|------|------|------|
| 枚举项 ≤ 5 | **分段选择器（Segmented Control）** | 每个枚举项一个段，name 为显示文案，val 为选中值 |
| 枚举项 > 5 | **下拉列表（Picker / Dropdown）** | name 为显示文案，val 为选中值 |

### 2.3 布尔型（boolean）

#### 数据结构

```json
{
  "dataType": "boolean",
  "accessMode": "rw",
  "trueLabel": "开启",
  "falseLabel": "关闭",
  "defaultVal": "1"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|
| `trueLabel` | string | 是 | true 状态显示文案 |
| `falseLabel` | string | 是 | false 状态显示文案 |
| `defaultVal` | string | 否 | 默认值，`"1"` 为 true，`"0"` 为 false |

#### APP 端渲染

| 场景 | 控件 | 映射规则 |
|------|------|------|
| 通用 | **开关（Switch）** | trueLabel/falseLabel 作为开关两侧或下方的文案 |

### 2.4 字符串型（string）

#### 数据结构

```json
{
  "dataType": "string",
  "accessMode": "rw",
  "maxLen": 50,
  "defaultVal": ""
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|
| `maxLen` | number | 是 | 最大字符数 |
| `defaultVal` | string | 否 | 默认值 |

#### APP 端渲染

| 场景 | 控件 | 映射规则 |
|------|------|------|
| maxLen ≤ 100 | **单行输入框（Input）** | maxLen→最大字符数限制 |
| maxLen > 100 | **多行输入框（TextArea）** | maxLen→最大字符数限制 |

---

## 三、读写模式（accessMode）

所有属性均携带 `accessMode` 字段，APP 端据此决定控件交互状态：

| accessMode | 含义 | APP 控件状态 |
|------|------|------|
| `rw` | 读写 | 正常可交互 |
| `r` | 只读 | 控件置灰/禁用，仅展示当前值 |

---

## 四、服务（Service）

服务是设备可执行的动作指令，APP 端渲染为操作按钮。

#### 数据结构

```json
{
  "dataType": "service",
  "inputParams": [],
  "outputParams": [
    { "name": "操作结果", "identifier": "result", "dataType": "boolean", "trueLabel": "成功", "falseLabel": "失败", "defaultVal": "1" }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|
| `inputParams` | array | 否 | 输入参数列表（调用时需用户填写） |
| `outputParams` | array | 否 | 输出参数列表（调用后展示返回结果） |

#### APP 端渲染

| 步骤 | 控件 | 说明 |
|------|------|------|
| 触发 | **按钮（Button）** | 按钮文案为能力名称，如「格式化存储」 |
| 输入参数 | 弹窗/表单 | 若 inputParams 非空，弹出表单让用户填写参数后确认执行 |
| 输出参数 | 结果展示 | 执行后按 outputParams 各参数的数据类型渲染返回值 |

输入/输出参数的数据类型与属性规则一致（int→数字, enum→选择, boolean→开关, string→文本）。

---

## 五、事件（Event）

事件是设备主动上报的消息，APP 端渲染为通知/告警卡片。

#### 数据结构

```json
{
  "dataType": "event",
  "eventType": "alarm",
  "outputParams": [
    { "name": "当前电量", "identifier": "battery", "dataType": "int", "min": 0, "max": 100, "step": 1, "unit": "%", "defaultVal": "0" }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|
| `eventType` | string | 是 | 事件类型：`info`（信息）/ `alarm`（告警）/ `fault`（故障） |
| `outputParams` | array | 否 | 事件携带的参数列表 |

#### APP 端渲染

| eventType | 展示样式 | 场景 |
|------|------|------|
| `info` | 信息通知卡片 | 设备状态变化、操作完成通知 |
| `alarm` | 告警通知卡片（黄色/橙色） | 移动侦测、门铃呼叫等需要关注的事件 |
| `fault` | 故障通知卡片（红色） | 设备异常、传感器故障 |

事件携带的 `outputParams` 在卡片中以键值对形式展示，参数的数据类型渲染规则同属性。

---

## 六、服务/事件参数的数据类型

服务与事件的 `inputParams` / `outputParams` 中每个参数独立声明数据类型，APP 端按以下规则渲染：

| 参数 dataType | 表单控件 | 说明 |
|------|------|------|
| `int` | 数字输入 | 按参数的 min/max/step/unit 字段配置 |
| `enum` | 下拉选择 | 按参数的 enumValues 字段配置 |
| `boolean` | 开关 | 按参数的 trueLabel/falseLabel 字段配置 |
| `string` | 文本输入 | 按参数的 maxLen 字段配置 |

---

## 七、总览

```
能力类型（capType）
├── prop（属性）
│   ├── int    → Slider / Stepper    （min, max, step, unit）
│   ├── enum   → Segmented / Picker  （enumValues: [{name, val}]）
│   ├── boolean → Switch              （trueLabel, falseLabel）
│   └── string → Input / TextArea     （maxLen）
│
├── svc（服务）
│   ├── 触发按钮 → 能力名称
│   ├── 输入参数表单 → 按各参数 dataType 渲染
│   └── 输出结果展示 → 按各参数 dataType 渲染
│
└── evt（事件）
    ├── info  → 蓝色信息卡片
    ├── alarm → 橙色告警卡片
    └── fault → 红色故障卡片
    └── 携带参数 → 按各参数 dataType 渲染
```

---

> **本文档面向 APP 开发团队，定义云平台 `dataDef` 与 APP 端 UI 控件的映射契约。平台端新增或修改能力参数时，APP 端无需发版即可动态适配。**

---

*文档版本: v1.0 | 创建日期: 2026-05-28*
