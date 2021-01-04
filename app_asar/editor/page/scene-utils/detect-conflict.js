"use strict";
_Scene.DetectConflict = {
    checkConflict_WidgetLayout(e, t) {
        if (function () {
                if (t.resizeMode !== cc.Layout.ResizeMode.CONTAINER) return !1;
                if (t.type === cc.Layout.Type.NONE) return e.isStretchWidth || e.isStretchHeight;
                var i;
                return i = t.type === cc.Layout.Type.GRID ? t.startAxis === cc.Layout.AxisDirection.HORIZONTAL ? cc.Layout.Type.VERTICAL : cc.Layout.Type.HORIZONTAL : t.type, i === cc.Layout.Type.HORIZONTAL && e.isStretchWidth || i === cc.Layout.Type.VERTICAL && e.isStretchHeight
            }()) {
            var i;
            return i = t.type === cc.Layout.Type.GRID ? cc.Layout.AxisDirection[t.startAxis].toLowerCase() + " grid" : cc.Layout.Type[t.type].toLowerCase(), CC_TEST || cc.warn('The resizeMode type of "%s" has been reset to NONE because it is conflict with its child widget "%s" in %s layout.', t.name, e.name, i), t.resizeMode = cc.Layout.ResizeMode.NONE, !0
        }
        return !1
    },
    checkConflict_Layout(e) {
        for (var t = e.node.children, i = 0; i < t.length; ++i) {
            var r = t[i].getComponent(cc.Widget);
            if (r && this.checkConflict_WidgetLayout(r, e)) return !0
        }
        return !1
    },
    checkConflict_Widget(e) {
        var t = e.node._parent;
        if (cc.Node.isNode(t)) {
            var i = t.getComponent(cc.Layout);
            if (i && i.resizeMode === cc.Layout.ResizeMode.CONTAINER) return this.checkConflict_WidgetLayout(e, i), !0
        }
        return !1
    },
    afterAddChild(e) {
        var t = e.getComponent(cc.Widget);
        return !(!t || !t.isStretchWidth && !t.isStretchHeight) && this.checkConflict_Widget(t)
    },
    beforeAddChild(e, t) {
        if (_Scene.AnimUtils._recording) return Editor.Dialog.messageBox({
            type: "warning",
            buttons: [Editor.T("MESSAGE.ok")],
            title: Editor.T("MESSAGE.warning"),
            message: Editor.T("MESSAGE.animation_editor.can_not_modify_hierarchy"),
            noLink: !0
        }), !0;
        var i = t && t._prefab && t._prefab.root;
        if (i) {
            var r = e._prefab;
            if (r && r.root === e && r.root !== i) return 1 === Editor.Dialog.messageBox({
                type: "warning",
                title: Editor.T("MESSAGE.warning"),
                message: Editor.T("MESSAGE.prefab.confirm_merge_prefab"),
                buttons: [Editor.T("MESSAGE.yes"), Editor.T("MESSAGE.no")],
                defaultId: 0,
                cancelId: 1,
                noLink: !0
            })
        }
        return !1
    }
};