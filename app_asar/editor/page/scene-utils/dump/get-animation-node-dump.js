var _nodeProperties = ["position", "x", "y", "scale", "scaleX", "scaleY", "rotation", "width", "height", "color", "opacity", "anchorX", "anchorY", "skewX", "skewY"];
Editor.getAnimationProperties = function (e, r) {
    function i(e, r, i, t) {
        var a = t[r];
        if (a && "type" !== i && "__scriptAsset" !== i) {
            var o, p = e[i];
            if (a.properties && (o = a.properties[i]), o && !1 !== o.visible) {
                var s = o.type;
                if (p && p.type && (s = p.type, delete p.type), !Array.isArray(p) && !1 !== o.visible && "cc.Node" !== s && !1 !== o.animatable) {
                    var c;
                    c = cc.js.getClassByName(r) ? r + "." + i : a.name + "." + i, n.push(c)
                }
            }
        }
    }

    function t(e, r) {
        var t = e.type;
        if (!t) return Editor.warn("Type can not be null"), void 0;
        r[t];
        var n = e.value;
        for (var a in n) "type" !== a && i(n, t, a, r)
    }
    var n = [],
        a = e.value,
        o = e.types;
    r && n.push("active"), n = n.concat(_nodeProperties);
    for (var p = a.__comps__, s = 0; s < p.length; ++s) {
        var c = p[s];
        "cc.Animation" !== c.type && t(c, o)
    }
    return n
}, Editor.getAnimationNodeDump = function (e, r) {
    if (!e) return {
        hierarchy: "",
        properties: "",
        animationProperties: [],
        animations: []
    };
    var i = e.getComponent(cc.Animation),
        t = [];
    if (i) {
        var n = i.getClips();
        t = (n = n.filter(function (e) {
            return !!e
        })).map(function (e) {
            return e._uuid
        })
    }
    var a = {},
        o = [];
    if (r) {
        a = Editor.getNodeDump(r);
        var p = r !== e;
        o = Editor.getAnimationProperties(a, p)
    }
    return {
        hierarchy: JSON.stringify(_Scene.dumpHierarchy(e, !0)),
        properties: JSON.stringify(a),
        animationProperties: o,
        animations: t
    }
};