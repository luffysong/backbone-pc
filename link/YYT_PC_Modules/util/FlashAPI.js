/**
 * @time 2016年3月18日
 * @author icepy
 * @info 封装Flash接口
 */

'use strict';

(function(factory) {
   var root = (typeof self == 'object' && self.self == self && self) ||
       (typeof global == 'object' && global.global == global && global);
   if(typeof exports === 'object' && typeof module === 'object'){
       module.exports = factory();
   }else if(typeof exports === 'object'){
       exports['FlashAPI'] = factory()
   }else{
       if (!root.ICEPlugs) {
           root.ICEPlugs = {};
       };
       root.ICEPlugs.FlashAPI = factory();
   };
})(function() {

    var flashTemp =
        '<object width="{width}" height="{height}"  align="middle" id="{id}" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">'
        +'<param value="{src}" name="movie">'
        +'<param value="{always}" name="allowscriptaccess">'
	    +'<param value="{fullscreen}" name="allowfullscreen">'
	    +'<param value="{quality}" name="quality">'
	    +'<param value="{flashvars}" name="flashvars">'
	    +'<param value="{wmode}" name="wmode" />'
	    +'<embed width="{width}" height="{height}"  name="{id}" type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}" allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" />'
        +'</object>';
    var win = window;
    var origin = win.location.origin;
    var isWindows = win.navigator.appName.indexOf("Microsoft") != -1;
    var uid = 999;
    win.YYTPCFlashReadyState = false;
/**
    {
        "props":{
            构建页面所依赖的数据源
        },
        "methods":{

        },
        el
    }
 */
    var getSwfDOM = function(id){
        var swf,embed,el = document.getElementById(id) || null;
        if (el && el.nodeName.toUpperCase() == 'OBJECT') {
            if (typeof el.SetVariable != 'undefined') {
                swf = el;
            }else {
                embed = el.getElementsByTagName('embed')[0];
                if (embed) {
                    swf = embed;
                }
            }
        }
        return swf;
    };
    var render = function(tpl,data){
        if(data){
            return tpl.replace(/\{(.*?)\}/ig, function() {
                return data[arguments[1]] || "";
            });
        }
        return tpl;
    };
    var FlashAPI = function(options){
        this.$el = typeof options.el === 'string' ? document.getElementById(options.el) : options.el;
        this._options = options;
        this._props = options.props || {};
        this.$attrs = {
            'id':'YYTFlash'+(uid++), //配置id
            'src':this._props.src || origin + '/flash/RTMPInplayer.swf?t=20160429.4', //引入swf文件
            'width':this._props.width || 895,
            'height':this._props.height || 502,
            'wmode':this._props.wmode || 'transparent', //控制显示模型
            'flashvar':this._props.flashvar || '', //初始化参数
            'always':this._props.always || 'always', //控制是否交互
            'fullscreen':this._props.fullscreen || true, //控制是否全屏
            'quality':this._props.quality || 'high'
        };
        this._html = render(flashTemp,this.$attrs);
        this._methods = options.methods || {};
        this._ready = false;
        this._init();
    };
    FlashAPI.prototype._init = function(){
        this.$el.innerHTML = this._html;
        this.$swf = getSwfDOM(this.$attrs.id);
    };
    FlashAPI.prototype.onReady = function(callback){
        var self = this;
        if (win.YYTPCFlashReadyState || this._ready) {
            callback.call(this);
        }else{
            this.$timer = setInterval(function(){
                if (win.YYTPCFlashReadyState) {
                    self._ready = true;
                    win.YYTPCFlashReadyState = false;
                    clearInterval(self.$timer);
                    self.$timer = null;
                    callback.call(self);
                }
            },0)
        };
    };
    FlashAPI.prototype.init = function(data){
        this.$swf.initData(data);
    };
    FlashAPI.prototype.isReady = function(){
        return this._ready;
    };
    FlashAPI.prototype.addUrl = function(url,name){
        this.$swf.setvedioUrl(url,name);
    };
    FlashAPI.prototype.width = function(value){
        if (typeof value === 'string') {
            value = ~~value;
        };
        this.$swf.setPlayerWidth(value);
    };
    FlashAPI.prototype.height = function(value){
        if (typeof value === 'string') {
            value = ~~value;
        };
        this.$swf.setPlayerHeight(value);
    };
    FlashAPI.prototype.notifying = function(obj){
        this.$swf.setOneMessageInchat(JSON.stringify(obj));
    };
    FlashAPI.prototype.clear = function(){
        this.$swf.clearAllMessage();
    };

    var shared = null;
    FlashAPI.sharedInstanceFlashAPI = function(options){
        if (!shared) {
            shared = new FlashAPI(options)
        }
        return shared;
    };
    win.YYTPCFlashOnReady = function(){
        //flash init success
        win.YYTPCFlashReadyState = true;
    };
    // win.YYTPCActivaBrowserFullScreen = function(){
    //     var docElm = document.documentElement;
    //     if (docElm.requestFullscreen) {
    //         docElm.requestFullscreen();
    //     }
    //     else if (docElm.msRequestFullscreen) {
    //         docElm.msRequestFullscreen();
    //     }
    //     else if (docElm.mozRequestFullScreen) {
    //         docElm.mozRequestFullScreen();
    //     }
    //     else if (docElm.webkitRequestFullScreen) {
    //         docElm.webkitRequestFullScreen();
    //     }
    // };
    // win.YYTPCCancelBrowserFullScreen = function(){
    //     if (document.exitFullscreen) {
    //         document.exitFullscreen();
    //     }else if (document.msExitFullscreen) {
    //         document.msExitFullscreen();
    //     }else if (document.mozCancelFullScreen) {
    //         document.mozCancelFullScreen();
    //     }else if (document.webkitCancelFullScreen) {
    //         document.webkitCancelFullScreen();
    //     }
    // };
    return FlashAPI;
});
