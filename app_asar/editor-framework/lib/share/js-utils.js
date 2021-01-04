"use strict";

function _getPropertyDescriptor(e, r) {
    if (!e) return null;
    return Object.getOwnPropertyDescriptor(e, r) || _getPropertyDescriptor(Object.getPrototypeOf(e), r)
}

function _copyprop(e, r, t) {
    let o = _getPropertyDescriptor(r, e);
    Object.defineProperty(t, e, o)
}
const Platform = require("./platform");
let Console;
Console = Platform.isMainProcess ? require("../main/console") : require("../renderer/console"), module.exports = {
    copyprop: _copyprop,
    assign(e, ...r) {
        e = e || {};
        for (let t = 0; t < r.length; t++) {
            let o = r[t];
            if (o) {
                if ("object" != typeof o) {
                    Console.error("JS.assign called on non-object:", o);
                    continue
                }
                for (let r in o) _copyprop(r, o, e)
            }
        }
        return e
    },
    assignExcept(e, r, t) {
        if (e = e || {}, "object" != typeof r) return Console.error("JS.assignExcept called on non-object:", r), null;
        for (let o in r) - 1 === t.indexOf(o) && _copyprop(o, r, e);
        return e
    },
    addon(e, ...r) {
        e = e || {};
        for (let t = 0; t < r.length; ++t) {
            let o = r[t];
            for (let r in o) r in e || _copyprop(r, o, e)
        }
        return e
    },
    extract(e, r) {
        let t = {};
        for (let o = 0; o < r.length; ++o) {
            let n = r[o];
            void 0 !== e[n] && _copyprop(n, e, t)
        }
        return t
    },
    extend(e, r) {
        function t() {
            this.constructor = e
        }
        if (!r) return Console.error("The base class to extend from must be non-nil"), void 0;
        if (!e) return Console.error("The class to extend must be non-nil"), void 0;
        for (var o in r) r.hasOwnProperty(o) && (e[o] = r[o]);
        return t.prototype = r.prototype, e.prototype = new t, e
    },
    clear(e) {
        let r = Object.keys(e);
        for (let t = 0; t < r.length; t++) delete e[r[t]]
    },
    getPropertyByPath(e, r) {
        if (!e) return null;
        if (-1 === r.indexOf(".")) return e[r];
        let t = r.split("."),
            o = e;
        for (let e = 0; e < t.length; e++)
            if (o = o[t[e]], !o) return null;
        return o
    }
};