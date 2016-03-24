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
var NoOpenListModel = require('../../model/anchor-setting/no-open-list.model');
var ReleaseModel = require('../../model/anchor-setting/release-video.model');
var RemoveModel = require('../../model/anchor-setting/remove-video.model');
var SaveCoverImageModel = require('../../model/anchor-setting/save-cover-image.model');
var NoOpenPageBoxView = require('./page-box.view');
var MsgBox = require('ui.MsgBox');
var Confirm = require('ui.Confirm');
var UserModel = require('UserModel');
var UploadFileDialog = require('UploadFileDialog');
var DateTime = require('DateTime');
var user = UserModel.sharedInstanceUserModel();
var dateTime = new DateTime();
var View = BaseView.extend({
    el: '#noOpenContent', //设置View对象作用于的根元素，比如id
    events: { //监听事件
        'click li': 'checkLiveVideoHandler',
        'click .uploadImage': 'editCoverImageHandler',
        'click .copy-video-url': 'copyUrlHandler',
        'click .copy-video-name': 'copyNameHandler'
    },
    rawLoader: function () {

    },
    //当模板挂载到元素之前
    beforeMount: function () {
        var token = user.getToken();
        this.listTemp = require('../../template/anchor-setting/no-open-list.html');
        this.liTemp = require('../../template/anchor-setting/no-open-li.html');
        this.noOpenParameter = {
            'deviceinfo': '{"aid":"30001001"}',
            'order': 'time',
            'offset': 0,
            'size': 6,
            'access_token': 'web-' + token
        };
        this.removeParameter = {
            'deviceinfo': '{"aid":"30001001"}',
            'roomId': '',
            'access_token': 'web-' + token
        };
        this.releaseParameter = {
            'deviceinfo': '{"aid":"30001001"}',
            'roomId': '',
            'access_token': 'web-' + token
        };
        this.saveCoverParameter = {
            'deviceinfo': '{"aid":"30001001"}',
            'access_token': 'web-' + token,
            'roomId': '',
            'posterUrl': ''
        };
        this.removeLock = true;
        this.releaseLock = true;
        this.liCache = null;
        this.imagePath = '';
        this.upload = null;
        this.singleLiDOM = null;
        this.uploadState = false;
        this.noOpenModel = new NoOpenListModel();
        this.releaseModel = new ReleaseModel();
        this.removeModel = new RemoveModel();
        this.saveCoverModel = new SaveCoverImageModel();
    },
    //当模板挂载到元素之后
    afterMount: function () {

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        var self = this;
        var fileOptions = {
            width: 580,
            height: 341,
            isRemoveAfterHide: false,
            isAutoShow: false,
            mainClass: 'shadow_screen_x',
            closeClass: 'editor_bg_close_x',
            closeText: 'X',
            title: '封面设置',
            ctrlData: {
                "cmd": [
                    {"saveOriginal": 1, "op": "save", "plan": "avatar", "belongId": "20634338", "srcImg": "img"}
                ],
                "redirect": window.location.origin + "/cross-url/upload.html"
            },
            uploadFileSuccess: function (response) {
                //上传成功
                self.uploadImageHandler(response);
                self.uploadState = true;
            },
            saveFile: function () {
                //保存
                if (self.uploadState) {
                    self.saveCoverImage();
                } else {
                    MsgBox.showTip('正在上传，请等待');
                }
            }
        };
        this.upload = new UploadFileDialog(fileOptions);
        this.noOpenModel.executeJSONP(this.noOpenParameter, function (response) {
            var data = response.data;
            var roomList = data.roomList;
            var count = Math.ceil(data.totalCount / self.noOpenParameter.size);
            if (count > 1) {
                self.initPageBox({
                    'offset': self.noOpenParameter.offset,
                    'size': self.noOpenParameter.size,
                    'count': count
                });
            }
            self.initRender(roomList);
        }, function () {
            MsgBox.showError('获取未直播列表：第1页失败');
        });
    },
    initPageBox: function (prop) {
        var self = this;
        this.pageBoxView = new NoOpenPageBoxView({
            id: '#noOpenPageBox',
            props: prop,
            listModel: this.noOpenModel,
            listRender: function (response) {
                var data = response.data;
                var roomList = data.roomList;
                self.initRender(roomList);
            }
        });
    },
    //分页渲染，以及缓存li
    initRender: function (items) {
        var html = '';
        if (items.length) {
            html = this.compileHTML(this.listTemp, {'items': items});
        } else {
            html = '<h1>暂无数据</h1>';
        }
        this.$el.html(html);
        this.liCache = null;
        this.liCache = {};
        var lis = this.$el.find('li');
        var i = 0;
        var l = lis.length;
        for (; i < l; i++) {
            var li = $(lis[i]);
            var key = li.attr('data-key');
            this.liCache[key] = li;
        }
    },
    //点击发布或删除时的处理
    checkLiveVideoHandler: function (e) {
        var self = this,
            el = $(e.currentTarget),
            span = $(e.target),
            state = span.data('state'),
            id = el.attr('data-id'),
            postImg = span.parents('li').attr('data-img');

        switch (state) {
            case 2://发布
                self.publishLiveShow(id, span, postImg);
                break;
            case 3: //删除
                if (this.removeLock) {
                    Confirm.show({
                        content: '是否确认删除',
                        okFn: function () {
                            self.removeLock = false;
                            self.removeParameter.roomId = id;
                            self.removeModel.executeJSONP(self.removeParameter, function () {
                                self.removeLock = true;
                                MsgBox.showOK('删除成功');
                                el.remove();
                            }, function (e) {
                                self.removeLock = true;
                                MsgBox.showError('删除失败');
                            });
                        }
                    });
                }
                break;
        }
    },
    isTooLate: function (time) {
        var currentTime = new Date();
        var timeSpan = time - currentTime.getTime();
        var hour = Number(DateTime.difference(Math.abs(timeSpan)).hours);
        if (timeSpan < 0 && hour >= 1) {
            return true;
        }
        return false;
    },
    //发布直播
    publishLiveShow: function (id, span, postImg) {
        var self = this,
            time = span.parents('li').attr('data-liveTime');
        if (self.isTooLate(time)) {
            msgBox.showTip('您已经迟到超过一小时，无法再进行本场直播了');
            return null;
        }
        if (span.attr('class') === 'disable') {
            return;
        }
        if (this.releaseLock && postImg) {
            this.releaseLock = false;
            this.releaseParameter.roomId = id;
            this.releaseModel.executeJSONP(this.releaseParameter, function (response) {
                self.releaseLock = true;
                span.addClass('disable');
                MsgBox.showOK('发布成功');
                var item = response.data;
                item.liCacheKey = item.id + '-' + item.streamName;
                item.liveVideoTime = self.forMatterDate(item.liveTime);
                item.lookUrl = '/web/anchor.html?roomId=' + item.id;
                self.liRender(item);
            }, function (e) {
                self.releaseLock = true;
                MsgBox.showError('发布失败');
            });
        } else {
            MsgBox.showError('发布失败，请上传封面');
        }

    },
    //点击编辑封面
    editCoverImageHandler: function (e) {
        var el = $(e.currentTarget);
        var attrs = null;
        var posterpic = el.attr('data-posterpic');
        if (this.upload) {
            this.currentLiveItem = $(el.parents('li'));

            this.singleLiDOM = el.parent();
            this.saveCoverParameter.roomId = this.singleLiDOM.data('id');
            this.upload.emptyValue();
            if (posterpic) {
                var img = el.find('.cover-image');
                attrs = {
                    breviaryUrl: img.attr('src'),
                    inputText: '编辑图片'
                };
                console.log(attrs);
            }
            this.upload.show(attrs);
        }
    },
    //上传成功之后处理image 地址
    uploadImageHandler: function (response) {
        var result = this.upload.parseErrorMsg(response);

        if (result == true) {
            var images = response.images;
            this.imagePath = images[0].path;
            if (this.currentLiveItem) {
                this.currentLiveItem.attr('data-img', images[0].path || '');
            }
        }else{
            MsgBox.showTip(result);
        }
    },
    //点击保存之后的处理
    saveCoverImage: function () {
        var self = this;
        this.saveCoverParameter.posterUrl = this.imagePath;
        this.saveCoverModel.executeJSONP(this.saveCoverParameter, function (response) {
            var code = ~~response.code;
            if (!code) {
                var coverImageDOM = self.singleLiDOM.find('.cover-image');
                coverImageDOM.attr('src', self.imagePath);
                self.singleLiDOM = null;
                MsgBox.showOK('保存成功');
                self.upload.hide();
                self.uploadState = false;
            }
        }, function (e) {
            MsgBox.showError('保存失败');
        });
    },
    //格式化时间
    forMatterDate: function (time) {
        dateTime.setCurNewDate(time);
        var year = dateTime.$get('year');
        var month = dateTime.$get('month');
        var day = dateTime.$get('day');
        var _hours = dateTime.$get('hours');
        var hours = _hours < 10 ? '0' + _hours : _hours;
        var _minutes = dateTime.$get('minutes');
        var minutes = _minutes < 10 ? '0' + _minutes : _minutes;
        return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
    },
    //发布时，重新渲染li
    liRender: function (item) {
        var html = this.compileHTML(this.liTemp, {'item': item});
        var li = this.liCache[item.liCacheKey];
        li.html(html);
    },
    copyUrlHandler: function (e) {
        e.preventDefault();
        var el = $(e.currentTarget);
        var value = el.attr('data-value');
        if (!value.length) {
            MsgBox.showTip('原因：需要发布才会存在视屏地址');
            return;
        }
        this.clipboard(value);
    },
    copyNameHandler: function (e) {
        e.preventDefault();
        var el = $(e.currentTarget);
        var value = el.attr('data-value');
        this.clipboard(value);
    },
    clipboard: function (value) {
        if (window.clipboardData) {
            window.clipboardData.clearData('text');
            window.clipboardData.setData('text', value);
            MsgBox.showOK('复制成功');
        } else {
            MsgBox.showTip('原因：你浏览器的js不支持剪贴板，无法调用');
        }
    }
});
module.exports = View;
