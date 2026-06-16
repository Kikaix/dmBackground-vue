"use strict";
const utils_request = require("../../utils/request.js");
const realApi = {
  /** 我的宿舍列表 */
  getList: () => utils_request.request.get("/dormitory/list"),
  /** 宿舍详情（含成员） */
  getInfo: (dormitoryId) => utils_request.request.get("/dormitory/info", { dormitoryId }),
  /** 宿舍成员列表（含昵称头像+scheduled标记） */
  getMembers: (dormitoryId) => utils_request.request.get("/dormitory/members", { dormitoryId }),
  /** 切换到指定宿舍 */
  switchDorm: (dormitoryId) => utils_request.request.put(`/dormitory/switch/${dormitoryId}`),
  /** 加入宿舍（邀请码） */
  join: (invitationCode) => utils_request.request.post("/dormitory/join", { invitationCode }),
  /** 退出宿舍 */
  leave: (dormitoryId) => utils_request.request.post("/dormitory/leave", { dormitoryId }),
  /** 刷新邀请码 */
  refreshCode: () => utils_request.request.put("/dormitory/invitation-code"),
  /** 修改宿舍名称 */
  updateName: (name) => utils_request.request.put("/dormitory/name", { name }),
  /** 踢出成员 */
  kickMember: (targetUserId) => utils_request.request.delete(`/dormitory/kick/${targetUserId}`),
  /** 转让宿舍长 */
  transferLeader: (dormitoryId, targetUserId) => utils_request.request.put("/dormitory/transfer-leader", { dormitoryId, targetUserId })
};
const dormitoryApi = realApi;
exports.dormitoryApi = dormitoryApi;
