"use strict";
const Settings = require("../settings"),
    ElementUtils = require("./utils"),
    Utils = require("../../../share/utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly"),
    InputState = require("../behaviors/input-state");
module.exports = ElementUtils.registerElement("ui-num-input", {
    get type() {
        return this._type
    },
    set type(t) {
        this._type !== t && (this._type = t, "int" === this._type ? (this._parseFn = parseInt, this._step = parseInt(this._step), this._step = 0 === this._step ? Settings.stepInt : this._step) : (this._parseFn = parseFloat, this._step = parseFloat(this._step), this._step = 0 === this._step ? Settings.stepFloat : this._step))
    },
    get value() {
        return this._value
    },
    set value(t) {
        null !== t && void 0 !== t || (t = 0), t = this._clampValue(t), this._value !== t && (this._value = this._parseFn(t), this._multiValues || (this.$input.value = this._formatValue(this._value)))
    },
    get values() {
        return this._values
    },
    set values(t) {
        this._values = t, this._multiValues && (this.$input.value = "-")
    },
    get min() {
        return this._min
    },
    set min(t) {
        if (null === t || void 0 === t) return this._min = null, void 0;
        this._min !== t && (this._min = this._parseFn(t), this.value = this._value)
    },
    get max() {
        return this._max
    },
    set max(t) {
        if (null === t || void 0 === t) return this._max = null, void 0;
        this._max !== t && (this._max = this._parseFn(t), this.value = this._value)
    },
    get precision() {
        return this._precision
    },
    set precision(t) {
        void 0 !== t && null !== t && this._precision !== t && (this._precision = parseInt(t), this.$input.value = this._formatValue(this._value))
    },
    get step() {
        return this._step
    },
    set step(t) {
        void 0 !== t && null !== t && this._step !== t && (this._step = this._parseFn(t), "int" === this._type ? this._step = 0 === this._step ? Settings.stepInt : this._step : this._step = 0 === this._step ? Settings.stepFloat : this._step)
    },
    get multiValues() {
        return this._multiValues
    },
    set multiValues(t) {
        if (t = !(null == t || !1 === t), t !== this._multiValues) return t ? (this.$input.value = "-", this.setAttribute("multi-values", "")) : (this._value = this._parseFn(this._clampValue(this._value)), this.$input.value = this._formatValue(this._value), this.removeAttribute("multi-values")), this._multiValues = t
    },
    attributeChangedCallback(t, i, s) {
        if ("type" == t || "min" == t || "max" == t || "precision" == t || "step" == t || "multi-values" == t) {
            this[t.replace(/\-(\w)/g, function (t, i) {
                return i.toUpperCase()
            })] = s
        }
    },
    behaviors: [Focusable, Disable, Readonly, InputState],
    template: '\n    <input></input>\n    <div class="spin-wrapper" tabindex="-1">\n      <div class="spin up">\n        <i class="icon-up-dir"></i>\n      </div>\n      <div class="spin-div"></div>\n      <div class="spin down">\n        <i class="icon-down-dir"></i>\n      </div>\n    </div>\n  ',
    style: ResMgr.getResource("theme://elements/num-input.css"),
    $: {
        input: "input",
        spinWrapper: ".spin-wrapper",
        spinUp: ".spin.up",
        spinDown: ".spin.down"
    },
    factoryImpl(t) {
        isNaN(t) || (this.value = t)
    },
    ready() {
        "int" === this.getAttribute("type") ? (this._type = "int", this._parseFn = parseInt) : (this._type = "float", this._parseFn = parseFloat);
        let t = this.getAttribute("precision");
        this._precision = null !== t ? parseInt(t) : 7;
        let i = this.getAttribute("min");
        this._min = null !== i ? this._parseFn(i) : null;
        let s = this.getAttribute("max");
        this._max = null !== s ? this._parseFn(s) : null, this.multiValues = this.getAttribute("multi-values");
        let e = this.getAttribute("value");
        this._value = null !== e ? this._parseFn(e) : null, this._value = this._clampValue(this._value);
        let n = this.getAttribute("step");
        this._step = null !== n ? this._parseFn(n) : "int" === this._type ? Settings.stepInt : Settings.stepFloat, this.$input.value = this._formatValue(this._value), this.$input.placeholder = "-", this.$input._initValue = "", this.$spinWrapper.addEventListener("keydown", t => {
            27 === t.keyCode && this._holdingID && (DomUtils.acceptEvent(t), this.cancel(), this._curSpin.removeAttribute("pressed"), this._stopHolding())
        }), DomUtils.installDownUpEvent(this.$spinUp), this.$spinUp.addEventListener("down", t => {
            DomUtils.acceptEvent(t), FocusMgr._setFocusElement(this), this.$spinWrapper.focus(), this.$spinUp.setAttribute("pressed", ""), this.readonly || (this._stepUp(), this._startHolding(this.$spinUp, this._stepUp))
        }), this.$spinUp.addEventListener("up", t => {
            DomUtils.acceptEvent(t), this.$spinUp.removeAttribute("pressed", ""), this._holdingID && (this._stopHolding(), this.confirm())
        }), DomUtils.installDownUpEvent(this.$spinDown), this.$spinDown.addEventListener("down", t => {
            DomUtils.acceptEvent(t), FocusMgr._setFocusElement(this), this.$spinWrapper.focus(), this.$spinDown.setAttribute("pressed", ""), this.readonly || (this._stepDown(), this._startHolding(this.$spinDown, this._stepDown))
        }), this.$spinDown.addEventListener("up", t => {
            DomUtils.acceptEvent(t), this.$spinDown.removeAttribute("pressed", ""), this._holdingID && (this._stopHolding(), this.confirm())
        }), this._initFocusable(this, this.$input), this._initDisable(!1), this._initReadonly(!1), this._initInputState(this.$input), this.$input.readOnly = this.readonly, this._initEvents()
    },
    _setIsReadonlyAttribute(t) {
        t ? this.setAttribute("is-readonly", "") : this.removeAttribute("is-readonly"), this.$input.readOnly = t
    },
    _initEvents() {
        this.addEventListener("mousedown", this._mouseDownHandler), this.addEventListener("keydown", this._keyDownHandler), this.addEventListener("focus-changed", this._focusChangedHandler), this.$input.addEventListener("keydown", t => {
            this.readonly || (38 === t.keyCode ? (DomUtils.acceptEvent(t), this._stepUp()) : 40 === t.keyCode && (DomUtils.acceptEvent(t), this._stepDown()))
        }), this.$input.addEventListener("mousewheel", t => {
            this.focused && (t.stopPropagation(), t.preventDefault(), this.readonly || (t.deltaY > 0 ? this._stepDown() : this._stepUp()))
        })
    },
    _formatValue(t) {
        return null === t || "" === t ? "" : "int" === this._type ? Utils.toFixed(t, 0) : 0 === this._precision ? Utils.toFixed(t, this._precision) : Utils.toFixed(t, this._precision, this._precision)
    },
    _clampValue(t) {
        return null !== this._min && void 0 !== this._min && (t = Math.max(this._min, t)), null !== this._max && void 0 !== this._max && (t = Math.min(this._max, t)), t
    },
    _parseInput() {
        if (null === this.$input.value) return 0;
        if ("" === this.$input.value.trim()) return 0;
        let t = this._parseFn(this.$input.value);
        return isNaN(t) ? (t = this._parseFn(this.$input._initValue), t = this._parseFn(this._formatValue(t))) : t = this._parseFn(this._formatValue(t)), t
    },
    _stepUp() {
        var t = this._value;
        Array.isArray(t) && (t = t[0]);
        let i = t + this._step;
        i = this._clampValue(i), this.$input.value = this._formatValue(i), this._onInputChange()
    },
    _stepDown() {
        var t = this._value;
        Array.isArray(t) && (t = t[0]);
        let i = t - this._step;
        i = this._clampValue(i), this.$input.value = this._formatValue(i), this._onInputChange()
    },
    _startHolding(t, i) {
        this._curSpin = t, this._holdingID = setTimeout(() => {
            this._stepingID = setInterval(() => {
                i.apply(this)
            }, 50)
        }, 500)
    },
    _stopHolding() {
        clearInterval(this._holdingID), this._holdingID = null, clearTimeout(this._stepingID), this._stepingID = null, this._curSpin = null
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
    _onInputConfirm(t, i) {
        if (!this.readonly && this._changed) {
            this._changed = !1;
            let s = this._parseInput();
            s = this._clampValue(s);
            let e = this._formatValue(s);
            t.value = e, t._initValue = e, this._value = s, DomUtils.fire(this, "confirm", {
                bubbles: !1,
                detail: {
                    value: this._value,
                    confirmByEnter: i
                }
            })
        }
        i && this.focus()
    },
    _onInputCancel(t, i) {
        if (!this.readonly && this._changed) {
            if (this._changed = !1, t._initValue !== t.value) {
                t.value = t._initValue;
                let i = this._parseInput(),
                    s = this._formatValue(i);
                t.value = s, t._initValue = s, this._value = i, DomUtils.fire(this, "change", {
                    bubbles: !1,
                    detail: {
                        value: this._value
                    }
                })
            }
            DomUtils.fire(this, "cancel", {
                bubbles: !1,
                detail: {
                    value: this._value,
                    cancelByEsc: i
                }
            })
        }
        i && (t.blur(), this.focus())
    },
    _onInputChange() {
        this._changed = !0, this._value = this._parseInput(), this.multiValues = !1, DomUtils.fire(this, "change", {
            bubbles: !1,
            detail: {
                value: this._value
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