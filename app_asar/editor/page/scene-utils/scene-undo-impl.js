"use strict";

function copyField(e) {
    return e instanceof cc.ValueType ? e.clone() : e
}

function copyByKeys(e, r, o, t) {
    o = o || copyField;
    let c = {};
    if (t)
        for (let n = 0; n < r.length; n++) {
            let s = r[n];
            t(s) && (c[s] = o(e[s]))
        } else
            for (let t = 0; t < r.length; t++) {
                let n = r[t];
                c[n] = o(e[n])
            }
    return c
}

function shadowCopy(e) {
    if (!e || "object" != typeof e) return e;
    if (Array.isArray(e)) return e.map(copyField);
    return e.constructor === Object ? copyByKeys(e, Object.getOwnPropertyNames(e)) : copyField(e)
}

function recordObject(e) {
    if (!e || "object" != typeof e) return Editor.error("Unknown object to record"), void 0;
    if (Array.isArray(e)) return e.map(shadowCopy);
    var r = e.constructor;
    if (r === Object) return copyByKeys(e, Object.getOwnPropertyNames(e), shadowCopy);
    if (cc.Class._isCCClass(r)) {
        var o = r.__props__,
            t = cc.Class.Attr.getClassAttrs(r),
            c = copyByKeys(e, o, shadowCopy, function (r) {
                var o = t[r + HAS_GETTER];
                return !(!o && !1 === t[r + SERIALIZABLE]) && (o === t[r + HAS_SETTER] && ((!e.hasOwnProperty(r) || "function" !== e[r]) && (!cc.Node.isNode(e) || !SKIP_NODE_PROPS.includes(r))))
            });
        return e.__asyncStates && (c.__asyncStates = JSON.parse(JSON.stringify(e.__asyncStates))), c
    }
    Editor.error("Unknown object to record")
}

function getShadowCopy(e, r) {
    return r && e && "object" == typeof r ? r.constructor !== e.constructor ? r : Array.isArray(r) ? (restoreArray(e, r), e) : e.constructor === Object ? (restorePrimitiveObj(e, r), e) : copyField(r) : r
}

function restoreArray(e, r, o) {
    var t, c = e.length = r.length;
    if (o)
        for (t = 0; t < c; t++) e[t] = o(e[t], r[t]);
    else
        for (t = 0; t < c; t++) e[t] = copyField(r[t])
}

function restorePrimitiveObj(e, r, o) {
    var t;
    for (t in e) t in r || delete e[t];
    if (o)
        for (t in r) e[t] = o(e[t], r[t]);
    else
        for (t in r) e[t] = copyField(r[t])
}

function restoreAsyncOperation(e, r) {
    var o = r.__asyncStates;
    if (o)
        for (var t in o) {
            var c = o[t];
            "start" === c.state && Editor.setAsset(e, t, c.uuid)
        }
}

function restoreCCClass(e, r) {
    if (e instanceof cc.Object && cc.Object._willDestroy(e)) {
        !cc.isValid(r) || cc.Object._willDestroy(r) || cc.Object._cancelDestroy(e)
    }
    var o, t, c, n = "function" == typeof e.onRestore;
    if (!n)
        for (c in r)
            if (o = cc.js.getPropertyDescriptor(e, c), o && o.set) {
                t = getShadowCopy(e[c], r[c]);
                var s = e[c];
                if (t !== s) {
                    if (t instanceof cc.ValueType) {
                        if (t.equals(s)) continue
                    } else if (s instanceof cc.ValueType && s.equals(t)) continue;
                    e[c] = t
                }
            } for (c in r)
        if (o = Object.getOwnPropertyDescriptor(e, c), o && "value" in o) {
            o.writable && (e[c] = getShadowCopy(e[c], r[c]))
        } restoreAsyncOperation(e, r), n && e.onRestore()
}

function restoreObject(e, r) {
    if (!e || "object" != typeof e) return Editor.error("Unknown object to restore");
    if (!r) return Editor.error("Invalid record to restore");
    if (Array.isArray(e)) restoreArray(e, r, getShadowCopy);
    else {
        var o = e.constructor;
        o === Object ? restorePrimitiveObj(e, r, getShadowCopy) : cc.Class._isCCClass(o) ? restoreCCClass(e, r) : Editor.error("Unknown object to restore")
    }
}

function renewObject(e) {
    e._objFlags &= cc.Object.Flags.PersistentMask, e._objFlags &= ~cc.Object.Flags.Destroyed, e instanceof cc.Component && (cc.engine.attachedObjsForEditor[e.uuid] = e)
}

function recordNode(e) {
    for (var r = {}, o = 0; o < e._components.length; ++o) {
        var t = e._components[o];
        r[t.uuid] = recordObject(t)
    }
    return {
        node: recordObject(e),
        comps: r
    }
}

function restoreNode(e, r) {
    for (var o in r.comps) {
        var t = cc.engine.getInstanceById(o);
        t && restoreObject(t, r.comps[o])
    }
    restoreObject(e, r.node)
}

function recordAnimationNode(e) {
    for (var r = {}, o = 0; o < e._components.length; ++o) {
        var t = e._components[o];
        t instanceof cc.Animation || (r[t.uuid] = recordObject(t))
    }
    return {
        node: recordObject(e),
        comps: r
    }
}

function restoreAnimationNode(e, r) {
    var o = e._components.slice(),
        t = e._children.slice();
    restoreNode(e, r), e._components = o, e._children = t
}

function _recordChildNode(e) {
    for (var r = [], o = 0; o < e._components.length; ++o) {
        var t = e._components[o];
        r.push({
            comp: t,
            data: recordObject(t)
        })
    }
    return {
        nodeData: recordObject(e),
        compInfos: r
    }
}

function recordDeleteNode(e) {
    var r = [];
    _Scene.walk(e, !1, function (e) {
        r.push({
            node: e,
            data: _recordChildNode(e)
        })
    });
    for (var o = [], t = 0; t < e._components.length; ++t) {
        var c = e._components[t];
        o.push({
            comp: c,
            data: recordObject(c)
        })
    }
    return {
        parent: e.parent,
        siblingIndex: e.getSiblingIndex(),
        nodeData: recordObject(e),
        compInfos: o,
        childInfos: r
    }
}

function _restoreChildNode(e, r) {
    restoreObject(e, r.nodeData), renewObject(e), r.compInfos.forEach(function (e) {
        restoreObject(e.comp, e.data), renewObject(e.comp)
    })
}

function restoreDeleteNode(e, r) {
    r.compInfos.forEach(function (e) {
        restoreObject(e.comp, e.data), renewObject(e.comp)
    }), r.childInfos.forEach(function (e) {
        _restoreChildNode(e.node, e.data)
    }), restoreObject(e, r.nodeData), renewObject(e), e.parent = r.parent, e.setSiblingIndex(r.siblingIndex)
}
var SKIP_NODE_PROPS = ["_parent", "_children", "parent", "children"],
    HAS_GETTER = cc.Class.Attr.DELIMETER + "hasGetter",
    HAS_SETTER = cc.Class.Attr.DELIMETER + "hasSetter",
    SERIALIZABLE = cc.Class.Attr.DELIMETER + "serializable";
_Scene._UndoImpl = module.exports = {
    recordObject: recordObject,
    restoreObject: restoreObject,
    renewObject: renewObject,
    recordNode: recordNode,
    restoreNode: restoreNode,
    recordAnimationNode: recordAnimationNode,
    restoreAnimationNode: restoreAnimationNode,
    recordDeleteNode: recordDeleteNode,
    restoreDeleteNode: restoreDeleteNode
};