"use strict";
const Electron = require("electron"),
    Ipc = Electron.ipcRenderer;
Editor.projectInfo = Editor.remote.projectInfo, Editor.libraryPath = Editor.remote.libraryPath, Editor.importPath = Editor.remote.importPath, Editor.requireLogin = Editor.remote.requireLogin, Editor.isOffline = Editor.remote.isOffline, Editor.globalProfile = Editor.remote.App._profile, Editor.gizmos = Editor.remote.gizmos, Editor.sceneScripts = Editor.remote.sceneScripts, Editor.assets || (Editor.assets = {}), Editor.metas || (Editor.metas = {}), Editor.inspectors || (Editor.inspectors = {}), Editor.properties || (Editor.properties = {}), Editor.assettype2name || (Editor.assettype2name = {}), Editor.Utils = require("../share/editor-utils"), Editor.Scene = require("../share/editor-scene"), require("../../share/protocol/protocol-core"), require("./ui"), Editor.Profile.load("profile://global/settings.json", (e, r) => {
    Editor.UI.Settings.stepFloat = r.data.step
}), Ipc.on("app:global-step-changed", (e, r) => {
    Editor.UI.Settings.stepFloat = r
}), window.addEventListener("keydown", e => {
    "win32" === process.platform && window._Scene && e.ctrlKey && 90 === e.keyCode && (e.preventDefault(), e.shiftKey ? Editor.Ipc.sendToPanel("scene", "scene:redo") : Editor.Ipc.sendToPanel("scene", "scene:undo"))
}, !0);