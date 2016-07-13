'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var NoOpenListModel = require('../../models/anchor-setting/no-open-list.model');
var ReleaseModel = require('../../models/anchor-setting/release-video.model');
var RemoveModel = require('../../models/anchor-setting/remove-video.model');
var SaveCoverImageModel = require('../../models/anchor-setting/save-coverimage.model');
// var NoOpenPageBoxView = require('./page-box.view');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

var msgBox = require('ui.msgBox');
var confirm = require('ui.confirm');
var UploadFileDialog = require('UploadFileDialog');
var BusinessDate = require('BusinessDate');
var businessDate = new BusinessDate();
var Pagenation = require('Pagenation');

var View = BaseView.extend({
  el: '#noOpenContent',
  events: {
    'click button': 'checkLiveVideoHandler',
    'click .uploadImageWrap': 'editCoverImageHandler',
    'click .copy-video-url': 'copyUrlHandler',
    'click .copy-video-name': 'copyNameHandler'
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.listTemp = require('./template/no-open-list.html');
    this.liTemp = require('./template/no-open-li.html');
    this.noOpenParameter = {
      deviceinfo: '{"aid":"30001001"}',
      order: 'time',
      offset: 0,
      size: 6,
      access_token: user.getWebToken()
    };
    this.removeParameter = {
      deviceinfo: '{"aid":"30001001"}',
      roomId: '',
      access_token: user.getWebToken()
    };
    this.releaseParameter = {
      deviceinfo: '{"aid":"30001001"}',
      roomId: '',
      access_token: user.getWebToken()
    };
    this.saveCoverParameter = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      roomId: '',
      posterUrl: ''
    };
    this.removeLock = true;
    this.releaseLock = true;
    this.liCache = null;
    this.imagePath = '';
    this.upload = null;
    this.singleLiDOM = null;
    this.uploadState = false;
    this.noOpenModel = new NoOpenListModel();
    this.releaseModel = new ReleaseModel();
    this.removeModel = new RemoveModel();
    this.saveCoverModel = new SaveCoverImageModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function () {
    //  初始化
    var self = this;
    this.fileOptions = {
      width: 580,
      height: 341,
      isRemoveAfterHide: false,
      isAutoShow: false,
      mainClass: 'shadow_screen_x',
      closeClass: 'editor_bg_close_x',
      closeText: 'X',
      title: '封面设置',
      ctrlData: {
        cmd: [{
          saveOriginal: 1,
          op: 'save',
          plan: 'avatar',
          belongId: '20634338',
          srcImg: 'img'
        }],
        redirect: 'http://' + window.location.host + '/cross-url/upload.html'
      },
      uploadFileSuccess: function (response) {
        //  上传成功
        self.uploadImageHandler(response);
        self.uploadState = true;
      },
      saveFile: function () {
        //  保存
        if (self.uploadState) {
          self.saveCoverImage();
        } else {
          msgBox.showTip('正在上传，请等待');
        }
      }
    };
    this.upload = new UploadFileDialog(this.fileOptions);
    this.getPageList(1);
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  /**
   * 获取分页数据
   */
  getPageList: function (page) {
    var self = this;
    this.noOpenParameter = $.extend(this.noOpenParameter, {
      offset: this.noOpenParameter.size * (page - 1)
    });
    var promise = this.noOpenModel.executeJSONP(this.noOpenParameter);
    promise.done(function (response) {
      var data = response.data;
      var roomList = data.roomList || [];
      if (!self.totalCount && data.totalCount) {
        self.totalCount = data.totalCount;
        self.initPageBox(data.totalCount);
      }
      self.initRender(roomList);
    });
    promise.fail(function () {
      msgBox.showError('获取未直播列表：第1页失败');
    });
  },
  initPageBox: function (total) {
    var self = this;
    this.pagingBox = Pagenation.create('#noOpenPageBox', {
      total: total,
      perpage: this.noOpenParameter.size,
      onSelect: function (page) {
        self.getPageList(page);
      }
    });
  },
  //  分页渲染，以及缓存li
  initRender: function (items) {
    var html = '';
    if (items && items.length) {
      html = this.compileHTML(this.listTemp, {
        items: items
      });
    } else {
      html = '<h1>暂无数据</h1>';
    }
    this.$el.html(html);
    this.liCache = null;
    this.liCache = {};
    var lis = this.$el.find('.item');
    var i = 0;
    var l = lis.length;
    for (; i < l; i++) {
      var li = $(lis[i]);
      var key = li.attr('data-key');
      this.liCache[key] = li;
    }
  },
  //  点击发布或删除时的处理
  checkLiveVideoHandler: function (e) {
    var self = this;
    var span = $(e.target);
    var el = span.parents('.item');
    var state = span.data('state');
    var id = el.attr('data-id');
    var postImg = el.attr('data-img');
    switch (state) {
      case 2: //  发布
        self.publishLiveShow(id, span, postImg);
        break;
      case 3: //  删除
        if (this.removeLock) {
          confirm.show({
            content: '是否确认删除',
            okFn: function () {
              self.removeLock = false;
              self.removeParameter.roomId = id;
              var promise = self.removeModel.executeJSONP(self.removeParameter);
              promise.done(function () {
                self.removeLock = true;
                msgBox.showOK('删除成功');
                el.remove();
              });
              promise.fail(function () {
                self.removeLock = true;
                msgBox.showError('删除失败');
              });
            }
          });
        }
        break;
      default:
    }
  },
  isTooLate: function (time) {
    var currentTime = new Date();
    var timeSpan = time - currentTime.getTime();
    var hour = Number(BusinessDate.difference(Math.abs(timeSpan)).hours);
    if (timeSpan < 0 && hour >= 1) {
      return true;
    }
    return false;
  },
  // 发布直播
  publishLiveShow: function (id, span, postImg) {
    var self = this;
    var time = span.parents('.item').attr('data-liveTime');
    if (span.attr('class') === 'disable') {
      return;
    }
    if (self.isTooLate(time)) {
      msgBox.showTip('您已经迟到超过一小时，无法再进行本场直播了');
      return;
    }
    if (this.releaseLock && postImg) {
      this.releaseLock = false;
      this.releaseParameter.roomId = id;
      var promise = this.releaseModel.executeJSONP(this.releaseParameter);
      promise.done(function (response) {
        self.releaseLock = true;
        span.addClass('disable');
        msgBox.showOK('发布成功');
        var item = response.data;
        item.liCacheKey = item.id + '-' + item.streamName;
        item.liveVideoTime = self.forMatterDate(item.liveTime);
        item.lookUrl = '/anchor.html?roomId=' + item.id;
        self.liRender(item);
      });
      promise.fail(function () {
        self.releaseLock = true;
        msgBox.showError('发布失败');
      });
    } else {
      msgBox.showError('发布失败，请上传封面');
    }
  },
  //  点击编辑封面
  editCoverImageHandler: function (e) {
    var el = $(e.currentTarget);
    var attrs = {
      breviaryUrl: el.find('img').attr('src')
    };
    if (attrs.breviaryUrl) {
      msgBox.showTip('因内容审核，上传后不可修改!');
      return;
    }
    if (el.hasClass('uploadImageWrap') && el.find('img').length === 0) {
      el.append('<img class="uploadImage cover-image">');
    }
    var posterpic = el.attr('data-posterpic');
    // this.upload = new UploadFileDialog(this.fileOptions);
    if (this.upload) {
      this.currentLiveItem = $(el.parents('.item'));
      this.singleLiDOM = this.currentLiveItem;
      this.saveCoverParameter.roomId = this.singleLiDOM.data('id');
      this.upload.emptyValue();
      if (posterpic) {
        var img = el.find('.cover-image');

        attrs = {
          breviaryUrl: img.attr('src'),
          inputText: '编辑图片'
        };
      }
      this.upload.show(attrs);
    }
  },
  //  上传成功之后处理image 地址
  uploadImageHandler: function (response) {
    var result = this.upload.parseErrorMsg(response);

    if (result === true) {
      var images = response.images;
      this.imagePath = images[0].path;
      if (this.currentLiveItem) {
        this.currentLiveItem.attr('data-img', images[0].path || '');
      }
    } else {
      msgBox.showTip(result);
    }
  },
  // 点击保存之后的处理
  saveCoverImage: function () {
    var self = this;
    this.saveCoverParameter.posterUrl = this.imagePath;
    var promise = this.saveCoverModel.executeJSONP(this.saveCoverParameter);
    promise.done(function (response) {
      var code = ~~response.code;
      if (!code) {
        var coverImageDOM = self.singleLiDOM.find('.cover-image');
        coverImageDOM.attr('src', self.imagePath);
        self.singleLiDOM = null;
        msgBox.showOK('保存成功');
        self.upload.hide();
        self.uploadState = false;
        self.currentLiveItem.find('[data-state="2"]').removeClass('disabled');
      }
    });
    promise.fail(function () {
      msgBox.showError('保存失败');
    });
  },
  // 格式化时间
  forMatterDate: function (time) {
    businessDate.setCurNewDate(time);
    var year = businessDate.$get('year');
    var month = businessDate.$get('month');
    var day = businessDate.$get('day');
    var _hours = businessDate.$get('hours');
    var hours = _hours < 10 ? '0' + _hours : _hours;
    var _minutes = businessDate.$get('minutes');
    var minutes = _minutes < 10 ? '0' + _minutes : _minutes;
    return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
  },
  // 发布时，重新渲染li
  liRender: function (item) {
    var html = this.compileHTML(this.liTemp, {
      item: item
    });
    var li = this.liCache[item.liCacheKey];
    li.html(html);
  },
  copyUrlHandler: function (e) {
    e.preventDefault();
    var el = $(e.currentTarget);
    var value = el.attr('data-value');
    if (!value.length) {
      msgBox.showTip('开启直播后生成视频地址');
      return;
    }
    this.clipboard(value);
  },
  copyNameHandler: function (e) {
    e.preventDefault();
    var el = $(e.currentTarget);
    var value = el.attr('data-value');
    this.clipboard(value);
  },
  clipboard: function (value) {
    if (window.clipboardData) {
      window.clipboardData.clearData('text');
      window.clipboardData.setData('text', value);
      msgBox.showOK('复制成功');
    } else {
      msgBox.showTip('你浏览器的js不支持剪贴板，无法调用');
    }
  }
});

module.exports = View;
