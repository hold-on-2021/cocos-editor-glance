function getChildren(e) {
    var r, t = e._children;
    return r = e._prefab ? e._prefab.root && e._prefab.root._prefab.sync ? NodeStates.Prefab_AutoSync : NodeStates.Prefab : NodeStates.Normal, {
        name: e.name,
        id: e.uuid,
        children: t.length > 0 ? t.map(getChildren) : null,
        state: r,
        isActive: e._activeInHierarchy
    }
}
var NodeStates = {
    Normal: 0,
    Prefab: 1,
    Prefab_AutoSync: 2,
    Prefab_Missing: 3
};
_Scene.dumpHierarchy = module.exports = function (e, r) {
    e || (e = cc.director.getScene());
    var t;
    return t = r ? [e] : e._children, t.map(getChildren)
}, module.exports = {
    NodeStates: NodeStates
};