"use strict";
const ElementUtils = require("./utils"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable");
module.exports = ElementUtils.registerElement("ui-vlist", {
    behaviors: [Focusable, Disable],
    template: "\n    <content></content>\n  ",
    factoryImpl(e) {
        e && (this._items = e)
    },
    ready() {
        this._initFocusable(this), this._initDisable(!0)
    }
});