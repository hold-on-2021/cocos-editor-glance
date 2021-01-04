cc.js.mixin(cc.AnimationClip.prototype, {
    addProperty: function (r, e, n) {
        var t = this.getCurveInfo(e, n, !0);
        return t[r] || (t[r] = []), t[r]
    },
    removeProperty: function (r, e, n) {
        var t = this.getCurveInfo(e, n);
        t && (t[r] = void 0)
    },
    getProperty: function (r, e, n) {
        var t = this.getCurveInfo(e, n, !1);
        return t ? t[r] : null
    },
    getCurveInfo: function (r, e, n) {
        var t, i, o = this.curveData;
        if (e) {
            if (!o.paths) {
                if (!n) return null;
                o.paths = {}
            }
            if (!o.paths[e]) {
                if (!n) return null;
                o.paths[e] = {}
            }
            t = o.paths[e]
        } else t = o;
        if (r) {
            var u = t.comps;
            if (!u) {
                if (!n) return null;
                u = t.comps = {}
            }
            var a = u[r];
            if (!a) {
                if (!n) return null;
                a = u[r] = {}
            }
            i = a
        } else {
            if (!t.props) {
                if (!n) return null;
                t.props = {}
            }
            i = t.props
        }
        return i
    },
    removeUnusedProperties: function () {
        function r(e) {
            if (Array.isArray(e)) return !1;
            var n = !0;
            for (var t in e) {
                var i = e[t];
                void 0 !== i && (r(i) ? e[t] = void 0 : n = !1)
            }
            return n
        }
        r(this.curveData)
    },
    createNode: function (r) {
        require("fire-url"), require("fire-fs");
        var e = new cc.Node(this.name),
            n = this.curveData;
        if (n) {
            var t = n.comps;
            for (var i in t) e.addComponent(i)
        }
        return e.addComponent(cc.Animation).addClip(this), r(null, e)
    }
});