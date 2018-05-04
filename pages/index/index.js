//index.js
//获取应用实例
const app = getApp();

Page({
  data: {
    motto: '鸡西市中医医院©',
    userInfo: {},
    hasUserInfo: false,
    phoneNumber: {},
    hasPhoneNumber: false,
    canIUserInfo: wx.canIUse('button.open-type.getUserInfo'),
    canIPhoneNumber: wx.canIUse('button.open-type.getPhoneNumber'),
    surveyItems: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    wx.showLoading({
      title: '',
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUserInfo) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
    }
    wx.request({
      url: 'https://jxszyyy.org.cn/wx/WeChat/Survey/List.s2',
      header: { 'content-type': 'application/json' },
      success: res => {
        this.setData({
          surveyItems: res.data
        });
        wx.hideLoading();
      }
    });
  },
  onReady: function () {
  },
  getUserInfo: res => {
    app.globalData.userInfo = res.detail.userInfo;
    this.setData({
      userInfo: res.detail.userInfo,
      hasUserInfo: true
    });
  },
  toSurvey: res => {
    if (res.detail.errMsg == "getPhoneNumber:fail user deny") {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '由于未取得授权，调查无法开始',
        success: function(res) {}
      });
    } else {
      app.globalData.phoneNumber = res.detail;
      app.globalData.surveyId = res.currentTarget.dataset.itemId;
      wx.navigateTo({
        url: '../survey/survey'
      });
    }
  }
});
