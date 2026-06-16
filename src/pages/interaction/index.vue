<template>
  <view class="page">
    <view class="content">
        <!-- Welcome Card -->
        <view class="welcome-card">
          <view class="welcome-text">
            <text class="welcome-label">Harmony Dashboard</text>
            <text class="welcome-title">你好，值日生</text>
            <text class="welcome-desc">保持环境整洁，享受和谐生活。</text>
          </view>
          <view class="welcome-decor">
            <text class="welcome-decor-icon">✨</text>
          </view>
        </view>

        <!-- Quick Schedule Button -->
        <view class="quick-btn" @click="openDutyModal">
          <text class="quick-icon">📋</text>
          <text class="quick-text">快速排班</text>
        </view>

        <!-- Weekly Duty Cards -->
        <view class="section">
          <view class="section-top">
            <text class="section-title">本周值日表</text>
            <text class="section-link" @click="handleHistory">查看全部 ›</text>
          </view>
          <scroll-view scroll-x class="week-scroll" :show-scrollbar="false">
            <view class="week-list" v-if="weekSchedules.length > 0">
              <view
                v-for="day in weekSchedules"
                :key="day.date"
                class="day-card"
                :class="{ today: day.isToday, rest: day.isRest }"
              >
                <text class="day-label">{{ day.label }}</text>
                <text class="day-week">{{ day.weekLabel }}</text>
                <view class="day-avatar">
                  <image v-if="day.avatarUrl" class="day-avatar-img" :src="day.avatarUrl" mode="aspectFill" />
                  <text v-else class="day-avatar-text">👤</text>
                </view>
                <text class="day-name">{{ day.person || '待安排' }}</text>
                <view
                  class="day-status"
                  :class="day.isToday ? 'active' : (day.person ? 'pending' : 'empty')"
                >
                  <text class="day-status-text">
                    {{ day.isToday ? '进行中' : (day.person ? '待开始' : '未排班') }}
                  </text>
                </view>
              </view>
            </view>
            <view class="week-empty" v-else>
              <text class="week-empty-text">暂无排班</text>
            </view>
          </scroll-view>
        </view>

        <!-- Random Picker -->
        <view class="picker-card">
          <view class="picker-header">
            <text class="picker-title">随机抽选</text>
            <text class="picker-sub">Fairness at your fingertips!</text>
          </view>

          <view class="picker-wheel-wrap">
            <view class="wheel-outer"></view>
            <view class="wheel-inner"></view>
            <view class="wheel-center" :class="{ spinning: isPicking }">
              <text class="wheel-icon">{{ pickerIcon }}</text>
            </view>
          </view>

          <view class="pick-btn" :class="{ disabled: isPicking }" @click="startRandomPick">
            <text class="pick-btn-text">{{ isPicking ? '抽取中...' : '开始随机抽取' }}</text>
          </view>

          <text class="result-text" :class="{ visible: resultVisible }">{{ resultText }}</text>
        </view>

        <!-- Action Cards -->
        <view class="action-cards">
          <view class="action-card" @click="handleHistory">
            <view class="action-card-icon hist-icon">
              <text class="action-icon-text">📋</text>
            </view>
            <view class="action-card-info">
              <text class="action-card-title">值日历史</text>
              <text class="action-card-desc">查看往期记录</text>
            </view>
          </view>
          <view class="action-card" @click="handleSwap">
            <view class="action-card-icon swap-icon">
              <text class="action-icon-text">🔄</text>
            </view>
            <view class="action-card-info">
              <text class="action-card-title">申请换班</text>
              <text class="action-card-desc">发起班次调整</text>
            </view>
          </view>
        </view>

        <!-- #ifdef H5 -->
        <TabBar :current="1" />
        <!-- #endif -->
      </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { scheduleApi } from '@/api/modules/schedule'
import { useUserStore } from '@/store/useUserStore'
// #ifdef H5
import TabBar from '@/components/TabBar.vue'
// #endif

const userStore = useUserStore()
const dormitoryId = computed(() => userStore.userInfo?.activeDormitoryId || '')
const weekSchedules = ref([])

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const icons = ['🧠', '🎮', '✨', '🎉', '🥳']
const isPicking = ref(false)
const pickerIcon = ref('👥')
const resultText = ref('')
const resultVisible = ref(false)

function formatDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

async function loadSchedules() {
  if (!dormitoryId.value) return
  try {
    const today = new Date()
    const start = new Date(today)
    const end = new Date(today)
    end.setDate(today.getDate() + 6)

    const list = await scheduleApi.getList({
      dormitoryId: dormitoryId.value,
      from: formatDate(start),
      to: formatDate(end),
      status: 'PENDING'
    })

    const nameMap = {}
    const avatarMap = {}
    if (Array.isArray(list)) {
      list.forEach(s => {
        nameMap[s.scheduleDate] = s.nickname
        if (s.avatarUrl) avatarMap[s.scheduleDate] = s.avatarUrl
      })
    }

    const days = []
    const todayStr = formatDate(today)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const dateStr = formatDate(d)
      const isToday = dateStr === todayStr
      const isRest = d.getDay() === 0 || d.getDay() === 6

      let label
      if (isToday) label = '今天'
      else {
        const diff = Math.round((d - today) / 86400000)
        if (diff === 1) label = '明天'
        else if (diff === 2) label = '后天'
        else label = d.getMonth() + 1 + '月' + d.getDate() + '日'
      }

      days.push({
        date: dateStr,
        label,
        weekLabel: '周' + weekLabels[d.getDay()],
        person: nameMap[dateStr] || null,
        avatarUrl: avatarMap[dateStr] || '',
        isToday,
        isRest
      })
    }
    weekSchedules.value = days
  } catch (err) { /* ignore */ }
}

// 监听排班变更事件，刷新本周值日表
uni.$on('dutyChanged', loadSchedules)

function handleHistory() {
  uni.navigateTo({ url: '/pages/interaction/history' })
}

function handleSwap() {
  uni.showToast({ title: '换班功能开发中', icon: 'none' })
}

function openDutyModal() {
  uni.navigateTo({ url: '/pages/schedule/index' })
}

function startRandomPick() {
  if (isPicking.value) return
  isPicking.value = true
  resultVisible.value = false
  resultText.value = ''

  const members = weekSchedules.value.filter(d => d.person).map(d => d.person)
  const pool = members.length > 0 ? members : ['小明', '小红', '小刚']

  setTimeout(() => {
    const winner = pool[Math.floor(Math.random() * pool.length)]
    const randomIcon = icons[Math.floor(Math.random() * icons.length)]
    isPicking.value = false
    pickerIcon.value = randomIcon
    resultText.value = '🎉 选中的幸运儿: ' + winner
    resultVisible.value = true
  }, 2000)
}

onShow(() => {
  loadSchedules()
  // #ifdef MP-WEIXIN
  var p = getCurrentPages()
  if (p && p.length > 0) {
    var page = p[p.length - 1]
    if (typeof page.getTabBar === 'function') {
      var tb = page.getTabBar()
      if (tb) tb.setData({ selected: 1 })
    }
  }
  // #endif
})
</script>

<style lang="scss" scoped>
.page {
  background: #f3fcf0;
}

.content {
  padding: 12px 14px;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
}
.welcome-card { margin-bottom: 16px; }
.quick-btn { margin-bottom: 16px; }
.section { margin-bottom: 16px; }
.picker-card { margin-bottom: 16px; }
.action-cards { margin-bottom: 16px; }

