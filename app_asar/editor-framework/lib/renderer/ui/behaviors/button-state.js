"use strict";

function _pressed(e) {
    return null !== e.getAttribute("pressed")
}
const DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr");
let ButtonState = {
    _initButtonState(e) {
        DomUtils.installDownUpEvent(e), e.addEventListener("keydown", t => {
            if (!this.disabled)
                if (32 === t.keyCode) DomUtils.acceptEvent(t), this._setPressed(e, !0), this._canceledByEsc = !1;
                else if (13 === t.keyCode) {
                if (DomUtils.acceptEvent(t), this._enterTimeoutID) return;
                this._setPressed(e, !0), this._canceledByEsc = !1, this._enterTimeoutID = setTimeout(() => {
                    this._enterTimeoutID = null, this._setPressed(e, !1), e.click()
                }, 100)
            } else 27 === t.keyCode && (DomUtils.acceptEvent(t), _pressed(e) && (DomUtils.fire(e, "cancel", {
                bubbles: !1
            }), this._canceledByEsc = !0), this._setPressed(e, !1))
        }), e.addEventListener("keyup", t => {
            32 === t.keyCode && (DomUtils.acceptEvent(t), _pressed(e) && setTimeout(() => {
                e.click()
            }, 1), this._setPressed(e, !1))
        }), e.addEventListener("down", t => {
            DomUtils.acceptEvent(t), FocusMgr._setFocusElement(this), this._setPressed(e, !0), this._canceledByEsc = !1
        }), e.addEventListener("up", t => {
            DomUtils.acceptEvent(t), this._setPressed(e, !1)
        }), e.addEventListener("click", t => {
            if (this._onButtonClick(e), !this.readonly) return this._canceledByEsc ? (this._canceledByEsc = !1, DomUtils.acceptEvent(t), void 0) : void 0
        }), e.addEventListener("focus-changed", () => {
            this.focused || this._setPressed(e, !1)
        })
    },
    _setPressed(e, t) {
        t ? e.setAttribute("pressed", "") : e.removeAttribute("pressed")
    }
};
module.exports = ButtonState;