**模块载入Alias列表**

    alias:{
            "BaseModel":path.resolve(__dirname,'YYT_PC_Modules/baseModel'),
            "BaseView":path.resolve(__dirname,'YYT_PC_Modules/baseView'),
            "store":path.resolve(__dirname,'YYT_PC_Modules/store/locationStore'),
            "cookie":path.resolve(__dirname,'YYT_PC_Modules/store/cookie'),
            "url":path.resolve(__dirname,'YYT_PC_Modules/util/url'),
            "tools":path.resolve(__dirname,'YYT_PC_Modules/util/tools'),
            "uploadFile":path.resolve(__dirname,'YYT_PC_Component/feature/uploadFile'),
            "scrollbar":path.resolve(__dirname,'YYT_PC_Component/feature/scrollbar'),
            "config":path.resolve(__dirname,'src/config')
    }

在业务编程中可以直接使用require('BaseModel')方法载入基础模型类。

**请求带参数方式**

默认所有请求都需要带上：?deviceinfo={"aid":"30001001"}

如果请求method为GET，并且需要带上参数token：access_token=web-98146232ec842119aEXDA1UijZ2.d877b.0