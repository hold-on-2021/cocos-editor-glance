"use strict";
var Async = require("async"),
    Path = require("fire-path"),
    _getPixiel = function (t, i, e, r) {
        var h = 4 * i + e * r * 4;
        return {
            r: t[h],
            g: t[h + 1],
            b: t[h + 2],
            a: t[h + 3]
        }
    },
    _getTrimRect = function (t, i, e, r) {
        var h, s, o = r,
            a = i,
            d = e,
            m = 0,
            f = 0;
        for (s = 0; s < e; s++)
            for (h = 0; h < i; h++)
                if (_getPixiel(t, h, s, i).a >= o) {
                    d = s, s = e;
                    break
                } for (s = e - 1; s >= d; s--)
            for (h = 0; h < i; h++)
                if (_getPixiel(t, h, s, i).a >= o) {
                    f = s - d + 1, s = 0;
                    break
                } for (h = 0; h < i; h++)
            for (s = d; s < d + f; s++)
                if (_getPixiel(t, h, s, i).a >= o) {
                    a = h, h = i;
                    break
                } for (h = i - 1; h >= a; h--)
            for (s = d; s < d + f; s++)
                if (_getPixiel(t, h, s, i).a >= o) {
                    m = h - a + 1, h = 0;
                    break
                } return [a, d, m, f]
    };
class SpriteMeta extends Editor.metas.asset {
    constructor(t) {
        super(t), this.rawTextureUuid = "", this.trimType = Editor.App._profile.data["trim-imported-image"] ? "auto" : "custom", this.trimThreshold = 1, this.rotated = !1, this.offsetX = 0, this.offsetY = 0, this.trimX = 0, this.trimY = 0, this.width = -1, this.height = -1, this.rawWidth = 0, this.rawHeight = 0, this.borderTop = 0, this.borderBottom = 0, this.borderLeft = 0, this.borderRight = 0
    }
    useRawfile() {
        return !1
    }
    dests() {
        return [this._assetdb._uuidToImportPathNoExt(this.uuid) + ".json"]
    }
    createSpriteFrame(t, i, e) {
        var r = new cc.SpriteFrame,
            h = this.rawTextureUuid;
        r.name = Path.basenameNoExt(t), r.setOriginalSize(cc.size(i, e)), r.setRect(cc.rect(0, 0, this.width, this.height)), r._textureFilename = this._assetdb.uuidToUrl(h), r.setRect(cc.rect(this.trimX, this.trimY, this.width, this.height)), r.setRotated(this.rotated), r.insetTop = this.borderTop, r.insetBottom = this.borderBottom, r.insetLeft = this.borderLeft, r.insetRight = this.borderRight;
        var s = cc.p(this.offsetX, this.offsetY);
        return r.setOffset(s), r
    }
    import(t, i) {
        const e = require(Editor.url("app://editor/share/sharp"));
        var r = this.rawTextureUuid,
            h = this._assetdb.uuidToFspath(r);
        if (!h) return i(new Error(`Can not find raw texture for ${t}, uuid not found: ${r}`)), void 0;
        e.cache(!1), Async.waterfall([t => {
            e(h).raw().toBuffer(t)
        }, (i, e, r) => {
            if (!i || !e) return r(new Error("Can not load image for " + h)), void 0;
            let s = e.width,
                o = e.height;
            if (this.rawWidth = s, this.rawHeight = o, "auto" === this.trimType)
                if (4 !== e.channels) this.trimX = 0, this.trimY = 0, this.width = s, this.height = o;
                else {
                    let t = _getTrimRect(i, s, o, this.trimThreshold);
                    this.trimX = t[0], this.trimY = t[1], this.width = t[2], this.height = t[3]
                }
            else this.trimX = Editor.Math.clamp(this.trimX, 0, s), this.trimY = Editor.Math.clamp(this.trimY, 0, o), this.width = Editor.Math.clamp(-1 === this.width ? s : this.width, 0, s - this.trimX), this.height = Editor.Math.clamp(-1 === this.height ? o : this.height, 0, o - this.trimY);
            this.offsetX = this.trimX + this.width / 2 - s / 2, this.offsetY = -(this.trimY + this.height / 2 - o / 2), this.borderLeft = Editor.Math.clamp(this.borderLeft, 0, this.width), this.borderRight = Editor.Math.clamp(this.borderRight, 0, this.width - this.borderLeft), this.borderTop = Editor.Math.clamp(this.borderTop, 0, this.height), this.borderBottom = Editor.Math.clamp(this.borderBottom, 0, this.height - this.borderTop);
            let a = this.createSpriteFrame(t, s, o);
            this._assetdb.saveAssetToLibrary(this.uuid, a), r(null, a)
        }], t => {
            e.cache(!0), i && i(t)
        })
    }
    static defaultType() {
        return "sprite-frame"
    }
    static version() {
        return "1.0.3"
    }
}
SpriteMeta.prototype.export = null, module.exports = SpriteMeta;