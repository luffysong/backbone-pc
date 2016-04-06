## module API 描述

baseModel和baseView因为涉及业务编程，只支持require方式载入。

### baseModel

默认是关闭localStorage缓存的，原则的设计是使用内存缓存，本地缓存需要支持LocalStorage特性（HTML5 API）

可使用的方法名：execute

开启localStorage缓存的使用方式：

    var WowerModel = BaseModel.extend({
        initialize:function(){
            this.storageCache = true;
            this.expiration = 1;
        },
        url:'{{url_prefix}}/mock/mock.json'
    });

> storageCache 设置为true
>
> expiration 设置过期时间（以小时为单位，如果设置为1表示设置为一个小时1000x60x60x1毫秒）

不开启localStorage缓存的使用方式：

    var WowerModel = BaseModel.extend({
        url:'{{url_prefix}}/mock/mock.json'
    });
    
execute使用双回调来描述成功与失败：

    var model = new WowerModel();
    model.execute(function(response,model){
        //成功
    },function(error){
        //失败
    });


**execute延伸**

- executeGET 发起一个GET请求，传入成功，失败的callback，两个参数。
- executePOST发起一个POST请求，传入提交（body JSON格式) ，成功，失败的callback，三个参数。
- executePUT发起一个PUT请求，传入提交（body JSON格式) ，成功，失败的 callback，三个参数。
- executeDELETE 发起一个DELETE请求，无参数。
- executeJSONP 发起一个JSONP跨域请求，无参数。

**构造器方法**
- beforeEmit 在发起请求之前给用户一次初始化时后悔的机会
- formatter 可以对数据进行格式化，需要返回一个新的数据

**其他API**

- setChangeURL 辅助拼接URL，传入一个key/value普通对象
- setHeaders 辅助设置XHR头，传入一个key/value普通对象（JSONP时不可用）
- setView 设置view-model关系
- setOnQueueKeys 设置订阅的渲染事件名队列
- $get 包装器，从模型获取数据，无参将返回所有数据，参数使用.结构化表达式
- $set 包装器，向模型内部更新数据，以key/value的方式，第一个参数使用结构化表达式，第二个参数可以是任意类型的数据
- $filter 包装器，向模型内部筛选数据
- $sort 包装器，向模型内部进行排序
- $updateStore 将_store中的数据缓存到本地缓存中

### baseView

**构造器方法**

- rawLoader 方法，需要返回一个模板字符串
- clientRender 属性，如果设置为false，rawLoader不可用。
- beforeMount 钩子方法，在模板载入到真实DOM之前
- afterMount 钩子方法，在模板载入到真实DOM后调用
- ready 钩子方法，baseView内部初始化完成之后调用

**其他API**

- compileHTML 编译模板方法

### url

CommonJS引入：

    var url = require('./modules/url');

Global引入：

    var url = window.ICEPlugs.url

依赖：无

- parse 根据字符串URL分解为一个JSON对象

参数url为字符串

有返回值，为一个完整的URL对象

- format 将查询对象或hash值拼接为一个完整的url字符串

参数url为字符串，obj为JSON对象
    
    obj 
    
    {
        query:'查询参数对象',
        hash:'hash值'
    }
    
有返回值，为一个完整的URL字符串

- resolve 将参数 to 位置的字符解析到一个绝对路径里

- extname 返回指定文件名的扩展名称

### cookie

CommonJS引入：

    var url = require('./modules/cookie');
    
Global引入：

    var cookie = window.ICEPlugs.cookie

- get 获取cookie，传入一个name 
- set 设置cookie，传入name, value, expires, path, domain, secure
- unset 删除cookie，传入name, path, domain, secure

### locationStore

CommonJS引入：

    var url = require('./modules/locationStore');

Global引入：

    var store = window.ICEPlugs.store;

- enabled 布尔值 判断localStorage是否支持
- session 对象 如果浏览器不支持sessionStorage，此项为未定义
- clear 清除所有的localStorage
- remove 删除key名下的Storage
- set 设置一个Storage
- get 获取一个Storage
- getAll 获取所有的Storage
- expiration 对象，这个对象内的方法是设置带有时间过期机制的Storage，并且存在一个RootKey
- expiration.set(key,val,exp) 存储的key名，存储的值，以及过期时间（以小时为单位）
- expiration.get(key) 存储的key名
- session.set(key,val) 存储的key名，存储的值（可以是对象也可以是字符串）
- session.get(key) 存储的key名

### tools

CommonJS引入：

    var url = require('./modules/tools');

Global引入：

    var tools = window.ICEPlugs.tools;

- isPlainObject 判断是否为普通对象
- isObject 判断是否为对象
- hasOwn 检查对象是否为自身的属性
- toArray 类数组对象转数组
- toType 导出类型字符串
- exportToNumber 导出数字

