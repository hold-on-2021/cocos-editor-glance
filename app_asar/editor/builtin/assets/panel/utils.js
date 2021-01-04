"use strict";
const fs = require("fire-fs"),
    path = require("fire-path"),
    uuid = require("node-uuid");
let promisify = function (i) {
        return function (...r) {
            return new Promise(function (e, t) {
                i(...r, (i, r) => {
                    i ? t(i) : e(r)
                })
            })
        }
    },
    exists = async function (i) {
        return await new Promise(r => {
            fs.exists(i, r)
        })
    }, copy = async function (i, r) {
        if (!await exists(i)) return new Error(`File does not exist - ${i}`), void 0;
        for (; await exists(r);) r = r.replace(/( - (\d+))?(\.[^\.]+)?$/, (i, r, e, t) => {
            let s = e ? parseInt(e) : 0,
                n = ++s + "";
            for (; n.length < 3;) n = "0" + n;
            return ` - ${n}${t || ""}`
        });
        return await promisify(fs.copy)(i, r), r
    }, isReadOnly = async function (i) {
        let r = await promisify(Editor.assetdb.queryInfoByUuid)(i);
        if (!r) return !0;
        let e = await promisify(Editor.assetdb.queryUrlByUuid)(i);
        if (!e) return !0;
        let t = await promisify(Editor.assetdb.queryAssets)(e, r.type);
        return !(!t || !t[0]) && !!t[0].readonly
    }, isDir = async function (i) {
        return await promisify(fs.isDir)(i)
    }, isSubDir = function (i, r) {
        return 0 === i.indexOf(r) && i !== r
    }, uuid2path = async function (i) {
        let r = await promisify(Editor.assetdb.queryUrlByUuid)(i);
        if (!r) return null;
        let e = Editor.url(r);
        return decodeURI(e)
    }, copyMeta = async function (i, r) {
        i += ".meta", r += ".meta";
        let e = await promisify(fs.readFile)(i, "utf-8"),
            t = await promisify(fs.readFile)(r, "utf-8");
        if (!e || !t) return;
        let s = JSON.parse(e),
            n = JSON.parse(t),
            a = function (i, r) {
                Object.keys(i).forEach(e => {
                    let t = i[e],
                        s = r[e];
                    "object" == typeof t ? (s || (s = Array.isArray(t) ? r[e] = [] : r[e] = {}), a(t, s)) : r[e] = t
                })
            };
        a(s, n)
    };
module.exports = {
    promisify: promisify,
    isSubDir: isSubDir,
    copy: copy,
    isDir: isDir,
    uuid2path: uuid2path,
    exists: exists,
    copyMeta: copyMeta,
    isReadOnly: isReadOnly
};