function MissingObjectReporter(e) {
    MissingReporter.call(this, e)
}
var Url = require("fire-url"),
    ObjectWalker = require("../../share/engine-extends/object-walker"),
    NodeUtils = Editor.require("app://editor/page/scene-utils/node-utils"),
    MissingReporter = require("./missing-reporter");
cc.js.extend(MissingObjectReporter, MissingReporter), MissingObjectReporter.prototype.doReport = function (e, t, s, i, r) {
    var o, n = "";
    if ((o = e instanceof cc.Component || e instanceof cc.Asset ? e : _.findLast(s, e => e instanceof cc.Component || e instanceof cc.Asset)) instanceof cc.Component) {
        n = ` by ${MissingReporter.getObjectType(o)} "${cc.js.getClassName(o)}"`
    }
    var c;
    if ("string" == typeof t) c = `Asset "${t}" used${n}${r} is missing.`;
    else {
        var a = cc.js.getClassName(t);
        a.startsWith("cc.") && (a = a.slice(3)), c = t instanceof cc.Asset ? `The ${a} used${n}${r} is missing.` : `The ${a} referenced${n}${r} is invalid.`
    }
    c += MissingReporter.INFO_DETAILED, o instanceof cc.Component && (c += `Node path: "${NodeUtils.getNodePath(o.node)}"\n`), i && (c += `Asset url: "${i}"\n`), t instanceof cc.Asset && t._uuid && (c += `Missing uuid: "${t._uuid}"\n`), c.slice(0, -1), Editor.warn(c)
}, MissingObjectReporter.prototype.report = function () {
    var e;
    this.root instanceof cc.Asset && (e = Editor.assetdb.remote.uuidToUrl(this.root._uuid));
    var t = MissingReporter.getObjectType(this.root),
        s = e ? ` in ${t} "${Url.basename(e)}"` : "";
    ObjectWalker.walk(this.root, (t, i, r, o, n) => {
        this.missingObjects.has(r) && this.doReport(t, r, o, e, s)
    })
}, MissingObjectReporter.prototype.reportByOwner = function () {
    var e;
    this.root instanceof cc.Asset && (e = Editor.assetdb.remote.uuidToUrl(this.root._uuid));
    var t = MissingReporter.getObjectType(this.root),
        s = e ? ` in ${t} "${Url.basename(e)}"` : "";
    ObjectWalker.walkProperties(this.root, (t, i, r, o) => {
        var n = this.missingOwners.get(t);
        if (n && i in n) {
            var c = n[i];
            this.doReport(t, c || r, o, e, s)
        }
    }, {
        dontSkipNull: !0
    })
}, module.exports = MissingObjectReporter;