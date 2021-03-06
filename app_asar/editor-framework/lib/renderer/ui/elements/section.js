"use strict";
const ElementUtils = require("./utils"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    ResMgr = require("../utils/resource-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable");
module.exports = ElementUtils.registerElement("ui-section", {
    get hovering() {
        return null !== this.getAttribute("hovering")
    },
    set hovering(e) {
        e ? this.setAttribute("hovering", "") : this.removeAttribute("hovering")
    },
    behaviors: [Focusable, Disable],
    template: '\n    <div class="wrapper">\n      <i class="fold icon-fold-up"></i>\n      <content select=".header"></content>\n    </div>\n    <content select=":not(.header)"></content>\n  ',
    style: ResMgr.getResource("theme://elements/section.css"),
    $: {
        wrapper: ".wrapper",
        foldIcon: ".fold"
    },
    factoryImpl(e) {
        let t = document.createElement("span");
        t.innerText = e, this.appendChild(t)
    },
    ready() {
        this._folded = null !== this.getAttribute("folded"), this._initFocusable(this.$wrapper), this._initDisable(!0), this._initEvents()
    },
    _initEvents() {
        this.$wrapper.addEventListener("mousedown", e => {
            e.stopPropagation(), FocusMgr._setFocusElement(this)
        }), this.$wrapper.addEventListener("click", () => {
            this._folded ? this.foldup() : this.fold()
        }), this.$wrapper.addEventListener("mouseover", e => {
            e.stopImmediatePropagation(), this.hovering = !0
        }), this.$wrapper.addEventListener("mouseout", e => {
            e.stopImmediatePropagation(), this.hovering = !1
        }), this.$wrapper.addEventListener("keydown", e => {
            37 === e.keyCode ? (DomUtils.acceptEvent(e), this.fold()) : 39 === e.keyCode && (DomUtils.acceptEvent(e), this.foldup())
        })
    },
    fold() {
        this._folded || (this._folded = !0, this.$foldIcon.classList.remove("icon-fold-up"), this.$foldIcon.classList.add("icon-fold"), this.setAttribute("folded", ""))
    },
    foldup() {
        this._folded && (this._folded = !1, this.$foldIcon.classList.remove("icon-fold"), this.$foldIcon.classList.add("icon-fold-up"), this.removeAttribute("folded"))
    }
});