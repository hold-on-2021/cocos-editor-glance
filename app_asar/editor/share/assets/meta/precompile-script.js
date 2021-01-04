function addMetaData(e, t, a, r) {
    var o, c = a.outputText,
        i = (Editor.assetdb.getRelativePath(t) || "").replace(/\\/g, "/"),
        u = c[c.length - 1],
        p = "\n" === u || "\r" === u;
    o = e ? '"use strict";\n' + `cc._RF.push(module, '${e=Editor.Utils.UuidUtils.compressUuid(e)}', '${r}');\n` + `// ${i}\n\n` : '"use strict";\n' + `cc._RF.push(module, '${r}');\n` + `// ${i}\n\n`;
    var s = "\ncc._RF.pop();";
    p || (s = "\n" + s), a.outputText = o + c + s, a.sourceMapObject = RefineSourceMap.offsetLines(a.sourceMapObject, 4)
}

function compile(e, t, a, r) {
    var o = Path.basenameNoExt(t);
    let c = Path.relative(Editor.projectPath, t),
        i = Path.join(Editor.projectPath, "temp", "quick-scripts", c),
        u = Path.relative(Path.dirname(i), Path.dirname(t));
    a.sourceMapObject.sources = [c], a.sourceMapObject.sourceRoot = u, addMetaData(e, t, a, o), r(null, a)
}
const Path = require("fire-path"),
    RefineSourceMap = Editor.require("app://editor/page/refine-sourcemap");
module.exports = {
    compile: compile
};