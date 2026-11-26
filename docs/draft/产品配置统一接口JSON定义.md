# 产品配置接口 — 统一存储、按 ID 获取

## 使用场景

平台把四类产品配置（基础 / 物模型 / APP 显示 / 安装指引）存放在同一套配置服务里，**每条配置生成一个独立 ID**。APP 拿到哪个 ID，就取哪一份数据，互不影响。

> 和之前的差别：以前是四个接口各自返回，现在**接口形态统一、存储统一**，但四份数据仍然分开——靠 `config_id` 区分，APP 按需逐个获取。

---

## 一、接口约定

```
GET /api/v1/product-config/{config_id}
```

| 参数 | 位置 | 必填 | 说明 |
|---|---|---|---|
| `config_id` | path | 是 | 配置索引ID，一条配置一个ID |

**返回**：单条配置对象。APP 请求时已经知道要的是哪一类，返回体只需给 `data`。

```json
{
  "config_id": "CFG-BASE-20261120-0001",
  "updated_at": "2026-11-20T10:30:00Z",
  "data": { }
}
```

### 1.1 批量获取（可选）

若 APP 一次需要多份，可用批量接口减少往返：

```
GET /api/v1/product-config?ids=CFG-BASE-xxx,CFG-TM-xxx
```

```json
{
  "items": [
    { "config_id": "CFG-BASE-xxx", "type": "base", "data": { } },
    { "config_id": "CFG-TM-xxx",   "type": "thing_model", "data": { } }
  ]
}
```

> 批量返回时每项保留 `type`，否则 APP 无法知道哪一项是哪一类配置；单条接口由调用方自己知道，不需要。
>
> 单个 ID 不存在时，该项不返回，其余正常返回。

---

## 二、返回结构

### 2.1 外层字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `config_id` | string | 配置索引ID，全局唯一，内容不可变 |
| `updated_at` | string | 最后更新时间，ISO 8601 |
| `data` | object | 配置内容，结构由 `type` 决定，见第三节 |

### 2.2 四类配置的 `data` 结构

| 配置类型 | 含义 | data 结构 | 字段明细 |
|---|---|---|---|
| `base` | 产品基础配置 | `device_type`、`model_image_url`、`network` | [产品基础配置JSON定义.md](产品基础配置JSON定义.md) |
| `thing_model` | 产品物模型配置 | `capabilities[]` | [产品物模型配置JSON定义.md](产品物模型配置JSON定义.md) |
| `app_display` | 产品 APP 配置 | 分辨率、插值、播放限制、假三目、画面分屏、灯控、低电量 | [产品APP配置JSON定义.md](产品APP配置JSON定义.md) |
| `install_guide` | 产品安装指引 | `steps[]`（标题 + 媒体 + 文案，多语言） | [产品安装指引配置JSON定义.md](产品安装指引配置JSON定义.md) |

---

## 三、四类配置的返回示例

**基础配置**

```json
{
  "config_id": "CFG-BASE-20261120-0001",
  "updated_at": "2026-11-20T10:30:00Z",
  "data": {
    "device_type": "ipc_ptz",
    "model_image_url": "https://cdn.example.com/product/P10086/model.png",
    "network": {
      "types": [
        "wired",
        "wifi",
        "cellular"
      ],
      "support_dual_band": false,
      "provisioning_methods": [
        "ap"
      ],
      "default_provisioning_method": "ap"
    }
  }
}
```

---

**物模型配置**

```json
{
  "config_id": "CFG-THIN-20261120-0001",
  "updated_at": "2026-11-20T10:30:00Z",
  "data": {
    "capabilities": [
      {
        "identifier": "DeviceProperty",
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
}
```

---

**APP 配置**

```json
{
  "config_id": "CFG-APPD-20261120-0001",
  "updated_at": "2026-11-20T10:30:00Z",
  "data": {
    "resolution_display_mode": "pixel",
    "image_interp": {
      "enabled": true,
      "height": 1080,
      "width": 1920
    },
    "video_interp": true,
    "playback_limit": {
      "mode": "unlimited",
      "limit_seconds": 0,
      "warning_enabled": true,
      "warning_seconds": 0
    },
    "fake_triple_lens": {
      "enabled": true,
      "stream_id": 1,
      "crop_percent": 100
    },
    "layout": {
      "enabled": true,
      "mode": "split",
      "stitch": {
        "count": 0,
        "cameras": []
      },
      "split": [
        {
          "camera": 0,
          "pane_count": 2,
          "splits": [
            50
          ]
        }
      ]
    },
    "light_switch": {
      "show": false,
      "duration": 43200
    },
    "low_battery_policy": {
      "enabled": true,
      "threshold": 20,
      "disabled_features": [
        "ptz",
        "talk"
      ]
    }
  }
}
```

