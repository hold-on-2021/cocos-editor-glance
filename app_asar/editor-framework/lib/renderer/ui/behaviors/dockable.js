"use strict";
const Console = require("../../console"),
    DockUtils = require("../utils/dock-utils");
let Dockable = {
    _dockable: !0,
    get noCollapse() {
        return null !== this.getAttribute("no-collapse")
    },
    set noCollapse(e) {
        e ? this.setAttribute("no-collapse", "") : this.removeAttribute("no-collapse")
    },
    _initDockable() {
        this._preferredWidth = "auto", this._preferredHeight = "auto", this._computedMinWidth = 0, this._computedMinHeight = 0, this.style.minWidth = "auto", this.style.minHeight = "auto", this.style.maxWidth = "auto", this.style.maxHeight = "auto", this.addEventListener("dragover", e => {
            e.preventDefault(), DockUtils.dragoverDock(this)
        })
    },
    _notifyResize() {
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            t._dockable && t._notifyResize()
        }
    },
    _collapse() {
        if (this.noCollapse) return !1;
        let e = this.parentNode;
        if (0 === this.children.length) return e._dockable ? e.removeDock(this) : e.removeChild(this), !0;
        if (1 === this.children.length) {
            let t = this.children[0];
            return t.style.flex = this.style.flex, t._preferredWidth = this._preferredWidth, t._preferredHeight = this._preferredHeight, e.insertBefore(t, this), e.removeChild(this), t._dockable && t._collapse(), !0
        }
        if (e._dockable && e.row === this.row) {
            for (; this.children.length > 0;) e.insertBefore(this.children[0], this);
            return e.removeChild(this), !0
        }
        return !1
    },
    _makeRoomForNewComer(e, t) {
        if ("left" === e || "right" === e) {
            let e = this._preferredWidth - t._preferredWidth - DockUtils.resizerSpace;
            e > 0 ? this._preferredWidth = e : (e = Math.floor(.5 * (this._preferredWidth - DockUtils.resizerSpace)), this._preferredWidth = e, t._preferredWidth = e)
        } else {
            let e = this._preferredHeight - t._preferredHeight - DockUtils.resizerSpace;
            e > 0 ? this._preferredHeight = e : (e = Math.floor(.5 * (this._preferredHeight - DockUtils.resizerSpace)), this._preferredHeight = e, t._preferredHeight = e)
        }
    },
    addDock(e, t, i) {
        if (!1 === t._dockable) return Console.warn(`Dock element at position ${e} must be dockable`), void 0;
        let r, h, l, s = !1,
            o = this.parentNode;
        if (o._dockable) "left" === e || "right" === e ? o.row || (s = !0) : o.row && (s = !0), s ? ((r = document.createElement("ui-dock")).row = "left" === e || "right" === e, o.insertBefore(r, this), "left" === e || "top" === e ? (r.appendChild(t), r.appendChild(this)) : (r.appendChild(this), r.appendChild(t)), r._initResizers(), r._finalizePreferredSize(), r.style.flex = this.style.flex, r._preferredWidth = this._preferredWidth, r._preferredHeight = this._preferredHeight, this._makeRoomForNewComer(e, t)) : (h = null, (h = document.createElement("ui-dock-resizer")).vertical = o.row, "left" === e || "top" === e ? (o.insertBefore(t, this), o.insertBefore(h, this)) : null === (l = this.nextElementSibling) ? (o.appendChild(h), o.appendChild(t)) : (o.insertBefore(h, l), o.insertBefore(t, l)), i || this._makeRoomForNewComer(e, t));
        else if ("left" === e || "right" === e ? this.row || (s = !0) : this.row && (s = !0), s) {
            for ((r = document.createElement("ui-dock")).row = this.row, this.row = "left" === e || "right" === e; this.children.length > 0;) {
                let e = this.children[0];
                r.appendChild(e)
            }
            "left" === e || "top" === e ? (this.appendChild(t), this.appendChild(r)) : (this.appendChild(r), this.appendChild(t)), this._initResizers(), r._finalizePreferredSize(), r.style.flex = this.style.flex, r._preferredWidth = this._preferredWidth, r._preferredHeight = this._preferredHeight, this._makeRoomForNewComer(e, t)
        } else h = null, (h = document.createElement("ui-dock-resizer")).vertical = this.row, "left" === e || "top" === e ? (this.insertBefore(t, this.firstElementChild), this.insertBefore(h, this.firstElementChild)) : null === (l = this.nextElementSibling) ? (this.appendChild(h), this.appendChild(t)) : (this.insertBefore(h, l), this.insertBefore(t, l)), i || this._makeRoomForNewComer(e, t)
    },
    removeDock(e) {
        let t = !1;
        for (let i = 0; i < this.children.length; ++i)
            if (this.children[i] === e) {
                t = !0;
                break
            } return !!t && (this.children[0] === e ? e.nextElementSibling && DockUtils.isResizer(e.nextElementSibling) && this.removeChild(e.nextElementSibling) : e.previousElementSibling && DockUtils.isResizer(e.previousElementSibling) && this.removeChild(e.previousElementSibling), this.removeChild(e), this._collapse())
    }
};
module.exports = Dockable;