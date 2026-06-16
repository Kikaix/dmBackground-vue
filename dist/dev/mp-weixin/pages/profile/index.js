"use strict";
const common_vendor = require("../../common/vendor.js");
const store_useUserStore = require("../../store/useUserStore.js");
const api_modules_user = require("../../api/modules/user.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = store_useUserStore.useUserStore();
    const isLoggedIn = common_vendor.computed(() => userStore.isLoggedIn);
    common_vendor.computed(() => !!userInfo.avatarUrl);
    const currentTime = common_vendor.ref("");
    const noticeEnabled = common_vendor.ref(true);
    const avatarLoadError = common_vendor.ref(false);
    function randomSuffix() {
      return Math.random().toString(36).substring(2, 6);
    }
    const defaultNickname = common_vendor.ref("未授权_" + randomSuffix());
    const userInfo = common_vendor.reactive({
      nickName: "",
      avatarUrl: "",
      role: ""
    });
    function updateTime() {
      const now = /* @__PURE__ */ new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      currentTime.value = `${h}:${m}`;
    }
    function syncUserInfo() {
      const info = userStore.userInfo;
      if (info) {
        userInfo.nickName = info.nickname || "";
        userInfo.avatarUrl = info.avatarUrl || "";
        userInfo.role = userStore.userRole || "";
        if (typeof info.notificationEnabled !== "undefined") {
          noticeEnabled.value = info.notificationEnabled === 1 || info.notificationEnabled === true;
        }
      }
    }
    async function handleWechatLogin() {
      try {
        common_vendor.index.showLoading({ title: "登录中...", mask: true });
        await new Promise((resolve, reject) => {
          common_vendor.wx$1.login({
            success: (res) => {
              if (res.code) {
                userStore.wechatLogin(res.code).then(resolve).catch(reject);
              } else {
                reject(new Error("获取微信登录凭证失败"));
              }
            },
            fail: (err) => reject(err)
          });
        });
        common_vendor.index.hideLoading();
        await userStore.fetchUserInfo();
        syncUserInfo();
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      } catch (err) {
        common_vendor.index.hideLoading();
        const msg = (err == null ? void 0 : err.message) || "登录失败，请重试";
        common_vendor.index.showToast({ title: msg, icon: "none" });
      }
    }
    async function onChooseAvatar(e) {
      const avatarUrl = e.detail.avatarUrl;
      if (avatarUrl) {
        userInfo.avatarUrl = avatarUrl;
        userStore.updateProfile({ avatarUrl });
        try {
          await api_modules_user.userApi.updateProfile({
            nickname: userInfo.nickName || defaultNickname.value,
            avatarUrl
          });
        } catch (err) {
        }
      }
    }
    function onNicknameInput(e) {
      const nickName = e.detail.value;
      if (nickName && nickName !== userInfo.nickName) {
        userInfo.nickName = nickName;
        userStore.updateProfile({ nickname: nickName });
        api_modules_user.userApi.updateProfile({ nickname: nickName, avatarUrl: userInfo.avatarUrl || "" }).catch(() => {
        });
      }
    }
    async function handleNoticeToggle() {
      const next = !noticeEnabled.value;
      try {
        await api_modules_user.userApi.updateNotification(next);
        noticeEnabled.value = next;
      } catch (err) {
        common_vendor.index.showToast({ title: "设置失败，请重试", icon: "none" });
      }
    }
    function handleMenu(type) {
      if (type === "dormitory") {
        common_vendor.index.navigateTo({
          url: "/pages/dormitory/list",
          fail: (err) => common_vendor.index.showToast({ title: "页面跳转失败: " + err.errMsg, icon: "none" })
        });
        return;
      }
      const titles = {
        message: "消息设置",
        theme: "主题皮肤",
        help: "帮助中心",
        feedback: "意见反馈",
        service: "联系客服"
      };
      common_vendor.index.showToast({ title: `「${titles[type] || "设置项"}」功能开发中`, icon: "none" });
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            userStore.logout();
            userInfo.nickName = "";
            userInfo.avatarUrl = "";
            userInfo.role = "";
            avatarLoadError.value = false;
            common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
          }
        }
      });
    }
    common_vendor.onMounted(async () => {
      updateTime();
      setInterval(updateTime, 6e4);
      if (isLoggedIn.value) {
        await userStore.fetchUserInfo();
      }
      syncUserInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoggedIn.value
      }, isLoggedIn.value ? common_vendor.e({
        b: userInfo.avatarUrl && !avatarLoadError.value
      }, userInfo.avatarUrl && !avatarLoadError.value ? {
        c: userInfo.avatarUrl,
        d: common_vendor.o(($event) => avatarLoadError.value = true, "99")
      } : {}, {
        e: !userInfo.avatarUrl || avatarLoadError.value
      }, !userInfo.avatarUrl || avatarLoadError.value ? {} : {}, {
        f: !userInfo.avatarUrl ? 1 : "",
        g: common_vendor.o(onChooseAvatar, "2b"),
        h: !!userInfo.nickName ? 1 : "",
        i: userInfo.nickName,
        j: defaultNickname.value,
        k: common_vendor.o(onNicknameInput, "81"),
        l: common_vendor.t(userInfo.role || "学生")
      }) : {
        m: common_vendor.o(handleWechatLogin, "6e")
      }, {
        n: noticeEnabled.value ? 1 : "",
        o: common_vendor.o(handleNoticeToggle, "fb"),
        p: common_vendor.o(($event) => handleMenu("message"), "b5"),
        q: common_vendor.o(($event) => handleMenu("theme"), "ae"),
        r: common_vendor.o(($event) => handleMenu("dormitory"), "62"),
        s: common_vendor.o(($event) => handleMenu("help"), "cb"),
        t: common_vendor.o(($event) => handleMenu("feedback"), "7f"),
        v: common_vendor.o(($event) => handleMenu("service"), "57"),
        w: isLoggedIn.value
      }, isLoggedIn.value ? {
        x: common_vendor.o(handleLogout, "f4")
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f97f9319"]]);
wx.createPage(MiniProgramPage);
