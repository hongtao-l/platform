# 全能AI A/B Test — AI-PRD 完整文档

## 修订记录

| 修订时间 | 修订内容 | 修订人 |
|------|------|------|
| 2026-05-16 | 汇总全流程产出，生成完整 AI-PRD | Kiro |

---

## 一、业务背景与目标

全能AI落地页已上线，包含两个套餐（¥9.9 全能AI / ¥19.9 全能AI Pro）。当前所有未开通用户看到的是同一个页面。运营需要通过 A/B Test 对比不同落地页版本的转化效果，用数据驱动页面优化决策。

**核心目标**：搭建完整的 A/B Test 系统，包含实验配置管理、用户分桶路由、数据采集看板三大模块。

---

## 二、功能总览

| 序号 | 模块 | 功能 | 实现端 |
|------|------|------|------|
| 1 | 实验管理 | 实验列表、创建/编辑、启停、删除 | Web 管理后台 |
| 2 | 分桶路由 | 根据 user_id + 分群 hash 返回对应变体 URL | 后端 API |
| 3 | 数据看板 | 变体曝光、转化率、收入对比、漏斗图 | Web 管理后台 |
| 4 | 埋点上报 | 页面曝光、套餐选择、支付点击、支付成功 | APP / H5 |

### 实验状态流转

```
待启动(pending) → 运行中(running) ⇄ 已暂停(paused)
                                  ↘ 已结束(ended) → 应用胜出(归档)
```

### 菜单结构（Web 管理后台）

侧边栏「运营管理」父菜单下包含：
- 商城位运营 → `/ops/mall`
- 推荐位运营 → `/ops/recommend`
- 用户分群 → `/ops/usergroup`
- **A/B Test → `/abtest`**

---

## 三、技术架构

