# 算法管理 — 页面设计说明

> 关联需求：[算法管理01ReqAnalysis.md](算法管理01ReqAnalysis.md)
> 设计端：IoT 管理后台（Web）
> 参考页面：`project/iot-platform/src/views/pkg/list.vue`（表格/搜索/分页风格），`project/iot-platform/src/views/product/development.vue`（弹窗模式）

---

## 1. 页面结构

```
IoT 管理后台 → 物模型管理
│
├── 能力库 (/thing-model/capability)        ← 现有页面
│   ├── Tab: 标准能力
│   │   ├── 能力池   ← 现有内容（全品类原子能力，含「算法原子能力」模块）
│   │   └── 事件库   ← 本需求新增子 Tab
│   │       ├── 搜索栏 + 表格 + 分页 + 空态
│   │       └── 事件编辑弹窗（560px）
│   └── Tab: 自定义能力   ← 现有，不变
│
├── 算法管理 (/thing-model/algorithm)        ← 本需求新增菜单
│   ├── 搜索栏（keyword + 查询/重置）
│   ├── 表格（AlgorithmID / 图标 / 名称 / 导入能力 / 关联事件 / 引用设备 / 操作）
│   ├── 分页（10/20/50 + 总条数）
│   └── 空态
│
└── IOT类目 (/thing-model/category)          ← 现有，不变
```

**菜单调整**：
- 移除「设备管理 → 算法管理」
- 物模型管理下新增「算法管理」子菜单（路由 `/thing-model/algorithm`）

---

## 2. 布局详述

### 2.1 算法管理页面

独立页面（`/thing-model/algorithm`），布局与项目现有列表页一致。

#### 搜索栏

| 属性 | 说明 |
|------|------|
| 位置 | 页面上方，左对齐 |
| 元素 | `el-input`（240px，placeholder「搜索 AlgorithmID / 名称」） + `el-button`「查询」+ `el-button`「重置」 |
| 交互 | 回车触发查询；重置清空搜索框并刷新列表 |

#### 表格

| 列 | 宽度 | 样式 |
|------|------|------|
| AlgorithmID | 180px | `<code>` 样式 |
| 图标 | 70px，居中 | 18px 字号 emoji/icon；无时 `—` |
| 算法名称 | min-width: 140px | `font-weight: 500`，展示中文名称 |
| 导入能力 | min-width: 260px | `el-tag size="small"` pill 排列（展示能力名称），最多 5 个 +「+N」；无能力时 `—` |
| 关联事件 | 100px，居中 | `el-tag size="small" type="success"` 显示数量；无时 `—` |
| 引用设备 | 100px，居中 | 数字 |
| 操作 | 140px，居中，fixed-right | 「编辑」+「删除」

#### 分页

| 属性 | 说明 |
|------|------|
| 位置 | 表格下方，`padding-top: var(--spacing-lg)`，`border-top: 1px solid var(--border-lighter)` |
| 元素 | 左侧文字「共 N 条记录」+ 右侧 `el-pagination`（sizes, prev, pager, next） |
| 可选项 | pageSize: 10 / 20 / 50，默认 20 |

---

### 2.2 事件库（能力库 → 标准能力 → 事件库子 Tab）

事件库作为能力池页面的子 Tab，嵌套在「标准能力」Tab 内。使用嵌套 `el-tabs` 实现。

#### 搜索栏

与算法管理搜索栏布局一致。

#### 表格

| 列 | 宽度 | 样式 |
|------|------|------|
| EventID | 110px | `<code>` 样式，同算法库 |
| 事件名称 | min-width: 150px | `font-weight: 500`，展示中文名称 |
| 备注 | min-width: 180px | `color: var(--text-secondary)`，无值时 `—` |
| 推送文案 | min-width: 200px | `color: var(--text-secondary)`，展示中文文案，无值时 `—` |
| 引用算法数 | 110px，居中 | `el-tag size="small" type="success"`；0 时灰色 `0` |
| 操作 | 140px，居中，fixed-right | 同算法库 |

#### 分页

同算法库分页配置。

---

### 2.3 添加/编辑算法弹窗

**触发**：点击「添加算法」按钮，或某行「编辑」按钮。

| 属性 | 说明 |
|------|------|
| 组件 | `el-dialog` |
| 宽度 | 720px |
| 关闭行为 | `close-on-click-modal={false}`，`destroy-on-close` |

**区域 1：基本信息**

| 字段 | 组件 | 说明 |
|------|------|------|
| AlgorithmID | `el-input` | 占位「PascalCase，如 motion_detection」 |
| 算法名称（多语言） | `el-input`（中文） + `el-button text`「多语言」 | 点击打开 LangDialog |
| 排序 | `el-input-number` | `:min="0"`，style="width:100%" |
| 图标 | `el-input` | 占位「icon name 或 emoji」 |

**区域 2：导入能力**

从能力池（`thing-model/capability`）中筛选并导入能力：

| 元素 | 说明 |
|------|------|
| 左侧面板 | 加载能力池全部能力列表，每行展示能力名称 + 能力类型 + 所属模块，点击选中 |
| 右侧面板 | 已导入的能力列表，展示标签样式，点击移除 |
| 筛选 | 顶部 `el-select` 按模块筛选（如「算法原子能力」） |
| 交互 | 点击在两面板间切换 |
| 空态 | 左侧空 →「能力池暂无能力」；右侧空 →「暂未导入能力」 |

面板规格同事件穿梭框。

**区域 3：关联事件**

从事件库关联事件：

