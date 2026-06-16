<template>
  <view class="page">
    <!-- Top Bar -->
    <view class="top-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="bar-title">值日历史记录</text>
      <view class="spacer"></view>
    </view>

    <!-- Search -->
    <view class="search-wrap">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchText"
          placeholder="搜索名称或日期..."
          @input="onSearch"
        />
      </view>
    </view>

    <!-- History List -->
    <scroll-view
      scroll-y
      class="history-scroll"
      @scrolltolower="loadMore"
      :show-scrollbar="false"
    >
      <view class="history-list">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="history-card"
          @click="openEdit(item)"
        >
          <!-- Watermark -->
          <text class="card-watermark">历史记录</text>

          <!-- Top row: date + edit icon -->
          <view class="card-top">
            <text class="card-date">{{ formatDateLabel(item.scheduleDate) }}</text>
            <text class="card-edit-icon">✎</text>
          </view>

          <!-- Bottom row: person + status -->
          <view class="card-bottom">
            <view class="person-info">
              <view class="person-avatar">
                <text class="avatar-text">👤</text>
              </view>
              <text class="person-name">{{ item.nickname }}</text>
            </view>
            <view class="status-tag" :class="statusClass(item.status)">
              <text class="status-text">{{ statusLabel(item.status) }}</text>
            </view>
          </view>
        </view>

        <!-- Load more indicator -->
        <view class="load-indicator" v-if="loadingMore">
          <text class="load-text">加载中...</text>
        </view>
        <view class="load-indicator" v-else-if="noMore && historyList.length > 0">
          <text class="load-text">— 没有更多了 —</text>
        </view>
        <view class="load-indicator" v-else-if="historyList.length === 0 && !loading">
          <text class="load-text">暂无历史记录</text>
        </view>
      </view>
    </scroll-view>

    <!-- Edit Bottom Sheet Overlay -->
    <view class="overlay" v-if="showSheet" @click="closeSheet"></view>

    <!-- Edit Bottom Sheet -->
    <view class="edit-sheet" :class="{ visible: showSheet }">
      <view class="sheet-handle"></view>
      <text class="sheet-title">修改值日记录</text>

      <!-- Info summary -->
      <view class="sheet-info" v-if="editingItem">
        <text class="sheet-date">{{ editingItem.scheduleDate }}</text>
        <text class="sheet-task">{{ editingItem.nickname }} · {{ editingItem.timeSlot || '值日' }}</text>
        <view class="sheet-badge">历史记录</view>
      </view>

      <!-- Status change -->
      <view class="sheet-section">
        <text class="sheet-label">调整值日状态</text>
        <view class="status-options">
          <view
            class="status-option"
            :class="{ active: editStatus === 'COMPLETED' }"
            @click="editStatus = 'COMPLETED'"
          >
            <text class="option-icon">✓</text>
            <text>已完成</text>
          </view>
          <view
            class="status-option"
            :class="{ active: editStatus === 'CANCELLED' }"
            @click="editStatus = 'CANCELLED'"
          >
            <text class="option-icon">✕</text>
            <text>已取消</text>
          </view>
        </view>
      </view>

      <!-- Actions -->
      <view class="sheet-actions">
        <view class="sheet-btn cancel-btn" @click="closeSheet">
          <text>取消</text>
        </view>
        <view class="sheet-btn save-btn" @click="saveEdit">
          <text>保存更改</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { scheduleApi } from '@/api/modules/schedule'
import { useUserStore } from '@/store/useUserStore'

const userStore = useUserStore()
const dormitoryId = computed(() => userStore.userInfo?.activeDormitoryId || '')

const searchText = ref('')
const historyList = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const noMore = ref(false)
const historyTo = ref('')

const showSheet = ref(false)
const editingItem = ref(null)
const editStatus = ref('')

const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function formatDateLabel(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const w = weekLabels[d.getDay()]
  return `${m}月${day}日 · ${w}`
}

function statusClass(status) {
  if (status === 'COMPLETED') return 'done'
  if (status === 'CANCELLED') return 'cancelled'
  return 'pending'
}

function statusLabel(status) {
  if (status === 'COMPLETED') return '已完成'
  if (status === 'CANCELLED') return '已取消'
  return '待执行'
}

const filteredList = computed(() => {
  const s = searchText.value.trim().toLowerCase()
  if (!s) return historyList.value
  return historyList.value.filter(item =>
    item.nickname.toLowerCase().includes(s) ||
    (item.scheduleDate || '').includes(s)
  )
})

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    // search is reactive via filteredList computed
  }, 300)
}

