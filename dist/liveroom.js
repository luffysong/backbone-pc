webpackJsonp([7],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by AaronYuan on 4/22/16.
	 */
	
	var $ = __webpack_require__(1);
	
	$(function () {
	  'use strict';
	  var TopBarView = __webpack_require__(102);
	  var MainView = __webpack_require__(234);
	
	  var a = new TopBarView();
	
	  a = new MainView();
	
	  console.log(a);
	  __webpack_require__(238);
	});


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */
/***/ function(module, exports) {

	module.exports = window._;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var BaseView = __webpack_require__(29);
	var BaseModel = __webpack_require__(37);
	var BaseRouter = __webpack_require__(39);
	var ManagedObject = __webpack_require__(40);
	var storage = __webpack_require__(38);
	module.exports = {
	    'View':BaseView,
	    'Model':BaseModel,
	    'Router':BaseRouter,
	    'ManagedObject':ManagedObject,
	    'storage':storage
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2012年10月19日
	 * @author icepy
	 * @info 完成基础的View类
	 *
	 * @time 2016年2月27日
	 * @author icepy
	 * @info 改造兼容webpack打包
	 */
	
	'use strict';
	
	var Backbone = __webpack_require__(30);
	var tplEng = __webpack_require__(31);
	var warn = __webpack_require__(32);
	var Tools = __webpack_require__(35);
	var error = __webpack_require__(36);
	var uid = 999;
	var createID = function(){
		return 'view_'+(uid++)+'_'+(new Date().getTime())+Math.floor(Math.random(100)*100);
	};
	var BaseView = Backbone.View.extend({
		initialize:function(options){
			//初始化参数
			this._ICEOptions = options || {};
			if (_.isFunction(this.beforeMount)){
				this.beforeMount();
			}else{
				warn('推荐使用beforeMount钩子方法，用来初始化自定义属性');
			};
			if (this.router) {
				this.id = createID();
				this.$el.append('<div id="'+this.id+'"></div>');
				this.$el = this.$el.find('#'+this.id);
			};
			this._ICEinit();
			return this;
		},
		_ICEinit:function(){
			if (_.isFunction(this.rawLoader)) {
				this._template = this.rawLoader();
				if (this._template) {
					this.$el.append(this._template);
				};
			}
			if (typeof this.afterMount === 'function') {
				this.afterMount();
			}else{
				warn('推荐使用afterMount钩子方法，在此钩子方法中来获取DOM对象');
			};
			this._ICEObject();
		},
		_ICEObject:function(){
			this._ICEinitNode();
			this.__YYTPC__ = true;
			if (_.isFunction(this.ready)) {
				this.ready(this._ICEOptions);
			}else{
				error('一个View对象周期内必须实现ready钩子方法');
			};
		},
		_ICEinitEvent:function(){
			this.delegateEvents(this.events);
		},
		_ICEinitNode:function(){
			var self = this;
			this.$parent = this._ICEOptions.parent;
			this.$children  = [];
			this.$root = this.$parent ? this.$parent.$root : this;
			if (this.$parent && this.$parent.__YYTPC__) {
				this.$parent.$children.push(this);
			};
			this.on('hook:context',function(){
				var args = Tools.toArray(arguments);
				if (self && self.__YYTPC__) {
					if (_.isFunction(self.context)) {
						self.context.apply(self,args);
					}else{
						warn('未定义context上下文钩子方法');
					};
				};
			});
		},
		_ICEDestroy:function(){
			//实例销毁之前
			if (_.isFunction(this.beforeDestroy)) {
				this.beforeDestroy();
			};
			this.remove();
			this.undelegate();
			//实例销毁之后
			if (_.isFunction(this.destroyed)) {
				this.destroyed();
			};
		},
		/**
		 * [triggerHook 触发父对象的Hook]
		 * @return {[type]} [description]
		 */
		triggerContextHook:function(){
			if (this.$parent && this.$parent.__YYTPC__) {
				var args = Tools.toArray(arguments);
				var event = args[0];
				if (_.isString(event)) {
					args[0] = 'hook:context';
				}else{
					args.splice(0,0,'hook:context');
				};
				switch (event) {
					case 'root':
							this.$root.trigger.apply(this.$root,args);
						break;
					default:
							this.$parent.trigger.apply(this.$parent,args);
						break;
				}
			}else{
				warn('在View实例对象初始化时未指明对象的结构关系');
			}
		},
		/**
		 * [findDOMNode 查找DOM节点]
		 * @param  {[type]} exprs [description]
		 * @return {[type]}       [description]
		 */
		findDOMNode:function(exprs){
			return this.$el && this.$el.find(exprs);
		},
		/**
		 * [compileHTML 编译模板]
		 * @param  {[type]} tplStr [description]
		 * @param  {[type]} data   [description]
		 * @return {[type]}        [description]
		 */
		compileHTML:function(tplStr,data){
			return tplEng.compile(tplStr)(data);
		},
		/**
		 * [broadcast 触发所有子组件相应的事件]
		 * @param  {[type]} event [description]
		 * @return {[type]}       [description]
		 */
		broadcast:function(){
			var args = Tools.toArray(arguments);
			var children = this.$children;
			var i = 0;
			var j = children.length;
			for(;i<j;i++){
				var child = children[i];
				var propagate = child.trigger.apply(child,args);
				if(propagate){
					child.broadcast.apply(child,args);
				};
			}
			return this;
		},
		/**
		 * [dispatch 触发所有父组件相应的事件]
		 * @param  {[type]} event [description]
		 * @return {[type]}       [description]
		 */
		dispatch:function(){
			var args = Tools.toArray(arguments);
			var parent = this.$parent;
			while(parent){
				parent.trigger.apply(parent,args);
				parent = parent.$parent;
			}
			return this;
		},
		/**
		 * [destroy 销毁实例]
		 * @return {[type]} [description]
		 */
		destroy:function(){
			this._ICEOptions = null;
			this.$children.length = 0;
			this.$parent = null;
			this.$root = null;
			this._ICEDestroy();
		}
	});
	
	module.exports = BaseView;


/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = window.Backbone;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!art-template - Template Engine | http://aui.github.com/artTemplate/*/
	!function(){function a(a){return a.replace(t,"").replace(u,",").replace(v,"").replace(w,"").replace(x,"").split(/^$|,+/)}function b(a){return"'"+a.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}function c(c,d){function e(a){return m+=a.split(/\n/).length-1,k&&(a=a.replace(/\s+/g," ").replace(/<!--.*?-->/g,"")),a&&(a=s[1]+b(a)+s[2]+"\n"),a}function f(b){var c=m;if(j?b=j(b,d):g&&(b=b.replace(/\n/g,function(){return m++,"$line="+m+";"})),0===b.indexOf("=")){var e=l&&!/^=[=#]/.test(b);if(b=b.replace(/^=[=#]?|[\s;]*$/g,""),e){var f=b.replace(/\s*\([^\)]+\)/,"");n[f]||/^(include|print)$/.test(f)||(b="$escape("+b+")")}else b="$string("+b+")";b=s[1]+b+s[2]}return g&&(b="$line="+c+";"+b),r(a(b),function(a){if(a&&!p[a]){var b;b="print"===a?u:"include"===a?v:n[a]?"$utils."+a:o[a]?"$helpers."+a:"$data."+a,w+=a+"="+b+",",p[a]=!0}}),b+"\n"}var g=d.debug,h=d.openTag,i=d.closeTag,j=d.parser,k=d.compress,l=d.escape,m=1,p={$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1},q="".trim,s=q?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"],t=q?"$out+=text;return $out;":"$out.push(text);",u="function(){var text=''.concat.apply('',arguments);"+t+"}",v="function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);"+t+"}",w="'use strict';var $utils=this,$helpers=$utils.$helpers,"+(g?"$line=0,":""),x=s[0],y="return new String("+s[3]+");";r(c.split(h),function(a){a=a.split(i);var b=a[0],c=a[1];1===a.length?x+=e(b):(x+=f(b),c&&(x+=e(c)))});var z=w+x+y;g&&(z="try{"+z+"}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:"+b(c)+".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");try{var A=new Function("$data","$filename",z);return A.prototype=n,A}catch(B){throw B.temp="function anonymous($data,$filename) {"+z+"}",B}}var d=function(a,b){return"string"==typeof b?q(b,{filename:a}):g(a,b)};d.version="3.0.0",d.config=function(a,b){e[a]=b};var e=d.defaults={openTag:"<%",closeTag:"%>",escape:!0,cache:!0,compress:!1,parser:null},f=d.cache={};d.render=function(a,b){return q(a,b)};var g=d.renderFile=function(a,b){var c=d.get(a)||p({filename:a,name:"Render Error",message:"Template not found"});return b?c(b):c};d.get=function(a){var b;if(f[a])b=f[a];else if("object"==typeof document){var c=document.getElementById(a);if(c){var d=(c.value||c.innerHTML).replace(/^\s*|\s*$/g,"");b=q(d,{filename:a})}}return b};var h=function(a,b){return"string"!=typeof a&&(b=typeof a,"number"===b?a+="":a="function"===b?h(a.call(a)):""),a},i={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"},j=function(a){return i[a]},k=function(a){return h(a).replace(/&(?![\w#]+;)|[<>"']/g,j)},l=Array.isArray||function(a){return"[object Array]"==={}.toString.call(a)},m=function(a,b){var c,d;if(l(a))for(c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);else for(c in a)b.call(a,a[c],c)},n=d.utils={$helpers:{},$include:g,$string:h,$escape:k,$each:m};d.helper=function(a,b){o[a]=b};var o=d.helpers=n.$helpers;d.onerror=function(a){var b="Template Error\n\n";for(var c in a)b+="<"+c+">\n"+a[c]+"\n\n";"object"==typeof console&&console.error(b)};var p=function(a){return d.onerror(a),function(){return"{Template Error}"}},q=d.compile=function(a,b){function d(c){try{return new i(c,h)+""}catch(d){return b.debug?p(d)():(b.debug=!0,q(a,b)(c))}}b=b||{};for(var g in e)void 0===b[g]&&(b[g]=e[g]);var h=b.filename;try{var i=c(a,b)}catch(j){return j.filename=h||"anonymous",j.name="Syntax Error",p(j)}return d.prototype=i.prototype,d.toString=function(){return i.toString()},h&&b.cache&&(f[h]=d),d},r=n.$each,s="break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined",t=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,u=/[^\w$]+/g,v=new RegExp(["\\b"+s.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g"),w=/^\d[^,]*|,\d[^,]*/g,x=/^,+|,+$/g;e.openTag="{{",e.closeTag="}}";var y=function(a,b){var c=b.split(":"),d=c.shift(),e=c.join(":")||"";return e&&(e=", "+e),"$helpers."+d+"("+a+e+")"};e.parser=function(a,b){a=a.replace(/^\s/,"");var c=a.split(" "),e=c.shift(),f=c.join(" ");switch(e){case"if":a="if("+f+"){";break;case"else":c="if"===c.shift()?" if("+c.join(" ")+")":"",a="}else"+c+"{";break;case"/if":a="}";break;case"each":var g=c[0]||"$data",h=c[1]||"as",i=c[2]||"$value",j=c[3]||"$index",k=i+","+j;"as"!==h&&(g="[]"),a="$each("+g+",function("+k+"){";break;case"/each":a="});";break;case"echo":a="print("+f+");";break;case"print":case"include":a=e+"("+c.join(",")+");";break;default:if(-1!==f.indexOf("|")){var l=b.escape;0===a.indexOf("#")&&(a=a.substr(1),l=!1);for(var m=0,n=a.split("|"),o=n.length,p=l?"$escape":"$string",q=p+"("+n[m++]+")";o>m;m++)q=y(q,n[m]);a="=#"+q}else a=d.helpers[e]?"=#"+e+"("+c.join(",")+");":"="+a}return a}, true?!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return d}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!=typeof exports?module.exports=d:this.template=d}();

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2012年10月26日
	 * @author icepy
	 * @info 完成warn包装
	 */
	
	'use strict';
	
	var log = __webpack_require__(33);
	
	var warn = function(msg,e){
		log.warn(msg,e);
	}
	module.exports = warn;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * @time 2012年10月26日
	 * @author icepy
	 * @info debug信息打印
	 */
	
	'use strict';
	
	var log = {
		warn:function(){},
		error:function(){},
		info:function(){},
		dir:function(){}
	};
	if (process.env.NODE_ENV !== 'product') {
		var hasConsole =  typeof console !== undefined;
		log.warn = function(msg,e){
			if (hasConsole) {
				console.warn('[YYT PC Warning]:'+ msg);
				if (e) {
					throw e;
				}else{
					var warning = new Error('Warning Stack Trace');
					console.warn(warning.stack);
				}
			};
		};
		log.error = function(msg){
			var error = new Error(msg);
			throw error.stack;
		};
		log.info = function(msg){
			if (hasConsole) {
				console.info('[YYT PC INFO]'+msg);
			}
		};
		log.dir = function(tag){
			var arr = document.querySelectorAll(tag);
			if (arr && arr.length) {
				arr.forEach(function(element){
					console.dir(element);
				});
			}
		};
	}
	module.exports = log;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(34)))

/***/ },
/* 34 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * @time 2012年10月26日
	 * @author icepy
	 * @info 完成处理tools对象
	 */
	
	'use strict';
	
	(function (factory) {
	    var root = (typeof self == 'object' && self.self == self && self) ||
	        (typeof global == 'object' && global.global == global && global);
	    if (true) {
	        module.exports = factory();
	    } else if (typeof exports === 'object') {
	        exports['tools'] = factory()
	    } else {
	        if (!root.ICEPlugs) {
	            root.ICEPlugs = {};
	        }
	        root.ICEPlugs.tools = factory();
	    }
	})(function () {
	    var tools = {};
	    var toString = Object.prototype.toString;
	    var OBJECT_TYPE = '[object Object]';
	    /**
	     * [isPlainObject 判断是否为普通对象]
	     * @param  {[Object]}  obj [对象]
	     * @return {Boolean}
	     */
	    tools.isPlainObject = function (obj) {
	        return toString.call(obj) === OBJECT_TYPE;
	    };
	    /**
	     * [isObject 判断是否为对象]
	     * @param  {[*]}  obj [任意一个元素]
	     * @return {Boolean}
	     */
	    tools.isObject = function (obj) {
	        return obj !== null && typeof obj === 'object';
	    };
	    var hasOwnProperty = Object.prototype.hasOwnProperty;
	    /**
	     * [hasOwn 检查对象是否为自身的属性]
	     * @param  {[Object]}  obj [description]
	     * @param  {[String]}  key [description]
	     * @return {Boolean}     [description]
	     */
	    tools.hasOwn = function (obj, key) {
	        return hasOwnProperty.call(obj, key);
	    };
	    /**
	     * [toArray 类数组对象转数组]
	     * @param  {[Array-like]} list  [类数组]
	     * @param  {[Number]} index [起始索引]
	     * @return {[Array]}       [返回一个新的真实数组]
	     */
	    tools.toArray = function (list, index) {
	        index = index || 0;
	        var i = list.length - index;
	        var _array = new Array(i);
	        while (i--) {
	            _array[i] = list[i + index];
	        }
	        return _array;
	    };
	    /**
	     * [toType 导出类型字符串]
	     * @param  {[type]} value [description]
	     * @return {[type]}       [description]
	     */
	    tools.toType = function (value) {
	        return toString.call(value);
	    };
	    /**
	     * [exportToNumber 导出数字]
	     * @param  {[*]} value [description]
	     * @return {[*|Number]}       [description]
	     */
	    tools.exportToNumber = function (value) {
	        if (typeof value !== 'string') {
	            return value;
	        } else {
	            var number = Number(value);
	            return isNaN(number) ? value : number;
	        }
	    };
	
	    /**
	     * [isArray 判断是否为数组]
	     * @param  {*} value [description]
	     * @return {Boolean}       [description]
	     */
	    tools.isArray = function(obj){
	        return tools.toType(obj) === '[object Array]';
	    };
	
	    /**
	     * [mergeData 合并数据]
	     * @param  {obj} value [description]
	     * @param  {obj} value [description]
	     * @return {obj}       [description]
	     */
	    tools.mergeData = function(to,from){
	        var key,toVal,fromVal;
	        for(key in from){
	            toVal = to[key];
	            fromVal = from[key];
	            if (tools.isPlainObject(toVal) && tools.isPlainObject(fromVal)) {
	                tools.mergeData(toVal,fromVal);
	            }
	        }
	        return to;
	    };
	    return tools;
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2012年10月26日
	 * @author icepy
	 * @info 完成error包装
	 */
	
	'use strict';
	
	var log = __webpack_require__(33);
	
	var error = function(msg,e){
		log.error(msg,e);
	}
	module.exports = error;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2012年10月19日
	 * @author icepy
	 * @info 实现基础的模型类
	 *
	 * @time 2012年10月27日
	 * @author icepy
	 * @info 现实对请求进行本地缓存
	 *
	 * @time 2016年2月27日
	 * @author icepy
	 * @info 改造兼容webpack打包以及扩展Model
	 *
	 */
	
	
	'use strict';
	var Backbone = __webpack_require__(30)
	var storage = __webpack_require__(38);
	var Tools = __webpack_require__(35);
	var warn = __webpack_require__(32);
	var uid = 1314;
	var expiration = storage.expiration;
	var BaseModel = Backbone.Model.extend({
		initialize:function(options){
			if (_.isFunction(this.beforeEmit)) {
				this.beforeEmit(options);
			};
			this._url = this.url;
		},
		_ICEFetch:function(options){
			this.fetch(options);
		},
		_ICESave:function(HTTPBody,options){
			this.save(HTTPBody,options);
		},
		_ICEDestroy:function(options){
			this.destroy(options);
		},
		_ICEJSONP:function(parameter,options){
			$.ajax($.extend({
				url:this.url,
				data:parameter || {},
				dataType:'jsonp',
				jsonp:'callback'
			},options));
		},
		_ICESendHelper:function(message,defer){
			var self = this;
			if (message.url) {
				//如果存在url，将this的url替换
				this.url = message.url;
			};
			var options = {};
			options.beforeSend = function(xhr,setting){
				for(var key in this.headers){
					xhr.setRequestHeader(key,this.headers[key]);
				}
			};
			options.success = function(model,response,afterSetting){
				response = self._ICEProcessData(response);
				defer.resolve.call(model,response,afterSetting.xhr);
			}
			options.error = function(model,xhr){
				defer.reject.call(model,xhr);
			}
			switch(message.type){
				case 'POST':
					this._ICESave(message.HTTPBody,options);
					break;
				case 'PUT':
					var id = message.HTTPBody.id;
					if(!id && id !== 0){
						message.HTTPBody.id = 'icepy'+(uid++);
					};
					this._ICESave(message.HTTPBody,options);
					break;
				case 'DELETE':
					this._ICEDestroy(options);
					break;
				case 'JSONP':
					this._ICEJSONP(message.parameter,{
						success:function(response,state,xhr){
							response = self._ICEProcessData(response);
							defer.resolve.call(self,response,state,xhr);
						},
						error:function(xhr,state,errors){
							defer.reject.call(self,xhr,state,errors);
						}
					});
					break;
				default:
					this._ICEFetch(options);
					break;
			}
		},
		_ICESendMessage:function(message,defer){
			var self = this;
			if (this.storageCache && this.expiration){
				if (!storage.enabled){
					this._ICESendHelper(message,defer);
				}else{
					var data = expiration.get(this.url);
					if (!data) {
						this._ICESendHelper(message,defer);
						return false;
					};
					setTimeout(function(){
						data = self._ICEProcessData(data,true);
						defer.reslove(data)
					},50);
				};
			}else{
				this._ICESendHelper(message,defer);
			};
		},
		_ICEProcessData:function(response,before){
			//如果自定义了formatter方法，先对数据进行格式化
			if (_.isFunction(this.formatter)) {
				response = this.formatter(response);
			};
			//如果开启了缓存，对数据源进行本地存储
			if (this.storageCache && this.expiration && !before) {
				if (storage.enabled){
					expiration.set(this.url,response,this.expiration);
				};
			};
			this.set(response);
			return response;
		},
		/**
		 * [execute GET请求简化版]
		 * @param  {[type]} success [description]
		 * @param  {[type]} error   [description]
		 * @return {[type]}         [description]
		 */
		execute:function(){
			var defer = $.Deferred();
			var message = {
				type:'GET'
			};
			var args = Tools.toArray(arguments);
			var g = args.splice(0,1)[0];
			if (Tools.isPlainObject(g)) {
				message = _.extend(message,g);
			}
			this._ICESendMessage(message,defer);
			return defer.promise();
		},
		/**
		 * [executeGET 发起GET请求]
		 * @param  {[type]} success [description]
		 * @param  {[type]} error   [description]
		 * @return {[type]}         [description]
		 */
		executeGET:function(){
			var message = {
				type:'GET'
			};
			return this.execute(message);
		},
		/**
		 * [executePOST 发起POST请求]
		 * @param  {[type]} HTTPBody [description]
		 * @param  {[type]} success  [description]
		 * @param  {[type]} error    [description]
		 * @return {[type]}          [description]
		 */
		executePOST:function(HTTPBody){
			var message = {
				type:'POST',
				HTTPBody:HTTPBody
			};
			return this.execute(message);
		},
		/**
		 * [executePUT 发起PUT请求]
		 * @param  {[type]} HTTPBody [description]
		 * @param  {[type]} success  [description]
		 * @param  {[type]} error    [description]
		 * @return {[type]}          [description]
		 */
		executePUT:function(HTTPBody){
			var message = {
				type:'PUT',
				HTTPBody:HTTPBody
			};
			return this.execute(message);
		},
		/**
		 * [executeDELETE 发起delete请求]
		 * @return {[type]} [description]
		 */
		executeDELETE:function(){
			var message = {
				type:'DELETE'
			};
			return this.execute(message);
		},
		/**
		 * [executeJSONP 发起JSONP跨域请求]
		 * @param  {[type]} success [description]
		 * @param  {[type]} error   [description]
		 * @return {[type]}         [description]
		 */
		executeJSONP:function(parameter){
			var message = {
				type:'JSONP',
				parameter:parameter
			};
			return this.execute(message);
		},
		/**
		 * [setChangeURL 辅助拼接URL参数]
		 * @param {[type]} parameter [description]
		 */
		setChangeURL:function(parameter){
			var url = ''
			if (!parameter) {
				return this.url;
			};
			for(var key in parameter){
				var value = parameter[key];
				if (!url.length) {
					url += '?'+key+'='+value;
				}else{
					url += '&'+key+'='+value;
				};
			};
			this.url = this._url + url;
		},
		/**
		 * [setHeaders 设置XHR 头信息]
		 * @param {[string|object]} headers [description]
		 */
		setHeaders:function(){
			if (!this.headers) {
				this.headers = {};
			};
			var args = Tools.toArray(arguments);
			if (args.length === 1) {
				var headers = args[0];
				for(var key in headers){
					this.headers[key] = headers[key];
				}
			}else{
				if (args.length) {
					var key = args[0];
					var value = args[1];
					this.headers[key] = value;
				}
			}
		},
		/**
		 * [setUpdateStorage 将实体数据更新到本地缓存]
		 * @return {[type]} [description]
		 */
		setUpdateStorage:function(){
			if (storage.enabled){
				expiration.set(self.url,this.manager.$get(),self.expiration);
			};
		}
	});
	module.exports = BaseModel;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * @time 2012年10月27日
	 * @author icepy
	 * @info 封装完成本地缓存API
	 *
	 * @time 2016年2月27日
	 * @author icepy
	 * @info 改造兼容webpack打包
	 */
	
	'use strict';
	
	(function(factory) {
		var root = (typeof self == 'object' && self.self == self && self) ||
			(typeof global == 'object' && global.global == global && global);
		if(true){
			module.exports = factory();
		}else if(typeof exports === 'object'){
			exports['storage'] = factory()
		}else{
			if (!root.ICEPlugs) {
				root.ICEPlugs = {};
			};
			root.ICEPlugs.storage = factory();
		};
	})(function() {
		var store = {};
		var _window = window;
		var localStorageName = 'localStorage';
		var sessionStorageName = 'sessionStorage';
		var rootKey = 'ICEStorageCache';
		var storage, session;
		var isLocalStorageNameSupported = function() {
			try {
				return (localStorageName in _window && _window[localStorageName]);
			} catch (err) {
				return false;
			}
		};
		var isSessionStorageNameSupported = function() {
			try {
				return (sessionStorageName in _window && _window[sessionStorageName]);
			} catch (err) {
				return false;
			}
		};
		store.disabled = false;
		store.version = '0.0.1';
		/**
		 * [has 根据Key判断是否存在]
		 * @param  {[String]}  key [description]
		 * @return {Boolean}     [description]
		 */
		store.has = function(key) {
			return store.get(key) !== undefined;
		};
	
		/**
		 * [transact 有存储是否成功的回调函数]
		 * @param  {[String]} key           [description]
		 * @param  {[String]} defaultVal    [description]
		 * @param  {[type]} transactionFn [description]
		 */
		store.transact = function(key, defaultVal, transactionFn) {
			if (transactionFn == null) {
				transactionFn = defaultVal;
				defaultVal = null;
			}
	
			if (defaultVal == null) {
				defaultVal = {};
			}
	
			var val = store.get(key, defaultVal);
			transactionFn(val);
			store.set(key, val);
		};
		/**
		 * [serialize 对象转字符串]
		 * @param  {[Object]} value [description]
		 * @return {[String]}       [description]
		 */
		store.serialize = function(value) {
			return JSON.stringify(value);
		};
		/**
		 * [deserialize 字符串格式化对象]
		 * @param  {[String]} value [description]
		 * @return {[Object]}       [description]
		 */
		store.deserialize = function(value) {
			if (typeof value != 'string') {
				return undefined;
			}
			try {
				return JSON.parse(value);
			} catch (e) {
				return value || undefined;
			}
		};
		if (isLocalStorageNameSupported()) {
			storage = _window[localStorageName];
			/**
			 * [set  存储本地缓存]
			 * @param {[String]} key [description]
			 * @param {[Object]} val [description]
			 */
			store.set = function(key, val) {
				if (val === undefined) {
					return store.remove(key);
				}
				storage.setItem(key, store.serialize(val));
				return val;
			};
	
			/**
			 * [get 获取本地缓存]
			 * @param  {[String]} key        [description]
			 * @param  {[type]} defaultVal [description]
			 * @return {[Boolean]}            [description]
			 */
			store.get = function(key, defaultVal) {
				var val = store.deserialize(storage.getItem(key));
				return (val === undefined ? defaultVal : val);
			};
	
			/**
			 * [remove 根据key名删除一个本地缓存]
			 * @param  {[String]} key [description]
			 */
			store.remove = function(key) {
				storage.removeItem(key);
			};
	
			/**
			 * [clear 清除所有的本地缓存]
			 */
			store.clear = function() {
				storage.clear();
			};
	
			/**
			 * [getAll description]
			 * @return {[Object]} [description]
			 */
			store.getAll = function() {
				var ret = {};
				store.forEach(function(key, val) {
					ret[key] = val;
				});
				return ret;
			};
			store.forEach = function(callback) {
				for (var i = 0; i < storage.length; i++) {
					var key = storage.key(i);
					callback(key, store.get(key));
				}
			};
			//可以设置过期时间
			store.expiration = {
				/**
				 * [set 存储可以设置过期时间的本地缓存]
				 * @param {[String]} key [description]
				 * @param {[Object]} val [description]
				 * @param {[Number]} exp [description]
				 */
				set: function(key, val, exp) {
					//exp 接受自然整数，以一小时60分钟为单位
					var Root = store.get(rootKey) || {};
					Root[key] = {
						val: val,
						exp: exp * (1000 * 60 * 60),
						time: new Date().getTime()
					};
					store.set(rootKey, Root);
				},
				/**
				 * [get 获取有过期时间的本地缓存]
				 * @param  {[String]} key [description]
				 * @return {[*]}     [*]
				 */
				get: function(key) {
					var Root = store.get(rootKey);
					if (!Root) {
						//根节点不存在
						return null;
					};
					var info = Root[key];
					if (!info) {
						return null;
					}
					if (new Date().getTime() - info.time > info.exp) {
						return null;
					}
					return info.val
				},
				getAll: function() {
					var Root = store.get(rootKey);
					return Root || null;
				},
				resetSave: function(val) {
					store.set(rootKey, val);
				}
			};
			if (isSessionStorageNameSupported()) {
				session = _window[sessionStorageName];
				//会话模式
				store.session = {
					/**
					 * [set 存储一个会话]
					 * @param {[String]} key [description]
					 * @param {[*]} val [*]
					 */
					set: function(key, val) {
						if (val === undefined) {
							return store.remove(key);
						}
						var stayStore;
						if (Object.prototype.toString.call(val) === '[object Object]') {
							stayStore = store.serialize(val);
						} else {
							stayStore = val;
						};
						session.setItem(key, stayStore);
					},
					/**
					 * [get 获取一个会话]
					 * @param  {[String]} key [description]
					 * @return {[Boolean]}     [description]
					 */
					get: function(key) {
						var val = store.deserialize(session.getItem(key));
						return (val === undefined ? defaultVal : val);
					}
				}
			};
		}
		try {
			var testKey = '__storeJs__';
			store.set(testKey, testKey);
			if (store.get(testKey) != testKey) {
				store.disabled = true;
			}
			store.remove(testKey);
		} catch (e) {
			store.disabled = true;
		}
		store.enabled = !store.disabled;
		if (store.enabled) {
			var modelCache = store.expiration.getAll();
			if (modelCache) {
				for (var cacheKey in modelCache) {
					var cache = modelCache[cacheKey];
					if (new Date().getTime() - cache.time > cache.exp) {
						cache = null;
						delete modelCache[cacheKey]
					}
				}
			};
			store.expiration.resetSave(modelCache);
		};
		return store;
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2016年3月21日
	 * @author icepy
	 * @info 基于路由的生命周期
	 */
	
	'use strict'
	
	var Backbone = __webpack_require__(30);
	var warn = __webpack_require__(32);
	var stack = [];
	var routerHash = {};
	var curr = null;
	var router = null;
	var routerHashTop = function(key) {
	    return routerHash[key];
	};
	var routerHashRmove = function(key) {
	    delete routerHash[key];
	};
	var BaseRouter = Backbone.Router.extend({
	    addLifeCycleHelper: function(name, view, parameter) {
	        var top = routerHashTop(name);
	        var stackCheckHandler = function() {
	            if (curr) {
	                //视图隐藏或者销毁之前
	                if (_.isFunction(router.viewWillDisappear)) {
	                    router.viewWillDisappear.call(curr);
	                }else{
	                    if (router.dealloc) {
	                        warn('销毁实例{dealloc = true}之前必须存在viewWillDisappear，在此进行解除其他对象的引用或者调用（每个）destroy方法');
	                    };
	                };
	                if (router.dealloc) {
	                    //进入实例销毁流程
	                    curr.destroy();
	                    var obj = routerHashTop(curr._router);
	                    if (obj) {
	                        routerHashRmove(curr._router);
	                        stack.splice(stack.indexOf(curr.cid), 1);
	                        obj = null;
	                    };
	                }
	                //视图隐藏或者销毁之后
	                if (_.isFunction(router.viewDidDisappear)) {
	                    router.viewDidDisappear.call(curr);
	                };
	            }
	        }
	        if (top) {
	            stackCheckHandler();
	            curr = null;
	            curr = top;
	            curr.trigger('viewWillAppear');
	        } else {
	            stackCheckHandler();
	            curr = parameter ? new view({
	                '$parameter': parameter
	            }) : new view();
	            stack.push(curr.cid);
	            curr._router = name;
	            curr._didLoad = false; //记录viewDidLoad跟随路由呈现的生命周期状态
	            router = curr.router;
	            routerHash[name] = curr;
	            //视图呈现的生命周期只会触发一次
	            curr.once('viewDidLoad', function() {
	                if (_.isFunction(router.viewDidLoad)) {
	                    router.viewDidLoad.call(curr);
	                }else{
	                    warn('基于路由的Root Component，必须存在viewDidLoad钩子');
	                };
	                if (!curr._didLoad) {
	                    curr._didLoad = true;
	                    curr.trigger('viewDidAppear');
	                };
	            });
	            //视图将要呈现之前
	            curr.on('viewWillAppear', function() {
	                if (_.isFunction(router.viewWillAppear)) {
	                    router.viewWillAppear.call(curr);
	                }else{
	                    warn('基于路由的Root Component，必须存在viewWillAppear');
	                };
	                if (!curr._didLoad) {
	                    //viewDidLoad事件还未触发
	                    curr.trigger('viewDidLoad');
	                }else{
	                    curr.trigger('viewDidAppear');
	                };
	            });
	            //视图已经呈现之后
	            curr.on('viewDidAppear', function() {
	                if (_.isFunction(router.viewDidAppear)) {
	                    router.viewDidAppear.call(curr);
	                }else{
	                    warn('基于路由的Root Component，必须存在viewDidAppear');
	                };
	            });
	            curr.trigger('viewWillAppear');
	        }
	        return curr;
	    }
	});
	module.exports = BaseRouter;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2016年3月29日
	 * @author icepy
	 * @info 实体管理类
	 */
	var Tools = __webpack_require__(35);
	var baseModelSort = [];
	
	var ManagedObject = function(options){
	    options = options || {};
	    this.entity = options.entity || {};
	};
	
	ManagedObject.prototype.$update = function(obj){
	    var entity = _.extend(this.entity,obj);
	    this.entity = null;
	    this.entity = entity;
	};
	/**
	 * [$get 从实体中获取数据，无参将返回所有数据，参数使用.结构化表达式（this.$get('items.0.id')）]
	 * @param  {[type]} expression [description]
	 * @return {[type]}            [description]
	 */
	ManagedObject.prototype.$get = function(expression){
	    if (!expression) {
	        return this.entity;
	    }
	    var attrNodes = expression.split('.');
	    var lh = attrNodes.length;
	    if (lh > 0) {
	        var node = attrNodes[0];
	        var i = 0;
	        var entity = this.entity;
	        while(node){
	            i++
	            entity = entity[node];
	            node = attrNodes[i];
	        }
	        return entity;
	    }
	};
	/**
	 * [$set 向实体内部更新数据，以key/value的方式，第一个参数使用结构化表达式，第二个参数可以是任意类型的数据]
	 * @param {[type]} expression [description]
	 * @param {[type]} value      [description]
	 */
	ManagedObject.prototype.$set = function(expression,value,options){
	    if (expression === null || expression === undefined) {
	        return this;
	    };
	    if (Tools.isPlainObject(expression)) {
	        this.entity = null;
	        this.entity = expression;
	        return this.entity;
	    };
	    var attrNodes = expression.split('.');
	    var lh = attrNodes.length;
	    if (lh > 0) {
	        var i = 0;
	        var node = attrNodes[i];
	        var entity = this.entity;
	        if (lh !== 1) {
	            while(node){
	                i++
	                entity = entity[node];
	                node = attrNodes[i];
	                if (i > (lh - 2)) {
	                    break;
	                }
	            }
	        }
	        switch(Tools.toType(entity)){
	            case '[object Object]':
	                entity[node] = value;
	                break;
	            case '[object Array]':
	                entity[Tools.exportToNumber(node)] = value;
	                break;
	            default:
	                entity = value;
	                break;
	        };
	    }
	};
	/**
	 * [$filter 向实体内部的某项数据进行筛选，第一个参数是要筛选数据的.结构化表达式，第二个参数是筛选根据]
	 * @param  {[type]} expression [description]
	 * @param  {[type]} value      [description]
	 * @return {[type]}            [description]
	 */
	ManagedObject.prototype.$filter = function(expression,value){
	    var data = this.$get(expression);
	    var result = [];
	    if (Tools.isArray(data)) {
	        var i = data.length;
	        var n;
	        while(i--){
	            var val = data[i];
	            switch(Tools.toType(value)){
	                case '[object Object]':
	                    n = true;
	                    for(var k in value){
	                        if (!(val[k] === value[k])) {
	                            n = null;
	                            break;
	                        }
	                    }
	                    break
	                case '[object Function]':
	                    n = value(val,i);
	                    break
	                default:
	                    n = (val === value);
	                    break
	            };
	            if (n) {
	                result.push(val)
	            };
	        };
	    };
	    return result;
	};
	/**
	 * [$sort 对实体内部的某项数据进行排序，第二个参数是要排序数据的.结构化表达式，第二个参数是排序的根据]
	 * @param  {[type]} expression [description]
	 * @param  {[type]} value      [description]
	 * @return {[type]}            [description]
	 */
	ManagedObject.prototype.$sort = function(expression,value){
	    // > 大于 true
	    // < 小于 false
	    var data = this.$get(expression);
	    baseModelSort.length = 0;
	    if (Tools.isArray(data)) {
	        switch(Tools.toType(value)){
	            case '[object Function]':
	                baseModelSort = this._sort(data,value)
	                break
	            default:
	                if (typeof value === 'string') {
	                    var attrNodes = value.split('.');
	                    var logic = null;
	                    var lh = attrNodes.length - 1;
	                    switch(attrNodes[lh]){
	                        case '>':
	                            logic = true;
	                            break
	                        case '<':
	                            logic = false;
	                            break
	                        default:
	                            return baseModelSort;
	                            break
	                    };
	                    if (logic !== null) {
	                        return this._sort(data,function(val1,val2){
	                            var node = attrNodes[0];
	                            var i = 0;
	                            while(node){
	                                val1 = val1[node];
	                                val2 = val2[node];
	                                i++
	                                if (i === lh) {
	                                    break;
	                                };
	                                node = attrNodes[i];
	                            }
	                            if (logic) {
	                                return val1 > val2;
	                            }else{
	                                return val1 < val2;
	                            };
	                        });
	                    }
	
	                };
	                break
	        }
	    };
	    return baseModelSort;
	};
	
	ManagedObject.prototype._sort = function(data,fun){
	    var n = data.length;
	    if (n < 2) {
	        return data;
	    };
	    var i = 0;
	    var j = i+1;
	    var logic,temp,key;
	    for(;i<j;i++){
	        for(j = i+1;j<n;j++){
	            logic = fun.call(this,data[i],data[j]);
	            key = (typeof logic === 'number' ? logic : !!logic ? 1 : 0) > 0 ? true : false;
	            if (key) {
	                temp = data[i];
	                data[i] = data[j];
	                data[j] = temp;
	            }
	        }
	    }
	    return data;
	};
	
	module.exports = ManagedObject;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Auxiliary=t():e.Auxiliary=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){var r=n(1),o=n(2),i=n(3),a=n(4),s=n(5),c=n(7);e.exports={url:r,sheet:o,isNativeFunction:i,cookie:a,AjaxForm:s,UploadFile:c}},function(e,t){"use strict";var n=[];window.location;e.exports={parse:function(e){var t=document.createElement("a");t.href=e;for(var n,r={port:t.port,protocol:t.protocol.replace(":",""),hash:t.hash.replace("#",""),host:t.host,href:t.href,hostname:t.hostname,pathname:t.pathname,search:t.search,query:{}},o=r.search.replace(/^\?/,"").split("&"),i=o.length,a=0;i>a;a++)o[a]&&(n=o[a].split("="),r.query[n[0]]=n[1]);return t=null,r},format:function(e,t){var r=0,o=t.query,i=t.hash;if(n.length=0,n.push(e.lastIndexOf("?")>-1?e:e+"?"),o)for(var a in o){var s=o[a];r?n.push("&"+a+"="+s):(r++,n.push(a+"="+s))}return i&&n.push(i.indexOf("#")>-1?i:"#"+i),n.join("")},resolve:function(e,t){return/^(.\/)/.test(t)&&(t=t.replace(/^(.\/)/,"/")),/^(..\/)/.test(t)&&(e=e.substr(0,e.lastIndexOf("/")),t=t.replace(/^(..\/)/,"/")),e+t},extname:function(e){var t=e.split(".");return t[t.length-1]||""},parseSearch:function(e){for(var t,n,r={},o=e.replace(/^\?/,"").split("&"),i=o.length,a=0;i>a;a++)o[a]&&(n=o[a].split("="),t=n[1],(/^\[/.test(t)&&/\]$/.test(t)||/^{/.test(t)||/\}$/.test(t))&&(t=JSON.parse(t)),r[n[0]]=t);return r}}},function(e,t){"use strict";function n(){var e=document.createElement("style");return e.appendChild(document.createTextNode("")),document.head.appendChild(e),e.sheet}e.exports=n()},function(e,t){"use strict";function n(e){var t=typeof e;return"function"===t?a.test(o.call(e)):e&&"object"===t&&i.test(r.call(e))||!1}e.exports=n;var r=Object.prototype.toString,o=Function.prototype.toString,i=/^\[object .+?Constructor\]$/,a=RegExp("^"+String(r).replace(/[.*+?^${}()|[\]\/\\]/g,"\\$&").replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$")},function(e,t){"use strict";function n(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function r(e){function t(r,o,i){var a;if(arguments.length>1){if(i=n({path:"/"},t.defaults,i),"number"==typeof i.expires){var s=new Date;s.setMilliseconds(s.getMilliseconds()+864e5*i.expires),i.expires=s}try{a=JSON.stringify(o),/^[\{\[]/.test(a)&&(o=a)}catch(c){}return o=e.write?e.write(o,r):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),r=encodeURIComponent(String(r)),r=r.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),r=r.replace(/[\(\)]/g,escape),document.cookie=[r,"=",o,i.expires&&"; expires="+i.expires.toUTCString(),i.path&&"; path="+i.path,i.domain&&"; domain="+i.domain,i.secure?"; secure":""].join("")}r||(a={});for(var p=document.cookie?document.cookie.split("; "):[],l=/(%[0-9A-Z]{2})+/g,u=0;u<p.length;u++){var f=p[u].split("="),h=f[0].replace(l,decodeURIComponent),d=f.slice(1).join("=");'"'===d.charAt(0)&&(d=d.slice(1,-1));try{if(d=e.read?e.read(d,h):e(d,h)||d.replace(l,decodeURIComponent),this.json)try{d=JSON.parse(d)}catch(c){}if(r===h){a=d;break}r||(a[h]=d)}catch(c){}}return a}return t.get=t.set=t,t.getJSON=function(){return t.apply({json:!0},[].slice.call(arguments))},t.defaults={},t.remove=function(e,r){t(e,"",n(r,{expires:-1}))},t.withConverter=r,t}e.exports=r(function(){})},function(e,t,n){"use strict";var r=(n(1),n(6)),o=function(e){e=e||{},this.$el="string"==typeof e.el?$(e.el):e.el,this.uid=r("AjaxForm-"),this.loadState=!1,this._init()};o.prototype._init=function(){var e=$.Deferred();$.extend(this,e.promise()),this._createIframe(),this._addEvent(e)},o.prototype._createIframe=function(){var e='<iframe id="'+this.uid+'" name="'+this.uid+'"  style="display: none;" src="about:blank"></iframe>';this.$el.attr("target",this.uid),this.$el.append(e),this._iframe=$("#"+this.uid),$("<input />").attr({type:"hidden",name:"cross_post",value:"1"}).appendTo(this.$el)},o.prototype._addEvent=function(e){var t=this;this._iframe.on("load",function(){if(t.loadState){var n=this.contentWindow,r=n.location;if("about:blank"===r.href)e.reject(n);else try{var o=this._iframe[0].contentWindow.document.body;innerText=o.innerText,innerText||(innerText=o.innerHTML),innerText&&e.resolve($.parseJSON(innerText))}catch(i){e.resolve(n)}t.loadState=!1}})},o.prototype.encrypto=function(e){var t=this;$.each(e,function(e,n){var r=t.$el.find("[name="+e+"]");0===r.length?$("<input />").attr({type:"hidden",name:e,value:n}).appendTo(t.$el):r.val(n)})};var i=null;o.sharedInstanceAjaxForm=function(e,t){return i||(t=t||{},t.el=e,i=new o(t)),i},o.classInstanceAjaxForm=function(e,t){return t=t||{},t.el=e,new o(t)},e.exports=o},function(e,t){function n(e){var t=++r+"";return e?e+t:t}e.exports=n;var r=0},function(e,t,n){"use strict";var r=n(1),o=n(5),i=n(6),a=function(e){if(this.$el="string"==typeof e.el?$(e.el):e.el,this.uid=i("UploadFile-"),this.options=e,this._data=e.data||{},this._filename=e.filename||"image",this._url=e.url,!this._url)return void console.warn("配置上传URL");this._init();var t=$.Deferred();$.extend(this,t.promise()),this.ajaxForm=o.classInstanceAjaxForm(this.$el,{type:"img"}),this.ajaxForm.done(function(e){var n=e.location,o=decodeURIComponent(n.search),i=r.parseSearch(o);t.resolve(i)}),this.ajaxForm.fail(function(){t.reject(this)})};a.prototype._init=function(){this._createElement()},a.prototype._createElement=function(){var e="";for(var t in this._data){var n=this._data[t],r=Object.prototype.toString.call(n);"[object Object]"!==r&&"[object Array]"!==r||(n=JSON.stringify(n)),e+='<input type="hidden" name="'+t+"\" value='"+n+"'/>"}e+='<input type="file" class="opacity0 upload-file '+this.options.className+'" name="'+this._filename+'"  />',this.$el.attr("method","POST"),this.$el.attr("action",this._url),this.$el.attr("enctype","multipart/form-data"),this.$el.append(e)},a.prototype.parseErrorMsg=function(e){if(e&&"SUCCESS"==e.state)return!0;var t=1*e.errCode||0;switch(t){case 29:return"上传的文件太大了,请重新上传";case 31:return"请上传JPGE,JPG,PNG,GIF等格式的图片文件"}return"文件上传失败,请重新上传"},a.prototype.submit=function(){this.ajaxForm.loadState=!0,"function"==typeof this._before&&this._before(),this.$el.submit()};var s=null;a.sharedInstanceUploadFile=function(e){return s||(s=new a(e)),s},a.classInstanceUploadFile=function(e){return new a(e)},e.exports=a}])});
	//# sourceMappingURL=auxiliary.min.js.map

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 主播控制
	 */
	
	'use strict';
	var base = __webpack_require__(28);
	var IMModel = __webpack_require__(43);
	var imModel = IMModel.sharedInstanceIMModel();
	var store = base.storage;
	var webim = window.webim;
	var _ = __webpack_require__(27);
	var $ = __webpack_require__(1);
	
	var imServer = {
	  setting: {
	    listeners: {
	      onMsgNotify: null,
	      onGroupInfoChangeNotify: null,
	      groupSystemNotifys: null
	    }
	  }
	};
	
	/**
	 * 初始化
	 * @param options
	 */
	imServer.init = function (options) {
	  var self = this;
	  var defer = imModel.fetchIMUserSig();
	  defer.then(function (imSig) {
	    var loginInfo = {
	      sdkAppID: imSig.imAppid, // 用户所属应用id
	      appIDAt3rd: imSig.imAppid, // 用户所属应用id
	      accountType: imSig.imAccountType, // 用户所属应用帐号类型
	      identifier: imSig.imIdentifier, // 当前用户ID
	      userSig: imSig.userSig // 当前用户身份凭证
	    };
	    self.im = imSig;
	    if (imSig && options) {
	      // 腾讯IM初始化
	      webim.init(loginInfo, options, null);
	    }
	  }, function (err) {
	    console.log(err);
	  });
	};
	
	/**
	 * 发送消息
	 *
	 */
	imServer.sendMessage = function (attrs, okFn, errFn) {
	  var currentSession = webim.MsgStore.sessByTypeId('GROUP', attrs.groupId);
	  var random = Math.floor(Math.random() * 10000);
	  var sendMsg;
	  var msg;
	  if (!currentSession) {
	    // var currentSession = new webim.Session('GROUP', attrs.groupId, attrs.groupId, '', random);
	    currentSession = new webim.Session('GROUP', attrs.groupId, attrs.groupId, '', random);
	  }
	
	  if (currentSession) {
	    sendMsg = new webim.Msg(currentSession, true);
	    msg = new webim.Msg.Elem('TIMCustomElem', {
	      data: JSON.stringify(attrs.msg)
	    });
	    // sendMsg.addText(msg);
	    sendMsg.elems.push(msg);
	    sendMsg.fromAccount = this.im.imIdentifier;
	    webim.sendMsg(sendMsg, function (resp) {
	      if (okFn) {
	        okFn(resp);
	      }
	    }, function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    });
	  }
	};
	
	
	/**
	 * 清屏
	 */
	imServer.clearScreen = function (args) {
	  this.sendMessage(args);
	};
	
	/**
	 * 锁屏
	 */
	imServer.lockScreen = function () {
	  console.log('IM lock');
	};
	
	/**
	 * 禁言
	 // options = {
	    //     'GroupId': '',
	    //     'Members_Account': [],
	    //     'ShutUpTime': time
	    // };
	 */
	imServer.disableSendMsg = function (options, okFn, errFn) {
	  var time = webim.Tool.formatTimeStamp(Math.round(new Date().getTime() / 1000) + 10 * 60);
	  var ops;
	
	  time = new Date(time + '').getTime();
	  ops = _.extend({
	    ShutUpTime: time
	  }, options);
	
	  webim.forbidSendMsg(
	    ops,
	    function (resp) {
	      if (okFn) {
	        okFn(resp);
	      }
	    },
	    function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    }
	  );
	};
	
	/**
	 * 踢人
	 * options : {GroupId: '', MemberToDel_Account: []}
	 */
	imServer.removeUserFromGroup = function (options, okFn, errFn) {
	  if (!options || !options.GroupId || options.MemberToDel_Account.length <= 0) {
	    if (errFn) {
	      errFn({
	        msg: '参数不正确'
	      });
	    }
	  }
	  webim.deleteGroupMember(
	    options,
	    function (resp) {
	      if (okFn) {
	        okFn(resp);
	      }
	    },
	    function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    }
	  );
	};
	
	/**
	 * 消息通知回调
	 */
	imServer.msgNotify = function () {
	
	};
	
	/**
	 * 获取群组消息
	 */
	imServer.getRoomMsgs = function (callback) {
	  var data = [];
	  var i = 1;
	  while (true) {
	    if (i++ > 20) {
	      break;
	    }
	    data.push({
	      name: 'Aaron-' + i,
	      msg: 'asdfasdfasfjaslfjasklfasdklf' + i
	    });
	  }
	  if (callback) {
	    callback.call(this, data);
	  }
	};
	
	/**
	 * 创建聊天群
	 */
	imServer.createIMChatRoom = function (okFn, errFn) {
	  var imSig = store.get('imSig');
	  var options = {
	    Owner_Account: imSig.imIdentifier,
	    Type: 'ChatRoom', // Private/Public/ChatRoom
	    Name: '测试聊天室',
	    Notification: '',
	    Introduction: '',
	    MemberList: []
	  };
	
	  webim.createGroup(
	    options,
	    function (resp) {
	      if (okFn) {
	        okFn(resp);
	      }
	    },
	    function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    }
	  );
	};
	
	imServer.applyJoinGroup = function (groupId, okFn, errFn) {
	  var options = {
	    GroupId: groupId,
	    ApplyMsg: '直播间',
	    UserDefinedField: ''
	  };
	  webim.applyJoinGroup(
	    options,
	    function (resp) {
	      if (okFn) {
	        okFn(resp);
	      }
	    },
	    function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    }
	  );
	};
	
	/**
	 * 获取群组消息
	 * @param groupId
	 * @param okFn
	 * @param errFn
	 */
	imServer.getGroupInfo = function (groupId, okFn, errFn) {
	  var options = {
	    GroupIdList: [
	      groupId
	    ],
	    GroupBaseInfoFilter: [
	      'Type',
	      'Name',
	      'Introduction',
	      'Notification',
	      'FaceUrl',
	      'CreateTime',
	      'Owner_Account',
	      'LastInfoTime',
	      'LastMsgTime',
	      'NextMsgSeq',
	      'MemberNum',
	      'MaxMemberNum',
	      'ApplyJoinOption'
	    ],
	    MemberInfoFilter: [
	      'Account',
	      'Role',
	      'JoinTime',
	      'LastSendMsgTime',
	      'ShutUpUntil'
	    ]
	  };
	  webim.getGroupInfo(
	    options,
	    function (resp) {
	      if (okFn) {
	        okFn(resp);
	      }
	    },
	    function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    }
	  );
	};
	
	/**
	 * 修改群组消息
	 * @param options
	 *      { GroupId: 1, Name: 'xx', Notification: '', Introduction: ''}
	 * @param okFn
	 * @param errFn
	 */
	imServer.modifyGroupInfo = function (options, okFn, errFn) {
	  webim.modifyGroupBaseInfo(
	    options,
	    function (resp) {
	      if (okFn) {
	        okFn(resp);
	      }
	    },
	    function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    }
	  );
	};
	
	/**
	 * 修改组内成员角色
	 */
	imServer.modifyGroupMember = function (ops) {
	  var defer = $.Deferred();
	  console.log(ops);
	  var options = _.extend({
	    GroupId: '',
	    Member_Account: '',
	    Role: ''
	  }, ops);
	  webim.modifyGroupMember(
	    options,
	    function (resp) {
	      defer.resolve(resp);
	    },
	    function (err) {
	      defer.reject(err);
	    }
	  );
	  return defer.promise();
	};
	
	module.exports = imServer;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var $ = __webpack_require__(1);
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var storage = base.storage;
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/user/sig_get.json',
	  beforeEmit: function () {
	    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
	    // this.storageCache = true; //开启本地缓存
	    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	    this.notTokenURL = this.url;
	    this.imData = null;
	  },
	  /**
	   * [isAnchor 判断是否为主播]
	   * @return {Boolean} [description]
	   */
	  isAnchor: function () {
	    return !!this.get('data').anchor;
	  },
	  setTokenUrl: function (token) {
	    this.imData = {
	      deviceinfo: '{"aid":"30001001"}',
	      access_token: 'web-' + token
	    };
	  },
	  setNoTokenUrl: function () {
	    this.imData = {
	      deviceinfo: '{"aid":"30001001"}'
	    };
	  },
	  /**
	   * [fetchIMUserSig 获取IM签名]
	   * @param  {Function} callback [description]
	   * @param  {[type]}   error    [description]
	   * @return {[type]}            [description]
	   */
	  fetchIMUserSig: function () {
	    //  先获取本地签名
	    var defer = $.Deferred();
	    var token;
	    var imSig;
	    imSig = storage.get('imSig');
	    if (imSig) {
	      this.set({
	        data: imSig
	      });
	      defer.resolve(imSig);
	      return defer.promise();
	    }
	    token = user.getToken();
	    if (token) {
	      this.setTokenUrl(token);
	    }
	    var sigModelPromise = this.executeJSONP(this.imData);
	    sigModelPromise.done(function (response) {
	      var data = response.data;
	      storage.set('imSig', data);
	      defer.resolve(data);
	    });
	    sigModelPromise.fail(function (e) {
	      defer.reject(e);
	    });
	    return defer.promise();
	  },
	  //  更新缓存
	  updateIMUserSig: function () {
	    var defer = $.Deferred();
	    var token;
	    storage.remove('imSig');
	    token = user.getToken();
	    if (token) {
	      this.setTokenUrl(token);
	    }
	    var sigModelPromise = this.executeJSONP();
	    sigModelPromise.done(function (response) {
	      var data = response.data;
	      storage.set('imSig', data);
	      defer.resolve(data);
	    });
	    sigModelPromise.fail(function (e) {
	      defer.reject(e);
	    });
	    return defer.promise();
	  },
	  remove: function () {
	    storage.remove('imSig');
	  }
	});
	
	var shared = null;
	Model.sharedInstanceIMModel = function () {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	module.exports = Model;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var config = {
	  scheme: 'release',
	  env: {
	    alpha: {
	      url_prefix: 'http://beta.yinyuetai.com:9019'
	    },
	    beta: {
	      url_prefix: 'http://beta.yinyuetai.com:9019'
	    },
	    release: {
	      url_prefix: 'http://lapi.yinyuetai.com'
	    }
	  },
	  prefix: '',
	  domains: {
	    urlStatic: 'http://s.yytcdn.com',
	    loginSite: 'http://login.yinyuetai.com',
	    mainSite: 'http://www.yinyuetai.com',
	    mvSite: 'http://mv.yinyuetai.com',
	    homeSite: 'http://i.yinyuetai.com',
	    vchartSite: 'http://vchart.yinyuetai.com',
	    commentSite: 'http://comment.yinyuetai.com',
	    playlistSite: 'http://pl.yinyuetai.com',
	    searcresiehSite: 'http://so.yinyuetai.com',
	    vSite: 'http://v.yinyuetai.com',
	    fanSite: '',
	    paySite: '',
	    tradeSite: '',
	    shopSite: '',
	    vipSite: ''
	  }
	};
	
	if (process.env.NODE_ENV !== 'product') {
	  config.scheme = 'beta';
	  // config.prefix = '/www';
	}
	module.exports = config;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(34)))

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by YYT on 2016/4/20.
	 */
	var base = __webpack_require__(28);
	var Auxiliary = __webpack_require__(41);
	var _ = __webpack_require__(27);
	var BaseModel = base.Model;
	var Dialog = __webpack_require__(46);
	var loginBox = __webpack_require__(50);
	var cookie = Auxiliary.cookie;
	var Config = __webpack_require__(44);
	var domains = Config.domains;
	var checkEmailTemplate = __webpack_require__(54);
	var checkEmailHTML = checkEmailTemplate.replace('{homeSite}', domains.homeSite);
	var loginbox = loginBox().dialog;
	
	var CheckVIPModel = BaseModel.extend({
	  url: 'http://vip.yinyuetai.com/vip/check-vip',
	  setEnv: true,
	  beforeEmit: function () {
	    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
	    // this.storageCache = true; //开启本地缓存
	    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
	  }
	});
	
	var FetchUserInfoForDB = BaseModel.extend({
	  url: domains.loginSite + '/login-info',
	  setEnv: true,
	  beforeEmit: function () {
	    //  如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
	    //  this.storageCache = true; //开启本地缓存
	    //  this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
	  }
	});
	
	var UserModel = BaseModel.extend({
	  setEnv: true,
	  beforeEmit: function () {
	    //  如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
	    //  this.storageCache = true; //开启本地缓存
	    //  this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
	    this.checkVIPModel = new CheckVIPModel();
	    this.fetchUserInfoForDBModel = new FetchUserInfoForDB();
	  },
	  /**
	   * [isLogined 判断用户是否登录]
	   * @return {Boolean} [description]
	   */
	  isLogined: function () {
	    return !!this.getToken();
	  },
	  /**
	   * [login 检查是否登录，如果未登录调出对话框]
	   * @param  {Function} callback [description]
	   * @param  {[type]}   onCancel [description]
	   * @return {[type]}            [description]
	   */
	  login: function () {
	    var defer = $.Deferred();
	    if (this.isLogined()) {
	      //  已经登录
	      defer.resolve();
	    } else {
	      loginbox.trigger('show');
	      loginbox.once('hide', function () {
	        defer.resolve();
	      });
	    }
	    return defer.promise();
	  },
	  /**
	   * [getUserInfo 获取用户信息]
	   * @param  {[type]}   key      [description]
	   * @param  {Function} callback [description]
	   * @return {[type]}            [description]
	   */
	  getUserInfo: function (key, callback) {
	    var value;
	    var email;
	    var self = this;
	    var _key = key;
	    var _callback = callback;
	    var getParam = function () {
	      if (_.isFunction(_key)) {
	        return self.get();
	      }
	      return self.get(_key);
	    };
	    if (this.isLogined()) {
	      email = this.get('isEmailVerified');
	      if (!_callback) {
	        _callback = _key;
	      }
	      if (email) {
	        if (_.isFunction(_callback)) {
	          value = getParam();
	          _callback.call(this, value);
	        }
	      } else {
	        this.fetchUserInfo(function () {
	          if (_.isFunction(_callback)) {
	            value = getParam();
	            _callback.call(self, value);
	          }
	        });
	      }
	    }
	  },
	  /**
	   * [checkUserEmail 检查用户是否绑定邮箱]
	   * @param  {Function} callback [description]
	   * @return {[type]}            [description]
	   */
	  checkUserEmail: function (callback) {
	    var self = this;
	    this.getUserInfo('isEmailVerified', function (isEmailVerified) {
	      if (isEmailVerified) {
	        if (typeof callback === 'function') {
	          callback.call(self);
	        }
	      } else {
	        Dialog.classInstanceDialog(checkEmailHTML, {
	          title: '邮箱验证',
	          width: 400,
	          height: 100,
	          isAutoShow: true
	        });
	      }
	    });
	  },
	  /**
	   * [checkVIPUser 检查是否为VIP用户]
	   * @return {[type]} [description]
	   */
	  checkUserVIP: function (success, error) {
	    var vip;
	    var self = this;
	    if (this.isLogined()) {
	      this.login(function () {
	        self.fetchVIPInfo(success, error);
	      });
	    } else {
	      vip = this.get('vipInfo');
	      if (vip) {
	        if (vip && !vip.error && vip.realVip && ~~vip.realVip > 0) {
	          success(vip);
	        }
	      } else {
	        this.fetchVIPInfo(success, error);
	      }
	    }
	  },
	  /**
	   * [emit 初始化]
	   * @return {[type]} [description]
	   */
	  emit: function () {
	    var token = this.getToken();
	    var uinf = cookie.get('u_inf');
	    if (token) {
	      if (uinf && uinf.length > 0) {
	        this.readUserInfoForCookie(uinf);
	      } else {
	        this.fetchUserInfo();
	      }
	    }
	  },
	  /**
	   * [isVIPUser 判断是否是vip用户]
	   * @return {Boolean} [description]
	   */
	  isVIPUser: function () {
	    var list;
	    var token;
	    var val;
	    token = cookie.get('token');
	    if (token) {
	      list = token.split('.');
	      if (list.length > 2) {
	        val = list[2];
	        return ~~val[0] > 0;
	      }
	    }
	    return false;
	  },
	  /**
	   * [readUserInfoForCookie 从cookie中读取用户信息]
	   * @param  {[type]} u_inf [description]
	   * @return {[type]}       [description]
	   */
	  readUserInfoForCookie: function (uinfs) {
	    var uinf;
	    var users;
	    var splitChar;
	    splitChar = String.fromCharCode(2);
	    uinf = decodeURIComponent(uinfs);
	    users = uinf.split(splitChar);
	    this.set({
	      userId: ~~users[0],
	      userName: users[1],
	      bigheadImg: users[4]
	    });
	  },
	  /**
	   * [fetchUserInfo 获取用户信息]
	   * @param  {Function} callback [description]
	   * @return {[type]}            [description]
	   */
	  fetchUserInfo: function (callback) {
	    var self = this;
	    var promise = this.fetchUserInfoForDBModel.executeJSONP();
	    promise.done(function (response) {
	      self.set(response);
	      if (_.isFunction(callback)) {
	        callback.call(self);
	      }
	    });
	    promise.fail(function () {
	      if (_.isFunction(callback)) {
	        callback.call(self.e);
	      }
	    });
	  },
	  /**
	   * [fetchVIPInfo 获取vip信息]
	   * @return {[type]}         [description]
	   */
	  fetchVIPInfo: function () {
	    var self = this;
	    var defer = $.Deferred();
	    var promise = this.checkVIPModel.executeJSONP();
	    promise.done(function (result) {
	      if (result && !result.error) {
	        if ((result.realVip && parseInt(result.realVip, 10) > 0) || result.isWo) {
	          self.set('vipInfo', result);
	          defer.resolve.call(self, result);
	        }
	      }
	    });
	    promise.fail(function (e) {
	      defer.reject.call(self, e);
	    });
	    return defer.promise();
	  },
	  /**
	   * [getToken 获取token]
	   * @return {[type]} [description]
	   */
	  getToken: function () {
	    return cookie.get('token');
	  },
	  getWebToken: function () {
	    var token = cookie.get('token');
	    return token ? ('web-' + token) : '';
	  },
	  /**
	   * [getUserId 获取userId]
	   * @return {[type]} [description]
	   */
	  getUserId: function () {
	    return this.get('userId');
	  }
	});
	
	
	var shared = null;
	UserModel.sharedInstanceUserModel = function () {
	  if (!shared) {
	    shared = new UserModel();
	    shared.on('change:userId', function () {
	      shared.trigger('login');
	    });
	    shared.emit();
	  }
	  return shared;
	};
	
	UserModel.get = function (name) {
	  if (shared) {
	    return shared.get(name);
	  }
	  return null;
	};
	
	module.exports = UserModel;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info 场控管理列表
	 */
	
	'use strict';
	var base = __webpack_require__(28);
	var BaseView = base.View; // View的基类
	var Mask = __webpack_require__(47);
	var mask;
	var uid = 999;
	var _ = __webpack_require__(27);
	
	var View = BaseView.extend({
	  clientRender: false,
	  events: {
	    //  监听事件
	    'click .J_close': '_close'
	  },
	  //  当模板挂载到元素之前
	  beforeMount: function () {
	    this.id = 'YYT_UI_Dialog' + (uid++);
	    this.options = {
	      width: '',    // box宽度
	      height: '',   // box高度
	      hasMark: true, // 是否显示遮罩层
	      hasClose: true,    // 是否显示关闭按钮
	      isRemoveAfterHide: true,   // 隐藏后是否自动销毁相关dom
	      isAutoShow: true,  // 是否自动显示dialog
	      title: '',
	      className: '',
	      effect: 'fade',    // 显示效果 可选none, fade
	      draggable: false,
	      mainClass: 'dialog',
	      closeClass: 'ico_close J_close icons close',
	      closeText: '关闭',
	      onShow: function () {
	      },
	      onHide: function () {
	      }
	    };
	    this.options = _.extend(this.options, this._ICEOptions);
	    this._status = false;
	    this.$el = $('<div id="' + this.id + '" class="' + this.options.mainClass + '"/>')
	      .append(this.$el.show())
	      .addClass(this.options.className)
	      .appendTo(document.body);
	    this.$title = this.$el.find('.upload-title');
	    this._ICEinitEvent();
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    this.closeTemp = __webpack_require__(48);
	    this.titleTemp = __webpack_require__(49);
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function () {
	    this._renderTitle();
	    this._renderClose();
	    this._adjustPosition();
	    this.on('show', function () {
	      this._status = true;
	      this._toggle('show');
	    });
	    this.on('hide', function () {
	      this._status = false;
	      this._toggle('hide');
	    });
	    this.on('show', this.options.onShow, this.$el);
	    this.on('hide', this.options.onHide, this.$el);
	    if (this.options.isAutoShow) {
	      this.trigger('show');
	    }
	    if (typeof this.options.attached === 'function') {
	      this.options.attached.call(this);
	    }
	  },
	  _renderTitle: function () {
	    var title = this.options.title;
	    if (title) {
	      this.$title.text(title);
	      //  var titleHTML = this.titleTemp.replace('{{title}}',title);
	      //  this.$title = $(titleHTML).prependTo(this.$el);
	    }
	  },
	  _renderClose: function () {
	    var self = this;
	    var id = 'dialogClose' + (uid++);
	    var closeHTML;
	    if (this.options.hasClose) {
	      closeHTML = this.compileHTML(this.closeTemp, {
	        closeClass: this.options.closeClass,
	        closeText: this.options.closeText,
	        id: id
	      });
	      $(closeHTML).attr('hidefocus', 'true').appendTo(this.$el);
	      $('#' + id).on('click', function (e) {
	        e.preventDefault();
	        self.hide();
	      });
	    }
	  },
	  _adjustPosition: function () {
	    var size = {
	      width: this.options.width || this.$el.innerWidth(),
	      height: this.options.height ? this.options.height : this.$el.innerHeight()
	    };
	    this.$el.css(_.extend({
	      marginLeft: -(size.width / 2),
	      marginTop: -(size.height / 2)
	    }, size));
	  },
	  _close: function () {
	    this.trigger('hide');
	  },
	  _toggle: function (action) {
	    var effect = this.options.effect;
	    var self = this;
	    if (action === 'show') {
	      if (effect === 'none') {
	        this.$el.css('display', 'block');
	      } else if (effect === 'fade') {
	        this.$el.fadeIn();
	      }
	    } else if (action === 'hide') {
	      if (effect === 'none') {
	        this.$el.css('display', 'none');
	      } else if (effect === 'fade') {
	        this.$el.fadeOut();
	      }
	      if (this.options.isRemoveAfterHide) {
	        setTimeout(function () {
	          self.$el.remove();
	        }, 2000);
	      }
	    }
	    this._toggleMask(action);
	  },
	  _toggleMask: function (action) {
	    if (this.options.hasMark) {
	      if (action === 'show') {
	        mask.show();
	      } else if (action === 'hide') {
	        mask.hide();
	      }
	    }
	  },
	  status: function () {
	    return this._status ? 'show' : 'hide';
	  },
	  show: function () {
	    this.trigger('show');
	    return this;
	  },
	  hide: function () {
	    this.trigger('hide');
	    return this;
	  },
	  destroy: function () {
	    this.$el.remove();
	    mask.hide();
	  },
	  resize: function (width, height) {
	    this.options.width = width;
	    this.options.height = height;
	    this._adjustPosition();
	    return this;
	  },
	  title: function (title) {
	    if (this.$title) {
	      this.$title.html(title);
	    }
	    return this;
	  }
	});
	var shared = null;
	View.sharedInstanceDialog = function (options) {
	  if (!shared) {
	    if (!mask) {
	      mask = Mask.classInstanceMask();
	    }
	    shared = new View(options || {});
	  }
	  return shared;
	};
	View.classInstanceDialog = function (content, options) {
	  var ops = options || {};
	  ops.el = content || '<b>11111111</b>';
	  if (!mask) {
	    mask = Mask.classInstanceMask();
	  }
	  return new View(ops);
	};
	module.exports = View;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var base = __webpack_require__(28);
	var BaseView = base.View; //  View的基类
	var doc = $(document);
	var isIE6 = navigator.userAgent.indexOf('MSIE 6.0') !== -1;
	var style = {
	  position: isIE6 ? 'absolute' : 'fixed',
	  top: 0,
	  left: 0,
	  width: '100%',
	  height: isIE6 ? doc.outerHeight(true) : '100%',
	  display: 'none',
	  'z-index': 998,
	  opacity: 0.2,
	  'background-color': 'black'
	};
	var View = BaseView.extend({
	  clientRender: false,
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    this.element = $('<iframe/>').attr({
	      frameborder: 0,
	      scrolling: 'no'
	    }).css(style).appendTo(document.body);
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function () {
	
	  },
	  show: function () {
	    this.element.fadeIn();
	  },
	  hide: function () {
	    this.element.fadeOut();
	  }
	});
	
	var shared = null;
	View.sharedInstanceMask = function () {
	  if (!shared) {
	    shared = new View();
	  }
	  return shared;
	};
	View.classInstanceMask = function () {
	  return new View();
	};
	module.exports = View;


/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = "<!-- <a  href=\"\" id=\"{{id}}\" class=\"{{closeClass}}\">{{if closeText}}{{closeText}}{{/if}}</a> -->\n<a  href=\"\" id=\"{{id}}\" class=\"{{closeClass}} icons am-yyt-close close-white\"></a>\n"

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = "<h3 class=\"dialog_title J_title\">{{title}}</h3>\n"

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var Auxiliary = __webpack_require__(41);
	// Diglog类
	var Dialog = __webpack_require__(46);
	var AjaxForm = Auxiliary.AjaxForm;
	var url = Auxiliary.url;
	var pwdencrypt = __webpack_require__(51);
	var loginBoxTemp = __webpack_require__(52);
	var tplEng = __webpack_require__(31);
	var secret = __webpack_require__(53);
	// 邮件
	var EMAIL_PATTERN =
	  /^([a-zA-Z0-9_\.\-\+])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	// 数字
	var NUMBER_PATTERN =
	  /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$/;
	
	/* 标记是否极验验证通过 */
	var isGeetest = false;
	var Geetest;
	var errorinfo;
	var email;
	var password;
	var loginBoxForm;
	var ajaxForm;
	var dialog;
	var user;
	
	// 验证成功
	window.gt_custom_ajax = function (result) {
	  var info;
	  if (result) {
	    isGeetest = true;
	    info = loginBoxForm.find('.errorinfo');
	    if (info.html() === '拖动滑块完成验证') {
	      info.css('visibility', 'hidden');
	    }
	  }
	};
	
	// 加密字段
	function _setFocusEffect(input) {
	  if (input.attr('name') === 'email') {
	    input.focus(function () {
	      $(this).parent().addClass('emailfocus').removeClass('emailerror');
	    });
	    input.blur(function () {
	      $(this).parent().removeClass('emailfocus');
	    });
	  } else {
	    input.focus(function () {
	      $(this).parent().addClass('focus').removeClass('error');
	    });
	    input.blur(function () {
	      $(this).parent().removeClass('focus');
	    });
	  }
	}
	
	// 验证码
	function refreshGeetest() {
	  Geetest.refresh();
	  isGeetest = false;
	}
	// 初始化登录表单
	function _initForm() {
	  var UserModel = __webpack_require__(45);
	  errorinfo = loginBoxForm.find('.errorinfo');
	  email = loginBoxForm.find('[name=email]');
	  password = loginBoxForm.find('.pwd');
	  _setFocusEffect(email);
	  _setFocusEffect(password);
	  user = UserModel.sharedInstanceUserModel();
	  $('<input />').attr({
	    type: 'hidden',
	    name: 'cross_post',
	    value: '1'
	  }).appendTo(loginBoxForm);
	}
	// 加密字段
	function cryptoParam() {
	  return [$.trim(email.val()) + $.trim(password.val())];
	}
	
	function validator() {
	  var emailVal = $.trim(email.val());
	  var passwordVal = $.trim(password.val());
	  if (emailVal.length === 0) {
	    errorinfo.text('邮箱或手机不能为空').css('visibility', 'visible');
	    email.parent().addClass('emailerror');
	    return false;
	  }
	  if (!EMAIL_PATTERN.test(emailVal)) {
	    if (NUMBER_PATTERN.test(emailVal)) {
	      if (emailVal.length !== 11) {
	        errorinfo.text('请输入正确的电子邮箱或手机').css('visibility', 'visible');
	        email.parent().addClass('emailerror');
	        return false;
	      }
	    } else {
	      errorinfo.text('请输入正确的电子邮箱或手机').css('visibility', 'visible');
	      email.parent().addClass('emailerror');
	      return false;
	    }
	  }
	  if (passwordVal.length === 0) {
	    errorinfo.text('密码不能为空').css('visibility', 'visible');
	    password.parent().addClass('error');
	    return false;
	  }
	  if (passwordVal.length < 4 || passwordVal.length > 20) {
	    errorinfo.text('密码长度必须大于4且小于20').css('visibility', 'visible');
	    password.parent().addClass('error');
	    return false;
	  }
	  return true;
	}
	
	function isPassTest() {
	  var errorText = '拖动滑块完成验证';
	  if (!validator()) {
	    refreshGeetest();
	    return false;
	  }
	  if (!isGeetest) {
	    errorinfo.text(errorText).css('visibility', 'visible');
	    return false;
	  }
	  if (loginBoxForm.find('[name=encpsw]').length !== 0) {
	    loginBoxForm.find('[name=encpsw]').val(pwdencrypt(password.val()));
	  } else {
	    $('<input />').attr({
	      type: 'hidden',
	      name: 'encpsw',
	      value: pwdencrypt(password.val())
	    }).appendTo(loginBoxForm);
	  }
	  return true;
	}
	
	// 模拟submit
	function loginSubmit(e) {
	  var _crytoP = cryptoParam();
	  e.preventDefault();
	  if (isPassTest()) {
	    ajaxForm = AjaxForm.classInstanceAjaxForm(loginBoxForm);
	    ajaxForm.encrypto(secret.apply(window, _crytoP));
	    ajaxForm.done(function (cw) {
	      var search = decodeURIComponent(cw.location.search);
	      var response = url.parseSearch(search);
	      response = response.json;
	      if (!response.error) {
	        if (response.platFormRef) {
	          location.href = 'http://login.yinyuetai.com/platform';
	        } else {
	          user.set(response);
	          dialog.trigger('hide');
	        }
	      } else {
	        errorinfo.text(response.message).css('visibility', 'visible');
	        refreshGeetest();
	      }
	    });
	    ajaxForm.fail(function (cw) {
	      console.log(cw);
	    });
	    ajaxForm.loadState = true;
	    this.submit();
	  }
	}
	
	function compileHTML(tplStr, data) {
	  return tplEng.compile(tplStr)(data);
	}
	
	function LoginBox() {
	  var dialogHTML = compileHTML(loginBoxTemp, {
	    url: 'http://login.yinyuetai.com'
	  });
	  if (!dialog) {
	    dialog = Dialog.classInstanceDialog(dialogHTML, {
	      width: 691,
	      height: 342,
	      isRemoveAfterHide: false,
	      isAutoShow: false
	    });
	    loginBoxForm = dialog.$el.find('#loginBoxForm');
	    dialog.on('show', function () {
	      if (!Geetest) {
	        /* 添加验证框*/
	        Geetest = new window.Geetest({
	          gt: 'cc34bd7df5c42f7d9c3f540fdfb671cf',
	          product: 'float'
	        });
	        Geetest.appendTo('#captcha');
	      }
	      _initForm();
	      // UA_Opt.reload();
	      $.getJSON('http://www.yinyuetai.com/partner/get-partner-code?placeIds=reg_window&callback=?', function (data) {
	        if (data && data.reg_window) {
	          self.dialog.$el.find('.loginbox-placehold').html(data.reg_window);
	        }
	      });
	    });
	    dialog.on('hide', function () {
	      var form = dialog.$el.find('form');
	      form.find('.errorinfo').css('visibility', 'hidden');
	      form.find('[name=email],[name=password]')
	          .parent()
	          .removeClass('emailerror')
	          .removeClass('error');
	      // 去掉悦单播放页面中下载悦单的active效果
	      $('.J_pop_download').removeClass('v_button_curv');
	      setTimeout(function () {
	        refreshGeetest();
	      }, 500);
	    });
	    loginBoxForm.on('submit', loginSubmit);
	  }
	  return {
	    dialog: dialog
	  };
	}
	
	module.exports = LoginBox;


/***/ },
/* 51 */
/***/ function(module, exports) {

	function yytcrypt(o) {
		var l = 0, S = 1, t = "inputvec", O = 1, C = "yytcdn2b";
		var B = new Array(16843776, 0, 65536, 16843780, 16842756, 66564, 4, 65536, 1024, 16843776, 16843780, 1024, 16778244, 16842756,
				16777216, 4, 1028, 16778240, 16778240, 66560, 66560, 16842752, 16842752, 16778244, 65540, 16777220, 16777220, 65540, 0,
				1028, 66564, 16777216, 65536, 16843780, 4, 16842752, 16843776, 16777216, 16777216, 1024, 16842756, 65536, 66560, 16777220,
				1024, 4, 16778244, 66564, 16843780, 65540, 16842752, 16778244, 16777220, 1028, 66564, 16843776, 1028, 16778240, 16778240, 0,
				65540, 66560, 0, 16842756);
		var A = new Array(-2146402272, -2147450880, 32768, 1081376, 1048576, 32, -2146435040, -2147450848, -2147483616, -2146402272,
				-2146402304, -2147483648, -2147450880, 1048576, 32, -2146435040, 1081344, 1048608, -2147450848, 0, -2147483648, 32768,
				1081376, -2146435072, 1048608, -2147483616, 0, 1081344, 32800, -2146402304, -2146435072, 32800, 0, 1081376, -2146435040,
				1048576, -2147450848, -2146435072, -2146402304, 32768, -2146435072, -2147450880, 32, -2146402272, 1081376, 32, 32768,
				-2147483648, 32800, -2146402304, 1048576, -2147483616, 1048608, -2147450848, -2147483616, 1048608, 1081344, 0, -2147450880,
				32800, -2147483648, -2146435040, -2146402272, 1081344);
		var z = new Array(520, 134349312, 0, 134348808, 134218240, 0, 131592, 134218240, 131080, 134217736, 134217736, 131072, 134349320,
				131080, 134348800, 520, 134217728, 8, 134349312, 512, 131584, 134348800, 134348808, 131592, 134218248, 131584, 131072,
				134218248, 8, 134349320, 512, 134217728, 134349312, 134217728, 131080, 520, 131072, 134349312, 134218240, 0, 512, 131080,
				134349320, 134218240, 134217736, 512, 0, 134348808, 134218248, 131072, 134217728, 134349320, 8, 131592, 131584, 134217736,
				134348800, 134218248, 520, 134348800, 131592, 8, 134348808, 131584);
		var x = new Array(8396801, 8321, 8321, 128, 8396928, 8388737, 8388609, 8193, 0, 8396800, 8396800, 8396929, 129, 0, 8388736, 8388609,
				1, 8192, 8388608, 8396801, 128, 8388608, 8193, 8320, 8388737, 1, 8320, 8388736, 8192, 8396928, 8396929, 129, 8388736,
				8388609, 8396800, 8396929, 129, 0, 0, 8396800, 8320, 8388736, 8388737, 1, 8396801, 8321, 8321, 128, 8396929, 129, 1, 8192,
				8388609, 8193, 8396928, 8388737, 8193, 8320, 8388608, 8396801, 128, 8388608, 8192, 8396928);
		var w = new Array(256, 34078976, 34078720, 1107296512, 524288, 256, 1073741824, 34078720, 1074266368, 524288, 33554688, 1074266368,
				1107296512, 1107820544, 524544, 1073741824, 33554432, 1074266112, 1074266112, 0, 1073742080, 1107820800, 1107820800,
				33554688, 1107820544, 1073742080, 0, 1107296256, 34078976, 33554432, 1107296256, 524544, 524288, 1107296512, 256, 33554432,
				1073741824, 34078720, 1107296512, 1074266368, 33554688, 1073741824, 1107820544, 34078976, 1074266368, 256, 33554432,
				1107820544, 1107820800, 524544, 1107296256, 1107820800, 34078720, 0, 1074266112, 1107296256, 524544, 33554688, 1073742080,
				524288, 0, 1074266112, 34078976, 1073742080);
		var v = new Array(536870928, 541065216, 16384, 541081616, 541065216, 16, 541081616, 4194304, 536887296, 4210704, 4194304, 536870928,
				4194320, 536887296, 536870912, 16400, 0, 4194320, 536887312, 16384, 4210688, 536887312, 16, 541065232, 541065232, 0,
				4210704, 541081600, 16400, 4210688, 541081600, 536870912, 536887296, 16, 541065232, 4210688, 541081616, 4194304, 16400,
				536870928, 4194304, 536887296, 536870912, 16400, 536870928, 541081616, 4210688, 541065216, 4210704, 541081600, 0, 541065232,
				16, 16384, 541065216, 4210704, 16384, 4194320, 536887312, 0, 541081600, 536870912, 4194320, 536887312);
		var u = new Array(2097152, 69206018, 67110914, 0, 2048, 67110914, 2099202, 69208064, 69208066, 2097152, 0, 67108866, 2, 67108864,
				69206018, 2050, 67110912, 2099202, 2097154, 67110912, 67108866, 69206016, 69208064, 2097154, 69206016, 2048, 2050, 69208066,
				2099200, 2, 67108864, 2099200, 67108864, 2099200, 2097152, 67110914, 67110914, 69206018, 69206018, 2, 2097154, 67108864,
				67110912, 2097152, 69208064, 2050, 2099202, 69208064, 2050, 67108866, 69208066, 69206016, 2099200, 0, 2, 69208066, 0,
				2099202, 69206016, 2048, 67108866, 67110912, 2048, 2097154);
		var q = new Array(268439616, 4096, 262144, 268701760, 268435456, 268439616, 64, 268435456, 262208, 268697600, 268701760, 266240,
				268701696, 266304, 4096, 64, 268697600, 268435520, 268439552, 4160, 266240, 262208, 268697664, 268701696, 4160, 0, 0,
				268697664, 268435520, 268439552, 266304, 262144, 266304, 262144, 268701696, 4096, 64, 268697664, 4096, 266304, 268439552,
				64, 268435520, 268697600, 268697664, 268435456, 262144, 268439616, 0, 268701760, 262208, 268435520, 268697600, 268439552,
				268439616, 0, 268701760, 266240, 266240, 4160, 4160, 262208, 268435456, 268701696);
		pc2bytes0 = new Array(0, 4, 536870912, 536870916, 65536, 65540, 536936448, 536936452, 512, 516, 536871424, 536871428, 66048, 66052,
				536936960, 536936964);
		pc2bytes1 =
				new Array(0, 1, 1048576, 1048577, 67108864, 67108865, 68157440, 68157441, 256, 257, 1048832, 1048833, 67109120, 67109121,
						68157696, 68157697);
		pc2bytes2 = new Array(0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272, 0, 8, 2048, 2056, 16777216, 16777224, 16779264,
				16779272);
		pc2bytes3 = new Array(0, 2097152, 134217728, 136314880, 8192, 2105344, 134225920, 136323072, 131072, 2228224, 134348800, 136445952,
				139264, 2236416, 134356992, 136454144);
		pc2bytes4 = new Array(0, 262144, 16, 262160, 0, 262144, 16, 262160, 4096, 266240, 4112, 266256, 4096, 266240, 4112, 266256);
		pc2bytes5 = new Array(0, 1024, 32, 1056, 0, 1024, 32, 1056, 33554432, 33555456, 33554464, 33555488, 33554432, 33555456, 33554464,
				33555488);
		pc2bytes6 =
				new Array(0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746, 0, 268435456, 524288, 268959744, 2, 268435458,
						524290, 268959746);
		pc2bytes7 = new Array(0, 65536, 2048, 67584, 536870912, 536936448, 536872960, 536938496, 131072, 196608, 133120, 198656, 537001984,
				537067520, 537004032, 537069568);
		pc2bytes8 =
				new Array(0, 262144, 0, 262144, 2, 262146, 2, 262146, 33554432, 33816576, 33554432, 33816576, 33554434, 33816578, 33554434,
						33816578);
		pc2bytes9 =
				new Array(0, 268435456, 8, 268435464, 0, 268435456, 8, 268435464, 1024, 268436480, 1032, 268436488, 1024, 268436480, 1032,
						268436488);
		pc2bytes10 =
				new Array(0, 32, 0, 32, 1048576, 1048608, 1048576, 1048608, 8192, 8224, 8192, 8224, 1056768, 1056800, 1056768, 1056800);
		pc2bytes11 = new Array(0, 16777216, 512, 16777728, 2097152, 18874368, 2097664, 18874880, 67108864, 83886080, 67109376, 83886592,
				69206016, 85983232, 69206528, 85983744);
		pc2bytes12 = new Array(0, 4096, 134217728, 134221824, 524288, 528384, 134742016, 134746112, 16, 4112, 134217744, 134221840, 524304,
				528400, 134742032, 134746128);
		pc2bytes13 = new Array(0, 4, 256, 260, 0, 4, 256, 260, 1, 5, 257, 261, 1, 5, 257, 261);
		var M = C.length > 8 ? 3 : 1;
		var y = new Array(32 * M);
		var f = new Array(0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
		var E, h, K = 0, J = 0, k;
		for (var N = 0; N < M; N++) {
			g = (C.charCodeAt(K++) << 24) | (C.charCodeAt(K++) << 16) | (C.charCodeAt(K++) << 8) | C.charCodeAt(K++);
			I = (C.charCodeAt(K++) << 24) | (C.charCodeAt(K++) << 16) | (C.charCodeAt(K++) << 8) | C.charCodeAt(K++);
			k = ((g >>> 4) ^ I) & 252645135;
			I ^= k;
			g ^= (k << 4);
			k = ((I >>> -16) ^ g) & 65535;
			g ^= k;
			I ^= (k << -16);
			k = ((g >>> 2) ^ I) & 858993459;
			I ^= k;
			g ^= (k << 2);
			k = ((I >>> -16) ^ g) & 65535;
			g ^= k;
			I ^= (k << -16);
			k = ((g >>> 1) ^ I) & 1431655765;
			I ^= k;
			g ^= (k << 1);
			k = ((I >>> 8) ^ g) & 16711935;
			g ^= k;
			I ^= (k << 8);
			k = ((g >>> 1) ^ I) & 1431655765;
			I ^= k;
			g ^= (k << 1);
			k = (g << 8) | ((I >>> 20) & 240);
			g = (I << 24) | ((I << 8) & 16711680) | ((I >>> 8) & 65280) | ((I >>> 24) & 240);
			I = k;
			for (var P = 0; P < f.length; P++) {
				if (f[P]) {
					g = (g << 2) | (g >>> 26);
					I = (I << 2) | (I >>> 26)
				} else {
					g = (g << 1) | (g >>> 27);
					I = (I << 1) | (I >>> 27)
				}
				g &= -15;
				I &= -15;
				E = pc2bytes0[g >>> 28] | pc2bytes1[(g >>> 24) & 15] | pc2bytes2[(g >>> 20) & 15] | pc2bytes3[(g >>> 16) & 15] |
						pc2bytes4[(g >>> 12) & 15] | pc2bytes5[(g >>> 8) & 15] | pc2bytes6[(g >>> 4) & 15];
				h = pc2bytes7[I >>> 28] | pc2bytes8[(I >>> 24) & 15] | pc2bytes9[(I >>> 20) & 15] | pc2bytes10[(I >>> 16) & 15] |
						pc2bytes11[(I >>> 12) & 15] | pc2bytes12[(I >>> 8) & 15] | pc2bytes13[(I >>> 4) & 15];
				k = ((h >>> 16) ^ E) & 65535;
				y[J++] = E ^ k;
				y[J++] = h ^ (k << 16)
			}
		}
		var K = 0, P, N, k, a, U, T, g, I, c;
		var L, H, Q, d;
		var D, e;
		var p = o.length;
		var b = 0;
		var M = y.length == 32 ? 3 : 9;
		if (M == 3) {c = S ? new Array(0, 32, 2) : new Array(30, -2, -2)} else {
			c = S ? new Array(0, 32, 2, 62, 30, -2, 64, 96, 2) : new Array(94, 62, -2, 32, 64, 2, 30, -2, -2)
		}
		k = 8 - (p % 8);
		o += String.fromCharCode(k, k, k, k, k, k, k, k);
		if (k == 8) {p += 8}
		result = "";
		tempresult = "";
		while (K < p) {
			g = (o.charCodeAt(K++) << 24) | (o.charCodeAt(K++) << 16) | (o.charCodeAt(K++) << 8) | o.charCodeAt(K++);
			I = (o.charCodeAt(K++) << 24) | (o.charCodeAt(K++) << 16) | (o.charCodeAt(K++) << 8) | o.charCodeAt(K++);
			k = ((g >>> 4) ^ I) & 252645135;
			I ^= k;
			g ^= (k << 4);
			k = ((g >>> 16) ^ I) & 65535;
			I ^= k;
			g ^= (k << 16);
			k = ((I >>> 2) ^ g) & 858993459;
			g ^= k;
			I ^= (k << 2);
			k = ((I >>> 8) ^ g) & 16711935;
			g ^= k;
			I ^= (k << 8);
			k = ((g >>> 1) ^ I) & 1431655765;
			I ^= k;
			g ^= (k << 1);
			g = ((g << 1) | (g >>> 31));
			I = ((I << 1) | (I >>> 31));
			for (N = 0; N < M; N += 3) {
				D = c[N + 1];
				e = c[N + 2];
				for (P = c[N]; P != D; P += e) {
					U = I ^ y[P];
					T = ((I >>> 4) | (I << 28)) ^ y[P + 1];
					k = g;
					g = I;
					I = k ^ (A[(U >>> 24) & 63] | x[(U >>> 16) & 63] | v[(U >>> 8) & 63] | q[U & 63] | B[(T >>> 24) & 63] |
							z[(T >>> 16) & 63] | w[(T >>> 8) & 63] | u[T & 63])
				}
				k = g;
				g = I;
				I = k
			}
			g = ((g >>> 1) | (g << 31));
			I = ((I >>> 1) | (I << 31));
			k = ((g >>> 1) ^ I) & 1431655765;
			I ^= k;
			g ^= (k << 1);
			k = ((I >>> 8) ^ g) & 16711935;
			g ^= k;
			I ^= (k << 8);
			k = ((I >>> 2) ^ g) & 858993459;
			g ^= k;
			I ^= (k << 2);
			k = ((g >>> 16) ^ I) & 65535;
			I ^= k;
			g ^= (k << 16);
			k = ((g >>> 4) ^ I) & 252645135;
			I ^= k;
			g ^= (k << 4);
			tempresult += String.fromCharCode((g >>> 24), ((g >>> 16) & 255), ((g >>> 8) & 255), (g & 255), (I >>> 24), ((I >>> 16) & 255),
					((I >>> 8) & 255), (I & 255));
			b += 8;
			if (b == 512) {
				result += tempresult;
				tempresult = "";
				b = 0
			}
		}
		var F = result + tempresult;
		var G = "";
		var R = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
		for (var P = 0; P < F.length; P++) {G += R[F.charCodeAt(P) >> 4] + R[F.charCodeAt(P) & 15]}
		return G
	};
	module.exports = yytcrypt;

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = "<div class=\"loginbox\">\n    <div class=\"external\">\n        <p class=\"title\">使用合作账号登录<span>(推荐)</span></p>\n        <ul>\n            <li>\n                <a href=\"{{url}}/api/login/sina-auth\" target=\"_blank\" class=\"weibo\" hidefocus>微博帐号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/qq-auth\" target=\"_blank\" class=\"qq\" hidefocus>QQ帐号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/renren-auth\" target=\"_blank\" class=\"renren\" hidefocus>人人账号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/baidu-auth\" target=\"_blank\" class=\"baidu\" hidefocus>百度帐号</a>\n            </li>\n        </ul>\n        <div class=\"loginbox-placehold\"></div>\n        <p class=\"text\">快捷登录，无需注册</p>\n        <p class=\"text\">与你的朋友分享你的爱！</p>\n    </div>\n    <div class=\"site\">\n        <p class=\"title\">音悦Tai账号登录</p>\n        <form id=\"loginBoxForm\" action=\"https://login.yinyuetai.com/login-ajax\" method=\"post\">\n            <p class=\"errorinfo\">错误信息提示</p>\n            <div class=\"email focuss\">\n                <input type=\"text\" name=\"email\" placeholder=\"您的邮箱地址或绑定手机\"/>\n            </div>\n            <div class=\"password\">\n                <input type=\"password\" class=\"pwd\" placeholder=\"请输入密码\"/>\n            </div>\n            <div id=\"captcha\"></div>\n            <div>\n                <p class=\"autologin\"><input type=\"checkbox\" id=\"autocheckbox\" name=\"autologin\" checked hidefocus/><label for=\"autocheckbox\">下次自动登录</label></p>\n                <a class=\"forgot\" href=\"{{url}}/forgot-password\" target=\"_blank\" hidefocus>忘记密码</a>\n            </div>\n            <div>\n                <input class=\"submit\" type=\"submit\" hidefocus/>\n                <p class=\"reg\">还没有音悦Tai账号？<a href=\"{{url}}/register\" target=\"_blank\" hidefocus>立即注册！</a></p>\n            </div>\n        </form>\n    </div>\n</div>"

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

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
	var Auxiliary = __webpack_require__(41);
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

/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = "<div style=\"padding: 20px 30px;\">\n  <p>您好像还没有进行邮箱验证。</p>\n  <p>为不影响部分功能的使用，请先进行\n    <a href=\"{homeSite}/settings/bind\" target=\"_blank\" class=\"special f14\">邮箱验证</a>\n  </p>\n</div>\n"

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by AaronYuan on 3/14/16.
	 * confirm 对话框
	 *
	 * 使用
	 *
	 var  uiConfirm = require('ui.confirm');
	 uiConfirm.show({
	            title: '消息',
	            content: '您确定要结束直播吗',
	            okFn: function () {
	                console.log('ok');
	            },
	            cancelFn: function () {
	                console.log('cancel');
	            }
	        });
	 *
	 */
	
	
	var confirm = {};
	var _ = __webpack_require__(27);
	
	var setting = {
	  title: '消息',
	  content: '',
	  okFn: null,
	  cancelFn: null,
	  okBtn: true,
	  cancelBtn: true
	};
	
	confirm.init = function (ops) {
	  var tpl = _.template(this.getHTML());
	  var html = tpl(ops);
	  this.remove();
	  this.bindEvent(html, ops.okFn, ops.cancelFn);
	};
	
	confirm.remove = function () {
	  var wrap = $('#UIConfigWrap');
	  if (wrap && wrap.length >= 1) {
	    wrap.remove();
	  }
	};
	
	confirm.getHTML = function () {
	  return __webpack_require__(56);
	};
	
	confirm.bindEvent = function (html, okFn, cancelFn) {
	  var self = this;
	  var ele = $(html);
	
	  ele.find('#UIConfirmOk').on('click', function (e) {
	    e.preventDefault();
	    if (okFn) {
	      okFn();
	    }
	    self.remove();
	    return false;
	  });
	  ele.find('.UIConfirmClose').on('click', function (e) {
	    e.preventDefault();
	    if (cancelFn) {
	      cancelFn();
	    }
	    self.remove();
	    return false;
	  });
	
	  $('body').append(ele);
	};
	
	/**
	 *
	 * @param options
	 *  {
	   *  title: ''
	   *  content: ''
	   *  okFn: fun
	   *  cancelFn: fun
	  *  }
	 */
	confirm.show = function (options) {
	  var ops = _.extend(setting, options);
	  this.init(ops);
	};
	confirm.close = function () {
	  this.remove();
	};
	
	
	module.exports = {
	  show: function (options) {
	    confirm.show(options);
	  },
	  close: function () {
	    confirm.close();
	  }
	};


/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = "<div id=\"UIConfigWrap\" class=\"shadow_screen\">\n    <div class=\"shadow\"></div>\n    <div class=\"edit_annmoucement_con\" style=\"margin-bottom: 16px; width: 400px;margin-left:-200px;\">\n        <h2 class=\"edit_title\"><span class=\"title\" id=\"UIConfirmTitle\"><%=title%></span> <span class=\"close icons am-yyt-close close-black UIConfirmClose\"></span></h2>\n        <div class=\"editCon\" style=\"\">\n            <div class=\"content\" style=\"padding:16px; font-size: 14px;\"><%=content%></div>\n            <p class=\"btn-wrap am-margin-top\" >\n                <a style=\"display: <%= okBtn?'inline-block':'none'%>;\" id=\"UIConfirmOk\" href=\"javascript:;\" class=\"boderRadAll_5 submit active am-margin-right\">确定</a>\n                <a style=\"display: <%= cancelBtn?'inline-block':'none'%>;\" href=\"javascript:;\" class=\"boderRadAll_5 cancel UIConfirmClose am-margin-left\">取消</a>\n            </p>\n        </div>\n    </div>\n</div>\n"

/***/ },
/* 57 */,
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/detail.json', // accessToken 填写请求地址
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/longpolling.json', // 填写请求地址
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2015-03-24
	 * @author {编写者}
	 * @info 道具列表
	 */
	
	'use strict';
	
	var sigleInstance = null;
	var cacheData = null;
	var _ = __webpack_require__(27);
	
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


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 获取在当前房间内的权限
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/manager_my_list.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by AaronYuan on 4/5/16.
	 * 用户
	 */
	'use strict';
	
	var AnchorUserInfoModel = __webpack_require__(63);
	var base = __webpack_require__(28);
	var Storage = base.storage;
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var instance = null;
	var _ = __webpack_require__(27);
	
	function UserInfoView() {
	}
	
	UserInfoView.prototype.getInfo = function (okFn, errFn) {
	  var promise;
	  this.anchorInfoModel = AnchorUserInfoModel.sharedInstanceModel();
	  this.anchorInfoParams = {
	    deviceinfo: '{"aid": "30001001"}',
	    access_token: user.getWebToken()
	  };
	  promise = this.anchorInfoModel.executeJSONP(this.anchorInfoParams);
	  promise.done(function (res) {
	    if (res && res.msg === 'SUCCESS') {
	      if (okFn) {
	        okFn(res.data);
	      }
	    }
	  });
	  promise.fail(function (err) {
	    if (errFn) {
	      errFn(err);
	    }
	  });
	};
	
	instance = new UserInfoView();
	
	module.exports = {
	  getInfo: function (okFn, errFn) {
	    instance.getInfo(okFn, errFn);
	  },
	  isDisbaleTalk: function (userId, roomId) {
	    var list = Storage.get('userDisableTalkTime');
	    if (!list) {
	      return false;
	    }
	    try {
	      list = JSON.parse(list);
	    } catch (e) {
	      list = [];
	    }
	    var res = _.find(list, function (item) {
	      return item.roomId === roomId && item.userId === userId;
	    });
	    if (!res) {
	      return false;
	    }
	
	    var time = res.time;
	    if (!time) {
	      return false;
	    }
	
	    time = new Date(time);
	    var cur = new Date();
	    var diff = cur.getTime() - time.getTime();
	
	    return diff <= 0;
	  },
	  isKickout: function (roomId) {
	    var list = Storage.get('userKickout');
	    if (!list) {
	      return false;
	    }
	    try {
	      list = JSON.parse(list);
	    } catch (e) {
	      list = [];
	    }
	    var res = _.find(list, function (item) {
	      return item.roomId === roomId;
	    });
	    return !!res && res.isKickout;
	  },
	  setDisableTalk: function (userid, roomid, time) {
	    var list = Storage.get('userDisableTalkTime');
	    if (_.isNumber(list)) {
	      list = [];
	    }
	    if (!list) {
	      list = [];
	    }
	    try {
	      list = JSON.parse(list);
	    } catch (e) {
	      list = [];
	    }
	    var res = _.find(list, function (item) {
	      return item.roomId === roomid && item.userId === userid;
	    });
	
	    if (res) {
	      res.time = time;
	    } else {
	      list.push({
	        roomId: roomid,
	        userId: userid,
	        time: time
	      });
	    }
	    Storage.set('userDisableTalkTime', JSON.stringify(list));
	  },
	  setKickout: function (roomId, isKickout) {
	    var list = Storage.get('userKickout');
	    if (!list) {
	      list = [];
	    } else {
	      try {
	        list = JSON.parse(list);
	      } catch (e) {
	        list = [];
	      }
	    }
	    var res = _.find(list, function (item) {
	      return item.roomId === roomId;
	    });
	    if (res) {
	      res.isKickout = isKickout;
	    } else {
	      list.push({
	        roomId: roomId,
	        isKickout: isKickout
	      });
	    }
	    Storage.set('userKickout', JSON.stringify(list));
	  },
	  setLockScreen: function (roomId, isLock) {
	    var list = Storage.get('isLockScreen');
	    if (!list) {
	      list = [];
	    } else {
	      list = JSON.parse(list);
	    }
	    var res = _.find(list, function (item) {
	      return item.roomId === roomId;
	    });
	    if (res) {
	      res.isLock = isLock;
	    } else {
	      list.push({
	        roomId: roomId,
	        isLock: isLock
	      });
	    }
	    Storage.set('isLockScreen', JSON.stringify(list));
	  },
	  isLockScreen: function (roomId) {
	    var list = Storage.get('isLockScreen');
	    if (!list) {
	      return false;
	    }
	    list = JSON.parse(list);
	    var res = _.find(list, function (item) {
	      return item.roomId === roomId;
	    });
	    return !!res && res.isLock;
	  },
	  removeAll: function () {
	    Storage.set('isLockScreen', '');
	    Storage.set('userDisableTalkTime', '');
	    Storage.set('userKickout', '');
	  }
	};


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/user/info.json', // 填写请求地址
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 告白墙
	 */
	'use strict';
	
	var _ = __webpack_require__(27);
	var base = __webpack_require__(28);
	var BaseView = base.View;
	
	var ListModel = __webpack_require__(65);
	var LikeModel = __webpack_require__(66);
	var CreateModel = __webpack_require__(67);
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var LoopModel = __webpack_require__(68);
	
	var msgBox = __webpack_require__(69);
	var BusinessDate = __webpack_require__(70);
	
	var View = BaseView.extend({
	  el: '',
	  rawLoader: function () {
	    return __webpack_require__(71);
	  },
	  events: {
	    'click #btnShowCreate': 'showCreateClicked',
	    'click #btnBacktoList': 'backToList',
	    'click .wall-list': 'itemClicked',
	    'click #btnSendText': 'sendClicked',
	    'click .tabs a': 'tabClicked',
	    'click .colors a': 'chooseColorClicked',
	    'keyup #txtMsg': 'calcTextLength',
	    'click #unReadCnt': 'refreshUnreadList'
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.elements = {};
	
	    this.queryParams = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken()
	    };
	
	    // 循环接口时间
	    this.loopTime = 60 * 1000;
	
	    this.listParams = _.extend({}, this.queryParams);
	
	    this.pageParams = {};
	
	    this.listModel = new ListModel();
	    this.likeModel = new LikeModel();
	    this.createModel = new CreateModel();
	    this.loopModel = new LoopModel();
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.elements.showCreateDOM = this.$el.find('#btnShowCreate');
	    this.elements.showWhenCreateDom = this.$el.find('.show-when-create');
	    this.elements.showWhenListDom = this.$el.find('.show-when-list');
	    this.elements.boardDom = this.$el.find('.msg-board-wrap');
	
	    this.elements.txtInputDom = this.$el.find('#txtMsg');
	    this.elements.txtLengthDom = this.$el.find('#txtLength');
	    this.elements.anonymousDom = this.$el.find('#cbAnonymous');
	    this.elements.userScoreDom = this.$el.find('#userScore');
	    this.elements.unReadCnt = this.$el.find('#unReadCnt');
	
	    // 一个公告的模板
	    this.itemTpl = this.$el.find('#itemTpl').html();
	
	    this.newestListDOM = this.$el.find('.newList .am-u-sm-4');
	    this.hotListDOM = this.$el.find('.hotList .am-u-sm-4');
	
	    // 每个告白价值
	    this.perItemFee = 5;
	  },
	  ready: function (ops) {
	    this.options = _.extend({
	      totalMarks: 0,
	      userInfo: {}
	    }, ops);
	    this.defineEventInterface();
	    this.lastTime = new Date();
	    // 隐藏未读小红点
	    this.elements.unReadCnt.text(0).hide();
	    //  初始化
	    this.renderNewestList({
	      tag: 'first'
	    });
	    this.loopGetUnreadCount();
	    this.renderHotList();
	    this.setUserInfo();
	
	    $('.msg-board-wrap .wall-list').on('scroll', this.tabScrollDown.bind(this));
	  },
	  setOptions: function (ops) {
	    this.options = _.extend(this.options, ops);
	  },
	  defineEventInterface: function () {},
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  // 我要发布点击
	  showCreateClicked: function () {
	    this.elements.showWhenCreateDom.show();
	    this.elements.showWhenListDom.hide();
	    this.elements.boardDom.addClass('active-create');
	    this.randomSetColor();
	  },
	  // 返回列表
	  backToList: function () {
	    this.elements.showWhenCreateDom.hide();
	    this.elements.showWhenListDom.show();
	    this.elements.boardDom.removeClass('active-create');
	  },
	
	  getData: function (ops) {
	    var self = this;
	    this.listParams = _.extend(this.listParams, {
	      subType: this.options.type || 1,
	      subId: self.options.roomId || 0,
	      sortField: 'TIME', // LIKE
	      limit: 9
	    }, ops);
	    return this.listModel.executeJSONP(this.listParams);
	  },
	  // 最新列表
	  renderNewestList: function (ops) {
	    var self = this;
	    var promise = this.getData(ops);
	    promise.done(function (res) {
	      self.appendToNewestList(res.data.list || []);
	      if (res && res.code === '0') {
	        self.pageParams.newList = {
	          nextCursor: res.data.nextCursor || null,
	          hasNext: res.data.hasNext || false
	        };
	      }
	      if (ops && ops.tag === 'first' && _.isArray(res.data.list) && res.data.list.length <= 0) {
	        self.newestListDOM.eq(0).append('<div class="first">快来成为第一个告白的幸运儿</div>');
	      }
	    });
	  },
	  appendToNewestList: function (data) {
	    var htmls = this.createItemHtml(data);
	    this.newestListDOM.eq(0).find('.first').remove();
	    this.newestListDOM.eq(0).append(htmls[0]);
	    this.newestListDOM.eq(1).append(htmls[1]);
	    this.newestListDOM.eq(2).append(htmls[2]);
	  },
	  // 最热列表
	  renderHotList: function (ops) {
	    var self = this;
	    var op = _.extend(ops, {
	      sortField: 'LIKE'
	    });
	
	    var promise = this.getData(op);
	    promise.done(function (res) {
	      if (res && res.code === '0') {
	        self.pageParams.hotList = {
	          nextCursor: res.data.nextCursor || null,
	          hasNext: res.data.hasNext || false
	        };
	      }
	      self.appendToHotList(res.data.list || []);
	    });
	  },
	  appendToHotList: function (data) {
	    var htmls = this.createItemHtml(data);
	    this.hotListDOM.eq(0).append(htmls[0]);
	    this.hotListDOM.eq(1).append(htmls[1]);
	    this.hotListDOM.eq(2).append(htmls[2]);
	  },
	  createItemHtml: function (data) {
	    var html = '';
	    var self = this;
	    var result = [
	      [],
	      [],
	      []
	    ];
	    _.each(data, function (item, index) {
	      var curItem = item;
	      curItem.time = BusinessDate.format(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss');
	      html = self.compileHTML(self.itemTpl, curItem);
	      var res = index % 3;
	      switch (res) {
	        case 1:
	          result[1].push(html);
	          break;
	        case 2:
	          result[2].push(html);
	          break;
	        case 0:
	        default:
	          result[0].push(html);
	          break;
	      }
	    });
	    return result;
	  },
	  renderItem: function () {
	
	  },
	  itemClicked: function (e) {
	    var target = $(e.target);
	    if (!target.attr('data-likeid')) {
	      target = target.parent('a');
	    }
	    var liked = target.attr('data-liked') === 'true';
	    if (target.attr('data-likeid')) {
	      this.likeItem(target.attr('data-likeid'), target, !liked);
	    }
	  },
	  // 喜欢某个告白
	  likeItem: function (id, dom, like) {
	    this.likeParams = _.extend(this.queryParams, {
	      subType: this.options.type,
	      cmtId: id,
	      like: like
	    });
	    var promise = this.likeModel.executeJSONP(this.likeParams);
	    var cnt = ~~dom.find('span').text();
	    promise.done(function (res) {
	      if (res && res.code === '0') {
	        dom.attr('data-liked', like ? 'true' : 'false');
	        dom.find('span').text(like ? cnt + 1 : cnt - 1);
	        dom.toggleClass('active');
	      } else {
	        msgBox.showTip('支持失败,稍后重新尝试吧');
	      }
	    });
	  },
	  // 切换列表
	  tabClicked: function (e) {
	    var target = $(e.target);
	    var tab = target.attr('data-tab');
	    var link = $('.tabs a');
	    if (tab && !target.hasClass('active')) {
	      link.toggleClass('active');
	      $('.tab').hide();
	      $('.' + tab).show();
	    }
	  },
	  getSendText: function () {
	    var text = $.trim(this.elements.txtInputDom.val());
	    var reg = /<[^>]+?>/g;
	    text = text.replace(reg, '');
	    return text;
	  },
	  // 校验发布内容
	  verifyText: function () {
	    var text = this.getSendText();
	    if (text.length > 200) {
	      msgBox.showTip('告白内容不能超过200字');
	      return false;
	    } else if (text.length < 20) {
	      msgBox.showTip('告白内容至少输入20个字');
	      return false;
	    }
	    return true;
	  },
	  sendClicked: function () {
	    var isAnonymous = this.elements.anonymousDom.is(':checked');
	    var self = this;
	    if (this.verifyText()) {
	      this.createParams = _.extend({
	        subType: self.options.type,
	        subId: this.options.roomId,
	        isAnonymous: isAnonymous,
	        fontColor: this.selectedColor || '',
	        content: this.getSendText()
	      }, this.queryParams);
	
	      var promise = this.createModel.executeJSONP(this.createParams);
	
	      promise.done(function (res) {
	        if (res && res.code === '0') {
	          msgBox.showOK('告白发布成功!');
	          self.elements.txtInputDom.val('');
	          self.backToList();
	          self.options.userInfo.totalMarks -= self.perItemFee;
	          self.setUserInfo();
	          self.newestListDOM.children().remove();
	          self.renderNewestList();
	          self.renderHotList();
	        } else {
	          msgBox.showError(res.msg || '发布告白失败,请稍后重试');
	        }
	      });
	    }
	  },
	  // 设置文字颜色
	  setTextColor: function (dom, color) {
	    if (dom && color) {
	      var col = this.rgb2hex(color + '');
	      dom.css('color', col);
	      this.selectedColor = col;
	    }
	  },
	  // 选择颜色
	  chooseColorClicked: function (e) {
	    var target = $(e.target);
	    var color = target.css('background-color');
	    target.parent('.colors').children().removeClass('active');
	    target.addClass('active');
	    this.setTextColor(this.elements.txtInputDom, color);
	  },
	  // 随机设置颜色
	  randomSetColor: function () {
	    var index = Math.random() * 10 % 5 ^ 0;
	    this.chooseColorClicked({
	      target: $('.colors a').eq(index)
	    });
	  },
	  // 计算文字长度
	  calcTextLength: function () {
	    var txt = $.trim(this.elements.txtInputDom.val());
	    var maxLength = 200;
	    this.elements.txtLengthDom.text(maxLength - txt.length);
	  },
	  // 数字转16进制
	  zeroFillHex: function (num, digits) {
	    var s = num.toString(16);
	    while (s.length < digits) {
	      s = '0' + s;
	    }
	    return s;
	  },
	  // 颜色转换
	  rgb2hex: function (rgb) {
	    if (rgb.charAt(0) === '#') {
	      return rgb;
	    }
	
	    var ds = rgb.split(/\D+/);
	    var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
	    return '#' + this.zeroFillHex(decimal, 6);
	  },
	  // 设置用户积分
	  setUserInfo: function (userInfo) {
	    if (userInfo) {
	      this.options.userInfo = userInfo;
	    }
	    if (_.isNumber(this.options.userInfo.totalMarks)) {
	      this.elements.userScoreDom.text(this.options.userInfo.totalMarks || 0);
	    }
	  },
	  refreshUnreadList: function () {
	    this.lastTime = new Date();
	    this.elements.unReadCnt.text(0).hide();
	    $('.newList .am-u-sm-4').children().remove();
	    this.renderNewestList();
	    this.changeTab(0);
	  },
	  loopGetUnreadCount: function () {
	    var self = this;
	    var promise = this.loopModel.executeJSONP(_.extend({
	      roomId: self.options.roomId,
	      lastTime: self.lastTime.getTime()
	    }, this.queryParams));
	    promise.done(function (res) {
	      if (res && res.code === '0' && res.data.newMsgCount > 0) {
	        self.elements.unReadCnt.text(res.data.newMsgCount).show();
	      }
	      setTimeout(function () {
	        self.loopGetUnreadCount();
	      }, self.loopTime);
	    });
	  },
	  // 切换列表
	  changeTab: function (index) {
	    this.tabClicked({
	      target: $('.tabs a').eq(index)
	    });
	  },
	  tabScrollDown: function (e) {
	    var tag = $('.tab-menu .active').attr('data-tab');
	    var target = $(e.target);
	    var maxHeight = $('.' + tag).find('.am-u-sm-4').height() - 404;
	    var top = target.scrollTop();
	    var diff = maxHeight - top;
	    if (diff < 30 && this.pageParams[tag].hasNext) {
	      if (tag === 'newList') {
	        this.renderNewestList(this.pageParams[tag]);
	      } else {
	        this.renderHotList(this.pageParams[tag]);
	      }
	    }
	  }
	});
	
	module.exports = View;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 告白列表
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/common/love_cmt_list.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 点赞
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/common/love_cmt_like.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 发布告白墙
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/common/love_cmt_create.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 告白墙循环获取未读消息数
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/common/love_cmt_new_msg_polling.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 69 */
/***/ function(module, exports) {

	/**
	 * Created by AaronYuan on 3/12/16.
	 */
	
	/**
	 * 使用
	 *
	 * showError(msg);
	 * showTip(msg);
	 * showOK(msg);
	 * showLoading(msg);
	 *
	 *
	 * .show(msgHtml, type, timeout, opts){}
	 *      msgHtml: 内容
	 *      type: 图标类型   1   -   提示
	 *                      2   -   成功
	 *                      3   -   失败
	 *                      4   -   载入中
	 *      timeout: 毫秒数,自动关闭
	 *      opts: 配置,默认null就好
	 *
	 *
	 * .hide()
	 */
	
	//require('/style/msgbox.css');
	var ZENG = {};
	
	ZENG.dom = {
	    getById: function (id) {
	        return document.getElementById(id);
	    }, get: function (e) {
	        return (typeof (e) == "string") ? document.getElementById(e) : e;
	    }, createElementIn: function (tagName, elem, insertFirst, attrs) {
	        var _e = (elem = ZENG.dom.get(elem) || document.body).ownerDocument.createElement(tagName || "div"), k;
	        if (typeof (attrs) == 'object') {
	            for (k in attrs) {
	                if (k == "class") {
	                    _e.className = attrs[k];
	                } else if (k == "style") {
	                    _e.style.cssText = attrs[k];
	                } else {
	                    _e[k] = attrs[k];
	                }
	            }
	        }
	        insertFirst ? elem.insertBefore(_e, elem.firstChild) : elem.appendChild(_e);
	        return _e;
	    }, getStyle: function (el, property) {
	        el = ZENG.dom.get(el);
	        if (!el || el.nodeType == 9) {
	            return null;
	        }
	        var w3cMode = document.defaultView && document.defaultView.getComputedStyle, computed = !w3cMode ? null : document.defaultView.getComputedStyle(el, ''), value = "";
	        switch (property) {
	            case "float":
	                property = w3cMode ? "cssFloat" : "styleFloat";
	                break;
	            case "opacity":
	                if (!w3cMode) {
	                    var val = 100;
	                    try {
	                        val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
	                    } catch (e) {
	                        try {
	                            val = el.filters('alpha').opacity;
	                        } catch (e) {
	                        }
	                    }
	                    return val / 100;
	                } else {
	                    return parseFloat((computed || el.style)[property]);
	                }
	                break;
	            case "backgroundPositionX":
	                if (w3cMode) {
	                    property = "backgroundPosition";
	                    return ((computed || el.style)[property]).split(" ")[0];
	                }
	                break;
	            case "backgroundPositionY":
	                if (w3cMode) {
	                    property = "backgroundPosition";
	                    return ((computed || el.style)[property]).split(" ")[1];
	                }
	                break;
	        }
	        if (w3cMode) {
	            return (computed || el.style)[property];
	        } else {
	            return (el.currentStyle[property] || el.style[property]);
	        }
	    }, setStyle: function (el, properties, value) {
	        if (!(el = ZENG.dom.get(el)) || el.nodeType != 1) {
	            return false;
	        }
	        var tmp, bRtn = true, w3cMode = (tmp = document.defaultView) && tmp.getComputedStyle, rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
	        if (typeof (properties) == 'string') {
	            tmp = properties;
	            properties = {};
	            properties[tmp] = value;
	        }
	        for (var prop in properties) {
	            value = properties[prop];
	            if (prop == 'float') {
	                prop = w3cMode ? "cssFloat" : "styleFloat";
	            } else if (prop == 'opacity') {
	                if (!w3cMode) {
	                    prop = 'filter';
	                    value = value >= 1 ? '' : ('alpha(opacity=' + Math.round(value * 100) + ')');
	                }
	            } else if (prop == 'backgroundPositionX' || prop == 'backgroundPositionY') {
	                tmp = prop.slice(-1) == 'X' ? 'Y' : 'X';
	                if (w3cMode) {
	                    var v = ZENG.dom.getStyle(el, "backgroundPosition" + tmp);
	                    prop = 'backgroundPosition';
	                    typeof (value) == 'number' && (value = value + 'px');
	                    value = tmp == 'Y' ? (value + " " + (v || "top")) : ((v || 'left') + " " + value);
	                }
	            }
	            if (typeof el.style[prop] != "undefined") {
	                el.style[prop] = value + (typeof value === "number" && !rexclude.test(prop) ? 'px' : '');
	                bRtn = bRtn && true;
	            } else {
	                bRtn = bRtn && false;
	            }
	        }
	        return bRtn;
	    }, getScrollTop: function (doc) {
	        var _doc = doc || document;
	        return Math.max(_doc.documentElement.scrollTop, _doc.body.scrollTop);
	    }, getClientHeight: function (doc) {
	        var _doc = doc || document;
	        return _doc.compatMode == "CSS1Compat" ? _doc.documentElement.clientHeight : _doc.body.clientHeight;
	    }
	};
	
	ZENG.string = {
	    RegExps: {
	        trim: /^\s+|\s+$/g,
	        ltrim: /^\s+/,
	        rtrim: /\s+$/,
	        nl2br: /\n/g,
	        s2nb: /[\x20]{2}/g,
	        URIencode: /[\x09\x0A\x0D\x20\x21-\x29\x2B\x2C\x2F\x3A-\x3F\x5B-\x5E\x60\x7B-\x7E]/g,
	        escHTML: {re_amp: /&/g, re_lt: /</g, re_gt: />/g, re_apos: /\x27/g, re_quot: /\x22/g},
	        escString: {bsls: /\\/g, sls: /\//g, nl: /\n/g, rt: /\r/g, tab: /\t/g},
	        restXHTML: {re_amp: /&amp;/g, re_lt: /&lt;/g, re_gt: /&gt;/g, re_apos: /&(?:apos|#0?39);/g, re_quot: /&quot;/g},
	        write: /\{(\d{1,2})(?:\:([xodQqb]))?\}/g,
	        isURL: /^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i,
	        cut: /[\x00-\xFF]/,
	        getRealLen: {r0: /[^\x00-\xFF]/g, r1: /[\x00-\xFF]/g},
	        format: /\{([\d\w\.]+)\}/g
	    }, commonReplace: function (s, p, r) {
	        return s.replace(p, r);
	    }, format: function (str) {
	        var args = Array.prototype.slice.call(arguments), v;
	        str = String(args.shift());
	        if (args.length == 1 && typeof (args[0]) == 'object') {
	            args = args[0];
	        }
	        ZENG.string.RegExps.format.lastIndex = 0;
	        return str.replace(ZENG.string.RegExps.format, function (m, n) {
	            v = ZENG.object.route(args, n);
	            return v === undefined ? m : v;
	        });
	    }
	};
	
	
	ZENG.object = {
	    routeRE: /([\d\w_]+)/g,
	    route: function (obj, path) {
	        obj = obj || {};
	        path = String(path);
	        var r = ZENG.object.routeRE, m;
	        r.lastIndex = 0;
	        while ((m = r.exec(path)) !== null) {
	            obj = obj[m[0]];
	            if (obj === undefined || obj === null) {
	                break;
	            }
	        }
	        return obj;
	    }
	};
	
	
	var ua = ZENG.userAgent = {}, agent = navigator.userAgent;
	ua.ie = 9 - ((agent.indexOf('Trident/5.0') > -1) ? 0 : 1) - (window.XDomainRequest ? 0 : 1) - (window.XMLHttpRequest ? 0 : 1);
	
	
	if (typeof (ZENG.msgbox) == 'undefined') {
	    ZENG.msgbox = {};
	}
	ZENG.msgbox._timer = null;
	ZENG.msgbox.loadingAnimationPath = ZENG.msgbox.loadingAnimationPath || ("loading.gif");
	ZENG.msgbox.show = function (msgHtml, type, timeout, opts) {
	    if (typeof (opts) == 'number') {
	        opts = {topPosition: opts};
	    }
	    opts = opts || {};
	    var _s = ZENG.msgbox,
	        template = '<span class="zeng_msgbox_layer" style="display:none;z-index:10000;" id="mode_tips_v2"><span class="gtl_ico_{type}"></span>{loadIcon}{msgHtml}<span class="gtl_end"></span></span>', loading = '<span class="gtl_ico_loading"></span>', typeClass = [0, 0, 0, 0, "succ", "fail", "clear"], mBox, tips;
	    _s._loadCss && _s._loadCss(opts.cssPath);
	    mBox = ZENG.dom.get("q_Msgbox") || ZENG.dom.createElementIn("div", document.body, false, {className: "zeng_msgbox_layer_wrap"});
	    mBox.id = "q_Msgbox";
	    mBox.style.display = "";
	    mBox.innerHTML = ZENG.string.format(template, {
	        type: typeClass[type] || "hits",
	        msgHtml: msgHtml || "",
	        loadIcon: type == 6 ? loading : ""
	    });
	    _s._setPosition(mBox, timeout, opts.topPosition);
	};
	ZENG.msgbox._setPosition = function (tips, timeout, topPosition) {
	    timeout = timeout || 5000;
	    var _s = ZENG.msgbox, bt = ZENG.dom.getScrollTop(), ch = ZENG.dom.getClientHeight(), t = Math.floor(ch / 2) - 40;
	    ZENG.dom.setStyle(tips, "top", ((document.compatMode == "BackCompat" || ZENG.userAgent.ie < 7) ? bt : 0) + ((typeof (topPosition) == "number") ? topPosition : t) + "px");
	    clearTimeout(_s._timer);
	    tips.firstChild.style.display = "";
	    timeout && (_s._timer = setTimeout(_s.hide, timeout));
	};
	ZENG.msgbox.hide = function (timeout) {
	    var _s = ZENG.msgbox;
	    if (timeout) {
	        clearTimeout(_s._timer);
	        _s._timer = setTimeout(_s._hide, timeout);
	    } else {
	        _s._hide();
	    }
	};
	ZENG.msgbox._hide = function () {
	    var _mBox = ZENG.dom.get("q_Msgbox"), _s = ZENG.msgbox;
	    clearTimeout(_s._timer);
	    if (_mBox) {
	        var _tips = _mBox.firstChild;
	        ZENG.dom.setStyle(_mBox, "display", "none");
	    }
	};
	
	module.exports = {
	    showError: function(msgHtml){
	        ZENG.msgbox.show(msgHtml, 5, 1000);
	    },
	    showTip: function(msgHtml){
	        ZENG.msgbox.show(msgHtml, 1, 1000);
	    },
	    showOK: function(msgHtml){
	        ZENG.msgbox.show(msgHtml, 4, 1000);
	    },
	    showLoading: function(msgHtml){
	        ZENG.msgbox.show(msgHtml, 6, 1000);
	    },
	    show: function(msgHtml, type, timeout, opts){
	        ZENG.msgbox.show(msgHtml, type, timeout, opts);
	    },
	    hide: function(timeout){
	        ZENG.msgbox.hide(timeout);
	    }
	};
	


/***/ },
/* 70 */
/***/ function(module, exports) {

	
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


/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = "<!--<div class=\"msg-board-wrap  active-create\">-->\n<div class=\"msg-board-wrap\">\n  <div class=\"header am-cf\">\n    <span class=\"title\">告白墙</span>\n    <a id=\"btnShowCreate\" class=\"show-when-list am-btn am-btn-purple am-fr am-round\">我要告白</a>\n    <div class=\"tabs am-fr show-when-list tab-menu\">\n      <a data-tab=\"newList\" href=\"javascript:;\" class=\"active\"><span id=\"unReadCnt\" class=\"boderRadAll_5 am-round \">99</span>最新告白</a>\n      <a data-tab=\"hotList\" href=\"javascript:;\">精彩告白</a>\n    </div>\n    <!-- 返回按钮-->\n    <a id=\"btnBacktoList\" href=\"javascript:;\" class=\"am-fr show-when-create btn-back-wrap am-margin-top\">\n      <i class=\"back\"></i> 返回告白墙\n    </a>\n  </div>\n  <!-- 告白模板 -->\n  <script type=\"text/html\" id=\"itemTpl\">\n    <div class=\"item\">\n      <p class=\"detail am-text-break\" style=\"color:{{fontColor}}\">\n        {{content}}\n      </p>\n      <div class=\"sender\">\n        <div class=\"am-g\">\n          <div class=\"am-u-sm-2\">\n            {{if anonymous}}\n            <span class=\"anonymous\"></span>\n            {{else}}\n            <img src=\"{{user.largeAvatar}}\" class=\"avatar am-circle\">\n            {{/if}}\n          </div>\n          <div class=\"am-u-sm-10 info\">\n            <p class=\"name\">{{anonymous ?'匿名粉丝': user.nickName}}</p>\n            <p class=\"send-time\">发布于<span class=\"am-margin-left-sm\">{{time}}</span></p>\n            <a class=\"btn-like am-btn am-round am-vertical-align {{liked?'active':''}}\" data-likeid=\"{{id}}\" data-liked=\"{{liked+''}}\">\n              <i class=\"icon-heart am-vertical-align-middle\"></i>\n              <span class=\"am-vertical-align-middle\">{{likeCount}}</span>\n            </a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </script>\n\n  <div class=\"content am-g show-when-list wall-list\">\n    <!--列表-->\n    <div class=\"tab newList\">\n      <div class=\"am-u-sm-4 column-0\">\n        <!--第一列-->\n        <!--<div class=\"item\"><p class=\"detail am-text-break\">-->\n        <!--sfaslfjasdkfjasl;fjal;sjdf;啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊啊发案发后啊aklsjdfkl;asjfl;adsj;lfsldkfkl;sjfkl</p>-->\n        <!--<div class=\"sender\">-->\n        <!--<div class=\"am-g\">-->\n        <!--<div class=\"am-u-sm-2\"><img-->\n        <!--src=\"http://img1.c.yinyuetai.com/user/avatar/160502/10392675/-M-fa3f63fbbca174fa3457f1bc313236b3_20x20.jpg\"-->\n        <!--class=\"avatar am-circle\"></div>-->\n        <!--<div class=\"am-u-sm-10 info\"><p class=\"name\">asfsadfasf</p>-->\n        <!--<p class=\"send-time\">发布于<span class=\"am-margin-left-sm\">2016-10-23 34:34:00</span></p><a-->\n        <!--class=\"btn-like am-btn am-round am-vertical-align\"><i-->\n        <!--class=\"icon-heart am-vertical-align-middle\"></i><span-->\n        <!--class=\"am-vertical-align-middle\">32433</span></a></div>-->\n        <!--</div>-->\n        <!--</div>-->\n        <!--</div>-->\n      </div>\n      <div class=\"am-u-sm-4 column-1\">\n        <!--第二列-->\n      </div>\n      <div class=\"am-u-sm-4 column-2\">\n        <!--第三列-->\n      </div>\n\n    </div>\n\n    <!--精彩告白-->\n    <div class=\"tab hotList Hidden\">\n      <div class=\"am-u-sm-4 column-0\">\n        <!--第一列-->\n      </div>\n      <div class=\"am-u-sm-4 column-1\">\n        <!--第二列-->\n      </div>\n      <div class=\"am-u-sm-4 column-2\">\n        <!--第三列-->\n      </div>\n    </div>\n\n  </div>\n\n  <!--创建-->\n  <div class=\"content show-when-create create-wrap am-margin-top-lg Hidden\">\n    <div class=\"top am-margin-left am-padding-horizontal\">\n      爱,就要大声告白!\n    </div>\n    <div class=\"am-g am-padding-horizontal\">\n      <div class=\"am-u-sm-8\">\n        <textarea class=\"input-text boderRadAll_5\" placeholder=\"请输入告白\" name=\"\" id=\"txtMsg\" cols=\"30\" rows=\"10\"></textarea>\n        <div class=\"options-wrap am-vertical-align am-margin-top\">\n          <div class=\"color-wrap am-vertical-align-middle\">\n            文字颜色:\n            <!--<span class=\"color-title\">文字颜色</span>-->\n            <div class=\"colors\">\n              <a class=\"black am-circle active\" href=\"javascript:;\"></a>\n              <a class=\"red am-circle\" href=\"javascript:;\"></a>\n              <a class=\"yellow am-circle\" href=\"javascript:;\"></a>\n              <a class=\"green am-circle\" href=\"javascript:;\"></a>\n              <a class=\"blue am-circle\" href=\"javascript:;\"></a>\n              <a class=\"purple am-circle\" href=\"javascript:;\"></a>\n            </div>\n          </div>\n          <div class=\"am-checkbox-inline am-vertical-align-middle am-margin-left\">\n            <label>\n              <input id=\"cbAnonymous\" type=\"checkbox\"> 匿名告白\n            </label>\n          </div>\n          <div class=\"tip am-vertical-align-middle\">您还可以输入<span id=\"txtLength\" class=\"red\">200</span>字</div>\n        </div>\n        <div class=\"am-cf\">\n          <button id=\"btnSendText\" class=\"am-btn am-btn-red am-fr boderRadAll_3 am-margin-top-xl\">发布告白</button>\n        </div>\n        <div class=\"am-cf\">\n          <span class=\"am-fr send-tip\">发布公告需要消耗5积分,您当前共有<span id=\"userScore\" class=\"red\">0</span>积分</span>\n        </div>\n      </div>\n      <div class=\"input-tip am-u-sm-4\">至少用20字来表达你的爱!输入文字不能超过200.\n        <p>表白中请勿发布广告,严禁发布违法内容.</p>\n      </div>\n    </div>\n  </div>\n</div>\n"

/***/ },
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */
/***/ function(module, exports) {

	var flashTemp =
	  '<object width="{width}" height="{height}"  align="middle"' +
	  'id="{id}" type="application/x-shockwave-flash" ' +
	  'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' +
	  '<param value="{src}" name="movie">' +
	  '<param value="{always}" name="allowscriptaccess">' +
	  '<param value="{fullscreen}" name="allowfullscreen">' +
	  '<param value="{quality}" name="quality">' +
	  '<param value="{flashvars}" name="flashvars">' +
	  '<param value="{wmode}" name="wmode" />' +
	  '<embed width="{width}" height="{height}"  name="{id}"' +
	  'type="application/x-shockwave-flash" src="{src}" allowscriptaccess="{always}"' +
	  'allowfullscreen="{fullscreen}" quality="{quality}"  wmode="{wmode}" flashvars="{flashvars}" />' +
	  '</object>';
	var win = window;
	var origin = win.location.origin;
	var uid = 999;
	win.YYTPCFlashReadyState = false;
	var getSwfDOM = function (id) {
	  var swf;
	  var embed;
	  var el = document.getElementById(id) || null;
	  if (el && el.nodeName.toUpperCase() === 'OBJECT') {
	    if (typeof el.SetVariable !== 'undefined') {
	      swf = el;
	    } else {
	      embed = el.getElementsByTagName('embed')[0];
	      if (embed) {
	        swf = embed;
	      }
	    }
	  }
	  return swf;
	};
	var render = function (tpl, data) {
	  if (data) {
	    return tpl.replace(/\{(.*?)\}/ig, function () {
	      return data[arguments[1]] || '';
	    });
	  }
	  return tpl;
	};
	var FlashApi = function (options) {
	  this.$el = typeof options.el === 'string' ? document.getElementById(options.el) : options.el;
	  this._options = options;
	  this._props = options.props || {};
	  this.$attrs = {
	    id: 'YYTFlash' + (uid++), //  配置id
	    src: this._props.src || origin + '/flash/RTMPInplayer.swf?t=201606029.1', //  引入swf文件
	    width: this._props.width || 895,
	    height: this._props.height || 502,
	    wmode: this._props.wmode || 'transparent', // 控制显示模型
	    flashvar: this._props.flashvar || '', //  初始化参数
	    always: this._props.always || 'always', //  控制是否交互
	    fullscreen: this._props.fullscreen || true, //  控制是否全屏
	    quality: this._props.quality || 'high'
	  };
	  this._html = render(flashTemp, this.$attrs);
	  this._methods = options.methods || {};
	  this._ready = false;
	  this._init();
	};
	
	FlashApi.prototype._init = function () {
	  this.$el.innerHTML = this._html;
	  this.$swf = getSwfDOM(this.$attrs.id);
	};
	
	FlashApi.prototype.onReady = function (callback) {
	  var self = this;
	  if (win.YYTPCFlashReadyState || this._ready) {
	    callback.call(this);
	  } else {
	    this.$timer = setInterval(function () {
	      if (win.YYTPCFlashReadyState) {
	        self._ready = true;
	        win.YYTPCFlashReadyState = false;
	        clearInterval(self.$timer);
	        self.$timer = null;
	        callback.call(self);
	      }
	    }, 0);
	  }
	};
	
	FlashApi.prototype.init = function (data) {
	  this.$swf.initData(data);
	};
	
	FlashApi.prototype.isReady = function () {
	  return this._ready;
	};
	
	FlashApi.prototype.addUrl = function (url, name) {
	  this.$swf.setvedioUrl(url, name);
	};
	
	FlashApi.prototype.width = function (value) {
	  var val = value;
	  if (typeof val === 'string') {
	    val = ~~val;
	  }
	  this.$swf.setPlayerWidth(val);
	};
	
	FlashApi.prototype.height = function (value) {
	  var val = value;
	  if (typeof val === 'string') {
	    val = ~~val;
	  }
	  this.$swf.setPlayerHeight(val);
	};
	
	FlashApi.prototype.notifying = function (obj) {
	  this.$swf.setOneMessageInchat(JSON.stringify(obj));
	};
	
	FlashApi.prototype.clear = function () {
	  this.$swf.clearAllMessage();
	};
	
	var shared = null;
	FlashApi.sharedInstanceFlashApi = function (options) {
	  if (!shared) {
	    shared = new FlashApi(options);
	  }
	  return shared;
	};
	
	win.YYTPCFlashOnReady = function () {
	  //  flash init success
	  win.YYTPCFlashReadyState = true;
	};
	
	module.exports = FlashApi;


/***/ },
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */
/***/ function(module, exports) {

	module.exports = "<li class=\"clearfix <%=msgType==0?'':'system-info'%>\" data-msgType=\"<%=msgType%>\" data-name=\"<%=nickName%>\" data-id=\"<%=fromAccount%>\">\n  <%if(msgType == 0){%>\n  <img onerror=\"this.src='../img/visitor_avator.jpg'\" src=\"<%=smallAvatar%>\" alt=\"\" class=\"fl visitor_avator\">\n  <%}%>\n  <p class=\"visitor_chat fl\">\n    <%if(msgType == 0){%>\n    <span class=\"visitorName\"><%=nickName%>:</span>\n    <%} else if(msgType == 4){%>\n        <span class=\"visitorName\"><%=nickName%>:</span>\n    <%} else{%>\n        <span class=\"visitorName\">消息:</span>\n    <% }%>\n    <%=content%>\n    <span class=\"time fr\"><%=time%></span>\n  </p>\n  <div class=\"controls_forbid_reject\">\n    <a href=\"javascript:;\" class=\"forbid am-btn-red\">禁言</a>\n    <a href=\"javascript:;\" class=\"reject am-btn-red\">踢出</a>\n    <%if(userId) {%>\n    <a href=\"javascript:;\" data-name=\"<%=nickName%>\" data-uid='<%=userId%>' class=\"ctrl am-btn-red\">场控</a>\n    <%}%>\n  </div>\n</li>\n"

/***/ },
/* 93 */,
/* 94 */,
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/placard_get.json', // 填写请求地址
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var base = __webpack_require__(28);
	var LoginUserView = __webpack_require__(103);
	var BaseView = base.View;
	
	var View = BaseView.extend({
	  el: '#topBar',
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.loginUser = new LoginUserView();
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	  },
	  ready: function () {
	    //  初始化
	    var _this = this;
	    this.loginUser.on('topbar-logined', function () {
	      _this.trigger('logined');
	    });
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  showLoginDialog: function () {
	    this.loginUser.showDialog();
	  },
	  hideLoginDialog: function () {
	    this.loginUser.hideDialog();
	  }
	});
	
	module.exports = View;


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Backbone = window.Backbone;
	var base = __webpack_require__(28);
	var BaseView = base.View;
	var storage = base.storage;
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var loginBox = __webpack_require__(50);
	var sginHTML = __webpack_require__(104);
	var loginedTemp = __webpack_require__(105);
	var win = window;
	var location = win.location;
	var IMModel = __webpack_require__(43);
	var imModel = IMModel.sharedInstanceIMModel();
	var config = __webpack_require__(44);
	var View = BaseView.extend({
	  el: '#loginUser',
	  events: {
	    'click #login': 'loginHandler',
	    'click .show-drop-menu': 'showDropMenu',
	    'click #logout': 'logoutHandler',
	    'mouseover .hoverMenu': 'nameHover',
	    'mouseout .hoverMenu': 'nameOut'
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this._dialog = null;
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.loginBox = loginBox();
	    this._dialog = this.loginBox.dialog;
	    this.userDromMenu = this.findDOMNode('.pcNav');
	  },
	  ready: function () {
	    //  初始化
	    if (user.isLogined()) {
	      //  已经登录
	      this.fetchUserInfo();
	    } else {
	      //  未登录
	      this.$el.html(sginHTML);
	    }
	    this.hideDropMenu();
	    this.defineEventInterface();
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  /**
	   * [loginHandler 处理登录按钮]
	   * @param  {[type]} e [description]
	   * @return {[type]}   [description]
	   */
	  loginHandler: function (e) {
	    var _this = this;
	    var status = this._dialog.status();
	    e.preventDefault();
	    if (status === 'hide') {
	      this._dialog.trigger('show');
	      this._dialog.once('hide', function () {
	        if (user.isLogined()) {
	          storage.remove('imSig');
	          _this.fetchUserInfo();
	          _this.trigger('topbar-logined');
	        }
	      });
	    } else {
	      this._dialog.trigger('hide');
	    }
	  },
	  /**
	   * [logoutHandler 退出]
	   * @param  {[type]} e [description]
	   * @return {[type]}   [description]
	   */
	  logoutHandler: function () {
	    storage.remove('imSig');
	    storage.set('signout', 1);
	    location.href = config.prefix + '/login.html';
	  },
	  fetchUserInfo: function () {
	    var _this = this;
	    var fetchImUserSigPromise = imModel.fetchIMUserSig();
	    fetchImUserSigPromise.done(function (userImInfo) {
	      var data;
	      if (userImInfo.roleType === 2) {
	        //  游客，未登录
	        _this.$el.html(sginHTML);
	      } else {
	        data = {
	          userName: userImInfo.nickName,
	          bigheadImg: userImInfo.largeAvatar
	        };
	        _this.render(data);
	      }
	    });
	  },
	  render: function (data) {
	    var loginedHTML = this.compileHTML(loginedTemp, data);
	    this.$el.html(loginedHTML);
	    this.showDropMenuEle = $('.loginMsg .pcNav');
	  },
	  /**
	   * 显示下拉菜单
	   */
	  showDropMenu: function (e) {
	    e.preventDefault();
	    this.showDropMenuEle.toggle();
	    return false;
	  },
	  /**
	   * 隐藏下拉菜单
	   */
	  hideDropMenu: function () {
	    var _this = this;
	    $(document).on('click', function () {
	      if (_this.showDropMenuEle) {
	        _this.showDropMenuEle.hide();
	      }
	    });
	  },
	  showDialog: function () {
	    var _this = this;
	    this._dialog.trigger('show');
	    this._dialog.once('hide', function () {
	      if (user.isLogined()) {
	        _this.trigger('topbar-logined');
	      }
	    });
	  },
	  hideDialog: function () {
	    this._dialog.trigger('hide');
	  },
	  /**
	   * 定义对外公布的事件
	   */
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:userProfileChanged', function (users) {
	      var data = {
	        userName: users.nickName,
	        bigheadImg: users.headImg
	      };
	      self.render(data);
	    });
	  },
	  nameHover: function () {
	    this.showDropMenuEle.show();
	  },
	  nameOut: function () {
	    this.showDropMenuEle.hide();
	  }
	});
	
	module.exports = View;


/***/ },
/* 104 */
/***/ function(module, exports) {

	module.exports = "<div class=\"PcMsg fl\">\n    <a class=\"user-login\" href=\"#\" id=\"login\">登陆</a>\n</div>"

/***/ },
/* 105 */
/***/ function(module, exports) {

	module.exports = "<div class=\"avator fl\">\n    <img class=\"am-circle\" style=\"width: 40px; height: 40px;\" src=\"{{bigheadImg}}\" alt=\"用户头像\">\n</div>\n<div class=\"loginMsg fl hoverMenu\">\n    <a class=\"user-name show-drop-menu\" href=\"#\">{{userName}}<span></span></a>\n    <ul class=\"pcNav hoverMenu\">\n        <li><a href=\"anchor-setting.html\">个人中心</a></li>\n        <li><span class=\"header-logout\" id=\"logout\">退出</span></li>\n    </ul>\n</div>\n"

/***/ },
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/user/anchor/unfollow.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/popularity/add.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/enter_or_exit.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 184 */,
/* 185 */,
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var base = __webpack_require__(28);
	var BaseView = base.View; // View的基类
	var NoticeGetModel = __webpack_require__(95);
	var FollowModel = __webpack_require__(187);
	var UnFollowModel = __webpack_require__(158);
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var Backbone = window.Backbone;
	var _ = __webpack_require__(27);
	var msgBox = __webpack_require__(69);
	var IMModel = __webpack_require__(43);
	var imModel = IMModel.sharedInstanceIMModel();
	var SNSShareView = __webpack_require__(188);
	
	var View = BaseView.extend({
	  el: '.userInfoWrap', // 设置View对象作用于的根元素，比如id
	  rawLoader: function () { // 可用此方法返回字符串模版
	    return __webpack_require__(190);
	  },
	  events: { // 监听事件
	    'click .btnFollow': 'followClickHandler',
	    'click #btnShare': 'shareClick',
	    'mouseover .btnFollow': function (e) {
	      var target = $(e.target);
	      if (target.hasClass('followed')) {
	        target.text('取消关注');
	      }
	    },
	    'mouseout .btnFollow': function (e) {
	      var target = $(e.target);
	      if (target.hasClass('followed')) {
	        target.text('已关注').addClass('m_disabled');
	      }
	    }
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    this.elements = {};
	    this.followParams = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken()
	    };
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    var el = this.$el;
	    this.noticeGetModel = new NoticeGetModel();
	    this.followModel = FollowModel.sharedInstanceModel();
	    this.unFollowModel = UnFollowModel.sharedInstanceModel();
	
	    this.tagTpl = this.$el.find('#tagTpl').html();
	
	    this.elements = {
	      anchorAvatar: el.find('#anchorAvatar'),
	      name: el.find('#anchorName'),
	      btnAdd: el.find('#btnAdd'),
	      btnReport: el.find('#btnReport'),
	      tagsWrap: el.find('#tagsWrap'),
	      noticeWrap: $('.noticWrap')
	    };
	
	    this.noticeGetParams = {
	      deviceinfo: '{"aid":"30001001"}',
	      roomId: '',
	      access_token: user.getWebToken()
	    };
	    this.btnFollow = el.find('.btnFollow');
	    this.genderDOM = el.find('.icon-gender');
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function (ops) {
	    this.options = _.extend({
	      share: null
	    }, ops);
	    this.snsShareView = new SNSShareView(this.options.share || {});
	    this.defineEventInterface();
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:roomInfoReady', function (data) {
	      if (data) {
	        self.roomInfo = data;
	        self.bindData(data);
	        self.getNoticeInfo();
	      }
	    });
	
	    Backbone.on('event:currentUserInfoReady', function (userInfo) {
	      var gender = {
	        Boy: 'male',
	        Gril: 'famle'
	      };
	      if (userInfo && userInfo.sex) {
	        self.genderDOM.addClass(gender[userInfo.sex] || 'male');
	      }
	    });
	
	    Backbone.on('event:updateRoomNotice', function (data) {
	      if (data) {
	        self.elements.noticeWrap.text(data.content || '暂无公告');
	      }
	    });
	  },
	  bindData: function (data) {
	    var els = this.elements;
	
	    els.anchorAvatar.attr('src', data.creator.largeAvatar);
	    els.name.text(data.creator.nickName);
	
	    var template = _.template(this.tagTpl);
	    els.tagsWrap.html(template(data.creator));
	
	    if (data.creator.isFollowed) {
	      this.btnFollow.addClass('followed').text('已关注').addClass('m_disabled');
	    }
	  },
	  getNoticeInfo: function () {
	    var self = this;
	    var promise;
	    this.noticeGetParams.roomId = this.roomInfo.id;
	
	    promise = this.noticeGetModel.executeJSONP(this.noticeGetParams);
	    promise.done(function (res) {
	      if (res && res.data) {
	        var notice = null;
	        if (res.data.placards) {
	          notice = res.data.placards[0];
	        }
	        if (notice) {
	          self.elements.noticeWrap.text(notice.content || '暂无公告');
	        } else {
	          self.elements.noticeWrap.text('暂无公告');
	        }
	      }
	    });
	    promise.fail(function (err) {
	      msgBox.showError(err.msg || '获取公告失败');
	    });
	  },
	  followClickHandler: function () {
	    var self = this;
	    this.followParams.anchorId = this.roomInfo.creator.uid;
	    if (this.btnFollow.hasClass('followed')) {
	      var promise1 = this.unFollowModel.executeJSONP(self.followParams);
	      promise1.done(function (res) {
	        if (res.data && res.data.success) {
	          msgBox.showOK('已取消关注主播');
	          self.btnFollow.removeClass('followed').removeClass('m_disabled').text('关注');
	        }
	      });
	      promise1.fail(function () {
	        msgBox.showTip('操作失败,稍后重试');
	      });
	    } else {
	      if (imModel.get('data').userId === self.followParams.anchorId) {
	        msgBox.showTip('不能关注自己!');
	        return null;
	      }
	      var promise = this.followModel.executeJSONP(self.followParams);
	      promise.done(function (res) {
	        if (res.data && res.data.success) {
	          msgBox.showOK('已成功关注主播');
	          self.btnFollow.addClass('followed').addClass('m_disabled').text('取消关注');
	        } else {
	          msgBox.showTip('关注失败,稍后重试');
	        }
	      });
	      promise.fail(function () {
	        msgBox.showTip('关注失败,稍后重试');
	      });
	    }
	    return this;
	  },
	  shareClick: function (e) {
	    var ops = {
	      url: '/liveroom.html?roomId=' + this.roomInfo.id,
	      title: this.roomInfo.roomName || '',
	      img: this.roomInfo.posterPic || '',
	      type: 1
	    };
	    if (this.options.share) {
	      $.extend(ops, this.options.share);
	    }
	    this.snsShareView.setOptions(ops);
	    this.snsShareView.show($(e.target));
	    // this.snsShareView.open();
	  }
	});
	
	module.exports = View;


