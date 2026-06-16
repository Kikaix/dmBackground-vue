"use strict";
const utils_request = require("../../utils/request.js");
const realApi = {
  wechatLogin: (code) => utils_request.request.post("/auth/wechat-login", { code }, { skipAuth: true }),
  refreshToken: () => utils_request.request.post("/auth/refresh-token")
};
const authApi = realApi;
exports.authApi = authApi;
