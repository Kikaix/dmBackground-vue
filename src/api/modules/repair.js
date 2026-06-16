/**
 * 报修管理 API
 */
import { USE_MOCK } from '@/api/mock'
import { mockRepairApi } from '@/api/mock/repair'
import request from '@/utils/request'

const realApi = {
  getList: (params) => request.get('/repairs', params),
  getById: (id)    => request.get(`/repairs/${id}`),
  create:  (data)  => request.post('/repairs', data),
  update:  (id, d) => request.put(`/repairs/${id}`, d),
  delete:  (id)    => request.delete(`/repairs/${id}`),
}

const mock = mockRepairApi()

export const repairApi = USE_MOCK ? mock : realApi
export default repairApi
