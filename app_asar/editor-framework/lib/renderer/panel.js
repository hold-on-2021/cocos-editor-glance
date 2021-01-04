"use strict";

function _unloadPanelFrame(e) {
    let n = _id2panelFrame[e];
    n && (n._ipcListener && n._ipcListener.clear(), n._mousetrapList && n._mousetrapList.forEach(e => {
        e.reset()
    }), delete _id2panelFrame[e])
}
let Panel = {};
module.exports = Panel;
const Electron = require("electron"),
    Path = require("fire-path"),
    UI = require("./ui"),
    Console = require("./console"),
    Ipc = require("./ipc"),
    IpcBase = require("../share/ipc");
let _id2panelFrame = {},
    _outOfDatePanels = [],
    ErrorNoPanel = IpcBase.ErrorNoPanel,
    ErrorNoMsg = IpcBase.ErrorNoMsg;
Panel.open = function (e, n) {
    Ipc.sendToMain("editor:panel-open", e, n)
}, Panel.popup = function (e) {
    Ipc.sendToMain("editor:panel-popup", e)
}, Panel.close = function (e, n) {
    n ? Ipc.sendToMain("editor:panel-close", e, n, -1) : Ipc.sendToMain("editor:panel-close", e)
}, Panel.dock = function (e) {
    let n = e.id;
    Ipc.sendToMain("editor:panel-dock", n), _id2panelFrame[n] = e
}, Panel.newFrame = function (e, n) {
    Ipc.sendToMain("editor:panel-query-info", e, (r, l) => {
        if (r) return n(r), void 0;
        if ("polymer" === l.ui) return UI.PolymerUtils.newFrame(e, l, n), void 0;
        let o = document.createElement("ui-panel-frame");
        o._info = l, o.setAttribute("id", e), l.icon && (o.icon = new Image, o.icon.src = Path.join(l.path, l.icon)), n(null, o)
    })
}, Panel.find = function (e) {
    let n = _id2panelFrame[e];
    return n || null
}, Panel.focus = function (e) {
    let n = Panel.find(e);
    if (n) {
        let e = n.parentNode;
        UI.DockUtils.isPanel(e) && e.select(n)
    }
}, Panel.getFocusedPanel = function () {
    for (let e in _id2panelFrame) {
        let n = _id2panelFrame[e].parentNode;
        if (n.focused) return n.activeTab.frameEL
    }
    return null
}, Panel.isDirty = function (e) {
    return -1 !== _outOfDatePanels.indexOf(e)
}, Panel.extend = function (e) {
    return e
}, Object.defineProperty(Panel, "panels", {
    enumerable: !0,
    get() {
        let e = [];
        for (let n in _id2panelFrame) {
            let r = _id2panelFrame[n];
            e.push(r)
        }
        return e
    }
}), Panel._dispatch = function (e, n, r, ...l) {
    let o = _id2panelFrame[e];
    if (!o) return Console.warn(`Failed to send ipc message ${n} to panel ${e}, panel not found`), r.reply && r.reply(new ErrorNoPanel(e, n)), void 0;
    if (!o.messages) return;
    let a = o.messages[n];
    if (!a || "function" != typeof a) return Console.warn(`Failed to send ipc message ${n} to panel ${e}, message not found`), r.reply && r.reply(new ErrorNoMsg(e, n)), void 0;
    a.apply(o, [r, ...l])
}, Panel._unloadAll = function (e) {
    let n = [];
    for (let e in _id2panelFrame) {
        let r = _id2panelFrame[e];
        r && r.close && !1 === r.close() && n.push(e)
    }
    if (0 !== n.length) return e && e(new Error(`Failed to close panel ${n.join(",")}`)), void 0;
    UI.clear(UI.DockUtils.root);
    for (let e in _id2panelFrame) _unloadPanelFrame(e);
    Ipc.sendToMain("editor:window-remove-all-panels", () => {
        e && e()
    }, -1)
};
const ipcRenderer = Electron.ipcRenderer;
ipcRenderer.on("editor:panel-run", (e, n, r) => {
    Panel.focus(n);
    let l = Panel.find(n);
    l && l.run && l.run(r)
}), ipcRenderer.on("editor:panel-unload", (e, n) => {
    let r = Panel.find(n);
    if (!r) return _unloadPanelFrame(n), e.reply(new Error(`Can not find panel ${n} in renderer process.`)), void 0;
    if (r.close && !1 === r.close()) return e.reply(null, !1), void 0;
    let l = r.parentNode;
    if (UI.DockUtils.isPanel(l)) {
        let e = l.$tabs.findTab(r);
        l.close(e)
    } else l.removeChild(r);
    UI.DockUtils.finalize(), UI.DockUtils.saveLayout(), _unloadPanelFrame(n), window.requestAnimationFrame(() => {
        e.reply(null, !0)
    })
}), ipcRenderer.on("editor:panel-out-of-date", (e, n) => {
    let r = Panel.find(n);
    if (r) {
        let e = r.parentNode;
        UI.DockUtils.isPanel(e) && e.outOfDate(r)
    } - 1 === _outOfDatePanels.indexOf(n) && _outOfDatePanels.push(n)
});