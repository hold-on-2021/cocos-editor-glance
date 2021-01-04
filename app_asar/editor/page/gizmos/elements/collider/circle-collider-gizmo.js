"use strict";
let ColliderGizmo = require("./collider-gizmo"),
    Tools = require("../tools"),
    ToolType = {
        None: 0,
        Side: 1,
        Center: 2
    };
class CircleColliderGizmo extends ColliderGizmo {
    onCreateMoveCallbacks() {
        let e, t, o, r;
        return {
            start: (l, i, s, c) => {
                e = this.target.offset, t = this.target.radius, o = l, r = i
            },
            update: (t, l, i, s) => {
                let c = this.node;
                if (s === ToolType.Center) {
                    let o = cc.affineTransformClone(c.getWorldToNodeTransform());
                    o.tx = o.ty = 0;
                    let r = cc.v2(cc.pointApplyAffineTransform(t, l, o)).add(e);
                    this.target.offset = r, this.adjustValue(this.target, "offset")
                } else {
                    let i = c.convertToNodeSpaceAR(cc.v2(o + t, r + l)).sub(e).mag();
                    this.target.radius = i, this.adjustValue(this.target, "radius")
                }
            }
        }
    }
    onCreateRoot() {
        let e, t, o, r, l, i, s, c = this._root,
            a = (e, t) => Tools.circleTool(e, 5, {
                color: "#7fc97a"
            }, null, this.createMoveCallbacks(ToolType.Side)).style("cursor", t);
        c.dragArea = s = c.circle("0,0,0,0,0,0").fill({
            color: "rgba(0,128,255,0.2)"
        }).stroke("none").style("pointer-events", "fill"), this.registerMoveSvg(s, ToolType.Center), (e = c.circle = Tools.circleTool(c, 0, null, {
            color: "#7fc97a"
        }, this.createMoveCallbacks(ToolType.Side))).style("pointer-events", "none"), (t = c.sidePointGroup = c.group()).hide(), o = a(t, "col-resize"), r = a(t, "row-resize"), l = a(t, "col-resize"), i = a(t, "row-resize"), c.plot = ((t, c) => {
            e.radius(c).center(t.x, t.y), s.radius(c).center(t.x, t.y), this._targetEditing && (o.center(t.x - c, t.y), r.center(t.x, t.y + c), l.center(t.x + c, t.y), i.center(t.x, t.y - c))
        })
    }
    onUpdate() {
        let e = this.node,
            t = this.target.radius,
            o = this.worldToPixel(e.convertToWorldSpaceAR(this.target.offset)),
            r = e.convertToWorldSpace(cc.v2(0, 0)),
            l = e.convertToWorldSpace(cc.v2(t, 0)),
            i = r.sub(l).mag();
        this._root.plot(o, i)
    }
    enterEditing() {
        let e = this._root;
        e.circle.style("pointer-events", "stroke"), e.dragArea.style("cursor", "move"), e.sidePointGroup.show()
    }
    leaveEditing() {
        let e = this._root;
        e.circle.style("pointer-events", "none"), e.dragArea.style("cursor", null), e.sidePointGroup.hide()
    }
}
module.exports = CircleColliderGizmo;