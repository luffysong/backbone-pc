/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';
var shared = null;
var dialogTemp = require('./template/fileDialog.html');
var Dialog = require('ui.Dialog');
var Helper = require('./helper');

var UploadFileDialog = function (options) {
  var self = this;
  this.options = options;
  this.dialog = Dialog.classInstanceDialog(dialogTemp, options);
  this.helper = new Helper({
    ctrlData: this.options.ctrlData,
    id: '#' + this.dialog.id
  });
  this.helper.on('uploadFileSuccess', function (response) {
    if (typeof self.options.uploadFileSuccess === 'function') {
      self.options.uploadFileSuccess(response);
    }
  });
  this.helper.on('saveFile', function () {
    if (typeof self.options.saveFile === 'function') {
      self.options.saveFile();
    }
  });
};
UploadFileDialog.prototype.show = function (obj) {
  if (this.helper && obj) {
    this.helper.trigger('successBreviary', obj);
  }
  this.dialog.show();
};
UploadFileDialog.prototype.hide = function () {
  this.dialog.hide();
};
UploadFileDialog.prototype.emptyValue = function () {
  if (this.helper) {
    this.helper.emptyValue();
  }
};

UploadFileDialog.prototype.parseErrorMsg = function (res) {
  var code;
  if (res && res.state === 'SUCCESS') {
    return true;
  }
  code = res.errCode * 1 || 0;
  switch (code) {
    case 29:
      return '上传的文件太大了,请重新上传';
    case 31:
      return '请上传JPGE,JPG,PNG,GIF等格式的图片文件';
    default:
      return '文件上传失败,请重新上传';
  }
};


UploadFileDialog.sharedInstanceUploadFileDialog = function (options) {
  if (!shared) {
    shared = new UploadFileDialog(options);
  }
  return shared;
};
module.exports = UploadFileDialog;
