var Fs = require("fire-fs"),
    Url = require("fire-url"),
    Path = require("fire-path"),
    Async = require("async"),
    Detective = require("detective");
let library = Editor.remote.importPath;
module.exports = {
    INTERNAL: "db://internal",
    isScript: e => "javascript" === e || "coffeescript" === e || "typescript" === e,
    sortAssetTree(e, r) {
        if (!e.children) return r();
        e.children.sort((e, r) => e.name + e.type > r.name + r.type), Async.each(e.children, this.sortAssetTree.bind(this), r)
    },
    queryDependScriptByUuid(e, r) {
        let t = [];
        Editor.assetdb.queryAssets(null, null, (i, s) => {
            this._queryDependScriptByUuid(e, t, s, () => {
                r(null, Object.keys(t))
            })
        })
    },
    _queryDependScriptByUuid(e, r, t, i) {
        if (r[e]) return i();
        r[e] = !0;
        let s = e.slice(0, 2) + Path.sep + e + ".js",
            n = Path.join(library, s),
            l = Fs.readFileSync(n, "utf-8"),
            u = Detective(l);
        if (0 === u.length) return i();
        Async.each(u, (e, i) => {
            for (let s = 0; s < t.length; ++s) {
                let n = t[s];
                if (this.isScript(n.type)) {
                    if (e === Path.basenameNoExt(n.path)) return this._queryDependScriptByUuid(n.uuid, r, t, i), void 0
                }
            }
            i()
        }, i)
    },
    queryDependsOfRawAssetByUrl(e, r) {
        let t = Url.dirname(e),
            i = Url.join(t, "*");
        Editor.assetdb.queryAssets(i, "texture", (e, t) => r(null, t))
    }
};