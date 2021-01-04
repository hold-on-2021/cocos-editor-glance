var Fs = require("fire-fs"),
    Url = require("fire-url"),
    Path = require("fire-path"),
    Async = require("async"),
    Depend = require("./parse/depend");
let getClassById = cc.js._getClassById,
    library = Editor.remote.importPath,
    deserializeDetails = new cc.deserialize.Details;
module.exports = {
    _queryDependAsset(e, r, i) {
        let s = Editor.remote.assetdb.uuidToUrl(e);
        if (!s || -1 !== s.indexOf(Depend.INTERNAL)) return i();
        let t = r[e];
        if (t) return i();
        if (Editor.remote.assetdb.isSubAssetByUuid(e)) {
            s = Editor.remote.assetdb.uuidToUrl(e);
            let d = Url.dirname(s);
            if (e = Editor.remote.assetdb.urlToUuid(d), t = r[e], t) return i()
        }
        r[e] = !0, Editor.assetdb.queryMetaInfoByUuid(e, (s, d) => {
            if (s) return Editor.error(s), void 0;
            deserializeDetails.reset();
            let l = Editor.assets[d.assetType];
            if (!l || cc.RawAsset.isRawAssetType(l)) return i();
            let u = JSON.parse(d.json);
            if (u && u.rawTextureUuid && (r[u.rawTextureUuid] = !0), Depend.isScript(d.assetType)) return Depend.queryDependScriptByUuid(e, (e, s) => {
                if (e) return Editor.error(e), void 0;
                Async.each(s, (e, i) => {
                    (t = r[e]) || (r[e] = !0), i()
                }, i)
            }), void 0;
            let a = e.slice(0, 2) + Path.sep + e + ".json",
                n = Path.join(library, a),
                o = Fs.readFileSync(n);
            cc.deserialize(o, deserializeDetails, {
                classFinder: function (e) {
                    if (Editor.Utils.UuidUtils.isUuid(e)) {
                        let r = Editor.Utils.UuidUtils.decompressUuid(e);
                        deserializeDetails.uuidList.push(r)
                    }
                    let r = getClassById(e);
                    return r || null
                }
            }), 0 === deserializeDetails.uuidList.length ? i() : Async.each(deserializeDetails.uuidList, (e, i) => {
                this._queryDependAsset(e, r, i)
            }, i)
        })
    },
    queryDependAsset(e, r) {
        let i = [];
        this._queryDependAsset(e, i, () => {
            r(null, Object.keys(i))
        })
    },
    "query-depend-asset"(e, r) {
        this.queryDependAsset(r, (r, i) => {
            if (r) return Editor.error(r), void 0;
            e.reply && e.reply(null, i)
        })
    }
};