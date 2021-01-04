"use strict";
const ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable");
module.exports = ElementUtils.registerElement("ui-box-container", {
    behaviors: [Focusable, Disable],
    style: ResMgr.getResource("theme://elements/box-container.css"),
    template: "\n    <content></content>\n  ",
    ready() {
        this._initFocusable(this), this._initDisable(!0)
    }
});