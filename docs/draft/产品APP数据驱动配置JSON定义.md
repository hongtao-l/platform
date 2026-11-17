# 产品 APP 数据驱动配置 — 统一 JSON 定义

> APP 页面完全由后台配置驱动：拿到这份 JSON 就能决定「卡片长什么样、显示哪些功能、每个功能用什么控件」。
> 顶层分类：`device_type`（设备类型）、`capabilities`（设备能力项）、`app_display`（APP 显示配置）、`install_guide`（安装指引）。
>
> **展示规则：平台按产品的实际能力下发，APP 见到该 key 就展示，见不到就不展示。**没有额外的 show 开关。

---

## 一、完整示例

以一款「带白光灯的云台球机」为例，各能力项都选了**产品之间有差异**的项（PTZ、白光灯、电池、工作模式、OSD），而不是所有设备都有的通用项。

```json
{
  "device_id": "D1000001",
  "updated_at": "2026-11-16T10:30:00Z",

  "device_type": "ipc_ptz",

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
          "options": { "max_length": 32 }
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
              { "label": "不支持", "value": 0 },
              { "label": "设备控制", "value": 1 },
              { "label": "分镜头控制", "value": 2 }
            ]
          }
        },
        {
          "identifier": "pt_ability",
          "name": "各镜头云台能力",
          "data_type": "array",
          "access": "ro",
          "value": [3, 3, 0],
          "options": { "max_length": 8 }
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
              { "label": "上", "value": "up" },
              { "label": "下", "value": "down" },
              { "label": "左", "value": "left" },
              { "label": "右", "value": "right" },
              { "label": "停止", "value": "stop" }
            ]
          }
        },
        {
          "identifier": "speed",
          "name": "转动速度",
          "data_type": "int",
          "access": "rw",
          "value": 30,
          "options": { "min": 0, "max": 52, "step": 1 }
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
          "options": { "true_label": "开启", "false_label": "关闭" }
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
          "options": { "min": 0, "max": 10000, "step": 1, "unit": "mAh" }
        },
        {
          "identifier": "input_voltage",
          "name": "输入电压",
          "data_type": "double",
          "access": "ro",
          "value": 5.0,
          "options": { "min": 0, "max": 500, "step": 0.1, "unit": "V" }
        },
        {
          "identifier": "battery_lower_threshold",
          "name": "低电量告警",
          "data_type": "int",
          "access": "rw",
          "value": 20,
          "options": { "min": 1, "max": 100, "step": 1, "unit": "%" }
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
              { "label": "超低功耗", "value": 0 },
              { "label": "低功耗", "value": 1 },
              { "label": "AOV", "value": 2 },
              { "label": "长电", "value": 3 }
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
          "options": { "max_length": 4 }
        },
        {
          "identifier": "privacy_mask",
          "name": "隐私区域",
          "data_type": "struct",
          "access": "rw",
          "value": { "x": 20, "y": 18, "width": 20, "height": 18 },
          "options": {
            "fields": [
              { "identifier": "x", "name": "X坐标", "data_type": "int", "unit": "%" },
              { "identifier": "y", "name": "Y坐标", "data_type": "int", "unit": "%" },
              { "identifier": "width", "name": "宽度", "data_type": "int", "unit": "%" },
              { "identifier": "height", "name": "高度", "data_type": "int", "unit": "%" }
            ]
          }
        }
      ]
    }
  ],

  "app_display": {
    "preview": {
      "resolution": "uhd",
      "image_interp": { "enabled": true, "size": "1920x1080" },
      "video_interp": true
    },
    "layout": {
      "enabled": false,
      "mode": "split",
      "stitch": { "count": 0, "cameras": [] },
      "split": []
    },
    "features": {
      "full_color_mode": "auto",
      "one_key_alarm": true,
      "fake_triple_lens": false,
      "light_switch": { "show": true, "default_duration": 60 }
    },
    "low_battery_policy": {
      "enabled": true,
      "threshold": 20,
      "disabled_features": ["ptz", "talk"]
    }
  },

  "install_guide": {
    "steps": [
      {
        "order": 1,
        "title": { "zh-CN": "步骤1", "en": "step 1" },
        "media": {
          "type": "image",
          "url": "https://cdn.example.com/guide/step1.png"
        },
        "content": {
          "zh-CN": "扫描包装盒上的二维码，或在应用商店搜索对应 App 下载安装。",
          "en": "Scan the QR code on the box or search the app store to download."
        }
      },
      {
        "order": 2,
        "title": { "zh-CN": "步骤2", "en": "step 2"  },
        "media": {
          "type": "gif",
          "url": "https://cdn.example.com/guide/step2.gif"
        },
        "content": { "zh-CN": "使用手机号注册并登录。" }
      },
      {
        "order": 3,
        "title": { "zh-CN": "步骤3", "en": "step 3"  },
        "media": {
          "type": "video",
          "url": "https://cdn.example.com/guide/step3.mp4"
        },
        "content": { "zh-CN": "点击右上角「+」，扫描设备二维码完成添加。" }
      }
    ]
  }
}
```

