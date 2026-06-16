<script>
export default {
  globalData: {
    tabBarSelected: null
  },
  onLaunch() {
    console.log('宿舍管理系统启动')
    // #ifdef H5
    uni.preloadPage({ url: '/pages/index/index' })
    uni.preloadPage({ url: '/pages/interaction/index' })
    uni.preloadPage({ url: '/pages/profile/index' })
    // #endif
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
