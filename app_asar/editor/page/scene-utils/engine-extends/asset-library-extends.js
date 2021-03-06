"use strict";

function removeCaches(e) {
    cc.loader.release(e), cc.textureCache.removeTextureForKey(e)
}
var Electron = require("electron"),
    Path = require("fire-path"),
    _ipc = Electron.ipcRenderer,
    CallbacksInvoker = Editor.require("unpack://engine/cocos2d/core/platform/callbacks-invoker"),
    assetLibrary = cc.AssetLibrary;
_ipc.on("asset-db:assets-moved", function (e, s) {
    s.forEach(function (e) {
        assetLibrary.onAssetMoved(e.uuid, e.srcPath, e.destPath)
    })
}), _ipc.on("asset-db:asset-changed", function (e, s) {
    assetLibrary.onAssetChanged(s.uuid)
}), _ipc.on("asset-db:assets-deleted", function (e, s) {
    s.forEach(function (e) {
        assetLibrary.onAssetRemoved(e.uuid, e.path)
    })
});
var assetListener = assetLibrary.assetListener = new CallbacksInvoker;
assetLibrary.onAssetMoved = function (e, s, t) {
    var r = Path.basenameNoExt(s),
        a = Path.basenameNoExt(t);
    cc.loader.refreshUrl(e, s, t);
    var n = cc.textureCache.getTextureForKey(s);
    n && (n.url = t, cc.textureCache.cacheImage(t, n), delete cc.textureCache._textures[s]), assetListener.has(e) && assetLibrary._queryAssetInfoInEditor(e, function (s, r, a) {
        s || a && assetListener.invoke(e, t)
    }), "undefined" != typeof _Scene && _Scene.walk(cc.director.getScene(), !1, s => {
        var t = s._prefab;
        if (t) {
            if (t.asset && t.asset._uuid === e) {
                s.name !== r || (s.name = a)
            }
            return !0
        }
    })
}, assetLibrary.onAssetChanged = function (e) {
    assetLibrary._queryAssetInfoInEditor(e, function (s, t, r, a) {
        if (!s) {
            if (cc.textureCache.getTextureForKey(t)) return cc.loader.release(t), cc.loader.load(t, function (s, r) {
                r && assetListener.has(e) && assetListener.invoke(e, t)
            }), void 0;
            assetListener.has(e) && (removeCaches(t), cc.isChildClassOf(a, cc.Scene) || (r ? assetListener.invoke(e, t) : assetLibrary.loadAsset(e, function (s, t) {
                assetListener.invoke(e, t)
            })))
        }
    })
}, assetLibrary.onAssetRemoved = function (e, s) {
    removeCaches(s), console.log("delete cache of " + s), assetListener.invoke(e, null)
};