"use strict";

function _buildProp(e, t, r, p, a) {
    let l = r.value,
        o = r.type;
    r.name = p.displayName ? p.displayName : Editor.UI.toHumanText(t), r.path = e, r.attrs = Object.assign({}, p), o ? "visible" in r && (r.attrs.visible = r.visible) : r.attrs.visible = !1;
    let n = a[o],
        i = !1,
        c = !1,
        s = Editor.UI.getProperty(o);
    n && n.extends && (i = "cc.Asset" === o || "cc.RawAsset" === o || -1 !== n.extends.indexOf("cc.Asset") || -1 !== n.extends.indexOf("cc.RawAsset"), c = -1 !== n.extends.indexOf("cc.Object")), !Array.isArray(r.value) || "default" in p && !Array.isArray(p.default) ? i ? (r.type = "cc.Asset", r.attrs.assetType = p.type) : c ? (r.type = "cc.Node", r.attrs.typeid = p.type, n && (r.attrs.typename = n.name)) : s || (r.type = "Object", n && (r.attrs.typename = n.name)) : (r.type = "Array", r.elementType = o, i ? (r.elementType = "cc.Asset", r.attrs.assetType = p.type) : c ? (r.elementType = "cc.Node", r.attrs.typeid = p.type, n && (r.attrs.typename = n.name)) : s || (r.elementType = "Object")), r.compType = "cc-prop";
    let _ = !1;
    "Object" !== r.type || null !== r.value && void 0 !== r.value || (_ = !0);
    let d = !1;
    if (!1 === _ && r.attrs.type && o !== r.attrs.type && (n && n.extends ? -1 === n.extends.indexOf(r.attrs.type) && (d = !0) : d = !0), _) n = a[r.attrs.type], r.attrs.typename = n ? n.name : r.attrs.type, r.compType = "cc-null-prop";
    else if (d) r.compType = "cc-type-error-prop";
    else if ("Array" === r.type) {
        r.compType = "cc-array-prop";
        for (let t = 0; t < l.length; ++t) {
            _buildProp(`${e}.${t}`, `[${t}]`, l[t], p, a)
        }
    } else if ("Object" === r.type) {
        r.compType = "cc.ClickEvent" === o ? "cc-event-prop" : "cc-object-prop";
        let t = a[o];
        for (let p in r.value) {
            let l = r.value[p],
                o = t.properties[p];
            l && o ? _buildProp(`${e}.${p}`, p, l, o, a) : delete r.value[p]
        }
    }
}

function _buildComp(e, t, r) {
    let p = t.type;
    if (!p) return Editor.warn("Type can not be null"), void 0;
    let a = r[p];
    a && (a.editor && (t.__editor__ = a.editor), t.__displayName__ = a.name ? a.name : p);
    for (let p in t.value) {
        let l = t.value[p],
            o = a.properties[p];
        l && o ? _buildProp(`${e}.${p}`, p, l, o, r) : delete t.value[p]
    }
}

function buildNode(e, t, r) {
    let p = t.__type__;
    if (!p) return Editor.warn("Type can not be null"), void 0;
    let a = r[p];
    a && (a.editor && (t.__editor__ = a.editor), a.name && (t.__displayName__ = a.name));
    for (let p in t) {
        if ("__type__" === p || "__displayName__" === p || "uuid" === p) continue;
        if ("__comps__" === p) {
            let a = t[p];
            for (let t = 0; t < a.length; ++t) _buildComp(`${e}.__comps__.${t}`, a[t], r);
            continue
        }
        let l = t[p];
        l.path = `${e}.${p}`, l.readonly = !1;
        let o = a.properties[p];
        o && (t[p].readonly = !!o.readonly)
    }
}

function compPath(e) {
    let t = _compReg.exec(e);
    return t ? t[0].replace(_compReg, "target.__comps__[$1]") : ""
}

function normalizePath(e) {
    return e = e.replace(/^target\./, ""), e = e.replace(/^__comps__\.\d+\./, ""), e
}

function findRootVue(e) {
    for (var t = null; e;) {
        if (e.__vue__) {
            t = e;
            break
        }
        e = e.parentElement
    }
    return t.__vue__
}
let _compReg = /^target\.__comps__\.(\d+)/;
module.exports = {
    buildNode: buildNode,
    compPath: compPath,
    normalizePath: normalizePath,
    findRootVue: findRootVue
};