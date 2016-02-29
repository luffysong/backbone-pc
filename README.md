## Live Video 业务细节

**模块载入Alias列表

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

**请求token**



