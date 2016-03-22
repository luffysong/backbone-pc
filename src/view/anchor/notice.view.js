/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-3-9
 * @author YuanXuJia
 * @info 公告模块
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var NoticeModel = require('../../model/anchor/notice-create.model');
var NoticeGetModel = require('../../model/anchor/notice-get.model');
var YYTIMServer = require('../../lib/YYT_IM_Server');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

var msgBox = require('ui.MsgBox');


var View = BaseView.extend({
    el: '#noticeWraper', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor/notice.html');
    },
    events: { //监听事件
        'click #btnEditNotice': 'editClickHandler',
        'click .closeNoticePanel': 'panelDisplay',
        'click #btnSubmitNotice': 'submitClickHandler',
        'keyup #txtNotice': 'noticeChanged'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.noticeModel = new NoticeModel();
        this.noticeGetModel = new NoticeGetModel();
        this.noticeInfo = {
            content: ''
        };

        this.noticeInfoParams = {
            deviceinfo: '{"aid": "30001001"}',
            access_token: 'web-' + user.getToken(),
            roomId: '',
            content: ''
        };

        this.noticeGetParams = {
            deviceinfo: '{"aid":"30001001"}',
            roomId: '',
            access_token: 'web-' + user.getToken()
        };

    },
    //当模板挂载到元素之后
    afterMount: function () {
        //修改公告弹出框
        this.editNoticPanel = $('#editNoticPanel');
        this.noticeWrap = $('#noticeWrap');
        //公告内容
        this.txtNotice = $('#txtNotice');
        this.imgRoomPic = $('#imgRoomPic');
        this.errNoticeTip = $('#errNoticeTip');

        this.tipTextarea = this.$el.find('.tipTextarea');
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

        this.defineEventInterface();

    },
    /**
     * 编辑按钮点击
     * @param e
     */
    editClickHandler: function (e) {
        this.noticeChanged();
        this.panelDisplay(true);
    },
    /**
     * 编辑公告悬浮框控制
     * @param isShow
     */
    panelDisplay: function (isShow) {
        this.errNoticeTip.text('');
        if (isShow === true) {
            this.txtNotice.val(this.noticeInfo.content);
            this.editNoticPanel.show();
        } else {
            this.editNoticPanel.hide();
        }
    },
    /**
     * 提交公告
     * @param e
     */
    submitClickHandler: function (e) {
        var content = this.txtNotice.val().trim(),
            self = this;
        if (!content || content.length > 50 || content.length <= 0) {
            this.errNoticeTip.text('公告文字请在50字以内');
            return null;
        }

        this.noticeInfoParams.roomId = this.roomInfo.id;
        this.noticeInfoParams.content = content;

        this.noticeModel.executeJSONP(this.noticeInfoParams, function (res) {
                if (res && res.code == '0') {
                    $(document).trigger('event:noticeChanged', content);
                    self.noticeInfo.content = content;
                    self.noticeWrap.text(content);
                    self.panelDisplay();
                    msgBox.showOK('公告发布成功');
                    self.sendNotifyToIM(content);
                }
            },
            function (err) {
                msgBox.showError('数据保存失败,请稍后重试');
            }
        );
    },
    sendNotifyToIM: function (content) {
        if (!this.roomInfo.imGroupid) {
            return;
        }
        YYTIMServer.sendMessage({
            groupId: this.roomInfo.imGroupid,
            msg: {
                roomId: this.roomInfo.id,
                //nickName: '主播',
                smallAvatar: '',
                mstType: 2,
                content: content
            }
        }, function (res) {
            console.log(res);
        }, function (err) {
            content.log(err);
        });
    },
    /**
     * 定义事件
     */
    defineEventInterface: function () {
        var self = this;
        $(document).on('event:roomInfoReady', function (e, data) {
            if (data) {
                self.roomInfo = data;
            }
            self.getNoticeInfo();
            if (data.imageUrl) {
                self.imgRoomPic.attr('src', data.imageUrl);
            }
        })
    },
    /**
     * 获取公告信息
     */
    getNoticeInfo: function () {
        var self = this;
        this.noticeGetParams.roomId = this.roomInfo.id;

        this.noticeGetModel.executeJSONP(this.noticeGetParams, function (res) {
            if (res && res.data) {
                var notice = null;
                res.data.placards && (notice = res.data.placards[0]);
                if (notice) {
                    self.noticeInfo = notice;
                    self.noticeWrap.text(notice.content || '暂无公告');
                    self.txtNotice.val(notice.content);
                } else {
                    self.noticeWrap.text('暂无公告');
                }
            }
        }, function (err) {
            msgBox.showError(err.msg || '获取公告失败');
        });
    },
    noticeChanged: function () {
        if (this.txtNotice.val().length < 50) {
            this.tipTextarea.text('您还可以输入' + (50 - this.txtNotice.val().length) + '个字');
        } else {
            this.tipTextarea.text('您的输入超出了' + (this.txtNotice.val().length - 50) + '个字');
        }

    }

});

module.exports = View;