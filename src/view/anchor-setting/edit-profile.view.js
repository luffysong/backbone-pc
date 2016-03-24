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
        //'click #btnSave': 'verifyForm',
        'change #userAvatarForm': 'submitFile',
        'keyup .userInfoChanged': 'verifyForm',
        'click #btnSave': 'saveuserinfo'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.userUpdateModel = new UserUpdateModel();
    },
    //当模板挂载到元素之后
    afterMount: function () {
        var el = this.$el;
        this.txtImg = $('#txtImg');
        this.txtName = $('#txtName');
        this.txtTags = $('#txtTags');
        this.btnSave = $('#btnSave');
        this.btnUploadAvatar = el.find('#btnUploadAvatar');

        this.imgUserAvatar = $('#imgUserAvatar');

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        this.initUploadFile();

        this.fetchIMUserInfo();
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
        //self.userIMInfo = userImInfo.anchor;
    },
    fetchIMUserInfo: function () {
        var self = this;
        imModel.fetchIMUserSig(function (userImInfo) {
            self.userInfo = userImInfo;
            console.log('userinfo', self.userInfo);
            self.initForm();
        });
    },
    //检查数据
    verifyForm: function () {
        var name = $.trim(this.txtName.val()),
            nameReg = /^[0-9A-Za-z\u4e00-\u9fa5]{1,15}$/g,
            tags = $.trim(this.txtTags.val());

        this.btnSave.addClass('m_disabled');

        if (!name || name.length == 0) {
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
        var temp = [], overLen = false, val = '';
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
        if (!tags || tags.length == 0) {
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
    initUploadFile: function () {
        var ctrlData = {
            "cmd": [
                {"saveOriginal": 1, "op": "save", "plan": "avatar", "belongId": "20634338", "srcImg": "img"}
            ],
            "redirect": window.location.origin + "/cross-url/upload.html"
        };
        var self = this;
        self.upload = UploadFile.classInstanceUploadFile({
            el: $('#userAvatarForm'),
            url: 'http://image.yinyuetai.com/edit',
            data: ctrlData,
            filename: 'img',
            className: 'file',
            success: function (response) {
                self.changeUploadBtnStatus();
                self.fileUploaded(response);
            },
            failure: function () {
                self.changeUploadBtnStatus();
                msgBox.showError('上传失败');
            }
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
    //表单提交文件
    submitFile: function () {
        var btn = this.btnUploadAvatar.parent();
        if (btn.hasClass('m_disabled')) {
            return;
        }
        this.changeUploadBtnStatus(true);

        this.upload.submit();
    },
    //上传成功后处理图片
    fileUploaded: function (res) {
        var result = this.upload.parseErrorMsg(res);
        if (result == true) {
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
                access_token: 'web-' + user.getToken(),
                nickname: $.trim(self.txtName.val()),
                headImg: self.txtImg.val(),
                tags: self.txtTags.val().replace(/[,，]+/g, ',')
            };
            console.log(userUpdateParameter);
            this.userUpdateModel.executeJSONP(userUpdateParameter, function (res) {
                self.btnSave.text('保存');
                if (res && res.code === '0') {
                    msgBox.showOK('数据保存成功!');
                    //更新缓存
                    imModel.updateIMUserSig();
                    self.fetchIMUserInfo();

                    Backbone.trigger('event:userProfileChanged', {
                        nickName: $.trim(self.txtName.val()),
                        headImg: self.txtImg.val(),
                        tags: self.txtTags.val().split(/[,，]/)
                    });
                } else {
                    msgBox.showError('数据保存失败,请稍后重试!');
                }

            }, function (err) {
                msgBox.showError('数据保存失败,请稍后重试!');
                self.btnSave.text('保存');
            });
        }
    },
    //检查是否更改了信息
    isChanged: function () {
        var name = $.trim(this.txtName.val()),
            tags = $.trim(this.txtTags.val()).replace(/[,，]/g, ',');

        if (name == this.userInfo.userName && tags == this.userInfo.anchor.tags.join(',') && this.txtImg.val() == this.userInfo.bigheadImg) {
            this.btnSave.addClass('m_disabled');
            return false;
        }

        return true;
    }
});

module.exports = View;
