"use strict";
const Hljs = require("highlight.js"),
    Remarkable = require("remarkable"),
    ElementUtils = require("./utils"),
    ResMgr = require("../utils/resource-mgr"),
    Console = require("../../console");
module.exports = ElementUtils.registerElement("ui-markdown", {
    get value() {
        return this._value
    },
    set value(e) {
        null !== e && void 0 !== e || (e = ""), this._value !== e && (this._value = e, this._render())
    },
    get values() {
        return this._values
    },
    set values(e) {
        return this._values = e
    },
    get multiValues() {
        return this._multiValues
    },
    set multiValues(e) {
        if (e = !(null == e || !1 === e), e !== this._multiValues) return this._multiValues = e, e ? this.setAttribute("multi-values", "") : this.removeAttribute("multi-values"), e
    },
    attributeChangedCallback(e, t, l) {
        if ("multi-values" == e) {
            this[e.replace(/\-(\w)/g, function (e, t) {
                return t.toUpperCase()
            })] = l
        }
    },
    template: '\n    <div class="container"></div>\n  ',
    style: ResMgr.getResource("theme://elements/markdown.css"),
    $: {
        container: ".container"
    },
    factoryImpl(e) {
        e && (this.value = e)
    },
    ready() {
        this.value = this._unindent(this.textContent), this.multiValues = this.getAttribute("multi-values")
    },
    _render() {
        let e = new Remarkable({
            html: !0,
            highlight(e, t) {
                if (t && Hljs.getLanguage(t)) try {
                    return Hljs.highlight(t, e).value
                } catch (e) {
                    Console.error(`Syntax highlight failed: ${e.message}`)
                }
                try {
                    return Hljs.highlightAuto(e).value
                } catch (e) {
                    Console.error(`Syntax highlight failed: ${e.message}`)
                }
                return ""
            }
        }).render(this.value);
        this.$container.innerHTML = e
    },
    _unindent(e) {
        if (!e) return e;
        let t = e.replace(/\t/g, "  ").split("\n"),
            l = t.reduce((e, t) => {
                if (/^\s*$/.test(t)) return e;
                let l = t.match(/^(\s*)/)[0].length;
                return null === e ? l : l < e ? l : e
            }, null);
        return t.map(e => e.substr(l)).join("\n")
    }
});