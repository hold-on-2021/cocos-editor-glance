class ColliderGizmo extends Editor.Gizmo {
    hide() {
        Editor.Gizmo.prototype.hide.call(this), this.target.editing = !1
    }
    visible() {
        return !0
    }
    rectHitTest(t, i) {
        let e = this._root.tbox(),
            r = _Scene.NodeUtils.getWorldPosition(this.node);
        return !!i && t.containsRect(cc.rect(r.x - e.width / 2, r.y - e.height / 2, e.width, e.height))
    }
    createMoveCallbacks(t) {
        let i = Editor.Gizmo.prototype.createMoveCallbacks.call(this, t),
            e = (this._root, this);
        return {
            start: function () {
                e.target.editing && i.start.apply(e, arguments)
            },
            update: function () {
                e.target.editing && i.update.apply(e, arguments)
            },
            end: function () {
                e.target.editing && i.end.apply(e, arguments)
            }
        }
    }
    dirty() {
        var t = Editor.Gizmo.prototype.dirty.call(this);
        return this.target.editing ? this._targetEditing || (this._targetEditing = !0, this.enterEditing(), t = !0) : this._targetEditing && (this._targetEditing = !1, this.leaveEditing(), t = !0), t
    }
}
module.exports = ColliderGizmo;