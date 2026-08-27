---
name: agreement-generator
description: "Generate privacy policy & terms of service + APP introduction (国内中文 + 海外英文 + 海外中文翻译, 9 files) for any APP. Trigger: [APP名] 协议"
argument-hint: "[APP名] 协议 —— 主体中文名称：XXX / 主体中文简称：XXX / 注册地城市：XXX / 主体英文名称：XXX / 主体英文简称：XXX / 邮箱：XXX"
license: MIT
metadata:
  author: kiro-team
  version: "1.1.0"
---

# 协议生成器

为任意 APP 生成九份文件，按国内/海外分目录：国内三份（中文）+ 海外六份（英文三份 + 中文翻译三份），各含隐私协议、用户协议、APP 介绍。

## 触发方式

```
[APP名] 协议
```

## 输入信息

触发后，向用户确认以下 6 项信息（缺一不可）：

| 字段 | 说明 | 示例 |
|------|------|------|
| 主体中文名称 | 完整工商注册名（中文） | 深圳市汇云通讯科技有限公司 |
| 主体中文简称 | 2-4字 | 汇云 |
| 注册地城市 | 主体注册城市，用于附则签订地/管辖 | 深圳 |
| 主体英文名称 | 英文全称 | ShenZhen Huiyun Communication Technology Co., Ltd |
| 主体英文简称 | 英文短名 | HuiYun |
| 联系邮箱 | 客服/法务邮箱 | support@smartcloudcon.com |

> 注册地城市为必填（用于附则签订地/管辖）。完整注册地址仍不主动问，如用户提供了可加入联系我们章节。

## 输出

生成 9 份文件到 `docs/agreements/[APP名]/`，按国内/海外分目录（国内=中文；海外=英文 + 中文翻译）：

```
docs/agreements/[APP名]/
├── 国内/
│   ├── 隐私协议_中文.md
│   ├── 用户协议_中文.md
│   └── APP介绍_中文.md
└── 海外/
    ├── 隐私协议_英文.md
    ├── 用户协议_英文.md
    ├── APP介绍_英文.md
    ├── 隐私协议_中文.md   （英文版中文译文）
    ├── 用户协议_中文.md   （英文版中文译文）
    └── APP介绍_中文.md    （英文版中文译文）
```

## 工作流程

### 1. 读取模板

先读取 `docs/agreements/wildeye/` 下 4 份协议文件与 2 份 APP 介绍文件作为结构参考。各 APP 功能与 SDK 视为一致（摄像机管理 + 喂食器等标准能力），无需读目标项目源码；如用户额外说明含 AI 功能，再相应调整数据收集章节。

### 2. 收集信息

向用户确认 6 项企业信息。如果用户一口气给了全部信息，直接进入第 3 步。

### 3. 生成文件

按以下要求逐一生成 9 份文件：

#### 必须保持的一致性

- 版本号：初始 `1.0`
- 日期：使用当天日期（格式 `YYYY年M月D日` / `Month D, YYYY`）
- 企业名称：中文文件用中文名称/简称，英文文件用英文名称/简称
- 联系邮箱：九份文件统一
- 管辖地：用户协议（国内中文 + 海外英文）签订地均为 [注册地城市]；法律与法院随注册地而定——大陆城市 → 中国（大陆）法律 + 人民法院；香港 → 香港特别行政区法律 + 香港法院

#### 必须差异化（最高优先级）

- **全文禁止雷同**：即使内容、功能、SDK 与参考模板一致，正文每一段也必须在语法、句式、措辞、语序上有实质差异，禁止仅替换公司名/APP名。不同 APP 的协议要读起来像独立撰写。
- **开头不能模板化**：每份文件的开头段落要有不同的表达方式
  - 中文隐私协议：公司主体介绍式开头
  - 中文用户协议：协议缔结声明式开头
  - 英文隐私协议：公司+产品描述式开头
  - 英文用户协议：法律约束力声明式开头
- **结尾不能模板化**：联系我们章节的表达要各有不同
- **默认一致、例外随说明调整**：无特殊说明或其他要求时，功能与 SDK 与参考模板保持一致，无需读项目源码，差异只体现在文案上；若用户给出特殊说明（如功能差异、SDK 差异、含 AI 功能、云存储/付费订阅等），则结合特殊说明相应调整内容

#### 国内 必含内容（中文，3 份）

**隐私协议_中文.md 必含章节：**
1. 版本信息（blockquote 格式：`> 版本 / 发布/更新日期 / 生效日期`）
2. 开头（公司介绍 + 产品简介 + 用户确认）
3. 收集使用个人信息（核心功能 + 设备权限表格）
4. 对外提供个人信息
5. 个人信息主体权利
6. 第三方 SDK 信息（Flutter SDK 表格）
7. 个人信息的存储与保护（存储期限 + 境内存储 + 安全措施）
8. 未成年人个人信息保护（14 周岁阈值）
9. 声明与承诺
10. 其他
11. 如何联系我们

**用户协议_中文.md 必含章节：**
1. 版本信息（blockquote 格式）
2. 开头（协议缔结 + 适用范围 + 审阅提示）
3. 协议的接受、变更与补充
4. 账号密码与注册、登录
5. 用户个人信息保护（含隐私政策引用）
6. [APP名]服务（服务内容 + 使用规范）
7. [企业简称]的权利与义务
8. 违规处理
9. 有效期及终止
10. 免责声明
11. 知识产权
12. 附则（签订地[注册地城市] + 法律/法院随注册地：大陆或香港）
13. 联系我们

