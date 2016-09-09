/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-03-09
 * @author YuanXuJia
 * @info 更换主题背景
 */
var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var EditBgModel = require('../../models/anchor/anchor-edit-bg.model');
var UploadFileDialog = require('UploadFileDialog');
var msgBox = require('ui.msgBox');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

var View = BaseView.extend({
  el: '#edit_background', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/edit-bg.html');
  },
  events: { // 监听事件
    'click .edit_bg_btn': 'showFileUploadDialog'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.editBgModel = new EditBgModel();
    this.uploadFile = new UploadFileDialog(this.getFileUploadOptions());

    // 数据参数
    this.bgModelParams = {
      access_token: user.getWebToken(),
      deviceinfo: '{"aid": "30001001"}',
      roomId: '',
      imageUrl: ''
    };
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    // 修改背景按钮
    this.changeBgBtn = $('.edit_bg_btn');
    this.txtPopularity = $('#txtPopularity');
    this.txtRoomName = $('#txtRoomName');

    this.anchorContainerBg = $('#anchorContainerBg');
    this.anchorThemeBgDOM = $('#anchorThemeBg');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.defineEventInterface();

    // 修改背景图片按钮
    $('.edit_bg_btn').on('click', this.showFileUploadDialog.bind(this));
  },
  /**
   * 定义事件
   */
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
        self.txtRoomName.text(data.roomName || '');
        self.txtPopularity.text(data.realPopularity || 0);
        if (self.roomInfo.imageUrl) {
          self.setBgStyle(self.roomInfo.imageUrl);
        }
      }
    });
    Backbone.on('event:updateRoomInfo', function (data) {
      if (data) {
        // self.roomInfo = data;
        self.txtPopularity.text(data.popularity || 0);
      }
    });
  },
  getFileUploadOptions: function () {
    var self = this;
    return {
      width: 580,
      height: 341,
      isRemoveAfterHide: false,
      isAutoShow: false,
      mainClass: 'shadow_screen_x',
      closeClass: 'editor_bg_close_x',
      closeText: 'X',
      title: '上传主题背景图片',
      ctrlData: {
        cmd: [{
          point: '+1+1',
          srcImg: 'img',
          op: 'crop',
          size: '1200x270'
        }, {
          saveOriginal: 1,
          op: 'save',
          plan: 'fanpa',
          belongId: '20634338',
          srcImg: 'img'
        }],
        redirect: 'http://' + window.location.host + '/cross-url/upload.html'
      },
      uploadFileSuccess: function (response) {
        var result = self.uploadFile.parseErrorMsg(response);
        if (result === true) {
          self.currentBgImg = response.images[0].path;
        } else {
          msgBox.showTip(result);
        }
      },
      saveFile: function () {
        self.setBackgroundImg();
      }
    };
  },
  showFileUploadDialog: function () {
    var attrs = null;
    if (this.roomInfo.imageUrl) {
      attrs = {
        inputText: '编辑图片',
        breviaryUrl: this.roomInfo.imageUrl
      };
    }
    this.currentBgImg = '';
    this.uploadFile.show(attrs);
  },
  setBackgroundImg: function () {
    var self = this;
    var promise;
    if (!self.currentBgImg) {
      msgBox.showTip('请耐心等待图片上传完成!');
      return;
    }

    self.bgModelParams.roomId = this.roomInfo.id;
    self.bgModelParams.imageUrl = this.currentBgImg;

    promise = self.editBgModel.executeJSONP(self.bgModelParams);
    promise.done(function (res) {
      if (res && res.code === '0') {
        self.setBgStyle(self.currentBgImg);
        self.uploadFile.hide();
        msgBox.showOK('背景图片设置成功');
      } else {
        msgBox.showError(res.msg || '背景图片设置失败,稍后重试');
      }
    });
    promise.fail(function () {
      msgBox.showError('背景图片设置失败,稍后重试');
    });
  },
  setBgStyle: function (url) {
    if (url) {
      this.anchorThemeBgDOM.css('background', 'url(' + url + ')');
      $('.edit_bg_btn').hide();
    }
  }
});

module.exports = View;
