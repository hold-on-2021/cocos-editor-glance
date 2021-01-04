"use strict";
let ColliderGizmo = require("./collider-gizmo"),
    Tools = require("../tools"),
    ToolType = {
        None: 0,
        Point: 1,
        Line: 2,
        Center: 3
    };
class PolygonColliderGizmo extends ColliderGizmo {
    onCreateMoveCallbacks() {
        let e, t, o;
        return {
            start: (l, i, r, n) => {
                if (n === ToolType.Point) {
                    let t = r.currentTarget.instance;
                    o = t.point.origin, e = o.clone();
                    if (r.ctrlKey || r.metaKey) {
                        this.recordChanges();
                        let e = this.target.points;
                        e.splice(e.indexOf(o), 1), this.commitChanges()
                    }
                } else if (n === ToolType.Center) t = this.target.offset;
                else if (n === ToolType.Line) {
                    this.recordChanges();
                    let e = this.node.convertToNodeSpaceAR(cc.v2(l, i)).sub(this.target.offset),
                        t = r.currentTarget.instance,
                        o = t.startSvgPoint.point.origin,
                        n = t.endSvgPoint.point.origin,
                        s = this.target.points.indexOf(o) + 1,
                        a = o.x - n.x,
                        c = o.y - n.y,
                        p = (e.x - o.x) * (o.x - n.x) + (e.y - o.y) * (o.y - n.y);
                    p /= a * a + c * c, e.x = o.x + p * a, e.y = o.y + p * c, this.adjustValue(e), this.target.points.splice(s, 0, e), this.commitChanges()
                }
            },
            update: (l, i, r, n) => {
                let s = this.node,
                    a = cc.affineTransformClone(s.getWorldToNodeTransform());
                if (a.tx = a.ty = 0, n === ToolType.Point) {
                    if (r.ctrlKey || r.metaKey) return;
                    let t = cc.v2(cc.pointApplyAffineTransform(l, i, a)).add(e);
                    this.adjustValue(t), o.x = t.x, o.y = t.y
                } else if (n === ToolType.Center) {
                    let e = cc.v2(cc.pointApplyAffineTransform(l, i, a)).add(t);
                    this.adjustValue(e), this.target.offset = e
                }
                this._view.repaintHost()
            }
        }
    }
    onCreateRoot() {
        let e = this._root,
            t = e.dragArea = e.polygon().fill({
                color: "rgba(0,128,255,0.2)"
            }).stroke("none").style("pointer-events", "fill");
        this.registerMoveSvg(t, ToolType.Center);
        let o = e.linesGroup = e.group(),
            l = [];
        o.style("pointer-events", "stroke").style("cursor", "copy").hide();
        let i = () => Tools.lineTool(o, cc.v2(0, 0), cc.v2(0, 0), "#7fc97a", null, this.createMoveCallbacks(ToolType.Line)),
            r = e.pointsGroup = e.group(),
            n = [];
        r.hide();
        let s = () => {
            let e = Tools.circleTool(r, 5, {
                color: "#7fc97a"
            }, null, "pointer", this.createMoveCallbacks(ToolType.Point));
            return e.on("mouseover", function (t) {
                (t.ctrlKey || t.metaKey) && (e.fill({
                    color: "#f00"
                }), e.l1.stroke({
                    color: "#f00"
                }), e.l2.stroke({
                    color: "#f00"
                }))
            }), e.on("mouseout", function (t) {
                e.fill({
                    color: "#7fc97a"
                }), e.l1.stroke({
                    color: "#7fc97a"
                }), e.l2.stroke({
                    color: "#7fc97a"
                })
            }), e
        };
        e.plot = (e => {
            let o = [];
            for (let t = 0, r = e.length; t < r; t++) {
                let a = t === r - 1 ? 0 : t + 1,
                    c = e[t];
                if (o.push([c.x, c.y]), !this.target.editing) continue;
                let p = n[t];
                p || (p = n[t] = s()), p.point = c, p.show(), p.center(c.x, c.y);
                let f = n[a];
                f || (f = n[a] = s());
                let h = l[t];
                h || (h = l[t] = i());
                let d = c,
                    g = e[a];
                h.show(), h.plot(d.x, d.y, g.x, g.y), h.startSvgPoint = p, h.endSvgPoint = f, p.l1 = h, f.l2 = h
            }
            t.plot(o);
            for (let t = e.length, o = n.length; t < o; t++) n[t].hide(), l[t].hide()
        })
    }
    onUpdate() {
        let e = this.target.points,
            t = this.target.offset,
            o = this.node,
            l = cc.affineTransformClone(o.getNodeToWorldTransformAR()),
            i = [];
        for (let o = 0, r = e.length; o < r; o++) {
            let r = e[o].add(t),
                n = cc.pointApplyAffineTransform(r, l);
            (n = this.worldToPixel(n)).origin = e[o], i.push(n)
        }
        this._root.plot(i)
    }
    enterEditing() {
        let e = this._root;
        e.pointsGroup.show(), e.dragArea.style("cursor", "move"), e.linesGroup.show()
    }
    leaveEditing() {
        let e = this._root;
        e.pointsGroup.hide(), e.linesGroup.hide(), e.dragArea.style("cursor", null)
    }
}
module.exports = PolygonColliderGizmo;