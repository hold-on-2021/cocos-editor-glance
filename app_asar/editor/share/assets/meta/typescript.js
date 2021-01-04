"use strict";
var Fs = require("fire-fs"),
    Path = require("path"),
    Csm = require("convert-source-map"),
    TypeScript = require("typescript");
class TypeScriptMeta extends(require("./javascript")) {
    static defaultType() {
        return "typescript"
    }
    compile(e, t) {
        var r, p = "";
        try {
            p = Fs.readFileSync(e, {
                encoding: "utf-8"
            }), r = TypeScript.transpileModule(p, {
                compilerOptions: {
                    target: "ES5",
                    sourceMap: !0,
                    allowJS: !0,
                    experimentalDecorators: !0,
                    allowSyntheticDefaultImports: !0,
                    pretty: !0,
                    noEmitHelpers: !0,
                    noImplicitUseStrict: !0,
                    module: TypeScript.ModuleKind.CommonJS
                }
            })
        } catch (e) {
            return t(e)
        }
        let i = JSON.parse(r.sourceMapText);
        i.sourcesContent = [p], i.file = "", r.sourceMapObject = i, r.outputText = Csm.removeMapFileComments(r.outputText), t(null, r)
    }
}
module.exports = TypeScriptMeta;