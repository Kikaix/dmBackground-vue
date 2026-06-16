"use strict";
const utils_request = require("../../utils/request.js");
const realApi = {
  getInfo: () => utils_request.request.get("/user/info"),
  updateProfile: (data) => utils_request.request.put("/user/profile", data),
  updateNotification: (enabled) => utils_request.request.put("/user/notification", { enabled })
};
const userApi = realApi;
exports.userApi = userApi;
