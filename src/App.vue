<script>
export default {
  globalData: {
    tabBarSelected: null
  },
  onLaunch(options) {
    console.log('省心排班小助手启动')
    // #ifdef H5
    uni.preloadPage({ url: '/pages/index/index' })
    uni.preloadPage({ url: '/pages/interaction/index' })
    uni.preloadPage({ url: '/pages/profile/index' })
    // #endif
    // 从分享链接冷启动时暂存邀请码
    if (options?.query?.inviteCode) {
      uni.setStorageSync('_pendingInviteCode', options.query.inviteCode)
    }
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
</style>
