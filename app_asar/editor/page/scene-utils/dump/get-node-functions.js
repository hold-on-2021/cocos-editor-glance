function getPropertyNames(t) {
    var e, n;
    "object" == typeof t ? (e = Object.getOwnPropertyNames(t), n = t.constructor) : (e = [], n = t);
    for (var o = [n].concat(cc.Class.getInheritanceChain(n)), r = 0; r < o.length; r++)
        for (var s = Object.getOwnPropertyNames(o[r].prototype), c = 0; c < s.length; c++) {
            var a = s[c];
            e.includes(a) || e.push(a)
        }
    return e
}
var exludeFunctions = ["constructor", "null", "onLoad", "start", "onEnable", "onDisable", "onDestroy", "update", "lateUpdate", "onFocusInEditor", "onLostFocusInEditor", "resetInEditor", "onRestore", "isRunning", "realDestroyInEditor", "getComponent", "getComponentInChildren", "getComponents", "getComponentsInChildren"];
Editor.getNodeFunctions = function (t) {
    if (!t) return {};
    var e = {};
    return t._components.forEach(function (t) {
        for (var n = [], o = getPropertyNames(t.constructor), r = 0; r < o.length; ++r) {
            var s = o[r];
            s && -1 === exludeFunctions.indexOf(s) && (cc.js.getPropertyDescriptor(t, s).get || "function" == typeof t[s] && "_" !== s[0] && n.push(s))
        }
        e[cc.js.getClassName(t)] = n
    }), e
};