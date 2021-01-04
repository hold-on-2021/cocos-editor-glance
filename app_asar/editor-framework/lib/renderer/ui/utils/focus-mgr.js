"use strict";
let FocusMgr = {};
module.exports = FocusMgr;
const Electron = require("electron"),
    DomUtils = require("./dom-utils"),
    DockUtils = require("./dock-utils");
let _focusedPanelFrame = null,
    _lastFocusedPanelFrame = null,
    _focusedElement = null,
    _lastFocusedElement = null,
    _disabled = !1;
FocusMgr._isNavigable = function (e) {
    return e.focusable && !e.disabled && !e.unnavigable
}, FocusMgr._focusPrev = function () {
    let e, s, l;
    if (_focusedPanelFrame ? (e = _focusedPanelFrame.root, s = _focusedPanelFrame._focusedElement, l = _focusedPanelFrame._lastFocusedElement) : (e = document.body, s = _focusedElement, l = _lastFocusedElement), !s) return l ? (FocusMgr._setFocusElement(l), !0) : (e && (s = FocusMgr._getFirstFocusableFrom(e, !0), FocusMgr._setFocusElement(s)), void 0);
    let t, n = s;
    for (; t = FocusMgr._getPrevFocusable(n), t && t._getFirstFocusableElement() === n;) n = t;
    return !!t && (FocusMgr._setFocusElement(t), !0)
}, FocusMgr._focusNext = function () {
    let e, s, l;
    if (_focusedPanelFrame ? (e = _focusedPanelFrame.root, s = _focusedPanelFrame._focusedElement, l = _focusedPanelFrame._lastFocusedElement) : (e = document.body, s = _focusedElement, l = _lastFocusedElement), !s) return l ? (FocusMgr._setFocusElement(l), !0) : (e && (s = FocusMgr._getFirstFocusableFrom(e, !0), FocusMgr._setFocusElement(s)), void 0);
    let t = FocusMgr._getNextFocusable(s);
    return !!t && (FocusMgr._setFocusElement(t), !0)
}, FocusMgr._focusParent = function (e) {
    let s = FocusMgr._getFocusableParent(e);
    s && (DockUtils.isPanel(s) ? (FocusMgr._setFocusElement(null), s.activeTab.frameEL.focus()) : FocusMgr._setFocusElement(s))
}, FocusMgr._setFocusPanelFrame = function (e) {
    let s, l;
    e && _focusedElement && (_lastFocusedElement = _focusedElement, _focusedElement._setFocused(!1), _focusedElement = null), _focusedPanelFrame && (s = _focusedPanelFrame.parentElement), e && (l = e.parentElement), s !== l && (s && s._setFocused(!1), l && l._setFocused(!0)), _focusedPanelFrame !== e && (_focusedPanelFrame && (_focusedPanelFrame.blur(), _focusedPanelFrame._focusedElement && _focusedPanelFrame._focusedElement._setFocused(!1)), _lastFocusedPanelFrame = _focusedPanelFrame, _focusedPanelFrame = e, e && (e.focus(), e._focusedElement && e._focusedElement._setFocused(!0)))
}, FocusMgr._refocus = function () {
    if (_focusedPanelFrame) {
        let e = _focusedPanelFrame.parentElement;
        if (!e) return FocusMgr._setFocusPanelFrame(null), void 0;
        if (e._setFocused(!0), _focusedPanelFrame._focusedElement) {
            return _focusedPanelFrame._focusedElement._getFirstFocusableElement().focus(), void 0
        }
        _focusedPanelFrame.focus()
    }
}, FocusMgr._setFocusElement = function (e) {
    if (e && DockUtils.isPanel(e)) return e.focus(), void 0;
    let s = DomUtils.inPanel(e);
    if (e && !s && (FocusMgr._setFocusPanelFrame(null), _focusedElement !== e && (_focusedElement && _focusedElement._setFocused(!1), _lastFocusedElement = _focusedElement, _focusedElement = e, e && e._setFocused(!0))), s && DockUtils.isPanelFrame(s) && FocusMgr._setFocusPanelFrame(s), e || _focusedPanelFrame || _focusedElement && (_lastFocusedElement = _focusedElement, _focusedElement._setFocused(!1), _focusedElement = null), _focusedPanelFrame) {
        _focusedElement && (_lastFocusedElement = _focusedElement, _focusedElement._setFocused(!1), _focusedElement = null);
        let s = _focusedPanelFrame._focusedElement;
        s !== e && (s && s._setFocused(!1), _focusedPanelFrame._lastFocusedElement = s, _focusedPanelFrame._focusedElement = e, e ? e._setFocused(!0) : _focusedPanelFrame.focus())
    }
}, FocusMgr._getFirstFocusableFrom = function (e, s) {
    if (!s) {
        if (!DomUtils.isVisible(e)) return null;
        if (FocusMgr._isNavigable(e)) return e
    }
    let l = e,
        t = e;
    if (!t.children.length) return null;
    for (t = t.children[0];;) {
        if (!t) {
            if (t = l, t === e) return null;
            l = l.parentElement, t = t.nextElementSibling
        }
        if (t)
            if (DomUtils.isVisible(t)) {
                if (FocusMgr._isNavigable(t)) return t;
                t.children.length ? (l = t, t = t.children[0]) : t = t.nextElementSibling
            } else t = t.nextElementSibling
    }
}, FocusMgr._getLastFocusableFrom = function (e, s) {
    let l = null;
    if (!s) {
        if (!DomUtils.isVisible(e)) return null;
        FocusMgr._isNavigable(e) && (l = e)
    }
    let t = e,
        n = e;
    if (!n.children.length) return l;
    for (n = n.children[0];;) {
        if (!n) {
            if (n = t, n === e) return l;
            t = t.parentElement, n = n.nextElementSibling
        }
        n && (DomUtils.isVisible(n) ? (FocusMgr._isNavigable(n) && (l = n), n.children.length ? (t = n, n = n.children[0]) : n = n.nextElementSibling) : n = n.nextElementSibling)
    }
}, FocusMgr._getFocusableParent = function (e) {
    let s = e.parentNode;
    for (s.host && (s = s.host); s;) {
        if (s.focusable && !s.disabled) return s;
        (s = s.parentNode) && s.host && (s = s.host)
    }
    return null
}, FocusMgr._getNextFocusable = function (e) {
    let s = FocusMgr._getFirstFocusableFrom(e, !0);
    if (s) return s;
    let l = e.parentElement,
        t = e.nextElementSibling;
    for (;;) {
        if (!t) {
            if (t = l, null === t) return null;
            l = l.parentElement, t = t.nextElementSibling
        }
        if (t) {
            if (s = FocusMgr._getFirstFocusableFrom(t), s) return s;
            t = t.nextElementSibling
        }
    }
}, FocusMgr._getPrevFocusable = function (e) {
    let s, l = e.parentElement,
        t = e.previousElementSibling;
    for (;;) {
        if (!t) {
            if (t = l, null === t) return null;
            if (t.focusable && !t.disabled) return t;
            l = l.parentElement, t = t.previousElementSibling
        }
        if (t) {
            if (s = FocusMgr._getLastFocusableFrom(t), s) return s;
            t = t.previousElementSibling
        }
    }
}, Object.defineProperty(FocusMgr, "lastFocusedPanelFrame", {
    enumerable: !0,
    get: () => _lastFocusedPanelFrame
}), Object.defineProperty(FocusMgr, "focusedPanelFrame", {
    enumerable: !0,
    get: () => _focusedPanelFrame
}), Object.defineProperty(FocusMgr, "lastFocusedElement", {
    enumerable: !0,
    get: () => _focusedPanelFrame ? _focusedPanelFrame._lastFocusedElement : _lastFocusedElement
}), Object.defineProperty(FocusMgr, "focusedElement", {
    enumerable: !0,
    get: () => _focusedPanelFrame ? _focusedPanelFrame._focusedElement : _focusedElement
}), Object.defineProperty(FocusMgr, "disabled", {
    enumerable: !0,
    get: () => _disabled,
    set(e) {
        _disabled = e
    }
}), window.addEventListener("mousedown", e => {
    _disabled || 1 === e.which && (FocusMgr._setFocusElement(null), FocusMgr._setFocusPanelFrame(null))
}), window.addEventListener("focus", () => {
    _disabled || (FocusMgr._setFocusElement(_lastFocusedElement), FocusMgr._setFocusPanelFrame(_lastFocusedPanelFrame))
}), window.addEventListener("blur", () => {
    _disabled || (_lastFocusedElement = _focusedElement, _lastFocusedPanelFrame = _focusedPanelFrame, _focusedPanelFrame || FocusMgr._setFocusElement(null), FocusMgr._setFocusPanelFrame(null))
}), window.addEventListener("keydown", e => {
    if (!_disabled && 9 === e.keyCode) {
        if (e.ctrlKey || e.metaKey) return;
        if (_focusedPanelFrame && !DockUtils.isPanelFrame(_focusedPanelFrame)) return;
        DomUtils.acceptEvent(e);
        let s;
        s = e.shiftKey ? FocusMgr._focusPrev() : FocusMgr._focusNext(), FocusMgr.focusedElement && FocusMgr.focusedElement._navELs[0].focus(), s || Electron.shell.beep()
    }
}, !0), window.addEventListener("keydown", e => {
    if (!_disabled)
        if (38 === e.keyCode) {
            DomUtils.acceptEvent(e);
            FocusMgr._focusPrev() || Electron.shell.beep()
        } else if (40 === e.keyCode) {
        DomUtils.acceptEvent(e);
        FocusMgr._focusNext() || Electron.shell.beep()
    }
});