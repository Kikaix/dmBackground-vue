"use strict";
const common_vendor = require("../common/vendor.js");
const utils_constants = require("./constants.js");
const utils_auth = require("./auth.js");
function unwrapRefs(obj) {
  if (common_vendor.isRef(obj))
    return unwrapRefs(common_vendor.unref(obj));
  if (Array.isArray(obj))
    return obj.map(unwrapRefs);
  if (obj !== null && typeof obj === "object") {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = unwrapRefs(obj[key]);
    }
    return result;
  }
  return obj;
}
let isRefreshing = false;
let refreshQueue = [];
function doRefreshToken() {
  return new Promise((resolve, reject) => {
    const token = utils_auth.getToken();
    common_vendor.index.request({
      url: utils_constants.BASE_URL + "/auth/refresh-token",
      method: "POST",
      header: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      timeout: 15e3,
      success: (res) => {
        var _a;
        if (res.statusCode === 200) {
          const body = res.data;
          if (body && body.code === utils_constants.BIZ_CODE.SUCCESS && ((_a = body.data) == null ? void 0 : _a.token)) {
            const newToken = body.data.token;
            utils_auth.setToken(newToken);
            resolve(newToken);
            return;
          }
        }
        reject(new Error("刷新Token失败"));
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
function request(options = {}) {
  if (options.showLoading) {
    common_vendor.index.showLoading({ title: "加载中...", mask: true });
  }
  const header = {
    "Content-Type": "application/json;charset=utf-8",
    ...options.header
  };
  if (!options.skipAuth) {
    const token = unwrapRefs(utils_auth.getToken());
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }
  }
  const requestData = unwrapRefs(options.data || {});
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: utils_constants.BASE_URL + options.url,
      method: options.method || "GET",
      data: requestData,
      header,
      timeout: options.timeout || 15e3,
      success: (res) => {
        if (options.showLoading) {
          common_vendor.index.hideLoading();
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const msg = utils_constants.HTTP_STATUS[res.statusCode] || `请求失败(${res.statusCode})`;
          if (options.showError !== false) {
            common_vendor.index.showToast({ title: msg, icon: "none" });
          }
          reject({ statusCode: res.statusCode, message: msg });
          return;
        }
        const body = res.data;
        if (body && typeof body.code !== "undefined") {
          if (body.code === utils_constants.BIZ_CODE.SUCCESS) {
            resolve(body.data);
            return;
          }
          if (body.code === utils_constants.BIZ_CODE.UNAUTHORIZED) {
            if (options.skipAuth) {
              reject({ code: body.code, message: body.message || "未授权" });
              return;
            }
            if (!isRefreshing) {
              isRefreshing = true;
              doRefreshToken().then((newToken) => {
                isRefreshing = false;
                const q = refreshQueue;
                refreshQueue = [];
                q.forEach(({ opts, resolve: r, reject: rej }) => {
                  const newHeader = { ...opts.header };
                  newHeader["Authorization"] = `Bearer ${newToken}`;
                  request({ ...opts, header: newHeader }).then(r).catch(rej);
                });
              }).catch(() => {
                isRefreshing = false;
                const q = refreshQueue;
                refreshQueue = [];
                utils_auth.clearAuth();
                q.forEach(({ rej }) => rej({ code: 401, message: "登录已过期，请重新登录" }));
                common_vendor.index.showToast({ title: "登录已过期，请重新登录", icon: "none" });
              });
            }
            refreshQueue.push({ opts: options, resolve, reject });
            return;
          }
          if (options.showError !== false) {
            common_vendor.index.showToast({ title: body.message || "操作失败", icon: "none" });
          }
          reject({ code: body.code, message: body.message || "操作失败" });
          return;
        }
        resolve(body);
      },
      fail: (err) => {
        if (options.showLoading) {
          common_vendor.index.hideLoading();
        }
        if (options.showError !== false) {
          common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        }
        reject(err);
      }
    });
  });
}
request.get = (url, data, opts) => request({ ...opts, url, method: "GET", data });
request.post = (url, data, opts) => request({ ...opts, url, method: "POST", data });
request.put = (url, data, opts) => request({ ...opts, url, method: "PUT", data });
request.delete = (url, data, opts) => request({ ...opts, url, method: "DELETE", data });
exports.request = request;
