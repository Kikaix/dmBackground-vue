/**
 * 用户/登录状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo, clearAuth } from '@/utils/auth'
import { authApi, userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  // ========== 状态 ==========
  const token = ref(getToken())
  const userInfo = ref(getUserInfo())

  // ========== 计算属性 ==========
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickname || '未登录')
  const userRole = computed(() => '用户')

  // ========== 方法 ==========

  /**
   * 微信登录
   * @param {string} code - wx.login() 获取的临时凭证
   * @returns {Promise<Object>} 登录结果
   */
  async function wechatLogin(code) {
    const res = await authApi.wechatLogin(code)
    token.value = res.token
    setToken(res.token)

    if (res.userInfo) {
      userInfo.value = res.userInfo
      setUserInfo(res.userInfo)
    }
    return res
  }

  /**
   * 刷新 Token
   */
  async function refreshToken() {
    const res = await authApi.refreshToken()
    token.value = res.token
    setToken(res.token)
    return res.token
  }

  /**
   * 获取用户信息（从后端拉取最新数据）
   */
  async function fetchUserInfo() {
    const info = await userApi.getInfo()
    userInfo.value = info
    setUserInfo(info)
    return info
  }

  /**
   * 更新用户信息（本地 + 存储）
   */
  function updateProfile(partial) {
    userInfo.value = { ...userInfo.value, ...partial }
    setUserInfo(userInfo.value)
  }

  /**
   * 退出登录
   */
  function logout() {
    token.value = ''
    userInfo.value = null
    clearAuth()
  }

  /**
   * 检查权限
   */
  function hasPermission(perm) {
    return true // 后续按角色扩展
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
  }
})
