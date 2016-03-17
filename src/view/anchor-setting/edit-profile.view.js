/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info 修改用户资料
 */

'use strict';
var BaseView = require('BaseView'); //View的基类
var UserUpdateModel = require('../../model/anchor-setting/user-update.model');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var UploadFile = require('UploadFile');
var msgBox = require('ui.MsgBox');

var IMModel = require('../../lib/IMModel');
var imModel = IMModel.sharedInstanceIMModel();

var View = BaseView.extend({
    el: '#editProfile', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor-setting/edit-profile.html');
    },
    events: { //监听事件
        'click #btnSave': 'verifyForm',
        'change #userAvatarForm': 'submitFile'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.userUpdateModel = new UserUpdateModel();
    },
    //当模板挂载到元素之后
    afterMount: function () {
        console.log(11);
        this.txtImg = $('#txtImg');
        this.txtName = $('#txtName');
        this.txtTags = $('#txtTags');

        this.imgUserAvatar = $('#imgUserAvatar');

        this.initUploadFile();
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        console.log(22);
        var self = this;

        user.getUserInfo(function (data) {
            self.userInfo = data;
            console.log(self.userInfo);
            self.initForm();
        });
    },
    initForm: function () {
        var self = this;
        self.imgUserAvatar.attr('src', self.userInfo.headImg);
        self.txtName.val(self.userInfo.userName);

        imModel.fetchIMUserSig(function(userImInfo){
            console.log(userImInfo);
        });

    },
    //检查数据
    verifyForm: function () {

    },
    initUploadFile: function () {
        var ctrlData = {
            "cmd": [
                {"saveOriginal": 1, "op": "save", "plan": "avatar", "belongId": "20634338", "srcImg": "img"}
            ],
            "redirect": window.location.origin + "/web/upload.html"
        };
        var self = this;
        this.upload = UploadFile.classInstanceUploadFile({
            el: $('#userAvatarForm'),
            url: 'http://image.yinyuetai.com/edit',
            data: ctrlData,
            filename: 'img',
            className: 'file',
            success: function (response) {
                console.log(response);
                self.fileUploaded(response);
            },
            failure: function () {
                msgBox.showError('上传失败');
            }
        });

    },
    submitFile: function () {
        this.upload.submit();
    },
    fileUploaded: function (res) {
        if (res && res.state == 'SUCCESS') {
            var src = res.images[0].path;
            this.txtImg.val(src);
            this.imgUserAvatar.attr('src', src);
        }
    }
});

module.exports = View;
