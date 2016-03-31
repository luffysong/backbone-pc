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
    el: '#playedListWrap', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/live-room/played-list.html');
    },
    events: { //监听事件

    },
    //当模板挂载到元素之前
    beforeMount: function () {

    },
    //当模板挂载到元素之后
    afterMount: function () {

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

        this.initCarousel();
    },
    initCarousel: function () {
        var warp = $('#palyedJcarousel');
        var jcarousel = warp.find('.jcarousel');

        jcarousel
            .on('jcarousel:reload jcarousel:create', function () {
                var carousel = $(this),
                    width = carousel.innerWidth();

                if (width >= 600) {
                    width = width / 3;
                } else if (width >= 350) {
                    width = width / 2;
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

    }

});

module.exports = View;