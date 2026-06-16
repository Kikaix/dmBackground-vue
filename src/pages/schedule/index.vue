<template>
  <view class="page">
    <!-- Top Bar -->
    <view class="top-bar">
      <view class="bar-btn" @click="goBack">
        <text class="bar-icon">←</text>
      </view>
      <text class="bar-title">智能快捷排班</text>
      <view class="bar-btn" @click="handleNotify">
        <text class="bar-icon">🔔</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="content-inner">
        <!-- Member Sequence -->
        <view class="section">
        <view class="section-top">
          <view class="section-info">
            <text class="section-title">选择排班顺序</text>
            <text class="section-desc">点击成员确定循环轮替的先后顺序</text>
          </view>
          <text class="reset-link" @click="resetOrder">↻ 重置顺序</text>
        </view>
        <scroll-view scroll-x class="member-scroll" :show-scrollbar="false">
          <view class="member-list">
            <view v-for="(m, i) in sortedMembers" :key="m.userId" class="member-item" @click="toggleOrder(i)">
              <view class="member-avatar-wrap">
                <view class="member-avatar" :class="'bg-' + (i % 4)">
                  <image v-if="sortedMembers[i]?.avatarUrl" class="member-avatar-img" :src="sortedMembers[i].avatarUrl" mode="aspectFill" />
                  <text v-else class="member-avatar-text">👤</text>
                </view>
                <view class="order-badge">
                  <text class="order-num">{{ i + 1 }}</text>
                </view>
                <view class="remove-badge" @click.stop="removeMember(m.userId)">
                  <text class="remove-icon">×</text>
                </view>
              </view>
              <text class="member-name">{{ m.nickname }}</text>
            </view>
            <view class="member-item add" @click="addMember">
              <view class="member-avatar-wrap">
                <view class="member-avatar add-avatar">
                  <text class="add-icon">+</text>
                </view>
              </view>
              <text class="member-name add-text">添加</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Action Buttons -->
      <view class="actions-row">
        <view class="action-btn auto-btn" @click="autoSchedule">
          <view class="action-icon-wrap green-glass">
            <text class="action-icon">✨</text>
          </view>
          <text class="action-label auto-label">一键自动排班</text>
          <text class="action-sub">仅限法定工作日</text>
        </view>
        <view class="action-btn clear-btn" @click="clearSchedule">
          <view class="action-icon-wrap red-glass">
            <text class="action-icon">🗑️</text>
          </view>
          <text class="action-label clear-label">清除排班</text>
          <text class="action-sub">清除当前日期之后</text>
        </view>
      </view>

      <!-- Weekly Schedule -->
      <view class="section">
        <view class="section-top">
          <text class="section-title">本周排班明细</text>
          <picker class="week-picker" mode="date" :value="weekStartDate" @change="onWeekChange">
            <view class="week-badge">
              <text class="week-badge-text">{{ weekRange }}</text>
              <text class="week-badge-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="schedule-list">
          <view
            v-for="day in weekDays"
            :key="day.date"
            class="day-card"
            :class="{
              locked: day.locked,
              current: day.isToday,
              weekend: day.isRest
            }"
          >
            <view class="day-left">
              <view class="day-date">
                <text class="day-num">{{ day.dayNum }}</text>
                <text class="day-week">{{ day.weekLabel }}</text>
              </view>
              <!-- Locked: past date -->
              <view class="day-person" v-if="day.locked && day.person">
                <view class="person-avatar filled">
                  <image v-if="day.personObj?.avatarUrl" class="person-avatar-img" :src="day.personObj.avatarUrl" mode="aspectFill" />
                  <text v-else class="person-avatar-text">👤</text>
                </view>
                <view class="person-info">
                  <text class="person-name locked-name">{{ day.person }}</text>
                  <text class="person-tag locked-tag">🔒 已结束 · 只读</text>
                </view>
              </view>
              <!-- Today: has person assigned -->
              <view class="day-person" v-else-if="day.isToday && day.person">
                <view class="person-avatar filled">
                  <image v-if="day.personObj?.avatarUrl" class="person-avatar-img" :src="day.personObj.avatarUrl" mode="aspectFill" />
                  <text v-else class="person-avatar-text">👤</text>
                </view>
                <view class="person-info">
                  <text class="person-name">{{ day.person }}</text>
                  <text class="person-tag current-tag">⭐ 正在进行</text>
                </view>
              </view>
              <!-- Today: not assigned -->
              <view class="day-person" v-else-if="day.isToday && !day.person">
                <view class="person-avatar dashed green">
                  <text class="person-empty-icon">+</text>
                </view>
                <view class="person-info">
                  <text class="person-name">今日待分配</text>
                  <text class="person-tag current-tag">⭐ 正在进行</text>
                </view>
              </view>
              <!-- Rest day (weekend or holiday) -->
              <view class="day-person" v-else-if="day.isRest">
                <text class="weekend-badge">休息日</text>
                <text class="weekend-text">无需值日</text>
              </view>
              <!-- Future: cleanable -->
              <view class="day-person" v-else-if="day.person">
                <view class="person-avatar filled">
                  <image v-if="day.personObj?.avatarUrl" class="person-avatar-img" :src="day.personObj.avatarUrl" mode="aspectFill" />
                  <text v-else class="person-avatar-text">👤</text>
                </view>
                <view class="person-info">
                  <text class="person-name">{{ day.person }}</text>
                  <text class="person-tag auto-tag">⚡ 自动分配</text>
                </view>
              </view>
              <!-- Future: not assigned -->
              <view class="day-person" v-else>
                <view class="person-avatar dashed">
                  <text class="person-empty-icon">+</text>
                </view>
                <view class="person-info">
                  <text class="person-name wait-name">待排班</text>
                  <text class="person-tag wait-tag">未分配值日生</text>
                </view>
              </view>
            </view>
            <view class="day-action" v-if="day.isToday">
              <text class="edit-icon">✎</text>
            </view>
            <text class="day-arrow" v-else-if="!day.isRest">›</text>
          </view>
        </view>
      </view>

      <!-- Info Banner -->
      <view class="info-card">
        <view class="info-icon-wrap">
          <text class="info-icon">ℹ️</text>
        </view>
        <text class="info-text">之前的日期只能单个修改，清除操作仅对未来日期生效。系统将自动跳过周末及法定节假日。</text>
      </view>

        <view class="bottom-spacer"></view>
      </view>
    </scroll-view>

    <!-- Save Bar -->
    <view class="save-bar">
      <view class="save-btn" @click="saveSchedule">
        <text class="save-icon">✓</text>
        <text class="save-text">保存排班计划</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { scheduleApi } from '@/api/modules/schedule'
