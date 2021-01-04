"use strict";
(() => {
    const e = require("fire-fs"),
        r = require("fire-path"),
        a = require("plist");
    let t = {
        exportParticlePlist: function (t) {
            let i = cc.engine.getInstanceById(t);
            if (!i) return;
            let o = this._showDialog(),
                n = r.join(Editor.projectInfo.path, "assets");
            if (!(-1 !== o.indexOf(n))) return Editor.error(Editor.T("COMPONENT.particle.export_error")), void 0;
            if (!o || -1 === o) return;
            let l = Editor.url("unpack://static/default-assets/particle/atom.plist"),
                s = i.file || l,
                c = a.parse(e.readFileSync(s, "utf8")),
                d = this._applyPlistData(c, i, o);
            Editor.Ipc.sendToMain("scene:export-plist", o, a.build(d), function (e, r) {
                e || (i.file = Editor.assetdb.remote.uuidToFspath(r), i.custom = !1)
            })
        },
        _showDialog: function () {
            return Editor.Dialog.saveFile({
                title: "Save Particle",
                defaultPath: Editor.url("db://assets"),
                filters: [{
                    name: "Particle",
                    extensions: ["plist"]
                }]
            })
        },
        _applyPlistData: function (e, a, t) {
            e.maxParticles = a.totalParticles, e.angle = a.angle, e.angleVariance = a.angleVar, e.duration = a.duration, e.blendFuncSource = a._sgNode._blendFunc.src, e.blendFuncDestination = a._sgNode._blendFunc.dst, e.startColorRed = a.startColor.r / 255, e.startColorGreen = a.startColor.g / 255, e.startColorBlue = a.startColor.b / 255, e.startColorAlpha = a.startColor.a / 255, e.startColorVarianceRed = a.startColorVar.r / 255, e.startColorVarianceGreen = a.startColorVar.g / 255, e.startColorVarianceBlue = a.startColorVar.b / 255, e.startColorVarianceAlpha = a.startColorVar.a / 255, e.finishColorRed = a.endColor.r / 255, e.finishColorGreen = a.endColor.g / 255, e.finishColorBlue = a.endColor.b / 255, e.finishColorAlpha = a.endColor.a / 255, e.finishColorVarianceRed = a.endColorVar.r / 255, e.finishColorVarianceGreen = a.endColorVar.g / 255, e.finishColorVarianceBlue = a.endColorVar.b / 255, e.finishColorVarianceAlpha = a.endColorVar.a / 255, e.startParticleSize = a.startSize, e.startParticleSizeVariance = a.startSizeVar, e.finishParticleSize = a.endSize, e.finishParticleSizeVariance = a.endSizeVar, e.sourcePositionVariancex = a.posVar.x, e.sourcePositionVariancey = a.posVar.y, e.rotationStart = a.startSpin, e.rotationStartVariance = a.startSpinVar, e.rotationEnd = a.endSpin, e.rotationEndVariance = a.endSpinVar, e.emitterType = a.emitterMode;
            var i = a._sgNode.modeA;
            e.gravityx = i.gravity.x, e.gravityy = i.gravity.y, e.speed = i.speed, e.speedVariance = i.speedVar, e.radialAcceleration = i.radialAccel, e.radialAccelVariance = i.radialAccelVar, e.tangentialAcceleration = i.tangentialAccel, e.tangentialAccelVariance = i.tangentialAccelVar;
            var o = a._sgNode.modeB;
            e.maxRadius = o.startRadius, e.maxRadiusVariance = o.startRadiusVar, e.minRadius = o.endRadius, e.rotatePerSecond = o.rotatePerSecond, e.rotatePerSecondVariance = o.rotatePerSecondVar, e.particleLifespan = a.life, e.particleLifespanVariance = a.lifeVar, e.emissionRate = a.emissionRate;
            let n = r.parse(t);
            return e.textureFileName = n.name, e.textureUuid = Editor.Utils.UuidCache.urlToUuid(a.texture), e
        }
    };
    _Scene.PariticleUtils = t
})();