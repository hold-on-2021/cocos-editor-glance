"use strict";
let EditMode = {
    _modes: {},
    _modeStack: [],
    init() {
        this._modes.scene = _Scene, this._modeStack.push(_Scene)
    },
    push(e, t, s) {
        _Scene.Tasks.push({
            name: `push-edit-mode:[${e}]`,
            target: this,
            run: this._push,
            params: [e, t]
        }, s)
    },
    _push(e, t, s) {
        let o = this._modes[e];
        if (!o) return s(new Error(`Can't find register for mode name [${e}]`));
        let n = this.curMode();
        if (void 0 === t && (t = []), Array.isArray(t) || (t = [t]), _Scene.Tasks.stash(), n.beforePushOther) {
            let e = [o].concat(t);
            n.beforePushOther.apply(n, e)
        }
        _Scene.Tasks.push({
            name: `open-edit-mode:[${o.name}]`,
            target: o,
            run: o.open,
            params: t
        }, e => {
            this._modeStack.push(o), _Scene.view.mode = o.name, _Scene.updateTitle(this.title())
        }), _Scene.Tasks.unshiftStash(), s()
    },
    pop(e, t, s) {
        _Scene.Tasks.push({
            name: `pop-edit-mode:[${e}]`,
            target: this,
            run: this._pop,
            params: [e, t]
        }, s)
    },
    _pop(e, t, s) {
        let o = 2,
            n = !0,
            a = this._modeStack;
        if (t = t || {}, "closeResult" in t && (o = t.closeResult, n = !1), 1 === a.length) return s();
        if (_Scene.Sandbox.reloading) return s(new Error("Can not change editmode when scripts are reloading, try again please."));
        let r = this.curMode();
        return e && e !== r.name ? s(new Error(`Pop mode [${e}] not match current mode [${r.name}]`)) : (n && (o = r.confirmClose()), 1 === o ? (_Scene.Tasks.kill(), s(null, o)) : (r.close(o, e => {
            this._popStack(), s(e, o)
        }), void 0))
    },
    _popStack() {
        let e = this._modeStack;
        if (1 === e.length) return;
        e.pop();
        let t = e[e.length - 1];
        _Scene.updateTitle(this.title()), _Scene.view.mode = t.name
    },
    popAll() {
        for (let e = this._modeStack.length - 1; e > 0; e--) this.pop(this._modeStack[e].name)
    },
    close(e) {
        this.popAll(), this.closeScene({}, e)
    },
    closeScene(e, t) {
        _Scene.Tasks.push({
            name: "close-scene",
            target: this,
            run: this._closeScene,
            params: [e]
        }, (e, s) => {
            1 !== s && t && t()
        })
    },
    _closeScene(e, t) {
        let s = 2,
            o = !0;
        "closeResult" in (e = e || {}) && (s = e.closeResult, o = !1), o && (s = _Scene.confirmClose()), _Scene.close(s, (e, s) => {
            t(e, s)
        })
    },
    softReload() {
        for (let e = this._modeStack.length - 1; e > 0; e--) {
            let t = this._modeStack[e];
            t && t.softReload && t.softReload()
        }
    },
    title() {
        let e = this.curMode();
        return e === _Scene ? "" : e.title
    },
    curMode() {
        let e = this._modeStack.length;
        return 0 === e ? null : this._modeStack[e - 1]
    },
    register(e) {
        this._modes[e.name] = e
    },
    _save(e, t) {
        e.save(e => {
            if (e) return t(e);
            _Scene.stashScene(() => {
                Editor.Profile.load("profile://global/settings.json", (e, s) => {
                    s.data["auto-refresh"] && Editor.Ipc.sendToMain("app:reload-on-device"), t()
                })
            })
        })
    },
    save(e) {
        let t = this.curMode();
        _Scene.Tasks.push({
            name: `save-editor-mode:[${t.name}]`,
            target: this,
            run: this._save,
            params: [t]
        }, t => {
            t && Editor.error(t.message), e && e(t)
        })
    }
};
_Scene.EditMode = module.exports = EditMode;