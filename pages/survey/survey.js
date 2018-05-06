const app = getApp();

Page({
  data: {
    pos: 0,
    surveyData: {},
    currentQuestion: [],
    formData: {
      answer: []
    },
    btn: {
      showing: {
        start: "none",
        previous: "none",
        next: "none",
        submit: "none"
      },
      disable: {
        start: true,
        previous: true,
        next: true,
        submit: true
      }
    }
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '',
    })
    this.setData({
      surveyId: app.globalData.surveyId
    });
    wx.request({
      url: app.globalData.host + '/WeChat/Survey/Get.s2',
      data: {id: app.globalData.surveyId},
      header: {'content-type': 'application/json'},
      success: res => {
        this.setData({
          surveyData: res.data
        });
        this.setQuestion();
        wx.hideLoading();
      }
    });
  },
  setQuestion: function(e) {
    var _oPos = this.data.pos;
    var _pos = this.data.pos;
    var len = this.data.surveyData.questionCount;
    var _btn = this.data.btn;
    var _act = typeof e == undefined || e == null ? null : e.detail.target.dataset.act;
    var _surveyData = this.data.surveyData;
    var _formData = this.data.formData;

    if (_act == "previous" && _pos > 0) _pos --;
    else if ((_act == "next" || _act == "submit") && _pos < len-1) _pos++;
    var _currentQuestion = _surveyData.questions[_pos];

    // 按钮上一条
    if (_pos > 0) {
      _btn.showing.start = "none";
      _btn.disable.start = true;
      _btn.showing.previous = "block";
      _btn.disable.previous = false;
    } else if (_pos == 0) {
      _btn.showing.start = "block";
      _btn.disable.start = false;
      _btn.showing.previous = "none";
      _btn.disable.previous = true;
    } else {
      _btn.showing.start = "none";
      _btn.disable.start = true;
      _btn.showing.previous = "none";
      _btn.disable.previous = true;
    }
    // 按钮下一条
    if (_pos >= len - 1) {
      _btn.showing.previous = "none";
      _btn.disable.previous = true;
      _btn.showing.next = "none";
      _btn.disable.next = true;
      _btn.showing.submit = "none";
      _btn.disable.submit = true;
    } else if (_pos >= len - 2) {
      _btn.showing.next = "none";
      _btn.disable.next = true;
      _btn.showing.submit = "block";
      _btn.disable.submit = false;
    } else if (_pos >= 1) {
      _btn.showing.next = "block";
      _btn.disable.next = false;
      _btn.showing.submit = "none";
      _btn.disable.submit = true;
    } else {
      _btn.showing.next = "none";
      _btn.disable.next = true;
      _btn.showing.submit = "none";
      _btn.disable.submit = true;
    }

    if (_act) {
      var _val = e.detail.value;
      var _choiceVal = _val["choice_" + _oPos];
      var _inputVal = _val["input_" + _oPos];
      _formData.answer[_oPos] = _val;

      for (var j in _surveyData.questions[_oPos].options) {
        var _targetObj = _surveyData.questions[_oPos].options[j];
        _targetObj.checked = false;
      }
      // 选项
      var _inputShowing = _surveyData.questions[_oPos].options.length > 0 ? false : _surveyData.questions[_oPos].inputShowing;
      if (_choiceVal instanceof Array) {
        for (var i in _choiceVal) {
          var _val = _choiceVal[i];
          for (var j in _surveyData.questions[_oPos].options) {
            var _targetObj = _surveyData.questions[_oPos].options[j];
            if (_val == _targetObj.label) _targetObj.checked = true;
            if (_val == _targetObj.label && _targetObj.inputShowing) _inputShowing = true;
          }
        }
      } else {
        for (var j in _surveyData.questions[_oPos].options) {
          var _targetObj = _surveyData.questions[_oPos].options[j];
          if (_choiceVal == _targetObj.label) _targetObj.checked = true;
          if (_choiceVal == _targetObj.label && _targetObj.inputShowing) _inputShowing = true;
        }
      }
      _surveyData.questions[_oPos].inputShowing = _inputShowing;
      // 输入框
      if (typeof (_inputVal) != undefined) {
        _surveyData.questions[_oPos].memo = _inputVal;
      }
    }

    this.setData({
      pos: _pos,
      surveyData: _surveyData,
      currentQuestion: [_currentQuestion],
      formData: _formData,
      btn: _btn
    });

    if (_act == "submit") {
      this.formSubmit(e);
    }
  },
  formSubmit: function(e) {
    wx.showLoading({
      title: '',
    });
    var data = this.data.formData;
    var surveyData = this.data.surveyData;
    data.id = surveyData.id;
    data.openid = app.globalData.openid || "";
    data.sessionKey = app.globalData.sessionKey || "";
    data.unionId = app.globalData.unionId || "";
    data.encryptedData = app.globalData.phoneNumber.encryptedData;
    data.iv = app.globalData.phoneNumber.iv;
    data.beginTime = surveyData.beginTime;
    data.userInfo = typeof app.globalData.userInfo != undefined && app.globalData.userInfo != null ? JSON.stringify(app.globalData.userInfo) : "{}";

    wx.request({
      url: app.globalData.host + '/WeChat/Survey/Answer.s2',
      data: { data: JSON.stringify(data) },
      method: 'GET',
      complete: res => {
        console.log(res)
        var statusCode = res.statusCode || 0;
        res.data = res.data || { success: statusCode == 200, message: "" };
        wx.hideLoading();
        if (statusCode != 200 || ((res.data&&!res.data.success) || false)) {
          wx.showModal({
            title: '发生错误',
            content: '发生错误 [' + (res.data.message || (statusCode != 200 && statusCode != 0 ? "statusCode:" + statusCode : res.errMsg)) + ']',
            showCancel: false,
            confirmText: '重试',
            complete: res => {
              this.formSubmit();
            }
          });
        }
      }
    });
  },
  optChange: function(e) {
    var that = this;
    var _id = e.currentTarget.dataset.id;
    var _inputShowing = false;
    var _currentQuestion = that.data.currentQuestion[0];

    for (var i in _currentQuestion.options) {
      var _opt = _currentQuestion.options[i];
      _opt.checked = false;
    }

    for (var j in _currentQuestion.options) {
      var opt = _currentQuestion.options[j];
      if (e.detail.value instanceof Array) {
        for (var n in e.detail.value) {
          var val = e.detail.value[n];
          if (opt.label == val) {
            opt.checked = true;
            if (opt.inputShowing) _inputShowing = true;
            break;
          }
        }
      } else {
        var val = e.detail.value;
        if (opt.label == val) {
          opt.checked = true;
          if (opt.inputShowing) _inputShowing = true;
          break;
        }
      }
    }
    _currentQuestion.inputShowing = _inputShowing;

    that.setData({ currentQuestion: [_currentQuestion] });
  }
});