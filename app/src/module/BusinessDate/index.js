
var BusinessDate = function (long) {
  this.temp = new Date();
  this.setCurNewDate(long);
};
/**
 * [changeYear 改变临时年份]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
BusinessDate.prototype.changeYear = function (value) {
  this.temp.setFullYear(value);
};
/**
 * [getCountDays 根据月份获取当前月的总天数]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
BusinessDate.prototype.getCountDays = function (value) {
  this.temp.setMonth(value);
  this.temp.setDate(0);
  return this.temp.getDate();
};
/**
 * [$get 获取当前的年月日时分]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
BusinessDate.prototype.$get = function (key) {
  return this.attrs[key];
};
/**
 * [ceilYear 向下获取年份]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
BusinessDate.prototype.ceilYear = function (value) {
  var val = ~~value;
  var i = 0;
  var year = this.$get('year');
  var result = [];
  for (; i <= val; i++) {
    result.push(year);
    year = year + 1;
  }
  return result;
};
BusinessDate.prototype._downDisplacement = function (key) {
  var start = this.$get(key);
  var result = [];
  var end;
  switch (key) {
    case 'month':
      end = 12;
      break;
    case 'day':
      end = this.getCountDays(this.$get('month'));
      break;
    case 'hours':
      end = 23;
      break;
    default:
      end = 59;
      break;
  }
  for (; start <= end; start++) {
    result.push(start);
  }
  return result;
};
/**
 * [downMonth 向下获取月份]
 * @return {[type]} [description]
 */
BusinessDate.prototype.downMonth = function () {
  return this._downDisplacement('month');
};
/**
 * [downDay 向下获取天数]
 * @return {[type]} [description]
 */
BusinessDate.prototype.downDay = function () {
  return this._downDisplacement('day');
};
/**
 * [downHours 向下获取小时]
 * @return {[type]} [description]
 */
BusinessDate.prototype.downHours = function () {
  return this._downDisplacement('hours');
};
/**
 * [downMinutes 向下获取分钟]
 * @return {[type]} [description]
 */
BusinessDate.prototype.downMinutes = function () {
  return this._downDisplacement('minutes');
};
/**
 * [down 向下获取函数式]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
BusinessDate.prototype.down = function (value) {
  return this._downDisplacement(value);
};
/**
 * [getTime 根据一个对象拼装一个时间对象获取时间毫秒]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
BusinessDate.prototype.getTime = function (obj) {
  var val = '';
  var month = obj.month < 10 ? '0' + obj.month : obj.month;
  var day = obj.day < 10 ? '0' + obj.day : obj.day;
  var hours = obj.hours < 10 ? '0' + obj.hours : obj.hours;
  var minutes = obj.minutes < 10 ? '0' + obj.minutes : obj.minutes;
  val += obj.year + '-' + month + '-' + day + ' ';
  val += hours + ':' + minutes + ':00';
  return new Date(val.replace(/-/g, '/')).getTime();
};
/**
 * [setCurNewDate 设置一个当前新的时间对象]
 */
BusinessDate.prototype.setCurNewDate = function (long) {
  this.date = null;
  this.date = long ? new Date(long) : new Date();
  this._setAttrs();
};
BusinessDate.prototype._setAttrs = function () {
  this.attrs = null;
  this.attrs = {
    year: this.date.getFullYear(),
    month: this.date.getMonth() + 1,
    day: this.date.getDate(),
    hours: this.date.getHours(),
    minutes: this.date.getMinutes()
  };
};
/**
 * [difference 根据一个毫秒差返回一个时分秒对象]
 * @param  {[type]} duration [description]
 * @return {[type]}          [description]
 */
BusinessDate.difference = function (duration) {
  var result = {};
  result.day = parseInt(duration / (24 * 3600 * 1000), 10);
  var leave1 = duration % (24 * 3600 * 1000);
  var hour = Math.floor(leave1 / (3600 * 1000));
  result.hours = hour < 10 ? '0' + hour : hour;
  var leave2 = leave1 % (3600 * 1000);
  var minutes = Math.floor(leave2 / (60 * 1000));
  result.minutes = minutes < 10 ? '0' + minutes : minutes;
  var leave3 = leave2 % (60 * 1000);
  var seconds = Math.floor(leave3 / 1000);
  result.seconds = seconds < 10 ? '0' + seconds : seconds;
  return result;
};
var shared = null;
BusinessDate.sharedInstanceBusinessDate = function () {
  if (!shared) {
    shared = new BusinessDate();
  }
  return shared;
};
BusinessDate.format = function (date, fmt) { // author: meizz
  var o = {
    'M+': date.getMonth() + 1,                 // 月份
    'd+': date.getDate(),                    // 日
    'h+': date.getHours(),                   // 小时
    'm+': date.getMinutes(),                 // 分
    's+': date.getSeconds(),                 // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds()             // 毫秒
  };
  var format = fmt;
  var k;
  var temp;
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      temp = (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length));
      format = format.replace(RegExp.$1, temp);
    }
  }
  return format;
};

module.exports = BusinessDate;
