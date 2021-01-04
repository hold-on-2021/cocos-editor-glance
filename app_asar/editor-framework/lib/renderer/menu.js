"use strict";
let Menu = {};
module.exports = Menu;
const Ipc = require("./ipc"),
    Console = require("./console");
Menu.checkTemplate = function (e) {
    for (var n = 0; n < e.length; ++n) {
        var u = e[n];
        if (u.click) return Console.error("The `click` event is not currently implemented for a page-level menu declaration due to known IPC deadlock problems in Electron"), !1;
        if (u.submenu && !Menu.checkTemplate(u.submenu)) return !1
    }
    return !0
}, Menu.popup = function (e, n, u) {
    Menu.checkTemplate(e) && Ipc.sendToMain("menu:popup", e, n, u)
}, Menu.register = function (e, n, u) {
    Menu.checkTemplate(n) && Ipc.sendToMain("menu:register", e, n, u)
}, Menu.walk = function (e, n) {
    Array.isArray(e) || (e = [e]), e.forEach(e => {
        n(e), e.submenu && Menu.walk(e.submenu, n)
    })
};