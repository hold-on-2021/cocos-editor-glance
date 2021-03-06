"use strict";
var Fs = require("fire-fs"),
    Path = require("fire-path"),
    CustomAssetMeta = require("./custom-asset");
class PrefabMeta extends CustomAssetMeta {
    constructor(e) {
        super(e), this.asyncLoadAssets = !1
    }
    import(e, s) {
        Fs.readJson(e, (t, a) => {
            if (t) return s && s(t), void 0;
            if (a) {
                var r = Editor.serialize.findRootObject(a, "cc.Prefab");
                r ? r.asyncLoadAssets = this.asyncLoadAssets : Editor.warn(`Can not find prefab assset in the prefab file "${e}", it maybe corrupted!`), Editor.serialize.setName(a, Path.basenameNoExt(e)), this._assetdb.saveAssetToLibrary(this.uuid, a)
            }
            s && s(t)
        })
    }
    static defaultType() {
        return "prefab"
    }
}
module.exports = PrefabMeta;