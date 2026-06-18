<template>
  <view class="page">
    <view class="content">
      <!-- Welcome Section -->
      <view class="welcome-card">
        <text class="welcome-greeting">{{ greetingText }}</text>
        <text class="welcome-status" v-if="dormName">「{{ dormName }}」当前处于"值班"状态。</text>
      </view>

      <!-- Quick Actions -->
      <view class="actions-grid">
        <view class="action-item" @click="handleAction('expense')">
          <view class="action-icon-box green-tint">
            <text class="action-icon">💳</text>
          </view>
          <text class="action-label">费用支出</text>
        </view>
        <view class="action-item" @click="handleAction('reminder')">
          <view class="action-icon-box red-tint">
            <text class="action-icon">🔔</text>
          </view>
          <text class="action-label">消息提醒</text>
        </view>
        <view class="action-item" @click="handleAction('history')">
          <view class="action-icon-box purple-tint">
            <text class="action-icon">📋</text>
          </view>
          <text class="action-label">历史记录</text>
        </view>
      </view>

      <!-- Duty Notice -->
      <view class="section-block">
        <view class="section-header">
          <text class="section-title">值班公告</text>
          <text class="section-link" @click="handleSeeAll">查看全部</text>
        </view>
        <view class="announce-card">
          <view class="announce-tag">
            <text class="tag-icon">📋</text>
          </view>
          <view class="announce-content">
            <view class="announce-top">
              <text class="announce-title">本周值班安排</text>
              <text class="announce-time">刚刚更新</text>
            </view>
            <text class="announce-desc">本周值班表已发布，请各寝室成员及时查看自己的值班时间段，按时完成宿舍公共区域清洁及垃圾清理任务。</text>
          </view>
        </view>
      </view>

      <!-- Today's Duty -->
      <view class="section-block">
        <text class="section-title">今日值班</text>
        <view class="duty-card" @click="handleDutyDetail">
          <view class="duty-left">
            <view class="duty-avatar-area">
              <view class="duty-avatar">
                <image v-if="todayDuty?.avatarUrl" class="duty-avatar-img" :src="todayDuty.avatarUrl" mode="aspectFill" />
                <text v-else class="duty-avatar-text">👤</text>
              </view>
              <view class="duty-check">
                <text class="check-icon">✓</text>
              </view>
            </view>
            <view class="duty-info">
              <text class="duty-name">{{ todayDuty ? todayDuty.nickname : '未安排' }}</text>
              <text class="duty-area">{{ todayDuty ? (todayDuty.timeSlot || '值班') : '暂无今日值班安排' }}</text>
            </view>
          </view>
          <view class="duty-right">
            <view class="duty-status" :class="todayDuty ? 'active' : 'inactive'">
              <text class="duty-status-text">{{ todayDuty ? '进行中' : '待安排' }}</text>
            </view>
            <text class="duty-due" v-if="todayDuty">截止时间：22:00</text>
          </view>
        </view>
      </view>

      <!-- Featured Cards -->
      <view class="featured-grid">
        <view class="feat-card feat-main">
          <text class="feat-main-icon">⭐</text>
          <view class="feat-main-text">
            <text class="feat-main-title">值班之星</text>
            <text class="feat-main-sub">402寝室本月值班完成率100%！</text>
          </view>
        </view>
        <view class="feat-right">
          <view class="feat-card feat-small" @click="refreshWeather(false)">
            <text class="feat-temp">{{ temperature }}</text>
            <text class="feat-label">{{ weatherLabel }}</text>
            <text class="feat-loc" v-if="!isGPSLocation">点击开启定位</text>
          </view>
          <view class="feat-card feat-small purple-card">
            <text class="feat-wifi-icon">📶</text>
            <text class="feat-label purple-text">信号强</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </view>

    <!-- FAB -->
    <view class="fab" @click="handleFab">
      <text class="fab-text">+</text>
    </view>

    <!-- #ifdef H5 -->
    <TabBar :current="0" />
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/useUserStore'
import { scheduleApi } from '@/api/modules/schedule'
import { dormitoryApi } from '@/api/modules/dormitory'
// #ifdef H5
import TabBar from '@/components/TabBar.vue'
// #endif

