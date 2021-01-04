"use strict";
const ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly"),
    ButtonState = require("../behaviors/button-state");
module.exports = ElementUtils.registerElement("ui-checkbox", {
    get checked() {
        return null !== this.getAttribute("checked")
    },
    set checked(e) {
        e || "" === e || 0 === e ? this.setAttribute("checked", "") : this.removeAttribute("checked")
    },
    get value() {
        return this.checked
    },
    set value(e) {
        this.checked = e
    },
    get values() {
        return this._values
    },
    set values(e) {
        this._values = e
    },
    get multiValues() {
        return this._multiValues
    },
    set multiValues(e) {
        (e = !(null == e || !1 === e)) !== this._multiValues && (this._multiValues = e, e ? this.setAttribute("multi-values", "") : this.removeAttribute("multi-values"))
    },
    attributeChangedCallback(e, t, i) {
        if ("checked" == e || "multi-values" == e) {
            this[e.replace(/\-(\w)/g, function (e, t) {
                return t.toUpperCase()
            })] = i
        }
    },
    behaviors: [Focusable, Disable, Readonly, ButtonState],
    template: '\n    <div class="box">\n      <i class="checker icon-ok"></i>\n    </div>\n    <span class="label">\n      <content></content>\n    </span>\n  ',
    style: ResMgr.getResource("theme://elements/checkbox.css"),
    factoryImpl(e, t) {
        t && (this.innerText = t), this.checked = e
    },
    ready() {
        this.multiValues = this.getAttribute("multi-values"), this._initFocusable(this), this._initDisable(!1), this._initReadonly(!1), this._initButtonState(this)
    },
    _onButtonClick() {
        this.readonly || (this.checked = !this.checked, this.multiValues = !1, DomUtils.fire(this, "change", {
            bubbles: !1,
            detail: {
                value: this.checked
            }
        }), DomUtils.fire(this, "confirm", {
            bubbles: !1,
            detail: {
                value: this.checked
            }
        }))
    }
});