"use strict";

function getTrimmedLastLine(r) {
    var e = r.lastIndexOf("\n");
    if (-1 === e) return r;
    var t = r.substring(e).trim();
    return t || (e = r.lastIndexOf("\n", e - 1), t = r.substring(e).trim()), t
}

function loadFromComment(r) {
    var e = getTrimmedLastLine(r);
    if (!e) throw new Error("file is empty");
    if (e.startsWith("//")) {
        if (e.startsWith(SRCMAPS_COMMENT_HEAD)) {
            var t = e.substring(SRCMAPS_COMMENT_HEAD.length);
            if (t) {
                var s = window.atob(t);
                if (s) return JSON.parse(s);
                throw new Error("can not decode from base64")
            }
            throw new Error("sourcemaps is empty")
        }
        throw new Error("no source maps comment")
    }
    return null
}

function removeFileProtocol(r) {
    return Editor.isWin32 ? r.slice(8) : r.slice(7)
}

function normalizeLoadUrl(r) {
    return r = r.replace(/\\/g, "/"), r.startsWith("file:///") && (r = removeFileProtocol(r)), r
}
var Util = require("util"),
    Async = require("async"),
    SourceMapConsumer = require("source-map").SourceMapConsumer,
    Fs = require("fire-fs"),
    Path = require("fire-path");
const IGNORE_STACK_SUFFIX = "InTryCatch",
    IGNORE_STACK_SUFFIX_FILE = "CCComponent.js",
    SRCMAPS_COMMENT_HEAD = "//# sourceMappingURL=data:application/json;charset=utf-8;base64,",
    EVAL_BEGIN = " (eval at ",
    INFO_BEGIN = " ".repeat(4) + "at ",
    POS_LEFT = " (",
    POS_RIGHT = ")",
    POS_RIGHT_ASCII = POS_RIGHT.charCodeAt(0),
    DB_PROTOCOL_LEN = "db://".length,
    SOURCEMAPS_COMBINED = !0;
