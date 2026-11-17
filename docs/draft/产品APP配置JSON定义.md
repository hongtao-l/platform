# 产品 APP 配置 — 返回 JSON 定义

> 平台把「产品审核 / App功能配置」里的配置项以 JSON 形式下发给 APP，APP 据此渲染页面。
> 设计原则：**分组清晰、字段自解释、缺省即默认、新增不破坏老 APP**。

---

## 一、完整示例

```json
{
  "version": "1.0",
  "product_id": "P10086",
  "updated_at": "2026-11-16T10:30:00Z",

  "install_guide": {
    "steps": [
      { "order": 1, "title": "下载App", "desc": "扫描二维码或在应用商店搜索下载" },
      { "order": 2, "title": "注册账号", "desc": "使用手机号注册并登录" },
      { "order": 3, "title": "添加设备", "desc": "点击右上角「+」扫描设备二维码" }
    ]
  },

  "app_scope": {
    "restricted": false,
    "apps": []
  },

  "preview": {
    "resolution": "uhd",
    "image_interp": { "enabled": true, "size": "1920x1080" },
    "video_interp": true
  },

  "layout": {
    "enabled": true,
    "mode": "split",
    "stitch": { "count": 0, "cameras": [] },
    "split": [
      { "camera": 0, "pane_count": 2, "splits": [60] },
      { "camera": 1, "pane_count": 3, "splits": [33, 66] }
    ]
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
}
```

---

## 二、字段说明

### 1. 基础信息

| 字段 | 类型 | 说明 |
|---|---|---|
| `version` | string | 配置结构版本，APP 按此做兼容；结构变更才升版本 |
| `product_id` | string | 产品ID |
| `updated_at` | string | 配置最后更新时间，ISO 8601 |

### 2. 安装引导 `install_guide`

| 字段 | 类型 | 说明 |
|---|---|---|
| `steps[].order` | int | 步骤序号，从 1 开始 |
| `steps[].title` | string | 步骤标题，如「下载App」 |
| `steps[].desc` | string | 步骤说明 |

> APP 按 `order` 升序渲染引导页；`steps` 为空数组时跳过引导。

### 3. 使用范围 `app_scope`

| 字段 | 类型 | 说明 |
|---|---|---|
| `restricted` | bool | `false` 不限 App；`true` 仅限 `apps` 内指定的 App 绑定 |
| `apps` | string[] | 允许的 App 标识，如 `["carecam_pro","ipc_viewer"]` |

### 4. 预览 `preview`

| 字段 | 类型 | 说明 |
|---|---|---|
| `resolution` | enum | `uhd` 超清(2K/4K) / `sd` 标清(1080P及以下) |
| `image_interp.enabled` | bool | 图片插值开关 |
| `image_interp.size` | string | 插值目标尺寸，如 `1920x1080` |
| `video_interp` | bool | 视频插值开关 |

### 5. 画面布局 `layout`（拼接 / 拆分）

| 字段 | 类型 | 说明 |
|---|---|---|
| `enabled` | bool | 是否启用画面布局；false 时 APP 按单画面显示 |
| `mode` | enum | `stitch` 拼接 / `split` 拆分 |
| `stitch.count` | int | 拼接路数，1~7 |
| `stitch.cameras` | int[] | 参与拼接的 Camera 编号，0~6，长度 = `count` |
| `split[].camera` | int | 该条拆分配置对应的 Camera 编号，0~6 |
| `split[].pane_count` | int | 子画面数量，2~4 |
| `split[].splits` | int[] | 分割点百分比，长度 = `pane_count - 1`，严格递增，取值 1~99 |

> - `mode = stitch` 时只需读 `stitch`，`split` 可为空数组；
> - `mode = split` 时只需读 `split`，`stitch` 的 `count` 传 0；
> - 两个分支都给默认空值，APP 不用判空。

### 6. 功能开关 `features`

| 字段 | 类型 | 说明 |
|---|---|---|
| `full_color_mode` | enum | `auto` 夜间智能感知 / `scheduled` 定时开启 |
| `one_key_alarm` | bool | 是否启用一键报警 |
| `fake_triple_lens` | bool | 假三目展示 |
| `light_switch.show` | bool | APP 是否显示灯控开关 |
| `light_switch.default_duration` | int | 灯控默认时长，单位秒，5~300 |

### 7. 低电量保护 `low_battery_policy`

| 字段 | 类型 | 说明 |
|---|---|---|
| `enabled` | bool | 是否启用低电量保护策略 |
| `threshold` | int | 低电量阈值百分比，1~100 |
| `disabled_features` | string[] | 低于阈值时禁用的功能，取值 `ptz` / `talk` / `call` |

> `enabled = false` 时 APP 忽略后两个字段。

---

## 三、几条约定

1. **缺省即默认**：APP 读不到某个字段时按默认值渲染，不因字段缺失报错。平台侧建议所有字段都给默认值下发，不要省略。
2. **枚举值固定小写**：`uhd` / `sd`、`auto` / `scheduled`、`stitch` / `split`，避免 APP 大小写兼容问题。
3. **未知字段忽略**：平台新增字段时 APP 直接忽略即可，不需要同步发版才能兼容。
4. **结构变更才升 `version`**：新增字段不升版本；字段改名、语义变化才升，APP 按版本号做分支。
5. **配对字段成组下发**：如 `image_interp` 的 `enabled` 与 `size` 一起给，避免"开了插值但没给尺寸"的半截状态。

---

## 四、取值边界汇总

| 字段 | 取值 | 默认 |
|---|---|---|
| `preview.resolution` | `uhd` / `sd` | `uhd` |
| `preview.image_interp.size` | `1920x1080` / `2560x1440` / `3840x2160` | `1920x1080` |
| `layout.stitch.count` | 1~7 | 0（不拼接） |
| `layout.stitch.cameras` | 0~6，数量 = count | `[]` |
| `layout.split[].camera` | 0~6，不可重复 | — |
| `layout.split[].pane_count` | 2~4 | 2 |
| `layout.split[].splits` | 1~99 递增 | 均分 |
| `features.full_color_mode` | `auto` / `scheduled` | `auto` |
| `features.light_switch.default_duration` | 5~300 秒 | 60 |
| `low_battery_policy.threshold` | 1~100 | 20 |
| `low_battery_policy.disabled_features` | `ptz` / `talk` / `call` | `[]` |

---

*文档版本: v1.0 | 创建日期: 2026-11-16*
