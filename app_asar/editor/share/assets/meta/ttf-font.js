"use strict";
const Fs = require("fire-fs"),
    Path = require("fire-path"),
    CustomAssetMeta = Editor.metas["custom-asset"];
class TTFFontMeta extends CustomAssetMeta {
    constructor(t) {
        super(t)
    }
    static defaultType() {
        return "ttf-font"
    }
    dests() {
        var t = this._assetdb._uuidToImportPathNoExt(this.uuid),
            s = this._assetdb.uuidToFspath(this.uuid),
            e = Path.basename(s);
        return [t + ".json", Path.join(t, e)]
    }
    import(t, s) {
        var e = this,
            a = new cc.TTFFont;
        a.name = Path.basenameNoExt(t);
        var o = a.name + ".ttf";
        Fs.readFile(t, function (r, u) {
            if (u) {
                var i = e._assetdb;
                i.mkdirForAsset(e.uuid);
                var n = Path.join(i._uuidToImportPathNoExt(e.uuid), o);
                return Fs.copySync(t, n), a._setRawFiles([o]), i.saveAssetToLibrary(e.uuid, a), s()
            }
            s && s(r)
        })
    }
}
TTFFontMeta.prototype.export = null, module.exports = TTFFontMeta;