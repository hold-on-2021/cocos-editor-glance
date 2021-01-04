"use strict";
const manager = require("../libs/manager"),
    utils = require("../libs/utils"),
    advice = require("../libs/advice");
module.exports = {
    async "asset-changed"(e, i) {
        if ("animation-clip" !== i.type || !manager.isExists(i.uuid)) return;
        let s = await utils.promisify(cc.AssetLibrary.loadAsset)(i.uuid);
        if (manager.equal(i.uuid, s)) return;
        let t = manager.Clip.queryInfo(i.uuid);
        if (0 === Editor.Dialog.messageBox({
                type: "question",
                buttons: ["忽略", "读取硬盘数据"],
                title: "",
                message: `Clip - ${t.name}`,
                detail: "内容在外部被更改\n是否需要读取硬盘上的数据？",
                defaultId: 0,
                cancelId: 0,
                noLink: !0
            })) return manager.sync(i.uuid), void 0;
        let a = this.vm.clips.map(e => e.id),
            r = [];
        for (let e = 0; e < a.length; e++) {
            let i = a[e],
                s = await utils.promisify(cc.AssetLibrary.loadAsset)(i);
            r.push(s)
        }
        advice.emit("change-clips", r)
    },
    "assets-deleted"() {},
    "assets-moved"() {}
};