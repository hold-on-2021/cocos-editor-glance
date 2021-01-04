"use strict";

function _getParentTabIndex(e) {
    let s = e.parentElement;
    for (; s;) {
        if (null !== s.tabIndex && void 0 !== s.tabIndex && -1 !== s.tabIndex) return s.tabIndex;
        s = s.parentElement
    }
    return 0
}

function _removeTabIndexRecursively(e) {
    void 0 !== e.focused && void 0 !== e._initTabIndex && (e._setFocused(!1), e._removeTabIndex());
    for (var s = Polymer.dom(e), t = 0; t < s.children.length; ++t) _removeTabIndexRecursively(s.children[t])
}

function _initTabIndexRecursively(e) {
    void 0 !== e.focused && void 0 !== e._initTabIndex && !1 === e.disabled && e._initTabIndex();
    for (var s = Polymer.dom(e), t = 0; t < s.children.length; ++t) _initTabIndexRecursively(s.children[t])
}
let PolymerFocusable = {
    "ui-focusable": !0,
    properties: {
        focused: {
            type: Boolean,
            value: !1,
            notify: !0,
            readOnly: !0,
            reflectToAttribute: !0
        },
        disabled: {
            type: Boolean,
            value: !1,
            notify: !0,
            observer: "_disabledChanged",
            reflectToAttribute: !0
        },
        noNavigate: {
            type: Boolean,
            value: !1,
            reflectToAttribute: !0
        }
    },
    _initFocusable: function (e) {
        e ? Array.isArray(e) ? this.focusEls = e : this.focusEls = [e] : this.focusEls = [], this._initTabIndex(), this._losingFocus = !1
    },
    _initTabIndex() {
        if (this.focusEls) {
            var e;
            if (this.noNavigate || this.disabled)
                for (e = 0; e < this.focusEls.length; ++e) this.focusEls[e].tabIndex = -1;
            else
                for (e = 0; e < this.focusEls.length; ++e) this.focusEls[e].tabIndex = _getParentTabIndex(this) + 1
        }
    },
    _removeTabIndex() {
        if (this.focusEls)
            for (var e = 0; e < this.focusEls.length; ++e) {
                this.focusEls[e].tabIndex = -1
            }
    },
    _disabledInHierarchy() {
        if (this.disabled) return !0;
        for (var e = Polymer.dom(this).parentNode; e;) {
            if (e.disabled) return !0;
            e = Polymer.dom(e).parentNode
        }
        return !1
    },
    _focusedChanged() {
        this.disabled && this._setFocused(!1)
    },
    _disabledChanged(e) {
        e ? (this.style.pointerEvents = "none", _removeTabIndexRecursively(this)) : (this.style.pointerEvents = "", _initTabIndexRecursively(this))
    },
    _onFocus() {
        this._setFocused(!0)
    },
    _onBlur() {
        this._setFocused(!1)
    },
    setFocus() {
        this._disabledInHierarchy() || (this.focusEls.length > 0 && this.focusEls[0].focus(), this._setFocused(!0))
    },
    setBlur() {
        this._disabledInHierarchy() || (this.focusEls.length > 0 && this.focusEls[0].blur(), this._setFocused(!1))
    }
};
module.exports = PolymerFocusable;