/***/ },
/* 187 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/user/anchor/follow.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * SNS社区分享，qq,微博，微信等
	 */
	'use strict';
	
	var $ = __webpack_require__(1);
	var _ = __webpack_require__(27);
	var ZeroClipboard = window.ZeroClipboard;
	
	var uiConfirm = __webpack_require__(55);
	var shareTpl = __webpack_require__(189);
	var msgBox = __webpack_require__(69);
	
	var View = function (ops) {
	  this.options = {};
	  $.extend(this.options, ops);
	};
	
	$.extend(View.prototype, {
	  show: function (target) {
	    var self = this;
	    var height = target.height();
	    var offset = target.offset();
	    if (!this.snsDom) {
	      var complied = _.template(shareTpl);
	      var dom = complied({
	        title: encodeURIComponent(this.options.title + ',快来围观吧'),
	        url: encodeURIComponent('http://' + window.location.host + this.options.url),
	        img: this.options.img
	      });
	      dom = $(dom);
	      self.snsDom = dom;
	      $('body').append(dom);
	      dom.offset({
	        top: offset.top + height + 8,
	        left: offset.left - dom.width() + 61
	      });
	
	      self._bindCopy('#shareCopy');
	
	      dom.find('a').on('click', function () {
	        if ($(this).attr('data-tag') === 'copy') {
	          if (!self.clipBoardStatus) {
	            msgBox.showTip('复制失败，请尝试分享吧');
	          }
	          return false;
	        }
	        self.shareWidnow($(this).attr('href'));
	        self.snsDom.hide();
	        return false;
	      });
	      $(document).on('click', function (e) {
	        var temp = $(e.target);
	        if (self.snsDom && temp.attr('id') !== target.attr('id')) {
	          self.snsDom.hide();
	        }
	        return false;
	      });
	    } else {
	      if (this.snsDom.css('display') === 'block') {
	        this.snsDom.hide();
	      } else {
	        this.snsDom.show();
	      }
	    }
	  },
	  hide: function () {
	    this.snsDom.hide();
	  },
	  open: function () {
	    var title = encodeURIComponent(this.options.title + ',快来围观吧');
	    var url = 'http://' + window.location.host;
	    var img = this.options.img;
	    var goUrl;
	
	    url = encodeURIComponent(url + this.options.url);
	    var html = '<span class="share-wrap">' +
	      '<a href="http://i.yinyuetai.com/share?title=' + title + '&amp;url=' + url + '&amp;cover=' + img + '?t=20160405161857" title="分享到音悦台我的家" class="myhome J_sharelink"></a> ' +
	
	      '<a href="http://v.t.sina.com.cn/share/share.php?appkey=2817290261&amp;url=' + url + '&amp;title=' + title + '&amp;content=gb2312&amp;pic=' + img + '?t=20160405161857&amp;ralateUid=1698229264" title="分享到新浪微博" class="weibo17 J_sharelink"></a>' +
	
	      '<a href="http://connect.qq.com/widget/shareqq/index.html?url=' + url + '&amp;showcount=1&amp;desc=' + title + '&amp;title=' + title + '&amp;site=饭趴&amp;pics=' + img + '?t=20160405161857&amp;style=201&amp;width=39&amp;height=39" title="分享到QQ" class="qq17 J_sharelink"></a>' +
	
	      '<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + url + '&amp;desc=' + title + '" title="分享到QQ空间" class="qzone17 J_sharelink"></a>' +
	
	      '<a href="http://v.yinyuetai.com/share/weixin?title=' + title + '&amp;url=' + url + '" title="分享到微信"  class="weixin17 J_sharelink"></a>' +
	
	      '<a href="http://widget.renren.com/dialog/share?resourceUrl=' + url + '?t=20160405161857&amp;charset=UTF-8&amp;message=' + title + '" title="分享到人人网" class="renren17 J_sharelink"></a>' +
	
	      '<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&amp;url=' + url + '&amp;desc=' + title + '" title="分享到腾讯朋友" class="pengyou17 J_sharelink"></a>' +
	
	      '<a href="http://v.t.qq.com/share/share.php?title=' + title + '&amp;url=' + url + '&amp;pic=' + img + '?t=20160405161857" title="分享到腾讯微博" data-video-id="2539803" class="tencent17 J_sharelink"></a>' +
	
	      '<a href="http://huaban.com/bookmarklet?url=' + url + '&amp;video=&amp;title=' + title + '&amp;media=' + img + '?t=20160405161857&amp;description=' + title + '" title="分享到花瓣网" class="huaban17 J_sharelink"></a>' +
	
	      '<a href="http://t.sohu.com/third/post.jsp?&amp;url=' + url + '&amp;title=' + title + '&amp;content=utf-8" title="分享到搜狐微博" class="sohu17 J_sharelink"></a>' +
	
	      '<a href="http://fql.cc/yytafx?appkey=2817290261&amp;url=' + url + '&amp;title=' + title + '" title="分享到联通飞影" class="unicon17 J_sharelink"></a> ' +
	      '</span>';
	    uiConfirm.show({
	      title: '分享',
	      content: html,
	      okBtn: false,
	      cancelBtn: false,
	      okFn: function () {}
	    });
	    $('.share-wrap a').on('click', function () {
	      goUrl = $(this).attr('href');
	      window.open(goUrl, 'newwindow', 'height=750px,width=700px' +
	        ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
	      uiConfirm.close();
	      return false;
	    });
	  },
	  setOptions: function (ops) {
	    $.extend(this.options, {
	      url: '',
	      title: '',
	      img: '',
	      type: ''
	    }, ops);
	  },
	  shareWidnow: function (url) {
	    window.open(url, 'newwindow', 'height=750px,width=700px' +
	      ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
	  },
	  // 设置复制按钮
	  _bindCopy: function (id) {
	    var target = $(id);
	    var self = this;
	    this.clipBoard = new ZeroClipboard(target);
	    var text = this.options.title + ',快来围观吧!' + 'http://' + window.location.host + this.options.url;
	    target.attr({
	      'data-clipboard-text': text
	    });
	    this.clipBoard.on('ready', function () {
	      this.on('aftercopy', function () {
	        self.clipBoardStatus = true;
	        msgBox.showOK('房间地址复制成功！');
	      });
	    });
	    this.clipBoard.on('error', function () {
	      self.clipBoardStatus = false;
	      // msgBox.showTip('复制失败，请尝试分享吧');
	    });
	  }
	});
	
	module.exports = View;


/***/ },
/* 189 */
/***/ function(module, exports) {

	module.exports = "<div class=\"sns-share-wrap\">\n  <div class=\"sns-block am-round\">\n    <div class=\"arrow\"></div>\n    <div class=\"list\">\n      <a href=\"http://v.yinyuetai.com/share/weixin?title=<%=title%>&amp;url=<%=url%>\" title=\"分享到微信\"></a>\n      <a style=\"display:none\" href=\"javascript:;\"></a>\n      <a href=\"http://connect.qq.com/widget/shareqq/index.html?url=<%=url%>&amp;showcount=1&amp;desc=<%=title%>&amp;title=<%=title%>&amp;site=饭趴&amp;pics=<%=img%>?t=20160405161857&amp;style=201&amp;width=39&amp;height=39\" title=\"分享到QQ\"></a>\n      <a  href=\"http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=<%=url%>&amp;desc=<%=title%>\" title=\"分享到QQ空间\"></a>\n      <a href=\"http://v.t.sina.com.cn/share/share.php?appkey=2817290261&amp;url=<%=url%>&amp;title=<%=title%>&amp;content=gb2312&amp;pic=<%=img%>?t=20160405161857&amp;ralateUid=1698229264\" title=\"分享到新浪微博\"></a>\n      <a data-tag='copy' id=\"shareCopy\" href=\"javascript:;\"></a>\n    </div>\n  </div>\n</div>\n"

/***/ },
/* 190 */
/***/ function(module, exports) {

	module.exports = "<div class=\"user-info-wrap clearfix\">\n    <img id=\"anchorAvatar\" class=\"Left avator boderRadAll_35\"\n         src=\"http://img1.yytcdn.com/user/avatar/160322/703-1458640483613/-M-216abfaf3d4ae2ee4d194029b70cdc9d_100x100.jpg\"\n         alt=\"\">\n    <div class=\"info Left \">\n        <span id=\"anchorName\" class=\"name am-margin-right-sm\"></span>\n        <!--<span class=\"icon-gender\"></span>-->\n        <button class=\"btn am-btn am-btn-purple boderRadAll_5 btnFollow\" id=\"btnFollow\">关注</button>\n        <div class=\"tags\">\n            <span class=\"first\">标签:</span>\n            <span id=\"tagsWrap\">\n            </span>\n        </div>\n    </div>\n    <div class=\"Right\">\n        <div class=\"like\">\n            <button id=\"btnLike\" class=\"btn-like am-btn-red am-circle\"><i></i></button>\n            <span id=\"txtLikeCount\" class=\"number\">1</span></div>\n        <a id=\"btnShare\" href=\"javascript:;\" class=\"btn-share\"></a>\n    </div>\n</div>\n<script type=\"text/template\" id=\"tagTpl\">\n    <%\n    tags = tags || [];\n    for(var i=0,l=tags.length; i < l; i++) {\n    %>\n    <span class=\"item\"><%=tags[i]%></span>\n    <%\n    }\n    %>\n</script>\n"

/***/ },
/* 191 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var base = __webpack_require__(28);
	var BaseView = base.View; // View的基类
	var Backbone = window.Backbone;
	
	var View = BaseView.extend({
	  el: '.edit_background', // 设置View对象作用于的根元素，比如id
	  rawLoader: function () { // 可用此方法返回字符串模版
	    return __webpack_require__(192);
	  },
	  events: { // 监听事件
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    this.elements = {};
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    var el = this.$el;
	    this.elements.roomName = el.find('.room-name');
	    this.elements = {
	      roomName: el.find('.room-name'),
	      onLine: el.find('#onlineCount'),
	      popularity: el.find('.popularityCount'),
	      onlineTxt: el.find('#onlineTxt'),
	      onLineBlock: el.find('.online')
	    };
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function () {
	    this.defineEventInterface();
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:roomInfoReady', function (data) {
	      if (data) {
	        // 频道
	        if (data.channelId) {
	          self.bindData(data);
	        } else {
	          // 直播
	          if (data.status === 3) {
	            self.whenPalypack(data);
	          } else {
	            self.bindData(data);
	          }
	        }
	      }
	    });
	    Backbone.on('event:updateRoomInfo', function (data) {
	      if (data) {
	        self.elements.onLine.text(data.currentOnline || 0);
	        self.elements.popularity.text(data.popularity || 0);
	      }
	    });
	  },
	  bindData: function (data) {
	    var els = this.elements;
	    els.roomName.text(data.roomName || data.channelName || '');
	    els.onLine.text(data.online || 0);
	    var num = data.popularity < data.realPopularity ? data.realPopularity : data.popularity;
	    els.popularity.text(num || 0);
	  },
	  whenPalypack: function (data) {
	    var els = this.elements;
	    els.onlineTxt.text('历史最高在线人数');
	    els.roomName.text(data.roomName || '');
	    els.onLine.text(data.seen || 0);
	    els.popularity.text(data.popularity || 0);
	  }
	});
	
	module.exports = View;


/***/ },
/* 192 */
/***/ function(module, exports) {

	module.exports = "<div class=\"room-name fl\"></div>\n<div class=\"room-title-right fr\">\n  <span class=\"online\"> <span id=\"onlineTxt\">在线人数</span>:<span class=\"red count\" id=\"onlineCount\">0</span></span>\n  <span class=\"popularity\">人气:<span class=\"green count popularityCount\" id=\"popularityCount\">0</span></span>\n  <!--<button class=\"btn Hand btn-support boderRadAll_3\"><i></i> 顶一下</button>-->\n</div>\n"

/***/ },
/* 193 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var Backbone = window.Backbone;
	var _ = __webpack_require__(27);
	var base = __webpack_require__(28);
	var BaseView = base.View; // View的基类
	
	var uiConfirm = __webpack_require__(55);
	var DateTime = __webpack_require__(70);
	var FlashAPI = __webpack_require__(82);
	var msgBox = __webpack_require__(69);
	var YYTIMServer = __webpack_require__(42);
	// var RoomDetailModel = require('../../models/anchor/room-detail.model');
	var IMModel = __webpack_require__(43);
	var imModel = IMModel.sharedInstanceIMModel();
	var GiftModel = __webpack_require__(60);
	var UserInfo = __webpack_require__(62);
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	// 清屏,锁屏
	var RoomManagerView = __webpack_require__(194);
	
	var View = BaseView.extend({
	  el: '#anchorCtrlChat', // 设置View对象作用于的根元素，比如id
	  rawLoader: function () { // 可用此方法返回字符串模版
	    return __webpack_require__(195);
	  },
	  events: { // 监听事件
	    // 'click #msgList': 'msgListClicked'
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    this.elements = {};
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    var el = this.$el;
	    this.elements = {
	      msgList: el.find('#msgList'),
	      chatHistory: el.find('#chatHistory')
	    };
	
	    this.giftModel = GiftModel.sharedInstanceModel();
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function (ops) {
	    this.options = _.extend({}, ops);
	    if ($('#broadCastFlash').length > 0) {
	      this.flashAPI = FlashAPI.sharedInstanceFlashApi({
	        el: 'broadCastFlash'
	      });
	    }
	    this.defineEventInterface();
	
	    this.roomCtrlView = new RoomManagerView({
	      roomInfo: this.roomInfo,
	      FlashApi: this.flashAPI,
	      msgList: this.elements.msgList
	    });
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:roomInfoReady', function (data) {
	      if (data) {
	        self.roomInfo = data;
	        if (data.status === 2) {
	          self.checkUserCanJoinRoom();
	        }
	      }
	    });
	
	    Backbone.on('event:onMsgNotify', function (notifyInfo) {
	      if (_.isArray(notifyInfo)) {
	        _.each(notifyInfo, function (item) {
	          if (item.hasOwnProperty('msg')) {
	            if (item.msg.isSend === false) {
	              self.onMsgNotify(item.msg);
	            }
	          } else if (item.hasOwnProperty('isSend')) {
	            if (item.isSend === false) {
	              self.onMsgNotify(item);
	            }
	          }
	        });
	      } else if (_.isObject(notifyInfo)) {
	        if (notifyInfo.isSend === false) {
	          self.onMsgNotify(notifyInfo);
	        }
	      }
	    });
	    Backbone.on('event:onGroupInfoChangeNotify', function (notifyInfo) {
	      self.onGroupInfoChangeNotify(notifyInfo);
	    });
	    Backbone.on('event:groupSystemNotifys', function (notifyInfo) {
	      self.groupSystemNotifys(notifyInfo);
	    });
	
	    Backbone.on('event:visitorSendMessage', function (data) {
	      if (self.options.type !== 'channel') {
	        if (UserInfo.isDisbaleTalk(user.get('userId'), self.roomInfo.id)) {
	          msgBox.showTip('您已经被禁言,不能发弹幕哦');
	          return null;
	        }
	        if (UserInfo.isLockScreen(self.roomInfo.id)) {
	          msgBox.showTip('主播:进行了锁屏操作');
	          return null;
	        }
	      }
	      self.beforeSendMsg(data, function (msgObj) {
	        self.sendMsgToGroup(msgObj);
	      });
	      return null;
	    });
	
	    Backbone.on('event:visitorInteractive', function (data) {
	      if (UserInfo.isDisbaleTalk(user.get('userId'), self.roomInfo.id) && data.msgType === 0) {
	        msgBox.showTip('您已经被主播禁言十分钟.');
	      } else {
	        self.beforeSendMsg(data, function (msgObj) {
	          self.sendMsgToGroup(msgObj);
	        });
	      }
	    });
	    Backbone.on('event:forbidUserSendMsg', function (data) {
	      self.forbidUserSendMsgHandler(data);
	    });
	    Backbone.on('event:currentUserInfoReady', function (userInfo) {
	      if (userInfo) {
	        self.currentUserInfo = userInfo;
	      }
	    });
	
	    // Backbone.on('event:IMGroupInfoReady', function (info) {
	    //   self.currentGroupInfo = info;
	    // });
	
	    Backbone.on('event:liveShowEnded', function (data) {
	      uiConfirm.show({
	        title: '直播结束',
	        content: '本场直播已经结束,点击确定返回首页.',
	        cancelBtn: false,
	        okFn: function () {
	          window.location.href = '/';
	        },
	        cancelFn: function () {
	          window.location.href = '/';
	        }
	      });
	      self.roomInfo.status = data.roomStatus;
	    });
	  },
	
	  onMsgNotify: function (notifyInfo) {
	    var self = this;
	    var msgObj = {};
	
	    // if (notifyInfo && notifyInfo.type == 0 && notifyInfo.elems && notifyInfo.elems.length > 0) {
	    if (notifyInfo && notifyInfo.elems && notifyInfo.elems.length > 0) {
	      var elem = notifyInfo.elems[0];
	      if (elem.type === 'TIMCustomElem') {
	        msgObj = elem.content.data;
	      } else if (elem.type === 'TIMGroupTipElem') {
	        msgObj = elem.content.groupInfoList[0];
	      } else {
	        msgObj = elem.content.text + '';
	        // msgObj = msgObj.replace(/&quot;/g, '\'');
	        msgObj = msgObj.replace(/[']/g, '').replace(/&quot;/g, '\'');
	      }
	      try {
	        if (_.isString(msgObj)) {
	          msgObj = JSON.parse(msgObj);
	        }
	      } catch (e) {
	        console.log(e);
	      }
	      if (_.isObject(msgObj)) {
	        msgObj.fromAccount = notifyInfo.fromAccount;
	
	        self.beforeSendMsg(msgObj, function (msg) {
	          self.addMessage(msg);
	        });
	      }
	    }
	  },
	
	  beforeSendMsg: function (msg, callback) {
	    var self = this;
	    var msgObj = msg;
	    var tempInfo;
	    var isChannel = this.options.type === 'channel';
	    var roomId = this.roomInfo.id;
	
	    // 频道接收消息
	    if (isChannel) {
	      if (~~msg.channelId !== ~~this.roomInfo.channelId) {
	        return;
	      }
	    } else {
	      if (~~msgObj.roomId !== ~~roomId) {
	        return;
	      }
	      if (self.roomInfo && self.roomInfo.status === 3) {
	        msgBox.showTip('直播已结束,无法进行互动');
	        return;
	      }
	    }
	
	    switch (msgObj.msgType) {
	      case 0: // 文本消息
	        msgObj = $.extend(msgObj, {
	          userId: user.get('userId')
	        });
	        callback(msgObj);
	        break;
	      case 1: // 发送礼物
	        var giftName = self.giftModel.findGift(msgObj.giftId).name || '礼物';
	        msgObj.content = '<b>' + msgObj.nickName + '</b>向主播赠送' + giftName + '!';
	        msgObj.smallAvatar = '';
	        callback(msgObj);
	        break;
	      case 2: // 公告
	        Backbone.trigger('event:updateRoomNotice', msgObj);
	        break;
	      case 3: // 点赞
	        msgObj.content = '<b>' + msgObj.nickName + '</b>点赞一次!';
	        msgObj.smallAvatar = '';
	        callback(msgObj);
	        break;
	      case 4: //  清屏
	        this.elements.msgList.children().remove();
	        msgObj.content = '进行了清屏操作!';
	        msgObj.smallAvatar = '';
	        callback(msgObj);
	        tempInfo = {
	          roomId: self.roomInfo.id,
	          nickName: '主播',
	          smallAvatar: '',
	          msgType: 4,
	          content: msgObj.content
	        };
	        self.flashAPI.onReady(function () {
	          this.notifying(tempInfo);
	        });
	        break;
	      case 5: //  禁言
	        Backbone.trigger('event:forbidUserSendMsg', msgObj);
	        break;
	      default:
	        break;
	    }
	  },
	  onGroupInfoChangeNotify: function (notifyInfo) {
	    var intro;
	    var msg;
	    var notify;
	    if (notifyInfo && notifyInfo.GroupIntroduction) {
	      intro = JSON.parse(notifyInfo.GroupIntroduction);
	      UserInfo.setLockScreen(this.roomInfo.id, intro.blockState);
	      msg = '主播进行了' + (intro.blockState ? '锁屏' : '解屏') + '操作';
	      msgBox.showTip(msg);
	      Backbone.trigger('event:LockScreen', intro.blockState);
	    }
	    if (notifyInfo && notifyInfo.GroupNotification) {
	      notify = JSON.parse(notifyInfo.GroupNotification);
	      notify.isEvent = true;
	      Backbone.trigger('event:UserKickOut', notify);
	    }
	  },
	  groupSystemNotifys: function () {},
	  /**
	   * 获取消息模板
	   * @returns {*}
	   */
	  getMessageTpl: function () {
	    return __webpack_require__(92);
	  },
	  sendMsgToGroup: function (msgObj) {
	    this.addMessage(msgObj);
	
	    YYTIMServer.sendMessage({
	      groupId: this.roomInfo.imGroupid,
	      msg: msgObj
	    });
	    this.autoDeleteMsgList();
	  },
	  // 将消息追加到dom中
	  addMessage: function (msg) {
	    var self = this;
	    var msgObj;
	    // var roomId = this.roomInfo.id;
	    msgObj = _.extend({
	      nickName: '匿名',
	      content: '',
	      smallAvatar: '',
	      time: self.getDateStr(new Date()),
	      fromAccount: '',
	      userId: ''
	    }, msg);
	
	    // if (msgObj && msgObj.roomId !== roomId) {
	    //   return;
	    // }
	    msgObj.content = self.filterEmoji(msgObj.content);
	    if (msgObj && msgObj.content) {
	      var tpl = _.template(this.getMessageTpl());
	      this.elements.msgList.append(tpl(msgObj));
	      this.elements.chatHistory.scrollTop(this.elements.msgList.height());
	      // if (msgObj.msgType == 0) {
	      try {
	        this.flashAPI.onReady(function () {
	          this.notifying(msgObj);
	        });
	      } catch (e) {
	        console.log(e);
	      }
	    }
	    self.autoDeleteMsgList();
	  },
	  filterEmoji: function (content) {
	    var reg = /[\u4e00-\u9fa5\w\s\d@\.\-,\+\?，。（）!#【】！~“：《》？<>]/g;
	    if (content) {
	      var result = content.match(reg) || [];
	      if (result.length > 0) {
	        return result.join('') || '';
	      }
	      return '';
	    }
	    return content;
	  },
	  // 动删除前面的,仅留下500条
	  autoDeleteMsgList: function () {
	    var total = this.elements.msgList.children().length;
	    var index = 0;
	    if (total > 500) {
	      index = total - 200;
	    }
	    this.elements.msgList.children(':lt(' + index + ')').remove();
	  },
	  // 转换时间格式
	  getDateStr: function (dateInt) {
	    var date = new Date(dateInt);
	    return DateTime.format(date, 'hh:mm:ss');
	  },
	  checkUserCanJoinRoom: function () {
	    var self = this;
	    YYTIMServer.getGroupInfo(this.roomInfo.imGroupid, function (res) {
	      if (res && ~~res.ErrorCode === 0 || res.GroupInfo.length > 0) {
	        self.currentGroupInfo = _.find(res.GroupInfo, function (item) {
	          return item.GroupId === self.roomInfo.imGroupid;
	        });
	        Backbone.trigger('event:IMGroupInfoReady', self.currentGroupInfo);
	      }
	    }, function () {});
	  },
	  checkUserStatus: function () {
	    if (UserInfo.isDisbaleTalk(user.get('userId'), self.roomInfo.id)) {
	      msgBox.showTip('您已经被禁言,不能发弹幕哦');
	      return false;
	    }
	
	    return false;
	  },
	  forbidUserSendMsgHandler: function (notifyInfo) {
	    var imIdentifier = imModel.get('data').imIdentifier || '';
	    if (notifyInfo.userId === imIdentifier) {
	      msgBox.showTip('您已被主播禁言10分钟!');
	      Backbone.trigger('event:currentUserDisableTalk', true);
	      var cur = new Date();
	      UserInfo.setDisableTalk(user.get('userId'), this.roomInfo.id, cur.getTime() + 10 * 60 * 1000);
	    }
	  }
	});
	
	module.exports = View;


