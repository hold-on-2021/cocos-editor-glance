"use strict";
const Fs = require("fire-fs"),
    Path = require("fire-path"),
    CustomAssetMeta = Editor.metas["custom-asset"],
    FntLoader = require("./fnt-parser");
class BitmapFontMeta extends CustomAssetMeta {
    constructor(t) {
        super(t), this.textureUuid = "", this.fontSize = -1
    }
    static version() {
        return "2.1.0"
    }
    static defaultType() {
        return "bitmap-font"
    }
    getRealFntTexturePath(t, e) {
        var a = -1 != t.indexOf(":"),
            i = Path.basename(t);
        a && (i = Path.win32.basename(t));
        var r = Path.join(Path.dirname(e), i);
        return Fs.existsSync(r) || Editor.error("Parse Error: Unable to find file Texture, the path: " + r), r
    }
    import(t, e) {
        var a = Fs.readFileSync(t, "utf8"),
            i = FntLoader.parseFnt(a);
        if (this._fntConfig = i, i.fontSize) {
            if (this.fontSize = i.fontSize, "" === this.textureUuid) {
                var r = this.getRealFntTexturePath(i.atlasName, t);
                this.textureUuid = Editor.assetdb.fspathToUuid(r)
            }
            return e()
        }
    }
    postImport(t, e) {
        var a = this._assetdb,
            i = new cc.BitmapFont;
        i.name = Path.basenameNoExt(t);
        var r = a.loadMetaByUuid(this.textureUuid);
        if (r) {
            var s = r.getSubMetas()[Path.basenameNoExt(this._fntConfig.atlasName)];
            i.spriteFrame = Editor.serialize.asAsset(s.uuid)
        }
        return i.fontSize = this.fontSize, i._fntConfig = this._fntConfig, a.saveAssetToLibrary(this.uuid, i), e()
    }
}
BitmapFontMeta.prototype.export = null, module.exports = BitmapFontMeta;