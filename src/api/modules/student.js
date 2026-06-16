/**
 * 学生管理 API
 * USE_MOCK=true → Mock 数据 / false → 真实后端接口
 */
import { USE_MOCK } from '@/api/mock'
import { mockStudentApi } from '@/api/mock/student'
import request from '@/utils/request'

const realApi = {
  getList: (params) => request.get('/students', params),
  getById: (id)    => request.get(`/students/${id}`),
  create:  (data)  => request.post('/students', data),
  update:  (id, d) => request.put(`/students/${id}`, d),
  delete:  (id)    => request.delete(`/students/${id}`),
}

const mock = mockStudentApi()

export const studentApi = USE_MOCK ? mock : realApi
export default studentApi
