/**
 * 用户相关 Mock 数据
 */
import { mockResponse } from './index'

let notificationEnabled = true

export function mockUserApi() {
  return {
    /** 获取用户信息 */
    async getInfo() {
      return mockResponse({
        id: 1,
        openid: 'oABC123xyz_mock',
        nickname: '小明',
        avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        status: 1,
        notificationEnabled,
        activeDormitoryId: 1,
        lastLoginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        createdAt: '2026-06-01 10:00:00'
      })
    },

    /** 更新通知提醒开关 */
    async updateNotification(enabled) {
      notificationEnabled = enabled
      return mockResponse(null, enabled ? '通知已开启' : '通知已关闭')
    }
  }
}
