# 全能AI A/B Test — 运营分析文档

## 修订记录

| 修订时间 | 修订内容 | 修订人 |
|------|------|------|
| 2026-06-30 | 初稿：定义全能AI落地页A/B实验方案 | Kiro |

---

## 一、实验概述

### 1.1 实验背景

全能AI落地页是用户开通服务的核心转化节点。本期需对落地页进行 A/B Test，对比两个版本的转化效果，以数据驱动决策最终上线版本。

### 1.2 实验目标

- 对比变体A（对照组）与变体B（实验组）在落地页的转化效果
- 验证新版落地页在**入口点击 → 点击开通 → 支付成功**全链路上的表现
- 按海内外用户分别观察，确保结论在不同市场均有效

### 1.3 实验范围

| 维度 | 说明 |
|------|------|
| 实验页面 | 全能AI服务介绍开通页（落地页） |
| 覆盖用户 | 未开通全能AI的用户（已开通用户直接进入AI配置页，不走落地页） |
| 实验周期 | 建议 ≥ 7天，每组转化事件 ≥ 500 |

---

## 二、实验定义

### 2.1 实验 Key

| 属性 | 值 |
|------|------|
| 实验Key | `ai_landing_ab` |
| 实验名称 | 全能AI落地页A/B Test |
| 变体数量 | 2（A / B） |

### 2.2 变体定义

| 变体 | 标识 | 说明 |
|------|------|------|
| A（对照组） | `A` | 当前线上落地页版本 |
| B（实验组） | `B` | 新版落地页版本 |

> 变体A/B的具体页面内容由APP/H5实现，运营后台仅管理实验配置和流量分配。

### 2.3 分流规则

#### 2.3.1 分流算法

```
Hash(user_id + "ai_landing_ab") % 100 → 桶编号 0~99
```

#### 2.3.2 海内外独立分流

| 用户区域 | 判定条件 | A组桶区间 | B组桶区间 | A:B |
|------|------|------|------|------|
| 国内（CN） | country = "CN" | 0 ~ 49 | 50 ~ 99 | 50:50 |
| 海外（非CN） | country ≠ "CN" | 0 ~ 49 | 50 ~ 99 | 50:50 |

> 海内外分别独立分流，各自按 50:50 分配。同一用户+同一实验始终看到同一变体。

#### 2.3.3 分流条件

| 条件 | 规则 |
|------|------|
| 触发时机 | 用户进入落地页时实时计算 |
| 一致性保证 | Hash确定性：同 user_id + 同 experiment_key → 同变体 |
| 新用户 | 实验运行期间的新用户自动参与分流 |
| 暂停行为 | 暂停后所有用户返回变体A；恢复后继续按比例分流 |
| 默认兜底 | 分流接口超时/异常 → 返回变体A |

---

## 三、埋点方案

### 3.1 事件清单

| 事件ID | 事件名称 | 触发时机 | event_type | 优先级 |
|------|------|------|------|------|
| ab_landing_entry | 入口点击 | 用户从任意入口进入落地页，首屏可见 | 1（额外参数） | P0 |
| ab_landing_close | 点击关闭 | 用户点击关闭/返回按钮离开落地页 | 1（额外参数） | P0 |
| ab_activate_click | 点击开通 | 用户勾选协议后点击「立即开通」按钮 | 1（额外参数） | P0 |
| ab_pay_success | 支付成功 | 收到支付成功回调 | 1（额外参数） | P0 |
| ab_pay_fail | 支付失败 | 支付失败或用户取消支付 | 1（额外参数） | P0 |

### 3.2 公共参数（所有事件必带）

