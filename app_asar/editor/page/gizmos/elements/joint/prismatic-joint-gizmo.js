"use strict";
const JointGizmo = require("./joint-gizmo");
class PrismaticJointGizmo extends JointGizmo {
    createAnchorGroup() {
        let o = this._root.group();
        return o.path().plot("\n                M -8 -8 L 0 -7 L 8 -8 L 7 0 L 8 8 L 0 7 L -8 8 L -7 0\n                Z\n            ").fill("none"), o.rect(5, 5).stroke("none").center(0, 0), o
    }
    createToolGroup() {
        let o = this._root.group(),
            e = o.line().stroke({
                width: 2,
                color: "#4793e2",
                opacity: .5
            }),
            t = o.line().stroke({
                width: 2,
                color: "#4793e2",
                opacity: .5
            }),
            r = o.line().stroke({
                width: 2,
                color: "#4793e2",
                opacity: .5
            });
        return o.plot = (i => {
            if (this.target.enableLimit) {
                e.plot(i.lowerPos.x, i.lowerPos.y, i.upperPos.x, i.upperPos.y);
                let l = i.upperPos.sub(i.lowerPos).normalizeSelf(),
                    s = l.y;
                l.y = -l.x, l.x = s;
                let n = l.mul(10);
                t.plot(i.lowerPos.x + n.x, i.lowerPos.y + n.y, i.lowerPos.x - n.x, i.lowerPos.y - n.y);
                let p = l.mul(20);
                r.plot(i.upperPos.x + p.x, i.upperPos.y + p.y, i.upperPos.x - p.x, i.upperPos.y - p.y), o.show()
            } else o.hide()
        }), o
    }
    createArgs() {
        let o = JointGizmo.prototype.createArgs.call(this);
        if (this.target.enableLimit) {
            let e = cc.affineTransformClone(this.node.getNodeToWorldTransform());
            e.tx = e.ty = 0;
            let t = cc.v2(cc.pointApplyAffineTransform(this.target.lowerLimit, 0, e)).mag(),
                r = cc.v2(cc.pointApplyAffineTransform(this.target.upperLimit, 0, e)).mag(),
                i = this.target.localAxisA.normalize();
            i.y *= -1;
            let l = i.mul(t),
                s = i.mul(r);
            o.lowerPos = o.anchor.add(l), o.upperPos = o.anchor.add(s)
        }
        return o
    }
}
module.exports = PrismaticJointGizmo;