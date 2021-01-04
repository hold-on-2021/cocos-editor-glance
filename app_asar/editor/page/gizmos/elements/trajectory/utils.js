"use strict";

function Segment(t, e, o) {
    this.pos = t ? t.clone() : v2(), this.inControl = e || this.pos.clone(), this.outControl = o || this.pos.clone(), this.keyframe = null
}

function getNearestParameter(t, e, o) {
    function n(t) {
        if (t >= 0 && t <= 1) {
            let e = r.getPoint(t),
                n = function (t, e) {
                    let o = t.x - e.x,
                        n = t.y - e.y;
                    return Math.sqrt(o * o + n * n)
                }(o, e);
            if (n < s) return s = n, l = t, i = e, !0
        }
    }
    let r = new Bezier;
    r.start = t.pos, r.end = e.pos, r.startCtrlPoint = t.outControl, r.endCtrlPoint = e.inControl;
    let i = null,
        s = 1 / 0,
        l = 0;
    for (let t = 0; t <= 100; t++) n(t / 100);
    let u = .005;
    for (; u > 4e-7;) n(l - u) || n(l + u) || (u /= 2);
    return {
        t: l,
        dist: s,
        pos: i
    }
}

function createSegmentWithNearset(t) {
    let e = t.t,
        o = t.seg1.segment,
        n = t.seg2.segment,
        r = o.pos.x,
        i = o.pos.y,
        s = o.outControl.x,
        l = o.outControl.y,
        u = n.inControl.x,
        a = n.inControl.y,
        p = 1 - e,
        h = p * r + e * s,
        c = p * i + e * l,
        g = p * s + e * u,
        C = p * l + e * a,
        m = p * u + e * n.pos.x,
        f = p * a + e * n.pos.y,
        y = p * h + e * g,
        x = p * c + e * C,
        S = p * g + e * m,
        v = p * C + e * f,
        d = p * y + e * S,
        N = p * x + e * v;
    o.outControl = v2(h, c), n.inControl = v2(m, f);
    let P = new Segment;
    return P.pos = v2(d, N), P.inControl = v2(y, x), P.outControl = v2(S, v), P
}
let Bezier = Editor.require("unpack://engine/cocos2d/animation/motion-path-helper").Bezier,
    v2 = cc.v2;
Segment.prototype.clone = function () {
    return new Segment(this.pos, this.inControl, this.outControl)
}, Segment.prototype.getValue = function () {
    return [this.pos.x, this.pos.y, this.inControl.x, this.inControl.y, this.outControl.x, this.outControl.y]
}, module.exports = {
    Segment: Segment,
    getNearestParameter: getNearestParameter,
    createSegmentWithNearset: createSegmentWithNearset
};