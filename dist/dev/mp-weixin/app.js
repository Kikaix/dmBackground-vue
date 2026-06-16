"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/interaction/index.js";
  "./pages/profile/index.js";
  "./pages/dormitory/list.js";
  "./pages/dormitory/detail.js";
  "./pages/schedule/index.js";
  "./pages/schedule/member-select.js";
  "./pages/interaction/history.js";
}
const _sfc_main = {
  globalData: {
    tabBarSelected: null
  },
  onLaunch() {
    console.log("宿舍管理系统启动");
  },
  onShow() {
    console.log("App Show");
  },
  onHide() {
    console.log("App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(common_vendor.createPinia());
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
