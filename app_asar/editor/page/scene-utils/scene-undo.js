"use strict";
let UndoImpl = require("./scene-undo-impl"),
    UndoDiff = require("./scene-undo-diff");
class RecordObjectsCommand extends Editor.Undo.Command {
    static get type() {
        return "record-objects"
    }
    undo() {
        let e = [];
        for (let o = this.info.before.length - 1; o >= 0; --o) {
            let t = this.info.before[o],
                n = cc.engine.getInstanceById(t.id);
            try {
                UndoImpl.restoreObject(n, t.data);
                let o = null;
                cc.Node.isNode(n) ? o = n : n instanceof cc.Component && (o = n.node), o && -1 === e.indexOf(o.uuid) && e.push(o.uuid), Editor.Selection.select("node", e)
            } catch (e) {
                Editor.error(`Failed to restore object ${n._name}: ${e}`)
            }
        }
    }
    redo() {
        let e = [];
        for (let o = 0; o < this.info.after.length; ++o) {
            let t = this.info.after[o],
                n = cc.engine.getInstanceById(t.id);
            try {
                UndoImpl.restoreObject(n, t.data);
                let o = null;
                cc.Node.isNode(n) ? o = n : n instanceof cc.Component && (o = n.node), o && -1 === e.indexOf(o.uuid) && e.push(o.uuid), Editor.Selection.select("node", e)
            } catch (e) {
                Editor.error(`Failed to restore object ${n._name}: ${e}`)
            }
        }
    }
}
class RecordNodesCommand extends Editor.Undo.Command {
    static get type() {
        return "record-nodes"
    }
    undo() {
        let e = [];
        for (let o = this.info.before.length - 1; o >= 0; --o) {
            let t = this.info.before[o],
                n = cc.engine.getInstanceById(t.id);
            try {
                UndoImpl.restoreNode(n, t.data), n && -1 === e.indexOf(n.uuid) && e.push(n.uuid), Editor.Selection.select("node", e)
            } catch (e) {
                Editor.error(`Failed to restore object ${n._name}: ${e}`)
            }
        }
        _Scene.AnimUtils.recordNodeChanged(e)
    }
    redo() {
        let e = [];
        for (let o = 0; o < this.info.after.length; ++o) {
            let t = this.info.after[o],
                n = cc.engine.getInstanceById(t.id);
            try {
                UndoImpl.restoreNode(n, t.data), n && -1 === e.indexOf(n.uuid) && e.push(n.uuid), Editor.Selection.select("node", e)
            } catch (e) {
                Editor.error(`Failed to restore object ${n._name}: ${e}`)
            }
        }
        _Scene.AnimUtils.recordNodeChanged(e)
    }
}
class CreateNodesCommand extends Editor.Undo.Command {
    static get type() {
        return "create-nodes"
    }
    undo() {
        let e = [];
        for (let o = this.info.list.length - 1; o >= 0; --o) {
            let t = this.info.list[o];
            _Scene.NodeUtils._destroyForUndo(t.node, () => {
                t.data = UndoImpl.recordDeleteNode(t.node)
            }), e.push(t.node.uuid)
        }
        Editor.Selection.unselect("node", e)
    }
    redo() {
        let e = [];
        for (let o = 0; o < this.info.list.length; ++o) {
            let t = this.info.list[o];
            try {
                UndoImpl.restoreDeleteNode(t.node, t.data), e.push(t.node.uuid)
            } catch (e) {
                Editor.error(`Failed to restore delete node ${t.node._name}: ${e}`)
            }
        }
        Editor.Selection.select("node", e)
    }
}
class DeleteNodesCommand extends Editor.Undo.Command {
    static get type() {
        return "delete-nodes"
    }
    undo() {
        let e = [];
        for (let o = this.info.list.length - 1; o >= 0; --o) {
            let t = this.info.list[o];
            try {
                UndoImpl.restoreDeleteNode(t.node, t.data), e.push(t.node.uuid)
            } catch (e) {
                Editor.error(`Failed to restore delete node ${t.node._name}: ${e}`)
            }
        }
        for (let e = 0; e < this.info.list.length; ++e) {
            let o = this.info.list[e];
            o.node.setSiblingIndex(o.data.siblingIndex)
        }
        Editor.Selection.select("node", e)
    }
    redo() {
        let e = [];
        for (let o = 0; o < this.info.list.length; ++o) {
            let t = this.info.list[o];
            _Scene.NodeUtils._destroyForUndo(t.node, () => {
                t.data = UndoImpl.recordDeleteNode(t.node)
            }), e.push(t.node.uuid)
        }
        Editor.Selection.unselect("node", e)
    }
}
class MoveNodesCommand extends Editor.Undo.Command {
    static get type() {
        return "move-nodes"
    }
    static moveNode(e, o, t) {
        if (e.parent !== o) {
            let t = _Scene.NodeUtils.getWorldPosition(e),
                n = _Scene.NodeUtils.getWorldRotation(e),
                d = _Scene.NodeUtils.getWorldScale(e);
            if (e.parent = o, _Scene.NodeUtils.setWorldPosition(e, t), _Scene.NodeUtils.setWorldRotation(e, n), o) {
                let t = _Scene.NodeUtils.getWorldScale(o);
                d.x /= t.x, d.y /= t.y, e.scale = d
            } else e.scale = d
        }
        e.setSiblingIndex(t)
    }
    undo() {
        let e = [];
        for (let o = this.info.before.length - 1; o >= 0; --o) {
            let t = this.info.before[o];
            MoveNodesCommand.moveNode(t.node, t.parent, t.siblingIndex), e.push(t.node.uuid)
        }
        Editor.Selection.select("node", e)
    }
    redo() {
        let e = [];
        for (let o = 0; o < this.info.after.length; ++o) {
            let t = this.info.after[o];
            MoveNodesCommand.moveNode(t.node, t.parent, t.siblingIndex), e.push(t.node.uuid)
        }
        Editor.Selection.select("node", e)
    }
}
class AddComponentCommand extends Editor.Undo.Command {
    static get type() {
        return "add-component"
    }
    undo() {
        let e = cc.engine.getInstanceById(this.info.id);
        e && (_Scene.NodeUtils._destroyForUndo(this.info.comp, () => {
            this.info.data = UndoImpl.recordObject(this.info.comp)
        }), Editor.Selection.select("node", e.uuid), _Scene.AnimUtils.onRemoveComponent(e, this.info.comp))
    }
    redo() {
        let e = cc.engine.getInstanceById(this.info.id);
        if (e) {
            try {
                UndoImpl.restoreObject(this.info.comp, this.info.data), UndoImpl.renewObject(this.info.comp), e._addComponentAt(this.info.comp, this.info.index)
            } catch (e) {
                Editor.error(`Failed to restore component at node ${this.info.node.name}: ${e}`)
            }
            Editor.Selection.select("node", e.uuid), _Scene.AnimUtils.onAddComponent(e, this.info.comp)
        }
    }
}
class RemoveComponentCommand extends Editor.Undo.Command {
    static get type() {
        return "remove-component"
    }
    undo() {
        let e = cc.engine.getInstanceById(this.info.id);
        if (e) {
            try {
                UndoImpl.restoreObject(this.info.comp, this.info.data), UndoImpl.renewObject(this.info.comp), e._addComponentAt(this.info.comp, this.info.index)
            } catch (e) {
                Editor.error(`Failed to restore component at node ${this.info.node.name}: ${e}`)
            }
            Editor.Selection.select("node", e.uuid), _Scene.AnimUtils.onAddComponent(e, this.info.comp)
        }
    }
    redo() {
        let e = cc.engine.getInstanceById(this.info.id);
        e && (_Scene.NodeUtils._destroyForUndo(this.info.comp, () => {
            this.info.data = UndoImpl.recordObject(this.info.comp)
        }), Editor.Selection.select("node", e.uuid), _Scene.AnimUtils.onRemoveComponent(e, this.info.comp))
    }
}
let _currentNodeRecords = [],
    _currentCreatedRecords = [],
    _currentDeletedRecords = [],
    _currentMovedRecords = [],
    _currentObjectRecords = [],
    _undo = Editor.Undo.local(),
    _allSyncedPrefabSavedPosition = -1;
