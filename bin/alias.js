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
  TopBarView: path.resolve(containerPath,'./app/src/module/TopBarView/'),
  IMModel: path.resolve(containerPath,'./app/src/module/IMModel/'),
  pwdencrypt: path.resolve(containerPath, './app/src/module/crypto/pwdencrypt'),
  secret: path.resolve(containerPath, './app/src/module/crypto/secret'),
  'ui.Dialog': path.resolve(containerPath, './app/src/module/dialog/'),
  'ui.confirm': path.resolve(containerPath, './app/src/module/confirm/'),
  'ui.msgBox': path.resolve(containerPath, './app/src/module/msgbox/'),
  loginBox: path.resolve(containerPath, './app/src/module/loginBox/'),
  BusinessDate: path.resolve(containerPath, './app/src/module/BusinessDate'),
  UploadFileDialog: path.resolve(containerPath, './app/src/module/UploadFileDialog/'),
  UploadFileJs:path.resolve(containerPath, './app/src/module/UploadFileDialog/upload/UploadFile'),
  auth: path.resolve(containerPath, './app/src/module/auth/'),
  imServer: path.resolve(containerPath, './app/src/module/webIM/IMServer'),
  FlashApi: path.resolve(containerPath, './app/src/module/FlashApi/'),
  Pagenation: path.resolve(containerPath, './app/src/module/pagenation')
};

module.exports = alias;
