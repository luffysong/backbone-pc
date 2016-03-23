/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-3-9
 * @author  YuanXuJia
 * @info 直播按钮控制
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var YYTIMServer = require('../../lib/YYT_IM_Server');
var uiConfirm = require('ui.Confirm');
var msgBox = require('ui.MsgBox');
var StartLiveModel = require('../../model/anchor/start-live.model');
var EndLiveModel = require('../../model/anchor/end-live.model');
var FlashAPI = require('FlashAPI');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var DateTime = require('DateTime');


var View = BaseView.extend({
    el: '#liveShowBtnWraper', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor/live-show-btn.html');
    },
    events: { //监听事件
        'click .endLive': 'endLiveClick',
        'click .startLive': 'startLiveClick'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.startLiveModel = new StartLiveModel();
        this.endLiveModel = new EndLiveModel();

        this.startLiveParams = {
            deviceinfo: '{"aid": "30001001"}',
            access_token: 'web-' + user.getToken(),
            roomId: '',
            imGroupId: ''
        };

        this.endLiveParams = {
            deviceinfo: '{"aid": "30001001"}',
            access_token: 'web-' + user.getToken(),
            roomId: ''
        };
    },
    //当模板挂载到元素之后
    afterMount: function () {
        this.btnEndLive = $('.endLive');
        this.btnStartLive = $('.startLive');
        this.defineEventInterface();
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        this.flashAPI = FlashAPI.sharedInstanceFlashAPI({
            el: 'broadCastFlash'
        });
    },
    isTooLate: function (time) {
        var currentTime = new Date();
        var timeSpan = time - currentTime.getTime();
        var hour = Number.parseInt(DateTime.difference(Math.abs(timeSpan)).hours);
        if (timeSpan < 0 && hour >= 1) {
            return true;
        }
        return false;
    },
    /**
     * 开启直播
     */
    startLiveClick: function (e) {
        var current = $(e.target),
            self = this;
        if (current.hasClass('m_disabled')) {
            return null;
        }
        if (self.isTooLate(self.roomInfo.liveTime)) {
            msgBox.showTip('您已经迟到超过一小时，无法再进行本场直播了');
            return null;
        }

        current.addClass('m_disabled');
        this.btnEndLive.removeClass('m_disabled');

        if (!this.roomInfo) {
            msgBox.showError('没有获取到房间信息');
            return '';
        }
        if (!this.roomInfo.imGroupid) {
            YYTIMServer.createIMChatRoom(function (res) {
                self.roomInfo.imGroupid = res.GroupId;
                self.startLive();
            }, function (err) {
                msgBox.showError('创建房间失败,请稍后重试');
            });
        } else {
            self.startLive();
        }
    },
    startLive: function () {
        var self = this;

        self.startLiveParams.roomId = self.roomInfo.id;
        self.startLiveParams.imGroupId = self.roomInfo.imGroupid;

        self.startLiveModel.executeJSONP(this.startLiveParams, function (result) {
            msgBox.showOK('成功开启直播');
            self.startFlash();
            //self.flashAPI.onReady(function () {
            //    this.addUrl(self.roomInfo.url, self.roomInfo.streamName);
            //});
            Backbone.trigger('event:LiveShowStarted');
        }, function (err) {
            msgBox.showError(err.msg || '开启直播失败,请稍后重试');
        });
    },

    startFlash: function () {
        var self = this;
        self.flashAPI.onReady(function () {
            this.addUrl(self.roomInfo.url, self.roomInfo.streamName);
        });

    },
    /**
     * 结束直播
     */
    endLiveClick: function (e) {
        var self = this;
        if (this.btnEndLive.hasClass('m_disabled')) {
            return null;
        }
        uiConfirm.show({
            title: '消息',
            content: '您确定要结束直播吗',
            okFn: function () {
                self.endLive();
            },
            cancelFn: function () {
                //console.log('cancel');
            }
        });
    },
    /**
     * 点击结束直播
     */
    endLive: function () {
        var self = this;

        self.endLiveParams.roomId = self.roomInfo.id;
        self.endLiveModel.executeJSONP(self.endLiveParams, function (result) {
            self.btnEndLive.addClass('m_disabled');
            self.isLiveShowing = false;
            msgBox.showOK('结束直播操作成功');
            Backbone.trigger('event:liveShowEnded');
        }, function (err) {
            msgBox.showError(err.msg || '操作失败,稍后重试');
        });

    },
    defineEventInterface: function () {
        var self = this;
        //成功获取房间信息
        Backbone.on('event:roomInfoReady', function (data) {
            if (data) {
                self.roomInfo = data;
                console.log('roomInfo', data);
                self.changeButtonStatus(self.roomInfo.status);
            }
        });
    },
    changeButtonStatus: function (status) {
        if (status === 2) {
            this.btnStartLive.addClass('m_disabled');
            this.btnEndLive.removeClass('m_disabled');
            this.startFlash();
        } else if (status === 3) {
            this.btnStartLive.addClass('m_disabled');
            //TODO
            this.btnEndLive.addClass('m_disabled');
        }

    }

});

module.exports = View;
