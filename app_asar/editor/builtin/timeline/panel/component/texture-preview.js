"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    manager = require("../libs/manager"),
    advice = require("../libs/advice"),
    utils = require("../libs/utils");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/texture-preview.html"), "utf-8"), exports.props = ["key"], exports.watch = {
    key() {
        this.updateTexture()
    }
}, exports.data = function () {
    return {
        width: 0,
        height: 0
    }
}, exports.methods = {
    t: Editor.T,
    async updateTexture() {
        if (!this.key || !this.$el) return;
        let e = this.key;
        if (!e.value || !e.source) return;
        let t = await utils.promisify(cc.AssetLibrary.loadAsset)(e.source._uuid);
        if (!t._rect) return;
        if (!this.key || !this.$el) return;
        let r = this.$el;
        r.width = t._rect.width, r.height = t._rect.height;
        let i = r.getContext("2d");
        i.clearRect(0, 0, r.width, r.height);
        let s = 1,
            a = 0,
            h = 0,
            l = 1;
        if (t._rotated) {
            s = Math.cos(1.5707963267948966), a = -Math.sin(1.5707963267948966), h = Math.sin(1.5707963267948966), l = Math.cos(1.5707963267948966)
        }
        i.setTransform(s, a, h, l, 0, 0);
        let n, o, d;
        t.rotated ? (o = t._rect.height, d = t._rect.width, n = -o) : (o = t._rect.width, d = t._rect.height, n = 0);
        let c = document.createElement("img");
        c.style.display = "none", c.src = t._textureFilename;
        let u = () => {
                c.removeEventListener("load", u), c.removeEventListener("error", p), i.drawImage(c, t._rect.x, t._rect.y, o, d, n, 0, o, d), this.$el && this.$el.removeChild(c)
            },
            p = () => {
                c.removeEventListener("load", u), c.removeEventListener("error", p), this.$el && this.$el.removeChild(c)
            };
        c.addEventListener("load", u), c.addEventListener("error", p), this.$el.appendChild(c)
    }
}, exports.created = function () {}, exports.compiled = function () {
    this.updateTexture()
};