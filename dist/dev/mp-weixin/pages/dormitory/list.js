"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_dormitory = require("../../api/modules/dormitory.js");
const store_useUserStore = require("../../store/useUserStore.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const userStore = store_useUserStore.useUserStore();
    const dormList = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const switching = common_vendor.ref(false);
    const activeDormitoryId = common_vendor.computed(() => {
      var _a;
      return (_a = userStore.userInfo) == null ? void 0 : _a.activeDormitoryId;
    });
    async function fetchList() {
      try {
        const data = await api_modules_dormitory.dormitoryApi.getList();
        dormList.value = Array.isArray(data) ? data : (data == null ? void 0 : data.list) || [];
      } catch (err) {
        common_vendor.index.showToast({ title: "加载宿舍列表失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function enterDorm(dorm) {
      common_vendor.index.navigateTo({ url: "/pages/dormitory/detail?id=" + dorm.id + "&name=" + encodeURIComponent(dorm.name) });
    }
    async function switchToDorm(dorm) {
      if (switching.value)
        return;
      switching.value = true;
      try {
        await api_modules_dormitory.dormitoryApi.switchDorm(dorm.id);
        common_vendor.index.showToast({ title: "已切换到 " + dorm.name, icon: "success" });
        await Promise.all([fetchList(), userStore.fetchUserInfo()]);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "切换失败", icon: "none" });
      } finally {
        switching.value = false;
      }
    }
    async function joinDorm() {
      common_vendor.index.showModal({
        title: "加入宿舍",
        content: "请输入宿舍邀请码",
        editable: true,
        placeholderText: "例如 HL-402-A",
        success: async (res) => {
          if (res.confirm && res.content) {
            try {
              await api_modules_dormitory.dormitoryApi.join(res.content.trim());
              common_vendor.index.showToast({ title: "加入成功", icon: "success" });
              await Promise.all([fetchList(), userStore.fetchUserInfo()]);
            } catch (err) {
              common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "加入失败", icon: "none" });
            }
          }
        }
      });
    }
    common_vendor.onMounted(async () => {
      var _a;
      if (!((_a = userStore.userInfo) == null ? void 0 : _a.activeDormitoryId)) {
        await userStore.fetchUserInfo();
      }
      fetchList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "de"),
        b: loading.value
      }, loading.value ? {
        c: common_vendor.f(2, (i, k0, i0) => {
          return {
            a: i
          };
        })
      } : {}, {
        d: !loading.value && dormList.value.length > 0
      }, !loading.value && dormList.value.length > 0 ? {
        e: common_vendor.f(dormList.value, (dorm, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(dorm.id === activeDormitoryId.value ? "🏠" : index % 2 === 0 ? "🏢" : "🏘️"),
            b: common_vendor.n(dorm.id === activeDormitoryId.value ? "active-box" : index % 2 === 0 ? "purple-box" : "pink-box"),
            c: common_vendor.t(dorm.name),
            d: common_vendor.t(dorm.memberCount || 0),
            e: dorm.id === activeDormitoryId.value
          }, dorm.id === activeDormitoryId.value ? {} : {}, {
            f: dorm.id === activeDormitoryId.value
          }, dorm.id === activeDormitoryId.value ? {} : {
            g: common_vendor.o(($event) => switchToDorm(dorm), dorm.id)
          }, {
            h: dorm.id,
            i: dorm.id === activeDormitoryId.value ? 1 : "",
            j: common_vendor.o(($event) => enterDorm(dorm), dorm.id)
          });
        })
      } : {}, {
        f: !loading.value && dormList.value.length === 0
      }, !loading.value && dormList.value.length === 0 ? {} : {}, {
        g: common_vendor.o(joinDorm, "71")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4dbb77e4"]]);
wx.createPage(MiniProgramPage);
