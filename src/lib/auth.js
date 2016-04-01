/**
 * Created by AaronYuan on 4/1/16.
 *
 * 校验模块
 */

'use strict';

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var IMModel = require('./IMModel');
var imModel = IMModel.sharedInstanceIMModel();

module.exports = {
    onlyAnchorUse: function(url){
        imModel.fetchIMUserSig(function(sig){
            if (!sig.anchor) {
                window.location.href = url ||'/index.html';
            }
            //else{
            //    window.location.href = url || '/web/anchorsetting.html';
            //}
        }, function(){
            window.location.href = '/index.html';
        });
    }
};





