/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-3-28   21:38:12
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([2],[function(o,n,e){$(function(){var o=e(20),n=e(19),i=window.location,r=(o.parse(i.href),n.get("signout"));if(r)return n.remove("signout"),void(i.href="http://login.yinyuetai.com/logout");var t=e(21),c=e(61),s=e(17),a=new c,g=s.sharedInstanceIMModel(),h=t.sharedInstanceUserModel(),f=e(43),u=function(){g.fetchIMUserSig(function(o){o.anchor?window.location.href="/web/anchorsetting.html":(n.remove("imSig"),f.showError("获取签名错误，原因：你可能不是主播；"))},function(o){f.showError("获取签名错误，原因：网络或服务器错误")})};h.isLogined()?u():(n.remove("imSig"),a.on("logined",function(){u()}),a.showLoginDialog())})}]);