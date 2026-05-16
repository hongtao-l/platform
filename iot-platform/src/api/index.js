/**
 * API 接口统一导出
 */

import request from '@/utils/request'

// 用户相关接口
export const userApi = {
  // 登录
  login(data) {
    return request.post('/user/login', data)
  },

  // 登出
  logout() {
    return request.post('/user/logout')
  },

  // 获取用户信息
  getUserInfo() {
    return request.get('/user/info')
  }
}

// 产品相关接口
export const productApi = {
  // 获取产品列表
  getList(params) {
    return request.get('/product/list', params)
  },

  // 获取产品详情
  getDetail(id) {
    return request.get(`/product/${id}`)
  },

  // 创建产品
  create(data) {
    return request.post('/product', data)
  },

  // 更新产品
  update(id, data) {
    return request.put(`/product/${id}`, data)
  },

  // 删除产品
  delete(id) {
    return request.delete(`/product/${id}`)
  }
}

// A/B Test 实验相关接口
export const abtestApi = {
  // 获取实验列表
  getList(params) {
    return request.get('/abtest/list', params)
  },

  // 获取实验详情
  getDetail(id) {
    return request.get(`/abtest/${id}`)
  },

  // 创建实验
  create(data) {
    return request.post('/abtest', data)
  },

  // 更新实验
  update(id, data) {
    return request.put(`/abtest/${id}`, data)
  },

  // 删除实验
  delete(id) {
    return request.delete(`/abtest/${id}`)
  },

  // 启动/暂停/停止实验
  changeStatus(id, status) {
    return request.put(`/abtest/${id}/status`, { status })
  },

  // 应用胜出变体
  applyWinner(id) {
    return request.post(`/abtest/${id}/apply-winner`)
  },

  // 获取实验数据（看板）
  getDashboard(id) {
    return request.get(`/abtest/${id}/dashboard`)
  }
}

export default {
  userApi,
  productApi,
  abtestApi
}
