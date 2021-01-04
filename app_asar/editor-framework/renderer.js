"use strict";
(() => {
    try {
        require("./lib/share/polyfills");
        const e = require("electron"),
            t = require("fire-path");
        let r;
        window.onerror = function (e, t, o, a, n) {
            return r && r.Ipc.sendToMain ? r.Ipc.sendToMain("editor:renderer-console-error", n.stack || n) : console.error(n.stack || n), !1
        }, window.addEventListener("dragstart", e => {
            e.preventDefault(), e.stopPropagation()
        }), window.addEventListener("drop", e => {
            e.preventDefault(), e.stopPropagation()
        }), window.addEventListener("dragover", e => {
            e.dataTransfer.dropEffect = "none", e.preventDefault(), e.stopPropagation()
        }), window.addEventListener("contextmenu", e => {
            e.preventDefault(), e.stopPropagation()
        }), window.addEventListener("copy", e => {
            if (e.target !== document.body) return;
            let t = r.UI.focusedPanelFrame;
            t && (e.preventDefault(), e.stopPropagation(), r.UI.fire(t, "panel-copy", {
                bubbles: !1,
                detail: {
                    clipboardData: e.clipboardData
                }
            }))
        }), window.addEventListener("cut", e => {
            if (e.target !== document.body) return;
            let t = r.UI.focusedPanelFrame;
            t && (e.preventDefault(), e.stopPropagation(), r.UI.fire(t, "panel-cut", {
                bubbles: !1,
                detail: {
                    clipboardData: e.clipboardData
                }
            }))
        }), window.addEventListener("paste", e => {
            if (e.target !== document.body) return;
            let t = r.UI.focusedPanelFrame;
            t && (e.preventDefault(), e.stopPropagation(), r.UI.fire(t, "panel-paste", {
                bubbles: !1,
                detail: {
                    clipboardData: e.clipboardData
                }
            }))
        }), window.addEventListener("beforeunload", e => {
            let t = !1;
            r.Panel.panels.forEach(e => {
                let r = !0;
                e.close && (r = e.close()), !1 === r && (t = !0)
            }), t && (e.returnValue = !0)
        }), e.webFrame.setZoomLevelLimits(1, 1);
        let o = e.remote.getGlobal("Editor"),
            a = o.url("app://"),
            n = o.url("editor-framework://");
        if (require("module").globalPaths.push(t.join(a, "node_modules")), r = require(`${n}/lib/renderer`), r.remote = o, window.location.hash) {
            let e = window.location.hash.slice(1);
            r.argv = Object.freeze(JSON.parse(decodeURIComponent(e)))
        } else r.argv = {};
        r.dev = o.dev, r.lang = o.lang, r.appPath = a, r.frameworkPath = n, r.Ipc.debug = o.dev, r.Protocol.init(r)
    } catch (e) {
        window.onload = function () {
            let t = require("electron").remote.getCurrentWindow();
            t.setSize(800, 600), t.center(), t.show(), t.openDevTools(), console.error(e.stack || e)
        }
    }
})();