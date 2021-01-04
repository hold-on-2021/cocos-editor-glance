function AssetsWatcher(t) {
    this.owner = t, this.watchingInfos = {}
}

function getPropertyDescriptorAndOwner(t, e) {
    for (; t;) {
        var s = Object.getOwnPropertyDescriptor(t, e);
        if (s) return {
            owner: t,
            pd: s
        };
        t = Object.getPrototypeOf(t)
    }
    return null
}

function forceSetterNotify(t, e) {
    var s = getPropertyDescriptorAndOwner(t, e);
    if (!s) return console.warn("Failed to get property descriptor of %s.%s", t, e), void 0;
    var r = s.pd;
    if (!1 === r.configurable) return console.warn("Failed to register notifier for %s.%s", t, e), void 0;
    if ("value" in r) return console.warn("Cannot watch instance variable of %s.%s", t, e), void 0;
    var n = r.set;
    r.set = function (t, s) {
        if (n.call(this, t, s), this._watcherHandle && this._watcherHandle !== EmptyWatcher) {
            var r = "";
            t instanceof cc.Asset ? r = t._uuid : "string" == typeof t && (r = Editor.Utils.UuidCache.urlToUuid(t)), this._watcherHandle.changeWatchAsset(e, r)
        }
    }, Object.defineProperty(s.owner, e, r)
}

function parseComponentProps(t) {
    for (var e = null, s = t.constructor, r = cc.Class.Attr.getClassAttrs(s), n = 0, a = s.__props__; n < a.length; n++) {
        var c = a[n],
            i = c + DELIMETER;
        if (r[i + "hasSetter"] && r[i + "hasGetter"]) {
            var o = t[c];
            (o instanceof cc.Asset || cc.isChildClassOf(r[i + "ctor"], cc.RawAsset) || null == o) && (forceSetterNotify(t, c), e ? e.push(c) : e = [c])
        }
    }
    return e
}

function invokeAssetSetter(t, e, s) {
    var r = cc.js.getPropertyDescriptor(t, e);
    if (r && r.set) {
        r.set.call(t, s, !0)
    }
}
var ASSET_PROPS = "A$$ETprops",
    DELIMETER = cc.Class.Attr.DELIMETER,
    ASSET_PROPS_KEY = ASSET_PROPS + DELIMETER + ASSET_PROPS,
    EmptyWatcher = {};
AssetsWatcher.initComponent = function (t) {
    t._watcherHandle = null
}, AssetsWatcher.initHandle = function (t) {
    var e = cc.Class.Attr.getClassAttrs(t.constructor)[ASSET_PROPS_KEY];
    void 0 === e && (e = parseComponentProps(t), cc.Class.Attr.setClassAttr(t.constructor, ASSET_PROPS, ASSET_PROPS, e)), t._watcherHandle = e ? new AssetsWatcher(t) : EmptyWatcher
}, AssetsWatcher.start = function (t) {
    t._watcherHandle || AssetsWatcher.initHandle(t), t._watcherHandle !== EmptyWatcher && t._watcherHandle.start()
}, AssetsWatcher.stop = function (t) {
    t._watcherHandle && t._watcherHandle !== EmptyWatcher && t._watcherHandle.stop()
}, AssetsWatcher.prototype.start = function () {
    for (var t = this.owner, e = cc.Class.Attr.getClassAttrs(t.constructor)[ASSET_PROPS_KEY], s = 0; s < e.length; s++) {
        var r, n = e[s],
            a = t[n];
        if (a instanceof cc.Asset && a._uuid ? r = a._uuid : "string" == typeof a && a && (r = Editor.Utils.UuidCache.urlToUuid(a), a), r) {
            var c = invokeAssetSetter.bind(null, t, n);
            cc.AssetLibrary.assetListener.add(r, c), this.watchingInfos[n] = {
                uuid: r,
                callback: c
            }
        }
    }
}, AssetsWatcher.prototype.stop = function () {
    for (var t in this.watchingInfos) {
        var e = this.watchingInfos[t];
        e && cc.AssetLibrary.assetListener.remove(e.uuid, e.callback)
    }
    this.watchingInfos = {}
}, AssetsWatcher.prototype.changeWatchAsset = function (t, e) {
    var s = this.watchingInfos[t];
    if (s) {
        if (s.uuid === e) return;
        this.watchingInfos[t] = null, cc.AssetLibrary.assetListener.remove(s.uuid, s.callback)
    }
    if (e) {
        var r = this.owner,
            n = invokeAssetSetter.bind(null, r, t);
        cc.AssetLibrary.assetListener.add(e, n), this.watchingInfos[t] = {
            uuid: e,
            callback: n
        }
    }
}, _Scene.AssetsWatcher = module.exports = AssetsWatcher;