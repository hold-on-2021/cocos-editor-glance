"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    advice = require("../libs/advice"),
    manager = require("../libs/manager");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/events.html"), "utf-8"), exports.props = ["clip", "frame", "offset", "scale", "sample", "duration", "event"], exports.watch = {
    clip() {
        this.updateEvents()
    },
    event() {
        this.updateEvents()
    }
}, exports.data = function () {
    return {
        shadow: !1,
        events: [],
        virtualevents: []
    }
}, exports.methods = {
    t: Editor.T,
    updateEvents() {
        for (; this.events.length;) this.events.pop();
        let e = manager.Clip.queryInfo(this.clip.id);
        (manager.Clip.queryEvents(this.clip.id) || []).forEach(t => {
            let a = t.frame * e.sample; - 1 === this.events.indexOf(a) && this.events.push(a)
        })
    },
    updateDuration: (e, t, a, i) => `transform: translateX(${e}px); width: ${t*a*i}px;`,
    queryEventStyle: (e, t, a) => `transform: translateX(${e+a*t}px);`,
    checkHover(e) {
        return this.virtualevents.some(t => t.frame === e)
    },
    _onMouseWheel(e) {
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? advice.emit("drag-move", e.deltaX) : advice.emit("drag-zoom", e.deltaY, Math.round(e.offsetX + this.offset))
    },
    _onMouseDown(e) {
        if (1 !== e.button && 2 !== e.button) {
            let t = Math.round((e.offsetX - (this.$el === e.target ? this.offset : 0)) / this.scale);
            advice.emit("select-frame", t);
            let a = 0;
            return Editor.UI.startDrag("ew-resize", e, (e, i, s, r, n) => {
                a += isNaN(i) ? 0 : i;
                let o = Math.round(a / this.scale);
                advice.emit("select-frame", Math.max(o + t, 0))
            }, (...e) => {
                let i = Math.round(a / this.scale);
                advice.emit("select-frame", Math.max(i + t, 0))
            }), void 0
        }
        Editor.UI.startDrag("-webkit-grabbing", e, (e, t, a, i, s) => {
            advice.emit("drag-move", -Math.round(t))
        }, (...e) => {})
    },
    _onKeyMouseDown(e, t) {
        e.stopPropagation(), 2 === e.button && (e.preventDefault(), Editor.Ipc.sendToMain("timeline:menu-event-operation", {
            frame: t,
            x: e.pageX,
            y: e.pageY
        }))
    },
    _onKeyDragStart(e, t) {
        let a = 0;
        this.shadow = !0, this.virtualevents.push({
            frame: t,
            offset: 0
        }), Editor.UI.startDrag("ew-resize", e, (e, t, i, s, r) => {
            a += isNaN(t) ? 0 : t;
            let n = Math.round(a / this.scale);
            this.virtualevents.forEach(e => {
                e.offset = n
            })
        }, (...e) => {
            Math.round(a / this.scale);
            for (this.shadow = !1; this.virtualevents.length;) {
                let e = this.virtualevents.pop();
                if (0 === e.offset) continue;
                let t = manager.Clip.queryEvents(this.clip.id),
                    a = manager.Clip.queryInfo(this.clip.id),
                    i = [];
                for (let s = 0; s < t.length; s++) {
                    let r = t[s];
                    Math.round(r.frame * a.sample) === e.frame && (i.push(manager.Clip.deleteEvent(this.clip.id, r)), s--)
                }
                i.forEach(t => {
                    manager.Clip.addEvent(this.clip.id, e.frame + e.offset, t.func, t.params)
                })
            }
            this.updateEvents(), advice.emit("clip-data-update")
        })
    },
    _onKeyClick(e, t) {
        e.stopPropagation(), e.preventDefault(), advice.emit("select-frame", t)
    },
    _onKeyDBLClick(e, t) {
        advice.emit("change-event", t)
    }
}, exports.created = function () {
    this.updateEvents(), advice.on("add-empty-event", () => {
        manager.Clip.addEvent(this.clip.id, this.frame, "", []), this.updateEvents(), advice.emit("clip-data-update")
    }), advice.on("remove-empty-event", e => {
        let t = manager.Clip.queryEvents(this.clip.id),
            a = manager.Clip.queryInfo(this.clip.id);
        for (let i = 0; i < t.length; i++) {
            let s = t[i];
            Math.round(s.frame * a.sample) === e && (manager.Clip.deleteEvent(this.clip.id, s), i--)
        }
        this.updateEvents()
    })
};