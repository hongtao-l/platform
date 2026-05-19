# 全能AI落地页 A/B Test 系统 PRD

## 修订记录

| 修订时间 | 修订内容 | 修订人 |
|------|------|------|
| 2026-05-15 | 初稿 | Kiro |

## 产品设计

- 原型设计：Web管理后台实验配置页 + 数据看板页
- UI设计：复用 iot-platform 现有 Element Plus 组件风格

## 业务背景

全能AI落地页已上线，包含两个套餐（¥9.9 全能AI / ¥19.9 全能AI Pro）。当前所有未开通用户看到的是同一个页面。运营需要通过 A/B Test 对比不同落地页版本的转化效果，用数据驱动页面优化决策。

## 名词解释

| 名词 | 解释 |
|------|------|
| 实验 | 一次 A/B Test，包含变体A和变体B，在指定用户分群内运行 |
| 变体 | 实验中的一个版本，对应一个独立的 H5 落地页 URL |
| 分群 | 用户分组（新注册用户、高价值用户等），实验在分群内进行 |
| 分桶 | 通过 hash(user_id) 将用户分配到 A 或 B 变体 |
| 转化率 | 支付成功数 / 页面曝光数 |
| 置信度 | 统计显著性的衡量标准，≥95% 可下结论 |

## 功能列表概述

| 序号 | 模块 | 功能 | 功能说明 | 备注 |
|------|------|------|------|------|
| 1 | 实验管理 | 实验列表 | 展示所有实验，支持查看、启停、应用胜出 | Web后台 |
| 2 | 实验管理 | 创建实验 | 选择分群、配置变体URL、设置流量比例 | Web后台 |
| 3 | 实验管理 | 编辑实验 | 修改变体URL、流量比例（运行中不可改分群） | Web后台 |
| 4 | 分桶路由 | 用户分流 | 根据 user_id + 分群 hash，返回对应变体URL | 后端API |
| 5 | 数据看板 | 实验数据 | 各变体曝光、转化率、收入对比 | Web后台 |
| 6 | 埋点上报 | 事件追踪 | 页面曝光、套餐选择、支付成功 | APP/H5 |

## 业务流程图

### 实验全流程

```
创建实验
    ↓
配置变体A/B URL + 选分群 + 设流量比例
    ↓
启动实验
    ↓
用户请求落地页 → 后端分桶 → 返回变体URL
    ↓
APP加载H5 → H5上报埋点
    ↓
看板展示数据（实时）
    ↓
数据达标（≥500转化事件 + ≥7天 + 置信度≥95%）
    ↓
停止实验 → 应用胜出变体 → 全量生效
```

### 用户分流流程

```
APP请求: GET /api/abtest/config?user_id=xxx
    ↓
查用户所属分群
    ↓
该分群是否有运行中的实验？
    ├── 否 → 返回默认落地页URL
    └── 是 → hash(user_id + experiment_key) % 100
            ├── 0~49 → 返回变体A URL
            └── 50~99 → 返回变体B URL
```

## 详细功能说明

### 1. 实验管理（Web后台）

**页面路径：** 运营管理 / A/B Test

**实验列表字段：**

| 字段 | 说明 |
|------|------|
| 实验名称 | 实验标识 |
| 实验Key | 系统唯一标识，如 `ai_landing_v1v2` |
| 目标分群 | 全部用户 / 新注册用户 / 高价值用户 / 沉默用户 / ... |
| 变体A/变体B | 各变体H5 URL |
| 流量分配 | A/B 各占比 |
| 状态 | 运行中 / 已暂停 / 已结束 |
| 创建时间 | 实验创建时间 |
| 操作 | 启动、暂停、结束、应用胜出 |

**创建/编辑实验（侧边抽屉，宽度 560px）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 实验名称 | 文本输入 | 是 | 如：全能AI落地页v1 vs v2 |
| 实验Key | 文本输入 | 是 | 唯一标识，如 `ai_landing_test_01` |
| 目标分群 | 下拉选择 | 是 | 全部用户 / 新注册用户 / 高价值用户 / 沉默用户 |
| 变体A URL | 文本输入 | 是 | H5落地页地址 |
| 变体B URL | 文本输入 | 是 | H5落地页地址 |
| 流量分配 | 滑块/数字输入 | 是 | 默认 A 50% / B 50% |
| 备注 | 文本输入 | 否 | 实验目的和假设说明 |

**实验状态说明：**

| 状态 | 说明 | 可执行操作 |
|------|------|------|
| 待启动 | 新建未启动 | 启动、编辑、删除 |
| 运行中 | 正在分流 | 暂停、查看数据 |
| 已暂停 | 暂停分流，数据保留 | 恢复、结束 |
| 已结束 | 实验完成 | 应用胜出、查看报告 |

