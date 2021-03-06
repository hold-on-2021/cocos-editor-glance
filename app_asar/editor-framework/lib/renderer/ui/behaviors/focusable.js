"use strict";
const DomUtils = require("../utils/dom-utils");
let Focusable = {
    get focusable() {
        return !0
    },
    get focused() {
        return null !== this.getAttribute("focused")
    },
    get unnavigable() {
        return null !== this.getAttribute("unnavigable")
    },
    set unnavigable(s) {
        s ? this.setAttribute("unnavigable", "") : this.removeAttribute("unnavigable")
    },
    _initFocusable(s, t) {
        s ? Array.isArray(s) ? this._focusELs = s : this._focusELs = [s] : this._focusELs = [], t ? Array.isArray(t) ? this._navELs = t : this._navELs = [t] : this._navELs = this._focusELs, this.tabIndex = -1;
        for (let s = 0; s < this._focusELs.length; ++s) {
            let t = this._focusELs[s];
            t.tabIndex = -1, t.addEventListener("focus", () => {
                this._curFocus = t
            })
        }
    },
    _getFirstFocusableElement() {
        return this._focusELs.length > 0 ? this._focusELs[0] : null
    },
    _setFocused(s) {
        if (this.focused !== s) {
            if (s) {
                if (this.setAttribute("focused", ""), this._focusELs.length > 0) {
                    let s = this._focusELs[0];
                    s === this ? s.focus() : s.focusable ? s._setFocused(!0) : s.focus()
                }
            } else this.removeAttribute("focused"), this._focusELs.forEach(s => {
                s.focusable && s.focused && s._setFocused(!1)
            });
            DomUtils.fire(this, "focus-changed", {
                bubbles: !0,
                detail: {
                    focused: this.focused
                }
            })
        }
    }
};
module.exports = Focusable;