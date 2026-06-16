"use strict";
require("../mock/schedule.js");
const utils_request = require("../../utils/request.js");
const realApi = {
  /** 获取排班顺序 */
  getOrder: (dormitoryId) => utils_request.request.get("/schedule/order", { dormitoryId }),
  /** 更新排班顺序 */
  updateOrder: (dormitoryId, data) => utils_request.request.put(`/schedule/order?dormitoryId=${dormitoryId}`, data),
  /** 清空排班顺序（宿舍长） */
  clearOrder: (dormitoryId) => utils_request.request.delete(`/schedule/order?dormitoryId=${dormitoryId}`),
  /** 添加用户到排班顺序（宿舍长） */
  addToOrder: (dormitoryId, userIds) => utils_request.request.post(`/schedule/order/add?dormitoryId=${dormitoryId}`, userIds.map((id) => ({ userId: id }))),
  /** 从排班顺序删除用户（宿舍长） */
  removeFromOrder: (dormitoryId, userId) => utils_request.request.delete(`/schedule/order/${userId}?dormitoryId=${dormitoryId}`),
  /** 自动生成排班 */
  generate: (dormitoryId, data) => utils_request.request.post(`/schedule/generate?dormitoryId=${dormitoryId}`, data),
  /** 排班列表 */
  getList: (params) => utils_request.request.get("/schedule/list", params),
  /** 排班详情 */
  getById: (id) => utils_request.request.get(`/schedule/${id}`),
  /** 历史排班 */
  getHistory: (params) => utils_request.request.get("/schedule/history", params),
  /** 修改排班 */
  update: (id, data) => utils_request.request.put(`/schedule/${id}`, data),
  /** 标记完成 */
  complete: (id) => utils_request.request.put(`/schedule/${id}/complete`),
  /** 批量清除排班（宿舍长） */
  clear: (dormitoryId, fromDate) => utils_request.request.post("/schedule/clear", { dormitoryId, fromDate }),
  /** 按ID删除排班（宿舍长） */
  remove: (id) => utils_request.request.delete(`/schedule/${id}`)
};
const scheduleApi = realApi;
exports.scheduleApi = scheduleApi;
