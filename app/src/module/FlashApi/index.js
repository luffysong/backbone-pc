var flashTemp =
  '<object width="{width}" height="{height}"  align="middle"' +
  'id="{id}" type="application/x-shockwave-flash" ' +
  'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' +
  '<param value="{src}" name="movie">' +
  '<param value="{always}" name="allowscriptaccess">' +
  '<param value="{fullscreen}" name="allowfullscreen">' +
  '<param value="{quality}" name="quality">' +
  '<param value="{flashvars}" name="flashvars">' +
  '<param value="{wmode}" name="wmode" />' +
  '<embed width="{width}" height="{height}"  name="{id}"' +
  'type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}"' +
  'allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" />' +
  '</object>';
var win = window;
var origin = win.location.origin;
var uid = 999;
win.YYTPCFlashReadyState = false;
var getSwfDOM = function (id) {
  var swf;
  var embed;
  var el = document.getElementById(id) || null;
  if (el && el.nodeName.toUpperCase() === 'OBJECT') {
    if (typeof el.SetVariable !== 'undefined') {
      swf = el;
    } else {
      embed = el.getElementsByTagName('embed')[0];
      if (embed) {
        swf = embed;
      }
    }
  }
  return swf;
};
var render = function (tpl, data) {
  if (data) {
    return tpl.replace(/\{(.*?)\}/ig, function () {
      return data[arguments[1]] || '';
    });
  }
  return tpl;
};
var FlashApi = function (options) {
  this.$el = typeof options.el === 'string' ? document.getElementById(options.el) : options.el;
  this._options = options;
  this._props = options.props || {};
  this.$attrs = {
    id: 'YYTFlash' + (uid++), //  配置id
    src: this._props.src || origin + '/flash/RTMPInplayer.swf?t=20160713.9', //  引入swf文件
    width: this._props.width || 895,
    height: this._props.height || 502,
    wmode: this._props.wmode || 'transparent', // 控制显示模型
    flashvar: this._props.flashvar || '', //  初始化参数
    always: this._props.always || 'always', //  控制是否交互
    fullscreen: this._props.fullscreen || true, //  控制是否全屏
    quality: this._props.quality || 'high'
  };
  this._html = render(flashTemp, this.$attrs);
  this._methods = options.methods || {};
  this._ready = false;
  this._init();
};

FlashApi.prototype._init = function () {
  this.$el.innerHTML = this._html;
  this.$swf = getSwfDOM(this.$attrs.id);
};

FlashApi.prototype.onReady = function (callback) {
  var self = this;
  if (win.YYTPCFlashReadyState || this._ready) {
    callback.call(this);
  } else {
    this.$timer = setInterval(function () {
      if (win.YYTPCFlashReadyState) {
        self._ready = true;
        win.YYTPCFlashReadyState = false;
        clearInterval(self.$timer);
        self.$timer = null;
        callback.call(self);
      }
    }, 0);
  }
};

FlashApi.prototype.init = function (data) {
  this.$swf.initData(data);
};

FlashApi.prototype.isReady = function () {
  return this._ready;
};

FlashApi.prototype.addUrl = function (url, name) {
  this.$swf.setvedioUrl(url, name);
};

FlashApi.prototype.width = function (value) {
  var val = value;
  if (typeof val === 'string') {
    val = ~~val;
  }
  this.$swf.setPlayerWidth(val);
};

FlashApi.prototype.height = function (value) {
  var val = value;
  if (typeof val === 'string') {
    val = ~~val;
  }
  this.$swf.setPlayerHeight(val);
};

FlashApi.prototype.notifying = function (obj) {
  this.$swf.setOneMessageInchat(JSON.stringify(obj));
};

FlashApi.prototype.clear = function () {
  this.$swf.clearAllMessage();
};

var shared = null;
FlashApi.sharedInstanceFlashApi = function (options) {
  if (!shared) {
    shared = new FlashApi(options);
  }
  return shared;
};

win.YYTPCFlashOnReady = function () {
  //  flash init success
  win.YYTPCFlashReadyState = true;
};

module.exports = FlashApi;
