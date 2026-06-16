<template>
  <view class="pagination" v-if="total > 0">
    <view class="pagination-info">
      <text>共 {{ total }} 条</text>
    </view>
    <view class="pagination-controls">
      <view
        class="page-btn"
        :class="{ disabled: current <= 1 }"
        @click="goPage(current - 1)"
      >
        <text>上一页</text>
      </view>

      <view class="page-num">
        <text>{{ current }} / {{ totalPages }}</text>
      </view>

      <view
        class="page-btn"
        :class="{ disabled: current >= totalPages }"
        @click="goPage(current + 1)"
      >
        <text>下一页</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  current: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 }
})

const emit = defineEmits(['change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

function goPage(page) {
  if (page < 1 || page > totalPages.value) return
  emit('change', page)
}
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  margin-top: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.pagination-info {
  font-size: 24rpx;
  color: #999;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.page-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #333;
  background: #fff;

  &.disabled {
    color: #ccc;
    pointer-events: none;
  }
}

.page-num {
  font-size: 26rpx;
  color: #333;
  padding: 0 16rpx;
}
</style>
