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
var Auxiliary = require('auxiliary-additions');
var BaseView = base.View;
var UploadFile = Auxiliary.UploadFile;
var uploadIng = '正在上传';
var uploadDone = '上传完成!';
var msgBox = require('ui.msgBox');
var loc = window.location;
var View = BaseView.extend({
  events: { // 监听事件
    'click .submit': 'saveHandler',
    'change .upload-file': 'changeFile'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {

  },
  // 当模板挂载到元素之后
  afterMount: function () {
    this.formDOM = this.findDOMNode('.upload-form');
    this.imgSrcDOM = this.findDOMNode('.imgboxFile');
    this.imageStateDOM = this.findDOMNode('.upload-image-state');
    this.inputTextDOM = this.findDOMNode('.input-text');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function (options) {
    var self = this;
    var temp = {
      gcmd: [
        {
          gsaveOriginal: 1, op: 'save', plan: 'avatar', belongId: '20634338', srcImg: 'img'
        }
      ],
      gredirect: loc.origin + '/web/upload.html'
    };
    var ctrlData = options.ctrlData || temp;
    var uploadParams = {
      el: this.formDOM,
      url: 'http:// image.yinyuetai.com/edit',
      data: ctrlData,
      filename: 'img',
      className: 'file'
    };
    this.upload = UploadFile.classInstanceUploadFile(uploadParams);
    this.upload.done(function (response) {
      self.imageStateDOM.html(uploadDone);
      self.previewImage(response);
      self.trigger('uploadFileSuccess', response);
    });
    this.upload.fail(function () {
      msgBox.showError('上传失败');
    });
    this.on('successBreviary', function (obj) {
      this.successBreviary(obj);
    });
  },
  successBreviary: function (obj) {
    this.emptyValue();
    if (obj.breviaryUrl) {
      this.imgSrcDOM.attr('src', obj.breviaryUrl);
      this.imgSrcDOM.show();
    }
    if (obj.inputText) {
      this.inputTextDOM.text(obj.inputText);
    }
  },
  saveHandler: function () {
    this.trigger('saveFile');
  },
  changeFile: function () {
    this.imageStateDOM.html(uploadIng);
    this.upload.submit();
  },
  previewImage: function (response) {
    var images = response.images;
    var imagePath;
    if (images && images.length > 0) {
      imagePath = images[0].path;
      this.imgSrcDOM.attr('src', imagePath);
      this.imgSrcDOM.show();
    }
  },
  emptyValue: function () {
    this.imageStateDOM.html('');
    this.imgSrcDOM.hide();
    this.inputTextDOM.text('上传图片');
  }
});

var shared = null;
View.sharedInstanceUploadFileDialog = function (options) {
  if (!shared) {
    shared = new View(options);
  }
  return shared;
};
View.fetchDialogTemplate = function () {
  return require('./template/fileDialog.html');
};
module.exports = View;
