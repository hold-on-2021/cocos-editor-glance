"use strict";

function _lineLine(n, e, t, i) {
    var o = (i.x - t.x) * (n.y - t.y) - (i.y - t.y) * (n.x - t.x),
        r = (e.x - n.x) * (n.y - t.y) - (e.y - n.y) * (n.x - t.x),
        c = (i.y - t.y) * (e.x - n.x) - (i.x - t.x) * (e.y - n.y);
    if (0 !== c) {
        var l = o / c,
            y = r / c;
        if (0 <= l && l <= 1 && 0 <= y && y <= 1) return !0
    }
    return !1
}

function _lineRect(n, e, t) {
    var i = new cc.Vec2(t.x, t.y),
        o = new cc.Vec2(t.x, t.yMax),
        r = new cc.Vec2(t.xMax, t.yMax),
        c = new cc.Vec2(t.xMax, t.y);
    return !!_lineLine(n, e, i, o) || (!!_lineLine(n, e, o, r) || (!!_lineLine(n, e, r, c) || !!_lineLine(n, e, c, i)))
}

function _linePolygon(n, e, t) {
    for (var i = t.points.length, o = 0; o < i; ++o) {
        if (_lineLine(n, e, t.points[o], t.points[(o + 1) % i])) return !0
    }
    return !1
}

function _rectRect(n, e) {
    var t = n.x,
        i = n.y,
        o = n.x + n.width,
        r = n.y + n.height,
        c = e.x,
        l = e.y,
        y = e.x + e.width,
        x = e.y + e.height;
    return t <= y && o >= c && i <= x && r >= l
}

function _rectPolygon(n, e) {
    var t, i = new cc.Vec2(n.x, n.y),
        o = new cc.Vec2(n.x, n.yMax),
        r = new cc.Vec2(n.xMax, n.yMax),
        c = new cc.Vec2(n.xMax, n.y);
    if (_linePolygon(i, o, e)) return !0;
    if (_linePolygon(o, r, e)) return !0;
    if (_linePolygon(r, c, e)) return !0;
    if (_linePolygon(c, i, e)) return !0;
    for (t = 0; t < e.points.length; ++t)
        if (n.contains(e.points[t])) return !0;
    return !!e.contains(i) || (!!e.contains(o) || (!!e.contains(r) || !!e.contains(c)))
}

function _polygonPolygon(n, e) {
    var t;
    for (t = 0; t < n.points.length; ++t) {
        if (_linePolygon(n.points[t], n.points[(t + 1) % n.points.length], e)) return !0
    }
    for (t = 0; t < e.points.length; ++t)
        if (n.contains(e.points[t])) return !0;
    for (t = 0; t < n.points.length; ++t)
        if (e.contains(n.points[t])) return !0;
    return !1
}
var Intersection = {};
Intersection.lineLine = _lineLine, Intersection.lineRect = _lineRect, Intersection.linePolygon = _linePolygon, Intersection.rectRect = _rectRect, Intersection.rectPolygon = _rectPolygon, Intersection.polygonPolygon = _polygonPolygon, module.exports = Intersection;