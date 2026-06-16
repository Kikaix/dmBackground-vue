// #ifdef MP-WEIXIN
var gApp = null
var gSelected = 1
try {
  gApp = getApp()
  if (gApp && gApp.globalData && gApp.globalData.tabBarSelected != null) {
    gSelected = gApp.globalData.tabBarSelected
  } else {
    // fallback: 从路由推断
    var pages = getCurrentPages()
    if (pages.length > 0) {
      var route = '/' + pages[pages.length - 1].route
      if (route === '/pages/index/index') gSelected = 0
      else if (route === '/pages/interaction/index') gSelected = 1
      else if (route === '/pages/profile/index') gSelected = 2
    }
  }
} catch(e) {}

Component({
  data: {
    selected: gSelected,
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: '🏠' },
      { pagePath: '/pages/interaction/index', text: '互动', icon: '👥' },
      { pagePath: '/pages/profile/index', text: '我的', icon: '👤' }
    ]
  },
  methods: {
    switchTab: function(e) {
      var index = parseInt(e.currentTarget.dataset.index)
      if (this.data.selected === index) return
      this.setData({ selected: index })
      // 写入 globalData 确保重建后能正确恢复
      try {
        var app = getApp()
        if (app && app.globalData) {
          app.globalData.tabBarSelected = index
        }
      } catch(ignore) {}
      wx.switchTab({ url: this.data.list[index].pagePath })
    }
  }
})
// #endif
