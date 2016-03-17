'use strict';
var flashTemp = require('./template/flash.html');
var origin = window.location.origin;
var FlashAPI = function(options){
    this.$el = $(options.id);
    this.options = options;
    this._init();
};
FlashAPI.prototype._init = function(){
    var pluginSrc = this.options.pluginSrc || origin+'/falsh/Inplayer.swf';
    var html = flashTemp.replace('{{plugins}}',pluginSrc);
    this.$el.html(html);
    this.$embed = this.$el.find('.player');
};
var shared = null;
FlashAPI.sharedInstanceFlashAPI = function(options){
    if (!shared) {
        shared = new FlashAPI(options)
    }
    return shared;
};
module.exports = FlashAPI;
