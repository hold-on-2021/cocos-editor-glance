"use strict";
class MarkdownMeta extends Editor.metas["raw-asset"] {
    constructor(t) {
        super(t)
    }
    static defaultType() {
        return "markdown"
    }
}
module.exports = MarkdownMeta;