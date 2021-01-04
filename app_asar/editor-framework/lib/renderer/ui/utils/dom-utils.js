"use strict";

function _hasLeftMouseButton(t) {
    var e = t.type;
    if (-1 === _mouseEvents.indexOf(e)) return !1;
    if ("mousemove" === e) {
        var n = void 0 === t.buttons ? 1 : t.buttons;
        return t instanceof window.MouseEvent && !_mouseHasButtons && (n = _which2buttons[t.which] || 0), Boolean(1 & n)
    }
    return 0 === (void 0 === t.button ? 0 : t.button)
}
let DomUtils = {};
module.exports = DomUtils;
const _ = require("lodash"),
    Console = require("../../console"),
    ResMgr = require("./resource-mgr"),
    DockUtils = require("./dock-utils");
let _cancelDrag = null,
    _dragGhost = null,
    _hitGhost = null,
    _hitGhostMousedownHandle = null,
    _loadingMask = null,
    _loadingMaskMousedownHandle = null,
    _mouseEvents = ["mousedown", "mousemove", "mouseup", "click"],
    _which2buttons = [0, 1, 4, 2],
    _mouseHasButtons = function () {
        try {
            return 1 === new MouseEvent("test", {
                buttons: 1
            }).buttons
        } catch (t) {
            return !1
        }
    }();
