/**
 * 全局配置文件
 */

export default {
  // 应用名称
  appName: 'IoT 物联网管理平台',

  // API 基础路径
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',

  // Token 存储键名
  tokenKey: 'iot_token',

  // 分页配置
  pagination: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100]
  },

  // 表格配置
  table: {
    stripe: true,
    border: false,
    size: 'default'
  }
}
