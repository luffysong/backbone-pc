function hex_y(a) {
	return binl2hex(core_y(str2binl(a), a.length * 8));
}

function hex_y_16(c) {
	var a = hex_y(c);
	a = a.substring(8, 24);
	return y_vv(a);
}

function core_y(r, k) {
	r[k >> 5] |= 128 << ((k) % 32);
	r[ (((k + 64) >>> 9) << 4) + 14] = k;
	var q = 1732584193;
	var p = -271733879;
	var m = -1732584194;
	var l = 271733878;
	for (var g = 0; g < r.length; g += 16) {
		var j = q;
		var h = p;
		var f = m;
		var e = l;
		q = y_ff(q, p, m, l, r[g + 0], 7, -680876936);
		l = y_ff(l, q, p, m, r[g + 1], 12, -389564586);
		m = y_ff(m, l, q, p, r[g + 2], 17, 606105819);
		p = y_ff(p, m, l, q, r[g + 3], 22, -1044525330);
		q = y_ff(q, p, m, l, r[g + 4], 7, -176418897);
		l = y_ff(l, q, p, m, r[g + 5], 12, 1200080426);
		m = y_ff(m, l, q, p, r[g + 6], 17, -1473231341);
		p = y_ff(p, m, l, q, r[g + 7], 22, -45705983);
		q = y_ff(q, p, m, l, r[g + 8], 7, 1770035416);
		l = y_ff(l, q, p, m, r[g + 9], 12, -1958414417);
		m = y_ff(m, l, q, p, r[g + 10], 17, -42063);
		p = y_ff(p, m, l, q, r[g + 11], 22, -1990404162);
		q = y_ff(q, p, m, l, r[g + 12], 7, 1804603682);
		l = y_ff(l, q, p, m, r[g + 13], 12, -40341101);
		m = y_ff(m, l, q, p, r[g + 14], 17, -1502002290);
		p = y_ff(p, m, l, q, r[g + 15], 22, 1236535329);
		q = y_gg(q, p, m, l, r[g + 1], 5, -165796510);
		l = y_gg(l, q, p, m, r[g + 6], 9, -1069501632);
		m = y_gg(m, l, q, p, r[g + 11], 14, 643717713);
		p = y_gg(p, m, l, q, r[g + 0], 20, -373897302);
		q = y_gg(q, p, m, l, r[g + 5], 5, -701558691);
		l = y_gg(l, q, p, m, r[g + 10], 9, 38016083);
		m = y_gg(m, l, q, p, r[g + 15], 14, -660478335);
		p = y_gg(p, m, l, q, r[g + 4], 20, -405537848);
		q = y_gg(q, p, m, l, r[g + 9], 5, 568446438);
		l = y_gg(l, q, p, m, r[g + 14], 9, -1019803690);
		m = y_gg(m, l, q, p, r[g + 3], 14, -187363961);
		p = y_gg(p, m, l, q, r[g + 8], 20, 1163531501);
		q = y_gg(q, p, m, l, r[g + 13], 5, -1444681467);
		l = y_gg(l, q, p, m, r[g + 2], 9, -51403784);
		m = y_gg(m, l, q, p, r[g + 7], 14, 1735328473);
		p = y_gg(p, m, l, q, r[g + 12], 20, -1926607734);
		q = y_hh(q, p, m, l, r[g + 5], 4, -378558);
		l = y_hh(l, q, p, m, r[g + 8], 11, -2022574463);
		m = y_hh(m, l, q, p, r[g + 11], 16, 1839030562);
		p = y_hh(p, m, l, q, r[g + 14], 23, -35309556);
		q = y_hh(q, p, m, l, r[g + 1], 4, -1530992060);
		l = y_hh(l, q, p, m, r[g + 4], 11, 1272893353);
		m = y_hh(m, l, q, p, r[g + 7], 16, -155497632);
		p = y_hh(p, m, l, q, r[g + 10], 23, -1094730640);
		q = y_hh(q, p, m, l, r[g + 13], 4, 681279174);
		l = y_hh(l, q, p, m, r[g + 0], 11, -358537222);
		m = y_hh(m, l, q, p, r[g + 3], 16, -722521979);
		p = y_hh(p, m, l, q, r[g + 6], 23, 76029189);
		q = y_hh(q, p, m, l, r[g + 9], 4, -640364487);
		l = y_hh(l, q, p, m, r[g + 12], 11, -421815835);
		m = y_hh(m, l, q, p, r[g + 15], 16, 530742520);
		p = y_hh(p, m, l, q, r[g + 2], 23, -995338651);
		q = y_ii(q, p, m, l, r[g + 0], 6, -198630844);
		l = y_ii(l, q, p, m, r[g + 7], 10, 1126891415);
		m = y_ii(m, l, q, p, r[g + 14], 15, -1416354905);
		p = y_ii(p, m, l, q, r[g + 5], 21, -57434055);
		q = y_ii(q, p, m, l, r[g + 12], 6, 1700485571);
		l = y_ii(l, q, p, m, r[g + 3], 10, -1894986606);
		m = y_ii(m, l, q, p, r[g + 10], 15, -1051523);
		p = y_ii(p, m, l, q, r[g + 1], 21, -2054922799);
		q = y_ii(q, p, m, l, r[g + 8], 6, 1873313359);
		l = y_ii(l, q, p, m, r[g + 15], 10, -30611744);
		m = y_ii(m, l, q, p, r[g + 6], 15, -1560198380);
		p = y_ii(p, m, l, q, r[g + 13], 21, 1309151649);
		q = y_ii(q, p, m, l, r[g + 4], 6, -145523070);
		l = y_ii(l, q, p, m, r[g + 11], 10, -1120210379);
		m = y_ii(m, l, q, p, r[g + 2], 15, 718787259);
		p = y_ii(p, m, l, q, r[g + 9], 21, -343485551);
		q = safe_add(q, j);
		p = safe_add(p, h);
		m = safe_add(m, f);
		l = safe_add(l, e);
	}
	return Array(q, p, m, l);
}

