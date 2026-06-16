"use strict";
const common_vendor = require("../common/vendor.js");
const utils_auth = require("../utils/auth.js");
const api_modules_auth = require("../api/modules/auth.js");
const api_modules_user = require("../api/modules/user.js");
require("../utils/request.js");
require("../api/mock/schedule.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const token = common_vendor.ref(utils_auth.getToken());
  const userInfo = common_vendor.ref(utils_auth.getUserInfo());
  const isLoggedIn = common_vendor.computed(() => !!token.value);
  const userName = common_vendor.computed(() => {
    var _a;
    return ((_a = userInfo.value) == null ? void 0 : _a.nickname) || "未登录";
  });
  const userRole = common_vendor.computed(() => {
    var _a;
    return ((_a = userInfo.value) == null ? void 0 : _a.status) === 1 ? "学生" : "用户";
  });
  async function wechatLogin(code) {
    const res = await api_modules_auth.authApi.wechatLogin(code);
    token.value = res.token;
    utils_auth.setToken(res.token);
    if (res.userInfo) {
      userInfo.value = res.userInfo;
      utils_auth.setUserInfo(res.userInfo);
    }
    return res;
  }
  async function refreshToken() {
    const res = await api_modules_auth.authApi.refreshToken();
    token.value = res.token;
    utils_auth.setToken(res.token);
    return res.token;
  }
  async function fetchUserInfo() {
    const info = await api_modules_user.userApi.getInfo();
    userInfo.value = info;
    utils_auth.setUserInfo(info);
    return info;
  }
  function updateProfile(partial) {
    userInfo.value = { ...userInfo.value, ...partial };
    utils_auth.setUserInfo(userInfo.value);
  }
  function logout() {
    token.value = "";
    userInfo.value = null;
    utils_auth.clearAuth();
  }
  function hasPermission(perm) {
    return true;
  }
  return {
    token,
    userInfo,
    isLoggedIn,
    userName,
    userRole,
    wechatLogin,
    refreshToken,
    fetchUserInfo,
    updateProfile,
    logout,
    hasPermission
  };
});
exports.useUserStore = useUserStore;
