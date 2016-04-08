/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var livePreviewTemp = require('../../template/index/livePreview.html');
var LivePreviewModel = require('../../model/index/livePreview.model');
var PushLarityModel = require('../../model/index/pushLarity.model');
var UserInfoModel = require('../../model/anchor/anchor-info.model');
var MsgBox = require('ui.MsgBox');
var UserModel = require('UserModel');
var uiConfirm = require('ui.Confirm');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
    el: '#livePreview', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return '';
    },
    events: { //监听事件
        'click .box-praise': 'pushLiveVideo'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.livePreviewParameter = {
            'deviceinfo': '{"aid":"30001001"}',
            'size': 6
        };

        this.pushLarityParameter = {
            'deviceinfo': '{"aid":"30001001"}',
            'access_token': '',
            'type': 2,
            'roomId': ''
        };

        this.userInfoParameter = {
            'deviceinfo': '{"aid":"30001001"}',
            'access_token': ''
        };
        if (user.isLogined()) {
            this.pushLarityParameter.access_token = 'web-' + user.getToken();
        }
        this.totalMarks = '';
        this.isNeedPopup = true;
        this.roomId = '';
    },
    //当模板挂载到元素之后
    afterMount: function () {
        this.liveModel = new LivePreviewModel();
        this.pushModel = new PushLarityModel();
        this.userInfo = new UserInfoModel();
        this.parentNode = this.$el.parent();
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function (options) {
        var self = this;
        this.topbar = options.topbar;
        this.liveModel.executeJSONP(this.livePreviewParameter, function (response) {
            var code = ~~response.code;
            if (code) {
                MsgBox.showError(response.msg);
            } else {
                self.livePreRender(response.data);
            }
        }, function (e) {
            if (e) {
                MsgBox.showError('获取数据错误');
            }
        });
    },
    livePreRender: function (items) {
        var le = items.length;
        var u = 6;
        if (le <= 3) {
            u = 3;
        } else {
            if (le < 6) {
                u = 6
            }
        }
        while (le < u) {
            le++;
            items.push({
                'completion': 1
            })
        }
        var html = this.compileHTML(livePreviewTemp, {'items': items});
        this.parentNode.css({
            height: 590 / (6 / u)
        });
        this.$el.html(html);
    },
    pushLiveVideo: function (e) {
        if (user.isLogined()) {
            //已经登录
            var self = this;
            var el = $(e.currentTarget);
            this.pushLarityParameter.roomId = el.attr('data-id');
            var status = el.attr('data-status');
            if (this.isNeedPopup) {
                this.userInfoParameter.access_token = 'web-' + user.getToken();
                this.userInfo.executeJSONP(this.userInfoParameter, function (response) {
                    var code = parseInt(response.code);

                    if (code == 0) {
                        self.totalMarks = response.data.totalMarks;
                        self.showConfirm();
                    } else {
                        MsgBox.showError(response.msg || '操作失败,稍后重试');
                    }
                }, function (e) {
                    if (e) {
                        MsgBox.showError('获取信息失败');
                    }
                });
            } else {
                self.executePushVideo();
            }
        } else {
            //未登录
            this.topbar.on('logined', function () {
                window.location.reload();
            });
            this.topbar.showLoginDialog();
        }
    },
    showConfirm: function () {
        var self = this;
        var content = '<div>使用20积分支持一下MC,当前共有' + (this.totalMarks || 0) + '积分</div> '
            + '<div style="text-align:right;"> <label><input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
        uiConfirm.show({
            title: '顶上去',
            content: content,
            okFn: function () {
                var check = $('#popupCheckBox');
                if (check.is(':checked')) {
                    self.isNeedPopup = false;
                } else {
                    self.isNeedPopup = true;
                }
                self.executePushVideo();
            }
        });
    },
    executePushVideo: function () {
        var self = this;
        this.pushModel.executeJSONP(this.pushLarityParameter, function (response) {
            var success = response.data.success;
            if (!success) {
                MsgBox.showError(response.data.message || '操作失败,请稍后重试');
            } else {
                MsgBox.showOK('感谢您的大力支持~');
            }
        }, function (e) {
            if (e) {
                MsgBox.showError('人气上推错误');
            }
        });
    }
});

module.exports = View;
