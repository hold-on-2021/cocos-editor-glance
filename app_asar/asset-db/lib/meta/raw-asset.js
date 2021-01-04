"use strict";
const Fs = require("fire-fs"),
    Uuid = require("node-uuid");
class RawAssetMeta {
    constructor(t) {
        if (!t) throw new Error("AssetDB must be given while creating a new meta");
        this._assetdb = t, this.ver = this.constructor.version(), this.uuid || (this.uuid = Uuid.v4()), this.__subMetas__ = {}
    }
    useRawfile() {
        return !0
    }
    dests() {
        return []
    }
    serialize() {
        var t, e, s, r = {},
            i = Object.keys(this);
        for (t = 0; t < i.length; ++t) "_" !== (e = i[t])[0] && (r[e] = this[e]);
        if (this.__subMetas__) {
            r.subMetas = {};
            for (e in this.__subMetas__) s = this.__subMetas__[e], r.subMetas[e] = s.serialize()
        }
        return r
    }
    deserialize(t) {
        for (var e in t) void 0 !== this[e] && (this[e] = t[e])
    }
    export (t, e, s) {
        if (e) return Fs.writeFile(t, e, s), void 0;
        s && s()
    }
    getSubMetas() {
        return this.__subMetas__ ? this.__subMetas__ : null
    }
    copySubMetas() {
        var t, e, s, r = {},
            i = this.getSubMetas();
        if (i)
            for (t = Object.keys(i), e = 0; e < t.length; ++e) r[s = t[e]] = i[s];
        return r
    }
    updateSubMetas(t) {
        t = t || {}, this.__subMetas__ = t
    }
    assetType() {
        return this.constructor.defaultType()
    }
    static defaultType() {
        return "raw-asset"
    }
    static version() {
        return "1.0.0"
    }
}
RawAssetMeta.prototype.import = null, module.exports = RawAssetMeta;