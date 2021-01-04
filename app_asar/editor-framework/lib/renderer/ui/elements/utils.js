"use strict";

function _doRegen(e, t, r) {
    let o;
    if (t.hasUserContent) {
        let t = e.querySelector(".user-content");
        (t = t || e).children.length && (o = [].slice.call(t.children, 0))
    }
    DomUtils.clear(e);
    let s = e.shadowRoot.getElementById("custom-style");
    if (s && s.remove(), JS.assignExcept(e, t, ["template", "style", "attrs", "value", "hasUserContent"]), void 0 === e._attrs && t.attrs) {
        let r = {};
        for (let o in t.attrs) {
            let s = e.getAttribute(o);
            if (null !== s) {
                let e = t.attrs[o];
                r[o] = e(s)
            }
        }
        e._attrs = r
    }
    if (void 0 === e._value) {
        let r = e.getAttribute("value");
        null !== r && (e._value = t.value(r))
    }
    if (t.template) {
        let r = typeof t.template;
        "string" === r ? e.innerHTML = t.template : "function" === r && (e.innerHTML = t.template(e._attrs))
    }
    if (t.hasUserContent && o) {
        let t = document.createElement("div");
        t.classList = ["user-content"], o.forEach(e => {
            t.appendChild(e.cloneNode(!0))
        }), e.insertBefore(t, e.firstChild)
    }
    if (t.style) {
        let r = document.createElement("style");
        r.type = "text/css", r.textContent = t.style, r.id = "custom-style", e.shadowRoot.insertBefore(r, e.shadowRoot.firstChild)
    }
    e._propgateDisable(), e._propgateReadonly(), e.ready && e.ready(o), r && r()
}
let Utils = {};
module.exports = Utils;
let _type2proto = {};
const Chroma = require("chroma-js"),
    Console = require("../../console"),
    JS = require("../../../share/js-utils"),
    ResMgr = require("../utils/resource-mgr"),
    DomUtils = require("../utils/dom-utils");
Utils.registerElement = function (e, t) {
    let r = t.template,
        o = t.style,
        s = t.listeners,
        n = t.behaviors,
        l = t.$,
        i = t.factoryImpl,
        a = !0;
    void 0 !== t.shadowDOM && (a = !!t.shadowDOM);
    let c = function () {
        let t = document.createElement(e);
        return i && i.apply(t, arguments), t
    };
    return c.prototype = Object.create(HTMLElement.prototype), JS.assignExcept(c.prototype, t, ["shadowDOM", "dependencies", "factoryImpl", "template", "style", "listeners", "behaviors", "$"]), n && n.forEach(e => {
        JS.addon(c.prototype, e)
    }), c.prototype.constructor = c, c.prototype.createdCallback = function () {
        let e = this;
        if (a && (e = this.createShadowRoot()), r && (e.innerHTML = r), o)
            if (a) {
                let t = document.createElement("style");
                t.type = "text/css", t.textContent = o, e.insertBefore(t, e.firstChild)
            } else Console.warn("Can not use style in light DOM");
        if (l)
            for (let t in l) this[`$${t}`] ? Console.warn(`Failed to assign selector $${t}, already used`) : this[`$${t}`] = e.querySelector(l[t]);
        if (s)
            for (let e in s) this.addEventListener(e, s[e].bind(this));
        this.ready && this.ready()
    }, Object.defineProperty(c, "tagName", {
        get: () => e.toUpperCase()
    }), document.registerElement(e, c), c
}, Utils.registerProperty = function (e, t) {
    _type2proto[e] = t
}, Utils.unregisterProperty = function (e) {
    delete _type2proto[e]
}, Utils.getProperty = function (e) {
    return _type2proto[e]
}, Utils.regenProperty = function (e, t) {
    let r = _type2proto[e._type];
    if (!r) return Console.warn(`Failed to regen property ${e._type}: type not registered.`), void 0;
    if ("string" == typeof r) return ResMgr.importScript(r).then(r => {
        try {
            _doRegen(e, r, t)
        } catch (e) {
            Console.error(e.stack), t && t(e)
        }
    }).catch(e => {
        Console.error(e.stack), t && t(e)
    }), void 0;
    try {
        _doRegen(e, r, t)
    } catch (e) {
        Console.error(e.stack), t && t(e)
    }
}, Utils.parseString = function (e) {
    return e
}, Utils.parseBoolean = function (e) {
    return "false" !== e && null !== e
}, Utils.parseColor = function (e) {
    return Chroma(e).rgba()
}, Utils.parseArray = function (e) {
    return JSON.parse(e)
}, Utils.parseObject = function (e) {
    return JSON.parse(e)
};