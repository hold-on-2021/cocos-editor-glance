var Uuid = require("node-uuid"),
    Stash = {
        liveReloadableDatas: {},
        dump() {
            var e = _Scene.getEditingWorkspace(),
                d = cc.director.getScene();
            d.children.forEach(e => {
                _Scene.NodeUtils._destroyForUndo(e, () => {
                    _Scene.Undo.recordDeleteNode(e.uuid)
                })
            }), _Scene.Undo.commit(), _Scene.reset();
            var a = Uuid.v4();
            return this.liveReloadableDatas[a] = {
                scene: d,
                undo: _Scene.Undo.dump()
            }, {
                workspace: e,
                dataId: a
            }
        },
        restore(e) {
            _Scene.reset();
            var d = this.liveReloadableDatas[e.dataId];
            d ? (_Scene._UndoImpl.renewObject(d.scene), cc.director.runSceneImmediate(d.scene), _Scene.Undo.restore(d.undo), _Scene.Undo.undo(), delete this.liveReloadableDatas[e.dataId]) : Editor.warn("Failed when restoring stashed scene, can not find data."), _Scene.loadWorkspace(e.workspace)
        }
    };
_Scene.StashInPage = module.exports = Stash;