import { dormitoryApi } from '@/api/modules/dormitory'
import { useUserStore } from '@/store/useUserStore'

const userStore = useUserStore()
const dormitoryId = computed(() => userStore.userInfo?.activeDormitoryId || '')
const allMembers = ref([])
const sortedMembers = ref([])

// 2026年法定节假日（无需排班）
const HOLIDAYS = new Set([
  '2026-01-01', '2026-01-02', '2026-01-03',           // 元旦
  '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23', // 春节
  '2026-04-05', '2026-04-06', '2026-04-07',           // 清明节
  '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05', // 劳动节
  '2026-06-19', '2026-06-20', '2026-06-21',           // 端午节
  '2026-09-25', '2026-09-26', '2026-09-27',           // 中秋节
  '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', // 国庆节
])

function isRestDay(dateStr) {
  const d = new Date(dateStr)
  return d.getDay() === 0 || d.getDay() === 6 || HOLIDAYS.has(dateStr)
}

// 从宿舍成员接口获取真实成员信息
async function fetchMembers() {
  try {
    const list = await dormitoryApi.getMembers(dormitoryId.value)
    if (Array.isArray(list)) {
      allMembers.value = list.map(m => ({
        userId: m.userId,
        nickname: m.nickname || '未知',
        avatarUrl: m.avatarUrl || ''
      }))
    }
  } catch (err) { /* 读取失败使用空列表 */ }
}

