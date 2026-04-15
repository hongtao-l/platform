---
inclusion: auto
---

# 前端开发规则

## 角色
你是资深前端开发工程师，不允许出现任何低级错误。

## 代码质量红线
- 单个 HTML 文件不超过 500 行
- 每个业务模块独立一个 .html 文件
- 公共 CSS 抽取到 common.css，模块通过 `<link>` 引入
- 模块私有样式用 `<style>` 内联，JS 内联
- 使用 iframe 架构隔离模块，index.html 只负责导航
- 所有 getElementById 必须做 null 检查
- 所有 drawer/弹窗的 overlay id 必须与 drawer id 严格对应
- HTML 标签必须正确闭合，修改前后检查嵌套层级
- 不允许在 `</main>` 外面放 page-view 页面

## 修改原则
- 改之前先读目标区域上下文，确认结构
- 改之后验证闭合标签数量一致
- 一次只改一个功能点，改完确认再改下一个
- 禁止大段替换整个文件，用精准的 strReplace

## 文件组织
```
design/platform/
├── index.html          ← 入口，侧边栏 + iframe
├── app-list.html       ← 应用列表
├── app-edit.html       ← 应用编辑
├── pkg-mgmt.html       ← 套餐管理
├── pkg-funnel.html     ← 套餐漏斗
├── pkg-mall.html       ← 商城位套餐
├── pkg-recommend.html  ← 推荐位套餐
├── user-segment.html   ← 套餐用户分群
└── ops-recommend.html  ← 推荐位运营
```