/***/ },
/* 194 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 场控
	 */
	'use strict';
	
	var Backbone = window.Backbone;
	var _ = __webpack_require__(27);
	var base = __webpack_require__(28);
	var BaseView = base.View;
	
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var PermissionModel = __webpack_require__(61);
	
	// 清屏,锁屏
	// var RoomControlView = require('../anchor/room-control.view');
	
	var View = BaseView.extend({
	  el: '',
	  clientRender: false,
	  rawLoader: function () {
	    return '';
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.elements = {};
	    this.queryParams = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken()
	    };
	    this.permsssionModel = new PermissionModel();
	    this.userControlTpl = '<div class="controls_forbid_reject" style="display: block;"> ' +
	      '<a href="javascript:;" class="forbid">禁言</a> ' +
	      '<a href="javascript:;" class="reject">踢出</a></div>';
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	
	    this.elements.roomManagerWrap = $('#roomManagerWrap');
	    this.elements.sendMessageWrap = $('#sendMessageWrap');
	  },
	  ready: function (ops) {
	    //  初始化
	    this.defineEventInterface();
	    this.options = _.extend({}, ops);
	    // this.elements.roomManagerWrap.hide();
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:roomInfoReady', function (roomInfo) {
	      if (roomInfo) {
	        self.roomInfo = roomInfo;
	        self.checkPermission();
	      }
	    });
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  // 检查当前用户权限
	  checkPermission: function () {
	    var self = this;
	    var promise = this.permsssionModel.executeJSONP(_.extend({
	      roomId: this.roomInfo.id || 0
	    }, this.queryParams));
	
	    promise.done(function (res) {
	      if (res && res.code === '0') {
	        self.hasAccess(res.data);
	      }
	    });
	  },
	  hasAccess: function (data) {
	    var self = this;
	    _.each(data, function (item) {
	      if (item.roomId === self.roomInfo.id) {
	        self.render();
	      }
	    });
	  },
	  render: function () {
	    // this.elements.roomManagerWrap.show();
	    // this.elements.sendMessageWrap.hide();
	    // if (!this.roomCtrlView) {
	    //   this.roomCtrlView = new RoomControlView({
	    //     el: '#roomManagerWrap',
	    //     roomInfo: this.roomInfo,
	    //     FlashApi: this.options.FlashApi,
	    //     msgList: this.options.msgList,
	    //     hideCtrl: true // 隐藏场控管理
	    //   });
	    // }
	    window.location.href = '/assistant.html?roomId=' + this.roomInfo.id;
	  },
	  // 控制用户的禁言， 踢出
	  renderUserControl: function (msgList) {
	    var self = this;
	    if (msgList) {
	      $(msgList).on('click', function (e) {
	        self.userControlClick(e);
	      });
	    }
	  },
	  userControlClick: function () {}
	});
	
	module.exports = View;


