"use strict";
const Polyglot = require("node-polyglot");
let polyglot = new Polyglot,
    i18nReg = /^i18n:/;
module.exports = {
    format: t => i18nReg.test(t) ? polyglot.t(t.substr(5)) : t,
    formatPath(t) {
        let l = t.split("/");
        return l = l.map(t => this.format(t)), l.join("/")
    },
    t: (t, l) => polyglot.t(t, l),
    extend(t) {
        polyglot.extend(t)
    },
    replace(t) {
        polyglot.replace(t)
    },
    unset(t) {
        polyglot.unset(t)
    },
    clear() {
        polyglot.clear()
    },
    _phrases: () => polyglot.phrases,
    get polyglot() {
        return polyglot
    }
};