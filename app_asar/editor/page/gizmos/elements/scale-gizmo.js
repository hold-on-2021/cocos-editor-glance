"use strict";
let Tools = require("./tools");
class ScaleGizmo extends Editor.Gizmo {
    init() {}
    layer() {
        return "foreground"
    }
    onCreateMoveCallbacks() {
        let t, e = [],
            o = [];
        return {
            start: () => {
                e = [];
                let i = this.topNodes;
                for (let t = 0; t < i.length; ++t) {
                    let o = i[t];
                    e.push(cc.v2(o.scaleX, o.scaleY))
                }
                if ("center" === this._view.pivot) {
                    t = Editor.GizmosUtils.getCenter(this.target), o.length = 0;
                    for (let e = 0; e < i.length; ++e) {
                        let s = _Scene.NodeUtils.getScenePosition(i[e]);
                        o.push(s.sub(t))
                    }
                }
            },
            update: (i, s) => {
                let l, r = cc.v2(1 + i, 1 + s),
                    n = this.topNodes;
                if ("center" === this._view.pivot) {
                    for (l = 0; l < e.length; ++l) {
                        n[l].setScale(e[l].x * r.x, e[l].y * r.y);
                        let i = cc.v2(o[l].x * r.x, o[l].y * r.y);
                        _Scene.NodeUtils.setScenePosition(n[l], t.add(i))
                    }
                    this.adjustValue(n, ["x", "y", "scaleX", "scaleY"], 2)
                } else {
                    for (l = 0; l < e.length; ++l) n[l].setScale(e[l].x * r.x, e[l].y * r.y);
                    this.adjustValue(n, ["scaleX", "scaleY"], 2)
                }
            }
        }
    }
    onCreateRoot() {
        this._tool = Tools.scaleTool(this._root, this.createMoveCallbacks())
    }
    onKeyDown(t) {
        if (!this.target) return;
        let e = Editor.KeyCode(t.which);
        if ("left" !== e && "right" !== e && "up" !== e && "down" !== e) return;
        let o = cc.v2();
        "left" === e ? o.x = -.1 : "right" === e ? o.x = .1 : "up" === e ? o.y = .1 : "down" === e && (o.y = -.1), this.recordChanges(), this.topNodes.forEach(function (t) {
            t.scaleX = Editor.Math.toPrecision(t.scaleX + o.x, 3), t.scaleY = Editor.Math.toPrecision(t.scaleY + o.y, 3)
        }), this._view.repaintHost()
    }
    onKeyUp(t) {
        if (!this.target) return;
        let e = Editor.KeyCode(t.which);
        "left" !== e && "right" !== e && "up" !== e && "down" !== e || this.commitChanges()
    }
    visible() {
        return !0
    }
    dirty() {
        return !0
    }
    onUpdate() {
        let t, e, o, i = this.node;
        "center" === this._view.pivot ? (t = Editor.GizmosUtils.getCenter(this.target), e = this.sceneToPixel(t), o = 0) : (t = _Scene.NodeUtils.getScenePosition(i), e = this.sceneToPixel(t), o = _Scene.NodeUtils.getSceneRotation(i)), this._tool.position = e, this._tool.rotation = o, this._tool.translate(this._tool.position.x, this._tool.position.y).rotate(this._tool.rotation, 0, 0)
    }
}
module.exports = ScaleGizmo;