_undo.on("changed", function (e) {
    switch (e) {
        case "collapse":
        case "clear-redo":
            _allSyncedPrefabSavedPosition > _undo._position && (_allSyncedPrefabSavedPosition = _undo._position);
            break;
        case "clear":
            _allSyncedPrefabSavedPosition = -1
    }
});
let SceneUndo = {
    _listeners: [],
    reset() {
        _currentNodeRecords = [], _currentCreatedRecords = [], _currentDeletedRecords = [], _currentMovedRecords = [], _currentObjectRecords = []
    },
    init() {
        _undo.register(RecordNodesCommand.type, RecordNodesCommand), _undo.register(CreateNodesCommand.type, CreateNodesCommand), _undo.register(DeleteNodesCommand.type, DeleteNodesCommand), _undo.register(MoveNodesCommand.type, MoveNodesCommand), _undo.register(AddComponentCommand.type, AddComponentCommand), _undo.register(RemoveComponentCommand.type, RemoveComponentCommand), _undo.register(RecordObjectsCommand.type, RecordObjectsCommand), this.reset()
    },
    clear() {
        this.reset(), _undo.clear()
    },
    dump() {
        let e = {};
        return e._type = _undo._type, e._position = _undo._position, e._savePosition = _undo._savePosition, e._allSyncedPrefabSavedPosition = _allSyncedPrefabSavedPosition, e._groups = [], _undo._groups.forEach(o => {
            let t = {};
            t.desc = o.desc, t._commands = [], o._commands.forEach(e => {
                let o = {};
                o.type = e.constructor.type, o.info = e.info, t._commands.push(o)
            }), e._groups.push(t)
        }), e
    },
    restore(e) {
        _undo._silent = !0, this.clear(), e._groups.forEach(e => {
            e._commands.forEach(e => {
                _undo.add(e.type, e.info)
            }), _undo.commit()
        }), _undo._type = e._type, _undo._position = e._position, _undo._savePosition = e._savePosition, _allSyncedPrefabSavedPosition = e._allSyncedPrefabSavedPosition, _undo._silent = !1
    },
    recordObject(e, o) {
        o && _undo.setCurrentDescription(o);
        if (!_currentObjectRecords.some(o => o.id === e)) {
            let o = cc.engine.getInstanceById(e);
            try {
                let t = UndoImpl.recordObject(o);
                _currentObjectRecords.push({
                    id: e,
                    data: t
                })
            } catch (e) {
                Editor.error(`Failed to record object ${o._name}: ${e}`)
            }
        }
    },
    recordNode(e, o) {
        o && _undo.setCurrentDescription(o);
        if (!_currentNodeRecords.some(o => o.id === e)) {
            let o = cc.engine.getInstanceById(e);
            if (!o) return;
            try {
                let t = UndoImpl.recordNode(o);
                _currentNodeRecords.push({
                    id: e,
                    data: t
                })
            } catch (e) {
                Editor.error(`Failed to record node ${o._name}: ${e}`)
            }
        }
    },
    recordCreateNode(e, o) {
        o && _undo.setCurrentDescription(o);
        if (!_currentCreatedRecords.some(o => o.node.id === e)) {
            let o = cc.engine.getInstanceById(e);
            _currentCreatedRecords.push({
                node: o,
                parent: o.parent,
                siblingIndex: o.getSiblingIndex()
            })
        }
    },
    recordDeleteNode(e, o) {
        o && _undo.setCurrentDescription(o);
        if (!_currentDeletedRecords.some(o => o.node.id === e)) {
            let o = cc.engine.getInstanceById(e);
            if (!o) return;
            try {
                _currentDeletedRecords.push({
                    node: o,
                    data: UndoImpl.recordDeleteNode(o)
                })
            } catch (e) {
                Editor.error(`Failed to record delete node ${o._name}: ${e}`)
            }
        }
    },
    recordMoveNode(e, o) {
        o && _undo.setCurrentDescription(o);
        if (!_currentMovedRecords.some(o => o.node.id === e)) {
            let o = cc.engine.getInstanceById(e);
            _currentMovedRecords.push({
                node: o,
                parent: o.parent,
                siblingIndex: o.getSiblingIndex()
            })
        }
    },
    recordAddComponent(e, o, t, n) {
        n && _undo.setCurrentDescription(n), _undo.add(AddComponentCommand.type, {
            id: e,
            comp: o,
            index: t
        })
    },
    recordRemoveComponent(e, o, t, n) {
        n && _undo.setCurrentDescription(n), _undo.add(RemoveComponentCommand.type, {
            id: e,
            comp: o,
            index: t,
            data: UndoImpl.recordObject(o)
        })
    },
    commit() {
        if (_currentCreatedRecords.length && (_undo.add(CreateNodesCommand.type, {
                list: _currentCreatedRecords
            }), _currentCreatedRecords = []), _currentObjectRecords.length) {
            try {
                let e = _currentObjectRecords,
                    o = _currentObjectRecords.map(e => {
                        let o = cc.engine.getInstanceById(e.id);
                        return {
                            id: e.id,
                            data: UndoImpl.recordObject(o)
                        }
                    });
                _undo.add(RecordObjectsCommand.type, {
                    before: e,
                    after: o
                })
            } catch (e) {
                Editor.error(`Failed to add record objects to undo list: ${e}`)
            }
            _currentObjectRecords = []
        }
        if (_currentNodeRecords.length) {
            try {
                let e = _currentNodeRecords,
                    o = _currentNodeRecords.map(e => {
                        let o = cc.engine.getInstanceById(e.id);
                        return {
                            id: e.id,
                            data: UndoImpl.recordNode(o)
                        }
                    });
                _undo.add(RecordNodesCommand.type, {
                    before: e,
                    after: o
                })
            } catch (e) {
                Editor.error(`Failed to add record nodes to undo list: ${e}`)
            }
            _currentNodeRecords = []
        }
        if (_currentMovedRecords.length) {
            let e = _currentMovedRecords,
                o = _currentMovedRecords.map(e => ({
                    node: e.node,
                    parent: e.node.parent,
                    siblingIndex: e.node.getSiblingIndex()
                }));
            _undo.add(MoveNodesCommand.type, {
                before: e,
                after: o
            }), _currentMovedRecords = []
        }
        _currentDeletedRecords.length && (_undo.add(DeleteNodesCommand.type, {
            list: _currentDeletedRecords
        }), _currentDeletedRecords = []), _undo.commit()
    },
    cancel() {
        _currentCreatedRecords = [], _currentDeletedRecords = [], _currentMovedRecords = [], _currentObjectRecords = [], _undo.cancel()
    },
    undo() {
        _undo.undo(), cc.engine.repaintInEditMode()
    },
    redo() {
        _undo.redo(), cc.engine.repaintInEditMode()
    },
    save() {
        _undo.save()
    },
    syncedPrefabSave() {
        _allSyncedPrefabSavedPosition = _undo._position
    },
    dirty: () => _undo.dirty(),
    syncedPrefabDirty(e) {
        if (_allSyncedPrefabSavedPosition === _undo._position) return !1;
        try {
            let o = _Scene.NodeUtils.getChildUuids(e),
                t = Math.min(_undo._position, _allSyncedPrefabSavedPosition),
                n = Math.max(_undo._position, _allSyncedPrefabSavedPosition);
            for (let d = t + 1; d <= n; d++) {
                let t = _undo._groups[d];
                for (let n = 0; n < t._commands.length; n++) {
                    let d = t._commands[n];
                    if (d.dirty()) {
                        if (this._nodesDirty(d, o)) return !0;
                        if (this._syncedPrefabRootDirty(d, e.uuid)) return !0
                    }
                }
            }
        } catch (e) {
            Editor.error(e)
        }
        return !1
    },
    _syncedPrefabRootDirty(e, o) {
        function t(e, o) {
            let t = e.node,
                n = o.node,
                d = _Scene.PrefabUtils.NodeRevertableProps_Root;
            for (let e = 0; e < d.length; e++) {
                let o = d[e],
                    r = t[o],
                    i = n[o];
                if (r instanceof cc.ValueType) {
                    if (!r.equals(i)) return !0
                } else if (r !== i) return !0
            }
            return UndoDiff.isComponentChanged(e.comps, o.comps)
        }
        if (e instanceof DeleteNodesCommand || e instanceof CreateNodesCommand || e instanceof MoveNodesCommand) return !1;
        if (e instanceof AddComponentCommand || e instanceof RemoveComponentCommand) return e.info.id === o;
        if (e instanceof RecordObjectsCommand)
            for (let t = 0; t < e.info.before.length; t++) {
                let n = e.info.before[t],
                    d = cc.engine.getInstanceById(n.id);
                if (cc.Node.isNode(d)) d.uuid === o && console.error("Not yet implement checking node data for RecordObjectsCommand");
                else if (d instanceof cc.Component && d.node.uuid === o) return !0
            } else if (e instanceof RecordNodesCommand)
                for (let n = 0; n < e.info.before.length; n++) {
                    let d = e.info.before[n];
                    if (d.id === o && t(d.data, e.info.after[n].data)) return !0
                }
        return !1
    },
    on(e, o) {
        this._listeners.push({
            type: e,
            listener: o
        }), _undo.on.apply(_undo, arguments)
    },
    _unregisterListeners() {
        this._listeners.forEach(e => {
            _undo.removeListener(e.type, e.listener)
        })
    },
    _registerListeners() {
        this._listeners.forEach(e => {
            _undo.on(e.type, e.listener)
        })
    },
    _nodesDirty(e, o) {
        let t = e.info;
        if (!t) return !1;
        let n = t.id;
        if (n)
            for (let e = 0; e < o.length; e++)
                if (n === o[e]) return !0;
        let d;
        if (Array.isArray(t.before)) d = t.before;
        else {
            if (!Array.isArray(t.list)) return !1;
            d = t.list
        }
        if (!d) return !1;
        for (let e = 0; e < d.length; e++) {
            let t = d[e],
                n = t && (t.id || t.node && t.node.uuid);
            if (n)
                for (let e = 0; e < o.length; e++)
                    if (n === o[e]) return !0
        }
        return !1
    }
};
_Scene.Undo = SceneUndo, _Scene.Undo._undo = _undo;