"use strict";
const Path = require("fire-path"),
    Mousetrap = require("mousetrap"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    i18n = require("../../i18n"),
    Console = require("../../console"),
    Profile = require("electron-profile"),
    JS = require("../../../share/js-utils"),
    IpcListener = require("../../../share/ipc-listener");
class PanelFrame extends window.HTMLElement {
    static get tagName() {
        return "UI-PANEL-FRAME"
    }
    get root() {
        return this.shadowRoot ? this.shadowRoot : this
    }
    get info() {
        return this._info
    }
    get name() {
        return this._info ? i18n.format(this._info.title) : this.id
    }
    get popable() {
        return !this._info || this._info.popable
    }
    get width() {
        if (!this._info) return "auto";
        let e = parseInt(this._info.width);
        return isNaN(e) ? "auto" : e
    }
    get minWidth() {
        if (!this._info) return 100;
        let e = parseInt(this._info["min-width"]);
        return isNaN(e) ? 100 : e
    }
    get maxWidth() {
        if (!this._info) return "auto";
        let e = parseInt(this._info["max-width"]);
        return isNaN(e) ? "auto" : e
    }
    get height() {
        if (!this._info) return "auto";
        let e = parseInt(this._info.height);
        return isNaN(e) ? "auto" : e
    }
    get minHeight() {
        if (!this._info) return 100;
        let e = parseInt(this._info["min-height"]);
        return isNaN(e) ? 100 : e
    }
    get maxHeight() {
        if (!this._info) return "auto";
        let e = parseInt(this._info["max-height"]);
        return isNaN(e) ? "auto" : e
    }
    createdCallback() {
        this.classList.add("fit"), this.tabIndex = -1, this._focusedElement = null, this._lastFocusedElement = null, this._info = null
    }
    queryID(e) {
        return this.root.getElementById(e)
    }
    query(e) {
        return this.root.querySelector(e)
    }
    queryAll(e) {
        return this.root.querySelectorAll(e)
    }
    reset() {}
    load(e) {
        let t = Path.join(this._info.path, this._info.main);
        ResMgr.importScript(t).then(t => {
            if (!t) throw new Error(`Failed to load panel-frame ${this.id}: no panel prototype return.`);
            if (t.dependencies && t.dependencies.length) return ResMgr.importScripts(t.dependencies).then(() => {
                this._loadProfiles().then(i => {
                    this._apply(t, i), e && e(null)
                })
            }).catch(t => {
                e && e(t)
            }), void 0;
            this._loadProfiles().then(i => {
                this._apply(t, i), e && e(null)
            })
        }).catch(t => {
            e && e(t)
        })
    }
    _loadProfiles() {
        let e = [];
        return this._info.profileTypes.forEach(t => {
            e.push(function (e, t) {
                return new Promise(function (i, s) {
                    let n = `profile://${e}/${t}.json`;
                    Profile.load(n, (t, r) => {
                        t ? (Console.warn(`failed to load profile ${n}: ${t.message}.`), s(t)) : i({
                            type: e,
                            profile: r
                        })
                    })
                })
            }(t, this.id))
        }), Promise.all(e).then(e => {
            let t = {};
            return e.forEach(e => {
                t[e.type] = e.profile
            }), t
        })
    }
    _apply(e, t) {
        let i = this._info["shadow-dom"],
            s = e.template,
            n = e.style,
            r = e.listeners,
            o = e.behaviors,
            l = e.$;
        JS.assignExcept(this, e, ["dependencies", "template", "style", "listeners", "behaviors", "$"]), o && o.forEach(e => {
            JS.addon(this, e)
        }), i && this.createShadowRoot();
        let h = this.root;
        if (s && (h.innerHTML = s), n) {
            let e = document.createElement("style");
            e.type = "text/css", e.textContent = n, h.insertBefore(e, h.firstChild)
        }
        if (i && h.insertBefore(DomUtils.createStyleElement("theme://elements/panel-frame.css"), h.firstChild), l)
            for (let e in l) {
                if (this[`$${e}`]) {
                    Console.warn(`failed to assign selector $${e}, already used.`);
                    continue
                }
                let t = h.querySelector(l[e]);
                t ? this[`$${e}`] = t : Console.warn(`failed to query selector ${l[e]} to $${e}.`)
            }
        if (r)
            for (let e in r) this.addEventListener(e, r[e].bind(this));
        if (this.messages) {
            let e = new IpcListener;
            for (let t in this.messages) {
                let i = this.messages[t];
                i && "function" == typeof i ? e.on(t, (e, ...t) => {
                    i.apply(this, [e, ...t])
                }) : Console.warn(`Failed to register ipc message ${t} in panel ${this.id}, function not provide.`)
            }
            this._ipcListener = e
        }
        if (t && (this.profiles = t), this._info.shortcuts) {
            let e = [],
                t = new Mousetrap(this);
            e.push(t);
            for (let i in this._info.shortcuts) {
                if ("#" !== i[0]) {
                    let e = this._info.shortcuts[i],
                        s = this[e];
                    if (!s || "function" != typeof s) {
                        Console.warn(`Failed to register shortcut, cannot find method ${e} in panel ${this.id}.`);
                        continue
                    }
                    t.bind(i, s.bind(this));
                    continue
                }
                let s = h.querySelector(i);
                if (!s) {
                    Console.warn(`Failed to register shortcut for element ${i}, cannot find it.`);
                    continue
                }
                let n = this._info.shortcuts[i],
                    r = new Mousetrap(s);
                e.push(r);
                for (let e in n) {
                    let t = n[e],
                        i = this[t];
                    i && "function" == typeof i ? r.bind(e, i.bind(this)) : Console.warn(`Failed to register shortcut, cannot find method ${t} in panel ${this.id}.`)
                }
            }
            this._mousetrapList = e
        }
    }
}
module.exports = PanelFrame;