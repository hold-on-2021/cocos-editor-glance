"use strict";
var Fs = require("fire-fs"),
    Url = require("fire-url"),
    _ = require("lodash");
module.exports = exports = Editor.Utils || {}, exports.urlToPath = function (r) {
    return decodeURIComponent(Url.parse(r).pathname)
}, exports.filterAsync = function (r, t, e) {
    var i = require("async");
    i.someSeries ? i.filter(r, t, e) : i.filter(r, function (r, e) {
        t(r, function (r, t) {
            e(t)
        })
    }, function (r) {
        e(null, r)
    })
}, exports.asyncif = function (r, t) {
    return r ? t : function (r) {
        r()
    }
}, exports.MultipleValueDict = class {
    constructor() {
        this.dict = {}
    }
    get(r) {
        return this.dict[r]
    }
    add(r, t) {
        var e = this.dict,
            i = e[r];
        return i ? Array.isArray(i) ? i.push(t) : e[r] = [i, t] : e[r] = t, this
    }
    value() {
        return this.dict
    }
    multiple() {
        return _.pickBy(this.dict, _.isArray)
    }
}, exports.toString = function (r) {
    try {
        return "" + r
    } catch (t) {
        if (t instanceof TypeError) return typeof r;
        throw t
    }
}, exports.refreshSelectedInspector = function (r, t) {
    var e = Editor.Selection.curGlobalActivate();
    if (e && e.id === t && e.type === r) {
        Editor.Selection.unselect(r, t);
        (e = Editor.Selection.curGlobalActivate()) && e.type === r && e.id ? setTimeout(function () {
            Editor.Selection.select(r, t, !1)
        }, 200) : Editor.Selection.select(r, t, !1)
    }
}, exports.getDependsRecursively = function () {
    function r(t, e, i) {
        t[i] = !0;
        var n = e[i];
        if (n && n.length > 0)
            for (var o = 0; o < n.length; o++) {
                t[n[o]] || r(t, e, n[o])
            }
    }
    return function (t, e) {
        var i = {};
        if (Array.isArray(e))
            for (var n = 0; n < e.length; n++) r(i, t, e[n]);
        else r(i, t, e);
        return Object.keys(i)
    }
}(), exports.UuidCache = function () {
    function r(r) {
        if (!r) return "";
        var t = cc.AssetLibrary.parseUuidInEditor(r);
        if (t) return t;
        var e = Editor.Utils.urlToPath(r + ".meta");
        if (Fs.existsSync(e)) try {
            var i = Fs.readFileSync(e);
            t = JSON.parse(i).uuid || ""
        } catch (r) {}
        return t
    }
    var t = /\\/g,
        e = {};
    return Editor.isRendererProcess ? {
        urlToUuid: function (i) {
            i = i.replace(t, "/");
            var n = e[i];
            return n || (n = r(i), n && (e[i] = n), n)
        },
        cache: function (i, n) {
            if (i = i.replace(t, "/"), !n) {
                if (n = e[i], n) return;
                n = r(i)
            }
            n && (e[i] = n)
        },
        clear: function () {
            e = {}
        }
    } : {
        urlToUuid: function (r) {
            return Editor.assetdb.urlToUuid(r)
        }
    }
}();