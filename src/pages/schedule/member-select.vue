<template>
  <view class="page">
    <!-- Top Bar -->
    <view class="top-bar">
      <view class="bar-btn" @click="goBack">
        <text class="bar-icon">←</text>
      </view>
      <text class="bar-title">选择人员</text>
      <view class="spacer"></view>
    </view>

    <!-- Search -->
    <view class="search-wrap">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchText"
          placeholder="搜索姓名或学号..."
          @input="onSearch"
        />
      </view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="content">
      <view class="list-header">
        <text class="list-count">所有成员 ({{ filteredList.length }})</text>
        <text class="select-all" @click="toggleSelectAll">{{ allSelected ? '取消全选' : '全选' }}</text>
      </view>

      <view class="member-list">
        <view
          v-for="m in filteredList"
          :key="m.userId"
          class="member-item"
          :class="{ selected: m.selected }"
          @click="toggleMember(m)"
        >
          <view class="member-avatar">
            <image v-if="m.avatarUrl" class="member-avatar-img" :src="m.avatarUrl" mode="aspectFill" />
            <text v-else class="member-avatar-text">👤</text>
          </view>
          <view class="member-info">
            <text class="member-name">{{ m.nickname }}</text>
            <text class="member-detail">{{ m.role === 'LEADER' ? '管理员' : '成员' }}</text>
          </view>
          <view class="check-circle" :class="{ checked: m.selected }">
            <text class="check-mark" v-if="m.selected">✓</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- Bottom Bar -->
    <view class="bottom-bar" :class="{ visible: selectedCount > 0 }">
      <view class="bottom-content">
        <view class="bottom-left">
          <text class="bottom-label">已选择人员</text>
          <view class="avatar-strip">
            <view class="mini-avatar" v-for="(m, i) in selectedPreview" :key="m.userId">
              <text class="mini-avatar-text">👤</text>
            </view>
            <view class="mini-avatar more" v-if="selectedCount > 5">
              <text class="more-text">+{{ selectedCount - 5 }}</text>
            </view>
          </view>
        </view>
        <view class="confirm-btn" @click="confirmSelection">
          <text class="confirm-text">确认 ({{ selectedCount }})</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { dormitoryApi } from '@/api/modules/dormitory'
import { scheduleApi } from '@/api/modules/schedule'
import { useUserStore } from '@/store/useUserStore'

const userStore = useUserStore()
const searchText = ref('')
const allMembers = ref([])

async function fetchMembers() {
  const dormitoryId = userStore.userInfo?.activeDormitoryId || ''
  try {
    const list = await dormitoryApi.getMembers(dormitoryId)
    if (Array.isArray(list)) {
      allMembers.value = list.map(m => ({
        userId: m.userId,
        nickname: m.nickname || '未知',
        role: m.role || 'MEMBER',
        scheduled: m.scheduled || false,
        selected: m.scheduled || false  // 已排班成员默认选中
      }))
    }
  } catch (err) {
    uni.showToast({ title: '加载成员失败', icon: 'none' })
  }
}

onMounted(() => {
  fetchMembers()
})

const filteredList = computed(() => {
  const s = searchText.value.trim().toLowerCase()
  if (!s) return allMembers.value
  return allMembers.value.filter(m =>
    m.nickname.toLowerCase().includes(s)
  )
})

const selectedCount = computed(() => allMembers.value.filter(m => m.selected).length)
const selectedPreview = computed(() => allMembers.value.filter(m => m.selected).slice(0, 5))
const allSelected = computed(() => filteredList.value.length > 0 && filteredList.value.every(m => m.selected))

function toggleMember(m) {
  m.selected = !m.selected
}

function toggleSelectAll() {
  const select = !allSelected.value
  filteredList.value.forEach(m => { m.selected = select })
}

function onSearch() {}

function goBack() {
  uni.navigateBack()
}

async function confirmSelection() {
  const selected = allMembers.value.filter(m => m.selected)
  if (selected.length === 0) {
    uni.showToast({ title: '请至少选择一人', icon: 'none' })
    return
  }
  try {
    const dormitoryId = userStore.userInfo?.activeDormitoryId || ''
    // 调用后端接口添加到排班顺序，返回后 onShow 自动刷新
    await scheduleApi.addToOrder(dormitoryId, selected.map(m => m.userId))
    uni.navigateBack()
  } catch (err) {
    uni.showToast({ title: err?.message || '添加失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: radial-gradient(circle at top right, #e8f0e4, #f3fcf0);
  display: flex; flex-direction: column;
}

// ==================== Top Bar ====================
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.bar-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  &:active { background: rgba(0,0,0,0.05); }
}

.bar-icon { font-size: 18px; color: #006d33; }
.bar-title { font-size: 17px; font-weight: 700; color: #006d33; }
.spacer { width: 36px; }

// ==================== Search ====================
.search-wrap { padding: 12px 14px; }
.search-box {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: #edf6ea; border-radius: 12px;
}

.search-icon { font-size: 16px; opacity: 0.5; }
.search-input {
  flex: 1; font-size: 14px; color: #161d16;
  padding: 0; min-height: auto; background: transparent;
}

// ==================== Content ====================
.content {
  flex: 1; padding: 0 14px 14px;
  padding-bottom: 120px;
}

.list-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 4px 10px;
}

.list-count { font-size: 11px; color: #3d4a3d; font-weight: 500; }
.select-all { font-size: 11px; color: #006d33; font-weight: 500; }

.member-list { display: flex; flex-direction: column; gap: 8px; }

.member-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px;
  background: #fff; border-radius: 14px;
  border: 1px solid transparent;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  &:active { transform: scale(0.98); }

  &.selected {
    background: rgba(7,193,96,0.06);
    border-color: #07c160;
  }
}

.member-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: #e8f0e4;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.member-avatar-text { font-size: 18px; }
.member-avatar-img { width: 100%; height: 100%; border-radius: 50%; }

.member-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.member-name { font-size: 14px; font-weight: 600; color: #161d16; }
.member-detail { font-size: 11px; color: #3d4a3d; }

.check-circle {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid #bbcbba;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;

  &.checked {
    background: #07c160; border-color: #07c160;
  }
}

.check-mark { font-size: 14px; color: #fff; font-weight: 700; }

// ==================== Bottom Bar ====================
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  padding: 10px 14px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  transform: translateY(100%);
  transition: transform 0.3s;

  &.visible { transform: translateY(0); }
}

.bottom-content {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 -2px 16px rgba(0,0,0,0.04);
}

.bottom-left { display: flex; flex-direction: column; gap: 6px; }
.bottom-label { font-size: 10px; color: #3d4a3d; font-weight: 500; }

.avatar-strip { display: flex; gap: -4px; }
.mini-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: #e8f0e4; border: 2px solid #fff;
  display: flex; align-items: center; justify-content: center;
  margin-left: -8px;
  &:first-child { margin-left: 0; }

  &.more {
    background: #dce5d9;
  }
}

.mini-avatar-text { font-size: 12px; }
.more-text { font-size: 9px; color: #3d4a3d; font-weight: 700; }

.confirm-btn {
  padding: 10px 20px; border-radius: 22px;
  background: #07c160;
  box-shadow: 0 4px 12px rgba(7,193,96,0.2);
  &:active { transform: scale(0.95); }
}

.confirm-text { font-size: 14px; font-weight: 700; color: #fff; }

.bottom-spacer { height: 20px; }
</style>
