"use strict";
const CustomAssetMeta = Editor.metas["custom-asset"],
    Path = require("fire-path"),
    FntLoader = require("./fnt-parser");
class LabelAtlasMeta extends CustomAssetMeta {
    constructor(t) {
        super(t), this.itemWidth = 0, this.itemHeight = 0, this.startChar = "", this.rawTextureUuid = "", this.fontSize = 0
    }
    static version() {
        return "1.1.0"
    }
    static defaultType() {
        return "label-atlas"
    }
    _createFntConfigString(t, e, i, a, s, r) {
        var h = t.rawWidth,
            n = t.rawHeight,
            o = a.charCodeAt(0),
            d = `info face="Arial" size=${r} bold=0 italic=0 charset="" unicode=0 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spaceing=0,0\n`;
        d += `common lineHeight=${i} base=${r} scaleW=${h} scaleH=${n} pages=1 packed=0\n`, d += `page id=0 file="${s}"\n`, d += "chars count=0\n";
        for (var u = 0, c = i; c <= n; c += i)
            for (var l = 0; l < h && l + e <= h; l += e) {
                var m = o + u;
                d += `char id=${m}     x=${l}   y=${c-i}   width=${e}     height=${i}     xoffset=0     yoffset=0    xadvance=${e}    page=0 chnl=0 letter="${String.fromCharCode(m)}"\n`, ++u
            }
        return d
    }
    postImport(t, e) {
        var i = this._assetdb,
            a = new cc.LabelAtlas;
        a.name = Path.basenameNoExt(t);
        var s = .88 * this.itemHeight,
            r = i.loadMetaByUuid(this.rawTextureUuid);
        if (r) {
            let t = i.uuidToFspath(r.uuid);
            var h = r.getSubMetas(),
                n = Path.basenameNoExt(t),
                o = h[n];
            if (a.spriteFrame = Editor.serialize.asAsset(o.uuid), this.itemWidth > 0 && this.itemHeight > 0 && this.itemWidth <= o.rawWidth && this.itemHeight <= o.rawHeight) {
                var d = this._createFntConfigString(o, this.itemWidth, this.itemHeight, this.startChar, n, s);
                a._fntConfig = FntLoader.parseFnt(d)
            }
        }
        return a.fontSize = s, this.fontSize = s, i.saveAssetToLibrary(this.uuid, a), e()
    }
}
module.exports = LabelAtlasMeta;