/**
 * 数据统计 Mock 数据
 */
import { mockResponse } from './index'

export function mockStatisticsApi() {
  return {
    /** 获取仪表盘概览数据 */
    async getOverview() {
      return mockResponse({
        totalStudents: 1234,
        totalDormitories: 308,
        occupiedRooms: 287,
        vacantRooms: 21,
        pendingRepairs: 12,
        visitingGuests: 8
      })
    },

    /** 各楼栋入住率 */
    async getOccupancyByBuilding() {
      return mockResponse([
        { building: 'A栋（男）', total: 156, occupied: 148 },
        { building: 'B栋（女）', total: 152, occupied: 139 }
      ])
    },

    /** 近30天报修趋势 */
    async getRepairTrend() {
      const data = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        data.push({
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          count: Math.floor(Math.random() * 10) + 1
        })
      }
      return mockResponse(data)
    },

    /** 报修分类统计 */
    async getRepairCategory() {
      return mockResponse([
        { category: '水电类', count: 45, percentage: 38 },
        { category: '家具类', count: 28, percentage: 24 },
        { category: '电器类', count: 22, percentage: 19 },
        { category: '门窗类', count: 15, percentage: 13 },
        { category: '其他', count: 8, percentage: 6 }
      ])
    }
  }
}
