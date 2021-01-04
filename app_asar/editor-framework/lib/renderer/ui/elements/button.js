"use strict";
const ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    Focusable = require("../behaviors/focusable"),
    Disable = require("../behaviors/disable"),
    ButtonState = require("../behaviors/button-state");
module.exports = ElementUtils.registerElement("ui-button", {
    behaviors: [Focusable, Disable, ButtonState],
    template: '\n    <div class="inner">\n      <content></content>\n    </div>\n  ',
    style: ResMgr.getResource("theme://elements/button.css"),
    factoryImpl(e) {
        e && (this.innerText = e)
    },
    ready() {
        this._initFocusable(this), this._initDisable(!1), this._initButtonState(this)
    },
    _onButtonClick() {
        setTimeout(() => {
            DomUtils.fire(this, "confirm", {
                bubbles: !1
            })
        }, 1)
    }
});