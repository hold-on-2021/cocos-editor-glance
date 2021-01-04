"use strict";

function visitNode(e, r) {
    if (!r(e))
        for (var t = e._children, n = t.length - 1; n >= 0; --n) visitNode(t[n], r)
}

function visitObjTypeProperties(e, r) {
    function t(e, t) {
        for (var n = (t = t || e.constructor).__props__, o = 0; o < n.length; o++) {
            var a = n[o];
            if (!1 !== cc.Class.attr(t, a).serializable) {
                var i = e[a];
                if (i && "object" == typeof i)
                    if (Array.isArray(i))
                        for (var c = 0; c < i.length; c++) cc.isValid(i) && r(i, "" + c, i[c]);
                    else cc.isValid(i) && r(e, a, i)
            }
        }
    }
    for (var n = 0; n < e._components.length; ++n) {
        t(e._components[n])
    }
}

function _revertNode(e, r, t) {
    for (var n = t ? NodeRevertableProps_Root : NodeRevertableProps, o = 0; o < n.length; o++) {
        var a = n[o];
        r[a] = e[a]
    }
    var i, c, f;
    for (i = 0; i < r._components.length; ++i) c = r._components[i], (f = e.getComponent(c.constructor)) && c.constructor === f.constructor || c.destroy();
    cc.Object._deferredDestroy();
    var s = [];
    for (i = 0; i < e._components.length; ++i) f = e._components[i], (c = r.getComponent(f.constructor)) && c.constructor === f.constructor || (c = r.addComponent(f.constructor)), s.push(c), _revertComponent(f, c);
    e._components.length = 0, e._components.push.apply(e._components, s)
}

function _revertComponent(e, r) {
    for (var t = r.constructor, n = t.__props__, o = 0; o < n.length; o++) {
        var a = n[o];
        if (!1 !== cc.Class.attr(t, a).serializable && !cc.js.array.contains(ImmutableComponentProps, a)) {
            var i = e[a];
            r[a] = i
        }
    }
}

function findByFileId(e, r) {
    if (e._prefab && e._prefab.fileId === r) return e;
    for (var t = e._children, n = 0, o = t.length; n < o; n++)
        if (e = findByFileId(t[n], r), e) return e;
    return null
}

function redirectSceneRef(e, r, t, n) {
    var o;
    if (o = t instanceof cc.Component ? t.node : t, !o._prefab) return cc.error("Node in prefab should have PrefabInfo");
    var a = findByFileId(n, o._prefab.fileId);
    a && t instanceof cc.Component && (a = a.getComponent(t.constructor)), e[r] = a
}

function redirectSceneRefs(e, r) {
    ObjectWalker.walkProperties(r, function (r, t, n, o) {
        if (n && "object" == typeof n && (cc.Node.isNode(n) || n instanceof cc.Component)) {
            if (r instanceof cc.Component) {
                if ("node" === t) return
            } else {
                if (r instanceof cc._BaseNode || r instanceof cc._PrefabInfo || r instanceof cc.Asset) return;
                for (var a = null, i = o.length - 1; i >= 0; i--) {
                    var c = o[i];
                    if (c instanceof cc.Component || cc.Node.isNode(c) || c instanceof cc.Asset || c instanceof cc._PrefabInfo) {
                        a = c;
                        break
                    }
                }
                if (!(a instanceof cc.Component)) {
                    if (a) return;
                    Editor.error("Unknown parsing object")
                }
            }
            redirectSceneRef(r, t, n, e)
        }
    }, {
        ignoreParent: !0
    })
}

function reportInvalidReference(e, r, t, n, o) {
    var a = Editor.T(e),
        i = Editor.T("MESSAGE.prefab.invalid_ref_detail", {
            component: cc.js.getClassName(t),
            property: n,
            node: _Scene.NodeUtils.getNodePath(r)
        });
    o ? Editor.Dialog.messageBox({
        type: "warning",
        buttons: [Editor.T("MESSAGE.sure")],
        message: a,
        detail: i,
        noLink: !0
    }) : Editor.error(Editor.T("MESSAGE.prefab.message_and_detail", {
        message: a,
        detail: i
    }))
}

