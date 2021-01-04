"use strict";

function _isChildClassOf(e, t) {
    if (e && t) {
        let a = Object.getPrototypeOf(e.prototype);
        for (; a;) {
            if (e = a.constructor, e === t) return !0;
            a = Object.getPrototypeOf(e.prototype)
        }
    }
    return !1
}
const Path = require("fire-path"),
    Fs = require("fire-fs"),
    RawAssetMeta = require("./meta/raw-asset"),
    AssetMeta = require("./meta/asset"),
    FolderMeta = require("./meta/folder");
let Meta = {
    RawAssetMeta: RawAssetMeta,
    AssetMeta: AssetMeta,
    FolderMeta: FolderMeta,
    defaultMetaType: RawAssetMeta,
    create(e, t, a) {
        if (".meta" !== Path.extname(t)) return e.error("Invalid metapath %s, must use .meta as suffix", t), null;
        let r = Meta.findCtor(e, e._metaToAssetPath(t));
        if (!r) return null;
        if (!a && Fs.existsSync(t)) try {
            a = JSON.parse(Fs.readFileSync(t)).uuid
        } catch (e) {
            a = null
        }
        let s = new r(e);
        return a && (s.uuid = a), s
    },
    createSubMeta(e, t, a) {
        if ("function" != typeof t) return e.error("Invalid constructor for sub meta"), null;
        let r = new t(e);
        return a && (r.uuid = a), r
    },
    findCtor(e, t) {
        if (".meta" === Path.extname(t)) return e.error("Invalid assetpath, must not use .meta as suffix"), null;
        let a = Path.extname(t),
            r = Fs.existsSync(t);
        if (!a && !1 === r) return Meta.FolderMeta;
        a = a.toLowerCase();
        let s = Fs.isDirSync(t),
            i = e._extname2infos[a];
        if (i)
            for (let e = 0; e < i.length; ++e) {
                let a = i[e];
                if (s && !a.folder || !s && a.folder) continue;
                let n = a.ctor;
                if (!n.validate) return n;
                if (r) try {
                    if (n.validate(t)) return n
                } catch (e) {}
            }
        return s ? Meta.FolderMeta : Meta.defaultMetaType
    },
    register: (e, t, a, r) => (t = t.toLowerCase(), r === Meta.RawAssetMeta || _isChildClassOf(r, Meta.RawAssetMeta) ? "string" != typeof t || "." !== t[0] ? (e.warn('Invalid extname %s, must be string and must in the format ".foo"', t), void 0) : (e._extname2infos[t] || (e._extname2infos[t] = []), e._extname2infos[t].unshift({
        folder: a,
        ctor: r
    }), void 0) : (e.warn("Failed to register meta to %s, the metaCtor is not extended from RawAssetMeta", t), void 0)),
    unregister(e, t) {
        for (let a in e._extname2infos) e._extname2infos[a].ctor === t && delete e._extname2infos[a]
    },
    reset(e) {
        e._extname2infos = {}
    },
    isInvalid: (e, t, a) => t.uuid !== a.uuid,
    get: (e, t) => e._uuid2meta[t],
    load(e, t) {
        if (".meta" !== Path.extname(t)) return e.error("Invalid metapath, must use .meta as suffix"), null;
        if (e.isSubAssetByPath(t)) {
            let a = Meta.load(e, Path.dirname(t) + ".meta"),
                r = Path.basenameNoExt(t);
            if (!a) return null;
            let s = a.getSubMetas();
            return s && s[r] ? s[r] : null
        }
        if (!Fs.existsSync(t)) return null;
        let a;
        try {
            a = JSON.parse(Fs.readFileSync(t))
        } catch (a) {
            return e.failed("Failed to load meta %s, message: %s", t, a.message), null
        }
        let r = Meta.create(e, t, a.uuid);
        if (!r) return null;
        if (Meta.isInvalid(e, r, a)) return null;
        r.deserialize(a), e._uuid2meta[r.uuid] = r;
        let s = r.getSubMetas();
        if (s)
            for (let t in s) {
                let a = s[t];
                e._uuid2meta[a.uuid] = a
            }
        return r
    },
    save(e, t, a) {
        if (".meta" !== Path.extname(t)) return e.error("Invalid metapath, must use .meta as suffix"), null;
        let r = a.serialize();
        Fs.writeFileSync(t, JSON.stringify(r, null, 2)), e._uuid2meta[a.uuid] = a;
        let s = a.getSubMetas();
        if (s)
            for (let t in s) {
                let a = s[t];
                e._uuid2meta[a.uuid] = a
            }
    }
};
module.exports = Meta;