| 元素 | 说明 |
|------|------|
| 左侧面板 | 加载事件库全部事件，每行展示 EventID + 中文名称，点击选中 |
| 右侧面板 | 已关联事件列表，点击移除 |
| 交互 | 点击切换 |

**区域 4：扩展属性**

| 字段 | 组件 | 说明 |
|------|------|------|
| 扩展属性 | `el-input type="textarea"`，`:rows="3"` | 选填，JSON 格式 |

**Footer**：`el-button`「取消」+ `el-button type="primary"`「确认创建/确认保存」

> 添加算法时先填基础信息，能力导入和事件关联可在创建时一并完成，也可创建后再编辑补充。

---

### 2.4 事件编辑弹窗

| 属性 | 说明 |
|------|------|
| 组件 | `el-dialog` |
| 宽度 | 560px |

#### 表单字段

| 字段 | 组件 | 说明 |
|------|------|------|
| EventID | `el-input-number` | `:min="1"`，style="width:100%"；**编辑时 disabled** |
| 事件名称（多语言） | `el-input`（中文） + `el-button text`「多语言」 | 中文必填 |
| 备注 | `el-input` | 占位「内部备注（选填）」 |
| 推送文案（多语言） | `el-input`（中文） + `el-button text`「多语言」 | 中文必填 |

#### Footer

同算法编辑弹窗。

---

### 2.5 多语言编辑弹窗（LangDialog）

| 属性 | 说明 |
|------|------|
| 组件 | `el-dialog` |
| 宽度 | 640px |
| `top` | 5vh |
| 顶部预览 | 浅色背景区域（`background: var(--primary-bg)`，`border: 1px solid var(--primary-light)`），展示中文内容 |
| 语言网格 | 2 列 `grid-template-columns: 1fr 1fr; gap: 14px 20px`，15 种非中文语言 |
| 语言条目 | label（13px + 语言代码 sup）+ `el-input size="small"` |
| 数据格式 | `{ "1": "中文简体", "2": "English", "3": "中文繁体", "4": "Français", "5": "日本語", "6": "Español", "7": "한국어", "8": "Deutsch", "9": "Italiano", "10": "Русский", "11": "Português", "12": "Tiếng Việt", "13": "ภาษาไทย", "14": "Türkçe", "15": "فارسی", "16": "Bahasa Indonesia" }` |
| 交互 | 打开时深拷贝当前数据；点击「确认」回写到父弹窗；点击「取消」丢弃修改 |

---

### 2.6 删除确认

| 属性 | 说明 |
|------|------|
| 组件 | `ElMessageBox.confirm` |
| 算法删除文案 | 「确定删除算法「XX」？」 |
| 事件删除文案 | 「确定删除事件「XX」？」 |
| 错误提示 | 后端返回引用数时，Toast「有 N 台设备使用该算法，不可删除」/「有 N 个算法引用该事件，不可删除」 |

---

## 3. 状态说明

| 状态 | 触发条件 | 展示内容 |
|------|------|------|
| 正常态 | 列表有数据 | 表格正常展示 |
| 空态 | 列表无数据 / 搜索无结果 | `el-empty description="暂无算法/事件"` + 快捷添加按钮 |
| 加载态 | 接口请求中 | 表格 `v-loading` 指令，展示 loading 遮罩；弹窗内 `v-loading` 覆盖表单 |
| 错误态 | 接口异常 | ElMessage 自动提示错误信息（request 拦截器统一处理） |
| ID 冲突 | 提交时返回 ID 重复 | ElMessage.error 提示「AlgorithmID 已存在」/「EventID 已存在」，弹窗不关闭 |
| 引用拦截 | 删除时存在引用 | ElMessage.warning 提示引用数量，不执行删除 |

---

## 4. 组件清单

| 组件 | 用途 | 所在区域 |
|------|------|------|
| `el-tabs` | 算法库/事件库切换 | 主页面 |
| `el-input` | 搜索框、文本输入 | 搜索栏、弹窗表单 |
| `el-input-number` | EventID、排序值 | 弹窗表单 |
| `el-button` | 查询/重置/添加/编辑/删除/多语言 | 多处 |
| `el-table` | 算法列表、事件列表、侦测子类型子表 | 主页面、算法弹窗 |
| `el-tag` | 能力标签、事件/设备引用数展示 | 表格列 |
| `el-checkbox` | 能力项勾选 | 算法弹窗 |
| `el-dialog` | 算法编辑、事件编辑、多语言编辑 | 弹窗 |
| `el-empty` | 空态展示 | 主页面 |
| `el-pagination` | 分页 | 主页面 |
| `el-form / el-form-item` | 表单布局 + 校验 | 弹窗 |
| `ElMessageBox.confirm` | 删除二次确认 | 删除操作 |

---

## 5. 样式规范

沿用 `iot-platform/src/styles/index.scss` 的 CSS 变量体系：

| 类别 | 变量 |
|------|------|
| 主色 | `--primary-color: #1890FF` |
| 文字 | `--text-primary` / `--text-regular` / `--text-secondary` / `--text-placeholder` |
| 背景 | `--bg-page: #F0F2F5` / `--bg-card: #FFFFFF` / `--bg-hover` / `--bg-elevated` |
| 边框 | `--border-lighter` / `--border-light` |
| 间距 | `--spacing-xs: 4px` ~ `--spacing-lg: 24px` |
| 字号 | `--font-xs: 12px` ~ `--font-lg: 16px` |
| 圆角 | `--radius-sm: 4px` / `--radius-md: 8px` |

所有组件使用 `<style lang="scss" scoped>`，禁止写死十六进制色值。