DomUtils.createStyleElement = function (t) {
    let e = ResMgr.getResource(t) || "";
    if (!e) return Console.error(`${t} not preloaded`), null;
    let n = document.createElement("style");
    return n.type = "text/css", n.textContent = e, n
}, DomUtils.clear = function (t) {
    for (; t.firstChild;) t.removeChild(t.firstChild)
}, DomUtils.index = function (t) {
    let e = t.parentNode;
    for (let n = 0, o = e.children.length; n < o; ++n)
        if (e.children[n] === t) return n;
    return -1
}, DomUtils.parentElement = function (t) {
    let e = t.parentElement;
    if (!e && (e = t.parentNode, e && e.host)) return e.host
}, DomUtils.offsetTo = function (t, e) {
    let n = 0,
        o = 0;
    for (; t && t !== e;) n += t.offsetLeft - t.scrollLeft, o += t.offsetTop - t.scrollTop, t = t.offsetParent;
    return e && t !== e ? (Console.warn("The parentEL is not the element's offsetParent"), {
        x: 0,
        y: 0
    }) : {
        x: n,
        y: o
    }
}, DomUtils.walk = function (t, e, n) {
    let o = e;
    if ("function" == typeof e && (n = e, o = {}), !o.excludeSelf) {
        if (n(t)) return
    }
    if (!t.children.length) return;
    let s = t,
        i = t.children[0];
    for (;;) {
        if (!i) {
            if (i = s, i === t) return;
            s = s.parentElement, i = i.nextElementSibling
        }
        if (i) {
            if (n(i)) {
                i = i.nextElementSibling;
                continue
            }
            i.children.length ? (s = i, i = i.children[0]) : i = i.nextElementSibling
        }
    }
}, DomUtils.fire = function (t, e, n) {
    n = n || {}, t.dispatchEvent(new window.CustomEvent(e, n))
}, DomUtils.acceptEvent = function (t) {
    t.preventDefault(), t.stopImmediatePropagation()
}, DomUtils.installDownUpEvent = function (t) {
    function e(t, e) {
        document.removeEventListener("mousemove", t), document.removeEventListener("mouseup", e)
    }
    t.addEventListener("mousedown", function (n) {
        if (DomUtils.acceptEvent(n), !_hasLeftMouseButton(n)) return;
        let o = function n(o) {
                _hasLeftMouseButton(o) || (DomUtils.fire(t, "up", {
                    sourceEvent: o,
                    bubbles: !0
                }), e(n, s))
            },
            s = function n(s) {
                _hasLeftMouseButton(s) && (DomUtils.fire(t, "up", {
                    sourceEvent: s,
                    bubbles: !0
                }), e(o, n))
            };
        (function (t, e) {
            document.addEventListener("mousemove", t), document.addEventListener("mouseup", e)
        })(o, s), DomUtils.fire(t, "down", {
            sourceEvent: n,
            bubbles: !0
        })
    })
}, DomUtils.inDocument = function (t) {
    for (;;) {
        if (!t) return !1;
        if (t === document) return !0;
        (t = t.parentNode) && t.host && (t = t.host)
    }
}, DomUtils.inPanel = function (t) {
    for (;;) {
        if (!t) return null;
        if (DockUtils.isPanelFrame(t)) return t;
        if (DockUtils.isPanel(t)) return t;
        (t = t.parentNode) && t.host && (t = t.host)
    }
}, DomUtils.isVisible = function (t) {
    let e = window.getComputedStyle(t);
    return "none" !== e.display && "hidden" !== e.visibility && 0 !== e.opacity
}, DomUtils.isVisibleInHierarchy = function (t) {
    if (!1 === DomUtils.inDocument(t)) return !1;
    for (;;) {
        if (t === document) return !0;
        if (!1 === DomUtils.isVisible(t)) return !1;
        (t = t.parentNode) && t.host && (t = t.host)
    }
}, DomUtils.startDrag = function (t, e, n, o, s) {
    DomUtils.addDragGhost(t), e.stopPropagation();
    let i = e.button,
        l = e.clientX,
        r = e.clientX,
        u = e.clientY,
        a = e.clientY,
        d = 0,
        c = 0,
        m = 0,
        h = 0,
        f = function (t) {
            t.stopPropagation(), d = t.clientX - r, m = t.clientY - a, c = t.clientX - l, h = t.clientY - u, r = t.clientX, a = t.clientY, n && n(t, d, m, c, h)
        },
        g = function (t) {
            t.stopPropagation(), t.button === i && (document.removeEventListener("mousemove", f), document.removeEventListener("mouseup", g), document.removeEventListener("mousewheel", _), DomUtils.removeDragGhost(), d = t.clientX - r, m = t.clientY - a, c = t.clientX - l, h = t.clientY - u, _cancelDrag = null, o && o(t, d, m, c, h))
        },
        _ = function (t) {
            s && s(t)
        };
    _cancelDrag = function () {
        document.removeEventListener("mousemove", f), document.removeEventListener("mouseup", g), document.removeEventListener("mousewheel", _), DomUtils.removeDragGhost()
    }, document.addEventListener("mousemove", f), document.addEventListener("mouseup", g), document.addEventListener("mousewheel", _)
}, DomUtils.cancelDrag = function () {
    _cancelDrag && _cancelDrag()
}, DomUtils.addDragGhost = function (t) {
    return null === _dragGhost && ((_dragGhost = document.createElement("div")).classList.add("drag-ghost"), _dragGhost.style.position = "absolute", _dragGhost.style.zIndex = "999", _dragGhost.style.top = "0", _dragGhost.style.right = "0", _dragGhost.style.bottom = "0", _dragGhost.style.left = "0", _dragGhost.oncontextmenu = function () {
        return !1
    }), _dragGhost.style.cursor = t, document.body.appendChild(_dragGhost), _dragGhost
}, DomUtils.removeDragGhost = function () {
    null !== _dragGhost && (_dragGhost.style.cursor = "auto", null !== _dragGhost.parentElement && _dragGhost.parentElement.removeChild(_dragGhost))
}, DomUtils.addHitGhost = function (t, e, n) {
    return null === _hitGhost && ((_hitGhost = document.createElement("div")).classList.add("hit-ghost"), _hitGhost.style.position = "absolute", _hitGhost.style.zIndex = e, _hitGhost.style.top = "0", _hitGhost.style.right = "0", _hitGhost.style.bottom = "0", _hitGhost.style.left = "0", _hitGhost.oncontextmenu = function () {
        return !1
    }), _hitGhost.style.cursor = t, _hitGhostMousedownHandle = function (t) {
        t.preventDefault(), t.stopPropagation(), n && n()
    }, _hitGhost.addEventListener("mousedown", _hitGhostMousedownHandle), document.body.appendChild(_hitGhost), _hitGhost
}, DomUtils.removeHitGhost = function () {
    null !== _hitGhost && (_hitGhost.style.cursor = "auto", null !== _hitGhost.parentElement && (_hitGhost.parentElement.removeChild(_hitGhost), _hitGhost.removeEventListener("mousedown", _hitGhostMousedownHandle), _hitGhostMousedownHandle = null))
}, DomUtils.addLoadingMask = function (t, e) {
    null === _loadingMask && ((_loadingMask = document.createElement("div")).classList.add("loading-mask"), _loadingMask.style.position = "absolute", _loadingMask.style.top = "0", _loadingMask.style.right = "0", _loadingMask.style.bottom = "0", _loadingMask.style.left = "0", _loadingMask.oncontextmenu = function () {
        return !1
    }), t && "string" == typeof t.zindex ? _loadingMask.style.zIndex = t.zindex : _loadingMask.style.zIndex = "1999", t && "string" == typeof t.background ? _loadingMask.style.backgroundColor = t.background : _loadingMask.style.backgroundColor = "rgba(0,0,0,0.2)", t && "string" == typeof t.cursor ? _loadingMask.style.cursor = t.cursor : _loadingMask.style.cursor = "default";
    return _loadingMask.addEventListener("mousedown", function (t) {
        t.preventDefault(), t.stopPropagation(), e && e()
    }), document.body.appendChild(_loadingMask), _loadingMask
}, DomUtils.removeLoadingMask = function () {
    null !== _loadingMask && (_loadingMask.style.cursor = "auto", null !== _loadingMask.parentElement && (_loadingMask.parentElement.removeChild(_loadingMask), _loadingMask.removeEventListener("mousedown", _loadingMaskMousedownHandle), _loadingMaskMousedownHandle = null))
}, DomUtils.toHumanText = function (t) {
    let e = t.replace(/[-_]([a-z])/g, function (t) {
        return t[1].toUpperCase()
    });
    return e = e.replace(/([a-z][A-Z])/g, function (t) {
        return t[0] + " " + t[1]
    }), " " === e.charAt(0) && e.slice(1), e.charAt(0).toUpperCase() + e.slice(1)
}, DomUtils.camelCase = function (t) {
    return _.camelCase(t)
}, DomUtils.kebabCase = function (t) {
    return _.kebabCase(t)
}, DomUtils._focusParent = function (t) {
    let e = t.parentElement;
    for (; e;) {
        if (null !== e.tabIndex && void 0 !== e.tabIndex && -1 !== e.tabIndex) return e.focus(), void 0;
        e = e.parentElement
    }
}, DomUtils._getFirstFocusableChild = function (t) {
    if (null !== t.tabIndex && void 0 !== t.tabIndex && -1 !== t.tabIndex) return t;
    for (let e = 0; e < t.children.length; ++e) {
        let n = DomUtils._getFirstFocusableChild(t.children[e]);
        if (null !== n) return n
    }
    return null
};