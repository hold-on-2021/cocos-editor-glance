"use strict";
let _colorPicker;
const Chroma = require("chroma-js"),
    ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly");
module.exports = ElementUtils.registerElement("ui-color", {
    get value() {
        return this._value
    },
    set value(e) {
        e || (e = [0, 0, 0, 1]);
        var t = this._value;
        this._value = e, t + "" == this._value + "" || this._multiValues || (this._draw = Chroma(e).rgba(), this._updateRGB(), this._updateAlpha())
    },
    get values() {
        return this._values
    },
    set values(e) {
        var t = this._values;
        this._values = e, t + "" != e + "" && this._multiValues && (this._draw = Chroma(e[0]).rgba(), this._updateRGB(), this._updateAlpha())
    },
    get multiValues() {
        return this._multiValues
    },
    set multiValues(e) {
        if (e = !(null == e || !1 === e), this._multiValues !== e) {
            this._multiValues = e;
            var t;
            e ? (this._values && (t = this._values[0]), this.setAttribute("multi-values", "")) : (t = this._value, this.removeAttribute("multi-values")), t && (this._updateRGB(), this._updateAlpha())
        }
    },
    attributeChangedCallback(e, t, i) {
        if ("multi-values" == e) {
            this[e.replace(/\-(\w)/g, function (e, t) {
                return t.toUpperCase()
            })] = i
        }
    },
    behaviors: [Focusable, Disable, Readonly],
    template: '\n    <div class="inner">\n      <div class="rgb"></div>\n      <div class="alpha"></div>\n    </div>\n    <div class="mask"></div>\n  ',
    style: ResMgr.getResource("theme://elements/color.css"),
    $: {
        rgb: ".rgb",
        alpha: ".alpha"
    },
    factoryImpl(e) {
        e && (this.value = e)
    },
    ready() {
        this._showing = !1;
        let e = this.getAttribute("value");
        this.value = null !== e ? e : [255, 255, 255, 1], this.multiValues = this.getAttribute("multi-values"), this._updateRGB(), this._updateAlpha(), this._initFocusable(this), this._initDisable(!1), this._initReadonly(!1), this._initEvents(), _colorPicker || ((_colorPicker = document.createElement("ui-color-picker")).style.position = "fixed", _colorPicker.style.zIndex = 999, _colorPicker.style.display = "none")
    },
    detachedCallback() {
        this._showColorPicker(!1)
    },
    _initEvents() {
        this.addEventListener("mousedown", e => {
            this.disabled || (DomUtils.acceptEvent(e), FocusMgr._setFocusElement(this), this.readonly || (this._showing ? this._showColorPicker(!1) : (_colorPicker.value = this._draw, this._showColorPicker(!0))))
        }), this.addEventListener("keydown", e => {
            this.readonly || this.disabled || 13 !== e.keyCode && 32 !== e.keyCode || (DomUtils.acceptEvent(e), _colorPicker.value = this._draw, this._showColorPicker(!0))
        }), this._hideFn = (e => {
            this._changed && (this._changed = !1, e.detail.confirm ? (this._initValue = this._value, DomUtils.fire(this, "confirm", {
                bubbles: !1,
                detail: {
                    value: this._value
                }
            })) : (this._initValue !== this._value && (this.value = this._initValue, DomUtils.fire(this, "change", {
                bubbles: !1,
                detail: {
                    value: this._value
                }
            })), DomUtils.fire(this, "cancel", {
                bubbles: !1,
                detail: {
                    value: this._value
                }
            }))), this._showColorPicker(!1)
        }), this._changeFn = (e => {
            this._changed = !0, this.multiValues = !1, DomUtils.acceptEvent(e), this.value = e.detail.value.map(e => e), DomUtils.fire(this, "change", {
                bubbles: !1,
                detail: {
                    value: this._value
                }
            })
        })
    },
    _updateRGB() {
        this.$rgb.style.backgroundColor = Chroma(this._draw).hex()
    },
    _updateAlpha() {
        this.$alpha.style.width = `${100*this._draw[3]}%`
    },
    _equals(e) {
        return this._value.length === e.length && (this._value[0] === e[0] && this._value[1] === e[1] && this._value[2] === e[2] && this._value[3] === e[3])
    },
    _showColorPicker(e) {
        this._showing !== e && (this._showing = e, e ? (this._initValue = this._draw, _colorPicker.addEventListener("hide", this._hideFn), _colorPicker.addEventListener("change", this._changeFn), _colorPicker.addEventListener("confirm", this._confirmFn), _colorPicker.addEventListener("cancel", this._cancelFn), DomUtils.addHitGhost("default", 998, () => {
            _colorPicker.hide(!0)
        }), document.body.appendChild(_colorPicker), _colorPicker._target = this, _colorPicker.style.display = "block", this._updateColorPickerPosition(), FocusMgr._setFocusElement(_colorPicker)) : (_colorPicker.removeEventListener("hide", this._hideFn), _colorPicker.removeEventListener("change", this._changeFn), _colorPicker.removeEventListener("confirm", this._confirmFn), _colorPicker.removeEventListener("cancel", this._cancelFn), DomUtils.removeHitGhost(), _colorPicker._target = null, _colorPicker.remove(), _colorPicker.style.display = "none", FocusMgr._setFocusElement(this)))
    },
    _updateColorPickerPosition() {
        window.requestAnimationFrame(() => {
            if (!this._showing) return;
            let e = document.body.getBoundingClientRect(),
                t = this.getBoundingClientRect(),
                i = _colorPicker.getBoundingClientRect(),
                s = _colorPicker.style;
            s.left = t.right - i.width + "px", e.height - t.bottom <= i.height + 10 ? s.top = e.bottom - i.height - 10 + "px" : s.top = t.bottom - e.top + 10 + "px", e.width - t.left <= i.width ? s.left = e.right - i.width - 10 + "px" : s.left = t.left - e.left + "px", this._updateColorPickerPosition()
        })
    }
});