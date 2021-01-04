"use strict";
const ElementUtils = require("./utils"),
    Droppable = require("../behaviors/droppable"),
    Disable = require("../behaviors/disable");
module.exports = ElementUtils.registerElement("ui-drop-area", {
    shadowDOM: !1,
    behaviors: [Droppable, Disable],
    ready() {
        this._initDroppable(this), this._initDisable(!1)
    }
});