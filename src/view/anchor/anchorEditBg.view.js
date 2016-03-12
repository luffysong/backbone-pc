/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-03-09
 * @author YuanXuJia
 * @info 更换主题背景
 */

var BaseView = require('BaseView'); //View的基类
var EditBgModel = require('../../model/anchor/anchorEditBg.model');


var View = BaseView.extend({
    el: '#edit_background', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor/editBg.html');
    },
    events: { //监听事件
        'click .id': 'handler'
    },
    elements: {
        '#id': 'xxBtn'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.editBgModel = new EditBgModel();
    },
    //当模板挂载到元素之后
    afterMount: function () {
        //修改背景按钮
        this.changeBgBtn = $('.edit_bg_btn');
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        this.editBgModel.execute(function (response) {
            console.log(response);
            var items = this.$get('items');
        }, function (e) {

        });

        this.on('event-name', function (args) {

        });
    }
});

module.exports = View;