"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_dormitory = require("../../api/modules/dormitory.js");
const api_modules_schedule = require("../../api/modules/schedule.js");
const store_useUserStore = require("../../store/useUserStore.js");
const _sfc_main = {
  __name: "member-select",
  setup(__props) {
    const userStore = store_useUserStore.useUserStore();
    const searchText = common_vendor.ref("");
    const allMembers = common_vendor.ref([]);
    async function fetchMembers() {
      var _a;
      const dormitoryId = ((_a = userStore.userInfo) == null ? void 0 : _a.activeDormitoryId) || "";
      try {
        const list = await api_modules_dormitory.dormitoryApi.getMembers(dormitoryId);
        if (Array.isArray(list)) {
          allMembers.value = list.map((m) => ({
            userId: m.userId,
            nickname: m.nickname || "未知",
            role: m.role || "MEMBER",
            scheduled: m.scheduled || false,
            selected: m.scheduled || false
            // 已排班成员默认选中
          }));
        }
      } catch (err) {
        common_vendor.index.showToast({ title: "加载成员失败", icon: "none" });
      }
    }
    common_vendor.onMounted(() => {
      fetchMembers();
    });
    const filteredList = common_vendor.computed(() => {
      const s = searchText.value.trim().toLowerCase();
      if (!s)
        return allMembers.value;
      return allMembers.value.filter(
        (m) => m.nickname.toLowerCase().includes(s)
      );
    });
    const selectedCount = common_vendor.computed(() => allMembers.value.filter((m) => m.selected).length);
    const selectedPreview = common_vendor.computed(() => allMembers.value.filter((m) => m.selected).slice(0, 5));
    const allSelected = common_vendor.computed(() => filteredList.value.length > 0 && filteredList.value.every((m) => m.selected));
    function toggleMember(m) {
      m.selected = !m.selected;
    }
    function toggleSelectAll() {
      const select = !allSelected.value;
      filteredList.value.forEach((m) => {
        m.selected = select;
      });
    }
    function onSearch() {
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    async function confirmSelection() {
      var _a;
      const selected = allMembers.value.filter((m) => m.selected);
      if (selected.length === 0) {
        common_vendor.index.showToast({ title: "请至少选择一人", icon: "none" });
        return;
      }
      try {
        const dormitoryId = ((_a = userStore.userInfo) == null ? void 0 : _a.activeDormitoryId) || "";
        await api_modules_schedule.scheduleApi.addToOrder(dormitoryId, selected.map((m) => m.userId));
        common_vendor.index.navigateBack();
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "添加失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "30"),
        b: common_vendor.o([($event) => searchText.value = $event.detail.value, onSearch], "c1"),
        c: searchText.value,
        d: common_vendor.t(filteredList.value.length),
        e: common_vendor.t(allSelected.value ? "取消全选" : "全选"),
        f: common_vendor.o(toggleSelectAll, "ad"),
        g: common_vendor.f(filteredList.value, (m, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(m.nickname),
            b: common_vendor.t(m.role === "LEADER" ? "舍长" : "成员"),
            c: m.selected
          }, m.selected ? {} : {}, {
            d: m.selected ? 1 : "",
            e: m.userId,
            f: m.selected ? 1 : "",
            g: common_vendor.o(($event) => toggleMember(m), m.userId)
          });
        }),
        h: common_vendor.f(selectedPreview.value, (m, i, i0) => {
          return {
            a: m.userId
          };
        }),
        i: selectedCount.value > 5
      }, selectedCount.value > 5 ? {
        j: common_vendor.t(selectedCount.value - 5)
      } : {}, {
        k: common_vendor.t(selectedCount.value),
        l: common_vendor.o(confirmSelection, "87"),
        m: selectedCount.value > 0 ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-98c34711"]]);
wx.createPage(MiniProgramPage);
