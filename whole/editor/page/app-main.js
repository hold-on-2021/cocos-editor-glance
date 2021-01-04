(() => {
    "use strict";
    Polymer({
        is: "app-main",
        properties: {},
        listeners: {},
        ready() {
            const t = require("electron").ipcRenderer;
            t.on("asset-db:state-changed", (t, e) => {
                this.$.status.set("dbState", e)
            }), t.on("asset-db:watch-state-changed", (t, e) => {
                this.$.status.set("dbWatchState", e)
            }), t.on("compiler:state-changed", (t, e) => {
                this.$.status.set("compilerState", e), "compiling" === e || "failed" === e ? this.$.tools.$.playButtons.disabled = !0 : (this.$.tools.$.playButtons.disabled = !1, Editor.Ipc.sendToPanel("console", "console:query-last-error-log", (t, e) => {
                    this.$.status.set("consoleLog", e)
                }))
            }), t.on("editor:console-failed", (t, e) => {
                this.$.status.set("consoleLog", {
                    type: "failed",
                    text: e
                })
            }), t.on("editor:console-warn", (t, e) => {
                this.$.status.set("consoleLog", {
                    type: "warn",
                    text: e
                })
            }), t.on("editor:console-error", (t, e) => {
                this.$.status.set("consoleLog", {
                    type: "error",
                    text: e
                })
            }), t.on("editor:console-clear", () => {
                this.$.status.set("consoleLog", null)
            }), t.on("preview-server:connects-changed", (t, e) => {
                this.$.tools.set("connectedCount", e)
            }), t.on("editor:ready", (t, e) => {
                Editor.Ipc.sendToMain("app:query-fb-update"), Editor.Ipc.sendToMain("app:query-status"), Editor.Ipc.sendToMain("asset-db:query-watch-state")
            }), t.on("profile:local-ip", (t, e) => {
                var o = Editor.remote.IP;
                e.localIp > 1 && (o = Editor.remote.IPList[e.localIp - 2]);
                var s = `${o}:${Editor.remote.PreviewServer.previewPort}`;
                this.$.tools.set("previewURL", s)
            }), window.addEventListener("copy", t => {
                t.target === document.body
            }), window.addEventListener("paste", t => {
                t.target === document.body
            }), window.onerror = function (t, e, o, s, r) {
                return Editor ? Editor.error ? Editor.error(r) : Editor.Ipc.sendToMain && (Editor.Ipc.sendToMain("editor:renderer-console-error", r.stack || r), Editor.Ipc.sendToMain("metrics:track-exception", r.stack || r)) : console.error(r.stack || r), !1
            };
            let e = new(require("mousetrap"));
            e.bind("w", () => {
                this.$.tools.transformTool = "move"
            }), e.bind("e", () => {
                this.$.tools.transformTool = "rotate"
            }), e.bind("r", () => {
                this.$.tools.transformTool = "scale"
            }), e.bind("t", () => {
                this.$.tools.transformTool = "rect"
            }), this.$.loginPanel.hidden = !Editor.requireLogin
        }
    })
})();