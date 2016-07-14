webpackJsonp([6],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by xiangwenwen on 16/4/11.
	 */
	var $ = __webpack_require__(1);
	$(function indexMain() {
	  var MainView = __webpack_require__(232);
	  var mainView = new MainView();
	  console.log(mainView);
	  __webpack_require__(244);
	});


/***/ },

/***/ 27:
/***/ function(module, exports) {

	module.exports = window._;

/***/ },

/***/ 28:
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

/***/ 29:
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

/***/ 30:
/***/ function(module, exports) {

	module.exports = window.Backbone;

/***/ },

/***/ 31:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!art-template - Template Engine | http://aui.github.com/artTemplate/*/
	!function(){function a(a){return a.replace(t,"").replace(u,",").replace(v,"").replace(w,"").replace(x,"").split(/^$|,+/)}function b(a){return"'"+a.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}function c(c,d){function e(a){return m+=a.split(/\n/).length-1,k&&(a=a.replace(/\s+/g," ").replace(/<!--.*?-->/g,"")),a&&(a=s[1]+b(a)+s[2]+"\n"),a}function f(b){var c=m;if(j?b=j(b,d):g&&(b=b.replace(/\n/g,function(){return m++,"$line="+m+";"})),0===b.indexOf("=")){var e=l&&!/^=[=#]/.test(b);if(b=b.replace(/^=[=#]?|[\s;]*$/g,""),e){var f=b.replace(/\s*\([^\)]+\)/,"");n[f]||/^(include|print)$/.test(f)||(b="$escape("+b+")")}else b="$string("+b+")";b=s[1]+b+s[2]}return g&&(b="$line="+c+";"+b),r(a(b),function(a){if(a&&!p[a]){var b;b="print"===a?u:"include"===a?v:n[a]?"$utils."+a:o[a]?"$helpers."+a:"$data."+a,w+=a+"="+b+",",p[a]=!0}}),b+"\n"}var g=d.debug,h=d.openTag,i=d.closeTag,j=d.parser,k=d.compress,l=d.escape,m=1,p={$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1},q="".trim,s=q?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"],t=q?"$out+=text;return $out;":"$out.push(text);",u="function(){var text=''.concat.apply('',arguments);"+t+"}",v="function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);"+t+"}",w="'use strict';var $utils=this,$helpers=$utils.$helpers,"+(g?"$line=0,":""),x=s[0],y="return new String("+s[3]+");";r(c.split(h),function(a){a=a.split(i);var b=a[0],c=a[1];1===a.length?x+=e(b):(x+=f(b),c&&(x+=e(c)))});var z=w+x+y;g&&(z="try{"+z+"}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:"+b(c)+".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");try{var A=new Function("$data","$filename",z);return A.prototype=n,A}catch(B){throw B.temp="function anonymous($data,$filename) {"+z+"}",B}}var d=function(a,b){return"string"==typeof b?q(b,{filename:a}):g(a,b)};d.version="3.0.0",d.config=function(a,b){e[a]=b};var e=d.defaults={openTag:"<%",closeTag:"%>",escape:!0,cache:!0,compress:!1,parser:null},f=d.cache={};d.render=function(a,b){return q(a,b)};var g=d.renderFile=function(a,b){var c=d.get(a)||p({filename:a,name:"Render Error",message:"Template not found"});return b?c(b):c};d.get=function(a){var b;if(f[a])b=f[a];else if("object"==typeof document){var c=document.getElementById(a);if(c){var d=(c.value||c.innerHTML).replace(/^\s*|\s*$/g,"");b=q(d,{filename:a})}}return b};var h=function(a,b){return"string"!=typeof a&&(b=typeof a,"number"===b?a+="":a="function"===b?h(a.call(a)):""),a},i={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"},j=function(a){return i[a]},k=function(a){return h(a).replace(/&(?![\w#]+;)|[<>"']/g,j)},l=Array.isArray||function(a){return"[object Array]"==={}.toString.call(a)},m=function(a,b){var c,d;if(l(a))for(c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);else for(c in a)b.call(a,a[c],c)},n=d.utils={$helpers:{},$include:g,$string:h,$escape:k,$each:m};d.helper=function(a,b){o[a]=b};var o=d.helpers=n.$helpers;d.onerror=function(a){var b="Template Error\n\n";for(var c in a)b+="<"+c+">\n"+a[c]+"\n\n";"object"==typeof console&&console.error(b)};var p=function(a){return d.onerror(a),function(){return"{Template Error}"}},q=d.compile=function(a,b){function d(c){try{return new i(c,h)+""}catch(d){return b.debug?p(d)():(b.debug=!0,q(a,b)(c))}}b=b||{};for(var g in e)void 0===b[g]&&(b[g]=e[g]);var h=b.filename;try{var i=c(a,b)}catch(j){return j.filename=h||"anonymous",j.name="Syntax Error",p(j)}return d.prototype=i.prototype,d.toString=function(){return i.toString()},h&&b.cache&&(f[h]=d),d},r=n.$each,s="break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined",t=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,u=/[^\w$]+/g,v=new RegExp(["\\b"+s.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g"),w=/^\d[^,]*|,\d[^,]*/g,x=/^,+|,+$/g;e.openTag="{{",e.closeTag="}}";var y=function(a,b){var c=b.split(":"),d=c.shift(),e=c.join(":")||"";return e&&(e=", "+e),"$helpers."+d+"("+a+e+")"};e.parser=function(a,b){a=a.replace(/^\s/,"");var c=a.split(" "),e=c.shift(),f=c.join(" ");switch(e){case"if":a="if("+f+"){";break;case"else":c="if"===c.shift()?" if("+c.join(" ")+")":"",a="}else"+c+"{";break;case"/if":a="}";break;case"each":var g=c[0]||"$data",h=c[1]||"as",i=c[2]||"$value",j=c[3]||"$index",k=i+","+j;"as"!==h&&(g="[]"),a="$each("+g+",function("+k+"){";break;case"/each":a="});";break;case"echo":a="print("+f+");";break;case"print":case"include":a=e+"("+c.join(",")+");";break;default:if(-1!==f.indexOf("|")){var l=b.escape;0===a.indexOf("#")&&(a=a.substr(1),l=!1);for(var m=0,n=a.split("|"),o=n.length,p=l?"$escape":"$string",q=p+"("+n[m++]+")";o>m;m++)q=y(q,n[m]);a="=#"+q}else a=d.helpers[e]?"=#"+e+"("+c.join(",")+");":"="+a}return a}, true?!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return d}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!=typeof exports?module.exports=d:this.template=d}();

/***/ },

/***/ 32:
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

/***/ 33:
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

/***/ 34:
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

/***/ 35:
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

/***/ 36:
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

/***/ 37:
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

/***/ 38:
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

/***/ 39:
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

/***/ 40:
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

/***/ 41:
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Auxiliary=t():e.Auxiliary=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){var r=n(1),o=n(2),i=n(3),a=n(4),s=n(5),c=n(7);e.exports={url:r,sheet:o,isNativeFunction:i,cookie:a,AjaxForm:s,UploadFile:c}},function(e,t){"use strict";var n=[];window.location;e.exports={parse:function(e){var t=document.createElement("a");t.href=e;for(var n,r={port:t.port,protocol:t.protocol.replace(":",""),hash:t.hash.replace("#",""),host:t.host,href:t.href,hostname:t.hostname,pathname:t.pathname,search:t.search,query:{}},o=r.search.replace(/^\?/,"").split("&"),i=o.length,a=0;i>a;a++)o[a]&&(n=o[a].split("="),r.query[n[0]]=n[1]);return t=null,r},format:function(e,t){var r=0,o=t.query,i=t.hash;if(n.length=0,n.push(e.lastIndexOf("?")>-1?e:e+"?"),o)for(var a in o){var s=o[a];r?n.push("&"+a+"="+s):(r++,n.push(a+"="+s))}return i&&n.push(i.indexOf("#")>-1?i:"#"+i),n.join("")},resolve:function(e,t){return/^(.\/)/.test(t)&&(t=t.replace(/^(.\/)/,"/")),/^(..\/)/.test(t)&&(e=e.substr(0,e.lastIndexOf("/")),t=t.replace(/^(..\/)/,"/")),e+t},extname:function(e){var t=e.split(".");return t[t.length-1]||""},parseSearch:function(e){for(var t,n,r={},o=e.replace(/^\?/,"").split("&"),i=o.length,a=0;i>a;a++)o[a]&&(n=o[a].split("="),t=n[1],(/^\[/.test(t)&&/\]$/.test(t)||/^{/.test(t)||/\}$/.test(t))&&(t=JSON.parse(t)),r[n[0]]=t);return r}}},function(e,t){"use strict";function n(){var e=document.createElement("style");return e.appendChild(document.createTextNode("")),document.head.appendChild(e),e.sheet}e.exports=n()},function(e,t){"use strict";function n(e){var t=typeof e;return"function"===t?a.test(o.call(e)):e&&"object"===t&&i.test(r.call(e))||!1}e.exports=n;var r=Object.prototype.toString,o=Function.prototype.toString,i=/^\[object .+?Constructor\]$/,a=RegExp("^"+String(r).replace(/[.*+?^${}()|[\]\/\\]/g,"\\$&").replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$")},function(e,t){"use strict";function n(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function r(e){function t(r,o,i){var a;if(arguments.length>1){if(i=n({path:"/"},t.defaults,i),"number"==typeof i.expires){var s=new Date;s.setMilliseconds(s.getMilliseconds()+864e5*i.expires),i.expires=s}try{a=JSON.stringify(o),/^[\{\[]/.test(a)&&(o=a)}catch(c){}return o=e.write?e.write(o,r):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),r=encodeURIComponent(String(r)),r=r.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),r=r.replace(/[\(\)]/g,escape),document.cookie=[r,"=",o,i.expires&&"; expires="+i.expires.toUTCString(),i.path&&"; path="+i.path,i.domain&&"; domain="+i.domain,i.secure?"; secure":""].join("")}r||(a={});for(var p=document.cookie?document.cookie.split("; "):[],l=/(%[0-9A-Z]{2})+/g,u=0;u<p.length;u++){var f=p[u].split("="),h=f[0].replace(l,decodeURIComponent),d=f.slice(1).join("=");'"'===d.charAt(0)&&(d=d.slice(1,-1));try{if(d=e.read?e.read(d,h):e(d,h)||d.replace(l,decodeURIComponent),this.json)try{d=JSON.parse(d)}catch(c){}if(r===h){a=d;break}r||(a[h]=d)}catch(c){}}return a}return t.get=t.set=t,t.getJSON=function(){return t.apply({json:!0},[].slice.call(arguments))},t.defaults={},t.remove=function(e,r){t(e,"",n(r,{expires:-1}))},t.withConverter=r,t}e.exports=r(function(){})},function(e,t,n){"use strict";var r=(n(1),n(6)),o=function(e){e=e||{},this.$el="string"==typeof e.el?$(e.el):e.el,this.uid=r("AjaxForm-"),this.loadState=!1,this._init()};o.prototype._init=function(){var e=$.Deferred();$.extend(this,e.promise()),this._createIframe(),this._addEvent(e)},o.prototype._createIframe=function(){var e='<iframe id="'+this.uid+'" name="'+this.uid+'"  style="display: none;" src="about:blank"></iframe>';this.$el.attr("target",this.uid),this.$el.append(e),this._iframe=$("#"+this.uid),$("<input />").attr({type:"hidden",name:"cross_post",value:"1"}).appendTo(this.$el)},o.prototype._addEvent=function(e){var t=this;this._iframe.on("load",function(){if(t.loadState){var n=this.contentWindow,r=n.location;if("about:blank"===r.href)e.reject(n);else try{var o=this._iframe[0].contentWindow.document.body;innerText=o.innerText,innerText||(innerText=o.innerHTML),innerText&&e.resolve($.parseJSON(innerText))}catch(i){e.resolve(n)}t.loadState=!1}})},o.prototype.encrypto=function(e){var t=this;$.each(e,function(e,n){var r=t.$el.find("[name="+e+"]");0===r.length?$("<input />").attr({type:"hidden",name:e,value:n}).appendTo(t.$el):r.val(n)})};var i=null;o.sharedInstanceAjaxForm=function(e,t){return i||(t=t||{},t.el=e,i=new o(t)),i},o.classInstanceAjaxForm=function(e,t){return t=t||{},t.el=e,new o(t)},e.exports=o},function(e,t){function n(e){var t=++r+"";return e?e+t:t}e.exports=n;var r=0},function(e,t,n){"use strict";var r=n(1),o=n(5),i=n(6),a=function(e){if(this.$el="string"==typeof e.el?$(e.el):e.el,this.uid=i("UploadFile-"),this.options=e,this._data=e.data||{},this._filename=e.filename||"image",this._url=e.url,!this._url)return void console.warn("配置上传URL");this._init();var t=$.Deferred();$.extend(this,t.promise()),this.ajaxForm=o.classInstanceAjaxForm(this.$el,{type:"img"}),this.ajaxForm.done(function(e){var n=e.location,o=decodeURIComponent(n.search),i=r.parseSearch(o);t.resolve(i)}),this.ajaxForm.fail(function(){t.reject(this)})};a.prototype._init=function(){this._createElement()},a.prototype._createElement=function(){var e="";for(var t in this._data){var n=this._data[t],r=Object.prototype.toString.call(n);"[object Object]"!==r&&"[object Array]"!==r||(n=JSON.stringify(n)),e+='<input type="hidden" name="'+t+"\" value='"+n+"'/>"}e+='<input type="file" class="opacity0 upload-file '+this.options.className+'" name="'+this._filename+'"  />',this.$el.attr("method","POST"),this.$el.attr("action",this._url),this.$el.attr("enctype","multipart/form-data"),this.$el.append(e)},a.prototype.parseErrorMsg=function(e){if(e&&"SUCCESS"==e.state)return!0;var t=1*e.errCode||0;switch(t){case 29:return"上传的文件太大了,请重新上传";case 31:return"请上传JPGE,JPG,PNG,GIF等格式的图片文件"}return"文件上传失败,请重新上传"},a.prototype.submit=function(){this.ajaxForm.loadState=!0,"function"==typeof this._before&&this._before(),this.$el.submit()};var s=null;a.sharedInstanceUploadFile=function(e){return s||(s=new a(e)),s},a.classInstanceUploadFile=function(e){return new a(e)},e.exports=a}])});
	//# sourceMappingURL=auxiliary.min.js.map

