"use strict";
exports.promisify = function (e) {
    return function (...r) {
        return new Promise((t, n) => {
            e(...r, (e, r) => {
                if (e) return n(e);
                t(r)
            })
        })
    }
}, exports.equalArray = function (e, r) {
    return e.length === r.length && e.every(e => -1 !== r.indexOf(e))
}, exports.forEachCurve = function (e, r) {
    e && (Object.keys(e.props).forEach(t => {
        let n = e.props[t];
        r(null, t, n)
    }), Object.keys(e.comps).forEach(t => {
        let n = e.comps[t];
        Object.keys(n).forEach(e => {
            let o = n[e];
            r(t, e, o)
        })
    }))
}, exports.packKey = function (e, r, t, n, o, c) {
    return {
        id: e,
        path: r,
        component: t,
        property: n,
        frame: o,
        value: c
    }
}, exports.indexOf = function (e, r) {
    let t = Object.keys(r);
    for (let n = 0; n < e.length; n++) {
        let o = e[n];
        if (t.every(e => o[e] === r[e])) return n
    }
    return -1
};