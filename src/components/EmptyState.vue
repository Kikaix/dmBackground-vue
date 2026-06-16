<template>
  <view class="empty-state">
    <view class="empty-icon">
      <text>{{ icon }}</text>
    </view>
    <text class="empty-text">{{ text }}</text>
    <view v-if="$slots.default" class="empty-extra">
      <slot />
    </view>
  </view>
</template>

<script setup>
defineProps({
  text: { type: String, default: '暂无数据' },
  icon: { type: String, default: '📭' }
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.empty-extra {
  margin-top: 24rpx;
}
</style>
