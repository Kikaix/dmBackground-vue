"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_schedule = require("../../api/modules/schedule.js");
const store_useUserStore = require("../../store/useUserStore.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = store_useUserStore.useUserStore();
    const dormitoryId = common_vendor.computed(() => {
      var _a;
      return ((_a = userStore.userInfo) == null ? void 0 : _a.activeDormitoryId) || "";
    });
    const weekSchedules = common_vendor.ref([]);
    const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];
    const icons = ["🧠", "🎮", "✨", "🎉", "🥳"];
    const isPicking = common_vendor.ref(false);
    const pickerIcon = common_vendor.ref("👥");
    const resultText = common_vendor.ref("");
    const resultVisible = common_vendor.ref(false);
    function formatDate(d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
    async function loadSchedules() {
      if (!dormitoryId.value)
        return;
      try {
        const today = /* @__PURE__ */ new Date();
        const start = new Date(today);
        const end = new Date(today);
        end.setDate(today.getDate() + 6);
        const list = await api_modules_schedule.scheduleApi.getList({
          dormitoryId: dormitoryId.value,
          from: formatDate(start),
          to: formatDate(end),
          status: "PENDING"
        });
        const map = {};
        if (Array.isArray(list)) {
          list.forEach((s) => {
            map[s.scheduleDate] = s.nickname;
          });
        }
        const days = [];
        const todayStr = formatDate(today);
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const dateStr = formatDate(d);
          const isToday = dateStr === todayStr;
          const isRest = d.getDay() === 0 || d.getDay() === 6;
          let label;
          if (isToday)
            label = "今天";
          else {
            const diff = Math.round((d - today) / 864e5);
            if (diff === 1)
              label = "明天";
            else if (diff === 2)
              label = "后天";
            else
              label = d.getMonth() + 1 + "月" + d.getDate() + "日";
          }
          days.push({
            date: dateStr,
            label,
            weekLabel: "周" + weekLabels[d.getDay()],
            person: map[dateStr] || null,
            isToday,
            isRest
          });
        }
        weekSchedules.value = days;
      } catch (err) {
      }
    }
    function handleHistory() {
      common_vendor.index.navigateTo({ url: "/pages/interaction/history" });
    }
    function handleSwap() {
      common_vendor.index.showToast({ title: "换班功能开发中", icon: "none" });
    }
    function openDutyModal() {
      common_vendor.index.navigateTo({ url: "/pages/schedule/index" });
    }
    function startRandomPick() {
      if (isPicking.value)
        return;
      isPicking.value = true;
      resultVisible.value = false;
      resultText.value = "";
      const members = weekSchedules.value.filter((d) => d.person).map((d) => d.person);
      const pool = members.length > 0 ? members : ["小明", "小红", "小刚"];
      setTimeout(() => {
        const winner = pool[Math.floor(Math.random() * pool.length)];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        isPicking.value = false;
        pickerIcon.value = randomIcon;
        resultText.value = "🎉 选中的幸运儿: " + winner;
        resultVisible.value = true;
      }, 2e3);
    }
    common_vendor.onShow(() => {
      loadSchedules();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(openDutyModal, "65"),
        b: common_vendor.o(handleHistory, "50"),
        c: weekSchedules.value.length > 0
      }, weekSchedules.value.length > 0 ? {
        d: common_vendor.f(weekSchedules.value, (day, k0, i0) => {
          return {
            a: common_vendor.t(day.label),
            b: common_vendor.t(day.weekLabel),
            c: common_vendor.t(day.person || "待安排"),
            d: common_vendor.t(day.isToday ? "进行中" : day.person ? "待开始" : "未排班"),
            e: common_vendor.n(day.isToday ? "active" : day.person ? "pending" : "empty"),
            f: day.date,
            g: day.isToday ? 1 : "",
            h: day.isRest ? 1 : ""
          };
        })
      } : {}, {
        e: common_vendor.t(pickerIcon.value),
        f: isPicking.value ? 1 : "",
        g: common_vendor.t(isPicking.value ? "抽取中..." : "开始随机抽取"),
        h: isPicking.value ? 1 : "",
        i: common_vendor.o(startRandomPick, "00"),
        j: common_vendor.t(resultText.value),
        k: resultVisible.value ? 1 : "",
        l: common_vendor.o(handleHistory, "ab"),
        m: common_vendor.o(handleSwap, "94")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8bed587c"]]);
wx.createPage(MiniProgramPage);
