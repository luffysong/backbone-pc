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
var GiftModel = require('../../model/anchor/gift.model');
var PopularityModel = require('../../model/live-room/popularity-add.model');

var msgBox = require('ui.MsgBox');
var UserInfo = require('./user.js');

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
        this.elements = {
            giftItems: el.find('#gift-items'),
            txtLikeCount: el.find('#txtLikeCount')
        };

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

        this.defineEventInterface();

        this.initGiftList();

        this.initCarousel();
    },
    defineEventInterface: function () {
        var self = this;
        Backbone.on('event:roomInfoReady', function (data) {
            if (data) {
                self.roomInfo = data;
            }
        });

        Backbone.on('event:currentUserInfoReady', function (userInfo) {
            if (userInfo) {
                self.currentUserInfo = userInfo;
            }
        });
        Backbone.on('event:updateRoomInfo', function (data) {
            if (data) {
                self.elements.txtLikeCount.text(data.likeCount || 0);
            }
        });

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
                if(self.giftTpl){
                    var template = _.template(self.giftTpl);
                    self.elements.giftItems.html(template(res || []));
                    self.initCarousel();
                }
            }
        }, function (err) {
            console.log(err);
        });
    },
    roomStatusCheck: function () {
        if (!this.roomInfo || this.roomInfo.status != 2) {
            msgBox.showTip('该直播不在直播中,无法进行互动');
            return false;
        }
        return true;
    },
    giftClick: function (e) {
        var target = e.target;
        if (!this.roomStatusCheck()) {
            return;
        }

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
        if (UserInfo.isDisbaleTalk()) {
            msgBox.showTip('您已经被禁言,暂时无法操作');
        } else if (UserInfo.isLockScreen(this.roomInfo.id)) {
            msgBox.showTip('主播进行了锁屏,暂时无法互动');
        } else {
            Backbone.trigger('event:visitorSendGift', {
                mstType: 1,
                giftId: data.giftId,
                giftNum: 1
            });
            msgBox.showOK('您向主播送出一个' + data.name);
        }
    },
    topClick: function () {
        var self = this;
        if (!this.roomStatusCheck()) {
            return;
        }
        if (!this.isNeedPopup) {
            self.pushPopularity(2);
            return;
        }
        var content = '<div>使用 <span class="green">20</span>积分支持一下MC,当前共有<span class="green">' + (this.currentUserInfo.totalMarks || 0) + '</span>积分</div></br>'
            + '<div style="text-align:right; color:#999;"> <label><input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
        uiConfirm.show({
            title: '顶一下',
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
        if (!this.roomStatusCheck()) {
            return;
        }
        this.popularityParams.type = type;
        this.popularityParams.roomId = this.roomInfo.id;
        this.popularityModel.executeJSONP(this.popularityParams, function (res) {
            if (res && res.data && res.data.success) {

            } else {
                msgBox.showTip(res.data.message || '操作失败请您稍后重试');
            }
        }, function (err) {
            msgBox.showTip('操作失败请您稍后重试');
        });
    },

    lickClick: function () {
        var self = this;
        if (!this.roomStatusCheck()) {
            return;
        }
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
        var title = '', url='';
        //msgBox.showOK('分享一下');
        var html = '<span class="share-wrap" style="width: 106px;">' +
            '<a href="http://i.yinyuetai.com/share?title=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91&amp;url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;cover=http%3A%2F%2Fimg2.yytcdn.com%2Fvideo%2Fmv%2F160406%2F2539803%2F-M-08a09428964cbfbc42b639b775aab1c5_240x135.jpg%3Ft%3D20160405161857" title="分享到音悦台我的家" data-video-id="2539803" data-tongji-id="516" class="myhome J_sharelink"></a> ' +

            '<a href="http://v.t.sina.com.cn/share/share.php?appkey=2817290261&amp;url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;title=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91&amp;content=gb2312&amp;pic=http%3A%2F%2Fimg2.yytcdn.com%2Fvideo%2Fmv%2F160406%2F2539803%2F-M-08a09428964cbfbc42b639b775aab1c5_240x135.jpg%3Ft%3D20160405161857&amp;ralateUid=1698229264" title="分享到新浪微博" data-video-id="2539803" data-tongji-id="517" class="weibo17 J_sharelink"></a>' +

            '<a href="http://connect.qq.com/widget/shareqq/index.html?url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;showcount=1&amp;desc=%E6%8E%A8%E8%8D%90%E4%B8%80%E9%A6%96%E5%A5%BD%E7%9C%8B%E7%9A%84MV%EF%BC%9A%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91&amp;summary=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91&amp;title=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91&amp;site=音悦台&amp;pics=http%3A%2F%2Fimg2.yytcdn.com%2Fvideo%2Fmv%2F160406%2F2539803%2F-M-08a09428964cbfbc42b639b775aab1c5_240x135.jpg%3Ft%3D20160405161857&amp;style=201&amp;width=39&amp;height=39" title="分享到QQ" data-video-id="2539803" data-tongji-id="518" class="qq17 J_sharelink"></a>' +

            '<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;desc=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91" title="分享到QQ空间" data-video-id="2539803" data-tongji-id="519" class="qzone17 J_sharelink"></a>' +

            '<a href="http://v.yinyuetai.com/share/weixin?title=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91&amp;url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803" title="分享到微信" data-video-id="2539803" data-tongji-id="520" class="weixin17 J_sharelink"></a>' +

            '<a href="http://widget.renren.com/dialog/share?resourceUrl=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;images=http%3A%2F%2Fimg2.yytcdn.com%2Fvideo%2Fmv%2F160406%2F2539803%2F-M-08a09428964cbfbc42b639b775aab1c5_240x135.jpg%3Ft%3D20160405161857&amp;charset=UTF-8&amp;message=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91+%ef%bc%88%e5%88%86%e4%ba%ab%e8%87%aa+%40%e9%9f%b3%e6%82%a6Tai(600429402)+%ef%bc%89" title="分享到人人网" data-video-id="2539803" data-tongji-id="521" class="renren17 J_sharelink"></a>' +

            '<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&amp;url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;desc=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91" title="分享到腾讯朋友" data-video-id="2539803" data-tongji-id="522" class="pengyou17 J_sharelink"></a>' +

            '<a href="http://v.t.qq.com/share/share.php?title=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91 %EF%BC%88%E5%88%86%E4%BA%AB%E8%87%AA%40yinyuetai%EF%BC%89&amp;url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;pic=http%3A%2F%2Fimg2.yytcdn.com%2Fvideo%2Fmv%2F160406%2F2539803%2F-M-08a09428964cbfbc42b639b775aab1c5_240x135.jpg%3Ft%3D20160405161857" title="分享到腾讯微博" data-video-id="2539803" data-tongji-id="523" class="tencent17 J_sharelink"></a>' +

            '<a href="http://huaban.com/bookmarklet?url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;media_type=1&amp;video=http%3A%2F%2Fplayer.yinyuetai.com%2Fvideo%2Fswf%2F2539803%2F87%2Fa.swf&amp;title=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91&amp;media=http%3A%2F%2Fimg2.yytcdn.com%2Fvideo%2Fmv%2F160406%2F2539803%2F-M-08a09428964cbfbc42b639b775aab1c5_240x135.jpg%3Ft%3D20160405161857&amp;description=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91" title="分享到花瓣网" data-video-id="2539803" data-tongji-id="524" class="huaban17 J_sharelink"></a>' +

            '<a href="http://t.sohu.com/third/post.jsp?&amp;url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;title=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91&amp;content=utf-8" title="分享到搜狐微博" data-video-id="2539803" data-tongji-id="525" class="sohu17 J_sharelink"></a>' +

            '<a href="http://fql.cc/yytafx?appkey=2817290261&amp;url=http%3A%2F%2Fv.yinyuetai.com%2Fvideo%2F2539803&amp;title=%E3%80%90%E3%83%88%E3%83%A9%E3%82%A4%E3%83%BB%E3%82%A8%E3%83%B4%E3%83%AA%E3%82%B7%E3%83%B3%E3%82%B0-Dream+Ami+%E9%AB%98%E6%B8%85MV-%E9%9F%B3%E6%82%A6%E5%8F%B0%E3%80%91" title="分享到联通飞影" data-video-id="2539803" data-tongji-id="526" class="unicon17 J_sharelink"></a> ' +

            '</span>';
        uiConfirm.show({
            title: '分享',
            content: html,
            okBtn: false,
            cancelBtn:false,
            okFn: function () {

            }
        });
        $('.share-wrap a').on('click', function(){
            var url = $(this).attr('href');
            window.open(url,'newwindow','height=750px,width=700px,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
            uiConfirm.close();
            return false;
        });

    }

});

module.exports = View;