# 跨域访问提示 — 页面设计说明

> 关联需求：[跨域网络异常处理01ReqAnalysis.md](跨域网络异常处理01ReqAnalysis.md)
> 设计端：CareCam Pro PWA（Vue3 + Vant UI）

---

## 1. 整体架构

```
CareCam Pro PWA
├── composables/useRegion.js  — 封装 fetchRegionInfo，暴露 isCrossRegion
├── mock/region.js            — mock 数据（isCrossRegion: true）
├── utils/i18n.js             — 轻量多语言（crossRegionTip）
└── views/home/index.vue      — 首页左上角 ✈️ 图标
```

---

## 2. 页面结构

### 2.1 首页（跨域指示器）

首页左上角「我的家」标题旁，当 `isCrossRegion === true` 时显示 ✈️ 图标。

```
┌─────────────────────────────────┐
│  我的家 ✈️          🔔  ➕  [J]  │
│  3台在线 · 0台离线 · 0台休眠       │
```

| 属性 | 说明 |
|------|------|
| 位置 | 首页 `.home-topbar .left`，「我的家」标题右侧 |
| 图标 | ✈️ emoji，14px，opacity 0.8 |
| 触发条件 | mock `isCrossRegion: true` |
| hover | `title` 属性显示多语言提示文案 |
| 提示文案 | 「当前访问区域与注册区域不一致，可能影响使用」 |

---

## 3. 组件详述

### 3.1 useRegion（Composable）

**文件**：`src/composables/useRegion.js`

| 属性 | 说明 |
|------|------|
| 功能 | 封装域信息获取，暴露跨域状态 |
| 返回值 | `{ isCrossRegion }` — 响应式 ref（readonly） |
| 数据来源 | `fetchRegionInfo()` → `res.data.isCrossRegion` |
| 触发时机 | 组件 `onMounted` 时自动获取 |

### 3.2 i18n 工具

**文件**：`src/utils/i18n.js`

| Key | zh-CN | en |
|------|------|------|
| crossRegionTip | 当前访问区域与注册区域不一致，可能影响使用 | Your current region differs from your registered region |

---

## 4. 状态说明

| 状态 | 触发条件 | 展示内容 |
|------|------|------|
| 跨域 | `isCrossRegion === true` | 首页 ✈️ 图标，hover 提示 |
| 非跨域 | `isCrossRegion === false` | 无图标 |
| 接口失败 | fetch 异常 | 降级为 false，无图标 |

---

## 5. Mock 数据

**文件**：`src/mock/region.js`

```js
export function fetchRegionInfo() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: {
          regionCode: 'ap-southeast',
          regionName: '亚太（新加坡）',
          regionNameEn: 'Asia Pacific (Singapore)',
          serverHost: 'ap.example.com',
          assignedAt: '2025-01-15T10:30:00Z',
          isCrossRegion: true
        }
      })
    }, 300)
  })
}
```
