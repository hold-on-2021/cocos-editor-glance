"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    manager = require("../libs/manager"),
    advice = require("../libs/advice"),
    utils = require("../libs/utils");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/prop-row.html"), "utf-8"), exports.components = {
    "texture-preview": require("./texture-preview")
}, exports.props = ["offset", "scale", "node", "component", "property", "clip", "sample", "box", "selected"], exports.watch = {
    sample() {
        this.updateKeys()
    },
    box: {
        deep: !0,
        handler(e) {
            e.y >= this.$el.offsetTop + 20 || e.h + e.y <= this.$el.offsetTop + 4 || this.keys.forEach(t => {
                let r = t.frame * this.scale;
                if (r < e.x || r > e.x + e.w) return;
                let s = utils.packKey(this.clip.id, this.node.path, this.component, this.property, t.frame, t.value);
                this.checkSelected(s) || this.selected.push(s)
            })
        }
    }
}, exports.data = function () {
    return {
        keys: [],
        lines: [],
        virtualkeys: []
    }
}, exports.methods = {
    t: Editor.T,
    updateKeys() {
        let e = manager.Clip.queryProperty(this.clip.id, this.node.path, this.component, this.property);
        for (; this.keys.length;) this.keys.pop();
        for (; this.lines.length;) this.lines.pop();
        let t = null;
        e.forEach(e => {
            let r = e.value && e.value._uuid,
                s = {
                    frame: e.frame * this.sample | 0,
                    isAsset: r,
                    value: r ? Editor.serialize(e.value) : JSON.stringify(e.value),
                    source: e.value
                };
            t && s.value !== t.value && this.lines.push({
                frame: t.frame,
                length: s.frame - t.frame
            }), t = s, this.keys.push(s)
        })
    },
    queryLineStyle: (e, t, r, s) => `transform: translateX(${e*r+s-1|0}px); width: ${t*r}px`,
    checkSelected(e) {
        return -1 !== utils.indexOf(this.selected, {
            component: this.component,
            property: this.property,
            frame: e.frame
        })
    },
    dragKeyStart() {
        this.keys.forEach(e => {
            this.checkSelected(e) && this.virtualkeys.push({
                frame: parseFloat(e.frame),
                offset: 0,
                source: e.source,
                value: e.value
            })
        })
    },
    dragKeyMove(e) {
        this.virtualkeys.forEach(t => {
            t.offset = e
        })
    },
    dragKeyEnd() {
        for (; this.virtualkeys.length;) this.virtualkeys.pop();
        this.updateKeys()
    },
    queryKeyStyle: (e, t, r) => `transform: translateX(${e*t+r-1|0}px);`,
    queryVKeyStyle: (e, t, r, s) => `transform: translateX(${(e+t)*r+s-1|0}px);`,
    _onDragEnter(e) {
        "spriteFrame" === this.property && (e.dataTransfer.dropEffect = "copy"), advice.emit("ignore-pointer", !0)
    },
    _onDragLeave(e) {
        "spriteFrame" === this.property && (e.dataTransfer.dropEffect = "default"), advice.emit("ignore-pointer", !1)
    },
    _onDragOver(e) {
        if ("spriteFrame" !== this.property) return;
        e.preventDefault(), e.stopPropagation();
        let t = e.offsetX - this.offset,
            r = Math.round(t / this.scale);
        advice.emit("change-frame", r)
    },
    async _onDrop(e) {
        if (advice.emit("ignore-pointer", !1), "spriteFrame" !== this.property) return;
        Editor.UI.DragDrop.type(e.dataTransfer);
        let t = Editor.UI.DragDrop.items(e.dataTransfer),
            r = e.offsetX - this.offset,
            s = Math.round(r / this.scale),
            i = [];
        for (let e = 0; e < t.length; e++) {
            let r = t[e],
                s = await utils.promisify(cc.AssetLibrary.loadAsset)(r.id);
            if (s instanceof cc.Texture2D) {
                let e = await utils.promisify(Editor.assetdb.queryMetaInfoByUuid)(r.id),
                    t = JSON.parse(e.json),
                    s = Object.keys(t.subMetas);
                for (let e = 0; e < s.length; e++) {
                    let r = t.subMetas[s[e]],
                        a = await utils.promisify(cc.AssetLibrary.loadAsset)(r.uuid);
                    i.push(a)
                }
            } else s instanceof cc.SpriteFrame && i.push(s)
        }
        i.forEach((e, t) => {
            manager.Clip.addKey(this.clip.id, this.node.path, this.component, this.property, s + t, e)
        }), advice.emit("clip-data-update")
    },
    _onKeyClick(e) {
        event && event.preventDefault(), event && event.stopPropagation()
    },
    _onKeyMouseDown(e, t) {
        let r = utils.packKey(this.clip.id, this.node.path, this.component, this.property, t.frame, t.value);
        if (e && !e.ctrlKey && !e.metaKey && !this.checkSelected(r))
            for (; this.selected.length;) this.selected.pop();
        this.checkSelected(r) || this.selected.push(r)
    },
    _onKeyMouseUp(e, t) {
        let r = utils.packKey(this.clip.id, this.node.path, this.component, this.property, t.frame, t.value);
        this.checkSelected(r) || this.selected.push(r)
    },
    _onKeyDragStart(e, t) {
        let r = 0,
            s = 1 / 0;
        this.selected.forEach(e => {
            e.frame < s && (s = e.frame)
        }), advice.emit("drag-key-start"), Editor.UI.startDrag("ew-resize", e, (e, t, i, a, o) => {
            r += isNaN(t) ? 0 : t;
            let p = Math.round(r / this.scale);
            advice.emit("drag-key-move", Math.max(-s, p))
        }, (...e) => {
            let t = Math.round(r / this.scale);
            advice.emit("drag-key-end", Math.max(-s, t))
        })
    },
    _onLineClick(e) {
        event.preventDefault(), event.stopPropagation();
        let t = e.frame,
            r = e.frame + e.length;
        if (!event.ctrlKey && !event.metaKey)
            for (; this.selected.length;) this.selected.pop();
        for (let e = 0; e < this.keys.length; e++) {
            let s = this.keys[e];
            s.frame !== t && s.frame !== r || this.selected.push(utils.packKey(this.clip.id, this.node.path, this.component, this.property, s.frame, s.value))
        }
    },
    _onLineDBLClick(e) {
        advice.emit("change-eline", {
            id: this.clip.id,
            path: this.node.path,
            component: this.component,
            property: this.property,
            frame: e.frame
        })
    }
}, exports.created = function () {
    advice.on("drag-key-start", this.dragKeyStart), advice.on("drag-key-move", this.dragKeyMove), advice.on("drag-key-end", this.dragKeyEnd)
}, exports.compiled = function () {
    this.updateKeys()
}, exports.destroyed = function () {
    advice.removeListener("drag-key-start", this.dragKeyStart), advice.removeListener("drag-key-move", this.dragKeyMove), advice.removeListener("drag-key-end", this.dragKeyEnd)
};