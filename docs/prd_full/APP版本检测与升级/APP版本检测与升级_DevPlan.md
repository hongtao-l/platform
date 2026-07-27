# APP版本检测与升级 — 前端开发计划

## 文件清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/views/about/index.vue` | 关于页面（App 信息 + 版本更新入口 + 法律链接） |
| `src/components/VersionUpgradePopup.vue` | 升级弹窗组件（复用 van-popup，自动/手动检测共用） |
| `src/api/app.js` | 版本检测 API（GET /api/app/version） |
| `src/composables/useVersionCheck.js` | 版本检测逻辑封装（请求、比较、弹窗频率控制） |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/router/index.js` | 新增 `/about` 路由，指向 About 页面 |
| `src/views/me/index.vue` | 「关于」菜单项添加 `@click` 跳转 `/about` |
| `src/App.vue` | `onMounted` 中调用自动版本检测；引入 VersionUpgradePopup 组件 |

## 实现要点

1. **API 层**：使用现有 `request.js` Axios 实例，新增 `src/api/app.js`，包含 `checkVersion()` 方法（目前 mock 返回）
2. **版本比较**：semver 逐段比较，`src/composables/useVersionCheck.js` 封装
3. **弹窗频率控制**：localStorage key `upgrade_dismissed`，格式 `{ "版本号": "日期" }`
4. **关于页面**：暗色主题，参考 settings 页面风格，菜单列表复用 Me 页面 `.menu-item` 样式
5. **升级弹窗**：参考 ActivityPopup.vue 的 van-popup 居中弹出模式
6. **不引入新依赖**：全部使用 Vant 4 已有组件（van-popup、van-icon、van-button、van-loading、showToast）
7. **Mock 数据**：因后端 API 不存在，使用 setTimeout 模拟，标注 `// TODO: 接入真实 API`

## 执行顺序

1. 创建 `src/api/app.js`
2. 创建 `src/composables/useVersionCheck.js`
3. 创建 `src/components/VersionUpgradePopup.vue`
4. 创建 `src/views/about/index.vue`
5. 修改 `src/router/index.js`
6. 修改 `src/views/me/index.vue`
7. 修改 `src/App.vue`
8. `npm run build` 验证
