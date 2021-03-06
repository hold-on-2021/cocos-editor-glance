"use strict";
let Tools = require("./tools"),
    NodeUtils = _Scene.NodeUtils;
class MoveGizmo extends Editor.Gizmo {
    init() {}
    layer() {
        return "foreground"
    }
    onCreateMoveCallbacks() {
        let t = [];
        return {
            start: () => {
                t.length = 0;
                let o = this.topNodes;
                for (let e = 0; e < o.length; ++e) t.push(NodeUtils.getWorldPosition(o[e]))
            },
            update: (o, e) => {
                let i = new cc.Vec2(o, e),
                    s = this.topNodes;
                for (let o = 0; o < t.length; ++o) NodeUtils.setWorldPosition(s[o], t[o].add(i));
                this.adjustValue(s, ["x", "y"])
            }
        }
    }
    onCreateRoot() {
        this._tool = Tools.positionTool(this._root, this.createMoveCallbacks())
    }
    visible() {
        return !0
    }
    dirty() {
        return !0
    }
    onUpdate() {
        let t, o, e, i = this.node;
        "center" === this._view.pivot ? (t = Editor.GizmosUtils.getCenter(this.target), o = this.sceneToPixel(t), e = 0) : (t = NodeUtils.getScenePosition(i), o = this.sceneToPixel(t), e = 0, "global" !== this._view.coordinate && (e = NodeUtils.getSceneRotation(i))), this._tool.position = o, this._tool.rotation = e, this._tool.translate(this._tool.position.x, this._tool.position.y).rotate(this._tool.rotation, 0, 0)
    }
    onKeyDown(t) {
        if (!this.target) return;
        let o = Editor.KeyCode(t.which);
        if ("left" !== o && "right" !== o && "up" !== o && "down" !== o) return;
        let e = cc.v2();
        "left" === o ? e.x = -1 : "right" === o ? e.x = 1 : "up" === o ? e.y = 1 : "down" === o && (e.y = -1), this.recordChanges(), this.topNodes.forEach(t => {
            t.position = t.position.add(e)
        }), this._view.repaintHost()
    }
    onKeyUp(t) {
        if (!this.target) return;
        let o = Editor.KeyCode(t.which);
        "left" !== o && "right" !== o && "up" !== o && "down" !== o || this.commitChanges()
    }
}
module.exports = MoveGizmo;