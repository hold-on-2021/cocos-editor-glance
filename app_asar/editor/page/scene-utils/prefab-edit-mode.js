function adjustToCenter() {
    var e = cc.engine.getInstanceById(prefabNodeUuid);
    if (e) {
        var t = cc.director.getScene();
        t.position = cc.Vec2.ZERO, t.scale = 1;
        var r = e.getBoundingBoxToWorld();
        _Scene.view.adjustToCenter(50, r)
    }
}

function exitScene() {
    var e = new cc.SceneAsset;
    e.scene = cc.director.getScene(), stashedSceneForPreview = Editor.serialize(e, {
        stringify: !0
    }), sceneStash = _Scene.StashInPage.dump(), _Scene.Undo.clear()
}

function enterScene() {
    _Scene.StashInPage.restore(sceneStash), stashedSceneForPreview = "", changedPrefabAssetInfosDuringEditing.length > 0 && setTimeout(function () {
        for (var e = 0; e < changedPrefabAssetInfosDuringEditing.length; e++) _Scene.syncPrefab(changedPrefabAssetInfosDuringEditing[e]);
        changedPrefabAssetInfosDuringEditing.length = 0
    }, 400)
}
var Url = require("fire-url"),
    prefabAssetUuid = "",
    prefabNodeUuid = "",
    sceneStash = null,
    stashedSceneForPreview = "",
    changedPrefabAssetInfosDuringEditing = [],
    PrefabEditor = {
        name: "prefab",
        title: "",
        open(e, t) {
            cc.AssetLibrary.loadAsset(e, (r, n) => {
                if (r) return cc.error(r);
                exitScene();
                var i, a = new cc.Scene;
                try {
                    i = cc.instantiate(n);
                    Editor.globalProfile.data["auto-sync-prefab"] && _Scene.PrefabUtils._setPrefabSync(i, !0)
                } catch (e) {
                    return enterScene(), t(e)
                }
                prefabNodeUuid = i.uuid, i.parent = a, cc.director.runSceneImmediate(a), Editor.Selection.select("node", prefabNodeUuid, !0, !0), adjustToCenter(), prefabAssetUuid = e, Editor.assetdb.queryUrlByUuid(e, (e, r) => {
                    _Scene.updateTitle(r), this.title = r, t()
                })
            })
        },
        confirmClose: function () {
            let e = 2;
            if (prefabNodeUuid && prefabAssetUuid && this.dirty()) {
                var t = cc.engine.getInstanceById(prefabNodeUuid),
                    r = t && t.name;
                if (!r) {
                    var n = Editor.assetdb.remote.uuidToUrl(prefabAssetUuid);
                    r = Url.basename(n)
                }
                e = Editor.Dialog.messageBox({
                    type: "warning",
                    buttons: [Editor.T("MESSAGE.save"), Editor.T("MESSAGE.cancel"), Editor.T("MESSAGE.dont_save")],
                    title: Editor.T("MESSAGE.prefab_editor.save_confirm_title"),
                    message: Editor.T("MESSAGE.prefab_editor.save_confirm_message", {
                        name: r
                    }),
                    detail: Editor.T("MESSAGE.prefab_editor.save_confirm_detail"),
                    defaultId: 0,
                    cancelId: 1,
                    noLink: !0
                })
            }
            return e
        },
        close: function (e, t) {
            switch (e) {
                case 0:
                    this.save(() => {
                        this.closeWithoutSave(), t()
                    });
                    break;
                case 1:
                    t();
                    break;
                case 2:
                    this.closeWithoutSave(), t()
            }
        },
        beforePushOther(e, t) {
            e === this && _Scene.EditMode.popAll()
        },
        checkRootNodes() {
            for (var e = cc.director.getScene(), t = cc.engine.getInstanceById(prefabNodeUuid), r = 0; r < e.children.length; r++) {
                if (e.children[r] !== t) {
                    var n = _Scene.NodeUtils.getNodePath(t);
                    Editor.info(Editor.T("MESSAGE.prefab_editor.only_save_prefab", {
                        node: n
                    }));
                    break
                }
            }
        },
        closeWithoutSave() {
            if (!prefabAssetUuid) return Editor.error("no editing prefab");
            prefabAssetUuid = "", prefabNodeUuid = "", enterScene()
        },
        save(e) {
            this.checkRootNodes(), _Scene.Undo.save(), _Scene.applyPrefab(prefabNodeUuid), e && setTimeout(e, 200)
        },
        getPreviewScene: () => stashedSceneForPreview,
        prefabAssetChanged(e) {
            changedPrefabAssetInfosDuringEditing.push(e)
        },
        dirty: () => _Scene.Undo.dirty()
    };
_Scene.EditMode.register(PrefabEditor), module.exports = PrefabEditor;