**APP介绍_中文.md 必含结构：**
1. 一级标题：`# [APP名] 简介`
2. 首段：一句话说明 APP 用途与适用场景
3. `## 详细介绍`：一段完整介绍，覆盖「配网绑定 + 远程查看/回放 + 告警通知 + 附加能力（如夜视/分享/多设备管理/智能喂食）」等核心能力
4. 长度与结构参考 `docs/agreements/wildeye/APP介绍_中文.md`；文案需差异化，不照搬

#### 海外 必含内容（英文 3 份 + 中文翻译 3 份）

**隐私协议_英文.md 必含章节：**
1. Version header
2. Opening (company + product description + consent)
3. Information We Collect（账号信息 / 设备与视频数据 / 智能喂食器数据 / 通知与剪贴板 / 设备权限表格）
4. How We Use and Share Information
5. Third-Party SDKs（Flutter SDK 表格）
6. Data Storage, Security, and Retention
7. International Data Transfers
8. Your Rights and Choices（GDPR 风格详细权利：access/rectification/erasure/restriction/portability/objection/withdrawal）
9. Legal Basis for Processing (GDPR)
10. California Privacy Rights (CCPA/CPRA)
11. Children's Privacy（16 岁）
12. Updates to This Policy
13. Contact Us

**用户协议_英文.md 必含章节：**
1. Version header
2. Opening (binding legal agreement statement)
3. Acceptance, Changes, and Additions to These Terms
4. Account Registration and Security
5. Protection of Your Personal Information（含隐私政策引用）
6. [APP] Services
7. [Company]'s Rights and Obligations
8. Handling of Violations
9. Term and Termination
10. Disclaimers
11. Intellectual Property
12. General Provisions ([注册地城市] + governing law/court per registration location)
13. Contact Us

**APP介绍_英文.md 必含结构：**
1. 一级标题：`# [APP名] Introduction`
2. 首段：一句话说明 APP 用途与适用场景
3. `## Detailed Introduction`：一段完整介绍，覆盖核心能力
4. 参考 `docs/agreements/wildeye/APP介绍_英文.md`；文案需差异化

**海外中文翻译（海外目录下 `_中文.md`，共 3 份）：**
- 将三份英文文件逐句忠实译为中文，逐段对应英文原文，不删改内容
- 标题后标注「（中文译本）」，并在版本信息下加 blockquote 免责说明：本文档为英文版的中文译文，仅供参考；如中英文版本存在不一致，以英文版本为准
- 翻译件不套用国内文件的措辞，直接对应英文原文逐句翻译

### 4. 合规自检

生成完成后，逐项检查：

| # | 检查点 |
|---|--------|
| 1 | 版本/日期九份文件一致 |
| 2 | 企业名称中英文各文件正确 |
| 3 | 联系邮箱一致 |
| 4 | 国内隐私协议有未成年人保护（14周岁） |
| 5 | 国内隐私协议有数据存储期限和境内存储 |
| 6 | 海外英文隐私协议有 GDPR 和 CCPA 章节 |
| 7 | 海外英文隐私协议有 Children's Privacy（16岁） |
| 8 | 海外英文隐私协议有 International Data Transfers |
| 9 | 无 AI 相关内容（除非目标 APP 有 AI 功能） |
| 10 | 无模板占位符残留 |
| 11 | 开头结尾各有差异，非套模板 |
| 12 | 国内用户协议签订地为[注册地城市]，法律/法院与注册地匹配（大陆或香港） |
| 13 | APP介绍 中英文各一份，标题格式正确 |
| 14 | 全文（含正文各段）与参考模板语法/句式/措辞不雷同 |
| 15 | 海外中文翻译逐段对应英文原文，且含免责说明（以英文为准） |

### 5. 报告

输出检查结果清单，标注通过/待修复项。

## 模板文件

Wildeye 的六份文件作为结构参考，位于 `docs/agreements/wildeye/`：

- `隐私协议_中文.md` — 中文隐私协议模板
- `用户协议_中文.md` — 中文用户协议模板
- `隐私协议_英文.md` — 英文隐私协议模板（含 GDPR/CCPA）
- `用户协议_英文.md` — 英文用户协议模板
- `APP介绍_中文.md` — 中文 APP 介绍模板
- `APP介绍_英文.md` — 英文 APP 介绍模板

> 参考时只借鉴结构与章节清单，全文（含开头结尾）都要重新撰写，禁止雷同。

## 注意事项

- 默认按「功能/SDK 一致 + 文案差异化」输出；仅当用户额外给出特殊说明（功能差异、SDK 差异、AI、云存储/订阅等）时，才结合说明调整相应章节
- 如果 APP 有 AI/智能分析功能，隐私协议的数据收集章节需补充 AI 分析相关的数据处理说明
- 如果 APP 有云存储/付费订阅，用户协议的服务章节需补充付费条款
- 第三方 SDK 清单与参考模板保持一致（Flutter SDK），无需因项目而异，只改写文案
- 海外英文版自动包含 GDPR/CCPA 合规内容，国内中文版不需要；海外中文翻译为英文版译文，故同样含 GDPR/CCPA
- 生成全程不询问"是否满意"等确认性问题，直接按要求产出 + 自检
