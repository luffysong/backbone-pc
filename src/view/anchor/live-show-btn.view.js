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
    /**
     * 判断是否超过预播时间
     * @param time
     * @returns {number} 1: 超过1小时以上;  0:没有超时;  -1: 太早了
     */
    isTooLate: function (time) {
        var currentTime = new Date();
        var timeSpan = time - currentTime.getTime();
        var result = DateTime.difference(Math.abs(timeSpan));
        if (timeSpan < 0 && (result.hours >= 1 || result.day >= 1)) {
            return 1;
        } else if (timeSpan > 300000) {
            return -1;
        }
        return 0;
    },
    /**
     * 开启直播
     */
    startLiveClick: function (e) {
        var current = $(e.target),
            self = this,
            result = self.isTooLate(self.roomInfo.liveTime),
            status = self.roomInfo.status;

        if (status == 0) {
            msgBox.showTip('该直播尚未发布,无法开启直播!');
            return null;
        } else if (status == 1) {
            if (result == 1) {
                msgBox.showTip('您已经迟到超过一小时，无法再进行本场直播了');
                return null;
            } else if (result == -1) {
                msgBox.showTip('您最多提前5分钟开启直播,请耐心等候');
                return null;
            }
        }
        if (current.hasClass('m_disabled')) {
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
            // msgBox.showOK('成功开启直播');
            if (result && result.code == 0) {
                var msg = '您已成功开启直播，请复制下面的信息：</br>'
                    + '视频连接：' + result.data.livePushStreamUrl
                    + '</br>视频流：' + result.data.streamName;
                uiConfirm.show({
                    title: '开启直播成功',
                    content: msg,
                    cancelBtn: false,
                    okFn: function () {
                        window.location.reload();
                    },
                    cancelFn: function () {
                        window.location.reload();
                    }
                });
                self.startFlash();
                Backbone.trigger('event:LiveShowStarted');
            } else {
                msgBox.showError(result.msg || '开启直播失败,请稍后重试');
            }
        }, function (err) {
            msgBox.showError(err.msg || '开启直播失败,请稍后重试');
        });
    },

    startFlash: function () {
        var self = this;
        self.flashAPI.onReady(function () {
            // this.addUrl(self.roomInfo.url, self.roomInfo.streamName);
            this.init(self.roomInfo);
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
                window.location.href = '/web/anchorsetting.html?view=history';
            },
            cancelFn: function () {
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

    roomInfoReady: function (data) {
        if (data) {
            this.roomInfo = data;
            this.changeButtonStatus(this.roomInfo.status);
        }

    },

    defineEventInterface: function () {
        var self = this;
        //成功获取房间信息
        Backbone.on('event:roomInfoReady', function (data) {
            self.roomInfoReady(data);
        });
        //Backbone.on('event:updateRoomInfo', function (data) {
        //self.roomInfoReady(data);
        //});
    },
    changeButtonStatus: function (status) {
        var result = this.isTooLate(this.roomInfo.liveTime);
        if (result === -1 || result === 1) {
            this.btnStartLive.addClass('m_disabled');

            Backbone.trigger('event:stopLoopRoomInfo');
        } else if (result === 0) {
            this.btnStartLive.removeClass('m_disabled');
        }

        switch (status) {
            case 0:
                this.btnStartLive.addClass('m_disabled');
                break;
            case 2:
                this.btnStartLive.addClass('m_disabled').text('直播中');
                this.btnEndLive.removeClass('m_disabled');
                this.startFlash();
                break;
            case 3:
                this.btnStartLive.addClass('m_disabled');
                this.btnEndLive.addClass('m_disabled');
                break;
        }

    }

});

module.exports = View;