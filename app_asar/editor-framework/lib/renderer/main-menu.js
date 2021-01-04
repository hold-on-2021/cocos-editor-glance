"use strict";
let MainMenu = {};
module.exports = MainMenu;
const Ipc = require("./ipc"),
    Menu = require("./menu");
MainMenu.init = function () {
    Ipc.sendToMain("main-menu:init")
}, MainMenu.apply = function () {
    Ipc.sendToMain("main-menu:apply")
}, MainMenu.update = function (n, e) {
    Menu.checkTemplate(e) && Ipc.sendToMain("main-menu:update", n, e)
}, MainMenu.add = function (n, e) {
    Menu.checkTemplate(e) && Ipc.sendToMain("main-menu:add", n, e)
}, MainMenu.remove = function (n) {
    Ipc.sendToMain("main-menu:remove", n)
}, MainMenu.set = function (n, e) {
    Ipc.sendToMain("main-menu:set", n, e)
};