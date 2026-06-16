"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_schedule = require("../../api/modules/schedule.js");
const store_useUserStore = require("../../store/useUserStore.js");
const _sfc_main = {
  __name: "history",
  setup(__props) {
    const userStore = store_useUserStore.useUserStore();
    const dormitoryId = common_vendor.computed(() => {
      var _a;
      return ((_a = userStore.userInfo) == null ? void 0 : _a.activeDormitoryId) || "";
    });
    const searchText = common_vendor.ref("");
    const historyList = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const loadingMore = common_vendor.ref(false);
    const noMore = common_vendor.ref(false);
    const historyTo = common_vendor.ref("");
    const showSheet = common_vendor.ref(false);
    const editingItem = common_vendor.ref(null);
    const editStatus = common_vendor.ref("");
    const weekLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    function formatDateLabel(dateStr) {
      if (!dateStr)
        return "";
      const d = new Date(dateStr);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const w = weekLabels[d.getDay()];
      return `${m}月${day}日 · ${w}`;
    }
    function statusClass(status) {
      if (status === "COMPLETED")
        return "done";
      if (status === "CANCELLED")
        return "cancelled";
      return "pending";
    }
    function statusLabel(status) {
      if (status === "COMPLETED")
        return "已完成";
      if (status === "CANCELLED")
        return "已取消";
      return "待执行";
    }
    const filteredList = common_vendor.computed(() => {
      const s = searchText.value.trim().toLowerCase();
      if (!s)
        return historyList.value;
      return historyList.value.filter(
        (item) => item.nickname.toLowerCase().includes(s) || (item.scheduleDate || "").includes(s)
      );
    });
    let searchTimer = null;
    function onSearch() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
      }, 300);
    }
    async function fetchHistory(reset) {
      if (!dormitoryId.value)
        return;
      if (reset) {
        loading.value = true;
        historyList.value = [];
        noMore.value = false;
      } else {
        if (loadingMore.value || noMore.value)
          return;
        loadingMore.value = true;
      }
      try {
        const now = /* @__PURE__ */ new Date();
        const toDate = reset ? now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0") : historyTo.value || now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
        const fromD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
        const fromStr = fromD.getFullYear() + "-" + String(fromD.getMonth() + 1).padStart(2, "0") + "-" + String(fromD.getDate()).padStart(2, "0");
        const result = await api_modules_schedule.scheduleApi.getHistory({
          dormitoryId: dormitoryId.value,
          from: fromStr,
          to: toDate
        });
        const list = Array.isArray(result) ? result : (result == null ? void 0 : result.records) || (result == null ? void 0 : result.list) || [];
        if (list.length > 0) {
          const enriched = list.map((item) => ({
            id: item.id,
            nickname: item.nickname || "未知",
            scheduleDate: item.scheduleDate || "",
            timeSlot: item.timeSlot || "",
            remark: item.remark || "",
            status: item.status || "PENDING",
            weekLabel: item.scheduleDate ? weekLabels[(/* @__PURE__ */ new Date(item.scheduleDate + "T00:00:00")).getDay()] : ""
          }));
          if (reset) {
            historyList.value = enriched;
          } else {
            historyList.value = [...historyList.value, ...enriched];
          }
          historyTo.value = fromStr;
          if (list.length < 14)
            noMore.value = true;
        } else {
          if (reset)
            historyList.value = [];
          noMore.value = true;
        }
      } catch (err) {
        if (reset)
          historyList.value = [];
        console.error("fetchHistory error:", err);
      } finally {
        loading.value = false;
        loadingMore.value = false;
      }
    }
    function loadMore() {
      fetchHistory(false);
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function openEdit(item) {
      editingItem.value = item;
      editStatus.value = item.status || "COMPLETED";
      showSheet.value = true;
    }
    function closeSheet() {
      showSheet.value = false;
      editingItem.value = null;
    }
    async function saveEdit() {
      if (!editingItem.value)
        return;
      try {
        if (editStatus.value === "COMPLETED") {
          await api_modules_schedule.scheduleApi.complete(editingItem.value.id);
        } else {
          await api_modules_schedule.scheduleApi.update(editingItem.value.id, { status: editStatus.value });
        }
        const idx = historyList.value.findIndex((h) => h.id === editingItem.value.id);
        if (idx !== -1) {
          historyList.value[idx].status = editStatus.value;
        }
        common_vendor.index.showToast({ title: "修改成功", icon: "success" });
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "修改失败", icon: "none" });
      }
      closeSheet();
    }
    common_vendor.onShow(() => {
      fetchHistory(true);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "de"),
        b: common_vendor.o([($event) => searchText.value = $event.detail.value, onSearch], "c1"),
        c: searchText.value,
        d: common_vendor.f(filteredList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(formatDateLabel(item.scheduleDate)),
            b: common_vendor.t(item.nickname),
            c: common_vendor.t(statusLabel(item.status)),
            d: common_vendor.n(statusClass(item.status)),
            e: item.id,
            f: common_vendor.o(($event) => openEdit(item), item.id)
          };
        }),
        e: loadingMore.value
      }, loadingMore.value ? {} : noMore.value && historyList.value.length > 0 ? {} : historyList.value.length === 0 && !loading.value ? {} : {}, {
        f: noMore.value && historyList.value.length > 0,
        g: historyList.value.length === 0 && !loading.value,
        h: common_vendor.o(loadMore, "16"),
        i: showSheet.value
      }, showSheet.value ? {
        j: common_vendor.o(closeSheet, "8e")
      } : {}, {
        k: editingItem.value
      }, editingItem.value ? {
        l: common_vendor.t(editingItem.value.scheduleDate),
        m: common_vendor.t(editingItem.value.nickname),
        n: common_vendor.t(editingItem.value.timeSlot || "值日")
      } : {}, {
        o: editStatus.value === "COMPLETED" ? 1 : "",
        p: common_vendor.o(($event) => editStatus.value = "COMPLETED", "ae"),
        q: editStatus.value === "CANCELLED" ? 1 : "",
        r: common_vendor.o(($event) => editStatus.value = "CANCELLED", "f5"),
        s: common_vendor.o(closeSheet, "2d"),
        t: common_vendor.o(saveEdit, "b8"),
        v: showSheet.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7cb4588c"]]);
wx.createPage(MiniProgramPage);
