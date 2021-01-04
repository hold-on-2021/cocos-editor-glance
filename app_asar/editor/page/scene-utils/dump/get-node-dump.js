function getTypeId(e) {
    return "object" == typeof e && (e = e.constructor), JS._getClassId(e)
}

function dumpAttrs(e, t, n) {
    var r, a = n.ctor;
    if (a) {
        if (r = getTypeId(a), t.type = r, !e[r]) {
            var i = cc.isChildClassOf(a, cc.RawAsset),
                o = cc.isChildClassOf(a, cc.Node);
            i || o ? dumpInheritanceChain(e, a, r) : dumpType(e, a, r)
        }
    } else n.type && (t.type = n.type);
    if (n.readonly && (t.readonly = n.readonly), "default" in n) {
        if (t.default = getDefault(n.default), n.saveUrlAsAsset && "" === t.default) t.default = null;
        else if (null != t.default && !t.type && (r = {
                number: "Float",
                string: "String",
                boolean: "Boolean",
                object: "Object"
            } [typeof t.default], r))
            if ("Object" !== r || t.default.constructor === Object) t.type = r;
            else {
                var c = cc.js._getClassId(t.default.constructor);
                c && (t.type = c)
            }
    } else n.hasSetter || (t.readonly = !0);
    "boolean" == typeof n.visible && (t.visible = n.visible), n.enumList && (t.enumList = JSON.parse(JSON.stringify(n.enumList))), n.hasOwnProperty("displayName") && (t.displayName = Editor.i18n.format(n.displayName)), n.hasOwnProperty("multiline") && (t.multiline = n.multiline), n.hasOwnProperty("min") && (t.min = n.min), n.hasOwnProperty("max") && (t.max = n.max), n.hasOwnProperty("step") && (t.step = n.step), n.slide && (t.slide = n.slide), n.nullable && (t.nullable = n.nullable), n.tooltip && (t.tooltip = Editor.i18n.format(n.tooltip)), n.hasOwnProperty("animatable") && (t.animatable = n.animatable)
}

function getInheritanceChain(e) {
    return cc.Class.getInheritanceChain(e).map(e => getTypeId(e)).filter(e => e)
}

function dumpType(e, t, n) {
    var r;
    if ("object" == typeof t) {
        if (cc.Enum.isEnum(t)) {
            return cc.Enum.getList(t)
        }
        r = t.constructor
    } else r = t;
    var a = {};
    if (e[n] = a, r) {
        a.name = cc.js.getClassName(r), a.name.startsWith("cc.") && (a.name = a.name.slice(3));
        var i = getInheritanceChain(r);
        i.length > 0 && (a.extends = i);
        var o = r.__props__;
        if (o) {
            for (var c = {}, s = 0; s < o.length; s++) {
                var l = o[s],
                    u = {},
                    p = cc.Class.attr(t, l);
                p && dumpAttrs(e, u, p), c[l] = u
            }
            a.properties = c
        }
    }
    return a
}

function dumpInheritanceChain(e, t, n) {
    var r = {},
        a = getInheritanceChain(t);
    a.length > 0 && (r.extends = a), e[n] = r
}

function getExpectedTypeInClassDef(e, t, n) {
    var r = getTypeId(t);
    if (r) {
        var a = e[r];
        if (a) return a.properties[n].type
    }
    return null
}

function dumpSceneObjRef(e, t, n) {
    var r = {
            value: {
                name: t.isValid ? t.name : void 0,
                uuid: t.uuid
            }
        },
        a = getTypeId(t);
    return n !== a ? (e[a] || dumpType(e, t.constructor, a), r.type = a) : r.type = n, r
}

function dumpObjectField(e, t, n) {
    if (!t) return {
        type: "Object",
        value: null
    };
    var r, a = t.constructor;
    if (t instanceof CCObject) {
        if (t instanceof cc.Asset) {
            var i = t._uuid;
            return r = getTypeId(t), n !== r ? (e[r] || dumpType(e, a, r), {
                type: r,
                value: {
                    uuid: i
                }
            }) : {
                type: n,
                value: {
                    uuid: i
                }
            }
        }
        if (cc.Node.isNode(t) || t instanceof cc.Component) return dumpSceneObjRef(e, t, n)
    } else {
        if (t instanceof cc.ValueType) {
            var o = Editor.serialize(t, {
                stringify: !1
            });
            e[o.__type__] || dumpInheritanceChain(e, a, o.__type__);
            var c = o.__type__;
            return delete o.__type__, {
                type: c,
                value: o
            }
        }
        if (t instanceof _ccsg.Node) return {
            type: "Object",
            value: null
        }
    }
    if (cc.Class._isCCClass(a)) {
        var s = {};
        return r = getTypeId(t), n !== r ? (e[r] || dumpType(e, a, r), s.type = r) : s.type = n, dumpByClass(e, s, t, a), s
    }
    return {
        type: "Object",
        value: null
    }
}

function checkPropVisible(e, t) {
    try {
        return t.call(e)
    } catch (e) {
        Editor.error(e)
    }
    return checkPropVisible.ERRORED
}

