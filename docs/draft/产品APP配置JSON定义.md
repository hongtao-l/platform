# 产品 APP 配置 — 返回 JSON 定义

## 使用场景

APP 层面对功能呈现做进一步处理，满足不同客户需求的差异化显示配置。

---

## 一、示例

```json
{
  "updated_at": "2026-11-17T10:30:00Z",

  "app_display": {
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

## 二、字段说明

| 字段 | 类型 | 取值 / 说明 |
|---|---|---|
| `resolution_display_mode` | enum | `friendly` 通俗标识（超清/高清/标清）/ `pixel` 像素规格（1080P/2K/4K） |
| `image_interp.enabled` | bool | 图片插值开关；`video_interp = true` 时强制为 `true` |
| `image_interp.height` | int | 插值高度，如 `1080` |
| `image_interp.width` | int | 插值宽度，如 `1920` |
| `video_interp` | bool | 视频插值开关 |
| `playback_limit.mode` | enum | `limited` 开启限制 / `unlimited` 无限制 |
| `playback_limit.limit_seconds` | int | 单次播放时长上限，秒；`unlimited` 时忽略 |
| `playback_limit.warning_enabled` | bool | 播放预警开关，仅 `mode = limited` 时有效 |
| `playback_limit.warning_seconds` | int | 剩余多少秒触发预警；`warning_enabled = false` 时忽略 |
| `fake_triple_lens.enabled` | bool | 假三目开关 |
| `fake_triple_lens.stream_id` | int | 原始流ID，第几个 camera，从 1 开始 |
| `fake_triple_lens.crop_percent` | int | 截取百分比，1~100 |
| `layout.enabled` | bool | 画面分屏开关；false 时按单画面展示 |
| `layout.mode` | enum | `stitch` 拼接 / `split` 拆分 |
| `layout.stitch.count` | int | 拼接路数，1~7 |
| `layout.stitch.cameras` | int[] | 参与拼接的 Camera 编号，0~6，长度 = `count` |
| `layout.split[].camera` | int | 该条配置对应的 Camera 编号，0~6，不可重复 |
| `layout.split[].pane_count` | int | 子画面数量，2~4 |
| `layout.split[].splits` | int[] | 分割点百分比，长度 = `pane_count - 1`，1~99 递增 |
| `light_switch.show` | bool | APP 是否显示灯控开关 |
| `light_switch.duration` | int | 灯光控制时长，秒，0~86400，默认 43200 |
| `low_battery_policy.enabled` | bool | 是否启用低电量保护策略 |
| `low_battery_policy.threshold` | int | 低电量阈值百分比，1~100 |
| `low_battery_policy.disabled_features` | string[] | 禁用的功能：`ptz` 云台 / `talk` 语音对讲 / `sos` 一键呼叫 |

---

## 三、联动规则（与配置页一致）

1. **视频插值 → 图片插值**：`video_interp = true` 时 `image_interp.enabled` 强制为 `true`，APP 侧置灰不可关。
2. **播放限制 → 预警**：`playback_limit.mode = unlimited` 时，`warning_enabled` / `warning_seconds` 不下发。
3. **拼接 vs 拆分**：`mode = stitch` 只看 `stitch`，`split` 可空；`mode = split` 只看 `split`，`stitch.count` 传 0。
4. **假三目展开字段**：`fake_triple_lens.enabled = false` 时，`stream_id` / `crop_percent` 不下发。

---

## 四、约定

1. 本配置只作用于**实时预览与 APP 交互**，不影响物模型与设备固件。
2. 缺失字段一律按默认值渲染，不允许因缺字段白屏。
3. 新增字段不升接口版本，APP 忽略未知字段即可。

---

*文档版本: v2.0 | 创建日期: 2026-11-17*
