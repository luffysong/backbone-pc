/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-4-8   14:26:0
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([3],{0:function(e,t,n){$(function(){"use strict";var e=n(64);new e;var t=n(115);new t,n(130)})},17:function(e,t,n){"use strict";var o=n(18),i=o.sharedInstanceIMModel(),s=n(20),a={setting:{listeners:{onMsgNotify:null,onGroupInfoChangeNotify:null,groupSystemNotifys:null}}};a.init=function(e){var t=this;i.fetchIMUserSig(function(n){t.im=n;var o={sdkAppID:n.imAppid,appIDAt3rd:n.imAppid,accountType:n.imAccountType,identifier:n.imIdentifier,userSig:n.userSig};n&&e&&webim.init(o,e,null)},function(e){})},a.sendMessage=function(e,t,n){var o=webim.MsgStore.sessByTypeId("GROUP",e.groupId);Math.floor(1e4*Math.random());if(o){var i=new webim.Msg(o,!0);i.addText(new webim.Msg.Elem.Text(JSON.stringify(e.msg))),i.fromAccount=this.im.imIdentifier,webim.sendMsg(i,function(e){t&&t(e)},function(e){n&&n(e)})}},a.clearScreen=function(e){this.sendMessage(e)},a.lockScreen=function(){},a.disableSendMsg=function(e,t,n){var o=webim.Tool.formatTimeStamp(Math.round((new Date).getTime()/1e3)+600);o=new Date(o+"").getTime(),e=_.extend({ShutUpTime:o},e),webim.forbidSendMsg(e,function(e){t&&t(e)},function(e){n&&n(e)})},a.removeUserFromGroup=function(e,t,n){(!e||!e.GroupId||e.MemberToDel_Account.length<=0)&&n&&n({msg:"参数不正确"}),webim.deleteGroupMember(e,function(e){t&&t(e)},function(e){n&&n(e)})},a.msgNotify=function(e){},a.getRoomMsgs=function(e){for(var t=[],n=1;;){if(n++>20)break;t.push({name:"Aaron-"+n,msg:"asdfasdfasfjaslfjasklfasdklf"+n})}e&&e.call(this,t)},a.createIMChatRoom=function(e,t){var n=s.get("imSig"),o={Owner_Account:n.imIdentifier,Type:"ChatRoom",Name:"测试聊天室",Notification:"",Introduction:"",MemberList:[]};webim.createGroup(o,function(t){e&&e(t)},function(e){t&&t(e)})},a.applyJoinGroup=function(e,t,n){var o={GroupId:e,ApplyMsg:"直播间",UserDefinedField:""};webim.applyJoinGroup(o,function(e){t&&t(e)},function(e){n&&n(e)})},a.getGroupInfo=function(e,t,n){var o={GroupIdList:[e],GroupBaseInfoFilter:["Type","Name","Introduction","Notification","FaceUrl","CreateTime","Owner_Account","LastInfoTime","LastMsgTime","NextMsgSeq","MemberNum","MaxMemberNum","ApplyJoinOption"],MemberInfoFilter:["Account","Role","JoinTime","LastSendMsgTime","ShutUpUntil"]};webim.getGroupInfo(o,function(e){t&&t(e)},function(e){n&&n(e)})},a.modifyGroupInfo=function(e,t,n){webim.modifyGroupBaseInfo(e,function(e){t&&t(e)},function(e){n&&n(e)})},e.exports=a},34:function(e,t,n){"use strict";var o=n(19),i=null,s=o.extend({url:"{{url_prefix}}/room/detail.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(e){}});s.sigleInstance=function(){return i||(i=new s),i},e.exports=s},35:function(e,t,n){"use strict";var o=n(19),i=null,s=o.extend({url:"{{url_prefix}}/room/longpolling.json",beforeEmit:function(e){}});s.sigleInstance=function(){return i||(i=new s),i},e.exports=s},36:function(e,t,n){var o={},i={title:"消息",content:"",okFn:null,cancelFn:null,okBtn:!0,cancelBtn:!0};o.init=function(e){var t=_.template(this.getHTML()),n=t(e);this.remove(),this.bindEvent(n,e.okFn,e.cancelFn)},o.remove=function(){var e=$("#UIConfigWrap");e&&e.length>=1&&e.remove()},o.getHTML=function(){return n(37)},o.bindEvent=function(e,t,n){var o=this;e=$(e),e.find("#UIConfirmOk").on("click",function(e){return e.preventDefault(),t&&t(),o.remove(),!1}),e.find(".UIConfirmClose").on("click",function(e){return e.preventDefault(),n&&n(),o.remove(),!1}),e.find("#UIConfirmOk").on("click",function(e){return e.preventDefault(),o.remove(),!1}),$("body").append(e)},o.show=function(e){var t=_.extend(i,e);this.init(t)},o.close=function(){this.remove()},e.exports={show:function(e){o.show(e)},close:function(){o.close()}}},37:function(e,t){e.exports='<div id="UIConfigWrap" class="shadow_screen">\n    <div class="shadow"></div>\n    <div class="edit_annmoucement_con" style="margin-bottom: 16px; width: 400px;margin-left:-200px;">\n        <h2 class="edit_title"><span id="UIConfirmTitle"><%=title%></span> <span class="close UIConfirmClose">X</span></h2>\n        <div class="editCon" style="">\n            <div class="content" style="padding:16px; font-size: 14px;"><%=content%></div>\n            <p class="btn-wrap" style="">\n                <a style="display: <%= cancelBtn?\'inline-block\':\'none\'%>;" href="javascript:;" class="cancel UIConfirmClose">取消</a>\n                <a style="display: <%= okBtn?\'inline-block\':\'none\'%>;" id="UIConfirmOk" href="javascript:;" class="submit active">确定</a>\n            </p>\n        </div>\n    </div>\n</div>'},38:function(e,t){"use strict";function n(){}var o=null,i=null;n.prototype.get=function(e,t,n){i&&t&&t(i),$.ajax("http://lapi.yinyuetai.com/gift/list.json",{method:"GET",data:e,dataType:"jsonp",jsonp:"callback"}).done(function(e){t&&t(e),i=e}).fail(function(e){n&&n(e)})},n.prototype.findGift=function(e){var t=i.data;return _.find(t,function(t){return t.giftId==e})},n.sigleInstance=function(){return o||(o=new n),o},e.exports=n},52:function(e,t,n){(function(t){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof t&&t.global==t&&t;e.exports=n()}(function(){var e=function(e){this.temp=new Date,this.setCurNewDate(e)};e.prototype.changeYear=function(e){this.temp.setFullYear(e)},e.prototype.getCountDays=function(e){return this.temp.setMonth(e),this.temp.setDate(0),this.temp.getDate()},e.prototype.$get=function(e){return this.attrs[e]},e.prototype.ceilYear=function(e){e=~~e;for(var t=0,n=this.$get("year"),o=[];e>=t;t++)o.push(n),n+=1;return o},e.prototype._downDisplacement=function(e){var t,n=this.$get(e),o=[];switch(e){case"month":t=12;break;case"day":t=this.getCountDays(this.$get("month"));break;case"hours":t=23;break;default:t=59}for(;t>=n;n++)o.push(n);return o},e.prototype.downMonth=function(){return this._downDisplacement("month")},e.prototype.downDay=function(){return this._downDisplacement("day")},e.prototype.downHours=function(){return this._downDisplacement("hours")},e.prototype.downMinutes=function(){return this._downDisplacement("minutes")},e.prototype.down=function(e){return this._downDisplacement(e)},e.prototype.getTime=function(e){var t="",n=e.month<10?"0"+e.month:e.month,o=e.day<10?"0"+e.day:e.day,i=e.hours<10?"0"+e.hours:e.hours,s=e.minutes<10?"0"+e.minutes:e.minutes;return t+=e.year+"-"+n+"-"+o+" ",t+=i+":"+s+":00",new Date(t.replace(/-/g,"/")).getTime()},e.prototype.setCurNewDate=function(e){this.date=null,this.date=e?new Date(e):new Date,this._setAttrs()},e.prototype._setAttrs=function(){this.attrs=null,this.attrs={year:this.date.getFullYear(),month:this.date.getMonth()+1,day:this.date.getDate(),hours:this.date.getHours(),minutes:this.date.getMinutes()}},e.difference=function(e){var t={};t.day=parseInt(e/864e5);var n=e%864e5,o=Math.floor(n/36e5);t.hours=10>o?"0"+o:o;var i=n%36e5,s=Math.floor(i/6e4);t.minutes=10>s?"0"+s:s;var a=i%6e4,r=Math.floor(a/1e3);return t.seconds=10>r?"0"+r:r,t};var t=null;return e.sharedInstanceDateTime=function(){return t||(t=new e),t},e}),Date.prototype.Format=function(e){var t={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length)));for(var n in t)new RegExp("("+n+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?t[n]:("00"+t[n]).substr((""+t[n]).length)));return e}}).call(t,function(){return this}())},53:function(e,t,n){(function(t){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof t&&t.global==t&&t;e.exports=n()}(function(){var e='<object width="{width}" height="{height}"  align="middle" id="{id}" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="{src}" name="movie"><param value="{always}" name="allowscriptaccess"><param value="{fullscreen}" name="allowfullscreen"><param value="{quality}" name="quality"><param value="{flashvars}" name="flashvars"><param value="{wmode}" name="wmode" /><embed width="{width}" height="{height}"  name="{id}" type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}" allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" /></object>',t=window,n=t.location.origin,o=(-1!=t.navigator.appName.indexOf("Microsoft"),999);t.YYTPCFlashReadyState=!1;var i=function(e){var t,n,o=document.getElementById(e)||null;return o&&"OBJECT"==o.nodeName.toUpperCase()&&("undefined"!=typeof o.SetVariable?t=o:(n=o.getElementsByTagName("embed")[0],n&&(t=n))),t},s=function(e,t){return t?e.replace(/\{(.*?)\}/gi,function(){return t[arguments[1]]||""}):e},a=function(t){this.$el="string"==typeof t.el?document.getElementById(t.el):t.el,this._options=t,this._props=t.props||{},this.$attrs={id:"YYTFlash"+o++,src:this._props.src||n+"/flash/RTMPInplayer.swf?t=20160407.4",width:this._props.width||895,height:this._props.height||502,wmode:this._props.wmode||"transparent",flashvar:this._props.flashvar||"",always:this._props.always||"always",fullscreen:this._props.fullscreen||!0,quality:this._props.quality||"high"},this._html=s(e,this.$attrs),this._methods=t.methods||{},this._ready=!1,this._init()};a.prototype._init=function(){this.$el.innerHTML=this._html,this.$swf=i(this.$attrs.id)},a.prototype.onReady=function(e){var n=this;t.YYTPCFlashReadyState||this._ready?e.call(this):this.$timer=setInterval(function(){t.YYTPCFlashReadyState&&(n._ready=!0,t.YYTPCFlashReadyState=!1,clearInterval(n.$timer),n.$timer=null,e.call(n))},0)},a.prototype.init=function(e){this.$swf.initData(e)},a.prototype.isReady=function(){return this._ready},a.prototype.addUrl=function(e,t){this.$swf.setvedioUrl(e,t)},a.prototype.width=function(e){"string"==typeof e&&(e=~~e),this.$swf.setPlayerWidth(e)},a.prototype.height=function(e){"string"==typeof e&&(e=~~e),this.$swf.setPlayerHeight(e)},a.prototype.notifying=function(e){this.$swf.setOneMessageInchat(JSON.stringify(e))},a.prototype.clear=function(){this.$swf.clearAllMessage()};var r=null;return a.sharedInstanceFlashAPI=function(e){return r||(r=new a(e)),r},t.YYTPCFlashOnReady=function(){t.YYTPCFlashReadyState=!0},a})}).call(t,function(){return this}())},55:function(e,t){e.exports='<li class="clearfix <%=mstType==0?\'\':\'system-info\'%>" data-msgType="<%=mstType%>" data-name="<%=nickName%>" data-id="<%=fromAccount%>">\n  <%if(mstType == 0){%>\n  <img onerror="this.src=\'../img/visitor_avator.jpg\'" src="<%=smallAvatar%>" alt="" class="fl visitor_avator">\n  <%}%>\n  <p class="visitor_chat fl">\n    <%if(mstType == 0){%>\n    <span class="visitorName"><%=nickName%>:</span>\n    <%} else if(mstType == 4){%>\n        <span class="visitorName">主播:</span>\n    <%} else{%>\n        <span class="visitorName">消息:</span>\n    <% }%>\n    <%=content%>\n    <span class="time fr"><%=time%></span>\n  </p>\n  <div class="controls_forbid_reject">\n    <a href="javascript:;" class="forbid">禁言</a>\n    <a href="javascript:;" class="reject">踢出</a>\n  </div>\n</li>\n'},58:function(e,t,n){"use strict";var o=n(19),i=o.extend({url:"{{url_prefix}}/room/placard_get.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(e){}});e.exports=i},110:function(e,t,n){"use strict";var o=n(19),i=null,s=o.extend({url:"{{url_prefix}}/user/info.json",beforeEmit:function(e){}});s.sigleInstance=function(){return i||(i=new s),i},e.exports=s},115:function(e,t,n){"use strict";var o=n(11),i=n(21),s=n(36),a=n(22),r=a.sharedInstanceUserModel(),c=n(34),l=n(35),f=n(46),u=n(18),d=u.sharedInstanceIMModel(),m=n(17),p=n(110),h=n(116),g=n(117),v=n(53),I=n(20),y=o.extend({clientRender:!1,el:"#anchorContainerBg",events:{},beforeMount:function(){var e=i.parse(location.href);e.query.roomId||window.history.go(-1),this.roomId=e.query.roomId||1,this.roomInfoPeriod=5e3,this.roomDetail=c.sigleInstance(),this.anchorInfoModel=p.sigleInstance(),this.inAndOutRoom=g.sigleInstance(),this.roomDetailParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+r.getToken(),roomId:""},this.roomLongPolling=l.sigleInstance(),this.anchorInfoParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+r.getToken()},this.inAndRoomParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+r.getToken()}},afterMount:function(){},ready:function(){this.defineEventInterface(),r.isLogined()||(I.remove("imSig"),I.set("signout",1),f.showTip("请登录后观看直播!"),window.location.href="/web/login.html"),this.flashAPI=v.sharedInstanceFlashAPI({el:"broadCastFlash"}),this.getUserInfo(),this.renderPage()},defineEventInterface:function(){var e=this;Backbone.on("event:UserKickOut",function(t){e.checkUserIsKickout(t)}),Backbone.on("event:pleaseUpdateRoomInfo",function(){e.roomDetailParams.roomId=e.roomId,e.getRoomLoopInfo(function(e){var t=e.data;Backbone.trigger("event:updateRoomInfo",t)})})},fetchUserIMSig:function(e){var t=this;d.fetchIMUserSig(function(n){t.userIMSig=n,t.initWebIM();var o=function(){window.history.go(-1)};m.applyJoinGroup(e,function(e){Backbone.trigger("event:roomInfoReady",t.roomInfo),2==t.roomInfo.status&&t.loopRoomInfo()},function(e){10013==e.ErrorCode?(Backbone.trigger("event:roomInfoReady",t.roomInfo),2==t.roomInfo.status&&t.loopRoomInfo()):s.show({title:"进入房间",content:"进入房间失败,请稍后重试",cancelFn:o,okFn:o})})})},renderPage:function(){var e=n(118);new e;var t=n(120);new t;var o=n(122);new o;var i=n(124);new i;var s=n(126);new s;var a=n(128);new a},initWebIM:function(){function e(e){Backbone.trigger("event:groupSystemNotifys",e)}m.init({onConnNotify:function(e){Backbone.trigger("event:onConnNotify",e)},onMsgNotify:function(e){Backbone.trigger("event:onMsgNotify",e)},onGroupInfoChangeNotify:function(e){Backbone.trigger("event:onGroupInfoChangeNotify",e)},groupSystemNotifys:{1:e,2:e,3:e,4:e,5:e,6:e,7:e,8:e,9:e,10:e,11:e,255:e}})},initRoom:function(){var e=this,t=function(){s.show({title:"提示",content:"获取房间数据失败!",okFn:function(){e.goBack()},cancelFn:function(){e.goBack()}})};this.getRoomInfo(function(n){var o=n.data||{};n&&"0"==n.code?(e.videoUrl={streamName:o.streamName,url:o.url},e.roomInfo=o,e.flashAPI.onReady(function(){this.init(e.roomInfo)}),e.joinRoom(),e.fetchUserIMSig(o.imGroupid),e.checkRoomStatus(o.status)):t()},t)},getGroupInfo:function(e){var t=this;m.getGroupInfo(e,function(e){e&&0==e.ErrorCode&&(t.currentGroupInfo=_.find(e.GroupInfo,function(e){return e.GroupId==t.roomInfo.imGroupid}),Backbone.trigger("event:IMGroupInfoReady",t.currentGroupInfo),t.checkUserIsKickout(t.currentGroupInfo.Notification))},function(e){})},getUserInfo:function(){var e=this;h.getInfo(function(t){e.userInfo=t,Backbone.trigger("event:currentUserInfoReady",t),e.initRoom()})},getRoomInfo:function(e,t){var n=this;n.roomDetailParams.roomId=n.roomId,this.roomDetail.executeJSONP(n.roomDetailParams,function(t){e&&e(t)},function(e){t&&t(e)})},checkRoomStatus:function(e){switch(e){case 0:f.showTip("该直播尚未发布!");break;case 1:break;case 2:this.getGroupInfo(this.roomInfo.imGroupid);break;case 3:}},checkUserIsKickout:function(e){var t=this,n=null;try{n=_.isString(e)?JSON.parse(e):e}catch(o){}var i="您已经被主播踢出房间,肿么又回来了";if(e.isEvent&&(i="您已经被主播踢出房间!"),n){var a=_.find(n.forbidUsers,function(e){return e.replace("$0","")==t.userIMSig.userId});a&&(h.setKickout(t.roomId,!0),s.show({title:"禁止进入",content:i,cancelBtn:!1,okFn:function(){t.goBack()},cancelFn:function(){t.goBack()}}))}},goBack:function(){window.history.go(-1)},loopRoomInfo:function(e){var t=this;t.roomInfoTimeId=setTimeout(function(){t.roomDetailParams.roomId=t.roomId,t.getRoomLoopInfo(function(e){var n=e.data;Backbone.trigger("event:updateRoomInfo",n),t.loopRoomInfo()})},e?e:t.roomInfoPeriod)},getRoomLoopInfo:function(e,t){var n=this;n.roomDetailParams.roomId=n.roomId,this.roomLongPolling.executeJSONP(n.roomDetailParams,function(t){e&&e(t)},function(e){t&&t(e)})},joinRoom:function(){this.inAndRoomParams.type=1,this.roomInfo&&(this.inAndRoomParams.roomId=this.roomInfo.id),this.inAndOutRoom.executeJSONP(this.inAndRoomParams,function(e){})}});e.exports=y},116:function(e,t,n){function o(){}var i,s=n(110),a=n(20),r=(n(52),n(22)),c=r.sharedInstanceUserModel(),l=null;o.prototype.getInfo=function(e,t){this.anchorInfoModel=s.sigleInstance(),this.anchorInfoParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+c.getToken()},this.anchorInfoModel.executeJSONP(this.anchorInfoParams,function(t){t&&"SUCCESS"===t.msg&&(e&&e(t.data),i=t.data)},function(e){t&&t(e)})},l=new o,e.exports={getInfo:function(e,t){l.getInfo(e,t)},isDisbaleTalk:function(){var e=a.get("userDisableTalkTime");if(!e)return!1;e=new Date(e);var t=new Date,n=t.getTime()-e.getTime();return 0>=n},isKickout:function(e){var t=a.get("userKickout");if(!t)return!1;t=JSON.parse(t);var n=_.find(t,function(t){return t.roomId==e});return!!n&&n.isKickout},setDisableTalk:function(e){e&&a.set("userDisableTalkTime",e)},setKickout:function(e,t){var n=a.get("userKickout");n=n?JSON.parse(n):[];var o=_.find(n,function(t){return t.roomId==e});o?o.isKickout=t:n.push({roomId:e,isKickout:t}),a.set("userKickout",JSON.stringify(n))},setLockScreen:function(e,t){var n=a.get("isLockScreen");n=n?JSON.parse(n):[];var o=_.find(n,function(t){return t.roomId==e});o?o.isLock=t:n.push({roomId:e,isLock:t}),a.set("isLockScreen",JSON.stringify(n))},isLockScreen:function(e){var t=a.get("isLockScreen");if(!t)return!1;t=JSON.parse(t);var n=_.find(t,function(t){return t.roomId==e});return!!n&&n.isLock}}},117:function(e,t,n){"use strict";var o=n(19),i=null,s=o.extend({url:"{{url_prefix}}/room/enter_or_exit.json",beforeEmit:function(e){}});s.sigleInstance=function(){return i||(i=new s),i},e.exports=s},118:function(e,t,n){"use strict";var o=n(11),i=o.extend({el:"#edit_background",rawLoader:function(){return n(119)},events:{},beforeMount:function(){this.elements={}},afterMount:function(){var e=this.$el;this.elements.roomName=e.find(".room-name"),this.elements={roomName:e.find(".room-name"),onLine:e.find("#onlineCount"),popularity:e.find("#popularityCount")}},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var e=this;Backbone.on("event:roomInfoReady",function(t){t&&e.bindData(t)}),Backbone.on("event:updateRoomInfo",function(t){t&&(e.elements.onLine.text(t.currentOnline||0),e.elements.popularity.text(t.popularity||0))})},bindData:function(e){var t=this.elements;t.roomName.text(e.roomName||""),t.onLine.text(e.online||0),t.popularity.text(e.popularity||0)}});e.exports=i},119:function(e,t){e.exports='<div class="room-name fl">xx</div>\n<div class="room-title-right fr">\n  <span class="online">在线人数:<span class="red count font-yahei" id="onlineCount">0</span></span>\n  <span class="popularity">人气:<span class="green count font-yahei" id="popularityCount">0</span></span>\n  <!--<button class="btn Hand btn-support boderRadAll_3"><i></i> 顶一下</button>-->\n</div>\n\n'},120:function(module,exports,__webpack_require__){"use strict";var BaseView=__webpack_require__(11),uiConfirm=__webpack_require__(36),DateTime=__webpack_require__(52),FlashAPI=__webpack_require__(53),msgBox=__webpack_require__(46),YYTIMServer=__webpack_require__(17),RoomDetailModel=__webpack_require__(34),IMModel=__webpack_require__(18),imModel=IMModel.sharedInstanceIMModel(),GiftModel=__webpack_require__(38),UserInfo=__webpack_require__(116),View=BaseView.extend({el:"#anchorCtrlChat",rawLoader:function(){return __webpack_require__(121)},events:{},beforeMount:function(){this.elements={}},afterMount:function(){var e=this.$el;this.elements={msgList:e.find("#msgList"),chatHistory:e.find("#chatHistory")},this.giftModel=GiftModel.sigleInstance(),this.roomDetail=RoomDetailModel.sigleInstance()},ready:function(){this.flashAPI=FlashAPI.sharedInstanceFlashAPI({el:"broadCastFlash"}),this.defineEventInterface()},defineEventInterface:function(){var e=this;Backbone.on("event:roomInfoReady",function(t){t&&(e.roomInfo=t,e.checkUserCanJoinRoom())}),Backbone.on("event:onMsgNotify",function(t){if(t&&"Array"==t.constructor.name)for(var n=0,o=t.length;o>n;n++)e.onMsgNotify(t[n]);else e.onMsgNotify(t)}),Backbone.on("event:onGroupInfoChangeNotify",function(t){e.onGroupInfoChangeNotify(t)}),Backbone.on("event:groupSystemNotifys",function(t){e.groupSystemNotifys(t)}),Backbone.on("event:visitorSendMessage",function(t){UserInfo.isDisbaleTalk()?msgBox.showTip("您已经被禁言,不能发弹幕哦"):UserInfo.isLockScreen(e.roomInfo.id)?msgBox.showTip("主播:进行了锁屏操作"):e.beforeSendMsg(t)}),Backbone.on("event:visitorInteractive",function(t){UserInfo.isDisbaleTalk()?msgBox.showTip("您已经被主播禁言十分钟."):e.beforeSendMsg(t)}),Backbone.on("event:forbidUserSendMsg",function(t){e.forbidUserSendMsgHandler(t)}),Backbone.on("event:currentUserInfoReady",function(t){t&&(e.currentUserInfo=t)}),Backbone.on("event:IMGroupInfoReady",function(t){e.currentGroupInfo=t})},onMsgNotify:function(notifyInfo){var self=this,msgObj={};notifyInfo&&0==notifyInfo.type&&notifyInfo.elems&&notifyInfo.elems.length>0&&(msgObj=notifyInfo.elems[0].content.text+"",msgObj=msgObj.replace(/&quot;/g,"'"),eval("msgObj = "+msgObj),msgObj.fromAccount=notifyInfo.fromAccount,self.beforeSendMsg(msgObj))},beforeSendMsg:function(e){var t=this;if(e.roomId==this.roomInfo.id)switch(e.mstType){case 0:t.addMessage(e);break;case 1:var n=t.giftModel.findGift(e.giftId).name||"礼物";e.content="<b>"+e.nickName+"</b>向主播赠送"+n+"!",e.smallAvatar="",t.addMessage(e);break;case 2:Backbone.trigger("event:updateRoomNotice",e);break;case 3:e.content="<b>"+e.nickName+"</b>点赞一次!",e.smallAvatar="",t.addMessage(e);break;case 4:this.elements.msgList.children().remove(),e.content="进行了清屏操作!",e.smallAvatar="",t.addMessage(e);var o={roomId:t.roomInfo.id,nickName:"主播",smallAvatar:"",mstType:4,content:"主播已清屏"};t.flashAPI.onReady(function(){this.notifying(o)});break;case 5:Backbone.trigger("event:forbidUserSendMsg",e)}},onGroupInfoChangeNotify:function(e){if(e&&e.GroupIntroduction){var t=JSON.parse(e.GroupIntroduction);UserInfo.setLockScreen(this.roomInfo.id,t.blockState);var n="主播进行了"+(t.blockState?"锁屏":"解屏")+"操作";msgBox.showTip(n),Backbone.trigger("event:LockScreen",t.blockState)}if(e&&e.GroupNotification){var o=JSON.parse(e.GroupNotification);o.isEvent=!0,Backbone.trigger("event:UserKickOut",o)}},groupSystemNotifys:function(e){},getMessageTpl:function(){return __webpack_require__(55)},addMessage:function(e){var t=this;if(e=_.extend({nickName:"匿名",content:"",smallAvatar:"",time:t.getDateStr(new Date),fromAccount:""},e),!e||e.roomId===t.roomInfo.id){if(e.content=t.filterEmoji(e.content),e&&e.content){var n=_.template(this.getMessageTpl());this.elements.msgList.append(n(e)),this.elements.chatHistory.scrollTop(this.elements.msgList.height());try{this.flashAPI.onReady(function(){this.notifying(e)})}catch(o){}}YYTIMServer.sendMessage({groupId:this.roomInfo.imGroupid,msg:e}),t.autoDeleteMsgList()}},filterEmoji:function(e){var t=/[\u4e00-\u9fa5\w\d@\.\-。_!^^+#【】！~“：《》？<>]/g;if(e){var n=e.match(t)||[];return n.length>0?n.join("")||"":""}return e},autoDeleteMsgList:function(){var e=this.elements.msgList.children().length,t=0;e>500&&(t=e-200),this.elements.msgList.children(":lt("+t+")").remove()},getDateStr:function(e){var t=new Date(e);return t.Format("hh:mm:ss")},sendNotifyToIM:function(e,t,n){return this.roomInfo.imGroupid?void YYTIMServer.sendMessage({groupId:this.roomInfo.imGroupid,msg:{roomId:this.roomInfo.id,smallAvatar:e.smallAvatar||"",mstType:e.smallAvatar,content:e.smallAvatar}},function(e){t&&t(e)},function(e){n&&n(e)}):void msgBox.showTip("直播尚未开始,请稍后重试")},checkUserCanJoinRoom:function(){YYTIMServer.getGroupInfo(this.roomInfo.imGroupid,function(e){if(e&&0==e.ErrorCode||e.GroupInfo[0]){e.GroupInfo[0]}},function(e){})},checkUserStatus:function(){return UserInfo.isDisbaleTalk()?(msgBox.showTip("您已经被禁言,不能发弹幕哦"),!1):!1},forbidUserSendMsgHandler:function(e){var t=imModel.$get("data.imIdentifier");if(e.userId===t){msgBox.showTip("您已被主播禁言10分钟!"),Backbone.trigger("event:currentUserDisableTalk",!0);var n=new Date;UserInfo.setDisableTalk(n.getTime()+6e5)}}});module.exports=View},121:function(e,t){e.exports='<div class="chatCon pTop5" id="chatHistory">\n    <!--聊天记录-->\n    <ul id="msgList">\n\n    </ul>\n</div>\n'},122:function(e,t,n){"use strict";var o=n(11),i=(n(17),n(22)),s=i.sharedInstanceUserModel(),a=n(46),r=o.extend({el:"#sendMessageWrap",rawLoader:function(){return n(123)},events:{"click #btnChooseColor":"showColorPanel","click #colorList":"chooseColor","click #btnSendMsg":"sendMsgClick","keyup #txtMessage":"textMsgChanged"},beforeMount:function(){this.elements={}},afterMount:function(){var e=this.$el;this.elements={btnChooseColor:e.find("#btnChooseColor"),colorList:e.find("#colorList"),chooseColorPanel:e.find("#chooseColorPanel"),txtMessage:e.find("#txtMessage"),limitTip:e.find("#limitTip")}},ready:function(){this.defineEventInterface(),this.setTextAreatColor()},defineEventInterface:function(){var e=this;Backbone.on("event:roomInfoReady",function(t){t&&(e.roomInfo=t)}),Backbone.on("event:visitorSendGift",function(t){e.sendMessageToChat(_.extend({nickName:s.$get("userName"),smallAvatar:s.$get("bigheadImg"),roomId:e.roomInfo.id||""},t))})},showColorPanel:function(){this.elements.btnChooseColor.toggleClass("actived"),this.elements.chooseColorPanel.toggle()},chooseColor:function(e){var t=$(e.target),n=t.data("color");this.setTextAreatColor(n),this.showColorPanel()},setTextAreatColor:function(e){this.elements.btnChooseColor.attr("data-color",e),this.elements.txtMessage.css("color",e||"#999999")},sendMsgClick:function(){return this.elements.txtMessage.val()<1?"":(this.sendMessageToChat({mstType:0,content:this.elements.txtMessage.val(),nickName:s.$get("userName"),style:{fontColor:this.elements.btnChooseColor.attr("data-color")||"#999999"},smallAvatar:s.$get("bigheadImg"),roomId:this.roomInfo.id}),void this.elements.txtMessage.val(""))},sendMessageToChat:function(e){return this.roomInfo&&2==this.roomInfo.status?void Backbone.trigger("event:visitorSendMessage",e):(a.showTip("该直播不在直播中,无法进行互动"),void this.elements.txtMessage.val(""))},textMsgChanged:function(e){var t=this.elements.txtMessage.val().length;return 13==e.keyCode&&this.sendMsgClick(),this.elements.limitTip.text(20-t),t>=20?!1:void 0}});e.exports=r},123:function(e,t){e.exports='<div id="chooseColorPanel" class="choose-color Hidden">\n    <div class="title">选择颜色</div>\n    <div class="color-list" id="colorList">\n        <span data-color="#f9517d" class="red boderRadAll_20"></span>\n        <span data-color="#ead97a" class="yellow boderRadAll_20"></span>\n        <span data-color="#53e2c2" class="green boderRadAll_20"></span>\n        <span data-color="#569ef8" class="blue boderRadAll_20"></span>\n        <span data-color="#cf57cf" class="purple boderRadAll_20"></span>\n        <span data-color="#ffffff" class="white boderRadAll_20"></span>\n    </div>\n</div>\n<div class="msg-text">\n    <textarea id="txtMessage" maxlength="20" class="pAll5 msg Left" cols="30" rows="5" placeholder="请输入消息"></textarea>\n    <button id="btnSendMsg" class="Hand btn send Left">发送</button>\n    <div class="Clear"></div>\n</div>\n<div class="msg-footer mTop5">\n    <!--<button>face</button>-->\n    <button id="btnChooseColor" class="size Hand"><i></i></button>\n    <div class="tip Right gary1">您还可以输入<span id="limitTip" class="gary2">20</span>字</div>\n    <div class="Clear"></div>\n</div>\n'},124:function(e,t,n){"use strict";var o=n(11),i=n(58),s=n(22),a=s.sharedInstanceUserModel(),r=o.extend({el:"#userInfoWrap",rawLoader:function(){return n(125)},events:{},beforeMount:function(){this.elements={}},afterMount:function(){var e=this.$el;this.noticeGetModel=new i,this.tagTpl=this.$el.find("#tagTpl").html(),this.elements={anchorAvatar:e.find("#anchorAvatar"),name:e.find("#anchorName"),btnAdd:e.find("#btnAdd"),btnReport:e.find("#btnReport"),tagsWrap:e.find("#tagsWrap"),noticeWrap:e.find("#noticWrap")},this.noticeGetParams={deviceinfo:'{"aid":"30001001"}',roomId:"",access_token:"web-"+a.getToken()}},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var e=this;Backbone.on("event:roomInfoReady",function(t){t&&(e.roomInfo=t,e.bindData(t),e.getNoticeInfo())}),Backbone.on("event:updateRoomInfo",function(e){}),Backbone.on("event:updateRoomNotice",function(t){t&&e.elements.noticeWrap.text(t.content||"暂无公告")})},bindData:function(e){var t=this.elements;t.anchorAvatar.attr("src",e.creator.largeAvatar),t.name.text(e.creator.nickName);var n=_.template(this.tagTpl);t.tagsWrap.html(n(e.creator))},getNoticeInfo:function(){var e=this;this.noticeGetParams.roomId=this.roomInfo.id,this.noticeGetModel.executeJSONP(this.noticeGetParams,function(t){if(t&&t.data){var n=null;t.data.placards&&(n=t.data.placards[0]),n?e.elements.noticeWrap.text(n.content||"暂无公告"):e.elements.noticeWrap.text("暂无公告")}},function(e){msgBox.showError(e.msg||"获取公告失败")})}});e.exports=r},125:function(e,t){e.exports='<div class="user-info-wrap clearfix">\n    <img id="anchorAvatar" class="Left avator boderRadAll_35"\n         src="http://img1.yytcdn.com/user/avatar/160322/703-1458640483613/-M-216abfaf3d4ae2ee4d194029b70cdc9d_100x100.jpg"\n         alt="">\n    <div class="info Left">\n        <div id="anchorName" class="name overflow_ellipsis">撒旦法是否是是法撒旦法</div>\n        <div class="btn-wrap mTop10">\n            <!--<button class="btn Hand " id="btnAdd"><i class="add Left"></i> 加关注</button>-->\n            <!--<button class="btn Hand mLeft5" id="btnReport"><i class="Left report"></i> 举报</button>-->\n            <div class="Clear"></div>\n        </div>\n    </div>\n</div>\n<div class="tags mTop10">\n    <div class="gary1 Left">标签:</div>\n    <div class="Right" id="tagsWrap">\n        <script type="text/template" id="tagTpl">\n            <%\n                for(var i=0,l=tags.length; i < l; i++) {\n            %>\n            <span class="item"><%=tags[i]%></span>\n            <%\n            }\n            %>\n        </script>\n    </div>\n    <div class="Clear"></div>\n</div>\n<div class="room-notice mTop10 boderRadAll_5">\n    <i class="trumpet mLeft5 Left"></i>\n    <div id="noticWrap" class="gary2 WordBreak notice mLeft30"></div>\n    <div class="Clear"></div>\n</div>\n'},126:function(e,t,n){"use strict";var o=n(11),i=n(127),s=n(22),a=s.sharedInstanceUserModel(),r=o.extend({clientRender:!1,el:"#anchorPlayedList",events:{},beforeMount:function(){},afterMount:function(){var e=this.$el;this.anchorPlayedTpl=e.find("#anchorPlayedTpl").html(),this.playedList=e.find("#playedListWrap"),this.playedListModel=i.sigleInstance(),this.playedListParams={deviceinfo:'{"aid":"30001001"}',access_token:"web-"+a.getToken(),anchor:"",order:"time",offset:0,size:3}},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var e=this;Backbone.on("event:roomInfoReady",function(t){t&&(e.roomInfo=t,e.bindData(t.creator.uid))})},initCarousel:function(){var e=$("#palyedJcarousel"),t=e.find(".jcarousel");t.on("jcarousel:reload jcarousel:create",function(){var e=$(this),t=e.innerWidth();t>=600?t/=3:t>=350&&(t/=2),e.jcarousel("items").css("width",Math.ceil(t)+"px")}).jcarousel({wrap:"circular"}),e.find(".jcarousel-control-prev").jcarouselControl({target:"-=1"}),e.find(".jcarousel-control-next").jcarouselControl({target:"+=1"})},bindData:function(e){var t=this;this.playedListParams.anchor=e,this.playedListModel.executeJSONP(this.playedListParams,function(e){if(e&&"SUCCESS"===e.msg&&e.data.totalCount>0){var n=_.template(t.anchorPlayedTpl);t.playedList.html(n(e.data)),t.initCarousel()}else t.hideListWrap()},function(e){t.hideListWrap()})},hideListWrap:function(){this.$el.hide()}});e.exports=r},127:function(e,t,n){"use strict";var o=n(19),i=null,s=o.extend({url:"{{url_prefix}}/room/anchor_end_list.json",beforeEmit:function(e){}});s.sigleInstance=function(){return i||(i=new s),i},e.exports=s},128:function(e,t,n){"use strict";var o=n(11),i=n(22),s=i.sharedInstanceUserModel(),a=n(36),r=n(38),c=n(129),l=n(46),f=n(116),u=o.extend({clientRender:!1,el:"#giftwarp",events:{"click #gift-items":"giftClick","click #btnTop":"topClick","click #btnLike":"lickClick","click #btnShare":"shareClick"},beforeMount:function(){this.giftTpl=$("#gift-item-tpl").html(),
this.giftParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+s.getToken(),offset:0,size:9e4,type:0},this.giftModel=r.sigleInstance(),this.popularityModel=c.sigleInstance(),this.popularityParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+s.getToken(),type:1,roomId:0},this.isNeedPopup=!0,this.elements={}},afterMount:function(){var e=this.$el;this.elements={giftItems:e.find("#gift-items"),txtLikeCount:e.find("#txtLikeCount")}},ready:function(){this.defineEventInterface(),this.initGiftList(),this.initCarousel()},defineEventInterface:function(){var e=this;Backbone.on("event:roomInfoReady",function(t){t&&(e.roomInfo=t,e.elements.txtLikeCount.text(t.assemble||0))}),Backbone.on("event:currentUserInfoReady",function(t){t&&(e.currentUserInfo=t)}),Backbone.on("event:updateRoomInfo",function(t){t&&e.elements.txtLikeCount.text(t.likeCount||0)})},initCarousel:function(){var e=$("#giftwarp"),t=e.find(".jcarousel");t.on("jcarousel:reload jcarousel:create",function(){var e=$(this),t=e.innerWidth();t>=600?t/=5:t>=350&&(t/=5),e.jcarousel("items").css("width",Math.ceil(t)+"px")}).jcarousel({wrap:"circular"}),e.find(".jcarousel-control-prev").jcarouselControl({target:"-=1"}),e.find(".jcarousel-control-next").jcarouselControl({target:"+=1"})},initGiftList:function(){var e=this;this.giftModel.get(this.giftParams,function(t){if(t&&"0"==t.code&&e.giftTpl){var n=_.template(e.giftTpl);e.elements.giftItems.html(n(t||[])),e.initCarousel()}},function(e){})},roomStatusCheck:function(){return this.roomInfo&&2==this.roomInfo.status?!0:(l.showTip("该直播不在直播中,无法进行互动"),!1)},giftClick:function(e){var t=e.target;this.roomStatusCheck()&&(t="LI"!=e.target.nodeName?$(e.target).parent():$(e.target),this.sendGift({name:t.data("name"),giftId:t.data("giftid")}))},sendGift:function(e){f.isDisbaleTalk()?l.showTip("您已经被禁言,不能发弹幕哦"):f.isLockScreen(this.roomInfo.id)?l.showTip("主播锁屏中,不能发弹幕哦"):Backbone.trigger("event:visitorSendGift",{mstType:1,giftId:e.giftId,giftNum:1})},topClick:function(){var e=this;if(this.roomStatusCheck()){if(!this.isNeedPopup)return void e.pushPopularity(2);var t='<div>使用 <span class="green">20</span>积分支持一下MC,当前共有<span class="green">'+(this.currentUserInfo.totalMarks||0)+'</span>积分</div></br><div style="text-align:right; color:#999;"> <label><input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';a.show({title:"顶一下",content:t,okFn:function(){e.pushPopularity(2);var t=$("#popupCheckBox");t.is(":checked")?e.isNeedPopup=!1:e.isNeedPopup=!0}})}},pushPopularity:function(e){var t=this;this.roomStatusCheck()&&(this.popularityParams.type=e,this.popularityParams.roomId=this.roomInfo.id,this.popularityModel.executeJSONP(this.popularityParams,function(n){n&&n.data&&"SUCCESS"===n.msg&&1==e?(Backbone.trigger("event:pleaseUpdateRoomInfo"),t.getUserInfo()):n&&n.data.success&&2==e?(l.showOK("非常感谢您的大力支持"),Backbone.trigger("event:pleaseUpdateRoomInfo"),t.getUserInfo()):l.showTip(n.data.message||"操作失败请您稍后重试")},function(e){l.showTip("操作失败请您稍后重试")}))},getUserInfo:function(){f.getInfo(function(e){Backbone.trigger("event:currentUserInfoReady",e)})},lickClick:function(){var e=this;this.roomStatusCheck()&&(this.isClicked||(this.isClicked=!0,Backbone.trigger("event:visitorInteractive",{nickName:s.$get("userName"),smallAvatar:s.$get("bigheadImg"),roomId:e.roomInfo.id||"",mstType:3}),e.pushPopularity(1),setTimeout(function(){e.isClicked=!1},5e3)))},shareClick:function(){var e=this.roomInfo.roomName+",快来围观吧",t=(window.location.href,this.roomInfo.posterPic),n='<span class="share-wrap"><a href="http://i.yinyuetai.com/share?title='+e+"&amp;url=&amp;cover="+t+'?t=20160405161857" title="分享到音悦台我的家" class="myhome J_sharelink"></a> <a href="http://v.t.sina.com.cn/share/share.php?appkey=2817290261&amp;url=http://v.yinyuetai.com/video/2539803&amp;title='+e+"&amp;content=gb2312&amp;pic="+t+'?t=20160405161857&amp;ralateUid=1698229264" title="分享到新浪微博" class="weibo17 J_sharelink"></a><a href="http://connect.qq.com/widget/shareqq/index.html?url=http://v.yinyuetai.com/video/2539803&amp;showcount=1&amp;desc='+e+"&amp;title="+e+"&amp;site=饭趴&amp;pics="+t+'?t=20160405161857&amp;style=201&amp;width=39&amp;height=39" title="分享到QQ" class="qq17 J_sharelink"></a><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=&amp;desc='+e+'" title="分享到QQ空间" class="qzone17 J_sharelink"></a><a href="http://v.yinyuetai.com/share/weixin?title='+e+"&amp;url="+t+'" title="分享到微信"  class="weixin17 J_sharelink"></a><a href="http://widget.renren.com/dialog/share?resourceUrl='+t+"?t=20160405161857&amp;charset=UTF-8&amp;message="+e+'" title="分享到人人网" class="renren17 J_sharelink"></a><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&amp;url='+t+"&amp;desc="+e+'" title="分享到腾讯朋友" class="pengyou17 J_sharelink"></a><a href="http://v.t.qq.com/share/share.php?title='+e+"&amp;url=&amp;pic="+t+'?t=20160405161857" title="分享到腾讯微博" data-video-id="2539803" class="tencent17 J_sharelink"></a><a href="http://huaban.com/bookmarklet?url=&amp;video=&amp;title='+e+"&amp;media="+t+"?t=20160405161857&amp;description="+e+'" title="分享到花瓣网" class="huaban17 J_sharelink"></a><a href="http://t.sohu.com/third/post.jsp?&amp;url=&amp;title='+e+'&amp;content=utf-8" title="分享到搜狐微博" class="sohu17 J_sharelink"></a><a href="http://fql.cc/yytafx?appkey=2817290261&amp;url=&amp;title='+e+'" title="分享到联通飞影" class="unicon17 J_sharelink"></a> </span>';a.show({title:"分享",content:n,okBtn:!1,cancelBtn:!1,okFn:function(){}}),$(".share-wrap a").on("click",function(){var e=$(this).attr("href");return window.open(e,"newwindow","height=750px,width=700px,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no"),a.close(),!1})}});e.exports=u},129:function(e,t,n){"use strict";var o=n(19),i=null,s=o.extend({url:"{{url_prefix}}/popularity/add.json",beforeEmit:function(e){}});s.sigleInstance=function(){return i||(i=new s),i},e.exports=s},130:function(e,t){}});