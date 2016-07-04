'use strict';

var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View;
var storage = base.storage;
var UserModel = require('UserModel');
var TopBarView = require('TopBarView');
var UploadFileDialog = require('UploadFileDialog');
var user = UserModel.sharedInstanceUserModel();
var msgBox = require('ui.msgBox');
var auth = require('auth');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var UpdateBgModel = require('../../models/anchor-setting/update-bgtheme.model');
var ProfileView = require('./profile.view');
var EditProfileView = require('./edit-profile.view');
var UpdatePasswordView = require('./update-password.view');
var PageContentView = require('./page-content.view');

var View = BaseView.extend({
  el: '#settingContent',
  events: {
    'click #editBgBtn': 'editBgHandler'
  },
  rawLoader: function () {
    return require('./template/setting-body.html');
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    auth.onlyAnchorUse();
    this.topbarView = new TopBarView();
    this.isLogined = false;
    this.upload = null;
    this.bgTheme = null;
    this.anchorSig = null;
    this.updateBgParameter = {
      deviceinfo: '{"aid":"30001001"}'
    };
    this.tempImg = null;
    this.saveLock = true;
    this.uploadSate = false;
    this.updateBgModel = new UpdateBgModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.profileBg = $('#profileBg');
  },
  ready: function () {
    //  初始化
    var self = this;

    this.defineEventInterface();

    if (!user.isLogined()) {
      // 把签名清除一次
      storage.remove('imSig');
      // 跳转走人
      storage.set('signout', 1);
      window.location.href = '/login.html';
      this.topbarView.on('logined', function () {
        self.fetchIMUserSig();
      });
    } else {
      this.fetchIMUserSig();
    }
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:setThemeBgImg', function (url) {
      self.setPageBgimg(url);
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  //  渲染界面
  initRender: function () {
    var self = this;
    var fileOptions = {
      width: 580,
      height: 341,
      isRemoveAfterHide: false,
      isAutoShow: false,
      mainClass: 'shadow_screen_x',
      closeClass: 'editor_bg_close_x',
      closeText: 'X',
      title: '背景设置',
      ctrlData: {
        cmd: [
          {
            saveOriginal: 1,
            op: 'save',
            plan: 'avatar',
            belongId: '20634338',
            srcImg: 'img'
          }
        ],
        redirect: 'http://' + window.location.host + '/cross-url/upload.html'
      },
      uploadFileSuccess: function (response) {
        var result = self.upload.parseErrorMsg(response);
        if (result === true) {
          //  上传成功
          self.uploadSate = true;
          self.uploadSuccess(response);
        } else {
          msgBox.showTip(result);
        }
      },
      saveFile: function () {
        //  保存
        if (self.uploadSate) {
          self.saveFile();
        } else {
          msgBox.showError('正在上传，请等待');
        }
      }
    };
    this.upload = new UploadFileDialog(fileOptions);
    this.isLogined = true;
    this.profileView = new ProfileView({
      parent: this
    });
    this.pageContentView = new PageContentView({
      parent: this
    });
    // this.editProfileView = new EditProfileView({ parent: this });
    if (imModel.isAnchor()) {
      this.editProfileView = new EditProfileView();
    }
    this.updatePasswordView = new UpdatePasswordView({
      parent: this
    });
  },
  fetchIMUserSig: function () {
    var self = this;
    this.updateBgParameter.access_token = 'web-' + user.getToken();
    var promise = imModel.fetchIMUserSig();
    promise.done(function (sig) {
      if (!sig.anchor) {
        //  console.log('跳转走人');
        // storage.remove('imSig');
        //  跳转走人
        self.initRender();
      } else {
        //  继续处理主播
        self.anchorSig = sig;
        self.bgTheme = sig.anchor.bgTheme;
        self.setPageBgimg(sig.anchor.bgTheme);
        self.initRender();
      }
    });
    promise.fail(function () {
      msgBox.showError('获取签名错误');
    });
  },
  editBgHandler: function () {
    if (this.isLogined) {
      var attrs = null;
      if (this.anchorBg) {
        attrs = {
          inputText: '编辑背景',
          breviaryUrl: this.anchorBg
        };
      }
      this.upload.emptyValue();
      this.upload.show(attrs);
    } else {
      msgBox.showError('未登录或获取签名失败');
    }
  },
  uploadSuccess: function (response) {
    var images = response.images;
    var path = images[0].path;
    this.tempImg = path;
  },
  saveFile: function () {
    //  保存
    var self = this;
    if (this.saveLock) {
      this.saveLock = false;
      this.bgTheme = this.tempImg;
      this.updateBgParameter.bgTheme = this.bgTheme;
      var promise = this.updateBgModel.executeJSONP(this.updateBgParameter);
      promise.done(function (response) {
        var code = response.code;
        if (code === '0') {
          self.saveLock = true;
          self.setPageBgimg(response.data.userProfile.bgTheme || '');
          self.upload.hide();
          //  更新缓存
          imModel.updateIMUserSig();
        } else {
          msgBox.showError(response.msg);
        }
      });
      promise.fail(function () {
        self.saveLock = true;
        msgBox.showError('保存背景图出错');
      });
    }
  },
  setPageBgimg: function (url) {
    // TODO
    if (url) {
      // this.profileBg.css('background', 'url(' + url + ')');
      // this.profileBg.css('background-position', '0 90px');
    }
  }
});

module.exports = View;
