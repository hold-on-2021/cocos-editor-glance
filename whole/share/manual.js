"use strict";const Electron=require("electron");module.exports={openManual(t){let o="";o="en"===Editor.lang?t?"http://www.cocos2d-x.org/docs/creator/manual/en/getting-started/quick-start.html":"http://www.cocos2d-x.org/docs/creator/manual/en/":t?"http://docs.cocos.com/creator/manual/zh/getting-started/quick-start.html":"http://docs.cocos.com/creator/manual/zh/",Electron.shell.openExternal(o)},openAPI(){let t="";t="en"===Editor.lang?"http://www.cocos2d-x.org/docs/creator/api/en/":"http://docs.cocos.com/creator/api/zh/",Electron.shell.openExternal(t)}};