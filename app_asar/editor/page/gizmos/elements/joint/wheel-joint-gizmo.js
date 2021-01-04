"use strict";
const JointGizmo = require("./joint-gizmo");
class WheelJointGizmo extends JointGizmo {
    createAnchorGroup() {
        let o = this._root.group();
        return o.path().plot("\n                M -8 8 L 8 8 L 8 -8 L -8 -8 Z\n            ").fill("none"), o.circle(10).stroke("none").center(0, 0), o
    }
}
module.exports = WheelJointGizmo;