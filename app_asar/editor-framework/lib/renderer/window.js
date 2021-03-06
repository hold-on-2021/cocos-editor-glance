"use strict";

function _webviewEL(e) {
    return e ? "WEBVIEW" === e.tagName ? e : e.parentNode && e.parentNode.host && "WEBVIEW" === e.parentNode.host.tagName ? e.parentNode.host : null : null
}

function _elementFromPoint(e, n) {
    let t = document.elementFromPoint(e, n);
    for (; t && t.shadowRoot;) {
        let o = t.shadowRoot.elementFromPoint(e, n);
        if (!o) return t;
        t = o
    }
    return t
}

function _mousemove(e) {
    e.preventDefault(), e.stopPropagation(), _maskEL.remove();
    let n = _elementFromPoint(e.clientX, e.clientY),
        t = n.getBoundingClientRect();
    _webviewEL(n) ? (_maskEL.style.backgroundColor = "rgba( 128, 0, 0, 0.4)", _maskEL.style.outline = "1px solid #f00") : (_maskEL.style.backgroundColor = "rgba( 0, 128, 255, 0.5)", _maskEL.style.outline = "1px solid #09f"), document.body.appendChild(_maskEL), _maskEL.style.top = `${t.top+1}px`, _maskEL.style.left = `${t.left+1}px`, _maskEL.style.width = `${t.width-2}px`, _maskEL.style.height = `${t.height-2}px`, _maskEL.children[0].innerText = `<${n.tagName.toLowerCase()} class="${n.className}" />`
}

function _mousedown(e) {
    e.preventDefault(), e.stopPropagation(), _inspectOFF();
    let n = _webviewEL(document.elementFromPoint(e.clientX, e.clientY));
    if (n) return n.openDevTools(), n.devToolsWebContents && n.devToolsWebContents.focus(), void 0;
    Electron.ipcRenderer.send("editor:window-inspect-at", e.clientX, e.clientY)
}

function _keydown(e) {
    e.preventDefault(), e.stopPropagation(), 27 === e.which && _inspectOFF()
}

function _inspectOFF() {
    _inspecting = !1, _maskEL.remove(), _maskEL = null, window.removeEventListener("mousemove", _mousemove, !0), window.removeEventListener("mousedown", _mousedown, !0), window.removeEventListener("keydown", _keydown, !0)
}

function _inspectON() {
    if (!_inspecting) {
        if (_inspecting = !0, !_maskEL) {
            (_maskEL = document.createElement("div")).style.position = "fixed", _maskEL.style.zIndex = "999", _maskEL.style.top = "0", _maskEL.style.right = "0", _maskEL.style.bottom = "0", _maskEL.style.left = "0", _maskEL.style.backgroundColor = "rgba( 0, 128, 255, 0.5)", _maskEL.style.outline = "1px solid #09f", _maskEL.style.cursor = "default";
            let e = document.createElement("div");
            e.style.display = "inline-block", e.style.position = "relative", e.style.top = "-18px", e.style.left = "0px", e.style.padding = "0px 5px", e.style.fontSize = "12px", e.style.fontWeight = "bold", e.style.whiteSpace = "nowrap", e.style.color = "#333", e.style.backgroundColor = "#f90", e.innerText = "", _maskEL.appendChild(e), document.body.appendChild(_maskEL)
        }
        window.addEventListener("mousemove", _mousemove, !0), window.addEventListener("mousedown", _mousedown, !0), window.addEventListener("keydown", _keydown, !0)
    }
}
let Window = {};
module.exports = Window;
const Electron = require("electron"),
    Ipc = require("./ipc");
let _maskEL, _inspecting = !1;
Window.open = function (e, n, t) {
    Ipc.sendToMain("editor:window-open", e, n, t)
}, Window.focus = function () {
    Ipc.sendToMain("editor:window-focus")
}, Window.load = function (e, n) {
    Ipc.sendToMain("editor:window-load", e, n)
}, Window.resize = function (e, n, t) {
    Ipc.sendToMain("editor:window-resize", e, n, t)
}, Window.resizeSync = function (e, n, t) {
    t ? Electron.remote.getCurrentWindow().setContentSize(e, n) : Electron.remote.getCurrentWindow().setSize(e, n)
}, Window.center = function () {
    Ipc.sendToMain("editor:window-center")
};
const ipcRenderer = Electron.ipcRenderer;
ipcRenderer.on("editor:window-inspect", function () {
    _inspectON()
});