---

## 二、顶层结构

| 字段 | 类型 | 作用 |
|---|---|---|
| `version` | string | 配置结构版本，结构变更才升 |
| `device_id` | string | 设备ID |
| `updated_at` | string | 最后更新时间，ISO 8601 |
| `device_type` | string | **设备类型编码**：APP 据此决定卡片样式与进入页面 |
| `capabilities` | array | **设备能力项**：决定设备页显示哪些功能、用什么控件 |
| `app_display` | object | **APP 显示配置**：预览、画面布局、功能开关、低电量策略 |
| `install_guide` | object | **安装指引**：引导步骤列表 |

---

## 三、设备类型 `device_type`

一个字符串编码，APP 按它决定**卡片样式**和**点击进入的页面**：

```json
"device_type": "ipc_ptz"
```

| code | 卡片样式 | 进入页面 |
|---|---|---|
| `ipc` | 视频缩略图卡片 | 实时预览 |
| `ipc_low_power` | 低功耗摄像机卡片（含电量） | 实时预览 |
| `ipc_ptz` | 球机卡片（含云台快捷操作） | 实时预览 |
| `ipc_multi` | 多画面缩略图卡片 | 实时预览 |
| `doorbell` | 门铃卡片（含呼叫按钮） | 呼叫/预览 |
| `sensor` | 小卡片（数值与状态为主） | 设备详情 |
| `meter` | 数值仪表样式 | 设备详情 |
| `nvr` | NVR 卡片（含通道数） | 通道列表 |

约定：

1. **映射关系在 APP 内维护**，平台只下发 code，不重复描述样式。
2. APP 遇到**未识别的 code** 时，回退到通用卡片 + 设备详情页，不得白屏。
3. 新增设备类型需 APP 同步支持（新增 code → 样式映射）。

> 如果后续要求「平台加类型、APP 不发版」，再把 `device_type` 扩展成 `{ code, card_style, entry_page }` 对象即可，属于兼容性升级。

---

## 四、设备能力项 `capabilities`

一个扁平数组，每个元素是一个能力项。**不下发的能力项，APP 不展示。**

### 4.1 能力项

| 字段 | 类型 | 说明 |
|---|---|---|
| `identifier` | string | 能力项标识，如 `PTZControlService` |
| `type` | enum | `property` 属性 / `service` 服务 / `event` 事件 / `policy` 策略 |
| `name` | string | 能力项名称 |
| `params` | array | 参数列表；为空时 APP 不渲染该能力项 |

### 4.2 参数

| 字段 | 类型 | 说明 |
|---|---|---|
| `identifier` | string | 参数标识，如 `direction` |
| `name` | string | 参数显示名 |
| `data_type` | enum | `boolean` / `enum` / `int` / `double` / `string` / `array` / `struct` |
| `access` | enum | `ro` 只读 / `rw` 读写 |
| `value` | any | 当前值，APP 用它做初始渲染 |
| `options` | object | 按 `data_type` 不同，见下 |

**`data_type` → 控件映射（APP 固定规则）**

| data_type | 控件 | `options` 必填项 | `access = ro` 时 |
|---|---|---|---|
| `boolean` | 开关 | `true_label` / `false_label` | 文本「开启/关闭」 |
| `enum` | 分段选择（≤4 项）或下拉 | `enum[]`（label + value） | 文本标签 |
| `int` | 步进器 | `min` / `max` / `step` / `unit` | 数值文本 |
| `double` | 滑块 | `min` / `max` / `step` / `unit` | 数值文本 |
| `string` | 输入框 | `max_length` | 文本 |
| `array` | 列表 | `max_length` | 只读列表 |
| `struct` | 分组 | `fields[]` | 只读分组 |

### 4.3 差异化示例说明

示例里故意只放**各产品之间存在差异**的能力项，这样 APP 才能靠"有没有这个 key"渲染出不同页面：

| 能力项 | 哪些产品才有 | 差异体现 |
|---|---|---|
| `PTProperty` | 球机 / 多目设备 | 固定机位机型不下发，APP 不出现云台区块 |
| `PTZControlService` | 带云台的机型 | 同上；`pt_control_type = 2` 时按镜头分别控制 |
| `LightProperty` | 带白光补光的机型 | 纯红外机型不下发，不出现灯光设置 |
| `PowerProperty` | 电池供电机型 | 长电机型不下发，不出现电量区块 |
| `WorkModeProperty` | 低功耗机型 | 长电机型不下发 |
| `OSDProperty` | 支持水印 / 隐私遮挡的机型 | 不支持的不下发 |

> 通用项（设备名称、时间、存储等）所有产品都会下发，不在这里重复举例。

---

## 五、APP 显示配置 `app_display`

