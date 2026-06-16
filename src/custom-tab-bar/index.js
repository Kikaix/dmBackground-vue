// #ifdef MP-WEIXIN
var KEY = '_tabSelected'

Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: '🏠' },
      { pagePath: '/pages/interaction/index', text: '互动', icon: '👥' },
      { pagePath: '/pages/profile/index', text: '我的', icon: '👤' }
    ]
  },
  attached: function() {
    var idx = -1
    try {
      var v = wx.getStorageSync(KEY)
      if (v === 0 || v === '0') idx = 0
      else if (v === 1 || v === '1') idx = 1
      else if (v === 2 || v === '2') idx = 2
    } catch(e) {}
    if (idx >= 0 && idx !== this.data.selected) {
      this.setData({ selected: idx })
    }
  },
  methods: {
    switchTab: function(e) {
      var index = parseInt(e.currentTarget.dataset.index)
      if (isNaN(index) || this.data.selected === index) return
      // 持久化，热重载或重建时恢复
      try { wx.setStorageSync(KEY, index) } catch(ignore) {}
      this.setData({ selected: index })
      wx.switchTab({ url: this.data.list[index].pagePath })
    }
  }
})
// #endif
