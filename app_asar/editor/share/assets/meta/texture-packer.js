"use strict";

function _parseSize(e) {
    let t = (e = e.slice(1, -1)).split(","),
        r = parseInt(t[0]),
        i = parseInt(t[1]);
    return cc.size(r, i)
}

function _parseVec2(e) {
    var t = (e = e.slice(1, -1)).split(","),
        r = parseInt(t[0]),
        i = parseInt(t[1]);
    return new cc.Vec2(r, i)
}

function _parseRect(e) {
    let t = (e = e.replace(BRACE_REGEX, "")).split(",");
    return {
        x: parseInt(t[0] || 0),
        y: parseInt(t[1] || 0),
        w: parseInt(t[2] || 0),
        h: parseInt(t[3] || 0)
    }
}
const Fs = require("fire-fs"),
    Path = require("fire-path"),
    Plist = require("plist"),
    SpriteAtlasMeta = require("./sprite-atlas"),
    SpriteMeta = require("./sprite-frame"),
    BRACE_REGEX = /[\{\}]/g,
    PATH_SEPERATOR = /[\\\/]/g;
class TexturePackerMeta extends SpriteAtlasMeta {
    constructor(e) {
        super(e), this.type = "Texture Packer"
    }
    static validate(e) {
        let t = Plist.parse(Fs.readFileSync(e, "utf8"));
        return void 0 !== t.frames && void 0 !== t.metadata
    }
    static version() {
        return "1.2.4"
    }
    parse(e) {
        let t = this._assetdb,
            r = Plist.parse(Fs.readFileSync(e, "utf8")),
            i = r.metadata,
            a = r.frames,
            s = Path.dirname(e);
        this._rawTextureFile || (this._rawTextureFile = Path.join(s, i.realTextureFileName || i.textureFileName)), this.size = _parseSize(i.size);
        let p = {},
            u = this.getSubMetas(),
            o = [];
        for (let e in a) {
            let r, s, l, n, h = a[e],
                f = !1,
                c = e.replace(PATH_SEPERATOR, "-");
            c !== e && o.push(e);
            let m = u[c];
            m || (m = new SpriteMeta(t)), p[c] = m, 0 === i.format ? (f = !1, r = h.trimmed, s = `{${h.originalWidth},${h.originalHeight}}`, l = `{${h.offsetX},${h.offsetY}}`, n = `{{${h.x},${h.y}},{${h.width},${h.height}}}`) : 1 === i.format || 2 === i.format ? (f = h.rotated, r = h.trimmed, s = h.sourceSize, l = h.offset, n = h.frame) : 3 === i.format && (f = h.textureRotated, r = h.trimmed, s = h.spriteSourceSize, l = h.spriteOffset, n = h.textureRect), m.rotated = !!f, m.trimType = r ? "custom" : "auto", m.spriteType = "normal";
            let d = _parseSize(s);
            m.rawWidth = d.width, m.rawHeight = d.height;
            let S = _parseVec2(l);
            m.offsetX = S.x, m.offsetY = S.y;
            let x = _parseRect(n);
            m.trimX = x.x, m.trimY = x.y, m.width = x.w, m.height = x.h
        }
        o.length > 0 && Editor.warn("[SpriteAtlas import] Some of the frame keys have been reformatted : " + JSON.stringify(o)), this.updateSubMetas(p)
    }
    postImport(e, t) {
        this.rawTextureUuid = this._assetdb.fspathToUuid(this._rawTextureFile);
        var r = this.getSubMetas();
        for (var i in r) r[i].rawTextureUuid = this.rawTextureUuid;
        super.postImport(e, t)
    }
}
module.exports = TexturePackerMeta;