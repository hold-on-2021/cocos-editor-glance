const Chroma = require("chroma-js"),
    Tools = require("../tools");
let ToolType = {
    anchor: 0,
    connectedAnchor: 1
};
class JointGizmo extends Editor.Gizmo {
    visible() {
        return !0
    }
    rectHitTest(o, e) {
        let t = this._root.tbox(),
            r = _Scene.NodeUtils.getWorldPosition(this.node);
        return !!e && o.containsRect(cc.rect(r.x - t.width / 2, r.y - t.height / 2, t.width, t.height))
    }
    onCreateMoveCallbacks() {
        let o, e;
        return {
            start: (t, r) => {
                o = t, e = r
            },
            update: (t, r, c, n) => {
                let i = o + t,
                    s = e + r;
                if (n === ToolType.anchor) {
                    let o = this.node.convertToNodeSpaceAR(cc.v2(i, s));
                    this.adjustValue(o), this.target.anchor = o
                } else if (n === ToolType.connectedAnchor) {
                    let o = this.target.connectedBody.node.convertToNodeSpaceAR(cc.v2(i, s));
                    this.adjustValue(o), this.target.connectedAnchor = o
                }
            }
        }
    }
    onCreateRoot() {
        let o = this._root,
            e = e => {
                let t;
                e === JointGizmo.ToolType.anchor ? t = "#4793e2" : e === JointGizmo.ToolType.connectedAnchor && (t = "#cccc00");
                let r = o.line(0, 0, 1, 1).stroke({
                        width: 2,
                        color: t
                    }),
                    c = this.createAnchorGroup();
                c.style("pointer-events", "bounding-box").style("cursor", "move").stroke({
                    width: 2,
                    color: t
                }).fill({
                    color: t
                }), c.on("mouseover", function () {
                    var o = Chroma(t).brighter().hex();
                    c.stroke({
                        color: o
                    }), r.stroke({
                        color: o
                    })
                }), c.on("mouseout", function () {
                    c.stroke({
                        color: t
                    }), r.stroke({
                        color: t
                    })
                });
                let n = c.plot;
                return c.plot = (o => {
                    n && n.apply(c, arguments);
                    let t, i, s, h;
                    if (e === ToolType.anchor) t = o.pos.x, i = o.pos.y, s = o.anchor.x, h = o.anchor.y;
                    else {
                        if (!o.connectedPos) return;
                        t = o.connectedPos.x, i = o.connectedPos.y, s = o.connectedAnchor.x, h = o.connectedAnchor.y
                    }
                    c.move(s, h), this.editing || this.hovering ? (r.plot(t, i, s, h), r.style("stroke-dasharray", Tools.dashLength()), r.show()) : r.hide()
                }), this.registerMoveSvg(c, e), c
            };
        o.anchorGroup = e(ToolType.anchor), o.connectedAnchorGroup = e(ToolType.connectedAnchor), this.createToolGroup && (o.toolGroup = this.createToolGroup())
    }
    createArgs() {
        let o = {},
            e = this.node,
            t = e.convertToWorldSpaceAR(this.target.anchor);
        if (o.anchor = this.worldToPixel(t), o.pos = this.worldToPixel(e.convertToWorldSpaceAR(cc.Vec2.ZERO)), this.target.connectedBody) {
            let e = this.target.connectedBody.node,
                t = e.convertToWorldSpaceAR(this.target.connectedAnchor);
            o.connectedAnchor = this.worldToPixel(t), o.connectedPos = this.worldToPixel(e.convertToWorldSpaceAR(cc.Vec2.ZERO))
        }
        return o
    }
    dirty() {
        let o = this._viewDirty() || this._nodeDirty() || this._dirty;
        return this.target.connectedBody && (o = o || this._nodeDirty(this.target.connectedBody.node)), o
    }
    onUpdate() {
        let o = this._root,
            e = this.createArgs();
        this.target.connectedBody ? o.connectedAnchorGroup.show() : o.connectedAnchorGroup.hide(), o.anchorGroup.plot(e), o.connectedAnchorGroup.plot(e), o.toolGroup && o.toolGroup.plot(e)
    }
}
JointGizmo.ToolType = ToolType, module.exports = JointGizmo;