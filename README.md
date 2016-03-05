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