function y_cmn(h, e, d, c, g, f) {
	return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d);
}

function y_ff(g, f, l, k, e, j, h) {
	return y_cmn((f & l) | ((~f) & k), g, f, e, j, h);
}

function y_gg(g, f, l, k, e, j, h) {
	return y_cmn((f & k) | (l & (~k)), g, f, e, j, h);
}

function y_hh(g, f, l, k, e, j, h) {
	return y_cmn(f ^ l ^ k, g, f, e, j, h);
}

function y_ii(g, f, l, k, e, j, h) {
	return y_cmn(l ^ (f | (~k)), g, f, e, j, h);
}

function safe_add(a, e) {
	var d = (a & 65535) + (e & 65535);
	var c = (a >> 16) + (e >> 16) + (d >> 16);
	return(c << 16) | (d & 65535);
}

function bit_rol(a, c) {
	return(a << c) | (a >>> (32 - c));
}

function str2binl(e) {
	var d = Array();
	var a = (1 << chrsz) - 1;
	for (var c = 0; c < e.length * chrsz; c += chrsz) {
		d[c >> 5] |= (e.charCodeAt(c / chrsz) & a) << (c % 32);
	}
	return d;
}

function binl2hex(d) {
	var c = "0123456789abcdef";
	var e = "";
	for (var a = 0; a < d.length * 4; a++) {
		e += c.charAt((d[a >> 2] >> ((a % 4) * 8 + 4)) & 15) + c.charAt((d[a >> 2] >> ((a % 4) * 8)) & 15);
	}
	return e;
}

function y_vv(d) {
	var a = "";
	for (var c = d.length - 1; c >= 0; c--) {
		a += d.charAt(c);
	}
	return a;
}

function yyt32(c, a) {
	if (a.length != 13) {
		alert("timesign error !!!");
		return "";
	}
	return hex_y(hex_y(c) + a.substring(5, 11));
}

function yyt16(c, a) {
	if (a.length != 13) {
		alert("timesign error !!!");
		return "";
	}
	return hex_y(hex_y_16(c) + a.substring(5, 11));
}

var chrsz = 8;
var Auxiliary = require('auxiliary-additions');
var cookie =  Auxiliary.cookie;

module.exports = function(p0) {
	var t1, t2, p1, p2;
	t1 = "" + (new Date()).getTime();
	t2 = y_vv(t1);
	if (p0 && p0.length != 0) {
		p1 = yyt32(p0, t1);
		p2 = yyt16(p0, t2);
	} else {
		p1 = yyt32(t1, t2);
		p2 = yyt16(t2, t1);
	}
	cookie.set('p2', p2, {
		domain : 'yinyuetai.com',
		path : '/'
	});
	return {
		_t : t1,
		_p1 : p1,
		_p2 : p2
	}
};