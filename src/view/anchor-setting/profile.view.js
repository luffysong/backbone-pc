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
var IMModel = require('../../lib/IMModel');
var UserModel = require('UserModel');
var profileTemp = require('../../template/anchor-setting/profile.html');
var imModel = IMModel.sharedInstanceIMModel();
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
    el: '#settingProfile', //设置View对象作用于的根元素，比如id
    events: { //监听事件

    },
    rawLoader: function () {
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.data = {
            'nickName': imModel.$get('data.nickName'),
            'bigheadImg': user.$get('bigheadImg'),
            'anchor': imModel.$get('data.anchor')
        };
    },
    //当模板挂载到元素之后
    afterMount: function () {

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        this.initRender();

        this.defineEventInterface();
    },
    initRender: function () {
        var profileHTML = this.compileHTML(profileTemp, this.data);
        this.$el.html(profileHTML);
    },

    partialRender: function (data) {
        console.log(data);

    },
    /**
     * 定义对外公布的事件
     */
    defineEventInterface: function () {
        var self = this;
        $(document).on('event:userProfileChanged', function (e, data) {
            self.partialRender(data);
        });
    }

});

module.exports = View;
