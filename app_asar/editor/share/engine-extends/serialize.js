function _Serializer(e, i) {
    i = i || {}, this._exporting = i.exporting, this._discardInvalid = !("discardInvalid" in i) || i.discardInvalid, this._dontStripDefault = !this._exporting || !("dontStripDefault" in i) || i.dontStripDefault, this._missingClassReporter = i.missingClassReporter, this._missingObjectReporter = i.missingObjectReporter, this._assetExists = this._missingObjectReporter && {}, this.serializedList = [], this._parsingObjs = [], this._parsingData = [], this._objsToResetId = [], this._discardContentsForSyncablePrefab = !(i.reserveContentsForSyncablePrefab || e instanceof cc.Prefab), _serializeMainObj(this, e);
    for (var r = 0; r < this._objsToResetId.length; ++r) this._objsToResetId[r].__id__ = void 0;
    this._parsingObjs = null, this._parsingData = null, this._objsToResetId = null
}

function _checkCircularReference(e, i) {
    var r = e._parsingObjs.indexOf(i);
    if (-1 !== r) {
        var s = e.serializedList.length;
        i.__id__ = s, e._objsToResetId.push(i);
        var t = e._parsingData[r];
        if (!1 === Array.isArray(i)) {
            var a = cc.js._getClassId(i, !1);
            a && (t.__type__ = a)
        }
        return e.serializedList.push(t), t
    }
}

function checkMissingAsset(e, i, r) {
    if (e._missingObjectReporter) {
        var s = e._assetExists[r];
        void 0 === s && (s = e._assetExists[r] = !!Editor.assetdb.remote.uuidToFspath(r)), s || e._missingObjectReporter(i)
    }
}

function enumerateByFireClass(e, i, r, s, t) {
    function a(i) {
        if (i) {
            var r;
            if ("string" == typeof i) r = Editor.Utils.UuidCache.urlToUuid(i);
            else if (i instanceof CCAsset && (r = i._uuid, !r)) return cc.error('The url must be "string" type'), void 0;
            return r ? (checkMissingAsset(e, i, r), e._exporting && (r = compressUuid(r, !0)), {
                __uuid__: r
            }) : void 0
        }
    }
    for (var _ = Attr.getClassAttrs(s), n = t || s.__props__, o = 0; o < n.length; o++) {
        var l = n[o];
        if (!1 !== _[l + SERIALIZABLE]) {
            var c = i[l];
            if (e._exporting) {
                if (_[l + EDITOR_ONLY]) {
                    var u = CCNode && CCNode.isNode(i);
                    if (!(u && "_id" === l && i._parent instanceof cc.Scene)) {
                        if (!(u && t && "_prefab" === l)) continue
                    }
                }
                if (!e._dontStripDefault && equalsToDefault(_[l + DEFAULT], c)) continue
            }
            _[l + SAVE_URL_AS_ASSET] ? Array.isArray(c) ? r[l] = c.map(a) : r[l] = a(c) : r[l] = _serializeField(e, c);
            var d = _[l + FORMERLY_SERIALIZED_AS];
            d && (r[d] = r[l])
        }
    }
}

function serializeNode(e, i, r, s) {
    if (canDiscardByPrefabRoot(e, i)) {
        i._prefab.root === i && enumerateByFireClass(e, i, r, s, PRESERVE_PROPS_FOR_SYNCABLE_PREFAB_ROOT)
    } else enumerateByFireClass(e, i, r, s)
}

function _enumerateObject(e, i, r) {
    if (Array.isArray(i))
        for (var s = 0; s < i.length; ++s) {
            var t = _serializeField(e, i[s]);
            void 0 !== t && r.push(t)
        } else {
            var a = i.constructor;
            if (CCNode && CCNode.isNode(i)) return serializeNode(e, i, r, a), void 0;
            var _ = a && a.__props__;
            if (_) _.length > 0 && ("_$erialized" !== _[_.length - 1] ? enumerateByFireClass(e, i, r, a) : i._$erialized && (r.__type__ = i._$erialized.__type__, _enumerateObject(e, i._$erialized, r), e._missingClassReporter && e._missingClassReporter(i, r.__type__)));
            else
                for (var n in i) !i.hasOwnProperty(n) || 95 === n.charCodeAt(0) && 95 === n.charCodeAt(1) || (r[n] = _serializeField(e, i[n]))
        }
}

function canDiscardByPrefabRoot(e, i) {
    var r = i._prefab;
    return e._discardContentsForSyncablePrefab && r && r.root && r.root._prefab.sync
}

function _serializeField(e, i) {
    var r = typeof i;
    if ("object" === r) {
        if (!i) return null;
        var s = i.__id__;
        if (void 0 !== s) return {
            __id__: s
        };
        if (i instanceof CCObject) {
            if (i instanceof CCAsset) {
                var t = i._uuid;
                if (t) return checkMissingAsset(e, i, t), e._exporting && (t = compressUuid(t, !0)), {
                    __uuid__: t
                }
            }
            var a = i._objFlags;
            if (a & DontSave) return;
            if (e._exporting && a & EditorOnly) return;
            if (e._discardInvalid) {
                if (!i.isValid) return e._missingObjectReporter && e._missingObjectReporter(i), null
            } else if (!i.isRealValid) return null;
            if (CCNode && CCNode.isNode(i)) {
                if (canDiscardByPrefabRoot(e, i) && i !== i._prefab.root) return null
            }
        }
        return _serializeObj(e, i)
    }
    return "function" !== r ? i : null
}

