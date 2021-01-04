"use strict";
const ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly"),
    Hint = require("./hint");
let _tooltipEL = null,
    PropElement = ElementUtils.registerElement("ui-prop", {
        get name() {
            return this._name
        },
        set name(t) {
            this._name !== t && (this._name = t, this.$text.innerText = t)
        },
        get slidable() {
            return null !== this.getAttribute("slidable")
        },
        set slidable(t) {
            t ? this.setAttribute("slidable", "") : this.removeAttribute("slidable")
        },
        get movable() {
            return null !== this.getAttribute("movable")
        },
        set movable(t) {
            t ? this.setAttribute("movable", "") : this.removeAttribute("movable")
        },
        get removable() {
            return null !== this.getAttribute("removable")
        },
        set removable(t) {
            t ? this.setAttribute("removable", "") : this.removeAttribute("removable")
        },
        get foldable() {
            return null !== this.getAttribute("foldable")
        },
        set foldable(t) {
            t ? this.setAttribute("foldable", "") : this.removeAttribute("foldable")
        },
        get autoHeight() {
            return null !== this.getAttribute("auto-height")
        },
        set autoHeight(t) {
            t ? this.setAttribute("auto-height", "") : this.removeAttribute("auto-height")
        },
        get selected() {
            return null !== this.getAttribute("selected")
        },
        set selected(t) {
            t ? this.setAttribute("selected", "") : this.removeAttribute("selected")
        },
        get hovering() {
            return null !== this.getAttribute("hovering")
        },
        set hovering(t) {
            t ? this.setAttribute("hovering", "") : this.removeAttribute("hovering")
        },
        get indent() {
            return this._indent
        },
        set indent(t) {
            if (this._indent !== t) {
                let e = parseInt(t);
                this.setAttribute("indent", e), this.$label.style.paddingLeft = 13 * e + "px", this._indent = e
            }
        },
        get multiValues() {
            return this._multiValues
        },
        set multiValues(t) {
            t = !(null == t || !1 === t);
            var e = this._multiValues;
            return this._multiValues = t, t ? this.setAttribute("multi-values", "") : this.removeAttribute("multi-values"), this.multiValuesChanged && this.multiValuesChanged(e, t), this._multiValues
        },
        get value() {
            return this._value
        },
        set value(t) {
            if (this._value !== t) {
                let e = this._value;
                this._value = t, this.valueChanged && this.valueChanged(e, t)
            }
        },
        get values() {
            return this._values
        },
        set values(t) {
            if (this.values + "" != t + "") {
                let e = this._values;
                this._values = t, this.valuesChanged && this.valuesChanged(e, t)
            }
        },
        get attrs() {
            return this._attrs
        },
        set attrs(t) {
            if (this._attrs !== t) {
                let e = this._attrs;
                this._attrs = t, this.attrsChanged && this.attrsChanged(e, t)
            }
        },
        set type(t) {
            this._type !== t && (this._type = t, null !== this._type && this.regen())
        },
        get type() {
            return this._type
        },
        get tooltip() {
            return this._tooltip
        },
        set tooltip(t) {
            this._tooltip !== t && (this._tooltip = t)
        },
        get path() {
            return this._path
        },
        get labelWidth() {
            return this._labelWidth
        },
        set labelWidth(t) {
            t && (-1 === t.toString().indexOf("%") && (t += "%"), this._labelWidth = t, this.$label.style.width = t)
        },
        attributeChangedCallback(t, e, i) {
            if ("type" == t || "name" == t || "indent" == t || "tooltip" == t || "multi-values" == t || "label-width" == t) {
                this[t.replace(/\-(\w)/g, function (t, e) {
                    return e.toUpperCase()
                })] = i
            }
        },
        behaviors: [Focusable, Disable, Readonly],
        template: '\n    <div class="wrapper">\n      <div class="label">\n        <i class="move icon-braille"></i>\n        <i class="fold icon-fold-up"></i>\n        <span class="text"></span>\n        <div class="lock">\n          <i class="icon-lock"></i>\n        </div>\n      </div>\n      <div class="wrapper-content">\n        <content select=":not(.child)"></content>\n      </div>\n      <div class="remove">\n        <i class="icon-trash-empty"></i>\n      </div>\n    </div>\n    <content select=".child"></content>\n  ',
        style: ResMgr.getResource("theme://elements/prop.css"),
        $: {
            label: ".label",
            moveIcon: ".move",
            removeIcon: ".remove",
            foldIcon: ".fold",
            text: ".text"
        },
        factoryImpl(t, e, i, s, l) {
            this.name = t || "", this.indent = l || 0, this._value = e, this._attrs = s || {}, this._type = i || typeof e, this.regen()
        },
        ready() {
            let t = this.getAttribute("name");
            this._name = null !== t ? t : "-";
            let e = this.getAttribute("label-width");
            e && (-1 === e.toString().indexOf("%") && (e += "%"), this.$label.style.width = e, this._labelWidth = e), this._path = this.getAttribute("path");
            let i = this.getAttribute("indent");
            null !== i ? (i = parseInt(i), this.$label.style.paddingLeft = 13 * i + "px") : i = 0, this._indent = i, this.multiValues = this.getAttribute("multi-values"), this._folded = null !== this.getAttribute("folded"), i >= 1 && this.movable && (this.$moveIcon.style.left = 13 * (i - 1) + "px"), this.tooltip = this.getAttribute("tooltip"), this.$text.innerText = this._name, this._initFocusable(this), this._initDisable(!0), this._initReadonly(!0), this._initEvents(), this._type = this.getAttribute("type"), null !== this._type && this.regen(), this._disabled && DomUtils.walk(this, {
                excludeSelf: !0
            }, t => (0 === t.tagName.indexOf("UI-") && t.setAttribute("is-disabled", ""), !1)), this._readonly && DomUtils.walk(this, {
                excludeSelf: !0
            }, t => (0 === t.tagName.indexOf("UI-") && t.setAttribute("is-readonly", ""), !1))
        },
        fold() {
            this._folded || (this._folded = !0, this.$foldIcon.classList.remove("icon-fold-up"), this.$foldIcon.classList.add("icon-fold"), this.setAttribute("folded", ""))
        },
        foldup() {
            this._folded && (this._folded = !1, this.$foldIcon.classList.remove("icon-fold"), this.$foldIcon.classList.add("icon-fold-up"), this.removeAttribute("folded"))
        },
        regen(t) {
            ElementUtils.regenProperty(this, t)
        },
        installStandardEvents(t) {
            if ("function" != typeof this.inputValue) throw new Error("Invalid proto, inputValue is not defined.");
            t.addEventListener("change", () => {
                this._value = this.inputValue(), this._emitChange()
            }), t.addEventListener("confirm", () => {
                this._value = this.inputValue(), this._emitConfirm()
            }), t.addEventListener("cancel", () => {
                this._value = this.inputValue(), this._emitCancel()
            })
        },
        installSlideEvents(t, e, i, s) {
            if (!(t instanceof PropElement)) throw new Error("Invalid element, only <ui-prop> has slide events.");
            if ("function" != typeof this.inputValue) throw new Error("Invalid proto, inputValue is not defined.");
            t.addEventListener("slide-start", () => {
                this._initValue = this.inputValue()
            }), t.addEventListener("slide-change", t => {
                e && e(t.detail.dx, t.detail.dy), this._changed = !0, this._value = this.inputValue(), this._emitChange()
            }), t.addEventListener("slide-confirm", () => {
                this._changed && (this._changed = !1, this._value = this.inputValue(), i && i(), this._emitConfirm())
            }), t.addEventListener("slide-cancel", () => {
                this._changed && (this._changed = !1, this._value = this._initValue, s && s(), this._emitCancel())
            })
        },
        _emitConfirm() {
            DomUtils.fire(this, "confirm", {
                bubbles: !1,
                detail: {
                    path: this._path,
                    value: this._value
                }
            })
        },
        _emitCancel() {
            DomUtils.fire(this, "cancel", {
                bubbles: !1,
                detail: {
                    path: this._path,
                    value: this._value
                }
            })
        },
        _emitChange() {
            DomUtils.fire(this, "change", {
                bubbles: !1,
                detail: {
                    path: this._path,
                    value: this._value
                }
            })
        },
        _getFirstFocusableElement() {
            let t = FocusMgr._getFirstFocusableFrom(this, !0);
            return t && t.parentElement && t.parentElement.classList.contains("child") ? null : t
        },
        _initEvents() {
            this.addEventListener("focus-changed", t => {
                if (this.parentElement instanceof PropElement || t.stopPropagation(), this.selected = t.detail.focused, !this.disabled && t.detail.focused && t.target === this) {
                    let t = this._getFirstFocusableElement();
                    t && FocusMgr._setFocusElement(t)
                }
            }), this.addEventListener("mouseover", t => {
                t.stopImmediatePropagation(), this.hovering = !0
            }), this.addEventListener("mouseout", t => {
                t.stopImmediatePropagation(), this.hovering = !1
            }), this.$label.addEventListener("mouseenter", () => {
                this._showTooltip()
            }), this.$label.addEventListener("mouseleave", () => {
                this._hideTooltip()
            }), this.$moveIcon.addEventListener("mouseenter", () => {
                this.style.backgroundColor = "rgba(0,0,0,0.1)"
            }), this.$moveIcon.addEventListener("mouseleave", () => {
                this.style.backgroundColor = ""
            }), this.$removeIcon.addEventListener("mouseenter", () => {
                this.style.backgroundColor = "rgba(255,0,0,0.3)", this.style.outline = "1px solid rgba(255,0,0,1)"
            }), this.$removeIcon.addEventListener("mouseleave", () => {
                this.style.backgroundColor = "", this.style.outline = ""
            }), this.addEventListener("mousedown", t => {
                if (DomUtils.acceptEvent(t), this.disabled) return FocusMgr._setFocusElement(this), void 0;
                this.slidable && (this.readonly ? DomUtils.startDrag("ew-resize", t) : (this._sliding = !0, DomUtils.fire(this, "slide-start", {
                    bubbles: !1
                }), DomUtils.startDrag("ew-resize", t, t => {
                    DomUtils.fire(this, "slide-change", {
                        bubbles: !1,
                        detail: {
                            dx: t.movementX,
                            dy: t.movementY
                        }
                    })
                }, () => {
                    DomUtils.fire(this, "slide-confirm", {
                        bubbles: !1
                    })
                }))), FocusMgr._setFocusElement(null);
                let e = this._getFirstFocusableElement();
                e ? FocusMgr._setFocusElement(e) : FocusMgr._setFocusElement(this)
            }), this.addEventListener("keydown", t => {
                13 === t.keyCode || (27 === t.keyCode ? this._sliding && (this._sliding = !1, DomUtils.acceptEvent(t), DomUtils.cancelDrag(), DomUtils.fire(this, "slide-cancel", {
                    bubbles: !1
                })) : 37 === t.keyCode ? (DomUtils.acceptEvent(t), this.fold()) : 39 === t.keyCode && (DomUtils.acceptEvent(t), this.foldup()))
            }), this.$foldIcon.addEventListener("click", () => {
                this._folded ? this.foldup() : this.fold()
            })
        },
        _showTooltip() {
            this.tooltip && (_tooltipEL || ((_tooltipEL = new Hint(this._tooltip)).style.display = "none", _tooltipEL.style.position = "absolute", _tooltipEL.style.maxWidth = "200px", _tooltipEL.style.zIndex = "999", _tooltipEL.classList = "bottom shadow", _tooltipEL.position = "20px", document.body.appendChild(_tooltipEL)), _tooltipEL.innerText = this._tooltip, this._showTooltipID = setTimeout(() => {
                this._showTooltipID = null, _tooltipEL.style.display = "block";
                let t = this.$text.getBoundingClientRect(),
                    e = _tooltipEL.getBoundingClientRect();
                _tooltipEL.style.left = t.left - 10, _tooltipEL.style.top = t.top - e.height - 10
            }, 200))
        },
        _hideTooltip() {
            this.tooltip && (clearTimeout(this._showTooltipID), this._showTooltipID = null, _tooltipEL && (_tooltipEL.style.display = "none"))
        }
    });
module.exports = PropElement;