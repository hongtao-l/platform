# 推荐位埋点设计（快速落地版）

> 文档版本: v1.0  
> 更新日期: 2026-04-16  
> 目标: 最小化埋点，快速上线，支撑核心运营需求

---

## 一、设计原则

**少即是多** - 只埋最关键的事件，快速上线，后续迭代

| 原则 | 说明 |
|------|------|
| 最小化 | 只埋3个核心事件，覆盖核心链路 |
| 标准化 | 统一命名规范，降低沟通成本 |
| 可扩展 | 预留扩展字段，后续可加 |

---

## 二、核心事件（3个）

### 事件1：套餐曝光 (pkg_expose)

**触发时机**：套餐卡片展示在屏幕可视区域

**必填字段**（8个）：

| 字段 | 说明 | 示例 |
|------|------|------|
| user_id | 用户ID | U123456 |
| app_id | 应用ID | QX_PRO_001 |
| slot_code | 推荐位编码 | rec_slot_home |
| pkg_id | 套餐ID | REC_001 |
| strategy_id | 策略ID | STR_001 |
| funnel_level | 漏斗层级 | 1 |
| region | 区域 | domestic |
| ts | 时间戳 | 1713244800000 |

**上报示例**：
```json
{
  "event": "pkg_expose",
  "user_id": "U123456",
  "app_id": "QX_PRO_001",
  "slot_code": "rec_slot_home",
  "pkg_id": "REC_001",
  "strategy_id": "STR_001",
  "funnel_level": 1,
  "region": "domestic",
  "ts": 1713244800000
}
```

---

### 事件2：套餐点击 (pkg_click)

**触发时机**：用户点击套餐卡片

**必填字段**（8个 + 1个扩展）：

| 字段 | 说明 | 示例 |
|------|------|------|
| 基础8字段 | 同曝光事件 | - |
| expose_ts | 曝光时间戳 | 用于计算决策时长 |

**上报示例**：
```json
{
  "event": "pkg_click",
  "user_id": "U123456",
  "app_id": "QX_PRO_001",
  "slot_code": "rec_slot_home",
  "pkg_id": "REC_001",
  "strategy_id": "STR_001",
  "funnel_level": 1,
  "region": "domestic",
  "ts": 1713244850000,
  "expose_ts": 1713244800000
}
```

---

### 事件3：套餐购买 (pkg_buy)

**触发时机**：用户完成支付

**必填字段**（8个 + 3个扩展）：

| 字段 | 说明 | 示例 |
|------|------|------|
| 基础8字段 | 同曝光事件 | - |
| order_id | 订单ID | ORD_123 |
| amount | 支付金额 | 6.90 |
| click_ts | 点击时间戳 | 用于计算转化时长 |

**上报示例**：
```json
{
  "event": "pkg_buy",
  "user_id": "U123456",
  "app_id": "QX_PRO_001",
  "slot_code": "rec_slot_home",
  "pkg_id": "REC_001",
  "strategy_id": "STR_001",
  "funnel_level": 1,
  "region": "domestic",
  "ts": 1713244900000,
  "order_id": "ORD_123",
  "amount": 6.90,
  "click_ts": 1713244850000
}
```

---

## 三、核心指标（4个）

基于3个事件，计算4个核心指标：

| 指标 | 公式 | 说明 |
|------|------|------|
| **曝光量** | pkg_expose事件数 | 有多少人看到 |
| **点击率(CTR)** | pkg_click数 / pkg_expose数 | 内容吸引力 |
| **转化率(CVR)** | pkg_buy数 / pkg_click数 | 转化效果 |
| **GMV** | pkg_buy.amount求和 | 收入 |

---

## 四、分析维度（3个）

按以下维度拆解指标，定位问题：

| 维度 | 字段 | 分析场景 |
|------|------|----------|
| **策略** | strategy_id | 哪个策略效果好 |
| **套餐** | pkg_id | 哪个套餐受欢迎 |
| **漏斗层级** | funnel_level | 哪层转化差 |

---

## 五、快速落地步骤

### Step 1：定义埋点规范（1天）

- 确认3个事件的字段定义
- 与开发对齐上报格式

### Step 2：开发集成（3天）

**前端代码示例**：
```javascript
// 封装埋点函数
function track(event, data) {
  // 添加公共字段
  const baseData = {
    user_id: getUserId(),
    app_id: getAppId(),
    region: getRegion(),
    ts: Date.now()
  };
  
  // 上报
  fetch('/api/track', {
    method: 'POST',
    body: JSON.stringify({ event, ...baseData, ...data })
  });
}

// 曝光埋点
track('pkg_expose', {
  slot_code: 'rec_slot_home',
  pkg_id: 'REC_001',
  strategy_id: 'STR_001',
  funnel_level: 1
});

// 点击埋点
track('pkg_click', {
  slot_code: 'rec_slot_home',
  pkg_id: 'REC_001',
  strategy_id: 'STR_001',
  funnel_level: 1,
  expose_ts: exposeTimestamp
});

// 购买埋点
track('pkg_buy', {
  slot_code: 'rec_slot_home',
  pkg_id: 'REC_001',
  strategy_id: 'STR_001',
  funnel_level: 1,
  order_id: 'ORD_123',
  amount: 6.90,
  click_ts: clickTimestamp
});
```

### Step 3：数据验证（1天）

- 验证事件上报是否正常
- 验证字段值是否正确

### Step 4：搭建看板（2天）

**核心看板**：

| 看板名称 | 指标 |
|----------|------|
| 实时监控 | 今日曝光、点击、购买、GMV |
| 策略效果 | 各策略CTR、CVR对比 |
| 套餐排行 | 各套餐曝光、点击、转化排名 |

---

## 六、后续迭代方向

第一版上线后，根据业务需要逐步扩展：

| 迭代阶段 | 新增内容 | 预计时间 |
|----------|----------|----------|
| V1.1 | 增加用户分群字段 | +1天 |
| V1.2 | 增加浏览时长事件 | +2天 |
| V1.3 | 增加漏斗切换事件 | +2天 |
| V2.0 | 完整用户画像体系 | +1周 |

---

## 七、常见问题

**Q1：为什么只埋3个事件？**
> 覆盖核心链路（曝光→点击→购买），最小化开发成本，快速验证效果

**Q2：如何保证数据准确？**
> 上报前校验必填字段，关键字段（如order_id）做唯一性校验

**Q3：数据量太大怎么办？**
> 曝光事件可批量上报，点击和购买事件实时上报

**Q4：如何做归因分析？**
> 通过expose_ts和click_ts关联，计算用户从曝光到购买的完整路径

---

## 八、埋点字段速查表

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | string | 是 | 用户唯一标识 |
| app_id | string | 是 | 应用ID |
| slot_code | string | 是 | 推荐位编码 |
| pkg_id | string | 是 | 套餐ID |
| strategy_id | string | 是 | 策略ID |
| funnel_level | int | 是 | 漏斗层级(1-4) |
| region | string | 是 | 区域(domestic/overseas) |
| ts | long | 是 | 事件时间戳 |
| expose_ts | long | 点击事件必填 | 曝光时间戳 |
| click_ts | long | 购买事件必填 | 点击时间戳 |
| order_id | string | 购买事件必填 | 订单ID |
| amount | float | 购买事件必填 | 支付金额 |

---

> **一句话总结**：3个事件、8个核心字段、4个核心指标，1周快速上线
