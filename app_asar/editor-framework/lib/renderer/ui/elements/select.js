"use strict";
const ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly");
module.exports = ElementUtils.registerElement("ui-select", {
    get value() {
        return this._value
    },
    set value(e) {
        var t = this._value;
        this._value = e, this.valueChanged && this.valueChanged(t, e), this.multiValues || (this.$select.value = e)
    },
    get values() {
        return this._values
    },
    set values(e) {
        var t = this._values;
        this._values = e, this.valuesChanged && this.valuesChanged(t, val), this.multiValues && (this.$select.value = "")
    },
    get selectedIndex() {
        return this.$select.selectedIndex
    },
    set selectedIndex(e) {
        this.$select.selectedIndex = e
    },
    get selectedText() {
        return this.$select.item(this.$select.selectedIndex).text
    },
    get multiValues() {
        return this._multiValues
    },
    set multiValues(e) {
        (e = !(null == e || !1 === e)) !== this._multiValues && (e ? (this.$select.value = "", this.setAttribute("multi-values", "")) : (this.$select.value = this._value, this.removeAttribute("multi-values")), this._multiValues = e)
    },
    attributeChangedCallback(e, t, s) {
        if ("selectedIndex" == e || "selectedText" == e || "multi-values" == e) {
            this[e.replace(/\-(\w)/g, function (e, t) {
                return t.toUpperCase()
            })] = s
        }
    },
    behaviors: [Focusable, Disable, Readonly],
    template: "\n    <select></select>\n  ",
    style: ResMgr.getResource("theme://elements/select.css"),
    $: {
        select: "select"
    },
    factoryImpl(e) {
        isNaN(e) || (this.value = e)
    },
    ready() {
        this._observer = new MutationObserver(e => {
            unused(e), this._updateItems()
        }), this._observer.observe(this, {
            childList: !0
        });
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            if (t instanceof HTMLOptionElement || t instanceof HTMLOptGroupElement) {
                let e = t.cloneNode(!0);
                this.$select.add(e, null)
            }
        }
        let e = this.getAttribute("value");
        null !== e ? (this._value = e, this.$select.value = e) : this._value = this.$select.value, this.multiValues = this.getAttribute("multi-values"), this._initFocusable(this.$select), this._initDisable(!1), this._initReadonly(!1), this.addEventListener("mousedown", this._mouseDownHandler), this.$select.addEventListener("keydown", e => this.disabled ? (e.preventDefault(), void 0) : this.readonly ? (e.preventDefault(), void 0) : (38 !== e.keyCode && 40 !== e.keyCode || e.preventDefault(), 32 === e.keyCode || e.ctrlKey || e.metaKey || e.preventDefault(), void 0)), this.$select.addEventListener("change", e => {
            DomUtils.acceptEvent(e), this._value = this.$select.value, this.multiValues = !1, DomUtils.fire(this, "change", {
                bubbles: !1,
                detail: {
                    index: this.selectedIndex,
                    value: this.value,
                    text: this.selectedText
                }
            }), DomUtils.fire(this, "confirm", {
                bubbles: !1,
                detail: {
                    index: this.selectedIndex,
                    value: this.value,
                    text: this.selectedText
                }
            })
        })
    },
    _mouseDownHandler(e) {
        if (e.stopPropagation(), this._mouseStartX = e.clientX, this._inputFocused || (this._selectAllWhenMouseUp = !0), FocusMgr._setFocusElement(this), this.readonly) return DomUtils.acceptEvent(e), void 0
    },
    _updateItems() {
        DomUtils.clear(this.$select);
        for (let e = 0; e < this.children.length; ++e) {
            let t = this.children[e];
            if (t instanceof HTMLOptionElement || t instanceof HTMLOptGroupElement) {
                let e = t.cloneNode(!0);
                this.$select.add(e, null)
            }
        }
        this.$select.value = this._value
    },
    addItem(e, t, s) {
        let l = document.createElement("option");
        l.value = e, l.text = t, this.addElement(l, s), this._value = this.$select.value
    },
    addElement(e, t) {
        if (!(e instanceof HTMLOptionElement || e instanceof HTMLOptGroupElement)) return;
        this._observer.disconnect(), void 0 !== t ? this.insertBefore(e, this.children[t]) : this.appendChild(e);
        let s;
        s = void 0 !== t ? this.$select.item(t) : null, this.$select.add(e.cloneNode(!0), s), this._observer.observe(this, {
            childList: !0
        })
    },
    removeItem(e) {
        this.$select.remove(e)
    },
    clear() {
        DomUtils.clear(this.$select), this._value = null, this.$select.value = null
    }
});