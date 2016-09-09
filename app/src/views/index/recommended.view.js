/*
  首页顶部推荐频道列表
 */
'use strict';

var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;
// 首页轮播
var CarouselModel = require('../../models/index/carousel.model');
// var FanUserModel = require('../../models/index/fan-user.model');
// var ChannelModel = require('../../models/index/channel.model');

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var FlashApi = require('FlashApi');

var View = BaseView.extend({
  el: '#topContainer',
  rawLoader: function () {
    return require('./template/recommend.html');
  },
  events: {
    'click .gotoLiveHome': 'gotoLiveHome',
    'click #livingList': 'videoListClicked',
    'click .hoverBtn': 'gotoLiveHome'
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.elements = {};
    this.recommendParameter = {
      deviceinfo: '{"aid":"30001001"}'
    };
    this.recommendParameter.access_token = user.getWebToken();

    this.queryParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken()
    };

    this.carouselModel = new CarouselModel();
    // this.fanUserModel = new FanUserModel();
    // this.channelModel = new ChannelModel();
  },
  afterMount: function () {
    // 读取整个模块的模板
    // this.recommendTpl = this.$el.find('#recommendTpl').html();
    // 获取右侧列表模板
    // this.livingItemTpl = this.$el.find('#liveItemTpl').html();
    this.livingItemTpl = require('./template/recommend-item-tpl.html');
    this.elements.videoList = this.$el.find('#livingList');
    this.elements.videoName = this.$el.find('#viedoName');
    this.elements.btnGoLiveRoom = this.$el.find('#btnGoLiveRoom');
    this.elements.flashWrap = this.$el.find('#topFlash');
    this.elements.hoverGo2Room = this.$el.find('#hoverGo2Room');
  },
  ready: function () {
    //  初始化
    this.renderList();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  getCarouselList: function () {
    var params = _.extend(this.queryParams, {
      offset: 0,
      size: 5
    });
    return this.carouselModel.executeJSONP(params);
  },
  // 渲染右侧列表
  renderList: function () {
    var self = this;
    var html = '';
    var promise = this.getCarouselList();
    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS') {
        self.videoListData = res.data || [];
        html = self.compileHTML(self.livingItemTpl, res);
        self.elements.videoList.html(html);
        if (res.data && res.data.length > 0) {
          self.selectedFirstToPlay();
        }
      }
    });
  },
  // xuanz
  selectedFirstToPlay: function () {
    var rnum = this.fRandomBy(0, 4);
    var target = this.elements.videoList.find('.item').eq(rnum);
    this.videoListClicked({
      target: target
    });
  },
  /**
   * 查找视频信息
   */
  findVideo: function (videoid) {
    return _.find(this.videoListData, function (item) {
      return item.videoId === ~~videoid;
    });
  },
  // 设置flash
  setFlash: function (video) {
    var videoInfo = video;
    if (video.status === 2 || video.status === 3) {
      // this.FlashApi = FlashApi.sharedInstanceFlashApi({
      this.FlashApi = new FlashApi({
        el: 'topFlash',
        props: {
          width: 980,
          height: 550
        }
      });
      // 处理视频流
      videoInfo = _.extend({}, videoInfo, this.getStreamInfo(video));

      if (this.FlashApi) {
        this.FlashApi.onReady(function () {
          videoInfo.isIndex = true;
          this.init(videoInfo);
        });
      }
    } else {
      $('#topFlash').css('background-image', 'url(' + video.posterPic + ')');
    }
  },
  getStreamInfo: function (videoInfo) {
    var result = {};
    if (videoInfo.url.indexOf('tmp://') > 0) {
      result.streamName = videoInfo.url.substr(videoInfo.url.lastIndexOf('/') + 1);
    }
    return result;
  },
  // 进入直播间
  gotoLiveHome: function (e) {
    var el = $(e.currentTarget);
    var id = el.attr('data-id');
    var type = el.attr('data-type');
    var status = el.attr('data-status');
    var url = '';
    switch (type) {
      case 'FANPA_ROOM':
        //  处理直播,注意大小写
        url = '/liveroom.html?roomId=';
        if (status === '3') {
          url = '/playback.html?roomId=';
        }
        break;
      case 'FANPA_CHANNEL':
        // 处理频道
        url = '/channellive.html?channelId=';
        break;
        // 站内视频
      case 'YYT_VIDEO':
        url = '';
        break;
      default:
        //  默认不处理
    }
    if (url) {
      window.location.href = url + id;
    }
  },
  // 推荐列表点击
  videoListClicked: function (e) {
    var target = $(e.target).parents('li').find('.item');
    if (target.hasClass('active')) {
      return;
    }
    var videoId = target.attr('data-videoid');
    this.elements.videoList.find('.item').removeClass('active');
    target.addClass('active');
    this.setVideoToPlay(videoId);
  },
  // 开始播放推荐视频
  setVideoToPlay: function (videoId) {
    var video = this.findVideo(videoId);
    if (video) {
      this.elements.videoName.text(video.videoName);
      // this.elements.btnGoLiveRoom.attr('data-id', video.videoId);
      this.elements.btnGoLiveRoom.attr({
        'data-id': video.videoId,
        'data-type': video.videoType,
        'data-status': video.status
      });
      this.elements.hoverGo2Room.attr({
        'data-id': video.videoId,
        'data-type': video.videoType,
        'data-status': video.status
      });
      this.elements.flashWrap.css({
        'background-image': 'url(' + video.posterPic + ')',
        'background-size': '100%'
      });
      // 首页不播放视频;
      // 如果要播放的话，改为 2 或者 3
      this.setFlash(_.extend({
        isLive: video.status = 2
      }, video));
    }
  },
  fRandomBy: function (under, over) {
    switch (arguments.length) {
      case 1: return parseInt(Math.random() * under + 1, 0);
      case 2: return parseInt(Math.random() * (over - under + 1) + under, 0);
      default: return 0;
    }
  }
});

module.exports = View;
