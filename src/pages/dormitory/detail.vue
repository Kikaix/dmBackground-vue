<template>
  <view class="page">
    <!-- Top Bar -->
    <view class="top-bar">
      <view class="bar-btn" @click="goBack">
        <text class="bar-icon">←</text>
      </view>
      <text class="bar-title">团队管理</text>
      <view class="bar-btn" @click="handleMore">
        <text class="bar-icon more">⋯</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="content-inner">
        <!-- Dormitory Header Card -->
      <view class="header-card">
        <view class="header-blur"></view>
        <view class="header-content">
          <view class="header-row">
            <view class="building-tag">
              <text class="tag-text">ID: {{ dormitory.id }}</text>
            </view>
            <text class="room-num">{{ members.length }} 位成员</text>
          </view>
          <view class="dorm-name-row" @click="handleSwitch">
            <text class="dorm-name">{{ dormitory.name || '加载中...' }}</text>
            <text class="expand-icon">▼</text>
          </view>
          <text class="welcome-msg">欢迎回来！您的团队目前运行良好。</text>
          <view class="stats-row">
            <view class="stat-item">
              <view class="stat-icon-box green-box">
                <text class="stat-icon">💳</text>
              </view>
              <view class="stat-info">
                <text class="stat-label">电费余额</text>
                <text class="stat-value">¥42.50</text>
              </view>
            </view>
            <view class="stat-item">
              <view class="stat-icon-box purple-box">
                <text class="stat-icon">🧹</text>
              </view>
              <view class="stat-info">
                <text class="stat-label">今日值班</text>
                <text class="stat-value purple">王五</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Members Section -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">团队成员</text>
          <text class="section-sub">{{ members.length }} 人</text>
        </view>
        <view class="member-list">
          <view class="member-card" v-for="m in members" :key="m.userId" @click="handleMember(m)">
            <view class="member-left">
              <view class="member-avatar" :class="m.avatarBg">
                <image v-if="m.avatarUrl" class="member-avatar-img" :src="m.avatarUrl" mode="aspectFill" @error="m.avatarUrl = ''" />
                <text v-else class="member-avatar-text">👤</text>
              </view>
              <view class="member-info">
                <text class="member-name">{{ m.displayName }}</text>
                <text class="member-role" :class="{ 'role-head': m.isLeader }">{{ m.displayRole }}</text>
              </view>
            </view>
            <view class="member-right">
              <text class="duty-badge" v-if="m.isLeader">管理员</text>
              <text class="member-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Invite Section -->
      <view class="section">
        <text class="section-title invite-title">邀请成员</text>
        <view class="invite-card">
          <view class="invite-icon-wrap">
            <text class="invite-icon">👥</text>
          </view>
          <text class="invite-heading">还没有邀请齐成员？</text>
          <text class="invite-desc">分享团队代码，让大家快速加入你的团队</text>
          <view class="code-row">
            <text class="code-text">{{ dormitory.invitationCode || '---' }}</text>
            <view class="copy-btn" @click="copyCode">
              <text class="copy-icon">📋</text>
            </view>
            <view class="copy-btn" @click="refreshCode">
              <text class="copy-icon">🔄</text>
            </view>
          </view>
          <!-- #ifdef MP-WEIXIN -->
          <button class="share-btn" open-type="share">
            <text class="share-icon">📤</text>
            <text class="share-text">邀请团队好友</text>
          </button>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <view class="share-btn" @click="inviteFriend">
            <text class="share-icon">📤</text>
            <text class="share-text">邀请团队好友</text>
          </view>
          <!-- #endif -->
        </view>
      </view>

      <!-- Quick Actions -->
      <view class="actions-row">
        <view class="action-card" @click="handleAction('log')">
          <view class="action-icon-wrap purple-bg-light">
            <text class="action-icon">📋</text>
          </view>
          <text class="action-label">团队日志</text>
        </view>
        <view class="action-card" @click="handleAction('settings')">
          <view class="action-icon-wrap green-bg-light">
            <text class="action-icon">⚙️</text>
          </view>
          <text class="action-label">团队设置</text>
        </view>
      </view>

        <view class="bottom-spacer"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { dormitoryApi } from '@/api/modules/dormitory'
