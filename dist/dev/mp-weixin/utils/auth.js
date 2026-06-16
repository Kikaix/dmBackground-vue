"use strict";
const common_vendor = require("../common/vendor.js");
const TOKEN_KEY = "dorm_token";
const USER_KEY = "dorm_user";
function getToken() {
  return common_vendor.index.getStorageSync(TOKEN_KEY) || "";
}
function setToken(token) {
  common_vendor.index.setStorageSync(TOKEN_KEY, token);
}
function removeToken() {
  common_vendor.index.removeStorageSync(TOKEN_KEY);
}
function getUserInfo() {
  const raw = common_vendor.index.getStorageSync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
function setUserInfo(info) {
  common_vendor.index.setStorageSync(USER_KEY, JSON.stringify(info));
}
function removeUserInfo() {
  common_vendor.index.removeStorageSync(USER_KEY);
}
function clearAuth() {
  removeToken();
  removeUserInfo();
}
exports.clearAuth = clearAuth;
exports.getToken = getToken;
exports.getUserInfo = getUserInfo;
exports.setToken = setToken;
exports.setUserInfo = setUserInfo;
