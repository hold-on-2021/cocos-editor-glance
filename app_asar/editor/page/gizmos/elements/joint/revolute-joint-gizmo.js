"use strict";
const JointGizmo = require("./joint-gizmo");
class RevoluteJointGizmo extends JointGizmo {
    createAnchorGroup() {
        let e = this._root.group();
        return e.path().plot("\n                M -6 -8 A 10 10, 0, 1, 0, 6 -8 L 6 -8\n                M -6 -2 L -6 -8 L -12 -8\n                M 6 -2 L 6 -8 L 12 -8\n            ").fill("none"), e.circle(5).stroke("none").center(0, 0), e
    }
    createToolGroup() {
        let e = this._root.group();
        e.style("pointer-events", "none");
        let t = e.line().stroke({
                width: 2,
                color: "#4793e2"
            }),
            o = e.line().stroke({
                width: 2,
                color: "#4793e2"
            }),
            l = e.circle(5).fill({
                color: "#4793e2"
            }),
            r = e.circle(5).fill({
                color: "#4793e2"
            }),
            n = e.path().fill({
                color: "#4793e2",
                opacity: .5
            });
        return e.plot = (i => {
            if (this.target.enableLimit) {
                let s = i.lowerAngle * Math.PI / 180,
                    c = i.upperAngle * Math.PI / 180,
                    a = i.anchor.x,
                    h = i.anchor.y,
                    p = a + 20 * Math.cos(s),
                    g = h + 20 * Math.sin(s),
                    u = a + 30 * Math.cos(c),
                    M = h + 30 * Math.sin(c);
                o.plot(p, g, a, h), t.plot(u, M, a, h), r.center(p, g), l.center(u, M);
                let A = a + 15 * Math.cos(s),
                    m = h + 15 * Math.sin(s),
                    d = a + 15 * Math.cos(c),
                    L = h + 15 * Math.sin(c),
                    w = (i.upperAngle - i.lowerAngle) % 360 > 180 ? 1 : 0;
                n.plot(`\n                    M ${A} ${m} A 15 15 0 ${w} 1 ${d} ${L}\n                    L ${a} ${h}\n                    Z\n                `), e.show()
            } else e.hide()
        }), e
    }
    createArgs() {
        let e = JointGizmo.prototype.createArgs.call(this);
        if (this.target.enableLimit) {
            let t = _Scene.NodeUtils.getWorldRotation(this.node.parent);
            e.lowerAngle = t + this.target.lowerAngle, e.upperAngle = t + this.target.upperAngle
        }
        return e
    }
}
module.exports = RevoluteJointGizmo;