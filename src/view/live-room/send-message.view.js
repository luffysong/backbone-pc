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
    el: '#sendMessageWrap', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/live-room/send-message.html');
    },
    events: { //监听事件
        'click #btnChooseColor': 'showColorPanel',
        'click #colorList': 'chooseColor',
        'click #btnSendMsg': 'sendMsgClick',
        'keyup #txtMessage': 'textMsgChanged'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.elements = {};

    },
    //当模板挂载到元素之后
    afterMount: function () {
        var el = this.$el;

        this.elements = {
            btnChooseColor: el.find('#btnChooseColor'),
            colorList: el.find('#colorList'),
            chooseColorPanel: el.find('#chooseColorPanel'),
            txtMessage: el.find('#txtMessage'),
            limitTip: el.find('#limitTip')
            //btnSendMsg: el.find('#btnSendMsg')
        };
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

    },
    showColorPanel: function () {
        this.elements.btnChooseColor.toggleClass('actived');

        this.elements.chooseColorPanel.toggle();
    },
    chooseColor: function (e) {
        var target = $(e.target);
        //console.log();
        var color = target.data('color');
        this.setTextAreatColor(color);
        this.showColorPanel();
    },
    setTextAreatColor: function (color) {
        this.elements.btnChooseColor.attr('data-color', color);
        this.elements.txtMessage.css('color', color || '#999999');
    },
    sendMsgClick: function () {
        Backbone.trigger('event:visitorSendMessage', {
            msg: this.elements.txtMessage.val(),
            color: this.elements.btnChooseColor.data('color') || '#999999'
        });
        this.elements.txtMessage.val('');
    },
    textMsgChanged: function (e) {
        var len = this.elements.txtMessage.val().length;
        if (e.keyCode == 13) {
            this.sendMsgClick();
        }
        this.elements.limitTip.text(50 - len);
        if(len >=50){
            return false;
        }

    }
});

module.exports = View;