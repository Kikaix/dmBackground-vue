/**
 * 通知公告 API
 */
import { USE_MOCK } from '@/api/mock'
import { mockNoticeApi } from '@/api/mock/notice'
import request from '@/utils/request'

const realApi = {
  getList: (params) => request.get('/notices', params),
  getById: (id)    => request.get(`/notices/${id}`),
  create:  (data)  => request.post('/notices', data),
  update:  (id, d) => request.put(`/notices/${id}`, d),
  delete:  (id)    => request.delete(`/notices/${id}`),
}

const mock = mockNoticeApi()

export const noticeApi = USE_MOCK ? mock : realApi
export default noticeApi
