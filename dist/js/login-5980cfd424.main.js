/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-4-6   15:53:45
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([4],[function(n,o,e){$(function(){var n=e(21),o=e(20),i=window.location,t=(n.parse(i.href),o.get("signout"));if(t)return o.remove("signout"),void(i.href="http://login.yinyuetai.com/logout");var r=e(22),c=e(64),s=e(18),a=new c,g=s.sharedInstanceIMModel(),u=r.sharedInstanceUserModel(),f=e(46),h=function(){g.fetchIMUserSig(function(n){!n.anchor},function(n){f.showError("获取签名错误，原因：网络或服务器错误")})};u.isLogined()?h():(o.remove("imSig"),a.on("logined",function(){h()}),a.showLoginDialog())})}]);