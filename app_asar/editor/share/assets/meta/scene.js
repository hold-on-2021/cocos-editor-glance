"use strict";
var Fs = require("fire-fs"),
    Path = require("fire-path"),
    CustomAssetMeta = require("./custom-asset");
class SceneMeta extends CustomAssetMeta {
    constructor(e) {
        super(e), this.asyncLoadAssets = !1, this.autoReleaseAssets = !1
    }
    import(e, s) {
        Fs.readJson(e, (t, a) => {
            if (t) return s && s(t), void 0;
            if (a) {
                var i = Editor.serialize.findRootObject(a, "cc.SceneAsset");
                i ? i.asyncLoadAssets = this.asyncLoadAssets : Editor.warn(`Can not find scene assset in the scene file "${e}", it maybe corrupted!`);
                var r = Editor.serialize.findRootObject(a, "cc.Scene");
                r ? r.autoReleaseAssets = this.autoReleaseAssets : Editor.warn(`Can not find scene in the scene file "${e}", it maybe corrupted!`), Editor.serialize.setName(a, Path.basenameNoExt(e)), this._assetdb.saveAssetToLibrary(this.uuid, a)
            }
            s && s(t)
        })
    }
    static defaultType() {
        return "scene"
    }
}
module.exports = SceneMeta;