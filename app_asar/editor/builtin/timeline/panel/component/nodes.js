"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    advice = require("../libs/advice"),
    manager = require("../libs/manager");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/nodes.html"), "utf-8"), exports.props = ["node", "hierarchy", "mnodes", "clip"], exports.data = function () {
    return {}
}, exports.methods = {
    t: (e, ...t) => Editor.T(`timeline.nodes.${e}`, ...t),
    getRoot() {
        let e = this.hierarchy && this.hierarchy[0];
        return e = e || {}, e.name || ""
    },
    getPath: e => e.replace(/\/[^\/]+(\/)?/, ""),
    queryNodeStyle: e => `text-indent: ${15*e}px;`,
    _onScroll(e) {
        let t = e.target;
        advice.emit("hierarchy-scroll", t.scrollTop)
    },
    _onNodeClick(e) {
        Editor.Selection.select("node", e.id), advice.emit("change-node", e)
    },
    _onVNodeClick(e) {
        Editor.Selection.unselect("node", e.id), advice.emit("change-node", e)
    },
    _onNodeMoreClick(e) {
        Editor.Ipc.sendToMain("timeline:menu-node-operation", {
            path: e.path,
            type: "node",
            x: event.pageX,
            y: event.pageY
        })
    },
    _onVNodeMoreClick(e) {
        Editor.Ipc.sendToMain("timeline:menu-node-operation", {
            path: e.name,
            type: "vnode",
            x: event.pageX,
            y: event.pageY
        })
    },
    _onNodeInputBlur(e, t) {
        let i = "/" + this.getRoot();
        if (e.target.value && (i += "/" + e.target.value), i === t.path) return;
        let a = manager.Clip.deleteCurve(this.clip.id, t.path);
        a && manager.Clip.addCurve(this.clip.id, i, a), t.state = 0, advice.emit("clip-data-update")
    },
    _onVNodeInputBlur(e, t) {
        let i = "/" + this.getRoot();
        if (e.target.value && (i += "/" + e.target.value), i === t.name) return;
        let a = manager.Clip.deleteCurve(this.clip.id, t.name);
        a && manager.Clip.addCurve(this.clip.id, i, a), t.state = 0, advice.emit("clip-data-update")
    },
    _onNodeInputKeydown(e, t) {
        13 === e.keyCode ? t.state = 0 : 27 === e.keyCode && (e.target.value = t.path.replace(/\/[^\/]+(\/)?/, ""), t.state = 0)
    },
    _onVNodeInputKeydown(e, t) {
        13 === e.keyCode ? t.state = 0 : 27 === e.keyCode && (e.target.value = t.name.replace(/\/[^\/]+(\/)?/, ""), t.state = 0)
    }
}, exports.created = function () {
    advice.on("hierarchy-scroll", e => {
        this.$el.scrollTop = e
    })
}, exports.directives = {
    focus: {
        bind() {
            setTimeout(() => {
                this.el.focus()
            }, 200)
        }
    }
};