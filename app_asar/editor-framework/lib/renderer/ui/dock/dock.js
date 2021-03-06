"use strict";
const JS = require("../../../share/js-utils"),
    DockUtils = require("../utils/dock-utils"),
    DomUtils = require("../utils/dom-utils"),
    Dockable = require("../behaviors/dockable");
class Dock extends window.HTMLElement {
    static get tagName() {
        return "UI-DOCK"
    }
    get row() {
        return null !== this.getAttribute("row")
    }
    set row(e) {
        e ? this.setAttribute("row", "") : this.removeAttribute("row")
    }
    createdCallback() {
        let e = this.createShadowRoot();
        e.innerHTML = '\n      <div class="content">\n        <content select="ui-dock,ui-dock-panel,ui-dock-resizer"></content>\n      </div>\n    ', e.insertBefore(DomUtils.createStyleElement("theme://elements/dock.css"), e.firstChild), this._initDockable(), this._initResizers()
    }
    _initResizers() {
        if (this.children.length > 1)
            for (let e = 0; e < this.children.length; ++e)
                if (e !== this.children.length - 1) {
                    let t = this.children[e + 1],
                        i = document.createElement("ui-dock-resizer");
                    i.vertical = this.row, this.insertBefore(i, t), e += 1
                }
    }
    _collapseRecursively() {
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            t._dockable && t._collapseRecursively()
        }
        this._collapse()
    }
    _reflowRecursively() {
        this._reflow();
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            t._dockable && t._reflowRecursively()
        }
    }
    _updatePreferredSizeRecursively() {
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            t._dockable && t._updatePreferredSizeRecursively()
        }
        this._preferredWidth = this.clientWidth, this._preferredHeight = this.clientHeight
    }
    _finalizePreferredSizeRecursively() {
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            t._dockable && t._finalizePreferredSizeRecursively()
        }
        this._finalizePreferredSize()
    }
    _finalizeMinMaxRecursively() {
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            t._dockable && t._finalizeMinMaxRecursively()
        }
        this._finalizeMinMax()
    }
    _finalizeStyleRecursively() {
        this._finalizeStyle();
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            t._dockable && t._finalizeStyleRecursively()
        }
    }
    _finalizePreferredSize() {
        let e = DockUtils.resizerSpace,
            t = [];
        for (let e = 0; e < this.children.length; ++e) {
            let i = this.children[e];
            i._dockable && t.push(i)
        }
        if ("auto" === this._preferredWidth) {
            let i = !1;
            if (this.row) {
                this._preferredWidth = t.length > 0 ? e * (t.length - 1) : 0;
                for (let e = 0; e < t.length; ++e) {
                    let r = t[e];
                    i || "auto" === r._preferredWidth ? (i = !0, this._preferredWidth = "auto") : this._preferredWidth += r._preferredWidth
                }
            } else {
                this._preferredWidth = 0;
                for (let e = 0; e < t.length; ++e) {
                    let r = t[e];
                    i || "auto" === r._preferredWidth ? (i = !0, this._preferredWidth = "auto") : r._preferredWidth > this._preferredWidth && (this._preferredWidth = r._preferredWidth)
                }
            }
        }
        if ("auto" === this._preferredHeight) {
            let i = !1;
            if (this.row) {
                this._preferredHeight = 0;
                for (let e = 0; e < t.length; ++e) {
                    let r = t[e];
                    i || "auto" === r._preferredHeight ? (i = !0, this._preferredHeight = "auto") : r._preferredHeight > this._preferredHeight && (this._preferredHeight = r._preferredHeight)
                }
            } else {
                this._preferredHeight = t.length > 0 ? e * (t.length - 1) : 0;
                for (let e = 0; e < t.length; ++e) {
                    let r = t[e];
                    i || "auto" === r._preferredHeight ? (i = !0, this._preferredHeight = "auto") : this._preferredHeight += r._preferredHeight
                }
            }
        }
    }
    _finalizeMinMax() {
        let e = DockUtils.resizerSpace,
            t = [];
        for (let e = 0; e < this.children.length; ++e) {
            let i = this.children[e];
            i._dockable && t.push(i)
        }
        if (this.row) {
            this._computedMinWidth = t.length > 0 ? e * (t.length - 1) : 0, this._computedMinHeight = 0;
            for (let e = 0; e < t.length; ++e) {
                let i = t[e];
                this._computedMinWidth += i._computedMinWidth, this._computedMinHeight < i._computedMinHeight && (this._computedMinHeight = i._computedMinHeight)
            }
        } else {
            this._computedMinWidth = 0, this._computedMinHeight = t.length > 0 ? e * (t.length - 1) : 0;
            for (let e = 0; e < t.length; ++e) {
                let i = t[e];
                this._computedMinWidth < i._computedMinWidth && (this._computedMinWidth = i._computedMinWidth), this._computedMinHeight += i._computedMinHeight
            }
        }
    }
    _finalizeStyle() {
        if (this.style.minWidth = `${this._computedMinWidth}px`, this.style.minHeight = `${this._computedMinHeight}px`, 1 === this.children.length) {
            this.children[0].style.flex = "1 1 auto"
        } else
            for (let e = 0; e < this.children.length; ++e) {
                let t = this.children[e];
                if (t._dockable) {
                    let e = this.row ? t._preferredWidth : t._preferredHeight;
                    t.style.flex = "auto" === e ? "1 1 auto" : `0 0 ${e}px`
                }
            }
    }
    _reflow() {
        let e = this.children.length,
            t = new Array(e),
            i = 0;
        for (let r = 0; r < e; ++r) {
            let e = this.children[r],
                h = this.row ? e.offsetWidth : e.offsetHeight;
            t[r] = h, e._dockable && (i += h)
        }
        for (let e = 0; e < this.children.length; ++e) {
            let r = this.children[e];
            if (r._dockable) {
                let h = t[e] / i;
                r.style.flex = `${h} ${h} 0px`
            }
        }
    }
}
JS.addon(Dock.prototype, Dockable), module.exports = Dock;