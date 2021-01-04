"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    advice = require("../libs/advice");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/prop-list.html"), "utf-8"), exports.components = {
    "prop-row": require("./prop-row")
}, exports.props = ["node", "offset", "scale", "props", "clip", "sample", "selected"], exports.data = function () {
    return {
        shadow: !1,
        keys: [{
            frame: 1
        }, {
            frame: 4
        }],
        select_box_point_x: 0,
        select_box_point_y: 0,
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
    t: Editor.T,
    updateSelectPoint(t, e) {
        this.select_box_point_x = event.layerX, this.select_box_point_y = event.layerY, this.select_box_point_y += this.$el.scrollTop
    },
    updateStyle(t, e) {
        this.box_style.top = e < 0 ? this.select_box_point_y + e : this.select_box_point_y, this.box_style.height = Math.abs(e), this.box_style.top < 0 && (this.box_style.height += this.box_style.top, this.box_style.top = 0), this.box_style.top + this.box_style.height >= this.$el.scrollHeight - 3 && (this.box_style.height = this.$el.scrollHeight - this.box_style.top - 3), this.box_style.left = t < 0 ? this.select_box_point_x + t : this.select_box_point_x, this.box_style.width = Math.abs(t), this.box_style.left - (this.offset - 10) < 0 && (this.box_style.width += this.box_style.left - (this.offset - 10), this.box_style.left = this.offset - 10)
    },
    _onMouseWheel(t) {
        Math.abs(t.deltaX) > Math.abs(t.deltaY) ? advice.emit("drag-move", t.deltaX) : advice.emit("drag-zoom", t.deltaY, t.offsetX)
    },
    _onMouseDown(t) {
        if (1 !== t.button && 2 !== t.button) return;
        let e = !1,
            s = 0;
        Editor.UI.startDrag("-webkit-grabbing", t, (t, o, i, h, l) => {
            advice.emit("drag-move", -Math.round(o)), s += i, e || (e = !0, requestAnimationFrame(() => {
                advice.emit("property-scroll", this.$el.scrollTop - s), s = 0, e = !1
            }))
        }, (...t) => {})
    },
    _onDragStart(t) {
        this.updateSelectPoint(t.path, {
            x: t.offsetX,
            y: t.offsetY
        }), this.box_style.opacity = .4, this.updateStyle(0, 0), Editor.UI.startDrag("default", t, (t, e, s, o, i) => {
            this.box.d = !0, this.updateStyle(o, i)
        }, (t, e, s, o, i) => {
            if (this.box.d = !1, this.box_style.opacity = 0, Math.abs(o) < 5 && Math.abs(i) < 5)
                for (; this.selected.length;) this.selected.pop()
        })
    },
    _onClick() {
        for (; this.selected.length;) this.selected.pop()
    }
}, exports.created = function () {
    advice.on("property-scroll", t => {
        this.$el.scrollTop = t
    }), advice.on("drag-key-start", () => {
        this.shadow = !0
    }), advice.on("drag-key-end", () => {
        this.shadow = !1
    })
};