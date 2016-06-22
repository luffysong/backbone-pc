webpackJsonp([2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	$(function () {
	  var MainView = __webpack_require__(99);
	  var mainView = new MainView();
	  console.log(mainView);
	  // require('../stylesheets/anchor-setting.scss');
	  __webpack_require__(139);
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
/* 17 */
/***/ function(module, exports) {

	module.exports = window.Backbone;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var BaseView = __webpack_require__(19);
	var BaseModel = __webpack_require__(26);
	var BaseRouter = __webpack_require__(28);
	var ManagedObject = __webpack_require__(29);
	var storage = __webpack_require__(27);
	module.exports = {
	    'View':BaseView,
	    'Model':BaseModel,
	    'Router':BaseRouter,
	    'ManagedObject':ManagedObject,
	    'storage':storage
	};


/***/ },
/* 19 */
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
	
	var Backbone = __webpack_require__(17);
	var tplEng = __webpack_require__(20);
	var warn = __webpack_require__(21);
	var Tools = __webpack_require__(24);
	var error = __webpack_require__(25);
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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!art-template - Template Engine | http://aui.github.com/artTemplate/*/
	!function(){function a(a){return a.replace(t,"").replace(u,",").replace(v,"").replace(w,"").replace(x,"").split(/^$|,+/)}function b(a){return"'"+a.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}function c(c,d){function e(a){return m+=a.split(/\n/).length-1,k&&(a=a.replace(/\s+/g," ").replace(/<!--.*?-->/g,"")),a&&(a=s[1]+b(a)+s[2]+"\n"),a}function f(b){var c=m;if(j?b=j(b,d):g&&(b=b.replace(/\n/g,function(){return m++,"$line="+m+";"})),0===b.indexOf("=")){var e=l&&!/^=[=#]/.test(b);if(b=b.replace(/^=[=#]?|[\s;]*$/g,""),e){var f=b.replace(/\s*\([^\)]+\)/,"");n[f]||/^(include|print)$/.test(f)||(b="$escape("+b+")")}else b="$string("+b+")";b=s[1]+b+s[2]}return g&&(b="$line="+c+";"+b),r(a(b),function(a){if(a&&!p[a]){var b;b="print"===a?u:"include"===a?v:n[a]?"$utils."+a:o[a]?"$helpers."+a:"$data."+a,w+=a+"="+b+",",p[a]=!0}}),b+"\n"}var g=d.debug,h=d.openTag,i=d.closeTag,j=d.parser,k=d.compress,l=d.escape,m=1,p={$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1},q="".trim,s=q?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"],t=q?"$out+=text;return $out;":"$out.push(text);",u="function(){var text=''.concat.apply('',arguments);"+t+"}",v="function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);"+t+"}",w="'use strict';var $utils=this,$helpers=$utils.$helpers,"+(g?"$line=0,":""),x=s[0],y="return new String("+s[3]+");";r(c.split(h),function(a){a=a.split(i);var b=a[0],c=a[1];1===a.length?x+=e(b):(x+=f(b),c&&(x+=e(c)))});var z=w+x+y;g&&(z="try{"+z+"}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:"+b(c)+".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");try{var A=new Function("$data","$filename",z);return A.prototype=n,A}catch(B){throw B.temp="function anonymous($data,$filename) {"+z+"}",B}}var d=function(a,b){return"string"==typeof b?q(b,{filename:a}):g(a,b)};d.version="3.0.0",d.config=function(a,b){e[a]=b};var e=d.defaults={openTag:"<%",closeTag:"%>",escape:!0,cache:!0,compress:!1,parser:null},f=d.cache={};d.render=function(a,b){return q(a,b)};var g=d.renderFile=function(a,b){var c=d.get(a)||p({filename:a,name:"Render Error",message:"Template not found"});return b?c(b):c};d.get=function(a){var b;if(f[a])b=f[a];else if("object"==typeof document){var c=document.getElementById(a);if(c){var d=(c.value||c.innerHTML).replace(/^\s*|\s*$/g,"");b=q(d,{filename:a})}}return b};var h=function(a,b){return"string"!=typeof a&&(b=typeof a,"number"===b?a+="":a="function"===b?h(a.call(a)):""),a},i={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"},j=function(a){return i[a]},k=function(a){return h(a).replace(/&(?![\w#]+;)|[<>"']/g,j)},l=Array.isArray||function(a){return"[object Array]"==={}.toString.call(a)},m=function(a,b){var c,d;if(l(a))for(c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);else for(c in a)b.call(a,a[c],c)},n=d.utils={$helpers:{},$include:g,$string:h,$escape:k,$each:m};d.helper=function(a,b){o[a]=b};var o=d.helpers=n.$helpers;d.onerror=function(a){var b="Template Error\n\n";for(var c in a)b+="<"+c+">\n"+a[c]+"\n\n";"object"==typeof console&&console.error(b)};var p=function(a){return d.onerror(a),function(){return"{Template Error}"}},q=d.compile=function(a,b){function d(c){try{return new i(c,h)+""}catch(d){return b.debug?p(d)():(b.debug=!0,q(a,b)(c))}}b=b||{};for(var g in e)void 0===b[g]&&(b[g]=e[g]);var h=b.filename;try{var i=c(a,b)}catch(j){return j.filename=h||"anonymous",j.name="Syntax Error",p(j)}return d.prototype=i.prototype,d.toString=function(){return i.toString()},h&&b.cache&&(f[h]=d),d},r=n.$each,s="break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined",t=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,u=/[^\w$]+/g,v=new RegExp(["\\b"+s.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g"),w=/^\d[^,]*|,\d[^,]*/g,x=/^,+|,+$/g;e.openTag="{{",e.closeTag="}}";var y=function(a,b){var c=b.split(":"),d=c.shift(),e=c.join(":")||"";return e&&(e=", "+e),"$helpers."+d+"("+a+e+")"};e.parser=function(a,b){a=a.replace(/^\s/,"");var c=a.split(" "),e=c.shift(),f=c.join(" ");switch(e){case"if":a="if("+f+"){";break;case"else":c="if"===c.shift()?" if("+c.join(" ")+")":"",a="}else"+c+"{";break;case"/if":a="}";break;case"each":var g=c[0]||"$data",h=c[1]||"as",i=c[2]||"$value",j=c[3]||"$index",k=i+","+j;"as"!==h&&(g="[]"),a="$each("+g+",function("+k+"){";break;case"/each":a="});";break;case"echo":a="print("+f+");";break;case"print":case"include":a=e+"("+c.join(",")+");";break;default:if(-1!==f.indexOf("|")){var l=b.escape;0===a.indexOf("#")&&(a=a.substr(1),l=!1);for(var m=0,n=a.split("|"),o=n.length,p=l?"$escape":"$string",q=p+"("+n[m++]+")";o>m;m++)q=y(q,n[m]);a="=#"+q}else a=d.helpers[e]?"=#"+e+"("+c.join(",")+");":"="+a}return a}, true?!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return d}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!=typeof exports?module.exports=d:this.template=d}();

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2012年10月26日
	 * @author icepy
	 * @info 完成warn包装
	 */
	
	'use strict';
	
	var log = __webpack_require__(22);
	
	var warn = function(msg,e){
		log.warn(msg,e);
	}
	module.exports = warn;


/***/ },
/* 22 */
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23)))

/***/ },
/* 23 */
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
/* 24 */
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
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2012年10月26日
	 * @author icepy
	 * @info 完成error包装
	 */
	
	'use strict';
	
	var log = __webpack_require__(22);
	
	var error = function(msg,e){
		log.error(msg,e);
	}
	module.exports = error;


/***/ },
/* 26 */
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
	var Backbone = __webpack_require__(17)
	var storage = __webpack_require__(27);
	var Tools = __webpack_require__(24);
	var warn = __webpack_require__(21);
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
/* 27 */
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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2016年3月21日
	 * @author icepy
	 * @info 基于路由的生命周期
	 */
	
	'use strict'
	
	var Backbone = __webpack_require__(17);
	var warn = __webpack_require__(21);
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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time 2016年3月29日
	 * @author icepy
	 * @info 实体管理类
	 */
	var Tools = __webpack_require__(24);
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
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Auxiliary=t():e.Auxiliary=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){var r=n(1),o=n(2),i=n(3),a=n(4),s=n(5),c=n(7);e.exports={url:r,sheet:o,isNativeFunction:i,cookie:a,AjaxForm:s,UploadFile:c}},function(e,t){"use strict";var n=[];window.location;e.exports={parse:function(e){var t=document.createElement("a");t.href=e;for(var n,r={port:t.port,protocol:t.protocol.replace(":",""),hash:t.hash.replace("#",""),host:t.host,href:t.href,hostname:t.hostname,pathname:t.pathname,search:t.search,query:{}},o=r.search.replace(/^\?/,"").split("&"),i=o.length,a=0;i>a;a++)o[a]&&(n=o[a].split("="),r.query[n[0]]=n[1]);return t=null,r},format:function(e,t){var r=0,o=t.query,i=t.hash;if(n.length=0,n.push(e.lastIndexOf("?")>-1?e:e+"?"),o)for(var a in o){var s=o[a];r?n.push("&"+a+"="+s):(r++,n.push(a+"="+s))}return i&&n.push(i.indexOf("#")>-1?i:"#"+i),n.join("")},resolve:function(e,t){return/^(.\/)/.test(t)&&(t=t.replace(/^(.\/)/,"/")),/^(..\/)/.test(t)&&(e=e.substr(0,e.lastIndexOf("/")),t=t.replace(/^(..\/)/,"/")),e+t},extname:function(e){var t=e.split(".");return t[t.length-1]||""},parseSearch:function(e){for(var t,n,r={},o=e.replace(/^\?/,"").split("&"),i=o.length,a=0;i>a;a++)o[a]&&(n=o[a].split("="),t=n[1],(/^\[/.test(t)&&/\]$/.test(t)||/^{/.test(t)||/\}$/.test(t))&&(t=JSON.parse(t)),r[n[0]]=t);return r}}},function(e,t){"use strict";function n(){var e=document.createElement("style");return e.appendChild(document.createTextNode("")),document.head.appendChild(e),e.sheet}e.exports=n()},function(e,t){"use strict";function n(e){var t=typeof e;return"function"===t?a.test(o.call(e)):e&&"object"===t&&i.test(r.call(e))||!1}e.exports=n;var r=Object.prototype.toString,o=Function.prototype.toString,i=/^\[object .+?Constructor\]$/,a=RegExp("^"+String(r).replace(/[.*+?^${}()|[\]\/\\]/g,"\\$&").replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$")},function(e,t){"use strict";function n(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function r(e){function t(r,o,i){var a;if(arguments.length>1){if(i=n({path:"/"},t.defaults,i),"number"==typeof i.expires){var s=new Date;s.setMilliseconds(s.getMilliseconds()+864e5*i.expires),i.expires=s}try{a=JSON.stringify(o),/^[\{\[]/.test(a)&&(o=a)}catch(c){}return o=e.write?e.write(o,r):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),r=encodeURIComponent(String(r)),r=r.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),r=r.replace(/[\(\)]/g,escape),document.cookie=[r,"=",o,i.expires&&"; expires="+i.expires.toUTCString(),i.path&&"; path="+i.path,i.domain&&"; domain="+i.domain,i.secure?"; secure":""].join("")}r||(a={});for(var p=document.cookie?document.cookie.split("; "):[],l=/(%[0-9A-Z]{2})+/g,u=0;u<p.length;u++){var f=p[u].split("="),h=f[0].replace(l,decodeURIComponent),d=f.slice(1).join("=");'"'===d.charAt(0)&&(d=d.slice(1,-1));try{if(d=e.read?e.read(d,h):e(d,h)||d.replace(l,decodeURIComponent),this.json)try{d=JSON.parse(d)}catch(c){}if(r===h){a=d;break}r||(a[h]=d)}catch(c){}}return a}return t.get=t.set=t,t.getJSON=function(){return t.apply({json:!0},[].slice.call(arguments))},t.defaults={},t.remove=function(e,r){t(e,"",n(r,{expires:-1}))},t.withConverter=r,t}e.exports=r(function(){})},function(e,t,n){"use strict";var r=(n(1),n(6)),o=function(e){e=e||{},this.$el="string"==typeof e.el?$(e.el):e.el,this.uid=r("AjaxForm-"),this.loadState=!1,this._init()};o.prototype._init=function(){var e=$.Deferred();$.extend(this,e.promise()),this._createIframe(),this._addEvent(e)},o.prototype._createIframe=function(){var e='<iframe id="'+this.uid+'" name="'+this.uid+'"  style="display: none;" src="about:blank"></iframe>';this.$el.attr("target",this.uid),this.$el.append(e),this._iframe=$("#"+this.uid),$("<input />").attr({type:"hidden",name:"cross_post",value:"1"}).appendTo(this.$el)},o.prototype._addEvent=function(e){var t=this;this._iframe.on("load",function(){if(t.loadState){var n=this.contentWindow,r=n.location;if("about:blank"===r.href)e.reject(n);else try{var o=this._iframe[0].contentWindow.document.body;innerText=o.innerText,innerText||(innerText=o.innerHTML),innerText&&e.resolve($.parseJSON(innerText))}catch(i){e.resolve(n)}t.loadState=!1}})},o.prototype.encrypto=function(e){var t=this;$.each(e,function(e,n){var r=t.$el.find("[name="+e+"]");0===r.length?$("<input />").attr({type:"hidden",name:e,value:n}).appendTo(t.$el):r.val(n)})};var i=null;o.sharedInstanceAjaxForm=function(e,t){return i||(t=t||{},t.el=e,i=new o(t)),i},o.classInstanceAjaxForm=function(e,t){return t=t||{},t.el=e,new o(t)},e.exports=o},function(e,t){function n(e){var t=++r+"";return e?e+t:t}e.exports=n;var r=0},function(e,t,n){"use strict";var r=n(1),o=n(5),i=n(6),a=function(e){if(this.$el="string"==typeof e.el?$(e.el):e.el,this.uid=i("UploadFile-"),this.options=e,this._data=e.data||{},this._filename=e.filename||"image",this._url=e.url,!this._url)return void console.warn("配置上传URL");this._init();var t=$.Deferred();$.extend(this,t.promise()),this.ajaxForm=o.classInstanceAjaxForm(this.$el,{type:"img"}),this.ajaxForm.done(function(e){var n=e.location,o=decodeURIComponent(n.search),i=r.parseSearch(o);t.resolve(i)}),this.ajaxForm.fail(function(){t.reject(this)})};a.prototype._init=function(){this._createElement()},a.prototype._createElement=function(){var e="";for(var t in this._data){var n=this._data[t],r=Object.prototype.toString.call(n);"[object Object]"!==r&&"[object Array]"!==r||(n=JSON.stringify(n)),e+='<input type="hidden" name="'+t+"\" value='"+n+"'/>"}e+='<input type="file" class="opacity0 upload-file '+this.options.className+'" name="'+this._filename+'"  />',this.$el.attr("method","POST"),this.$el.attr("action",this._url),this.$el.attr("enctype","multipart/form-data"),this.$el.append(e)},a.prototype.parseErrorMsg=function(e){if(e&&"SUCCESS"==e.state)return!0;var t=1*e.errCode||0;switch(t){case 29:return"上传的文件太大了,请重新上传";case 31:return"请上传JPGE,JPG,PNG,GIF等格式的图片文件"}return"文件上传失败,请重新上传"},a.prototype.submit=function(){this.ajaxForm.loadState=!0,"function"==typeof this._before&&this._before(),this.$el.submit()};var s=null;a.sharedInstanceUploadFile=function(e){return s||(s=new a(e)),s},a.classInstanceUploadFile=function(e){return new a(e)},e.exports=a}])});
	//# sourceMappingURL=auxiliary.min.js.map

