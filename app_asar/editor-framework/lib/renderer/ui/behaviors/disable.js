"use strict";
const DomUtils = require("../utils/dom-utils");
let Disable = {
    get canBeDisable() {
        return !0
    },
    get disabled() {
        return null !== this.getAttribute("is-disabled")
    },
    set disabled(e) {
        if (e !== this._disabled)
            if (this._disabled = e, e) {
                if (this.setAttribute("disabled", ""), this._setIsDisabledAttribute(!0), !this._disabledNested) return;
                this._propgateDisable()
            } else if (this.removeAttribute("disabled"), !this._isDisabledInHierarchy(!0)) {
            if (this._setIsDisabledAttribute(!1), !this._disabledNested) return;
            this._propgateDisable()
        }
    },
    _initDisable(e) {
        this._disabled = null !== this.getAttribute("disabled"), this._disabled && this._setIsDisabledAttribute(!0), this._disabledNested = e
    },
    _propgateDisable() {
        DomUtils.walk(this, {
            excludeSelf: !0
        }, e => !!e.canBeDisable && (!!e._disabled || (e._setIsDisabledAttribute(this._disabled), !e._disabledNested)))
    },
    _isDisabledInHierarchy(e) {
        if (!e && this.disabled) return !0;
        let t = this.parentNode;
        for (; t;) {
            if (t.disabled) return !0;
            t = t.parentNode
        }
        return !1
    },
    _isDisabledSelf() {
        return this._disabled
    },
    _setIsDisabledAttribute(e) {
        e ? this.setAttribute("is-disabled", "") : this.removeAttribute("is-disabled")
    }
};
module.exports = Disable;