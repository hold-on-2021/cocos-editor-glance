"use strict";
const fs = require("fs"),
    path = require("path"),
    iconSrc = require("../../define").icon;
module.exports = {
    name: "prefab",
    template: fs.readFileSync(path.join(__dirname, "./prefab.html"), "utf-8"),
    props: {
        name: String,
        uuid: String,
        modify: {
            type: Boolean,
            required: !0
        },
        size: {
            type: Number,
            required: !0
        },
        matchid: String,
        local: Object,
        classify: Array,
        prefabindex: Number,
        popclickobj: Object
    },
    data() {
        return {
            iconSrc: iconSrc,
            allowDrag: !0,
            edit: !1,
            styleObj: {
                width: `${10*this.size+46}px`
            }
        }
    },
    watch: {
        size(e) {
            this.styleObj = {
                width: `${10*e+46}px`
            }
        },
        popclickobj(e) {
            this.matchid === this.uuid && ("rename" === e.clickType ? (this.edit = !0, this.$el.querySelector("input").focus()) : (this.classify[0].prefab.splice(this.prefabindex, 1), this.local.save()))
        }
    },
    methods: {
        onDragStart(e) {
            if (!this.allowDrag) return;
            e.stopPropagation();
            Editor.UI.DragDrop.start(e.dataTransfer, {
                effect: "copyMove",
                type: "asset",
                items: [{
                    id: this.uuid,
                    name: this.name
                }],
                options: {
                    unlinkPrefab: !0
                }
            })
        },
        onDragEnd(e) {
            Editor.UI.DragDrop.end()
        },
        onMouseUp(e) {
            if (e.preventDefault(), 2 !== e.button) return !1;
            Editor.Ipc.sendToMain("node-library:popup-prefab-menu", e.x, e.y, {
                id: this.uuid,
                name: this.name,
                modify: this.modify
            })
        },
        onInputKeyDown(e) {
            13 === e.keyCode && e.target.blur()
        },
        onInputFocus(e) {
            this.allowDrag = !1
        },
        onInputBlur(e) {
            this.allowDrag = !0, this.edit = !1, this.classify[0].prefab[this.prefabindex] = {
                name: this.name,
                uuid: this.uuid
            }, this.local.save()
        }
    }
};