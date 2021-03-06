"use strict";
let Tools = require("./tools");
class IconGizmo extends Editor.Gizmo {
    url() {
        return ""
    }
    onCreateRoot() {
        this._icon = Tools.icon(this._root, this.url(), 40, 40, this.node)
    }
    visible() {
        return !0
    }
    onUpdate() {
        this.editing || this.selecting ? this._icon.filter(function (t) {
            t.componentTransfer({
                rgb: {
                    type: "linear",
                    slope: .2
                }
            })
        }) : this.hovering ? this._icon.filter(function (t) {
            t.componentTransfer({
                rgb: {
                    type: "linear",
                    slope: .4
                }
            })
        }) : this._icon.unfilter();
        let t = Editor.Math.clamp(this._view.scale, .5, 2),
            e = _Scene.NodeUtils.getScenePosition(this.node),
            i = this.sceneToPixel(e);
        this._icon.scale(t, t).translate(i.x, i.y)
    }
    rectHitTest(t, e) {
        let i = this._icon.tbox(),
            o = _Scene.NodeUtils.getWorldPosition(this.node);
        return e ? t.containsRect(cc.rect(o.x - i.width / 2, o.y - i.height / 2, i.width, i.height)) : t.intersects(cc.rect(o.x - i.width / 2, o.y - i.height / 2, i.width, i.height))
    }
}
module.exports = IconGizmo;