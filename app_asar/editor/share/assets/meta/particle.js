"use strict";
const Fs = require("fire-fs"),
    Plist = require("plist");
class ParticleMeta extends Editor.metas["raw-asset"] {
    constructor(t) {
        super(t)
    }
    static validate(t) {
        return void 0 !== Plist.parse(Fs.readFileSync(t, "utf8")).maxParticles
    }
    static defaultType() {
        return "particle"
    }
}
ParticleMeta.prototype.export = null, module.exports = ParticleMeta;