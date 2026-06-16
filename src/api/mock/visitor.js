/**
 * 访客管理 Mock 数据
 */
import { mockResponse, paginate } from './index'

let idCounter = 1
const visitors = [
  { id: idCounter++, visitorName: '王大明', visitorPhone: '13700001111', idCard: '110101199001011234', studentName: '张三', dormNo: 'A-101', purpose: '探亲', visitTime: '2026-06-01 09:00', leaveTime: '2026-06-01 11:30', status: 'left' },
  { id: idCounter++, visitorName: '李小丽', visitorPhone: '13700002222', idCard: '110101199502022345', studentName: '赵六', dormNo: 'B-201', purpose: '送物品', visitTime: '2026-06-02 14:00', leaveTime: '', status: 'visiting' },
  { id: idCounter++, visitorName: '张伟', visitorPhone: '13700003333', idCard: '110101199303033456', studentName: '王五', dormNo: 'A-103', purpose: '维修', visitTime: '2026-06-03 10:30', leaveTime: '2026-06-03 12:00', status: 'left' },
  { id: idCounter++, visitorName: '陈芳', visitorPhone: '13700004444', idCard: '110101199604044567', studentName: '孙七', dormNo: 'B-202', purpose: '探亲', visitTime: '2026-06-04 08:00', leaveTime: '', status: 'visiting' },
  { id: idCounter++, visitorName: '刘强', visitorPhone: '13700005555', idCard: '110101199705055678', studentName: '周八', dormNo: 'A-104', purpose: '送物品', visitTime: '2026-06-05 16:00', leaveTime: '2026-06-05 17:00', status: 'left' },
  { id: idCounter++, visitorName: '杨静', visitorPhone: '13700006666', idCard: '110101199806066789', studentName: '吴九', dormNo: 'B-203', purpose: '探亲', visitTime: '2026-06-06 09:30', leaveTime: '', status: 'visiting' }
]

export function mockVisitorApi() {
  return {
    async getList(params = {}) {
      const { page = 1, size = 10, visitorName, studentName, status } = params
      const data = paginate(visitors, page, size, (item) => {
        if (visitorName && !item.visitorName.includes(visitorName)) return false
        if (studentName && !item.studentName.includes(studentName)) return false
        if (status && item.status !== status) return false
        return true
      })
      return mockResponse(data)
    },

    async getById(id) {
      const item = visitors.find(v => v.id === id)
      return mockResponse(item || null)
    },

    async create(data) {
      const newItem = {
        id: idCounter++,
        ...data,
        visitTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        leaveTime: '',
        status: 'visiting'
      }
      visitors.unshift(newItem)
      return mockResponse(newItem, '登记成功')
    },

    async update(id, data) {
      const idx = visitors.findIndex(v => v.id === id)
      if (idx > -1) {
        visitors[idx] = { ...visitors[idx], ...data }
        return mockResponse(visitors[idx], '修改成功')
      }
      return mockResponse(null, '记录不存在')
    },

    async delete(id) {
      const idx = visitors.findIndex(v => v.id === id)
      if (idx > -1) {
        visitors.splice(idx, 1)
        return mockResponse(null, '删除成功')
      }
      return mockResponse(null, '记录不存在')
    }
  }
}
