/**
 * 排班管理 Mock 数据
 */
import { mockResponse } from './index'

let idCounter = 10
const scheduleOrders = [
  { id: 1, dormitoryId: 1, userId: 1, sortOrder: 1 },
  { id: 2, dormitoryId: 1, userId: 2, sortOrder: 2 },
  { id: 3, dormitoryId: 1, userId: 3, sortOrder: 3 },
  { id: 4, dormitoryId: 1, userId: 4, sortOrder: 4 }
]

const today = new Date().toISOString().split('T')[0]
const schedules = [
  { id: 1, dormitoryId: 1, userId: 1, nickname: '阿强', avatarUrl: '', scheduleDate: today, timeSlot: '上午', remark: '今天值班', imageUrl: null, status: 'PENDING', createdAt: today + ' 08:00:00' },
  { id: 2, dormitoryId: 1, userId: 2, nickname: '小美', avatarUrl: '', scheduleDate: today, timeSlot: '', remark: '', imageUrl: null, status: 'COMPLETED', createdAt: today + ' 09:00:00' }
]

export function mockScheduleApi() {
  return {
    async getOrder(dormitoryId) {
      return mockResponse(scheduleOrders.filter(o => o.dormitoryId === dormitoryId))
    },

    async clearOrder(dormitoryId) {
      scheduleOrders.length = 0
      return mockResponse(null, '已清空排班顺序')
    },

    async addToOrder(dormitoryId, userIds) {
      const existingIds = new Set(scheduleOrders.map(o => o.userId))
      let maxOrder = scheduleOrders.length
      userIds.forEach(id => {
        if (!existingIds.has(id)) {
          scheduleOrders.push({ id: scheduleOrders.length + 1, dormitoryId, userId: id, sortOrder: ++maxOrder })
        }
      })
      return mockResponse(null, `已添加 ${userIds.length} 人到排班顺序`)
    },

    async removeFromOrder(dormitoryId, userId) {
      const idx = scheduleOrders.findIndex(o => o.dormitoryId === dormitoryId && o.userId === userId)
      if (idx !== -1) scheduleOrders.splice(idx, 1)
      return mockResponse(null, '已从排班顺序移除')
    },

    async updateOrder(dormitoryId, data) {
      scheduleOrders.length = 0
      data.forEach((item, i) => {
        scheduleOrders.push({ id: i + 1, dormitoryId, userId: item.userId, sortOrder: item.sortOrder })
      })
      return mockResponse(null, '排序更新成功')
    },

    async generate(dormitoryId, data) {
      const newSchedules = []
      for (let i = 0; i < data.days; i++) {
        const d = new Date(data.startDate)
        d.setDate(d.getDate() + i)
        if (d.getDay() === 0 || d.getDay() === 6) continue
        const member = scheduleOrders[i % scheduleOrders.length]
        newSchedules.push({
          id: idCounter++,
          dormitoryId,
          userId: member?.userId || 1,
          nickname: ['阿强', '小美', '大伟', '琳琳'][(i % 4)],
          avatarUrl: '',
          scheduleDate: d.toISOString().split('T')[0],
          timeSlot: data.timeSlot || '',
          remark: '',
          imageUrl: null,
          status: 'PENDING',
          createdAt: new Date().toISOString().replace('T', ' ')
        })
      }
      return mockResponse(newSchedules, '排班生成成功')
    },

    async getList(params) {
      let list = [...schedules]
      if (params.status) list = list.filter(s => s.status === params.status)
      if (params.from) list = list.filter(s => s.scheduleDate >= params.from)
      if (params.to) list = list.filter(s => s.scheduleDate <= params.to)
      return mockResponse(list)
    },

    async getById(id) {
      const s = schedules.find(s => s.id === id)
      return mockResponse(s || null)
    },

    async getHistory(params) {
      const history = schedules.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED')
      return mockResponse(history)
    },

    async update(id, data) {
      const s = schedules.find(s => s.id === id)
      if (s) Object.assign(s, data)
      return mockResponse(s, '更新成功')
    },

    async complete(id) {
      const s = schedules.find(s => s.id === id)
      if (s) s.status = 'COMPLETED'
      return mockResponse(null, '已完成')
    },

    async clear(dormitoryId, fromDate) {
      let count = 0
      schedules.forEach(s => {
        if (s.dormitoryId === dormitoryId && s.status === 'PENDING' && s.scheduleDate >= fromDate) {
          s.status = 'CANCELLED'
          count++
        }
      })
      return mockResponse({ cleared: count }, `已清除 ${count} 条排班`)
    },

    async remove(id) {
      const idx = schedules.findIndex(s => s.id === id)
      if (idx !== -1) schedules.splice(idx, 1)
      return mockResponse(null, '已删除')
    }
  }
}
