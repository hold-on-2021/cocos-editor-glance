cc._widgetManager.updateOffsetsToStayPut = function (t, e) {
    function i(t, e) {
        return Math.abs(t - e) > 1e-10 ? e : t
    }
    var a = t.node,
        o = a._parent;
    if (o) {
        var h = cc.Vec2.ZERO,
            r = cc.Vec2.ONE;
        t._target && (o = t._target, this._computeInverseTransForTarget(a, o, h, r));
        var g = o._anchorPoint,
            s = this._getReadonlyNodeSize(o),
            c = a.getAnchorPoint(),
            n = a._position,
            l = cc._widgetManager._AlignFlags;
        if (void 0 === e && (e = t._alignFlags), e & l.LEFT) {
            var _ = -g.x * s.width;
            _ += h.x, _ *= r.x;
            var y = n.x - c.x * a.width * a._scaleX - _;
            t.isAbsoluteLeft || (y /= s.width), y /= r.x, t.left = i(t.left, y)
        }
        if (e & l.RIGHT) {
            var d = (1 - g.x) * s.width;
            d += h.x;
            var v = (d *= r.x) - (n.x + (1 - c.x) * a.width * a._scaleX);
            t.isAbsoluteRight || (v /= s.width), v /= r.x, t.right = i(t.right, v)
        }
        if (e & l.TOP) {
            var f = (1 - g.y) * s.height;
            f += h.y;
            var x = (f *= r.y) - (n.y + (1 - c.y) * a.height * a._scaleY);
            t.isAbsoluteTop || (x /= s.height), x /= r.y, t.top = i(t.top, x)
        }
        if (e & l.BOT) {
            var u = -g.y * s.height;
            u += h.y, u *= r.y;
            var w = n.y - c.y * a.height * a._scaleY - u;
            t.isAbsoluteBottom || (w /= s.height), w /= r.y, t.bottom = i(t.bottom, w)
        }
    }
};