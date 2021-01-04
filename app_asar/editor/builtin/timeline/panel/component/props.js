"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    manager = require("../libs/manager"),
    advice = require("../libs/advice");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/props.html"), "utf-8"), exports.props = ["props", "node", "clip", "selected"], exports.watch = {
    node(e) {
        this.updateProps(e, this.clip)
    },
    clip(e) {
        this.updateProps(this.node, e)
    }
}, exports.data = function () {
    return {}
}, exports.methods = {
    t: Editor.T,
    updateProps(e, t) {
        if (!e || !t) return;
        let p = manager.Clip.queryCurve(t.id, e.path);
        for (; this.props.length;) this.props.pop();
        p && (Object.keys(p.props).forEach(e => {
            this.props.push({
                component: null,
                property: e
            })
        }), Object.keys(p.comps).forEach(e => {
            Object.keys(p.comps[e]).forEach(t => {
                this.props.push({
                    component: e,
                    property: t
                })
            })
        }))
    },
    _onScroll(e) {
        let t = e.target;
        advice.emit("property-scroll", t.scrollTop)
    },
    _onPropertyClick(e, t) {
        let p = this.selected.some(p => p.component === e && p.property === t);
        Editor.Ipc.sendToMain("timeline:menu-property-operation", {
            uuid: this.clip.id,
            path: this.node.path,
            component: e,
            property: t,
            selected: p,
            x: event.pageX,
            y: event.pageY
        })
    }
}, exports.created = function () {
    advice.on("property-scroll", e => {
        this.$el.scrollTop = e
    }), advice.on("clip-data-update", () => {
        this.updateProps(this.node, this.clip)
    })
};