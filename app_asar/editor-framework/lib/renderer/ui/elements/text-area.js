"use strict";
const ElementUtils = require("./utils"),
    Platform = require("../../../share/platform"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly"),
    InputState = require("../behaviors/input-state");
let _confirmKey = "⌘ + enter";
Platform.isWin32 && (_confirmKey = "ctrl + enter"), module.exports = ElementUtils.registerElement("ui-text-area", {
    get value() {
        return this._value
    },
    set value(t) {
        null !== t && void 0 !== t || (t = ""), t += "", this._value = t, this._multiValues || (null !== this._maxLength ? this.$input.value = t.substr(0, this._maxLength) : this.$input.value = t)
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
        if ("multi-values" === t) {
            this[t.replace(/\-(\w)/g, function (t, e) {
                return e.toUpperCase()
            })] = i
        }
    },
    behaviors: [Focusable, Disable, Readonly, InputState],
    template: `\n    <div class="back">\n      <span>${_confirmKey}</span>\n    </div>\n    <textarea></textarea>\n  `,
    style: ResMgr.getResource("theme://elements/text-area.css"),
    $: {
        input: "textarea",
        span: "span"
    },
    factoryImpl(t) {
        t && (this.value = t)
    },
    ready() {
        this._value = "", this._values = [""], this.value = this.getAttribute("value"), this.placeholder = this.getAttribute("placeholder") || "", this.maxLength = this.getAttribute("max-length"), this.multiValues = this.getAttribute("multi-values"), this._initFocusable(this, this.$input), this._initDisable(!1), this._initReadonly(!1), this._initInputState(this.$input), this.$input.readOnly = this.readonly, this._initEvents()
    },
    clear() {
        this._value = "", this._values = [""], this.$input.value = "", this.confirm()
    },
    confirm() {
        this._onInputConfirm(this.$input)
    },
    cancel() {
        this._onInputCancel(this.$input)
    },
    _initEvents() {
        this.addEventListener("mousedown", this._mouseDownHandler), this.addEventListener("keydown", this._keyDownHandler), this.addEventListener("focus-changed", this._focusChangedHandler), this.$input.addEventListener("focus", () => {
            this.$span.style.display = "inline-block"
        }), this.$input.addEventListener("blur", () => {
            this.$span.style.display = "none"
        })
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
        this.readonly || this._changed && (this._changed = !1, t._initValue !== t.value && (this._value = t.value = t._initValue, DomUtils.fire(this, "change", {
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
        this._changed = !0, this._maxLength && t.value.length > this._maxLength && (t.value = t.value.substr(0, this._maxLength)), this._value = t.value, DomUtils.fire(this, "change", {
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