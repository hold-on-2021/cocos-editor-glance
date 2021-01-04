"use strict";
const Tools = require("../tools"),
    JointGizmo = require("./joint-gizmo");
class DistanceJointGizmo extends JointGizmo {
    createAnchorGroup() {
        let o = this._root.group();
        return o.circle(15).fill("none").center(0, 0), o.circle(5).stroke("none").center(0, 0), o
    }
    createToolGroup() {
        let o = this._root.group(),
            e = o.line().stroke({
                width: 4,
                color: "#4793e2",
                opacity: .5
            }),
            t = o.line().stroke({
                width: 3,
                color: "#cccc00",
                opacity: .5
            }),
            c = o.circle(6).fill({
                color: "#cccc00",
                opacity: .5
            });
        return o.plot = (r => {
            r.distance ? (e.plot(r.anchor.x, r.anchor.y, r.connectedAnchor.x, r.connectedAnchor.y), t.plot(r.anchor.x, r.anchor.y, r.distance.x, r.distance.y), t.style("stroke-dasharray", Tools.dashLength()), c.center(r.distance.x, r.distance.y), o.show()) : o.hide()
        }), o
    }
    createArgs() {
        let o = JointGizmo.prototype.createArgs.call(this);
        if (this.target.connectedBody) {
            let e = cc.affineTransformClone(this.node.getNodeToWorldTransform());
            e.tx = e.ty = 0;
            let t = cc.v2(cc.pointApplyAffineTransform(this.target.distance, 0, e)).mag(),
                c = cc.v2(o.connectedAnchor.x - o.anchor.x, o.connectedAnchor.y - o.anchor.y);
            o.distance = c.normalizeSelf().mulSelf(t).addSelf(o.anchor)
        }
        return o
    }
}
module.exports = DistanceJointGizmo;