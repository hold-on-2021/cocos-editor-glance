"use strict";
let ColliderGizmo = require("./collider-gizmo"),
    Tools = require("../tools"),
    RectToolType = Tools.rectTool.Type;
class BoxColliderGizmo extends ColliderGizmo {
    onCreateMoveCallbacks() {
        function e(e, i, r, c) {
            let s = i.clone(),
                n = l.node,
                y = l.target,
                T = cc.affineTransformClone(n.getWorldToNodeTransform());
            T.tx = T.ty = 0;
            let p = cc.pointApplyAffineTransform(i, T),
                h = cc.pointApplyAffineTransform(s, T);
            (function (e, o, t, l, i) {
                return e === RectToolType.Right || e === RectToolType.RightTop || e === RectToolType.RightBottom ? (i && (l.x /= 1 - o.x), t.x = l.x * o.x) : (i && (l.x /= o.x), t.x = l.x * (1 - o.x)), e === RectToolType.LeftBottom || e === RectToolType.Bottom || e === RectToolType.RightBottom ? (i && (l.y /= 1 - o.y), t.y = l.y * o.y) : (i && (l.y /= o.y), t.y = l.y * (1 - o.y)), t
            })(e, cc.v2(.5, .5), p, h, c),
            function (e, o, t, l) {
                e === RectToolType.LeftBottom ? t.x *= -1 : e === RectToolType.LeftTop ? (t.x *= -1, t.y *= -1) : e === RectToolType.RightTop ? t.y *= -1 : e === RectToolType.Left ? (t.x *= -1, l || (o.y = t.y = 0)) : e === RectToolType.Right ? l || (o.y = t.y = 0) : e === RectToolType.Top ? (t.y *= -1, l || (o.x = t.x = 0)) : e === RectToolType.Bottom && (l || (o.x = t.x = 0))
            }(e, p, h, r), r && (h.y = h.x * (t.height / t.width));
            let d = cc.size(t.width + h.x, t.height + h.y);
            c || (d.width < 0 && (p.x -= d.width / 2), d.height < 0 && (p.y -= d.height / 2), p = o.add(p), y.offset = p), d.width < 0 && (d.width = 0), d.height < 0 && (d.height = 0), y.size = d
        }
        let o, t, l = this;
        return {
            start: () => {
                o = this.target.offset.clone(), t = this.target.size.clone()
            },
            update: (t, i, r, c) => {
                let s = new cc.Vec2(t, i);
                if (c === RectToolType.Center)(function (e) {
                    let t = l.node,
                        i = cc.affineTransformClone(t.getWorldToNodeTransform());
                    i.tx = i.ty = 0;
                    let r = cc.v2(cc.pointApplyAffineTransform(e.x, e.y, i)).add(o);
                    l.target.offset = r
                })(s.clone());
                else {
                    let o = !!r && r.shiftKey,
                        t = !!r && r.altKey;
                    e(c, s.clone(), o, t)
                }
            },
            end: (e, o, t) => {
                if (!e) return;
                let i = l.target;
                t === RectToolType.Center ? this.adjustValue(i, ["offset"]) : this.adjustValue(i, ["offset", "size"])
            }
        }
    }
    onCreateRoot() {
        let e, o, t, l, i, r, c, s, n, y, T = this._root,
            p = T.sideGroup = T.group().style("pointer-events", "none");
        T.dragArea = y = T.polygon("0,0,0,0,0,0").fill({
            color: "rgba(0,128,255,0.2)"
        }).stroke("none").style("pointer-events", "fill"), this.registerMoveSvg(y, RectToolType.Center);
        let h = (e, o) => Tools.lineTool(p, cc.v2(0, 0), cc.v2(0, 0), "#7fc97a", o, this.createMoveCallbacks(e)).style("cursor", o);
        o = h(RectToolType.Left, "col-resize"), t = h(RectToolType.Top, "row-resize"), l = h(RectToolType.Right, "col-resize"), i = h(RectToolType.Bottom, "row-resize"), (e = T.sidePointGroup = T.group()).hide();
        let d = (e, o, t) => Tools.circleTool(o, 5, {
            color: "#7fc97a"
        }, null, this.createMoveCallbacks(e)).style("cursor", t);
        r = d(RectToolType.LeftBottom, e, "nwse-resize"), c = d(RectToolType.LeftTop, e, "nesw-resize"), s = d(RectToolType.RightTop, e, "nwse-resize"), n = d(RectToolType.RightBottom, e, "nesw-resize"), T.plot = (e => {
            y.plot([
                [e[0].x, e[0].y],
                [e[1].x, e[1].y],
                [e[2].x, e[2].y],
                [e[3].x, e[3].y]
            ]), o.plot(e[0].x, e[0].y, e[1].x, e[1].y), t.plot(e[1].x, e[1].y, e[2].x, e[2].y), l.plot(e[2].x, e[2].y, e[3].x, e[3].y), i.plot(e[3].x, e[3].y, e[0].x, e[0].y), this._targetEditing && (r.center(e[0].x, e[0].y), c.center(e[1].x, e[1].y), s.center(e[2].x, e[2].y), n.center(e[3].x, e[3].y))
        })
    }
    onUpdate() {
        let e = this.target,
            o = e.size,
            t = e.offset,
            l = cc.rect(t.x - o.width / 2, t.y - o.height / 2, o.width, o.height),
            i = this.node.getNodeToWorldTransformAR(),
            r = new cc.Vec2,
            c = new cc.Vec2,
            s = new cc.Vec2,
            n = new cc.Vec2;
        cc.engine.obbApplyAffineTransform(i, l, r, c, s, n), r = this.worldToPixel(r), c = this.worldToPixel(c), s = this.worldToPixel(s), n = this.worldToPixel(n), this._root.plot([r, c, s, n])
    }
    enterEditing() {
        let e = this._root;
        e.sideGroup.style("pointer-events", "stroke"), e.dragArea.style("cursor", "move"), e.sidePointGroup.show()
    }
    leaveEditing() {
        let e = this._root;
        e.sideGroup.style("pointer-events", "none"), e.dragArea.style("cursor", null), e.sidePointGroup.hide()
    }
}
module.exports = BoxColliderGizmo;