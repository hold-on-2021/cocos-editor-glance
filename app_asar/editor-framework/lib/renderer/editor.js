"use strict";

function _import(e) {
    let r = Path.extname(e);
    return ".js" === r ? UI.importScript(e) : ".css" === r ? UI.importStylesheet(e) : ".tmpl" === r ? UI.importTemplate(e) : UI.importResource(e)
}
let EditorR = {};
module.exports = EditorR;
const Electron = require("electron"),
    Path = require("fire-path"),
    Protocol = require("./protocol"),
    UI = require("./ui");
EditorR.require = function (e) {
    return require(EditorR.url(e))
}, EditorR.url = Protocol.url, EditorR.import = function (e) {
    if (Array.isArray(e)) {
        let r = [];
        for (let t = 0; t < e.length; ++t) {
            let o = e[t];
            r.push(_import(o))
        }
        return Promise.all(r)
    }
    return _import(e)
};
const ipcRenderer = Electron.ipcRenderer;
ipcRenderer.on("editor:query-ipc-events", e => {
    let r = [];
    for (let e in ipcRenderer._events) {
        let t = ipcRenderer._events[e],
            o = Array.isArray(t) ? t.length : 1;
        r.push({
            name: e,
            level: "page",
            count: o
        })
    }
    e.reply(null, r)
});