/***/ },
/* 195 */
/***/ function(module, exports) {

	module.exports = "<div class=\"chatCon\" id=\"chatHistory\">\n    <!--聊天记录-->\n    <ul id=\"msgList\">\n\n    </ul>\n</div>\n"

/***/ },
/* 196 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	var base = __webpack_require__(28);
	var BaseView = base.View; // View的基类
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var msgBox = __webpack_require__(69);
	var Backbone = window.Backbone;
	var _ = __webpack_require__(27);
	
	
	var View = BaseView.extend({
	  el: '#sendMessageWrap', // 设置View对象作用于的根元素，比如id
	  rawLoader: function () { // 可用此方法返回字符串模版
	    return __webpack_require__(197);
	  },
	  events: { // 监听事件
	    'click #btnChooseColor': 'showColorPanel',
	    'click #colorList': 'chooseColor',
	    'click #btnSendMsg': 'sendMsgClick',
	    'keyup #txtMessage': 'textMsgChanged'
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    this.elements = {};
	    this.speekPeriod = 5 * 1000;
	    this.canSendNow = true;
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    var el = this.$el;
	
	    this.elements = {
	      btnChooseColor: el.find('#btnChooseColor'),
	      colorList: el.find('#colorList'),
	      chooseColorPanel: el.find('#chooseColorPanel'),
	      txtMessage: el.find('#txtMessage'),
	      limitTip: el.find('#limitTip')
	    };
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function (ops) {
	    this.options = _.extend({}, ops);
	    this.defineEventInterface();
	    this.setTextAreatColor();
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:roomInfoReady', function (data) {
	      if (data) {
	        self.roomInfo = data;
	      }
	    });
	    Backbone.on('event:visitorSendGift', function (data) {
	      var id = self.options.type === 'channel' ? self.roomInfo.channelId : self.roomInfo.id;
	      self.sendMessageToChat(_.extend({
	        nickName: user.get('userName'),
	        smallAvatar: user.get('bigheadImg'),
	        roomId: id
	      }, data));
	    });
	  },
	  showColorPanel: function () {
	    this.elements.btnChooseColor.toggleClass('actived');
	
	    this.elements.chooseColorPanel.toggle();
	  },
	  chooseColor: function (e) {
	    var target = $(e.target);
	    var color = target.data('color');
	    this.setTextAreatColor(color);
	    this.showColorPanel();
	  },
	  setTextAreatColor: function (color) {
	    this.elements.btnChooseColor.attr('data-color', color);
	    this.elements.txtMessage.css('color', color || '#999999');
	  },
	  sendMsgClick: function () {
	    var self = this;
	    var len = $.trim(this.elements.txtMessage.val()).length;
	    if (len < 1) {
	      return '';
	    }
	    if (len > 20) {
	      msgBox.showTip('发言文字已经超过20个字!');
	      return '';
	    }
	    if (!this.canSendNow) {
	      msgBox.showTip('请发言不要太频繁!');
	      return null;
	    }
	    this.canSendNow = false;
	    var msg = {
	      msgType: 0,
	      content: $.trim(this.elements.txtMessage.val()),
	      nickName: user.get('userName'),
	      style: {
	        fontColor: this.elements.btnChooseColor.attr('data-color') || '#999999'
	      },
	      smallAvatar: user.get('bigheadImg'),
	      roomId: this.roomInfo.id
	    };
	    // 处理频道发言
	    if (this.options.type === 'channel') {
	      msg.channelId = this.options.channelId;
	      msg.roomId = -1;
	    }
	    this.sendMessageToChat(msg);
	    this.elements.txtMessage.val('');
	    this.elements.limitTip.text(20);
	    setTimeout(function () {
	      self.canSendNow = true;
	    }, self.speekPeriod);
	    return null;
	  },
	  sendMessageToChat: function (msg) {
	    if (this.options.type !== 'channel') {
	      if (!this.roomInfo || this.roomInfo.status !== 2) {
	        msgBox.showTip('该直播不在直播中,无法进行互动');
	        this.elements.txtMessage.val('');
	        return;
	      }
	    }
	    Backbone.trigger('event:visitorSendMessage', msg);
	  },
	  textMsgChanged: function (e) {
	    if (e && e.keyCode === 13) {
	      this.sendMsgClick();
	      return false;
	    }
	    var len = $.trim(this.elements.txtMessage.val().length);
	    this.elements.limitTip.text(20 - len);
	    if (len >= 20) {
	      return false;
	    }
	    return true;
	  }
	});
	
	module.exports = View;


/***/ },
/* 197 */
/***/ function(module, exports) {

	module.exports = "<div id=\"chooseColorPanel\" class=\"choose-color Hidden\">\n    <div class=\"title\">选择颜色</div>\n    <div class=\"color-list\" id=\"colorList\">\n        <span data-color=\"#f9517d\" class=\"red boderRadAll_20\"></span>\n        <span data-color=\"#ead97a\" class=\"yellow boderRadAll_20\"></span>\n        <span data-color=\"#53e2c2\" class=\"green boderRadAll_20\"></span>\n        <span data-color=\"#569ef8\" class=\"blue boderRadAll_20\"></span>\n        <span data-color=\"#cf57cf\" class=\"purple boderRadAll_20\"></span>\n        <span data-color=\"#ffffff\" class=\"white boderRadAll_20\"></span>\n    </div>\n</div>\n<div class=\"msg-text\">\n    <textarea id=\"txtMessage\" class=\"pAll5 msg Left\" cols=\"30\" rows=\"5\" placeholder=\"请输入消息\"></textarea>\n    <button id=\"btnSendMsg\" class=\"send Left am-btn-purple\">发送</button>\n    <div class=\"Clear\"></div>\n</div>\n<div class=\"msg-footer mTop5\">\n    <!--<button>face</button>-->\n    <button id=\"btnChooseColor\" class=\"size Hand\"><i></i></button>\n    <div class=\"tip Right gary1 am-text-xs\">您还可以输入<span id=\"limitTip\" class=\"number\">20</span>字</div>\n    <div class=\"Clear\"></div>\n</div>\n"

/***/ },
/* 198 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var Backbone = window.Backbone;
	var _ = __webpack_require__(27);
	var base = __webpack_require__(28);
	var BaseView = base.View; // View的基类
	
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var uiConfirm = __webpack_require__(55);
	var GiftModel = __webpack_require__(60);
	var PopularityModel = __webpack_require__(174);
	var ChannelPopularityModel = __webpack_require__(199);
	
	
	var msgBox = __webpack_require__(69);
	var UserInfo = __webpack_require__(62);
	
	var View = BaseView.extend({
	  clientRender: false,
	  el: '#giftwarp', // 设置View对象作用于的根元素，比如id
	  events: { // 监听事件
	    'click #gift-items': 'giftClick',
	    'click .btn-push': 'topClick',
	    'click #btnLike': 'lickClick' // ,
	      // 'click #btnShare': 'shareClick'
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    this.giftTpl = $('#gift-item-tpl').html();
	
	    this.giftParams = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken(),
	      offset: 0,
	      size: 90000,
	      type: 0
	    };
	    this.queryParams = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken()
	    };
	
	    this.giftModel = GiftModel.sharedInstanceModel();
	    this.popularityModel = PopularityModel.sharedInstanceModel();
	    this.channelPopularityModel = ChannelPopularityModel.sharedInstanceModel();
	    this.popularityParams = _.extend({
	      type: 1,
	      roomId: 0
	    }, this.queryParams);
	
	    this.isNeedPopup = true;
	    this.elements = {};
	    this.sendGiftPeriod = 5 * 1000;
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    var el = this.$el;
	    this.elements = {
	      giftItems: el.find('#gift-items'),
	      txtLikeCount: el.find('#txtLikeCount')
	    };
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function (ops) {
	    this.options = _.extend({}, ops);
	    this.defineEventInterface();
	
	    this.initGiftList();
	
	    // $('#btnShare').on('click', this.shareClick.bind(this));
	    $('.btn-push').on('click', this.topClick.bind(this));
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:roomInfoReady', function (data) {
	      if (data) {
	        self.roomInfo = data;
	        self.elements.txtLikeCount.text(data.assemble || 0);
	        self.elements.txtLikeCount.text(data.likeCount || 0);
	      }
	    });
	
	    Backbone.on('event:currentUserInfoReady', function (userInfo) {
	      if (userInfo) {
	        self.currentUserInfo = userInfo;
	      }
	    });
	    Backbone.on('event:updateRoomInfo', function (data) {
	      if (data) {
	        self.elements.txtLikeCount.text(data.likeCount || 0);
	      }
	    });
	    Backbone.on('event:liveShowEnded', function (data) {
	      if (data) {
	        self.roomInfo.status = data.roomStatus;
	      }
	    });
	  },
	  initCarousel: function () {
	    var warp = $('#giftwarp');
	    var jcarousel = warp.find('.jcarousel');
	    var carousel;
	    var width;
	
	    jcarousel
	      .on('jcarousel:reload jcarousel:create', function () {
	        carousel = $(this);
	        width = carousel.innerWidth();
	        width = width / 5;
	        carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
	      })
	      .jcarousel({
	        wrap: 'circular'
	      });
	
	    warp.find('.jcarousel-control-prev')
	      .jcarouselControl({
	        target: '-=1'
	      });
	
	    warp.find('.jcarousel-control-next')
	      .jcarouselControl({
	        target: '+=1'
	      });
	  },
	  initGiftList: function () {
	    var self = this;
	
	    this.giftModel.get(this.giftParams, function (res) {
	      if (res && res.code === '0') {
	        if (self.giftTpl) {
	          var template = _.template(self.giftTpl);
	          self.elements.giftItems.html(template(res || []));
	          self.initCarousel();
	        }
	      }
	    }, function (err) {
	      console.log(err);
	    });
	  },
	  roomStatusCheck: function () {
	    if (this.options.type === 'channel') {
	      // 如果是频道，直接通过
	      return true;
	    }
	    if (!this.roomInfo || this.roomInfo.status !== 2) {
	      msgBox.showTip('该直播不在直播中,无法进行互动');
	      return false;
	    }
	    return true;
	  },
	  giftClick: function (e) {
	    var target = e.target;
	    if (!this.roomStatusCheck()) {
	      return;
	    }
	
	    if (e.target.nodeName !== 'LI') {
	      target = $(e.target).parent();
	    } else {
	      target = $(e.target);
	    }
	    this.sendGift({
	      name: target.data('name'),
	      giftId: target.data('giftid')
	    });
	  },
	
	  sendGift: function (data) {
	    var self = this;
	    if (this.options.type !== 'channel') {
	      if (UserInfo.isDisbaleTalk(user.get('userId'), this.roomInfo.id)) {
	        msgBox.showTip('您已经被主播禁言10分钟');
	        return null;
	      }
	      if (UserInfo.isLockScreen(this.roomInfo.id)) {
	        msgBox.showTip('主播锁屏中');
	        return null;
	      }
	    }
	    if (this.notSend) {
	      return null;
	    }
	    this.notSend = true;
	
	    Backbone.trigger('event:visitorSendGift', {
	      msgType: 1,
	      giftId: data.giftId,
	      giftNum: 1
	    });
	
	    setTimeout(function () {
	      self.notSend = false;
	    }, self.sendGiftPeriod);
	    return null;
	  },
	  topClick: function () {
	    var self = this;
	    if (!this.isNeedPopup) {
	      // self.pushPopularity(2);
	      self.beforePushPopularity(2);
	      return;
	    }
	    var content = '<div>使用 <span class="green">20</span>积分支持一下MC,当前共有<span class="green">' +
	      (this.currentUserInfo.totalMarks || 0) + '</span>积分</div></br>' +
	      '<div style="text-align:right; color:#999;"> <label>' +
	      '<input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
	    uiConfirm.show({
	      title: '顶一下',
	      content: content,
	      okFn: function () {
	        // self.pushPopularity(2);
	        self.beforePushPopularity(2);
	        var check = $('#popupCheckBox');
	        if (check.is(':checked')) {
	          self.isNeedPopup = false;
	        } else {
	          self.isNeedPopup = true;
	        }
	      }
	    });
	  },
	  beforePushPopularity: function (type) {
	    var channelType = 2;
	    if (this.options.type === 'channel') {
	      channelType = type === 2 ? 3 : 2;
	      this.pushChannelPopularity(channelType);
	    } else {
	      this.pushPopularity(type);
	    }
	  },
	  pushChannelPopularity: function (type) {
	    var self = this;
	    var promise = this.channelPopularityModel.executeJSONP(_.extend({
	      type: type,
	      channelId: this.roomInfo.channelId
	    }, this.queryParams));
	    promise.done(function (res) {
	      if (~~res.code === 0 && type === 2) {
	        Backbone.trigger('event:pleaseUpdateRoomInfo');
	        self.getUserInfo();
	      } else if (~~res.code === 0 && type === 3) {
	        msgBox.showOK('非常感谢您的大力支持');
	        Backbone.trigger('event:pleaseUpdateRoomInfo');
	        self.getUserInfo();
	      } else {
	        msgBox.showTip(res.data.message || res.msg || '操作失败请您稍后重试');
	      }
	    });
	  },
	  pushPopularity: function (type) {
	    var self = this;
	    var promise;
	    // if (!this.roomStatusCheck()) {
	    //  return;
	    // }
	    this.popularityParams.type = type;
	    this.popularityParams.roomId = this.roomInfo.id;
	    promise = this.popularityModel.executeJSONP(this.popularityParams);
	    promise.done(function (res) {
	      if (res && res.data && res.msg === 'SUCCESS' && type === 1) {
	        Backbone.trigger('event:pleaseUpdateRoomInfo');
	        self.getUserInfo();
	      } else if (res && res.data.success && type === 2) {
	        msgBox.showOK('非常感谢您的大力支持');
	        Backbone.trigger('event:pleaseUpdateRoomInfo');
	        self.getUserInfo();
	      } else {
	        msgBox.showTip(res.data.message || res.msg || '操作失败请您稍后重试');
	      }
	    });
	    promise.fail(function () {
	      msgBox.showTip('操作失败请您稍后重试');
	    });
	  },
	  getUserInfo: function () {
	    UserInfo.getInfo(function (userInfo) {
	      Backbone.trigger('event:currentUserInfoReady', userInfo);
	    });
	  },
	
	  lickClick: function () {
	    var self = this;
	    if (!this.roomStatusCheck()) {
	      return;
	    }
	    if (this.isClicked) {
	      return;
	    }
	    this.isClicked = true;
	    // 互动
	    Backbone.trigger('event:visitorInteractive', {
	      nickName: user.get('userName'),
	      smallAvatar: user.get('bigheadImg'),
	      roomId: self.roomInfo.id || '',
	      msgType: 3
	    });
	    // self.pushPopularity(1);
	    self.beforePushPopularity(1);
	    setTimeout(function () {
	      self.isClicked = false;
	    }, 5000);
	  },
	  shareClick: function () {
	    if (!this.roomInfo) {
	      return;
	    }
	    var title = encodeURIComponent(this.roomInfo.roomName + ',快来围观吧');
	    var url = 'http://' + window.location.host;
	    var img = this.roomInfo.posterPic;
	    var goUrl;
	
	    if (this.roomInfo.status === 2) {
	      url = encodeURIComponent(url + '/liveRoom.html?roomId=' + this.roomInfo.id);
	    } else {
	      url = encodeURIComponent(url + '/playback.html?roomId=' + this.roomInfo.id);
	    }
	    var html = '<span class="share-wrap">' +
	      '<a href="http://i.yinyuetai.com/share?title=' + title + '&amp;url=' + url + '&amp;cover=' + img + '?t=20160405161857" title="分享到音悦台我的家" class="myhome J_sharelink"></a> ' +
	
	      '<a href="http://v.t.sina.com.cn/share/share.php?appkey=2817290261&amp;url=' + url + '&amp;title=' + title + '&amp;content=gb2312&amp;pic=' + img + '?t=20160405161857&amp;ralateUid=1698229264" title="分享到新浪微博" class="weibo17 J_sharelink"></a>' +
	
	      '<a href="http://connect.qq.com/widget/shareqq/index.html?url=' + url + '&amp;showcount=1&amp;desc=' + title + '&amp;title=' + title + '&amp;site=饭趴&amp;pics=' + img + '?t=20160405161857&amp;style=201&amp;width=39&amp;height=39" title="分享到QQ" class="qq17 J_sharelink"></a>' +
	
	      '<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + url + '&amp;desc=' + title + '" title="分享到QQ空间" class="qzone17 J_sharelink"></a>' +
	
	      '<a href="http://v.yinyuetai.com/share/weixin?title=' + title + '&amp;url=' + url + '" title="分享到微信"  class="weixin17 J_sharelink"></a>' +
	
	      '<a href="http://widget.renren.com/dialog/share?resourceUrl=' + url + '?t=20160405161857&amp;charset=UTF-8&amp;message=' + title + '" title="分享到人人网" class="renren17 J_sharelink"></a>' +
	
	      '<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&amp;url=' + url + '&amp;desc=' + title + '" title="分享到腾讯朋友" class="pengyou17 J_sharelink"></a>' +
	
	      '<a href="http://v.t.qq.com/share/share.php?title=' + title + '&amp;url=' + url + '&amp;pic=' + img + '?t=20160405161857" title="分享到腾讯微博" data-video-id="2539803" class="tencent17 J_sharelink"></a>' +
	
	      '<a href="http://huaban.com/bookmarklet?url=' + url + '&amp;video=&amp;title=' + title + '&amp;media=' + img + '?t=20160405161857&amp;description=' + title + '" title="分享到花瓣网" class="huaban17 J_sharelink"></a>' +
	
	      '<a href="http://t.sohu.com/third/post.jsp?&amp;url=' + url + '&amp;title=' + title + '&amp;content=utf-8" title="分享到搜狐微博" class="sohu17 J_sharelink"></a>' +
	
	      '<a href="http://fql.cc/yytafx?appkey=2817290261&amp;url=' + url + '&amp;title=' + title + '" title="分享到联通飞影" class="unicon17 J_sharelink"></a> ' +
	      '</span>';
	    uiConfirm.show({
	      title: '分享',
	      content: html,
	      okBtn: false,
	      cancelBtn: false,
	      okFn: function () {
	
	      }
	    });
	    $('.share-wrap a').on('click', function () {
	      goUrl = $(this).attr('href');
	      window.open(goUrl, 'newwindow', 'height=750px,width=700px' +
	        ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
	      uiConfirm.close();
	      return false;
	    });
	  }
	});
	
	module.exports = View;


/***/ },
/* 199 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 增加人气
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/channel/popularity_add.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 200 */,
/* 201 */,
/* 202 */,
/* 203 */,
/* 204 */,
/* 205 */,
/* 206 */,
/* 207 */,
/* 208 */,
/* 209 */,
/* 210 */,
/* 211 */,
/* 212 */,
/* 213 */,
/* 214 */,
/* 215 */,
/* 216 */,
/* 217 */,
/* 218 */,
/* 219 */,
/* 220 */,
/* 221 */,
/* 222 */,
/* 223 */,
/* 224 */,
/* 225 */,
/* 226 */,
/* 227 */,
/* 228 */,
/* 229 */,
/* 230 */,
/* 231 */,
/* 232 */,
/* 233 */,
/* 234 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info 用户直播间
	 */
	
	'use strict';
	var Backbone = window.Backbone;
	var base = __webpack_require__(28);
	var BaseView = base.View; // View的基类
	var _ = __webpack_require__(27);
	var Auxiliary = __webpack_require__(41);
	var URL = Auxiliary.url;
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var RoomDetailModel = __webpack_require__(58);
	var RoomLongPollingModel = __webpack_require__(59);
	var IMModel = __webpack_require__(43);
	var imModel = IMModel.sharedInstanceIMModel();
	var YYTIMServer = __webpack_require__(42);
	var AnchorUserInfoModel = __webpack_require__(63);
	var UserInfo = __webpack_require__(62);
	var InAndOurRoomModel = __webpack_require__(183);
	var HistoryAddModel = __webpack_require__(247);
	
	var FlashAPI = __webpack_require__(82);
	var store = base.storage;
	var uiConfirm = __webpack_require__(55);
	var msgBox = __webpack_require__(69);
	
	var AdvertisingWallView = __webpack_require__(64);
	var LivePreviewView = __webpack_require__(235);
	
	var View = BaseView.extend({
	  clientRender: false,
	  el: '#anchorContainerBg', // 设置View对象作用于的根元素，比如id
	  events: { // 监听事件
	    'click #channelTab': 'asideChanged'
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    var url = URL.parse(location.href);
	    if (!url.query.roomId && !url.query.channelId) {
	      window.history.go(-1);
	    }
	    this.roomId = url.query.roomId || 1;
	
	    this.roomInfoPeriod = 5 * 1000;
	
	    this.roomDetail = RoomDetailModel.sharedInstanceModel();
	
	    this.anchorInfoModel = AnchorUserInfoModel.sharedInstanceModel();
	    this.inAndOutRoom = InAndOurRoomModel.sharedInstanceModel();
	    this.historyAdd = HistoryAddModel.sharedInstanceModel();
	
	    this.queryParams = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken()
	    };
	
	    this.roomDetailParams = _.extend({
	      roomId: ''
	    }, this.queryParams);
	
	    this.roomLongPolling = RoomLongPollingModel.sharedInstanceModel();
	
	    this.anchorInfoParams = _.extend({}, this.queryParams);
	    this.inAndRoomParams = _.extend({}, this.queryParams);
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    this.roomBg = $('#anchorContainerBg');
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function () {
	    // 直播页面
	    if (!user.isLogined()) {
	      store.remove('imSig');
	      store.set('signout', 1);
	      msgBox.showTip('请登录后观看直播!');
	      window.location.href = '/login.html';
	    }
	    this.defineEventInterface();
	
	    this.flashAPI = FlashAPI.sharedInstanceFlashApi({
	      el: 'broadCastFlash'
	    });
	    // this.initRoom();
	    this.renderPage();
	    this.getUserInfo();
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:UserKickOut', function (notifyInfo) {
	      self.checkUserIsKickout(notifyInfo);
	    });
	
	    Backbone.on('event:pleaseUpdateRoomInfo', function () {
	      self.roomDetailParams.roomId = self.roomId;
	      self.getRoomLoopInfo(function (res) {
	        var data = res.data;
	        Backbone.trigger('event:updateRoomInfo', data);
	      });
	    });
	    Backbone.on('event:IMGroupInfoReady', function (info) {
	      if (info) {
	        self.currentGroupInfo = info || {};
	        self.checkUserIsKickout(self.currentGroupInfo.Notification);
	        self.checkUserIsDisabled(self.currentGroupInfo.Introduction);
	      }
	    });
	  },
	  fetchUserIMSig: function (groupId) {
	    var self = this;
	    var defer = imModel.fetchIMUserSig();
	
	    defer.then(function (sig) {
	      if (sig.roleType === 2) {
	        uiConfirm.show({
	          title: '请登录',
	          content: '您现在是游客模式,请先登录参与互动!',
	          cancelBtn: false,
	          cancelFn: function () {
	            window.location.href = '/web/login.html';
	          },
	          okFn: function () {
	            window.location.href = '/web/login.html';
	          }
	        });
	      } else {
	        self.userJoinGroup(sig, groupId);
	      }
	    });
	  },
	  userJoinGroup: function (sig, groupId) {
	    var self = this;
	    self.userIMSig = sig;
	    self.initWebIM();
	
	    YYTIMServer.applyJoinGroup(groupId, function () {
	      // TODO
	      if (self.roomInfo.status === 2) {
	        self.loopRoomInfo();
	      }
	    }, function (res) {
	      self.imErrorHandler(res);
	    });
	  },
	  /**
	   * webim 错误处理
	   * @constructor
	   */
	  imErrorHandler: function (res) {
	    var self = this;
	    var callback = function () {
	      imModel.remove();
	      self.goBack();
	    };
	    if (res.ErrorCode === 10013) {
	      Backbone.trigger('event:roomInfoReady', self.roomInfo);
	      if (self.roomInfo.status === 2) {
	        self.loopRoomInfo();
	      }
	    } else if (res.ErrorCode === 70001) {
	      uiConfirm.show({
	        title: '登陆已过期',
	        content: '您的登陆信息已经过期,请重新登陆!',
	        cancelBtn: false,
	        okFn: callback
	      });
	    } else if (res.ErrorCode === 10010) {
	      uiConfirm.show({
	        title: '进入房间失败',
	        content: '该房间已经关闭,无法观看直播',
	        cancelFn: self.goBack,
	        okFn: self.goBack
	      });
	    } else {
	      uiConfirm.show({
	        title: '进入房间',
	        content: '进入房间失败,请稍后重试',
	        cancelFn: self.goBack,
	        okFn: self.goBack
	      });
	    }
	  },
	  renderPage: function () {
	    var RoomTitle = __webpack_require__(191);
	    var ChatView = __webpack_require__(193);
	    var SendMessageView = __webpack_require__(196);
	    var AnchorCardView = __webpack_require__(186);
	    var PlayedListView = __webpack_require__(236);
	    var GiftView = __webpack_require__(198);
	
	
	    var a = new RoomTitle();
	
	    a = new ChatView();
	
	    a = new SendMessageView();
	
	    a = new AnchorCardView();
	
	    a = new PlayedListView();
	
	    a = new GiftView();
	
	    a = new LivePreviewView();
	    console.log(a);
	  },
	  initWebIM: function () {
	    function callback(notifyInfo) {
	      Backbone.trigger('event:groupSystemNotifys', notifyInfo);
	    }
	
	    // 注册IM事件处理
	    YYTIMServer.init({
	      onConnNotify: function (notifyInfo) {
	        Backbone.trigger('event:onConnNotify', notifyInfo);
	      },
	      onMsgNotify: function (notifyInfo) {
	        Backbone.trigger('event:onMsgNotify', notifyInfo);
	      },
	      onGroupInfoChangeNotify: function (notifyInfo) {
	        Backbone.trigger('event:onGroupInfoChangeNotify', notifyInfo);
	      },
	      groupSystemNotifys: {
	        1: callback, // 申请加群请求（只有管理员会收到）
	        2: callback, // 申请加群被同意（只有申请人能够收到）
	        3: callback, // 申请加群被拒绝（只有申请人能够收到）
	        4: callback, // 被管理员踢出群(只有被踢者接收到)
	        5: callback, // 群被解散(全员接收)
	        6: callback, // 创建群(创建者接收)
	        7: callback, // 邀请加群(被邀请者接收)
	        8: callback, // 主动退群(主动退出者接收)
	        9: callback, // 设置管理员(被设置者接收)
	        10: callback, // 取消管理员(被取消者接收)
	        11: callback, // 群已被回收(全员接收)
	        255: callback // 用户自定义通知(默认全员接收,暂不支持)
	      }
	    });
	  },
	  initRoom: function () {
	    var self = this;
	    this.errFn = function () {
	      uiConfirm.show({
	        title: '提示',
	        content: '获取房间数据失败!',
	        okFn: function () {
	          self.goBack();
	        },
	        cancelFn: function () {
	          self.goBack();
	        }
	      });
	    };
	    // 获取房间数据
	    this.getRoomInfo(function (response) {
	      self.handelRoomInfo(response);
	    }, this.errFn);
	  },
	  // 处理房间信息
	  handelRoomInfo: function (response) {
	    var self = this;
	    var data = response.data || {};
	    if (response && response.code === '0') {
	      self.videoUrl = {
	        streamName: data.streamName,
	        url: data.url
	      };
	      self.roomInfo = data;
	      // 告白墙
	      self.adWallView = new AdvertisingWallView({
	        el: '#advertisingWall',
	        roomId: data.id,
	        userInfo: self.userInfo,
	        type: 1 // 直播
	      });
	      Backbone.trigger('event:roomInfoReady', self.roomInfo);
	      self.setRoomBgImg();
	      self.flashAPI.onReady(function () {
	        this.init(_.extend({
	          isLive: true
	        }, self.roomInfo));
	      });
	      self.checkRoomStatus(data.status);
	    } else {
	      self.errFn();
	    }
	  },
	  getGroupInfo: function (imGroupId) {
	    var self = this;
	    YYTIMServer.getGroupInfo(imGroupId, function (res) {
	      if (res && ~~res.ErrorCode === 0) {
	        self.currentGroupInfo = _.find(res.GroupInfo, function (item) {
	          return item.GroupId === self.roomInfo.imGroupid;
	        });
	
	        Backbone.trigger('event:IMGroupInfoReady', self.currentGroupInfo);
	        self.checkUserIsKickout(self.currentGroupInfo.Notification);
	        self.checkUserIsDisabled(self.currentGroupInfo.Introduction);
	      }
	    }, function () {
	      // TODO
	      // uiConfirm.show({
	      //   title: '进入失败',
	      //   content: '加入房间失败,请重新登陆后进入',
	      //   cancelBtn: false,
	      //   okFn: function () {
	      //     self.goBack('/');
	      //   },
	      //   cancelFn: function () {
	      //     self.goBack('/');
	      //   }
	      // });
	    });
	  },
	  getUserInfo: function () {
	    var self = this;
	    UserInfo.getInfo(function (userInfo) {
	      self.userInfo = userInfo;
	      Backbone.trigger('event:currentUserInfoReady', userInfo);
	      self.initRoom();
	    });
	  },
	  // 获取直播房间信息
	  getRoomInfo: function (okFn, errFn) {
	    var self = this;
	    var promise;
	    self.roomDetailParams.roomId = self.roomId;
	    promise = this.roomDetail.executeJSONP(self.roomDetailParams);
	    promise.done(function (response) {
	      if (okFn) {
	        okFn(response);
	      }
	    });
	    promise.fail(function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    });
	  },
	  checkRoomStatus: function (status) {
	    switch (status) {
	      case 0:
	        msgBox.showTip('该直播尚未发布!');
	        break;
	      case 1:
	        $('.living-block').hide();
	        break;
	      case 2:
	        this.joinRoom();
	        this.fetchUserIMSig(this.roomInfo.imGroupid);
	        break;
	      case 3:
	        break;
	      default:
	        break;
	    }
	  },
	  parseNotifyInfo: function (notifyInfo) {
	    var notify = null;
	    try {
	      if (_.isString(notifyInfo)) {
	        notify = JSON.parse(notifyInfo);
	      } else {
	        notify = notifyInfo;
	      }
	    } catch (e) {
	      return null;
	    }
	    return notify;
	  },
	  checkUserIsKickout: function (notifyInfo) {
	    var self = this;
	    var notify = self.parseNotifyInfo(notifyInfo);
	    var msg = '您已经被主播踢出房间,肿么又回来了';
	    if (notify && notifyInfo.isEvent) {
	      msg = '您已经被主播踢出房间!';
	    }
	    if (notify) {
	      var result = _.find(notify.forbidUsers, function (item) {
	        return ~~item.replace('$0', '') === self.userIMSig.userId;
	      });
	      if (result) {
	        UserInfo.setKickout(self.roomId, true);
	
	        uiConfirm.show({
	          title: '禁止进入',
	          content: msg,
	          cancelBtn: false,
	          okFn: function () {
	            self.goBack();
	          },
	          cancelFn: function () {
	            self.goBack();
	          }
	        });
	      }
	    }
	  },
	  /**
	   * 检查用户是否已经被禁言
	   */
	  checkUserIsDisabled: function (notifyInfo) {
	    var self = this;
	    var notify = self.parseNotifyInfo(notifyInfo);
	    if (notify) {
	      UserInfo.setLockScreen(this.roomInfo.id, notify.blockState);
	    }
	  },
	  goBack: function (url) {
	    if (url) {
	      window.location.href = url;
	    } else {
	      // window.history.go(-1);
	      window.location.href = '/';
	    }
	  },
	  loopRoomInfo: function (time) {
	    var self = this;
	
	    self.roomInfoTimeId = setTimeout(function () {
	      self.roomDetailParams.roomId = self.roomId;
	      self.getRoomLoopInfo(function (res) {
	        var data = res.data;
	        Backbone.trigger('event:updateRoomInfo', data);
	        if (data.roomStatus === 3) {
	          Backbone.trigger('event:liveShowEnded', data);
	        } else if (data.roomStatus === 2) {
	          self.loopRoomInfo();
	        }
	      });
	    }, !!time ? time : self.roomInfoPeriod);
	  },
	  getRoomLoopInfo: function (okFn, errFn) {
	    var self = this;
	    var promise;
	    self.roomDetailParams.roomId = self.roomId;
	    promise = this.roomLongPolling.executeJSONP(self.roomDetailParams);
	    promise.done(function (response) {
	      if (okFn) {
	        okFn(response);
	      }
	    });
	    promise.fail(function (err) {
	      if (errFn) {
	        errFn(err);
	      }
	    });
	  },
	  // 告诉服务器加入该房间
	  joinRoom: function () {
	    var promise;
	    this.inAndRoomParams.type = 1;
	
	    if (this.roomInfo) {
	      this.inAndRoomParams.roomId = this.roomInfo.id;
	    }
	    // 告诉服务器加入了IM房间
	    promise = this.inAndOutRoom.executeJSONP(this.inAndRoomParams);
	    promise.done(function () {});
	    // 加入历史记录
	    this.historyAdd.addToHistory(_.extend({
	      roomIds: this.roomInfo.id
	    }, this.queryParams));
	  },
	  setRoomBgImg: function () {
	    if (this.roomInfo && this.roomInfo.imageUrl) {
	      this.roomBg.find('.header-bg').css('background', 'url(' + this.roomInfo.imageUrl + ')');
	    }
	  },
	  // 右侧边栏切换
	  asideChanged: function (e) {
	    var target = $(e.target);
	    var id = target.attr('data-id');
	    target.parent().children().removeClass('active');
	    target.addClass('active');
	    $('.tab-content').hide();
	    $('#' + id).show();
	  }
	});
	
	module.exports = View;


