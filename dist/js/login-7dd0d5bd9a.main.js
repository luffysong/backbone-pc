/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-4-27   17:48:17
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([4],[function(o,n,i){$(function(){var o=i(25),n=i(24),e=window.location,t=(o.parse(e.href),n.get("signout"));if(t)return n.remove("signout"),void(e.href="http://login.yinyuetai.com/logout");var r=i(26),c=i(68),a=i(22),h=new c,s=a.sharedInstanceIMModel(),g=r.sharedInstanceUserModel(),f=i(50),d=function(){s.fetchIMUserSig(function(o){o.anchor?window.location.href="/web/anchorsetting.html":window.location.href="/index.html"},function(o){n.remove("imSig"),f.showError("获取签名错误，原因：网络或服务器错误")})};g.isLogined()?d():(n.remove("imSig"),h.on("logined",function(){d()}),h.showLoginDialog())})}]);