/***/ },
/* 31 */,
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var $ = __webpack_require__(1);
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var storage = base.storage;
	var UserModel = __webpack_require__(34);
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
/* 33 */
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23)))

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by YYT on 2016/4/20.
	 */
	var base = __webpack_require__(18);
	var Auxiliary = __webpack_require__(30);
	var _ = __webpack_require__(35);
	var BaseModel = base.Model;
	var Dialog = __webpack_require__(36);
	var loginBox = __webpack_require__(40);
	var cookie = Auxiliary.cookie;
	var Config = __webpack_require__(33);
	var domains = Config.domains;
	var checkEmailTemplate = __webpack_require__(44);
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
/* 35 */
/***/ function(module, exports) {

	module.exports = window._;

/***/ },
/* 36 */
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
	var base = __webpack_require__(18);
	var BaseView = base.View; // View的基类
	var Mask = __webpack_require__(37);
	var mask;
	var uid = 999;
	var _ = __webpack_require__(35);
	
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
	    this.closeTemp = __webpack_require__(38);
	    this.titleTemp = __webpack_require__(39);
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
/* 37 */
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
	
	var base = __webpack_require__(18);
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
/* 38 */
/***/ function(module, exports) {

	module.exports = "<a  href=\"\" id=\"{{id}}\" class=\"{{closeClass}}\">{{if closeText}}{{closeText}}{{/if}}</a>"

/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = "<h3 class=\"dialog_title J_title\">{{title}}</h3>\n"

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	
	var Auxiliary = __webpack_require__(30);
	// Diglog类
	var Dialog = __webpack_require__(36);
	var AjaxForm = Auxiliary.AjaxForm;
	var url = Auxiliary.url;
	var pwdencrypt = __webpack_require__(41);
	var loginBoxTemp = __webpack_require__(42);
	var tplEng = __webpack_require__(20);
	var secret = __webpack_require__(43);
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
	  var UserModel = __webpack_require__(34);
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
/* 41 */
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
/* 42 */
/***/ function(module, exports) {

	module.exports = "<div class=\"loginbox\">\n    <div class=\"external\">\n        <p class=\"title\">使用合作账号登录<span>(推荐)</span></p>\n        <ul>\n            <li>\n                <a href=\"{{url}}/api/login/sina-auth\" target=\"_blank\" class=\"weibo\" hidefocus>微博帐号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/qq-auth\" target=\"_blank\" class=\"qq\" hidefocus>QQ帐号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/renren-auth\" target=\"_blank\" class=\"renren\" hidefocus>人人账号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/baidu-auth\" target=\"_blank\" class=\"baidu\" hidefocus>百度帐号</a>\n            </li>\n        </ul>\n        <div class=\"loginbox-placehold\"></div>\n        <p class=\"text\">快捷登录，无需注册</p>\n        <p class=\"text\">与你的朋友分享你的爱！</p>\n    </div>\n    <div class=\"site\">\n        <p class=\"title\">音悦Tai账号登录</p>\n        <form id=\"loginBoxForm\" action=\"https://login.yinyuetai.com/login-ajax\" method=\"post\">\n            <p class=\"errorinfo\">错误信息提示</p>\n            <div class=\"email focuss\">\n                <input type=\"text\" name=\"email\" placeholder=\"您的邮箱地址或绑定手机\"/>\n            </div>\n            <div class=\"password\">\n                <input type=\"password\" class=\"pwd\" placeholder=\"请输入密码\"/>\n            </div>\n            <div id=\"captcha\"></div>\n            <div>\n                <p class=\"autologin\"><input type=\"checkbox\" id=\"autocheckbox\" name=\"autologin\" checked hidefocus/><label for=\"autocheckbox\">下次自动登录</label></p>\n                <a class=\"forgot\" href=\"{{url}}/forgot-password\" target=\"_blank\" hidefocus>忘记密码</a>\n            </div>\n            <div>\n                <input class=\"submit\" type=\"submit\" hidefocus/>\n                <p class=\"reg\">还没有音悦Tai账号？<a href=\"{{url}}/register\" target=\"_blank\" hidefocus>立即注册！</a></p>\n            </div>\n        </form>\n    </div>\n</div>"

/***/ },
/* 43 */
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
	var Auxiliary = __webpack_require__(30);
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
/* 44 */
/***/ function(module, exports) {

	module.exports = "<div style=\"padding: 20px 30px;\">\n  <p>您好像还没有进行邮箱验证。</p>\n  <p>为不影响部分功能的使用，请先进行\n    <a href=\"{homeSite}/settings/bind\" target=\"_blank\" class=\"special f14\">邮箱验证</a>\n  </p>\n</div>\n"

/***/ },
/* 45 */
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
	var _ = __webpack_require__(35);
	
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
	  return __webpack_require__(46);
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
/* 46 */
/***/ function(module, exports) {

	module.exports = "<div id=\"UIConfigWrap\" class=\"shadow_screen\">\n    <div class=\"shadow\"></div>\n    <div class=\"edit_annmoucement_con\" style=\"margin-bottom: 16px; width: 400px;margin-left:-200px;\">\n        <h2 class=\"edit_title\"><span class=\"title\" id=\"UIConfirmTitle\"><%=title%></span> <span class=\"close UIConfirmClose\">X</span></h2>\n        <div class=\"editCon\" style=\"\">\n            <div class=\"content\" style=\"padding:16px; font-size: 14px;\"><%=content%></div>\n            <p class=\"btn-wrap am-margin-top\" >\n                <a style=\"display: <%= okBtn?'inline-block':'none'%>;\" id=\"UIConfirmOk\" href=\"javascript:;\" class=\"boderRadAll_5 submit active am-margin-right\">确定</a>\n                <a style=\"display: <%= cancelBtn?'inline-block':'none'%>;\" href=\"javascript:;\" class=\"boderRadAll_5 cancel UIConfirmClose am-margin-left\">取消</a>\n            </p>\n        </div>\n    </div>\n</div>"

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by AaronYuan on 4/1/16.
	 *
	 * 校验模块
	 */
	
	'use strict';
	
	var IMModel = __webpack_require__(32);
	var imModel = IMModel.sharedInstanceIMModel();
	
	module.exports = {
	  onlyAnchorUse: function (url) {
	    imModel.fetchIMUserSig(function (sig) {
	      if (!sig.anchor) {
	        window.location.href = url || '/index.html';
	      }
	    }, function () {
	      window.location.href = '/index.html';
	    });
	  }
	};
	


/***/ },
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
	 */
	
	
	/**
	 * @time {时间}
	 * @author {编写者}
	 * @info {实现的功能}
	 */
	
	'use strict';
	var shared = null;
	var dialogTemp = __webpack_require__(54);
	var Dialog = __webpack_require__(36);
	var Helper = __webpack_require__(55);
	
	var UploadFileDialog = function (options) {
	  var self = this;
	  this.options = options;
	  this.dialog = Dialog.classInstanceDialog(dialogTemp, options);
	  this.helper = new Helper({
	    ctrlData: this.options.ctrlData,
	    id: '#' + this.dialog.id
	  });
	  this.helper.on('uploadFileSuccess', function (response) {
	    if (typeof self.options.uploadFileSuccess === 'function') {
	      self.options.uploadFileSuccess(response);
	    }
	  });
	  this.helper.on('saveFile', function () {
	    if (typeof self.options.saveFile === 'function') {
	      self.options.saveFile();
	    }
	  });
	};
	UploadFileDialog.prototype.show = function (obj) {
	  if (this.helper && obj) {
	    this.helper.trigger('successBreviary', obj);
	  }
	  this.dialog.show();
	};
	UploadFileDialog.prototype.hide = function () {
	  this.dialog.hide();
	};
	UploadFileDialog.prototype.emptyValue = function () {
	  if (this.helper) {
	    this.helper.emptyValue();
	  }
	};
	
	UploadFileDialog.prototype.parseErrorMsg = function (res) {
	  var code;
	  if (res && res.state === 'SUCCESS') {
	    return true;
	  }
	  code = res.errCode * 1 || 0;
	  switch (code) {
	    case 29:
	      return '上传的文件太大了,请重新上传';
	    case 31:
	      return '请上传JPGE,JPG,PNG,GIF等格式的图片文件';
	    default:
	      return '文件上传失败,请重新上传';
	  }
	};
	
	
	UploadFileDialog.sharedInstanceUploadFileDialog = function (options) {
	  if (!shared) {
	    shared = new UploadFileDialog(options);
	  }
	  return shared;
	};
	module.exports = UploadFileDialog;


/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = "<div class=\"shadow\"></div>\n<div class=\"edit_Bg_form_x\">\n\t<div class=\"edit_title\">\n\t\t<span class=\"upload-title\">背景图设置</span>\n\t\t<span class=\"upload-status upload-image-state\"></span>\n\t</div>\n\t<div class=\"formCon clearfix\">\n\t\t<div class=\"imgBox fl\">\n\t\t\t<img src=\"\" alt=\"\" width=\"100%\" height=\"100%\"  style=\"display: none;\" class=\"imgboxFile\">\n\t\t</div>\n\t\t<div class=\"formBox fl\">\n\t\t\t<div class=\"pseudo-uploadBtn am-btn-red boderRadAll_3\">\n\t\t\t\t<span class=\"input-text\">上传图片</span>\n\t\t\t\t<form class=\"upload-form\">\n\n\t\t\t\t</form>\n\t\t\t</div>\n\t\t\t<p>支持5M以内的gif、jpg、jpge、png图片上传</p>\n\t\t\t<div class=\"submit am-btn-red boderRadAll_3\">保存</div>\n\t\t</div>\n\t</div>\n</div>\n"

/***/ },
/* 55 */
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
	var base = __webpack_require__(18);
	var Auxiliary = __webpack_require__(30);
	var BaseView = base.View;
	var UploadFile = Auxiliary.UploadFile;
	
	var uploadIng = '正在上传';
	var uploadDone = '上传完成!';
	var msgBox = __webpack_require__(56);
	var loc = window.location;
	var View = BaseView.extend({
	  events: { // 监听事件
	    'click .submit': 'saveHandler',
	    'change .upload-file': 'changeFile'
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function (options) {
	    this.$el = $(options.id);
	    this._ICEinitEvent();
	    this.formDOM = this.findDOMNode('.upload-form');
	    this.imgSrcDOM = this.findDOMNode('.imgboxFile');
	    this.imageStateDOM = this.findDOMNode('.upload-image-state');
	    this.inputTextDOM = this.findDOMNode('.input-text');
	    var self = this;
	    var temp = {
	      gcmd: [
	        {
	          gsaveOriginal: 1, op: 'save', plan: 'avatar', belongId: '20634338', srcImg: 'img'
	        }
	      ],
	      gredirect: loc.origin + '/web/upload.html'
	    };
	    var ctrlData = options.ctrlData || temp;
	    var uploadParams = {
	      el: this.formDOM,
	      url: 'http://image.yinyuetai.com/edit',
	      data: ctrlData,
	      filename: 'img',
	      className: 'file'
	    };
	    this.upload = new UploadFile(uploadParams);
	    this.upload.done(function (response) {
	      self.imageStateDOM.html(uploadDone);
	      self.previewImage(response);
	      self.trigger('uploadFileSuccess', response);
	    });
	    this.upload.fail(function () {
	      msgBox.showError('上传失败');
	    });
	    this.on('successBreviary', function (obj) {
	      this.successBreviary(obj);
	    });
	  },
	  successBreviary: function (obj) {
	    this.emptyValue();
	    if (obj.breviaryUrl) {
	      this.imgSrcDOM.attr('src', obj.breviaryUrl);
	      this.imgSrcDOM.show();
	    }
	    if (obj.inputText) {
	      this.inputTextDOM.text(obj.inputText);
	    }
	  },
	  saveHandler: function () {
	    this.trigger('saveFile');
	  },
	  changeFile: function () {
	    this.imageStateDOM.html(uploadIng);
	    this.upload.submit();
	  },
	  previewImage: function (response) {
	    var images = response.images;
	    var imagePath;
	    if (images && images.length > 0) {
	      imagePath = images[0].path;
	      this.imgSrcDOM.attr('src', imagePath);
	      this.imgSrcDOM.show();
	    }
	  },
	  emptyValue: function () {
	    this.imageStateDOM.html('');
	    this.imgSrcDOM.hide();
	    this.inputTextDOM.text('上传图片');
	  }
	});
	
	var shared = null;
	View.sharedInstanceUploadFileDialog = function (options) {
	  if (!shared) {
	    shared = new View(options);
	  }
	  return shared;
	};
	View.fetchDialogTemplate = function () {
	  return __webpack_require__(54);
	};
	module.exports = View;


/***/ },
/* 56 */
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
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */
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
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
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
/***/ function(module, exports, __webpack_require__) {

	var base = __webpack_require__(18);
	var LoginUserView = __webpack_require__(83);
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
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Backbone = window.Backbone;
	var base = __webpack_require__(18);
	var BaseView = base.View;
	var storage = base.storage;
	var UserModel = __webpack_require__(34);
	var user = UserModel.sharedInstanceUserModel();
	var loginBox = __webpack_require__(40);
	var sginHTML = __webpack_require__(84);
	var loginedTemp = __webpack_require__(85);
	var win = window;
	var location = win.location;
	var IMModel = __webpack_require__(32);
	var imModel = IMModel.sharedInstanceIMModel();
	var config = __webpack_require__(33);
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
/* 84 */
/***/ function(module, exports) {

	module.exports = "<div class=\"PcMsg fl\">\n    <a class=\"user-login\" href=\"#\" id=\"login\">登陆</a>\n</div>"

/***/ },
/* 85 */
/***/ function(module, exports) {

	module.exports = "<div class=\"avator fl\">\n    <img class=\"am-circle\" style=\"width: 40px; height: 40px;\" src=\"{{bigheadImg}}\" alt=\"用户头像\">\n</div>\n<div class=\"loginMsg fl hoverMenu\">\n    <a class=\"user-name show-drop-menu\" href=\"#\">{{userName}}<span></span></a>\n    <ul class=\"pcNav hoverMenu\">\n        <li><a href=\"anchor-setting.html\">个人中心</a></li>\n        <li><span class=\"header-logout\" id=\"logout\">退出</span></li>\n    </ul>\n</div>\n"

/***/ },
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Backbone = window.Backbone;
	var base = __webpack_require__(18);
	var BaseView = base.View;
	var storage = base.storage;
	var UserModel = __webpack_require__(34);
	var TopBarView = __webpack_require__(82);
	var UploadFileDialog = __webpack_require__(53);
	var user = UserModel.sharedInstanceUserModel();
	var msgBox = __webpack_require__(56);
	var auth = __webpack_require__(47);
	var IMModel = __webpack_require__(32);
	var imModel = IMModel.sharedInstanceIMModel();
	var UpdateBgModel = __webpack_require__(100);
	var ProfileView = __webpack_require__(101);
	var EditProfileView = __webpack_require__(104);
	var UpdatePasswordView = __webpack_require__(107);
	var PageContentView = __webpack_require__(109);
	
	var View = BaseView.extend({
	  el: '#settingContent',
	  events: {
	    'click #editBgBtn': 'editBgHandler'
	  },
	  rawLoader: function () {
	    return __webpack_require__(138);
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    auth.onlyAnchorUse();
	    this.topbarView = new TopBarView();
	    this.isLogined = false;
	    this.upload = null;
	    this.bgTheme = null;
	    this.anchorSig = null;
	    this.updateBgParameter = {
	      deviceinfo: '{"aid":"30001001"}'
	    };
	    this.tempImg = null;
	    this.saveLock = true;
	    this.uploadSate = false;
	    this.updateBgModel = new UpdateBgModel();
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.profileBg = $('#profileBg');
	  },
	  ready: function () {
	    //  初始化
	    var self = this;
	
	    this.defineEventInterface();
	
	    if (!user.isLogined()) {
	      // 把签名清除一次
	      storage.remove('imSig');
	      // 跳转走人
	      storage.set('signout', 1);
	      window.location.href = '/login.html';
	      this.topbarView.on('logined', function () {
	        self.fetchIMUserSig();
	      });
	    } else {
	      this.fetchIMUserSig();
	    }
	  },
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:setThemeBgImg', function (url) {
	      self.setPageBgimg(url);
	    });
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  //  渲染界面
	  initRender: function () {
	    var self = this;
	    var fileOptions = {
	      width: 580,
	      height: 341,
	      isRemoveAfterHide: false,
	      isAutoShow: false,
	      mainClass: 'shadow_screen_x',
	      closeClass: 'editor_bg_close_x',
	      closeText: 'X',
	      title: '背景设置',
	      ctrlData: {
	        cmd: [
	          {
	            saveOriginal: 1,
	            op: 'save',
	            plan: 'avatar',
	            belongId: '20634338',
	            srcImg: 'img'
	          }
	        ],
	        redirect: 'http://' + window.location.host + '/cross-url/upload.html'
	      },
	      uploadFileSuccess: function (response) {
	        var result = self.upload.parseErrorMsg(response);
	        if (result === true) {
	          //  上传成功
	          self.uploadSate = true;
	          self.uploadSuccess(response);
	        } else {
	          msgBox.showTip(result);
	        }
	      },
	      saveFile: function () {
	        //  保存
	        if (self.uploadSate) {
	          self.saveFile();
	        } else {
	          msgBox.showError('正在上传，请等待');
	        }
	      }
	    };
	    this.upload = new UploadFileDialog(fileOptions);
	    this.isLogined = true;
	    this.profileView = new ProfileView({
	      parent: this
	    });
	    this.pageContentView = new PageContentView({
	      parent: this
	    });
	    // this.editProfileView = new EditProfileView({ parent: this });
	    if (imModel.isAnchor()) {
	      this.editProfileView = new EditProfileView();
	    }
	    this.updatePasswordView = new UpdatePasswordView({
	      parent: this
	    });
	  },
	  fetchIMUserSig: function () {
	    var self = this;
	    this.updateBgParameter.access_token = 'web-' + user.getToken();
	    var promise = imModel.fetchIMUserSig();
	    promise.done(function (sig) {
	      if (!sig.anchor) {
	        //  console.log('跳转走人');
	        // storage.remove('imSig');
	        //  跳转走人
	        self.initRender();
	      } else {
	        //  继续处理主播
	        self.anchorSig = sig;
	        self.bgTheme = sig.anchor.bgTheme;
	        self.setPageBgimg(sig.anchor.bgTheme);
	        self.initRender();
	      }
	    });
	    promise.fail(function () {
	      msgBox.showError('获取签名错误');
	    });
	  },
	  editBgHandler: function () {
	    if (this.isLogined) {
	      var attrs = null;
	      if (this.anchorBg) {
	        attrs = {
	          inputText: '编辑背景',
	          breviaryUrl: this.anchorBg
	        };
	      }
	      this.upload.emptyValue();
	      this.upload.show(attrs);
	    } else {
	      msgBox.showError('未登录或获取签名失败');
	    }
	  },
	  uploadSuccess: function (response) {
	    var images = response.images;
	    var path = images[0].path;
	    this.tempImg = path;
	  },
	  saveFile: function () {
	    //  保存
	    var self = this;
	    if (this.saveLock) {
	      this.saveLock = false;
	      this.bgTheme = this.tempImg;
	      this.updateBgParameter.bgTheme = this.bgTheme;
	      var promise = this.updateBgModel.executeJSONP(this.updateBgParameter);
	      promise.done(function (response) {
	        var code = response.code;
	        if (code === '0') {
	          self.saveLock = true;
	          self.setPageBgimg(response.data.userProfile.bgTheme || '');
	          self.upload.hide();
	          //  更新缓存
	          imModel.updateIMUserSig();
	        } else {
	          msgBox.showError(response.msg);
	        }
	      });
	      promise.fail(function () {
	        self.saveLock = true;
	        msgBox.showError('保存背景图出错');
	      });
	    }
	  },
	  setPageBgimg: function (url) {
	    // TODO
	    if (url) {
	      // this.profileBg.css('background', 'url(' + url + ')');
	      // this.profileBg.css('background-position', '0 90px');
	    }
	  }
	});
	
	module.exports = View;


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/user/bgtheme_update.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix).split('?')[0];
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
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	// 顶部用户信息
	'use strict';
	
	var Backbone = window.Backbone;
	var _ = __webpack_require__(35);
	var base = __webpack_require__(18);
	var BaseView = base.View;
	var profileTemp = __webpack_require__(102);
	var IMModel = __webpack_require__(32);
	var imModel = IMModel.sharedInstanceIMModel();
	var UserModel = __webpack_require__(34);
	var user = UserModel.sharedInstanceUserModel();
	var UserInfoModel = __webpack_require__(103);
	
	var View = BaseView.extend({
	  el: '.userInfoWrap',
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    var data = imModel.get('data');
	    this.data = {
	      nickName: data.nickName,
	      bigheadImg: data.largeAvatar,
	      anchor: data.anchor
	    };
	    this.userInfoModel = UserInfoModel.sharedInstanceModel();
	    this.userInfo = {};
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.elements = {};
	  },
	  findDom: function () {
	    var el = this.$el;
	    this.elements.nickName = el.find('#nickName');
	    this.elements.headAvatar = el.find('#headAvatar');
	    this.elements.tagsWrap = el.find('#tagsWrap');
	    this.elements.createCount = el.find('#createCount');
	    this.elements.watchedLiveCount = el.find('#txtLive');
	    this.elements.totalCredits = el.find('#txtScore');
	    this.elements.fanTicket = el.find('#txtTicket');
	  },
	  ready: function () {
	    //  初始化
	    this.initRender();
	    this.defineEventInterface();
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  initRender: function () {
	    var self = this;
	    var profileHTML;
	    profileHTML = this.compileHTML(profileTemp, this.data);
	    this.$el.html(profileHTML);
	    this.findDom();
	    var promise = this.userInfoModel.executeJSONP({
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken()
	    });
	    promise.done(function (res) {
	      self.bindUserInfo(res);
	    });
	  },
	  bindUserInfo: function (res) {
	    var self = this;
	    self.data.gender = res.data.sex || '';
	    self.data.bigheadImg = res.data.largeAvatar || '';
	    self.elements.watchedLiveCount.text(res.data.userCount.viewCount || 0);
	    self.elements.totalCredits.text(res.data.totalMarks || 0);
	    self.elements.fanTicket.text(0);
	    // Backbone.trigger('event:setThemeBgImg', res.data.userProfile.bgTheme || '');
	  },
	  partialRender: function (data) {
	    this.elements.nickName.text(data.nickName);
	    this.elements.headAvatar.attr('src', data.headImg);
	    var html = '';
	    _.each(data.tags, function (item) {
	      html += '<span>' + item + '</span>';
	    });
	    this.elements.tagsWrap.html(html);
	  },
	  /**
	   * 定义对外公布的事件
	   */
	  defineEventInterface: function () {
	    var self = this;
	    Backbone.on('event:userProfileChanged', function (data) {
	      self.partialRender(data);
	    });
	  }
	});
	
	module.exports = View;


