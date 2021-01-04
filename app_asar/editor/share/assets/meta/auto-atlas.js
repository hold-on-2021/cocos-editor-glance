"use strict";
const Path = require("fire-path"),
    CustomAssetMeta = Editor.metas["custom-asset"];
class AutoAtlasMeta extends CustomAssetMeta {
    constructor(t) {
        super(t), this.maxWidth = 1024, this.maxHeight = 1024, this.padding = 2, this.allowRotation = !0, this.forceSquared = !1, this.powerOfTwo = !0, this.heuristices = "BestAreaFit", this.format = "png", this.quality = 80, this.contourBleed = !1, this.paddingBleed = !1, this.filterUnused = !1
    }
    static defaultType() {
        return "auto-atlas"
    }
    static version() {
        return "1.1.0"
    }
    import(t, s) {
        var e = {
            __type__: "cc.SpriteAtlas"
        };
        Editor.serialize.setName(e, Path.basenameNoExt(t)), this._assetdb.saveAssetToLibrary(this.uuid, e), s && s()
    }
}
module.exports = AutoAtlasMeta;