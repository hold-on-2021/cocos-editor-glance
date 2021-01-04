"use strict";
const Path = require("fire-path"),
    SpriteMeta = require("./sprite-frame");
class SpriteAtlasMeta extends Editor.metas.asset {
    constructor(t) {
        super(t), this._rawTextureFile = "", this.rawTextureUuid = "", this.size = cc.size(0, 0), this.type = ""
    }
    static defaultType() {
        return "sprite-atlas"
    }
    static version() {
        return "1.2.4"
    }
    parse() {}
    useRawfile() {
        return !1
    }
    deserialize(t) {
        super.deserialize(t);
        var e, s, r = {};
        for (s in t.subMetas) e = t.subMetas[s], (r[s] = new SpriteMeta(this._assetdb)).deserialize(e);
        this.updateSubMetas(r), r = this.getSubMetas();
        for (s in r) r[s].import = this.importSprite, r[s].postImport = this.postImportSprite
    }
    dests() {
        let t = [this._assetdb._uuidToImportPathNoExt(this.uuid) + ".json"];
        var e = this.getSubMetas();
        for (var s in e) t.push(this._assetdb._uuidToImportPathNoExt(e[s].uuid) + ".json");
        return t
    }
    importSprite(t, e) {
        e && e()
    }
    postImportSprite(t, e) {
        var s = this.createSpriteFrame(t, this.rawWidth, this.rawHeight),
            r = Path.dirname(t),
            i = this._assetdb.fspathToUuid(r);
        i && (s._atlasUuid = i), this._assetdb.saveAssetToLibrary(this.uuid, s), e && e(null, s)
    }
    import(t, e) {
        this.parse(t);
        var s = this.getSubMetas();
        for (var r in s) s[r].import = this.importSprite, s[r].postImport = this.postImportSprite;
        e && e()
    }
    postImport(t, e) {
        var s = new cc.SpriteAtlas;
        s._name = Path.basename(t);
        var r, i, a = this.getSubMetas(),
            p = /\.[^.]+$/,
            o = [];
        for (var u in a) i = a[u], r = u.replace(p, ""), s._spriteFrames[r] && o.push(r), s._spriteFrames[r] = Editor.serialize.asAsset(i.uuid);
        o.length > 0 && Editor.warn("[SpriteAtlas postImport] Some of the frame keys have been overwritten : " + JSON.stringify(o)), this._assetdb.saveAssetToLibrary(this.uuid, s), e && e()
    }
}
module.exports = SpriteAtlasMeta;