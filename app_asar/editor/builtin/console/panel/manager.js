"use strict";
var list = exports.list = [],
    renderCmds = exports.renderCmds = null,
    itemHeight = exports.itemHeight = null;
exports.setRenderCmds = function (e, t) {
    renderCmds = exports.renderCmds = e, itemHeight = exports.itemHeight = t
};
var collapse = !0,
    filterType = "",
    filterText = "",
    filterRegex = !1;
exports.addItems = function (e) {
    e.forEach(e => {
        exports.addItem(e)
    })
}, exports.addItem = function (e) {
    var t = {};
    t.type = e.type;
    var r = e.message.split("\n");
    r = r.filter(e => "" !== e), t.rows = r.length, t.title = r[0], t.info = r.splice(1).join("\n"), t.fold = !0, t.num = 1, list.push(t), exports.update()
}, exports.clear = function () {
    for (; list.length > 0;) list.pop();
    exports.update()
};
var updateLocker = !1;
exports.update = function () {
    !updateLocker && renderCmds && (updateLocker = !0, requestAnimationFrame(() => {
        updateLocker = !1;
        for (var e = 0; renderCmds.length > 0;) renderCmds.pop();
        var t = filterText;
        if (filterRegex) try {
            t = new RegExp(t)
        } catch (e) {
            t = /.*/
        }
        list.filter(e => !!e.title && ((!filterType || e.type === filterType) && (filterRegex ? t.test(e.title) : -1 !== e.title.indexOf(t)))).forEach(t => {
            var r = renderCmds[renderCmds.length - 1];
            if (collapse && r && t.title === r.title && t.info === r.info && t.type === r.type) return r.num += 1, void 0;
            t.num = 1, t.translateY = e, renderCmds.push(t), t.fold ? e += exports.itemHeight : e += t.rows * (exports.itemHeight - 2) + 14
        })
    }))
}, exports.setCollapse = function (e) {
    collapse = !!e, exports.update()
}, exports.setFilterType = function (e) {
    filterType = e, exports.update()
}, exports.setFilterText = function (e) {
    filterText = e, exports.update()
}, exports.setFilterRegex = function (e) {
    filterRegex = !!e, exports.update()
};