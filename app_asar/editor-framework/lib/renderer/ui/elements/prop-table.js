"use strict";

function _newRow(e, t) {
    let o = document.createElement("tr");
    return e && o.setAttribute("disabled", ""), t && o.setAttribute("readonly", ""), JS.addon(o, Disable), JS.addon(o, Readonly), o._initDisable(!0), o._initReadonly(!0), o.addEventListener("focus-changed", e => {
        e.detail.focused ? o.setAttribute("selected", "") : o.removeAttribute("selected")
    }), o.addEventListener("mouseover", e => {
        e.stopImmediatePropagation(), o.setAttribute("hovering", "")
    }), o.addEventListener("mouseout", e => {
        e.stopImmediatePropagation(), o.removeAttribute("hovering")
    }), o.addEventListener("mousedown", e => {
        DomUtils.acceptEvent(e), FocusMgr._setFocusElement(null);
        let t = FocusMgr._getFirstFocusableFrom(o, !0);
        t && FocusMgr._setFocusElement(t)
    }), o
}

function _newLabel(e, t) {
    let o = document.createElement("th");
    return o.classList.add("label"), o.innerText = e, o.addEventListener("mouseenter", () => {
        t && _showTooltip(o, t)
    }), o.addEventListener("mouseleave", () => {
        t && _hideTooltip(o)
    }), o
}

function _newWrapper(e) {
    let t = document.createElement("th");
    t.classList.add("wrapper");
    let o = document.importNode(e, !0);
    return t.appendChild(o), t
}

function _showTooltip(e, t) {
    _tooltipEL || ((_tooltipEL = new Hint(t)).style.display = "none", _tooltipEL.style.position = "absolute", _tooltipEL.style.maxWidth = "200px", _tooltipEL.style.zIndex = "999", _tooltipEL.classList = "bottom shadow", _tooltipEL.position = "20px", document.body.appendChild(_tooltipEL)), _tooltipEL.innerText = t, e._showTooltipID = setTimeout(() => {
        e._showTooltipID = null, _tooltipEL.style.display = "block";
        let t = e.getBoundingClientRect(),
            o = _tooltipEL.getBoundingClientRect();
        _tooltipEL.style.left = t.left - 10, _tooltipEL.style.top = t.top - o.height - 10
    }, 200)
}

function _hideTooltip(e) {
    clearTimeout(e._showTooltipID), e._showTooltipID = null, _tooltipEL && (_tooltipEL.style.display = "none")
}
const ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    Hint = require("./hint"),
    Disable = require("../behaviors/disable"),
    Readonly = require("../behaviors/readonly"),
    JS = require("../../../share/js-utils");
let _tooltipEL = null;
module.exports = ElementUtils.registerElement("ui-prop-table", {
    style: ResMgr.getResource("theme://elements/prop-table.css"),
    template: "\n    <table></table>\n  ",
    $: {
        table: "table"
    },
    ready() {
        let e = this.querySelector("template");
        if (e && e.content) {
            e.content.querySelectorAll("ui-row").forEach(e => {
                let t = e.getAttribute("name"),
                    o = e.getAttribute("tooltip"),
                    l = _newRow(null !== e.getAttribute("disabled"), null !== e.getAttribute("readonly")),
                    i = _newLabel(t, o);
                l.appendChild(i);
                for (let t = 0; t < e.children.length; ++t) {
                    let o = _newWrapper(e.children[t]);
                    l.appendChild(o)
                }
                this.$table.appendChild(l), l._disabled && DomUtils.walk(l, {
                    excludeSelf: !0
                }, e => (e._setIsDisabledAttribute && e._setIsDisabledAttribute(!0), !1)), l._readonly && DomUtils.walk(l, {
                    excludeSelf: !0
                }, e => (e._setIsReadonlyAttribute && e._setIsReadonlyAttribute(!0), !1))
            })
        }
    }
});