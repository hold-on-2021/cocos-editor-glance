var JS = cc.js,
    lodash = require("lodash");
_Scene.createNodeFromAsset = function (e, n) {
    cc.AssetLibrary.queryAssetInfo(e, function (t, o, r, a) {
        if (t) return n(t);
        if (r)
            if (a.createNodeByInfo) {
                var s = {
                    uuid: e,
                    url: o
                };
                a.createNodeByInfo(s, n)
            } else n(new Error("Can not create node from " + JS.getClassName(a)));
        else {
            if (cc.isChildClassOf(a, cc._Script)) {
                var c, i = Editor.Utils.UuidUtils.compressUuid(e),
                    d = cc.js._getClassById(i);
                if (cc.isChildClassOf(d, cc.Component)) return c = new cc.Node(cc.js.getClassName(d)), c.addComponent(d), n(null, c);
                var l = (!CC_TEST && require("fire-url")).basename(o);
                return "compiling" === Editor.remote.Compiler.state || _Scene.Sandbox.reloading ? n(new Error(`Can not load "${l}", please wait for the scene to reload.`)) : n(new Error(`Can not find a component in the script "${l}".`))
            }
            cc.AssetLibrary.loadAsset(e, function (e, t) {
                if (e) n(e);
                else if (t.createNode) {
                    if (t instanceof cc.Prefab) {
                        Editor.globalProfile.data["auto-sync-prefab"] && _Scene.PrefabUtils._setPrefabSync(t.data, !0)
                    }
                    t.createNode(n)
                } else n(new Error("Can not create node from " + JS.getClassName(a)))
            })
        }
    })
}, _Scene.updateComponentMenu = function () {
    cc._componentMenuItems = lodash.sortBy(cc._componentMenuItems, e => e.menuPath.toLowerCase());
    for (var e = [], n = 0; n < cc._componentMenuItems.length; ++n) {
        var t = cc._componentMenuItems[n],
            o = t.menuPath;
        e.push({
            path: Editor.i18n.formatPath(o),
            panel: "scene",
            message: "scene:add-component",
            params: [JS._getClassId(t.component)]
        })
    }
    Editor.Menu.register("add-component", e, !0), Editor.MainMenu.update(Editor.T("MAIN_MENU.component.title"), e)
}, _Scene.isAnyChildClassOf = function (e) {
    "use strict";
    for (var n = 1; n < arguments.length; ++n) {
        var t = arguments[n];
        if (cc.isChildClassOf(e, t)) return !0
    }
    return !1
};