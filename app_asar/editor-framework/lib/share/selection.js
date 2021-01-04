"use strict";

function _sendToAll(e, t, ...i) {
    "local" !== t && (Ipc.sendToAll.apply(null, [`_${e}`, t, ...i, Ipc.option({
        excludeSelf: !0
    })]), Ipc.sendToAll.apply(null, [e, t, ...i]))
}
const Electron = require("electron"),
    _ = require("lodash"),
    Platform = require("./platform");
let Ipc, Console;
Platform.isMainProcess ? (Ipc = require("../main/ipc"), Console = require("../main/console")) : (Ipc = require("../renderer/ipc"), Console = require("../renderer/console"));
let _lastActiveHelper = null,
    _helpers = {};
const IPC_SELECTED = "selection:selected",
    IPC_UNSELECTED = "selection:unselected",
    IPC_ACTIVATED = "selection:activated",
    IPC_DEACTIVATED = "selection:deactivated",
    IPC_HOVERIN = "selection:hoverin",
    IPC_HOVEROUT = "selection:hoverout",
    IPC_CONTEXT = "selection:context",
    IPC_CHANGED = "selection:changed",
    IPC_PATCH = "selection:patch";
let Selection = {
    register(e) {
        if (!Platform.isMainProcess) return Console.warn("Editor.Selection.register can only be called in core level."), void 0;
        _helpers[e] || (_helpers[e] = new ConfirmableSelectionHelper(e))
    },
    reset() {
        for (let e in _helpers) _helpers[e].clear();
        _helpers = {}
    },
    local: () => new ConfirmableSelectionHelper("local"),
    confirm() {
        for (let e in _helpers) _helpers[e].confirm()
    },
    cancel() {
        for (let e in _helpers) _helpers[e].cancel()
    },
    confirmed(e) {
        let t = _helpers[e];
        return t ? t.confirmed : (Console.error("Cannot find the type %s for selection. Please register it first.", e), !1)
    },
    select(e, t, i, s) {
        let l = _helpers[e];
        return l ? t && "string" != typeof t && !Array.isArray(t) ? (Console.error("The 2nd argument for `Editor.Selection.select` must be a string or array"), void 0) : (l.select(t, i, s), void 0) : (Console.error("Cannot find the type %s for selection. Please register it first.", e), void 0)
    },
    unselect(e, t, i) {
        let s = _helpers[e];
        return s ? t && "string" != typeof t && !Array.isArray(t) ? (Console.error("The 2nd argument for `Editor.Selection.select` must be a string or array"), void 0) : (s.unselect(t, i), void 0) : (Console.error("Cannot find the type %s for selection. Please register it first.", e), void 0)
    },
    hover(e, t) {
        let i = _helpers[e];
        if (!i) return Console.error("Cannot find the type %s for selection. Please register it first.", e), void 0;
        i.hover(t)
    },
    setContext(e, t) {
        let i = _helpers[e];
        return i ? t && "string" != typeof t ? (Console.error("The 2nd argument for `Editor.Selection.setContext` must be a string"), void 0) : (i.setContext(t), void 0) : (Console.error("Cannot find the type %s for selection. Please register it first.", e), void 0)
    },
    patch(e, t, i) {
        let s = _helpers[e];
        if (!s) return Console.error("Cannot find the type %s for selection. Please register it first", e), void 0;
        s.patch(t, i)
    },
    clear(e) {
        let t = _helpers[e];
        if (!t) return Console.error("Cannot find the type %s for selection. Please register it first", e), void 0;
        t.clear()
    },
    hovering(e) {
        let t = _helpers[e];
        return t ? t.lastHover : (Console.error("Cannot find the type %s for selection. Please register it first", e), null)
    },
    contexts(e) {
        let t = _helpers[e];
        return t ? t.contexts : (Console.error("Cannot find the type %s for selection. Please register it first.", e), null)
    },
    curActivate(e) {
        let t = _helpers[e];
        return t ? t.lastActive : (Console.error("Cannot find the type %s for selection. Please register it first.", e), null)
    },
    curGlobalActivate: () => _lastActiveHelper ? {
        type: _lastActiveHelper.type,
        id: _lastActiveHelper.lastActive
    } : null,
    curSelection(e) {
        let t = _helpers[e];
        return t ? t.selection.slice() : (Console.error("Cannot find the type %s for selection. Please register it first.", e), null)
    },
    filter(e, t, i) {
        let s, l, r, n;
        if ("name" === t) s = e.filter(i);
        else
            for (s = [], r = 0; r < e.length; ++r) {
                l = e[r];
                let t = !0;
                for (n = 0; n < s.length; ++n) {
                    let e = s[n];
                    if (l === e) {
                        t = !1;
                        break
                    }
                    let r = i(e, l);
                    if (r > 0) {
                        t = !1;
                        break
                    }
                    r < 0 && (s.splice(n, 1), --n)
                }
                t && s.push(l)
            }
        return s
    }
};
module.exports = Selection;
class SelectionHelper {
    constructor(e) {
        this.type = e, this.selection = [], this.lastActive = null, this.lastHover = null, this._context = null
    }
    _activate(e) {
        if (this.lastActive !== e) return null !== this.lastActive && void 0 !== this.lastActive && _sendToAll(IPC_DEACTIVATED, this.type, this.lastActive), this.lastActive = e, _sendToAll(IPC_ACTIVATED, this.type, e), _lastActiveHelper = this, void 0;
        _lastActiveHelper !== this && (_lastActiveHelper = this, _sendToAll(IPC_ACTIVATED, this.type, this.lastActive))
    }
    _unselectOthers(e) {
        e = e || [], Array.isArray(e) || (e = [e]);
        let t = _.difference(this.selection, e);
        return !!t.length && (_sendToAll(IPC_UNSELECTED, this.type, t), this.selection = _.intersection(this.selection, e), !0)
    }
    select(e, t, i) {
        let s = !1;
        if (e = e || [], Array.isArray(e) || (e = [e]), t = void 0 === t || t, t && (s = this._unselectOthers(e)), e.length) {
            let t = _.difference(e, this.selection);
            t.length && (this.selection = this.selection.concat(t), _sendToAll(IPC_SELECTED, this.type, t), s = !0)
        }
        e.length ? this._activate(e[e.length - 1]) : this._activate(null), s && i && _sendToAll(IPC_CHANGED, this.type)
    }
    unselect(e, t) {
        let i = !1,
            s = !1;
        if (e = e || [], Array.isArray(e) || (e = [e]), e.length) {
            let t = _.intersection(this.selection, e);
            this.selection = _.difference(this.selection, e), t.length && (-1 !== t.indexOf(this.lastActive) && (s = !0), _sendToAll(IPC_UNSELECTED, this.type, t), i = !0)
        }
        s && (this.selection.length ? this._activate(this.selection[this.selection.length - 1]) : this._activate(null)), i && t && _sendToAll(IPC_CHANGED, this.type)
    }
    hover(e) {
        this.lastHover !== e && (null !== this.lastHover && void 0 !== this.lastHover && _sendToAll(IPC_HOVEROUT, this.type, this.lastHover), this.lastHover = e, null !== e && void 0 !== e && _sendToAll(IPC_HOVERIN, this.type, e))
    }
    setContext(e) {
        this._context = e, _sendToAll(IPC_CONTEXT, this.type, e)
    }
    patch(e, t) {
        let i = this.selection.indexOf(e); - 1 !== i && (this.selection[i] = t), this.lastActive === e && (this.lastActive = t), this.lastHover === e && (this.lastHover = t), this._context === e && (this._context = t), _sendToAll(IPC_PATCH, this.type, e, t)
    }
    clear() {
        let e = !1;
        this.selection.length && (_sendToAll(IPC_UNSELECTED, this.type, this.selection), this.selection = [], e = !0), this.lastActive && (this._activate(null), e = !0), e && _sendToAll(IPC_CHANGED, this.type)
    }
}
Object.defineProperty(SelectionHelper.prototype, "contexts", {
    enumerable: !0,
    get() {
        let e = this._context;
        if (!e) return [];
        let t = this.selection.indexOf(e);
        if (-1 === t) return [e];
        let i = this.selection.slice(0),
            s = i[t];
        return i.splice(t, 1), i.unshift(s), i
    }
});
class ConfirmableSelectionHelper extends SelectionHelper {
    constructor(e) {
        super(e), this.confirmed = !0, this._confirmedSnapShot = []
    }
    _checkConfirm(e) {
        !this.confirmed && e ? this.confirm() : this.confirmed && !e && (this._confirmedSnapShot = this.selection.slice(), this.confirmed = !1)
    }
    _activate(e) {
        this.confirmed && super._activate(e)
    }
    select(e, t, i) {
        i = void 0 === i || i, this._checkConfirm(i), super.select(e, t, i)
    }
    unselect(e, t) {
        t = void 0 === t || t, this._checkConfirm(t), super.unselect(e, t)
    }
    confirm() {
        if (!this.confirmed) {
            this.confirmed = !0;
            _.xor(this._confirmedSnapShot, this.selection).length && _sendToAll(IPC_CHANGED, this.type), this._confirmedSnapShot = [], this.selection.length > 0 ? this._activate(this.selection[this.selection.length - 1]) : this._activate(null)
        }
    }
    cancel() {
        this.confirmed || (super.select(this._confirmedSnapShot, !0), this.confirmed = !0, this._confirmedSnapShot = [])
    }
    clear() {
        super.clear(), this.confirm()
    }
}
let ipc = null;
ipc = Platform.isMainProcess ? Electron.ipcMain : Electron.ipcRenderer, Platform.isMainProcess && ipc.on("selection:get-registers", e => {
    let t = [];
    for (let e in _helpers) {
        let i = _helpers[e];
        t.push({
            type: e,
            selection: i.selection,
            lastActive: i.lastActive,
            lastHover: i.lastHover,
            context: i._context,
            isLastGlobalActive: i === _lastActiveHelper
        })
    }
    e.returnValue = t
}), Platform.isRendererProcess && (() => {
    let e = Ipc.sendToMainSync("selection:get-registers");
    for (let t = 0; t < e.length; ++t) {
        let i = e[t];
        if (_helpers[i.type]) return;
        let s = new ConfirmableSelectionHelper(i.type);
        s.selection = i.selection.slice(), s.lastActive = i.lastActive, s.lastHover = i.lastHover, s._context = i.context, _helpers[i.type] = s, i.isLastGlobalActive && (_lastActiveHelper = s)
    }
})(), ipc.on("_selection:selected", (e, t, i) => {
    let s = _helpers[t];
    if (!s) return Console.error("Cannot find the type %s for selection. Please register it first.", t), void 0;
    1 === (i = i.filter(e => -1 === s.selection.indexOf(e))).length ? s.selection.push(i[0]) : i.length > 1 && (s.selection = s.selection.concat(i))
}), ipc.on("_selection:unselected", (e, t, i) => {
    let s = _helpers[t];
    if (!s) return Console.error("Cannot find the type %s for selection. Please register it first.", t), void 0;
    s.selection = s.selection.filter(e => -1 === i.indexOf(e))
}), ipc.on("_selection:activated", (e, t, i) => {
    let s = _helpers[t];
    if (!s) return Console.error("Cannot find the type %s for selection. Please register it first.", t), void 0;
    _lastActiveHelper = s, s.lastActive = i
}), ipc.on("_selection:deactivated", (e, t, i) => {
    unused(i);
    let s = _helpers[t];
    if (!s) return Console.error("Cannot find the type %s for selection. Please register it first.", t), void 0;
    _lastActiveHelper === s && (_lastActiveHelper = null), s.lastActive = null
}), ipc.on("_selection:hoverin", (e, t, i) => {
    let s = _helpers[t];
    if (!s) return Console.error("Cannot find the type %s for selection. Please register it first.", t), void 0;
    s.lastHover = i
}), ipc.on("_selection:hoverout", (e, t, i) => {
    unused(i);
    let s = _helpers[t];
    if (!s) return Console.error("Cannot find the type %s for selection. Please register it first.", t), void 0;
    s.lastHover = null
}), ipc.on("_selection:context", (e, t, i) => {
    let s = _helpers[t];
    if (!s) return Console.error("Cannot find the type %s for selection. Please register it first.", t), void 0;
    s._context = i
}), ipc.on("_selection:patch", (e, t, i, s) => {
    let l = _helpers[t];
    if (!l) return Console.error("Cannot find the type %s for selection. Please register it first.", t), void 0;
    let r = l.selection.indexOf(i); - 1 !== r && (l.selection[r] = s), l.lastActive === i && (l.lastActive = s), l.lastHover === i && (l.lastHover = s), l._context === i && (l._context = s)
});