/**
 * 认证 API — 微信登录 / Token 刷新
 */
import { USE_MOCK } from '@/api/mock'
import { mockAuthApi } from '@/api/mock/auth'
import request from '@/utils/request'

const realApi = {
  wechatLogin: (code) => request.post('/auth/wechat-login', { code }, { skipAuth: true }),
  refreshToken: ()     => request.post('/auth/refresh-token'),
}

const mock = mockAuthApi()

export const authApi = USE_MOCK ? mock : realApi
export default authApi
