"use strict";

function equalClips(e, t) {
    return e === t || e && t && (e.name === t.name || e._uuid === t._uuid)
}
const util = require("util");
let AnimUtils = {
    _recording: !1,
    _recordingData: {},
    _dirty: !1,
    _undoDump: null,
    curRootNode: null,
    curEditNode: null,
    curAnim: null,
    curAnimState: null,
    curTime: -1,
    name: "animation",
    title: "",
    dirty() {
        return this._dirty
    },
    resetAnim() {
        this._recording = !1, this._recordingData = {}, this._dirty = !1, this._undoDump = null, this.curAnim = null, this.curAnimState = null, this.curTime = -1, this.title = ""
    },
    isPlaying() {
        let e = this.curAnimState;
        return !!e && (e.isPlaying && !e.isPaused)
    },
    getCurrentClip() {
        return this.curAnimState ? this.curAnimState.clip : null
    },
    setAnimationTime(e) {
        let t = this.curAnim,
            i = this.curAnimState;
        if (!t || !i) return;
        let r = e.clip;
        i.isPlaying || (t.play(r), t.pause(r));
        let n = e.time;
        this.curTime = n, n > i.duration && (n = i.duration), (i.wrapMode & cc.WrapMode.Reverse) === cc.WrapMode.Reverse && (n = i.duration - n), i.setTime(n), i.sample(), cc.engine.repaintInEditMode()
    },
    getAnimationTime(e) {
        let t = this.curAnimState;
        if (!t) return {
            clip: "",
            time: 0,
            isPlaying: !1
        };
        let i = t.getWrappedInfo(t.time);
        return {
            clip: e.clip,
            time: i.time,
            isPlaying: this.isPlaying()
        }
    },
    setCurrentPlayState(e) {
        let t = this.curAnim,
            i = this.curAnimState;
        if (!t || !i) return;
        let r = e.state,
            n = e.clip;
        if ("play" === r) {
            _Scene.gizmosView.hidden = !0;
            let e = i.getWrappedInfo(i.time).time;
            i.isPaused && e >= i.duration && i.setTime(0), t.play(n), cc.engine.animatingInEditMode = !0
        } else "pause" === r ? (_Scene.gizmosView.hidden = !1, i.isPlaying && t.pause(n), cc.engine.animatingInEditMode = !1) : "stop" === r && (_Scene.gizmosView.hidden = !1, t.stop(n), cc.engine.animatingInEditMode = !1)
    },
    setSpeed(e) {
        let t = this.curAnimState;
        t && (t.speed = e)
    },
    addClip(e) {
        let t = this.curRootNode;
        t && cc.AssetLibrary.loadAsset(e.clipUuid, (e, i) => {
            t.getComponent(cc.Animation).addClip(i)
        })
    },
    async updateClip(e) {
        let t = this.curAnim;
        if (!t) return;
        let i = t.getAnimationState(e.clip);
        if (!i) return;
        let r;
        try {
            r = await util.promisify(cc.AssetLibrary.loadJson)(e.data)
        } catch (e) {
            return Editor.error(err), void 0
        }
        let n;
        try {
            n = await util.promisify(cc.AssetLibrary.loadAsset)(this.getCurrentClip()._uuid), this._dirty = Editor.serialize(n) !== e.data
        } catch (e) {
            Editor.warn(e), this._dirty = !0
        }
        if (this._updateClip(t, r), this._recording && this.curAnimState === i) {
            i.sample();
            let e = this.curEditNode.trajectoryGizmo;
            e && e._clip._uuid === r._uuid && !e._hidden && e.updateClip(r), cc.engine.repaintInEditMode()
        }
    },
    updateStateTime(e, t, i) {
        let r = e.isPlaying && !e.isPaused,
            n = (t.wrapMode & cc.WrapMode.Reverse) === cc.WrapMode.Reverse,
            a = (e.wrapMode & cc.WrapMode.Reverse) === cc.WrapMode.Reverse;
        if (void 0 === i || r ? i = e.time : i > t.duration && (i = t.duration), e.wrapMode !== t.wrapMode) {
            i = e.getWrappedInfo(i).time, r ? n && (i = Math.abs(i - t.duration)) : n !== a && (i = Math.abs(i - t.duration))
        } else(e.wrapMode & cc.WrapMode.Reverse) === cc.WrapMode.Reverse && (i = Math.abs(i - t.duration));
        e.setTime(i)
    },
    _changeCurrentClip(e, t) {
        if (!e.clip) return this.curAnim = null, this.curAnimState = null, t && t(), void 0;
        let i = this.curRootNode;
        if (!i) return t && t(), void 0;
        if (this.dirty) {
            let e = this.getCurrentClip(),
                i = this.confirmClose(0, !0);
            if (1 === i) return Editor.Ipc.sendToAll("scene:animation-current-clip-changed", e.name), t && t(), void 0;
            if (2 === i) return cc.AssetLibrary.loadAsset(e._uuid, (i, r) => {
                if (i) return Editor.error(i), void 0;
                this._updateClip(this.curAnim, r), Editor.Ipc.sendToAll("scene:animation-clip-changed", {
                    uuid: e._uuid,
                    data: Editor.serialize(r),
                    clip: e.name,
                    dirty: !1
                }), this._dirty = !1, t && t()
            }), void 0
        }
        let r = this.curAnim = i.getComponent(cc.Animation),
            n = e.clip;
        this.curAnimState = r.getAnimationState(n), r.play(n), r.pause(n);
        let a = this.curTime || 0;
        a > this.curAnimState.duration && (a = this.curAnimState.duration), this.curAnimState.setTime(a);
        let o = this.getCurrentClip();
        o || Editor.warn(`Can't find clip for [${e.clip}]`), Editor.assetdb.queryUrlByUuid(o._uuid, (e, t) => {
            _Scene.updateTitle(t), this.title = t
        }), this.curAnimState.sample(), this.showTrajectoryGizmo(), t && t()
    },
    changeCurrentClip(e, t) {
        _Scene.Tasks.push({
            name: "animation-change-current-clip",
            target: this,
            run: this._changeCurrentClip,
            params: [e]
        }, t)
    },
    stopAnimation() {
        this.curAnimState && Editor.Ipc.sendToWins("scene:animation-state-changed", {
            state: "pause",
            clip: this.curAnimState.name
        })
    },
    showTrajectoryGizmo(e) {
        e = e || this.curEditNode;
        let t = this.getCurrentClip(),
            i = this.curRootNode;
        if (!e || !i || !t) return;
        let r = _Scene.gizmosView;
        var n = "";
        if (e !== i) {
            n = e.name;
            for (var a = e.parent; a !== i;)
                if (n = a.name + "/" + n, a = a.parent, !a) return Editor.error("Can't generate child path for node."), void 0
        }
        e.trajectoryGizmo || (e.trajectoryGizmo = new _Scene.gizmos.trajectory(r, e)), e.trajectoryGizmo.show(i, t, n)
    },
    hideTrajectoryGizmo(e) {
        (e = e || this.curEditNode) && e.trajectoryGizmo && e.trajectoryGizmo.hide()
    },
    setCurEditNode(e) {
        if (this.curEditNode = e, this._recording) return;
        this.curRootNode = null;
        let t = e,
            i = t.getComponent(cc.Animation);
        for (; t && !(t instanceof cc.Scene);) {
            if (i = t.getComponent(cc.Animation), i) {
                this.curRootNode = t;
                break
            }
            t = t.parent
        }
    },
    ensureEditNode() {
        var e = Editor.Selection.curActivate("node"),
            t = cc.engine.getInstanceById(e);
        this.setCurEditNode(t)
    },
    activate(e) {
        this.setCurEditNode(e), this._recording && this.showTrajectoryGizmo(e)
    },
    deactivate(e) {
        this._recording && this.hideTrajectoryGizmo(e)
    },
    getAnimationNodeDump(e) {
        let t = cc.engine.getInstanceById(e),
            i = t;
        for (; i;) {
            if (i.getComponent(cc.Animation)) break;
            if (i.parent instanceof cc.Scene) {
                i = t;
                break
            }
            i = i.parent
        }
        return Editor.getAnimationNodeDump(i, t)
    },
    recordNodeChanged(e) {
        if (!this._recording || !e || !e.length) return;
        let t = e;
        "string" == typeof t[0] && (t = t.map(e => cc.engine.getInstanceById(e)));
        let i = t.map(e => ({
            id: e.uuid,
            dump: Editor.getNodeDump(e)
        }));
        Editor.Ipc.sendToWins("editor:record-node-changed", i)
    },
    open(e) {
        if (this._recording) return;
        this.ensureEditNode(), this._recording = !0, Editor.Ipc.sendToWins("editor:start-recording");
        let t = this.curRootNode;
        cc.engine.editingRootNode = t;
        let i = this._recordingData;
        _Scene.walk(t, !0, e => {
            let t = _Scene._UndoImpl.recordAnimationNode(e);
            i[e.uuid] = t
        }), this._undoDump = _Scene.Undo.dump(), _Scene.Undo.clear(), Editor.Ipc.sendToPanel("hierarchy", "hierarchy:enter-record-mode", t.uuid), e && e()
    },
    confirmClose(e, t) {
        e = void 0 === e ? 2 : e;
        let i = this.getCurrentClip();
        if (this._dirty && i) {
            let r = [Editor.T("MESSAGE.save"), Editor.T("MESSAGE.cancel"), Editor.T("MESSAGE.dont_save")];
            t && r.splice(1, 1);
            let n = i.name;
            e = Editor.Dialog.messageBox({
                type: "warning",
                buttons: r,
                title: Editor.T("MESSAGE.animation_editor.save_confirm_title"),
                message: Editor.T("MESSAGE.animation_editor.save_confirm_message", {
                    name: n
                }),
                detail: Editor.T("MESSAGE.animation_editor.save_confirm_detail"),
                defaultId: t ? 1 : 2,
                cancelId: t ? void 0 : 1,
                noLink: !0
            }), t && 1 === e && (e = 2)
        }
        return e
    },
    close(e, t) {
        if (!this._recording) return t();
        let i = () => {
            cc.engine.animatingInEditMode = !1, this.curAnimState && this.setCurrentPlayState({
                state: "pause",
                clip: this.curAnimState.name
            }), this.hideTrajectoryGizmo(), this._recording = !1, Editor.Ipc.sendToWins("editor:stop-recording", e);
            let i = this._recordingData;
            for (let e in i) {
                let t = cc.engine.getInstanceById(e),
                    r = i[e];
                _Scene._UndoImpl.restoreAnimationNode(t, r)
            }
            this._recordingData = {}, cc.engine.editingRootNode = null, _Scene.Undo.restore(this._undoDump), this.resetAnim(), Editor.Ipc.sendToPanel("hierarchy", "hierarchy:exit-record-mode"), t()
        };
        switch (e) {
            case 0:
                this.save(() => {
                    i()
                });
                break;
            case 1:
                t();
                break;
            case 2:
                let r = this.curAnim,
                    n = this.getCurrentClip();
                r && n ? cc.AssetLibrary.loadAsset(n._uuid, (e, t) => {
                    if (e) return Editor.error(e), i();
                    this._updateClip(r, t), i()
                }) : i();
                break;
            default:
                Editor.warn(`Not handled Animation closeResult ${e}.`), t()
        }
    },
    beforePushOther() {
        _Scene.EditMode.popAll()
    },
    save(e) {
        if (!this._dirty) return e && e(), void 0;
        let t = this.getCurrentClip();
        if (!t) return e && e(), void 0;
        this._dirty = !1, _Scene.Undo.save(), Editor.assetdb.queryUrlByUuid(t._uuid, (i, r) => {
            Editor.Ipc.sendToMain("asset-db:save-exists", r, t.serialize(), e)
        })
    },
    softReload() {
        if (!(this._recording && this.curAnim && this.curAnimState && this.curEditNode && this.curRootNode)) return;
        let e = this.curAnimState,
            t = e.clip,
            i = this.curEditNode,
            r = this.curRootNode;
        this.curEditNode = cc.engine.getInstanceById(i.uuid), this.curRootNode = cc.engine.getInstanceById(r.uuid), this._changeCurrentClip({
            clip: t.name
        }), this._updateClip(this.curAnim, t), this.curAnimState.time = e.time, cc.engine.editingRootNode = cc.engine.getInstanceById(r.uuid)
    },
    onAddComponent(e, t) {
        t instanceof cc.Animation ? this.setCurEditNode(e) : this._recording && this.refresh()
    },
    onRemoveComponent() {
        this._recording && this.refresh()
    },
    refresh() {
        let e = this.getCurrentClip();
        this.curAnim && e && this._updateClip(this.curAnim, e)
    },
    assetChanged(e, t) {
        cc.AssetLibrary._queryAssetInfoInEditor(e.uuid, (i, r, n, a) => {
            a === cc.AnimationClip && cc.AssetLibrary.loadAsset(e.uuid, (e, i) => {
                if (e) return Editor.error(e), void 0;
                let r = cc.director.getScene();
                _Scene.walk(r, !1, e => {
                    let r = e.getComponent(cc.Animation);
                    if (r) {
                        let e = this.getCurrentClip();
                        if (this._dirty && e && e._uuid === i._uuid && !t) {
                            let t = e.name,
                                r = Editor.Dialog.messageBox({
                                    type: "warning",
                                    buttons: [Editor.T("MESSAGE.save"), Editor.T("MESSAGE.dont_save")],
                                    title: Editor.T("MESSAGE.animation_editor.local_asset_changed"),
                                    message: Editor.T("MESSAGE.animation_editor.local_asset_changed_message", {
                                        name: t
                                    }),
                                    detail: Editor.T("MESSAGE.animation_editor.local_asset_changed_detail"),
                                    noLink: !0
                                });
                            return 0 === r ? this.save() : 1 === r && Editor.Ipc.sendToWins("scene:animation-clip-changed", {
                                uuid: e._uuid,
                                data: i.serialize(),
                                clip: i.name,
                                dirty: !1
                            }), void 0
                        }
                        for (let e = r._clips.length - 1; e >= 0; e--) {
                            let n = r._clips[e];
                            n && i._uuid === n._uuid && this._updateClip(r, i, i.name, t)
                        }
                    }
                    let n = e.trajectoryGizmo;
                    n && !t && n.updateClip(i)
                })
            })
        })
    },
    assetsMoved(e) {
        e.forEach(e => {
            this.assetChanged(e, !0)
        })
    },
    _updateClip: function (e, t, i, r) {
        e._init(), i = i || t.name;
        var n;
        for (var a in e._nameToState) {
            var o = e._nameToState[a],
                d = o.clip;
            if (equalClips(d, t)) {
                t._uuid || (t._uuid = d._uuid), n = o;
                break
            }
        }
        if (!n) return cc.error("Can't find state from clip [" + i + "]"), void 0;
        if (!r) {
            var s = e._clips;
            s[s.indexOf(n.clip)] = t
        }
        if (n.name !== i && (delete e._nameToState[n.name], e._nameToState[i] = n, n._name = i), r) n._clip.name = i;
        else {
            n._clip = t, e._animator._reloadClip(n);
            let i = this.curTime;
            i > n.duration && (i = n.duration), n.setTime(i)
        }
    }
};
_Scene.EditMode.register(AnimUtils), _Scene.AnimUtils = AnimUtils;