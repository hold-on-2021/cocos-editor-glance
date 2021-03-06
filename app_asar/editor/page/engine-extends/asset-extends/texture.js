cc.Texture2D.createNodeByInfo = function (e, r) {
    Editor.assetdb.queryMetaInfoByUuid(e.uuid, function (t, n) {
        var u = JSON.parse(n.json);
        if ("raw" === u.type) return cc.info("The sprite component only supports the texture which imports as sprite type.");
        var i = require("fire-url").basenameNoExt(e.url),
            o = u.subMetas[i].uuid;
        cc.AssetLibrary.loadAsset(o, function (e, t) {
            if (e) return cc.info(e), r(e, null);
            var n = new cc.Node(i);
            return n.addComponent(cc.Sprite).spriteFrame = t, r(null, n)
        })
    })
};