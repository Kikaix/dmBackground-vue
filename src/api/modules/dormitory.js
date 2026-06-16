/**
 * 宿舍管理 API
 */
import { USE_MOCK } from '@/api/mock'
import { mockDormitoryApi } from '@/api/mock/dormitory'
import request from '@/utils/request'

const realApi = {
  /** 我的宿舍列表 */
  getList: () => request.get('/dormitory/list'),
  /** 宿舍详情（含成员）*/
  getInfo: (dormitoryId) => request.get(`/dormitory/info?dormitoryId=${dormitoryId}`),
  /** 宿舍成员列表（含昵称头像+scheduled标记）*/
  getMembers: (dormitoryId) => request.get(`/dormitory/members?dormitoryId=${dormitoryId}`),
  /** 切换到指定宿舍 */
  switchDorm: (dormitoryId) => request.put(`/dormitory/switch/${dormitoryId}`),
  /** 加入宿舍（邀请码）*/
  join: (invitationCode) => request.post('/dormitory/join', { invitationCode }),
  /** 退出宿舍 */
  leave: (dormitoryId) => request.post('/dormitory/leave', { dormitoryId }),
  /** 刷新邀请码 */
  refreshCode: (dormitoryId) => request.put(`/dormitory/invitation-code?dormitoryId=${dormitoryId}`),
  /** 修改宿舍名称 */
  updateName: (dormitoryId, name) => request.put(`/dormitory/name?dormitoryId=${dormitoryId}`, { name }),
  /** 踢出成员 */
  kickMember: (dormitoryId, targetUserId) => request.delete(`/dormitory/kick/${targetUserId}?dormitoryId=${dormitoryId}`),
  /** 转让宿舍长 */
  transferLeader: (dormitoryId, targetUserId) => request.put('/dormitory/transfer-leader', { dormitoryId, targetUserId }),
}

const mock = mockDormitoryApi()

export const dormitoryApi = USE_MOCK ? mock : realApi
export default dormitoryApi
