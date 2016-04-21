/**
 * Created by xiangwenwen on 16/4/13.
 * 通用模块,别名定义
 */

var path = require('path');
var containerPath = path.resolve('./');

//	别名列表
var alias = {
  config: path.resolve(containerPath,'./app/src/module/config'),
  tplEng: path.resolve(containerPath,'./app/link/artTemplate/dist/template'),
  UserModel: path.resolve(containerPath,'./app/src/module/UserModel/'),
  TopbarView: path.resolve(containerPath,'./app/src/module/topbar/'),
  IMModel: path.resolve(containerPath,'./app/src/module/IMModel/'),
  pwdencrypt: path.resolve(containerPath, './app/src/module/crypto/pwdencrypt'),
  'ui.Dialog': path.resolve(containerPath, './app/src/module/dialog'),
  'ui.MsgBox': path.resolve(containerPath, './app/src/module/msgbox')
};

module.exports = alias;
