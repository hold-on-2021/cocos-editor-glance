"use strict";

function invokeOnDestroyRecursively(t) {
    let e = t._components.length;
    for (let n = 0; n < e; ++n) {
        let e = t._components[n];
        if ((cc.engine._isPlaying || e.constructor._executeInEditMode) && e.onDestroy) try {
            e.onDestroy()
        } catch (t) {
            cc._throw(t)
        }
    }
    for (let e = 0, n = t.childrenCount; e < n; ++e) {
        let n = t._children[e];
        n._active && n._disableChildComps()
    }
}
let Utils = {};
Utils.getWorldBounds = function (t, e, n) {
    e = e || t.getContentSize();
    let o = cc.rect(0, 0, e.width, e.height),
        c = t.getNodeToWorldTransform();
    return cc._rectApplyAffineTransformIn(o, c), n ? (n.x = o.x, n.y = o.y, n.width = o.width, n.height = o.height, n) : o
}, Utils.getWorldOrientedBounds = function (t, e, n, o, c, i) {
    let r = (e = e || t.getContentSize()).width,
        s = e.height;
    n = n || new cc.Vec2, o = o || new cc.Vec2, c = c || new cc.Vec2, i = i || new cc.Vec2;
    let l = new cc.Rect(0, 0, r, s),
        a = t.getNodeToWorldTransform();
    return cc.engine.obbApplyAffineTransform(a, l, n, o, c, i), [n, o, c, i]
}, Utils.getScenePosition = function (t) {
    let e = cc.director.getRunningScene();
    return e ? e.convertToNodeSpaceAR(Utils.getWorldPosition(t)) : (cc.error("Can not access scenePosition if no running scene"), cc.Vec2.ZERO)
}, Utils.setScenePosition = function (t, e) {
    let n = cc.director.getRunningScene();
    if (!n) return cc.error("Can not access scenePosition if no running scene"), void 0;
    Utils.setWorldPosition(t, cc.v2(n.convertToWorldSpaceAR(e)))
}, Utils.getSceneRotation = function (t) {
    let e = cc.director.getRunningScene();
    return e ? Utils.getWorldRotation(t) - e.rotationX : (cc.error("Can not access sceneRotation if no running scene"), 0)
}, Utils.setSceneRotation = function (t, e) {
    let n = cc.director.getRunningScene();
    if (!n) return cc.error("Can not access sceneRotation if no running scene"), void 0;
    Utils.setWorldRotation(n.rotationX + e)
}, Utils.getWorldPosition = function (t) {
    let e = t.convertToWorldSpaceAR(cc.p(0, 0));
    return cc.v2(e.x, e.y)
}, Utils.setWorldPosition = function (t, e) {
    if (e instanceof cc.Vec2)
        if (t.parent) {
            let n = t.parent.convertToNodeSpaceAR(e);
            t.x = n.x, t.y = n.y
        } else t.x = e.x, t.y = e.y;
    else cc.error("The new worldPosition must be cc.Vec2")
}, Utils.getWorldRotation = function (t) {
    let e = t.parent;
    return e ? e instanceof cc.Scene ? t.rotationX + e.rotationX : t.rotationX + Utils.getWorldRotation(e) : t.rotationX
}, Utils.setWorldRotation = function (t, e) {
    if (isNaN(e)) cc.error("The new worldRotation must not be NaN");
    else {
        let n = t.parent;
        n ? n instanceof cc.Scene ? t.rotation = e - n.rotationX : t.rotation = e - Utils.getWorldRotation(n) : t.rotation = e
    }
}, Utils.getWorldScale = function (t) {
    let e = t.getNodeToWorldTransformAR(),
        n = new cc.Vec2;
    n.x = Math.sqrt(e.a * e.a + e.b * e.b), n.y = Math.sqrt(e.c * e.c + e.d * e.d);
    return 0 !== e.a && e.a === -e.d && 0 === e.b && 0 === e.c && (e.a < 0 ? n.x = -n.x : n.y = -n.y), n
}, Utils._hasFlagInComponents = function (t, e) {
    let n = t._components;
    for (let t = 0, o = n.length; t < o; ++t) {
        if (n[t]._objFlags & e) return !0
    }
    return !1
}, Utils._destroyForUndo = function (t, e) {
    cc.Node.isNode(t) && (t._activeInHierarchy && t._disableChildComps(), invokeOnDestroyRecursively(t)), e(), t.destroy()
}, Utils.getNodePath = function (t) {
    let e = "";
    for (; t && !(t instanceof cc.Scene);) e = e ? t.name + "/" + e : t.name, t = t._parent;
    return e
};
var stack = new Array(32);
Utils.getChildUuids = function (t, e) {
    var n = [];
    e && n.push(t.uuid);
    var o = 0;
    for (stack[0] = t; o >= 0;) {
        var c = stack[o];
        if (stack[o] = null, --o, c) {
            var i = c._children;
            if (i)
                for (var r = 0, s = i.length; r < s; ++r) {
                    var l = i[r];
                    stack[++o] = l, n.push(l.uuid)
                }
        }
    }
    return n
}, _Scene.NodeUtils = module.exports = Utils;