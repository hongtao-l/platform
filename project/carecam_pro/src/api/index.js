import request from '@/utils/request'

// 用户相关接口
export const userApi = {
  // 登录
  login: (data) => request.post('/user/login', data),
  
  // 获取用户信息
  getUserInfo: () => request.get('/user/info'),
  
  // 退出登录
  logout: () => request.post('/user/logout')
}

// 设备相关接口
export const deviceApi = {
  // 获取设备列表
  getDeviceList: (params) => request.get('/device/list', { params }),
  
  // 获取设备详情
  getDeviceDetail: (deviceId) => request.get(`/device/${deviceId}`),
  
  // 添加设备
  addDevice: (data) => request.post('/device/add', data),
  
  // 删除设备
  deleteDevice: (deviceId) => request.delete(`/device/${deviceId}`)
}

// 消息相关接口
export const messageApi = {
  // 获取消息列表
  getMessageList: (params) => request.get('/message/list', { params }),
  
  // 标记消息已读
  markAsRead: (messageId) => request.put(`/message/${messageId}/read`),
  
  // 获取未读消息数量
  getUnreadCount: () => request.get('/message/unread/count')
}
