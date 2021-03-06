"use strict";
let Console = {};
module.exports = Console;
const Util = require("util"),
    Ipc = require("./ipc");
Console.trace = function (o, e, ...n) {
    e = n.length ? Util.format.apply(Util, [e, ...n]) : "" + e, console.trace(e);
    let l = new Error("dummy").stack.split("\n");
    l.shift(), l[0] = e, e = l.join("\n"), Ipc.sendToMain("editor:renderer-console-trace", o, e)
}, Console.log = function (o, ...e) {
    o = e.length ? Util.format.apply(Util, arguments) : "" + o, console.log(o), Ipc.sendToMain("editor:renderer-console-log", o)
}, Console.success = function (o, ...e) {
    o = e.length ? Util.format.apply(Util, arguments) : "" + o, console.log("%c" + o, "color: green"), Ipc.sendToMain("editor:renderer-console-success", o)
}, Console.failed = function (o, ...e) {
    o = e.length ? Util.format.apply(Util, arguments) : "" + o, console.log("%c" + o, "color: red"), Ipc.sendToMain("editor:renderer-console-failed", o)
}, Console.info = function (o, ...e) {
    o = e.length ? Util.format.apply(Util, arguments) : "" + o, console.info(o), Ipc.sendToMain("editor:renderer-console-info", o)
}, Console.warn = function (o, ...e) {
    o = e.length ? Util.format.apply(Util, arguments) : "" + o, console.warn(o), Ipc.sendToMain("editor:renderer-console-warn", o)
}, Console.error = function (o, ...e) {
    o = e.length ? Util.format.apply(Util, arguments) : "" + o, console.error(o);
    let n = new Error("dummy").stack.split("\n");
    n.shift(), n[0] = o, o = n.join("\n"), Ipc.sendToMain("editor:renderer-console-error", o)
};