cc.ParticleAsset.createNodeByInfo = function (e, r) {
    var c = require("fire-url"),
        t = new cc.Node(c.basenameNoExt(e.url)),
        n = t.addComponent(cc.ParticleSystem);
    return n.file = e.url, n.custom = !1, r(null, t)
};