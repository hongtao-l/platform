# 物模型能力定义增加 array 数组类型 — 设计说明

> v1.0：在能力库编辑弹窗和参数弹窗中新增 array 数据类型的编辑 UI

## 页面结构

本需求在物模型能力库的能力编辑弹窗中新增 array 类型编辑区域：

```
物模型管理 → 能力库 (/thing-model/capability)
├── 标准能力 Tab → 能力池
│   └── 添加/编辑能力弹窗 (el-dialog, 560px)
│       └── 属性编辑器 → array 类型编辑区域 ← 核心改动 A
│           ├── 元素类型下拉 (Int / String / Struct)
│           ├── 最大长度 InputNumber
│           └── struct 字段列表编辑 (elementType=Struct 时显示)
│               ├── 字段列表 item (名称 / 标识符 / 数据类型摘要 / 编辑 / 删除)
│               └── 添加字段按钮 → 打开参数弹窗
│
├── 标准能力 Tab → 事件库
│   └── 添加/编辑事件弹窗 → 出参编辑 → 参数弹窗
│       └── 参数弹窗 → array 类型编辑区域 ← 核心改动 B
│           ├── 元素类型下拉 (Int / String)
│           └── 最大长度 InputNumber
│
└── 自定义能力 Tab
    └── 添加/编辑能力弹窗 (复用上述逻辑)
```

---

## 布局详述

### 区域1: 能力弹窗 — 数组型编辑器

**触发条件**：添加/编辑属性型能力时，数据类型下拉选择「数组型」

**位置**：能力弹窗表单中，数据类型选择「数组型」后，替换原 enum/int/boolean/string 的编辑区域

**内容**：

| 配置项 | 控件 | 说明 |
|------|------|------|
| 元素类型 | el-select，100% 宽度 | 下拉选项：Int (数字) / String (字符串) / Struct (结构体) |
| 最大长度 | el-input-number，width 150px | min=1, max=1000, 默认 100 |
| 默认值 | el-input | placeholder「请输入默认值」 |

**elementType=Struct 时的额外区域**：

- **元素结构体字段**：el-form-item label 为「元素结构体字段」
- **字段列表**：`.param-list` 容器，每行为 `.param-item`：
  - 左侧 `.param-info`：字段名 (`.param-name`) + 标识符 + 数据类型摘要 (`.param-meta`)
  - 右侧：「编辑」text button + 「删除」text danger button
- **空态**：「暂无字段」提示
- **添加按钮**：`+ 添加字段` small button，打开参数弹窗（见区域2）

---

### 区域2: 参数弹窗 — Array 定义

**触发条件**：
1. 添加/编辑 struct 或 array\<struct\> 的字段 → 参数弹窗中数据类型选「Array」
2. 添加/编辑服务出参或事件出参 → 参数弹窗中数据类型选「Array」

**位置**：参数弹窗（el-dialog, 560px "添加参数" / "编辑参数"）表单中

**内容**：

| 配置项 | 控件 | 说明 |
|------|------|------|
| 元素类型 | el-select，100% 宽度 | 下拉选项：Int (数字) / String (字符串)。注：参数弹窗不支持 Struct |
| 最大长度 | el-input-number，width 150px | min=1, max=1000 |
| 默认值 | el-input | placeholder「请输入默认值（逗号分隔）」 |

**与能力弹窗 array 编辑的区别**：
- 参数弹窗 array 仅支持 int / string 两种 elementType
- 参数弹窗不支持 struct 元素（struct 字段的结构体在能力弹窗层处理）

---

### 区域3: 列表展示适配

**能力池表格**（已适配，无改动）：

| 列 | array 类型的展示 |
|------|------|
| 数据类型 | `dataTypeLabel()` 返回「数组型」 |
| 数据定义 | `dataDefDetail()` 返回格式：`元素{Int/String/Struct}, 最大{N}项` |

**参数列表**（能力弹窗 / 参数弹窗内的参数预览）：

| 列 | array 类型展示 |
|------|------|
| 数据类型 | `paramTypeLabel()` 返回「Array」 |
| 描述 | 展示 elementType 和 maxLength 摘要 |

---

### 状态说明

| 状态 | 触发条件 | 展示内容 |
|------|------|------|
| 正常态 — 选择 Int/String | 数据类型=数组型，元素类型=Int 或 String | 元素类型下拉 + 最大长度 + 默认值输入框 |
| 正常态 — 选择 Struct | 数据类型=数组型，元素类型=Struct | 元素类型下拉 + 最大长度 + 字段列表 + 添加字段按钮 |
| 空态 — struct 无字段 | 元素类型=Struct 且字段列表为空 | 「暂无字段」占位文字 |
| 空态 — 参数无出参 | 服务/事件出参列表为空 | 「暂无数据」占位 |
| 边界态 — 最小值 | maxLength = 1 | InputNumber 减号置灰 |
| 边界态 — 最大值 | maxLength = 1000 | InputNumber 加号置灰 |
| 错误态 — 校验失败 | 必填项缺失 | Toast 提示具体缺失项 |

---

## 组件清单

| 组件 | 用途 | 所在区域 |
|------|------|------|
| 弹窗（Dialog） | 能力编辑容器 | 能力池 |
| 弹窗（Dialog） | 参数编辑容器 | 能力弹窗内 / 算法管理参数弹窗 |
| 下拉选择（Select） | 元素类型选择 | 数组型编辑器 |
| 数字输入（InputNumber） | 最大长度输入 | 数组型编辑器 |
| 文本输入（Input） | 默认值输入 | 数组型编辑器 |
| 按钮（Button） | 添加字段、编辑、删除 | struct 字段列表 |
| 图标（Edit / Delete） | 字段编辑/删除操作 | struct 字段列表 |

---

*文档版本: v1.0 | 创建日期: 2026-06-18*