class SourceMapsFilter {
    constructor(r) {
        this.name = r, this.sourceMaps = {}
    }
    clear() {
        this.sourceMaps = {}
    }
    getLineOffset(r) {
        return 0
    }
    loadSourceMapsJSON(r, e) {}
    loadSingle(r, e) {
        this.loadSourceMapsJSON(r, (t, s) => {
            if (t || !s) return e();
            try {
                this.sourceMaps[r] = {
                    smc: new SourceMapConsumer(s),
                    sources: {},
                    json: s
                }
            } catch (t) {
                return Editor.error("Failed to load source map from %s\n%s", r, t), e(null, this.sourceMaps)
            }
            e(null, s.sources)
        })
    }
    load(r, e) {
        console.time("load sourcemaps for " + this.name), Async.map(r, this.loadSingle.bind(this), (r, t) => {
            var s = [];
            for (var i of t) i && (s = s.concat(i));
            console.timeEnd("load sourcemaps for " + this.name), e(r, s)
        })
    }
}
class SourceMapsPipeline {
    constructor(r) {
        this.filters = r
    }
    clear() {
        for (var r of this.filters) r.clear()
    }
    load(r, e) {
        Async.reduce(this.filters, [r], (r, e, t) => {
            e.load(r, t)
        }, (r, t) => {
            this._cacheSourcesContent(), this._normalizeGeneratedUrl(), e()
        })
    }
    flow(r, e, t) {
        for (var s, i, n, o = 0; o < this.filters.length && r; o++) {
            var a = this.filters[o],
                l = a.sourceMaps[r];
            if (!l) break;
            r = (i = (s = l).smc.originalPositionFor({
                line: e,
                column: t
            })).source, e = (n = i.line) - a.getLineOffset(s, r), t = i.column
        }
        return s && i && r ? {
            url: r,
            lineNum: e,
            injectedLineNum: n,
            columnNum: t,
            sources: s.sources
        } : null
    }
    transform(r, e, t) {
        var s = r.split("\n"),
            i = 1;
        e && t ? (s.shift(), s[0] = e) : i = this._adjustStack(s, e, t);
        for (var n = i; n < s.length; n++) {
            var o = s[n];
            if (o.startsWith(INFO_BEGIN) && o.charCodeAt(o.length - 1) === POS_RIGHT_ASCII) {
                var a = "",
                    l = o.indexOf(EVAL_BEGIN);
                if (-1 !== l) {
                    var c = o.indexOf(POS_LEFT, l + EVAL_BEGIN.length);
                    if (-1 === c) continue;
                    var u = o.indexOf(POS_RIGHT, c + POS_LEFT.length);
                    a = o.slice(c + POS_LEFT.length, u)
                } else {
                    if (l = o.lastIndexOf(POS_LEFT), -1 === l) continue;
                    a = o.slice(l + POS_LEFT.length, -1)
                }
                var f = a.lastIndexOf(":");
                if (-1 !== f) {
                    var d = parseInt(a.substring(f + 1));
                    if (!isNaN(d) && (f = a.lastIndexOf(":", f - 1), -1 !== f)) {
                        var h = parseInt(a.substring(f + 1));
                        if (!isNaN(h)) {
                            var m = a.lastIndexOf("?", f - 1);
                            f = -1 !== m ? m : f;
                            var p = a.substring(0, f);
                            if (p.endsWith(IGNORE_STACK_SUFFIX_FILE) && this._shouldHideInternal(p, o)) {
                                s.length = n;
                                break
                            }
                            p.startsWith("file:///") && (p = removeFileProtocol(p));
                            if (this.filters[0].sourceMaps[p]) {
                                var S = n === i,
                                    _ = this._transformLine(o, p, h, d, S, l);
                                _ && (s[n] = _)
                            }
                        }
                    }
                }
            }
        }
        return s.join("\n")
    }
    _adjustStack(r, e, t) {
        var s;
        return e ? s = 1 : -1 === (s = r.findIndex(r => r.startsWith(INFO_BEGIN))) && (s = r.length), t ? e ? (r.shift(), r[0] = e) : r.splice(s, 1) : e && (r[0] = e), s
    }
    _shouldHideInternal(r, e) {
        var t = r[r.length - IGNORE_STACK_SUFFIX_FILE.length - 1];
        if ("/" === t || "\\" === t) {
            var s = e.indexOf(" ", INFO_BEGIN.length),
                i = s - IGNORE_STACK_SUFFIX.length;
            return e.lastIndexOf(IGNORE_STACK_SUFFIX, s - 1) === i
        }
        return !1
    }
    _transformLine(r, e, t, s, i, n) {
        var o = this.flow(e, t, s);
        if (o) {
            e = o.url, s = o.columnNum, t = o.lineNum;
            var a;
            if (i) {
                var l = o.sources[e];
                if (l) {
                    var c = l[o.injectedLineNum];
                    c && (a = `${r.substring(0,n)}: "${c}" (`)
                }
            }
            return a = a || r.substring(0, n + POS_LEFT.length), s ? `${a}${e}:${t}:${s})` : `${a}${e}:${t})`
        }
        return ""
    }
    _cacheSourcesContent() {
        console.time("cache sources content for sourcemaps");
        for (var r = 0; r < this.filters.length; r++) {
            var e = this.filters[r].sourceMaps,
                t = this.filters[r + 1];
            for (var s in e) {
                var i = e[s],
                    n = i.json,
                    o = {};
                if (!n) break;
                for (var a = n.sourcesContent, l = 0; l < a.length; l++) {
                    var c = n.sources[l];
                    if (!(t && c in t.sourceMaps)) {
                        var u = a[l];
                        if (null == u) continue;
                        var f = (u = u.trimRight()).split("\n");
                        f.unshift(""), f = f.map(r => (r = r.trim(), r.startsWith("//") ? "" : (59 === r.charCodeAt(r.length - 1) && (r = r.slice(0, -1)), r))), o[c] = f
                    }
                }
                i.sources = o, n.sourcesContent = void 0, i.json = null
            }
        }
        console.timeEnd("cache sources content for sourcemaps")
    }
    _normalizeGeneratedUrl() {
        if (this.filters.length > 0) {
            var r = this.filters[0].sourceMaps;
            for (var e in r) {
                var t = normalizeLoadUrl(e);
                t !== e && (r[t] = r[e], delete r[e])
            }
        }
    }
}
class Babel extends SourceMapsFilter {
    constructor() {
        super("Babel")
    }
    loadSourceMapsJSON(r, e) {
        var t = Path.basenameNoExt(r);
        Editor.Utils.UuidUtils.isUuid(t) ? Fs.readFile(r + ".map", (s, i) => {
            if (s) return e(s);
            var n;
            try {
                n = JSON.parse(i.toString())
            } catch (r) {
                return e(r)
            }
            var o = Editor.assetdb.remote.uuidToUrl(t);
            o ? (o = o.slice(DB_PROTOCOL_LEN), n.sources[0] = o) : n.sources[0] = r, e(null, n)
        }) : e()
    }
}
class Browserify extends SourceMapsFilter {
    constructor() {
        super("Browserify")
    }
    getLineOffset(r, e) {
        if (SOURCEMAPS_COMBINED) return 0;
        return e in r.sources ? 0 : 4
    }
    loadSourceMapsJSON(r, e) {
        Fs.readFile(r, (r, t) => {
            if (r) return e(r);
            var s;
            try {
                s = loadFromComment(t.toString())
            } catch (r) {
                return e(r)
            }
            if (!s) return e();
            SOURCEMAPS_COMBINED ? e(null, s) : Async.forEachOf(s.sources, (r, e, t) => {
                if (r.startsWith("assets")) {
                    var i = "db://" + r.replace(/\\/g, "/"),
                        n = Editor.assetdb.remote.urlToUuid(i);
                    if (n) {
                        r = Editor.assetdb.remote._uuidToImportPathNoExt(n) + ".js";
                        s.sources[e] = r
                    }
                }
                t()
            }, () => {
                e(null, s)
            })
        })
    }
}
var pipeline;
pipeline = new SourceMapsPipeline(SOURCEMAPS_COMBINED ? [new Browserify] : [new Browserify, new Babel]), module.exports = {
    init: function () {
        var r = this;
        cc.error = Editor.error = function (e) {
            if (e instanceof Error) e = r.transform(e.stack, "", !1);
            else {
                e = arguments.length > 1 ? Util.format.apply(Util, arguments) : "" + e;
                let t = new Error("dummy");
                e = r.transform(t.stack, e, !0)
            }
            console.error(e), Editor.Ipc.sendToMain("editor:renderer-console-error", e)
        }
    },
    reload: function (r, e) {
        pipeline.clear(), pipeline.load(r, e)
    },
    transform: function (r, e, t) {
        return pipeline.transform(r, e, t)
    },
    _UnitTest: {
        SourceMapsFilter: SourceMapsFilter,
        SourceMapsPipeline: SourceMapsPipeline
    }
};