// ==================== Welcome Card ====================
.welcome-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 18px;
  background: rgba(7,193,96,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text {
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.welcome-label {
  font-size: 11px;
  font-weight: 500;
  color: #006d33;
  text-transform: uppercase;
}

.welcome-title {
  font-size: 18px;
  font-weight: 700;
  color: #161d16;
}

.welcome-desc {
  font-size: 13px;
  color: #3d4a3d;
}

.welcome-decor {
  position: absolute;
  right: -20px;
  top: -20px;
  opacity: 0.2;
}

.welcome-decor-icon {
  font-size: 80px;
}

// ==================== Quick Button ====================
.quick-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #07c160, #006d33);
  border-radius: 22px;
  box-shadow: 0 4px 16px rgba(7,193,96,0.25);
  &:active { transform: scale(0.97); }
}

.quick-icon { font-size: 18px; }

.quick-text {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

// ==================== Section ====================
.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #161d16;
}

.section-link {
  font-size: 12px;
  font-weight: 500;
  color: #006d33;
  &:active { opacity: 0.7; }
}

// ==================== Week Cards ====================
.week-scroll { width: 100%; }

.week-list {
  display: flex;
  gap: 12px;
  padding-bottom: 4px;
}

.day-card {
  flex-shrink: 0;
  width: 30vw;
  max-width: 140px;
  min-width: 110px;
  padding: 14px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  &.today {
    border-top: 4px solid #07c160;
  }

  &.rest {
    opacity: 0.5;
  }
}

.day-label {
  font-size: 11px;
  font-weight: 500;
  color: #6c7b6c;
}

.day-week {
  font-size: 14px;
  font-weight: 600;
  color: #006d33;
}

.today .day-week { color: #07c160; }

.day-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #e8f0e4;
  display: flex; align-items: center; justify-content: center;
}

.day-avatar-text { font-size: 18px; }
.day-avatar-img { width: 100%; height: 100%; border-radius: 50%; }

.day-name {
  font-size: 14px;
  font-weight: 700;
  color: #161d16;
}

.day-status {
  padding: 3px 10px;
  border-radius: 20px;

  &.active { background: rgba(7,193,96,0.1); }
  &.pending { background: #e8f0e4; }
  &.empty { background: rgba(108,123,108,0.05); }
}

.day-status-text {
  font-size: 10px;
  font-weight: 500;
  color: #3d4a3d;
}

.active .day-status-text { color: #006d33; }

.week-empty {
  padding: 20px;
  text-align: center;
}

.week-empty-text {
  font-size: 12px;
  color: #6c7b6c;
}

// ==================== Picker Card ====================
.picker-card {
  background: rgba(229,222,255,0.4);
  border-radius: 26px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  overflow: hidden;
}

.picker-header { text-align: center; }

.picker-title {
  font-size: 17px;
  font-weight: 700;
  color: #161d16;
  display: block;
}

.picker-sub {
  font-size: 11px;
  font-weight: 500;
  color: #5b3cdd;
}

.picker-wheel-wrap {
  position: relative;
  width: 32vw;
  height: 32vw;
  max-width: 140px;
  max-height: 140px;
  min-width: 100px;
  min-height: 100px;
  display: flex; align-items: center; justify-content: center;
}

.wheel-outer {
  position: absolute;
  inset: 0;
  border: 3px dashed rgba(91,60,221,0.2);
  border-radius: 50%;
  animation: spin-slow 10s linear infinite;
}

.wheel-inner {
  position: absolute;
  inset: 5px;
  border: 2px solid rgba(91,60,221,0.08);
  border-radius: 50%;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.wheel-center {
  width: 55%;
  height: 55%;
  border-radius: 50%;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);

  &.spinning {
    animation: spin-fast 0.8s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
  }
}

@keyframes spin-fast {
  from { transform: rotate(0deg) scale(1); }
  to { transform: rotate(360deg) scale(1.1); }
}

.wheel-icon { font-size: 26px; }

.pick-btn {
  width: 100%;
  padding: 13px;
  background: #5b3cdd;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(91,60,221,0.3);
  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.5; }
}

.pick-btn-text {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.result-text {
  font-size: 14px;
  font-weight: 700;
  color: #441cc8;
  opacity: 0;
  transition: opacity 0.3s;

  &.visible { opacity: 1; }
}

// ==================== Action Cards ====================
.action-cards {
  display: flex;
  gap: 12px;
}

.action-card {
  flex: 1;
  padding: 14px;
  border-radius: 20px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 10px;
  &:active { transform: scale(0.97); }
}

.action-card-icon {
  width: 36px; height: 36px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;

  &.hist-icon { background: #e5deff; }
  &.swap-icon { background: rgba(255,129,145,0.15); }
}

.action-icon-text { font-size: 16px; }

.action-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-card-title {
  font-size: 14px;
  font-weight: 700;
  color: #161d16;
}

.action-card-desc {
  font-size: 11px;
  color: #6c7b6c;
}

.bottom-spacer { height: 100px; }
</style>