/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 预告
	 */
	'use strict';
	
	var Backbone = window.Backbone;
	var base = __webpack_require__(28);
	var BaseView = base.View;
	
	var BusinessDate = __webpack_require__(70);
	
	var View = BaseView.extend({
	  el: '.channel-live-pre-wrap',
	  rawLoader: function () {
	    return '';
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.elements = {};
	    this.startTime = new Date('2016-06-13 13:14:33');
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.elements.day = this.$el.find('#day');
	    this.elements.hour = this.$el.find('#hour');
	    this.elements.minutes = this.$el.find('#minutes');
	  },
	  ready: function () {
	    //  初始化
	    this.hideDom();
	    this.defineEventInterface();
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:roomInfoReady', function (roomInfo) {
	      if (roomInfo.status === 1) {
	        self.$el.show();
	        self.startTime = roomInfo.liveTime || new Date('2016-06-13 13:14:33');
	        self.setTime();
	      } else {
	        self.$el.hide();
	      }
	    });
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  hideDom: function () {
	    $('#btnShare').hide();
	  },
	  setTime: function () {
	    var self = this;
	    var cur = new Date();
	    var diff = new Date(this.startTime) - cur;
	    if (diff > 0) {
	      var result = BusinessDate.difference(diff);
	      if (result) {
	        this.elements.day.text(result.day);
	        this.elements.hour.text(result.hours);
	        this.elements.minutes.text(result.minutes);
	        setTimeout(function () {
	          self.setTime();
	        }, 60 * 1000);
	      }
	    } else if (diff === 0) {
	      window.location.reload();
	    }
	  }
	});
	
	module.exports = View;