| 参数 | 类型 | 必填 | 说明 | 示例值 |
|------|------|------|------|------|
| event_type | String | 是 | 0=普通事件，1=额外参数事件，2=错误事件 | "0" |
| event_id | String | 是 | 事件ID（对应3.1中的事件ID） | "ab_landing_entry" |
| event_time | Int64 | 是 | 事件发生时间戳(ms) | 1716192000000 |
| user_id | String | 是 | 用户唯一标识 | "usr_123456" |
| session_id | String | 是 | 会话ID | "sess_abc123" |
| app_id | String | 是 | 应用ID | "app_xxx" |
| app_version | String | 是 | 应用版本号 | "2.1.0" |
| brand | String | 是 | 手机品牌 | "apple" |
| os_type | String | 是 | 系统类型 | "iOS" |
| os_version | String | 是 | 手机系统版本 | "17.0" |
| company_id | String | 是 | 用户的从属企业ID | "0000213ed0cdb8bc" |
| country | String | 是 | 国家 | "CN" |
| city | String | 是 | 城市 | "深圳" |

### 3.3 业务参数（按事件）

**ab_landing_entry**（入口点击）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| experiment_key | String | 是 | 实验标识：`ai_landing_ab` |
| variant | String | 是 | 分流结果：A / B |
| source | String | 是 | 入口来源：home_ai_btn（首页AI入口）/ msg_focus（消息页+关注）/ ai_search_inline（AI搜索内联引导）/ ai_daily_inline（AI日报内联引导） |

**ab_landing_close**（点击关闭）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| experiment_key | String | 是 | 实验标识：`ai_landing_ab` |
| variant | String | 是 | 分流结果：A / B |
| source | String | 是 | 入口来源（同 entry） |
| stay_duration | Number | 是 | 页面停留时长（秒） |
| has_plan_select | Boolean | 是 | 是否已选择套餐 |
| exit_point | String | 是 | 离开时页面位置：banner / plan / pay_method / intro / bottom |

**ab_activate_click**（点击开通）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| experiment_key | String | 是 | 实验标识：`ai_landing_ab` |
| variant | String | 是 | 分流结果：A / B |
| source | String | 是 | 入口来源（同 entry） |
| plan_type | String | 是 | 选中套餐：monthly / yearly |
| pay_method | String | 是 | 选中支付方式：wechat / alipay |

**ab_pay_success**（支付成功）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| experiment_key | String | 是 | 实验标识：`ai_landing_ab` |
| variant | String | 是 | 分流结果：A / B |
| source | String | 是 | 入口来源（同 entry） |
| plan_type | String | 是 | 购买套餐：monthly / yearly |
| pay_method | String | 是 | 支付方式：wechat / alipay |
| amount | Number | 是 | 实际支付金额（分） |
| order_id | String | 是 | 订单ID |

**ab_pay_fail**（支付失败）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| experiment_key | String | 是 | 实验标识：`ai_landing_ab` |
| variant | String | 是 | 分流结果：A / B |
| source | String | 是 | 入口来源（同 entry） |
| plan_type | String | 是 | 选中套餐：monthly / yearly |
| pay_method | String | 是 | 支付方式：wechat / alipay |
| fail_reason | String | 是 | 失败原因：insufficient_balance / user_cancel / network_error / other |

---

## 四、转化漏斗

### 4.1 主漏斗

```
入口点击 (ab_landing_entry)    100%
    ↓
曝光                           ~95%
    ↓
点击开通 (ab_activate_click)   ~35%
    ↓
支付成功 (ab_pay_success)      ~12%
```

### 4.2 指标定义

| 序号 | 指标名称 | 指标类型 | 计算方式 | 监控周期 |
|------|------|------|------|------|
| 1 | A/B 入口曝光UV | 行为 | COUNT(DISTINCT user_id) WHERE event=ab_landing_entry GROUP BY variant | 实时 |
| 2 | A/B 开通点击率 | 行为 | ab_activate_click UV / ab_landing_entry UV（按variant） | 日 |
| 3 | A/B 支付成功率 | 质量 | ab_pay_success UV / ab_activate_click UV（按variant） | 日 |
| 4 | A/B 端到端转化率 | 业务 | ab_pay_success UV / ab_landing_entry UV（按variant） | 日 |
| 5 | A/B 总收入 | 业务 | SUM(amount) WHERE event=ab_pay_success（按variant） | 日 |
| 6 | A/B 关闭率 | 行为 | ab_landing_close UV / ab_landing_entry UV（按variant） | 日 |
| 7 | A/B 平均停留时长 | 行为 | AVG(stay_duration)（按variant） | 日 |
| 8 | 流量均匀度 | 质量 | max(A_entry, B_entry) / min(A_entry, B_entry) | 日 |

