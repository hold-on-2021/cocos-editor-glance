"use strict";
const Fs = require("fire-fs"),
    RawAssetMeta = require("./raw-asset");
class FolderMeta extends RawAssetMeta {
    export (e, t, s) {
        Fs.mkdirSync(e), s && s()
    }
    static defaultType() {
        return "folder"
    }
    static version() {
        return "1.0.1"
    }
}
module.exports = FolderMeta;