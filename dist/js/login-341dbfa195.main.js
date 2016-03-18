/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-3-18   10:51:4
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([2],[function(o,n,i){$(function(){var o=i(20),n=i(19),e=window.location,r=(o.parse(e.href),n.get("signout"));if(r)return n.remove("signout"),void(e.href="http://login.yinyuetai.com/logout");var t=i(21),s=i(62),a=i(17),n=i(19),c=new s,g=a.sharedInstanceIMModel(),h=t.sharedInstanceUserModel(),f=i(44),u=function(){g.fetchIMUserSig(function(o){if(o.anchor){var i=e.origin;window.location.href=i+"/web/anchorsetting-1a266b6628.html"}else n.remove("imSig"),f.showError("获取签名错误，原因：你可能不是主播；")},function(o){f.showError("获取签名错误，原因：网络或服务器错误")})};h.isLogined()?u():(n.remove("imSig"),c.on("logined",function(){u()}),c.showLoginDialog())})}]);