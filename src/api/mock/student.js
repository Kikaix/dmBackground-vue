/**
 * 学生管理 Mock 数据
 */
import { mockResponse, paginate } from './index'

// 模拟学生数据池
let idCounter = 100
const students = [
  { id: idCounter++, studentNo: '2024001', name: '张三', gender: 'male', className: '计算机科学2401', dormNo: 'A-101', phone: '13800001111', status: 'active' },
  { id: idCounter++, studentNo: '2024002', name: '李四', gender: 'male', className: '计算机科学2401', dormNo: 'A-102', phone: '13800002222', status: 'active' },
  { id: idCounter++, studentNo: '2024003', name: '王五', gender: 'male', className: '软件工程2402', dormNo: 'A-103', phone: '13800003333', status: 'active' },
  { id: idCounter++, studentNo: '2024004', name: '赵六', gender: 'female', className: '软件工程2402', dormNo: 'B-201', phone: '13800004444', status: 'inactive' },
  { id: idCounter++, studentNo: '2024005', name: '孙七', gender: 'female', className: '数据科学2401', dormNo: 'B-202', phone: '13800005555', status: 'active' },
  { id: idCounter++, studentNo: '2024006', name: '周八', gender: 'male', className: '数据科学2401', dormNo: 'A-104', phone: '13800006666', status: 'active' },
  { id: idCounter++, studentNo: '2024007', name: '吴九', gender: 'female', className: '人工智能2401', dormNo: 'B-203', phone: '13800007777', status: 'active' },
  { id: idCounter++, studentNo: '2024008', name: '郑十', gender: 'male', className: '人工智能2401', dormNo: 'A-105', phone: '13800008888', status: 'inactive' },
  { id: idCounter++, studentNo: '2024009', name: '冯十一', gender: 'female', className: '计算机科学2402', dormNo: 'B-204', phone: '13800009999', status: 'active' },
  { id: idCounter++, studentNo: '2024010', name: '陈十二', gender: 'male', className: '计算机科学2402', dormNo: 'A-106', phone: '13800001112', status: 'active' },
  { id: idCounter++, studentNo: '2024011', name: '褚十三', gender: 'female', className: '软件工程2401', dormNo: 'B-205', phone: '13800001113', status: 'active' },
  { id: idCounter++, studentNo: '2024012', name: '卫十四', gender: 'male', className: '软件工程2401', dormNo: 'A-107', phone: '13800001114', status: 'active' }
]

export function mockStudentApi() {
  return {
    async getList(params = {}) {
      const { page = 1, size = 10, studentNo, name, className } = params
      const data = paginate(students, page, size, (item) => {
        if (studentNo && !item.studentNo.includes(studentNo)) return false
        if (name && !item.name.includes(name)) return false
        if (className && !item.className.includes(className)) return false
        return true
      })
      return mockResponse(data)
    },

    async getById(id) {
      const student = students.find(s => s.id === id)
      return mockResponse(student || null, student ? '查询成功' : '学生不存在')
    },

    async create(data) {
      const newStudent = { id: idCounter++, ...data, status: 'active' }
      students.unshift(newStudent)
      return mockResponse(newStudent, '添加成功')
    },

    async update(id, data) {
      const idx = students.findIndex(s => s.id === id)
      if (idx > -1) {
        students[idx] = { ...students[idx], ...data }
        return mockResponse(students[idx], '修改成功')
      }
      return mockResponse(null, '学生不存在')
    },

    async delete(id) {
      const idx = students.findIndex(s => s.id === id)
      if (idx > -1) {
        students.splice(idx, 1)
        return mockResponse(null, '删除成功')
      }
      return mockResponse(null, '学生不存在')
    }
  }
}
