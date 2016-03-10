/**
 * 主播控制
 */

'use strict';


var YYTIMServer = {
  setting: {
    listeners: {
      onMsgNotify:null,
      onGroupInfoChangeNotify: null,
      groupSystemNotifys: null
    }
  }
};
console.log(YYTIMServer);
//var setting = {};
YYTIMServer.init = function(options) {
  this.options = options;
  this.setting = _.extend(this.setting, options);

};

/**
 * 清屏
 */
YYTIMServer.clearScreen = function(){

};

/**
 * 锁屏
 */
YYTIMServer.lockScreen = function () {

};

/**
 * 禁言
 */
YYTIMServer.disableSendMsg = function() {

};

/**
 * 踢人
 */
YYTIMServer.removeUserFromGroup = function () {

};

/**
 * 消息通知回调
 */
YYTIMServer.msgNotify = function(callback) {

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