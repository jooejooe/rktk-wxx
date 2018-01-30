const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {
    filter: 0,
    filterHold: false,
    yearsHide: true
  },

  onLoad: function () {
    var that = this;
    app.getUserInfo(function () {
      that.listSubject();
    });

    wx.getSystemInfo({
      success: function (res) {
        let w = res.windowWidth - 34
        w /= 5;
        if (w > 100) w = 100;
        if (w < 50) w = 50;
        that.setData({
          fyWidth: w
        })
      }
    })
  },

  onPullDownRefresh: function () {
    this.onLoad();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 800);
  },

  onShow: function () {
    if (zutils.array.inAndErase(app.GLOBAL_DATA.RELOAD_SUBJECT, 'Subject')) {
      this.listSubject();
    }
  },

  listSubject: function () {
    let that = this;
    zutils.post(app, 'api/subject/list?showAll=0&filter=' + this.data.filter, function (res) {
      if (res.data.error_code > 0) {
        that.setData({
          showNosubject: true
        })
        wx.navigateTo({
          url: 'subject-choice?source=first'
        });
        return;
      }

      let _data = res.data.data;
      wx.setNavigationBarTitle({
        title: _data.subject
      });
      _data.showNosubject = false;

      let _sublist1 = _data.sublist1 || [];
      for (let i = 0; i < _sublist1.length; i++) {
        _sublist1[i][4] = _sublist1[i][4].toFixed(1);
        _sublist1[i][10] = _sublist1[i][1].substr(0, 4);
        _sublist1[i][11] = _sublist1[i][1].substr(4, 3);
        let sname = _sublist1[i][1];
        if (sname.indexOf('下午') > -1) {
          _sublist1[i][12] = 'T2';
          if (sname.indexOf('论文') > -1) {
            _sublist1[i][12] = 'T3';
          }
        }
      }

      if (!!!_data.subname1 || _data.sublist1.length == 0) {
        _data.subname1 = null;
        _data.sublist1 = null;
      }
      if (!!!_data.subname2) {
        _data.subname2 = null;
        _data.sublist2 = null;
      }

      if (!_data.subname1 && !_data.subname2) {
        _data.showNodata = true;
      } else {
        _data.showNodata = false;
      }
      that.setData(_data);
      wx.pageScrollTo({
        scrollTop: 0
      })
    });
  },

  doFilter: function (e) {
    let s = e.currentTarget.dataset.s;
    this.setData({
      filter: s,
      yearsText: ~~s > 2000 ? s : null,
      yearsHide: true
    });
    this.listSubject();
  },

  doShowYears: function () {
    this.setData({
      yearsHide: false
    });
    return false;
  },
  doHideYears: function () {
    this.setData({
      yearsHide: true
    })
  },

  onPageScroll: function (res) {
    if (~~res.scrollTop > 80) {
      if (this.data.filterHold == false) {
        this.setData({
          filterHold: true
        })
      }
    } else {
      if (this.data.filterHold == true) {
        this.setData({
          filterHold: false
        })
      }
    }
  },

  onShareAppMessage: function (e) {
    var d = app.warpShareData('/pages/question/subject-list');
    if (this.data.subject) d.title = this.data.subject + '题库';
    else d.title = '软考题库';
    console.log(d);
    return d;
  }
});