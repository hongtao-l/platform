# 产品基础配置 — 返回 JSON 定义

## 使用场景

设备添加前识别设备类型及网络信息，引导用户进入对应的配网流程。

---

## 一、示例

```json
{
  "updated_at": "2026-11-17T10:30:00Z",

  "device_type": "ipc_ptz",
  "model_image_url": "https://cdn.example.com/product/P10086/model.png",

  "network": {
    "types": ["wired", "wifi", "cellular"],
    "support_dual_band": false,
    "provisioning_methods": ["ap"],
    "default_provisioning_method": "ap"
  }
}
```

---

## 二、字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `updated_at` | string | 最后更新时间，ISO 8601 |
| `device_type` | string | 设备类型编码，见第三节 |
| `model_image_url` | string | 产品模型图下载地址，用于添加设备页与设备卡片兜底展示 |
| `network.types` | string[] | 联网方式，多选：`wired` 有线 / `wifi` WIFI / `cellular` 移动网络 |
| `network.support_dual_band` | bool | 是否支持双频路由器（5GHz） |
| `network.provisioning_methods` | string[] | 配网方式，多选，见 3.3 |
| `network.default_provisioning_method` | string | 默认（优先）配网方式，取值须在 `provisioning_methods` 内 |

---

## 三、枚举取值

### 3.1 设备类型 `device_type`

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

### 3.2 联网方式 `network.types`

| code | 显示名 |
|---|---|
| `wired` | 有线 |
| `wifi` | WIFI |
| `cellular` | 移动网络 |

### 3.3 配网方式 `network.provisioning_methods`

| code | 显示名 |
|---|---|
| `ap` | AP |
| `sound` | 声音 |
| `smartlink` | smartlink |
| `qr_camera` | 摄像机识别二维码添加 |
| `lan` | 局域网 |
| `qr_app` | APP扫码添加 |
| `ble` | 蓝牙添加 |

---

## 四、约定

1. **平台只下发 code**，显示名由 APP 内维护（便于多语言）。
2. `default_provisioning_method` 必须属于 `provisioning_methods`，否则 APP 取数组第一项。
3. 未识别的 `device_type` 回退通用卡片 + 设备详情页，不得白屏。
4. 新增枚举值需 APP 同步支持。
5. `model_image_url` 缺失时，APP 用设备类型对应的默认占位图。

---

*文档版本: v1.0 | 创建日期: 2026-11-17*