function doValidateSceneReference(e, r, t, n, o) {
    var a = t.node,
        i = a && a._prefab && a._prefab.root,
        c = e && e._prefab && e._prefab.root;
    if (i !== c) {
        var f;
        if (i && i._prefab.sync) f = "MESSAGE.prefab.synced_disallow_ref_to_external";
        else {
            if (c && c._prefab.sync) {
                e !== c ? f = "MESSAGE.prefab.disallow_ref_to_chlid_of_synced" : r && (f = "MESSAGE.prefab.disallow_ref_to_comp_of_synced")
            }
        }
        if (f) return reportInvalidReference(f, a, t, n, o), !1
    }
    return !0
}
var PrefabHelper = CC_EDITOR && Editor.require("unpack://engine/cocos2d/core/utils/prefab-helper"),
    ObjectWalker = require("../../share/engine-extends/object-walker"),
    ImmutableNodePublicProps = ["parent"],
    ImmutableNodePublicProps_Root = ImmutableNodePublicProps.concat("name", "active", "position", "x", "y", "rotation", "rotationX", "rotationY", "zIndex"),
    ImmutableComponentProps = ["node", "_id", "_objFlags"],
    MISSING_PREFAB_SUFFIX = " (Missing Prefab)",
    NodeRevertableProps = [],
    NodeRevertableProps_Root = [];
