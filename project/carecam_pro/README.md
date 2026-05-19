# CareCam Pro

智能监控 APP 项目，基于 Vue3 + Vite + Vant 构建。

## 技术栈

- **框架**: Vue 3 + Vite
- **UI 组件库**: Vant 4
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **网络请求**: Axios
- **样式**: SCSS + PostCSS (px 转 vw)

## 项目结构

```
carecam_pro/
├── public/              # 静态资源
├── src/
│   ├── api/             # 接口定义
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   ├── config/          # 配置文件
│   ├── router/          # 路由配置
│   ├── stores/          # 状态管理
│   ├── styles/          # 全局样式
│   ├── utils/           # 工具方法
│   └── views/           # 页面视图
├── .env                 # 环境变量
├── .env.development     # 开发环境变量
├── .env.production      # 生产环境变量
├── vite.config.js       # Vite 配置
├── postcss.config.js    # PostCSS 配置
└── package.json         # 项目配置
```

## 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 功能模块

- **首页**: 设备概览、快捷功能、消息通知
- **设备**: 设备列表、实时预览、设备管理
- **消息**: 消息中心、告警通知、系统消息
- **我的**: 个人中心、会员权益、设置

## 移动端适配

项目使用 `postcss-px-to-viewport` 进行移动端适配，设计稿宽度为 375px。

## 注意事项

1. 开发时请使用 Chrome 开发者工具的移动端模式
2. 建议使用真机调试
3. 注意 iOS 安全区域适配
