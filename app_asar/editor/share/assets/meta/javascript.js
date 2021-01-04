"use strict";

function bytesToSize(e) {
    if (0 === e) return "0 B";
    var t = Math.floor(Math.log(e) / Math.log(1024));
    return (e / Math.pow(1024, t)).toPrecision(3) + " " + ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][t]
}

function mightBePlugin(e) {
    if (-1 !== Path.basename(e).lastIndexOf(".min.")) return !0;
    var t = Fs.statSync(e);
    return t && t.size >= fileSzie
}

function _showPluginDialog(e) {
    var t = Path.basename(e),
        i = Fs.statSync(e);
    return 0 === Editor.Dialog.messageBox({
        type: "question",
        buttons: [Editor.T("MESSAGE.yes"), Editor.T("MESSAGE.no")],
        title: Editor.T("MESSAGE.assets.plugin_title"),
        message: Editor.T("MESSAGE.assets.plugin_message", {
            fileName: t
        }),
        detail: Editor.T("MESSAGE.assets.plugin_detail", {
            fileSize: bytesToSize(i.size)
        }),
        defaultId: 0,
        cancelId: 1,
        noLink: !0
    })
}
var DEBUG_ALWAYS_REIMPORT = !1,
    Fs = require("fire-fs"),
    Readline = require("readline"),
    Path = require("fire-path"),
    Async = require("async"),
    Babel = require("babel-core"),
    ConvSrcMap = require("convert-source-map"),
    Precompiler = require("./precompile-script"),
    fileSzie = 92160;
class JavaScriptMeta extends Editor.metas.asset {
    constructor(e) {
        super(e), this.isPlugin = null, this.loadPluginInWeb = !0, this.loadPluginInNative = !0, this.loadPluginInEditor = !1
    }
    static defaultType() {
        return "javascript"
    }
    static version() {
        return "1.0.5"
    }
    useRawfile() {
        return !1
    }
    getImportedPaths() {
        var e = this._assetdb._uuidToImportPathNoExt(this.uuid);
        return [e + ".js", e + ".js.map"]
    }
    dests() {
        if (null === this.isPlugin) {
            var e = this._assetdb.uuidToFspath(this.uuid);
            this.isPlugin = mightBePlugin(e)
        }
        return this.isPlugin ? [] : this.getImportedPaths()
    }
    compile(e, t) {
        var i;
        try {
            var s = Fs.readFileSync(e, {
                    encoding: "utf-8"
                }),
                r = !!ConvSrcMap.fromSource(s);
            i = Babel.transform(s, {
                ast: !1,
                highlightCode: !1,
                sourceMaps: !0,
                inputSourceMap: r,
                compact: !1,
                filename: e,
                presets: ["env"],
                plugins: ["transform-decorators-legacy", "transform-class-properties", "add-module-exports"]
            })
        } catch (e) {
            return t(e)
        }
        t(null, {
            outputText: i.code,
            sourceMapObject: i.map
        })
    }
    _importToLibrary(e, t) {
        Async.waterfall([t => {
            this.compile(e, function (e, i) {
                e && (e.code = "ESCRIPTIMPORT", e.stack = "Compile error: " + e.stack), t(e, i)
            })
        }, Precompiler.compile.bind(null, this.uuid, e), (e, t) => {
            this._assetdb.saveAssetToLibrary(this.uuid, e.outputText, ".js"), this._assetdb.saveAssetToLibrary(this.uuid, JSON.stringify(e.sourceMapObject), ".js.map"), t(null)
        }], t)
    }
    checkGlobalVariables(e, t) {
        var i = /^var\s+\S+/,
            s = Readline.createInterface({
                input: Fs.createReadStream(e)
            });
        s.on("line", t => {
            i.test(t) && Editor.info(Editor.T("MESSAGE.assets.js_global_var_1_4", {
                path: e,
                line: t.trim()
            }))
        }), s.on("close", t)
    }
    import(e, t) {
        if (null === this.isPlugin && (this.isPlugin = !1, mightBePlugin(e) && (this.isPlugin = _showPluginDialog(e))), this.isPlugin) {
            if (!this.loadPluginInEditor) return t();
            this.checkGlobalVariables(e, t)
        } else this._importToLibrary(e, t)
    }
    export (e, t, i) {
        t ? Fs.writeFile(e, t, i) : i && i()
    }
}
DEBUG_ALWAYS_REIMPORT && (JavaScriptMeta.version = function () {
    return (10 * Math.random() | 0) + "." + (10 * Math.random() | 0) + "." + (10 * Math.random() | 0)
}), module.exports = JavaScriptMeta;