"use strict";
const ElementUtils = require("./utils"),
    MathUtils = require("../../../share/math"),
    ResMgr = require("../utils/resource-mgr");
module.exports = ElementUtils.registerElement("ui-progress", {
    get value() {
        return this._value
    },
    set value(e) {
        null !== e && void 0 !== e || (e = 0), e = parseInt(MathUtils.clamp(e, 0, 100)), this._value !== e && (this._value = e, this._updateProgressBar())
    },
    template: '\n    <div class="bar">\n      <div class="label"></div>\n    </div>\n  ',
    style: ResMgr.getResource("theme://elements/progress.css"),
    $: {
        bar: ".bar",
        label: ".label"
    },
    factoryImpl(e) {
        e && (this.value = e)
    },
    ready() {
        this.$bar.addEventListener("transitionend", () => {
            this._inTransition = !1, this.$label.innerText = `${this._value}%`
        }), this._inTransition = !1;
        let e = parseFloat(this.getAttribute("value"));
        this._value = isNaN(e) ? 0 : e, this.$bar.style.width = `${this._value}%`, this.$label.innerText = `${this._value}%`
    },
    _updateProgressBar() {
        this._inTransition = !0, this.$bar.style.width = `${this._value}%`, this._updateLabel()
    },
    _updateLabel() {
        window.requestAnimationFrame(() => {
            if (!this._inTransition) return;
            let e = this.clientWidth - 4,
                t = this.$bar.clientWidth,
                i = parseInt(t / e * 100);
            t <= 30 && (i = 0), this.$label.innerText = `${i}%`, this._updateLabel()
        })
    }
});