function _serializePrimitiveObj(e, i) {
    var r;
    if (Array.isArray(i)) r = [];
    else {
        r = {};
        var s = cc.js._getClassId(i, !1);
        s && (r.__type__ = s)
    }
    var t = e.serializedList.length;
    if (e._parsingObjs.push(i), e._parsingData.push(r), _enumerateObject(e, i, r), e._parsingObjs.pop(), e._parsingData.pop(), e.serializedList.length > t) {
        var a = e.serializedList.indexOf(r, t);
        if (-1 !== a) return {
            __id__: a
        }
    }
    return r
}

function _serializeObj(e, i) {
    var r, s = i instanceof CCObject,
        t = i.constructor,
        a = cc.js._getClassId(i, !1);
    if (s || cc.Class._isCCClass(t)) {
        r = e.serializedList.length, i.__id__ = r, e._objsToResetId.push(i);
        var _ = {};
        return e.serializedList.push(_), a && (_.__type__ = a), i._serialize ? _.content = i._serialize(e._exporting) : (_enumerateObject(e, i, _), s && i._objFlags > 0 && (_._objFlags &= PersistentMask)), {
            __id__: r
        }
    }
    if (t === Object || Array.isArray(i) || a) {
        if (i._serialize) return a ? {
            content: i._serialize(e._exporting),
            __type__: a
        } : {
            content: i._serialize(e._exporting)
        };
        return _checkCircularReference(e, i) ? (r = i.__id__, {
            __id__: r
        }) : _serializePrimitiveObj(e, i)
    }
    return null
}

function _serializeMainObj(e, i) {
    if (i instanceof CCObject || cc.Class._isCCClass(i.constructor)) _serializeObj(e, i);
    else if ("object" == typeof i && i) {
        var r;
        if (Array.isArray(i)) r = [];
        else {
            r = {};
            var s = cc.js._getClassId(i, !1);
            if (s && (r.__type__ = s), i._serialize) return r.content = i._serialize(e._exporting), e.serializedList.push(r), void 0
        }
        i.__id__ = 0, e._objsToResetId.push(i), e.serializedList.push(r), _enumerateObject(e, i, r)
    } else e.serializedList.push(i || null)
}

function serialize(e, i) {
    var r = !("stringify" in (i = i || {})) || i.stringify,
        s = i.minify,
        t = s || i.nicify,
        a = new _Serializer(e, i).serializedList;
    t && nicifySerialized(a);
    var _;
    return _ = 1 !== a.length || Array.isArray(a[0]) ? a : a[0], !1 === r ? _ : JSON.stringify(_, null, s ? 0 : 2)
}
var compressUuid = require("../editor-utils/uuid-utils").compressUuid,
    CCObject = cc.Object,
    CCAsset = cc.Asset,
    CCNode = cc.Node,
    Def = CCObject.Flags,
    PersistentMask = Def.PersistentMask,
    DontSave = Def.DontSave,
    EditorOnly = Def.EditorOnly,
    equalsToDefault = CC_TEST ? cc._Test.IntantiateJit.equalsToDefault : Editor.require("unpack://engine/cocos2d/core/platform/instantiate-jit").equalsToDefault,
    nicifySerialized = require("./serialize-nicify"),
    PRESERVE_PROPS_FOR_SYNCABLE_PREFAB = ["_objFlags", "_parent", "_id", "_prefab"],
    PRESERVE_PROPS_FOR_SYNCABLE_PREFAB_ROOT = PRESERVE_PROPS_FOR_SYNCABLE_PREFAB.concat("_name", "_active", "_position", "_rotationX", "_rotationY", "_localZOrder", "_globalZOrder"),
    Attr = cc.Class.Attr,
    EDITOR_ONLY = Attr.DELIMETER + "editorOnly",
    SERIALIZABLE = Attr.DELIMETER + "serializable",
    DEFAULT = Attr.DELIMETER + "default",
    SAVE_URL_AS_ASSET = Attr.DELIMETER + "saveUrlAsAsset",
    FORMERLY_SERIALIZED_AS = Attr.DELIMETER + "formerlySerializedAs";
serialize.asAsset = function (e) {
    e || cc.error("[Editor.serialize.asAsset] The uuid must be non-nil!");
    var i = new CCAsset;
    return i._uuid = e, i
}, serialize.setName = function (e, i) {
    Array.isArray(e) ? e[0]._name = i : e._name = i
}, serialize.findRootObject = function (e, i) {
    if (Array.isArray(e))
        for (var r = 0; r < e.length; r++) {
            var s = e[r];
            if (s.__type__ === i) return s
        }
    return null
}, Editor.serialize = module.exports = serialize;