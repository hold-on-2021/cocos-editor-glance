"use strict";
const DomUtils = require("../utils/dom-utils");
let Readonly = {
    get canBeReadonly() {
        return !0
    },
    get readonly() {
        return null !== this.getAttribute("is-readonly")
    },
    set readonly(e) {
        if (e !== this._readonly)
            if (this._readonly = e, e) {
                if (this.setAttribute("readonly", ""), this._setIsReadonlyAttribute(!0), !this._readonlyNested) return;
                this._propgateReadonly()
            } else if (this.removeAttribute("readonly"), !this._isReadonlyInHierarchy(!0)) {
            if (this._setIsReadonlyAttribute(!1), !this._readonlyNested) return;
            this._propgateReadonly()
        }
    },
    _initReadonly(e) {
        this._readonly = null !== this.getAttribute("readonly"), this._readonly && this._setIsReadonlyAttribute(!0), this._readonlyNested = e
    },
    _propgateReadonly() {
        DomUtils.walk(this, {
            excludeSelf: !0
        }, e => !!e.canBeReadonly && (!!e._readonly || (e._setIsReadonlyAttribute(this._readonly), !e._readonlyNested)))
    },
    _isReadonlyInHierarchy(e) {
        if (!e && this.readonly) return !0;
        let t = this.parentNode;
        for (; t;) {
            if (t.readonly) return !0;
            t = t.parentNode
        }
        return !1
    },
    _isReadonlySelf() {
        return this._readonly
    },
    _setIsReadonlyAttribute(e) {
        e ? this.setAttribute("is-readonly", "") : this.removeAttribute("is-readonly")
    }
};
module.exports = Readonly;