"use strict";
class AudioClipMeta extends Editor.metas["raw-asset"] {
    constructor(t) {
        super(t), this.downloadMode = 0
    }
    static version() {
        return "1.0.1"
    }
    static defaultType() {
        return "audio-clip"
    }
}
module.exports = AudioClipMeta;