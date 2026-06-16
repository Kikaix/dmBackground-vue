/**
 * 宿舍管理 Mock 数据
 */
import { mockResponse } from './index'

let dormIdCounter = 3
let activeDormId = 1

const dormitories = [
  {
    id: 1,
    name: '和谐生活 402 室',
    leaderId: 1,
    invitationCode: 'HL-402-A',
    memberCount: 4,
    createdAt: '2026-06-01 10:00:00'
  },
  {
    id: 2,
    name: '求实楼 305 室',
    leaderId: 3,
    invitationCode: 'QS-305-B',
    memberCount: 3,
    createdAt: '2026-05-15 14:30:00'
  },
  {
    id: 3,
    name: '创新公寓 102 室',
    leaderId: 5,
    invitationCode: 'CX-102-C',
    memberCount: 2,
    createdAt: '2026-05-20 09:00:00'
  }
]

const allMembers = {
  1: [
    { userId: 1, nickname: '张三', avatarUrl: '', role: 'LEADER', joinedAt: '2026-06-01 10:00:00' },
    { userId: 2, nickname: '李四', avatarUrl: '', role: 'MEMBER', joinedAt: '2026-06-02 11:00:00' },
    { userId: 3, nickname: '王五', avatarUrl: '', role: 'MEMBER', joinedAt: '2026-06-03 09:00:00' },
    { userId: 4, nickname: '赵六', avatarUrl: '', role: 'MEMBER', joinedAt: '2026-06-04 15:00:00' }
  ],
  2: [
    { userId: 3, nickname: '王五', avatarUrl: '', role: 'LEADER', joinedAt: '2026-05-15 14:30:00' },
    { userId: 5, nickname: '孙七', avatarUrl: '', role: 'MEMBER', joinedAt: '2026-05-16 10:00:00' },
    { userId: 6, nickname: '周八', avatarUrl: '', role: 'MEMBER', joinedAt: '2026-05-18 08:00:00' }
  ],
  3: [
    { userId: 5, nickname: '孙七', avatarUrl: '', role: 'LEADER', joinedAt: '2026-05-20 09:00:00' },
    { userId: 7, nickname: '吴九', avatarUrl: '', role: 'MEMBER', joinedAt: '2026-05-21 12:00:00' }
  ]
}

export function mockDormitoryApi() {
  return {
    /** 我的宿舍列表 */
    async getList() {
      return mockResponse(dormitories)
    },

    /** 宿舍成员列表 */
    async getMembers(dormitoryId) {
      const members = allMembers[dormitoryId] || []
      return mockResponse(members.map(m => ({ ...m, scheduled: false })))
    },

    /** 宿舍详情（含成员） */
    async getInfo(dormitoryId) {
      const dorm = dormitories.find(d => d.id === dormitoryId)
      if (!dorm) throw { code: 404, message: '宿舍不存在' }
      const members = allMembers[dormitoryId] || []
      return mockResponse({ dormitory: dorm, members })
    },

    /** 切换到指定宿舍 */
    async switchDorm(dormitoryId) {
      const dorm = dormitories.find(d => d.id === dormitoryId)
      if (!dorm) throw { code: 404, message: '宿舍不存在' }
      activeDormId = dormitoryId
      const members = allMembers[dormitoryId] || []
      return mockResponse({ dormitory: dorm, members }, '切换成功')
    },

    /** 加入宿舍 */
    async join(invitationCode) {
      const dorm = dormitories.find(d => d.invitationCode === invitationCode)
      if (!dorm) throw { code: 404, message: '邀请码无效' }
      return mockResponse(null, '加入成功')
    },

    /** 退出宿舍 */
    async leave(dormitoryId) {
      return mockResponse(null, '已退出宿舍')
    },

    /** 刷新邀请码 */
    async refreshCode() {
      const newCode = 'HL-' + Math.random().toString(36).substring(2, 5).toUpperCase()
      const dorm = dormitories.find(d => d.id === activeDormId)
      if (dorm) dorm.invitationCode = newCode
      return mockResponse({ invitationCode: newCode }, '邀请码已刷新')
    },

    /** 修改宿舍名称 */
    async updateName(name) {
      const dorm = dormitories.find(d => d.id === activeDormId)
      if (dorm) dorm.name = name
      return mockResponse(null, '修改成功')
    },

    /** 踢出成员 */
    async kickMember(targetUserId) {
      return mockResponse(null, '已移出宿舍')
    },

    /** 转让宿舍长 */
    async transferLeader(dormitoryId, targetUserId) {
      return mockResponse(null, '转让成功')
    }
  }
}