/***/ },

/***/ 43:
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

/***/ 44:
/***/ function(module, exports) {

	var config = {"scheme":"alpha","env":{"alpha":{"url_prefix":"http://beta.yinyuetai.com:9019"},"beta":{"url_prefix":"http://beta.yinyuetai.com:9019"},"release":{"url_prefix":"http://lapi.yinyuetai.com"}},"prefix":"","domains":{"urlStatic":"http://s.yytcdn.com","loginSite":"http://login.yinyuetai.com","mainSite":"http://www.yinyuetai.com","mvSite":"http://mv.yinyuetai.com","homeSite":"http://i.yinyuetai.com","vchartSite":"http://vchart.yinyuetai.com","commentSite":"http://comment.yinyuetai.com","playlistSite":"http://pl.yinyuetai.com","searcresiehSite":"http://so.yinyuetai.com","vSite":"http://v.yinyuetai.com","fanSite":"","paySite":"","tradeSite":"","shopSite":"","vipSite":""}}; module.exports = config;

/***/ },

/***/ 45:
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

/***/ 46:
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

/***/ 47:
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

/***/ 48:
/***/ function(module, exports) {

	module.exports = "<!-- <a  href=\"\" id=\"{{id}}\" class=\"{{closeClass}}\">{{if closeText}}{{closeText}}{{/if}}</a> -->\n{{if closeClass === 'editor_bg_close_x'}}\n<a  href=\"\" id=\"{{id}}\" class=\"{{closeClass}} icons am-yyt-close close-white\"></a>\n{{else}}\n<a  href=\"\" id=\"{{id}}\" class=\"{{closeClass}}\"></a>\n{{/if}}\n"

/***/ },

