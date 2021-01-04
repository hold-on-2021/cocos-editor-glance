"use strict";
var Fs = require("fire-fs"),
    Path = require("fire-path");
class CustomAssetMeta extends Editor.metas.asset {
    constructor(t) {
        super(t)
    }
    useRawfile() {
        return !1
    }
    dests() {
        return [this._assetdb._uuidToImportPathNoExt(this.uuid) + ".json"]
    }
    import(t, s) {
        Fs.readFile(t, "utf8", (e, r) => {
            if (r) {
                var a;
                try {
                    a = JSON.parse(r)
                } catch (t) {
                    return s && s(t), void 0
                }
                Editor.serialize.setName(a, Path.basenameNoExt(t)), this._assetdb.saveAssetToLibrary(this.uuid, a)
            }
            s && s(e)
        })
    }
    static defaultType() {
        return "custom-asset"
    }
}
module.exports = CustomAssetMeta;