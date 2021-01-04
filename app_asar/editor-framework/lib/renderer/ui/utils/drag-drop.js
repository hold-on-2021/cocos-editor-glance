"use strict";
let DragDrop = {};
module.exports = DragDrop;
const _ = require("lodash"),
    Path = require("fire-path"),
    Electron = require("electron"),
    Console = require("../../console"),
    Ipc = require("../../ipc");
let _dragging = !1,
    _type = "",
    _items = [],
    _options = {};
DragDrop.start = function (e, t) {
    let r = t.items || [],
        n = t.type || "",
        o = t.effect || "",
        i = !!t.buildImage,
        a = t.options || {};
    if (Array.isArray(r) || (r = [r]), _dragging && Console.warn("DragDrop.end() has not been invoked."), _dragging = !0, _type = n, _items = r, _options = a, e.effectAllowed = o, e.dropEffect = "none", i) {
        let t = this.getDragIcon(r);
        e.setDragImage(t, -10, 10)
    }
    Ipc.sendToWins("editor:dragstart", {
        type: n,
        items: r,
        options: a
    })
}, DragDrop.end = function () {
    _dragging = !1, _type = "", _items = [], _options = {}, Ipc.sendToWins("editor:dragend")
}, DragDrop.updateDropEffect = function (e, t) {
    if (-1 === ["copy", "move", "link", "none"].indexOf(t)) return Console.warn("dropEffect must be one of 'copy', 'move', 'link' or 'none'"), e.dropEffect = "none", void 0;
    e.dropEffect = t
}, DragDrop.type = function (e) {
    return e && -1 !== e.types.indexOf("Files") ? "file" : _dragging ? _type : ""
}, DragDrop.filterFiles = function (e) {
    let t = [];
    for (let r = 0; r < e.length; ++r) {
        let n = !1;
        for (let o = 0; o < t.length; ++o)
            if (Path.contains(t[o].path, e[r].path)) {
                n = !0;
                break
            } n || t.push(e[r])
    }
    return t
}, DragDrop.items = function (e) {
    if (e && e.files.length > 0) {
        let t = new Array(e.files.length);
        for (let r = 0; r < e.files.length; ++r) t[r] = e.files[r];
        return t
    }
    return _dragging ? _items.slice() : []
}, DragDrop.getDragIcon = function (e) {
    let t = new Image,
        r = document.createElement("canvas"),
        n = r.getContext("2d");
    n.font = "normal 12px Arial", n.fillStyle = "white";
    let o = 0;
    for (let t = 0; t < e.length; ++t) {
        let r = e[t];
        if (!(t <= 4)) {
            n.fillStyle = "gray", n.fillText("[more...]", 20, o + 15);
            break
        }
        r.icon && void 0 !== r.icon.naturalWidth && 0 !== r.icon.naturalWidth && n.drawImage(r.icon, 0, o, 16, 16), n.fillText(r.name, 20, o + 15), o += 15
    }
    return t.src = r.toDataURL(), t
}, DragDrop.options = function () {
    return _.cloneDeep(_options)
}, DragDrop.getLength = function () {
    return _items.length
}, Object.defineProperty(DragDrop, "dragging", {
    enumerable: !0,
    get: () => _dragging
});
const ipcRenderer = Electron.ipcRenderer;
ipcRenderer.on("editor:dragstart", (e, t) => {
    _dragging = !0, _type = t.type, _items = t.items, _options = t.options
}), ipcRenderer.on("editor:dragend", () => {
    _dragging = !1, _type = "", _items = [], _options = {}
});