/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var base = __webpack_require__(28);
	var BaseView = base.View; // View的基类
	var PlayedListModel = __webpack_require__(237);
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var Backbone = window.Backbone;
	
	var View = BaseView.extend({
	  clientRender: false,
	  el: '#anchorPlayedList', // 设置View对象作用于的根元素，比如id
	  events: { // 监听事件
	
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    this.defineEventInterface();
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    var el = this.$el;
	    this.anchorPlayedTpl = $('#anchorPlayedTpl').html();
	
	    this.playedList = el.find('#playedListWrap');
	
	    this.playedListModel = PlayedListModel.sharedInstanceModel();
	
	    this.playedListParams = {
	      deviceinfo: '{"aid":"30001001"}',
	      access_token: user.getWebToken(),
	      anchor: '',
	      order: 'time',
	      offset: 0,
	      size: 9
	    };
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function () {
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:roomInfoReady', function (data) {
	      if (data) {
	        self.roomInfo = data;
	        self.bindData(data.creator.uid);
	      }
	    });
	  },
	  initCarousel: function () {
	    var warp = $('#palyedJcarousel');
	    var jcarousel = warp.find('.jcarousel');
	    var carousel;
	    var width;
	
	    jcarousel
	      .on('jcarousel:reload jcarousel:create', function () {
	        carousel = $(this);
	        width = carousel.innerWidth();
	        width = width / 4;
	
	        carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
	      })
	      .jcarousel({
	        wrap: 'circular'
	      });
	
	    warp.find('.jcarousel-control-prev')
	        .jcarouselControl({
	          target: '-=1'
	        });
	
	    warp.find('.jcarousel-control-next')
	        .jcarouselControl({
	          target: '+=1'
	        });
	  },
	  bindData: function (anchorId) {
	    var self = this;
	    var template;
	    var promise;
	    this.playedListParams.anchor = anchorId;
	
	    promise = this.playedListModel.executeJSONP(this.playedListParams);
	    promise.done(function (res) {
	      if (res && res.msg === 'SUCCESS' && res.data.totalCount > 0) {
	        template = self.compileHTML(self.anchorPlayedTpl, res);
	        self.playedList.html(template);
	        self.initCarousel();
	      } else {
	        self.hideListWrap();
	      }
	    });
	    promise.fail(function () {
	      self.hideListWrap();
	    });
	  },
	  hideListWrap: function () {
	    this.$el.hide();
	  }
	});
	
	module.exports = View;


/***/ },
/* 237 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/anchor_end_list.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ },
/* 238 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 239 */,
/* 240 */,
/* 241 */,
/* 242 */,
/* 243 */,
/* 244 */,
/* 245 */,
/* 246 */,
/* 247 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 添加观看记录
	 */
	'use strict';
	
	var $ = __webpack_require__(1);
	var _ = __webpack_require__(27);
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/history/room/upload.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  },
	  addToHistory: function (args) {
	    var ops = _.extend({}, args);
	    var defer = $.Deferred();
	    var prom = this.executeJSONP(ops);
	    prom.done(function (res) {
	      defer.resolve(res);
	    });
	    prom.fail(function () {
	      defer.reject();
	    });
	    return defer.promise();
	  }
	});
	
	var shared = null;
	Model.sharedInstanceModel = function sharedInstanceModel() {
	  if (!shared) {
	    shared = new Model();
	  }
	  return shared;
	};
	
	module.exports = Model;


/***/ }
]);
//# sourceMappingURL=liveroom.js.map