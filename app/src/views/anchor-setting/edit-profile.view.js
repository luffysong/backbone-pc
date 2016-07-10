/**
 * 个人资料
 */
'use strict';

var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;
var UserUpdateModel = require('../../models/anchor-setting/user-update.model');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var Auxiliary = require('auxiliary-additions');
var UploadFile = Auxiliary.UploadFile;
var msgBox = require('ui.msgBox');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();

var View = BaseView.extend({
  el: '#editProfile',
  events: { //  监听事件
    //  'click #btnSave': 'verifyForm',
    'change #userAvatarForm': 'submitFile',
    'keyup .userInfoChanged': 'verifyForm',
    'click #btnSave': 'saveuserinfo'
  },
  rawLoader: function () {
    return require('./template/edit-profile.html');
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.txtImg = $('#txtImg');
    this.txtName = $('#txtName');
    this.txtTags = $('#txtTags');
    this.btnSave = $('#btnSave');
    this.btnUploadAvatar = this.findDOMNode('#btnUploadAvatar');
    this.imgUserAvatar = $('#imgUserAvatar');
  },
  ready: function () {
    //  初始化
    this.userUpdateModel = new UserUpdateModel();
    this.initUploadFile();
    this.fetchIMUserInfo();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  initForm: function () {
    var self = this;
    if (self.userInfo.smallAvatar) {
      self.imgUserAvatar.attr('src', self.userInfo.smallAvatar);
      self.txtImg.val(self.userInfo.smallAvatar);
    }
    self.txtName.val(self.userInfo.nickName);
    var tags = self.userInfo.anchor.tags.join(',') || '';
    self.txtTags.val(tags);
  },
  fetchIMUserInfo: function () {
    var self = this;
    var promise = imModel.fetchIMUserSig();
    promise.done(function (userImInfo) {
      self.userInfo = userImInfo;
      self.initForm();
    });
  },
  //  检查数据
  verifyForm: function () {
    var name = $.trim(this.txtName.val());
    var nameReg = /^[0-9A-Za-z\u4e00-\u9fa5]{1,15}$/g;
    var tags = $.trim(this.txtTags.val());
    this.btnSave.addClass('m_disabled');
    if (!name || name.length === 0) {
      msgBox.showTip('请输入您的昵称');
      return false;
    } else if (name.length > 30) {
      msgBox.showTip('昵称长度不能超过15个字!');
      return false;
    } else if (!nameReg.test(name)) {
      msgBox.showTip('昵称允许包含:中文,数字以及字母!');
      return false;
    }
    tags = tags.split(/[,，]/);
    var temp = [];
    var overLen = false;
    var val = '';
    for (var j = tags.length; j >= 0; j--) {
      val = $.trim(tags[j]);
      if (val.length >= 1) {
        temp.push(val);
      }
      if (val.length > 5) {
        overLen = true;
      }
    }
    tags = temp;
    if (!tags || tags.length === 0) {
      msgBox.showTip('请输入至少一个标签,多个标签请用逗号分隔!');
      return false;
    } else if (overLen) {
      msgBox.showTip('每个标签最多5个字,请检查您的标签!');
      return false;
    } else if (tags.length > 5) {
      msgBox.showTip('您最多输入5个标签,请删掉一些标签');
      return false;
    }
    if (!this.txtImg.val() || this.txtImg.val().length <= 0) {
      msgBox.showTip('请上传头像图片');
      return false;
    }
    this.btnSave.removeClass('m_disabled');
    return true;
  },
  tagsFilter: function (tags) {
    var _tags = tags.split(/[,，]/);
    var temp = [];
    _.each(_tags, function (item) {
      if (item.length >= 1) {
        temp.push($.trim(item));
      }
    });
    return temp;
  },
  initUploadFile: function () {
    var self = this;
    var uploadParams = {
      el: $('#userAvatarForm'),
      url: 'http://image.yinyuetai.com/edit',
      data: {
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
      filename: 'img',
      className: 'file'
    };
    this.upload = UploadFile.classInstanceUploadFile(uploadParams);
    this.upload.done(function (response) {
      self.changeUploadBtnStatus();
      self.fileUploaded(response);
    });
    this.upload.fail(function () {
      self.changeUploadBtnStatus();
      msgBox.showError('上传失败');
    });
  },
  changeUploadBtnStatus: function (isUploading) {
    if (isUploading) {
      this.btnUploadAvatar.parent().addClass('m_disabled');
      this.btnUploadAvatar.text('正在上传');
    } else {
      this.btnUploadAvatar.parent().removeClass('m_disabled');
      this.btnUploadAvatar.text('重新上传');
    }
  },
  //  表单提交文件
  submitFile: function () {
    var btn = this.btnUploadAvatar.parent();
    if (btn.hasClass('m_disabled')) {
      return;
    }
    this.changeUploadBtnStatus(true);
    this.upload.submit();
  },
  //  上传成功后处理图片
  fileUploaded: function (res) {
    var result = this.upload.parseErrorMsg(res);
    if (result === true) {
      var src = res.images[0].path;
      this.txtImg.val(src);
      this.imgUserAvatar.attr('src', src);
      this.verifyForm();
    } else {
      msgBox.showTip(result);
    }
  },
  saveuserinfo: function () {
    var self = this;
    if (!self.isChanged()) {
      return;
    }
    if (this.verifyForm()) {
      self.btnSave.text('保存中');
      var userUpdateParameter = {
        deviceinfo: '{"aid": "30001001"}',
        access_token: user.getWebToken(),
        nickname: $.trim(self.txtName.val()),
        headImg: self.txtImg.val(),
        tags: self.tagsFilter(self.txtTags.val()).join(',')
      };
      var promise = this.userUpdateModel.executeJSONP(userUpdateParameter);
      promise.done(function (res) {
        self.btnSave.text('保存');
        if (res && res.code === '0') {
          msgBox.showOK('数据保存成功!');
          //  更新缓存
          imModel.updateIMUserSig();
          self.fetchIMUserInfo();
          self.btnSave.addClass('m_disabled');
          Backbone.trigger('event:userProfileChanged', {
            nickName: $.trim(self.txtName.val()),
            headImg: self.txtImg.val(),
            tags: self.tagsFilter(self.txtTags.val())
          });
        } else {
          msgBox.showError(res.msg || '数据保存失败,请稍后重试!');
        }
      });
      promise.fail(function () {
        msgBox.showError('数据保存失败,请稍后重试!');
        self.btnSave.text('保存');
      });
    }
  },
  //  检查是否更改了信息
  isChanged: function () {
    var name = $.trim(this.txtName.val());
    var tags = $.trim(this.txtTags.val()).replace(/[,，]/g, ',');
    var disabled = name === this.userInfo.nickName && tags === this.userInfo.anchor.tags.join(',');
    if (disabled && this.txtImg.val() === this.userInfo.smallAvatar) {
      this.btnSave.addClass('m_disabled');
      return false;
    }
    return true;
  }
});

module.exports = View;
