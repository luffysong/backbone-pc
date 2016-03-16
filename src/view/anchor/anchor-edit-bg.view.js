/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-03-09
 * @author YuanXuJia
 * @info 更换主题背景
 */

var BaseView = require('BaseView'); //View的基类
var EditBgModel = require('../../model/anchor/anchor-edit-bg.model');
var UploadFileDialog = require('UploadFileDialog');
var msgBox = require('ui.MsgBox');

var View = BaseView.extend({
    el: '#edit_background', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor/edit-bg.html');
    },
    events: { //监听事件
        'click .edit_bg_btn': 'showFileUploadDialog'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.editBgModel = new EditBgModel();
        this.uploadFile = new UploadFileDialog(this.getFileUploadOptions());
    },
    //当模板挂载到元素之后
    afterMount: function () {
        //修改背景按钮
        this.changeBgBtn = $('.edit_bg_btn');
        this.txtPopularity = $('#txtPopularity');
        this.txtRoomName = $('#txtRoomName');

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        this.defineEventInterface();

        this.editBgModel.execute(function (response) {
            console.log('editBgModel',response);
            var items = this.$get('items');
        }, function (e) {

        });
    },
    /**
     * 定义事件
     */
    defineEventInterface: function () {
        var self = this;
        $(document).on('event:roomInfoReady', function (e, data) {
            if (data) {
                self.roomInfo = data;
                self.txtRoomName.text(data.roomName || '');
                self.txtPopularity.text(data.popularity || 0);
            }
        })
    },
    getFileUploadOptions:function(){
        var self = this;
        return {
            width : 580,
            height : 341,
            isRemoveAfterHide : false,
            isAutoShow : false,
            mainClass:'shadow_screen_x',
            closeClass:'editor_bg_close_x',
            closeText:'X',
            title: '上传主题背景图片',
            ctrlData:{
                "cmd":[
                    {"saveOriginal" : 1, "op" : "save", "plan" : "avatar", "belongId" :"20634338","srcImg":"img"}
                ],
                "redirect": window.location.origin +  "/web/upload.html"
            },
            uploadFileSuccess:function(response){
                console.log(response);
                if(response && response.images && response.images.length>0){
                    self.currentBgImg = response.images[0].path;
                }
            },
            saveFile:function(){
                self.setBackgroundImg();

            }
        };
    },
    showFileUploadDialog: function(){
        this.currentBgImg = '';
        this.uploadFile.show();
    },
    setBackgroundImg: function(){
        var self = this;
        if(!self.currentBgImg){
            msgBox.showTip('请耐心等待图片上传完成!');
            return ;
        }

        msgBox.showOK('背景图片设置成功');

    }
});

module.exports = View;