import axios from 'axios'
import { showToast } from 'vant'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 显示加载状态
    config.showLoading !== false && showToast({
      type: 'loading',
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })
    
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 关闭加载状态
    showToast.clear()
    
    const { data } = response
    
    // 业务状态码判断
    if (data.code === 0 || data.code === 200) {
      return data.data
    }
    
    // 业务错误
    showToast(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    // 关闭加载状态
    showToast.clear()
    
    // HTTP 错误处理
    let message = '网络错误，请稍后重试'
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '登录已过期，请重新登录'
          // 跳转登录页
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message = '没有权限访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = error.response.data?.message || '请求失败'
      }
    }
    
    showToast(message)
    return Promise.reject(error)
  }
)

export default request
