"use strict";
let ColliderGizmo = require("./collider-gizmo"),
    Tools = require("../tools"),
    ToolType = {
        None: 0,
        Point: 1,
        Line: 2
    };
class ChainColliderGizmo extends ColliderGizmo {
    onCreateMoveCallbacks() {
        let o, e;
        return {
            start: (t, l, i, r) => {
                if (r === ToolType.Point) {
                    let t = i.currentTarget.instance;
                    e = t.point.origin, o = e.clone();
                    if (i.ctrlKey || i.metaKey) {
                        this.recordChanges();
                        let o = this.target.points;
                        return o.splice(o.indexOf(e), 1), this.commitChanges(), void 0
                    }
                } else if (r === ToolType.Line) {
                    this.recordChanges();
                    let o = this.node.convertToNodeSpaceAR(cc.v2(t, l)),
                        e = i.currentTarget.instance,
                        r = e.startSvgPoint.point.origin,
                        n = e.endSvgPoint.point.origin,
                        s = this.target.points.indexOf(r) + 1,
                        c = r.x - n.x,
                        a = r.y - n.y,
                        p = (o.x - r.x) * (r.x - n.x) + (o.y - r.y) * (r.y - n.y);
                    p /= c * c + a * a, o.x = r.x + p * c, o.y = r.y + p * a, this.adjustValue(o), this.target.points.splice(s, 0, o), this.commitChanges()
                }
            },
            update: (t, l, i, r) => {
                let n = cc.affineTransformClone(this.node.getWorldToNodeTransform());
                if (n.tx = n.ty = 0, r === ToolType.Point) {
                    if (i.ctrlKey || i.metaKey) return;
                    let r = cc.v2(cc.pointApplyAffineTransform(t, l, n)).add(o);
                    this.adjustValue(r), e.x = r.x, e.y = r.y
                }
            }
        }
    }
    onCreateRoot() {
        let o = this._root,
            e = o.linesGroup = o.group(),
            t = [];
        e.style("cursor", "normal");
        let l = () => Tools.lineTool(e, cc.v2(0, 0), cc.v2(0, 0), "#7fc97a", null, this.createMoveCallbacks(ToolType.Line)),
            i = o.pointsGroup = o.group(),
            r = [];
        i.hide();
        let n = () => {
            let o = Tools.circleTool(i, 5, {
                color: "#7fc97a"
            }, null, "pointer", this.createMoveCallbacks(ToolType.Point));
            return o.on("mouseover", function (e) {
                (e.ctrlKey || e.metaKey) && (o.fill({
                    color: "#f00"
                }), o.l1 && o.l1.stroke({
                    color: "#f00"
                }), o.l2 && o.l2.stroke({
                    color: "#f00"
                }))
            }), o.on("mouseout", function (e) {
                o.fill({
                    color: "#7fc97a"
                }), o.l1 && o.l1.stroke({
                    color: "#7fc97a"
                }), o.l2 && o.l2.stroke({
                    color: "#7fc97a"
                })
            }), o
        };
        o.plot = function (o) {
            let e = [];
            for (let i = 0, s = o.length; i < s; i++) {
                let c = o[i];
                e.push([c.x, c.y]);
                let a = r[i];
                if (a || (a = r[i] = n()), a.point = c, a.show(), a.center(c.x, c.y), i === s - 1) continue;
                let p = i + 1,
                    h = r[p];
                h || (h = r[p] = n());
                let f = t[i];
                f || (f = t[i] = l());
                let u = c,
                    d = o[p];
                f.show(), f.plot(u.x, u.y, d.x, d.y), f.startSvgPoint = a, f.endSvgPoint = h, a.l1 = f, h.l2 = f
            }
            for (let e = o.length, t = r.length; e < t; e++) r[e].hide();
            for (let e = o.length - 1, l = r.length; e < l; e++) t[e] && t[e].hide()
        }
    }
    onUpdate() {
        let o = this.target.points,
            e = this.node,
            t = cc.affineTransformClone(e.getNodeToWorldTransformAR()),
            l = [];
        for (let e = 0, i = o.length; e < i; e++) {
            let i = o[e],
                r = cc.pointApplyAffineTransform(i, t);
            (r = this.worldToPixel(r)).origin = o[e], l.push(r)
        }
        this._root.plot(l)
    }
    enterEditing() {
        let o = this._root;
        o.pointsGroup.show(), o.linesGroup.style("cursor", "copy")
    }
    leaveEditing() {
        let o = this._root;
        o.pointsGroup.hide(), o.linesGroup.style("cursor", "normal")
    }
}
module.exports = ChainColliderGizmo;