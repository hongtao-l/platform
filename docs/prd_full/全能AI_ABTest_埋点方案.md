# 全能AI A/B Test — APP埋点方案

## 修订记录

| 修订时间 | 修订内容 | 修订人 |
|------|------|------|
| 2026-05-16 | 初稿 | Kiro |
| 2026-05-16 | 对齐公司标准埋点规范 | Kiro |

---

## 一、事件列表

| 序号 | event_id | 触发时机 | event_type | 优先级 |
|------|------|------|------|------|
| 1 | `experiment_view` | H5落地页加载完成 | 0 (普通事件) | P0 |
| 2 | `plan_select` | 用户点击选择套餐 | 0 (普通事件) | P0 |
| 3 | `pay_click` | 用户点击开通/支付按钮 | 0 (普通事件) | P0 |
| 4 | `pay_success` | 支付成功回调 | 1 (带额外参数事件) | P0 |

---

## 二、公共属性（所有事件必带）

| 参数 | 类型 | 必填 | 说明 | 示例值 |
|------|------|------|------|------|
| event_type | String | 是 | 事件分类：0=普通事件，1=带额外参数事件，2=错误事件 | `"0"` |
| event_id | String | 是 | 事件ID | `"experiment_view"` |
| event_time | Int64 | 是 | 事件发生时间戳(ms) | `1715846400000` |
| user_id | String | 是 | 用户唯一标识 | `"usr_123456"` |
| session_id | String | 是 | 特有会话ID | `"sess_abc123"` |
| os_type | String | 是 | APP类型 | `"IOS"` / `"Android"` |
| app_version | String | 是 | APP版本号 | `"2.1.0"` |

---

## 三、事件详细定义

### 3.1 experiment_view — 页面曝光

**触发时机**：H5落地页 DOM 加载完成，内容首屏可见时上报。

**event_type**：`0` (普通事件)

**业务属性**：

| 参数 | 类型 | 必填 | 说明 | 示例值 |
|------|------|------|------|------|
| experiment_key | String | 是 | 实验标识 | `"ai_landing_test_01"` |
| variant | String | 是 | 变体标识 | `"A"` / `"B"` |
| segment | String | 是 | 用户分群 | `"new_user"` |
| page_url | String | 否 | H5页面地址 | `"https://xxx.com/landing/ai_v1.html"` |

**上报示例**：

```json
{
  "event_type": "0",
  "event_id": "experiment_view",
  "event_time": 1715846400000,
  "user_id": "usr_123456",
  "session_id": "sess_abc123",
  "os_type": "IOS",
  "app_version": "2.1.0",
  "experiment_key": "ai_landing_test_01",
  "variant": "B",
  "segment": "new_user",
  "page_url": "https://xxx.com/landing/ai_v2.html"
}
```

---

### 3.2 plan_select — 套餐选择

**触发时机**：用户点击套餐卡片选择套餐时上报。

**event_type**：`0` (普通事件)

**业务属性**：

| 参数 | 类型 | 必填 | 说明 | 示例值 |
|------|------|------|------|------|
| experiment_key | String | 是 | 实验标识 | `"ai_landing_test_01"` |
| variant | String | 是 | 变体标识 | `"A"` / `"B"` |
| segment | String | 是 | 用户分群 | `"new_user"` |
| plan_type | String | 是 | 选择的套餐 | `"basic"` / `"pro"` |
| plan_price | Number | 是 | 套餐价格 | `9.9` |

**上报示例**：

```json
{
  "event_type": "0",
  "event_id": "plan_select",
  "event_time": 1715846400000,
  "user_id": "usr_123456",
  "session_id": "sess_abc123",
  "os_type": "IOS",
  "app_version": "2.1.0",
  "experiment_key": "ai_landing_test_01",
  "variant": "B",
  "segment": "new_user",
  "plan_type": "pro",
  "plan_price": 19.9
}
```

---

### 3.3 pay_click — 支付点击

**触发时机**：用户点击「立即开通」或支付按钮时上报。

**event_type**：`0` (普通事件)

**业务属性**：

| 参数 | 类型 | 必填 | 说明 | 示例值 |
|------|------|------|------|------|
| experiment_key | String | 是 | 实验标识 | `"ai_landing_test_01"` |
| variant | String | 是 | 变体标识 | `"A"` / `"B"` |
| segment | String | 是 | 用户分群 | `"new_user"` |
| plan_type | String | 是 | 当前选中套餐 | `"basic"` / `"pro"` |
| plan_price | Number | 是 | 套餐价格 | `9.9` |

**上报示例**：

```json
{
  "event_type": "0",
  "event_id": "pay_click",
  "event_time": 1715846400000,
  "user_id": "usr_123456",
  "session_id": "sess_abc123",
  "os_type": "IOS",
  "app_version": "2.1.0",
  "experiment_key": "ai_landing_test_01",
  "variant": "B",
  "segment": "new_user",
  "plan_type": "pro",
  "plan_price": 19.9
}
```