/***/ 49:
/***/ function(module, exports) {

	module.exports = "<h3 class=\"dialog_title J_title\">{{title}}</h3>\n"

/***/ },

/***/ 50:
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

/***/ 51:
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

/***/ 52:
/***/ function(module, exports) {

	module.exports = "<div class=\"loginbox\">\n    <div class=\"external\">\n        <p class=\"title\">使用合作账号登录<span>(推荐)</span></p>\n        <ul>\n            <li>\n                <a href=\"{{url}}/api/login/sina-auth\" target=\"_blank\" class=\"weibo\" hidefocus>微博帐号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/qq-auth\" target=\"_blank\" class=\"qq\" hidefocus>QQ帐号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/renren-auth\" target=\"_blank\" class=\"renren\" hidefocus>人人账号</a>\n            </li>\n            <li>\n                <a href=\"{{url}}/api/login/baidu-auth\" target=\"_blank\" class=\"baidu\" hidefocus>百度帐号</a>\n            </li>\n        </ul>\n        <div class=\"loginbox-placehold\"></div>\n        <p class=\"text\">快捷登录，无需注册</p>\n        <p class=\"text\">与你的朋友分享你的爱！</p>\n    </div>\n    <div class=\"site\">\n        <p class=\"title\">音悦Tai账号登录</p>\n        <form id=\"loginBoxForm\" action=\"https://login.yinyuetai.com/login-ajax\" method=\"post\">\n            <p class=\"errorinfo\">错误信息提示</p>\n            <div class=\"email focuss\">\n                <input type=\"text\" name=\"email\" placeholder=\"您的邮箱地址或绑定手机\"/>\n            </div>\n            <div class=\"password\">\n                <input type=\"password\" class=\"pwd\" placeholder=\"请输入密码\"/>\n            </div>\n            <div id=\"captcha\"></div>\n            <div>\n                <p class=\"autologin\"><input type=\"checkbox\" id=\"autocheckbox\" name=\"autologin\" checked hidefocus/><label for=\"autocheckbox\">下次自动登录</label></p>\n                <a class=\"forgot\" href=\"{{url}}/forgot-password\" target=\"_blank\" hidefocus>忘记密码</a>\n            </div>\n            <div>\n                <input class=\"submit\" type=\"submit\" hidefocus/>\n                <p class=\"reg\">还没有音悦Tai账号？<a href=\"{{url}}/register\" target=\"_blank\" hidefocus>立即注册！</a></p>\n            </div>\n        </form>\n    </div>\n</div>"

/***/ },