**应用胜出：**
- 点击「应用胜出」→ 将胜出变体的URL写入默认配置
- 确认后，所有用户立即看到胜出版本
- 实验记录归档，不可再恢复

### 2. 分桶路由（后端API）

**接口：** `GET /api/abtest/config`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | string | 是 | 用户唯一标识 |
| experiment_key | string | 否 | 指定实验Key，不传则自动匹配 |

**返回示例：**

```json
{
  "experiment_key": "ai_landing_test_01",
  "variant": "A",
  "url": "https://xxx.com/landing/ai_v1.html",
  "segment": "new_user"
}
```

**无实验时返回默认：**

```json
{
  "experiment_key": null,
  "variant": "default",
  "url": "https://xxx.com/landing/ai_default.html",
  "segment": "new_user"
}
```

**分桶算法：**

```
hash = crc32(user_id + experiment_key)
bucket = hash % 100

if bucket < 50: variant A
else: variant B
```

### 3. 数据看板（Web后台）

**页面路径：** 运营管理 / A/B Test / 实验详情 / 数据看板

**核心指标卡片：**

| 指标 | 变体A | 变体B |
|------|------|------|
| 页面曝光 (UV) | 1,240 | 1,180 |
| 套餐选择数 | 380 | 420 |
| 套餐选择率 | 30.6% | 35.6% |
| 支付成功数 | 52 | 78 |
| 转化率 | 4.2% | 6.6% ↑+57% |
| 总收入 | ¥xxx | ¥xxx |
| 客单价 | ¥xx | ¥xx |

**转化漏斗图：**

```
变体A:  曝光(1240) → 选择(380) → 支付(52)  转化率 4.2%
变体B:  曝光(1180) → 选择(420) → 支付(78)  转化率 6.6%  ← 胜出
```

**判断结论区域：**

| 条件 | 状态 |
|------|------|
| 每组转化事件 ≥ 500 | ✅ 已达到 / ❌ 未达到（当前A:52 B:78） |
| 运行天数 ≥ 7 | ✅ 已达到 / ❌ 未达到 |
| 置信度 ≥ 95% | ✅ 已达到 / ❌ 未达到 |
| **结论** | 数据不足，继续收集 / B变体显著优于A / 无显著差异 |

### 4. 埋点方案（H5端）

**H5页面自行上报以下事件：**

| 事件名 | 触发时机 | 上报参数 |
|------|------|------|
| `experiment_view` | 页面加载完成 | user_id, experiment_key, variant, segment |
| `plan_select` | 用户点击选择套餐 | user_id, experiment_key, variant, plan_type(basic/pro) |
| `pay_click` | 用户点击开通/支付按钮 | user_id, experiment_key, variant, plan_type, price |
| `pay_success` | 支付成功回调 | user_id, experiment_key, variant, plan_type, price, order_id |

**H5 通过 URL 参数获取信息：**

```
landing/ai_v1.html?user_id=xxx&experiment_key=ai_landing_test_01&variant=A&segment=new_user
```

## 数据库设计

### experiments（实验表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | varchar(100) | 实验名称 |
| key | varchar(50) | 唯一标识 |
| segment | varchar(50) | 目标分群，`all` 表示全部用户 |
| variant_a_url | varchar(500) | 变体A H5地址 |
| variant_b_url | varchar(500) | 变体B H5地址 |
| traffic_split | int | A占比（默认50，表示A/B各50%） |
| status | enum | pending / running / paused / ended |
| winner | enum | A / B / none |
| created_at | datetime | 创建时间 |
| started_at | datetime | 启动时间 |
| ended_at | datetime | 结束时间 |

### experiment_events（埋点事件表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| experiment_key | varchar(50) | 实验标识 |
| user_id | varchar(100) | 用户ID |
| variant | varchar(10) | A / B |
| segment | varchar(50) | 分群 |
| event_type | varchar(50) | 事件类型 |
| plan_type | varchar(20) | 套餐类型（可空） |
| price | decimal | 价格（可空） |
| order_id | varchar(100) | 订单ID（可空） |
| created_at | datetime | 事件时间 |

## 技术实现要点

### APP端（carecam_pro）

```
当前落地页(/ai)保持不变
    ↓
如需加载实验H5，改为:
  WebView加载: GET /api/abtest/config?user_id=xxx
  → 取到url → WebView打开H5
```

改造量：落地页入口改为先调接口拿URL，再决定加载原生页面还是WebView H5。

### 后端

- 分桶算法：crc32(user_id + experiment_key) % 100
- 同一 user_id + experiment_key 的hash结果不变 → 用户体验一致
- 实验暂停/结束后，该分群用户自动返回默认URL

### Web后台

- 复用 iot-platform 现有项目结构
- 新增页面：`/abtest`（实验列表）、`/abtest/:id`（数据看板）
- 组件：创建/编辑弹窗（560px侧边抽屉）