function dumpField(e, t, n, r, a) {
    var i = getExpectedTypeInClassDef(e, n, r);
    if (a.saveUrlAsAsset) {
        var o = a.ctor;
        if ("function" == typeof o && cc.isChildClassOf(o, cc.RawAsset) && "string" == typeof t) return {
            type: i,
            value: {
                uuid: t && Editor.Utils.UuidCache.urlToUuid(t) || ""
            }
        }
    }
    if ("object" == typeof t || void 0 === t) {
        var c = dumpObjectField(e, t, i);
        if (!c.value) {
            if (!a.ctor) return {
                type: "Object",
                value: null
            };
            var s = a.ctor;
            if (_Scene.isAnyChildClassOf(s, cc.Node, cc.RawAsset, cc.Component)) return {
                type: i,
                value: {
                    uuid: ""
                }
            }
        }
        return c
    }
    if ("function" == typeof t) return null;
    var l = defaultType2CCType[typeof t];
    return "Enum" === i && "number" == typeof t && (l = "Enum"), "Integer" !== i && "Float" !== i || "Float" === l && (l = i), {
        type: l,
        value: t
    }
}

function dumpProperty(e, t, n, r, a) {
    var i, o = getExpectedTypeInClassDef(e, n, r),
        c = cc.Class.attr(n, r);
    if (i = Array.isArray(t) ? {
            type: o,
            value: _.map(t, function (t) {
                return dumpField(e, t, n, r, c)
            })
        } : null == t && Array.isArray(getDefault(c.default)) ? {
            type: "Object",
            value: null
        } : dumpField(e, t, n, r, c), "function" == typeof c.visible) {
        var s = checkPropVisible(a, c.visible);
        s !== checkPropVisible.ERRORED && (i.visible = !!s)
    }
    return i
}

function dumpByClass(e, t, n, r) {
    var a = r.__props__;
    if (a) {
        for (var i = {}, o = 0; o < a.length; o++) {
            var c = a[o],
                s = n[c];
            i[c] = dumpProperty(e, s, r, c, n)
        }
        t.value = i
    }
}

function dumpNode(e, t) {
    var n, r, a = ["name", "opacity", "active", "rotation", "group"],
        i = a.concat(["position", "color"]),
        o = {},
        c = getTypeId(t);
    if (c) {
        o.__type__ = c;
        var s = {
            name: "Node",
            extends: getInheritanceChain(cc.Node)
        };
        e[c] = s;
        var l = {};
        for (n = 0; n < i.length; n++) {
            r = i[n];
            var u = {},
                p = cc.Class.attr(cc.Node, r);
            p && dumpAttrs(e, u, p), l[r] = u
        }
        l.rotation.readonly = _Scene.NodeUtils._hasFlagInComponents(t, Flags.IsRotationLocked), l.position.readonly = _Scene.NodeUtils._hasFlagInComponents(t, Flags.IsPositionLocked), l.anchor = {
            readonly: _Scene.NodeUtils._hasFlagInComponents(t, Flags.IsAnchorLocked)
        }, dumpType(e, cc.Vec2, "cc.Vec2"), l.size = {
            readonly: _Scene.NodeUtils._hasFlagInComponents(t, Flags.IsSizeLocked)
        }, dumpType(e, cc.Size, "cc.Size"), l.scale = {
            readonly: _Scene.NodeUtils._hasFlagInComponents(t, Flags.IsScaleLocked)
        }, l.skew = {}, dumpType(e, cc.Color, "cc.Color"), s.properties = l
    }
    for (n = 0; n < a.length; n++) o[r = a[n]] = dumpProperty(e, t[r], cc.Node, r, t);
    o.uuid = t.uuid, o.anchor = dumpObjectField(e, new cc.Vec2(t.anchorX, t.anchorY)), o.size = dumpObjectField(e, new cc.Size(t.width, t.height)), o.position = dumpObjectField(e, new cc.Vec2(t.x, t.y)), o.scale = dumpObjectField(e, new cc.Vec2(t.scaleX, t.scaleY)), o.skew = dumpObjectField(e, new cc.Vec2(t.skewX, t.skewY)), o.color = dumpObjectField(e, t.color.setA(t.opacity)), t._prefab && t._prefab.asset && (o.__prefab__ = {
        uuid: t._prefab.asset._uuid,
        rootName: t._prefab.root && t._prefab.root.name,
        rootUuid: t._prefab.root && t._prefab.root.uuid,
        sync: t._prefab.root && t._prefab.root._prefab.sync
    });
    var d = t._components;
    if (d) {
        o.__comps__ = [];
        for (var f = 0; f < d.length; f++) {
            var y = d[f],
                m = y.constructor;
            if (c = getTypeId(m), c) {
                var _ = dumpType(e, y, c),
                    v = "function" == typeof y.start || "function" == typeof y.update || "function" == typeof y.lateUpdate || "function" == typeof y.onEnable || "function" == typeof y.onDisable;
                _.editor = {
                    inspector: m.hasOwnProperty("_inspector") && m._inspector,
                    icon: m.hasOwnProperty("_icon") && m._icon,
                    help: m._help,
                    _showTick: v
                };
                var h = {
                    type: c
                };
                dumpByClass(e, h, y, m), o.__comps__.push(h);
                _.properties.__scriptAsset.visible = !!y.__scriptUuid, h.value.__scriptAsset.value = {
                    uuid: y.__scriptUuid
                }
            }
        }
    }
    return o
}
var _ = require("lodash"),
    JS = cc.js,
    CCObject = cc.Object,
    Flags = cc.Object.Flags,
    getDefault = Editor.require("unpack://engine/cocos2d/core/platform/CCClass").getDefault;
let defaultType2CCType = {
    number: "Float",
    string: "String",
    boolean: "Boolean",
    object: "Object"
};
checkPropVisible.ERRORED = {}, Editor.getNodeDump = function (e) {
    if (!e) return {
        types: {},
        value: null
    };
    var t = {};
    return {
        types: t,
        value: dumpNode(t, e)
    }
}, module.exports = Editor.getNodeDump, Editor.getNodeDump.getInheritanceChain = getInheritanceChain;