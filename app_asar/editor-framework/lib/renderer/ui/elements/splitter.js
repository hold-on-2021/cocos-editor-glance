"use strict";
const ElementUtils = require("./utils"),
    Resizable = require("../behaviors/resizable"),
    ResMgr = require("../utils/resource-mgr");
module.exports = ElementUtils.registerElement("ui-splitter", {
    behaviors: [Resizable],
    template: '\n    <div class="content">\n      <content></content>\n    </div>\n  ',
    style: ResMgr.getResource("theme://elements/splitter.css"),
    ready() {
        this._initResizable(), this._needEvaluateSize = 0 !== this.children.length;
        for (let e = 0; e < this.children.length; ++e) {
            if ("UI-SPLITTER" !== this.children[e].tagName) {
                this._needEvaluateSize = !1;
                break
            }
        }
        this._initResizers(), window.requestAnimationFrame(() => {
            "UI-SPLITTER" !== this.parentElement.tagName && (this._finalizeMinMaxRecursively(), this._finalizePreferredSizeRecursively(), this._finalizeStyleRecursively(), this._reflowRecursively())
        })
    },
    _initResizers() {
        if (this._needEvaluateSize && this.children.length > 1)
            for (let e = 0; e < this.children.length; ++e)
                if (e !== this.children.length - 1) {
                    let i = this.children[e + 1],
                        t = document.createElement("ui-dock-resizer");
                    t.vertical = this.row, this.insertBefore(t, i), e += 1
                }
    }
});