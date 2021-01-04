"use strict";
const advice = require("../libs/advice"),
    dump = require("../libs/dump"),
    utils = require("../libs/utils"),
    manager = require("../libs/manager");
module.exports = {
    "record-node-changed"(e, i) {
        let r = i[0],
            t = dump.diff(r.id, r.dump),
            a = this.vm;
        t.forEach(e => {
            let i = manager.Clip.queryCurve(a.clip.id, a.node.path);
            if (e.component) {
                if (!i.comps[e.component] || !i.comps[e.component][e.property]) return
            } else if (!i.props[e.property]) return;
            manager.Clip.deleteKey(a.clip.id, a.node.path, e.component, e.property, a.frame), manager.Clip.addKey(a.clip.id, a.node.path, e.component, e.property, a.frame, e.value)
        }), advice.emit("clip-data-update")
    },
    "start-recording"() {
        this.vm.record = !0;
        let e = this.vm.hierarchy[0].id,
            i = this.vm.clip.name;
        Editor.Ipc.sendToPanel("scene", "scene:animation-current-clip-changed", {
            rootId: e,
            clip: i
        })
    },
    async "stop-recording"() {
        this.vm.record = !1;
        let e = this.vm.clip ? this.vm.clip.id : "";
        if (!e) return;
        let i = await utils.promisify(cc.AssetLibrary.loadAsset)(e);
        manager.unregister(i), manager.register(i), advice.emit("clip-data-update"), this.vm.init()
    }
};