# 产品安装指引配置 — 返回 JSON 定义

## 使用场景

设备添加完成后，以图 / 视频 / 文案的形式告知用户如何安装。

---

## 一、示例

```json
{
  "updated_at": "2026-11-17T10:30:00Z",

  "install_guide": {
    "steps": [
      {
        "order": 1,
        "title": {
          "zh-CN": "步骤1",
          "en": "step 1"
        },
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
        "title": {
          "zh-CN": "步骤2",
          "en": "step 2"
        },
        "media": {
          "type": "gif",
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
          "type": "video",
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

## 二、字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `steps[].order` | int | 步骤序号，从 1 开始，升序展示 |
| `steps[].title` | object | 步骤标题，多语言对象 |
| `steps[].media.type` | enum | `image` 图片 / `gif` 动图 / `video` 视频 |
| `steps[].media.url` | string | 媒体地址，需公网可直接访问 |
| `steps[].content` | object | 安装指引文案，多语言对象，单语言 ≤500 字 |

---

## 三、多语言

以语言代码为 key，中文固定 `zh-CN` 作为默认：

```json
"title": { "zh-CN": "下载App", "en": "Download the app", "fr": "Télécharger l'application" }
```

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

---

## 四、约定

1. **`zh-CN` 必填**，其它语言可缺省；取不到当前语言时回退 `zh-CN`。
2. **媒体可选**：不需要图示时 `media` 传 `null` 或省略，只渲染标题与文案。
3. **媒体失败兜底**：加载失败隐藏媒体区，保留标题与文案，不显示破图。
4. **文案 ≤500 字**（单语言），与平台输入框上限一致。
5. **排序以 `order` 为准**，数组顺序不作为展示顺序。
6. `steps` 为空数组时跳过引导页。

---

*文档版本: v1.0 | 创建日期: 2026-11-17*