/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports = "<div class=\"anchor-info-wrap\">\n\t<div class=\"am-circle avatar-wrap center\">\n\t\t<img id=\"headAvatar\" src=\"{{bigheadImg}}\" class=\"avatar am-circle\">\n\t</div>\n\t<div class=\"name-wrap center am-margin-top-sm am-vertical-align\">\n\t\t<span id=\"nickName\" class=\"name white am-vertical-align-middle\">{{nickName}}</span>\n\t\t<!-- <i class=\"icon-gender male am-vertical-align-middle am-margin-left-sm\"></i> -->\n\t</div>\n\t<div class=\"basic-wrap am-margin-top-lg\">\n\t\t<div class=\"center\">\n\t\t\t{{if anchor}}\n\t\t\t<span id='createCount' class=\"create\">主持的直播:<span class=\"white big\">{{anchor.liveCount}}</span>场</span>\n\t\t\t{{/if}}\n\t\t\t<span class=\"watch\">观看直播:<span id=\"txtLive\" class=\"white\">0</span>次</span>\n\t\t\t<span class=\"score\">积分:<span id=\"txtScore\" class=\"white\">0</span></span>\n\t\t</div>\n\t</div>\n\t{{if anchor}}\n\t<div class=\"tags-wrap center\">标签:\n\t\t<div class=\"list\" id=\"tagsWrap\">\n\t\t\t{{each anchor.tags as item}}\n\t\t\t<span>{{item}}</span> {{/each}}\n\t\t</div>\n\t</div>\n\t{{/if}}\n</div>\n"

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
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
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Backbone = window.Backbone;
	var _ = __webpack_require__(35);
	var base = __webpack_require__(18);
	var BaseView = base.View;
	var UserUpdateModel = __webpack_require__(105);
	var UserModel = __webpack_require__(34);
	var user = UserModel.sharedInstanceUserModel();
	var Auxiliary = __webpack_require__(30);
	var UploadFile = Auxiliary.UploadFile;
	var msgBox = __webpack_require__(56);
	var IMModel = __webpack_require__(32);
	var imModel = IMModel.sharedInstanceIMModel();
	
	var View = BaseView.extend({
	  el: '#editProfile',
	  events: { //  监听事件
	    //  'click #btnSave': 'verifyForm',
	    'change #userAvatarForm': 'submitFile',
	    'keyup .userInfoChanged': 'verifyForm',
	    'click #btnSave': 'saveuserinfo'
	  },
	  rawLoader: function () {
	    return __webpack_require__(106);
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.txtImg = $('#txtImg');
	    this.txtName = $('#txtName');
	    this.txtTags = $('#txtTags');
	    this.btnSave = $('#btnSave');
	    this.btnUploadAvatar = this.findDOMNode('#btnUploadAvatar');
	    this.imgUserAvatar = $('#imgUserAvatar');
	  },
	  ready: function () {
	    //  初始化
	    this.userUpdateModel = new UserUpdateModel();
	    this.initUploadFile();
	    this.fetchIMUserInfo();
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  initForm: function () {
	    var self = this;
	    if (self.userInfo.smallAvatar) {
	      self.imgUserAvatar.attr('src', self.userInfo.smallAvatar);
	      self.txtImg.val(self.userInfo.smallAvatar);
	    }
	    self.txtName.val(self.userInfo.nickName);
	    var tags = self.userInfo.anchor.tags.join(',') || '';
	    self.txtTags.val(tags);
	  },
	  fetchIMUserInfo: function () {
	    var self = this;
	    var promise = imModel.fetchIMUserSig();
	    promise.done(function (userImInfo) {
	      self.userInfo = userImInfo;
	      self.initForm();
	    });
	  },
	  //  检查数据
	  verifyForm: function () {
	    var name = $.trim(this.txtName.val());
	    var nameReg = /^[0-9A-Za-z\u4e00-\u9fa5]{1,15}$/g;
	    var tags = $.trim(this.txtTags.val());
	    this.btnSave.addClass('m_disabled');
	    if (!name || name.length === 0) {
	      msgBox.showTip('请输入您的昵称');
	      return false;
	    } else if (name.length > 30) {
	      msgBox.showTip('昵称长度不能超过15个字!');
	      return false;
	    } else if (!nameReg.test(name)) {
	      msgBox.showTip('昵称允许包含:中文,数字以及字母!');
	      return false;
	    }
	    tags = tags.split(/[,，]/);
	    var temp = [];
	    var overLen = false;
	    var val = '';
	    for (var j = tags.length; j >= 0; j--) {
	      val = $.trim(tags[j]);
	      if (val.length >= 1) {
	        temp.push(val);
	      }
	      if (val.length > 5) {
	        overLen = true;
	      }
	    }
	    tags = temp;
	    if (!tags || tags.length === 0) {
	      msgBox.showTip('请输入至少一个标签,多个标签请用逗号分隔!');
	      return false;
	    } else if (overLen) {
	      msgBox.showTip('每个标签最多5个字,请检查您的标签!');
	      return false;
	    } else if (tags.length > 5) {
	      msgBox.showTip('您最多输入5个标签,请删掉一些标签');
	      return false;
	    }
	    if (!this.txtImg.val() || this.txtImg.val().length <= 0) {
	      msgBox.showTip('请上传头像图片');
	      return false;
	    }
	    this.btnSave.removeClass('m_disabled');
	    return true;
	  },
	  tagsFilter: function (tags) {
	    var _tags = tags.split(/[,，]/);
	    var temp = [];
	    _.each(_tags, function (item) {
	      if (item.length >= 1) {
	        temp.push($.trim(item));
	      }
	    });
	    return temp;
	  },
	  initUploadFile: function () {
	    var self = this;
	    var uploadParams = {
	      el: $('#userAvatarForm'),
	      url: 'http://image.yinyuetai.com/edit',
	      data: {
	        cmd: [
	          {
	            saveOriginal: 1,
	            op: 'save',
	            plan: 'avatar',
	            belongId: '20634338',
	            srcImg: 'img'
	          }
	        ],
	        redirect: 'http://' + window.location.host + '/cross-url/upload.html'
	      },
	      filename: 'img',
	      className: 'file'
	    };
	    this.upload = UploadFile.classInstanceUploadFile(uploadParams);
	    this.upload.done(function (response) {
	      self.changeUploadBtnStatus();
	      self.fileUploaded(response);
	    });
	    this.upload.fail(function () {
	      self.changeUploadBtnStatus();
	      msgBox.showError('上传失败');
	    });
	  },
	  changeUploadBtnStatus: function (isUploading) {
	    if (isUploading) {
	      this.btnUploadAvatar.parent().addClass('m_disabled');
	      this.btnUploadAvatar.text('正在上传');
	    } else {
	      this.btnUploadAvatar.parent().removeClass('m_disabled');
	      this.btnUploadAvatar.text('重新上传');
	    }
	  },
	  //  表单提交文件
	  submitFile: function () {
	    var btn = this.btnUploadAvatar.parent();
	    if (btn.hasClass('m_disabled')) {
	      return;
	    }
	    this.changeUploadBtnStatus(true);
	    this.upload.submit();
	  },
	  //  上传成功后处理图片
	  fileUploaded: function (res) {
	    var result = this.upload.parseErrorMsg(res);
	    if (result === true) {
	      var src = res.images[0].path;
	      this.txtImg.val(src);
	      this.imgUserAvatar.attr('src', src);
	      this.verifyForm();
	    } else {
	      msgBox.showTip(result);
	    }
	  },
	  saveuserinfo: function () {
	    var self = this;
	    if (!self.isChanged()) {
	      return;
	    }
	    if (this.verifyForm()) {
	      self.btnSave.text('保存中');
	      var userUpdateParameter = {
	        deviceinfo: '{"aid": "30001001"}',
	        access_token: user.getWebToken(),
	        nickname: $.trim(self.txtName.val()),
	        headImg: self.txtImg.val(),
	        tags: self.tagsFilter(self.txtTags.val()).join(',')
	      };
	      var promise = this.userUpdateModel.executeJSONP(userUpdateParameter);
	      promise.done(function (res) {
	        self.btnSave.text('保存');
	        if (res && res.code === '0') {
	          msgBox.showOK('数据保存成功!');
	          //  更新缓存
	          imModel.updateIMUserSig();
	          self.fetchIMUserInfo();
	          Backbone.trigger('event:userProfileChanged', {
	            nickName: $.trim(self.txtName.val()),
	            headImg: self.txtImg.val(),
	            tags: self.tagsFilter(self.txtTags.val())
	          });
	        } else {
	          msgBox.showError(res.msg || '数据保存失败,请稍后重试!');
	        }
	      });
	      promise.fail(function () {
	        msgBox.showError('数据保存失败,请稍后重试!');
	        self.btnSave.text('保存');
	      });
	    }
	  },
	  //  检查是否更改了信息
	  isChanged: function () {
	    var name = $.trim(this.txtName.val());
	    var tags = $.trim(this.txtTags.val()).replace(/[,，]/g, ',');
	    var disabled = name === this.userInfo.nickName && tags === this.userInfo.anchor.tags.join(',');
	    if (disabled && this.txtImg.val() === this.userInfo.smallAvatar) {
	      this.btnSave.addClass('m_disabled');
	      return false;
	    }
	    return true;
	  }
	});
	
	module.exports = View;


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/user/update.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix).split('?')[0];
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
/* 106 */
/***/ function(module, exports) {

	module.exports = "<ul>\n    <li class=\"uploadAvator\">\n        <span class=\"fl PiTitle\"><i>*</i>头像：</span>\n        <div class=\"fl\">\n            <img id=\"imgUserAvatar\" data-src=\"../img/personInfo-uploadBg.png\" src=\"../img/personInfo-uploadBg.png\"\n                 alt=\"\" class=\"fl avatorNow\">\n            <div class=\"uploadform fl\">\n                <div class=\"am-btn-red boderRadAll_3\">\n                    <span id=\"btnUploadAvatar\">上传图片</span>\n                    <form id=\"userAvatarForm\" class=\"upload-form\"></form>\n                </div>\n                <p>支持5M以内的gif、jpg、jpeg、png图片上传</p>\n            </div>\n            <input id=\"txtImg\" type=\"hidden\" value=\"\">\n        </div>\n    </li>\n    <li class=\"Inp_Pc_name\">\n        <span class=\"fl PiTitle\"><i>*</i>昵称：</span>\n        <div class=\"fl\">\n            <input id=\"txtName\" placeholder=\"昵称\" class=\"userInfoChanged\" maxlength=\"30\" type=\"text\">\n            <span style=\"display: none;\" class=\"tips\"><i class=\"name-err-tip\"></i> 你的名字里有敏感词，请重新输入 </span>\n        </div>\n    </li>\n    <li class=\"tags\">\n        <span class=\"fl PiTitle\"><i>*</i>标签：</span>\n        <div class=\"fl\">\n            <input id=\"txtTags\" class=\"userInfoChanged\" type=\"text\" placeholder=\"(多个标签中间请用逗号隔开)\">\n            <div class=\"light-color am-margin-top\">多个标签中间请用逗号隔开,每个标签最多5个字,最多拥有5个标签.</div>\n        </div>\n    </li>\n</ul>\n<div class=\" am-margin-top-xl am-padding-top\">\n    <button id=\"btnSave\" class=\"am-center am-btn am-btn-red boderRadAll_3\">保存</button>\n</div>\n"

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var BaseView = base.View;
	var Auxiliary = __webpack_require__(30);
	var msgBox = __webpack_require__(56);
	var AjaxForm = Auxiliary.AjaxForm;
	var url = Auxiliary.url;
	var View = BaseView.extend({
	  el: '#updatePassword',
	  events: { //  监听事件
	    'click #btnPwdSave': 'updatePwd',
	    'keyup #txtConfirmPwd': 'changeBtnStatus',
	    'keyup #txtNewPwd': 'checkNewPwd'
	  },
	  rawLoader: function () {
	    return __webpack_require__(108);
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.txtOldPwd = this.findDOMNode('#txtOldPwd');
	    this.txtNewPwd = this.findDOMNode('#txtNewPwd');
	    this.txtConfirmPwd = this.findDOMNode('#txtConfirmPwd');
	    this.btnPwdSave = this.findDOMNode('#btnPwdSave');
	    this.tipPwdErr = this.findDOMNode('#tipPwdErr');
	    this.formPwd = this.findDOMNode('#formPwd');
	  },
	  ready: function () {
	    //  初始化
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  //  校验表单
	  verifyForm: function () {
	    var old = this.txtOldPwd.val();
	    if (!old || old.length <= 0) {
	      msgBox.showTip('请输入您当前的密码');
	      return false;
	    }
	    var newPwd = this.txtNewPwd.val();
	    var pwdReg = /[\S]{4,20}/; // /[a-zA-Z00-9]{6,18}/g;
	    if (!newPwd || newPwd.length <= 0) {
	      msgBox.showTip('请输入新的密码');
	      return false;
	    } else if (newPwd === old) {
	      msgBox.showTip('新密码不能跟旧密码一致');
	      return false;
	    } else if (!pwdReg.test(newPwd)) {
	      msgBox.showTip('密码的长度建议4~20位,允许输入字母、数字、符号');
	      return false;
	    }
	    var confirmPwd = this.txtConfirmPwd.val();
	    if (newPwd !== confirmPwd) {
	      msgBox.showTip('2次输入的新密码不一致!');
	      return false;
	    }
	    return true;
	  },
	  changeBtnStatus: function () {
	    var newPwd = this.txtNewPwd.val();
	    var confirmPwd = this.txtConfirmPwd.val();
	    if (newPwd !== confirmPwd) {
	      this.btnPwdSave.addClass('m_disabled');
	    } else {
	      this.btnPwdSave.removeClass('m_disabled');
	    }
	  },
	  updatePwd: function () {
	    var self = this;
	    if (!self.verifyForm()) {
	      return false;
	    }
	    this.btnPwdSave.text('保存中');
	    this.initAjaxForm();
	    this.formPwd.submit();
	    return true;
	  },
	  checkNewPwd: function () {
	    var old = this.txtOldPwd.val();
	    var newPwd = this.txtNewPwd.val();
	    if (old === newPwd) {
	      this.tipPwdErr.show();
	    } else {
	      this.tipPwdErr.hide();
	    }
	  },
	  //  重置表单
	  resetInput: function () {
	    this.formPwd.find('input').val('');
	  },
	  initAjaxForm: function () {
	    var self = this;
	    this.pwdAjaxForm = AjaxForm.classInstanceAjaxForm($('#formPwd'));
	    this.pwdAjaxForm.setIframeState(true);
	    this.pwdAjaxForm.done(function (cw) {
	      var loc = cw.location;
	      var search = decodeURIComponent(loc.search);
	      var response = url.parseSearch(search);
	      response = response.json;
	      if (response && response.error === true) {
	        msgBox.showError(response.message);
	      } else {
	        self.resetInput();
	        msgBox.showOK('密码修改成功!');
	      }
	      self.btnPwdSave.text('保存');
	    });
	    this.pwdAjaxForm.fail(function () {
	      msgBox.showError('密码修改失败!');
	      self.btnPwdSave.text('保存');
	    });
	  }
	});
	
	module.exports = View;


/***/ },
/* 108 */
/***/ function(module, exports) {

	module.exports = "<form id=\"formPwd\" action=\"http://i.yinyuetai.com/i/profile/update-password\" method=\"post\">\n    <ul>\n        <li class=\"Inp_Pc_name\">\n            <span class=\"fl PiTitle\"><i>*</i>旧密码：</span>\n            <div class=\"fl\">\n                <input id=\"txtOldPwd\" name=\"oldPassword\" placeholder=\"请输入旧密码\" type=\"password\">\n            </div>\n        </li>\n        <li class=\"Inp_Pc_name\">\n            <span class=\"fl PiTitle\"><i>*</i>新密码：</span>\n            <div class=\"fl\">\n                <input id=\"txtNewPwd\" name=\"newPassword\" placeholder=\"请输入新密码\" type=\"password\"><span id=\"tipPwdErr\" style=\"display: none;color:red; padding-left: 5px;\">新密码不能跟旧密码一致</span>\n            </div>\n        </li>\n        <li class=\"Inp_Pc_name\">\n            <span class=\"fl PiTitle\"><i>*</i>确认新密码：</span>\n            <div class=\"fl\">\n                <input id=\"txtConfirmPwd\" name=\"newPasswordRepeat\" placeholder=\"请再次输入新密码\" type=\"password\">\n            </div>\n        </li>\n    </ul>\n</form>\n<div class=\"am-margin-top-xl am-padding-top\">\n    <button id=\"btnPwdSave\" class=\"am-center am-btn am-btn-red boderRadAll_3\">保存</button>\n</div>\n"

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var BaseView = base.View;
	var storage = base.storage;
	var CreateLiveView = __webpack_require__(110);
	var NoOpenListView = __webpack_require__(115);
	var HistoryListView = __webpack_require__(123);
	var UIconfirm = __webpack_require__(45);
	var Auxiliary = __webpack_require__(30);
	var URL = Auxiliary.url;
	var IMModel = __webpack_require__(32);
	var imModel = IMModel.sharedInstanceIMModel();
	var RecordLiveView = __webpack_require__(129);
	var FollowingView = __webpack_require__(132);
	
	var View = BaseView.extend({
	  el: '#pageContent',
	  events: { //  监听事件
	    // 'click #tab-menu-ctrl>li': 'menuChanged',
	    'click #liveState a': 'liveStateChanged',
	    'click #profileSate>a': 'profileStateChanged'
	  },
	  rawLoader: function () {
	    return __webpack_require__(137);
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.menuList = {
	      list: []
	    };
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.noListDOM = this.findDOMNode('#noOpenListLive');
	    this.historyDOM = this.findDOMNode('#historyListLive');
	    this.liveStateDOMS = this.findDOMNode('#liveState a');
	    this.editProfileDOM = this.findDOMNode('#editProfile');
	    this.accountSettingsDOM = this.findDOMNode('#accountSettings');
	    this.profileStateDOMS = this.findDOMNode('#profileSate>a');
	    this.updatePasswordDom = this.findDOMNode('#updatePassword');
	
	    this.menuWrap = $('#tab-menu-ctrl');
	    this.menuTpl = $('#menuTpl').text();
	  },
	  ready: function () {
	    this.menuWrap.on('click', this.menuChanged.bind(this));
	    this.initMenu();
	    //  初始化
	    if (imModel.isAnchor()) {
	      this.noopenListView = new NoOpenListView();
	      this.historyListView = new HistoryListView();
	      this.createLiveView = new CreateLiveView();
	    }
	    this.followingView = new FollowingView();
	    this.recordListView = new RecordLiveView();
	
	    var viewName = URL.parse(window.location.href).query.view || '';
	    this.changeView(viewName);
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  /**
	   * 切换菜单
	   */
	  menuChanged: function (e) {
	    var target = $(e.target);
	    if (e.target.tagName === 'A') {
	      target = target.parent();
	    }
	    if (target) {
	      if (target.attr('data-panel') === 'signout') {
	        UIconfirm.show({
	          content: '是否退出',
	          okFn: function () {
	            storage.remove('imSig');
	            // 跳转走人
	            storage.set('signout', 1);
	            window.location.href = '/login.html';
	          }
	        });
	      } else {
	        target.parent().children('li').removeClass('am-active');
	        target.addClass('am-active');
	        $('.tab-content').hide();
	        $('#' + target.attr('data-panel')).show();
	      }
	    }
	  },
	  /**
	   * [liveStateChanged 直播历史与未直播]
	   * @param  {[type]} e [description]
	   * @return {[type]}   [description]
	   */
	  liveStateChanged: function (e) {
	    var target = $(e.currentTarget);
	    var state = target.data('state');
	    this.liveStateDOMS.removeClass('active');
	    target.addClass('active');
	    if (~~state) {
	      this.noListDOM.hide();
	      this.historyDOM.show();
	    } else {
	      this.historyDOM.hide();
	      this.noListDOM.show();
	    }
	  },
	  /**
	   * [profileStateChanged 个人设置]
	   * @param  {[type]} e [description]
	   * @return {[type]}   [description]
	   */
	  profileStateChanged: function (e) {
	    var target = $(e.currentTarget);
	    var state = target.data('state');
	    this.profileStateDOMS.removeClass('active');
	    target.addClass('active');
	    if (~~state) {
	      this.editProfileDOM.hide();
	      this.updatePasswordDom.show();
	    } else {
	      this.editProfileDOM.show();
	      this.updatePasswordDom.hide();
	    }
	  },
	  changeView: function (view) {
	    if (view === 'history') {
	      this.liveStateChanged({
	        currentTarget: $('.myLiveControls').find('[data-state="1"]')
	      });
	    }
	  },
	  /**
	   * 初始化菜单
	   */
	  initMenu: function () {
	    if (imModel.isAnchor()) {
	      this.menuList.list = [
	        {
	          name: '我的直播', pannel: 'tab-my-live', active: true
	        },
	        {
	          name: '创建直播', pannel: 'createLiveVideo'
	        },
	        {
	          name: '观看记录', pannel: 'recordList', active: true
	        },
	        {
	          name: '我的关注', pannel: 'followingList'
	        }
	      ];
	      this.menuList.list.push({
	        name: '个人设置', pannel: 'tabSetting'
	      });
	    } else {
	      this.menuList.list = [
	        {
	          name: '观看记录', pannel: 'recordList', active: true
	        },
	        {
	          name: '我的关注', pannel: 'followingList'
	        }
	      ];
	    }
	    this.menuList.list.push({
	      name: '退出', pannel: 'signout'
	    });
	    if (this.menuTpl) {
	      var html = this.compileHTML(this.menuTpl, this.menuList);
	      this.menuWrap.html(html);
	      this.menuWrap.children(':first').click();
	    }
	  }
	});
	
	module.exports = View;


/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var BaseView = base.View;
	var BusinessDate = __webpack_require__(62);
	var UserModel = __webpack_require__(34);
	var user = UserModel.sharedInstanceUserModel();
	var CreateLiveModel = __webpack_require__(111);
	var ArtistCompleteModel = __webpack_require__(112);
	var lighten;
	var msgBox = __webpack_require__(56);
	var timeImage = __webpack_require__(113);
	
	var View = BaseView.extend({
	  el: '#createLiveVideo',
	  events: { //  监听事件
	    'click #createVideo': 'createVideoHandler',
	    'click .select': 'businessDateToggle',
	    'click .selectDate li': 'selectDateHandler',
	    'keyup #inputActorName': 'actorNameHandler',
	    'blur #inputActorName': 'actorNameBlurHandler',
	    'click #selectorActor li': 'selectorActorHandler',
	    'change #inputActorName': ''
	  },
	  rawLoader: function () {
	    return __webpack_require__(114);
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.actorName = null;
	    this.videoName = null;
	    this.createClick = false;
	    this.createLock = true;
	    this.businessDate = new BusinessDate();
	    this.mapKey = [
	      'year',
	      'month',
	      'day',
	      'hours',
	      'minutes'
	    ];
	    this.createData = {
	      deviceinfo: '{"aid":"30001001"}',
	      roomName: '',
	      roomDesc: '',
	      artistId: '',
	      artistName: '',
	      liveTime: 0,
	      access_token: 'web-' + user.getToken()
	    };
	    this.createDate = {};
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.selectorActor = this.findDOMNode('#selectorActor');
	    this.actorTemp = this.findDOMNode('#selectorActorTemp').html();
	    this.createVideo = this.findDOMNode('#createVideo');
	    this.actorName = this.findDOMNode('#inputActorName');
	    this.videoName = this.findDOMNode('#liveVideoName');
	    this.liveTime = this.findDOMNode('#liveTime');
	    this.liveTimeTemp = this.findDOMNode('#liveTimeTemp').html();
	    this.cellsTemp = this.findDOMNode('#cellsTemp').html();
	    this.hours = this.compileHTML(this.cellsTemp, {
	      cells: this.eachMost(0, 23)
	    });
	    this.minutes = this.compileHTML(this.cellsTemp, {
	      cells: this.eachMost(0, 59)
	    });
	  },
	  ready: function () {
	    //  初始化
	    this.artistModel = new ArtistCompleteModel();
	    this.createModel = new CreateLiveModel();
	    this.initRender();
	    this.initListener();
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  initRender: function () {
	    var data = this.dateDataStructure();
	    var dateHTML = this.compileHTML(this.liveTimeTemp, {
	      items: data, timeImage: timeImage
	    });
	    this.liveTime.html(dateHTML);
	    this.liveTimeUl = this.liveTime.find('.select>ul');
	    this.liveTimeSpan = this.liveTime.find('.date');
	    this.liveLength = this.liveTimeUl.length - 1;
	  },
	  initListener: function () {
	    var self = this;
	    lighten = setInterval(function () {
	      var actor = self.actorName.val();
	      var video = self.videoName.val();
	      if (actor && video) {
	        self.createVideo.removeClass('m_disabled');
	        self.createClick = true;
	      } else {
	        if (actor || video) {
	          self.createVideo.addClass('m_disabled');
	          self.createClick = false;
	        }
	      }
	    }, 0);
	  },
	  dateDataStructure: function () {
	    var data = [];
	    var i = 0;
	    var l = this.mapKey.length;
	    for (; i < l; i++) {
	      var key = this.mapKey[i];
	      var d = {
	        tag: key,
	        cur: this.businessDate.$get(key),
	        style: ''
	      };
	      this.createDate[key] = d.cur;
	      switch (key) {
	        case 'year':
	          d.cells = this.businessDate.ceilYear(0);
	          d.name = '年';
	          break;
	        case 'month':
	          d.cells = this.businessDate.downMonth();
	          d.name = '月';
	          break;
	        case 'day':
	          d.cells = this.businessDate.downDay();
	          d.name = '日';
	          d.division = true;
	          break;
	        case 'hours':
	          d.cells = this.businessDate.downHours();
	          d.name = '时';
	          break;
	        default:
	          d.cells = this.businessDate.downMinutes();
	          d.name = '分';
	          break;
	      }
	      data.push(d);
	    }
	    return data;
	  },
	  businessDateToggle: function (e) {
	    e.stopPropagation();
	    var el = $(e.currentTarget);
	
	    var index = ~~el.data('index');
	    var ul = $(this.liveTimeUl[index]);
	    ul.toggle();
	
	    el.toggleClass('active');
	  },
	  selectDateHandler: function (e) {
	    var el = $(e.currentTarget);
	    var val = el.text();
	    var parent = el.parent();
	    var index = ~~parent.data('index');
	    var tag = parent.data('tag');
	    var span = $(this.liveTimeSpan[index]);
	    var _val = span.text();
	    if (_val === val) {
	      return;
	    }
	    val = ~~val;
	    span.text(val);
	    this.createDate[tag] = val;
	    var start = index + 1;
	    var defaD = 1;
	    var defaHM = 0;
	    var html;
	    var days;
	    var curs;
	    var downs;
	    if (tag === 'month' && val === this.businessDate.$get('month')) {
	      this.businessDate.setCurNewDate();
	      curs = true;
	    }
	    for (; start <= this.liveLength; start++) {
	      var curUl = $(this.liveTimeUl[start]);
	      var curSpan = $(this.liveTimeSpan[start]);
	      var _tag = curUl.data('tag');
	      downs = null;
	      if (curs) {
	        downs = this.businessDate.down(_tag);
	        html = this.compileHTML(this.cellsTemp, {
	          cells: downs
	        });
	        curSpan.text(downs[0]);
	        curUl.html(html);
	        continue;
	      }
	      switch (_tag) {
	        case 'day':
	          days = this.businessDate.getCountDays(val);
	          html = this.compileHTML(this.cellsTemp, {
	            cells: this.eachMost(1, days)
	          });
	          curSpan.text(defaD);
	          curUl.html(html);
	          break;
	        case 'hours':
	          curUl.html(this.hours);
	          curSpan.text(defaHM);
	          break;
	        default:
	          curUl.html(this.minutes);
	          curSpan.text(defaHM);
	          break;
	      }
	    }
	  },
	  eachMost: function (start, end) {
	    var result = [];
	    var _start = start;
	    var _end = end;
	    for (; _start <= _end; _start++) {
	      result.push(_start);
	    }
	    return result;
	  },
	  actorNameHandler: function (e) {
	    var el = $(e.currentTarget);
	    var val = $.trim(el.val());
	    if (!val) {
	      this.selectorActor.empty();
	      return;
	    }
	    var self = this;
	    var promise = this.artistModel.executeJSONP({
	      keyword: val,
	      deviceinfo: '{"aid":"30001001"}'
	    });
	    promise.done(function (response) {
	      var items = response.data.list;
	      self.selectorActor.html(self.compileHTML(self.actorTemp, {
	        items: items
	      }));
	      self.selectorActor.show();
	    });
	    promise.fail(function () {
	      msgBox.showError('输入有误');
	    });
	  },
	  actorNameBlurHandler: function () {
	    //  this.selectorActor.hide();
	  },
	  selectorActorHandler: function (e) {
	    var el = $(e.currentTarget);
	    var inputVal = el.text();
	    this.createData.artistId = ~~el.attr('data-id');
	    this.actorName.val(inputVal);
	    this.selectorActor.hide();
	  },
	  createVideoHandler: function () {
	    var self = this;
	    if (this.createClick && this.createLock) {
	      clearInterval(lighten);
	      var date = new Date();
	      var time = date.getTime() + (1000 * 60 * 60 * 1);
	      this.createLock = false;
	      this.createData.roomName = this.videoName.val();
	      this.createData.artistName = this.actorName.val();
	      this.createData.liveTime = this.businessDate.getTime(this.createDate);
	      if (this.createData.liveTime < time) {
	        msgBox.showError('直播时间至少为一小时之后');
	        this.createLock = true;
	        self.initListener();
	        return;
	      }
	      var promise = this.createModel.executeJSONP(this.createData);
	      promise.done(function (response) {
	        var code = ~~response.code;
	        if (!code) {
	          msgBox.showOK('创建成功');
	          window.location.reload();
	        } else {
	          msgBox.showError(response.msg);
	          self.createLock = true;
	          self.initListener();
	        }
	      });
	      promise.fail(function () {
	        msgBox.showError('创建失败');
	        self.createLock = true;
	        self.initListener();
	      });
	    }
	  }
	});
	
	module.exports = View;


/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	/*
	  deviceinfo={{deviceinfo}}
	  access_token=web-{{access_token}}
	  roomName={{roomName}}
	  roomDesc={{roomDesc}}
	  artistId={{artistId}}
	  liveTime={{liveTime}}
	 */
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/create.json',
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
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	// deviceinfo={{deviceinfo}}&keyword={{keyword}}&offset=100
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/search/artist_autocomplete.json',
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
/* 113 */
/***/ function(module, exports) {

	module.exports = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/7gAOQWRvYmUAZMAAAAAB/9sAhAACAgICAgICAgICAwICAgMEAwICAwQFBAQEBAQFBgUFBQUFBQYGBwcIBwcGCQkKCgkJDAwMDAwMDAwMDAwMDAwMAQMDAwUEBQkGBgkNCwkLDQ8ODg4ODw8MDAwMDA8PDAwMDAwMDwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAWABYDAREAAhEBAxEB/8QAWQABAQEBAAAAAAAAAAAAAAAAAAEICQEBAAAAAAAAAAAAAAAAAAAAABAAAgEEAgMBAAAAAAAAAAAAAQIRAAMEBgUHIUESYREBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A6+UCgUFVirKwiVIIkSPH4aDPeB0vseH2hd2m52zt+VoFoJm8fot3m+ReM4uSbF6618l8S3AZVJ+mn4clVJuhoSfM+5mglAoFB//Z"

/***/ },
/* 114 */
/***/ function(module, exports) {

	module.exports = "<ul>\n\t<li class=\"Inp_name\">\n\t\t<span>*</span>直播名称：\n\t\t<input type=\"text\" maxlength=\"15\" placeholder=\"输入直播名\" id=\"liveVideoName\"><i style=\"margin-left: 16px;\">限15个字以内</i>\n\t</li>\n\t<li class=\"Inp_artist\">\n\t\t<span>*</span>选择艺人：\n\t\t<input type=\"text\" placeholder=\"输入文字\" id=\"inputActorName\">\n\t\t<ul id=\"selectorActor\">\n\t\t\t <script type=\"text/html\" id=\"selectorActorTemp\">\n\t\t\t\t{{each items as item}}\n\t\t\t\t      <li data-id=\"{{item[0]}}\">{{item[1]}}</li>\n\t\t\t\t{{/each}}\n\t\t\t </script>\n\t\t</ul>\n\t</li>\n\t<li class=\"Inp_time\">\n\t\t<div class=\"tit\"><span class=\"redX\">*</span>直播时间：</div>\n\t\t<div id=\"liveTime\">\n\t\t\t<script type=\"text/html\" id=\"liveTimeTemp\">\n\t\t\t\t{{each items as item i}}\n\t\t\t\t\t<div class=\"select\" style=\"{{item.style}}\" data-index=\"{{i}}\">\n\t\t\t\t\t\t<span class=\"date\">{{item.cur}}</span>\n\t\t\t\t\t\t<!--<img src=\"{{timeImage}}\" alt=\"\" >-->\n\t\t\t\t\t\t<span class=\"split\"></span>\n\t\t\t\t\t\t<span class=\"arrowDownOuter\"></span>\n\t\t\t\t\t\t<ul class=\"selectDate\" data-index=\"{{i}}\" data-tag=\"{{item.tag}}\">\n\t\t\t\t\t\t\t{{each item.cells as cell}}\n\t\t\t\t\t\t\t\t<li>{{cell}}</li>\n\t\t\t\t\t\t\t{{/each}}\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</div>\n\t\t\t\t\t<em>{{item.name}}</em>\n\t\t\t\t\t<!--{{if item.division}}-->\n\t\t\t\t\t\t<!--<br/>-->\n\t\t\t\t\t<!--{{/if}}-->\n\t\t\t\t{{/each}}\n\t\t\t</script>\n\t\t\t<script type=\"text/html\" id=\"cellsTemp\">\n\t\t\t\t{{each cells as cell}}\n\t\t\t\t\t<li>{{cell}}</li>\n\t\t\t\t{{/each}}\n\t\t\t</script>\n\t\t</div>\n\n\t</li>\n\t<!--<div class=\"submit m_disabled\" id=\"createVideo\">创建</div>-->\n</ul>\n<div class=\"button-wrap\">\n\t<button class=\"submit am-btn am-btn-red am-center boderRadAll_3\" id=\"createVideo\">创建</button>\n</div>\n"

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var BaseView = base.View;
	
	var NoOpenListModel = __webpack_require__(116);
	var ReleaseModel = __webpack_require__(117);
	var RemoveModel = __webpack_require__(118);
	var SaveCoverImageModel = __webpack_require__(119);
	// var NoOpenPageBoxView = require('./page-box.view');
	var UserModel = __webpack_require__(34);
	var user = UserModel.sharedInstanceUserModel();
	
	var msgBox = __webpack_require__(56);
	var confirm = __webpack_require__(45);
	var UploadFileDialog = __webpack_require__(53);
	var BusinessDate = __webpack_require__(62);
	var businessDate = new BusinessDate();
	var Pagenation = __webpack_require__(120);
	
	var View = BaseView.extend({
	  el: '#noOpenContent',
	  events: {
	    'click button': 'checkLiveVideoHandler',
	    'click .uploadImage': 'editCoverImageHandler',
	    'click .copy-video-url': 'copyUrlHandler',
	    'click .copy-video-name': 'copyNameHandler'
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.listTemp = __webpack_require__(121);
	    this.liTemp = __webpack_require__(122);
	    this.noOpenParameter = {
	      deviceinfo: '{"aid":"30001001"}',
	      order: 'time',
	      offset: 0,
	      size: 6,
	      access_token: user.getWebToken()
	    };
	    this.removeParameter = {
	      deviceinfo: '{"aid":"30001001"}',
	      roomId: '',
	      access_token: user.getWebToken()
	    };
	    this.releaseParameter = {
	      deviceinfo: '{"aid":"30001001"}',
	      roomId: '',
	      access_token: user.getWebToken()
	    };
	    this.saveCoverParameter = {
	      deviceinfo: '{"aid":"30001001"}',
	      access_token: user.getWebToken(),
	      roomId: '',
	      posterUrl: ''
	    };
	    this.removeLock = true;
	    this.releaseLock = true;
	    this.liCache = null;
	    this.imagePath = '';
	    this.upload = null;
	    this.singleLiDOM = null;
	    this.uploadState = false;
	    this.noOpenModel = new NoOpenListModel();
	    this.releaseModel = new ReleaseModel();
	    this.removeModel = new RemoveModel();
	    this.saveCoverModel = new SaveCoverImageModel();
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	  },
	  ready: function () {
	    //  初始化
	    var self = this;
	    var fileOptions = {
	      width: 580,
	      height: 341,
	      isRemoveAfterHide: false,
	      isAutoShow: false,
	      mainClass: 'shadow_screen_x',
	      closeClass: 'editor_bg_close_x',
	      closeText: 'X',
	      title: '封面设置',
	      ctrlData: {
	        cmd: [{
	          saveOriginal: 1,
	          op: 'save',
	          plan: 'avatar',
	          belongId: '20634338',
	          srcImg: 'img'
	        }],
	        redirect: 'http://' + window.location.host + '/cross-url/upload.html'
	      },
	      uploadFileSuccess: function (response) {
	        //  上传成功
	        self.uploadImageHandler(response);
	        self.uploadState = true;
	      },
	      saveFile: function () {
	        //  保存
	        if (self.uploadState) {
	          self.saveCoverImage();
	        } else {
	          msgBox.showTip('正在上传，请等待');
	        }
	      }
	    };
	    this.upload = new UploadFileDialog(fileOptions);
	    this.getPageList(1);
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  /**
	   * 获取分页数据
	   */
	  getPageList: function (page) {
	    var self = this;
	    this.noOpenParameter = $.extend(this.noOpenParameter, {
	      offset: this.noOpenParameter.size * (page - 1)
	    });
	    var promise = this.noOpenModel.executeJSONP(this.noOpenParameter);
	    promise.done(function (response) {
	      var data = response.data;
	      var roomList = data.roomList || [];
	      if (!self.totalCount && data.totalCount) {
	        self.totalCount = data.totalCount;
	        self.initPageBox(data.totalCount);
	      }
	      self.initRender(roomList);
	    });
	    promise.fail(function () {
	      msgBox.showError('获取未直播列表：第1页失败');
	    });
	  },
	  initPageBox: function (total) {
	    var self = this;
	    this.pagingBox = Pagenation.create('#noOpenPageBox', {
	      total: total,
	      perpage: this.noOpenParameter.size,
	      onSelect: function (page) {
	        self.getPageList(page);
	      }
	    });
	  },
	  //  分页渲染，以及缓存li
	  initRender: function (items) {
	    var html = '';
	    if (items && items.length) {
	      html = this.compileHTML(this.listTemp, {
	        items: items
	      });
	    } else {
	      html = '<h1>暂无数据</h1>';
	    }
	    this.$el.html(html);
	    this.liCache = null;
	    this.liCache = {};
	    var lis = this.$el.find('.item');
	    var i = 0;
	    var l = lis.length;
	    for (; i < l; i++) {
	      var li = $(lis[i]);
	      var key = li.attr('data-key');
	      this.liCache[key] = li;
	    }
	  },
	  //  点击发布或删除时的处理
	  checkLiveVideoHandler: function (e) {
	    var self = this;
	    var span = $(e.target);
	    var el = span.parents('.item');
	    var state = span.data('state');
	    var id = el.attr('data-id');
	    var postImg = el.attr('data-img');
	    switch (state) {
	      case 2: //  发布
	        self.publishLiveShow(id, span, postImg);
	        break;
	      case 3: //  删除
	        if (this.removeLock) {
	          confirm.show({
	            content: '是否确认删除',
	            okFn: function () {
	              self.removeLock = false;
	              self.removeParameter.roomId = id;
	              var promise = self.removeModel.executeJSONP(self.removeParameter);
	              promise.done(function () {
	                self.removeLock = true;
	                msgBox.showOK('删除成功');
	                el.remove();
	              });
	              promise.fail(function () {
	                self.removeLock = true;
	                msgBox.showError('删除失败');
	              });
	            }
	          });
	        }
	        break;
	      default:
	    }
	  },
	  isTooLate: function (time) {
	    var currentTime = new Date();
	    var timeSpan = time - currentTime.getTime();
	    var hour = Number(BusinessDate.difference(Math.abs(timeSpan)).hours);
	    if (timeSpan < 0 && hour >= 1) {
	      return true;
	    }
	    return false;
	  },
	  // 发布直播
	  publishLiveShow: function (id, span, postImg) {
	    var self = this;
	    var time = span.parents('.item').attr('data-liveTime');
	    if (span.attr('class') === 'disable') {
	      return;
	    }
	    if (self.isTooLate(time)) {
	      msgBox.showTip('您已经迟到超过一小时，无法再进行本场直播了');
	      return;
	    }
	    if (this.releaseLock && postImg) {
	      this.releaseLock = false;
	      this.releaseParameter.roomId = id;
	      var promise = this.releaseModel.executeJSONP(this.releaseParameter);
	      promise.done(function (response) {
	        self.releaseLock = true;
	        span.addClass('disable');
	        msgBox.showOK('发布成功');
	        var item = response.data;
	        item.liCacheKey = item.id + '-' + item.streamName;
	        item.liveVideoTime = self.forMatterDate(item.liveTime);
	        item.lookUrl = '/anchor.html?roomId=' + item.id;
	        self.liRender(item);
	      });
	      promise.fail(function () {
	        self.releaseLock = true;
	        msgBox.showError('发布失败');
	      });
	    } else {
	      msgBox.showError('发布失败，请上传封面');
	    }
	  },
	  //  点击编辑封面
	  editCoverImageHandler: function (e) {
	    var el = $(e.currentTarget);
	    if (el.hasClass('uploadImageWrap')) {
	      el.append('<img class="uploadImage cover-image">');
	    }
	    var attrs = null;
	    var posterpic = el.attr('data-posterpic');
	    if (this.upload) {
	      this.currentLiveItem = $(el.parents('.item'));
	      this.singleLiDOM = this.currentLiveItem;
	      this.saveCoverParameter.roomId = this.singleLiDOM.data('id');
	      this.upload.emptyValue();
	      if (posterpic) {
	        var img = el.find('.cover-image');
	
	        attrs = {
	          breviaryUrl: img.attr('src'),
	          inputText: '编辑图片'
	        };
	      }
	      this.upload.show(attrs);
	    }
	  },
	  //  上传成功之后处理image 地址
	  uploadImageHandler: function (response) {
	    var result = this.upload.parseErrorMsg(response);
	
	    if (result === true) {
	      var images = response.images;
	      this.imagePath = images[0].path;
	      if (this.currentLiveItem) {
	        this.currentLiveItem.attr('data-img', images[0].path || '');
	      }
	    } else {
	      msgBox.showTip(result);
	    }
	  },
	  // 点击保存之后的处理
	  saveCoverImage: function () {
	    var self = this;
	    this.saveCoverParameter.posterUrl = this.imagePath;
	    var promise = this.saveCoverModel.executeJSONP(this.saveCoverParameter);
	    promise.done(function (response) {
	      var code = ~~response.code;
	      if (!code) {
	        var coverImageDOM = self.singleLiDOM.find('.cover-image');
	        coverImageDOM.attr('src', self.imagePath);
	        self.singleLiDOM = null;
	        msgBox.showOK('保存成功');
	        self.upload.hide();
	        self.uploadState = false;
	        self.currentLiveItem.find('[data-state="2"]').removeClass('disabled');
	      }
	    });
	    promise.fail(function () {
	      msgBox.showError('保存失败');
	    });
	  },
	  // 格式化时间
	  forMatterDate: function (time) {
	    businessDate.setCurNewDate(time);
	    var year = businessDate.$get('year');
	    var month = businessDate.$get('month');
	    var day = businessDate.$get('day');
	    var _hours = businessDate.$get('hours');
	    var hours = _hours < 10 ? '0' + _hours : _hours;
	    var _minutes = businessDate.$get('minutes');
	    var minutes = _minutes < 10 ? '0' + _minutes : _minutes;
	    return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
	  },
	  // 发布时，重新渲染li
	  liRender: function (item) {
	    var html = this.compileHTML(this.liTemp, {
	      item: item
	    });
	    var li = this.liCache[item.liCacheKey];
	    li.html(html);
	  },
	  copyUrlHandler: function (e) {
	    e.preventDefault();
	    var el = $(e.currentTarget);
	    var value = el.attr('data-value');
	    if (!value.length) {
	      msgBox.showTip('开启直播后生成视频地址');
	      return;
	    }
	    this.clipboard(value);
	  },
	  copyNameHandler: function (e) {
	    e.preventDefault();
	    var el = $(e.currentTarget);
	    var value = el.attr('data-value');
	    this.clipboard(value);
	  },
	  clipboard: function (value) {
	    if (window.clipboardData) {
	      window.clipboardData.clearData('text');
	      window.clipboardData.setData('text', value);
	      msgBox.showOK('复制成功');
	    } else {
	      msgBox.showTip('你浏览器的js不支持剪贴板，无法调用');
	    }
	  }
	});
	
	module.exports = View;


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var BusinessDate = __webpack_require__(62);
	var businessDate = new BusinessDate();
	// var posterPicImage = require('../../../images/aP-list-ad.jpg');
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/no_open_list.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix).split('?')[0];
	    }
	  },
	  formatter: function (response) {
	    var code = ~~response.code;
	    if (code) {
	      return response;
	    }
	    var data = response.data;
	    var roomList = data.roomList;
	    var l = 	roomList.length;
	    while (l--) {
	      var value = roomList[l];
	      var liveTime = value.liveTime;
	      businessDate.setCurNewDate(liveTime);
	      var year = businessDate.$get('year');
	      var month = businessDate.$get('month');
	      var day = businessDate.$get('day');
	      var _hours = businessDate.$get('hours');
	      var hours = _hours < 10 ? '0' + _hours : _hours;
	      var _minutes = businessDate.$get('minutes');
	      var minutes = _minutes < 10 ? '0' + _minutes : _minutes;
	      value.liveVideoTime = year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
	      value.lookUrl = '/anchor.html?roomId=' + value.id;
	      value.liCacheKey = value.id + '-' + value.streamName;
	      if (!value.posterPic) {
	        // value.posterPic = posterPicImage;
	      }
	    }
	    return response;
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
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/show.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix).split('?')[0];
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
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/del.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix).split('?')[0];
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
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/pp_set.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix).split('?')[0];
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
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	/**
	基于分页控件，封装通用部分
	*/
	
	var $ = __webpack_require__(1);
	
	var pagenation = {
	  /*
	  ops = {
	    total: 总页数,
	    perpage: 每页条数,
	    onSelect: function(page){}
	  }
	  */
	  create: function (el, ops) {
	    var setting = $.extend({
	      total: 1,
	      perpage: 10,
	      onSelect: null,
	      change: null
	    }, ops);
	    return $(el).change(function () {
	      if (setting.change) {
	        setting.change();
	      }
	    }).paging(setting.total, {
	      format: '[ < .(qq -) nncnn (- pp)> ] ',
	      page: 1,
	      perpage: setting.perpage,
	      onFormat: function (type) {
	        switch (type) {
	          case 'block':
	            if (!this.active) {
	              return '<span>' + this.value + '</span>';
	            } else if (this.value !== this.page) {
	              return '<a href="#' + this.value + '">' + this.value + '</a>';
	            }
	            return '<span class="current ">' + this.value + '</span>';
	          case 'next':
	            if (this.active) {
	              return '<a href="#' + this.value + '" class="next ">&gt;</a>';
	            }
	            return '<span style="cursor:no-drop" >&gt;</span>';
	          case 'prev':
	            if (this.active) {
	              return '<a href="#' + this.value + '" class="prev ">&lt;</a>';
	            }
	            return '<span style="cursor:no-drop">&lt;</span>';
	          case 'fill':
	            if (this.active) {
	              return '<span>...</span>';
	            }
	            return '';
	          default:
	            return '';
	        }
	      },
	      onSelect: function (page) {
	        console.log('onSelect=======', this);
	        if (setting.onSelect && this.isFinished) {
	          setting.onSelect(page);
	        }
	      }
	    });
	  }
	};
	
	module.exports = {
	  create: pagenation.create
	};


/***/ },
/* 121 */
/***/ function(module, exports) {

	module.exports = "{{each items as item}}\n<div class=\"item am-g am-g-collapse am-margin-top am-margin-bottom am-padding-bottom\" data-id=\"{{item.id}}\"\n     data-key=\"{{item.liCacheKey}}\" data-img=\"{{item.posterPic}}\" data-liveTime=\"{{item.liveTime}}\">\n    <div class=\"am-u-sm-3 img am-margin-right uploadImage uploadImageWrap\">\n        {{if item.posterPic}}\n        <img src=\"{{item.posterPic}}\" alt=\"\" class=\"uploadImage cover-image\">\n        {{/if}}\n    </div>\n    <div class=\"am-u-sm-9\">\n        <div class=\"room-title\">{{item.roomName}}</div>\n        <div class=\"time\"><span class=\"tip am-margin-right-sm\">直播时间</span><span\n                class=\"value date\">{{item.liveVideoTime}}</span>\n        </div>\n        <div class=\"viedo\">\n            <span class=\"tip am-margin-right-sm\">视频连接</span>\n            <span class=\"value\">{{item.livePushStreamUrl}}</span>\n            <a href=\"javascript:;\" class=\"copy am-margin-left-xl copy-video-url\" data-value=\"{{item.livePushStreamUrl}}\">复制</a>\n        </div>\n        <div class=\"viedo\">\n            <span class=\"tip am-margin-right-sm\">视频流</span>\n            <span class=\"value\">{{item.streamName}}</span>\n            <a href=\"javascript:;\" class=\"copy am-margin-left-xl copy-video-name\" data-value=\"{{item.streamName}}\">复制</a>\n        </div>\n        <div class=\"btn-wrap\">\n            <a href=\"{{item.lookUrl}}\" class=\"am-btn am-btn-red boderRadAll_3\">查看</a>\n            {{if item.status === 1}}\n            <button class=\"am-btn am-btn-red boderRadAll_3 disabled\">已发布</button>\n            {{else if item.status == 2}}\n            <button class=\"am-btn am-btn-red boderRadAll_3 disabled\">直播中</button>\n            {{else if item.status == 0}}\n                {{if item.posterPic.length > 0}}\n                <button data-state=\"2\" class=\"am-btn am-btn-red boderRadAll_3\">发布</button>\n                {{else}}\n                <button data-state=\"2\" class=\"am-btn am-btn-red boderRadAll_3 disabled\">发布</button>\n                {{/if}}\n            <button data-state=\"3\" class=\"am-btn am-btn-red boderRadAll_3\">删除</button>\n            {{/if}}\n        </div>\n    </div>\n</div>\n{{/each}}\n"

/***/ },
/* 122 */
/***/ function(module, exports) {

	module.exports = "<!--<div class=\"uploadAd fl uploadImage\"data-posterPic=\"{{if item.posterPic}}1{{/if}}\"  data-liveTime=\"{{item.liveTime}}\">-->\n  <!--<img src=\"{{item.posterPic}}\" alt=\"\" class=\"cover-image\">-->\n<!--</div>-->\n<!--<dl class=\"preLiveMsg fl\">-->\n  <!--<dt>{{item.roomName}}</dt>-->\n  <!--<dd>直播时间：<span>{{item.liveVideoTime}}</span></dd>-->\n  <!--<dd>-->\n    <!--<h4 class=\"tit\">视频连接：</h4>-->\n    <!--<div>-->\n      <!--<span>{{item.livePushStreamUrl}}</span>-->\n      <!--<a href=\"\" class=\"copy copy-video-url\" data-value=\"{{item.livePushStreamUrl}}\">复制</a>-->\n    <!--</div>-->\n  <!--</dd>-->\n  <!--<dd>-->\n    <!--<h4 class=\"tit\">视频流：</h4>-->\n    <!--<div>-->\n      <!--<span>{{item.streamName}}</span>-->\n      <!--<a href=\"\" class=\"copy copy-video-name\" data-value=\"{{item.streamName}}\">复制</a>-->\n    <!--</div>-->\n  <!--</dd>-->\n  <!--<dd class=\"ctl\">-->\n    <!--<a href=\"{{item.lookUrl}}\">查看</a>-->\n    <!--{{if item.status === 1}}-->\n    \t<!--<span class=\"disable\" data-state=\"2\">已发布</span>-->\n    <!--{{else }}-->\n    \t<!--{{if item.status === 0}}-->\n    \t\t<!--<span  data-state=\"2\">发布</span>-->\n      <!--{{/if}}-->\n    <!--{{/if}}-->\n    <!--{{if item.status === 0}}-->\n        <!--<span data-state=\"3\">删除</span>-->\n    <!--{{/if}}-->\n  <!--</dd>-->\n<!--</dl>-->\n<div class=\"item am-g am-g-collapse am-margin-top am-margin-bottom am-padding-bottom\"\n     data-key=\"{{item.liCacheKey}}\" data-img=\"{{item.posterPic}}\" data-liveTime=\"{{item.liveTime}}\">\n  <div class=\"am-u-sm-3 img am-margin-right\">\n    {{if item.posterPic}}\n    <img src=\"{{item.posterPic}}\" alt=\"\" class=\"uploadImage cover-image\">\n    {{/if}}\n  </div>\n  <div class=\"am-u-sm-9\">\n    <div class=\"room-title\">{{item.roomName}}</div>\n    <div class=\"time\"><span class=\"tip am-margin-right-sm\">直播时间</span><span\n            class=\"value date\">{{item.liveVideoTime}}</span>\n    </div>\n    <div class=\"viedo\">\n      <span class=\"tip am-margin-right-sm\">视频连接</span>\n      <span class=\"value\">{{item.livePushStreamUrl}}</span>\n      <a href=\"javascript:;\" class=\"copy am-margin-left-xl copy-video-url\" data-value=\"{{item.livePushStreamUrl}}\">复制</a>\n    </div>\n    <div class=\"viedo\">\n      <span class=\"tip am-margin-right-sm\">视频流</span>\n      <span class=\"value\">{{item.streamName}}</span>\n      <a href=\"javascript:;\" class=\"copy am-margin-left-xl copy-video-name\" data-value=\"{{item.streamName}}\">复制</a>\n    </div>\n    <div class=\"btn-wrap\">\n      <a href=\"{{item.lookUrl}}\" class=\"am-btn am-btn-red boderRadAll_3\">查看</a>\n      {{if item.status === 1}}\n      <button class=\"am-btn am-btn-red boderRadAll_3 disabled\">已发布</button>\n      {{else if item.status == 2}}\n      <button class=\"am-btn am-btn-red boderRadAll_3 disabled\">直播中</button>\n      {{else if item.status == 0}}\n      <button data-state=\"2\" class=\"am-btn am-btn-red boderRadAll_3\">发布</button>\n      <button data-state=\"3\" class=\"am-btn am-btn-red boderRadAll_3\">删除</button>\n      {{/if}}\n    </div>\n  </div>\n</div>"

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 历史直播
	 */
	'use strict';
	
	var base = __webpack_require__(18);
	var BaseView = base.View;
	var HistoryListModel = __webpack_require__(124);
	// var NoOpenPageBoxView = require('./page-box.view');
	var UserModel = __webpack_require__(34);
	var user = UserModel.sharedInstanceUserModel();
	var easyImage = __webpack_require__(125);
	var yunImage = __webpack_require__(126);
	var loveImage = __webpack_require__(127);
	var Pagenation = __webpack_require__(120);
	
	var View = BaseView.extend({
	  el: '#historyContent',
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    var token = user.getToken();
	    this.listTemp = __webpack_require__(128);
	    this.historyParameter = {
	      deviceinfo: '{"aid":"30001001"}',
	      order: 'time',
	      offset: 0,
	      size: 6,
	      access_token: 'web-' + token
	    };
	    this.historyModel = new HistoryListModel();
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	  },
	  ready: function () {
	    //  初始化
	    // var self = this;
	    // var promise = this.historyModel.executeJSONP(this.historyParameter);
	    // promise.done(function (response) {
	    //   var data = response.data;
	    //   var roomList = data.roomList || [];
	    //   var count = Math.ceil(data.totalCount / self.historyParameter.size);
	    //   if (count > 1) {
	    //     self.initPageBox({
	    //       offset: self.historyParameter.offset,
	    //       size: self.historyParameter.size,
	    //       count: count
	    //     });
	    //   }
	    //   self.initRender(roomList);
	    // });
	    // promise.fail(function () {});
	    this.getPageList(1);
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  getPageList: function (page) {
	    var self = this;
	    this.historyParameter = $.extend(this.historyParameter, {
	      offset: this.historyParameter.size * (page - 1)
	    });
	    var promise = this.historyModel.executeJSONP(this.historyParameter);
	    promise.done(function (response) {
	      var data = response.data;
	      var roomList = data.roomList || [];
	      // var count = Math.ceil(data.totalCount / self.historyParameter.size);
	      // if (count > 1) {
	      //   self.initPageBox({
	      //     offset: self.historyParameter.offset,
	      //     size: self.historyParameter.size,
	      //     count: count
	      //   });
	      // }
	      if (!self.totalCount && data.totalCount) {
	        self.totalCount = data.totalCount;
	        self.initPageBox(data.totalCount);
	      }
	      self.initRender(roomList);
	    });
	    promise.fail(function () {});
	  },
	  initPageBox: function (total) {
	    var self = this;
	    this.pagingBox = Pagenation.create('#historyPageBox', {
	      total: total || 1,
	      perpage: self.historyParameter.size,
	      onSelect: function (page) {
	        self.getPageList(page);
	      }
	    });
	    // this.pageBoxView = new NoOpenPageBoxView({
	    //   el: '#historyPageBox',
	    //   props: prop,
	    //   listModel: this.historyModel,
	    //   listRender: function (response) {
	    //     var data = response.data;
	    //     var roomList = data.roomList;
	    //     self.initRender(roomList);
	    //   }
	    // });
	  },
	  initRender: function (items) {
	    var html = '';
	    if (items.length) {
	      html = this.compileHTML(this.listTemp, {
	        items: items,
	        easyImage: easyImage,
	        yunImage: yunImage,
	        loveImage: loveImage
	      });
	    } else {
	      html = '<h1>暂无数据</h1>';
	    }
	    this.$el.html(html);
	  }
	});
	
	module.exports = View;


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var BusinessDate = __webpack_require__(62);
	var businessDate = new BusinessDate();
	/*
	  deviceinfo={{deviceinfo}}
	  access_token=web-{{access_token}}
	  order={{order}}
	  offset={{offset}}
	  size={{size}}
	 */
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/end_list.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  },
	  formatter: function (response) {
	    //  formatter方法可以格式化数据
	    var code = ~~response.code;
	    if (code) {
	      return response;
	    }
	    var data = response.data;
	    var roomList = data.roomList;
	    var l = roomList.length;
	    while (l--) {
	      var value = roomList[l];
	      var d = BusinessDate.difference(value.duration > 0 ? value.duration : 0);
	      value.diff = d.hours + ':' + d.minutes + ':' + d.seconds;
	      var liveTime = value.liveTime;
	      businessDate.setCurNewDate(liveTime);
	      var year = businessDate.$get('year');
	      var month = businessDate.$get('month');
	      var day = businessDate.$get('day');
	      var _hours = businessDate.$get('hours');
	      var hours = _hours < 10 ? '0' + _hours : _hours;
	      var _minutes = businessDate.$get('minutes');
	      var minutes = _minutes < 10 ? '0' + _minutes : _minutes;
	      value.liveVideoTime = year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
	    }
	    return response;
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
/* 125 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAYAAABr5z2BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE2NzMwMDc4RTRGOTExRTU5NDBGRTZFREJDRURGODZDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjE2NzMwMDc5RTRGOTExRTU5NDBGRTZFREJDRURGODZDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTY3MzAwNzZFNEY5MTFFNTk0MEZFNkVEQkNFREY4NkMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTY3MzAwNzdFNEY5MTFFNTk0MEZFNkVEQkNFREY4NkMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6IZhTIAAABJElEQVR42mzSP0sDQRCH4Us8YqEi+RbRtCZgYyUosYoogUAgdmphITb+qyTYaKtYRwSb2KiXiJXYqLV+DQmciBHFd+F3Miy38MDt7Mywe7thFEWBN8pYxQR+FBvCG87wbJND8z2KU+RwhBevcQlbGGANsQtmtTiOLq5QSykOFKspp6ua/wZtHKCjeQb7eJIV06ij3HbSoI5X9EzSOsYwjRlUMGvWe6qph0queNtdwhx+8YVd7OHe5BziNhukD/fXv838A8Npia7BCba9+AOaZr6Bay9nx9W6BhcoasvJaOlYd3jU1Z6bdZc76WqTd9DADUb0lz+xjLyOEpviRWxiwV5jH/Oo4hJTir+b4pLWqsrt+y8x1k7KupmCbsE+5WP/Kf8JMACpIT+1f6oZ9AAAAABJRU5ErkJggg=="

/***/ },
/* 126 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkVCNzg1M0VERTRGODExRTVCNEQxRTQ3MzA5QTVGQTNDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkVCNzg1M0VFRTRGODExRTVCNEQxRTQ3MzA5QTVGQTNDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RUI3ODUzRUJFNEY4MTFFNUI0RDFFNDczMDlBNUZBM0MiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RUI3ODUzRUNFNEY4MTFFNUI0RDFFNDczMDlBNUZBM0MiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6hXiNDAAABEElEQVR42pzSsUtCURTH8eejIUMCIbSlJpdqMQjHpsApktwawqW5oKFAa4mooabISRwiKJDe1Bw0tSS4VH9CQ0GTBVnR98Dvxg2C1AMfHlzu79x7eScWRVHgVRIbmMUQBrT+gVdc4RAvLhB64XXcYRpnKCEnJa3NaM+qC7kTdlBBEb+upGrJERZxgRFsWYM5hSfxEPxfdsCUbnJtT9jDcZdhV/eoWjbUVU6C3usUKWsQw1cfDTr4tAZvmO+jQQFta7AtqR7CaZSxaw0aqOEWE12Es3jUXJy7QVrBmFiNY9ALxbGAOi5xgCV/kPbxjFFtyGh0Q29i3/Xv8/r+TOIw1vCEZTSxiYRYtXHz13u+BRgAuDI2qXfFdIkAAAAASUVORK5CYII="

/***/ },
/* 127 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkYzODk0M0VBRTRGODExRTU4RUU2RDkyMzlGRDA5RTc3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkYzODk0M0VCRTRGODExRTU4RUU2RDkyMzlGRDA5RTc3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RjM4OTQzRThFNEY4MTFFNThFRTZEOTIzOUZEMDlFNzciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RjM4OTQzRTlFNEY4MTFFNThFRTZEOTIzOUZEMDlFNzciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kyn92AAABGElEQVR42pzSv0sCcRjH8e8dDkoN0eYm2NCPMaQpSCGElqAtbW5pLCJcWkpEaKkhCPoHHE6krZamqCBwaHBwSgQ35yCs9wMf6UsYcT3wOu7u+T7P3fdHEEWRU1SwiU8kYImql9vCBwK0xrmEBtxhHsfoYBn7WFV+AWd4wZLG5bFuDerIYRYjFTzgAvd6zrjvsNw1hji1BmWUvGI/1tzksLE7uAq5mCcXPx6digPNP25YzcgaDLD9jwY2hUGo7djDdIziGezixBo0tLLPMRq0cYtmqBcFTGnbkn98+VX3xfEiWrwjixTesPHLnPvoaazzT6LTMV3Bke0vuqjpzw6RxgEu/a7hhC9Z0aLOxrktFG4w97PY4kuAAQCicDS4f8rDTAAAAABJRU5ErkJggg=="

/***/ },
/* 128 */
/***/ function(module, exports) {

	module.exports = "{{each items as item}}\n\n<div data-id=\"{{item.roomId}}\" class=\"item am-g am-g-collapse am-margin-top am-margin-bottom am-padding-bottom\">\n    <div class=\"am-u-sm-3 img am-margin-right\">\n        <img src=\"{{item.posterPic}}\">\n    </div>\n    <div class=\"am-u-sm-9\">\n        <div class=\"room-title\">{{item.roomName}}</div>\n        <div class=\"time\"><span class=\"tip am-margin-right-sm\">时长</span><span\n                class=\"value date\">{{item.diff}}</span>\n        </div>\n        <div class=\"number\">\n            <div class=\"num\"><i class=\"icons view\"></i><span>{{item.seen}}</span></div>\n            <div class=\"num\"><i class=\"icons chat\"></i><span>{{item.bulletCurtain}}</span></div>\n            <div class=\"num\"><i class=\"icons like\"></i><span>{{item.assemble}}</span></div>\n        </div>\n        <div class=\"info\"><span class=\"tip am-margin-right-sm\">人气:</span><span\n                class=\"value\">{{item.popularity}}</span></div>\n    </div>\n</div>\n\n{{/each}}\n"

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 观看记录
	 * Created by AaronYuan on 5/4/16.
	 */
	
	'use strict';
	
	var base = __webpack_require__(18);
	var BaseView = base.View; // View的基类
	var DateTime = __webpack_require__(62);
	var _ = __webpack_require__(35);
	
	var UserModel = __webpack_require__(34);
	var user = UserModel.sharedInstanceUserModel();
	var WatchRecordModel = __webpack_require__(130);
	
	var Pagenation = __webpack_require__(120);
	
	var View = BaseView.extend({
	  el: '#recordList', // 设置View对象作用于的根元素，比如id
	  rawLoader: function () { // 可用此方法返回字符串模版
	    return __webpack_require__(131);
	  },
	  events: { // 监听事件
	
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	    this.watchRecordModel = WatchRecordModel.sharedInstanceModel();
	
	    this.perpage = 6;
	
	    this.params = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken(),
	      size: this.perpage,
	      offset: 0
	    };
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    this.recordTpl = this.$el.find('#recordTpl').text();
	
	    this.recordList = this.$el.find('#recordList');
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function () {
	    this.getPageList(1);
	    // this.initPagination();
	  },
	  initPagination: function (total) {
	    var self = this;
	
	    self.pageing = Pagenation.create('#page-wrap', {
	      total: total || 1,
	      perpage: self.perpage,
	      onSelect: function (page) {
	        self.getPageList(page);
	      },
	      change: function () {
	        alert(2);
	      }
	    });
	  },
	  getPageList: function (page) {
	    var self = this;
	    this.params.offset = (page - 1) * this.perpage;
	    var promise = self.watchRecordModel.executeJSONP(this.params);
	    promise.done(function (res) {
	      self.renderList(res);
	      if (!self.totalCount && res.data.totalCount) {
	        self.totalCount = res.data.totalCount;
	        self.initPagination(self.totalCount);
	        // self.pageing.setNumber(self.totalCount);
	        // self.pageing.setPage();
	      }
	    });
	    promise.fail(function () {
	      // self.pageing.setNumber(1);
	      // self.pageing.setPage();
	    });
	  },
	  renderList: function (data) {
	    var result = this.formatData(data);
	    var html = this.compileHTML(this.recordTpl, result);
	    this.recordList.html(html);
	  },
	  formatData: function (data) {
	    if (data) {
	      _.each(data.data.rooms, function (item) {
	        var curItem = item;
	        if (item.startTime) {
	          var time = new Date(item.startTime);
	          curItem.startTimeTxt = DateTime.format(time, 'yyyy/MM/dd');
	        }
	        var result = DateTime.difference(item.duration);
	        curItem.durationTxt = result.hours + ':' + result.minutes + ':' + result.seconds;
	      });
	    }
	    return data;
	  }
	});
	
	
	module.exports = View;


/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/history/room/list.json',
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
/* 131 */
/***/ function(module, exports) {

	module.exports = "<div class=\"record-wrap has-top-space\">\n    <div id=\"recordList\">\n        加载中...\n    </div>\n    <!---->\n    <script type=\"text/x-template\" id=\"recordTpl\">\n        <!--<div class=\"item\">-->\n            <!--<div class=\"line\">-->\n                <!--<span class=\"point\"></span>-->\n                <!--<span class=\"date\">item.startTimeTxt</span>-->\n            <!--</div>-->\n            <!--<div class=\"content\">-->\n                <!--<a href=\"###\" class=\"img-wrap Left\">-->\n                    <!--<img src=\"http://img4.yytcdn.com/video/mv/140924/2140901/EDF20148A55BEBE8677061256232492F_640x360.jpg\" onerror=\"\"-->\n                         <!--alt=\"\">-->\n                    <!--<div class=\"play\"></div>-->\n                <!--</a>-->\n                <!--<div class=\"info-wrap Left\">-->\n                    <!--<div class=\"item-title\">item.roomName</div>-->\n                    <!--<div class=\"time\">时长: <span class=\"\">item.durationTxt</span></div>-->\n                    <!--<div class=\"anchor\">-->\n                        <!--<img src=\"http://img4.yytcdn.com/video/mv/140924/2140901/EDF20148A55BEBE8677061256232492F_640x360.jpg\" onerror=\"\" alt=\"\">-->\n                        <!--<a class=\"name\" href=\"##\">item.creator.nickName</a>-->\n                    <!--</div>-->\n                <!--</div>-->\n                <!--<div class=\"Clear\"></div>-->\n            <!--</div>-->\n            <!--<div class=\"icon-list\">-->\n                <!--<span class=\"view\">2334</span>-->\n                <!--<span class=\"chat\">34</span>-->\n                <!--<span class=\"like\">3242</span>-->\n                <!--<span class=\"hot\">34</span>-->\n            <!--</div>-->\n        <!--</div>-->\n        {{each data.rooms as item}}\n        <div class=\"item\">\n            <div class=\"line\">\n                <span class=\"point\"></span>\n                <span class=\"date\">{{item.startTimeTxt}}</span>\n            </div>\n            <div class=\"content\">\n                <a href=\"{{item.status==2?'liveRoom':'playback'}}.html?roomId={{item.roomId}}\" class=\"img-wrap Left\">\n                    <img src=\"{{item.posterPic}}\" onerror=\"src='../img/bg-demo.jpg'\"\n                         alt=\"\">\n                    <div class=\"play\"></div>\n                </a>\n                <div class=\"info-wrap Left\">\n                    <div class=\"item-title\">{{item.roomName}}</div>\n                    <div class=\"time\">时长: <span class=\"\">{{item.durationTxt}}</span></div>\n                    <div class=\"anchor\">\n                        <img src=\"{{item.creator.smallAvatar}}\" onerror=\"this.src='../img/bg-demo.jpg'\" alt=\"\">\n                        <a class=\"name\" href=\"##\">{{item.creator.nickName}}</a>\n                    </div>\n                </div>\n                <div class=\"Clear\"></div>\n            </div>\n            <div class=\"icon-list\">\n                <span class=\"view\">{{item.onlineMax}}</span>\n                <span class=\"chat\">{{item.bulletCurtain}}</span>\n                <span class=\"like\">{{item.assemble}}</span>\n                <span class=\"hot\">{{item.popularity}}</span>\n            </div>\n        </div>\n        {{/each}}\n        {{ if data.rooms.length <= 0}}\n        <div class=\"no-data\">\n            暂无数据\n        </div>\n        {{/if}}\n\n    </script>\n    <!--分页-->\n    <div class=\"page-block\">\n        <div class=\"page-wrap\" id=\"page-wrap\">\n\n        </div>\n    </div>\n</div>"

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 关注者列表
	 * Created by AaronYuan on 5/4/16.
	 */
	
	
	'use strict';
	
	var base = __webpack_require__(18);
	var _ = __webpack_require__(35);
	var BaseView = base.View; // View的基类
	var UserModel = __webpack_require__(34);
	var user = UserModel.sharedInstanceUserModel();
	var DateTime = __webpack_require__(62);
	
	var FollowingListModel = __webpack_require__(133);
	var UnFollowModel = __webpack_require__(134);
	var AnchorLastestModel = __webpack_require__(135);
	var msgBox = __webpack_require__(56);
	var Pagenation = __webpack_require__(120);
	
	var View = BaseView.extend({
	  el: '#followingList', // 设置View对象作用于的根元素，比如id
	  rawLoader: function () { // 可用此方法返回字符串模版
	    return __webpack_require__(136);
	  },
	  events: { // 监听事件
	    'click #followList': 'cancelClicked'
	  },
	  // 当模板挂载到元素之前
	  beforeMount: function () {
	
	  },
	  // 当模板挂载到元素之后
	  afterMount: function () {
	    this.followListModel = FollowingListModel.sharedInstanceModel();
	    this.unFollowModel = UnFollowModel.sharedInstanceModel();
	    this.anchorLastestModel = AnchorLastestModel.sharedInstanceModel();
	
	    this.followList = this.$el.find('#followList');
	
	    // 每页条数
	    this.perpage = 9;
	    this.params = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken(),
	      size: this.perpage,
	      offset: 0
	    };
	    this.unFollowParams = {
	      deviceinfo: '{"aid": "30001001"}',
	      access_token: user.getWebToken(),
	      anchorId: 0
	    };
	
	    this.followTpl = this.$el.find('#followTpl').text();
	  },
	  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
	  ready: function () {
	    this.getPageList(1);
	    // this.initPagination();
	  },
	  initPagination: function () {
	    var self = this;
	    self.pageing = Pagenation.create('#followPageWrap', {
	      total: 1,
	      perpage: self.perpage,
	      onSelect: function (page) {
	        self.getPageList(page);
	      }
	    });
	    // this.pageing = $('#followPageWrap').paging(1, {
	    //   format: '[ < .(qq -) nnncnn (- pp)> ] ',
	    //   perpage: 9,
	    //   page: 1,
	    //   onFormat: function (type) {
	    //     switch (type) {
	    //       case 'block':
	    //         if (!this.active) {
	    //           return '<span class="disabled ">' + this.value + '</span>';
	    //         } else if (this.value !== this.page) {
	    //           return '<a href="#' + this.value + '">' + this.value + '</a>';
	    //         }
	    //         return '<span class="current ">' + this.value + '</span>';
	    //       case 'next':
	    //         if (this.active) {
	    //           return '<a href="#' + this.value + '" class="next ">&gt;</a>';
	    //         }
	    //         return '<span class="disabled ">&gt;</span>';
	    //       case 'prev':
	    //         if (this.active) {
	    //           return '<a href="#' + this.value + '" class="prev ">&lt;</a>';
	    //         }
	    //         return '<span class="disabled ">&lt;</span>';
	    //       case 'fill':
	    //         if (this.active) {
	    //           return '<span>...</span>';
	    //         }
	    //         return '';
	    //       default:
	    //         return '';
	    //     }
	    //   },
	    //   onSelect: function (page) {
	    //     self.getPageList(page);
	    //   }
	    // });
	  },
	  getPageList: function (page) {
	    var self = this;
	    this.params.offset = (page - 1) * this.perpage;
	    var promise = self.followListModel.executeJSONP(this.params);
	    promise.done(function (res) {
	      self.renderList(res);
	      if (!self.totalCount && res.data.totalCount) {
	        self.totalCount = res.data.totalCount;
	        // self.pageing.setNumber(self.totalCount);
	        // self.pageing.setPage();
	      }
	    });
	  },
	  renderList: function (data) {
	    var html = this.compileHTML(this.followTpl, data);
	    this.followList.html(html);
	  },
	  formatData: function (data) {
	    if (data) {
	      _.each(data.data, function (item) {
	        var curItem = item;
	        var time = new Date(item.startTime);
	        curItem.startTimeTxt = DateTime.format(time, 'yyyy/MM/dd');
	        var result = DateTime.difference(item.duration);
	        curItem.durationTxt = result.hours + ':' + result.minutes + ':' + result.seconds;
	      });
	    }
	    return data;
	  },
	  cancelClicked: function (e) {
	    var self = this;
	    var target = $(e.target);
	    var promise;
	    var promise2;
	    var url;
	    if (target.data('id')) {
	      this.unFollowParams.anchorId = target.data('id');
	      promise = this.unFollowModel.executeJSONP(this.unFollowParams);
	      promise.done(function (res) {
	        if (res.code === '0') {
	          msgBox.showOK('已取消关注');
	          self.getPageList();
	        } else {
	          msgBox.showTip('取消关注失败,稍后重试');
	        }
	      });
	      promise.fail(function () {
	        msgBox.showTip('取消关注失败,稍后重试');
	      });
	    } else if (target.data('uid')) {
	      this.unFollowParams.anchor = target.data('uid');
	      promise2 = this.anchorLastestModel.executeJSONP(this.unFollowParams);
	      promise2.done(function (res) {
	        if (res && res.data && res.data.status) {
	          if (res.data.status >= 2) {
	            url = res.data.status === 2
	              ? 'liveroom.html?roomId=' : 'playback.html?roomId=';
	            window.location.href = url + res.data.id;
	          }
	        }
	      });
	    }
	  }
	});
	
	module.exports = View;


/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/user/anchor/follow_list.json',
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
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
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
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(18);
	var Config = __webpack_require__(33);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/anchor_lastest.json',
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
/* 136 */
/***/ function(module, exports) {

	module.exports = "<div class=\"following-wrap has-top-space\">\n    <div id=\"followList\">\n        加载中...\n    </div>\n    <!---->\n    <script type=\"text/x-template\" id=\"followTpl\">\n        {{each data.users as item}}\n        <div class=\"item\">\n            <a class=\"avatar Left\" href=\"###\" data-uid=\"{{item.uid}}\">\n                <img data-uid=\"{{item.uid}}\" src=\"{{item.largeAvatar}}\" alt=\"\"></a>\n            <div class=\"info-wrap Left\">\n                <div class=\"name\">{{item.nickName}}</div>\n                <div class=\"played\">主持的主播:\n                    <sapn class=\"total\">{{item.liveCount}}</sapn>\n                    场\n                </div>\n                <button data-id=\"{{item.uid}}\" class=\"am-btn am-btn-red boderRadAll_3\">取消关注</button>\n            </div>\n            <div class=\"Clear\"></div>\n        </div>\n        {{/each}}\n        {{ if data.users.length<= 0 }}\n        <div class=\"no-data\">\n            暂无数据\n        </div>\n        {{/if}}\n    </script>\n    <!---->\n    <div class=\"page-block\">\n        <div class=\"page-wrap\" id=\"followPageWrap\">\n\n        </div>\n    </div>\n\n</div>"

/***/ },
/* 137 */
/***/ function(module, exports) {

	module.exports = "<!---->\n<div class=\"tab-content my-live-show-wrap\" id=\"tab-my-live\">\n  <div class=\"top-header am-margin-top-xl am-margin-bottom\">\n    <div id=\"liveState\" class=\"live-status-wrap boderRadAll_5\">\n      <a href=\"javascript:;\" data-state=\"0\" class=\"right-border active\">未开播</a>\n      <a style=\"margin-left: -4px;\" href=\"javascript:;\" data-state=\"1\">历史直播</a>\n    </div>\n  </div>\n  <div class=\"list-wrap\">\n    <div id=\"noOpenListLive\" class=\"unClosed-list-wrap\">\n      <div id=\"noOpenContent\">\n      </div>\n      <!-- 分页 -->\n      <div class=\"page-block\">\n        <div class=\"page-wrap\" id=\"noOpenPageBox\">\n\n        </div>\n      </div>\n    </div>\n    <div id=\"historyListLive\" class=\"closed-list-wrap Hidden\">\n      <div id=\"historyContent\">\n        <!-- 历史直播 -->\n      </div>\n      <!-- 分页 -->\n      <div class=\"page-block\">\n        <div class=\"page-wrap\" id=\"historyPageBox\">\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n<!--创建直播-->\n<div id=\"createLiveVideo\" class=\"tab-content Hidden creatLive\"></div>\n<!--观看记录-->\n<div id=\"recordList\" class=\"tab-content Hidden\"></div>\n<!--我的关注-->\n<div id=\"followingList\" class=\"tab-content Hidden\"></div>\n<!---->\n<div id=\"tabSetting\" class=\"tab-content Hidden setting\">\n  <div id=\"profileSate\" class=\"two-tab boderRadAll_5 am-margin-top-xl am-margin-bottom\">\n    <a href=\"javascript:;\" data-state=\"0\" class=\"right-border active\">个人资料</a>\n    <a style=\"margin-left: -4px;\" href=\"javascript:;\" data-state=\"1\">修改密码</a>\n  </div>\n  <!--<ol class=\"setContrl clearfix\" id=\"profileSate\">-->\n  <!--<li class=\"fl on\" data-state=\"0\">个人资料</li>-->\n  <!--<li class=\"fl\" data-state=\"1\">修改密码</li>-->\n  <!--</ol>-->\n  <div class=\"set_Con\">\n    <div class=\"personInfo show\" id=\"editProfile\">\n\n    </div>\n    <div class=\"modifyPwd Hidden\" id=\"updatePassword\">\n\n    </div>\n\n  </div>\n\n</div>\n"

/***/ },
/* 138 */
/***/ function(module, exports) {

	module.exports = "<div class=\"am-container\" id=\"pageContent\">\n</div>"

/***/ },
/* 139 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
]);
//# sourceMappingURL=anchor-setting.js.map