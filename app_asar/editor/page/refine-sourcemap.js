function offsetLines(e, r) {
    var o = new SourceMapConsumer(e),
        n = new SourceMapGenerator({
            file: e.file,
            sourceRoot: e.sourceRoot
        });
    o.eachMapping(function (o) {
        o.source || (o.source = e.sources[0]), "number" == typeof o.originalLine && 0 < o.originalLine && "number" == typeof o.originalColumn && 0 <= o.originalColumn && o.source && n.addMapping({
            source: o.source,
            name: o.name,
            original: {
                line: o.originalLine,
                column: o.originalColumn
            },
            generated: {
                line: o.generatedLine + r,
                column: o.generatedColumn
            }
        })
    });
    var t = JSON.parse(n.toString());
    return void 0 !== e.sourcesContent && (t.sourcesContent = e.sourcesContent), t
}

function getBabelSourceMaps(e, r, o) {
    let n = {};
    for (let t = 0; t < e.sources.length; ++t) {
        let i = e.sources[t],
            u = Path.resolve(o, i);
        u = r[u] || r[u.toLowerCase()] || u;
        let a = "";
        try {
            a = Fs.readFileSync(u + ".map", "utf8")
        } catch (n) {
            let s = Path.basenameNoExt(u);
            if (Editor.Utils.UuidUtils.isUuid(s)) {
                let n = Editor.assetdb.remote.uuidToFspath(s);
                if (n && (u = r[n] || r[n.toLowerCase()], u)) {
                    try {
                        a = Fs.readFileSync(u + ".map", "utf8")
                    } catch (e) {}
                    i = e.sources[t] = Path.relative(o, n)
                }
            }
            if (!a) continue
        }
        let s = new SourceMapConsumer(a);
        n[i] = s
    }
    return n
}

function merge(e, r) {
    var o = new SourceMapConsumer(r),
        n = new SourceMapGenerator,
        t = {
            line: 0,
            column: 0,
            bias: SourceMapConsumer.LEAST_UPPER_BOUND
        },
        i = {
            original: null,
            generated: {
                line: 0,
                column: 0
            },
            source: "",
            name: ""
        };
    o.eachMapping(function (r) {
        if (null == r.originalLine) return;
        let o = r.source,
            u = e[o];
        if (!u) return;
        t.line = r.originalLine, t.column = r.originalColumn;
        let a = u.originalPositionFor(t);
        null != a.source && (i.original = a, i.generated.line = r.generatedLine, i.generated.column = r.generatedColumn, i.source = o, i.name = r.name, n.addMapping(i))
    });
    var u = JSON.parse(n.toString());
    u.sourcesContent = [], u.sourceRoot = r.sourceRoot;
    for (let r = 0; r < u.sources.length; ++r) {
        let o = u.sources[r],
            n = e[o];
        n && (u.sourcesContent[r] = n.sourcesContent[0])
    }
    return u
}

function refineSourceMap(e, r, o) {
    if (e.sourceMap) {
        let n = e.sourceMap,
            t = getBabelSourceMaps(n, r, o);
        e.sourceMap = merge(t, n)
    } else Editor.error("gulp-sourcemaps not initialized")
}

function pipeline(e, r) {
    return es.through(function (o) {
        refineSourceMap(o, e, r), this.emit("data", o)
    })
}
const Fs = require("fire-fs"),
    Path = require("fire-path"),
    SourceMap = require("source-map"),
    SourceMapConsumer = SourceMap.SourceMapConsumer,
    SourceMapGenerator = SourceMap.SourceMapGenerator,
    es = require("event-stream");
module.exports = pipeline, module.exports.offsetLines = offsetLines;