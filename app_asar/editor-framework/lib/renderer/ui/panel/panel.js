"use strict";
const JS = require("../../../share/js-utils"),
    DockUtils = require("../utils/dock-utils"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Dockable = require("../behaviors/dockable");
class DockPanel extends window.HTMLElement {
    static get tagName() {
        return "UI-DOCK-PANEL"
    }
    get focusable() {
        return !0
    }
    get focused() {
        return null !== this.getAttribute("focused")
    }
    get activeTab() {
        return this.$tabs.activeTab
    }
    get activeIndex() {
        return DomUtils.index(this.$tabs.activeTab)
    }
    get tabCount() {
        return this.$tabs.children.length
    }
    createdCallback() {
        let e = this.createShadowRoot();
        e.innerHTML = '\n      <ui-dock-tabs id="tabs"></ui-dock-tabs>\n      <div class="border">\n        <div class="frame-wrapper">\n          <content></content>\n        </div>\n      </div>\n    ', e.insertBefore(DomUtils.createStyleElement("theme://elements/panel.css"), e.firstChild), this.tabIndex = -1, this.$tabs = this.shadowRoot.querySelector("#tabs"), this._initDockable(), this._initTabs(), this.$tabs.addEventListener("tab-changed", this._onTabChanged.bind(this)), this.addEventListener("keydown", e => {
            if (e.shiftKey && e.metaKey && 221 === e.keyCode || e.ctrlKey && 9 === e.keyCode) {
                e.stopPropagation();
                let t = this.activeIndex + 1;
                return t >= this.tabCount && (t = 0), this.select(t), void 0
            }
            if (e.shiftKey && e.metaKey && 219 === e.keyCode || e.ctrlKey && e.shiftKey && 9 === e.keyCode) {
                e.stopPropagation();
                let t = this.activeIndex - 1;
                return t < 0 && (t = this.tabCount - 1), this.select(t), void 0
            }
        }, !0), this.addEventListener("mousedown", e => {
            1 === e.which && FocusMgr._setFocusPanelFrame(this.activeTab.frameEL)
        }, !0), this.addEventListener("mousedown", e => {
            e.stopPropagation(), 1 === e.which && FocusMgr._setFocusElement(null)
        })
    }
    _getFirstFocusableElement() {
        return this
    }
    _setFocused(e) {
        this.$tabs._setFocused(e), e ? this.setAttribute("focused", "") : this.removeAttribute("focused")
    }
    _onTabChanged(e) {
        e.stopPropagation();
        let t = e.detail;
        null !== t.oldTab && (t.oldTab.frameEL.style.display = "none", DomUtils.fire(t.oldTab.frameEL, "panel-hide")), null !== t.newTab && (t.newTab.frameEL.style.display = "", DomUtils.fire(t.newTab.frameEL, "panel-show")), DockUtils.saveLayout()
    }
    _initTabs() {
        let e = this.$tabs;
        e.panelEL = this;
        for (let t = 0; t < this.children.length; ++t) {
            let i = this.children[t],
                s = i.name,
                r = e.addTab(s);
            r.setAttribute("draggable", "true"), i.style.display = "none", r.frameEL = i, r.setIcon(i.icon)
        }
        e.select(0)
    }
    _collapseRecursively() {
        this._collapse()
    }
    _reflowRecursively() {}
    _updatePreferredSizeRecursively() {
        this._preferredWidth = this.clientWidth, this._preferredHeight = this.clientHeight
    }
    _finalizePreferredSizeRecursively() {
        this._calcPreferredSizeByFrames()
    }
    _finalizeMinMaxRecursively() {
        this._calcMinMaxByFrames()
    }
    _finalizeStyleRecursively() {
        this.style.minWidth = `${this._computedMinWidth}px`, this.style.minHeight = `${this._computedMinHeight}px`
    }
    _notifyResize() {
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            DomUtils.fire(t, "panel-resize")
        }
    }
    _calcPreferredSizeByFrames() {
        let e = DockUtils.tabbarSpace,
            t = DockUtils.panelSpace;
        if ("auto" === this._preferredWidth) {
            let e = !1;
            this._preferredWidth = 0;
            for (let i = 0; i < this.children.length; ++i) {
                let s = this.children[i];
                if (e || "auto" === s.width) e = !0, this._preferredWidth = "auto";
                else {
                    let e = s.width + t;
                    e > this._preferredWidth && (this._preferredWidth = e)
                }
            }
        }
        if ("auto" === this._preferredHeight) {
            let i = !1;
            this._preferredHeight = 0;
            for (let s = 0; s < this.children.length; ++s) {
                let r = this.children[s];
                if (i || "auto" === r.height) i = !0, this._preferredHeight = "auto";
                else {
                    let i = r.height + e + t;
                    i > this._preferredHeight && (this._preferredHeight = i)
                }
            }
        }
    }
    _calcMinMaxByFrames() {
        let e = DockUtils.tabbarSpace,
            t = DockUtils.panelSpace;
        this._computedMinWidth = 0, this._computedMinHeight = 0;
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            this._computedMinWidth < t.minWidth && (this._computedMinWidth = t.minWidth), this._computedMinHeight < t.minHeight && (this._computedMinHeight = t.minHeight)
        }
        this._computedMinWidth = this._computedMinWidth + t, this._computedMinHeight = this._computedMinHeight + e + t
    }
    _collapse() {
        return !(0 !== this.$tabs.children.length || !this.parentNode._dockable) && this.parentNode.removeDock(this)
    }
    outOfDate(e) {
        let t = this.$tabs;
        if ("number" == typeof e) t.outOfDate(e);
        else
            for (let i = 0; i < this.children.length; ++i)
                if (e === this.children[i]) {
                    t.outOfDate(i);
                    break
                }
    }
    select(e) {
        let t = this.$tabs;
        if ("number" == typeof e) t.select(e);
        else
            for (let i = 0; i < this.children.length; ++i)
                if (e === this.children[i]) {
                    t.select(i);
                    break
                }
    }
    insert(e, t, i) {
        let s = this.$tabs;
        return s.insertTab(e, i), e.setAttribute("draggable", "true"), e.parentNode !== s && (t.style.display = "none"), e.frameEL = t, e.setIcon(t.icon), i ? t !== i.frameEL && this.insertBefore(t, i.frameEL) : this.appendChild(t), this._calcMinMaxByFrames(), DomUtils.index(e)
    }
    add(e) {
        let t = this.$tabs,
            i = e.name,
            s = t.addTab(i);
        return s.setAttribute("draggable", "true"), e.style.display = "none", s.frameEL = e, s.setIcon(e.icon), this.appendChild(e), this._calcMinMaxByFrames(), this.children.length - 1
    }
    closeNoCollapse(e) {
        if (this.$tabs.removeTab(e), e.frameEL) {
            e.frameEL.parentNode.removeChild(e.frameEL), e.frameEL = null
        }
        this._calcMinMaxByFrames()
    }
    close(e) {
        this.closeNoCollapse(e), this._collapse()
    }
}
JS.addon(DockPanel.prototype, Dockable), module.exports = DockPanel;