<template>
  <view class="page">
    <!-- Top Bar -->
    <view class="top-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="bar-title">切换团队</text>
      <view class="spacer"></view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="content-inner">
        <!-- Hero Banner -->
        <view class="hero-banner">
          <view class="hero-icons">
            <text class="hero-icon i1">🏠</text>
            <text class="hero-icon i2">🏢</text>
            <text class="hero-icon i3">🏘️</text>
          </view>
          <view class="hero-text">
            <text class="hero-title">空间切换</text>
            <text class="hero-desc">选择您要进入的寝室生活空间</text>
          </view>
        </view>

        <!-- Loading Skeleton -->
        <view class="skeleton-list" v-if="loading">
          <view class="skeleton-card" v-for="i in 2" :key="i">
            <view class="skeleton-left">
              <view class="skeleton-avatar"></view>
              <view class="skeleton-lines">
                <view class="skeleton-line w-60"></view>
                <view class="skeleton-line w-30"></view>
              </view>
            </view>
            <view class="skeleton-btn"></view>
          </view>
        </view>

        <!-- Dormitory List -->
        <view class="dorm-list" v-if="!loading && dormList.length > 0">
          <view
            v-for="(dorm, index) in dormList"
            :key="dorm.id"
            class="dorm-card"
            :class="{ active: dorm.id === activeDormitoryId }"
            @click="enterDorm(dorm)"
          >
            <view class="card-left">
              <view class="card-icon-box" :class="dorm.id === activeDormitoryId ? 'active-box' : (index % 2 === 0 ? 'purple-box' : 'pink-box')">
                <text class="card-icon">{{ dorm.id === activeDormitoryId ? '🏠' : (index % 2 === 0 ? '🏢' : '🏘️') }}</text>
              </view>
              <view class="card-info">
                <text class="card-name">{{ dorm.name }}</text>
                <text class="card-loc">{{ dorm.memberCount || 0 }} 位成员</text>
                <view class="card-badge" v-if="dorm.id === activeDormitoryId">
                  <text class="badge-text">当前团队</text>
                </view>
              </view>
            </view>
            <view class="check-circle" v-if="dorm.id === activeDormitoryId">
              <text class="check-icon">✓</text>
            </view>
            <view class="switch-btn" v-else @click.stop="switchToDorm(dorm)">
              <text class="switch-text">切换</text>
            </view>
          </view>
        </view>

        <!-- Empty State -->
        <view class="empty-state" v-if="!loading && dormList.length === 0">
          <text class="empty-icon">🏠</text>
          <text class="empty-title">还没有加入团队</text>
          <text class="empty-desc">点击下方按钮加入团队，或让队长发邀请码给你</text>
        </view>

        <!-- Community Banner -->
        <view class="community-card">
          <view class="community-overlay">
            <text class="community-label">社区公告</text>
            <text class="community-title">管理您的多个生活空间</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Bottom Action -->
    <view class="bottom-bar">
      <view class="join-btn" @click="joinDorm">
        <text class="join-icon">+</text>
        <text class="join-text">加入新团队</text>
      </view>
      <text class="help-text">需要帮助？请联系团队管理员</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { dormitoryApi } from '@/api/modules/dormitory'
import { useUserStore } from '@/store/useUserStore'

const userStore = useUserStore()
const dormList = ref([])
const loading = ref(true)
const switching = ref(false)

// 从 store 获取当前活跃宿舍 ID
const activeDormitoryId = computed(() => userStore.userInfo?.activeDormitoryId)

async function fetchList() {
  try {
    const data = await dormitoryApi.getList()
    dormList.value = Array.isArray(data) ? data : (data?.list || [])
  } catch (err) {
    uni.showToast({ title: '加载团队列表失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function enterDorm(dorm) {
  // 持久化 dormitoryId，确保详情页能获取到
  uni.setStorageSync('_currentDormId', dorm.id)
  uni.navigateTo({ url: '/pages/dormitory/detail?id=' + dorm.id + '&name=' + encodeURIComponent(dorm.name) })
}

async function switchToDorm(dorm) {
  if (switching.value) return
  switching.value = true
  try {
    await dormitoryApi.switchDorm(dorm.id)
    uni.showToast({ title: '已切换到 ' + dorm.name, icon: 'success' })
    await Promise.all([fetchList(), userStore.fetchUserInfo()])
  } catch (err) {
    uni.showToast({ title: err?.message || '切换失败', icon: 'none' })
  } finally {
    switching.value = false
  }
}

async function joinDorm() {
  uni.showModal({
    title: '加入团队',
    content: '',
    editable: true,
    placeholderText: '输入邀请码，如 HL-402-A',
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          await dormitoryApi.join(res.content.trim())
          uni.showToast({ title: '加入成功', icon: 'success' })
          await Promise.all([fetchList(), userStore.fetchUserInfo()])
        } catch (err) {
          uni.showToast({ title: err?.message || '加入失败', icon: 'none' })
        }
      }
    }
  })
}