---

**安装指引**

```json
{
  "config_id": "CFG-INST-20261120-0001",
  "updated_at": "2026-11-20T10:30:00Z",
  "data": {
    "steps": [
      {
        "order": 1,
        "title": {
          "zh-CN": "步骤1",
          "en": "step 1"
        },
        "media": {
          "url": "https://cdn.example.com/guide/step1.png"
        },
        "content": {
          "zh-CN": "扫描包装盒上的二维码，或在应用商店搜索对应 App 下载安装。",
          "en": "Scan the QR code on the box or search the app store to download."
        }
      },
      {
        "order": 2,
        "title": {
          "zh-CN": "步骤2",
          "en": "step 2"
        },
        "media": {
          "url": "https://cdn.example.com/guide/step2.gif"
        },
        "content": {
          "zh-CN": "使用手机号注册并登录。"
        }
      },
      {
        "order": 3,
        "title": {
          "zh-CN": "步骤3",
          "en": "step 3"
        },
        "media": {
          "url": "https://cdn.example.com/guide/step3.mp4"
        },
        "content": {
          "zh-CN": "点击右上角「+」，扫描设备二维码完成添加。"
        }
      }
    ]
  }
}
```

---

## 四、`config_id` 规则

### 4.1 一条配置一个 ID

一个产品有 4 条配置，就有 4 个 `config_id`：

```
产品 P10086
├─ CFG-BASE-20261120-0001   基础配置
├─ CFG-TM-20261120-0001     物模型配置
├─ CFG-APP-20261120-0001    APP 配置
└─ CFG-GUIDE-20261120-0001  安装指引
```

### 4.2 为什么用 ID 而不是「产品ID + 类型」去查

| 方案 | 问题 |
|---|---|
| `GET /config?product_id=X&type=base` | 配置一改，返回内容就变了；客户端缓存全废；没法复现"某台设备当时是哪份配置" |
| `GET /config/{config_id}` | 内容不可变 → 客户端可长期缓存；按 ID 能精确复现历史版本 |

**同一条配置内容变了 → 生成新 ID，旧 ID 继续可查（内容冻结）**，这是整套方案能放心缓存的前提。

### 4.3 APP 怎么拿到这些 ID

```
设备绑定 / 添加设备 → 设备服务返回该产品当前生效的 4 个 config_id
                    ↓
APP 按需逐个调配置接口
                    ↓
本地缓存 key = config_id，命中就不再请求
```

> **前提**：设备服务需要回传 4 个 `config_id`，否则 APP 无法定位到具体配置。

---

## 五、按需获取建议

| 场景 | 需要哪些 type |
|---|---|
| 添加设备 / 配网 | `base` |
| 进入设备详情页 | `thing_model` + `app_display` |
| 设备激活引导 | `install_guide` |

物模型配置较大（400+ 参数、80~200 KB），建议**只在需要时拉取**并本地缓存；其余三类很小，可一次性批量取。

---

## 六、错误与兼容约定

| 场景 | 返回 |
|---|---|
| `config_id` 不存在 | `404` + `{"code":"CONFIG_NOT_FOUND"}` |
| 配置已下线（产品停产） | `410` + `{"code":"CONFIG_RETIRED"}` |
| 批量请求中部分 ID 不存在 | `200`，缺失项不返回 |
| 服务端异常 | `500` + `{"code":"INTERNAL_ERROR"}`，APP 用本地缓存兜底 |

其余约定：

1. **未知字段一律忽略**，平台新增字段不升 `version`，老 APP 不受影响。
2. **`data` 结构由配置类型决定**，同一类型永远返回同一套结构，不会因产品不同而变形。
3. **枚举值固定小写英文**，显示文案由 APP 本地化。
4. **缺字段即默认**，任何 `data` 字段缺失时走默认渲染，不允许白屏。

---

*文档版本: v2.0 | 创建日期: 2026-11-20*
