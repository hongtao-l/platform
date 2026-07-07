# Kiro Project — 全局开发规范

> 本文件每次会话自动加载，优先级高于 memory。

## 关键词触发

### 「大需求」— 完整工作流

当用户消息包含关键词 **「大需求」** 时，**必须**先读取工作流定义文件，严格按 5 阶段顺序执行，**每阶段完成后等待用户确认才能进入下一阶段**：

> 工作流定义：`workflow.md`
> 各角色详细技能文件：`skills/{角色名}/SKILL.md`

阶段顺序（不可跳过或合并）：
1. 需求AI分析师 → 读取 `skills/requirement-analyst/SKILL.md` → 等确认
2. UI/UE AI设计师 → 读取 `skills/ui-designer/SKILL.md` → 等确认
3. 前端开发AI工程师 → 读取 `skills/frontend-developer/SKILL.md` → 等验证
4. 运营AI经理 → 读取 `skills/operations-manager/SKILL.md` → 等确认
5. PRD生成AI工程师 → 读取 `skills/prd-generator/SKILL.md` → 完成

**禁止行为**：
- 禁止一次性输出多个阶段的产物
- 禁止未经确认就进入下一阶段
- 禁止跳过任何阶段

### 小需求（无「大需求」关键词）

直接改代码，不走文档流程。
