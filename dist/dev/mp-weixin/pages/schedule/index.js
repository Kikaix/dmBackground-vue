"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_schedule = require("../../api/modules/schedule.js");
const api_modules_dormitory = require("../../api/modules/dormitory.js");
const store_useUserStore = require("../../store/useUserStore.js");
const _sfc_main = {
  __name: "index",
  setup(__props, { expose: __expose }) {
    const userStore = store_useUserStore.useUserStore();
    const dormitoryId = common_vendor.computed(() => {
      var _a;
      return ((_a = userStore.userInfo) == null ? void 0 : _a.activeDormitoryId) || "";
    });
    const allMembers = common_vendor.ref([]);
    const sortedMembers = common_vendor.ref([]);
    const HOLIDAYS = /* @__PURE__ */ new Set([
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
      // 元旦
      "2026-02-17",
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
      "2026-02-21",
      "2026-02-22",
      "2026-02-23",
      // 春节
      "2026-04-05",
      "2026-04-06",
      "2026-04-07",
      // 清明节
      "2026-05-01",
      "2026-05-02",
      "2026-05-03",
      "2026-05-04",
      "2026-05-05",
      // 劳动节
      "2026-06-19",
      "2026-06-20",
      "2026-06-21",
      // 端午节
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      // 中秋节
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-05",
      "2026-10-06",
      "2026-10-07"
      // 国庆节
    ]);
    function isRestDay(dateStr) {
      const d = new Date(dateStr);
      return d.getDay() === 0 || d.getDay() === 6 || HOLIDAYS.has(dateStr);
    }
    async function fetchMembers() {
      try {
        const list = await api_modules_dormitory.dormitoryApi.getMembers(dormitoryId.value);
        if (Array.isArray(list)) {
          allMembers.value = list.map((m) => ({
            userId: m.userId,
            nickname: m.nickname || "未知",
            avatarUrl: m.avatarUrl || ""
          }));
        }
      } catch (err) {
      }
    }
    async function fetchOrder() {
      await fetchMembers();
      try {
        const data = await api_modules_schedule.scheduleApi.getOrder(dormitoryId.value);
        if (data && data.length > 0) {
          sortedMembers.value = data.sort((a, b) => a.sortOrder - b.sortOrder).map((o) => {
            const member = allMembers.value.find((m) => m.userId === o.userId);
            return {
              userId: o.userId,
              nickname: (member == null ? void 0 : member.nickname) || "成员" + o.userId,
              avatarUrl: (member == null ? void 0 : member.avatarUrl) || ""
            };
          });
        } else {
          sortedMembers.value = [];
        }
      } catch (err) {
        sortedMembers.value = [];
      }
    }
    function toggleOrder(i) {
      const item = sortedMembers.value.splice(i, 1)[0];
      sortedMembers.value.push(item);
      common_vendor.index.showToast({ title: `${item.nickname} 已移至末尾`, icon: "none" });
    }
    async function resetOrder() {
      try {
        await api_modules_schedule.scheduleApi.clearOrder(dormitoryId.value);
        sortedMembers.value = [];
        common_vendor.index.showToast({ title: "已清空排班顺序", icon: "success" });
      } catch (err) {
        common_vendor.index.showToast({ title: "清空失败", icon: "none" });
      }
    }
    function addMember() {
      common_vendor.index.navigateTo({ url: "/pages/schedule/member-select" });
    }
    async function refreshOrder() {
      await fetchOrder();
    }
    async function removeMember(userId) {
      const member = sortedMembers.value.find((m) => m.userId === userId);
      common_vendor.index.showModal({
        title: "移除成员",
        content: `确定将 ${(member == null ? void 0 : member.nickname) || userId} 从排班顺序中移除吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_modules_schedule.scheduleApi.removeFromOrder(dormitoryId.value, userId);
              sortedMembers.value = sortedMembers.value.filter((m) => m.userId !== userId);
              common_vendor.index.showToast({ title: "已移除", icon: "success" });
            } catch (err) {
              common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "移除失败", icon: "none" });
            }
          }
        }
      });
    }
    const weekDays = common_vendor.ref([]);
    const weekRange = common_vendor.ref("");
    const weekStartDate = common_vendor.ref(formatDate(getWeekStart(/* @__PURE__ */ new Date())));
    function getWeekStart(date) {
      const d = new Date(date);
      d.setDate(date.getDate() - 2);
      return d;
    }
    function formatDate(d) {
      return d.toISOString().split("T")[0];
    }
    function onWeekChange(e) {
      weekStartDate.value = e.detail.value;
      buildWeek(new Date(e.detail.value));
    }
    async function buildWeek(baseDate) {
      const now = baseDate || /* @__PURE__ */ new Date();
      const start = getWeekStart(now);
      const realToday = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];
      const todayStr = realToday;
      const startStr = `${start.getMonth() + 1}月${start.getDate()}日`;
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const endStr = `${end.getMonth() + 1}月${end.getDate()}日`;
      weekRange.value = `${startStr} - ${endStr}`;
      let scheduleMap = {};
      const fromStr = formatDate(start);
      const toStr = formatDate(end);
      try {
        const list = await api_modules_schedule.scheduleApi.getList({
          dormitoryId: dormitoryId.value,
          from: fromStr,
          to: toStr,
          status: "PENDING"
        });
        if (Array.isArray(list)) {
          list.forEach((s) => {
            scheduleMap[s.scheduleDate] = s.nickname;
          });
        }
      } catch (err) {
      }
      try {
        const history = await api_modules_schedule.scheduleApi.getHistory({
          dormitoryId: dormitoryId.value,
          from: fromStr,
          to: toStr
        });
        if (Array.isArray(history)) {
          history.forEach((s) => {
            if (s.scheduleDate < todayStr && !scheduleMap[s.scheduleDate]) {
              scheduleMap[s.scheduleDate] = s.nickname;
            }
          });
        }
      } catch (err) {
      }
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = formatDate(d);
        const isPast = dateStr < todayStr;
        const isToday = dateStr === todayStr;
        days.push({
          date: dateStr,
          dayNum: d.getDate(),
          weekLabel: "周" + weekLabels[d.getDay()],
          isRest: isRestDay(dateStr),
          locked: isPast,
          isToday,
          person: scheduleMap[dateStr] || null
        });
      }
      weekDays.value = days;
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function handleNotify() {
      common_vendor.index.showToast({ title: "暂无通知", icon: "none" });
    }
    async function autoSchedule() {
      if (sortedMembers.value.length === 0) {
        common_vendor.index.showToast({ title: "请先添加排班成员", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "排班计算中..." });
      try {
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        await api_modules_schedule.scheduleApi.generate(dormitoryId.value, {
          startDate: today,
          days: 7,
          timeSlot: "上午"
        });
        await buildWeek();
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "已按顺序自动分配", icon: "success" });
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "排班失败", icon: "none" });
      }
    }
    function clearSchedule() {
      common_vendor.index.showModal({
        title: "确认清除",
        content: "清除当前日期之后的所有排班吗？历史记录将保留。",
        success: async (res) => {
          if (res.confirm) {
            try {
              const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
              await api_modules_schedule.scheduleApi.clear(dormitoryId.value, today);
              await buildWeek();
              common_vendor.index.showToast({ title: "已清除当前日期之后的排班", icon: "success" });
            } catch (err) {
              common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "清除失败", icon: "none" });
            }
          }
        }
      });
    }
    async function saveSchedule() {
      try {
        const data = sortedMembers.value.map((m, i) => ({ userId: m.userId, sortOrder: i + 1 }));
        await api_modules_schedule.scheduleApi.updateOrder(dormitoryId.value, data);
        common_vendor.index.showToast({ title: "排班计划保存成功！", icon: "success" });
      } catch (err) {
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      }
    }
    common_vendor.onShow(async () => {
      await fetchOrder();
      await buildWeek();
    });
    __expose({ refreshOrder });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "30"),
        b: common_vendor.o(handleNotify, "ba"),
        c: common_vendor.o(resetOrder, "65"),
        d: common_vendor.f(sortedMembers.value, (m, i, i0) => {
          return {
            a: common_vendor.n("bg-" + i % 4),
            b: common_vendor.t(i + 1),
            c: common_vendor.o(($event) => removeMember(m.userId), m.userId),
            d: common_vendor.t(m.nickname),
            e: m.userId,
            f: common_vendor.o(($event) => toggleOrder(i), m.userId)
          };
        }),
        e: common_vendor.o(addMember, "16"),
        f: common_vendor.o(autoSchedule, "15"),
        g: common_vendor.o(clearSchedule, "63"),
        h: common_vendor.t(weekRange.value),
        i: weekStartDate.value,
        j: common_vendor.o(onWeekChange, "f4"),
        k: common_vendor.f(weekDays.value, (day, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(day.dayNum),
            b: common_vendor.t(day.weekLabel),
            c: day.locked && day.person
          }, day.locked && day.person ? {
            d: common_vendor.t(day.person)
          } : day.isToday && day.person ? {
            f: common_vendor.t(day.person)
          } : day.isToday && !day.person ? {} : day.isRest ? {} : day.person ? {
            j: common_vendor.t(day.person)
          } : {}, {
            e: day.isToday && day.person,
            g: day.isToday && !day.person,
            h: day.isRest,
            i: day.person,
            k: day.isToday
          }, day.isToday ? {} : !day.isRest ? {} : {}, {
            l: !day.isRest,
            m: day.date,
            n: day.locked ? 1 : "",
            o: day.isToday ? 1 : "",
            p: day.isRest ? 1 : ""
          });
        }),
        l: common_vendor.o(saveSchedule, "02")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d5b2057b"]]);
wx.createPage(MiniProgramPage);