| 字段 | 类型 | 取值 / 说明 |
|---|---|---|
| `preview.resolution` | enum | `uhd` 超清(2K/4K) / `sd` 标清(1080P及以下) |
| `preview.image_interp.enabled` | bool | 图片插值开关 |
| `preview.image_interp.size` | string | `1920x1080` / `2560x1440` / `3840x2160` |
| `preview.video_interp` | bool | 视频插值开关 |
| `layout.enabled` | bool | 是否启用画面布局；false 时 APP 按单画面展示 |
| `layout.mode` | enum | `stitch` 拼接 / `split` 拆分 |
| `layout.stitch.count` | int | 拼接路数，1~7 |
| `layout.stitch.cameras` | int[] | 参与拼接的 Camera 编号，0~6，长度 = `count` |
| `layout.split[].camera` | int | 该条配置对应的 Camera 编号，0~6，不可重复 |
| `layout.split[].pane_count` | int | 子画面数量，2~4 |
| `layout.split[].splits` | int[] | 分割点百分比，长度 = `pane_count - 1`，1~99 递增 |
| `features.full_color_mode` | enum | `auto` 夜间智能感知 / `scheduled` 定时开启 |
| `features.one_key_alarm` | bool | 是否启用一键报警 |
| `features.fake_triple_lens` | bool | 假三目展示 |
| `features.light_switch.show` | bool | APP 是否显示灯控开关 |
| `features.light_switch.default_duration` | int | 灯控默认时长，秒，5~300 |
| `low_battery_policy.enabled` | bool | 是否启用低电量保护策略 |
| `low_battery_policy.threshold` | int | 低电量阈值百分比，1~100 |
| `low_battery_policy.disabled_features` | string[] | 低于阈值时禁用的功能：`ptz` / `talk` / `call` |

---

## 六、安装指引 `install_guide`

APP 设备激活页按步骤顺序展示。每个步骤由「标题 + 媒体 + 文案」组成，其中**标题与文案支持多语言，媒体不分语言**。

| 字段 | 类型 | 说明 |
|---|---|---|
| `steps[].order` | int | 步骤序号，从 1 开始，升序展示 |
| `steps[].title` | object | 步骤标题，多语言对象 |
| `steps[].media.type` | enum | `image` 图片 / `gif` 动图 / `video` 视频 |
| `steps[].media.url` | string | 媒体地址，需公网可直接访问（APP 侧不再二次鉴权） |
| `steps[].content` | object | 安装指引文案，多语言对象，单语言 ≤500 字 |

### 6.1 多语言对象

以语言代码为 key，中文固定用 `zh-CN` 作为默认语言：

```json
"title": { "zh-CN": "下载App", "en": "Download the app", "fr": "Télécharger l'application" }
```

支持的 16 种语言代码：

| 代码 | 语言 | 代码 | 语言 |
|---|---|---|---|
| `zh-CN` | 简体中文（默认） | `ko` | 한국어 |
| `en` | English | `de` | Deutsch |
| `zh-Hant` | 繁體中文 | `it` | Italiano |
| `fr` | Français | `ru` | Русский |
| `ja` | 日本語 | `pt` | Português |
| `es` | Español | `vi` | Tiếng Việt |
| `th` | ไทย | `tr` | Türkçe |
| `fa` | فارسی | `id` | Indonesia |

### 6.2 取值规则

1. **`zh-CN` 必填**，其它语言可缺省；APP 取不到当前语言时回退 `zh-CN`。
2. **媒体可选**：某步骤不需要图示时，`media` 传 `null` 或省略，APP 只渲染标题与文案。
5. **媒体失败兜底**：图片/动图/视频加载失败时，APP 隐藏媒体区，保留标题与文案，不显示破图。
3. **文案 ≤500 字**（单语言），与平台输入框上限一致。
4. `steps` 为空数组时跳过引导页。
6. **排序以 `order` 为准**：数组顺序不作为展示顺序，避免平台调整顺序后 APP 显示错乱。

---

## 七、兼容约定

1. **key 存在即展示**：平台按产品实际能力下发，不下发的能力项 / 参数 APP 不渲染；不设 `show` 开关。
2. **未知字段忽略**：平台新增字段不升 `version`，APP 直接忽略。
3. **缺失即默认**：`options` 缺失时按 `data_type` 的默认范围处理；`value` 缺失时按类型零值渲染。
4. **能力项以产品为准**：APP 不硬编码任何能力项标识，全部来自这份 JSON。
5. **多语言回退**：任意多语言字段取值顺序为「当前语言 → `zh-CN` → 空」；`zh-CN` 缺失视为配置异常，按空串处理。
6. **枚举值不改语义**：`device_type`、`type`、`data_type`、`access`、`media.type` 等枚举值已有约定，新增取值需 APP 同步支持。

---

*文档版本: v1.0 | 创建日期: 2026-11-16*
