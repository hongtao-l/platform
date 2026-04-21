// 全局配置
export default {
  // 应用名称
  appName: 'CareCam Pro',
  
  // 应用版本
  version: '1.0.0',
  
  // API 基础地址
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // 上传文件地址
  uploadUrl: import.meta.env.VITE_UPLOAD_URL || '/api/upload',
  
  // 图片预览地址前缀
  imageBaseUrl: import.meta.env.VITE_IMAGE_BASE_URL || '',
  
  // 分页配置
  pagination: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100]
  },
  
  // 存储键名
  storageKeys: {
    token: 'carecam_token',
    userInfo: 'carecam_user_info',
    language: 'carecam_language'
  }
}
