"use strict";!function(t){var e="object"==typeof self&&self.self==self&&self||"object"==typeof global&&global.global==global&&global;"object"==typeof exports&&"object"==typeof module?module.exports=t():"object"==typeof exports?exports.FlashAPI=t():(e.ICEPlugs||(e.ICEPlugs={}),e.ICEPlugs.FlashAPI=t())}(function(){var t='<object width="{width}" height="{height}"  align="middle" id="{id}" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="{src}" name="movie"><param value="{always}" name="allowscriptaccess"><param value="{fullscreen}" name="allowfullscreen"><param value="{quality}" name="quality"><param value="{flashvars}" name="flashvars"><param value="{wmode}" name="wmode" /><embed width="{width}" height="{height}"  name="{id}" type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}" allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" /></object>',e=window,a=e.location.origin,s=(-1!=e.navigator.appName.indexOf("Microsoft"),999);e.YYTPCFlashReadyState=!1;var i=function(t){var e,a,s=document.getElementById(t)||null;return s&&"OBJECT"==s.nodeName.toUpperCase()&&("undefined"!=typeof s.SetVariable?e=s:(a=s.getElementsByTagName("embed")[0],a&&(e=a))),e},l=function(t,e){return e?t.replace(/\{(.*?)\}/gi,function(){return e[arguments[1]]||""}):t},o=function(e){this.$el="string"==typeof e.el?document.getElementById(e.el):e.el,this._options=e,this._props=e.props||{},this.$attrs={id:"YYTFlash"+s++,src:this._props.src||a+"/flash/RTMPInplayer.swf?t=20160325.6",width:this._props.width||895,height:this._props.height||502,wmode:this._props.wmode||"transparent",flashvar:this._props.flashvar||"",always:this._props.always||"always",fullscreen:this._props.fullscreen||!0,quality:this._props.quality||"high"},this._html=l(t,this.$attrs),this._methods=e.methods||{},this._ready=!1,this._init()};o.prototype._init=function(){this.$el.innerHTML=this._html,this.$swf=i(this.$attrs.id)},o.prototype.onReady=function(t){var a=this;e.YYTPCFlashReadyState||this._ready?t.call(this):this.$timer=setInterval(function(){e.YYTPCFlashReadyState&&(a._ready=!0,e.YYTPCFlashReadyState=!1,clearInterval(a.$timer),a.$timer=null,t.call(a))},0)},o.prototype.init=function(t){this.$swf.initData(t)},o.prototype.isReady=function(){return this._ready},o.prototype.addUrl=function(t,e){this.$swf.setvedioUrl(t,e)},o.prototype.width=function(t){"string"==typeof t&&(t=~~t),this.$swf.setPlayerWidth(t)},o.prototype.height=function(t){"string"==typeof t&&(t=~~t),this.$swf.setPlayerHeight(t)},o.prototype.notifying=function(t){this.$swf.setOneMessageInchat(JSON.stringify(t))},o.prototype.clear=function(){this.$swf.clearAllMessage()};var r=null;return o.sharedInstanceFlashAPI=function(t){return r||(r=new o(t)),r},e.YYTPCFlashOnReady=function(){e.YYTPCFlashReadyState=!0},o});