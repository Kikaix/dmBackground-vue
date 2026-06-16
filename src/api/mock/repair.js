/**
 * 报修管理 Mock 数据
 */
import { mockResponse, paginate } from './index'

let idCounter = 1
const repairs = [
  { id: idCounter++, dormNo: 'A-101', reporter: '张三', content: '水龙头漏水', status: 'pending', createTime: '2026-06-01 10:30', finishTime: '' },
  { id: idCounter++, dormNo: 'B-201', reporter: '赵六', content: '空调不制冷', status: 'processing', createTime: '2026-06-02 14:20', finishTime: '' },
  { id: idCounter++, dormNo: 'A-103', reporter: '王五', content: '灯管坏了', status: 'completed', createTime: '2026-06-03 08:15', finishTime: '2026-06-03 16:00' },
  { id: idCounter++, dormNo: 'B-203', reporter: '吴九', content: '洗手间堵塞', status: 'processing', createTime: '2026-06-04 09:45', finishTime: '' },
  { id: idCounter++, dormNo: 'A-102', reporter: '李四', content: '窗户关不上', status: 'cancelled', createTime: '2026-06-05 11:00', finishTime: '' },
  { id: idCounter++, dormNo: 'B-202', reporter: '孙七', content: '热水器故障', status: 'pending', createTime: '2026-06-06 07:30', finishTime: '' },
  { id: idCounter++, dormNo: 'A-104', reporter: '周八', content: '网络接口坏了', status: 'completed', createTime: '2026-06-06 13:00', finishTime: '2026-06-06 15:30' },
  { id: idCounter++, dormNo: 'A-101', reporter: '张三', content: '门锁损坏', status: 'pending', createTime: '2026-06-07 16:20', finishTime: '' }
]

export function mockRepairApi() {
  return {
    async getList(params = {}) {
      const { page = 1, size = 10, dormNo, status } = params
      const data = paginate(repairs, page, size, (item) => {
        if (dormNo && !item.dormNo.includes(dormNo)) return false
        if (status && item.status !== status) return false
        return true
      })
      return mockResponse(data)
    },

    async getById(id) {
      const item = repairs.find(r => r.id === id)
      return mockResponse(item || null)
    },

    async create(data) {
      const newItem = {
        id: idCounter++,
        ...data,
        status: 'pending',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        finishTime: ''
      }
      repairs.unshift(newItem)
      return mockResponse(newItem, '报修提交成功')
    },

    async update(id, data) {
      const idx = repairs.findIndex(r => r.id === id)
      if (idx > -1) {
        repairs[idx] = { ...repairs[idx], ...data }
        return mockResponse(repairs[idx], '修改成功')
      }
      return mockResponse(null, '记录不存在')
    },

    async delete(id) {
      const idx = repairs.findIndex(r => r.id === id)
      if (idx > -1) {
        repairs.splice(idx, 1)
        return mockResponse(null, '删除成功')
      }
      return mockResponse(null, '记录不存在')
    }
  }
}
