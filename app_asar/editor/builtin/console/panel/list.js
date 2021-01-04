"use strict";
const fs = require("fs"),
    path = require("path"),
    ConsoleItem = require(Editor.url("packages://console/panel/item"));
exports.template = fs.readFileSync(path.join(__dirname, "./template/list.html"), "utf-8");
var getHeight = function (e, t) {
        var s = 0;
        return e.forEach(e => {
            e.fold ? s += t : s += e.rows * (t - 2) + 14
        }), s
    },
    getScrollPosition = function (e, t, s) {
        var r = 0,
            l = 0;
        return e.some((e, o) => {
            if (e.fold ? r += t : r += e.rows * (t - 2) + 14, r > s) return l = o - 1, !0
        }), l
    };
exports.props = ["messages", "fontsize", "lineheight"], exports.components = {
    "console-item": ConsoleItem
}, exports.data = function () {
    return {
        list: [],
        sectionStyle: {
            height: 0
        }
    }
};
var createItem = function () {
    return {
        type: "",
        rows: 0,
        title: "",
        info: "",
        texture: "dark",
        fold: !0,
        num: 1,
        translateY: -1e3,
        show: !1
    }
};
exports.methods = {
    onScroll(e) {
        var t = this.messages,
            s = this.list,
            r = e.target.scrollTop,
            l = this.lineheight,
            o = getScrollPosition(t, l, r);
        s.forEach(function (e, s) {
            var r = t[o + s];
            if (!r) return e.translateY = -1e3, e.show = !1, void 0;
            e.type = r.type, e.rows = r.rows, e.title = r.title, e.info = r.info, e.fold = r.fold, e.num = r.num, e.texture = (o + s) % 2 == 0 ? "dark" : "light", e.translateY = r.translateY, e.show = !0
        })
    },
    onUpdateFold(e, t) {
        for (var s = 0, r = this.lineheight, l = 0; l < this.messages.length; l++)
            if (this.messages[l].translateY === e) {
                s = l;
                break
            }
        var o = this.messages[s++];
        o.fold = t;
        var i = o.rows * (r - 2) + 14 - r;
        for (t && (i = -i), s; s < this.messages.length; s++) {
            let e = this.messages[s];
            e.translateY += i, e.show = !0
        }
        this.sectionStyle.height = getHeight(this.messages, r), this.onScroll({
            target: this.$el
        })
    }
};
var scrollTimer = null,
    scrollNumCache = null;
exports.directives = {
    init(e) {
        var t = e.lineheight,
            s = e.messages,
            r = getHeight(s, t);
        this.vm.sectionStyle.height = r;
        for (var l = this.vm.$el.clientHeight / t + 3 | 0, o = this.vm.list; o.length > l;) o.pop();
        clearTimeout(scrollTimer), scrollTimer = setTimeout(() => {
            var e = getHeight(s, t),
                r = this.vm.$el.scrollTop,
                i = this.vm.$el.clientHeight,
                a = s.length - scrollNumCache;
            scrollNumCache = s.length;
            var n;
            n = 0 !== r && e - i - r > t * a ? this.vm.$el.scrollTop : this.vm.$el.scrollTop = e - i;
            getScrollPosition(s, t, n);
            for (var h = 0; h < l; h++)
                if (o[h]) {
                    let e = o[h];
                    e.translateY = -1e3, e.show = !1
                } else o.push(createItem());
            this.vm.onScroll({
                target: this.vm.$el
            })
        }, 10)
    }
};