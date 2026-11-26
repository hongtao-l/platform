# 产品物模型配置 — 返回 JSON 定义

## 使用场景

渲染设备支持的功能项。

---

## 一、示例

以一款「带白光灯的云台球机」为例，只列**产品之间有差异**的能力项；通用项（设备名称、时间、存储等）同样按此结构下发。

```json
{
  "updated_at": "2026-11-17T10:30:00Z",

  "capabilities": [
    {
      "identifier": "DeviceProperty",
      "type": "property",
      "name": "设备属性",
      "params": [
        {
          "identifier": "device_name",
          "name": "设备名称",
          "data_type": "string",
          "access": "rw",
          "value": "",
          "options": {
            "max_length": 32
          }
        }
      ]
    },
    {
      "identifier": "PTProperty",
      "type": "property",
      "name": "P/T 属性",
      "params": [
        {
          "identifier": "pt_control_type",
          "name": "云台控制类型",
          "data_type": "enum",
          "access": "ro",
          "value": 2,
          "options": {
            "enum": [
              {
                "label": "不支持",
                "value": 0
              },
              {
                "label": "设备控制",
                "value": 1
              },
              {
                "label": "分镜头控制",
                "value": 2
              }
            ]
          }
        },
        {
          "identifier": "pt_ability",
          "name": "各镜头云台能力",
          "data_type": "array",
          "access": "ro",
          "value": [
            3,
            3,
            0
          ],
          "options": {
            "max_length": 8
          }
        }
      ]
    },
    {
      "identifier": "PTZControlService",
      "type": "service",
      "name": "云台转动控制",
      "params": [
        {
          "identifier": "direction",
          "name": "转动方向",
          "data_type": "enum",
          "access": "rw",
          "value": "stop",
          "options": {
            "enum": [
              {
                "label": "上",
                "value": "up"
              },
              {
                "label": "下",
                "value": "down"
              },
              {
                "label": "左",
                "value": "left"
              },
              {
                "label": "右",
                "value": "right"
              },
              {
                "label": "停止",
                "value": "stop"
              }
            ]
          }
        },
        {
          "identifier": "speed",
          "name": "转动速度",
          "data_type": "int",
          "access": "rw",
          "value": 30,
          "options": {
            "min": 0,
            "max": 52,
            "step": 1
          }
        }
      ]
    },
    {
      "identifier": "LightProperty",
      "type": "property",
      "name": "灯光设置",
      "params": [
        {
          "identifier": "light_enable",
          "name": "白光灯开关",
          "data_type": "boolean",
          "access": "rw",
          "value": 0,
          "options": {
            "true_label": "开启",
            "false_label": "关闭"
          }
        }
      ]
    },
    {
      "identifier": "PowerProperty",
      "type": "property",
      "name": "电源参数",
      "params": [
        {
          "identifier": "battery_remain_capacity",
          "name": "电池剩余电量",
          "data_type": "int",
          "access": "ro",
          "value": 5000,
          "options": {
            "min": 0,
            "max": 10000,
            "step": 1,
            "unit": "mAh"
          }
        },
        {
          "identifier": "input_voltage",
          "name": "输入电压",
          "data_type": "double",
          "access": "ro",
          "value": 5.0,
          "options": {
            "min": 0,
            "max": 500,
            "step": 0.1,
            "unit": "V"
          }
        },
        {
          "identifier": "battery_lower_threshold",
          "name": "低电量告警",
          "data_type": "int",
          "access": "rw",
          "value": 20,
          "options": {
            "min": 1,
            "max": 100,
            "step": 1,
            "unit": "%"
          }
        }
      ]
    },
    {
      "identifier": "WorkModeProperty",
      "type": "property",
      "name": "工作模式",
      "params": [
        {
          "identifier": "work_mode",
          "name": "工作模式",
          "data_type": "enum",
          "access": "rw",
          "value": 3,
          "options": {
            "enum": [
              {
                "label": "超低功耗",
                "value": 0
              },
              {
                "label": "低功耗",
                "value": 1
              },
              {
                "label": "AOV",
                "value": 2
              },
              {
                "label": "长电",
                "value": 3
              }
            ]
          }
        }
      ]
    },
    {
      "identifier": "OSDProperty",
      "type": "property",
      "name": "OSD 水印",
      "params": [
        {
          "identifier": "osd_list",
          "name": "OSD 列表",
          "data_type": "array",
          "access": "rw",
          "value": [],
          "options": {
            "max_length": 4
          }
        },
        {
          "identifier": "privacy_mask",
          "name": "隐私区域",
          "data_type": "struct",
          "access": "rw",
          "value": {
            "x": 20,
            "y": 18,
            "width": 20,
            "height": 18
          },
          "options": {
            "fields": [
              {
                "identifier": "x",
                "name": "X坐标",
                "data_type": "int",
                "unit": "%"
              },
              {
                "identifier": "y",
                "name": "Y坐标",
                "data_type": "int",
                "unit": "%"
              },
              {
                "identifier": "width",
                "name": "宽度",
                "data_type": "int",
                "unit": "%"
              },
              {
                "identifier": "height",
                "name": "高度",
                "data_type": "int",
                "unit": "%"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 二、字段说明

### 2.1 能力项

| 字段 | 类型 | 说明 |
|---|---|---|
| `identifier` | string | 能力项标识，如 `PTZControlService` |
| `type` | enum | `property` 属性 / `service` 服务 / `event` 事件 / `policy` 策略 |
| `name` | string | 能力项名称 |
| `params` | array | 参数列表；为空时 APP 不渲染该能力项 |

### 2.2 参数

| 字段 | 类型 | 说明 |
|---|---|---|
| `identifier` | string | 参数标识，如 `direction` |
| `name` | string | 参数显示名 |
| `data_type` | enum | `boolean` / `enum` / `int` / `double` / `string` / `array` / `struct` |
| `access` | enum | `ro` 只读 / `rw` 读写 |
| `value` | any | 当前值，APP 用它做初始渲染 |
| `options` | object | 按 `data_type` 不同，见 2.3 |

### 2.3 `data_type` → 控件映射（APP 固定规则）

| data_type | 控件 | `options` 必填项 | `access = ro` 时 |
|---|---|---|---|
| `boolean` | 开关 | `true_label` / `false_label` | 文本「开启/关闭」 |
| `enum` | 分段选择（≤4 项）或下拉 | `enum[]`（label + value） | 文本标签 |
| `int` | 步进器 | `min` / `max` / `step` / `unit` | 数值文本 |
| `double` | 滑块 | `min` / `max` / `step` / `unit` | 数值文本 |
| `string` | 输入框 | `max_length` | 文本 |
| `array` | 列表 | `max_length` | 只读列表 |
| `struct` | 分组 | `fields[]` | 只读分组 |

---

## 三、差异化说明

示例刻意只放各产品存在差异的能力项，APP 才能靠"有没有这个 key"渲染出不同页面：

| 能力项 | 哪些产品才有 | 差异体现 |
|---|---|---|
| `PTProperty` | 球机 / 多目设备 | 固定机位不下发，不出现云台区块 |
| `PTZControlService` | 带云台机型 | `pt_control_type = 2` 时按镜头分别控制 |
| `LightProperty` | 带白光补光机型 | 纯红外机型不下发，不出现灯光设置 |
| `PowerProperty` | 电池供电机型 | 长电机型不下发，不出现电量区块 |
| `WorkModeProperty` | 低功耗机型 | 长电机型不下发 |
| `OSDProperty` | 支持水印 / 隐私遮挡机型 | 不支持的不下发 |

> 通用项（设备名称、时间、存储等）所有产品都会下发，不重复举例。

---

## 四、约定

1. **key 存在即展示**：不下发的能力项 / 参数 APP 不渲染，不设 `show` 开关。
2. **能力项以产品为准**：APP 不硬编码任何能力项标识，全部来自本接口。
3. **枚举值不改语义**：`type` / `data_type` / `access` 已有约定，新增需 APP 同步支持。
4. **数据量**：全量产品约 95 个能力项、450+ 参数，建议 APP 本地缓存并按需刷新。

---

*文档版本: v1.0 | 创建日期: 2026-11-17*