async function fetchOrder() {
  await fetchMembers()
  try {
    const data = await scheduleApi.getOrder(dormitoryId.value)
    if (data && data.length > 0) {
      sortedMembers.value = data
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(o => {
          const member = allMembers.value.find(m => m.userId === o.userId)
          return {
            userId: o.userId,
            nickname: member?.nickname || '成员' + o.userId,
            avatarUrl: member?.avatarUrl || ''
          }
        })
    } else {
      sortedMembers.value = []
    }
  } catch (err) {
    sortedMembers.value = []
  }
}

function toggleOrder(i) {
  const item = sortedMembers.value.splice(i, 1)[0]
  sortedMembers.value.push(item)
  uni.showToast({ title: `${item.nickname} 已移至末尾`, icon: 'none' })
}

async function resetOrder() {
  try {
    await scheduleApi.clearOrder(dormitoryId.value)
    sortedMembers.value = []
    uni.showToast({ title: '已清空排班顺序', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '清空失败', icon: 'none' })
  }
}

function addMember() {
  uni.navigateTo({ url: '/pages/schedule/member-select' })
}

// 成员选择页确认后调此方法刷新排班顺序
async function refreshOrder() {
  await fetchOrder()
}

// 从排班顺序中删除指定用户
async function removeMember(userId) {
  const member = sortedMembers.value.find(m => m.userId === userId)
  uni.showModal({
    title: '移除成员',
    content: `确定将 ${member?.nickname || userId} 从排班顺序中移除吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await scheduleApi.removeFromOrder(dormitoryId.value, userId)
          sortedMembers.value = sortedMembers.value.filter(m => m.userId !== userId)
          uni.showToast({ title: '已移除', icon: 'success' })
        } catch (err) {
          uni.showToast({ title: err?.message || '移除失败', icon: 'none' })
        }
      }
    }
  })
}

const weekDays = ref([])
const weekRange = ref('')
const weekStartDate = ref(formatDate(getWeekStart(new Date())))

// 7天范围：前天、昨天、今天、明天、后天...
function getWeekStart(date) {
  const d = new Date(date)
  d.setDate(date.getDate() - 2)
  return d
}

function formatDate(d) {
  return d.toISOString().split('T')[0]
}

function onWeekChange(e) {
  weekStartDate.value = e.detail.value
  buildWeek(new Date(e.detail.value))
}

async function buildWeek(baseDate) {
  const now = baseDate || new Date()
  const start = getWeekStart(now)
  const realToday = new Date().toISOString().split('T')[0]

  const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
  const todayStr = realToday

  const startStr = `${start.getMonth() + 1}月${start.getDate()}日`
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const endStr = `${end.getMonth() + 1}月${end.getDate()}日`
  weekRange.value = `${startStr} - ${endStr}`

  // 获取排班数据：未来Pending用list，历史用history
  let scheduleMap = {}       // date → nickname
  let scheduleObjMap = {}    // date → full schedule object
  const fromStr = formatDate(start)
  const toStr = formatDate(end)

  // 当前及未来排班（仅Pending）
  try {
    const list = await scheduleApi.getList({
      dormitoryId: dormitoryId.value,
      from: fromStr,
      to: toStr,
      status: 'PENDING'
    })
    if (Array.isArray(list)) {
      list.forEach(s => {
        scheduleMap[s.scheduleDate] = s.nickname
        scheduleObjMap[s.scheduleDate] = s
      })
    }
  } catch (err) { /* 使用空数据 */ }

  // 历史排班（仅回填过去日期）
  try {
    const history = await scheduleApi.getHistory({
      dormitoryId: dormitoryId.value,
      from: fromStr,
      to: toStr
    })
    if (Array.isArray(history)) {
      history.forEach(s => {
        if (s.scheduleDate < todayStr && !scheduleMap[s.scheduleDate]) {
          scheduleMap[s.scheduleDate] = s.nickname
          scheduleObjMap[s.scheduleDate] = s
        }
      })
    }
  } catch (err) { /* 使用空数据 */ }

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = formatDate(d)
    const isPast = dateStr < todayStr
    const isToday = dateStr === todayStr
    const personObj = scheduleObjMap[dateStr] || null

    days.push({
      date: dateStr,
      dayNum: d.getDate(),
      weekLabel: '周' + weekLabels[d.getDay()],
      isRest: isRestDay(dateStr),
      locked: isPast,
      isToday,
      person: scheduleMap[dateStr] || null,
      personObj: personObj ? { nickname: personObj.nickname, avatarUrl: personObj.avatarUrl || '' } : null
    })
  }
  weekDays.value = days
}

function goBack() {
  uni.navigateBack()
}

function handleNotify() {
  uni.showToast({ title: '暂无通知', icon: 'none' })
}

async function autoSchedule() {
  if (sortedMembers.value.length === 0) {
    uni.showToast({ title: '请先添加排班成员', icon: 'none' })
    return
  }
  uni.showLoading({ title: '排班计算中...' })
  try {
    const today = new Date().toISOString().split('T')[0]
    await scheduleApi.generate(dormitoryId.value, {
      startDate: today,
      days: 7,
      timeSlot: '上午'
    })
    await buildWeek()
    uni.$emit('dutyChanged')
    uni.hideLoading()
    uni.showToast({ title: '已按顺序自动分配', icon: 'success' })
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: err?.message || '排班失败', icon: 'none' })
  }
}

function clearSchedule() {
  uni.showModal({
    title: '确认清除',
    content: '清除当前日期之后的所有排班吗？历史记录将保留。',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 清除从昨天开始的排班，确保今天也被清除
          const d = new Date()
          d.setDate(d.getDate() - 1)
          const fromDate = d.toISOString().split('T')[0]
          await scheduleApi.clear(dormitoryId.value, fromDate)
          await buildWeek()
          uni.$emit('dutyChanged')
          uni.showToast({ title: '已清除当前日期之后的排班', icon: 'success' })
        } catch (err) {
          uni.showToast({ title: err?.message || '清除失败', icon: 'none' })
        }
      }
    }
  })
}

async function saveSchedule() {
  try {
    const data = sortedMembers.value.map((m, i) => ({ userId: m.userId, sortOrder: i + 1 }))
    await scheduleApi.updateOrder(dormitoryId.value, data)
    uni.$emit('dutyChanged')
    uni.showToast({ title: '排班计划保存成功！', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// 页面每次显示时刷新（首次进入 + 从成员选择页返回）
onShow(async () => {
  await fetchOrder()
  await buildWeek()
})

// 暴露方法供成员选择页通过 $vm 调用
defineExpose({ refreshOrder })
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f3fcf0;
  display: flex;
  flex-direction: column;
}

// ==================== Top Bar ====================
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px;
  background: rgba(243,252,240,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(187,187,187,0.2);
}

.bar-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  &:active { background: rgba(0,0,0,0.05); }
}

.bar-icon { font-size: 18px; color: #161d16; }
.bar-title { font-size: 17px; font-weight: 700; color: #006d33; }

// ==================== Content ====================
.content {
  flex: 1;
  padding-bottom: 90px;
}

.content-inner {
  padding: 16px 14px;
  display: flex; flex-direction: column; gap: 24px;
}

.section { display: flex; flex-direction: column; gap: 14px; }

.section-top {
  display: flex; justify-content: space-between; align-items: flex-end;
}

.section-info { display: flex; flex-direction: column; gap: 3px; }
.section-title { font-size: 18px; font-weight: 700; color: #161d16; }
.section-desc { font-size: 11px; color: rgba(61,74,61,0.7); }

.reset-link {
  font-size: 12px; color: #006d33; font-weight: 600;
  &:active { opacity: 0.6; }
}

// ==================== Members ====================
.member-scroll { width: 100%; }

.member-list {
  display: flex; gap: 20px;
  padding-bottom: 4px; padding-right: 14px;
}

.member-item {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  &:active { transform: scale(0.9); }
}

.member-avatar-wrap { position: relative; }

.member-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  border: 2px solid #006d33;
  box-shadow: 0 0 0 3px rgba(0,109,51,0.08);
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  &.bg-0 { background: #e8f5e9; }
  &.bg-1 { background: #e3f2fd; }
  &.bg-2 { background: #fff3e0; }
  &.bg-3 { background: #f3e5f5; }
}

.member-avatar-text { font-size: 24px; }
.member-avatar-img { width: 100%; height: 100%; border-radius: 50%; }

.add-avatar {
  border: 2px dashed #bbcbba !important;
  box-shadow: none;
}

.add-icon { font-size: 24px; color: #bbcbba; }

.order-badge {
  position: absolute; bottom: -4px; right: -8px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #006d33; border: 1.5px solid #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.order-num { font-size: 8px; color: #fff; font-weight: 700; line-height: 1; }

.remove-badge {
  position: absolute; top: -4px; right: -8px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #ff4d4f; border: 2px solid #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  &:active { transform: scale(1.2); }
}

.remove-icon { font-size: 12px; color: #fff; font-weight: 700; line-height: 1; }

.member-name { font-size: 12px; font-weight: 600; color: #161d16; }
.add-text { color: #3d4a3d; font-weight: 500; }

.member-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 24px 16px;
  background: rgba(255,255,255,0.5);
  border-radius: 14px;
  border: 2px dashed rgba(187,187,186,0.4);
  gap: 6px;
  &:active { background: rgba(255,255,255,0.7); }
}

.member-empty-icon { font-size: 28px; opacity: 0.5; }
.member-empty-text { font-size: 13px; font-weight: 600; color: #3d4a3d; }
.member-empty-hint { font-size: 11px; color: #6c7b6c; }

// ==================== Action Buttons ====================
.actions-row { display: flex; gap: 14px; }

.action-btn {
  flex: 1;
  padding: 18px 12px; border-radius: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  &:active { transform: scale(0.95); }

  &.auto-btn {
    background: linear-gradient(135deg, #07c160, #008f44);
    box-shadow: 0 8px 20px rgba(0,109,51,0.2);
  }
  &.clear-btn {
    background: linear-gradient(135deg, #fff, #f3fcf0);
    border: 1px solid rgba(186,26,26,0.08);
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  }
}

.action-icon-wrap {
  padding: 8px; border-radius: 10px;
  &.green-glass { background: rgba(255,255,255,0.2); }
  &.red-glass { background: rgba(186,26,26,0.08); }
}

.action-icon { font-size: 22px; }

.auto-btn .action-label { font-size: 12px; font-weight: 700; color: #fff; }
.auto-btn .action-sub { font-size: 9px; color: rgba(255,255,255,0.7); font-weight: 500; }

.clear-btn .action-label { font-size: 12px; font-weight: 700; color: #ba1a1a; }
.clear-btn .action-sub { font-size: 9px; color: rgba(61,74,61,0.7); font-weight: 500; }

// ==================== Day Cards ====================
.schedule-list { display: flex; flex-direction: column; gap: 12px; }

.week-picker { flex-shrink: 0; }

.week-badge {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 12px; border-radius: 12px;
  background: #e8f0e4;
  &:active { opacity: 0.7; }
}

.week-badge-text {
  font-size: 11px; color: rgba(61,74,61,0.7); font-weight: 500;
}

.week-badge-arrow {
  font-size: 8px; color: rgba(61,74,61,0.4);
}

.day-card {
  padding: 14px; border-radius: 14px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  border-left: 4px solid #07c160;

  &.locked {
    border-left-color: rgba(108,123,108,0.4);
    opacity: 0.7;
    background: rgba(237,246,234,0.5);
  }
  &.weekend {
    border-left-style: dashed;
    border-left-color: rgba(187,187,187,0.3);
    background: rgba(237,246,234,0.4);
  }
}

.day-left { display: flex; align-items: center; gap: 18px; }

.day-date { text-align: center; min-width: 30px; }
.day-num { font-size: 18px; font-weight: 700; color: #006d33; display: block; }

.locked .day-num { color: #6c7b6c; }
.weekend .day-num { color: rgba(61,74,61,0.3); }

.day-week { font-size: 9px; font-weight: 700; color: #006d33; letter-spacing: 1px; }

.locked .day-week { color: rgba(108,123,108,0.6); }
.weekend .day-week { color: rgba(61,74,61,0.3); }

.day-person { display: flex; align-items: center; gap: 12px; }

.person-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  &.filled { background: #e8f0e4; border: 2px solid #fff; }
  &.dashed {
    background: rgba(7,193,96,0.05);
    border: 2px dashed rgba(7,193,96,0.3);
    &.green { border-color: rgba(7,193,96,0.4); }
  }
}

.person-avatar-text { font-size: 16px; }
.person-avatar-img { width: 100%; height: 100%; border-radius: 50%; }
.person-empty-icon { font-size: 18px; color: #07c160; }

.person-info { display: flex; flex-direction: column; gap: 2px; }
.person-name { font-size: 14px; font-weight: 700; color: #161d16; }

.locked-name { color: rgba(22,29,22,0.6); }
.wait-name { color: #3d4a3d; font-weight: 600; }

.person-tag {
  font-size: 10px; font-weight: 500; color: #6c7b6c;
  &.locked-tag { color: rgba(61,74,61,0.6); }
  &.current-tag { color: #006d33; font-weight: 700; }
  &.auto-tag { color: #5b3cdd; font-weight: 700; }
  &.wait-tag { color: rgba(61,74,61,0.5); }
}

.weekend-badge {
  padding: 2px 8px; font-size: 10px; font-weight: 700;
  background: rgba(187,187,187,0.2); color: #bbcbba;
  border-radius: 6px;
}

.weekend-text {
  font-size: 13px; color: rgba(61,74,61,0.3);
  font-style: italic; font-weight: 500;
}

.day-action {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(7,193,96,0.1);
  display: flex; align-items: center; justify-content: center;
}

.edit-icon { font-size: 14px; color: #006d33; }

.day-arrow { font-size: 16px; color: #c0c0c0; }

// ==================== Info Card ====================
.info-card {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 16px; border-radius: 14px;
  background: rgba(7,193,96,0.04);
  border: 1px solid rgba(7,193,96,0.08);
}

.info-icon-wrap {
  padding: 4px; border-radius: 50%;
  background: rgba(7,193,96,0.08);
  flex-shrink: 0;
}

.info-icon { font-size: 16px; }

.info-text {
  font-size: 11px; color: #3d4a3d; line-height: 1.6; font-weight: 500;
}

// ==================== Save Bar ====================
.save-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 40;
  background: linear-gradient(to top, #f3fcf0 0%, rgba(243,252,240,0.95) 60%, transparent 100%);
}

.save-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #07c160, #008f44);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,109,51,0.25);
  &:active { transform: scale(0.97); }
}

.save-icon { font-size: 18px; color: #fff; font-weight: 700; }
.save-text { font-size: 15px; font-weight: 700; color: #fff; }

.bottom-spacer { height: 20px; }
</style>
