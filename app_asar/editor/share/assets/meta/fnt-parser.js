"use strict";
var FntLoader = {
    INFO_EXP: /info [^\n]*(\n|$)/gi,
    COMMON_EXP: /common [^\n]*(\n|$)/gi,
    PAGE_EXP: /page [^\n]*(\n|$)/gi,
    CHAR_EXP: /char [^\n]*(\n|$)/gi,
    KERNING_EXP: /kerning [^\n]*(\n|$)/gi,
    ITEM_EXP: /\w+=[^ \r\n]+/gi,
    INT_EXP: /^[\-]?\d+$/,
    _parseStrToObj: function (t) {
        var e = t.match(this.ITEM_EXP),
            r = {};
        if (e)
            for (var n = 0, a = e.length; n < a; n++) {
                var i = e[n],
                    s = i.indexOf("="),
                    o = i.substring(0, s),
                    c = i.substring(s + 1);
                c.match(this.INT_EXP) ? c = parseInt(c) : '"' === c[0] && (c = c.substring(1, c.length - 1)), r[o] = c
            }
        return r
    },
    parseFnt: function (t) {
        var e = {},
            r = t.match(this.INFO_EXP);
        if (!r) return e;
        var n = this._parseStrToObj(r[0]),
            a = this._parseStrToObj(t.match(this.COMMON_EXP)[0]);
        if (e.commonHeight = a.lineHeight, e.fontSize = parseInt(n.size), cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
            var i = cc.configuration.getMaxTextureSize();
            (a.scaleW > i.width || a.scaleH > i.height) && cc.log("cc.LabelBMFont._parseCommonArguments(): page can't be larger than supported")
        }
        1 !== a.pages && cc.log("cc.LabelBMFont._parseCommonArguments(): only supports 1 page");
        var s = this._parseStrToObj(t.match(this.PAGE_EXP)[0]);
        0 !== s.id && cc.log("cc.LabelBMFont._parseImageFileName() : file could not be found"), e.atlasName = s.file;
        for (var o = t.match(this.CHAR_EXP), c = e.fontDefDictionary = {}, h = 0, g = o.length; h < g; h++) {
            var f = this._parseStrToObj(o[h]);
            c[f.id] = {
                rect: {
                    x: f.x,
                    y: f.y,
                    width: f.width,
                    height: f.height
                },
                xOffset: f.xoffset,
                yOffset: f.yoffset,
                xAdvance: f.xadvance
            }
        }
        var _ = e.kerningDict = {},
            E = t.match(this.KERNING_EXP);
        if (E)
            for (h = 0, g = E.length; h < g; h++) {
                var m = this._parseStrToObj(E[h]);
                _[m.first << 16 | 65535 & m.second] = m.amount
            }
        return e
    }
};
module.exports = FntLoader;