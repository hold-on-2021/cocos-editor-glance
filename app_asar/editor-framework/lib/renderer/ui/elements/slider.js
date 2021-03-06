"use strict";
const Settings = require("../settings"),
    ElementUtils = require("./utils"),
    Utils = require("../../../share/utils"),
    MathUtils = require("../../../share/math"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly"),
    InputState = require("../behaviors/input-state");
module.exports = ElementUtils.registerElement("ui-slider", {
    get value() {
        return this._value
    },
    set value(t) {
        null !== t && void 0 !== t || (t = 0), t = MathUtils.clamp(t, this._min, this._max), this._value !== t && (this._value = t, this._updateNubbinAndInput())
    },
    get values() {
        return this._values
    },
    set values(t) {
        return this._values = t
    },
    get min() {
        return this._min
    },
    set min(t) {
        if (null === t || void 0 === t) return this._min = null, void 0;
        this._min !== t && (this._min = parseFloat(t))
    },
    get max() {
        return this._max
    },
    set max(t) {
        if (null === t || void 0 === t) return this._max = null, void 0;
        this._max !== t && (this._max = parseFloat(t))
    },
    get precision() {
        return this._precision
    },
    set precision(t) {
        void 0 !== t && null !== t && this._precision !== t && (this._precision = parseInt(t))
    },
    get step() {
        return this._step
    },
    set step(t) {
        void 0 !== t && null !== t && this._step !== t && (this._step = parseFloat(t), this._step = 0 === this._step ? Settings.stepFloat : this._step)
    },
    get snap() {
        return this._snap
    },
    set snap(t) {
        void 0 !== t && null !== t && this._snap !== t && (this._snap = t)
    },
    get multiValues() {
        return this._multiValues
    },
    set multiValues(t) {
        (t = !(null == t || !1 === t)) !== this._multiValues && (this._multiValues = t, t ? this.setAttribute("multi-values", "") : this.removeAttribute("multi-values"), this._multiValues = t)
    },
    attributeChangedCallback(t, i, e) {
        if ("multi-values" == t) {
            this[t.replace(/\-(\w)/g, function (t, i) {
                return i.toUpperCase()
            })] = e
        }
    },
    behaviors: [Focusable, Disable, Readonly, InputState],
    template: '\n    <div class="wrapper">\n      <div class="track"></div>\n      <div class="nubbin"></div>\n    </div>\n    <input></input>\n  ',
    style: ResMgr.getResource("theme://elements/slider.css"),
    $: {
        wrapper: ".wrapper",
        track: ".track",
        nubbin: ".nubbin",
        input: "input"
    },
    factoryImpl(t) {
        isNaN(t) || (this.value = t)
    },
    ready() {
        let t = this.getAttribute("precision");
        this._precision = null !== t ? parseInt(t) : 1;
        let i = this.getAttribute("min");
        this._min = null !== i ? parseFloat(i) : 0;
        let e = this.getAttribute("max");
        this._max = null !== e ? parseFloat(e) : 1;
        let s = this.getAttribute("value");
        this._value = null !== s ? parseFloat(s) : 0, this._value = this._initValue = MathUtils.clamp(this._value, this._min, this._max);
        let a = this.getAttribute("step");
        this._step = null !== a ? parseFloat(a) : Settings.stepFloat, this._snap = null !== this.getAttribute("snap"), this.multiValues = this.getAttribute("multi-values"), this._dragging = !1, this._updateNubbinAndInput(), this._initFocusable([this.$wrapper, this.$input], this.$input), this._initDisable(!1), this._initReadonly(!1), this._initInputState(this.$input), this.$input.readOnly = this.readonly, this._initEvents()
    },
    _initEvents() {
        this.addEventListener("mousedown", this._mouseDownHandler), this.addEventListener("focus-changed", this._focusChangedHandler), this.$wrapper.addEventListener("keydown", this._wrapperKeyDownHandler.bind(this)), this.$wrapper.addEventListener("keyup", this._wrapperKeyUpHandler.bind(this)), this.$wrapper.addEventListener("mousedown", this._wrapperMouseDownHandler.bind(this)), this.$input.addEventListener("keydown", t => {
            38 === t.keyCode ? (DomUtils.acceptEvent(t), this.readonly || this._stepUp()) : 40 === t.keyCode && (DomUtils.acceptEvent(t), this.readonly || this._stepDown())
        })
    },
    _mouseDownHandler(t) {
        DomUtils.acceptEvent(t), FocusMgr._setFocusElement(this)
    },
    _wrapperMouseDownHandler(t) {
        if (DomUtils.acceptEvent(t), FocusMgr._setFocusElement(this), this.$wrapper.focus(), this.readonly) return;
        this._initValue = this._value, this._dragging = !0;
        let i = this.$track.getBoundingClientRect(),
            e = (t.clientX - i.left) / this.$track.clientWidth,
            s = this._min + e * (this._max - this._min);
        this._snap && (s = this._snapToStep(s));
        let a = this._formatValue(s);
        this.$input.value = a, this._value = parseFloat(a), this._updateNubbin(), this._emitChange(), DomUtils.startDrag("ew-resize", t, t => {
            let e = (t.clientX - i.left) / this.$track.clientWidth;
            e = MathUtils.clamp(e, 0, 1);
            let s = this._min + e * (this._max - this._min);
            this._snap && (s = this._snapToStep(s));
            let a = this._formatValue(s);
            this.$input.value = a, this._value = parseFloat(a), this._updateNubbin(), this._emitChange()
        }, () => {
            this._dragging = !1, this.confirm()
        })
    },
    _wrapperKeyDownHandler(t) {
        if (!this.disabled)
            if (13 === t.keyCode || 32 === t.keyCode) DomUtils.acceptEvent(t), this.$input._initValue = this.$input.value, this.$input.focus(), this.$input.select();
            else if (27 === t.keyCode) this._dragging && (DomUtils.acceptEvent(t), this._dragging = !1, DomUtils.cancelDrag()), this.cancel();
        else if (37 === t.keyCode) {
            if (DomUtils.acceptEvent(t), this.readonly) return;
            this._stepDown()
        } else if (39 === t.keyCode) {
            if (DomUtils.acceptEvent(t), this.readonly) return;
            this._stepUp()
        }
    },
    _stepUp() {
        let t = this._step;
        event.shiftKey && (t *= Settings.shiftStep), this._value = MathUtils.clamp(this._value + t, this._min, this._max), this._updateNubbinAndInput(), this._emitChange()
    },
    _stepDown() {
        let t = this._step;
        event.shiftKey && (t *= Settings.shiftStep), this._value = MathUtils.clamp(this._value - t, this._min, this._max), this._updateNubbinAndInput(), this._emitChange()
    },
    _wrapperKeyUpHandler(t) {
        if (37 === t.keyCode || 39 === t.keyCode) {
            if (DomUtils.acceptEvent(t), this.readonly) return;
            this.confirm()
        }
    },
    _parseInput() {
        if (null === this.$input.value) return this._min;
        if ("" === this.$input.value.trim()) return this._min;
        let t = parseFloat(this.$input.value);
        return isNaN(t) ? (t = parseFloat(this.$input._initValue), t = parseFloat(this._formatValue(t))) : t = parseFloat(this._formatValue(t)), t = MathUtils.clamp(t, this._min, this._max), t
    },
    _updateNubbin() {
        let t = (this._value - this._min) / (this._max - this._min);
        this.$nubbin.style.left = `${100*t}%`
    },
    _updateNubbinAndInput() {
        let t = (this._value - this._min) / (this._max - this._min);
        this.$nubbin.style.left = `${100*t}%`, this.$input.value = this._formatValue(this._value)
    },
    confirm() {
        this._changed && (this._changed = !1, this._initValue = this._value, this._updateNubbinAndInput(), DomUtils.fire(this, "confirm", {
            bubbles: !1,
            detail: {
                value: this._value
            }
        }))
    },
    cancel() {
        this._changed && (this._changed = !1, this._value !== this._initValue && (this._value = this._initValue, this._updateNubbinAndInput(), DomUtils.fire(this, "change", {
            bubbles: !1,
            detail: {
                value: this._value
            }
        })), DomUtils.fire(this, "cancel", {
            bubbles: !1,
            detail: {
                value: this._value
            }
        }))
    },
    _onInputConfirm(t, i) {
        if (!this.readonly && this._changed) {
            this._changed = !1;
            let e = this._parseInput();
            t.value = e, t._initValue = e, this._value = e, this._initValue = e, this._updateNubbin(), DomUtils.fire(this, "confirm", {
                bubbles: !1,
                detail: {
                    value: this._value,
                    confirmByEnter: i
                }
            })
        }
        i && this.$wrapper.focus()
    },
    _onInputCancel(t, i) {
        if (!this.readonly && this._changed) {
            if (this._changed = !1, t._initValue !== t.value) {
                t.value = t._initValue;
                let i = this._parseInput();
                t.value = i, this._value = i, this._initValue = i, this._updateNubbin(), DomUtils.fire(this, "change", {
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
        i && this.$wrapper.focus()
    },
    _onInputChange() {
        let t = this._parseInput();
        this._value = t, this._updateNubbin(), this._emitChange()
    },
    _focusChangedHandler() {
        this.focused || this._unselect(this.$input)
    },
    _emitChange() {
        this._changed = !0, DomUtils.fire(this, "change", {
            bubbles: !1,
            detail: {
                value: this._value
            }
        })
    },
    _snapToStep(t) {
        let i = Math.round((t - this._value) / this._step);
        return t = this._value + this._step * i, MathUtils.clamp(t, this.min, this.max)
    },
    _formatValue(t) {
        return null === t || "" === t ? "" : 0 === this._precision ? Utils.toFixed(t, this._precision) : Utils.toFixed(t, this._precision, this._precision)
    }
});