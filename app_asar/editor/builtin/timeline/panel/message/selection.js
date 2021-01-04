"use strict";
const advice = require("../libs/advice"),
    utils = require("../libs/utils"),
    dump = require("../libs/dump");
let clearTimer = null,
    packHierarchy = function (e) {
        let i = [];
        for (; i.length;) i.pop();
        let t = function (e, r, a) {
            a = `${a}/${e.name}`, i.push({
                id: e.id,
                path: a,
                name: e.name,
                level: r,
                state: 0
            }), e.children && e.children.forEach(e => {
                t(e, r + 1, a)
            })
        };
        return e.forEach(e => {
            t(e, 0, "")
        }), i
    };
module.exports = {
    selected(e, i, t) {
        "node" === i && dump.update(() => {
            this.vm.updateState()
        })
    },
    unselected(e, i) {
        "node" === i && dump.update()
    },
    async activated(e, i, t) {
        if ("node" !== i || !t) return;
        if (clearTimeout(clearTimer), this.vm && this.vm.hierarchy.some(e => e.id === t && (advice.emit("change-node", e), !0)), !this.vm || this.vm.record) return;
        let r = await utils.promisify(Editor.Ipc.sendToPanel)("scene", "scene:query-animation-hierarchy", t);
        r = JSON.parse(r), this.vm.hierarchy && this.vm.hierarchy[0] && r[0].id === this.vm.hierarchy[0].id || (advice.emit("change-hierarchy", packHierarchy(r)), dump.root = r[0].id, this.vm.updateClips())
    },
    deactivated(e, i, t) {
        if ("node" === i && t) return this.vm.record ? (clearTimer = setTimeout(() => {
            advice.emit("change-node", {
                id: "",
                path: "////"
            })
        }, 100), void 0) : (clearTimer = setTimeout(() => {
            advice.emit("change-hierarchy", []), dump.root = "", this.vm.updateClips()
        }, 100), void 0)
    }
};