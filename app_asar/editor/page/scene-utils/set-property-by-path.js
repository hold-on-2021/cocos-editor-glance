function ProhibitedException() {}

function loadAsset(e, t, r, a) {
    cc.AssetLibrary.loadAsset(r, function (s, o) {
        var c = e.__asyncStates[t];
        if (c.uuid === r) {
            if (c.state = "end", c.uuid = "", s) return Editor.error("Failed to set asset", s);
            !a || o instanceof a || Editor.warn("The new %s must be instance of %s", t, cc.js.getClassName(a)), e[t] = o, cc.engine.repaintInEditMode()
        }
    })
}

function setAsset(e, t, r, a) {
    r ? (e.__asyncStates = e.__asyncStates || {}, e.__asyncStates[t] = {
        state: "start",
        uuid: r
    }, a && cc.isChildClassOf(a, cc.Asset) ? loadAsset(e, t, r, a) : cc.AssetLibrary._queryAssetInfoInEditor(r, function (s, o, c) {
        if (c) {
            var i = e.__asyncStates[t];
            if (i.uuid !== r) return;
            i.state = "end", i.uuid = "", e[t] = o, cc.engine.repaintInEditMode()
        } else loadAsset(e, t, r, a)
    })) : e[t] = !a || cc.RawAsset.isRawAssetType(a) ? "" : null
}

function setByUuid(e) {
    var t = e.obj,
        r = e.name,
        a = e.value,
        s = e.actualType,
        o = e.comp,
        c = e.prop,
        i = a.uuid,
        n = JS._getClassById(s);
    if (n)
        if (cc.isChildClassOf(n, cc.RawAsset)) setAsset(t, r, i, n);
        else if (cc.isChildClassOf(n, cc.Node) || cc.isChildClassOf(n, cc.Component))
        if (i) {
            var l = cc.engine.getInstanceById(i);
            if (l) {
                if (!_Scene.PrefabUtils.validateSceneReference(l, o, c)) throw new ProhibitedException;
                t[r] = l
            }
        } else t[r] = null;
    else t[r] = a;
    else cc.warn("Unknown type to apply: " + s)
}

function fillDefaultValue(e, t, r, a) {
    var s, o, c = {
        Boolean: !1,
        String: "",
        Float: 0,
        Integer: 0
    };
    if (s = e.saveUrlAsAsset ? "" : c[e.type], void 0 === s) switch (e.type) {
        case "Enum":
            var i = e.enumList;
            for (s = i[0] && i[0].value || 0, o = r; o < a; o++) t[o] = s;
            break;
        case "Object":
            var n = e.ctor;
            if (_Scene.isAnyChildClassOf(n, cc.Asset, cc.Node, cc.Component)) {
                for (o = r; o < a; o++) t[o] = null;
                break
            }
            for (o = r; o < a; o++) try {
                t[o] = new n
            } catch (e) {
                t[o] = null
            }
    } else
        for (o = r; o < a; o++) t[o] = s
}

function _setPropertyByPath(e, t, r, a) {
    var s;
    if (e instanceof cc._BaseNode ? s = e : e instanceof cc.Component && (s = e.node), -1 === t.indexOf(".")) a && "string" == typeof r.uuid ? setByUuid({
        obj: e,
        name: t,
        value: r,
        actualType: a,
        node: s,
        comp: e,
        prop: t
    }) : e[t] = r;
    else {
        for (var o = t.split("."), c = o[0], i = e[c], n = cc.Class.attr(e, c), l = i, p = 1; p < o.length - 1; p++) {
            var u = o[p],
                y = cc.Class.attr(l, u);
            y && (n = y), l = l[u]
        }
        var f = o[o.length - 1];
        if (a && "string" == typeof r.uuid) setByUuid({
            obj: l,
            name: f,
            value: r,
            actualType: a,
            node: s,
            comp: e,
            prop: c
        });
        else {
            if ("length" === f && Array.isArray(l)) {
                var d = l.length;
                l.length = r, fillDefaultValue(n, l, d, r)
            } else l[f] = r;
            e[c] = i
        }
    }
}

function getPropertyByPath(e, t) {
    if (-1 === t.indexOf(".")) return {
        obj: e,
        propName: t,
        value: e[t]
    };
    for (var r, a, s, o = t.split("."), c = e, i = 0; i < o.length; i++) {
        if (null == c) return cc.warn('Failed to parse "%s", %s is nil', t, o[i]), null;
        c = s = (r = c)[a = o[i]]
    }
    return {
        obj: r,
        propName: a,
        value: s
    }
}

