function Polygon(t) {
    this.points = t, this.points.length < 3 && console.warn("Invalid polygon, the data must contains 3 or more points.")
}
Polygon.prototype.intersects = function (t) {
    return Editor.Utils.Intersection.polygonPolygon(this, t)
}, Polygon.prototype.contains = function (t) {
    for (var o = !1, n = t.x, i = t.y, s = this.points.length, e = 0, r = s - 1; e < s; r = e++) {
        var p = this.points[e].x,
            h = this.points[e].y,
            l = this.points[r].x,
            y = this.points[r].y;
        h > i != y > i && n < (l - p) * (i - h) / (y - h) + p && (o = !o)
    }
    return o
}, Object.defineProperty(Polygon.prototype, "center", {
    get: function () {
        if (this.points.length < 3) return null;
        for (var t = this.points[0].x, o = this.points[0].y, n = this.points[0].x, i = this.points[0].y, s = 1; s < this.points.length; ++s) {
            var e = this.points[s].x,
                r = this.points[s].y;
            e < t ? t = e : e > n && (n = e), r < o ? o = r : r > i && (i = r)
        }
        return new cc.Vec2(.5 * (n + t), .5 * (i + o))
    }
}), module.exports = Polygon;