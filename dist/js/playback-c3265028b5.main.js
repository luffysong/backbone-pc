/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-5-6   11:17:16
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([5],{0:function(t,e,n){$(function(){"use strict";var t=n(69);new t;var e=n(146);new e,n(145)})},22:function(t,e,n){"use strict";var o=n(23),i=o.sharedInstanceIMModel(),a=n(25),s={setting:{listeners:{onMsgNotify:null,onGroupInfoChangeNotify:null,groupSystemNotifys:null}}};s.init=function(t){var e=this;i.fetchIMUserSig(function(n){e.im=n;var o={sdkAppID:n.imAppid,appIDAt3rd:n.imAppid,accountType:n.imAccountType,identifier:n.imIdentifier,userSig:n.userSig};n&&t&&webim.init(o,t,null)},function(t){})},s.sendMessage=function(t,e,n){var o=webim.MsgStore.sessByTypeId("GROUP",t.groupId),i=Math.floor(1e4*Math.random());if(o||(o=new webim.Session("GROUP",t.groupId,t.groupId,"",i)),o){var a=new webim.Msg(o,!0),s=new webim.Msg.Elem("TIMCustomElem",{data:JSON.stringify(t.msg)});a.elems.push(s),a.fromAccount=this.im.imIdentifier,webim.sendMsg(a,function(t){e&&e(t)},function(t){n&&n(t)})}},s.clearScreen=function(t){this.sendMessage(t)},s.lockScreen=function(){},s.disableSendMsg=function(t,e,n){var o=webim.Tool.formatTimeStamp(Math.round((new Date).getTime()/1e3)+600);o=new Date(o+"").getTime(),t=_.extend({ShutUpTime:o},t),webim.forbidSendMsg(t,function(t){e&&e(t)},function(t){n&&n(t)})},s.removeUserFromGroup=function(t,e,n){(!t||!t.GroupId||t.MemberToDel_Account.length<=0)&&n&&n({msg:"参数不正确"}),webim.deleteGroupMember(t,function(t){e&&e(t)},function(t){n&&n(t)})},s.msgNotify=function(t){},s.getRoomMsgs=function(t){for(var e=[],n=1;;){if(n++>20)break;e.push({name:"Aaron-"+n,msg:"asdfasdfasfjaslfjasklfasdklf"+n})}t&&t.call(this,e)},s.createIMChatRoom=function(t,e){var n=a.get("imSig"),o={Owner_Account:n.imIdentifier,Type:"ChatRoom",Name:"测试聊天室",Notification:"",Introduction:"",MemberList:[]};webim.createGroup(o,function(e){t&&t(e)},function(t){e&&e(t)})},s.applyJoinGroup=function(t,e,n){var o={GroupId:t,ApplyMsg:"直播间",UserDefinedField:""};webim.applyJoinGroup(o,function(t){e&&e(t)},function(t){n&&n(t)})},s.getGroupInfo=function(t,e,n){var o={GroupIdList:[t],GroupBaseInfoFilter:["Type","Name","Introduction","Notification","FaceUrl","CreateTime","Owner_Account","LastInfoTime","LastMsgTime","NextMsgSeq","MemberNum","MaxMemberNum","ApplyJoinOption"],MemberInfoFilter:["Account","Role","JoinTime","LastSendMsgTime","ShutUpUntil"]};webim.getGroupInfo(o,function(t){e&&e(t)},function(t){n&&n(t)})},s.modifyGroupInfo=function(t,e,n){webim.modifyGroupBaseInfo(t,function(t){e&&e(t)},function(t){n&&n(t)})},t.exports=s},39:function(t,e,n){"use strict";var o=n(24),i=null,a=o.extend({url:"{{url_prefix}}/room/detail.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},40:function(t,e,n){"use strict";var o=n(24),i=null,a=o.extend({url:"{{url_prefix}}/room/longpolling.json",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},41:function(t,e,n){var o={},i={title:"消息",content:"",okFn:null,cancelFn:null,okBtn:!0,cancelBtn:!0};o.init=function(t){var e=_.template(this.getHTML()),n=e(t);this.remove(),this.bindEvent(n,t.okFn,t.cancelFn)},o.remove=function(){var t=$("#UIConfigWrap");t&&t.length>=1&&t.remove()},o.getHTML=function(){return n(42)},o.bindEvent=function(t,e,n){var o=this;t=$(t),t.find("#UIConfirmOk").on("click",function(t){return t.preventDefault(),e&&e(),o.remove(),!1}),t.find(".UIConfirmClose").on("click",function(t){return t.preventDefault(),n&&n(),o.remove(),!1}),t.find("#UIConfirmOk").on("click",function(t){return t.preventDefault(),o.remove(),!1}),$("body").append(t)},o.show=function(t){var e=_.extend(i,t);this.init(e)},o.close=function(){this.remove()},t.exports={show:function(t){o.show(t)},close:function(){o.close()}}},42:function(t,e){t.exports='<div id="UIConfigWrap" class="shadow_screen">\n    <div class="shadow"></div>\n    <div class="edit_annmoucement_con" style="margin-bottom: 16px; width: 400px;margin-left:-200px;">\n        <h2 class="edit_title"><span id="UIConfirmTitle"><%=title%></span> <span class="close UIConfirmClose">X</span></h2>\n        <div class="editCon" style="">\n            <div class="content" style="padding:16px; font-size: 14px;"><%=content%></div>\n            <p class="btn-wrap" style="">\n                <a style="display: <%= cancelBtn?\'inline-block\':\'none\'%>;" href="javascript:;" class="cancel UIConfirmClose">取消</a>\n                <a style="display: <%= okBtn?\'inline-block\':\'none\'%>;" id="UIConfirmOk" href="javascript:;" class="submit active">确定</a>\n            </p>\n        </div>\n    </div>\n</div>'},43:function(t,e){"use strict";function n(){}var o=null,i=null;n.prototype.get=function(t,e,n){i&&e&&e(i),$.ajax("http://lapi.yinyuetai.com/gift/list.json",{method:"GET",data:t,dataType:"jsonp",jsonp:"callback"}).done(function(t){e&&e(t),i=t}).fail(function(t){n&&n(t)})},n.prototype.findGift=function(t){var e=i.data;return _.find(e,function(e){return e.giftId==t})},n.sigleInstance=function(){return o||(o=new n),o},t.exports=n},57:function(t,e,n){(function(e){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;t.exports=n()}(function(){var t=function(t){this.temp=new Date,this.setCurNewDate(t)};t.prototype.changeYear=function(t){this.temp.setFullYear(t)},t.prototype.getCountDays=function(t){return this.temp.setMonth(t),this.temp.setDate(0),this.temp.getDate()},t.prototype.$get=function(t){return this.attrs[t]},t.prototype.ceilYear=function(t){t=~~t;for(var e=0,n=this.$get("year"),o=[];t>=e;e++)o.push(n),n+=1;return o},t.prototype._downDisplacement=function(t){var e,n=this.$get(t),o=[];switch(t){case"month":e=12;break;case"day":e=this.getCountDays(this.$get("month"));break;case"hours":e=23;break;default:e=59}for(;e>=n;n++)o.push(n);return o},t.prototype.downMonth=function(){return this._downDisplacement("month")},t.prototype.downDay=function(){return this._downDisplacement("day")},t.prototype.downHours=function(){return this._downDisplacement("hours")},t.prototype.downMinutes=function(){return this._downDisplacement("minutes")},t.prototype.down=function(t){return this._downDisplacement(t)},t.prototype.getTime=function(t){var e="",n=t.month<10?"0"+t.month:t.month,o=t.day<10?"0"+t.day:t.day,i=t.hours<10?"0"+t.hours:t.hours,a=t.minutes<10?"0"+t.minutes:t.minutes;return e+=t.year+"-"+n+"-"+o+" ",e+=i+":"+a+":00",new Date(e.replace(/-/g,"/")).getTime()},t.prototype.setCurNewDate=function(t){this.date=null,this.date=t?new Date(t):new Date,this._setAttrs()},t.prototype._setAttrs=function(){this.attrs=null,this.attrs={year:this.date.getFullYear(),month:this.date.getMonth()+1,day:this.date.getDate(),hours:this.date.getHours(),minutes:this.date.getMinutes()}},t.difference=function(t){var e={};e.day=parseInt(t/864e5);var n=t%864e5,o=Math.floor(n/36e5);e.hours=10>o?"0"+o:o;var i=n%36e5,a=Math.floor(i/6e4);e.minutes=10>a?"0"+a:a;var s=i%6e4,r=Math.floor(s/1e3);return e.seconds=10>r?"0"+r:r,e};var e=null;return t.sharedInstanceDateTime=function(){return e||(e=new t),e},t}),Date.prototype.Format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length)));for(var n in e)new RegExp("("+n+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[n]:("00"+e[n]).substr((""+e[n]).length)));return t}}).call(e,function(){return this}())},58:function(t,e,n){(function(e){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;t.exports=n()}(function(){var t='<object width="{width}" height="{height}"  align="middle" id="{id}" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="{src}" name="movie"><param value="{always}" name="allowscriptaccess"><param value="{fullscreen}" name="allowfullscreen"><param value="{quality}" name="quality"><param value="{flashvars}" name="flashvars"><param value="{wmode}" name="wmode" /><embed width="{width}" height="{height}"  name="{id}" type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}" allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" /></object>',e=window,n=e.location.origin,o=(-1!=e.navigator.appName.indexOf("Microsoft"),999);e.YYTPCFlashReadyState=!1;var i=function(t){var e,n,o=document.getElementById(t)||null;return o&&"OBJECT"==o.nodeName.toUpperCase()&&("undefined"!=typeof o.SetVariable?e=o:(n=o.getElementsByTagName("embed")[0],n&&(e=n))),e},a=function(t,e){return e?t.replace(/\{(.*?)\}/gi,function(){return e[arguments[1]]||""}):t},s=function(e){this.$el="string"==typeof e.el?document.getElementById(e.el):e.el,this._options=e,this._props=e.props||{},this.$attrs={id:"YYTFlash"+o++,src:this._props.src||n+"/flash/RTMPInplayer.swf?t=20160429.4",width:this._props.width||895,height:this._props.height||502,wmode:this._props.wmode||"transparent",flashvar:this._props.flashvar||"",always:this._props.always||"always",fullscreen:this._props.fullscreen||!0,quality:this._props.quality||"high"},this._html=a(t,this.$attrs),this._methods=e.methods||{},this._ready=!1,this._init()};s.prototype._init=function(){this.$el.innerHTML=this._html,this.$swf=i(this.$attrs.id)},s.prototype.onReady=function(t){var n=this;e.YYTPCFlashReadyState||this._ready?t.call(this):this.$timer=setInterval(function(){e.YYTPCFlashReadyState&&(n._ready=!0,e.YYTPCFlashReadyState=!1,clearInterval(n.$timer),n.$timer=null,t.call(n))},0)},s.prototype.init=function(t){this.$swf.initData(t)},s.prototype.isReady=function(){return this._ready},s.prototype.addUrl=function(t,e){this.$swf.setvedioUrl(t,e)},s.prototype.width=function(t){"string"==typeof t&&(t=~~t),this.$swf.setPlayerWidth(t)},s.prototype.height=function(t){"string"==typeof t&&(t=~~t),this.$swf.setPlayerHeight(t)},s.prototype.notifying=function(t){this.$swf.setOneMessageInchat(JSON.stringify(t))},s.prototype.clear=function(){this.$swf.clearAllMessage()};var r=null;return s.sharedInstanceFlashAPI=function(t){return r||(r=new s(t)),r},e.YYTPCFlashOnReady=function(){e.YYTPCFlashReadyState=!0},s})}).call(e,function(){return this}())},63:function(t,e,n){"use strict";var o=n(24),i=o.extend({url:"{{url_prefix}}/room/placard_get.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(t){}});t.exports=i},81:function(t,e,n){"use strict";var o=n(24),i=null,a=o.extend({url:"{{url_prefix}}/user/info.json",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},110:function(t,e,n){"use strict";var o=n(24),i=null,a=o.extend({url:"{{url_prefix}}/user/anchor/unfollow.json?deviceinfo={{deviceinfo}}&anchorId={{anchorId}}",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},129:function(t,e,n){function o(){}var i,a=n(81),s=n(25),r=(n(57),n(27)),c=r.sharedInstanceUserModel(),l=null;o.prototype.getInfo=function(t,e){this.anchorInfoModel=a.sigleInstance(),this.anchorInfoParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+c.getToken()},this.anchorInfoModel.executeJSONP(this.anchorInfoParams,function(e){e&&"SUCCESS"===e.msg&&(t&&t(e.data),i=e.data)},function(t){e&&e(t)})},l=new o,t.exports={getInfo:function(t,e){l.getInfo(t,e)},isDisbaleTalk:function(t,e){var n=s.get("userDisableTalkTime");if(!n)return!1;try{n=JSON.parse(n)}catch(o){n=[]}var i=_.find(n,function(n){return n.roomId==e&&n.userId==t});if(!i)return!1;var a=i.time;if(!a)return!1;a=new Date(a);var r=new Date,c=r.getTime()-a.getTime();return 0>=c},isKickout:function(t){var e=s.get("userKickout");if(!e)return!1;try{e=JSON.parse(e)}catch(n){e=[]}var o=_.find(e,function(e){return e.roomId==t});return!!o&&o.isKickout},setDisableTalk:function(t,e,n){var o=s.get("userDisableTalkTime");if(_.isNumber(o)&&(o=[]),o)try{o=JSON.parse(o)}catch(i){o=[]}else o=[];var a=_.find(o,function(e){return e.roomId==roomId&&e.userId==t});a?a.time=n:o.push({roomId:e,userId:t,time:n}),s.set("userDisableTalkTime",JSON.stringify(o))},setKickout:function(t,e){var n=s.get("userKickout");if(n)try{n=JSON.parse(n)}catch(o){n=[]}else n=[];var i=_.find(n,function(e){return e.roomId==t});i?i.isKickout=e:n.push({roomId:t,isKickout:e}),s.set("userKickout",JSON.stringify(n))},setLockScreen:function(t,e){var n=s.get("isLockScreen");n=n?JSON.parse(n):[];var o=_.find(n,function(e){return e.roomId==t});o?o.isLock=e:n.push({roomId:t,isLock:e}),s.set("isLockScreen",JSON.stringify(n))},isLockScreen:function(t){var e=s.get("isLockScreen");if(!e)return!1;e=JSON.parse(e);var n=_.find(e,function(e){return e.roomId==t});return!!n&&n.isLock},removeAll:function(){s.set("isLockScreen",""),s.set("userDisableTalkTime",""),s.set("userKickout","")}}},132:function(t,e,n){"use strict";var o=n(16),i=o.extend({el:"#edit_background",rawLoader:function(){return n(133)},events:{},beforeMount:function(){this.elements={}},afterMount:function(){var t=this.$el;this.elements.roomName=t.find(".room-name"),this.elements={roomName:t.find(".room-name"),onLine:t.find("#onlineCount"),popularity:t.find("#popularityCount"),onlineTxt:t.find("#onlineTxt")}},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(3==e.status?t.whenPalypack(e):t.bindData(e))}),Backbone.on("event:updateRoomInfo",function(e){e&&(t.elements.onLine.text(e.currentOnline||0),t.elements.popularity.text(e.popularity||0))})},bindData:function(t){var e=this.elements;e.roomName.text(t.roomName||""),e.onLine.text(t.online||0),e.popularity.text(t.popularity||0)},whenPalypack:function(t){var e=this.elements;e.onlineTxt.text("历史最高在线人数"),e.roomName.text(t.roomName||""),e.onLine.text(t.seen||0),e.popularity.text(t.popularity||0)}});t.exports=i},133:function(t,e){t.exports='<div class="room-name fl"></div>\n<div class="room-title-right fr">\n  <span class="online"> <span id="onlineTxt">在线人数</span>:<span class="red count font-yahei" id="onlineCount">0</span></span>\n  <span class="popularity">人气:<span class="green count font-yahei" id="popularityCount">0</span></span>\n  <!--<button class="btn Hand btn-support boderRadAll_3"><i></i> 顶一下</button>-->\n</div>\n\n'},138:function(t,e,n){"use strict";var o=n(16),i=n(63),a=n(27),s=a.sharedInstanceUserModel(),r=n(139),c=n(110),l=n(51),u=n(23),f=u.sharedInstanceIMModel(),d=o.extend({el:"#userInfoWrap",rawLoader:function(){return n(140)},events:{"click #btnFollow":"followClickHandler","mouseover #btnFollow":function(t){var e=$(t.target);e.hasClass("followed")&&e.text("取消关注")},"mouseout #btnFollow":function(t){var e=$(t.target);e.hasClass("followed")&&e.text("已关注")}},beforeMount:function(){this.elements={}},afterMount:function(){var t=this.$el;this.noticeGetModel=new i,this.followModel=r.sigleInstance(),this.unFollowModel=c.sigleInstance(),this.followParams={deviceinfo:'{"aid": "30001001"}',access_token:s.getWebToken()},this.tagTpl=this.$el.find("#tagTpl").html(),this.elements={anchorAvatar:t.find("#anchorAvatar"),name:t.find("#anchorName"),btnAdd:t.find("#btnAdd"),btnReport:t.find("#btnReport"),tagsWrap:t.find("#tagsWrap"),noticeWrap:t.find("#noticWrap")},this.noticeGetParams={deviceinfo:'{"aid":"30001001"}',roomId:"",access_token:"web-"+s.getToken()},this.btnFollow=t.find("#btnFollow")},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(t.roomInfo=e,t.bindData(e),t.getNoticeInfo())}),Backbone.on("event:updateRoomInfo",function(t){}),Backbone.on("event:updateRoomNotice",function(e){e&&t.elements.noticeWrap.text(e.content||"暂无公告")})},bindData:function(t){var e=this.elements,n=this;e.anchorAvatar.attr("src",t.creator.largeAvatar),e.name.text(t.creator.nickName);var o=_.template(this.tagTpl);e.tagsWrap.html(o(t.creator)),t.creator.isFollowed&&n.btnFollow.addClass("followed").text("已关注")},getNoticeInfo:function(){var t=this;this.noticeGetParams.roomId=this.roomInfo.id,this.noticeGetModel.executeJSONP(this.noticeGetParams,function(e){if(e&&e.data){var n=null;e.data.placards&&(n=e.data.placards[0]),n?t.elements.noticeWrap.text(n.content||"暂无公告"):t.elements.noticeWrap.text("暂无公告")}},function(t){l.showError(t.msg||"获取公告失败")})},followClickHandler:function(){var t=this;if(this.followParams.anchorId=this.roomInfo.creator.uid,this.btnFollow.hasClass("followed"))this.unFollowModel.executeJSONP(t.followParams,function(e){e.data&&e.data.success&&(l.showOK("已取消关注主播"),t.btnFollow.removeClass("followed").text("关注"))},function(){l.showTip("操作失败,稍后重试")});else{if(f.$get("data.userId")===t.followParams.anchorId)return l.showTip("不能关注自己!"),null;this.followModel.executeJSONP(t.followParams,function(e){e.data&&e.data.success&&(l.showOK("已成功关注主播"),t.btnFollow.addClass("followed").text("取消关注"))},function(){l.showTip("关注失败,稍后重试")})}}});t.exports=d},139:function(t,e,n){"use strict";var o=n(24),i=null,a=o.extend({url:"{{url_prefix}}/user/anchor/follow.json?deviceinfo={{deviceinfo}}&access_token={{access_token}}&anchorId={{anchorId}}",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},140:function(t,e){t.exports='<div class="user-info-wrap clearfix">\n    <img id="anchorAvatar" class="Left avator boderRadAll_35"\n         src="http://img1.yytcdn.com/user/avatar/160322/703-1458640483613/-M-216abfaf3d4ae2ee4d194029b70cdc9d_100x100.jpg"\n         alt="">\n    <div class="info Left">\n        <div id="anchorName" class="name overflow_ellipsis"></div>\n        <div class="btn-wrap mTop10">\n            <button class="btn Hand" id="btnFollow">\n                关注\n                <!--<i class="add Left"></i>-->\n                <!--<span>关注</span>-->\n            </button>\n            <!--<button class="btn Hand mLeft5" id="btnReport"><i class="Left report"></i> 举报</button>-->\n            <div class="Clear"></div>\n        </div>\n    </div>\n</div>\n<div class="tags mTop10">\n    <div class="gary1 Left">标签:</div>\n    <div class="Right" id="tagsWrap">\n        <script type="text/template" id="tagTpl">\n            <%\n            for(var i=0,l=tags.length; i < l; i++) {\n            %>\n            <span class="item"><%=tags[i]%></span>\n            <%\n            }\n            %>\n        </script>\n    </div>\n    <div class="Clear"></div>\n</div>\n<div class="room-notice mTop10 boderRadAll_5">\n    <i class="trumpet mLeft5 Left"></i>\n    <div id="noticWrap" class="gary2 WordBreak notice mLeft30"></div>\n    <div class="Clear"></div>\n</div>\n'},141:function(t,e,n){"use strict";var o=n(16),i=n(142),a=n(27),s=a.sharedInstanceUserModel(),r=o.extend({clientRender:!1,el:"#anchorPlayedList",events:{},beforeMount:function(){},afterMount:function(){var t=this.$el;this.anchorPlayedTpl=t.find("#anchorPlayedTpl").html(),this.playedList=t.find("#playedListWrap"),this.playedListModel=i.sigleInstance(),this.playedListParams={deviceinfo:'{"aid":"30001001"}',access_token:s.getWebToken(),anchor:"",order:"time",offset:0,size:9}},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(t.roomInfo=e,t.bindData(e.creator.uid))})},initCarousel:function(){var t=$("#palyedJcarousel"),e=t.find(".jcarousel");e.on("jcarousel:reload jcarousel:create",function(){var t=$(this),e=t.innerWidth();e>=600?e/=3:e>=350&&(e/=2),t.jcarousel("items").css("width",Math.ceil(e)+"px")}).jcarousel({wrap:"circular"}),t.find(".jcarousel-control-prev").jcarouselControl({target:"-=1"}),t.find(".jcarousel-control-next").jcarouselControl({target:"+=1"})},bindData:function(t){var e=this;this.playedListParams.anchor=t,this.playedListModel.executeJSONP(this.playedListParams,function(t){if(t&&"SUCCESS"===t.msg&&t.data.totalCount>0){var n=_.template(e.anchorPlayedTpl);e.playedList.html(n(t.data)),e.initCarousel()}else e.hideListWrap()},function(t){e.hideListWrap()})},hideListWrap:function(){this.$el.hide()}});t.exports=r},142:function(t,e,n){"use strict";var o=n(24),i=null,a=o.extend({url:"{{url_prefix}}/room/anchor_end_list.json",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},143:function(t,e,n){"use strict";var o=n(16),i=n(27),a=i.sharedInstanceUserModel(),s=n(41),r=n(43),c=n(144),l=n(51),u=n(129),f=o.extend({clientRender:!1,el:"#giftwarp",events:{"click #gift-items":"giftClick","click #btnTop":"topClick","click #btnLike":"lickClick","click #btnShare":"shareClick"},beforeMount:function(){this.giftTpl=$("#gift-item-tpl").html(),this.giftParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+a.getToken(),offset:0,size:9e4,type:0},this.giftModel=r.sigleInstance(),this.popularityModel=c.sigleInstance(),this.popularityParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+a.getToken(),type:1,roomId:0},this.isNeedPopup=!0,this.elements={},this.sendGiftPeriod=5e3},afterMount:function(){var t=this.$el;this.elements={giftItems:t.find("#gift-items"),txtLikeCount:t.find("#txtLikeCount")}},ready:function(){this.defineEventInterface(),this.initGiftList(),this.initCarousel()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(t.roomInfo=e,t.elements.txtLikeCount.text(e.assemble||0))}),Backbone.on("event:currentUserInfoReady",function(e){e&&(t.currentUserInfo=e)}),Backbone.on("event:updateRoomInfo",function(e){e&&t.elements.txtLikeCount.text(e.likeCount||0)}),Backbone.on("event:liveShowEnded",function(e){e&&(t.roomInfo.status=e.roomStatus)})},initCarousel:function(){var t=$("#giftwarp"),e=t.find(".jcarousel");e.on("jcarousel:reload jcarousel:create",function(){var t=$(this),e=t.innerWidth();e>=600?e/=5:e>=350&&(e/=5),t.jcarousel("items").css("width",Math.ceil(e)+"px")}).jcarousel({wrap:"circular"}),t.find(".jcarousel-control-prev").jcarouselControl({target:"-=1"}),t.find(".jcarousel-control-next").jcarouselControl({target:"+=1"})},initGiftList:function(){var t=this;this.giftModel.get(this.giftParams,function(e){if(e&&"0"==e.code&&t.giftTpl){var n=_.template(t.giftTpl);t.elements.giftItems.html(n(e||[])),t.initCarousel()}},function(t){})},roomStatusCheck:function(){return this.roomInfo&&2==this.roomInfo.status?!0:(l.showTip("该直播不在直播中,无法进行互动"),!1)},giftClick:function(t){var e=t.target;this.roomStatusCheck()&&(e="LI"!=t.target.nodeName?$(t.target).parent():$(t.target),this.sendGift({name:e.data("name"),giftId:e.data("giftid")}))},sendGift:function(t){var e=this;if(u.isDisbaleTalk(a.$get().userId,this.roomInfo.id))l.showTip("您已经被主播禁言10分钟");else if(u.isLockScreen(this.roomInfo.id))l.showTip("主播锁屏中");else{if(this.notSend)return null;this.notSend=!0,Backbone.trigger("event:visitorSendGift",{msgType:1,giftId:t.giftId,giftNum:1}),setTimeout(function(){e.notSend=!1},e.sendGiftPeriod)}},topClick:function(){var t=this;if(this.roomStatusCheck()){if(!this.isNeedPopup)return void t.pushPopularity(2);var e='<div>使用 <span class="green">20</span>积分支持一下MC,当前共有<span class="green">'+(this.currentUserInfo.totalMarks||0)+'</span>积分</div></br><div style="text-align:right; color:#999;"> <label><input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';s.show({title:"顶一下",content:e,okFn:function(){t.pushPopularity(2);var e=$("#popupCheckBox");e.is(":checked")?t.isNeedPopup=!1:t.isNeedPopup=!0}})}},pushPopularity:function(t){var e=this;this.roomStatusCheck()&&(this.popularityParams.type=t,this.popularityParams.roomId=this.roomInfo.id,this.popularityModel.executeJSONP(this.popularityParams,function(n){n&&n.data&&"SUCCESS"===n.msg&&1==t?(Backbone.trigger("event:pleaseUpdateRoomInfo"),e.getUserInfo()):n&&n.data.success&&2==t?(l.showOK("非常感谢您的大力支持"),Backbone.trigger("event:pleaseUpdateRoomInfo"),e.getUserInfo()):l.showTip(n.data.message||"操作失败请您稍后重试")},function(t){l.showTip("操作失败请您稍后重试")}))},getUserInfo:function(){u.getInfo(function(t){Backbone.trigger("event:currentUserInfoReady",t)})},lickClick:function(){var t=this;this.roomStatusCheck()&&(this.isClicked||(this.isClicked=!0,Backbone.trigger("event:visitorInteractive",{nickName:a.$get("userName"),smallAvatar:a.$get("bigheadImg"),roomId:t.roomInfo.id||"",msgType:3}),t.pushPopularity(1),setTimeout(function(){t.isClicked=!1},5e3)))},shareClick:function(){var t=encodeURIComponent(this.roomInfo.roomName+",快来围观吧"),e="http://"+window.location.host,n=this.roomInfo.posterPic;e=2==this.roomInfo.status?encodeURIComponent(e+"/web/liveRoom.html?roomId="+this.roomInfo.id):encodeURIComponent(e+"/web/playback.html?roomId="+this.roomInfo.id);var o='<span class="share-wrap"><a href="http://i.yinyuetai.com/share?title='+t+"&amp;url="+e+"&amp;cover="+n+'?t=20160405161857" title="分享到音悦台我的家" class="myhome J_sharelink"></a> <a href="http://v.t.sina.com.cn/share/share.php?appkey=2817290261&amp;url='+e+"&amp;title="+t+"&amp;content=gb2312&amp;pic="+n+'?t=20160405161857&amp;ralateUid=1698229264" title="分享到新浪微博" class="weibo17 J_sharelink"></a><a href="http://connect.qq.com/widget/shareqq/index.html?url='+e+"&amp;showcount=1&amp;desc="+t+"&amp;title="+t+"&amp;site=饭趴&amp;pics="+n+'?t=20160405161857&amp;style=201&amp;width=39&amp;height=39" title="分享到QQ" class="qq17 J_sharelink"></a><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+e+"&amp;desc="+t+'" title="分享到QQ空间" class="qzone17 J_sharelink"></a><a href="http://v.yinyuetai.com/share/weixin?title='+t+"&amp;url="+e+'" title="分享到微信"  class="weixin17 J_sharelink"></a><a href="http://widget.renren.com/dialog/share?resourceUrl='+e+"?t=20160405161857&amp;charset=UTF-8&amp;message="+t+'" title="分享到人人网" class="renren17 J_sharelink"></a><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&amp;url='+e+"&amp;desc="+t+'" title="分享到腾讯朋友" class="pengyou17 J_sharelink"></a><a href="http://v.t.qq.com/share/share.php?title='+t+"&amp;url="+e+"&amp;pic="+n+'?t=20160405161857" title="分享到腾讯微博" data-video-id="2539803" class="tencent17 J_sharelink"></a><a href="http://huaban.com/bookmarklet?url='+e+"&amp;video=&amp;title="+t+"&amp;media="+n+"?t=20160405161857&amp;description="+t+'" title="分享到花瓣网" class="huaban17 J_sharelink"></a><a href="http://t.sohu.com/third/post.jsp?&amp;url='+e+"&amp;title="+t+'&amp;content=utf-8" title="分享到搜狐微博" class="sohu17 J_sharelink"></a><a href="http://fql.cc/yytafx?appkey=2817290261&amp;url='+e+"&amp;title="+t+'" title="分享到联通飞影" class="unicon17 J_sharelink"></a> </span>';s.show({title:"分享",content:o,okBtn:!1,cancelBtn:!1,okFn:function(){}}),$(".share-wrap a").on("click",function(){var t=$(this).attr("href");return window.open(t,"newwindow","height=750px,width=700px,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no"),s.close(),!1})}});t.exports=f},144:function(t,e,n){"use strict";var o=n(24),i=null,a=o.extend({url:"{{url_prefix}}/popularity/add.json",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},145:function(t,e){},146:function(t,e,n){"use strict";var o=n(16),i=n(26),a=n(41),s=n(27),r=s.sharedInstanceUserModel(),c=n(39),l=n(40),u=n(51),f=n(23),d=(f.sharedInstanceIMModel(),n(22)),h=n(81),p=n(129),m=n(58),g=o.extend({clientRender:!1,el:"#anchorContainerBg",events:{},beforeMount:function(){var t=i.parse(location.href);t.query.roomId||window.history.go(-1),this.roomId=t.query.roomId||1,this.roomInfoPeriod=1e4,this.roomDetail=c.sigleInstance(),this.anchorInfoModel=h.sigleInstance(),this.roomDetailParams={deviceinfo:'{"aid": "30001001"}',access_token:r.getWebToken(),roomId:""},this.roomLongPolling=l.sigleInstance(),this.anchorInfoParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+r.getToken()}},afterMount:function(){this.roomBg=$("#anchorContainerBg")},ready:function(){this.defineEventInterface(),this.flashAPI=m.sharedInstanceFlashAPI({el:"broadCastFlash"}),this.initRoom(),this.renderPage()},defineEventInterface:function(){},renderPage:function(){var t=n(132);new t;var e=n(138);new e;var o=n(141);new o;var i=n(143);new i},initWebIM:function(){function t(t){Backbone.trigger("event:groupSystemNotifys",t)}d.init({onConnNotify:function(t){Backbone.trigger("event:onConnNotify",t)},onMsgNotify:function(t){Backbone.trigger("event:onMsgNotify",t)},onGroupInfoChangeNotify:function(t){Backbone.trigger("event:onGroupInfoChangeNotify",t)},groupSystemNotifys:{1:t,2:t,3:t,4:t,5:t,6:t,7:t,8:t,9:t,10:t,11:t,255:t}})},initRoom:function(){var t=this,e=function(){a.show({title:"提示",content:"获取房间数据失败!",okFn:function(){t.goBack()},cancelFn:function(){t.goBack()}})};this.getRoomInfo(function(n){var o=n.data||{};n&&"0"==n.code?(t.videoUrl={streamName:o.streamName,url:o.url},t.roomInfo=o,Backbone.trigger("event:roomInfoReady",t.roomInfo),t.setRoomBgImg(),t.flashAPI.onReady(function(){this.init(t.roomInfo)})):e()},e)},getUserInfo:function(){var t=this;p.getInfo(function(e){t.userInfo=e,Backbone.trigger("event:currentUserInfoReady",e)})},getRoomInfo:function(t,e){var n=this;n.roomDetailParams.roomId=n.roomId,this.roomDetail.executeJSONP(n.roomDetailParams,function(e){t&&t(e)},function(t){e&&e(t)})},checkRoomStatus:function(t){switch(t){case 0:u.showTip("该直播尚未发布!");break;case 1:break;case 2:break;case 3:}},goBack:function(){window.history.go(-1)},setRoomBgImg:function(){this.roomInfo&&this.roomInfo.imageUrl&&this.roomBg.css("background","url("+this.roomInfo.imageUrl+")")}});t.exports=g}});