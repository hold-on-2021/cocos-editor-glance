"use strict";

function init() {
    Sandbox._globalsProtecter.record(), builtinClassIds = cc.js._registeredClassIds, builtinClassNames = cc.js._registeredClassNames, builtinComponentMenus = cc._componentMenuItems.slice()
}

function loadScript(e, r, i) {
    function o() {
        console.timeEnd(s), r && r.restore(), t.remove()
    }
    void 0 === i && "function" == typeof r && (i = r, r = null);
    var s = "load " + e,
        t = document.createElement("script");
    t.onload = function () {
        o(), i()
    }, t.onerror = function () {
        o();
        var r = "Failed to load " + e;
        console.error(r), i(new Error(r))
    }, t.setAttribute("type", "text/javascript"), t.setAttribute("charset", "utf-8"), t.setAttribute("src", FireUrl.addRandomQuery(e)), r && r.record(), console.time(s), document.head.appendChild(t)
}

function markPrefabsAsSynced(e) {
    _Scene.walk(e, !1, e => {
        let r = e && e._prefab;
        if (r && r.sync && r.root === e) return r._synced = !0, !0
    })
}
const Path = require("fire-path"),
    FireUrl = require("fire-url"),
    SourceMaps = require("./source-maps"),
    Async = require("async"),
    Fs = require("fire-fs"),
    GlobalVariablesProtecter = require("./global-variables-protecter"),
    DISABLE_COMMONJS_PROTOCOL = "disable-commonjs://";
let builtinClassIds, builtinClassNames, builtinComponentMenus, sysRequire = require,
    initialized = !1,
    ProjectScripts = require("../project-scripts"),
    originLoadScript = ProjectScripts.loadScript;
ProjectScripts.loadScript = function (e, r) {
    var i = Sandbox._globalsVerifier_loadPluginScript,
        o = Path.relative(Editor.projectInfo.path, e);
    "." === o[0] && (o = e), i.info = "loading " + o, i.record(), originLoadScript.call(ProjectScripts, e, () => {
        i.restore(), r()
    })
};
let originLoadCommon = ProjectScripts.loadCommon;
ProjectScripts.loadCommon = function (e) {
    var r = Sandbox._globalsVerifier_loadScript;
    r.info = "loading common project scripts", r.record(), originLoadCommon.call(ProjectScripts, () => {
        r.restore(), e()
    })
};
let Sandbox = {
    reset() {
        cc.Object._deferredDestroy(), cc._componentMenuItems = builtinComponentMenus.slice(), cc.js._registeredClassIds = builtinClassIds, cc.js._registeredClassNames = builtinClassNames, this._globalsVerifier_editing.isRecorded() && this._globalsVerifier_editing.restore(), this._globalsProtecter.isRecorded() && this._globalsProtecter.restore(), cc._RF.reset(), Editor.Utils.UuidCache.clear(), cc.director.reset(), cc.loader.releaseAll()
    },
    reload(e, r) {
        this.compiled = e, this.reloading = !0;
        var i = _Scene.getEditingWorkspace();
        _Scene.reset();
        var o = {
                scene: cc.director.getScene(),
                sceneName: cc.director.getScene().name,
                undo: _Scene.Undo.dump(),
                stashedDatas: _Scene.StashInPage.liveReloadableDatas
            },
            s = Editor.serialize(o, {
                stringify: !1,
                discardInvalid: !1,
                reserveContentsForSyncablePrefab: !0
            }),
            t = Editor.require("unpack://engine/cocos2d/core/load-pipeline/uuid-loader").isSceneObj(s);
        console.assert(t, "jsons should be scene object to support missing script");
        var a = cc.deserialize.reportMissingClass;
        Async.waterfall([e => {
            Editor.Profile.load("profile://global/settings.json", (r, i) => {
                e(null, i)
            })
        }, (e, r) => {
            e.data["auto-refresh"] ? _Scene.stashScene(() => {
                Editor.Ipc.sendToMain("app:reload-on-device"), r()
            }) : r()
        }, e => {
            Sandbox.reset(), e()
        }, Sandbox.loadScripts, e => {
            this._globalsVerifier_loadScene.record(), cc.deserialize.reportMissingClass = function () {}, cc.AssetLibrary.loadJson(s, e)
        }, (e, r) => {
            cc.deserialize.reportMissingClass = a, this._globalsVerifier_loadScene.restore(), e.scene.name = e.sceneName, markPrefabsAsSynced(e.scene), this._globalsVerifier_unloadScene.record(), this._globalsVerifier_runScene.record(), cc.director.runSceneImmediate(e.scene, () => {
                this._globalsVerifier_unloadScene.restore()
            }), this._globalsVerifier_runScene.restore(), this._globalsVerifier_editing.record(), _Scene.Undo.restore(e.undo), _Scene.StashInPage.liveReloadableDatas = e.stashedDatas, _Scene.loadWorkspace(i), r(null)
        }], (e, i) => {
            cc.deserialize.reportMissingClass = a, this.reloading = !1, r(e, i)
        })
    },
    loadScripts(e) {
        initialized || (initialized = !0, init()), ProjectScripts.load(r => {
            _Scene.updateComponentMenu(), e(r)
        })
    },
    restoreElectronRequire() {
        require = sysRequire
    },
    getElectronRequire: () => sysRequire,
    compiled: !1,
    reloading: !1,
    _globalsProtecter: new GlobalVariablesProtecter,
    _globalsVerifier_loadPluginScript: new GlobalVariablesProtecter({
        ignoreNames: ["require"],
        callbacks: {
            modified: Editor.log,
            deleted: Editor.warn
        },
        dontRestore: {
            introduced: !0
        }
    }),
    _globalsVerifier_loadScript: new GlobalVariablesProtecter({
        ignoreNames: ["require"],
        callbacks: {
            modified: Editor.warn,
            deleted: Editor.warn
        },
        dontRestore: {
            introduced: !0
        }
    }),
    _globalsVerifier_editing: new GlobalVariablesProtecter({
        info: "editing",
        callbacks: Editor.log
    }),
    _globalsVerifier_loadScene: new GlobalVariablesProtecter({
        info: "deserializing scene by using new scripts",
        callbacks: Editor.warn
    }),
    _globalsVerifier_unloadScene: new GlobalVariablesProtecter({
        info: "unloading the last scene",
        callbacks: Editor.warn
    }),
    _globalsVerifier_runScene: new GlobalVariablesProtecter({
        info: "launching scene by using new scripts",
        callbacks: Editor.warn
    })
};
_Scene.Sandbox = Sandbox;