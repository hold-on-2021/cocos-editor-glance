"use strict";
let Tools = require("./tools");
class RotateGizmo extends Editor.Gizmo {
    init() {
        this._rotating = !1
    }
    layer() {
        return "foreground"
    }
    onCreateRoot() {
        let t, o = [],
            e = [],
            i = !1;
        this._tool = Tools.rotationTool(this._root, {
            start: () => {
                this._rotating = !0, o = [];
                let i = this.topNodes;
                for (let t = 0; t < i.length; ++t) o.push(i[t].rotation);
                if ("center" === this._view.pivot) {
                    t = Editor.GizmosUtils.getCenter(this.target), e.length = 0;
                    for (let o = 0; o < i.length; ++o) {
                        let s = _Scene.NodeUtils.getScenePosition(i[o]);
                        e.push(s.sub(t))
                    }
                }
            },
            update: s => {
                if (0 === s) return;
                i = !0, this.target.forEach(t => {
                    _Scene.Undo.recordNode(t.uuid)
                });
                let r, n, l;
                l = Math.floor(s);
                let h = this.topNodes;
                if ("center" === this._view.pivot)
                    for (r = 0; r < o.length; ++r) {
                        n = Editor.Math.deg180(o[r] - l), n = Math.floor(n);
                        let i = e[r].rotate(Editor.Math.deg2rad(l));
                        _Scene.NodeUtils.setScenePosition(h[r], t.add(i)), h[r].rotation = n, this._tool.rotation = -s
                    } else
                        for (r = 0; r < o.length; ++r) n = Editor.Math.deg180(o[r] - l), n = Math.floor(n), h[r].rotation = n;
                this._view.repaintHost()
            },
            end: () => {
                if ("center" === this._view.pivot) {
                    let t = Editor.GizmosUtils.getCenter(this.target),
                        o = this.sceneToPixel(t);
                    this._tool.rotation = 0, this._tool.position = o, this._tool.translate(this._tool.position.x, this._tool.position.y).rotate(this._tool.rotation, 0, 0)
                }
                this._rotating = !1, i && (_Scene.AnimUtils.recordNodeChanged(this.target), _Scene.Undo.commit()), i = !1
            }
        })
    }
    onKeyDown(t) {
        if (!this.target) return;
        this._rotating = !0;
        let o = Editor.KeyCode(t.which);
        if ("left" !== o && "right" !== o && "up" !== o && "down" !== o) return;
        let e = 0;
        "left" === o ? e = -1 : "right" === o ? e = 1 : "up" === o ? e = -1 : "down" === o && (e = 1), this.keydownDelta || (this.keydownDelta = 0), this.keydownDelta += e, this.recordChanges();
        let i = this.topNodes;
        if ("center" === this._view.pivot) {
            let t = Editor.GizmosUtils.getCenter(this.target);
            for (let o = 0; o < i.length; ++o) {
                let s = i[o],
                    r = Editor.Math.deg180(s.rotation + e);
                r = Math.floor(r);
                let n = _Scene.NodeUtils.getScenePosition(s).sub(t);
                n = n.rotate(Editor.Math.deg2rad(-e)), _Scene.NodeUtils.setScenePosition(s, t.add(n)), s.rotation = r, this._tool.rotation = this.keydownDelta
            }
        } else
            for (let t = 0; t < i.length; ++t) i[t].rotation += e;
        this._view.repaintHost()
    }
    onKeyUp(t) {
        if (!this.target) return;
        let o = Editor.KeyCode(t.which);
        if ("left" === o || "right" === o || "up" === o || "down" === o) {
            if ("center" === this._view.pivot) {
                let t = Editor.GizmosUtils.getCenter(this.target),
                    o = this.sceneToPixel(t),
                    e = this._tool;
                e.rotation = 0, e.position = o, e.translate(e.position.x, e.position.y).rotate(e.rotation, 0, 0), this._view.repaintHost()
            }
            this.keydownDelta = null, this._rotating = !1, this.commitChanges()
        }
    }
    visible() {
        return !0
    }
    dirty() {
        return !0
    }
    onUpdate() {
        let t, o, e, i = this.node;
        if ("center" === this._view.pivot) {
            if (this._rotating) return this._tool.rotate(this._tool.rotation, 0, 0), void 0;
            t = Editor.GizmosUtils.getCenter(this.target), o = this.sceneToPixel(t)
        } else t = _Scene.NodeUtils.getScenePosition(i), o = this.sceneToPixel(t), e = _Scene.NodeUtils.getSceneRotation(i);
        this._tool.position = o, this._tool.rotation = e, this._tool.translate(this._tool.position.x, this._tool.position.y).rotate(this._tool.rotation, 0, 0)
    }
}
module.exports = RotateGizmo;