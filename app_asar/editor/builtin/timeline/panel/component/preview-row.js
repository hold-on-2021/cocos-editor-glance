"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    manager = require("../libs/manager"),
    advice = require("../libs/advice"),
    utils = require("../libs/utils");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/preview-row.html"), "utf-8"), exports.props = ["size", "offset", "scale", "clip", "node", "sample", "selected", "box"], exports.watch = {
    size: {
        deep: !0,
        handler() {
            this.updateDisplay()
        }
    },
    clip() {
        this.updateKeys()
    },
    sample() {
        this.updateKeys()
    },
    box: {
        deep: !0,
        handler(e) {
            e.y >= this.$el.offsetTop + 20 || e.h + e.y <= this.$el.offsetTop + 4 || this.keys.forEach(t => {
                let s = t.frame * this.scale;
                if (s < e.x || s > e.x + e.w) return;
                t.rows.map(e => utils.packKey(this.clip.id, this.node.path, e.component, e.property, t.frame, t.value)).forEach(e => {
                    -1 === utils.indexOf(this.selected, e) && this.selected.push(e)
                })
            })
        }
    }
}, exports.data = function () {
    return {
        display: !0,
        keys: [],
        lines: [],
        virtualkeys: []
    }
}, exports.methods = {
    t: Editor.T,
    updateDisplay() {
        this.display = this.size.top <= this.$el.offsetTop + 24 && this.size.top + this.size.height > this.$el.offsetTop
    },
    queryLineStyle: (e, t, s, i) => `transform: translateX(${e*s+i-1|0}px); width: ${t*s}px`,
    checkSelected(e) {
        return e.rows.every(t => -1 !== utils.indexOf(this.selected, {
            id: this.clip.id,
            path: this.node.path,
            component: t.component,
            property: t.property,
            frame: e.frame
        }))
    },
    updateKeys() {
        let e = this.clip.id,
            t = this.node.path;
        for (; this.keys.length;) this.keys.pop();
        for (; this.lines.length;) this.lines.pop();
        if (!e || !t) return;
        let s = manager.Clip.queryCurve(this.clip.id, this.node.path),
            i = {};
        utils.forEachCurve(s, (e, t, s) => {
            s.forEach(s => {
                let a = s.frame * this.sample | 0;
                i[a] || (i[a] = {
                    list: [],
                    rows: []
                });
                let r = i[a];
                r.list.push(JSON.stringify(s.value)), r.rows.push({
                    component: e,
                    property: t
                })
            })
        });
        let a = null;
        Object.keys(i).forEach(e => {
            let t = i[e],
                s = {
                    frame: parseInt(e),
                    value: t.list,
                    rows: t.rows
                };
            a && !utils.equalArray(a.value, s.value) && this.lines.push({
                frame: a.frame,
                length: s.frame - a.frame
            }), a = s, this.keys.push(s)
        })
    },
    dragKeyStart() {
        this.keys.forEach(e => {
            this.checkSelected(e) && this.virtualkeys.push({
                frame: parseFloat(e.frame),
                offset: 0,
                source: e
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
    queryKeyStyle: (e, t, s) => `transform: translateX(${e*t+s-1|0}px);`,
    queryVKeyStyle: (e, t, s, i) => `transform: translateX(${(e+t)*s+i-1|0}px);`,
    _onKeyMouseDown(e, t) {
        advice.emit("change-node", this.node);
        let s = t.rows.map(e => utils.packKey(this.clip.id, this.node.path, e.component, e.property, t.frame, t.value)),
            i = this.checkSelected(t);
        if (e && !e.ctrlKey && !e.metaKey && !i)
            for (; this.selected.length;) this.selected.pop();
        s.forEach(e => {
            i || this.selected.push(e)
        })
    },
    _onKeyMouseUp(e, t) {
        t.rows.map(e => utils.packKey(this.clip.id, this.node.path, e.component, e.property, t.frame, t.value)).forEach(e => {
            this.checkSelected(t) || this.selected.push(e)
        })
    },
    _onKeyClick(e) {
        e && e.preventDefault(), e && e.stopPropagation()
    },
    _onKeyDragStart(e, t) {
        let s = 0,
            i = 1 / 0;
        this.selected.forEach(e => {
            e.frame < i && (i = e.frame)
        }), advice.emit("drag-key-start"), Editor.UI.startDrag("ew-resize", e, (e, t, a, r, o) => {
            s += isNaN(t) ? 0 : t;
            let l = Math.round(s / this.scale);
            advice.emit("drag-key-move", Math.max(-i, l))
        }, (e, t, a, r, o) => {
            let l = Math.round(s / this.scale);
            advice.emit("drag-key-end", Math.max(-i, l))
        })
    },
    _onLineClick(e) {
        event && event.preventDefault(), event && event.stopPropagation();
        let t = e.frame,
            s = e.frame + e.length,
            i = manager.Clip.queryInfo(this.clip.id);
        if (!event.ctrlKey && !event.metaKey)
            for (; this.selected.length;) this.selected.pop();
        let a = manager.Clip.queryCurve(this.clip.id, this.node.path);
        utils.forEachCurve(a, (e, a, r) => {
            r.forEach(r => {
                let o = r.frame * i.sample | 0;
                if (o === t || o === s) {
                    let t = utils.packKey(this.clip.id, this.node.path, e, a, o, r.value);
                    this.selected.push(t)
                }
            })
        })
    }
}, exports.created = function () {
    advice.on("drag-key-start", this.dragKeyStart), advice.on("drag-key-move", this.dragKeyMove), advice.on("drag-key-end", this.dragKeyEnd), advice.on("clip-data-update", this.updateKeys)
}, exports.compiled = function () {
    requestAnimationFrame(() => {
        this.$el && (this.updateDisplay(), this.updateKeys())
    })
}, exports.destroyed = function () {
    advice.removeListener("drag-key-start", this.dragKeyStart), advice.removeListener("drag-key-move", this.dragKeyMove), advice.removeListener("drag-key-end", this.dragKeyEnd), advice.removeListener("clip-data-update", this.updateKeys)
};