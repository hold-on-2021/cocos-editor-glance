"use strict";
const Electron = require("electron"),
    Chroma = require("chroma-js"),
    Menu = Electron.remote.Menu,
    MenuItem = Electron.remote.MenuItem,
    ElementUtils = require("./utils"),
    MathUtils = require("../../../share/math"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Focusable = require("../behaviors/focusable");
module.exports = ElementUtils.registerElement("ui-color-picker", {
    get value() {
        return this._value
    },
    set value(t) {
        let e = Chroma(t).rgba();
        e !== this._value && (this._value = e, this._lastAssigned = e.slice(0), this._updateColorDiff(), this._updateHue(), this._updateAlpha(), this._updateColor(), this._updateSliders(), this._updateHexInput())
    },
    behaviors: [Focusable],
    template: '\n    <div class="hbox">\n      <div class="hue ctrl" tabindex="-1">\n        <div class="hue-handle">\n          <i class="icon-right-dir"></i>\n        </div>\n      </div>\n      <div class="color ctrl" tabindex="-1">\n        <div class="color-handle">\n          <i class="icon-circle-empty"></i>\n        </div>\n      </div>\n      <div class="alpha ctrl" tabindex="-1">\n        <div class="alpha-handle">\n          <i class="icon-left-dir"></i>\n        </div>\n      </div>\n    </div>\n\n    <div class="vbox">\n      <div class="prop">\n        <span class="red tag">R</span>\n        <ui-slider id="r-slider" step=1 precision=0 min=0 max=255></ui-slider>\n      </div>\n      <div class="prop">\n        <span class="green">G</span>\n        <ui-slider id="g-slider" step=1 precision=0 min=0 max=255></ui-slider>\n      </div>\n      <div class="prop">\n        <span class="blue">B</span>\n        <ui-slider id="b-slider" step=1 precision=0 min=0 max=255></ui-slider>\n      </div>\n      <div class="prop">\n        <span class="gray">A</span>\n        <ui-slider id="a-slider" step=1 precision=0 min=0 max=255></ui-slider>\n      </div>\n      <div class="hex-field">\n        <div class="color-block old">\n          <div id="old-color" class="color-inner"></div>\n        </div>\n        <div class="color-block new">\n          <div id="new-color" class="color-inner"></div>\n        </div>\n        <span class="space"></span>\n        <div class="label">Hex Color</div>\n        <ui-input id="hex-input"></ui-input>\n      </div>\n    </div>\n\n    <div class="title">\n      <div>Presets</div>\n      <ui-button id="btn-add" class="transparent tiny">\n        <i class="icon-plus"></i>\n      </ui-button>\n    </div>\n    <div class="hbox palette"></div>\n  ',
    style: ResMgr.getResource("theme://elements/color-picker.css"),
    $: {
        hueHandle: ".hue-handle",
        colorHandle: ".color-handle",
        alphaHandle: ".alpha-handle",
        hueCtrl: ".hue.ctrl",
        colorCtrl: ".color.ctrl",
        alphaCtrl: ".alpha.ctrl",
        sliderR: "#r-slider",
        sliderG: "#g-slider",
        sliderB: "#b-slider",
        sliderA: "#a-slider",
        newColor: "#new-color",
        oldColor: "#old-color",
        hexInput: "#hex-input",
        colorPresets: ".color-box",
        btnAdd: "#btn-add",
        palette: ".palette"
    },
    factoryImpl(t) {
        t && (this.value = t)
    },
    ready() {
        let t = this.getAttribute("value");
        this._value = null !== t ? Chroma(t).rgba() : [255, 255, 255, 1], this._lastAssigned = this._value.slice(0);
        let e = window.localStorage["ui-color-picker"];
        this._settings = e ? JSON.parse(e) : {
            colors: []
        }, this._initPalette(), this._updateColorDiff(), this._updateHue(), this._updateColor(), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._initFocusable(this), this._initEvents()
    },
    hide(t) {
        DomUtils.fire(this, "hide", {
            bubbles: !1,
            detail: {
                confirm: t
            }
        })
    },
    _initEvents() {
        this.addEventListener("keydown", t => {
            13 === t.keyCode || 32 === t.keyCode ? (DomUtils.acceptEvent(t), this.hide(!0)) : 27 === t.keyCode && (DomUtils.acceptEvent(t), this.hide(!1))
        }), this.$hueCtrl.addEventListener("mousedown", t => {
            DomUtils.acceptEvent(t), FocusMgr._setFocusElement(this), this.$hueCtrl.focus();
            let e = this._value[3];
            this._initValue = this._value, this._dragging = !0;
            let i = this.$hueCtrl.getBoundingClientRect(),
                s = (t.clientY - i.top) / this.$hueCtrl.clientHeight;
            this.$hueHandle.style.top = `${100*s}%`;
            let l = 360 * (1 - s),
                a = Chroma(this._value).hsv();
            this._value = Chroma(l, a[1], a[2], "hsv").rgba(), this._value[3] = e, this._updateColorDiff(), this._updateColor(l), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitChange(), DomUtils.startDrag("ns-resize", t, t => {
                let s = (t.clientY - i.top) / this.$hueCtrl.clientHeight;
                s = MathUtils.clamp(s, 0, 1), this.$hueHandle.style.top = `${100*s}%`;
                let l = 360 * (1 - s),
                    a = Chroma(this._value).hsv();
                this._value = Chroma(l, a[1], a[2], "hsv").rgba(), this._value[3] = e, this._updateColorDiff(), this._updateColor(l), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitChange()
            }, () => {
                this._dragging = !1;
                let t = 360 * (1 - parseFloat(this.$hueHandle.style.top) / 100);
                this._updateColorDiff(), this._updateColor(t), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitConfirm()
            })
        }), this.$hueCtrl.addEventListener("keydown", t => {
            27 === t.keyCode && this._dragging && (DomUtils.acceptEvent(t), this._dragging = !1, DomUtils.cancelDrag(), this._value = this._initValue, this._updateColorDiff(), this._updateHue(), this._updateColor(), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitChange(), this._emitCancel())
        }), this.$alphaCtrl.addEventListener("mousedown", t => {
            DomUtils.acceptEvent(t), FocusMgr._setFocusElement(this), this.$alphaCtrl.focus(), this._initValue = this._value.slice(), this._dragging = !0;
            let e = this.$alphaCtrl.getBoundingClientRect(),
                i = (t.clientY - e.top) / this.$alphaCtrl.clientHeight;
            this.$alphaHandle.style.top = `${100*i}%`, this._value[3] = parseFloat((1 - i).toFixed(3)), this._updateColorDiff(), this._updateSliders(), this._emitChange(), DomUtils.startDrag("ns-resize", t, t => {
                let i = (t.clientY - e.top) / this.$hueCtrl.clientHeight;
                i = MathUtils.clamp(i, 0, 1), this.$alphaHandle.style.top = `${100*i}%`, this._value[3] = parseFloat((1 - i).toFixed(3)), this._updateColorDiff(), this._updateSliders(), this._emitChange()
            }, () => {
                this._dragging = !1, this._updateSliders(), this._emitConfirm()
            })
        }), this.$alphaCtrl.addEventListener("keydown", t => {
            27 === t.keyCode && this._dragging && (DomUtils.acceptEvent(t), this._dragging = !1, DomUtils.cancelDrag(), this._value = this._initValue, this._updateColorDiff(), this._updateAlpha(), this._updateSliders(), this._emitChange(), this._emitCancel())
        }), this.$colorCtrl.addEventListener("mousedown", t => {
            DomUtils.acceptEvent(t), FocusMgr._setFocusElement(this), this.$colorCtrl.focus();
            let e = 360 * (1 - parseFloat(this.$hueHandle.style.top) / 100),
                i = this._value[3];
            this._initValue = this._value.slice(), this._dragging = !0;
            let s = this.$colorCtrl.getBoundingClientRect(),
                l = (t.clientX - s.left) / this.$colorCtrl.clientWidth,
                a = (t.clientY - s.top) / this.$colorCtrl.clientHeight,
                o = a * a * (3 - 2 * a);
            o *= 255, this.$colorHandle.style.left = `${100*l}%`, this.$colorHandle.style.top = `${100*a}%`, this.$colorHandle.style.color = Chroma(o, o, o).hex(), this._value = Chroma(e, l, 1 - a, "hsv").rgba(), this._value[3] = i, this._updateColorDiff(), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitChange(), DomUtils.startDrag("default", t, t => {
                let l = (t.clientX - s.left) / this.$colorCtrl.clientWidth,
                    a = (t.clientY - s.top) / this.$colorCtrl.clientHeight;
                l = MathUtils.clamp(l, 0, 1);
                let o = (a = MathUtils.clamp(a, 0, 1)) * a * (3 - 2 * a);
                o *= 255, this.$colorHandle.style.left = `${100*l}%`, this.$colorHandle.style.top = `${100*a}%`, this.$colorHandle.style.color = Chroma(o, o, o).hex(), this._value = Chroma(e, l, 1 - a, "hsv").rgba(), this._value[3] = i, this._updateColorDiff(), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitChange()
            }, () => {
                this._dragging = !1, this._updateColorDiff(), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitConfirm()
            })
        }), this.$colorCtrl.addEventListener("keydown", t => {
            27 === t.keyCode && this._dragging && (DomUtils.acceptEvent(t), this._dragging = !1, DomUtils.cancelDrag(), this._value = this._initValue, this._updateColorDiff(), this._updateColor(), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitChange(), this._emitCancel())
        }), this.$sliderR.addEventListener("change", t => {
            t.stopPropagation(), this._value[0] = parseInt(t.detail.value), this._updateColorDiff(), this._updateHue(), this._updateColor(), this._updateAlpha(), this._updateHexInput(), this._emitChange()
        }), this.$sliderR.addEventListener("confirm", t => {
            t.stopPropagation(), this._emitConfirm()
        }), this.$sliderR.addEventListener("cancel", t => {
            t.stopPropagation(), this._emitCancel()
        }), this.$sliderG.addEventListener("change", t => {
            t.stopPropagation(), this._value[1] = parseInt(t.detail.value), this._updateColorDiff(), this._updateHue(), this._updateColor(), this._updateAlpha(), this._updateHexInput(), this._emitChange()
        }), this.$sliderG.addEventListener("confirm", t => {
            t.stopPropagation(), this._emitConfirm()
        }), this.$sliderG.addEventListener("cancel", t => {
            t.stopPropagation(), this._emitCancel()
        }), this.$sliderB.addEventListener("change", t => {
            t.stopPropagation(), this._value[2] = parseInt(t.detail.value), this._updateColorDiff(), this._updateHue(), this._updateColor(), this._updateAlpha(), this._updateHexInput(), this._emitChange()
        }), this.$sliderB.addEventListener("confirm", t => {
            t.stopPropagation(), this._emitConfirm()
        }), this.$sliderB.addEventListener("cancel", t => {
            t.stopPropagation(), this._emitCancel()
        }), this.$sliderA.addEventListener("change", t => {
            t.stopPropagation(), this._value[3] = parseFloat(t.detail.value / 255), this._updateColorDiff(), this._updateAlpha(), this._emitChange()
        }), this.$sliderA.addEventListener("confirm", t => {
            t.stopPropagation(), this._emitConfirm()
        }), this.$sliderA.addEventListener("cancel", t => {
            t.stopPropagation(), this._emitCancel()
        }), this.$hexInput.addEventListener("change", t => {
            t.stopPropagation()
        }), this.$hexInput.addEventListener("cancel", t => {
            t.stopPropagation()
        }), this.$hexInput.addEventListener("confirm", t => {
            t.stopPropagation();
            let e = this._value[3];
            this._value = Chroma(t.detail.value).rgba(), this._value[3] = e, this._updateColorDiff(), this._updateHue(), this._updateColor(), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitChange(), this._emitConfirm()
        }), this.$btnAdd.addEventListener("confirm", t => {
            t.stopPropagation();
            let e = Chroma(this._value).css(),
                i = this._newColorBox(e);
            this.$palette.appendChild(i), this._settings.colors.push(e), this._saveSettings()
        })
    },
    _initPalette() {
        this._settings.colors.forEach(t => {
            let e = this._newColorBox(t);
            this.$palette.appendChild(e)
        })
    },
    _newColorBox(t) {
        let e = document.createElement("div");
        e.classList.add("color-box");
        let i = document.createElement("div");
        return i.classList.add("inner"), i.style.backgroundColor = t, e.appendChild(i), e.addEventListener("contextmenu", t => {
            t.preventDefault();
            const s = new Menu;
            s.append(new MenuItem({
                label: "Replace",
                click: () => {
                    let t = DomUtils.index(e),
                        s = Chroma(this._value).css();
                    i.style.backgroundColor = s, this._settings.colors[t] = s, this._saveSettings()
                }
            })), s.append(new MenuItem({
                label: "Delete",
                click: () => {
                    let t = DomUtils.index(e);
                    e.remove(), this._settings.colors.splice(t, 1), this._saveSettings()
                }
            })), s.popup(Electron.remote.getCurrentWindow())
        }), e.addEventListener("mousedown", t => {
            if (t.stopPropagation(), 0 === t.button) return this._value = Chroma(i.style.backgroundColor).rgba(), this._updateColorDiff(), this._updateHue(), this._updateColor(), this._updateAlpha(), this._updateSliders(), this._updateHexInput(), this._emitChange(), this._emitConfirm(), void 0
        }), e
    },
    _saveSettings() {
        window.localStorage["ui-color-picker"] = JSON.stringify(this._settings)
    },
    _updateColorDiff() {
        this.$oldColor.style.backgroundColor = Chroma(this._lastAssigned).css(), this.$newColor.style.backgroundColor = Chroma(this._value).css()
    },
    _updateHue() {
        let t = Chroma(this._value).hsv();
        isNaN(t[0]) && (t[0] = 360), this.$hueHandle.style.top = `${100*(1-t[0]/360)}%`
    },
    _updateColor(t) {
        let e = Chroma(this._value).hsv();
        isNaN(e[0]) && (e[0] = 360);
        let i = void 0 === t ? e[0] : t,
            s = e[1],
            l = e[2],
            a = 1 - l;
        a = a * a * (3 - 2 * a), a *= 255, this.$colorCtrl.style.backgroundColor = Chroma(i, 1, 1, "hsv").hex(), this.$colorHandle.style.left = `${100*s}%`, this.$colorHandle.style.top = `${100*(1-l)}%`, this.$colorHandle.style.color = Chroma(a, a, a).hex()
    },
    _updateAlpha() {
        this.$alphaCtrl.style.backgroundColor = Chroma(this._value).hex(), this.$alphaHandle.style.top = `${100*(1-this._value[3])}%`
    },
    _updateSliders() {
        this.$sliderR.value = this._value[0], this.$sliderG.value = this._value[1], this.$sliderB.value = this._value[2], this.$sliderA.value = parseInt(255 * this._value[3])
    },
    _updateHexInput() {
        this.$hexInput.value = Chroma(this._value).hex().toUpperCase()
    },
    _emitConfirm() {
        DomUtils.fire(this, "confirm", {
            bubbles: !1,
            detail: {
                value: this._value
            }
        })
    },
    _emitCancel() {
        DomUtils.fire(this, "cancel", {
            bubbles: !1,
            detail: {
                value: this._value
            }
        })
    },
    _emitChange() {
        DomUtils.fire(this, "change", {
            bubbles: !1,
            detail: {
                value: this._value
            }
        })
    }
});