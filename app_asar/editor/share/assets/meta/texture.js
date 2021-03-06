"use strict";
const SpriteMeta = require("./sprite-frame");
class TextureMeta extends Editor.metas.asset {
    constructor(e) {
        super(e), this.type = "sprite", this.wrapMode = "clamp", this.filterMode = "bilinear"
    }
    deserialize(e) {
        super.deserialize(e);
        let t = {};
        for (let s in e.subMetas) {
            let r = e.subMetas[s],
                i = new SpriteMeta(this._assetdb);
            i.deserialize(r), t[s] = i
        }
        this.updateSubMetas(t)
    }
    useRawfile() {
        return !0
    }
    dests() {
        if ("raw" === this.type) return [];
        let e = [];
        for (let t in this.__subMetas__) {
            let s = this.__subMetas__[t].uuid;
            e.push(this._assetdb._uuidToImportPathNoExt(s) + ".json")
        }
        return e
    }
    import(e, t) {
        if ("raw" === this.type) return this.updateSubMetas({}), t(), void 0;
        if ("sprite" === this.type) {
            const s = Editor.metas["sprite-frame"];
            let r = require("fire-path").basenameNoExt(e),
                i = this.getSubMetas(),
                a = Object.keys(i),
                u = null;
            return a.length && (u = i[a[0]]), u || (u = new s(this._assetdb)), u.rawTextureUuid = this.uuid, i = {
                [r]: u
            }, this.updateSubMetas(i), t(), void 0
        }
    }
    static defaultType() {
        return "texture"
    }
}
TextureMeta.prototype.export = null, module.exports = TextureMeta;