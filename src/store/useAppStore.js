/**
 * 全局应用状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 全局加载状态
  const loading = ref(false)

  // 网络状态
  const networkConnected = ref(true)

  // 侧边栏 / 菜单折叠（H5 端可能用到）
  const sidebarCollapsed = ref(false)

  // 显示全局加载
  function showLoading() {
    loading.value = true
  }

  // 隐藏全局加载
  function hideLoading() {
    loading.value = false
  }

  // 切换侧边栏
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 设置网络状态
  function setNetworkStatus(status) {
    networkConnected.value = status
  }

  return {
    loading,
    networkConnected,
    sidebarCollapsed,
    showLoading,
    hideLoading,
    toggleSidebar,
    setNetworkStatus
  }
})
