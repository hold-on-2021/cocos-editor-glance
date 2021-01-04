"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    advice = require("../libs/advice");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/preview-list.html"), "utf-8"), exports.components = {
    "preview-row": require("./preview-row")
}, exports.props = ["height", "width", "hierarchy", "mnodes", "node", "clip", "scale", "offset", "sample", "selected"], exports.data = function () {
    return {
        shadow: !1,
        select_box_point_x: 0,
        select_box_point_y: 0,
        size: {
            width: 0,
            height: 0,
            top: 0
        },
        box_style: {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            opacity: 0
        },
        box: {
            d: !1,
            x: 0,
            y: 0,
            w: 0,
            h: 0
        }
    }
}, exports.watch = {
    width() {
        this.updateSize()
    },
    height() {
        this.updateSize()
    },
    box_style: {
        deep: !0,
        handler(t) {
            this.box.y = t.top, this.box.h = t.height, this.box.x = t.left - this.offset, this.box.w = t.width
        }
    },
    box: {
        deep: !0,
        handler() {
            if (this.box.d)
                for (; this.selected.length;) this.selected.pop()
        }
    }
}, exports.methods = {
    t: (t, ...e) => Editor.T(`timeline.preview_list.${t}`, ...e),
    updateSize() {
        this.size.width = this.$el.clientWidth, this.size.height = this.$el.clientHeight, this.size.top = this.$el.scrollTop
    },
    updateSelectPoint(t, e) {
        this.select_box_point_x = event.layerX, this.select_box_point_y = event.layerY, t.some(t => t === this.$el || (this.select_box_point_y += t.offsetTop, !1)), this.select_box_point_y += this.$el.scrollTop
    },
    updateStyle(t, e) {
        this.box_style.top = e < 0 ? this.select_box_point_y + e : this.select_box_point_y, this.box_style.height = Math.abs(e), this.box_style.top < 0 && (this.box_style.height += this.box_style.top, this.box_style.top = 0), this.box_style.top + this.box_style.height >= this.$el.scrollHeight - 2 && (this.box_style.height = this.$el.scrollHeight - this.box_style.top - 2), this.box_style.left = t < 0 ? this.select_box_point_x + t : this.select_box_point_x, this.box_style.width = Math.abs(t), this.box_style.left - (this.offset - 10) < 0 && (this.box_style.width += this.box_style.left - (this.offset - 10), this.box_style.left = this.offset - 10)
    },
    _onMouseWheel(t) {
        Math.abs(t.deltaX) > Math.abs(t.deltaY) ? advice.emit("drag-move", t.deltaX) : advice.emit("drag-zoom", t.deltaY, t.offsetX)
    },
    _onMouseDown(t) {
        if (1 !== t.button && 2 !== t.button) return;
        let e = !1,
            s = 0;
        Editor.UI.startDrag("-webkit-grabbing", t, (t, i, o, h, l) => {
            i && advice.emit("drag-move", -Math.round(i)), s += o, e || (e = !0, requestAnimationFrame(() => {
                advice.emit("hierarchy-scroll", this.$el.scrollTop - s), s = 0, e = !1
            }))
        }, (...t) => {})
    },
    _onClick() {
        for (; this.selected.length;) this.selected.pop()
    },
    _onDragStart() {
        this.updateSelectPoint(event.path, {
            x: event.offsetX,
            y: event.offsetY
        }), this.box_style.opacity = .4, this.updateStyle(0, 0), Editor.UI.startDrag("default", event, (t, e, s, i, o) => {
            this.box.d = !0, this.updateStyle(i, o)
        }, (t, e, s, i, o) => {
            if (this.box.d = !1, this.box_style.opacity = 0, Math.abs(i) < 5 && Math.abs(o) < 5)
                for (; this.selected.length;) this.selected.pop()
        })
    }
}, exports.created = function () {
    advice.on("hierarchy-scroll", t => {
        this.$el.scrollTop = t, this.updateSize()
    }), advice.on("drag-key-start", () => {
        this.shadow = !0
    }), advice.on("drag-key-end", () => {
        this.shadow = !1
    })
};