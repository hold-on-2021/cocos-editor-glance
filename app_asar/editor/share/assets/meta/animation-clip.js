"use strict";
var CustomAssetMeta = require("./custom-asset");
class AnimationClipMeta extends CustomAssetMeta {
    constructor(t) {
        super(t)
    }
    static defaultType() {
        return "animation-clip"
    }
}
module.exports = AnimationClipMeta;