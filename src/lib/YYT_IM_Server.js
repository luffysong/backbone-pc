/**
 * 主播控制
 */

'use strict';
var IMModel = require('./IMModel');

var YYTIMServer = {
  setting: {
    listeners: {
      onMsgNotify:null,
      onGroupInfoChangeNotify: null,
      groupSystemNotifys: null
    }
  }
};

/**
 * 初始化
 * @param options
 */
YYTIMServer.init = function(options) {
  this.options = options;
  this.setting = _.extend(this.setting, options);

  //腾讯IM初始化
  webim.init({}, this.setting.listeners, null);

  setTimeout(function(){
    console.log(122);
    onMsgNotify();
    onGroupInfoChangeNotify();
    groupSystemNotifys();
  }, 3000);
};

/**
 * 清屏
 */
YYTIMServer.clearScreen = function(){
  console.log('IM clear');
};

/**
 * 锁屏
 */
YYTIMServer.lockScreen = function () {
  console.log('IM lock');
};

/**
 * 禁言
 */
YYTIMServer.disableSendMsg = function() {
  console.log('IM disbale msg');
};

/**
 * 踢人
 */
YYTIMServer.removeUserFromGroup = function () {
  console.log('IM remove user');
};

/**
 * 消息通知回调
 */
YYTIMServer.msgNotify = function(callback) {

};

/**
 * 获取群组消息
 */
YYTIMServer.getRoomMsgs = function(callback){
  var data = [];
  var i = 1;
  while(true){
    if(i++ > 20){
      break;
    }
    data.push({
      name: 'Aaron-'+ i,
      msg: 'asdfasdfasfjaslfjasklfasdklf'+ i
    });
  }
  callback && callback.call(this,data);
};

/**
 * 腾讯IM收到消息通知的回调函数
 * @param notifyInfo
 */
function onMsgNotify(notifyInfo) {

  YYTIMServer.setting.listeners.onMsgNotify && YYTIMServer.setting.listeners.onMsgNotify(notifyInfo);

}


/**
 * 腾讯监听群组资料变更的回调函数
 * @param notifyInfo
 */
function onGroupInfoChangeNotify(notifyInfo) {

  YYTIMServer.setting.listeners.onGroupInfoChangeNotify && YYTIMServer.setting.listeners.onGroupInfoChangeNotify(notifyInfo);
}

/**
 * 用于监听（多终端同步）群系统消息的回调函数
 * @param notifyInfo
 */
function groupSystemNotifys(notifyInfo) {
  YYTIMServer.setting.listeners.groupSystemNotifys && YYTIMServer.setting.listeners.groupSystemNotifys(notifyInfo);
}


module.exports = YYTIMServer;