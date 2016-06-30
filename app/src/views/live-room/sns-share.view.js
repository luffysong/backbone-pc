/**
 * SNS社区分享，qq,微博，微信等
 */
'use strict';

var $ = require('jquery');
var _ = require('underscore');
var ZeroClipboard = window.ZeroClipboard;

var uiConfirm = require('ui.confirm');
var shareTpl = require('./template/sns-share.html');
var msgBox = require('ui.msgBox');

var View = function (ops) {
  this.options = {};
  $.extend(this.options, ops);
};

$.extend(View.prototype, {
  show: function (target) {
    var self = this;
    var height = target.height();
    var offset = target.offset();
    if (!this.snsDom) {
      var complied = _.template(shareTpl);
      var dom = complied({
        title: encodeURIComponent(this.options.title + ',快来围观吧'),
        url: encodeURIComponent('http://' + window.location.host + this.options.url),
        img: this.options.img
      });
      dom = $(dom);
      self.snsDom = dom;
      $('body').append(dom);
      dom.offset({
        top: offset.top + height + 8,
        left: offset.left - dom.width() + 61
      });

      self._bindCopy('#shareCopy');

      dom.find('a').on('click', function () {
        if ($(this).attr('data-tag') === 'copy') {
          if (!self.clipBoardStatus) {
            msgBox.showTip('复制失败，请尝试分享吧');
          }
          return false;
        }
        self.shareWidnow($(this).attr('href'));
        self.snsDom.hide();
        return false;
      });
      $(document).on('click', function (e) {
        var temp = $(e.target);
        if (self.snsDom && temp.attr('id') !== target.attr('id')) {
          self.snsDom.hide();
        }
        return false;
      });
    } else {
      if (this.snsDom.css('display') === 'block') {
        this.snsDom.hide();
      } else {
        this.snsDom.show();
      }
    }
  },
  hide: function () {
    this.snsDom.hide();
  },
  open: function () {
    var title = encodeURIComponent(this.options.title + ',快来围观吧');
    var url = 'http://' + window.location.host;
    var img = this.options.img;
    var goUrl;

    url = encodeURIComponent(url + this.options.url);
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
      okFn: function () {}
    });
    $('.share-wrap a').on('click', function () {
      goUrl = $(this).attr('href');
      window.open(goUrl, 'newwindow', 'height=750px,width=700px' +
        ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
      uiConfirm.close();
      return false;
    });
  },
  setOptions: function (ops) {
    $.extend(this.options, {
      url: '',
      title: '',
      img: '',
      type: ''
    }, ops);
  },
  shareWidnow: function (url) {
    window.open(url, 'newwindow', 'height=750px,width=700px' +
      ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
  },
  // 设置复制按钮
  _bindCopy: function (id) {
    var target = $(id);
    var self = this;
    this.clipBoard = new ZeroClipboard(target);
    var text = this.options.title + ',快来围观吧!' + 'http://' + window.location.host + this.options.url;
    target.attr({
      'data-clipboard-text': text
    });
    this.clipBoard.on('ready', function () {
      this.on('aftercopy', function () {
        self.clipBoardStatus = true;
        msgBox.showOK('房间地址复制成功！');
      });
    });
    this.clipBoard.on('error', function () {
      self.clipBoardStatus = false;
      // msgBox.showTip('复制失败，请尝试分享吧');
    });
  }
});

module.exports = View;
