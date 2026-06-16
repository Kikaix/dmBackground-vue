/**
 * 用户 API — 获取用户信息
 */
import { USE_MOCK } from '@/api/mock'
import { mockUserApi } from '@/api/mock/user'
import request from '@/utils/request'

const realApi = {
  getInfo: () => request.get('/user/info'),
  updateProfile: (data) => request.put('/user/profile', data),
  updateNotification: (enabled) => request.put('/user/notification', { enabled }),
}

const mock = mockUserApi()

export const userApi = USE_MOCK ? mock : realApi
export default userApi
