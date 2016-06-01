/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var uiConfirm = require('ui.confirm');
var GiftModel = require('../../models/anchor/gift.model');
var PopularityModel = require('../../models/live-room/popularity-add.model');
var Backbone = window.Backbone;
var _ = require('underscore');

var msgBox = require('ui.msgBox');
var UserInfo = require('./user.js');

var View = BaseView.extend({
  clientRender: false,
  el: '#giftwarp', // 设置View对象作用于的根元素，比如id
  events: { // 监听事件
    'click #gift-items': 'giftClick',
    'click #btnTop': 'topClick',
    'click #btnLike': 'lickClick' // ,
    // 'click #btnShare': 'shareClick'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.giftTpl = $('#gift-item-tpl').html();

    this.giftParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      offset: 0,
      size: 90000,
      type: 0
    };

    this.giftModel = GiftModel.sharedInstanceModel();
    this.popularityModel = PopularityModel.sharedInstanceModel();
    this.popularityParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      type: 1,
      roomId: 0
    };

    this.isNeedPopup = true;
    this.elements = {};
    this.sendGiftPeriod = 5 * 1000;
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    var el = this.$el;
    this.elements = {
      giftItems: el.find('#gift-items'),
      txtLikeCount: el.find('#txtLikeCount')
    };
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.defineEventInterface();

    this.initGiftList();

    $('#btnShare').click(this.shareClick.bind(this));
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
        self.elements.txtLikeCount.text(data.assemble || 0);
      }
    });

    Backbone.on('event:currentUserInfoReady', function (userInfo) {
      if (userInfo) {
        self.currentUserInfo = userInfo;
      }
    });
    Backbone.on('event:updateRoomInfo', function (data) {
      if (data) {
        self.elements.txtLikeCount.text(data.likeCount || 0);
      }
    });
    Backbone.on('event:liveShowEnded', function (data) {
      if (data) {
        self.roomInfo.status = data.roomStatus;
      }
    });
  },
  initCarousel: function () {
    var warp = $('#giftwarp');
    var jcarousel = warp.find('.jcarousel');
    var carousel;
    var width;

    jcarousel
      .on('jcarousel:reload jcarousel:create', function () {
        carousel = $(this);
        width = carousel.innerWidth();
        width = width / 5;
        carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
      })
      .jcarousel({
        wrap: 'circular'
      });

    warp.find('.jcarousel-control-prev')
        .jcarouselControl({
          target: '-=1'
        });

    warp.find('.jcarousel-control-next')
        .jcarouselControl({
          target: '+=1'
        });
  },
  initGiftList: function () {
    var self = this;

    this.giftModel.get(this.giftParams, function (res) {
      if (res && res.code === '0') {
        if (self.giftTpl) {
          var template = _.template(self.giftTpl);
          self.elements.giftItems.html(template(res || []));
          self.initCarousel();
        }
      }
    }, function (err) {
      console.log(err);
    });
  },
  roomStatusCheck: function () {
    if (!this.roomInfo || this.roomInfo.status !== 2) {
      msgBox.showTip('该直播不在直播中,无法进行互动');
      return false;
    }
    return true;
  },
  giftClick: function (e) {
    var target = e.target;
    if (!this.roomStatusCheck()) {
      return;
    }

    if (e.target.nodeName !== 'LI') {
      target = $(e.target).parent();
    } else {
      target = $(e.target);
    }
    this.sendGift({
      name: target.data('name'),
      giftId: target.data('giftid')
    });
  },

  sendGift: function (data) {
    var self = this;
    if (UserInfo.isDisbaleTalk(user.get('userId'), this.roomInfo.id)) {
      msgBox.showTip('您已经被主播禁言10分钟');
    } else if (UserInfo.isLockScreen(this.roomInfo.id)) {
      msgBox.showTip('主播锁屏中');
    } else {
      if (this.notSend) {
        return null;
      }
      this.notSend = true;

      Backbone.trigger('event:visitorSendGift', {
        msgType: 1,
        giftId: data.giftId,
        giftNum: 1
      });

      setTimeout(function () {
        self.notSend = false;
      }, self.sendGiftPeriod);
    }
    return null;
  },
  topClick: function () {
    var self = this;
    if (!this.roomStatusCheck()) {
      return;
    }
    if (!this.isNeedPopup) {
      self.pushPopularity(2);
      return;
    }
    var content = '<div>使用 <span class="green">20</span>积分支持一下MC,当前共有<span class="green">'
      + (this.currentUserInfo.totalMarks || 0) + '</span>积分</div></br>'
      + '<div style="text-align:right; color:#999;"> <label>' +
      '<input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
    uiConfirm.show({
      title: '顶一下',
      content: content,
      okFn: function () {
        self.pushPopularity(2);
        var check = $('#popupCheckBox');
        if (check.is(':checked')) {
          self.isNeedPopup = false;
        } else {
          self.isNeedPopup = true;
        }
      }
    });
  },

  pushPopularity: function (type) {
    var self = this;
    var promise;
    if (!this.roomStatusCheck()) {
      return;
    }
    this.popularityParams.type = type;
    this.popularityParams.roomId = this.roomInfo.id;
    promise = this.popularityModel.executeJSONP(this.popularityParams);
    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS' && type === 1) {
        Backbone.trigger('event:pleaseUpdateRoomInfo');
        self.getUserInfo();
      } else if (res && res.data.success && type === 2) {
        msgBox.showOK('非常感谢您的大力支持');
        Backbone.trigger('event:pleaseUpdateRoomInfo');
        self.getUserInfo();
      } else {
        msgBox.showTip(res.data.message || '操作失败请您稍后重试');
      }
    });
    promise.fail(function () {
      msgBox.showTip('操作失败请您稍后重试');
    });
  },
  getUserInfo: function () {
    UserInfo.getInfo(function (userInfo) {
      Backbone.trigger('event:currentUserInfoReady', userInfo);
    });
  },

  lickClick: function () {
    var self = this;
    if (!this.roomStatusCheck()) {
      return;
    }
    if (this.isClicked) {
      return;
    }
    this.isClicked = true;
    // 互动
    Backbone.trigger('event:visitorInteractive', {
      nickName: user.get('userName'),
      smallAvatar: user.get('bigheadImg'),
      roomId: self.roomInfo.id || '',
      msgType: 3
    });
    self.pushPopularity(1);
    setTimeout(function () {
      self.isClicked = false;
    }, 5000);
  },
  shareClick: function () {
    var title = encodeURIComponent(this.roomInfo.roomName + ',快来围观吧');
    var url = 'http://' + window.location.host;
    var img = this.roomInfo.posterPic;
    var goUrl;

    if (this.roomInfo.status === 2) {
      url = encodeURIComponent(url + '/liveRoom.html?roomId=' + this.roomInfo.id);
    } else {
      url = encodeURIComponent(url + '/playback.html?roomId=' + this.roomInfo.id);
    }
    var html = '<span class="share-wrap">' +
      '<a href="http://i.yinyuetai.com/share?title=' + title + '&amp;url=' + url + '&amp;cover=' + img + '?t=20160405161857" title="分享到音悦台我的家" class="myhome J_sharelink"></a> ' +

      '<a href="http://v.t.sina.com.cn/share/share.php?appkey=2817290261&amp;url=' + url + '&amp;title=' + title + '&amp;content=gb2312&amp;pic=' + img + '?t=20160405161857&amp;ralateUid=1698229264" title="分享到新浪微博" class="weibo17 J_sharelink"></a>' +

      '<a href="http://connect.qq.com/widget/shareqq/index.html?url=' + url + '&amp;showcount=1&amp;desc=' + title + '&amp;title=' + title + '&amp;site=饭趴&amp;pics=' + img + '?t=20160405161857&amp;style=201&amp;width=39&amp;height=39" title="分享到QQ" class="qq17 J_sharelink"></a>' +

      '<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + url + '&amp;desc=' + title + '" title="分享到QQ空间" class="qzone17 J_sharelink"></a>' +

      '<a href="http://v.yinyuetai.com/share/weixin?title=' + title + '&amp;url=' + url + '" title="分享到微信"  class="weixin17 J_sharelink"></a>' +

      '<a href="http://widget.renren.com/dialog/share?resourceUrl=' + url + '?t=20160405161857&amp;charset=UTF-8&amp;message=' + title + '" title="分享到人人网" class="renren17 J_sharelink"></a>' +

      '<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&amp;url=' + url + '&amp;desc=' + title + '" title="分享到腾讯朋友" class="pengyou17 J_sharelink"></a>' +

      '<a href="http://v.t.qq.com/share/share.php?title=' + title + '&amp;url=' + url + '&amp;pic=' + img + '?t=20160405161857" title="分享到腾讯微博" data-video-id="2539803" class="tencent17 J_sharelink"></a>' +

      '<a href="http://huaban.com/bookmarklet?url=' + url + '&amp;video=&amp;title=' + title + '&amp;media=' + img + '?t=20160405161857&amp;description=' + title + '" title="分享到花瓣网" class="huaban17 J_sharelink"></a>' +

      '<a href="http://t.sohu.com/third/post.jsp?&amp;url=' + url + '&amp;title=' + title + '&amp;content=utf-8" title="分享到搜狐微博" class="sohu17 J_sharelink"></a>' +

      '<a href="http://fql.cc/yytafx?appkey=2817290261&amp;url=' + url + '&amp;title=' + title + '" title="分享到联通飞影" class="unicon17 J_sharelink"></a> ' +
      '</span>';
    uiConfirm.show({
      title: '分享',
      content: html,
      okBtn: false,
      cancelBtn: false,
      okFn: function () {

      }
    });
    $('.share-wrap a').on('click', function () {
      goUrl = $(this).attr('href');
      window.open(goUrl, 'newwindow', 'height=750px,width=700px' +
        ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
      uiConfirm.close();
      return false;
    });
  }
});

module.exports = View;
