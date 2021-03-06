"use strict";
const ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly"),
    InputState = require("../behaviors/input-state");
module.exports = ElementUtils.registerElement("ui-input", {
    get value() {
        return this.$input.value
    },
    set value(t) {
        null !== t && void 0 !== t || (t = ""), t += "", this._value = t, this.multiValues || (null !== this._maxLength ? this.$input.value = t.substr(0, this._maxLength) : this.$input.value = t)
    },
    get values() {
        return this._values
    },
    set values(t) {
        this._values = t, this.multiValues && (this.$input.value = "-")
    },
    get placeholder() {
        return this.$input.placeholder
    },
    set placeholder(t) {
        this.$input.placeholder = t
    },
    get password() {
        return "password" === this.$input.type
    },
    set password(t) {
        this.$input.type = !0 === t ? "password" : ""
    },
    get maxLength() {
        return this._maxLength
    },
    set maxLength(t) {
        null !== t && (t -= 0), isNaN(t) && (t = null), this._maxLength = t, t && (this.$input.value = this._value.substr(0, this._maxLength))
    },
    get multiValues() {
        return this._multiValues
    },
    set multiValues(t) {
        (t = !(null == t || !1 === t)) !== this._multiValues && (this._multiValues = t, t ? (this.$input.value = "-", this.setAttribute("multi-values", "")) : (this.$input.value = this._value, this.removeAttribute("multi-values")))
    },
    attributeChangedCallback(t, e, i) {
        if ("placeholder" === t || "password" === t || "multi-values" === t) {
            this[t.replace(/\-(\w)/g, function (t, e) {
                return e.toUpperCase()
            })] = i
        }
    },
    behaviors: [Focusable, Disable, Readonly, InputState],
    template: "\n    <input></input>\n  ",
    style: ResMgr.getResource("theme://elements/input.css"),
    $: {
        input: "input"
    },
    factoryImpl(t) {
        t && (this.value = t)
    },
    ready() {
        this._value = "", this._values = [""], this.$input.value = this.getAttribute("value"), this.$input.placeholder = this.getAttribute("placeholder") || "", this.$input.type = null !== this.getAttribute("password") ? "password" : "", this.maxLength = this.getAttribute("max-length"), this.multiValues = this.getAttribute("multi-values"), this._initFocusable(this, this.$input), this._initDisable(!1), this._initReadonly(!1), this._initInputState(this.$input), this.$input.readOnly = this.readonly, this._initEvents()
    },
    clear() {
        this.$input.value = "", this.confirm()
    },
    confirm() {
        this._onInputConfirm(this.$input)
    },
    cancel() {
        this._onInputCancel(this.$input)
    },
    _setIsReadonlyAttribute(t) {
        t ? this.setAttribute("is-readonly", "") : this.removeAttribute("is-readonly"), this.$input.readOnly = t
    },
    _initEvents() {
        this.addEventListener("mousedown", this._mouseDownHandler), this.addEventListener("keydown", this._keyDownHandler), this.addEventListener("focus-changed", this._focusChangedHandler)
    },
    _onInputConfirm(t, e) {
        this.readonly || this._changed && (this._changed = !1, t._initValue = t.value, this._value = t.value, this.multiValues = !1, DomUtils.fire(this, "confirm", {
            bubbles: !1,
            detail: {
                value: t.value,
                confirmByEnter: e
            }
        })), e && this.focus()
    },
    _onInputCancel(t, e) {
        this.readonly || this._changed && (this._changed = !1, t._initValue !== t.value && (t.value = t._initValue, this._value = t._initValue, DomUtils.fire(this, "change", {
            bubbles: !1,
            detail: {
                value: t.value
            }
        })), DomUtils.fire(this, "cancel", {
            bubbles: !1,
            detail: {
                value: t.value,
                cancelByEsc: e
            }
        })), e && (t.blur(), this.focus())
    },
    _onInputChange(t) {
        this._changed = !0, this._maxLength && t.value.length > this._maxLength && (t.value = t.value.substr(0, this._maxLength)), DomUtils.fire(this, "change", {
            bubbles: !1,
            detail: {
                value: t.value
            }
        })
    },
    _mouseDownHandler(t) {
        t.stopPropagation(), FocusMgr._setFocusElement(this)
    },
    _keyDownHandler(t) {
        this.disabled || 13 !== t.keyCode && 32 !== t.keyCode || (DomUtils.acceptEvent(t), this.$input._initValue = this.$input.value, this.$input.focus(), this.$input.select())
    },
    _focusChangedHandler() {
        this.focused ? this.$input._initValue = this.$input.value : this._unselect(this.$input)
    }
});