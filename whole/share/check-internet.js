"use strict";function checkInternet(t){let e=!1,o=Https.request({method:"GET",host:"passport.cocos.com",port:443,path:"/oauth/token?xxx",headers:{}},o=>{if(200!==o.statusCode){if(Editor.log("failed to connect login server... skipping login"),e)return;return e=!0,t(!1)}if(!e)return e=!0,Editor.log("connected!"),t(!0)}).on("error",o=>{if(!e)return e=!0,Editor.log("failed to connect login server... skipping login"),t(!1)});o.write(""),o.end(),setTimeout(function(){if(!e)return Editor.log("failed to connect login server due to request timeout"),e=!0,t(!1)},3e3)}const Https=require("https");module.exports={checkInternet:checkInternet};