import { PAGE_PATH } from '@/utils/constants'

const dormitory = ref({})
const members = ref([])
const loading = ref(true)

const roleLabels = { LEADER: '管理员', MEMBER: '成员' }
const avatarBgs = ['bg-lead', 'bg-m1', 'bg-m2', 'bg-m3']

// 获取宿舍ID：优先 storage → 路由参数
const dormitoryId = ref(uni.getStorageSync('_currentDormId') || '')

onLoad((options) => {
  // 路由参数优先覆盖（比 storage 更新）
  if (options?.id) {
    dormitoryId.value = options.id
    uni.setStorageSync('_currentDormId', options.id)
  }
  // fallback: getCurrentPages
  if (!dormitoryId.value) {
    try {
      const p = getCurrentPages()
      const cp = p[p.length - 1]
      dormitoryId.value = cp?.options?.id || ''
    } catch(e) {}
  }
  fetchDetail()
})

async function fetchDetail() {
  if (!dormitoryId.value) {
    uni.showToast({ title: '缺少团队ID', icon: 'none' })
    return
  }
  try {
    const data = await dormitoryApi.getInfo(dormitoryId.value)
    if (data) {
      dormitory.value = data.dormitory || {}
      members.value = (data.members || []).map((m, i) => ({
        ...m,
        displayName: m.nickname || '未知',
        displayRole: roleLabels[m.role] || m.role || '成员',
        isLeader: m.role === 'LEADER',
        avatarBg: avatarBgs[i % avatarBgs.length]
      }))
    }
  } catch (err) {
    uni.showToast({ title: '加载团队详情失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function handleMore() {
  uni.showActionSheet({
    itemList: ['修改团队名称', '退出团队'],
    success: async (res) => {
      if (res.tapIndex === 0) {
        // 修改名称
        uni.showModal({
          title: '修改团队名称',
          editable: true,
          content: '',
          placeholderText: dormitory.value.name || '',
          success: async (r) => {
            if (r.confirm && r.content) {
              try {
                await dormitoryApi.updateName(dormitoryId.value, r.content.trim())
                dormitory.value.name = r.content.trim()
                uni.showToast({ title: '修改成功', icon: 'success' })
              } catch (err) {
                uni.showToast({ title: '修改失败', icon: 'none' })
              }
            }
          }
        })
      } else if (res.tapIndex === 1) {
        // 退出宿舍
        uni.showModal({
          title: '提示',
          content: '确定退出当前团队吗？',
          success: async (r) => {
            if (r.confirm) {
              try {
                await dormitoryApi.leave(dormitory.value.id)
                uni.showToast({ title: '已退出', icon: 'success' })
                setTimeout(() => uni.navigateBack(), 1000)
              } catch (err) {
                uni.showToast({ title: '退出失败', icon: 'none' })
              }
            }
          }
        })
      }
    }
  })
}

function handleSwitch() {
  uni.navigateTo({ url: PAGE_PATH.DORMITORY_LIST })
}

function handleMember(m) {
  if (m.isLeader) return
  uni.showActionSheet({
    itemList: ['移出团队'],
    success: async (res) => {
      if (res.tapIndex === 0) {
        try {
          await dormitoryApi.kickMember(dormitoryId.value, m.userId)
          uni.showToast({ title: '已移出', icon: 'success' })
          fetchDetail()
        } catch (err) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

async function copyCode() {
  uni.setClipboardData({
    data: dormitory.value.invitationCode || '',
    success: () => uni.showToast({ title: '邀请码已复制', icon: 'success' })
  })
}

async function refreshCode() {
  try {
    const id = dormitory.value.id || dormitoryId.value
    const res = await dormitoryApi.refreshCode(id)
    dormitory.value.invitationCode = res?.invitationCode || dormitory.value.invitationCode
    uni.showToast({ title: '邀请码已刷新', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '刷新失败', icon: 'none' })
  }
}

function inviteFriend() {
  const code = dormitory.value.invitationCode || ''
  // #ifdef MP-WEIXIN
  uni.setClipboardData({
    data: code,
    success: () => uni.showToast({ title: '邀请码已复制，请发送给好友', icon: 'success' })
  })
  // #endif
  // #ifndef MP-WEIXIN
  const name = dormitory.value.name || '团队'
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({
      title: `加入「${name}」团队`,
      text: `邀请你加入「${name}」团队，邀请码：${code}`
    }).catch(() => {})
  } else {
    uni.setClipboardData({
      data: code,
      success: () => uni.showToast({ title: '邀请码已复制，请发送给好友', icon: 'success' })
    })
  }
  // #endif
}

function handleAction(type) {
  const labels = { log: '团队日志', settings: '团队设置' }
  uni.showToast({ title: `「${labels[type]}」开发中`, icon: 'none' })
}

let refreshTimer = null

async function autoRefreshCode() {
  try {
    const id = dormitory.value.id || dormitoryId.value
    const res = await dormitoryApi.refreshCode(id)
    if (res?.invitationCode) {
      dormitory.value.invitationCode = res.invitationCode
    }
  } catch (err) { /* 静默刷新 */ }
}

onMounted(() => {
  // 每30分钟自动刷新邀请码
  refreshTimer = setInterval(autoRefreshCode, 30 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})

// 微信小程序分享：点击按钮 → 弹出分享面板 → 发送小程序卡片给好友
onShareAppMessage(() => {
  return {
    title: `邀请你加入「${dormitory.value.name || '团队'}」`,
    path: `${PAGE_PATH.DORMITORY_LIST}?inviteCode=${dormitory.value.invitationCode || ''}`,
    imageUrl: '/static/tabbar/xct.png',
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f3fcf0 0%, #edf6ea 50%, #f9f4ff 100%);
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
}

.bar-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  &:active { background: rgba(0,0,0,0.05); }
}

.bar-icon {
  font-size: 16px; color: #006d33; font-weight: 700;
  &.more { font-size: 20px; letter-spacing: 1px; }
}

.bar-title { font-size: 16px; font-weight: 700; color: #006d33; }

.content {
  flex: 1;
  padding-bottom: 30px;
}

.content-inner {
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 14px;
}

.header-card {
  position: relative; overflow: hidden;
  border-radius: 16px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.header-blur {
  position: absolute; right: -30px; top: -30px;
  width: 100px; height: 100px; border-radius: 50%;
  background: rgba(7,193,96,0.1);
}

.header-content {
  position: relative; z-index: 10;
  padding: 14px;
  display: flex; flex-direction: column; gap: 6px;
}

.header-row {
  display: flex; justify-content: space-between; align-items: center;
}

.building-tag {
  padding: 3px 8px;
  background: rgba(7,193,96,0.12);
  border-radius: 10px;
}

.tag-text { font-size: 10px; color: #00471f; font-weight: 500; }
.room-num { font-size: 10px; color: #3d4a3d; font-weight: 500; }

.dorm-name-row {
  display: flex; align-items: center; gap: 5px;
  &:active { transform: scale(0.98); }
}

.dorm-name { font-size: 17px; font-weight: 700; color: #161d16; }
.expand-icon { font-size: 10px; color: #006d33; }

.welcome-msg {
  font-size: 12px; color: #3d4a3d; margin-bottom: 4px;
}

.stats-row { display: flex; gap: 8px; }

.stat-item {
  flex: 1;
  display: flex; align-items: center; gap: 8px;
  padding: 8px;
  border-radius: 10px;
  background: #edf6ea;
}

.stat-icon-box {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  &.green-box { background: rgba(7,193,96,0.15); }
  &.purple-box { background: rgba(116,89,247,0.15); }
}

.stat-icon { font-size: 14px; }
.stat-info { display: flex; flex-direction: column; gap: 1px; }
.stat-label { font-size: 9px; color: #6c7b6c; font-weight: 700; }
.stat-value {
  font-size: 14px; font-weight: 700; color: #006d33;
  &.purple { color: #5b3cdd; }
}

.section { display: flex; flex-direction: column; gap: 8px; }

.section-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 2px;
}

.section-title { font-size: 15px; font-weight: 600; color: #161d16; }
.section-sub { font-size: 10px; color: #6c7b6c; }
.invite-title { padding: 0 2px; }

.member-list { display: flex; flex-direction: column; gap: 8px; }

.member-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 12px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 13px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  &:active { transform: scale(0.98); }
}

.member-left { display: flex; align-items: center; gap: 10px; }

.member-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  &.bg-lead { background: #e8f0e4; }
  &.bg-m1   { background: #e3f2fd; }
  &.bg-m2   { background: #fff3e0; }
  &.bg-m3   { background: #f3e5f5; }
}

.member-avatar-text { font-size: 17px; }
.member-avatar-img { width: 100%; height: 100%; border-radius: 50%; }
.member-info { display: flex; flex-direction: column; gap: 1px; }
.member-name { font-size: 13px; font-weight: 700; color: #161d16; }
.member-role {
  font-size: 10px; color: #6c7b6c;
  &.role-head { color: #006d33; }
  &.role-duty { color: #5b3cdd; }
}

.member-right { display: flex; align-items: center; gap: 6px; }

.duty-badge {
  padding: 2px 6px;
  background: rgba(91,60,221,0.08);
  color: #5b3cdd;
  font-size: 9px; font-weight: 700;
  border-radius: 8px;
}

.member-arrow { font-size: 15px; color: #c0c0c0; }

.invite-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 16px;
  padding: 18px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.invite-icon-wrap {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(7,193,96,0.08);
  display: flex; align-items: center; justify-content: center;
}

.invite-icon { font-size: 22px; }
.invite-heading { font-size: 14px; font-weight: 700; color: #161d16; }
.invite-desc { font-size: 11px; color: #3d4a3d; text-align: center; }

.code-row {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px;
  background: #e8f0e4;
  border-radius: 12px;
  border: 2px dashed rgba(108,123,108,0.2);
}

.code-text {
  font-size: 18px; font-weight: 800; color: #006d33; letter-spacing: 3px;
}

.copy-btn {
  padding: 4px; border-radius: 50%;
  &:active { background: rgba(0,0,0,0.05); }
}

.copy-icon { font-size: 15px; }

.share-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px;
  background: linear-gradient(90deg, #07c160, #45e17c);
  border-radius: 22px;
  box-shadow: 0 3px 12px rgba(7,193,96,0.2);
  border: none;
  font-size: inherit;
  line-height: inherit;
  &:active { transform: scale(0.95); }
  &::after { border: none; }
}

.share-icon { font-size: 14px; }
.share-text { font-size: 13px; font-weight: 700; color: #fff; }

.actions-row { display: flex; gap: 8px; }

.action-card {
  flex: 1;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 13px;
  padding: 14px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  &:active { transform: scale(0.95); }
}

.action-icon-wrap {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  &.purple-bg-light { background: linear-gradient(135deg, #e5deff, #fff); }
  &.green-bg-light  { background: linear-gradient(135deg, #e8f0e4, #fff); }
}

.action-icon { font-size: 17px; }
.action-label { font-size: 11px; font-weight: 700; color: #161d16; }

.bottom-spacer { height: 16px; }
</style>
