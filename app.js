//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: this.globalData.host + '/WeChat/Login.s2',
          data: {code: res.code},
          success: res => {
            this.globalData.openid = res.data.openid;
            this.globalData.sessionKey = res.data.session_key;
            this.globalData.unionId = res.data.unionId||null;
          },
          fail: res => {
            wx.showModal({
              title: '错误',
              content: '登录是发生错误 ["' + res.errMsg + '"]',
              showCancel: false
            });
          }
        });
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        wx.getUserInfo({
          success: res => {
            this.globalData.userInfo = res.userInfo;
            if (this.userInfoReadyCallback) {
              this.userInfoReadyCallback(res);
            }
          }
        });
      }
    });
  },
  globalData: {
    userInfo: null,
    phoneNumber: null,
    surveyId: 0,
    host: 'https://jxszyyy.org.cn/wx'
  }
})