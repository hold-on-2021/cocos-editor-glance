"use strict";
class NodeGizmo extends Editor.Gizmo {
    init() {
        this._currentName = this.target.name
    }
    onCreateRoot() {
        let t = this._root;
        t.bounds = t.polygon(), t.compGroup = t.group(), t.compGroup.compBounds = [];
        let o = t.rect({
                fill: "none"
            }),
            e = t.text(this._currentName);
        e.font({
            family: "Helvetica",
            size: "12px",
            anchor: "left",
            weight: "bold"
        });
        let l = e.bbox();
        o.width(l.width + 10), o.height(l.height), t.labelBG = o, t.label = e;
        let i = t.errorInfo = t.group();
        i.l1 = i.line(0, 0, 0, 0).stroke({
            width: 1,
            color: "#f00"
        }), i.l2 = i.line(0, 0, 0, 0).stroke({
            width: 1,
            color: "#f00"
        })
    }
    visible() {
        return this.selecting || this.editing || this.hovering || !1
    }
    onUpdate() {
        let t = this.selecting || this.editing,
            o = this.hovering,
            e = this.target,
            l = _Scene.NodeUtils.getWorldOrientedBounds(e),
            i = this.worldToPixel(l[0]),
            r = this.worldToPixel(l[1]),
            h = this.worldToPixel(l[2]),
            s = this.worldToPixel(l[3]);
        if (!1, this._root.errorInfo.hide(), t || o) {
            this._root.bounds.show(), this._root.bounds.plot([
                [i.x, i.y],
                [r.x, r.y],
                [h.x, h.y],
                [s.x, s.y]
            ]).fill("none");
            let l = e._components.filter(t => !!t._getLocalBounds),
                n = this._root.compGroup,
                a = n.compBounds;
            if (a.length > l.length) {
                for (let t = l.length, o = a.length; t < o; t++) a[t].remove();
                a.length = l.length
            } else if (a.length < l.length)
                for (let t = a.length, o = l.length; t < o; t++) {
                    let t = n.polygon();
                    a.push(t)
                }
            a.forEach((i, r) => {
                let h = l[r],
                    s = cc.rect();
                h._getLocalBounds(s);
                let n = e.getNodeToWorldTransform(),
                    a = new cc.Vec2,
                    c = new cc.Vec2,
                    d = new cc.Vec2,
                    g = new cc.Vec2;
                cc.engine.obbApplyAffineTransform(n, s, a, c, d, g), a = this.worldToPixel(a), c = this.worldToPixel(c), d = this.worldToPixel(d), g = this.worldToPixel(g), i.plot([
                    [a.x, a.y],
                    [c.x, c.y],
                    [d.x, d.y],
                    [g.x, g.y]
                ]).fill("none"), t ? i.stroke({
                    color: "#09f",
                    width: 1
                }) : o && i.stroke({
                    color: "#999",
                    width: 1
                })
            });
            let c = Editor.Math.deg2rad(e.rotation);
            if (this._root.label.translate(i.x + 19 * Math.sin(c) + 5 * Math.cos(c), i.y - 19 * Math.cos(c) + 5 * Math.sin(c)).rotate(e.rotation, 0, 0), this._root.labelBG.translate(i.x + 14 * Math.sin(c), i.y - 14 * Math.cos(c)).rotate(e.rotation, 0, 0), this._currentName !== e.name) {
                this._currentName = e.name, this._root.label.text(this._currentName);
                let t = this._root.label.bbox();
                this._root.labelBG.width(t.width + 10), this._root.labelBG.height(t.height)
            }
            t ? (this._root.bounds.stroke({
                color: "#09f",
                width: 1
            }), this._root.label.fill("none"), this._root.labelBG.fill("none"), this._root.labelBG.stroke({
                color: "none",
                width: 1
            })) : o && (this._root.bounds.stroke({
                color: "#999",
                width: 1
            }), this._root.label.fill("#333"), this._root.labelBG.fill("#999"), this._root.labelBG.stroke({
                color: "#999",
                width: 1
            }))
        } else this._root.bounds.hide()
    }
}
module.exports = NodeGizmo;