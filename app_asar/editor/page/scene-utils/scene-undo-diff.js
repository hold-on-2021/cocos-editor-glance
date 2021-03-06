function getHandle(e) {
    return e instanceof CCAsset ? "Asset:" + e._uuid : e instanceof CCNode ? "Node:" + e.uuid : e instanceof CCComponent ? "Component:" + e.uuid : ""
}

function creatorDiffFilter(e) {
    var t = e.left,
        i = e.right;
    if (t instanceof _ccsg.Node || i instanceof _ccsg.Node || t instanceof Node || i instanceof Node) return e.setResult([t, i]).exit(), void 0;
    if (t !== i) {
        var o = e.parent;
        if (o) {
            var n = e.childName;
            if (n) {
                var r = o.childName;
                if (r) {
                    var a = cc.engine.getInstanceById(r);
                    if (a) {
                        var c = cc.js.getPropertyDescriptor(a, n);
                        if (c && c.get) return e.setResult(void 0).exit(), void 0
                    }
                }
            }
        }
    }
    var f = getHandle(t),
        s = getHandle(i);
    (f || s) && (f === s ? e.setResult(void 0) : e.setResult([f || t, s || i]), e.exit())
}

function isComponentChanged(e, t) {
    return void 0 !== creatorDiffpatch.diff(e, t)
}
var Jsondiffpatch = require("jsondiffpatch"),
    CCAsset = cc.Asset,
    CCNode = cc._BaseNode,
    CCComponent = cc.Component;
creatorDiffFilter.filterName = "creator";
let creatorDiffpatch = Jsondiffpatch.create({
    arrays: {
        detectMove: !1,
        includeValueOnMove: !1
    }
});
creatorDiffpatch.processor.pipes.diff.after("trivial", creatorDiffFilter), module.exports = {
    isComponentChanged: isComponentChanged
};