onMounted(async () => {
  if (!userStore.userInfo?.activeDormitoryId) {
    await userStore.fetchUserInfo()
  }
  fetchList()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #f3fcf0 0%, #e8f0e4 100%);
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
}

.back-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  &:active { background: rgba(0,0,0,0.05); }
}

.back-icon { font-size: 18px; color: #3d4a3d; font-weight: 600; }
.bar-title { font-size: 16px; font-weight: 700; color: #006d33; }
.spacer { width: 36px; }

.content {
  flex: 1;
  padding-bottom: 120px;
}

.content-inner {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-banner {
  position: relative;
  padding: 24px 18px;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffdadc 0%, rgba(102,255,149,0.3) 50%, #e5deff 100%);
  display: flex;
  align-items: flex-end;
}

.hero-icons {
  position: absolute; right: 12px; top: 18px;
  display: flex; gap: 4px; opacity: 0.4;
}

.hero-icon {
  &.i1 { font-size: 26px; }
  &.i2 { font-size: 34px; }
  &.i3 { font-size: 26px; }
}

.hero-text { display: flex; flex-direction: column; gap: 3px; }
.hero-title { font-size: 17px; font-weight: 700; color: #161d16; }
.hero-desc { font-size: 12px; color: #161d16; opacity: 0.8; }

.dorm-list { display: flex; flex-direction: column; gap: 10px; }

.dorm-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  &:active { transform: scale(0.98); }

  &.active {
    border: 2px solid #07c160;
    box-shadow: 0 0 12px rgba(7,193,96,0.12);
  }
}

.card-left { display: flex; align-items: center; gap: 12px; }

.card-icon-box {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  &.active-box { background: #07c160; }
  &.purple-box { background: #e5deff; }
  &.pink-box   { background: #ffdadc; }
}

.card-icon { font-size: 22px; }
.card-info { display: flex; flex-direction: column; gap: 2px; }
.card-name { font-size: 14px; font-weight: 600; color: #161d16; }
.card-loc  { font-size: 11px; color: #3d4a3d; opacity: 0.7; }

.card-badge { margin-top: 3px; align-self: flex-start; }
.badge-text {
  display: inline-block;
  padding: 2px 8px;
  background: #07c160; color: #fff;
  font-size: 9px; font-weight: 700;
  border-radius: 10px; letter-spacing: 1px;
}

.check-circle {
  width: 30px; height: 30px; border-radius: 50%;
  background: #07c160;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.check-icon { font-size: 15px; color: #fff; font-weight: bold; }

.switch-btn {
  padding: 8px 16px;
  border-radius: 18px;
  background: #07c160;
  box-shadow: 0 2px 8px rgba(7,193,96,0.25);
  flex-shrink: 0;
  &:active { transform: scale(0.95); opacity: 0.85; }
}

.switch-text {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.community-card {
  position: relative;
  padding: 22px 18px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #006d33, #07c160);
}

.community-overlay {
  display: flex; flex-direction: column; gap: 4px;
}

.community-label {
  font-size: 10px; color: rgba(255,255,255,0.8);
  letter-spacing: 1px;
}

.community-title {
  font-size: 15px; font-weight: 600; color: #fff;
  max-width: 70%;
}

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 12px 14px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, #f3fcf0 0%, rgba(243,252,240,0.95) 60%, transparent 100%);
}

.join-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px;
  background: #006d33; border-radius: 22px;
  box-shadow: 0 3px 16px rgba(0,109,51,0.3);
  &:active { transform: scale(0.97); }
}

.join-icon { font-size: 18px; color: #fff; font-weight: 300; }
.join-text { font-size: 14px; font-weight: 700; color: #fff; }

.help-text {
  text-align: center; font-size: 10px; color: #6c7b6c; margin-top: 10px;
}

// ==================== Skeleton ====================
.skeleton-list {
  display: flex; flex-direction: column; gap: 10px;
}

.skeleton-card {
  background: rgba(255,255,255,0.5);
  border-radius: 16px;
  padding: 14px;
  display: flex; align-items: center; justify-content: space-between;
}

.skeleton-left {
  display: flex; align-items: center; gap: 12px;
}

.skeleton-avatar {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-lines {
  display: flex; flex-direction: column; gap: 6px;
}

.skeleton-line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  &.w-60 { width: 60%; }
  &.w-30 { width: 30%; }
}

.skeleton-btn {
  width: 54px; height: 30px; border-radius: 15px;
  background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// ==================== Empty State ====================
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 36px 20px;
  gap: 8px;
}

.empty-icon {
  font-size: 40px; opacity: 0.6;
}

.empty-title {
  font-size: 15px; font-weight: 600; color: #3d4a3d;
}

.empty-desc {
  font-size: 12px; color: #6c7b6c; text-align: center;
}
</style>
