"use strict";
let Package = {};
module.exports = Package;
const Ipc = require("./ipc");
Package.reload = function (e) {
    Ipc.sendToMain("editor:package-reload", e)
}, Package.queryInfos = function (e) {
    Ipc.sendToMain("editor:package-query-infos", e)
}, Package.queryInfo = function (e, a) {
    Ipc.sendToMain("editor:package-query-info", e, a)
};