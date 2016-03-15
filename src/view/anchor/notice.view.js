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
var UserModel = require('UserModel');

var msgBox = require('ui.MsgBox');
var user = UserModel.sharedInstanceUserModel();


var View = BaseView.extend({
    el: '#noticeWraper', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor/notice.html');
    },
    events: { //监听事件
        'click #btnEditNotice': 'editClickHandler',
        'click .closeNoticePanel': 'panelDisplay',
        'click #btnSubmitNotice': 'submitClickHandler'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.noticeModel = new NoticeModel();
        this.noticeGetModel = new NoticeGetModel();
    },
    //当模板挂载到元素之后
    afterMount: function () {
        //修改公告弹出框
        this.editNoticPanel = $('#editNoticPanel');
        this.noticeWrap = $('#noticeWrap');
        //公告内容
        this.txtNotice = $('#txtNotice');
        this.imgRoomPic = $('#imgRoomPic');
        this.errNoticeTip = $('#errNoticTip');
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
        this.panelDisplay(true);
    },
    /**
     * 编辑公告悬浮框控制
     * @param isShow
     */
    panelDisplay: function (isShow) {
        this.errNoticeTip.text('');
        if (isShow === true) {
            this.txtNotice.val(this.roomInfo.desc);
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
        this.noticeModel.executePOST({
            roomId: this.roomInfo.id,
            content: content
        }, function (data) {
            if (data && data.code == '0') {
                $(document).trigger('event:noticeChanged',content);
                self.roomInfo.desc = content;
                self.noticeWrap.text(content);
                self.panelDisplay();
            } else {
                msgBox.showError('数据保存失败,请稍后重试');
            }
        }, function (err) {
            msgBox.showError('数据保存失败,请稍后重试');
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
    getNoticeInfo: function(){
        var self = this;
        this.noticeGetModel.setChangeURL({
            deviceinfo: JSON.stringify({"aid":"30001001"}),
            roomId: this.roomInfo.id,
            accessToken: user.getToken()
        });
        this.noticeGetModel.executeGET(function(res){
            console.log('noticeGetModel', res);
            if(res && res.data){
                var notice = null;
                res.data.placards && (notice = res.data.placards[0]);
                if(notice){
                    self.noticeWrap.text(notice.content || '暂无公告');
                    self.txtNotice.val(notice.content);
                }else{
                    self.noticeWrap.text('暂无公告');
                }
            }
        }, function(err){
            console.log(err);
            msgBox.showErr(err.msg || '获取公告失败');
        });
    }

});

module.exports = View;