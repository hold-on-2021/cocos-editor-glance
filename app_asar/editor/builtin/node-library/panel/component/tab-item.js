"use strict";
const fs = require("fs"),
    path = require("path");
module.exports = {
    name: "tab-item",
    template: fs.readFileSync(path.join(__dirname, "./tab-item.html"), "utf-8"),
    props: {
        classify: {
            type: Array,
            required: !0
        },
        size: {
            type: Number,
            required: !0
        },
        modify: {
            type: Boolean,
            required: !0
        },
        local: {
            type: Object,
            required: !0
        },
        matchid: {
            type: String,
            required: !1
        },
        popclickobj: {
            type: Object,
            required: !0
        }
    },
    components: {
        prefab: require("./prefab")
    },
    data: () => ({
        isDrag: !1
    }),
    methods: {
        onDropAreaMove(e) {
            this.modify && Editor.UI.DragDrop.updateDropEffect(e.detail.dataTransfer, "copy")
        },
        onDropAreaAccept(e) {
            e.preventDefault();
            e.detail.dragItems.map(e => e.id).forEach(e => {
                Editor.assetdb.queryMetaInfoByUuid(e, (r, t) => {
                    if ("prefab" !== t.defaultType) return Editor.warn(Editor.T("NODE_LIBRARY.warning.prefab_only"));
                    Editor.assetdb.queryInfoByUuid(e, (r, t) => {
                        let a = path.basename(t.path).replace(/\.([^\.]+)$/, ""),
                            i = this.classify;
                        i.length || i.push({
                            name: "Default",
                            title: "自定义",
                            prefab: []
                        });
                        if (i[0].prefab.some(r => r.uuid === e)) return Editor.warn(Editor.T("NODE_LIBRARY.warning.prefab_exists"));
                        i[0].prefab.push({
                            uuid: e,
                            name: a
                        }), "Default" === i[0].name && this.local.save()
                    })
                })
            })
        }
    }
};