### 3.1 整体架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  APP (Vue3)  │────▶│  后端 API     │────▶│  MySQL       │
│  carecam_pro │     │  /api/abtest/*│     │  experiments │
│  WebView H5  │     │  hash 分桶    │     │  experiment_ │
│  埋点上报    │     │  事件接收     │     │  events      │
└──────────────┘     └──────────────┘     └──────────────┘
       │                      ▲
       │                      │
       ▼                      │
┌──────────────┐     ┌──────────────┐
│  H5 落地页    │────▶│  Web 管理后台 │
│  变体A / 变体B│ 埋点 │  iot-platform│
│  埋点上报    │     │  Element Plus│
└──────────────┘     └──────────────┘
```

### 3.2 分桶路由算法

```
hash = crc32(user_id + experiment_key)
bucket = hash % 100

if bucket < traffic_split_A:
    return variant A URL
else:
    return variant B URL
```

- 同一 user_id + experiment_key 的 hash 结果不变 → 用户体验一致
- 同一分群内同时只能有一个运行中的实验

### 3.3 API 设计

**分桶接口**：

```
GET /api/abtest/config?user_id=xxx&experiment_key=xxx

返回（有实验时）:
{
  "experiment_key": "ai_landing_test_01",
  "variant": "A",
  "url": "https://xxx.com/landing/ai_v1.html",
  "segment": "new_user"
}

返回（无实验时）:
{
  "experiment_key": null,
  "variant": "default",
  "url": "https://xxx.com/landing/ai_default.html",
  "segment": "new_user"
}
```

**实验管理接口**：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/abtest/list` | 实验列表 |
| GET | `/abtest/:id` | 实验详情 |
| POST | `/abtest` | 创建实验 |
| PUT | `/abtest/:id` | 编辑实验 |
| PUT | `/abtest/:id/status` | 启停实验 |
| POST | `/abtest/:id/apply-winner` | 应用胜出变体 |
| GET | `/abtest/:id/dashboard` | 看板数据 |
| DELETE | `/abtest/:id` | 删除实验 |

**埋点接口**：

```
POST /api/abtest/event
Content-Type: application/json

Body: { event_type, user_id, experiment_key, variant, segment, plan_type, plan_price, order_id, timestamp }
```

### 3.4 数据库设计

**experiments（实验表）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 实验名称 |
| key | VARCHAR(50) | 唯一标识，如 `ai_landing_test_01` |
| segment | VARCHAR(50) | 目标分群，`all` = 全部用户 |
| variant_a_url | VARCHAR(500) | 变体A H5地址 |
| variant_b_url | VARCHAR(500) | 变体B H5地址 |
| traffic_split | INT | A占比（默认50） |
| status | ENUM | pending / running / paused / ended |
| winner | ENUM | A / B / none |
| created_at | DATETIME | 创建时间 |
| started_at | DATETIME | 启动时间 |
| ended_at | DATETIME | 结束时间 |

**experiment_events（埋点事件表）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| experiment_key | VARCHAR(50) | 实验标识 |
| user_id | VARCHAR(100) | 用户ID |
| variant | VARCHAR(10) | A / B |
| segment | VARCHAR(50) | 分群 |
| event_type | VARCHAR(50) | 事件类型 |
| plan_type | VARCHAR(20) | 套餐类型（可空） |
| price | DECIMAL | 价格（可空） |
| order_id | VARCHAR(100) | 订单ID（可空） |
| created_at | DATETIME | 事件时间 |

---

## 四、APP 端实现（carecam_pro）

### 4.1 落地页入口改造

APP 端加载全能AI落地页时，先调后端分桶接口拿变体URL，再以 WebView 加载 H5。

```
用户点击进入全能AI
    ↓
APP 调用 GET /api/abtest/config?user_id=xxx
    ↓
取到 variant + url
    ↓
WebView 加载 url（带参数: ?user_id=xxx&experiment_key=xxx&variant=X&segment=xxx）
    ↓
H5 页面解析 URL 参数，执行埋点上报
```

### 4.2 H5 端参数解析与埋点上报

H5 通过 URL query 获取实验信息：

```
https://xxx.com/landing/ai_v2.html?user_id=usr_123456&experiment_key=ai_landing_test_01&variant=B&segment=new_user
```

```js
// H5 页面加载时解析参数
const params = new URLSearchParams(location.search)
const userInfo = {
  user_id: params.get('user_id'),
  experiment_key: params.get('experiment_key'),
  variant: params.get('variant'),
  segment: params.get('segment')
}

// 页面加载完成时上报 experiment_view
fetch('/api/abtest/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'experiment_view',
    ...userInfo,
    page_url: location.href,
    timestamp: Date.now()
  })
})
```

---

## 五、Web 管理后台实现（iot-platform）

### 5.1 技术栈

- Vue 3 + Vite + JavaScript
- Element Plus 组件库
- SCSS + CSS 变量体系
- Vue Router 路由

### 5.2 路由注册

在 `iot-platform/src/router/index.js` 中添加：

```js
{
  path: '/abtest',
  name: 'AbTest',
  component: () => import('@/views/abtest/list.vue'),
  meta: { title: 'A/B Test' }
},
{
  path: '/abtest/:id',
  name: 'AbTestDashboard',
  component: () => import('@/views/abtest/dashboard.vue'),
  meta: { title: '实验数据看板' }
}
```

### 5.3 API 封装

在 `iot-platform/src/api/index.js` 中新增：

```js
export const abtestApi = {
  getList(params) { return request.get('/abtest/list', params) },
  getDetail(id) { return request.get(`/abtest/${id}`) },
  create(data) { return request.post('/abtest', data) },
  update(id, data) { return request.put(`/abtest/${id}`, data) },
  delete(id) { return request.delete(`/abtest/${id}`) },
  changeStatus(id, status) { return request.put(`/abtest/${id}/status`, { status }) },
  applyWinner(id) { return request.post(`/abtest/${id}/apply-winner`) },
  getDashboard(id) { return request.get(`/abtest/${id}/dashboard`) }
}
```

### 5.4 实验列表页（`/abtest`）

**文件**：[iot-platform/src/views/abtest/list.vue](iot-platform/src/views/abtest/list.vue)

**页面组成**：
- 顶部：标题「实验列表」+ 右上角【创建实验】按钮
- 表格列：实验名称、实验Key、目标分群、变体A/B URL、流量分配、状态标签、创建时间、操作
- 操作按钮：编辑、暂停/恢复、数据、应用胜出、删除

**创建/编辑抽屉（560px 右侧滑出）**：

| 表单项 | 组件 | 说明 |
|------|------|------|
| 实验名称 | el-input | 如：全能AI落地页v1 vs v2 |
| 实验Key | el-input (monospace) | 唯一标识，编辑时 disabled |
| 目标分群 | el-select | all / new_user / high_value / active / silent |
| 变体A URL | el-input | H5 地址，等宽字体 |
| 变体B URL | el-input | H5 地址，等宽字体 |
| 流量分配 | el-slider (0-100) | 默认50，拖动调节 |
| 备注 | el-input (textarea) | 选填 |

**关键交互**：
- Key 验证：仅支持小写字母、数字、下划线
- 暂停/恢复：单点击直接执行
- 应用胜出：确认弹窗后写入默认配置
- 删除：需确认，不可撤销

### 5.5 数据看板页（`/abtest/:id`）

**文件**：[iot-platform/src/views/abtest/dashboard.vue](iot-platform/src/views/abtest/dashboard.vue)

**页面组成**：

```
┌─────────────────────────────────────────────┐
│ 状态栏: [运行中] 分群/流量/天数  [停止实验]    │
├─────────────────────────────────────────────┤
│ 指标卡片行 (4列)                              │
│ [曝光UV A vs B] [选择率] [转化率] [总收入]     │
├─────────────────────────────────────────────┤
│ 转化漏斗对比 + 柱状图                          │
│ A: 曝光1240→选择380→支付52  转化4.2%         │
│ B: 曝光1180→选择420→支付78  转化6.6%  ★     │
├─────────────────────────────────────────────┤
│ 胜出横幅 (实验结束时显示)                       │
│ ★ 变体B 胜出，转化率+57.1%  [应用胜出变体]    │
└─────────────────────────────────────────────┘
```

**4 个指标卡片**，每个显示 A vs B 两个数值 + 差异百分比（绿色上升/红色下降）。

**转化漏斗对比**：左右两列展示完整漏斗（曝光 → 选择 → 支付点击 → 支付成功），胜出变体列高亮蓝色边框。

**柱状图**：CSS 实现的简单柱状图，A灰色 / B蓝色，4组柱子对应漏斗4步。

**胜出横幅**：绿色背景，显示胜出变体 + 转化率对比 + 提升幅度 + 应用按钮。

### 5.6 Layout 菜单改造

侧边栏新增「运营管理」父级菜单，点击可展开/收起子菜单项。A/B Test 作为子菜单项放在「运营管理」下。

**展开/收起交互**：
- 父菜单 title 右侧有箭头图标，展开时箭头向下
- 收起时箭头旋转 -90°，子菜单 `max-height: 0` 隐藏
- 当前路由匹配子菜单时，父菜单自动展开

**实现要点** ([iot-platform/src/components/Layout/index.vue](iot-platform/src/components/Layout/index.vue))：

```js
// 菜单结构
const menuList = ref([
  { title: '工作台', path: '/dashboard', icon: House },
  { title: '产品管理', path: '/product', icon: Box },
  {
    title: '运营管理',
    icon: Operation,
    children: [
      { title: '商城位运营', path: '/ops/mall', icon: ShoppingCart },
      { title: '推荐位运营', path: '/ops/recommend', icon: Star },
      { title: '用户分群', path: '/ops/usergroup', icon: UserFilled },
      { title: 'A/B Test', path: '/abtest', icon: DataAnalysis }
    ]
  }
])

// 父菜单展开状态管理
const expandedMenus = reactive(
  Object.fromEntries(
    menuList.value
      .filter(m => m.children)
      .map(m => [m.title, isChildActive(m.children)])
  )
)

const toggleParent = (title) => {
  expandedMenus[title] = !expandedMenus[title]
}
```

---

## 六、运营数据看板指标

详见 [全能AI_ABTest_运营看板指标.md](全能AI_ABTest_运营看板指标.md)

### 6.1 实验概览指标（看板顶部卡片）

| 指标 | 计算公式 | 统计周期 |
|------|------|------|
| 总曝光 UV | COUNT(DISTINCT user_id) WHERE event_type='experiment_view' | 实验运行期间 |
| 总转化 UV | COUNT(DISTINCT user_id) WHERE event_type='pay_success' | 实验运行期间 |
| 整体转化率 | 总转化UV / 总曝光UV × 100 | 实验运行期间 |
| 总收入 | SUM(price) WHERE event_type='pay_success' | 实验运行期间 |

### 6.2 变体对比指标

| 指标 | 计算口径 |
|------|------|
| 页面曝光 UV | 各变体 experiment_view 去重 |
| 套餐选择率 | plan_select UV / experiment_view UV |
| 支付点击率 | pay_click UV / experiment_view UV |
| 支付成功率 | pay_success UV / pay_click UV |
| 转化率 | pay_success UV / experiment_view UV |
| 客单价 | SUM(price) / pay_success UV |
| 总收入 | SUM(price) |

### 6.3 套餐维度指标

| 指标 | 计算口径 |
|------|------|
| Basic 选择占比 | basic 的 plan_select / 总 plan_select |
| Pro 选择占比 | pro 的 plan_select / 总 plan_select |
| Basic 转化率 | basic 的 pay_success / basic 的 plan_select |
| Pro 转化率 | pro 的 pay_success / pro 的 plan_select |

### 6.4 分群维度指标

| 指标 | 说明 |
|------|------|
| 各分群实验数量 | 当前运行中/已结束 |
| 分群转化率均值 | 该分群下所有实验平均转化率 |
| 分群收入贡献 | 该分群的总收入 |

---

## 七、APP 埋点方案

详见 [全能AI_ABTest_埋点方案.md](全能AI_ABTest_埋点方案.md)

### 7.1 事件总览

| 序号 | 事件名 | 触发时机 | 优先级 |
|------|------|------|------|
| 1 | `experiment_view` | H5落地页 DOM 加载完成，首屏可见 | P0 |
| 2 | `plan_select` | 用户点击选择套餐 | P0 |
| 3 | `pay_click` | 用户点击「立即开通」或支付按钮 | P0 |
| 4 | `pay_success` | 收到支付成功回调 | P0 |

### 7.2 事件参数定义

**公共参数**（所有事件必带）：

| 参数 | 类型 | 说明 |
|------|------|------|
| event_type | String | 事件类型 |
| user_id | String | 用户唯一标识 |
| experiment_key | String | 实验标识 |
| variant | String | 变体 A/B |
| segment | String | 用户分群 |
| timestamp | Number | 事件时间戳(ms) |

**事件特有参数**：

| 事件 | 特有参数 |
|------|------|
| experiment_view | page_url |
| plan_select | plan_type (basic/pro), plan_price |
| pay_click | plan_type, plan_price |
| pay_success | plan_type, plan_price, order_id |

### 7.3 H5 端实现

```js
// 1. 解析 URL 参数
const params = new URLSearchParams(location.search)
const userInfo = {
  user_id: params.get('user_id'),
  experiment_key: params.get('experiment_key'),
  variant: params.get('variant'),
  segment: params.get('segment')
}

// 2. 上报函数
function track(eventType, extra = {}) {
  fetch('/api/abtest/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: eventType,
      ...userInfo,
      ...extra,
      page_url: location.href,
      timestamp: Date.now()
    })
  })
}

// 3. 触发射
// 页面加载完成
window.addEventListener('DOMContentLoaded', () => track('experiment_view'))

// 点击套餐
document.querySelectorAll('.plan-card').forEach(card => {
  card.addEventListener('click', () => {
    track('plan_select', { plan_type: card.dataset.plan, plan_price: card.dataset.price })
  })
})

// 点击支付
document.querySelector('.pay-btn').addEventListener('click', () => {
  track('pay_click', { plan_type: selectedPlan, plan_price: selectedPrice })
})

// 支付成功回调
onPaySuccess((orderId) => {
  track('pay_success', { plan_type: selectedPlan, plan_price: selectedPrice, order_id: orderId })
})
```

### 7.4 去重策略

| 场景 | 策略 |
|------|------|
| 同一 user_id + event_type 重复上报 | 1 分钟内保留第一条 |
| pay_success 重复上报 | 同一 order_id 只保留第一条 |

### 7.5 数据校验规则

| 校验项 | 规则 | 异常处理 |
|------|------|------|
| 必填参数 | 所有 P0 事件必填参数不得为空 | 丢弃并告警 |
| 枚举值 | variant ∈ {A, B}，plan_type ∈ {basic, pro} | 标记异常值 |
| 价格校验 | plan_price ∈ {9.9, 19.9, 3.9}，超 ±20% 标记 | 标记异常 |
| 时序校验 | pay_success 时间 ≥ pay_click 时间 | 标记异常时序 |
| 流量均匀性 | max(A曝光, B曝光) / min(A曝光, B曝光) < 1.2 | 提示流量分配异常 |

---

## 八、文件清单

### 需求文档
- [`.kiro/skills/prd_full/全能AI_ABTest_PRD.md`](全能AI_ABTest_PRD.md) — 详细 PRD

### 设计文档
- [`.kiro/skills/prd_full/全能AI_ABTest_设计说明.md`](全能AI_ABTest_设计说明.md) — 设计规范
- [`design/platform/abtest-list.html`](../../../design/platform/abtest-list.html) — 实验列表原型
- [`design/platform/abtest-dashboard.html`](../../../design/platform/abtest-dashboard.html) — 数据看板原型

### 前端代码
- [`iot-platform/src/views/abtest/list.vue`](iot-platform/src/views/abtest/list.vue) — 实验列表页
- [`iot-platform/src/views/abtest/dashboard.vue`](iot-platform/src/views/abtest/dashboard.vue) — 数据看板页
- [`iot-platform/src/router/index.js`](iot-platform/src/router/index.js) — 路由配置
- [`iot-platform/src/api/index.js`](iot-platform/src/api/index.js) — API 封装
- [`iot-platform/src/components/Layout/index.vue`](iot-platform/src/components/Layout/index.vue) — 侧边栏菜单

### 数据分析文档
- [`.kiro/skills/prd_full/全能AI_ABTest_运营看板指标.md`](全能AI_ABTest_运营看板指标.md) — 看板指标定义
- [`.kiro/skills/prd_full/全能AI_ABTest_埋点方案.md`](全能AI_ABTest_埋点方案.md) — 埋点方案定义

### 本AI-PRD文档
- [`.kiro/skills/prd_full/全能AI_ABTest_AI_PRD完整文档.md`](全能AI_ABTest_AI_PRD完整文档.md) — 本文档，全流程汇总

---

## 九、后续待实现

| 项目 | 说明 |
|------|------|
| 后端 API | 分桶路由、实验管理、事件接收的完整后端实现 |
| APP 落地页入口改造 | 将 `/ai` 页面改为先调接口再决定加载内容 |
| H5 变体页面 | 两个版本的落地页 HTML（变体A/B）并接入埋点 |
| 菜单子项页面 | 商城位运营 `/ops/mall`、推荐位运营 `/ops/recommend`、用户分群 `/ops/usergroup` |
| 真实数据接入 | 看板页目前为模拟数据，需接入后端 API 实时数据 |

---

> **本文档为零上下文依赖的完整 AI-PRD。任何 AI 读取此文档后，均可完整理解并复现全能AI A/B Test 功能。**
