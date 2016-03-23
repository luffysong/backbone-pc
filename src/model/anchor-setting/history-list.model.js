/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseModel = require('BaseModel');
var DateTime = require('DateTime');
var Model = BaseModel.extend({
    url: '{{url_prefix}}/room/end_list.json?deviceinfo={{deviceinfo}}&access_token=web-{{access_token}}&order={{order}}&offset={{offset}}&size={{size}}',//填写请求地址
    beforeEmit: function (options) {
        // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
        // this.storageCache = true; //开启本地缓存
        // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
    },
    formatter: function (response) {
        //formatter方法可以格式化数据
        var code = ~~response.code;
        if (code) {
            return response;
        }
        var data = response.data;
        var roomList = data.roomList;
        var l = roomList.length;
        while (l--) {
            var value = roomList[l];
            var d = DateTime.difference(value.duration > 0 ? value.duration : 0);
            value.diff = d.hours + ':' + d.minutes + ':' + d.seconds;
        }
        return response;
    }
});
module.exports = Model;