const userStore = useUserStore()
const greetingText = ref('晚上好！🌙')
const temperature = ref('--°C')
const weatherLabel = ref('获取位置中...')
const weatherCode = ref(0)
const isGPSLocation = ref(false)
const todayDuty = ref(null)
const dormName = ref('首页')

const dormitoryId = computed(() => userStore.userInfo?.activeDormitoryId || '')
const userName = ref('')
function updateGreeting() {
  const hour = new Date().getHours()
  const name = userStore.userInfo?.nickname || ''
  userName.value = name
  if (hour >= 5 && hour < 12) {
    greetingText.value = `早上好${name ? '，' + name : ''}！👋`
  } else if (hour >= 12 && hour < 18) {
    greetingText.value = `下午好${name ? '，' + name : ''}！☀️`
  } else {
    greetingText.value = `晚上好${name ? '，' + name : ''}！🌙`
  }
}

async function fetchWeather(lat, lon) {
  try {
    const res = await uni.request({
      url: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code&timezone=auto`,
      method: 'GET',
      timeout: 8000
    })
    const data = res.data || res
    if (data?.current) {
      const realTemp = Math.round(data.current.temperature_2m)
      const feelsLike = Math.round(data.current.apparent_temperature)
      temperature.value = realTemp + '°C'
      weatherCode.value = data.current.weather_code || 0
      if (Math.abs(realTemp - feelsLike) >= 3) {
        weatherLabel.value = `体感${feelsLike}°C ` + getWeatherDesc(weatherCode.value)
      } else {
        weatherLabel.value = getWeatherDesc(weatherCode.value)
      }
    }
  } catch (err) {
    // fallback: keep default
  }
}

function getWeatherDesc(code) {
  if (code <= 3) return '晴朗'
  if (code <= 48) return '多云'
  if (code <= 57) return '小雨'
  if (code <= 67) return '中雨'
  if (code <= 77) return '小雪'
  if (code <= 82) return '中雨'
  if (code <= 86) return '小雪'
  return '阴天'
}

async function refreshWeather(silent = true) {
  if (!silent) {
    uni.showToast({ title: '正在更新...', icon: 'none', duration: 1000 })
  }
  try {
    const loc = await new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'wgs84',
        success: resolve,
        fail: reject
      })
    })
    isGPSLocation.value = true
    await fetchWeather(loc.latitude, loc.longitude)
  } catch (err) {
    // GPS 失败，使用 IP 粗略定位或默认城市
    isGPSLocation.value = false
    weatherLabel.value = '无法定位，点击刷新'
    temperature.value = '--°C'
  }
}

function handleAction(type) {
  const titles = { expense: '费用支出', reminder: '消息提醒', history: '历史记录' }
  uni.showToast({ title: `${titles[type]}（开发中）`, icon: 'none' })
}

function handleSeeAll() {
  uni.navigateTo({ url: '/pages/interaction/history' })
}

async function fetchTodayDuty() {
  if (!dormitoryId.value) return
  try {
    const today = new Date()
    const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
    const list = await scheduleApi.getList({
      dormitoryId: dormitoryId.value,
      from: dateStr,
      to: dateStr,
      status: 'PENDING'
    })
    todayDuty.value = (Array.isArray(list) && list.length > 0) ? list[0] : null
  } catch (err) { /* ignore */ }
}

function handleDutyDetail() {
  uni.navigateTo({ url: '/pages/schedule/index' })
}

// 监听排班变更事件（排班页清除/生成后触发）
uni.$on('dutyChanged', fetchTodayDuty)

async function fetchDormName() {
  if (!dormitoryId.value) return
  try {
    const data = await dormitoryApi.getList()
    const list = Array.isArray(data) ? data : (data?.list || [])
    const active = list.find(d => d.id === dormitoryId.value)
    if (active?.name) {
      dormName.value = active.name
      uni.setNavigationBarTitle({ title: active.name })
    }
  } catch(e) {}
}

function handleFab() {
  uni.showToast({ title: '快速创建（开发中）', icon: 'none' })
}

onShow(() => {
  updateGreeting()
  refreshWeather()
  fetchTodayDuty()
  fetchDormName()
  // #ifdef MP-WEIXIN
  var p = getCurrentPages()
  if (p && p.length > 0) {
    var page = p[p.length - 1]
    if (typeof page.getTabBar === 'function') {
      var tb = page.getTabBar()
      if (tb) tb.setData({ selected: 0 })
    }
  }
  // #endif
})

</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f3fcf0 0%, #e8f0e4 100%);
}

// ==================== Content ====================
.content {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// ==================== Welcome Card ====================
.welcome-card {
  border-radius: 20px;
  padding: 22px 18px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
}

.welcome-greeting {
  font-size: 20px;
  font-weight: 700;
  color: #006d33;
}

.welcome-status {
  font-size: 13px;
  color: #3d4a3d;
  opacity: 0.8;
}

// ==================== Quick Actions ====================
.actions-grid {
  display: flex;
  gap: 10px;
}

.action-item {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 14px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);

  &:active { transform: scale(0.95); }
}

.action-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &.green-tint  { background: rgba(7, 193, 96, 0.15); }
  &.red-tint    { background: rgba(173, 45, 71, 0.12); }
  &.purple-tint { background: rgba(91, 60, 221, 0.12); }
}

.action-icon {
  font-size: 18px;
}

.action-label {
  font-size: 11px;
  font-weight: 500;
  color: #3d4a3d;
}

// ==================== Section ====================
.section-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #161d16;
}

.section-link {
  font-size: 11px;
  color: #006d33;
  font-weight: 500;

  &:active { opacity: 0.7; }
}

// ==================== Announce Card ====================
.announce-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 18px;
  padding: 14px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.announce-tag {
  background: #ff8191;
  padding: 6px;
  border-radius: 10px;
  height: fit-content;
}

.tag-icon {
  font-size: 15px;
}

.announce-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.announce-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.announce-title {
  font-size: 14px;
  font-weight: 700;
  color: #161d16;
}

.announce-time {
  font-size: 11px;
  color: #6c7b6c;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 6px;
}

.announce-desc {
  font-size: 12px;
  color: #3d4a3d;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

// ==================== Duty Card ====================
.duty-card {
  background: #fff;
  border-radius: 20px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);

  &:active { transform: scale(0.98); }
}

.duty-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.duty-avatar-area {
  position: relative;
}

.duty-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: #e8f0e4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.duty-avatar-text {
  font-size: 20px;
}
.duty-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.duty-check {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #07c160;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  font-size: 10px;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}

.duty-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.duty-name {
  font-size: 15px;
  font-weight: 600;
  color: #161d16;
}

.duty-area {
  font-size: 12px;
  color: #6c7b6c;
}

.duty-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}

.duty-status {
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(7, 193, 96, 0.1);
  align-self: flex-end;

  &.inactive {
    background: rgba(108, 123, 108, 0.08);
  }
}

.duty-status-text {
  font-size: 11px;
  font-weight: 500;
  color: #006d33;
}

.duty-due {
  font-size: 11px;
  color: #6c7b6c;
}

// ==================== Featured Cards ====================
.featured-grid {
  display: flex;
  gap: 12px;
}

.feat-card {
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.feat-main {
  flex: 1;
  background: #07c160;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.feat-main-icon {
  font-size: 26px;
}

.feat-main-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.feat-main-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.feat-main-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}

.feat-right {
  flex: 0 0 30%;
  max-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feat-small {
  flex: 1;
  background: #fff;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;

  &.purple-card {
    background: #e5deff;
  }
}

.feat-temp {
  font-size: 17px;
  font-weight: 700;
  color: #006d33;
}

.feat-wifi-icon {
  font-size: 18px;
}

.feat-label {
  font-size: 11px;
  font-weight: 500;
  color: #3d4a3d;
  text-align: center;

  &.purple-text {
    color: #5b3cdd;
    font-weight: 700;
  }
}

.feat-loc {
  font-size: 9px;
  color: #07c160;
  text-align: center;
}

// ==================== FAB ====================
.fab {
  position: fixed;
  right: 20px;
  bottom: 90px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #006d33;
  box-shadow: 0 4px 16px rgba(0, 109, 51, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;

  &:active { transform: scale(0.95); }
}

.fab-text {
  font-size: 24px;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}

// ==================== Spacer ====================
.bottom-spacer {
  height: 100px;
}
</style>
