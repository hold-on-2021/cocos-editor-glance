"use strict";
const dump = require("../libs/dump"),
    utils = require("../libs/utils"),
    advice = require("../libs/advice"),
    manager = require("../libs/manager");
module.exports = {
    ready() {
        this.vm.init()
    },
    reloading() {
        this.vm.init()
    },
    async "animation-clip-changed"(e, t) {
        let i = await utils.promisify(cc.AssetLibrary.loadJson)(t.data);
        i._uuid = t.uuid, manager.unregister(i), manager.register(i)
    },
    "animation-state-changed"() {},
    "node-component-added"(e, t) {
        t.node === dump.root && "cc.Animation" === t.component && dump.update(() => {
            this.vm.updateState()
        })
    },
    "node-component-removed"(e, t) {
        t.node === dump.root && dump.update(() => {
            this.vm.updateState()
        })
    },
    async "node-component-updated"(e, t) {
        t.node && t.node === dump.root && await this.vm.updateClips()
    }
};