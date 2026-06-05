# 前端开发注意事项

> 本文件由 Claude Code 每次会话自动加载。开发前必须逐条检查。

## UI 规范

### 弹窗

- 弹窗覆盖样式**必须**用非 scoped 的 `<style lang="scss">` 块，否则无法穿透 Element Plus
- 弹窗 body 必须加 `padding-top: 20px`，避免顶部元素紧贴分割线
- 弹窗内描述文字放表单底部，不要放顶部

### 多语言输入

- **不要在输入框前加"中文名称："、"中文文案："等文字标签**，placeholder 提示即可
- 多语言切换使用地球 SVG icon + `.i18n-icon` 类，参考 `src/views/pkg/config.vue`

### 标签/徽标

- 类型标签（属性/服务/事件）使用紧凑 pill 风格，class 为 `.type-tag .type-prop | .type-svc | .type-evt`
- 数量徽标使用 `<el-tag size="small">`，可点击的加 `cursor: pointer`

### 间距

- 元素之间保持合理间距，不要顶着容器边缘
- 表格卡片统一使用 `.card` 包裹，padding 用 `var(--spacing-lg)`

## 构建后自检清单

每次 build 成功后必须检查：

1. **对齐** — 表单 label、按钮、表格列头是否对齐
2. **间距** — 弹窗顶部/底部、卡片内边距、元素间 gap 是否合理
3. **控件尺寸** — input、button、tag 大小是否一致
4. **样式一致性** — 同类元素是否复用相同的 CSS 变量和 class
5. **描述位置** — 描述/备注文字是否在表单底部而非顶部
