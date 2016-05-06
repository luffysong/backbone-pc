/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-5-6   16:24:45
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([4],[function(o,n,i){$(function(){var o=i(26),n=i(25),e=window.location,t=(o.parse(e.href),n.get("signout"));if(t)return n.remove("signout"),void(e.href="http://login.yinyuetai.com/logout");var r=i(27),c=i(69),a=i(23),h=new c,s=a.sharedInstanceIMModel(),g=r.sharedInstanceUserModel(),f=i(51),d=function(){s.fetchIMUserSig(function(o){o.anchor?window.location.href="/web/anchorsetting.html":window.location.href="/index.html"},function(o){n.remove("imSig"),f.showError("获取签名错误，原因：网络或服务器错误")})};g.isLogined()?d():(n.remove("imSig"),h.on("logined",function(){d()}),h.showLoginDialog())})}]);