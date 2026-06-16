"use strict";
const common_vendor = require("../../common/vendor.js");
const store_useUserStore = require("../../store/useUserStore.js");
const api_modules_schedule = require("../../api/modules/schedule.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = store_useUserStore.useUserStore();
    const greetingText = common_vendor.ref("晚上好！🌙");
    const temperature = common_vendor.ref("--°C");
    const weatherLabel = common_vendor.ref("实时温度");
    const weatherCode = common_vendor.ref(0);
    const todayDuty = common_vendor.ref(null);
    const dormitoryId = common_vendor.computed(() => {
      var _a;
      return ((_a = userStore.userInfo) == null ? void 0 : _a.activeDormitoryId) || "";
    });
    const userName = common_vendor.ref("");
    function updateGreeting() {
      var _a;
      const hour = (/* @__PURE__ */ new Date()).getHours();
      const name = ((_a = userStore.userInfo) == null ? void 0 : _a.nickname) || "";
      userName.value = name;
      if (hour >= 5 && hour < 12) {
        greetingText.value = `早上好${name ? "，" + name : ""}！👋`;
      } else if (hour >= 12 && hour < 18) {
        greetingText.value = `下午好${name ? "，" + name : ""}！☀️`;
      } else {
        greetingText.value = `晚上好${name ? "，" + name : ""}！🌙`;
      }
    }
    async function fetchWeather(lat, lon) {
      try {
        const res = await common_vendor.index.request({
          url: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
          method: "GET",
          timeout: 8e3
        });
        const data = res.data || res;
        if (data == null ? void 0 : data.current) {
          const temp = Math.round(data.current.temperature_2m);
          temperature.value = temp + "°C";
          weatherCode.value = data.current.weather_code || 0;
          weatherLabel.value = getWeatherDesc(weatherCode.value);
        }
      } catch (err) {
      }
    }
    function getWeatherDesc(code) {
      if (code <= 3)
        return "晴朗";
      if (code <= 48)
        return "多云";
      if (code <= 57)
        return "小雨";
      if (code <= 67)
        return "中雨";
      if (code <= 77)
        return "小雪";
      if (code <= 82)
        return "中雨";
      if (code <= 86)
        return "小雪";
      return "阴天";
    }
    async function refreshWeather(silent = true) {
      if (!silent) {
        common_vendor.index.showToast({ title: "正在更新...", icon: "none", duration: 1e3 });
      }
      try {
        const loc = await new Promise((resolve, reject) => {
          common_vendor.index.getLocation({
            type: "wgs84",
            success: resolve,
            fail: reject
          });
        });
        await fetchWeather(loc.latitude, loc.longitude);
      } catch (err) {
        await fetchWeather(39.9, 116.4);
      }
    }
    function handleAction(type) {
      const titles = { expense: "费用支出", reminder: "消息提醒", history: "历史记录" };
      common_vendor.index.showToast({ title: `${titles[type]}（开发中）`, icon: "none" });
    }
    function handleSeeAll() {
      common_vendor.index.showToast({ title: "查看全部公告（开发中）", icon: "none" });
    }
    async function fetchTodayDuty() {
      if (!dormitoryId.value)
        return;
      try {
        const today = /* @__PURE__ */ new Date();
        const dateStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
        const list = await api_modules_schedule.scheduleApi.getList({
          dormitoryId: dormitoryId.value,
          from: dateStr,
          to: dateStr,
          status: "PENDING"
        });
        if (Array.isArray(list) && list.length > 0) {
          todayDuty.value = list[0];
        }
      } catch (err) {
      }
    }
    function handleDutyDetail() {
      common_vendor.index.navigateTo({ url: "/pages/schedule/index" });
    }
    function handleFab() {
      common_vendor.index.showToast({ title: "快速创建（开发中）", icon: "none" });
    }
    common_vendor.onShow(() => {
      updateGreeting();
      refreshWeather();
      fetchTodayDuty();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(greetingText.value),
        b: common_vendor.o(($event) => handleAction("expense"), "ab"),
        c: common_vendor.o(($event) => handleAction("reminder"), "72"),
        d: common_vendor.o(($event) => handleAction("history"), "da"),
        e: common_vendor.o(handleSeeAll, "35"),
        f: common_vendor.t(todayDuty.value ? todayDuty.value.nickname : "未安排"),
        g: common_vendor.t(todayDuty.value ? todayDuty.value.timeSlot || "值日" : "暂无今日值日安排"),
        h: common_vendor.t(todayDuty.value ? "进行中" : "待安排"),
        i: common_vendor.n(todayDuty.value ? "active" : "inactive"),
        j: todayDuty.value
      }, todayDuty.value ? {} : {}, {
        k: common_vendor.o(handleDutyDetail, "d8"),
        l: common_vendor.t(temperature.value),
        m: common_vendor.t(weatherLabel.value),
        n: common_vendor.o(($event) => refreshWeather(false), "52"),
        o: common_vendor.o(handleFab, "07")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
