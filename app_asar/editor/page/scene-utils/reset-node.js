function createDefaultRecord(e, t) {
    var n = e.constructor,
        c = {},
        o = new n;
    return n.__props__.forEach(function (n) {
        if (-1 === t.indexOf(n)) {
            cc.Class.attr(e, n) && (c[n] = o[n])
        }
    }), (e instanceof cc._BaseNode || e instanceof cc._SGComponent) && (c._sgNode = e._sgNode), c
}
var SKIP_NODE_PROPS = ["_name", "_objFlags", "_parent", "_children", "_tag", "name", "parent", "_id", "uuid", "children", "childrenCount", "active", "activeInHierarchy", "_active", "_components", "_prefab", "_persistNode"],
    SKIP_COMP_PROPS = ["_name", "_objFlags", "node", "name", "_id", "uuid", "__scriptAsset", "_enabled", "enabled", "enabledInHierarchy", "_isOnLoadCalled", "__eventTargets"];
_Scene.resetNode = function (e) {
    var t = createDefaultRecord(e, SKIP_NODE_PROPS);
    _Scene._UndoImpl.restoreObject(e, t)
}, _Scene.resetComponent = function (e) {
    var t = createDefaultRecord(e, SKIP_COMP_PROPS);
    try {
        _Scene._UndoImpl.restoreObject(e, t)
    } catch (t) {
        return cc._throw(t), Editor.error(`Failed to reset the component ${cc.js.getClassName(e)}, if you can't easily fix it, you can implement the "onRestore" function in the component.`), void 0
    }
    cc.director._nodeActivator.resetComp(e)
};