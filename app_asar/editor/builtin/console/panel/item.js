"use strict";
const fs = require("fs"),
    path = require("path");
exports.template = fs.readFileSync(path.join(__dirname, "./template/item.html"), "utf-8"), exports.props = ["type", "title", "info", "y", "texture", "rows", "fold", "num", "lineheight", "fontsize"], exports.data = function () {
    return {
        foldInfo: [],
        style: {
            transform: "translateY(0)",
            fontSize: this.fontsize + "px",
            lineHeight: this.lineheight + "px"
        }
    }
}, exports.watch = {
    fontsize: function () {
        this.style.fontSize = this.fontsize + "px"
    },
    lineheight: function () {
        this.style.lineHeight = this.lineheight + "px"
    }
}, exports.directives = {
    init(t) {
        this.vm.style.transform = `translateY(${t}px)`
    },
    info(t) {
        for (var e = t.split("\n"), i = this.vm.foldInfo; i.length > 0;) i.pop();
        e.forEach(t => {
            var e = t.match(/(^ *at (\S+ )*)(\(*[^\:]+\:\d+\:\d+\)*)/);
            e = e || ["", t, void 0, ""], i.push({
                info: e[1] || "",
                path: e[3] || ""
            })
        })
    }
};
var Selection = document.getSelection();
exports.methods = {
    onHide() {
        this.$parent.onUpdateFold(this.y, !0)
    },
    onShow() {
        this.$parent.onUpdateFold(this.y, !1)
    },
    onMouseDown(t) {
        if (2 === t.button) {
            var e = Selection.toString();
            e || (e += this.title, this.info && (e += "\r\n" + this.info)), Editor.Ipc.sendToPackage("console", "popup-item-menu", t.clientX, t.clientY + 5, e)
        }
    }
};