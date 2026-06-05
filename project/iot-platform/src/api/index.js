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

// 套餐相关接口
export const pkgApi = {
  getList(params) {
    return request.get('/pkg/list', params)
  },
  getDetail(id) {
    return request.get(`/pkg/${id}`)
  },
  create(data) {
    return request.post('/pkg', data)
  },
  update(id, data) {
    return request.put(`/pkg/${id}`, data)
  },
  delete(id) {
    return request.delete(`/pkg/${id}`)
  },
  getCategories() {
    return request.get('/pkg/categories')
  },
  addCategory(data) {
    return request.post('/pkg/category', data)
  },
  updateCategory(id, data) {
    return request.put(`/pkg/category/${id}`, data)
  },
  deleteCategory(id) {
    return request.delete(`/pkg/category/${id}`)
  },
  getTags(type) {
    return request.get('/pkg/tags', { type })
  },
  addTag(data) {
    return request.post('/pkg/tag', data)
  },
  deleteTag(id) {
    return request.delete(`/pkg/tag/${id}`)
  }
}

// 活动位运营相关接口
export const activityApi = {
  // 活动策略
  getList(params) {
    return request.get('/activity/strategy/list', params)
  },
  getDetail(id) {
    return request.get(`/activity/strategy/${id}`)
  },
  create(data) {
    return request.post('/activity/strategy', data)
  },
  update(id, data) {
    return request.put(`/activity/strategy/${id}`, data)
  },
  delete(id) {
    return request.delete(`/activity/strategy/${id}`)
  },

  // 状态流转
  submitForReview(id) {
    return request.post(`/activity/strategy/${id}/submit`)
  },
  cancelReview(id) {
    return request.post(`/activity/strategy/${id}/cancel-review`)
  },
  review(id, data) {
    return request.post(`/activity/strategy/${id}/review`, data)
  },
  pause(id) {
    return request.post(`/activity/strategy/${id}/pause`)
  },
  resume(id) {
    return request.post(`/activity/strategy/${id}/resume`)
  },
  end(id) {
    return request.post(`/activity/strategy/${id}/end`)
  },
  copy(id) {
    return request.post(`/activity/strategy/${id}/copy`)
  },

  // 活动套餐关联
  getPackages(id) {
    return request.get(`/activity/strategy/${id}/packages`)
  },
  updatePackages(id, data) {
    return request.put(`/activity/strategy/${id}/packages`, data)
  },

  // 活动媒资上传
  uploadMedia(id, data) {
    return request.upload(`/activity/strategy/${id}/media`, data)
  }
}

// 算法管理 & 事件 — 当前使用 Mock 数据，见 src/views/iot/thing-model/data.js

export default {
  userApi,
  productApi,
  abtestApi,
  pkgApi,
  activityApi
}