### 4.3 分地区漏斗

| 漏斗节点 | CN — A | CN — B | 海外 — A | 海外 — B |
|------|------|------|------|------|
| 入口点击 | — | — | — | — |
| 曝光 | — | — | — | — |
| 点击开通 | — | — | — | — |
| 支付成功 | — | — | — | — |

---

## 五、胜出判定

### 5.1 判定条件

| 编号 | 条件 | 阈值 |
|------|------|------|
| C1 | 每组转化事件量 | ≥ 500（每组 ab_pay_success UV） |
| C2 | 运行天数 | ≥ 7天 |
| C3 | 置信度 | ≥ 95% |

### 5.2 结论展示

| 数据状态 | 结论 |
|------|------|
| 三项未全达标 | "数据不足，继续收集" |
| 三项达标，差异不显著 | "A/B无显著差异，任一变体均可" |
| 三项达标，B显著优于A | "★ 变体B胜出，转化率+XX%，建议全量应用" |
| 三项达标，A显著优于B | "★ 变体A胜出，转化率+XX%，建议保持现状" |

---

## 六、实验操作流程

### 6.1 APP前置条件

1. APP开发者内置实验Key `ai_landing_ab`
2. APP内置两个落地页变体（A: 当前版本, B: 新版本）
3. APP发版上线后，运营方可启动实验

### 6.2 实验生命周期

```
APP发版 → 创建实验 → 启动 → 运行中（≥7天） → 数据达标 → 声明胜出 → 全量应用 → APP下次发版收敛
```

### 6.3 运营操作

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 创建实验 | 填写：名称="全能AI落地页A/B Test"、Key=`ai_landing_ab`、A:B=50:50 |
| 2 | 启动实验 | 确认后分流开始生效 |
| 3 | 观察数据 | 每日查看A/B对比看板，监控流量均匀度 |
| 4 | 暂停/恢复 | 必要时可暂停（全部回A）或恢复 |
| 5 | 声明胜出 | 达标后选择胜出变体，全量切换 |
| 6 | 归档 | 实验结束，通知APP开发下次发版收敛 |

---

## 七、埋点测试验证

| 测试场景 | 预期结果 | 验证方式 |
|------|------|------|
| 国内用户进入落地页 | ab_landing_entry 上报，variant=A/B，country=CN | 抓包验证 |
| 海外用户进入落地页 | ab_landing_entry 上报，variant=A/B，country≠CN | 抓包验证 |
| 点击关闭按钮 | ab_landing_close 上报，含 stay_duration、exit_point | 抓包验证 |
| 选择套餐+支付方式+点击开通 | ab_activate_click 上报，含 plan_type、pay_method | 抓包验证 |
| 支付成功 | ab_pay_success 上报，order_id非空，event_type=1 | 抓包验证订单号 |
| 支付失败/取消 | ab_pay_fail 上报，fail_reason正确，event_type=2 | 抓包验证原因码 |
| 同一用户重复进入 | variant一致（Hash确定性） | 多次进入验证 |
| 公共参数完整性 | 13项公共参数均非空 | 逐项校验 |
| 去重 | 1min内重复上报仅保留首条 | 重复发送验证 |

---

> **本文档定义全能AI落地页A/B Test的实验配置、埋点方案和分流规则。APP端需在发版前内置实验Key和两个变体的落地页内容。**
