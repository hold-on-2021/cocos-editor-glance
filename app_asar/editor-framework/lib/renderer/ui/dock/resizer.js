"use strict";

function _calcWidth(e, t) {
    return t < e._computedMinWidth ? e._computedMinWidth : void 0 !== e._computedMaxWidth && "auto" !== e._computedMaxWidth && t > e._computedMaxWidth ? e._computedMaxWidth : t
}

function _calcHeight(e, t) {
    return t < e._computedMinHeight ? e._computedMinHeight : void 0 !== e._computedMaxHeight && "auto" !== e._computedMaxHeight && t > e._computedMaxHeight ? e._computedMaxHeight : t
}

function _resize(e, t, i, r, s, o, l, n, c, h, a) {
    unused(n), unused(a);
    let d, u, m, p, v, g, _, f = Math.sign(i);
    f > 0 ? (g = s - 1, _ = s + 1) : (g = s + 1, _ = s - 1), p = i;
    let M = e[g],
        z = r[g];
    d = z + p * f, p = ((u = t ? _calcWidth(M, d) : _calcHeight(M, d)) - z) * f;
    let x = e[_],
        D = r[_];
    for (; d = D - p * f, m = t ? _calcWidth(x, d) : _calcHeight(x, d), v = (m - D) * f, x.style.flex = `0 0 ${m}px`, m - d != 0;) {
        if (p += v, f > 0) {
            if (_ += 2, _ >= e.length) break
        } else if (_ -= 2, _ < 0) break;
        x = e[_], D = r[_]
    }
    f > 0 ? c - i * f <= h && (u = z + (p = (c - h) * f) * f) : o - i * f <= l && (u = z + (p = (o - l) * f) * f), M.style.flex = `0 0 ${u}px`;
    for (let t = 0; t < e.length; ++t) {
        let i = e[t];
        DockUtils.isResizer(i) || i._notifyResize && i._notifyResize()
    }
}
const DomUtils = require("../utils/dom-utils"),
    DockUtils = require("../utils/dock-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Platform = require("../../../share/platform");
class DockResizer extends window.HTMLElement {
    static get tagName() {
        return "UI-DOCK-RESIZER"
    }
    createdCallback() {
        let e = this.createShadowRoot();
        e.innerHTML = '\n      <div class="bar"></div>\n    ', e.insertBefore(DomUtils.createStyleElement("theme://elements/resizer.css"), e.firstChild), Platform.isWin32 && this.classList.add("platform-win"), this.addEventListener("mousedown", this._onMouseDown.bind(this))
    }
    get vertical() {
        return null !== this.getAttribute("vertical")
    }
    set vertical(e) {
        e ? this.setAttribute("vertical", "") : this.removeAttribute("vertical")
    }
    get active() {
        return null !== this.getAttribute("active")
    }
    set active(e) {
        e ? this.setAttribute("active", "") : this.removeAttribute("active")
    }
    _snapshot() {
        let e = this.parentNode,
            t = [],
            i = -1;
        for (let r = 0; r < e.children.length; ++r) {
            let s = e.children[r];
            s === this && (i = r), t.push(this.vertical ? s.offsetWidth : s.offsetHeight)
        }
        let r = 0,
            s = 0,
            o = 0,
            l = 0,
            n = 0,
            c = 0;
        for (let l = 0; l < i; l += 2) r += t[l], s += this.vertical ? e.children[l]._computedMinWidth : e.children[l]._computedMinHeight, o += this.vertical ? e.children[l]._computedMaxWidth : e.children[l]._computedMaxHeight;
        for (let r = i + 1; r < e.children.length; r += 2) l += t[r], n += this.vertical ? e.children[r]._computedMinWidth : e.children[r]._computedMinHeight, c += this.vertical ? e.children[r]._computedMaxWidth : e.children[r]._computedMaxHeight;
        return {
            sizeList: t,
            resizerIndex: i,
            prevTotalSize: r,
            prevMinSize: s,
            prevMaxSize: o,
            nextTotalSize: l,
            nextMinSize: n,
            nextMaxSize: c
        }
    }
    _onMouseDown(e) {
        e.stopPropagation();
        let t = this.parentNode;
        this.active = !0;
        let i = this._snapshot(),
            r = 0,
            s = this.getBoundingClientRect(),
            o = Math.round(s.left + s.width / 2),
            l = Math.round(s.top + s.height / 2);
        for (let e = 0; e < t.children.length; ++e) {
            let r = t.children[e];
            DockUtils.isResizer(r) || (r.style.flex = `0 0 ${i.sizeList[e]}px`)
        }
        let n = e => {
                e.stopPropagation();
                let s;
                if (s = this.vertical ? e.clientX - o : e.clientY - l, 0 !== s) {
                    let n, c = this.getBoundingClientRect(),
                        h = Math.round(c.left + c.width / 2),
                        a = Math.round(c.top + c.height / 2);
                    n = this.vertical ? e.clientX - h : e.clientY - a;
                    let d = Math.sign(n);
                    0 !== r && r !== d && (i = this._snapshot(), o = h, l = a, s = n), r = d, _resize(t.children, this.vertical, s, i.sizeList, i.resizerIndex, i.prevTotalSize, i.prevMinSize, i.prevMaxSize, i.nextTotalSize, i.nextMinSize, i.nextMaxSize)
                }
            },
            c = e => {
                e.stopPropagation(), document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", c), DomUtils.removeDragGhost(), this.active = !1;
                let t = this.parentNode;
                t._reflowRecursively && t._reflowRecursively(), t._updatePreferredSizeRecursively && t._updatePreferredSizeRecursively();
                for (let e = 0; e < t.children.length; ++e) {
                    let i = t.children[e];
                    DockUtils.isResizer(i) || i._notifyResize && i._notifyResize()
                }
                DockUtils.saveLayout(), FocusMgr._refocus()
            };
        Platform.isWin32 ? DomUtils.addDragGhost(this.vertical ? "ew-resize" : "ns-resize") : DomUtils.addDragGhost(this.vertical ? "col-resize" : "row-resize"), document.addEventListener("mousemove", n), document.addEventListener("mouseup", c)
    }
}
module.exports = DockResizer;