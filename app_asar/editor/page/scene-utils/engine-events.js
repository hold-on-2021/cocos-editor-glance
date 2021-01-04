"use strict";

function onNodeAttachToScene(e) {
    let n = e.detail.target,
        o = cc.js.getClassName(n),
        i = _Scene.gizmos[o];
    i && (n.gizmo = new i(_Scene.gizmosView, n), n.gizmo.update()), cc.engine.repaintInEditMode()
}

function onNodeDetachFromScene(e) {
    let n = e.detail.target;
    n.gizmo && (n.gizmo.remove(), n.gizmo = null), n.trajectoryGizmo && (n.trajectoryGizmo.remove(), n.trajectoryGizmo = null), cc.engine.repaintInEditMode()
}

function onComponentEnabled(e) {
    let n, o = cc.engine.getInstanceById(e.detail),
        i = cc.js.getClassName(o),
        t = Editor.gizmos[i];
    if (t) try {
        n = Editor.require(t)
    } catch (e) {
        Editor.error(e)
    }
    if (n || (n = _Scene.gizmos.components[i]), n) {
        o.gizmo = new n(_Scene.gizmosView, o), o.gizmo.update();
        let e = o.node;
        e && e.gizmo && (o.gizmo.selecting = e.gizmo.selecting, o.gizmo.editing = e.gizmo.editing)
    }
    cc.engine.updateAnimatingInEditMode(), cc.engine.repaintInEditMode()
}

function onComponentDisabled(e) {
    let n = cc.engine.getInstanceById(e.detail);
    n.gizmo && (n.gizmo.remove(), n.gizmo = null), cc.engine.updateAnimatingInEditMode(), cc.engine.repaintInEditMode()
}

function _updateGizmos(e) {
    e.gizmo && (e.gizmo._dirty = e.gizmo._dirty || _dirty, e.gizmo.update()), e.trajectoryGizmo && e.trajectoryGizmo.update();
    let n = e._components;
    for (let e = 0, o = n.length; e < o; e++) {
        let o = n[e];
        o.gizmo && (o.gizmo._dirty = o.gizmo._dirty || _dirty, o.gizmo.update())
    }
    e._children.forEach(_updateGizmos)
}

function onPostUpdate() {
    if (!cc.director.getRunningScene() || _Scene.isLoadingScene) return;
    _Scene.gizmosView.update();
    cc.director.getScene()._children.forEach(_updateGizmos), _dirty = !1
}

function onDesignResolutionChanged() {
    let e = cc.engine.getDesignResolutionSize();
    _Scene.gizmosView.designSize = [e.width, e.height]
}

function onSceneLaunched() {
    cc.engine.isPlaying || (_Scene.view.adjustToCenter(20), cc.engine.repaintInEditMode())
}

function onUndoChanged(e) {
    _dirty = !0
}
let _dirty = !0,
    EngineEvents = {
        isLoaded: !1,
        register() {
            this.isLoaded || (this.isLoaded = !0, cc.director.on(cc.Director.EVENT_AFTER_VISIT, onPostUpdate), cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, onSceneLaunched), cc.engine.on("node-attach-to-scene", onNodeAttachToScene), cc.engine.on("node-detach-from-scene", onNodeDetachFromScene), cc.engine.on("component-enabled", onComponentEnabled), cc.engine.on("component-disabled", onComponentDisabled), cc.engine.on("design-resolution-changed", onDesignResolutionChanged), _Scene.Undo.on("changed", onUndoChanged))
        },
        unregister() {
            this.isLoaded = !1, cc.director.off(cc.Director.EVENT_AFTER_VISIT, onPostUpdate), cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, onSceneLaunched), cc.engine.off("node-attach-to-scene", onNodeAttachToScene), cc.engine.off("node-detach-from-scene", onNodeDetachFromScene), cc.engine.off("component-enabled", onComponentEnabled), cc.engine.off("component-disabled", onComponentDisabled), cc.engine.off("design-resolution-changed", onDesignResolutionChanged), _Scene.Undo.off("changed", onUndoChanged)
        }
    };
_Scene.EngineEvents = EngineEvents;