/***/ 53:
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

/***/ 54:
/***/ function(module, exports) {

	module.exports = "<div style=\"padding: 20px 30px;\">\n  <p>您好像还没有进行邮箱验证。</p>\n  <p>为不影响部分功能的使用，请先进行\n    <a href=\"{homeSite}/settings/bind\" target=\"_blank\" class=\"special f14\">邮箱验证</a>\n  </p>\n</div>\n"

/***/ },

/***/ 55:
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

/***/ 56:
/***/ function(module, exports) {

	module.exports = "<div id=\"UIConfigWrap\" class=\"shadow_screen\">\n    <div class=\"shadow\"></div>\n    <div class=\"edit_annmoucement_con\" style=\"margin-bottom: 16px; width: 400px;margin-left:-200px;\">\n        <h2 class=\"edit_title\"><span class=\"title\" id=\"UIConfirmTitle\"><%=title%></span> <span class=\"close icons am-yyt-close close-black UIConfirmClose\"></span></h2>\n        <div class=\"editCon\" style=\"\">\n            <div class=\"content\" style=\"padding:16px; font-size: 14px;\"><%=content%></div>\n            <p class=\"btn-wrap am-margin-top\" >\n                <a style=\"display: <%= okBtn?'inline-block':'none'%>;\" id=\"UIConfirmOk\" href=\"javascript:;\" class=\"boderRadAll_5 submit active am-margin-right\">确定</a>\n                <a style=\"display: <%= cancelBtn?'inline-block':'none'%>;\" href=\"javascript:;\" class=\"boderRadAll_5 cancel UIConfirmClose am-margin-left\">取消</a>\n            </p>\n        </div>\n    </div>\n</div>\n"

/***/ },

