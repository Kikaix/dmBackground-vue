<template>
  <view class="page">
    <!-- Ambient Glow -->
    <view class="glow-bg">
      <view class="glow g1"></view>
      <view class="glow g2"></view>
      <view class="glow g3"></view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="content-inner">
        <!-- Logged in: user info -->
      <view class="user-card" v-if="isLoggedIn">
        <view class="user-card-glow"></view>
        <view class="user-card-content">
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <view class="user-avatar" :class="{ 'avatar-empty': !userInfo.avatarUrl }">
              <image
                v-if="userInfo.avatarUrl && !avatarLoadError"
                class="user-avatar-img"
                :src="userInfo.avatarUrl"
                mode="aspectFill"
                @error="avatarLoadError = true"
              />
              <text v-if="!userInfo.avatarUrl || avatarLoadError" class="avatar-placeholder">👤</text>
            </view>
          </button>
          <view class="user-detail">
            <input
              class="nickname-input"
              :class="{ done: !!userInfo.nickName }"
              type="nickname"
              :value="userInfo.nickName"
              :placeholder="defaultNickname"
              @input="onNicknameInput"
            />
            <text class="user-role">{{ userInfo.role || '用户' }}</text>
          </view>
        </view>
      </view>

      <!-- Not logged in: login card -->
      <view class="login-card" v-else>
        <view class="login-card-glow"></view>
        <view class="login-card-content">
          <view class="login-header">
            <view class="login-icon-wrap">
              <text class="login-icon">👤</text>
            </view>
            <view class="login-text">
              <text class="login-title">登录以同步</text>
              <text class="login-sub">同步账单、日程等信息</text>
            </view>
          </view>
          <view class="login-btn" @click="handleWechatLogin">
            <text class="login-btn-icon">💬</text>
            <text class="login-btn-text">使用微信登录</text>
          </view>
        </view>
      </view>

      <!-- Settings Group: 偏好设置 -->
      <view class="settings-group">
        <text class="group-label">偏好设置</text>
        <view class="settings-card">
          <!-- 通知提醒 -->
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon-box blue">
                <text class="item-icon">🔔</text>
              </view>
              <text class="item-label">通知提醒</text>
            </view>
            <view class="switch-pink" :class="{ on: noticeEnabled }" @click="handleNoticeToggle">
              <view class="switch-slider"></view>
            </view>
          </view>
          <!-- 消息设置 -->
          <view class="setting-item" @click="handleMenu('message')">
            <view class="item-left">
              <view class="item-icon-box purple">
                <text class="item-icon">💬</text>
              </view>
              <text class="item-label">消息设置</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
          <!-- 主题皮肤 -->
          <view class="setting-item last" @click="handleMenu('theme')">
            <view class="item-left">
              <view class="item-icon-box pink">
                <text class="item-icon">🎨</text>
              </view>
              <text class="item-label">主题皮肤</text>
            </view>
            <view class="item-right">
              <text class="item-hint">毛玻璃风</text>
              <text class="item-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Settings Group: 管理 -->
      <view class="settings-group">
        <text class="group-label">管理</text>
        <view class="settings-card">
          <view class="setting-item last" @click="handleMenu('dormitory')">
            <view class="item-left">
              <view class="item-icon-box amber">
                <text class="item-icon">🏠</text>
              </view>
              <text class="item-label">团队管理</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- Settings Group: 资源 -->
      <view class="settings-group">
        <text class="group-label">资源</text>
        <view class="settings-card">
          <view class="setting-item" @click="handleMenu('help')">
            <view class="item-left">
              <view class="item-icon-box cyan">
                <text class="item-icon">❓</text>
              </view>
              <text class="item-label">帮助中心</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
          <view class="setting-item" @click="handleMenu('feedback')">
            <view class="item-left">
              <view class="item-icon-box green">
                <text class="item-icon">📝</text>
              </view>
              <text class="item-label">意见反馈</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
          <view class="setting-item last" @click="handleMenu('service')">
            <view class="item-left">
              <view class="item-icon-box indigo">
                <text class="item-icon">📞</text>
              </view>
              <text class="item-label">联系客服</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-btn" v-if="isLoggedIn" @click="handleLogout">
        <text>退出登录</text>
      </view>

      <!-- Version -->
      <view class="version-info">
        <text class="version-text">团队助手 v1.0.0</text>
      </view>

      </view>
    </scroll-view>

    <!-- #ifdef H5 -->
    <TabBar :current="2" />
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/useUserStore'
import { userApi } from '@/api/modules/user'
// #ifdef H5
import TabBar from '@/components/TabBar.vue'
// #endif

const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const profileComplete = computed(() => !!userInfo.avatarUrl)

const currentTime = ref('')
const noticeEnabled = ref(true)
const avatarLoadError = ref(false)