async function fetchHistory(reset) {
  if (!dormitoryId.value) return
  if (reset) {
    loading.value = true
    historyList.value = []
    noMore.value = false
  } else {
    if (loadingMore.value || noMore.value) return
    loadingMore.value = true
  }

  try {
    const now = new Date()
    const toDate = reset
      ? now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
      : (historyTo.value || now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0'))

    const fromD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14)
    const fromStr = fromD.getFullYear() + '-' + String(fromD.getMonth() + 1).padStart(2, '0') + '-' + String(fromD.getDate()).padStart(2, '0')

    const result = await scheduleApi.getHistory({
      dormitoryId: dormitoryId.value,
      from: fromStr,
      to: toDate
    })

    // result is the unwrapped data from request.js (already body.data)
    const list = Array.isArray(result) ? result : (result?.records || result?.list || [])

    if (list.length > 0) {
      const enriched = list.map(item => ({
        id: item.id,
        nickname: item.nickname || '未知',
        scheduleDate: item.scheduleDate || '',
        timeSlot: item.timeSlot || '',
        remark: item.remark || '',
        status: item.status || 'PENDING',
        weekLabel: item.scheduleDate ? weekLabels[new Date(item.scheduleDate + 'T00:00:00').getDay()] : ''
      }))
      if (reset) {
        historyList.value = enriched
      } else {
        historyList.value = [...historyList.value, ...enriched]
      }
      historyTo.value = fromStr
      if (list.length < 14) noMore.value = true
    } else {
      if (reset) historyList.value = []
      noMore.value = true
    }
  } catch (err) {
    if (reset) historyList.value = []
    console.error('fetchHistory error:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  fetchHistory(false)
}

function goBack() {
  uni.navigateBack()
}

function openEdit(item) {
  editingItem.value = item
  editStatus.value = item.status || 'COMPLETED'
  showSheet.value = true
}

function closeSheet() {
  showSheet.value = false
  editingItem.value = null
}

async function saveEdit() {
  if (!editingItem.value) return
  try {
    if (editStatus.value === 'COMPLETED') {
      await scheduleApi.complete(editingItem.value.id)
    } else {
      await scheduleApi.update(editingItem.value.id, { status: editStatus.value })
    }
    // Refresh local list
    const idx = historyList.value.findIndex(h => h.id === editingItem.value.id)
    if (idx !== -1) {
      historyList.value[idx].status = editStatus.value
    }
    uni.showToast({ title: '修改成功', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: err?.message || '修改失败', icon: 'none' })
  }
  closeSheet()
}

onShow(() => {
  fetchHistory(true)
})
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(243,252,240,0.85);
  backdrop-filter: blur(20px);
}

.back-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  &:active { background: rgba(0,0,0,0.05); }
}

.back-icon { font-size: 18px; color: #006d33; font-weight: 700; }
.bar-title { font-size: 17px; font-weight: 700; color: #006d33; }
.spacer { width: 36px; }

// ==================== Search ====================
.search-wrap { padding: 12px 14px; }

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.search-icon { font-size: 16px; opacity: 0.5; }

.search-input {
  flex: 1;
  font-size: 14px;
  color: #161d16;
  padding: 0;
  min-height: auto;
  background: transparent;
}

// ==================== History List ====================
.history-scroll {
  flex: 1;
  padding: 0 14px;
  padding-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-card {
  position: relative;
  overflow: hidden;
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:active { transform: scale(0.98); }
}

.card-watermark {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 24px;
  font-weight: 900;
  color: rgba(0,0,0,0.04);
  pointer-events: none;
  transform: rotate(-15deg);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-date {
  font-size: 11px;
  color: #3d4a3d;
  font-weight: 500;
}

.card-edit-icon {
  font-size: 16px;
  color: rgba(0,109,51,0.4);
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.person-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.person-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: #e8f0e4;
  display: flex; align-items: center; justify-content: center;
}

.avatar-text { font-size: 16px; }

.person-name {
  font-size: 14px;
  font-weight: 600;
  color: #161d16;
}

.status-tag {
  padding: 3px 10px;
  border-radius: 20px;

  &.done { background: rgba(7,193,96,0.1); }
  &.cancelled { background: #f5f5f5; }
  &.pending { background: #e8f0e4; }
}

.status-text {
  font-size: 11px;
  font-weight: 500;
  color: #3d4a3d;
}

.load-indicator {
  padding: 20px;
  text-align: center;
}

.load-text {
  font-size: 11px;
  color: #6c7b6c;
}

// ==================== Edit Sheet ====================
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.2);
  z-index: 60;
}

.edit-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 28px 28px 0 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 70;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 18px;

  &.visible { transform: translateY(0); }
}

.sheet-handle {
  width: 40px; height: 4px;
  background: #dce5d9;
  border-radius: 2px;
  align-self: center;
}

.sheet-title {
  font-size: 18px;
  font-weight: 700;
  color: #161d16;
}

.sheet-info {
  background: #edf6ea;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.sheet-date { font-size: 11px; color: #3d4a3d; }
.sheet-task { font-size: 15px; font-weight: 600; color: #161d16; flex: 1; }

.sheet-badge {
  font-size: 10px;
  color: #006d33;
  background: rgba(7,193,96,0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.sheet-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sheet-label {
  font-size: 11px;
  color: #3d4a3d;
  font-weight: 500;
  text-transform: uppercase;
}

.status-options {
  display: flex;
  gap: 10px;
}

.status-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  border: 2px solid #dce5d9;
  font-size: 13px;
  font-weight: 500;
  color: #3d4a3d;

  &.active {
    border-color: #07c160;
    background: rgba(7,193,96,0.06);
    color: #006d33;
  }
}

.option-icon { font-size: 16px; font-weight: 700; }

.sheet-actions {
  display: flex;
  gap: 10px;
}

.sheet-btn {
  padding: 14px;
  border-radius: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  &:active { transform: scale(0.97); }

  &.cancel-btn {
    flex: 1;
    background: #e8f0e4;
    color: #3d4a3d;
  }

  &.save-btn {
    flex: 2;
    background: #006d33;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0,109,51,0.25);
  }
}
</style>