(function () {
    for (var e = cc.Node, r = e.__props__, t = 0; t < r.length; t++) {
        var n = r[t],
            o = cc.Class.attr(e, n);
        !1 === o.serializable && !o.hasGetter && !o.hasSetter || o.readonly || "_" === n[0] || o.hasGetter !== o.hasSetter || (cc.js.array.contains(ImmutableNodePublicProps, n) || NodeRevertableProps.push(n), cc.js.array.contains(ImmutableNodePublicProps_Root, n) || NodeRevertableProps_Root.push(n))
    }
})();
var PrefabUtils = _Scene.PrefabUtils = {};
PrefabUtils.getDumpableNode = function (e, r) {
    return e = cc.instantiate(e), visitNode(e, function (t) {
        visitObjTypeProperties(t, function (t, n, o) {
            var a, i = !1;
            o instanceof cc.Component.EventHandler && (o = o.target), o instanceof cc.Component && (o = o.node), o instanceof cc._BaseNode && (o.isChildOf(e) || (i = !0, a = o.name)), i && (t[n] = null, CC_TEST || r || Editor.error('Reference "%s" of "%s" to external scene object "%s" can not be saved in prefab asset.', n, t.name || e.name, a))
        }), t._id = ""
    }), e._prefab.sync = !1, e
}, PrefabUtils.createPrefabFrom = function (e) {
    var r = new cc.Prefab;
    visitNode(e, function (t) {
        var n = t._prefab = new cc._PrefabInfo;
        n.fileId = t.uuid, n.root = e, n.asset = r
    });
    var t = PrefabUtils.getDumpableNode(e);
    return r.data = t, r
}, PrefabUtils.createAppliedPrefab = function (e) {
    var r = PrefabUtils.getDumpableNode(e._prefab.root),
        t = new cc.Prefab;
    return t.data = r, t
}, PrefabUtils.linkPrefab = function (e, r, t) {
    if (!e._uuid) return cc.error('Can not get uuid from asset "%s"', e.name), void 0;
    visitNode(t || r, function (t) {
        var n = t._prefab;
        n || ((n = t._prefab = new cc._PrefabInfo).fileId = t.uuid), n.asset = e, n.root = r
    });
    t && r !== t && (t._prefab.sync = !1), e.data && (r._prefab.fileId = e.data._prefab.fileId)
}, PrefabUtils.initClonedChildOfPrefab = function (e) {
    visitNode(e, function (e) {
        e._prefab.fileId = e.uuid
    })
}, PrefabUtils.unlinkPrefab = function (e) {
    visitNode(e, function (e) {
        e._prefab = null
    })
}, PrefabUtils._doRevertPrefab = function (e, r) {
    function t(e, r) {
        throw new Error(`Can not revert prefab, the file id of ${e} is duplicated with ${r}, please recreate the prefab again by click [${Editor.T("MAIN_MENU.node.title")} - ${Editor.T("MAIN_MENU.node.break_prefab_instance")}] and [${Editor.T("MAIN_MENU.node.title")} - ${Editor.T("MAIN_MENU.node.link_prefab")}] in the menu.`)
    }
    var n = r.data,
        o = {},
        a = {};
    if (e._prefab.fileId !== n._prefab.fileId) return Editor.error("Can not revert prefab because the scene node's uuid mismatched with the prefab's track id, your should instantiate a new node from prefab.");
    visitNode(n, function (n) {
        var i = n._prefab.fileId;
        if (!i) throw new Error('Can not revert prefab, the file id of "' + n.name + '" is missing, please save the prefab to a new asset by dragging and drop the node from Node Tree into Assets.');
        i in a && t(`"${n.name}" in prefab asset`, `"${a[i].name}"`), a[i] = n;
        var c = findByFileId(e, i);
        if (!c) {
            _revertNode(n, c = new cc.Node, !1);
            var f = c._prefab = new cc._PrefabInfo;
            f.asset = r, f.fileId = i, f.root = e
        }
        if (i in o && t(`"${c.name}" in scene`, `"${o[i].name}"`), o[i] = c, n._parent) {
            var s = n._parent._prefab.fileId,
                d = o[s];
            console.assert(d, "parent should exist since we create them from ascendent to descendant"), c.parent = d
        }
    }), visitNode(e, function (r) {
        if (r._prefab) {
            var t = r._prefab.fileId,
                n = a[t];
            if (n) {
                return _revertNode(n, r, r === e), void 0
            }
        }
        return r.destroy(), !0
    }), cc.Object._deferredDestroy(), visitNode(n, function (e) {
        var r = e._children;
        if (r)
            for (var t = 0; t < r.length; t++) {
                var n = r[t]._prefab.fileId;
                o[n].setSiblingIndex(t)
            }
    })
}, PrefabUtils.revertPrefab = function (e, r) {
    if (CC_EDITOR && cc.engine.isPlaying) return cc.warn("Disallow to revert prefab when the engine is playing.");
    if (e._prefab) {
        var t = e._prefab.asset._uuid;
        cc.AssetLibrary.loadAsset(t, function (t, n) {
            t || (redirectSceneRefs(e, n.data), _Scene.PrefabUtils._doRevertPrefab(e, n), r && r())
        })
    }
}, PrefabUtils._setPrefabSync = function (e, r) {
    e._prefab.sync = r, e._prefab._synced = r
}, PrefabUtils.setPrefabSync = function (e, r, t) {
    if (e._prefab.sync !== r && r && !CC_TEST) {
        var n, o = {
            node: _Scene.NodeUtils.getNodePath(e),
            asset: Editor.assetdb.remote.uuidToUrl(e._prefab.asset._uuid)
        };
        if (t) {
            if (n = Editor.Dialog.messageBox({
                    type: "question",
                    buttons: [Editor.T("MESSAGE.cancel"), Editor.T("MESSAGE.revert")],
                    message: Editor.T("MESSAGE.prefab.revert_missing_prefab"),
                    detail: Editor.T("MESSAGE.prefab.revert_missing_prefab_detail", o),
                    defaultId: 1,
                    cancelId: 0,
                    noLink: !0
                }), 0 === n) return !1;
            _Scene.revertPrefab(e.uuid)
        } else {
            if (n = Editor.Dialog.messageBox({
                    type: "question",
                    buttons: [Editor.T("MESSAGE.apply"), Editor.T("MESSAGE.cancel"), Editor.T("INSPECTOR.node.prefab_btn_revert")],
                    message: Editor.T("MESSAGE.prefab.apply_new_synced_prefab_message"),
                    detail: Editor.T("MESSAGE.prefab.apply_synced_prefab_detail", o),
                    defaultId: 0,
                    cancelId: 1,
                    noLink: !0
                }), 1 === n) return !1;
            0 === n ? _Scene.applyPrefab(e.uuid) : _Scene.revertPrefab(e.uuid)
        }
    }
    return this._setPrefabSync(e, r), !0
}, PrefabUtils.syncPrefab = function (e) {
    visitNode(cc.director.getScene(), function (r) {
        var t = r._prefab,
            n = !1;
        return t && (t.sync && t.asset && t.asset._uuid === e && PrefabUtils.revertPrefab(r), n = !0), n
    })
}, PrefabUtils.validateSceneReference = function (e, r, t) {
    var n, o;
    if (e instanceof cc.Component) o = e, n = e.node;
    else {
        if (!cc.Node.isNode(e)) return !0;
        n = e
    }
    return doValidateSceneReference(n, o, r, t, !0)
}, PrefabUtils.validateAllSceneReferences = function (e) {
    ObjectWalker.walkProperties(e, function (e, r, t, n) {
        var o, a;
        if (t instanceof cc.Component ? (a = t, o = t.node) : cc.Node.isNode(t) && (o = t), o) {
            if (e instanceof cc.Component) i = e;
            else {
                if (e instanceof cc.Node) return;
                for (var i = null, c = n.length - 1; c >= 0; c--) {
                    var f = n[c];
                    if (f instanceof cc.Component) {
                        i = f;
                        break
                    }
                }
                if (!i) return
            }
            doValidateSceneReference(o, a, i, i === e ? r : ObjectWalker.getNextProperty(n, e, i), !1)
        }
    })
}, PrefabUtils.confirmPrefabSynced = function (e) {
    if (e && _Scene.Undo.syncedPrefabDirty(e)) {
        if (0 === Editor.Dialog.messageBox({
                type: "question",
                buttons: [Editor.T("MESSAGE.apply"), Editor.T("INSPECTOR.node.prefab_btn_revert")],
                message: Editor.T("MESSAGE.prefab.apply_synced_prefab_message"),
                detail: Editor.T("MESSAGE.prefab.apply_synced_prefab_detail", {
                    node: _Scene.NodeUtils.getNodePath(e),
                    asset: Editor.assetdb.remote.uuidToUrl(e._prefab.asset._uuid)
                }),
                defaultId: 0,
                cancelId: 1,
                noLink: !0
            })) return _Scene.applyPrefab(e.uuid), !0;
        _Scene.revertPrefab(e.uuid)
    }
    return !1
}, PrefabUtils.confirmEditingPrefabSynced = function () {
    var e = Editor.Selection.curActivate("node"),
        r = e && cc.engine.getInstanceById(e);
    r && r._prefab && r._prefab.root._prefab.sync && PrefabUtils.confirmPrefabSynced(r._prefab.root)
};
var lastCheckingTimer = -1,
    lastCheckingNode = null;
PrefabUtils.confirmPrefabSyncedLater = function (e) {
    if (lastCheckingNode) {
        lastCheckingTimer && (clearTimeout(lastCheckingTimer), lastCheckingTimer = -1);
        var r = lastCheckingNode;
        lastCheckingNode = null;
        var t = Editor.Selection.curActivate("node"),
            n = t && cc.engine.getInstanceById(t);
        if (n) {
            if ((n._prefab && n._prefab.root) === r) return
        }
        this.confirmPrefabSynced(r)
    } else if (!e) return console.error("Root is invalid");
    e && (lastCheckingNode = e, lastCheckingTimer = setTimeout(function () {
        PrefabUtils.confirmPrefabSyncedLater()
    }, 100))
}, PrefabUtils.NodeRevertableProps_Root = NodeRevertableProps_Root, PrefabUtils.MISSING_PREFAB_SUFFIX = MISSING_PREFAB_SUFFIX;