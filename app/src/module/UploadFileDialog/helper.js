/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseView = require('BaseView'); // View的基类
var UploadFile = require('UploadFile');
var uploadIng = '正在上传';
var uploadDone = '上传完成!';
var MsgBox = require('ui.MsgBox');
var loc = window.location;
var View = BaseView.extend({
  rawLoader: function () {

  },
  events: { // 监听事件
    'click .submit': 'saveHandler',
    'change .upload-file': 'changeFile'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {

  },
  // 当模板挂载到元素之后
  afterMount: function () {
    this.formDOM = this.$el.find('.upload-form');
    this.imgSrcDOM = this.$el.find('.imgboxFile');
    this.imageStateDOM = this.$el.find('.upload-image-state');
    this.inputTextDOM = this.$el.find('.input-text');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function (options) {
    var temp = {
      gcmd: [
        {
          gsaveOriginal: 1, op: 'save', plan: 'avatar', belongId: '20634338', srcImg: 'img'
        }
      ],
      gredirect: loc.origin + '/web/upload.html'
    };
    var ctrlData = options.ctrlData || temp;
    var self = this;
    this.upload = UploadFile.classInstanceUploadFile({
      el: this.formDOM,
      url: 'http:// image.yinyuetai.com/edit',
      data: ctrlData,
      filename: 'img',
      className: 'file',
      success: function (response) {
        self.imageStateDOM.html(uploadDone);
        self.previewImage(response);
        self.trigger('uploadFileSuccess', response);
      },
      failure: function () {
        MsgBox.showError('上传失败');
      }
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
