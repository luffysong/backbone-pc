'use strict';
var flashTemp = require('./template/flash.html');
var flashvars = 'local=true&amp;amovid=5f4ffbc12418024&amp;refererdomain=yinyuetai.com&amp;domain=yinyuetai.com&amp;videoId=456&amp;showlyrics=false&amp;capturevideoavailable=true&amp;sendsnaplog=true&amp;usepromptbar=true&amp;popupwin=true&amp;preamovid=true&amp;autostart=true&amp;showadvipbutton=true&amp;playerready=ifFlash&amp;hasbarrage=true&amp;swflocation=%2Fswf%2Fcommon%2Fmvplayer.swf%3Ft%3D2016021913';
var plugins = '12334++1234';
var win = window;
var origin = win.location.origin;
var isWindows = win.navigator.appName.indexOf("Microsoft") != -1;
var uid = 999;
var tplEng = require('tplEng');
var FlashAPI = function(options){
    this.$el = $(options.id);
    this.options = options;
    this.attrs = {
        'id':'YYTFlash'+(uid++),
        'name':'YYTFlash'+(uid++),
        'plugins':options.plugins || plugins,
        'flashvars':options.flashvars || '12132',
        'src':options.src || origin + '/flash/Test3.swf'
    };
    this._fns = {};
    this._init();
};
FlashAPI.prototype._init = function(){
    var html = tplEng.compile(flashTemp)(this.attrs);
    this.$el.html(html);
    this.$embed = this.$el.find(this.attrs.id);
    this._createAttrs();
    console.log(this);
};
FlashAPI.prototype._createAttrs = function(){
    var funKey = 'ExternalInterfaceExample';
    console.log(document[funKey]);
    console.log(window[funKey]);
    if (isWindows) {
        this._fns = window[funKey];
    }else{
        this._fns = document[funKey];
    };
};

FlashAPI.prototype.addUrl = function(value){
    this.attrs.setvedioUrl(value);
};

FlashAPI.prototype.width = function(value){
    if (typeof value === 'string') {
        value = ~~value;
    };
    this.attrs.setPlayerWidth(value);
};

FlashAPI.prototype.height = function(value){
    if (typeof value === 'string') {
        value = ~~value;
    };
    this.attrs.setPlayerHeight(value);
};

FlashAPI.prototype.sendMessage = function(obj){
    this.attrs.setOneMessage(obj);
};

var shared = null;
FlashAPI.sharedInstanceFlashAPI = function(options){
    if (!shared) {
        shared = new FlashAPI(options)
    }
    return shared;
};
module.exports = FlashAPI;
