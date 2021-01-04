function report(s, e, r, i) {
    var t = MissingReporter.getObjectType(r),
        n = i && Url.basename(i);
    if (r instanceof cc.SceneAsset || r instanceof cc.Prefab) {
        var o, a, l;
        s instanceof cc.Component ? l = (a = s).node : cc.Node.isNode(s) && (l = s);
        var c = n ? ` in ${t} "${n}"` : "",
            p = e,
            d = !1;
        if (a) {
            var g = cc.js.getClassName(a);
            a instanceof cc._MissingScript && (d = !0, p = g = a._$erialized.__type__), o = `Class "${e}" used by component "${g}"${c} is missing or invalid.`
        } else {
            if (!l) return;
            d = !0, o = `Script attached to "${l.name}"${c} is missing or invalid.`
        }
        o += MissingReporter.INFO_DETAILED, o += `Node path: "${NodeUtils.getNodePath(l)}"\n`, i && (o += `Asset url: "${i}"\n`), d && Editor.Utils.UuidUtils.isUuid(p) && (o += `Script UUID: "${Editor.Utils.UuidUtils.decompressUuid(p)}"\n`, o += `Class ID: "${p}"\n`), o.slice(0, -1), Editor.warn(o)
    }
}

function reportByWalker(s, e, r, i, t, n) {
    n = n || s._$erialized && s._$erialized.__type__;
    report(e instanceof cc.Component || cc.Node.isNode(e) ? e : _.findLast(r, s => s instanceof cc.Component || cc.Node.isNode(s)), n, i, t)
}

function MissingClassReporter(s) {
    MissingReporter.call(this, s)
}
var _ = require("lodash"),
    Url = require("fire-url"),
    ObjectWalker = require("../../share/engine-extends/object-walker"),
    NodeUtils = Editor.require("app://editor/page/scene-utils/node-utils"),
    getClassById = cc.js._getClassById,
    MissingReporter = require("./missing-reporter");
cc.js.extend(MissingClassReporter, MissingReporter), MissingClassReporter.prototype.report = function () {
    ObjectWalker.walk(this.root, (s, e, r, i) => {
        this.missingObjects.has(r) && reportByWalker(r, s, i, this.root)
    })
}, MissingClassReporter.prototype.reportByOwner = function () {
    var s;
    this.root instanceof cc.Asset && (s = Editor.assetdb.remote.uuidToUrl(this.root._uuid)), ObjectWalker.walkProperties(this.root, (e, r, i, t) => {
        var n = this.missingOwners.get(e);
        if (n && r in n) {
            var o = n[r];
            reportByWalker(i, e, t, this.root, s, o)
        }
    }, {
        dontSkipNull: !0
    })
};
var MissingClass = {
    reporter: new MissingClassReporter,
    classFinder: function (s, e, r, i) {
        var t = getClassById(s);
        return t || (s && (MissingClass.hasMissingClass = !0, MissingClass.reporter.stashByOwner(r, i, s)), null)
    },
    hasMissingClass: !1,
    reportMissingClass: function (s) {
        MissingClass.reporter.root = s, MissingClass.reporter.reportByOwner(), MissingClass.reporter.reset()
    }
};
MissingClass.classFinder.onDereferenced = function (s, e, r, i) {
    var t = MissingClass.reporter.removeStashedByOwner(s, e);
    t && MissingClass.reporter.stashByOwner(r, i, t)
}, module.exports = {
    MissingClass: MissingClass,
    MissingClassReporter: MissingClassReporter
};