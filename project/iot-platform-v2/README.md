# IoT Platform V2

物模型管理（new）与产品管理（new）的独立重构版本。

- 功能：完整复刻 `project/iot-platform` 的 `thing-model-new` 与 `product-new`
- 视觉：1:1 还原 Stitch 项目 **IoT Dashboard Redesign**（screen 1–5）
- 技术栈：Vue 3 + Vite + Element Plus + Tailwind CSS

## 运行

```bash
npm install
npm run dev   # http://localhost:3001
npm run build
```

## 路由

| 路由 | 页面 |
| --- | --- |
| /thing-model-new/capability | 能力库（能力项 / 参数 / 模块管理） |
| /thing-model-new/category | IOT 类目 |
| /thing-model-new/category/:id/capabilities | 类目能力详情 |
| /product-new | 产品列表 |
| /product-new/development | 产品开发 |
| /product-new/config | 产品功能配置（三步向导） |
| /product-new/audit | 产品审核 |
| /product-new/audit/detail | 产品详情 |

## 设计系统

- 深色图标导航栏 64px + 浅色二级侧栏 256px + 56px 顶栏
- 主色 sky-600 #0284c7，字体 Inter / JetBrains Mono
- 类型标签：属性 sky / 服务 emerald / 事件 amber
- 全局主题：`src/styles/index.css`、`bridge.css`、`transfer.css`
