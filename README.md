## Live Video 业务细节

**模块载入Alias列表**

    alias:{
        "BaseModel":path.resolve(__dirname,'YYT_PC_Modules/baseModel'),
        "BaseView":path.resolve(__dirname,'YYT_PC_Modules/baseView'),
        "cookie":path.resolve(__dirname,'YYT_PC_Modules/cookie'),
        "store":path.resolve(__dirname,'YYT_PC_Modules/locationStore'),
        "url":path.resolve(__dirname,'YYT_PC_Modules/url'),
        "tools":path.resolve(__dirname,'YYT_PC_Modules/tools'),
        "RequestModel":path.resolve(__dirname,'src/lib/request.model')
    }

在业务编程中可以直接使用require('BaseModel')方法载入基础模型类。

**token验证流程**

默认情况下，用户访问页面，包括直播都不需要登录，可直接查看，此时请求不需要带token。如果用户登录，info中可能会存在id，token这样的字段，需要将每个请求都带上权限验证。**经过沟通确认，token服务端写入cookie，请求自带（不用管理）**。

**自定义滚动**



**输入框处理**



**弹幕腾讯云通信IM业务梳理**

- 在主播端创建群组（主播点击开启直播的时候创建）
- 每一个用户（包括未登录用户都会有一个临时身份ID），在进入主播创建的直播页时，自动加入群组。
- 直播页面（用户端），除非发送消息，也需要监听群组内其他人发送的消息。
- 主播端（主播可以相当于群主，拥有管理群的权限）
- 用户端（无法退出直播群）
- 主播端每次创建的直播，都需要新创建一个群组（有一个群唯一ID）
- 用户访问回放页面时，只读历史消息

如果是临时ID，如果登录成功后，需要重新初始化到群组内，客户端的操作依赖于主播发送消息的数据结构。

```JavaScript
    {
        emoji: "表情",
        message:"文本",
        image:"图片",
        typeCode:"", // 0 正常，1，清屏，2，锁屏，3，开屏幕
        typeTag:"" // 0 主播，1，用户
    }
```


