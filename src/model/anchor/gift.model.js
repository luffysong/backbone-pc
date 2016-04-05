/**
 * @time 2015-03-24
 * @author {编写者}
 * @info 道具列表
 */

'use strict';

//var BaseModel = require('BaseModel');
//var sigleInstance = null;
//
//var Model = BaseModel.extend({
//	url:'http://beta.yinyuetai.com:7776/gift/list.json',//填写请求地址
//	setEnv: false,
//	beforeEmit:function(options){
//		// 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
//		// this.storageCache = true; //开启本地缓存
//		// this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
//	}
//	// formatter:function(response){
//	//		//formatter方法可以格式化数据
//	// }
//});
//
///**
// * 获取单例对象
// */
//Model.sigleInstance = function(){
//	if(!sigleInstance){
//		sigleInstance = new Model();
//	}
//	return sigleInstance;
//};
//
//module.exports = Model;

var sigleInstance = null;
var cacheData = null;

function GiftModel() {
}

GiftModel.prototype.get = function (data, okFn, errFn) {
    if (cacheData) {
        okFn && okFn(cacheData);
    }
    //http://beta.yinyuetai.com:7776/gift/list.json
    $.ajax('http://lapi.yinyuetai.com/gift/list.json', {
            method: 'GET',
            data: data,
            dataType: 'jsonp',
            jsonp: 'callback'
        })
        .done(function (res) {
            okFn && okFn(res);
            cacheData = res;
        })
        .fail(function (err) {
            errFn && errFn(err);
        });
};

GiftModel.prototype.findGift = function (giftId) {
    var list = cacheData.data;
    return _.find(list, function (item) {
        return item.giftId == giftId;
    });
};

GiftModel.sigleInstance = function () {
    if (!sigleInstance) {
        sigleInstance = new GiftModel();
    }
    return sigleInstance;
};

module.exports = GiftModel;
