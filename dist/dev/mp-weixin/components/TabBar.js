"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "TabBar",
  props: {
    current: { type: Number, default: 0 }
  },
  setup(__props) {
    const list = [
      { pagePath: "/pages/index/index", text: "首页", icon: "🏠" },
      { pagePath: "/pages/interaction/index", text: "互动", icon: "👥" },
      { pagePath: "/pages/profile/index", text: "我的", icon: "👤" }
    ];
    function onTabClick(index) {
      common_vendor.index.switchTab({ url: list[index].pagePath });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(list, (item, index, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(item.text),
            c: common_vendor.n(__props.current === index ? "tab-text-on" : "tab-text-off"),
            d: common_vendor.n(__props.current === index ? "tab-active" : "tab-normal"),
            e: item.pagePath,
            f: common_vendor.o(($event) => onTabClick(index), item.pagePath)
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7d9a6b19"]]);
wx.createComponent(Component);
