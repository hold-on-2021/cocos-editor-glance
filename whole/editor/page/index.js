(()=>{"use strict";Editor.require("app://editor/page/editor-init"),Editor.require("unpack://engine"),Editor.require("app://editor/page/engine-extends"),Editor.require("app://editor/page/asset-db");let e=Editor.importPath.replace(/\\/g,"/"),i=Editor.assetdb.remote._mounts,t={};for(let e in i){let r=i[e];t[r.mountPath]=r.path}cc.AssetLibrary.init({libraryPath:e,mountPaths:t}),Editor.require("app://editor/share/register-builtin-assets"),Editor.User={getSessionCode(e,i){Editor.Ipc.sendToMain("app:get-session-code",e,(e,t)=>{i&&i(e,t)})},isLoggedIn(e){Editor.Ipc.sendToMain("app:check-if-login",(i,t)=>{e&&e(!i&&t)})}}})();