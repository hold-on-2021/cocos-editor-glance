"use strict";
const JointGizmo = require("./joint-gizmo");
class WeldJointGizmo extends JointGizmo {
    createAnchorGroup() {
        let o = this._root.group();
        return o.path().plot("\n                M 0 -8 L 6 0 L 0 8 L -6 0\n                Z\n            ").fill("none"), o.circle(5).stroke("none").center(0, 0), o
    }
}
module.exports = WeldJointGizmo;