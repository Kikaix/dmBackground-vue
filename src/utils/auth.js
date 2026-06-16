/**
 * Token 与用户信息管理
 * 使用 uni.storage 持久化，兼容微信小程序与 H5
 */

const TOKEN_KEY = 'dorm_token'
const USER_KEY = 'dorm_user'

// ==================== Token ====================

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

// ==================== 用户信息 ====================

/**
 * 获取缓存的用户信息
 * @returns {Object|null} { id, username, realName, role, avatar }
 */
export function getUserInfo() {
  const raw = uni.getStorageSync(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setUserInfo(info) {
  uni.setStorageSync(USER_KEY, JSON.stringify(info))
}

export function removeUserInfo() {
  uni.removeStorageSync(USER_KEY)
}

// ==================== 登录态判断 ====================

export function isLoggedIn() {
  return !!getToken()
}

/**
 * 清除所有登录状态
 */
export function clearAuth() {
  removeToken()
  removeUserInfo()
}
