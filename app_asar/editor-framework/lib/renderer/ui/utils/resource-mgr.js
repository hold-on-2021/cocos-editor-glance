"use strict";

function _loadResourcePromise(e) {
    return new Promise(function (r, o) {
        let t = new window.XMLHttpRequest;
        t.open("GET", e, !0), t.onreadystatechange = function (s) {
            4 === t.readyState && (-1 === [0, 200, 304].indexOf(t.status) ? o(new Error(`While loading from url ${e} server responded with a status of ${t.status}`)) : r(s.target.response))
        }, t.send(null)
    })
}

function _cacheResource(e, r) {
    return void 0 === r ? (Console.error(`Failed to load resource: ${e}`), _cachedResources[e] = void 0, void 0) : (_cachedResources[e] = r, r)
}

function _cacheStylesheet(e, r) {
    return void 0 === r ? (Console.error(`Failed to load stylesheet: ${e}`), _cachedResources[e] = void 0, void 0) : (r += `\n//# sourceURL=${e}`, _cachedResources[e] = r, r)
}

function _evaluateAndCacheScript(e, r) {
    if (void 0 === r) return Console.error(`Failed to load script: ${e}`), _cachedResources[e] = void 0, void 0;
    r += `\n//# sourceURL=${e}`;
    let o = window.eval(r);
    return _cachedResources[e] = o, o
}
let ResMgr = {};
module.exports = ResMgr;
const Console = require("../../console");
let _cachedResources = {};
ResMgr.getResource = function (e) {
    return _cachedResources[e]
}, ResMgr.importStylesheet = function (e) {
    let r = _cachedResources[e];
    return void 0 !== r ? new Promise(function (e) {
        e(r)
    }) : _loadResourcePromise(e).then(_cacheStylesheet.bind(this, e), _cacheStylesheet.bind(this, e, void 0))
}, ResMgr.importStylesheets = function (e) {
    if (!Array.isArray(e)) return Console.error("Call to `importStylesheets` failed. The`urls` parameter must be an array"), void 0;
    let r = [];
    for (let o = 0; o < e.length; ++o) {
        let t = e[o];
        r.push(ResMgr.importStylesheet(t))
    }
    return Promise.all(r)
}, ResMgr.loadGlobalScript = function (e, r) {
    let o = document.createElement("script");
    o.type = "text/javascript", o.onload = function () {
        r && r()
    }, o.src = e, document.head.appendChild(o)
}, ResMgr.importScript = function (e) {
    let r = _cachedResources[e];
    return void 0 !== r ? new Promise(function (e) {
        e(r)
    }) : _loadResourcePromise(e).then(_evaluateAndCacheScript.bind(this, e), _evaluateAndCacheScript.bind(this, e, void 0))
}, ResMgr.importScripts = function (e) {
    if (!Array.isArray(e)) return Console.error("Call to `importScripts` failed. The`urls` parameter must be an array"), void 0;
    let r = [];
    for (let o = 0; o < e.length; ++o) {
        let t = e[o];
        r.push(ResMgr.importScript(t))
    }
    return Promise.all(r)
}, ResMgr.importTemplate = function (e) {
    let r = _cachedResources[e];
    return void 0 !== r ? new Promise(function (e) {
        e(r)
    }) : _loadResourcePromise(e).then(_cacheResource.bind(this, e), _cacheResource.bind(this, e, void 0))
}, ResMgr.importResource = function (e) {
    let r = _cachedResources[e];
    return void 0 !== r ? new Promise(function (e) {
        e(r)
    }) : _loadResourcePromise(e).then(_cacheResource.bind(this, e), _cacheResource.bind(this, e, void 0))
};