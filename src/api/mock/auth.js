/**
 * 认证相关 Mock 数据
 */
import { mockResponse } from './index'

export function mockAuthApi() {
  return {
    /** 微信登录 */
    async wechatLogin(code) {
      if (!code || code.length < 3) {
        throw { code: 401, message: '登录凭证无效，请重新授权' }
      }
      return mockResponse({
        token: 'eyJhbGciOiJIUzI1NiJ9.mock_token_' + Date.now(),
        userInfo: {
          id: 1,
          openid: 'oABC123xyz_mock',
          unionid: null,
          nickname: null,
          avatarUrl: null,
          status: 1,
          lastLoginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          createdAt: '2026-06-01 10:00:00'
        }
      })
    },

    /** 刷新 Token */
    async refreshToken() {
      return mockResponse({
        token: 'eyJhbGciOiJIUzI1NiJ9.refreshed_' + Date.now()
      })
    }
  }
}
