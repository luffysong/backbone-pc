webpackJsonp([0],[function(e,t,n){$(function(){var e=n(9);new e;var t=n(61);new t,n(65)})},,,,,,,,,function(e,t,n){"use strict";var o=n(10),i=n(16),r=n(21),s=r.sharedInstanceUserModel(),a=n(33),c=n(20),l=n(34),d=n(19),u=o.extend({clientRender:!1,el:"#anchorContainerBg",events:{},beforeMount:function(){var e=c.parse(location.href);this.roomId=e.query.roomId||1,this.roomId||this.goBack(),this.roomDetail=new a},afterMount:function(){},ready:function(){this.userVerify()},initWebIM:function(){function e(e){$(document).trigger("event:groupSystemNotifys",e)}i.init({onConnNotify:function(e){$(document).trigger("event:onConnNotify",e)},onMsgNotify:function(e){$(document).trigger("event:onMsgNotify",e)},onGroupInfoChangeNotify:function(e){$(document).trigger("event:onGroupInfoChangeNotify",e)},groupSystemNotifys:{1:e,2:e,3:e,4:e,5:e,6:e,7:e,8:e,9:e,10:e,11:e,255:e}})},userVerify:function(){var e=this;s.isLogined()?(e.initWebIM(),e.roomDetail.setChangeURL({deviceinfo:'{"aid": "30001001"}',accessToken:s.getToken(),roomId:this.roomId}),e.initRoom()):(d.remove("imSig"),d.set("signout",1),window.location.href="/web/login.html")},initRoom:function(){var e=this;this.roomDetail.executeGET(function(t){var n=t.data;e.videoUrl={streamName:n.streamName,url:n.url},e.renderPage(),$(document).trigger("event:roomInfoReady",n)},function(t){l.show({title:"提示",content:"获取房间数据失败!",okFn:function(){e.goBack()},cancelFn:function(){e.goBack()}})})},renderPage:function(){var e=n(37);new e;var t=n(45);new t;var o=n(48);new o;var i=n(53);new i;var r=n(57);new r},goBack:function(){}});e.exports=u},,,,,,,function(e,t,n){"use strict";var o=n(17),i=o.sharedInstanceIMModel(),r=n(19),s={setting:{listeners:{onMsgNotify:null,onGroupInfoChangeNotify:null,groupSystemNotifys:null}}};s.init=function(e){var t=this;i.fetchIMUserSig(function(n){t.im=n;var o={sdkAppID:n.imAppid,appIDAt3rd:n.imAppid,accountType:n.imAccountType,identifier:n.imIdentifier,userSig:n.userSig};n&&e&&webim.init(o,e,null)},function(e){})},s.sendMessage=function(e,t,n){var o=Math.floor(1e4*Math.random()),i=new webim.Session("GROUP",e.groupId,e.groupId,"",o);if(i){var r=new webim.Msg(i,!0);r.addText(new webim.Msg.Elem.Text(JSON.stringify(e.msg))),r.fromAccount=this.im.imIdentifier,webim.sendMsg(r,function(e){t&&t(e)},function(e){n&&n(e)})}},s.clearScreen=function(e){this.sendMessage(e)},s.lockScreen=function(){},s.disableSendMsg=function(e,t,n){var o=webim.Tool.formatTimeStamp(Math.round((new Date).getTime()/1e3)+600);o=new Date(o+"").getTime(),e=_.extend({ShutUpTime:o},e),webim.forbidSendMsg(e,function(e){t&&t(e)},function(e){n&&n(e)})},s.removeUserFromGroup=function(e,t,n){(!e||!e.GroupId||e.MemberToDel_Account.length<=0)&&n&&n({msg:"参数不正确"}),webim.deleteGroupMember(e,function(e){t&&t(e)},function(e){n&&n(e)})},s.msgNotify=function(e){},s.getRoomMsgs=function(e){for(var t=[],n=1;;){if(n++>20)break;t.push({name:"Aaron-"+n,msg:"asdfasdfasfjaslfjasklfasdklf"+n})}e&&e.call(this,t)},s.createIMChatRoom=function(e,t){var n=r.get("imSig"),o={Owner_Account:n.imIdentifier,Type:"ChatRoom",Name:"测试聊天室",Notification:"",Introduction:"",MemberList:[]};webim.createGroup(o,function(t){e&&e(t)},function(e){t&&t(e)})},s.getGroupInfo=function(e,t,n){var o={GroupIdList:[e],GroupBaseInfoFilter:["Type","Name","Introduction","Notification","FaceUrl","CreateTime","Owner_Account","LastInfoTime","LastMsgTime","NextMsgSeq","MemberNum","MaxMemberNum","ApplyJoinOption"],MemberInfoFilter:["Account","Role","JoinTime","LastSendMsgTime","ShutUpUntil"]};webim.getGroupInfo(o,function(e){t&&t(e)},function(e){alert(e.ErrorInfo),n&&n(e)})},s.modifyGroupInfo=function(e,t,n){webim.modifyGroupBaseInfo(e,function(e){t&&t(e)},function(e){n&&n(e)})},e.exports=s},,,,,,,,,,,,,,,,,function(e,t,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/detail.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(e){}});e.exports=i},function(e,t,n){var o={},i={title:"消息",content:"",okFn:null,cancelFn:null};o.init=function(e){var t=_.template(this.getHTML()),n=t(e);this.remove(),this.bindEvent(n,e.okFn,e.cancelFn)},o.remove=function(){var e=$("#UIConfigWrap");e&&e.length>=1&&e.remove()},o.getHTML=function(){return n(35)},o.bindEvent=function(e,t,n){var o=this;e=$(e),e.find("#UIConfirmOk").on("click",function(e){return e.preventDefault(),t&&t(),o.remove(),!1}),e.find(".UIConfirmClose").on("click",function(e){return e.preventDefault(),n&&n(),o.remove(),!1}),e.find("#UIConfirmOk").on("click",function(e){return e.preventDefault(),o.remove(),!1}),$("body").append(e)},o.show=function(e){var t=_.extend(i,e);this.init(t)},o.close=function(){this.remove()},e.exports={show:function(e){o.show(e)},close:function(){o.close()}}},function(e,t){e.exports='<div id="UIConfigWrap" class="shadow_screen">\r\n    <div class="shadow UIConfirmClose"></div>\r\n    <div class="edit_annmoucement_con" style="margin-bottom: 16px; width: 400px;height: 200px;margin-left:-200px;">\r\n        <h2 class="edit_title"><span id="UIConfirmTitle"><%=title%></span> <span class="close UIConfirmClose">X</span></h2>\r\n        <div class="editCon" style="width: 400px;padding-top: inherit;">\r\n            <div style="padding:16px; font-size: 14px;"><%=content%></div>\r\n            <p style="padding-top: 16px;">\r\n                <a href="####" class="cancel UIConfirmClose">取消</a>\r\n                <a id="UIConfirmOk" href="####" class="submit">确定</a>\r\n            </p>\r\n        </div>\r\n    </div>\r\n</div>'},function(e,t,n){(function(t){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof t&&t.global==t&&t;e.exports=n()}(function(){var e='<object width="{width}" height="{height}"  align="middle" id="{id}" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="{src}" name="movie"><param value="{always}" name="allowscriptaccess"><param value="{fullscreen}" name="allowfullscreen"><param value="{quality}" name="quality"><param value="{flashvars}" name="flashvars"><param value="{wmode}" name="wmode" /><embed width="{width}" height="{height}"  name="{id}" type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}" allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" /></object>',t=window,n=t.location.origin,o=(-1!=t.navigator.appName.indexOf("Microsoft"),999);t.YYTPCFlashReadyState=!1;var i=function(e){var t,n,o=document.getElementById(e)||null;return o&&"OBJECT"==o.nodeName.toUpperCase()&&("undefined"!=typeof o.SetVariable?t=o:(n=o.getElementsByTagName("embed")[0],n&&(t=n))),t},r=function(e,t){return t?e.replace(/\{(.*?)\}/gi,function(){return t[arguments[1]]||""}):e},s=function(t){this.$el="string"==typeof t.el?document.getElementById(t.el):t.el,this._options=t,this._props=t.props||{},this.$attrs={id:"YYTFlash"+o++,src:this._props.src||n+"/flash/Inplayer.swf?t=20160220",width:this._props.width||895,height:this._props.height||502,wmode:this._props.wmode||"transparent",flashvar:this._props.flashvar||"",always:this._props.always||"always",fullscreen:this._props.fullscreen||!0,quality:this._props.quality||"high"},this._html=r(e,this.$attrs),this._methods=t.methods||{},this._ready=!1,this._init()};s.prototype._init=function(){this.$el.innerHTML=this._html,this.$swf=i(this.$attrs.id)},s.prototype.onReady=function(e){var n=this;t.YYTPCFlashReadyState||this._ready?e.call(this):this.$timer=setInterval(function(){t.YYTPCFlashReadyState&&(n._ready=!0,t.YYTPCFlashReadyState=!1,clearInterval(n.$timer),n.$timer=null,e.call(n))},0)},s.prototype.isReady=function(){return this._ready},s.prototype.addUrl=function(e,t){this.$swf.setvedioUrl(e,t)},s.prototype.width=function(e){"string"==typeof e&&(e=~~e),this.$swf.setPlayerWidth(e)},s.prototype.height=function(e){"string"==typeof e&&(e=~~e),this.$swf.setPlayerHeight(e)},s.prototype.notifying=function(e){this.$swf.setOneMessageInchat(JSON.stringify(e))},s.prototype.clear=function(){this.$swf.clearAllMessage()};var a=null;return s.sharedInstanceFlashAPI=function(e){return a||(a=new s(e)),a},t.YYTPCFlashOnReady=function(){t.YYTPCFlashReadyState=!0},s})}).call(t,function(){return this}())},function(e,t,n){var o=n(10),i=n(38),r=n(39),s=n(43),a=n(21),c=a.sharedInstanceUserModel(),l=o.extend({el:"#edit_background",rawLoader:function(){return n(44)},events:{"click .edit_bg_btn":"showFileUploadDialog"},beforeMount:function(){this.editBgModel=new i,this.uploadFile=new r(this.getFileUploadOptions())},afterMount:function(){this.changeBgBtn=$(".edit_bg_btn"),this.txtPopularity=$("#txtPopularity"),this.txtRoomName=$("#txtRoomName"),this.anchorContainerBg=$("#anchorContainerBg")},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var e=this;$(document).on("event:roomInfoReady",function(t,n){n&&(e.roomInfo=n,e.txtRoomName.text(n.roomName||""),e.txtPopularity.text(n.popularity||0),e.roomInfo.imageUrl&&e.setBgStyle(e.roomInfo.imageUrl))})},getFileUploadOptions:function(){var e=this;return{width:580,height:341,isRemoveAfterHide:!1,isAutoShow:!1,mainClass:"shadow_screen_x",closeClass:"editor_bg_close_x",closeText:"X",title:"上传主题背景图片",ctrlData:{cmd:[{saveOriginal:1,op:"save",plan:"avatar",belongId:"20634338",srcImg:"img"}],redirect:window.location.origin+"/web/upload.html"},uploadFileSuccess:function(t){t&&t.images&&t.images.length>0&&(e.currentBgImg=t.images[0].path)},saveFile:function(){e.setBackgroundImg()}}},showFileUploadDialog:function(){var e=null;this.roomInfo.imageUrl&&(e={inputText:"编辑图片",breviaryUrl:this.roomInfo.imageUrl}),this.currentBgImg="",this.uploadFile.show(e)},setBackgroundImg:function(){var e=this;return e.currentBgImg?(e.editBgModel.setChangeURL({accessToken:c.getToken(),deviceinfo:'{"aid": "30001001"}',roomId:this.roomInfo.id,imageUrl:e.currentBgImg}),void e.editBgModel.executeGET(function(t){t&&"0"===t.code?(e.setBgStyle(e.currentBgImg),e.uploadFile.hide(),s.showOK("背景图片设置成功")):s.showOK("背景图片设置失败,稍后重试")},function(e){s.showOK("背景图片设置失败,稍后重试")})):void s.showTip("请耐心等待图片上传完成!")},setBgStyle:function(e){e&&this.anchorContainerBg.css("background","url("+e+")")}});e.exports=l},function(e,t,n){var o=n(18),i=o.extend({url:'{{url_prefix}}/room/bg_set.json?deviceinfo={"aid":"30001001"}&access_token=web-{{accessToken}}&roomId={{roomId}}&imageUrl={{imageUrl}}',beforeEmit:function(e){}});e.exports=i},function(e,t,n){"use strict";var o=n(40),i=n(22),r=n(41),s=function(e){var t=this;this.options=e,this.dialog=i.classInstanceDialog(o,e),this.helper=new r({ctrlData:this.options.ctrlData,id:"#"+this.dialog.id}),this.helper.on("uploadFileSuccess",function(e){"function"==typeof t.options.uploadFileSuccess&&t.options.uploadFileSuccess(e)}),this.helper.on("saveFile",function(){"function"==typeof t.options.saveFile&&t.options.saveFile()})};s.prototype.show=function(e){this.helper&&e&&this.helper.trigger("successBreviary",e),this.dialog.show()},s.prototype.hide=function(){this.dialog.hide()},s.prototype.emptyValue=function(){this.helper&&this.helper.emptyValue()};var a=null;s.sharedInstanceUploadFileDialog=function(e){return a||(a=new s(e)),a},e.exports=s},function(e,t){e.exports='<div class="shadow"></div>\r\n<div class="edit_Bg_form_x" id="uploadFileDialog">\r\n	<h2 class="edit_title">\r\n		<span class="upload-title">背景图设置</span>\r\n		<span class="upload-status upload-image-state"></span>\r\n	</h2>\r\n	<div class="formCon clearfix">\r\n		<div class="imgBox fl">\r\n			<img src="" alt="" width="100%" height="100%"  style="display: none;" class="imgboxFile">\r\n		</div>\r\n		<div class="formBox fl">\r\n			<div class="pseudo-uploadBtn">\r\n				<span class="input-text">上传图片</span>\r\n				<form class="upload-form">\r\n\r\n				</form>\r\n			</div>\r\n			<p>支持5M以内的gif、jpg、jpge、png图片上传</p>\r\n			<div class="submit">保存</div>\r\n		</div>\r\n	</div>\r\n</div>\r\n'},function(e,t,n){"use strict";var o=n(10),i=n(42),r="正在上传",s="上传完成!",a=n(43),c=window.location,l=o.extend({rawLoader:function(){},events:{"click .submit":"saveHandler","change .upload-file":"changeFile"},beforeMount:function(){},afterMount:function(){this.formDOM=this.$el.find(".upload-form"),this.imgSrcDOM=this.$el.find(".imgboxFile"),this.imageStateDOM=this.$el.find(".upload-image-state"),this.inputTextDOM=this.$el.find(".input-text")},ready:function(e){var t=e.ctrlData||{cmd:[{saveOriginal:1,op:"save",plan:"avatar",belongId:"20634338",srcImg:"img"}],redirect:c.origin+"/web/upload.html"},n=this;this.upload=i.classInstanceUploadFile({el:this.formDOM,url:"http://image.yinyuetai.com/edit",data:t,filename:"img",className:"file",success:function(e){n.imageStateDOM.html(s),n.previewImage(e),n.trigger("uploadFileSuccess",e)},failure:function(){a.showError("上传失败")}}),this.on("successBreviary",function(e){this.successBreviary(e)})},successBreviary:function(e){this.emptyValue(),e.breviaryUrl&&(this.imgSrcDOM.attr("src",e.breviaryUrl),this.imgSrcDOM.show()),e.inputText&&this.inputTextDOM.text(e.inputText)},saveHandler:function(e){this.trigger("saveFile")},changeFile:function(e){this.imageStateDOM.html(r),this.upload.submit()},previewImage:function(e){var t=e.images,n=t[0].path;this.imgSrcDOM.attr("src",n),this.imgSrcDOM.show()},emptyValue:function(){this.imageStateDOM.html(""),this.imgSrcDOM.hide(),this.inputTextDOM.text("上传图片")}}),d=null;l.sharedInstanceUploadFileDialog=function(e){return d||(d=new l(e)),d},l.fetchDialogTemplate=function(){return n(40)},e.exports=l},function(e,t,n){(function(t){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof t&&t.global==t&&t;e.exports=n()}(function(){var e=999,t=window,o=t.ICEPlugs||{},i=o.url;i||(i=n(20));var r=o.tools;r||(r=n(15));var s=o.AjaxForm;s||(s=n(27));var a=null,c=function(t){var n=this;return this.$el="string"==typeof t.el?$(t.el):t.el,this.uid="UploadFile"+e++,this.options=t,this._data=t.data||{},this._filename=t.filename||"image",this._success=t.success,this._before=t.before,this._failure=t.failure,this._url=t.url,this._url?(this._init(),void(this.ajaxForm=s.classInstanceAjaxForm(this.$el,{type:"img",success:function(){var e=this.contentWindow,t=(e.location,decodeURIComponent(e.location.search)),o=i.parseSearch(t);"function"==typeof n._success&&n._success.call(this,o)},failure:function(){"function"==typeof n._failure&&n._failure.call(this)}}))):void console.warn("配置上传URL")};return c.prototype._init=function(){this._createElement()},c.prototype._createElement=function(){var e="";for(var t in this._data){var n=this._data[t],o=r.toType(n);"[object Object]"!==o&&"[object Array]"!==o||(n=JSON.stringify(n)),e+='<input type="hidden" name="'+t+"\" value='"+n+"'/>"}e+='<input type="file" class="upload-file '+this.options.className+'" name="'+this._filename+'"  />',this.$el.attr("method","POST"),this.$el.attr("action",this._url),this.$el.attr("enctype","multipart/form-data"),this.$el.append(e)},c.prototype.submit=function(){this.ajaxForm.setIframeState(!0),"function"==typeof this._before&&this._before(),this.$el.submit()},c.sharedInstanceUploadFile=function(e){return a||(a=new c(e)),a},c.classInstanceUploadFile=function(e){return new c(e)},c})}).call(t,function(){return this}())},,function(e,t){e.exports='<div class="title fl" id="txtRoomName">20160408金在中出道纪念会</div>\r\n<div class="popularity fl">人气:<span id="txtPopularity">0</span></div>\r\n<div class="edit_bg_btn fr">更换主题背景</div>\r\n<!--上传图片弹出层-->\r\n<div style="display: none;" class="shadow_screen">\r\n  <div class="shadow"></div>\r\n  <div class="edit_Bg_form">\r\n    <h2 class="edit_title">背景图设置<span class="upload-status">正在上传</span><span  class="upload-status">上传完成!</span><span class="close">X</span></h2>\r\n    <div class="formCon clearfix">\r\n      <div class="imgBox fl">\r\n        <img src="" alt="" style="display: none;">\r\n      </div>\r\n      <div class="formBox fl">\r\n        <form action="">\r\n          <div class="pseudo-uploadBtn">\r\n            上传图片\r\n            <input type="file" name="" id="file">\r\n          </div>\r\n          <p>支持5M以内的gif、jpg、jpge、png图片上传</p>\r\n          <div class="submit">保存</div>\r\n        </form>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n'},function(e,t,n){var o=n(10),i=o.extend({el:"#currentAnchorInfo",rawLoader:function(){return n(46)},events:{},beforeMount:function(){this.infoTpl=n(47)},afterMount:function(){this.roomInfoWrap=$("#roomInfoWrap"),this.imgRoomPic=$("#imgRoomPic")},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var e=this;$(document).on("event:roomInfoReady",function(t,n){if(n){var o=_.template(e.infoTpl),i=o(n);e.roomInfoWrap.append(i),n.posterPic&&e.imgRoomPic.attr("src",n.posterPic)}})}});e.exports=i},function(e,t){e.exports='<!--<span class="anchor_avator fl"></span>-->\r\n<img id="imgRoomPic" src="" alt="" class="anchor_avator fl">\r\n<dl class="anchorMsg fl" id="roomInfoWrap">\r\n</dl>\r\n'},function(e,t){e.exports="<dt><%=roomName%></dt>\r\n<dd>在线人数:<span><%=online%></span></dd>\r\n<dd>标签:\r\n    <%\r\n    var allTags = creator.tags || [];\r\n    for(var i = 0,j = allTags.length; i < j; i++){\r\n    %>\r\n    <i><%=allTags[i] %></i>\r\n    <%\r\n    }\r\n    if(allTags.length ==0){\r\n    %>\r\n    <i>暂无</i>\r\n    <% }%>\r\n</dd>"},function(module,exports,__webpack_require__){var BaseView=__webpack_require__(10),YYTIMServer=__webpack_require__(16),RoomMessageModel=__webpack_require__(49),uiConfirm=__webpack_require__(34),UserModel=__webpack_require__(21),user=UserModel.sharedInstanceUserModel(),DateTime=__webpack_require__(50),FlashAPI=__webpack_require__(36),msgBox=__webpack_require__(43),View=BaseView.extend({el:"#anchorCtrlChat",rawLoader:function(){return __webpack_require__(51)},events:{"click #btn-clear":"clearHandler","click #btn-lock":"lockClickHandler","click #msgList":"messageClickHandler"},beforeMount:function(){this.roomMsgModel=new RoomMessageModel,this.forbidUsers=[]},afterMount:function(){this.themeBgEle=$("#anchorContainerBg"),this.msgList=$("#msgList"),this.chatHistory=$("#chatHistory"),this.btnLock=$("#btn-lock"),this.defineEventInterface()},ready:function(){this.flashAPI=FlashAPI.sharedInstanceFlashAPI({el:"broadCastFlash"})},clearHandler:function(){var e=this,t=e.checkLiveRoomReady();t&&uiConfirm.show({content:"您确定要清屏吗?",okFn:function(){e.clearMessageList(),e.flashAPI.onReady(function(){this.clear()}),YYTIMServer.clearScreen({groupId:e.roomInfo.imGroupid,msg:{roomId:e.roomInfo.id,nickName:"群主",smallAvatar:"",mstType:4}})}})},lockClickHandler:function(){var e=this.checkLiveRoomReady();if(e){var t=this.btnLock.children("span"),n=this,o="锁屏"==t.text()?"锁定屏幕":"解开屏幕";uiConfirm.show({content:"您确定要"+o+"吗?",okFn:function(){n.lockIMHandler("锁屏"==t.text())}})}},lockIMHandler:function(e){var t=this,n={GroupId:this.roomInfo.imGroupid};e===!0?n.Introduction=JSON.stringify({blockState:!!e,alert:"播主设定锁定屏幕，不能发送弹幕及礼物"}):n.Introduction=JSON.stringify({blockState:!1});var o=e===!0?"锁屏":"解屏";YYTIMServer.modifyGroupInfo(n,function(n){n&&"OK"==n.ActionStatus?(t.btnLock.children("span").text(e===!0?"解屏":"锁屏"),msgBox.showOK(o+"成功!")):msgBox.showError(o+"操作失败,请稍后重试")},function(e){msgBox.showError(o+"操作失败,请稍后重试")})},clearMessageList:function(){this.msgList.children().remove()},messageClickHandler:function(e){var t,n;t=$(e.target).parent(),t.hasClass("controls_forbid_reject")?this.msgControlHandler(e):(n=$(e.target).parents("li"),0==n.attr("data-msgType")&&this.showMsgControlMenu(n))},showMsgControlMenu:function(e){if(!(e.length<=0)){var t=e.find(".controls_forbid_reject"),n=$("#msgList").find("li").index(e);$(".controls_forbid_reject").not(t).hide(),0===n&&t.css("margin-top","33px"),t.toggle()}},msgControlHandler:function(e){var t,n=$(e.target);t=n.parents("li"),"禁言"===n.text()?this.disableSendMsgConfirm({name:t.attr("data-name"),id:t.attr("data-id")}):"踢出"===n.text()&&this.removeUserFromRoom({name:t.attr("data-name"),id:t.attr("data-id")})},disableSendMsgConfirm:function(e){var t=this;uiConfirm.show({content:"您确定要禁止用户:<b>"+e.name+"</b>发言吗?",okFn:function(){t.disableSendMsgHandler(e)}})},disableSendMsgHandler:function(e){var t=this,n=[];n.push(e.id),YYTIMServer.disableSendMsg({GroupId:t.roomInfo.imGroupid,Members_Account:n},function(n){n&&"OK"===n.ActionStatus?(msgBox.showOK("已将用户:<b>"+e.name+" 禁言10分钟."),t.flashAPI.onReady(function(){this.notifying({roomId:t.roomInfo.id,userId:e.id,nickName:e.name,mstType:5})}),YYTIMServer.sendMessage({groupId:t.roomInfo.imGroupid,msg:{roomId:t.roomInfo.id,mstType:5,userId:e.id}},function(e){},function(e){})):msgBox.showError("禁言失败,请稍后重试!")},function(){msgBox.showError("禁言失败,请稍后重试!")})},hideUserControl:function(){$(".controls_forbid_reject").hide()},removeUserFromRoom:function(e){function t(){n.forbidUsers.length>200&&n.forbidUsers.shift(),n.forbidUsers.push(e.id);var t={GroupId:n.roomInfo.imGroupid,Notification:JSON.stringify({forbidUsers:n.forbidUsers})};YYTIMServer.modifyGroupInfo(t,function(t){t&&"OK"===t.ActionStatus?msgBox.showOK("成功将用户:<b>"+e.name+"</b>踢出房间"):msgBox.showError("将用户:<b>"+e.name+"</b>踢出房间失败,请稍后再试")})}var n=this;uiConfirm.show({content:"您确定要将用户:<b>"+e.name+"</b>踢出房间吗?",okFn:function(){t()}})},renderGroupMsgs:function(e){},onMsgNotify:function(notifyInfo){var self=this,msgObj={};if(notifyInfo&&notifyInfo.elems&&notifyInfo.elems.length>0)switch(msgObj=notifyInfo.elems[0].content.text+"",msgObj=msgObj.replace(/&quot;/g,"'"),eval("msgObj = "+msgObj),msgObj.fromAccount=notifyInfo.fromAccount,msgObj.mstType){case 0:self.addMessage(msgObj);break;case 1:break;case 2:break;case 3:msgObj.content="<b>"+msgObj.nickName+"</b>点赞一次!",msgObj.nickName="消息",msgObj.smallAvatar="",self.addMessage(msgObj);break;case 4:}},onGroupInfoChangeNotify:function(e){},groupSystemNotifys:function(e){},getMessageTpl:function(){return __webpack_require__(52)},addMessage:function(e){var t=this;if(e=_.extend({nickName:"匿名",content:"",smallAvatar:"",time:t.getDateStr(new Date)},e),(!e||e.roomId===t.roomInfo.id)&&e&&e.content){var n=_.template(this.getMessageTpl());this.msgList.append(n(e)),this.chatHistory.scrollTop(this.msgList.height()),0==e.mstType&&this.flashAPI.onReady(function(){this.notifying(e)})}},defineEventInterface:function(){var e=this;$(document).on("event:LiveShowStarted",function(e,t){}),$(document).on("event:liveShowEnded",function(e,t){}),$(document).on("event:roomInfoReady",function(t,n){n&&(e.roomInfo=n,e.roomInfoReady())}),$(document).on("event:onConnNotify",function(e,t){}),$(document).on("event:onMsgNotify",function(t,n){e.onMsgNotify(n)}),$(document).on("event:onGroupInfoChangeNotify",function(t,n){e.onGroupInfoChangeNotify(n)}),$(document).on("event:groupSystemNotifys",function(t,n){e.groupSystemNotifys(n)})},roomInfoReady:function(){var e=this;e.getMessageFromServer(),e.getGroupInfo()},getMessageFromServer:function(){var e=this;e.roomMsgModel.setChangeURL({deviceinfo:'{"aid": "30001001"}',accessToken:user.getToken(),limit:100,endTime:0,startTime:0,cursor:"",roomId:e.roomInfo.id}),e.roomMsgModel.executeGET(function(e){},function(e){})},getGroupInfo:function(){var e=this;YYTIMServer.getGroupInfo(e.roomInfo.imGroupid,function(t){if(t&&"OK"===t.ActionStatus&&t.GroupInfo&&t.GroupInfo[0]&&t.GroupInfo[0].Introduction){var n=JSON.parse(t.GroupInfo[0].Introduction);n&&n.blockState===!0&&e.btnLock.children("span").text("解屏")}},function(e){msgBox.showError(e.msg||"获取群组消息失败!")})},getDateStr:function(e){var t=new Date(e);return t.Format("hh:MM:ss")},checkLiveRoomReady:function(){switch(this.roomInfo.status){case 0:return msgBox.showTip("该直播尚未发布!"),!1;case 1:case 2:return this.roomInfo&&this.roomInfo.imGroupid?!0:(msgBox.showTip("请先开始直播!"),!1);case 3:return msgBox.showTip("该直播已经结束!"),!1}}});module.exports=View},function(e,t,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/message/get.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}&startTime={{startTime}}&endTime={{endTime}}&cursor={{cursor}}&limit={{limit}}",beforeEmit:function(e){}});e.exports=i},function(e,t,n){(function(t){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof t&&t.global==t&&t;e.exports=n()}(function(){var e=function(e){this.temp=new Date,this.setCurNewDate(e)};e.prototype.changeYear=function(e){this.temp.setFullYear(e)},e.prototype.getCountDays=function(e){return this.temp.setMonth(e),this.temp.setDate(0),this.temp.getDate()},e.prototype.$get=function(e){return this.attrs[e]},e.prototype.ceilYear=function(e){e=~~e;for(var t=0,n=this.$get("year"),o=[];e>=t;t++)o.push(n),n+=1;return o},e.prototype._downDisplacement=function(e){var t,n=this.$get(e),o=[];switch(e){case"month":t=12;break;case"day":t=this.getCountDays(this.$get("month"));break;case"hours":t=23;break;default:t=59}for(;t>=n;n++)o.push(n);return o},e.prototype.downMonth=function(){return this._downDisplacement("month")},e.prototype.downDay=function(){return this._downDisplacement("day")},e.prototype.downHours=function(){return this._downDisplacement("hours")},e.prototype.downMinutes=function(){return this._downDisplacement("minutes")},e.prototype.down=function(e){return this._downDisplacement(e)},e.prototype.getTime=function(e){var t="",n=e.month<10?"0"+e.month:e.month,o=e.day<10?"0"+e.day:e.day,i=e.hours<10?"0"+e.hours:e.hours,r=e.minutes<10?"0"+e.minutes:e.minutes;return t+=e.year+"-"+n+"-"+o+" ",t+=i+":"+r+":00",new Date(t.replace(/-/g,"/")).getTime()},e.prototype.setCurNewDate=function(e){this.date=null,this.date=e?new Date(e):new Date,this._setAttrs()},e.prototype._setAttrs=function(){this.attrs=null,this.attrs={year:this.date.getFullYear(),month:this.date.getMonth()+1,day:this.date.getDate(),hours:this.date.getHours(),minutes:this.date.getMinutes()}},e.difference=function(e){var t={},n=e%864e5,o=Math.floor(n/36e5);t.hours=10>o?"0"+o:o;var i=n%36e5,r=Math.floor(i/6e4);t.minutes=10>r?"0"+r:r;var s=i%6e4,a=Math.floor(s/1e3);return t.seconds=10>a?"0"+a:a,t};var t=null;return e.sharedInstanceDateTime=function(){return t||(t=new e),t},e}),Date.prototype.Format=function(e){var t={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length)));for(var n in t)new RegExp("("+n+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?t[n]:("00"+t[n]).substr((""+t[n]).length)));return e}}).call(t,function(){return this}())},function(e,t){e.exports='<div class="controls clearfix">\r\n    <div id="btn-clear" class="fl"><img src="../img/clear.png" alt="">清屏</div>\r\n    <div id="btn-lock" class="fl"><img src="../img/clock.png" alt="" class="lock"><span>锁屏</span></div>\r\n</div>\r\n<div class="chatCon" id="chatHistory">\r\n    <!--聊天记录-->\r\n    <ul id="msgList">\r\n    </ul>\r\n</div>\r\n'},function(e,t){e.exports='<li class="clearfix" data-msgType="<%=mstType%>" data-name="<%=nickName%>" data-id="<%=fromAccount%>">\r\n  <img onerror="this.src=\'../img/visitor_avator.jpg\'" src="<%=smallAvatar%>" alt="" class="fl visitor_avator">\r\n  <p class="visitor_chat fl">\r\n    <span class="visitorName"><%=nickName%>:</span>\r\n    <%=content%>\r\n    <span class="time fr"><%=time%></span>\r\n  </p>\r\n  <div class="controls_forbid_reject">\r\n    <a href="javascript:;" class="forbid">禁言</a>\r\n    <a href="javascript:;" class="reject">踢出</a>\r\n  </div>\r\n</li>\r\n'},function(e,t,n){"use strict";var o=n(10),i=n(54),r=n(55),s=n(16),a=n(21),c=a.sharedInstanceUserModel(),l=n(43),d=o.extend({el:"#noticeWraper",rawLoader:function(){return n(56)},events:{"click #btnEditNotice":"editClickHandler","click .closeNoticePanel":"panelDisplay","click #btnSubmitNotice":"submitClickHandler","keyup #txtNotice":"noticeChanged"},beforeMount:function(){this.noticeModel=new i,this.noticeGetModel=new r,this.noticeInfo={content:""}},afterMount:function(){this.editNoticPanel=$("#editNoticPanel"),this.noticeWrap=$("#noticeWrap"),this.txtNotice=$("#txtNotice"),this.imgRoomPic=$("#imgRoomPic"),this.errNoticeTip=$("#errNoticTip"),this.tipTextarea=this.$el.find(".tipTextarea")},ready:function(){this.defineEventInterface()},editClickHandler:function(e){this.noticeChanged(),this.panelDisplay(!0)},panelDisplay:function(e){this.errNoticeTip.text(""),e===!0?(this.txtNotice.val(this.noticeInfo.content),this.editNoticPanel.show()):this.editNoticPanel.hide()},submitClickHandler:function(e){var t=this.txtNotice.val().trim(),n=this;return!t||t.length>=50||t.length<=0?(this.errNoticeTip.text("公告文字请在50字以内"),null):(this.noticeModel.setChangeURL({deviceinfo:'{"aid": "30001001"}',accessToken:c.getToken(),roomId:this.roomInfo.id,content:t}),void this.noticeModel.executeGET(function(e){e&&"0"==e.code&&($(document).trigger("event:noticeChanged",t),n.noticeInfo.content=t,n.noticeWrap.text(t),n.panelDisplay(),l.showOK("公告发布成功"),n.sendNotifyToIM(t))},function(e){l.showError("数据保存失败,请稍后重试")}))},sendNotifyToIM:function(e){this.roomInfo.imGroupid&&s.sendMessage({groupId:this.roomInfo.imGroupid,msg:{roomId:this.roomInfo.id,smallAvatar:"",mstType:2,content:e}},function(e){},function(t){e.log(t)})},defineEventInterface:function(){var e=this;$(document).on("event:roomInfoReady",function(t,n){n&&(e.roomInfo=n),e.getNoticeInfo(),n.imageUrl&&e.imgRoomPic.attr("src",n.imageUrl)})},getNoticeInfo:function(){var e=this;this.noticeGetModel.setChangeURL({deviceinfo:'{"aid":"30001001"}',roomId:this.roomInfo.id,accessToken:c.getToken()}),this.noticeGetModel.executeGET(function(t){if(t&&t.data){var n=null;t.data.placards&&(n=t.data.placards[0]),n?(e.noticeInfo=n,e.noticeWrap.text(n.content||"暂无公告"),e.txtNotice.val(n.content)):e.noticeWrap.text("暂无公告")}},function(e){l.showErr(e.msg||"获取公告失败")})},noticeChanged:function(){this.txtNotice.val().length<50?this.tipTextarea.text("您还可以输入"+(50-this.txtNotice.val().length)+"个字"):this.tipTextarea.text("您的输入超出了"+(this.txtNotice.val().length-50)+"个字")}});e.exports=d},function(e,t,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/placard_create.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}&content={{content}}",beforeEmit:function(e){}});e.exports=i},function(e,t,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/placard_get.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(e){}});e.exports=i},function(e,t){e.exports='<h2 class="clearfix annoucement">\r\n    <span class="fl .annoucement_title">公告</span>\r\n    <span id="btnEditNotice" class="fr annoucement_editr">编辑</span>\r\n</h2>\r\n<p id="noticeWrap"></p>\r\n<!--编辑公告弹出框-->\r\n<div id="editNoticPanel" style="display: none;" class="shadow_screen">\r\n    <div class="shadow closeNoticePanel"></div>\r\n    <div class="edit_annmoucement_con">\r\n        <h2 class="edit_title">文字输入<span class="close closeNoticePanel">X</span></h2>\r\n        <div class="editCon">\r\n            <h3>公告内容:</h3>\r\n            <textarea id="txtNotice" placeholder="(公告文字请在50字以内)" maxlength="50"></textarea>\r\n            <div id="errNot ticTip" class="errTip"></div>\r\n            <div class="tipTextarea" style="margin-top: -25px;text-align: right;padding-right: 10px;">你还可以输入50字</div>\r\n            <p style="padding-top: 16px;">\r\n                <a href="####" class="cancel closeNoticePanel">取消</a>\r\n                <a id="btnSubmitNotice" href="####" class="submit">确定</a>\r\n            </p>\r\n        </div>\r\n    </div>\r\n</div>\r\n'},function(e,t,n){"use strict";var o=n(10),i=n(16),r=n(34),s=n(43),a=n(58),c=n(59),l=n(36),d=n(21),u=d.sharedInstanceUserModel(),f=o.extend({el:"#liveShowBtnWraper",rawLoader:function(){return n(60)},events:{"click .endLive":"endLiveClick","click .startLive":"startLiveClick"},beforeMount:function(){this.startLiveModel=new a,this.endLiveModel=new c},afterMount:function(){this.btnEndLive=$(".endLive"),this.btnStartLive=$(".startLive"),this.defineEventInterface()},ready:function(){this.flashAPI=l.sharedInstanceFlashAPI({el:"broadCastFlash"})},startLiveClick:function(e){
var t=$(e.target),n=this;return t.hasClass("m_disabled")?null:(t.addClass("m_disabled"),this.btnEndLive.removeClass("m_disabled"),this.roomInfo?void(this.roomInfo.imGroupid?n.startLive():i.createIMChatRoom(function(e){n.roomInfo.imGroupid=e.GroupId,n.startLive()},function(e){s.showError("创建房间失败,请稍后重试")})):(s.showError("没有获取到房间信息"),""))},startLive:function(){var e=this;e.startLiveModel.setChangeURL({deviceinfo:JSON.stringify({aid:"30001001"}),accessToken:u.getToken(),roomId:e.roomInfo.id,imGroupId:encodeURIComponent(e.roomInfo.imGroupid)}),e.startLiveModel.executeGET(function(t){s.showOK("成功开启直播"),e.flashAPI.onReady(function(){this.addUrl(e.roomInfo.url,e.roomInfo.streamName)}),$(document).trigger("event:LiveShowStarted")},function(e){s.showError(e.msg||"开启直播失败,请稍后重试")})},endLiveClick:function(e){var t=this;return this.btnEndLive.hasClass("m_disabled")?null:void r.show({title:"消息",content:"您确定要结束直播吗",okFn:function(){t.endLive()},cancelFn:function(){}})},endLive:function(){var e=this;e.endLiveModel.setChangeURL({deviceinfo:'{"aid": "30001001"}',accessToken:u.getToken(),roomId:e.roomInfo.id}),e.endLiveModel.executeGET(function(t){e.btnEndLive.addClass("m_disabled"),e.isLiveShowing=!1,s.showOK("结束直播操作成功"),$(document).trigger("event:liveShowEnded")},function(e){s.showError(e.msg||"操作失败,稍后重试")})},defineEventInterface:function(){var e=this;$(document).on("event:roomInfoReady",function(t,n){n&&(e.roomInfo=n,e.changeButtonStatus(e.roomInfo.status))})},changeButtonStatus:function(e){2===e?(this.btnStartLive.addClass("m_disabled"),this.btnEndLive.removeClass("m_disabled")):3===e&&(this.btnStartLive.addClass("m_disabled"),this.btnEndLive.addClass("m_disabled"))}});e.exports=f},function(e,t,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/start.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}&imGroupId={{imGroupId}}",beforeEmit:function(e){}});e.exports=i},function(e,t,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/close.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(e){}});e.exports=i},function(e,t){e.exports='<div class="endLive m_disabled">结束本次直播</div>\r\n<div class="startLive">开启直播</div>\r\n'},,,,,function(e,t){}]);