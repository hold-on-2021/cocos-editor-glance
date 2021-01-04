"use strict";
const JointGizmo = require("./joint-gizmo");
class MotorJointGizmo extends JointGizmo {
    createAnchorGroup() {
        let o = this._root.group();
        return o.path().plot("\n                M -4 4 L -10 0 L -4 -4\n                L 0 -10 L 4 -4\n                L 10 0 L 4 4\n                L 0 10\n                Z\n            ").fill("none"), o.circle(5).stroke("none").center(0, 0), o
    }
    createToolGroup() {
        let o = this._root.group(),
            t = o.line().stroke({
                width: 2,
                color: "#4793e2",
                opacity: .5
            }),
            e = o.line().stroke({
                width: 3,
                color: "#4793e2"
            });
        return o.plot = (r => {
            if (r.offset) {
                t.plot(r.anchor.x, r.anchor.y, r.offset.x, r.offset.y);
                let n = r.offset.sub(r.anchor).normalizeSelf(),
                    i = n.y;
                n.y = -n.x, n.x = i, n.rotateSelf(r.angularOffset * Math.PI / 180);
                let l = n.mul(20);
                e.plot(r.offset.x + l.x, r.offset.y + l.y, r.offset.x - l.x, r.offset.y - l.y), o.show()
            } else o.hide()
        }), o
    }
    createArgs() {
        let o = {},
            t = this.node,
            e = t.convertToWorldSpaceAR(this.target.anchor);
        if (o.anchor = this.worldToPixel(e), o.pos = this.worldToPixel(t.convertToWorldSpaceAR(cc.Vec2.ZERO)), this.target.connectedBody) {
            let e = this.target.connectedBody.node;
            o.connectedAnchor = o.connectedPos = this.worldToPixel(e.convertToWorldSpaceAR(cc.Vec2.ZERO));
            let r = _Scene.NodeUtils.getWorldRotation(this.node);
            o.angularOffset = r + this.target.angularOffset, o.offset = this.worldToPixel(t.convertToWorldSpaceAR(cc.v2(this.target.linearOffset.x, this.target.linearOffset.y)))
        }
        return o
    }
}
module.exports = MotorJointGizmo;