"use strict";

function close(t, e) {
    return Math.abs(t - e) < EPSILON
}
let snapPixelWihVec2 = Editor.GizmosUtils.snapPixelWihVec2,
    EPSILON = 1e-6;
class Gizmo {
    constructor(t, e) {
        this.target = e, this.hovering = !1, this.selecting = !1, this.editing = !1, this._view = t, this._root = null, this._hidden = !0, this._adjustMap = [], this.registerAdjustValue(cc.Vec2, ["x", "y"]), this.registerAdjustValue(cc.Size, ["width", "height"]), this._dirty = !0, this._lastTransforms = {}, this.init && this.init()
    }
    layer() {
        return "scene"
    }
    createRoot() {
        let t = this._view[this.layer()];
        if (!t) return Editor.warn(`Plase make gizmo layer exists [${this.layer()}] in Gizmo View`), void 0;
        this._root = t.group(), this._registerEvent(), this.onCreateRoot && this.onCreateRoot()
    }
    registerMoveSvg(t, e, i) {
        i ? Editor.GizmosUtils.addMoveHandles(t, i, this.createMoveCallbacks(e)) : Editor.GizmosUtils.addMoveHandles(t, this.createMoveCallbacks(e))
    }
    createMoveCallbacks(t) {
        this._moveCallbacks || (this._moveCallbacks = this.onCreateMoveCallbacks());
        let e = this._moveCallbacks,
            i = !1;
        return {
            start: function (r, o, s) {
                i = !1;
                o = cc.view.getCanvasSize().height - o;
                let n = Array.prototype.slice.call(arguments, 2, arguments.length);
                n = [r, o].concat(n), n = void 0 !== t ? n.concat(t) : n, e.start && e.start.apply(this, n)
            }.bind(this),
            update: function (r, o, s) {
                if (0 === r && 0 === o) return;
                i = !0, o = -o, this.recordChanges();
                let n = Array.prototype.slice.call(arguments, 2, arguments.length);
                n = [r, o].concat(n), n = void 0 !== t ? n.concat(t) : n, e.update && e.update.apply(this, n), this._view.repaintHost()
            }.bind(this),
            end: function (r) {
                let o = Array.prototype.slice.call(arguments, 0, arguments.length);
                o = void 0 !== t ? o.concat(t) : o, e.end && e.end.apply(this, o), i && this.commitChanges(), i = !1
            }.bind(this)
        }
    }
    onCreateMoveCallbacks() {
        return {
            start(t, e, i) {},
            update(t, e, i) {},
            end(t) {}
        }
    }
    recordChanges() {
        this.nodes.forEach(t => {
            _Scene.Undo.recordNode(t.uuid)
        }), this._dirty = !0
    }
    commitChanges() {
        _Scene.AnimUtils.recordNodeChanged(this.nodes), _Scene.Undo.commit(), this._dirty = !0
    }
    worldToPixel(t) {
        return snapPixelWihVec2(this._view.worldToPixel(t))
    }
    pixelToWorld(t) {
        return this._view.pixelToWorld(t)
    }
    sceneToPixel(t) {
        return snapPixelWihVec2(this._view.sceneToPixel(t))
    }
    pixelToScene(t) {
        return this._view.pixelToScene(t)
    }
    defaultMinDifference() {
        return Editor.Math.numOfDecimalsF(1 / this._view.scale)
    }
    registerAdjustValue(t, e) {
        this._adjustMap.push({
            ctor: t,
            keys: e
        })
    }
    adjustValue(t, e, i) {
        Array.isArray(t) || (t = [t]), void 0 === e || Array.isArray(e) || (e = [e]), i = i || this.defaultMinDifference();
        let r = (t, e) => {
            if (e && "number" == typeof t[e]) return t[e] = Editor.Math.toPrecision(t[e], i), void 0; {
                let i = e ? t[e] : t,
                    o = this._adjustMap;
                for (let t = 0; t < o.length; t++) {
                    let e = o[t];
                    if (i === e.ctor || i.constructor === e.ctor) {
                        for (let t = 0; t < e.keys.length; t++) r(i, e.keys[t]);
                        return
                    }
                }
            }
            Editor.warn(`Try to adjust non-number value [${e}}]`)
        };
        for (let i = 0; i < t.length; i++) {
            let o = t[i];
            if (void 0 === e) r(o);
            else
                for (let t = 0; t < e.length; t++) r(o, e[t])
        }
    }
    targetValid() {
        let t = this.target;
        return Array.isArray(t) && (t = t[0]), t && t.isValid
    }
    visible() {
        return this.selecting || this.editing
    }
    _viewDirty() {
        let t = cc.director.getScene(),
            e = _Scene.NodeUtils.getWorldPosition(t),
            i = this._view.worldToPixel(e),
            r = !1;
        return this._lastMapping && close(this._lastMapping.x, i.x) && close(this._lastMapping.y, i.y) || (r = !0), this._lastMapping = i, r
    }
    _nodeDirty(t) {
        let e = (t = t || this.node).getNodeToWorldTransform(),
            i = this._lastTransforms[t.uuid],
            r = !1;
        return i && close(i.a, e.a) && close(i.b, e.b) && close(i.c, e.c) && close(i.d, e.d) && close(i.tx, e.tx) && close(i.ty, e.ty) || (r = !0), this._lastTransforms[t.uuid] = e, r
    }
    dirty() {
        return this._viewDirty() || this._nodeDirty() || this._dirty
    }
    update() {
        if (!this.targetValid() || !this.visible()) return this.hide(), void 0;
        if (this.show(), !this.dirty()) return;
        let t = cc.director && cc.director.getRunningScene();
        this.onUpdate && t && this.onUpdate(), this._dirty = !1
    }
    remove() {
        this._root && (this._root.remove(), this._root = null)
    }
    ensureRoot() {
        this._root || this.createRoot()
    }
    hide() {
        this._hidden || (this._root && this._root.hide(), this._hidden = !0, this._dirty = !0)
    }
    show() {
        this._hidden && (this.ensureRoot(), this._root && this._root.show(), this._hidden = !1, this._dirty = !0)
    }
    rectHitTest(t, e) {
        return !1
    }
    _registerEvent() {
        let t = this._root.node;
        t.addEventListener("mousedown", () => {
            let t = this.nodes.map(t => t.uuid);
            Editor.Selection.select("node", t)
        }, !0), t.addEventListener("mouseover", () => {
            Editor.Selection.hover("node", this.node.uuid)
        }, !0), t.addEventListener("mouseleave", () => {
            Editor.Selection.hover("node", null)
        }, !0), t.addEventListener("mousemove", t => {
            t.srcElement.instance.ignoreMouseMove || t.stopPropagation()
        })
    }
}
Object.defineProperty(Gizmo.prototype, "node", {
    get: function () {
        let t = this.target;
        return Array.isArray(t) && (t = t[0]), cc.Node.isNode(t) ? t : t instanceof cc.Component ? t.node : null
    }
}), Object.defineProperty(Gizmo.prototype, "nodes", {
    get: function () {
        let t = [],
            e = this.target;
        if (Array.isArray(e))
            for (let i = 0; i < e.length; ++i) {
                let r = e[i];
                cc.Node.isNode(r) ? t.push(r) : r instanceof cc.Component && t.push(r.node)
            } else cc.Node.isNode(e) ? t.push(e) : e instanceof cc.Component && t.push(e.node);
        return t
    }
}), Object.defineProperty(Gizmo.prototype, "topNodes", {
    get: function () {
        return this.target.filter(t => {
            let e = t.parent;
            for (; e;) {
                if (-1 !== this.target.indexOf(e)) return !1;
                e = e.parent
            }
            return !0
        })
    }
}), Object.defineProperty(Gizmo.prototype, "selecting", {
    get: function () {
        return this._selecting
    },
    set: function (t) {
        this._dirty = t !== this._selecting, this._selecting = t
    }
}), Object.defineProperty(Gizmo.prototype, "editing", {
    get: function () {
        return this._editing
    },
    set: function (t) {
        this._dirty = t !== this._editing, this._editing = t
    }
}), Object.defineProperty(Gizmo.prototype, "hovering", {
    get: function () {
        return this._hovering
    },
    set: function (t) {
        this._dirty = t !== this._hovering, this._hovering = t
    }
}), module.exports = Gizmo;