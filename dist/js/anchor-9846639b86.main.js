/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-3-28   18:43:1
 * @author YYT
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([0],[function(t,e,n){$(function(){var t=n(9);new t;var e=n(61);new e,n(65)})},,,,,,,,,function(t,e,n){"use strict";var o=n(10),i=n(16),s=n(21),a=s.sharedInstanceUserModel(),r=n(33),c=n(20),l=n(34),f=n(19),d=n(36),u=o.extend({clientRender:!1,el:"#anchorContainerBg",events:{},beforeMount:function(){var t=c.parse(location.href);this.roomId=t.query.roomId||1,this.roomInfoPeriod=5e3,this.roomId||this.goBack(),this.giftModel=d.sigleInstance(),this.roomDetail=r.sigleInstance(),this.roomDetailParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+a.getToken(),roomId:""},this.giftParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+a.getToken(),offset:0,size:9e4,type:0}},afterMount:function(){},ready:function(){var t=this;this.userVerify(),Backbone.on("event:stopLoopRoomInfo",function(){clearTimeout(t.roomInfoTimeId)})},initWebIM:function(){function t(t){Backbone.trigger("event:groupSystemNotifys",t)}i.init({onConnNotify:function(t){Backbone.trigger("event:onConnNotify",t)},onMsgNotify:function(t){Backbone.trigger("event:onMsgNotify",t)},onGroupInfoChangeNotify:function(t){Backbone.trigger("event:onGroupInfoChangeNotify",t)},groupSystemNotifys:{1:t,2:t,3:t,4:t,5:t,6:t,7:t,8:t,9:t,10:t,11:t,255:t}})},userVerify:function(){var t=this;a.isLogined()?(t.initWebIM(),t.initRoom()):(f.remove("imSig"),f.set("signout",1),window.location.href="/web/login.html")},initRoom:function(){var t=this;this.getRoomInfo(function(e){var n=e.data;t.videoUrl={streamName:n.streamName,url:n.url},t.renderPage(),Backbone.trigger("event:roomInfoReady",n)},function(e){l.show({title:"提示",content:"获取房间数据失败!",okFn:function(){t.goBack()},cancelFn:function(){t.goBack()}})}),t.loopRoomInfo()},loopRoomInfo:function(){var t=this;t.roomInfoTimeId=setTimeout(function(){t.roomDetailParams.roomId=t.roomId,t.getRoomInfo(function(e){var n=e.data;Backbone.trigger("event:updateRoomInfo",n),t.loopRoomInfo()})},t.roomInfoPeriod)},getRoomInfo:function(t,e){var n=this;n.roomDetailParams.roomId=n.roomId,this.roomDetail.executeJSONP(n.roomDetailParams,function(e){t&&t(e)},function(t){e&&e(t)})},renderPage:function(){var t=n(37);new t;var e=n(45);new e;var o=n(48);new o;var i=n(53);new i;var s=n(57);new s},goBack:function(){window.location.href="/web/anchorsetting.html"},initGiftList:function(){this.giftModel.get(this.giftParams,function(t){},function(t){})}});t.exports=u},,,,,,,function(t,e,n){"use strict";var o=n(17),i=o.sharedInstanceIMModel(),s=n(19),a={setting:{listeners:{onMsgNotify:null,onGroupInfoChangeNotify:null,groupSystemNotifys:null}}};a.init=function(t){var e=this;i.fetchIMUserSig(function(n){e.im=n;var o={sdkAppID:n.imAppid,appIDAt3rd:n.imAppid,accountType:n.imAccountType,identifier:n.imIdentifier,userSig:n.userSig};n&&t&&webim.init(o,t,null)},function(t){})},a.sendMessage=function(t,e,n){var o=Math.floor(1e4*Math.random()),i=new webim.Session("GROUP",t.groupId,t.groupId,"",o);if(i){var s=new webim.Msg(i,!0);s.addText(new webim.Msg.Elem.Text(JSON.stringify(t.msg))),s.fromAccount=this.im.imIdentifier,webim.sendMsg(s,function(t){e&&e(t)},function(t){n&&n(t)})}},a.clearScreen=function(t){this.sendMessage(t)},a.lockScreen=function(){},a.disableSendMsg=function(t,e,n){var o=webim.Tool.formatTimeStamp(Math.round((new Date).getTime()/1e3)+600);o=new Date(o+"").getTime(),t=_.extend({ShutUpTime:o},t),webim.forbidSendMsg(t,function(t){e&&e(t)},function(t){n&&n(t)})},a.removeUserFromGroup=function(t,e,n){(!t||!t.GroupId||t.MemberToDel_Account.length<=0)&&n&&n({msg:"参数不正确"}),webim.deleteGroupMember(t,function(t){e&&e(t)},function(t){n&&n(t)})},a.msgNotify=function(t){},a.getRoomMsgs=function(t){for(var e=[],n=1;;){if(n++>20)break;e.push({name:"Aaron-"+n,msg:"asdfasdfasfjaslfjasklfasdklf"+n})}t&&t.call(this,e)},a.createIMChatRoom=function(t,e){var n=s.get("imSig"),o={Owner_Account:n.imIdentifier,Type:"ChatRoom",Name:"测试聊天室",Notification:"",Introduction:"",MemberList:[]};webim.createGroup(o,function(e){t&&t(e)},function(t){e&&e(t)})},a.getGroupInfo=function(t,e,n){var o={GroupIdList:[t],GroupBaseInfoFilter:["Type","Name","Introduction","Notification","FaceUrl","CreateTime","Owner_Account","LastInfoTime","LastMsgTime","NextMsgSeq","MemberNum","MaxMemberNum","ApplyJoinOption"],MemberInfoFilter:["Account","Role","JoinTime","LastSendMsgTime","ShutUpUntil"]};webim.getGroupInfo(o,function(t){e&&e(t)},function(t){alert(t.ErrorInfo),n&&n(t)})},a.modifyGroupInfo=function(t,e,n){webim.modifyGroupBaseInfo(t,function(t){e&&e(t)},function(t){n&&n(t)})},t.exports=a},,,,,,,,,,,,,,,,,function(t,e,n){"use strict";var o=n(18),i=null,s=o.extend({url:"{{url_prefix}}/room/detail.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",beforeEmit:function(t){}});s.sigleInstance=function(){return i||(i=new s),i},t.exports=s},function(t,e,n){var o={},i={title:"消息",content:"",okFn:null,cancelFn:null,okBtn:!0,cancelBtn:!0};o.init=function(t){var e=_.template(this.getHTML()),n=e(t);this.remove(),this.bindEvent(n,t.okFn,t.cancelFn)},o.remove=function(){var t=$("#UIConfigWrap");t&&t.length>=1&&t.remove()},o.getHTML=function(){return n(35)},o.bindEvent=function(t,e,n){var o=this;t=$(t),t.find("#UIConfirmOk").on("click",function(t){return t.preventDefault(),e&&e(),o.remove(),!1}),t.find(".UIConfirmClose").on("click",function(t){return t.preventDefault(),n&&n(),o.remove(),!1}),t.find("#UIConfirmOk").on("click",function(t){return t.preventDefault(),o.remove(),!1}),$("body").append(t)},o.show=function(t){var e=_.extend(i,t);this.init(e)},o.close=function(){this.remove()},t.exports={show:function(t){o.show(t)},close:function(){o.close()}}},function(t,e){t.exports='<div id="UIConfigWrap" class="shadow_screen">\n    <div class="shadow UIConfirmClose"></div>\n    <div class="edit_annmoucement_con" style="margin-bottom: 16px; width: 400px;height: 200px;margin-left:-200px;">\n        <h2 class="edit_title"><span id="UIConfirmTitle"><%=title%></span> <span class="close UIConfirmClose">X</span></h2>\n        <div class="editCon" style="height:144px;width: 400px;padding-top: inherit; position:relative;">\n            <div style="padding:16px; font-size: 14px;"><%=content%></div>\n            <p style="padding-top: 0px;display: block; position: absolute; bottom: 8px;left: 0;width: 100%;">\n                <a style="display: <%= cancelBtn?\'inline-block\':\'none\'%>;" href="javascript:;" class="cancel UIConfirmClose">取消</a>\n                <a id="UIConfirmOk" href="javascript:;" class="submit">确定</a>\n            </p>\n        </div>\n    </div>\n</div>'},function(t,e){"use strict";function n(){}var o=null,i=null;n.prototype.get=function(t,e,n){i&&e&&e(i),$.ajax("http://lapi.yinyuetai.com/gift/list.json",{method:"GET",data:t,dataType:"jsonp",jsonp:"callback"}).done(function(t){i=t,e&&e(t)}).fail(function(t){n&&n(t)})},n.sigleInstance=function(){return o||(o=new n),o},t.exports=n},function(t,e,n){var o=n(10),i=n(38),s=n(39),a=n(43),r=n(21),c=r.sharedInstanceUserModel(),l=o.extend({el:"#edit_background",rawLoader:function(){return n(44)},events:{"click .edit_bg_btn":"showFileUploadDialog"},beforeMount:function(){this.editBgModel=new i,this.uploadFile=new s(this.getFileUploadOptions()),this.bgModelParams={access_token:"web-"+c.getToken(),deviceinfo:'{"aid": "30001001"}',roomId:"",imageUrl:""}},afterMount:function(){this.changeBgBtn=$(".edit_bg_btn"),this.txtPopularity=$("#txtPopularity"),this.txtRoomName=$("#txtRoomName"),this.anchorContainerBg=$("#anchorContainerBg")},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(t.roomInfo=e,t.txtRoomName.text(e.roomName||""),t.txtPopularity.text(e.popularity||0),t.roomInfo.imageUrl&&t.setBgStyle(t.roomInfo.imageUrl))}),Backbone.on("event:updateRoomInfo",function(e){e&&e.popularity&&(t.roomInfo=e,t.txtPopularity.text(e.popularity))})},getFileUploadOptions:function(){var t=this;return{width:580,height:341,isRemoveAfterHide:!1,isAutoShow:!1,mainClass:"shadow_screen_x",closeClass:"editor_bg_close_x",closeText:"X",title:"上传主题背景图片",ctrlData:{cmd:[{saveOriginal:1,op:"save",plan:"avatar",belongId:"20634338",srcImg:"img"}],redirect:"http://"+window.location.host+"/cross-url/upload.html"},uploadFileSuccess:function(e){var n=t.uploadFile.parseErrorMsg(e);1==n?t.currentBgImg=e.images[0].path:a.showTip(n)},saveFile:function(){t.setBackgroundImg()}}},showFileUploadDialog:function(){var t=null;this.roomInfo.imageUrl&&(t={inputText:"编辑图片",breviaryUrl:this.roomInfo.imageUrl}),this.currentBgImg="",this.uploadFile.show(t)},setBackgroundImg:function(){var t=this;return t.currentBgImg?(t.bgModelParams.roomId=this.roomInfo.id,t.bgModelParams.imageUrl=this.currentBgImg,void t.editBgModel.executeJSONP(t.bgModelParams,function(e){e&&"0"===e.code?(t.setBgStyle(t.currentBgImg),t.uploadFile.hide(),a.showOK("背景图片设置成功")):a.showError(e.msg||"背景图片设置失败,稍后重试")},function(t){a.showError("背景图片设置失败,稍后重试")})):void a.showTip("请耐心等待图片上传完成!")},setBgStyle:function(t){t&&this.anchorContainerBg.css("background","url("+t+")")}});t.exports=l},function(t,e,n){var o=n(18),i=o.extend({url:'{{url_prefix}}/room/bg_set.json?deviceinfo={"aid":"30001001"}&access_token=web-{{access_token}}&roomId={{roomId}}&imageUrl={{imageUrl}}',beforeEmit:function(t){}});t.exports=i},function(t,e,n){"use strict";var o=n(40),i=n(22),s=n(41),a=function(t){var e=this;this.options=t,this.dialog=i.classInstanceDialog(o,t),this.helper=new s({ctrlData:this.options.ctrlData,id:"#"+this.dialog.id}),this.helper.on("uploadFileSuccess",function(t){"function"==typeof e.options.uploadFileSuccess&&e.options.uploadFileSuccess(t)}),this.helper.on("saveFile",function(){"function"==typeof e.options.saveFile&&e.options.saveFile()})};a.prototype.show=function(t){this.helper&&t&&this.helper.trigger("successBreviary",t),this.dialog.show()},a.prototype.hide=function(){this.dialog.hide()},a.prototype.emptyValue=function(){this.helper&&this.helper.emptyValue()},a.prototype.parseErrorMsg=function(t){if(t&&"SUCCESS"==t.state)return!0;var e=1*t.errCode||0;switch(e){case 29:return"上传的文件太大了,请重新上传";case 31:return"请上传JPGE,JPG,PNG,GIF等格式的图片文件"}return"文件上传失败,请重新上传"};var r=null;a.sharedInstanceUploadFileDialog=function(t){return r||(r=new a(t)),r},t.exports=a},function(t,e){t.exports='<div class="shadow"></div>\n<div class="edit_Bg_form_x" id="uploadFileDialog">\n	<h2 class="edit_title">\n		<span class="upload-title">背景图设置</span>\n		<span class="upload-status upload-image-state"></span>\n	</h2>\n	<div class="formCon clearfix">\n		<div class="imgBox fl">\n			<img src="" alt="" width="100%" height="100%"  style="display: none;" class="imgboxFile">\n		</div>\n		<div class="formBox fl">\n			<div class="pseudo-uploadBtn">\n				<span class="input-text">上传图片</span>\n				<form class="upload-form">\n\n				</form>\n			</div>\n			<p>支持5M以内的gif、jpg、jpge、png图片上传</p>\n			<div class="submit">保存</div>\n		</div>\n	</div>\n</div>\n'},function(t,e,n){"use strict";var o=n(10),i=n(42),s="正在上传",a="上传完成!",r=n(43),c=window.location,l=o.extend({rawLoader:function(){},events:{"click .submit":"saveHandler","change .upload-file":"changeFile"},beforeMount:function(){},afterMount:function(){this.formDOM=this.$el.find(".upload-form"),this.imgSrcDOM=this.$el.find(".imgboxFile"),this.imageStateDOM=this.$el.find(".upload-image-state"),this.inputTextDOM=this.$el.find(".input-text")},ready:function(t){var e=t.ctrlData||{cmd:[{saveOriginal:1,op:"save",plan:"avatar",belongId:"20634338",srcImg:"img"}],redirect:c.origin+"/web/upload.html"},n=this;this.upload=i.classInstanceUploadFile({el:this.formDOM,url:"http://image.yinyuetai.com/edit",data:e,filename:"img",className:"file",success:function(t){n.imageStateDOM.html(a),n.previewImage(t),n.trigger("uploadFileSuccess",t)},failure:function(){r.showError("上传失败")}}),this.on("successBreviary",function(t){this.successBreviary(t)})},successBreviary:function(t){this.emptyValue(),t.breviaryUrl&&(this.imgSrcDOM.attr("src",t.breviaryUrl),this.imgSrcDOM.show()),t.inputText&&this.inputTextDOM.text(t.inputText)},saveHandler:function(t){this.trigger("saveFile")},changeFile:function(t){this.imageStateDOM.html(s),this.upload.submit()},previewImage:function(t){var e=t.images;if(e&&e.length>0){var n=e[0].path;this.imgSrcDOM.attr("src",n),this.imgSrcDOM.show()}},emptyValue:function(){this.imageStateDOM.html(""),this.imgSrcDOM.hide(),this.inputTextDOM.text("上传图片")}}),f=null;l.sharedInstanceUploadFileDialog=function(t){return f||(f=new l(t)),f},l.fetchDialogTemplate=function(){return n(40)},t.exports=l},function(t,e,n){(function(e){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;t.exports=n()}(function(){var t=999,e=window,o=e.ICEPlugs||{},i=o.url;i||(i=n(20));var s=o.tools;s||(s=n(15));var a=o.AjaxForm;a||(a=n(27));var r=null,c=function(e){var n=this;return this.$el="string"==typeof e.el?$(e.el):e.el,this.uid="UploadFile"+t++,this.options=e,this._data=e.data||{},this._filename=e.filename||"image",this._success=e.success,this._before=e.before,this._failure=e.failure,this._url=e.url,this._url?(this._init(),void(this.ajaxForm=a.classInstanceAjaxForm(this.$el,{type:"img",success:function(){var t=this.contentWindow,e=(t.location,decodeURIComponent(t.location.search)),o=i.parseSearch(e);"function"==typeof n._success&&n._success.call(this,o)},failure:function(){"function"==typeof n._failure&&n._failure.call(this)}}))):void console.warn("配置上传URL")};return c.prototype._init=function(){this._createElement()},c.prototype._createElement=function(){var t="";for(var e in this._data){var n=this._data[e],o=s.toType(n);"[object Object]"!==o&&"[object Array]"!==o||(n=JSON.stringify(n)),t+='<input type="hidden" name="'+e+"\" value='"+n+"'/>"}t+='<input type="file" class="opacity0 upload-file '+this.options.className+'" name="'+this._filename+'"  />',this.$el.attr("method","POST"),this.$el.attr("action",this._url),this.$el.attr("enctype","multipart/form-data"),this.$el.append(t)},c.prototype.submit=function(){this.ajaxForm.setIframeState(!0),"function"==typeof this._before&&this._before(),this.$el.submit()},c.sharedInstanceUploadFile=function(t){return r||(r=new c(t)),r},c.classInstanceUploadFile=function(t){return new c(t)},c.prototype.parseErrorMsg=function(t){if(t&&"SUCCESS"==t.state)return!0;var e=1*t.errCode||0;switch(e){case 29:return"上传的文件太大了,请重新上传";case 31:return"请上传JPGE,JPG,PNG,GIF等格式的图片文件"}return"文件上传失败,请重新上传"},c})}).call(e,function(){return this}())},,function(t,e){t.exports='<div class="title fl" id="txtRoomName">20160408金在中出道纪念会</div>\n<div class="popularity fl">人气:<span id="txtPopularity">0</span></div>\n<div class="edit_bg_btn fr">更换主题背景</div>\n<!--上传图片弹出层-->\n<div style="display: none;" class="shadow_screen">\n  <div class="shadow"></div>\n  <div class="edit_Bg_form">\n    <h2 class="edit_title">背景图设置<span class="upload-status">正在上传</span><span  class="upload-status">上传完成!</span><span class="close">X</span></h2>\n    <div class="formCon clearfix">\n      <div class="imgBox fl">\n        <img src="" alt="" style="display: none;">\n      </div>\n      <div class="formBox fl">\n        <form action="">\n          <div class="pseudo-uploadBtn">\n            上传图片\n            <input type="file" name="" id="file">\n          </div>\n          <p>支持5M以内的gif、jpg、jpge、png图片上传</p>\n          <div class="submit">保存</div>\n        </form>\n      </div>\n    </div>\n  </div>\n</div>\n'},function(t,e,n){var o=n(10),i=(n(21),o.extend({el:"#currentAnchorInfo",rawLoader:function(){return n(46)},events:{},beforeMount:function(){this.infoTpl=n(47)},afterMount:function(){var t=this.$el;this.roomInfoWrap=t.find("#roomInfoWrap"),this.imgRoomPic=t.find("#imgRoomPic"),this.txtOnline=t.find("#txtOnline")},ready:function(){this.defineEventInterface()},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){if(e){var n=_.template(t.infoTpl),o=n(e);t.roomInfoWrap.append(o),e.creator.smallAvatar&&t.imgRoomPic.attr("src",e.creator.smallAvatar)}}),Backbone.on("event:updateRoomInfo",function(e){e&&e.online&&t.txtOnline.text(e.online)})}}));t.exports=i},function(t,e){t.exports='<!--<span class="anchor_avator fl"></span>-->\n<img id="imgRoomPic" src="" alt="" class="anchor_avator fl">\n<dl class="anchorMsg fl" id="roomInfoWrap">\n</dl>\n'},function(t,e){t.exports='<dt><%=creator.nickName%></dt>\n<dd>在线人数:<span id="txtOnline"><%=online%></span></dd>\n<dd>标签:\n    <%\n    var allTags = creator.tags || [];\n    for(var i = 0,j = allTags.length; i < j; i++){\n    %>\n    <i><%=allTags[i] %></i>\n    <%\n    }\n    if(allTags.length ==0){\n    %>\n    <i>暂无</i>\n    <% }%>\n</dd>'},function(module,exports,__webpack_require__){var BaseView=__webpack_require__(10),YYTIMServer=__webpack_require__(16),uiConfirm=__webpack_require__(34),DateTime=__webpack_require__(49),FlashAPI=__webpack_require__(50),RoomDetailModel=__webpack_require__(33),msgBox=__webpack_require__(43),View=BaseView.extend({el:"#anchorCtrlChat",rawLoader:function(){return __webpack_require__(51)},events:{"click #btn-clear":"clearHandler","click #btn-lock":"lockClickHandler","click #msgList":"messageClickHandler"},beforeMount:function(){this.forbidUsers=[],this.roomDetail=RoomDetailModel.sigleInstance(),this.roomInfo=this.roomDetail.$get().data||{}},afterMount:function(){var t=this.$el;this.msgList=t.find("#msgList"),this.chatHistory=t.find("#chatHistory"),this.btnLock=t.find("#btn-lock"),this.defineEventInterface()},ready:function(){this.roomInfoReady(),this.flashAPI=FlashAPI.sharedInstanceFlashAPI({el:"broadCastFlash"})},clearHandler:function(){var t=this,e=t.checkLiveRoomReady();e&&uiConfirm.show({content:"您确定要清屏吗?",okFn:function(){var e={roomId:t.roomInfo.id,nickName:"主播",smallAvatar:"",mstType:4,content:"主播已清屏"};t.flashAPI.onReady(function(){this.notifying(e)}),YYTIMServer.clearScreen({groupId:t.roomInfo.imGroupid,msg:e})}})},lockClickHandler:function(){var t=this.checkLiveRoomReady();if(t){var e=this.btnLock.children("span"),n=this,o="锁屏"==e.text()?"锁定屏幕":"解开屏幕";uiConfirm.show({content:"您确定要"+o+"吗?",okFn:function(){n.lockIMHandler("锁屏"==e.text())}})}},lockIMHandler:function(t){var e=this,n={GroupId:this.roomInfo.imGroupid};t===!0?n.Introduction=JSON.stringify({blockState:!!t,alert:"主播已锁屏"}):n.Introduction=JSON.stringify({blockState:!1,alert:"主播解除锁屏"});var o=t===!0?"锁屏":"解屏";YYTIMServer.modifyGroupInfo(n,function(n){n&&"OK"==n.ActionStatus?(e.btnLock.children("span").text(t===!0?"解屏":"锁屏"),msgBox.showOK(o+"成功!")):msgBox.showError(o+"操作失败,请稍后重试")},function(t){msgBox.showError(o+"操作失败,请稍后重试")})},clearMessageList:function(){this.msgList.children().remove()},messageClickHandler:function(t){var e,n;e=$(t.target).parent(),e.hasClass("controls_forbid_reject")?this.msgControlHandler(t):(n=$(t.target).parents("li"),0==n.attr("data-msgType")&&this.showMsgControlMenu(n))},showMsgControlMenu:function(t){if(!(t.length<=0)){var e=t.find(".controls_forbid_reject"),n=$("#msgList").find("li").index(t);$(".controls_forbid_reject").not(e).hide(),0===n&&e.css("margin-top","33px"),e.toggle()}},msgControlHandler:function(t){var e,n=$(t.target),o={};e=n.parents("li"),o={name:e.attr("data-name"),id:e.attr("data-id")},"禁言"===n.text()?this.disableSendMsgConfirm(o):"踢出"===n.text()&&this.removeUserFromRoom(o)},disableSendMsgConfirm:function(t){var e=this;uiConfirm.show({content:"您确定要禁止用户:<b>"+t.name+"</b>发言吗?",okFn:function(){e.disableSendMsgHandler(t)}})},disableSendMsgHandler:function(t){var e=this,n=[];n.push(t.id),YYTIMServer.sendMessage({groupId:e.roomInfo.imGroupid,msg:{roomId:e.roomInfo.id,mstType:5,userId:t.id}},function(n){msgBox.showOK("已将用户:<b>"+t.name+" 禁言10分钟."),e.flashAPI.onReady(function(){this.notifying({roomId:e.roomInfo.id,userId:t.id,nickName:t.name,mstType:5})})},function(t){msgBox.showError("禁言失败,请稍后重试!")})},hideUserControl:function(){$(".controls_forbid_reject").hide()},removeUserFromRoom:function(t){function e(){n.forbidUsers.length>200&&n.forbidUsers.shift(),n.forbidUsers.push(t.id);var e={GroupId:n.roomInfo.imGroupid,Notification:JSON.stringify({forbidUsers:n.forbidUsers})};YYTIMServer.modifyGroupInfo(e,function(e){e&&"OK"===e.ActionStatus?msgBox.showOK("成功将用户:<b>"+t.name+"</b>踢出房间"):msgBox.showError("将用户:<b>"+t.name+"</b>踢出房间失败,请稍后再试")})}var n=this;uiConfirm.show({content:"您确定要将用户:<b>"+t.name+"</b>踢出房间吗?",okFn:function(){e()}})},onMsgNotify:function(notifyInfo){var self=this,msgObj={};if(notifyInfo&&notifyInfo.elems&&notifyInfo.elems.length>0)switch(msgObj=notifyInfo.elems[0].content.text+"",msgObj=msgObj.replace(/&quot;/g,"'"),eval("msgObj = "+msgObj),msgObj.fromAccount=notifyInfo.fromAccount,msgObj.mstType){case 0:self.addMessage(msgObj);break;case 1:msgObj.content="<b>"+msgObj.nickName+"</b>发来礼物!",msgObj.nickName="消息",msgObj.smallAvatar="",self.addMessage(msgObj);break;case 2:break;case 3:msgObj.content="<b>"+msgObj.nickName+"</b>点赞一次!",msgObj.nickName="消息",msgObj.smallAvatar="",self.addMessage(msgObj);break;case 4:}},onGroupInfoChangeNotify:function(t){},groupSystemNotifys:function(t){},getMessageTpl:function(){return __webpack_require__(52)},addMessage:function(t){var e=this;if(t=_.extend({nickName:"匿名",content:"",smallAvatar:"",time:e.getDateStr(new Date)},t),!t||t.roomId===e.roomInfo.id){if(t.content=e.filterEmoji(t.content),t&&t.content){var n=_.template(this.getMessageTpl());this.msgList.append(n(t)),this.chatHistory.scrollTop(this.msgList.height()),0==t.mstType&&this.flashAPI.onReady(function(){this.notifying(t)})}e.autoDeleteMsgList()}},filterEmoji:function(t){var e=/[\u4e00-\u9fa5\w\d@\.\-。_!^^+#【】！~“：《》？<>]/g;if(t){var n=t.match(e)||[];return n.length>0?n.join("")||"":""}return t},autoDeleteMsgList:function(){var t=this.msgList.children().length,e=0;t>1e3&&(e=t-500),this.msgList.children(":lt("+e+")").remove()},defineEventInterface:function(){var t=this;Backbone.on("event:onMsgNotify",function(e){if(e&&"Array"==e.constructor.name)for(var n=0,o=e.length;o>n;n++)t.onMsgNotify(e[n]);else t.onMsgNotify(e)}),Backbone.on("event:onGroupInfoChangeNotify",function(e){t.onGroupInfoChangeNotify(e)}),Backbone.on("event:groupSystemNotifys",function(e){t.groupSystemNotifys(e)})},roomInfoReady:function(){this.getGroupInfo()},getMessageFromServer:function(){},getGroupInfo:function(){var t=this;YYTIMServer.getGroupInfo(t.roomInfo.imGroupid,function(e){if(e&&"OK"===e.ActionStatus&&e.GroupInfo&&e.GroupInfo[0]&&e.GroupInfo[0].Introduction){var n=JSON.parse(e.GroupInfo[0].Introduction);n&&n.blockState===!0&&t.btnLock.children("span").text("解屏")}},function(t){msgBox.showError(t.msg||"获取群组消息失败!")})},getDateStr:function(t){var e=new Date(t);return e.Format("hh:mm:ss")},checkLiveRoomReady:function(){switch(this.roomInfo.status){case 0:return msgBox.showTip("该直播尚未发布!"),!1;case 1:case 2:return this.roomInfo&&this.roomInfo.imGroupid?!0:(msgBox.showTip("请先开始直播!"),!1);case 3:return msgBox.showTip("该直播已经结束!"),!1}}});module.exports=View},function(t,e,n){(function(e){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;t.exports=n()}(function(){var t=function(t){this.temp=new Date,this.setCurNewDate(t)};t.prototype.changeYear=function(t){this.temp.setFullYear(t)},t.prototype.getCountDays=function(t){return this.temp.setMonth(t),this.temp.setDate(0),this.temp.getDate()},t.prototype.$get=function(t){return this.attrs[t]},t.prototype.ceilYear=function(t){t=~~t;for(var e=0,n=this.$get("year"),o=[];t>=e;e++)o.push(n),n+=1;return o},t.prototype._downDisplacement=function(t){var e,n=this.$get(t),o=[];switch(t){case"month":e=12;break;case"day":e=this.getCountDays(this.$get("month"));break;case"hours":e=23;break;default:e=59}for(;e>=n;n++)o.push(n);return o},t.prototype.downMonth=function(){return this._downDisplacement("month")},t.prototype.downDay=function(){return this._downDisplacement("day")},t.prototype.downHours=function(){return this._downDisplacement("hours")},t.prototype.downMinutes=function(){return this._downDisplacement("minutes")},t.prototype.down=function(t){return this._downDisplacement(t)},t.prototype.getTime=function(t){var e="",n=t.month<10?"0"+t.month:t.month,o=t.day<10?"0"+t.day:t.day,i=t.hours<10?"0"+t.hours:t.hours,s=t.minutes<10?"0"+t.minutes:t.minutes;return e+=t.year+"-"+n+"-"+o+" ",e+=i+":"+s+":00",new Date(e.replace(/-/g,"/")).getTime()},t.prototype.setCurNewDate=function(t){this.date=null,this.date=t?new Date(t):new Date,this._setAttrs()},t.prototype._setAttrs=function(){this.attrs=null,this.attrs={year:this.date.getFullYear(),month:this.date.getMonth()+1,day:this.date.getDate(),hours:this.date.getHours(),minutes:this.date.getMinutes()}},t.difference=function(t){var e={},n=t%864e5,o=Math.floor(n/36e5);e.hours=10>o?"0"+o:o;var i=n%36e5,s=Math.floor(i/6e4);e.minutes=10>s?"0"+s:s;var a=i%6e4,r=Math.floor(a/1e3);return e.seconds=10>r?"0"+r:r,e};var e=null;return t.sharedInstanceDateTime=function(){return e||(e=new t),e},t}),Date.prototype.Format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length)));for(var n in e)new RegExp("("+n+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[n]:("00"+e[n]).substr((""+e[n]).length)));return t}}).call(e,function(){return this}())},function(t,e,n){(function(e){"use strict";!function(n){"object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;t.exports=n()}(function(){var t='<object width="{width}" height="{height}"  align="middle" id="{id}" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="{src}" name="movie"><param value="{always}" name="allowscriptaccess"><param value="{fullscreen}" name="allowfullscreen"><param value="{quality}" name="quality"><param value="{flashvars}" name="flashvars"><param value="{wmode}" name="wmode" /><embed width="{width}" height="{height}"  name="{id}" type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}" allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" /></object>',e=window,n=e.location.origin,o=(-1!=e.navigator.appName.indexOf("Microsoft"),999);e.YYTPCFlashReadyState=!1;var i=function(t){var e,n,o=document.getElementById(t)||null;return o&&"OBJECT"==o.nodeName.toUpperCase()&&("undefined"!=typeof o.SetVariable?e=o:(n=o.getElementsByTagName("embed")[0],n&&(e=n))),e},s=function(t,e){return e?t.replace(/\{(.*?)\}/gi,function(){return e[arguments[1]]||""}):t},a=function(e){this.$el="string"==typeof e.el?document.getElementById(e.el):e.el,this._options=e,this._props=e.props||{},this.$attrs={id:"YYTFlash"+o++,src:this._props.src||n+"/flash/RTMPInplayer.swf?t=20160325.6",width:this._props.width||895,height:this._props.height||502,wmode:this._props.wmode||"transparent",flashvar:this._props.flashvar||"",always:this._props.always||"always",fullscreen:this._props.fullscreen||!0,quality:this._props.quality||"high"},this._html=s(t,this.$attrs),this._methods=e.methods||{},this._ready=!1,this._init()};a.prototype._init=function(){this.$el.innerHTML=this._html,this.$swf=i(this.$attrs.id)},a.prototype.onReady=function(t){var n=this;e.YYTPCFlashReadyState||this._ready?t.call(this):this.$timer=setInterval(function(){e.YYTPCFlashReadyState&&(n._ready=!0,e.YYTPCFlashReadyState=!1,clearInterval(n.$timer),n.$timer=null,t.call(n))},0)},a.prototype.init=function(t){this.$swf.initData(t)},a.prototype.isReady=function(){return this._ready},a.prototype.addUrl=function(t,e){this.$swf.setvedioUrl(t,e)},a.prototype.width=function(t){"string"==typeof t&&(t=~~t),this.$swf.setPlayerWidth(t)},a.prototype.height=function(t){"string"==typeof t&&(t=~~t),this.$swf.setPlayerHeight(t)},a.prototype.notifying=function(t){this.$swf.setOneMessageInchat(JSON.stringify(t))},a.prototype.clear=function(){this.$swf.clearAllMessage()};var r=null;return a.sharedInstanceFlashAPI=function(t){return r||(r=new a(t)),r},e.YYTPCFlashOnReady=function(){e.YYTPCFlashReadyState=!0},a})}).call(e,function(){return this}())},function(t,e){t.exports='<div class="controls clearfix">\n    <div id="btn-clear" class="fl"><img src="../img/clear.png" alt="">清屏</div>\n    <div id="btn-lock" class="fl"><img src="../img/clock.png" alt="" class="lock"><span>锁屏</span></div>\n</div>\n<div class="chatCon" id="chatHistory">\n    <!--聊天记录-->\n    <ul id="msgList">\n\n    </ul>\n</div>\n'},function(t,e){t.exports='<li class="clearfix <%=mstType==0?\'\':\'system-info\'%>" data-msgType="<%=mstType%>" data-name="<%=nickName%>" data-id="<%=fromAccount%>">\n  <%if(mstType == 0){%>\n  <img onerror="this.src=\'../img/visitor_avator.jpg\'" src="<%=smallAvatar%>" alt="" class="fl visitor_avator">\n  <%}%>\n  <p class="visitor_chat fl">\n    <span class="visitorName"><%=nickName%>:</span>\n    <%=content%>\n    <span class="time fr"><%=time%></span>\n  </p>\n  <div class="controls_forbid_reject">\n    <a href="javascript:;" class="forbid">禁言</a>\n    <a href="javascript:;" class="reject">踢出</a>\n  </div>\n</li>\n'},function(t,e,n){"use strict";var o=n(10),i=n(54),s=n(55),a=n(16),r=n(21),c=r.sharedInstanceUserModel(),l=n(43),f=o.extend({el:"#noticeWraper",rawLoader:function(){return n(56)},events:{"click #btnEditNotice":"editClickHandler","click .closeNoticePanel":"panelDisplay","click #btnSubmitNotice":"submitClickHandler","keyup #txtNotice":"noticeChanged"},beforeMount:function(){this.noticeModel=new i,this.noticeGetModel=new s,this.noticeInfo={content:""},this.noticeInfoParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+c.getToken(),roomId:"",content:""},this.noticeGetParams={deviceinfo:'{"aid":"30001001"}',roomId:"",access_token:"web-"+c.getToken()}},afterMount:function(){this.editNoticPanel=$("#editNoticPanel"),this.noticeWrap=$("#noticeWrap"),this.txtNotice=$("#txtNotice"),this.imgRoomPic=$("#imgRoomPic"),this.errNoticeTip=$("#errNoticeTip"),this.tipTextarea=this.$el.find(".tipTextarea")},ready:function(){this.defineEventInterface()},editClickHandler:function(t){this.noticeChanged(),this.panelDisplay(!0)},panelDisplay:function(t){this.errNoticeTip.text(""),t===!0?(this.txtNotice.val(this.noticeInfo.content),this.editNoticPanel.show()):this.editNoticPanel.hide()},submitClickHandler:function(t){var e=this.txtNotice.val().trim(),n=this;return!e||e.length>50||e.length<=0?(this.errNoticeTip.text("公告文字请在50字以内"),null):(this.noticeInfoParams.roomId=this.roomInfo.id,this.noticeInfoParams.content=e,void this.noticeModel.executeJSONP(this.noticeInfoParams,function(t){t&&"0"==t.code&&(Backbone.trigger("event:noticeChanged",e),n.noticeInfo.content=e,n.noticeWrap.text(e),n.panelDisplay(),l.showOK("公告发布成功"),n.sendNotifyToIM(e))},function(t){l.showError("数据保存失败,请稍后重试")}))},sendNotifyToIM:function(t){this.roomInfo.imGroupid&&a.sendMessage({groupId:this.roomInfo.imGroupid,msg:{roomId:this.roomInfo.id,smallAvatar:"",mstType:2,content:t}},function(t){},function(t){})},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){e&&(t.roomInfo=e),t.getNoticeInfo()})},getNoticeInfo:function(){var t=this;this.noticeGetParams.roomId=this.roomInfo.id,this.noticeGetModel.executeJSONP(this.noticeGetParams,function(e){if(e&&e.data){var n=null;e.data.placards&&(n=e.data.placards[0]),n?(t.noticeInfo=n,t.noticeWrap.text(n.content||"暂无公告"),t.txtNotice.val(n.content)):t.noticeWrap.text("暂无公告")}},function(t){l.showError(t.msg||"获取公告失败")})},noticeChanged:function(){this.txtNotice.val().length<50?this.tipTextarea.text("您还可以输入"+(50-this.txtNotice.val().length)+"个字"):this.tipTextarea.text("您的输入超出了"+(this.txtNotice.val().length-50)+"个字")}});t.exports=f},function(t,e,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/placard_create.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}&content={{content}}",beforeEmit:function(t){}});t.exports=i},function(t,e,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/placard_get.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}",
beforeEmit:function(t){}});t.exports=i},function(t,e){t.exports='<h2 class="clearfix annoucement">\n    <span class="fl .annoucement_title">公告</span>\n    <span id="btnEditNotice" class="fr annoucement_editr">编辑</span>\n</h2>\n<p id="noticeWrap"></p>\n<!--编辑公告弹出框-->\n<div id="editNoticPanel" style="display: none;" class="shadow_screen">\n    <div class="shadow closeNoticePanel"></div>\n    <div class="edit_annmoucement_con">\n        <h2 class="edit_title">文字输入<span class="close closeNoticePanel">X</span></h2>\n        <div class="editCon">\n            <h3>公告内容:</h3>\n            <textarea id="txtNotice" placeholder="(公告文字请在50字以内)" maxlength="50"></textarea>\n            <div id="errNoticeTip" class="errTip"></div>\n            <div class="tipTextarea" style="margin-top: -25px;text-align: right;padding-right: 10px;">你还可以输入50字</div>\n            <p style="padding-top: 16px;">\n                <a href="####" class="cancel closeNoticePanel">取消</a>\n                <a id="btnSubmitNotice" href="####" class="submit">确定</a>\n            </p>\n        </div>\n    </div>\n</div>\n'},function(t,e,n){"use strict";var o=n(10),i=n(16),s=n(34),a=n(43),r=n(58),c=n(59),l=n(50),f=n(21),d=f.sharedInstanceUserModel(),u=n(49),h=o.extend({el:"#liveShowBtnWraper",rawLoader:function(){return n(60)},events:{"click .endLive":"endLiveClick","click .startLive":"startLiveClick"},beforeMount:function(){this.startLiveModel=new r,this.endLiveModel=new c,this.startLiveParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+d.getToken(),roomId:"",imGroupId:""},this.endLiveParams={deviceinfo:'{"aid": "30001001"}',access_token:"web-"+d.getToken(),roomId:""}},afterMount:function(){this.btnEndLive=$(".endLive"),this.btnStartLive=$(".startLive"),this.defineEventInterface()},ready:function(){this.flashAPI=l.sharedInstanceFlashAPI({el:"broadCastFlash"})},isTooLate:function(t){var e=new Date,n=t-e.getTime(),o=Number(u.difference(Math.abs(n)).hours);return 0>n&&o>=1?1:n>3e5?-1:0},startLiveClick:function(t){var e=$(t.target),n=this,o=n.isTooLate(n.roomInfo.liveTime),s=n.roomInfo.status;if(0==s)return a.showTip("该直播尚未发布,无法开启直播!"),null;if(1==s){if(1==o)return a.showTip("您已经迟到超过一小时，无法再进行本场直播了"),null;if(-1==o)return a.showTip("您最多提前5分钟开启直播,请耐心等候"),null}return e.hasClass("m_disabled")?null:(e.addClass("m_disabled"),this.btnEndLive.removeClass("m_disabled"),this.roomInfo?void(this.roomInfo.imGroupid?n.startLive():i.createIMChatRoom(function(t){n.roomInfo.imGroupid=t.GroupId,n.startLive()},function(t){a.showError("创建房间失败,请稍后重试")})):(a.showError("没有获取到房间信息"),""))},startLive:function(){var t=this;t.startLiveParams.roomId=t.roomInfo.id,t.startLiveParams.imGroupId=t.roomInfo.imGroupid,t.startLiveModel.executeJSONP(this.startLiveParams,function(e){if(e&&e.success){var n="您已成功开启直播，下面是房间流信息：</br>视频连接："+e.data.livePushStreamUrl+"</br>视频流："+e.data.streamName;s.show({title:"开启直播成功",content:n,cancelBtn:!1}),t.startFlash(),Backbone.trigger("event:LiveShowStarted")}else a.showError(e.msg||"开启直播失败,请稍后重试")},function(t){a.showError(t.msg||"开启直播失败,请稍后重试")})},startFlash:function(){var t=this;t.flashAPI.onReady(function(){this.init(t.roomInfo)})},endLiveClick:function(t){var e=this;return this.btnEndLive.hasClass("m_disabled")?null:void s.show({title:"消息",content:"您确定要结束直播吗",okFn:function(){e.endLive(),window.location.href="/web/anchorsetting.html?view=history"},cancelFn:function(){}})},endLive:function(){var t=this;t.endLiveParams.roomId=t.roomInfo.id,t.endLiveModel.executeJSONP(t.endLiveParams,function(e){t.btnEndLive.addClass("m_disabled"),t.isLiveShowing=!1,a.showOK("结束直播操作成功"),Backbone.trigger("event:liveShowEnded")},function(t){a.showError(t.msg||"操作失败,稍后重试")})},roomInfoReady:function(t){t&&(this.roomInfo=t,this.changeButtonStatus(this.roomInfo.status))},defineEventInterface:function(){var t=this;Backbone.on("event:roomInfoReady",function(e){t.roomInfoReady(e)}),Backbone.on("event:updateRoomInfo",function(e){t.roomInfoReady(e)})},changeButtonStatus:function(t){var e=this.isTooLate(this.roomInfo.liveTime);switch(-1===e||1===e?(this.btnStartLive.addClass("m_disabled"),Backbone.trigger("event:stopLoopRoomInfo")):0===e&&this.btnStartLive.removeClass("m_disabled"),t){case 0:this.btnStartLive.addClass("m_disabled");break;case 2:this.btnStartLive.addClass("m_disabled").text("直播中"),this.btnEndLive.removeClass("m_disabled"),this.startFlash();break;case 3:this.btnStartLive.addClass("m_disabled"),this.btnEndLive.addClass("m_disabled")}}});t.exports=h},function(t,e,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/start.json?deviceinfo={{deviceinfo}}&access_token=web-{{accessToken}}&roomId={{roomId}}&imGroupId={{imGroupId}}",beforeEmit:function(t){}});t.exports=i},function(t,e,n){"use strict";var o=n(18),i=o.extend({url:"{{url_prefix}}/room/close.json?deviceinfo={{deviceinfo}}&access_token=web-{{access_token}}&roomId={{roomId}}",beforeEmit:function(t){}});t.exports=i},function(t,e){t.exports='<div class="endLive m_disabled">结束本次直播</div>\n<div class="startLive">开启直播</div>\n'},,,,,function(t,e){}]);