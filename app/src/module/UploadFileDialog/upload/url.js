/**
 * @time 2012年10月26日
 * @author icepy
 * @info 完成处理URL字符串
 *
 */

'use strict';
var urlString = [];
var location = window.location;

module.exports = {
	/**
	 * [parse 处理一个字符串URL]
	 * @param  {[String]} url [传入一个字符串url]
	 * @return {[Object]}     [返回一个object对象]
	 */
	parse: function(url) {
		var temp = document.createElement('a');
		temp.href = url;
		var result = {
			"port": temp.port,
			"protocol": temp.protocol.replace(':', ''),
			"hash": temp.hash.replace('#', ''),
			"host": temp.host,
			"href": temp.href,
			"hostname": temp.hostname,
			"pathname": temp.pathname,
			"search": temp.search,
			"query": {}
		};
		var seg = result.search.replace(/^\?/, '').split('&'),
			leng = seg.length,
			i = 0,
			target;
		for (; i < leng; i++) {
			if (!seg[i]) continue;
			target = seg[i].split('=');
			result.query[target[0]] = target[1];
		}
		temp = null;
		return result;
	},
	/**
	 * [format 拼接一个完整的url字符串]
	 * @param  {[String]} url [URL]
	 * @param  {[Object]} obj [需要拼接的query或者hash参数]
	 * @return {[String]}     [返回一个完整的URL字符串]
	 */
	format: function(url, obj) {
		var i = 0,
			query = obj.query,
			hash = obj.hash;
		urlString.length = 0;
		urlString.push(url.lastIndexOf('?') > -1 ? url : url + '?');
		if (query) {
			for (var key in query) {
				var val = query[key]
				if (!i) {
					i++;
					urlString.push(key + '=' + val)
				} else {
					urlString.push('&' + key + '=' + val);
				}
			}
		};
		if (hash) {
			urlString.push(hash.indexOf('#') > -1 ? hash : '#' + hash);
		};
		return urlString.join('');
	},
	/**
	 * [resolve 将参数 to 位置的字符解析到一个绝对路径里]
	 * @param  {[String]} from [源路径]
	 * @param  {[String]} to   [将被解析到绝对路径的字符串]
	 * @return {[String]}      [返回一个绝对路径字符串]
	 */
	resolve: function(from, to) {
		/**
		 *  路径描述 ./当前路径 ../父路径
		 */
		if (/^(.\/)/.test(to)) {
			to = to.replace(/^(.\/)/, '/');
		};

		if (/^(..\/)/.test(to)) {
			from = from.substr(0, from.lastIndexOf('/'));
			to = to.replace(/^(..\/)/, '/');
		};
		return from + to;
	},
	/**
	 * [extname 返回指定文件名的扩展名称]
	 * @param  {[String]} p [description]
	 * @return {[String]}   [description]
	 */
	extname: function(p) {
		var _p = p.split('.');
		return _p[_p.length - 1] || '';
	},
	/**
	 * [parseSearch 将search参数转换为obj]
	 * @param  {[type]} query [description]
	 * @return {[type]}       [description]
	 */
	parseSearch:function(query){
		var _query = {};
		var seg = query.replace(/^\?/, '').split('&'),
			leng = seg.length,
			i = 0,
			value,
			target;
		for (; i < leng; i++) {
			if (!seg[i]) continue;
			target = seg[i].split('=');
			value = target[1];
			if ((/^\[/.test(value) && /\]$/.test(value)) || (/^{/.test(value) || /\}$/.test(value))) {
				value = JSON.parse(value);
			};
			_query[target[0]] = value;
		}
		return _query;
	}
}
