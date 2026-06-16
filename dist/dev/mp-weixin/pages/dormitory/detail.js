"use strict";
const common_vendor = require("../../common/vendor.js");
const api_modules_dormitory = require("../../api/modules/dormitory.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    var _a;
    const dormitory = common_vendor.ref({});
    const members = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const roleLabels = { LEADER: "舍长", MEMBER: "成员" };
    const avatarBgs = ["bg-lead", "bg-m1", "bg-m2", "bg-m3"];
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const dormitoryId = ((_a = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _a.id) || "";
    async function fetchDetail() {
      if (!dormitoryId) {
        common_vendor.index.showToast({ title: "缺少宿舍ID", icon: "none" });
        return;
      }
      try {
        const data = await api_modules_dormitory.dormitoryApi.getInfo(dormitoryId);
        if (data) {
          dormitory.value = data.dormitory || {};
          members.value = (data.members || []).map((m, i) => ({
            ...m,
            displayName: m.nickname || "未知",
            displayRole: roleLabels[m.role] || m.role || "成员",
            isLeader: m.role === "LEADER",
            avatarBg: avatarBgs[i % avatarBgs.length]
          }));
        }
      } catch (err) {
        common_vendor.index.showToast({ title: "加载宿舍详情失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function handleMore() {
      common_vendor.index.showActionSheet({
        itemList: ["修改宿舍名称", "退出宿舍"],
        success: async (res) => {
          if (res.tapIndex === 0) {
            common_vendor.index.showModal({
              title: "修改宿舍名称",
              editable: true,
              content: "",
              placeholderText: dormitory.value.name || "",
              success: async (r) => {
                if (r.confirm && r.content) {
                  try {
                    await api_modules_dormitory.dormitoryApi.updateName(r.content.trim());
                    dormitory.value.name = r.content.trim();
                    common_vendor.index.showToast({ title: "修改成功", icon: "success" });
                  } catch (err) {
                    common_vendor.index.showToast({ title: "修改失败", icon: "none" });
                  }
                }
              }
            });
          } else if (res.tapIndex === 1) {
            common_vendor.index.showModal({
              title: "提示",
              content: "确定退出当前宿舍吗？",
              success: async (r) => {
                if (r.confirm) {
                  try {
                    await api_modules_dormitory.dormitoryApi.leave(dormitory.value.id);
                    common_vendor.index.showToast({ title: "已退出", icon: "success" });
                    setTimeout(() => common_vendor.index.navigateBack(), 1e3);
                  } catch (err) {
                    common_vendor.index.showToast({ title: "退出失败", icon: "none" });
                  }
                }
              }
            });
          }
        }
      });
    }
    function handleSwitch() {
      common_vendor.index.navigateTo({ url: "/pages/dormitory/list" });
    }
    function handleMember(m) {
      if (m.isLeader)
        return;
      common_vendor.index.showActionSheet({
        itemList: ["移出宿舍"],
        success: async (res) => {
          if (res.tapIndex === 0) {
            try {
              await api_modules_dormitory.dormitoryApi.kickMember(m.userId);
              common_vendor.index.showToast({ title: "已移出", icon: "success" });
              fetchDetail();
            } catch (err) {
              common_vendor.index.showToast({ title: "操作失败", icon: "none" });
            }
          }
        }
      });
    }
    async function copyCode() {
      common_vendor.index.setClipboardData({
        data: dormitory.value.invitationCode || "",
        success: () => common_vendor.index.showToast({ title: "邀请码已复制", icon: "success" })
      });
    }
    async function refreshCode() {
      try {
        const res = await api_modules_dormitory.dormitoryApi.refreshCode();
        dormitory.value.invitationCode = (res == null ? void 0 : res.invitationCode) || dormitory.value.invitationCode;
        common_vendor.index.showToast({ title: "邀请码已刷新", icon: "success" });
      } catch (err) {
        common_vendor.index.showToast({ title: "刷新失败", icon: "none" });
      }
    }
    function inviteFriend() {
      common_vendor.index.showToast({ title: "分享功能（开发中）", icon: "none" });
    }
    function handleAction(type) {
      const labels = { log: "宿舍日志", settings: "宿舍设置" };
      common_vendor.index.showToast({ title: `「${labels[type]}」开发中`, icon: "none" });
    }
    let refreshTimer = null;
    async function autoRefreshCode() {
      try {
        const res = await api_modules_dormitory.dormitoryApi.refreshCode();
        if (res == null ? void 0 : res.invitationCode) {
          dormitory.value.invitationCode = res.invitationCode;
        }
      } catch (err) {
      }
    }
    common_vendor.onMounted(() => {
      fetchDetail();
      refreshTimer = setInterval(autoRefreshCode, 30 * 60 * 1e3);
    });
    common_vendor.onUnmounted(() => {
      if (refreshTimer)
        clearInterval(refreshTimer);
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "30"),
        b: common_vendor.o(handleMore, "55"),
        c: common_vendor.t(dormitory.value.id),
        d: common_vendor.t(members.value.length),
        e: common_vendor.t(dormitory.value.name || "加载中..."),
        f: common_vendor.o(handleSwitch, "b6"),
        g: common_vendor.t(members.value.length),
        h: common_vendor.f(members.value, (m, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.n(m.avatarBg),
            b: common_vendor.t(m.displayName),
            c: common_vendor.t(m.displayRole),
            d: m.isLeader ? 1 : "",
            e: m.isLeader
          }, m.isLeader ? {} : {}, {
            f: m.userId,
            g: common_vendor.o(($event) => handleMember(m), m.userId)
          });
        }),
        i: common_vendor.t(dormitory.value.invitationCode || "---"),
        j: common_vendor.o(copyCode, "22"),
        k: common_vendor.o(refreshCode, "76"),
        l: common_vendor.o(inviteFriend, "24"),
        m: common_vendor.o(($event) => handleAction("log"), "30"),
        n: common_vendor.o(($event) => handleAction("settings"), "a9")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f6d0a58e"]]);
wx.createPage(MiniProgramPage);
