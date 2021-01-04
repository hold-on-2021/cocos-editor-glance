"use strict";
const Chroma = require("chroma-js"),
    ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr");
module.exports = ElementUtils.registerElement("ui-loader", {
    get inline() {
        return null !== this.getAttribute("inline")
    },
    set inline(e) {
        e ? this.setAttribute("inline", "") : this.removeAttribute("inline")
    },
    get maskColor() {
        return this._maskColor
    },
    set maskColor(e) {
        let t = Chroma(e).rgba();
        t !== this._maskColor && (this._maskColor = t, this.style.backgroundColor = Chroma(t).css())
    },
    template: '\n    <div class="animate"></div>\n    <div class="label">\n      <content></content>\n    </div>\n  ',
    style: ResMgr.getResource("theme://elements/loader.css"),
    factoryImpl(e) {
        e && (this.innerText = e)
    },
    ready() {
        let e = this.getAttribute("color");
        this._maskColor = null !== e ? Chroma(e).rgba() : [0, 0, 0, .3], this.style.backgroundColor = Chroma(this.maskColor).css()
    }
});