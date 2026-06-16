/**
 * 排班管理 API
 */
import { USE_MOCK } from '@/api/mock'
import { mockScheduleApi } from '@/api/mock/schedule'
import request from '@/utils/request'

const realApi = {
  /** 获取排班顺序 */
  getOrder: (dormitoryId) => request.get('/schedule/order', { dormitoryId }),
  /** 更新排班顺序 */
  updateOrder: (dormitoryId, data) => request.put(`/schedule/order?dormitoryId=${dormitoryId}`, data),
  /** 清空排班顺序（宿舍长） */
  clearOrder: (dormitoryId) => request.delete(`/schedule/order?dormitoryId=${dormitoryId}`),
  /** 添加用户到排班顺序（宿舍长） */
  addToOrder: (dormitoryId, userIds) => request.post(`/schedule/order/add?dormitoryId=${dormitoryId}`, userIds.map(id => ({ userId: id }))),
  /** 从排班顺序删除用户（宿舍长） */
  removeFromOrder: (dormitoryId, userId) => request.delete(`/schedule/order/${userId}?dormitoryId=${dormitoryId}`),
  /** 自动生成排班 */
  generate: (dormitoryId, data) => request.post(`/schedule/generate?dormitoryId=${dormitoryId}`, data),
  /** 排班列表 */
  getList: (params) => request.get('/schedule/list', params),
  /** 排班详情 */
  getById: (id) => request.get(`/schedule/${id}`),
  /** 历史排班 */
  getHistory: (params) => request.get('/schedule/history', params),
  /** 修改排班 */
  update: (id, data) => request.put(`/schedule/${id}`, data),
  /** 标记完成 */
  complete: (id) => request.put(`/schedule/${id}/complete`),
  /** 批量清除排班（宿舍长） */
  clear: (dormitoryId, fromDate) => request.post('/schedule/clear', { dormitoryId, fromDate }),
  /** 按ID删除排班（宿舍长） */
  remove: (id) => request.delete(`/schedule/${id}`),
}

const mock = mockScheduleApi()

export const scheduleApi = USE_MOCK ? mock : realApi
export default scheduleApi
