---
name: agreement-generator
description: "Generate privacy policy & terms of service (CN+EN, 4 files) for any APP. Trigger: [APP名] 协议"
argument-hint: "[APP名] 协议 —— 国内企业名称：XXX / 国内简称：XXX / 海外名称：XXX / 海外简称：XXX / 邮箱：XXX"
license: MIT
metadata:
  author: kiro-team
  version: "1.0.0"
---

# 协议生成器

为任意 APP 生成四份合规协议文件：隐私协议（中/英）+ 用户协议（中/英）。

## 触发方式

```
[APP名] 协议
```

## 输入信息

触发后，向用户确认以下 5 项信息（缺一不可）：

| 字段 | 说明 | 示例 |
|------|------|------|
| 国内企业名称 | 完整工商注册名 | 深圳市汇云通讯科技有限公司 |
| 国内企业简称 | 2-4字 | 汇云 |
| 海外企业名称 | 英文全称 | ShenZhen Huiyun Communication Technology Co., Ltd |
| 海外企业简称 | 英文短名 | HuiYun |
| 联系邮箱 | 客服/法务邮箱 | support@smartcloudcon.com |

> 不主动问注册地址。如用户提供了，可加入联系我们章节。

## 输出

生成 4 份文件到 `docs/agreements/[APP名]/`：

```
docs/agreements/[APP名]/
├── 隐私协议_中文.md
├── 用户协议_中文.md
├── 隐私协议_英文.md
└── 用户协议_英文.md
```

## 工作流程

### 1. 读取模板

先读取 `docs/agreements/wildeye/` 下 4 份文件作为结构参考。Wildeye 是无 AI 功能的摄像机安防 APP，如果目标 APP 有 AI 功能需相应调整隐私协议的数据收集章节。

### 2. 收集信息

向用户确认 5 项企业信息。如果用户一口气给了全部信息，直接进入第 3 步。

### 3. 生成文件

按以下要求逐一生成 4 份文件：

#### 必须保持的一致性

- 版本号：初始 `1.0`
- 日期：使用当天日期（格式 `YYYY年M月D日` / `Month D, YYYY`）
- 企业名称：中文文件用国内名称/简称，英文文件用海外名称/简称
- 联系邮箱：四份文件统一
- 管辖地：中文协议 → 深圳 + 中国法律；英文协议 → 国际通用

#### 必须差异化

- **开头不能模板化**：每份文件的开头段落要有不同的表达方式
  - 中文隐私协议：公司主体介绍式开头
  - 中文用户协议：协议缔结声明式开头
  - 英文隐私协议：公司+产品描述式开头
  - 英文用户协议：法律约束力声明式开头
- **结尾不能模板化**：联系我们章节的表达要各有不同
- 根据 APP 实际功能描述产品（不用 Wildeye 的摄像机描述）

#### 中文隐私协议 必含章节

1. 版本信息（blockquote 格式：`> 版本 / 发布/更新日期 / 生效日期`）
2. 开头（公司介绍 + 产品简介 + 用户确认）
3. 一、隐私声明
   - 1. 收集使用个人信息（核心功能 + 设备权限表格）
   - 2. 对外提供个人信息
   - 3. 个人信息主体权利
   - 4. 第三方 SDK 信息（根据 APP 实际技术栈填写）
   - 5. 个人信息的存储与保护（存储期限 + 境内存储 + 安全措施）
   - 6. 未成年人个人信息保护（14 周岁阈值）
4. 二、声明与承诺
5. 三、其他
6. 如何联系我们

#### 中文用户协议 必含章节

1. 版本信息（blockquote 格式）
2. 开头（协议缔结 + 适用范围 + 审阅提示）
3. 一、协议的接受、变更与补充
4. 二、账号密码与注册、登录
5. 三、用户个人信息保护（含隐私政策引用）
6. 四、[APP名]服务（服务内容 + 使用规范）
7. 五、[企业简称]的权利与义务
8. 六、违规处理
9. 七、有效期及终止
10. 八、免责声明
11. 九、知识产权
12. 十、附则（签订地深圳 + 中国法律 + 诉讼管辖）
13. 联系我们

#### 英文隐私协议 必含章节

1. Version header
2. Opening (company + product description + consent)
3. 1. Privacy Notice
   - 1.1 Collection and Use (core features + permissions table)
   - 1.2 Sharing
   - 1.3 User Rights
   - 1.4 Third-Party SDKs
   - 1.5 Data Retention and Security
   - 1.6 International Data Transfers
   - 1.7 Your Rights (GDPR-style detailed rights)
   - 1.8 Children's Privacy (age 16)
   - 1.9 Updates
4. 2. Legal Basis for Processing (GDPR)
5. 3. California Privacy Rights (CCPA/CPRA)
6. 4. Contact Us

#### 英文用户协议 必含章节

1. Version header
2. Opening (binding legal agreement statement)
3. 1. Acceptance, Modification, and Supplementation
4. 2. Account Registration and Login
5. 3. User Personal Information Protection
6. 4. [APP] Services
7. 5. Rights and Obligations of [Company]
8. 6. Violation Handling
9. 7. Term and Termination
10. 8. Disclaimers
11. 9. Intellectual Property
12. 10. General Provisions (Shenzhen + PRC law + exclusive jurisdiction)
13. Contact Us

### 4. 合规自检

生成完成后，逐项检查：

| # | 检查点 |
|---|--------|
| 1 | 版本/日期四份文件一致 |
| 2 | 企业名称中英文各文件正确 |
| 3 | 联系邮箱一致 |
| 4 | 中文隐私协议有未成年人保护（14周岁） |
| 5 | 中文隐私协议有数据存储期限和境内存储 |
| 6 | 英文隐私协议有 GDPR 和 CCPA 章节 |
| 7 | 英文隐私协议有 Children's Privacy（16岁） |
| 8 | 英文隐私协议有 International Data Transfers |
| 9 | 无 AI 相关内容（除非目标 APP 有 AI 功能） |
| 10 | 无模板占位符残留 |
| 11 | 开头结尾各有差异，非套模板 |
| 12 | 中文用户协议签订地深圳 + 中国法律 |

### 5. 报告

输出检查结果清单，标注通过/待修复项。

## 模板文件

Wildeye 的四份文件作为结构参考，位于 `docs/agreements/wildeye/`：

- `隐私协议_中文.md` — 中文隐私协议模板
- `用户协议_中文.md` — 中文用户协议模板
- `隐私协议_英文.md` — 英文隐私协议模板（含 GDPR/CCPA）
- `用户协议_英文.md` — 英文用户协议模板

> 参考时只借鉴结构，每份文件的开头结尾要根据 APP 特点重新撰写，避免模板化表述。

## 注意事项

- 如果 APP 有 AI/智能分析功能，隐私协议的数据收集章节需补充 AI 分析相关的数据处理说明
- 如果 APP 有云存储/付费订阅，用户协议的服务章节需补充付费条款
- 第三方 SDK 表格应根据 APP 实际技术栈填写，不可照搬 Wildeye 的 Flutter SDK
- 英文版自动包含 GDPR/CCPA 合规内容，中文版不需要
- 生成全程不询问"是否满意"等确认性问题，直接按要求产出 + 自检
