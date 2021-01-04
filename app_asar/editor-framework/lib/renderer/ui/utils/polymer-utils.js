"use strict";

function _registerIpc(e, t, i, r, n) {
    if (!n || "function" != typeof n) return Console.warn(`Failed to register ipc message ${r} in panel ${t}, function not provide.`), void 0;
    e.on(r, (e, ...t) => {
        n.apply(i, [e, ...t])
    })
}

function _registerShortcut(e, t, i, r, n) {
    let o = i[n];
    if (!o || "function" != typeof o) return Console.warn(`Failed to register shortcut, cannot find method ${n} in panel ${e}.`), void 0;
    t.bind(r, o.bind(i))
}

function _loadProfiles(e, t) {
    var i = e.profileTypes.map(e => new Promise((i, r) => {
        Profile.load(`profile://${e}/${t}.json`, (t, n) => {
            t ? (Console.warn(`failed to load profile ${url}: ${t.message}.`), r(t)) : i({
                type: e,
                profile: n
            })
        })
    }));
    return Promise.all(i).then(e => {
        var t = {};
        return e.forEach(e => {
            t[e.type] = e.profile
        }), Promise.resolve(t)
    })
}
let PolymerUtils = {};
module.exports = PolymerUtils;
const Path = require("fire-path"),
    Mousetrap = require("mousetrap"),
    DomUtils = require("./dom-utils"),
    Profile = require("electron-profile"),
    Console = require("../../console"),
    i18n = require("../../i18n"),
    JS = require("../../../share/js-utils"),
    IpcListener = require("../../../share/ipc-listener");
let _importCount = 0;
PolymerUtils.importing = !1, PolymerUtils.templatize = function (e, t, i) {
    let r = document.createElement("template");
    r.innerHTML = t, e.templatize(r);
    return e.stamp(i)
}, PolymerUtils.bind = function (e, t, i, r) {
    let n = DomUtils.camelCase(r);
    e.addEventListener(t + "-changed", function (e) {
        e.detail.path ? i.set(e.detail.path, e.detail.value) : i.set(n, e.detail.value)
    }), i.addEventListener(r + "-changed", function (i) {
        i.detail.path ? e.set(i.detail.path, i.detail.value) : e.set(t, i.detail.value)
    })
}, PolymerUtils.bindUUID = function (e, t, i, r) {
    let n = DomUtils.camelCase(r);
    e.addEventListener(t + "-changed", function (e) {
        e.detail.path === t + ".uuid" ? i.set(n, e.detail.value) : e.detail.value ? i.set(n, e.detail.value.uuid) : i.set(n, null)
    }), i.addEventListener(r + "-changed", function (i) {
        e.set(t, {
            uuid: i.detail.value
        })
    })
}, PolymerUtils.getSelfOrAncient = function (e, t) {
    let i = e;
    for (; i;) {
        if (i instanceof t) return i;
        i = Polymer.dom(i).parentNode
    }
    return 0
}, PolymerUtils.isSelfOrAncient = function (e, t) {
    let i = e;
    for (; i;) {
        if (i === t) return !0;
        i = Polymer.dom(i).parentNode
    }
    return !1
}, PolymerUtils.import = function (e, t) {
    ++_importCount, PolymerUtils.importing = !0, Polymer.Base.importHref(e, function () {
        0 === --_importCount && (PolymerUtils.importing = !1), t && t()
    }, function () {
        0 === --_importCount && (PolymerUtils.importing = !1), t && t(new Error(`${e} not found.`))
    })
}, PolymerUtils.registerElement = function (e) {
    if (!e.is) {
        let t = document.currentScript.parentElement;
        if (!t || "DOM-MODULE" !== t.tagName) return Console.error("Failed to register widget %s. The script must be inside a <dom-module> tag."), void 0;
        e.is = t.id
    }
    if (PolymerUtils.elements || (PolymerUtils.elements = {}), PolymerUtils.elements[e.is]) return Console.error("Failed to register widget %s since it already exists.", e.is), void 0;
    e._T = function (e, t) {
        return i18n.t(e, t)
    }, PolymerUtils.elements[e.is] = Polymer(e)
}, PolymerUtils.registerPanel = function (e, t) {
    if (!t.is) {
        let i = document.currentScript.parentElement;
        if (!i || "DOM-MODULE" !== i.tagName) return Console.error(`Failed to register panel ${e}, the script must be inside a <dom-module> tag.`), void 0;
        t.is = i.id
    }
    if (PolymerUtils.panels || (PolymerUtils.panels = {}), void 0 !== PolymerUtils.panels[e]) return Console.error(`Failed to register panel ${e}, that panelID has already been registered.`), void 0;
    t._T = function (e, t) {
        return i18n.t(e, t)
    }, PolymerUtils.panels[e] = Polymer(t)
}, PolymerUtils.newFrame = function (e, t, i) {
    let r = Path.join(t.path, t.main);
    PolymerUtils.import(r, r => {
        if (r) return i && i(new Error(`Failed to load panel ${e}: ${r.message}`)), void 0;
        let n = PolymerUtils.panels[e];
        if (!n) return i && i(new Error(`Failed to load panel ${e}: Cannot find panel frame constructor in "UI.PolymerUtils.panels"`)), void 0;
        _loadProfiles(t, e).then(r => {
            let o = new n;
            o._info = t, o.classList.add("fit"), o.tabIndex = 1, o.setAttribute("id", e), t.icon && (o.icon = new Image, o.icon.src = Path.join(t.path, t.icon)), JS.assign(o, {
                get name() {
                    return this._info ? i18n.format(this._info.title) : this.id
                },
                get popable() {
                    return !this._info || this._info.popable
                },
                get width() {
                    if (!this._info) return "auto";
                    let e = parseInt(this._info.width);
                    return isNaN(e) ? "auto" : e
                },
                get minWidth() {
                    if (!this._info) return 50;
                    let e = parseInt(this._info["min-width"]);
                    return isNaN(e) ? 50 : e
                },
                get maxWidth() {
                    if (!this._info) return "auto";
                    let e = parseInt(this._info["max-width"]);
                    return isNaN(e) ? "auto" : e
                },
                get height() {
                    if (!this._info) return "auto";
                    let e = parseInt(this._info.height);
                    return isNaN(e) ? "auto" : e
                },
                get minHeight() {
                    if (!this._info) return 50;
                    let e = parseInt(this._info["min-height"]);
                    return isNaN(e) ? 50 : e
                },
                get maxHeight() {
                    if (!this._info) return "auto";
                    let e = parseInt(this._info["max-height"]);
                    return isNaN(e) ? "auto" : e
                }
            });
            let l = new IpcListener;
            for (let t in o.messages) _registerIpc(l, e, o, t, o.messages[t]);
            if (o._ipcListener = l, o.profiles = r, t.shortcuts) {
                let i = [],
                    r = new Mousetrap(o);
                i.push(r);
                for (let n in t.shortcuts)
                    if (n.length > 1 && "#" === n[0]) {
                        let r;
                        if (r = t.ui ? o.querySelector(n) : o.root.querySelector(n), !r) {
                            Console.warn(`Failed to register shortcut for element ${n}, cannot find it.`);
                            continue
                        }
                        let l = t.shortcuts[n],
                            s = new Mousetrap(r);
                        i.push(s);
                        for (let t in l) _registerShortcut(e, s, o, t, l[t])
                    } else _registerShortcut(e, r, o, n, t.shortcuts[n]);
                o._mousetrapList = i
            }
            i && i(null, o)
        })
    })
};