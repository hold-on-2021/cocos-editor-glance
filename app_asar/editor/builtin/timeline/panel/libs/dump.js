"use strict";
const diffPatch = require("jsondiffpatch"),
    utils = require("./utils");
let _diffpatcher = diffPatch.create({
        objectHash: (e, t) => e.uuid ? e.uuid : e.name && e.attrs ? e.name : `$$index:${t}`,
        arrays: {
            detectMove: !0
        }
    }),
    root = "",
    cache = {},
    updateDumps = async function (e) {
        let t = Editor.Selection.curSelection("node");
        root && -1 === t.indexOf(root) && t.push(root);
        for (let e = 0; e < t.length; e++) {
            let r = t[e],
                i = await utils.promisify(Editor.Ipc.sendToPanel)("scene", "scene:query-node", r);
            cache[r] = JSON.parse(i)
        }
        Object.keys(cache).forEach(e => {
            -1 === t.indexOf(e) && delete cache[e]
        }), e && e()
    }, _updateTimer = !1, update = async function (e) {
        clearTimeout(_updateTimer), _updateTimer = setTimeout(() => {
            updateDumps(e)
        }, 100)
    }, diff = function (e, t) {
        let r = [],
            i = cache[e];
        if (!i) return Editor.warn("找不到缓存的节点数据"), r;
        let o = _diffpatcher.diff(i.value, t.value);
        if (!o) return r;
        let c = o,
            a = o ? o.__comps__ || {} : {};
        return delete o.__comps__, Object.keys(c).forEach(i => {
            let o = getProperty(e, null, i, t);
            r.push({
                component: null,
                property: i,
                value: o
            });
            let a = Object.keys(c[i].value);
            a && a.forEach(e => {
                let t, c = i + e[0].toUpperCase() + e.substr(1);
                switch (c) {
                    case "positionX":
                        c = "x", t = o[0];
                        break;
                    case "positionY":
                        c = "y", t = o[1];
                        break;
                    case "sizeWidth":
                        c = "width", t = o.width;
                        break;
                    case "sizeHeight":
                        c = "height", t = o.height;
                        break;
                    default:
                        t = o[e]
                }
                r.push({
                    component: null,
                    property: c,
                    value: t
                })
            })
        }), Object.keys(a).forEach(i => {
            if (!t.value.__comps__[i]) return;
            let o = t.value.__comps__[i].type,
                c = a[i].value;
            o && c && Object.keys(c).forEach(i => {
                let c = getProperty(e, o, i, t);
                r.push({
                    component: o,
                    property: i,
                    value: c
                })
            })
        }), cache[e] = t, r
    }, getProperty = function (e, t, r, i) {
        if (i = i || cache[e], !i) throw "timeline 找不到指定的节点数据，无法获取关键帧";
        if (t) {
            let e = t,
                o = r;
            for (let r in i.types) {
                if (i.types[r].name === t) {
                    e = r;
                    break
                }
            }
            let c = null;
            for (let t in i.value.__comps__) {
                let r = i.value.__comps__[t];
                if (r.type === e) {
                    c = r.value;
                    break
                }
            }
            let a = cc.js._getClassById(e);
            if (!a) return c[o] ? c[o].value : null;
            let l = cc.Class.attr(a, o);
            if (!l.ctor) return c[o] ? c[o].value : null;
            if (cc.isChildClassOf(l.ctor, cc.RawAsset)) {
                let e = c[o].value;
                return e.uuid ? Editor.serialize.asAsset(e.uuid) : null
            }
            let n = new l.ctor,
                u = i.types[n.__cid__];
            if (u && u.properties) {
                let e = u.properties;
                for (let t in e) n[t] = c[o].value[t]
            }
            return n
        }
        "x" === r ? r = "positionX" : "y" === r && (r = "positionY");
        let o = r,
            c = null,
            a = o.substr(0, o.length - 1);
        i.value[a] && (c = o[o.length - 1].toLocaleLowerCase(), o = a), "width" !== o && "height" !== o || (c = o, o = "size");
        let l = i.value[o],
            n = l ? cloneValue[l.type] : null;
        if (!n) throw `timeline 复制属性出现错误 - ${l.type}`;
        let u = n(l.value);
        return "position" === r ? [u.x, u.y] : c ? u[c] : u
    }, cloneValue = {
        "cc.Vec2"(e) {
            var t = new cc.Vec2;
            return t.x = e.x, t.y = e.y, t
        },
        "cc.Color"(e) {
            var t = new cc.Color;
            return t.r = e.r, t.g = e.g, t.b = e.b, t
        },
        "cc.Size"(e) {
            var t = new cc.Size;
            return t.width = e.width, t.height = e.height, t
        },
        String: e => e,
        Float: e => e,
        Boolean: e => e,
        Integer: e => e
    }, hasAnimaiton = function (e) {
        let t = cache[e];
        return !!t && -1 !== Object.keys(t.types).indexOf("cc.Animation")
    };
module.exports = {
    update: update,
    diff: diff,
    getProperty: getProperty,
    get root() {
        return root
    },
    set root(e) {
        root = e
    },
    hasAnimaiton: hasAnimaiton
}, window.abc = cache;