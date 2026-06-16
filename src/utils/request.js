/**
 * HTTP 请求封装
 *
 * 约定：Java 后端统一返回 { code, data, message, total }
 * - code === 200   → 成功，resolve(data)
 * - code === 401   → Token 过期，尝试刷新 → 失败则清除登录态
 * - 其他           → 业务异常，弹出 message
 */

import { isRef, unref } from 'vue'
import { BASE_URL, BIZ_CODE, HTTP_STATUS } from './constants'
import { getToken, setToken, clearAuth } from './auth'

// 深度解包 Vue ref，防止传给后端的是 { __v_isRef: true, ... } 而非实际值
function unwrapRefs(obj) {
  if (isRef(obj)) return unwrapRefs(unref(obj))
  if (Array.isArray(obj)) return obj.map(unwrapRefs)
  if (obj !== null && typeof obj === 'object') {
    const result = {}
    for (const key of Object.keys(obj)) {
      result[key] = unwrapRefs(obj[key])
    }
    return result
  }
  return obj
}

// 是否正在刷新 Token（防止并发请求同时刷新）
let isRefreshing = false
// 等待刷新的请求队列
let refreshQueue = []

/**
 * 执行 Token 刷新
 * @returns {Promise<string>} 新 Token
 */
function doRefreshToken() {
  return new Promise((resolve, reject) => {
    const token = getToken()
    uni.request({
      url: BASE_URL + '/auth/refresh-token',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 15000,
      success: (res) => {
        if (res.statusCode === 200) {
          const body = res.data
          if (body && body.code === BIZ_CODE.SUCCESS && body.data?.token) {
            const newToken = body.data.token
            setToken(newToken)
            resolve(newToken)
            return
          }
        }
        reject(new Error('刷新Token失败'))
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 核心请求方法
 * @param {Object} options
 * @param {string}  options.url        - 接口路径（不含 BASE_URL）
 * @param {string}  options.method     - 请求方法，默认 GET
 * @param {Object}  options.data       - 请求参数
 * @param {Object}  options.header     - 额外请求头
 * @param {number}  options.timeout    - 超时时间，默认 15000
 * @param {boolean} options.showLoading - 是否显示加载动画，默认 false
 * @param {boolean} options.showError  - 是否自动弹出错误提示，默认 true
 * @param {boolean} options.skipAuth   - 是否跳过 Token 附加（公开接口）
 * @returns {Promise<any>} 解析后的 data 字段
 */
export function request(options = {}) {
  if (options.showLoading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  const header = {
    'Content-Type': 'application/json;charset=utf-8',
    ...options.header
  }

  // 公开接口跳过 Token
  if (!options.skipAuth) {
    const token = unwrapRefs(getToken())
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
  }

  const requestData = unwrapRefs(options.data || {})

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: requestData,
      header,
      timeout: options.timeout || 15000,
      success: (res) => {
        if (options.showLoading) {
          uni.hideLoading()
        }

        // HTTP 状态码异常
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const msg = HTTP_STATUS[res.statusCode] || `请求失败(${res.statusCode})`
          if (options.showError !== false) {
            uni.showToast({ title: msg, icon: 'none' })
          }
          reject({ statusCode: res.statusCode, message: msg })
          return
        }

        const body = res.data

        // 兼容非统一格式
        if (body && typeof body.code !== 'undefined') {
          // 业务成功
          if (body.code === BIZ_CODE.SUCCESS) {
            resolve(body.data)
            return
          }

          // Token 过期 — 尝试刷新
          if (body.code === BIZ_CODE.UNAUTHORIZED) {
            if (options.skipAuth) {
              // 公开接口返回 401 直接拒绝
              reject({ code: body.code, message: body.message || '未授权' })
              return
            }

            // 加入刷新队列
            if (!isRefreshing) {
              isRefreshing = true
              doRefreshToken()
                .then((newToken) => {
                  // 刷新成功，重试队列中的请求
                  isRefreshing = false
                  const q = refreshQueue
                  refreshQueue = []
                  q.forEach(({ opts, resolve: r, reject: rej }) => {
                    // 用新 Token 重试
                    const newHeader = { ...opts.header }
                    newHeader['Authorization'] = `Bearer ${newToken}`
                    request({ ...opts, header: newHeader }).then(r).catch(rej)
                  })
                })
                .catch(() => {
                  // 刷新失败，全部拒绝
                  isRefreshing = false
                  const q = refreshQueue
                  refreshQueue = []
                  clearAuth()
                  q.forEach(({ rej }) => rej({ code: 401, message: '登录已过期，请重新登录' }))
                  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
                })
            }

            // 将当前请求入队等待
            refreshQueue.push({ opts: options, resolve, reject })
            return
          }

          // 其他业务异常
          if (options.showError !== false) {
            uni.showToast({ title: body.message || '操作失败', icon: 'none' })
          }
          reject({ code: body.code, message: body.message || '操作失败' })
          return
        }

        // 非统一格式直接返回
        resolve(body)
      },
      fail: (err) => {
        if (options.showLoading) {
          uni.hideLoading()
        }
        if (options.showError !== false) {
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        }
        reject(err)
      }
    })
  })
}

// 便捷方法
request.get =    (url, data, opts) => request({ ...opts, url, method: 'GET', data })
request.post =   (url, data, opts) => request({ ...opts, url, method: 'POST', data })
request.put =    (url, data, opts) => request({ ...opts, url, method: 'PUT', data })
request.delete = (url, data, opts) => request({ ...opts, url, method: 'DELETE', data })

export default request