function preprocessForSetProperty(e, t, r) {
    var a = "object" == typeof t && !Array.isArray(t),
        s = t.constructor !== Object && !(t instanceof cc.ValueType),
        o = r && JS._getClassById(r),
        c = o && cc.isChildClassOf(o, cc.RawAsset);
    c && ("string" == typeof t ? (t = {
        uuid: t
    }, e = e.slice(0, -".uuid".length)) : "string" != typeof t.uuid && (c = !1));
    var i = o && cc.isChildClassOf(o, cc.Node) || cc.isChildClassOf(o, cc.Component);
    if (i && "string" == typeof t && (t = {
            uuid: t
        }, e = e.slice(0, -".uuid".length)), o) "object" != typeof t && Editor.warn('Expecting object type of value for "%s", but got "%s" type.', e, typeof t);
    else switch (r) {
        case "Enum":
            "number" != typeof t && Editor.warn('Expecting number type of value for "%s", but got "%s" type.', e, typeof t)
    }
    return {
        path: e,
        value: t,
        isPrimitiveValue: !a || c || i || s
    }
}

function getExpectedType(e, t) {
    for (var r = t.split("."), a = null, s = 0; s < r.length && null != e; s++) {
        var o = r[s],
            c = cc.Class.attr(e, o);
        if (!c) break;
        a = c, e = e[o]
    }
    return a ? "Object" === a.type && a.ctor ? cc.js.getClassName(a.ctor) : a.type : ""
}

function setDeepPropertyByPath(e, t, r, a, s) {
    if ("" === t) {
        if (e)
            for (var o in r) {
                setDeepPropertyByPath(e, o, r[o])
            }
        return
    }
    s && (a = getExpectedType(e, t));
    let c = preprocessForSetProperty(t, r, a);
    if (r = c.value, t = c.path, !c.isPrimitiveValue) {
        let a = getPropertyByPath(e, t),
            s = a && a.value;
        if (s) {
            for (let e in r) {
                setDeepPropertyByPath(s, e, r[e])
            }
            return _setPropertyByPath(e, t, s), void 0
        }
    }
    _setPropertyByPath(e, t, r, a)
}

function setNodePropertyByPath(e, t, r) {
    switch (t) {
        case "name":
            e.name = r;
            break;
        case "active":
            e.active = r;
            break;
        case "opacity":
            e.opacity = r;
            break;
        case "color":
            e.color = new cc.Color(r.r, r.g, r.b, 255), e.opacity = r.a;
            break;
        case "color.r":
            e.color = e.color.setR(r);
            break;
        case "color.g":
            e.color = e.color.setG(r);
            break;
        case "color.b":
            e.color = e.color.setB(r);
            break;
        case "color.a":
            e.opacity = r;
            break;
        case "anchor":
            e.setAnchorPoint(r);
            break;
        case "anchor.x":
            e.anchorX = r;
            break;
        case "anchor.y":
            e.anchorY = r;
            break;
        case "size":
            e.setContentSize(r);
            break;
        case "size.width":
            e.width = r;
            break;
        case "size.height":
            e.height = r;
            break;
        case "scale":
            e.setScale(r);
            break;
        case "scale.x":
            e.scaleX = r;
            break;
        case "scale.y":
            e.scaleY = r;
            break;
        case "position":
            e.setPosition(r);
            break;
        case "position.x":
            e.x = r;
            break;
        case "position.y":
            e.y = r;
            break;
        case "rotation":
            e.rotation = r;
            break;
        case "rotation.x":
            e.rotationX = r;
            break;
        case "rotation.y":
            e.rotationY = r;
            break;
        case "skew":
            e.skewX = r.x, e.skewY = r.y;
            break;
        case "skew.x":
            e.skewX = r;
            break;
        case "skew.y":
            e.skewY = r;
            break;
        case "group":
            e.group = r
    }
}
var JS = cc.js,
    getDefault = Editor.require("unpack://engine/cocos2d/core/platform/CCClass").getDefault;
Editor.setAsset = setAsset, Editor.setPropertyByPath = function (e, t) {
    cc.Node.isNode(e) ? setNodePropertyByPath(e, t.path, t.value, t.type) : setDeepPropertyByPath(e, t.path, t.value, t.type, t.isSubProp)
}, Editor.setPropertyByPath.ProhibitedException = ProhibitedException, Editor.resetPropertyByPath = function (e, t, r) {
    var a = getPropertyByPath(e, t);
    if (a) {
        if (Array.isArray(a.obj)) {
            var s = a.obj,
                o = parseInt(a.propName);
            return a = getPropertyByPath(e, t.slice(0, -a.propName.length - 1)), cc.Class._isCCClass(a.obj.constructor) ? fillDefaultValue(cc.Class.attr(a.obj, a.propName), s, o, o + 1) : cc.error("Can't reset property by path, the object should be CCClass"), void 0
        }
        e = a.obj;
        var c = a.propName;
        if (cc.Class._isCCClass(e.constructor)) {
            var i = cc.Class.attr(e, c);
            if (i && "default" in i) {
                var n = getDefault(i.default);
                "object" == typeof n && n && (n = "function" == typeof n.clone ? n.clone() : Array.isArray(n) ? [] : {}), e[c] = n
            } else cc.error("Unknown default value to reset")
        } else cc.error("Can't reset property by path, the object should be CCClass")
    }
}, Editor.setDeepPropertyByPath = setDeepPropertyByPath, Editor.fillDefaultValue = fillDefaultValue, Editor.setNodePropertyByPath = setNodePropertyByPath, Editor.preprocessForSetProperty = preprocessForSetProperty;