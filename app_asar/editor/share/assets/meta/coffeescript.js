"use strict";
var Fs = require("fire-fs"),
    Path = require("fire-path");
class CoffeeScriptMeta extends(require("./javascript")) {
    static defaultType() {
        return "coffeescript"
    }
    compile(e, r) {
        var t, c, s = require("coffee-script");
        try {
            var a = Fs.readFileSync(e, {
                encoding: "utf-8"
            });
            t = s.compile(a, {
                sourceMap: !0
            }), c = JSON.parse(t.v3SourceMap)
        } catch (e) {
            return r(e)
        }
        c.sourcesContent = [t.js];
        let i = Path.relative(Editor.projectInfo.path, e);
        c.sources = [i], t.sourceMapObject = c, t.outputText = t.js, r(null, t)
    }
}
module.exports = CoffeeScriptMeta;