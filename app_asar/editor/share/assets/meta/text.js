"use strict";
class TextMeta extends Editor.metas["raw-asset"] {
    constructor(t) {
        super(t)
    }
    static defaultType() {
        return "text"
    }
}
module.exports = TextMeta;