"use strict";
const ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr");
module.exports = ElementUtils.registerElement("ui-hint", {
    get position() {
        return this._position
    },
    set position(t) {
        this._position !== t && (this._position = t, this.classList.contains("top") || this.classList.contains("bottom") ? "-" === this._position[0] ? this.$arrow.style.right = this._position.substr(1) : this.$arrow.style.left = this._position : (this.classList.contains("left") || this.classList.contains("right")) && ("-" === this._position[0] ? this.$arrow.style.bottom = this._position.substr(1) : this.$arrow.style.top = this._position))
    },
    template: '\n    <div class="box">\n      <content></content>\n      <div class="arrow"></div>\n    </div>\n  ',
    $: {
        arrow: ".arrow"
    },
    style: ResMgr.getResource("theme://elements/hint.css"),
    factoryImpl(t) {
        t && (this.innerText = t)
    },
    ready() {
        let t = this.getAttribute("position");
        null === t && (t = "50%"), this.position = t
    }
});