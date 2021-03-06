"use strict";

function boundsToRect(t) {
    return cc.rect(t[1].x, t[1].y, t[3].x - t[1].x, t[3].y - t[1].y)
}
let Tools = require("./tools"),
    RectToolType = Tools.rectTool.Type,
    snapPixelWihVec2 = Editor.GizmosUtils.snapPixelWihVec2,
    v2 = cc.v2,
    NodeUtils = _Scene.NodeUtils;
class RectGizmo extends Editor.Gizmo {
    init() {
        this._processing = !1, this._rect = cc.rect(0, 0, 0, 0), this._tool = null
    }
    layer() {
        return "foreground"
    }
    onCreateMoveCallbacks() {
        function t(t, e, o, i) {
            t === RectToolType.LeftBottom ? o.x *= -1 : t === RectToolType.LeftTop ? (o.x *= -1, o.y *= -1) : t === RectToolType.RightTop ? o.y *= -1 : t === RectToolType.Left ? (o.x *= -1, i || (e.y = o.y = 0)) : t === RectToolType.Right ? i || (e.y = o.y = 0) : t === RectToolType.Top ? (o.y *= -1, i || (e.x = o.x = 0)) : t === RectToolType.Bottom && (i || (e.x = o.x = 0))
        }

        function e(t, e, o, i, n) {
            return t === RectToolType.Right || t === RectToolType.RightTop || t === RectToolType.RightBottom ? (n && (i.x /= 1 - e.x), o.x = i.x * e.x) : (n && (i.x /= e.x), o.x = i.x * (1 - e.x)), t === RectToolType.LeftBottom || t === RectToolType.Bottom || t === RectToolType.RightBottom ? (n && (i.y /= 1 - e.y), o.y = i.y * e.y) : (n && (i.y /= e.y), o.y = i.y * (1 - e.y)), o
        }
        let o = [],
            i = [],
            n = [],
            r = [],
            l = [],
            s = this;
        return {
            start: () => {
                o.length = 0, n.length = 0, i.length = 0, r.length = 0, l.length = 0, l.tempRect = boundsToRect(s.getBounds()), s._processing = !0;
                for (let t = 0, e = s.target.length; t < e; ++t) {
                    let e = s.target[t];
                    o.push(NodeUtils.getWorldPosition(e)), i.push(e.position), n.push(e.getContentSize()), r.push(e.getAnchorPoint()), l.push(NodeUtils.getWorldBounds(e))
                }
            },
            update: (c, h, a, d) => {
                let g = new cc.Vec2(c, h);
                if (d === RectToolType.Anchor)(function (t) {
                    let e = s.target[0],
                        i = e.getContentSize(),
                        n = e.position,
                        r = o[0].add(t);
                    NodeUtils.setWorldPosition(e, r);
                    let l = cc.affineTransformClone(e.getParentToNodeTransform());
                    l.tx = l.ty = 0;
                    let c = e.position.sub(n);
                    c = cc.pointApplyAffineTransform(c, l);
                    let h = e.getAnchorPoint();
                    h = h.add(cc.v2(c.x / i.width, c.y / i.height)), e.setAnchorPoint(h)
                })(g.clone());
                else if (d === RectToolType.Center)(function (t) {
                    let e = s.target.length;
                    for (let i = 0; i < e; ++i) {
                        let e = s.target[i],
                            n = (o[i], e.getContentSize()),
                            l = r[i],
                            c = e.parent.convertToNodeSpaceAR(cc.p(0, 0)),
                            h = e.parent.convertToNodeSpaceAR(t);
                        h = c.sub(h);
                        let a = cc.affineTransformClone(e.getParentToNodeTransform());
                        a.tx = a.ty = 0, h = cc.pointApplyAffineTransform(h, a), l = l.add(cc.v2(h.x / n.width, h.y / n.height)), e.setAnchorPoint(l)
                    }
                })(g.clone());
                else {
                    let r = !!a && a.shiftKey,
                        c = !!a && a.altKey;
                    s.target.length > 1 ? function (i, r, c, h) {
                        let a = l.tempRect;
                        c && (r.y = r.x * (a.height / a.width));
                        let d = r.clone();
                        t(i, r, d, c), e(i, h ? v2(.5, .5) : v2(0, 0), r, d, h);
                        let g = a.clone();
                        g.x = a.x - r.x, g.y = a.y - r.y, g.width = a.width + d.x, g.height = a.height + d.y, s._rect = g;
                        for (let t = 0, e = s.target.length; t < e; t++) {
                            let e = s.target[t],
                                i = o[t],
                                r = (i.x - a.x) / a.width,
                                c = (i.y - a.y) / a.height;
                            NodeUtils.setWorldPosition(e, v2(g.x + r * g.width, g.y + c * g.height));
                            let h = l[t],
                                p = h.width / a.width,
                                y = h.height / a.height,
                                T = n[t],
                                f = T.width > 0 ? 1 : -1,
                                u = T.height > 0 ? 1 : -1,
                                x = d.clone();
                            x.x = x.x * p * f, x.y = x.y * y * u;
                            let m = cc.affineTransformClone(e.getWorldToNodeTransform());
                            m.tx = m.ty = 0, m.a = Math.abs(m.a), m.b = Math.abs(m.b), m.c = Math.abs(m.c), m.d = Math.abs(m.d), x = cc.pointApplyAffineTransform(x, m), e.setContentSize(cc.size(T.width + x.x, T.height + x.y))
                        }
                    }(d, g.clone(), r, c) : function (o, r, l, c) {
                        let h = n[0];
                        l && (r.y = r.x * (h.height / h.width));
                        let a = r.clone(),
                            d = i[0],
                            g = s.target[0],
                            p = cc.affineTransformClone(g.getWorldToNodeTransform()),
                            y = cc.affineTransformClone(g.getNodeToParentTransform());
                        p.tx = p.ty = 0, y.tx = y.ty = 0;
                        let T = cc.pointApplyAffineTransform(r, p),
                            f = cc.pointApplyAffineTransform(a, p);
                        e(o, g.getAnchorPoint(), T, f, c), t(o, T, f, l), c || (T = cc.pointApplyAffineTransform(T, y), g.position = d.add(T)), g.setContentSize(cc.size(h.width + f.x, h.height + f.y))
                    }(d, g.clone(), r, c)
                }
            },
            end: (t, e, o) => {
                if (t)
                    if (o < RectToolType.Center) this.adjustValue(node, ["anchorX", "anchorY"]);
                    else if (o === RectToolType.Anchor) {
                    let t = s.target[0];
                    this.adjustValue(t, ["x", "y"]);
                    let e = (0 | Math.max(t.width, t.height)).toString().length;
                    this.adjustValue(t, ["anchorX", "anchorY"], this.defaultMinDifference() + e)
                } else this.adjustValue(s.target, ["x", "y", "width", "height"]);
                s._processing = !1
            }
        }
    }
    onCreateRoot() {
        this._tool = Tools.rectTool(this._root, this.createMoveCallbacks())
    }
    formatBounds(t) {
        return [this.worldToPixel(t[0]), this.worldToPixel(t[1]), this.worldToPixel(t[2]), this.worldToPixel(t[3])]
    }
    getBounds(t, e) {
        function o(t) {
            t.x > n && (n = t.x), t.x < i && (i = t.x), t.y > l && (l = t.y), t.y < r && (r = t.y)
        }
        let i = Number.MAX_VALUE,
            n = -Number.MAX_VALUE,
            r = Number.MAX_VALUE,
            l = -Number.MAX_VALUE;
        this.target.forEach(t => {
            let e = _Scene.NodeUtils.getWorldOrientedBounds(t);
            o(e[0]), o(e[1]), o(e[2]), o(e[3])
        });
        let s;
        return t && (s = i, i = n, n = s), e && (s = r, r = l, l = s), [cc.p(i, l), cc.p(i, r), cc.p(n, r), cc.p(n, l)]
    }
    onKeyDown(t) {
        if (!this.target) return;
        let e = Editor.KeyCode(t.which);
        if ("left" !== e && "right" !== e && "up" !== e && "down" !== e) return;
        let o = cc.v2();
        "left" === e ? o.x = -1 : "right" === e ? o.x = 1 : "up" === e ? o.y = 1 : "down" === e && (o.y = -1), this.recordChanges(), this.topNodes.forEach(t => {
            t.position = t.position.add(o)
        }), this._view.repaintHost()
    }
    onKeyUp(t) {
        if (!this.target) return;
        let e = Editor.KeyCode(t.which);
        "left" !== e && "right" !== e && "up" !== e && "down" !== e || this.commitChanges()
    }
    visible() {
        return !0
    }
    dirty() {
        return !0
    }
    onUpdate() {
        let t = [];
        if (1 === this.target.length) {
            let e = this.target[0];
            t = _Scene.NodeUtils.getWorldOrientedBounds(e), t = this.formatBounds(t);
            let o = NodeUtils.getWorldPosition(e),
                i = NodeUtils.getWorldPosition(e.parent);
            t.anchor = this.worldToPixel(o), t.origin = this.worldToPixel(i), t.localPosition = snapPixelWihVec2(e.position), t.localSize = e.getContentSize()
        } else {
            let e = !1,
                o = !1;
            this._processing && (e = this._rect.width < 0, o = this._rect.height < 0), t = this.getBounds(e, o), t = this.formatBounds(t)
        }
        this._tool.setBounds(t)
    }
}
module.exports = RectGizmo;