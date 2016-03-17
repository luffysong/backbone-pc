'use strict';
var flashTemp = require('./template/flash.html');
console.log(flashTemp)
var win = window;
var origin = win.location.origin;
var FlashAPI = function(options){
    this.$el = $(options.id);
    this.options = options;
    this.attrs = {};
    this._init();
};
FlashAPI.prototype._init = function(){
    var pluginSrc = this.options.pluginSrc || origin+'/falsh/Inplayer.swf';
    console.log(flashTemp)
    var html = flashTemp.replace('{{plugins}}',pluginSrc);
    this.$el.html(html);
    this.$embed = this.$el.find('.player');
    return;
    this._createAttrs();
};
FlashAPI.prototype._createAttrs = function(){
    this.attrs = win.thisMovie("ExternalInterfaceExample");
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
