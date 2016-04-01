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
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var uiConfirm = require('ui.Confirm');
var GiftModel = require('../../model/anchor/gift.model.js');
var PopularityModel = require('../../model/live-room/popularity-add.model');

var msgBox = require('ui.MsgBox');

var View = BaseView.extend({
    clientRender: false,
    el: '#giftwarp', //设置View对象作用于的根元素，比如id
    events: { //监听事件
        'click #gift-items': 'giftClick',
        'click #btnTop': 'topClick',
        'click #btnLike': 'lickClick',
        'click #btnShare': 'shareClick'
    },
    //当模板挂载到元素之前
    beforeMount: function () {

        this.giftTpl = $('#gift-item-tpl').html();

        this.giftParams = {
            deviceinfo: '{"aid": "30001001"}',
            access_token: 'web-' + user.getToken(),
            offset: 0,
            size: 90000,
            type: 0
        };

        this.giftModel = GiftModel.sigleInstance();
        this.popularityModel = PopularityModel.sigleInstance();
        this.popularityParams = {
            deviceinfo: '{"aid": "30001001"}',
            access_token: 'web-' + user.getToken(),
            type: 1,
            roomId: 0
        };

        this.isNeedPopup = true;
        this.elements = {};
    },
    //当模板挂载到元素之后
    afterMount: function () {
        var el = this.$el;
        this.elemens = {
            giftItems: el.find('#gift-items')
        };

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        var self = this;
        Backbone.on('event:roomInfoReady', function (data) {
            if (data) {
                self.roomInfo = data;
            }
        });

        this.initGiftList();

        this.initCarousel();
    },
    initCarousel: function () {
        var warp = $('#giftwarp');
        var jcarousel = warp.find('.jcarousel');

        jcarousel
            .on('jcarousel:reload jcarousel:create', function () {
                var carousel = $(this),
                    width = carousel.innerWidth();

                if (width >= 600) {
                    width = width / 5;
                } else if (width >= 350) {
                    width = width / 5;
                }

                carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
            })
            .jcarousel({
                wrap: 'circular'
            });

        warp.find('.jcarousel-control-prev')
            .jcarouselControl({
                target: '-=1'
            });

        warp.find('.jcarousel-control-next')
            .jcarouselControl({
                target: '+=1'
            });

    },
    initGiftList: function () {
        var self = this;

        this.giftModel.get(this.giftParams, function (res) {
            if (res && res.code == '0') {
                var template = _.template(self.giftTpl);
                self.elemens.giftItems.html(template(res || []));
                self.initCarousel();
            }
        }, function (err) {
            console.log(err);
        });
    },
    giftClick: function (e) {
        var target = e.target;
        if (e.target.nodeName != 'LI') {
            target = $(e.target).parent()
        } else {
            target = $(e.target);
        }
        this.sendGift({
            name: target.data('name'),
            giftId: target.data('giftid')
        });
    },

    sendGift: function (data) {
        Backbone.trigger('event:visitorSendGift', {
            mstType: 1,
            giftId: data.giftId,
            giftNum: 1
        });
        msgBox.showOK('您向主播送出一个' + data.name);
    },
    topClick: function () {
        var self = this;
        if (!this.isNeedPopup) {
            self.pushPopularity(2);
            return;
        }
        var content = '<div>使用20积分支持一下MC,当前共有xx积分</div> '
            + '<div style="text-align:right;"> <label><input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
        uiConfirm.show({
            title: '顶上去',
            content: content,
            okFn: function () {
                self.pushPopularity(2);
                var check = $('#popupCheckBox');
                if (check.is(':checked')) {
                    self.isNeedPopup = false;
                } else {
                    self.isNeedPopup = true;
                }
            }
        });
    },

    pushPopularity: function (type) {
        this.popularityParams.type = type;
        this.popularityParams.roomId = this.roomInfo.id;
        this.popularityModel.executeJSONP(this.popularityParams, function (res) {
            if (res && res.data && res.data.success) {

            } else {
                msgBox.showTip(res.data.message || '操作失败请您稍后重试');
            }
        }, function (err) {

        });
    },

    lickClick: function () {
        var self = this;
        if (this.isClicked) {
            return;
        }
        this.isClicked = true;
        Backbone.trigger('event:visitorSendGift', {
            mstType: 3
        });
        self.pushPopularity(1);
        msgBox.showOK('赞一下');
        setTimeout(function () {
            self.isClicked = false;
        }, 5000);

    },
    shareClick: function () {
        msgBox.showOK('分享一下');
    }

});

module.exports = View;