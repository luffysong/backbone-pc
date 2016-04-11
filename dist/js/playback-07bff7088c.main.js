/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-4-11   16:45:12
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([5],{0:function(t,e,n){$(function(){"use strict";var t=n(64);new t;var e=n(131);new e,n(130)})},17:function(t,e,n){"use strict";var o=n(18),i=o.sharedInstanceIMModel(),a=n(20),r={setting:{listeners:{onMsgNotify:null,onGroupInfoChangeNotify:null,groupSystemNotifys:null}}};r.init=function(t){var e=this;i.fetchIMUserSig(function(n){e.im=n;var o={sdkAppID:n.imAppid,appIDAt3rd:n.imAppid,accountType:n.imAccountType,identifier:n.imIdentifier,userSig:n.userSig};n&&t&&webim.init(o,t,null)},function(t){})},r.sendMessage=function(t,e,n){var o=webim.MsgStore.sessByTypeId("GROUP",t.groupId),i=Math.floor(1e4*Math.random());if(o||(o=new webim.Session("GROUP",t.groupId,t.groupId,"",i)),o){var a=new webim.Msg(o,!0);a.addText(new webim.Msg.Elem.Text(JSON.stringify(t.msg))),a.fromAccount=this.im.imIdentifier,webim.sendMsg(a,function(t){e&&e(t)},function(t){n&&n(t)})}},r.clearScreen=function(t){this.sendMessage(t)},r.lockScreen=function(){},r.disableSendMsg=function(t,e,n){var o=webim.Tool.formatTimeStamp(Math.round((new Date).getTime()/1e3)+600);o=new Date(o+"").getTime(),t=_.extend({ShutUpTime:o},t),webim.forbidSendMsg(t,function(t){e&&e(t)},function(t){n&&n(t)})},r.removeUserFromGroup=function(t,e,n){(!t||!t.GroupId||t.MemberToDel_Account.length<=0)&&n&&n({msg:"参数不正确"}),webim.deleteGroupMember(t,function(t){e&&e(t)},function(t){n&&n(t)})},r.msgNotify=function(t){},r.getRoomMsgs=function(t){for(var e=[],n=1;;){if(n++>20)break;e.push({name:"Aaron-"+n,msg:"asdfasdfasfjaslfjasklfasdklf"+n})}t&&t.call(this,e)},r.createIMChatRoom=function(t,e){var n=a.get("imSig"),o={Owner_Account:n.imIdentifier,Type:"ChatRoom",Name:"测试聊天室",Notification:"",Introduction:"",MemberList:[]};webim.createGroup(o,function(e){t&&t(e)},function(t){e&&e(t)})},r.applyJoinGroup=function(t,e,n){var o={GroupId:t,ApplyMsg:"直播间",UserDefinedField:""};webim.applyJoinGroup(o,function(t){e&&e(t)},function(t){n&&n(t)})},r.getGroupInfo=function(t,e,n){var o={GroupIdList:[t],GroupBaseInfoFilter:["Type","Name","Introduction","Notification","FaceUrl","CreateTime","Owner_Account","LastInfoTime","LastMsgTime","NextMsgSeq","MemberNum","MaxMemberNum","ApplyJoinOption"],MemberInfoFilter:["Account","Role","JoinTime","LastSendMsgTime","ShutUpUntil"]};webim.getGroupInfo(o,function(t){e&&e(t)},function(t){n&&n(t)})},r.modifyGroupInfo=function(t,e,n){webim.modifyGroupBaseInfo(t,function(t){e&&e(t)},function(t){n&&n(t)})},t.exports=r},34:function(t,e,n){"use strict";var o=n(19),i=null,a=o.extend({url:"{{url_prefix}}/room/detail.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},35:function(t,e,n){"use strict";var o=n(19),i=null,a=o.extend({url:"{{url_prefix}}/room/longpolling.json",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},36:function(t,e,n){var o={},i={title:"消息",content:"",okFn:null,cancelFn:null,okBtn:!0,cancelBtn:!0};o.init=function(t){var e=_.template(this.getHTML()),n=e(t);this.remove(),this.bindEvent(n,t.okFn,t.cancelFn)},o.remove=function(){var t=$("#UIConfigWrap");t&&t.length>=1&&t.remove()},o.getHTML=function(){return n(37)},o.bindEvent=function(t,e,n){var o=this;t=$(t),t.find("#UIConfirmOk").on("click",function(t){return t.preventDefault(),e&&e(),o.remove(),!1}),t.find(".UIConfirmClose").on("click",function(t){return t.preventDefault(),n&&n(),o.remove(),!1}),t.find("#UIConfirmOk").on("click",function(t){return t.preventDefault(),o.remove(),!1}),$("body").append(t)},o.show=function(t){var e=_.extend(i,t);this.init(e)},o.close=function(){this.remove()},t.exports={show:function(t){o.show(t)},close:function(){o.close()}}},37:function(t,e){t.exports='<div id="UIConfigWrap" class="shadow_screen">\n    <div class="shadow"></div>\n    <div class="edit_annmoucement_con" style="margin-bottom: 16px; width: 400px;margin-left:-200px;">\n        <h2 class="edit_title"><span id="UIConfirmTitle"><%=title%></span> <span class="close UIConfirmClose">X</span></h2>\n        <div class="editCon" style="">\n            <div class="content" style="padding:16px; font-size: 14px;"><%=content%></div>\n            <p class="btn-wrap" style="">\n                <a style="display: <%= cancelBtn?\'inline-block\':\'none\'%>;" href="javascript:;" class="cancel UIConfirmClose">取消</a>\n                <a style="display: <%= okBtn?\'inline-block\':\'none\'%>;" id="UIConfirmOk" href="javascript:;" class="submit active">确定</a>\n            </p>\n        </div>\n    </div>\n</div>'},38:function(t,e){"use strict";function n(){}var o=null,i=null;n.prototype.get=function(t,e,n){i&&e&&e(i),$.ajax("http://lapi.yinyuetai.com/gift/list.json",{method:"GET",data:t,dataType:"jsonp",jsonp:"callback"}).done(function(t){e&&e(t),i=t}).fail(function(t){n&&n(t)})},n.prototype.findGift=function(t){var e=i.data;return _.find(e,function(e){return e.giftId==t})},n.sigleInstance=function(){return o||(o=new n),o},t.exports=n},52:function(t,e,n){(function(e){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;t.exports=n()}(function(){var t=function(t){this.temp=new Date,this.setCurNewDate(t)};t.prototype.changeYear=function(t){this.temp.setFullYear(t)},t.prototype.getCountDays=function(t){return this.temp.setMonth(t),this.temp.setDate(0),this.temp.getDate()},t.prototype.$get=function(t){return this.attrs[t]},t.prototype.ceilYear=function(t){t=~~t;for(var e=0,n=this.$get("year"),o=[];t>=e;e++)o.push(n),n+=1;return o},t.prototype._downDisplacement=function(t){var e,n=this.$get(t),o=[];switch(t){case"month":e=12;break;case"day":e=this.getCountDays(this.$get("month"));break;case"hours":e=23;break;default:e=59}for(;e>=n;n++)o.push(n);return o},t.prototype.downMonth=function(){return this._downDisplacement("month")},t.prototype.downDay=function(){return this._downDisplacement("day")},t.prototype.downHours=function(){return this._downDisplacement("hours")},t.prototype.downMinutes=function(){return this._downDisplacement("minutes")},t.prototype.down=function(t){return this._downDisplacement(t)},t.prototype.getTime=function(t){var e="",n=t.month<10?"0"+t.month:t.month,o=t.day<10?"0"+t.day:t.day,i=t.hours<10?"0"+t.hours:t.hours,a=t.minutes<10?"0"+t.minutes:t.minutes;return e+=t.year+"-"+n+"-"+o+" ",e+=i+":"+a+":00",new Date(e.replace(/-/g,"/")).getTime()},t.prototype.setCurNewDate=function(t){this.date=null,this.date=t?new Date(t):new Date,this._setAttrs()},t.prototype._setAttrs=function(){this.attrs=null,this.attrs={year:this.date.getFullYear(),month:this.date.getMonth()+1,day:this.date.getDate(),hours:this.date.getHours(),minutes:this.date.getMinutes()}},t.difference=function(t){var e={};e.day=parseInt(t/864e5);var n=t%864e5,o=Math.floor(n/36e5);e.hours=10>o?"0"+o:o;var i=n%36e5,a=Math.floor(i/6e4);e.minutes=10>a?"0"+a:a;var r=i%6e4,s=Math.floor(r/1e3);return e.seconds=10>s?"0"+s:s,e};var e=null;return t.sharedInstanceDateTime=function(){return e||(e=new t),e},t}),Date.prototype.Format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length)));for(var n in e)new RegExp("("+n+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[n]:("00"+e[n]).substr((""+e[n]).length)));return t}}).call(e,function(){return this}())},53:function(t,e,n){(function(e){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;t.exports=n()}(function(){var t='<object width="{width}" height="{height}"  align="middle" id="{id}" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="{src}" name="movie"><param value="{always}" name="allowscriptaccess"><param value="{fullscreen}" name="allowfullscreen"><param value="{quality}" name="quality"><param value="{flashvars}" name="flashvars"><param value="{wmode}" name="wmode" /><embed width="{width}" height="{height}"  name="{id}" type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}" allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" /></object>',e=window,n=e.location.origin,o=(-1!=e.navigator.appName.indexOf("Microsoft"),999);e.YYTPCFlashReadyState=!1;var i=function(t){var e,n,o=document.getElementById(t)||null;return o&&"OBJECT"==o.nodeName.toUpperCase()&&("undefined"!=typeof o.SetVariable?e=o:(n=o.getElementsByTagName("embed")[0],n&&(e=n))),e},a=function(t,e){return e?t.replace(/\{(.*?)\}/gi,function(){return e[arguments[1]]||""}):t},r=function(e){this.$el="string"==typeof e.el?document.getElementById(e.el):e.el,this._options=e,this._props=e.props||{},this.$attrs={id:"YYTFlash"+o++,src:this._props.src||n+"/flash/RTMPInplayer.swf?t=20160407.6",width:this._props.width||895,height:this._props.height||502,wmode:this._props.wmode||"transparent",flashvar:this._props.flashvar||"",always:this._props.always||"always",fullscreen:this._props.fullscreen||!0,quality:this._props.quality||"high"},this._html=a(t,this.$attrs),this._methods=e.methods||{},this._ready=!1,this._init()};r.prototype._init=function(){this.$el.innerHTML=this._html,this.$swf=i(this.$attrs.id)},r.prototype.onReady=function(t){var n=this;e.YYTPCFlashReadyState||this._ready?t.call(this):this.$timer=setInterval(function(){e.YYTPCFlashReadyState&&(n._ready=!0,e.YYTPCFlashReadyState=!1,clearInterval(n.$timer),n.$timer=null,t.call(n))},0)},r.prototype.init=function(t){this.$swf.initData(t)},r.prototype.isReady=function(){return this._ready},r.prototype.addUrl=function(t,e){this.$swf.setvedioUrl(t,e)},r.prototype.width=function(t){"string"==typeof t&&(t=~~t),this.$swf.setPlayerWidth(t)},r.prototype.height=function(t){"string"==typeof t&&(t=~~t),this.$swf.setPlayerHeight(t)},r.prototype.notifying=function(t){this.$swf.setOneMessageInchat(JSON.stringify(t))},r.prototype.clear=function(){this.$swf.clearAllMessage()};var s=null;return r.sharedInstanceFlashAPI=function(t){return s||(s=new r(t)),s},e.YYTPCFlashOnReady=function(){e.YYTPCFlashReadyState=!0},r})}).call(e,function(){return this}())},58:function(t,e,n){"use strict";var o=n(19),i=o.extend({url:"{{url_prefix}}/room/placard_get.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(t){}});t.exports=i},110:function(t,e,n){"use strict";var o=n(19),i=null,a=o.extend({url:"{{url_prefix}}/user/info.json",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},116:function(t,e,n){function o(){}var i,a=n(110),r=n(20),s=(n(52),n(22)),c=s.sharedInstanceUserModel(),l=null;o.prototype.getInfo=function(t,e){this.anchorInfoModel=a.sigleInstance(),this.anchorInfoParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+c.getToken()},this.anchorInfoModel.executeJSONP(this.anchorInfoParams,function(e){e&&"SUCCESS"===e.msg&&(t&&t(e.data),i=e.data)},function(t){e&&e(t)})},l=new o,t.exports={getInfo:function(t,e){l.getInfo(t,e)},isDisbaleTalk:function(){var t=r.get("userDisableTalkTime");if(!t)return!1;t=new Date(t);var e=new Date,n=e.getTime()-t.getTime();return 0>=n},isKickout:function(t){var e=r.get("userKickout");if(!e)return!1;e=JSON.parse(e);var n=_.find(e,function(e){return e.roomId==t});return!!n&&n.isKickout},setDisableTalk:function(t){t&&r.set("userDisableTalkTime",t)},setKickout:function(t,e){var n=r.get("userKickout");n=n?JSON.parse(n):[];var o=_.find(n,function(e){return e.roomId==t});o?o.isKickout=e:n.push({roomId:t,isKickout:e}),r.set("userKickout",JSON.stringify(n))},setLockScreen:function(t,e){var n=r.get("isLockScreen");n=n?JSON.parse(n):[];var o=_.find(n,function(e){return e.roomId==t});o?o.isLock=e:n.push({roomId:t,isLock:e}),r.set("isLockScreen",JSON.stringify(n))},isLockScreen:function(t){var e=r.get("isLockScreen");if(!e)return!1;e=JSON.parse(e);var n=_.find(e,function(e){return e.roomId==t});return!!n&&n.isLock}}},118:function(t,e,n){"use strict";var o=n(11),i=o.extend({el:"#edit_background",rawLoader:function(){return n(119)},events:{},beforeMount:function(){this.elements={}},afterMount:function(){var t=this.$el;this.elements.roomName=t.find(".room-name"),this.elements={roomName:t.find(".room-name"),onLine:t.find("#onlineCount"),popularity:t.find("#popularityCount")}},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&t.bindData(e)}),Backbone.on("event:updateRoomInfo",function(e){e&&(t.elements.onLine.text(e.currentOnline||0),t.elements.popularity.text(e.popularity||0))})},bindData:function(t){var e=this.elements;e.roomName.text(t.roomName||""),e.onLine.text(t.online||0),e.popularity.text(t.popularity||0)}});t.exports=i},119:function(t,e){t.exports='<div class="room-name fl">xx</div>\n<div class="room-title-right fr">\n  <span class="online">在线人数:<span class="red count font-yahei" id="onlineCount">0</span></span>\n  <span class="popularity">人气:<span class="green count font-yahei" id="popularityCount">0</span></span>\n  <!--<button class="btn Hand btn-support boderRadAll_3"><i></i> 顶一下</button>-->\n</div>\n\n'},124:function(t,e,n){"use strict";var o=n(11),i=n(58),a=n(22),r=a.sharedInstanceUserModel(),s=o.extend({el:"#userInfoWrap",rawLoader:function(){return n(125)},events:{},beforeMount:function(){this.elements={}},afterMount:function(){var t=this.$el;this.noticeGetModel=new i,this.tagTpl=this.$el.find("#tagTpl").html(),this.elements={anchorAvatar:t.find("#anchorAvatar"),name:t.find("#anchorName"),btnAdd:t.find("#btnAdd"),btnReport:t.find("#btnReport"),tagsWrap:t.find("#tagsWrap"),noticeWrap:t.find("#noticWrap")},this.noticeGetParams={deviceinfo:'{"aid":"30001001"}',roomId:"",access_token:"web-"+r.getToken()}},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(t.roomInfo=e,t.bindData(e),t.getNoticeInfo())}),Backbone.on("event:updateRoomInfo",function(t){}),Backbone.on("event:updateRoomNotice",function(e){e&&t.elements.noticeWrap.text(e.content||"暂无公告")})},bindData:function(t){var e=this.elements;e.anchorAvatar.attr("src",t.creator.largeAvatar),e.name.text(t.creator.nickName);var n=_.template(this.tagTpl);e.tagsWrap.html(n(t.creator))},getNoticeInfo:function(){var t=this;this.noticeGetParams.roomId=this.roomInfo.id,this.noticeGetModel.executeJSONP(this.noticeGetParams,function(e){if(e&&e.data){var n=null;e.data.placards&&(n=e.data.placards[0]),n?t.elements.noticeWrap.text(n.content||"暂无公告"):t.elements.noticeWrap.text("暂无公告")}},function(t){msgBox.showError(t.msg||"获取公告失败")})}});t.exports=s},125:function(t,e){t.exports='<div class="user-info-wrap clearfix">\n    <img id="anchorAvatar" class="Left avator boderRadAll_35"\n         src="http://img1.yytcdn.com/user/avatar/160322/703-1458640483613/-M-216abfaf3d4ae2ee4d194029b70cdc9d_100x100.jpg"\n         alt="">\n    <div class="info Left">\n        <div id="anchorName" class="name overflow_ellipsis">撒旦法是否是是法撒旦法</div>\n        <div class="btn-wrap mTop10">\n            <!--<button class="btn Hand " id="btnAdd"><i class="add Left"></i> 加关注</button>-->\n            <!--<button class="btn Hand mLeft5" id="btnReport"><i class="Left report"></i> 举报</button>-->\n            <div class="Clear"></div>\n        </div>\n    </div>\n</div>\n<div class="tags mTop10">\n    <div class="gary1 Left">标签:</div>\n    <div class="Right" id="tagsWrap">\n        <script type="text/template" id="tagTpl">\n            <%\n                for(var i=0,l=tags.length; i < l; i++) {\n            %>\n            <span class="item"><%=tags[i]%></span>\n            <%\n            }\n            %>\n        </script>\n    </div>\n    <div class="Clear"></div>\n</div>\n<div class="room-notice mTop10 boderRadAll_5">\n    <i class="trumpet mLeft5 Left"></i>\n    <div id="noticWrap" class="gary2 WordBreak notice mLeft30"></div>\n    <div class="Clear"></div>\n</div>\n'},126:function(t,e,n){"use strict";var o=n(11),i=n(127),a=n(22),r=a.sharedInstanceUserModel(),s=o.extend({clientRender:!1,el:"#anchorPlayedList",events:{},beforeMount:function(){},afterMount:function(){var t=this.$el;this.anchorPlayedTpl=t.find("#anchorPlayedTpl").html(),this.playedList=t.find("#playedListWrap"),this.playedListModel=i.sigleInstance(),this.playedListParams={deviceinfo:'{"aid":"30001001"}',access_token:"web-"+r.getToken(),anchor:"",order:"time",offset:0,size:3}},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(t.roomInfo=e,t.bindData(e.creator.uid))})},initCarousel:function(){var t=$("#palyedJcarousel"),e=t.find(".jcarousel");e.on("jcarousel:reload jcarousel:create",function(){var t=$(this),e=t.innerWidth();e>=600?e/=3:e>=350&&(e/=2),t.jcarousel("items").css("width",Math.ceil(e)+"px")}).jcarousel({wrap:"circular"}),t.find(".jcarousel-control-prev").jcarouselControl({target:"-=1"}),t.find(".jcarousel-control-next").jcarouselControl({target:"+=1"})},bindData:function(t){var e=this;this.playedListParams.anchor=t,this.playedListModel.executeJSONP(this.playedListParams,function(t){if(t&&"SUCCESS"===t.msg&&t.data.totalCount>0){var n=_.template(e.anchorPlayedTpl);e.playedList.html(n(t.data)),e.initCarousel()}else e.hideListWrap()},function(t){e.hideListWrap()})},hideListWrap:function(){this.$el.hide()}});t.exports=s},127:function(t,e,n){"use strict";var o=n(19),i=null,a=o.extend({url:"{{url_prefix}}/room/anchor_end_list.json",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},128:function(t,e,n){"use strict";var o=n(11),i=n(22),a=i.sharedInstanceUserModel(),r=n(36),s=n(38),c=n(129),l=n(46),u=n(116),f=o.extend({clientRender:!1,el:"#giftwarp",events:{"click #gift-items":"giftClick","click #btnTop":"topClick","click #btnLike":"lickClick","click #btnShare":"shareClick"},beforeMount:function(){this.giftTpl=$("#gift-item-tpl").html(),this.giftParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+a.getToken(),offset:0,size:9e4,type:0},this.giftModel=s.sigleInstance(),this.popularityModel=c.sigleInstance(),this.popularityParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+a.getToken(),type:1,roomId:0},this.isNeedPopup=!0,this.elements={}},afterMount:function(){var t=this.$el;this.elements={giftItems:t.find("#gift-items"),txtLikeCount:t.find("#txtLikeCount")}},ready:function(){this.defineEventInterface(),this.initGiftList(),this.initCarousel()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(t.roomInfo=e,t.elements.txtLikeCount.text(e.assemble||0))}),Backbone.on("event:currentUserInfoReady",function(e){e&&(t.currentUserInfo=e)}),Backbone.on("event:updateRoomInfo",function(e){e&&t.elements.txtLikeCount.text(e.likeCount||0)})},initCarousel:function(){var t=$("#giftwarp"),e=t.find(".jcarousel");e.on("jcarousel:reload jcarousel:create",function(){var t=$(this),e=t.innerWidth();e>=600?e/=5:e>=350&&(e/=5),t.jcarousel("items").css("width",Math.ceil(e)+"px")}).jcarousel({wrap:"circular"}),t.find(".jcarousel-control-prev").jcarouselControl({target:"-=1"}),t.find(".jcarousel-control-next").jcarouselControl({target:"+=1"})},initGiftList:function(){var t=this;this.giftModel.get(this.giftParams,function(e){if(e&&"0"==e.code&&t.giftTpl){var n=_.template(t.giftTpl);t.elements.giftItems.html(n(e||[])),t.initCarousel()}},function(t){})},roomStatusCheck:function(){return this.roomInfo&&2==this.roomInfo.status?!0:(l.showTip("该直播不在直播中,无法进行互动"),!1)},giftClick:function(t){var e=t.target;this.roomStatusCheck()&&(e="LI"!=t.target.nodeName?$(t.target).parent():$(t.target),this.sendGift({name:e.data("name"),giftId:e.data("giftid")}))},sendGift:function(t){u.isDisbaleTalk()?l.showTip("您已经被禁言,不能发弹幕哦"):u.isLockScreen(this.roomInfo.id)?l.showTip("主播锁屏中,不能发弹幕哦"):Backbone.trigger("event:visitorSendGift",{mstType:1,giftId:t.giftId,giftNum:1})},topClick:function(){var t=this;if(this.roomStatusCheck()){if(!this.isNeedPopup)return void t.pushPopularity(2);var e='<div>使用 <span class="green">20</span>积分支持一下MC,当前共有<span class="green">'+(this.currentUserInfo.totalMarks||0)+'</span>积分</div></br><div style="text-align:right; color:#999;"> <label><input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';r.show({title:"顶一下",content:e,okFn:function(){t.pushPopularity(2);var e=$("#popupCheckBox");e.is(":checked")?t.isNeedPopup=!1:t.isNeedPopup=!0}})}},pushPopularity:function(t){var e=this;this.roomStatusCheck()&&(this.popularityParams.type=t,this.popularityParams.roomId=this.roomInfo.id,this.popularityModel.executeJSONP(this.popularityParams,function(n){n&&n.data&&"SUCCESS"===n.msg&&1==t?(Backbone.trigger("event:pleaseUpdateRoomInfo"),e.getUserInfo()):n&&n.data.success&&2==t?(l.showOK("非常感谢您的大力支持"),Backbone.trigger("event:pleaseUpdateRoomInfo"),e.getUserInfo()):l.showTip(n.data.message||"操作失败请您稍后重试")},function(t){l.showTip("操作失败请您稍后重试")}))},getUserInfo:function(){u.getInfo(function(t){Backbone.trigger("event:currentUserInfoReady",t)})},lickClick:function(){var t=this;this.roomStatusCheck()&&(this.isClicked||(this.isClicked=!0,Backbone.trigger("event:visitorInteractive",{nickName:a.$get("userName"),smallAvatar:a.$get("bigheadImg"),roomId:t.roomInfo.id||"",mstType:3}),t.pushPopularity(1),setTimeout(function(){t.isClicked=!1},5e3)))},shareClick:function(){var t=this.roomInfo.roomName+",快来围观吧",e=window.location.href,n=this.roomInfo.posterPic,o='<span class="share-wrap"><a href="http://i.yinyuetai.com/share?title='+t+"&amp;url="+e+"&amp;cover="+n+'?t=20160405161857" title="分享到音悦台我的家" class="myhome J_sharelink"></a> <a href="http://v.t.sina.com.cn/share/share.php?appkey=2817290261&amp;url='+e+"&amp;title="+t+"&amp;content=gb2312&amp;pic="+n+'?t=20160405161857&amp;ralateUid=1698229264" title="分享到新浪微博" class="weibo17 J_sharelink"></a><a href="http://connect.qq.com/widget/shareqq/index.html?url='+e+"&amp;showcount=1&amp;desc="+t+"&amp;title="+t+"&amp;site=饭趴&amp;pics="+n+'?t=20160405161857&amp;style=201&amp;width=39&amp;height=39" title="分享到QQ" class="qq17 J_sharelink"></a><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+e+"&amp;desc="+t+'" title="分享到QQ空间" class="qzone17 J_sharelink"></a><a href="http://v.yinyuetai.com/share/weixin?title='+t+"&amp;url="+e+'" title="分享到微信"  class="weixin17 J_sharelink"></a><a href="http://widget.renren.com/dialog/share?resourceUrl='+e+"?t=20160405161857&amp;charset=UTF-8&amp;message="+t+'" title="分享到人人网" class="renren17 J_sharelink"></a><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&amp;url='+e+"&amp;desc="+t+'" title="分享到腾讯朋友" class="pengyou17 J_sharelink"></a><a href="http://v.t.qq.com/share/share.php?title='+t+"&amp;url="+e+"&amp;pic="+n+'?t=20160405161857" title="分享到腾讯微博" data-video-id="2539803" class="tencent17 J_sharelink"></a><a href="http://huaban.com/bookmarklet?url='+e+"&amp;video=&amp;title="+t+"&amp;media="+n+"?t=20160405161857&amp;description="+t+'" title="分享到花瓣网" class="huaban17 J_sharelink"></a><a href="http://t.sohu.com/third/post.jsp?&amp;url='+e+"&amp;title="+t+'&amp;content=utf-8" title="分享到搜狐微博" class="sohu17 J_sharelink"></a><a href="http://fql.cc/yytafx?appkey=2817290261&amp;url='+e+"&amp;title="+t+'" title="分享到联通飞影" class="unicon17 J_sharelink"></a> </span>';r.show({title:"分享",content:o,okBtn:!1,cancelBtn:!1,okFn:function(){}}),$(".share-wrap a").on("click",function(){var t=$(this).attr("href");return window.open(t,"newwindow","height=750px,width=700px,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no"),r.close(),!1})}});t.exports=f},129:function(t,e,n){"use strict";var o=n(19),i=null,a=o.extend({url:"{{url_prefix}}/popularity/add.json",beforeEmit:function(t){}});a.sigleInstance=function(){return i||(i=new a),i},t.exports=a},130:function(t,e){},131:function(t,e,n){"use strict";var o=n(11),i=n(21),a=n(36),r=n(22),s=r.sharedInstanceUserModel(),c=n(34),l=n(35),u=n(46),f=n(18),d=f.sharedInstanceIMModel(),p=n(17),h=n(110),m=n(116),g=n(53),v=o.extend({clientRender:!1,el:"#anchorContainerBg",events:{},beforeMount:function(){var t=i.parse(location.href);t.query.roomId||window.history.go(-1),this.roomId=t.query.roomId||1,this.roomInfoPeriod=1e4,this.roomDetail=c.sigleInstance(),this.anchorInfoModel=h.sigleInstance(),this.roomDetailParams={deviceinfo:'{"aid": "30001001"}',access_token:s.getWebToken(),roomId:""},this.roomLongPolling=l.sigleInstance(),this.anchorInfoParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+s.getToken()}},afterMount:function(){},ready:function(){this.defineEventInterface(),this.flashAPI=g.sharedInstanceFlashAPI({el:"broadCastFlash"}),this.initRoom(),this.renderPage()},defineEventInterface:function(){},fetchUserIMSig:function(t){var e=this;d.fetchIMUserSig(function(n){e.userIMSig=n,e.initWebIM();var o=function(){window.history.go(-1)};p.applyJoinGroup(t,function(t){Backbone.trigger("event:roomInfoReady",e.roomInfo),2==e.roomInfo.status&&e.loopRoomInfo()},function(t){10013==t.ErrorCode?Backbone.trigger("event:roomInfoReady",e.roomInfo):a.show({title:"进入房间",content:"进入房间失败,请稍后重试",cancelFn:o,okFn:o})})})},renderPage:function(){var t=n(118);new t;var e=n(124);new e;var o=n(126);new o;var i=n(128);new i},initWebIM:function(){function t(t){Backbone.trigger("event:groupSystemNotifys",t)}p.init({onConnNotify:function(t){Backbone.trigger("event:onConnNotify",t)},onMsgNotify:function(t){Backbone.trigger("event:onMsgNotify",t)},onGroupInfoChangeNotify:function(t){Backbone.trigger("event:onGroupInfoChangeNotify",t)},groupSystemNotifys:{1:t,2:t,3:t,4:t,5:t,6:t,7:t,8:t,9:t,10:t,11:t,255:t}})},initRoom:function(){var t=this,e=function(){a.show({title:"提示",content:"获取房间数据失败!",okFn:function(){t.goBack()},cancelFn:function(){t.goBack()}})};this.getRoomInfo(function(n){var o=n.data||{};n&&"0"==n.code?(t.videoUrl={streamName:o.streamName,url:o.url},t.roomInfo=o,Backbone.trigger("event:roomInfoReady",t.roomInfo),t.flashAPI.onReady(function(){this.init(t.roomInfo)})):e()},e)},getUserInfo:function(){var t=this;m.getInfo(function(e){t.userInfo=e,Backbone.trigger("event:currentUserInfoReady",e)})},getRoomInfo:function(t,e){var n=this;n.roomDetailParams.roomId=n.roomId,this.roomDetail.executeJSONP(n.roomDetailParams,function(e){t&&t(e)},function(t){e&&e(t)})},checkRoomStatus:function(t){switch(t){case 0:u.showTip("该直播尚未发布!");break;case 1:break;case 2:break;case 3:}},checkUserIsKickout:function(t){var e=this,n=null;try{n=_.isString(t)?JSON.parse(t):t}catch(o){}if(n){var i=_.find(n.forbidUsers,function(t){return t.replace("$0","")==e.userIMSig.userId});i&&(m.setKickout(e.roomId,!0),a.show({title:"禁止进入",content:"您已经被主播踢出房间,肿么又回来了!",okFn:function(){e.goBack()},cancelFn:function(){e.goBack()}}))}},goBack:function(){window.history.go(-1)},loopRoomInfo:function(){var t=this;t.roomInfoTimeId=setTimeout(function(){t.roomDetailParams.roomId=t.roomId,t.getRoomLoopInfo(function(e){var n=e.data;Backbone.trigger("event:updateRoomInfo",n),t.loopRoomInfo()})},t.roomInfoPeriod)},getRoomLoopInfo:function(t,e){var n=this;n.roomDetailParams.roomId=n.roomId,this.roomLongPolling.executeJSONP(n.roomDetailParams,function(e){t&&t(e)},function(t){e&&e(t)})}});t.exports=v}});