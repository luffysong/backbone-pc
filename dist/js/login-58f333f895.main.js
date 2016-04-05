/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-4-5   13:3:48
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([4],[function(n,o,i){$(function(){var n=i(21),o=i(20),e=window.location,t=(n.parse(e.href),o.get("signout"));if(t)return o.remove("signout"),void(e.href="http://login.yinyuetai.com/logout");var r=i(22),c=i(64),a=i(18),h=new c,s=a.sharedInstanceIMModel(),f=r.sharedInstanceUserModel(),g=i(46),d=function(){s.fetchIMUserSig(function(n){n.anchor?window.location.href="/web/anchorsetting.html":window.location.href="/index.html"},function(n){g.showError("获取签名错误，原因：网络或服务器错误")})};f.isLogined()?d():(o.remove("imSig"),h.on("logined",function(){d()}),h.showLoginDialog())})}]);