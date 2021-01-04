"use strict";
const DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr");
let InputState = {
    _initInputState(e) {
        if (!this._onInputConfirm) throw new Error("Failed to init input-state: please implement _onInputConfirm");
        if (!this._onInputCancel) throw new Error("Failed to init input-state: please implement _onInputCancel");
        if (!this._onInputChange) throw new Error("Failed to init input-state: please implement _onInputChange");
        let t = e instanceof HTMLTextAreaElement;
        e._initValue = e.value, e._focused = !1, e._selectAllWhenMouseUp = !1, e._mouseStartX = -1, e.addEventListener("focus", () => {
            e._focused = !0, e._initValue = e.value, !1 === e._selectAllWhenMouseUp && e.select()
        }), e.addEventListener("blur", () => {
            e._focused = !1
        }), e.addEventListener("change", t => {
            DomUtils.acceptEvent(t), this._onInputConfirm(e)
        }), e.addEventListener("input", t => {
            DomUtils.acceptEvent(t), this._onInputChange(e)
        }), e.addEventListener("keydown", n => {
            this.disabled || (n.stopPropagation(), 13 === n.keyCode ? (!t || n.ctrlKey || n.metaKey) && (DomUtils.acceptEvent(n), this._onInputConfirm(e, !0)) : 27 === n.keyCode && (DomUtils.acceptEvent(n), this._onInputCancel(e, !0)))
        }), e.addEventListener("keyup", e => {
            e.stopPropagation()
        }), e.addEventListener("keypress", e => {
            e.stopPropagation()
        }), e.addEventListener("mousedown", t => {
            t.stopPropagation(), FocusMgr._setFocusElement(this), e._mouseStartX = t.clientX, e._focused || (e._selectAllWhenMouseUp = !0)
        }), e.addEventListener("mouseup", t => {
            t.stopPropagation(), e._selectAllWhenMouseUp && (e._selectAllWhenMouseUp = !1, Math.abs(t.clientX - e._mouseStartX) < 4 && e.select())
        })
    },
    _unselect(e) {
        e.selectionStart = e.selectionEnd = -1
    }
};
module.exports = InputState;