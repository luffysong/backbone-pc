/**
 * @time 2015-03-24
 * @author {编写者}
 * @info 道具列表
 */

'use strict';

var sigleInstance = null;
var cacheData = null;
var _ = require('underscore');

function GiftModel() {
}

GiftModel.prototype.get = function (data, okFn, errFn) {
  if (cacheData && okFn) {
    okFn(cacheData);
  }
  $.ajax('http://lapi.yinyuetai.com/gift/list.json', {
    method: 'GET',
    data: data,
    dataType: 'jsonp',
    jsonp: 'callback'
  }).done(function (res) {
    if (res) {
      okFn(res);
    }
    cacheData = res;
  }).fail(function (err) {
    if (errFn) {
      errFn(err);
    }
  });
};

GiftModel.prototype.findGift = function (giftId) {
  var list = cacheData.data;
  return _.find(list, function (item) {
    return item.giftId === giftId;
  });
};

GiftModel.sharedInstanceModel = function () {
  if (!sigleInstance) {
    sigleInstance = new GiftModel();
  }
  return sigleInstance;
};

module.exports = GiftModel;
