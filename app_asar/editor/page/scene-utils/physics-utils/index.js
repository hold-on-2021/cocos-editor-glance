function getNodeRectPoints(e, t) {
    if (0 === e.width && 0 === e.height) return t(null, [cc.v2(-50, -50), cc.v2(50, -50), cc.v2(50, 50), cc.v2(-50, 50)]);
    var o = -e.anchorX * e.width,
        r = -e.anchorY * e.height,
        i = o + e.width,
        n = r + e.height;
    t(null, [cc.v2(o, r), cc.v2(o, n), cc.v2(i, n), cc.v2(i, r)])
}

function getContourPoints(e, t, o) {
    var r = e.getComponent(cc.Sprite);
    if (!r) return getNodeRectPoints(e, o);
    var i = r.spriteFrame;
    if (!i) return getNodeRectPoints(e, o);
    var n = i._textureFilename;
    if (!n) return getNodeRectPoints(e, o);
    var c = require("./marching-squares"),
        h = require("./rdp"),
        s = require(Editor.url("app://editor/share/sharp")),
        u = i.getRect();
    s(n).extract({
        left: u.x,
        top: u.y,
        width: u.width,
        height: u.height
    }).raw().toBuffer((r, i) => {
        if (r) return o(r);
        var n = c.getBlobOutlinePoints(i, u.width, u.height, t.loop);
        (n = h(n, t.threshold)).length > 0 && n[0].equals(n[n.length - 1]) && (n.length -= 1), n.forEach(t => {
            t.y = u.height - t.y, t.x *= e.width / u.width, t.y *= e.height / u.height, t.x -= e.anchorX * e.width, t.y -= e.anchorY * e.height
        }), PolygonSeparator.ForceCounterClockWise(n), o && o(null, n)
    })
}

function resetPoints(e, t) {
    getContourPoints(e.node, t, (t, o) => {
        if (t) return Editor.error(t);
        _Scene.Undo.recordNode(e.node.uuid), e.points = o, _Scene.Undo.commit()
    })
}
const PolygonSeparator = Editor.require("unpack://engine/cocos2d/core/physics/CCPolygonSeparator");
_Scene.PhysicsUtils = module.exports = {
    getContourPoints: getContourPoints,
    resetPoints: resetPoints
};