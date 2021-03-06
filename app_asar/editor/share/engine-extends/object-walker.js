function ObjectWalkerBehavior(e) {
    this.root = e
}

function ObjectWalker(e, t, r) {
    if (ObjectWalkerBehavior.call(this, e), this.iteratee = t, this.parsedObjects = [], this.parsedKeys = [], this.walked = new Set, this.walked.add(e), this.ignoreParent = r && r.ignoreParent, this.ignoreParent)
        if (this.root instanceof cc.Component) this.ignoreParent = this.root.node;
        else {
            if (!(this.root instanceof cc._BaseNode)) return cc.error("can only ignore parent of scene node");
            this.ignoreParent = this.root
        } this.parseObject(e)
}

function walk(e, t) {
    new ObjectWalker(e, t)
}

function doWalkProperties(e, t) {
    staticDummyWalker.root = null, staticDummyWalker.walk = t, staticDummyWalker.parseObject(e)
}

function walkProperties(e, t, r) {
    var a = r && r.dontSkipNull;
    new ObjectWalker(e, function (e, r, s, o) {
        !s || "object" != typeof s || (o.push(e), doWalkProperties(s, function (e, r, s) {
            "object" == typeof s && (a || s) && t(e, r, s, o)
        }), o.pop())
    }, r)
}

function getNextProperty(e, t, r) {
    var a, s = e.lastIndexOf(r);
    if (s === e.length - 1) a = t;
    else {
        if (!(0 <= s && s < e.length - 1)) return "";
        a = e[s + 1]
    }
    var o = "";
    return doWalkProperties(r, function (e, t, r) {
        r === a && (o = t)
    }), o
}
var CCAsset = cc.Asset,
    Attr = cc.Class.Attr,
    DELIMETER = Attr.DELIMETER,
    SERIALIZABLE = DELIMETER + "serializable",
    getClassId = cc.js._getClassId;
ObjectWalkerBehavior.prototype.walk = null, ObjectWalkerBehavior.prototype.parseObject = function (e) {
    if (Array.isArray(e)) this.forEach(e);
    else {
        var t = e.constructor;
        if ((e instanceof CCAsset || e instanceof _ccsg.Node || t !== Object && !getClassId(e, !1)) && e !== this.root) return;
        var r = t && t.__props__;
        r ? this.parseCCClass(e, t, r) : this.forIn(e)
    }
}, ObjectWalkerBehavior.prototype.parseCCClass = function (e, t, r) {
    for (var a = Attr.getClassAttrs(t), s = 0; s < r.length; s++) {
        var o = r[s];
        !1 !== a[o + SERIALIZABLE] && this.walk(e, o, e[o])
    }
}, ObjectWalkerBehavior.prototype.forIn = function (e) {
    for (var t in e) !e.hasOwnProperty(t) || 95 === t.charCodeAt(0) && 95 === t.charCodeAt(1) || this.walk(e, t, e[t])
}, ObjectWalkerBehavior.prototype.forEach = function (e) {
    for (var t = 0, r = e.length; t < r; ++t) this.walk(e, "" + t, e[t])
}, cc.js.extend(ObjectWalker, ObjectWalkerBehavior), ObjectWalker.prototype.walk = function (e, t, r) {
    if (r && "object" == typeof r) {
        if (this.walked.has(r)) return;
        if (this.ignoreParent)
            if (r instanceof cc._BaseNode) {
                if (!r.isChildOf(this.ignoreParent)) return
            } else if (r instanceof cc.Component && !r.node.isChildOf(this.ignoreParent)) return;
        this.walked.add(r), this.iteratee(e, t, r, this.parsedObjects, this.parsedKeys), this.parsedObjects.push(e), this.parsedKeys.push(e), this.parseObject(r), this.parsedObjects.pop(), this.parsedKeys.pop()
    }
};
var staticDummyWalker = new ObjectWalkerBehavior(null);
staticDummyWalker.walk = null, module.exports = {
    walk: walk,
    walkProperties: walkProperties,
    getNextProperty: getNextProperty,
    ObjectWalkerBehavior: ObjectWalkerBehavior
};