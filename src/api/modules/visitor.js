/**
 * 访客管理 API
 */
import { USE_MOCK } from '@/api/mock'
import { mockVisitorApi } from '@/api/mock/visitor'
import request from '@/utils/request'

const realApi = {
  getList: (params) => request.get('/visitors', params),
  getById: (id)    => request.get(`/visitors/${id}`),
  create:  (data)  => request.post('/visitors', data),
  update:  (id, d) => request.put(`/visitors/${id}`, d),
  delete:  (id)    => request.delete(`/visitors/${id}`),
}

const mock = mockVisitorApi()

export const visitorApi = USE_MOCK ? mock : realApi
export default visitorApi
