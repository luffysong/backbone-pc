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

var View = BaseView.extend({
    el: '#edit_background', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/live-room/room-title.html');
    },
    events: { //监听事件

    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.elements = {};
    },
    //当模板挂载到元素之后
    afterMount: function () {
        var el = this.$el;
        this.elements.roomName = el.find('.room-name');
        this.elements = {
            roomName: el.find('.room-name'),
            onLine: el.find('#onlineCount'),
            popularity: el.find('#popularityCount'),
            onlineTxt: el.find('#onlineTxt')
        };
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

        this.defineEventInterface();
    },
    defineEventInterface: function () {
        var self = this;
        Backbone.on('event:roomInfoReady', function (data) {
            if (data) {
                if (data.status == 3) {
                    self.whenPalypack(data);
                } else {
                    self.bindData(data);
                }
            }
        });
        Backbone.on('event:updateRoomInfo', function (data) {
            if (data) {
                self.elements.onLine.text(data.currentOnline || 0);
                self.elements.popularity.text(data.popularity || 0);
            }
        });
    },
    bindData: function (data) {
        var els = this.elements;
        els.roomName.text(data.roomName || '');
        els.onLine.text(data.online || 0);
        els.popularity.text(data.popularity || 0);
    },
    whenPalypack: function (data) {
        var els = this.elements;
        els.onlineTxt.text('历史最高在线人数');
        els.roomName.text(data.roomName || '');
        els.onLine.text(data.seen || 0);
        els.popularity.text(data.popularity || 0);
    }


});

module.exports = View;