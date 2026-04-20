# IoT 物联网管理平台

基于 Vue3 + Vite + Element Plus 构建的物联网管理平台前端项目。

## 技术栈

- **框架**: Vue 3.4
- **构建工具**: Vite 5
- **UI 组件库**: Element Plus 2.6
- **状态管理**: Pinia 2.1
- **路由**: Vue Router 4.3
- **HTTP 请求**: Axios 1.6
- **样式**: SCSS

## 项目结构

```
iot-platform/
├── public/              # 静态资源
├── src/
│   ├── api/             # API 接口
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   ├── config/          # 配置文件
│   ├── router/          # 路由配置
│   ├── styles/          # 全局样式
│   ├── utils/           # 工具函数
│   └── views/           # 页面视图
├── .env                 # 环境变量
├── .env.development     # 开发环境变量
├── .env.production      # 生产环境变量
├── index.html           # 入口 HTML
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置
```

## 快速开始

### 安装依赖

```bash
cd iot-platform
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 功能模块

- **工作台**: 数据概览、快捷入口
- **产品管理**: 产品列表、功能点配置
- **设备管理**: 设备列表、状态监控
- **数据统计**: 数据分析、报表
- **系统设置**: 系统配置

## 开发规范

详见 `.kiro/steering/steering_rules.md`
