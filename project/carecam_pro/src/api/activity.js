import request from '@/utils/request'

export const activityApi = {
  getActiveList(params) {
    return request.get('/activity/strategy/list', { params: { status: 'active', ...params } })
  }
}

export default activityApi
