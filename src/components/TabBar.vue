<template>
  <view class="tab-bar">
    <view
      v-for="(item, index) in list"
      :key="item.pagePath"
      class="tab-item"
      @tap.stop="onTabClick(index)"
    >
      <view :class="current === index ? 'tab-active' : 'tab-normal'">
        <text class="tab-icon" :class="current === index ? 'tab-icon-on' : 'tab-icon-off'">{{ item.icon }}</text>
        <text :class="current === index ? 'tab-text-on' : 'tab-text-off'">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  current: { type: Number, required: true }
})

const list = [
  { pagePath: '/pages/index/index', text: '首页', icon: '🏠' },
  { pagePath: '/pages/interaction/index', text: '互动', icon: '👥' },
  { pagePath: '/pages/profile/index', text: '我的', icon: '👤' }
]

function onTabClick(index) {
  uni.switchTab({ url: list[index].pagePath })
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  background: rgba(243, 252, 240, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px 12px 0 0;
  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.04);
  z-index: 9999;
  will-change: transform;
  transform: translateZ(0);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 非激活态：无背景 */
.tab-normal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 20px;
  border-radius: 9999px;
}

/* 激活态：绿色胶囊 */
.tab-active {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 20px;
  border-radius: 9999px;
  background: #07c160;
}

.tab-icon-off {
  font-size: 22px;
  color: #3d4a3d;
}

.tab-icon-on {
  font-size: 22px;
  color: #ffffff;
}

.tab-text-off {
  font-size: 11px;
  font-weight: 500;
  color: #3d4a3d;
}

.tab-text-on {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
}
</style>