---

### 3.4 pay_success — 支付成功

**触发时机**：收到支付成功回调后上报。

**event_type**：`1` (带额外参数事件)

**业务属性**：

| 参数 | 类型 | 必填 | 说明 | 示例值 |
|------|------|------|------|------|
| experiment_key | String | 是 | 实验标识 | `"ai_landing_test_01"` |
| variant | String | 是 | 变体标识 | `"A"` / `"B"` |
| segment | String | 是 | 用户分群 | `"new_user"` |
| plan_type | String | 是 | 购买的套餐 | `"basic"` / `"pro"` |
| plan_price | Number | 是 | 实际支付金额 | `9.9` |
| order_id | String | 是 | 订单号 | `"ORD20260516001"` |

**上报示例**：

```json
{
  "event_type": "1",
  "event_id": "pay_success",
  "event_time": 1715846400000,
  "user_id": "usr_123456",
  "session_id": "sess_abc123",
  "os_type": "IOS",
  "app_version": "2.1.0",
  "experiment_key": "ai_landing_test_01",
  "variant": "B",
  "segment": "new_user",
  "plan_type": "pro",
  "plan_price": 19.9,
  "order_id": "ORD20260516001"
}
```

---

## 四、H5 端实现方式

### 4.1 获取上报参数

H5 通过 URL query 参数获取实验信息 + 公共属性：

```
https://xxx.com/landing/ai_v2.html?user_id=usr_123456&session_id=sess_abc123&os_type=IOS&app_version=2.1.0&experiment_key=ai_landing_test_01&variant=B&segment=new_user
```

加载时解析：

```js
const params = new URLSearchParams(location.search)
const common = {
  user_id: params.get('user_id'),
  session_id: params.get('session_id'),
  os_type: params.get('os_type'),
  app_version: params.get('app_version'),
  experiment_key: params.get('experiment_key'),
  variant: params.get('variant'),
  segment: params.get('segment')
}
```

### 4.2 上报方式

通过后端 API 上报：

```
POST /api/abtest/event
Content-Type: application/json

Body: { event_type, event_id, event_time, user_id, session_id, os_type, app_version, ...业务属性 }
```

### 4.3 上报函数封装

```js
function track(eventId, eventType, bizAttrs = {}) {
  fetch('/api/abtest/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: String(eventType),
      event_id: eventId,
      event_time: Date.now(),
      ...common,
      ...bizAttrs
    })
  })
}

// 使用
window.addEventListener('DOMContentLoaded', () => {
  track('experiment_view', 0, { page_url: location.href })
})

document.querySelector('.plan-card').addEventListener('click', () => {
  track('plan_select', 0, { plan_type: 'pro', plan_price: 19.9 })
})

document.querySelector('.pay-btn').addEventListener('click', () => {
  track('pay_click', 0, { plan_type: 'pro', plan_price: 19.9 })
})

onPaySuccess((orderId) => {
  track('pay_success', 1, { plan_type: 'pro', plan_price: 19.9, order_id: orderId })
})
```

---

## 五、去重策略

| 场景 | 策略 |
|------|------|
| 同一 user_id + event_id 重复上报 | 1 分钟内保留第一条 |
| pay_success 重复上报 | 同一 order_id 只保留第一条 |

---

## 六、数据校验规则

| 校验项 | 规则 | 异常处理 |
|------|------|------|
| 必填参数 | 公共属性 7 项 + 业务属性不得为空 | 丢弃并告警 |
| event_type | ∈ {0, 1, 2} | 标记异常值 |
| 枚举值 | variant ∈ {A, B}，plan_type ∈ {basic, pro} | 标记异常值 |
| 价格校验 | plan_price ∈ {9.9, 19.9, 3.9}，超 ±20% 标记 | 标记异常 |
| 时序校验 | pay_success 的 event_time ≥ pay_click 的 event_time | 标记异常时序 |
| 去重 | user_id + event_id + 1min 窗口去重 | 保留第一条 |
| 重复订单 | pay_success 同一 order_id | 保留第一条 |

---

## 七、埋点测试验证

| 测试场景 | 预期结果 | 验证方式 |
|------|------|------|
| 打开落地页 | experiment_view 上报，公共属性齐全 | 抓包/控制台看日志 |
| 点击套餐卡片 | plan_select 上报，plan_type 正确 | 抓包验证参数 |
| 点击立即开通 | pay_click 上报 | 抓包验证参数 |
| 支付成功回调 | pay_success 上报，order_id 非空，event_type=1 | 抓包验证参数 |
| 重复进入页面 | experiment_view 1min内去重 | 验证只保留第一条 |
| 无实验时 | 不调用埋点接口 | 无异常日志 |
| 公共属性完整性 | 7 项公共属性均非空 | 逐项校验 |
