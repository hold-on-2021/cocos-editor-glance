"use strict";
const manager = require("../libs/manager"),
    advice = require("../libs/advice"),
    dump = require("../libs/dump");
module.exports = {
    "property-add"(e, t) {
        let a = null,
            p = t.split(".");
        p.length > 1 && (t = p.pop(), a = p.join(".")), manager.Clip.addProperty(this.vm.clip.id, this.vm.node.path, a, t), advice.emit("clip-data-update")
    },
    "property-remove"(e, t) {
        manager.Clip.deleteProperty(this.vm.clip.id, this.vm.node.path, t.component, t.property), advice.emit("clip-data-update")
    },
    "property-add-key"(e, t) {
        this.vm.frame, this.vm.sample;
        try {
            let e = dump.getProperty(this.vm.node.id, t.component, t.property);
            if (!manager.Clip.addKey(t.uuid, t.path, t.component, t.property, this.vm.frame, e)) return;
            advice.emit("clip-data-update")
        } catch (e) {
            Editor.warn(e)
        }
    },
    "property-delete-selected-key"(e, t) {
        let a = this.vm.selected.filter(e => e.component === t.component && e.property === t.property && e.id === t.uuid && e.path === t.path),
            p = a.map(e => e.frame);
        a.forEach(e => {
            let t = this.vm.selected.indexOf(e); - 1 !== t && this.vm.selected.splice(t, 1)
        }), p.forEach(e => {
            manager.Clip.deleteKey(t.uuid, t.path, t.component, t.property, e)
        }), advice.emit("clip-data-update")
    },
    "property-clear"(e, t) {
        let a = manager.Clip.queryProperty(t.uuid, t.path, t.component, t.property),
            p = manager.Clip.queryInfo(t.uuid);
        a.map(e => e.frame * p.sample | 0).forEach(e => {
            manager.Clip.deleteKey(t.uuid, t.path, t.component, t.property, e)
        }), advice.emit("clip-data-update")
    },
    "edit-event"(e, t) {
        advice.emit("change-event", t.frame)
    },
    "delete-event"(e, t) {
        advice.emit("remove-empty-event", t.frame)
    },
    "clear-node"(e, t) {
        manager.Clip.deleteCurve(this.vm.clip.id, t.path) && advice.emit("clip-data-update")
    },
    "rename-node"(e, t) {
        "vnode" === t.type ? this.vm.mnodes.some(e => e.name === t.path && (e.state = 1, !0)) : this.vm.hierarchy.some(e => e.path === t.path && (e.state = 1, !0))
    }
};