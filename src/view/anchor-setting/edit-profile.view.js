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
        this.txtImg = $('#txtImg');
        this.txtName = $('#txtName');
        this.txtTags = $('#txtTags');
        this.btnSave = $('#btnSave');

        this.imgUserAvatar = $('#imgUserAvatar');

        this.initUploadFile();
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        var self = this;

        user.getUserInfo(function (data) {
            self.userInfo = data;
            //console.log(self.userInfo);
            self.initForm(self.userInfo);
        });
    },
    initForm: function () {
        var self = this;
        if (self.userInfo.headImg) {
            self.imgUserAvatar.attr('src', self.userInfo.headImg);
            self.txtImg.val(self.userInfo.headImg);
        }
        self.txtName.val(self.userInfo.userName);

        imModel.fetchIMUserSig(function (userImInfo) {
            if (userImInfo.anchor.tags) {
                var tags = userImInfo.anchor.tags.join(',') || '';
                self.txtTags.val(tags);
            }
            self.verifyForm();
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
    //表单提交文件
    submitFile: function () {
        this.upload.submit();
    },
    //上传成功后处理图片
    fileUploaded: function (res) {
        if (res && res.state == 'SUCCESS') {
            var src = res.images[0].path;
            this.txtImg.val(src);
            this.imgUserAvatar.attr('src', src);
        }
    },

    saveuserinfo: function () {
        var self = this;
        if (this.verifyForm()) {
            self.userUpdateModel.setChangeURL({
                deviceinfo: '{"aid": "30001001"}',
                accessToken: user.getToken(),
                nickname: $.trim(self.txtName.val()),
                headImg: self.txtImg.val(),
                tags: self.txtTags.val()
            });

            self.userUpdateModel.executeGET(function (res) {
                if (res && res.code === '0') {
                    msgBox.showError('数据保存失败,请稍后重试!');
                    $(document).trigger('event:userProfileChanged', {
                        nickName: $.trim(self.txtName.val()),
                        headImg: self.txtImg.val(),
                        tags: self.txtTags.val().split(/[,，]/)
                    });
                } else {
                    msgBox.showError('数据保存失败,请稍后重试!');
                }

            }, function (err) {
                msgBox.showError('数据保存失败,请稍后重试!');
            });
        }
    }
});

module.exports = View;
