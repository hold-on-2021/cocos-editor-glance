var RefInfos = function () {
        this.objList = [], this.keyList = [], this.referncedIDList = [], this.referencedCounts = [], this.temporaryDataList = []
    },
    nicifySerialized = function (e) {
        var i = e[0];
        if (void 0 !== i) {
            var r = new RefInfos;
            r.referencedCounts = new Array(e.length);
            var t, s, n, a, f, o = e.slice();
            _iterative(i, e, r);
            var d = 0;
            for (d = 0; d < r.temporaryDataList.length; d++) delete r.temporaryDataList[d]._iN$t;
            for (d = 0; d < r.objList.length; d++)
                if (s = r.objList[d], t = r.referncedIDList[d], n = r.keyList[d], a = o[t], f = r.referencedCounts[t] > 1, !f) {
                    s[n] = a;
                    var _ = e.indexOf(a);
                    e.splice(_, 1)
                } for (d = 0; d < r.objList.length; d++)
                if (t = r.referncedIDList[d], n = r.keyList[d], s = r.objList[d], f = r.referencedCounts[t] > 1, f) {
                    a = o[t];
                    var c = e.indexOf(a);
                    s[n].__id__ = c
                }
        }
    },
    _iterative = function (e, i, r) {
        if ("object" == typeof e) {
            if (e._iN$t = !0, r.temporaryDataList.push(e), e.content) {
                var t = e.__type__ && cc.js._getClassById(e.__type__);
                if (t && t.prototype._serialize) return
            }
            var s;
            if (Array.isArray(e))
                for (var n = 0; n < e.length; n++)(s = e[n]) && _traversalChild(s, n, e, i, r);
            else
                for (var a in e)(s = e[a]) && _traversalChild(s, a, e, i, r)
        }
    },
    _traversalChild = function (e, i, r, t, s) {
        var n = e.__id__,
            a = void 0 !== n;
        a && (e = t[n], -1 !== s.referncedIDList.indexOf(n) ? s.referencedCounts[n]++ : s.referencedCounts[n] = 1, s.referncedIDList.push(n), s.keyList.push(i), s.objList.push(r));
        !e._iN$t ? _iterative(e, t, s) : a && s.referencedCounts[n]++
    };
CC_TEST && (cc._Test.nicifySerialized = nicifySerialized), module.exports = nicifySerialized;