function randomSuffix() {
  return Math.random().toString(36).substring(2, 6)
}
const defaultNickname = ref('未授权_' + randomSuffix())

const userInfo = reactive({
  nickName: '',
  avatarUrl: '',
  role: ''
})

function updateTime() {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${h}:${m}`
}

function syncUserInfo() {
  const info = userStore.userInfo
  if (info) {
    userInfo.nickName = info.nickname || ''
    userInfo.avatarUrl = info.avatarUrl || ''
    userInfo.role = userStore.userRole || ''
    // 从后端同步通知开关状态
    if (typeof info.notificationEnabled !== 'undefined') {
      noticeEnabled.value = info.notificationEnabled === 1 || info.notificationEnabled === true
    }
  }
}

async function handleWechatLogin() {
  try {
    uni.showLoading({ title: '登录中...', mask: true })

    // #ifdef MP-WEIXIN
    await new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            userStore.wechatLogin(res.code).then(resolve).catch(reject)
          } else {
            reject(new Error('获取微信登录凭证失败'))
          }
        },
        fail: (err) => reject(err)
      })
    })
    // #endif

    // #ifdef H5
    await userStore.wechatLogin('mock_wx_code_h5')
    // #endif

    uni.hideLoading()
    await userStore.fetchUserInfo()
    syncUserInfo()
    uni.showToast({ title: '登录成功', icon: 'success' })
  } catch (err) {
    uni.hideLoading()
    const msg = err?.message || '登录失败，请重试'
    uni.showToast({ title: msg, icon: 'none' })
  }
}

async function onChooseAvatar(e) {
  const avatarUrl = e.detail.avatarUrl
  if (avatarUrl) {
    let finalUrl = avatarUrl
    // #ifdef MP-WEIXIN
    try {
      const fs = wx.getFileSystemManager()
      const data = fs.readFileSync(avatarUrl, 'base64')
      finalUrl = 'data:image/jpeg;base64,' + data
    } catch (fsErr) {
      console.error('读取头像文件失败:', fsErr)
    }
    // #endif
    userInfo.avatarUrl = finalUrl
    userStore.updateProfile({ avatarUrl: finalUrl })
    try {
      await userApi.updateProfile({
        nickname: userInfo.nickName || defaultNickname.value,
        avatarUrl: finalUrl
      })
    } catch (err) { /* 静默 */ }
  }
}

function onNicknameInput(e) {
  const nickName = e.detail.value
  if (nickName && nickName !== userInfo.nickName) {
    userInfo.nickName = nickName
    userStore.updateProfile({ nickname: nickName })
    userApi.updateProfile({ nickname: nickName, avatarUrl: userInfo.avatarUrl || '' }).catch(() => {})
  }
}

async function handleNoticeToggle() {
  const next = !noticeEnabled.value
  try {
    await userApi.updateNotification(next)
    noticeEnabled.value = next
  } catch (err) {
    uni.showToast({ title: '设置失败，请重试', icon: 'none' })
  }
}

function handleMenu(type) {
  if (type === 'dormitory') {
    uni.navigateTo({
      url: '/pages/dormitory/list',
      fail: (err) => uni.showToast({ title: '页面跳转失败: ' + err.errMsg, icon: 'none' })
    })
    return
  }
  const titles = {
    message: '消息设置', theme: '主题皮肤',
    help: '帮助中心', feedback: '意见反馈', service: '联系客服'
  }
  uni.showToast({ title: `「${titles[type] || '设置项'}」功能开发中`, icon: 'none' })
}

function handleLogout() {
  uni.showModal({
    title: '提示', content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        userInfo.nickName = ''; userInfo.avatarUrl = ''; userInfo.role = ''
        avatarLoadError.value = false
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 60000)
  if (isLoggedIn.value) {
    await userStore.fetchUserInfo()
  }
  syncUserInfo()
})

onShow(() => {
  // #ifdef MP-WEIXIN
  var p = getCurrentPages()
  if (p && p.length > 0) {
    var page = p[p.length - 1]
    if (typeof page.getTabBar === 'function') {
      var tb = page.getTabBar()
      if (tb) tb.setData({ selected: 2 })
    }
  }
  // #endif
})

</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f3fcf0;
  position: relative;
}

// ==================== Ambient Glow ====================
.glow-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.glow { position: absolute; border-radius: 50%; }
.g1 { top: -10%; left: -10%; width: 50%; height: 40%; background: rgba(102,255,149,0.15); filter: blur(80px); }
.g2 { top: 20%; right: -10%; width: 40%; height: 30%; background: rgba(229,222,255,0.25); filter: blur(60px); }
.g3 { bottom: 0; left: 20%; width: 60%; height: 40%; background: rgba(232,240,228,0.4); filter: blur(100px); }

// ==================== Content ====================
.content {
  position: relative; z-index: 1;
  padding-bottom: 80px;
}

.content-inner {
  padding: 16px 14px;
  display: flex; flex-direction: column; gap: 18px;
}

// ==================== User Card (logged in) ====================
.user-card {
  position: relative; overflow: hidden;
  border-radius: 18px; padding: 18px;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
}
.user-card-glow {
  position: absolute; top: 0; right: 0; width: 100px; height: 100px;
  background: rgba(7,193,96,0.06); border-radius: 50%;
  transform: translate(30px, -30px); filter: blur(30px);
}
.user-card-content {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 14px;
}

.avatar-btn {
  padding: 0; margin: 0; background: transparent; border: none; line-height: 1;
  &::after { border: none; }
}

.user-avatar {
  width: 46px; height: 46px; border-radius: 50%; overflow: hidden;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  &.avatar-empty { background: #f0f0f0; border: 2px dashed #ccc; }
}
.user-avatar-img { width: 100%; height: 100%; }
.avatar-placeholder { font-size: 20px; opacity: 0.4; }

.user-detail { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.nickname-input {
  font-size: 15px; font-weight: 600; color: #999; padding: 0;
  min-height: auto; background: transparent;
  &.done { color: #161d16; }
}
.user-role {
  font-size: 10px; color: #07c160; background: rgba(7,193,96,0.08);
  padding: 1px 7px; border-radius: 6px; align-self: flex-start;
}

// ==================== Login Card ====================
.login-card {
  position: relative; overflow: hidden;
  border-radius: 18px; padding: 20px;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
}
.login-card-glow {
  position: absolute; top: 0; right: 0; width: 100px; height: 100px;
  background: rgba(7,193,96,0.06); border-radius: 50%;
  transform: translate(50px, -50px); filter: blur(40px);
}
.login-card-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 14px;
}

.login-header { display: flex; align-items: center; gap: 12px; }
.login-icon-wrap {
  width: 42px; height: 42px; border-radius: 50%;
  background: rgba(7,193,96,0.12);
  display: flex; align-items: center; justify-content: center;
}
.login-icon { font-size: 20px; }
.login-text { display: flex; flex-direction: column; gap: 2px; }
.login-title { font-size: 16px; font-weight: 600; color: #161d16; }
.login-sub { font-size: 11px; color: #3d4a3d; }

.login-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px;
  background: #07c160; border-radius: 22px;
  box-shadow: 0 3px 12px rgba(7,193,96,0.2);
  &:active { transform: scale(0.95); }
}
.login-btn-icon { font-size: 16px; }
.login-btn-text { font-size: 14px; font-weight: 700; color: #fff; }

// ==================== Settings ====================
.settings-group {
  display: flex; flex-direction: column; gap: 8px;
}

.group-label {
  font-size: 11px; color: #3d4a3d; font-weight: 500;
  padding: 0 4px; letter-spacing: 0.5px;
}

.settings-card {
  background: #fff; border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.setting-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 0.5px solid rgba(220,229,217,0.4);
  &:active { background: rgba(237,246,234,0.5); }
  &.last { border-bottom: none; }
}

.item-left { display: flex; align-items: center; gap: 12px; flex: 1; }

.item-icon-box {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  &.blue   { background: #e3f2fd; }
  &.purple { background: #f3e5f5; }
  &.pink   { background: #fce4ec; }
  &.amber  { background: #fff8e1; }
  &.cyan   { background: #e0f7fa; }
  &.green  { background: #e8f5e9; }
  &.indigo { background: #e8eaf6; }
}

.item-icon { font-size: 16px; }

.item-label { font-size: 14px; font-weight: 400; color: #161d16; }

.item-right { display: flex; align-items: center; gap: 6px; }
.item-hint { font-size: 11px; color: #3d4a3d; }
.item-arrow { font-size: 16px; color: #c0c0c0; }

// Toggle switch
.switch-pink {
  width: 44px; height: 24px; border-radius: 12px;
  background: #dce5d9; position: relative;
  transition: background 0.3s;
  flex-shrink: 0;

  &.on { background: #07c160; }
}

.switch-slider {
  position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform 0.3s;
}
.switch-pink.on .switch-slider { transform: translateX(20px); }

// ==================== Logout ====================
.logout-btn {
  margin: 0 2px;
  padding: 12px;
  text-align: center;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  &:active { background: #f8f8f8; }
  text { font-size: 14px; font-weight: 500; color: #ff4d4f; }
}

// ==================== Version ====================
.version-info { text-align: center; padding: 8px 0; }
.version-text { font-size: 10px; color: #6c7b6c; }

.bottom-spacer { height: 20px; }
</style>