/***/ 63:
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

/***/ 69:
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

/***/ 70:
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

/***/ 82:
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
	    src: this._props.src || origin + '/flash/RTMPInplayer.swf?t=20160713.19', //  引入swf文件
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

/***/ 102:
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

/***/ 103:
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

/***/ 104:
/***/ function(module, exports) {

	module.exports = "<div class=\"PcMsg fl\">\n    <a class=\"user-login\" href=\"#\" id=\"login\">登陆</a>\n</div>"

/***/ },

/***/ 105:
/***/ function(module, exports) {

	module.exports = "<div class=\"avator fl\">\n    <img class=\"am-circle\" style=\"width: 40px; height: 40px;\" src=\"{{bigheadImg}}\" alt=\"用户头像\">\n</div>\n<div class=\"loginMsg fl hoverMenu\">\n    <a class=\"user-name show-drop-menu\" href=\"#\">{{userName}}<span></span></a>\n    <ul class=\"pcNav hoverMenu\">\n        <li><a href=\"anchor-setting.html\">个人中心</a></li>\n        <li><span class=\"header-logout\" id=\"logout\">退出</span></li>\n    </ul>\n</div>\n"

/***/ },

/***/ 184:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	var BusinessDate = __webpack_require__(70);
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/room/home_hot_list.json',
	  beforeEmit: function beforeEmit() {
	    // 给请求地址替换一下环境变量
	    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
	      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
	    }
	  },
	  formatter: function formatter(response) {
	    //  formatter方法可以格式化数据
	    var code = ~~response.code;
	    if (!code) {
	      var data = response.data;
	      var i = data.length;
	      while (i--) {
	        var item = data[i];
	        if (item.status === 1) {
	          item.liveVideoTime = BusinessDate.format(new Date(item.liveTime), 'yyyy-MM-dd hh:mm');
	        }
	        item.startTimeTxt = BusinessDate.format(new Date(item.startTime), 'yyyy-MM-dd hh:mm');
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

/***/ 186:
/***/ function(module, exports, __webpack_require__) {

	/*
	  官方频道,站子频道
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/home/channel_rec.json',
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

/***/ 232:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var base = __webpack_require__(28);
	var BaseView = base.View;
	var RecommendView = __webpack_require__(233);
	var TopBarView = __webpack_require__(102);
	// var PlaybackView = require('./playback.view');
	
	var WonderfulView = __webpack_require__(240);
	var OfficialView = __webpack_require__(242);
	
	var View = BaseView.extend({
	  clientRender: false,
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.indexParameter = {
	      id: 110
	    };
	    // 通用顶部
	    this.topbar = new TopBarView();
	  },
	  afterMount: function () {
	    //  获取DOM Node
	  },
	  ready: function () {
	    // 顶部推荐
	    this.recommendview = new RecommendView();
	    // 回放
	    // this.playback = new PlaybackView();
	    // 精彩饭趴
	    this.wonderfulView = new WonderfulView({
	      topbar: this.topbar
	    });
	    // 官方频道
	    this.officialView = new OfficialView();
	    // this.fanChannelView = new FanChannelView();
	    // this.joinFanListView = new JoinFanListView();
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  }
	});
	
	module.exports = View;


/***/ },

/***/ 233:
/***/ function(module, exports, __webpack_require__) {

	/*
	  首页顶部推荐频道列表
	 */
	'use strict';
	
	var _ = __webpack_require__(27);
	var base = __webpack_require__(28);
	var BaseView = base.View;
	// 首页轮播
	var CarouselModel = __webpack_require__(234);
	// var FanUserModel = require('../../models/index/fan-user.model');
	// var ChannelModel = require('../../models/index/channel.model');
	
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var FlashApi = __webpack_require__(82);
	
	var View = BaseView.extend({
	  el: '#topContainer',
	  rawLoader: function () {
	    return __webpack_require__(235);
	  },
	  events: {
	    'click .gotoLiveHome': 'gotoLiveHome',
	    'click #livingList': 'videoListClicked'
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.elements = {};
	    this.recommendParameter = {
	      deviceinfo: '{"aid":"30001001"}'
	    };
	    this.recommendParameter.access_token = user.getWebToken();
	
	    this.queryParams = {
	      deviceinfo: '{"aid":"30001001"}',
	      access_token: user.getWebToken()
	    };
	
	    this.carouselModel = new CarouselModel();
	    // this.fanUserModel = new FanUserModel();
	    // this.channelModel = new ChannelModel();
	  },
	  afterMount: function () {
	    // 读取整个模块的模板
	    // this.recommendTpl = this.$el.find('#recommendTpl').html();
	    // 获取右侧列表模板
	    // this.livingItemTpl = this.$el.find('#liveItemTpl').html();
	    this.livingItemTpl = __webpack_require__(236);
	    this.elements.videoList = this.$el.find('#livingList');
	    this.elements.videoName = this.$el.find('#viedoName');
	    this.elements.btnGoLiveRoom = this.$el.find('#btnGoLiveRoom');
	    this.elements.flashWrap = this.$el.find('#topFlash');
	  },
	  ready: function () {
	    //  初始化
	    this.renderList();
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  getCarouselList: function () {
	    var params = _.extend(this.queryParams, {
	      offset: 0,
	      size: 5
	    });
	    return this.carouselModel.executeJSONP(params);
	  },
	  // 渲染右侧列表
	  renderList: function () {
	    var self = this;
	    var html = '';
	    var promise = this.getCarouselList();
	    promise.done(function (res) {
	      if (res && res.data && res.msg === 'SUCCESS') {
	        self.videoListData = res.data || [];
	        html = self.compileHTML(self.livingItemTpl, res);
	        self.elements.videoList.html(html);
	        if (res.data && res.data.length > 0) {
	          self.selectedFirstToPlay();
	        }
	      }
	    });
	  },
	  // xuanz
	  selectedFirstToPlay: function () {
	    var target = this.elements.videoList.find('.item').eq(0);
	    this.videoListClicked({
	      target: target
	    });
	  },
	  /**
	   * 查找视频信息
	   */
	  findVideo: function (videoid) {
	    return _.find(this.videoListData, function (item) {
	      return item.videoId === ~~videoid;
	    });
	  },
	  // 设置flash
	  setFlash: function (video) {
	    var videoInfo = video;
	    if (~~video.status === 2) {
	      // this.FlashApi = FlashApi.sharedInstanceFlashApi({
	      this.FlashApi = new FlashApi({
	        el: 'topFlash',
	        props: {
	          width: 980,
	          height: 550
	        }
	      });
	      if (this.FlashApi) {
	        this.FlashApi.onReady(function () {
	          videoInfo.isIndex = true;
	          this.init(videoInfo);
	        });
	      }
	    } else {
	      $('#topFlash').css('background-image', 'url(' + video.posterPic + ')');
	    }
	  },
	  // 进入直播间
	  gotoLiveHome: function (e) {
	    var el = $(e.currentTarget);
	    var id = el.attr('data-id');
	    var status = el.attr('data-type');
	    var url = '';
	    switch (status) {
	      case 'FANPA_ROOM':
	        //  处理直播,注意大小写
	        url = '/liveroom.html?roomId=';
	        break;
	      case 'FANPA_CHANNEL':
	        // 处理频道
	        url = '/channellive.html?channelId=';
	        break;
	        // 站内视频
	      case 'YYT_VIDEO':
	        url = '';
	        break;
	      default:
	        //  默认不处理
	    }
	    if (url) {
	      window.location.href = url + id;
	    }
	  },
	  // 推荐列表点击
	  videoListClicked: function (e) {
	    var target = $(e.target).parents('li').find('.item');
	    if (target.hasClass('active')) {
	      return;
	    }
	    var videoId = target.attr('data-videoid');
	    this.elements.videoList.find('.item').removeClass('active');
	    target.addClass('active');
	    this.setVideoToPlay(videoId);
	  },
	  // 开始播放推荐视频
	  setVideoToPlay: function (videoId) {
	    var video = this.findVideo(videoId);
	    if (video) {
	      this.elements.videoName.text(video.videoName);
	      // this.elements.btnGoLiveRoom.attr('data-id', video.videoId);
	      this.elements.btnGoLiveRoom.attr({
	        'data-id': video.videoId,
	        'data-type': video.videoType
	      });
	      this.elements.flashWrap.css({
	        'background-image': 'url(' + video.posterPic + ')',
	        'background-size': '100%'
	      });
	      this.setFlash(_.extend({
	        isLive: video.status === 'LIVE'
	      }, video));
	    }
	  }
	});
	
	module.exports = View;


/***/ },

/***/ 234:
/***/ function(module, exports, __webpack_require__) {

	/*
	  首页轮播推荐接口
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var Config = __webpack_require__(44);
	var BaseModel = base.Model;
	var env = Config.env[Config.scheme];
	
	var Model = BaseModel.extend({
	  url: '{{url_prefix}}/home/video_rec.json',
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

/***/ 235:
/***/ function(module, exports) {

	module.exports = "<div class=\"am-container has-top-bar\">\n  <section class=\"living\">\n    <header class=\"am-vertical-align\"><span class=\"am-vertical-align-middle am-serif\">直播频道</span></header>\n    <div class=\"am-cf\">\n      <div class=\"live-viedo am-fl\">\n        <div id=\"topFlash\" class=\"viedo-wrap\"></div>\n        <footer class=\"am-fl\"><span id=\"viedoName\" class=\"title\">EXO2222</span>\n          <button id=\"btnGoLiveRoom\" data-id=\"0\" data-status=\"1\" class=\"gotoLiveHome am-fr am-btn am-radius am-btn-red\">进入直播间</button>\n        </footer>\n      </div>\n      <aside class=\"viedo-list am-fr\">\n        <ul id=\"livingList\">\n          <!-- 视频列表-->\n        </ul>\n      </aside>\n    </div>\n  </section>\n</div>\n"

/***/ },

/***/ 236:
/***/ function(module, exports) {

	module.exports = "{{ each data as item $index}}\n<li>\n  <a href=\"javascript:;\" data-videoid=\"{{item.videoId}}\" data-type={{item.videoType}} class=\"item\">\n    <div class=\"img-wrap\">\n    <img src=\"{{item.posterPic}}\">\n    </div>\n    <div class=\"link-hover gradient-up am-vertical-align\">\n      <span class=\"am-text-truncate am-vertical-align-bottom\">{{item.videoName}}</span>\n    </div>\n  </a>\n</li>\n{{/each}}\n"

/***/ },

/***/ 240:
/***/ function(module, exports, __webpack_require__) {

	/*
	 精彩饭趴
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var BaseView = base.View;
	
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var LivePreviewModel = __webpack_require__(184);
	var UserInfoModel = __webpack_require__(63);
	var PushLarityModel = __webpack_require__(241);
	
	var confirm = __webpack_require__(55);
	var msgBox = __webpack_require__(69);
	
	var View = BaseView.extend({
	  el: '.perfect-wrap',
	  clientRender: false,
	  events: {
	    'click #wonderfulList': 'pushClicked'
	  },
	  rawLoader: function () {
	    return '';
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    // 总积分
	    this.totalMarks = '';
	    // 是否需要再次弹出提示层
	    this.isNeedPopup = true;
	    // 列表项模板
	    this.wonderfulItemTpl = this.$el.find('#wonderfulItemTpl').html();
	
	    this.livePreviewModel = new LivePreviewModel();
	    this.userInfo = new UserInfoModel();
	    this.pushModel = new PushLarityModel();
	
	    this.queryParams = {
	      deviceinfo: '{"aid":"30001001"}',
	      access_token: user.getWebToken(),
	      size: 4,
	      order: 'POPULARITY' // TIME
	    };
	
	    this.pushLarityParameter = {
	      deviceinfo: '{"aid":"30001001"}',
	      access_token: user.getWebToken(),
	      type: 2,
	      roomId: ''
	    };
	    this.userInfoParameter = {
	      deviceinfo: '{"aid":"30001001"}',
	      access_token: user.getWebToken()
	    };
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	  },
	  ready: function (ops) {
	    this.topbar = ops.topbar;
	    //  初始化
	    this.renderList();
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  // 渲染列表
	  renderList: function () {
	    var html;
	    var self = this;
	    var promise = this.livePreviewModel.executeJSONP(this.queryParams);
	
	    promise.done(function (res) {
	      html = self.compileHTML(self.wonderfulItemTpl, res);
	      self.$el.find('#wonderfulList').html(html);
	    });
	  },
	  pushClicked: function (e) {
	    var el = $(e.target);
	    if (!el.hasClass('am-btn')) {
	      el = el.parent('button');
	    }
	    if (el.attr('data-roomId')) {
	      this.currentItemDom = el.parents('.item');
	      this.pushViedo(el.attr('data-roomId'));
	    }
	  },
	  // 视频点赞
	  pushViedo: function (roomId) {
	    var self = this;
	    var promise;
	    if (user.isLogined()) {
	      //  已经登录
	      this.pushLarityParameter.roomId = roomId;
	      if (this.isNeedPopup) {
	        promise = this.userInfo.executeJSONP(this.userInfoParameter);
	        promise.done(function (response) {
	          var code = parseInt(response.code, 10);
	          if (code === 0) {
	            self.totalMarks = response.data.totalMarks;
	            self.showConfirm();
	          } else {
	            msgBox.showError(response.msg || '操作失败,稍后重试');
	          }
	        });
	        promise.fail(function () {
	          msgBox.showError('获取信息失败');
	        });
	      } else {
	        self.executePushVideo();
	      }
	    } else {
	      //  未登录
	      this.topbar.on('logined', function () {
	        window.location.reload();
	      });
	      this.topbar.showLoginDialog();
	    }
	  },
	  showConfirm: function () {
	    var self = this;
	    var content =
	      '<div>使用<span style="color:#ff6f6e;">20</span>积分支持一下MC,当前共有<span style="color:#ff6f6e;">' +
	      (this.totalMarks || 0) + '</span>积分</div> ' +
	      '<div style="text-align:right;">' +
	      '<label style="ont-weight: inherit;">' +
	      '<input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
	    confirm.show({
	      title: '顶上去',
	      content: content,
	      okFn: function () {
	        var check = $('#popupCheckBox');
	        if (check.is(':checked')) {
	          self.isNeedPopup = false;
	        } else {
	          self.isNeedPopup = true;
	        }
	        self.executePushVideo();
	      }
	    });
	  },
	  executePushVideo: function () {
	    var self = this;
	    var promise = this.pushModel.executeJSONP(this.pushLarityParameter);
	    promise.done(function (response) {
	      var success = response.data.success;
	      if (!success) {
	        msgBox.showError(response.data.message || '操作失败,请稍后重试');
	      } else {
	        msgBox.showOK('感谢您的大力支持~');
	        self.updateNumber();
	      }
	    });
	    promise.fail(function (xhr) {
	      if (xhr) {
	        msgBox.showError('人气上推错误');
	      }
	    });
	  },
	  updateNumber: function () {
	    var target = this.currentItemDom.find('.white');
	    if (target) {
	      var txt = target.text();
	      // 积分
	      target.text(~~txt + 20);
	    }
	  }
	});
	
	module.exports = View;


/***/ },

/***/ 241:
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

/***/ 242:
/***/ function(module, exports, __webpack_require__) {

	/*
	 官方频道
	 */
	'use strict';
	
	var base = __webpack_require__(28);
	var BaseView = base.View;
	var _ = __webpack_require__(27);
	
	var UserModel = __webpack_require__(45);
	var user = UserModel.sharedInstanceUserModel();
	var ChannelModel = __webpack_require__(186);
	
	var View = BaseView.extend({
	  el: '.official-wrap',
	  rawLoader: function () {
	    return '';
	  },
	  context: function (args) {
	    console.log(args);
	  },
	  beforeMount: function () {
	    //  初始化一些自定义属性
	    this.queryParams = {
	      deviceinfo: '{"aid":"30001001"}',
	      access_token: user.getWebToken(),
	      size: 5,
	      type: 'YYT'
	    };
	
	    this.asideTpl = __webpack_require__(243);
	    // this.$el.find('#officialAsideTpl').html();
	    this.centerTpl = this.$el.find('#officialCenterTpl').html();
	
	    this.channelModel = new ChannelModel();
	  },
	  afterMount: function () {
	    //  获取findDOMNode DOM Node
	    this.wrapDOM = this.$el.find('#officialList');
	    // 模板
	    this.emptyItem = {
	      channelId: 0,
	      channelType: 'YYT',
	      channelName: '敬请期待',
	      desc: '敬请期待',
	      posterPic: '',
	      popularity: 0,
	      creator: {
	        largeAvatar: '',
	        nickName: ''
	      }
	    };
	  },
	  ready: function () {
	    //  初始化
	
	    this.renderList();
	  },
	  beforeDestroy: function () {
	    //  进入销毁之前,将引用关系设置为null
	  },
	  destroyed: function () {
	    //  销毁之后
	  },
	  renderList: function () {
	    var self = this;
	    var wrap = this.$el.find('#officialList');
	    var len = 0;
	    var list = [];
	    wrap.children().remove();
	    wrap.html('');
	    var promise = this.channelModel.executeJSONP(this.queryParams);
	
	    promise.done(function (res) {
	      if (res && res.data && res.msg === 'SUCCESS') {
	        len = 5 - ~~res.data.length;
	        list = res.data;
	        while (len-- > 0) {
	          list.push(_.extend({}, self.emptyItem));
	        }
	        // self.bindAside(res.data.slice(1, 3));
	        // self.bindCenter(res.data[0]);
	        // self.bindAside(res.data.slice(3));
	        self.bindAside(list.slice(1, 3));
	        self.bindCenter(list[0]);
	        self.bindAside(list.slice(3));
	      }
	    });
	  },
	  bindAside: function (arr) {
	    var html = this.compileHTML(this.asideTpl, {
	      data: arr
	    });
	    this.wrapDOM.append(html);
	  },
	  bindCenter: function (data) {
	    var html = this.compileHTML(this.centerTpl, data);
	    this.wrapDOM.append(html);
	  }
	});
	
	module.exports = View;


/***/ },

/***/ 243:
/***/ function(module, exports) {

	module.exports = "<div class=\"am-u-sm-3\">\n  {{each data as item}}\n  <div class=\"item\">\n    {{if item.channelId > 0}}\n    <a href=\"/channellive.html?channelId={{item.channelId}}\" class=\"top-link\">\n      <img src=\"{{item.posterPic}}\">\n      <div class=\"link-hover gradient\"></div>\n      <span class=\"am-btn am-btn-red boderRadAll_3\">进入TA的直播间</span>\n    </a>\n    <div class=\"anchor-info am-cf\">\n      <div class=\"am-fl\">\n        <div class=\"title am-text-truncate\">{{item.channelName}}</div>\n        <img src=\"{{item.creator.largeAvatar}}\" class=\"am-circle avatar\">\n        <span class=\"name\">{{item.creator.nickName}}</span>\n      </div>\n    </div>\n    {{else}}\n    <a href=\"javascript:;\" class=\"top-link\">\n      <span class=\"preview\"></span>\n    </a>\n    <div class=\"anchor-info am-cf\">\n      <div class=\"am-fl\">\n        <div class=\"title am-text-truncate\">{{item.desc}}</div>\n        <span class=\"name\"></span>\n      </div>\n    </div>\n    {{/if}}\n    <footer class=\"viedo-bg\"></footer>\n  </div>\n  {{/each}}\n</div>\n"

/***/ },

/***/ 244:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }

});
//# sourceMappingURL=index.js.map