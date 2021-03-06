"use strict";function getTopLevelNodes(e){return Editor.Utils.arrayCmpFilter(e,(e,t)=>e===t?0:t.isChildOf(e)?1:e.isChildOf(t)?-1:0)}function createScene(e,t){_Scene.reset(),cc.AssetLibrary.loadJson(e,t)}function callOnFocusInTryCatch(e){try{e.onFocusInEditor()}catch(e){cc._throw(e)}}function callOnLostFocusInTryCatch(e){try{e.onLostFocusInEditor()}catch(e){cc._throw(e)}}function checkAddComponent(e,t,n){if(t._disallowMultiple){let i=e.getComponent(t._disallowMultiple);if(i){let e;e=i.constructor===t?Editor.T("MESSAGE.scene.contain_same_component"):Editor.T("MESSAGE.scene.contain_derive_component",{className:cc.js.getClassName(i)});let o;return o=n?"MESSAGE.scene.cant_add_required_component":"MESSAGE.scene.cant_add_component",Editor.Dialog.messageBox({type:"warning",buttons:["OK"],title:Editor.T("MESSAGE.warning"),message:Editor.T(o,{className:cc.js.getClassName(t)}),detail:e,noLink:!0}),!1}}var i=t._requireComponent;return!(i&&!e.getComponent(i))||checkAddComponent(e,i,!0)}const Async=require("async"),Url=require("fire-url"),Path=require("fire-path"),getDefault=Editor.require("unpack://engine/cocos2d/core/platform/CCClass").getDefault;let _clipboard={},Scene={transformTool:"move",pivot:"pivot",coordinate:"local",isLoadingScene:!1,gizmos:{},name:"scene",get clipboard(){return _clipboard},init(){this.view||(this.view=document.createElement("scene-view"),this.view.id="sceneView",this.view.classList.add("fit"),this.view.tabIndex=-1),this.gizmosView||(this.gizmosView=this.view.$.gizmosView,this.gizmosView.transformTool=this.transformTool,this.gizmosView.coordinate=this.coordinate,this.gizmosView.pivot=this.pivot),this.Undo.init(),this.Undo.on("changed",()=>{this.updateTitle(this.title())})},reset(){Editor.Selection.clear("node"),this.gizmosView.reset(),cc.engine.animatingInEditMode=!1,this.AnimUtils.stopAnimation()},_softReload(e,t){_Scene.Sandbox.reload(e,()=>{_Scene.EditMode.softReload(),t()})},softReload(e,t){_Scene.Tasks.push({name:"soft-reload",target:this,run:this._softReload,params:[e]},t)},defaultScene(){let e=new cc.Scene,t=new cc.Node("Canvas");t.parent=e,t.addComponent(cc.Canvas),cc.director.runSceneImmediate(e)},newScene(e){this.reset(),this.defaultScene(),Editor.Ipc.sendToMain("scene:set-current-scene",null,()=>{e&&e()})},_loadSceneByUuid(e,t){this.reset(),cc.director._loadSceneByUuid(e,n=>{if(n)return t&&t(n),void 0;this.stashScene(()=>{Editor.Ipc.sendToMain("scene:set-current-scene",e,()=>{t&&t()})})})},loadSceneByUuid(e,t){_Scene.Tasks.push({name:"load-scene-by-uuid",target:this,run:this._loadSceneByUuid,params:[e]},t)},initScene(e){let t=Editor.remote.stashedScene,n=t&&t.sceneJson;n?Async.waterfall([_Scene.Sandbox.loadScripts,createScene.bind(this,n),(e,t)=>{cc.director.runSceneImmediate(e.scene),t()},_Scene.loadWorkspace.bind(this,t)],e):Async.waterfall([_Scene.Sandbox.loadScripts,e=>{let t=Editor.remote.currentSceneUuid;t?cc.director._loadSceneByUuid(t,t=>{e(t,null)}):(this.defaultScene(),e(null,null))},_Scene.loadWorkspace],e)},getEditingWorkspace(){return{sceneScale:this.view.scale,sceneOffsetX:this.view.$.grid.xAxisOffset,sceneOffsetY:this.view.$.grid.yAxisOffset,designWidth:this.gizmosView.designSize[0],designHeight:this.gizmosView.designSize[1],sceneSelection:Editor.Selection.curSelection("node")}},loadWorkspace(e,t){e&&(Editor.Selection.select("node",e.sceneSelection,!0,!0),_Scene.view.initPosition(e.sceneOffsetX,e.sceneOffsetY,e.sceneScale)),t&&t()},stashScene(e){let t,n=_Scene.EditMode.curMode();if(n&&n.getPreviewScene)t=n.getPreviewScene();else{var i=cc.director.getScene();let e=new cc.SceneAsset;e.scene=i,e.name=i.name,t=Editor.serialize(e,{stringify:!0})}var o=this.getEditingWorkspace();o.sceneJson=t,Editor.remote.stashedScene=o,e&&e(null,t)},_applyCanvasPreferences(e,t){(e=e||cc.Canvas.instance)&&Editor.Profile.load("profile://project/project.json",(n,i)=>{let o=i.data,r=o["design-resolution-width"],c=o["design-resolution-height"];e.designResolution=cc.size(r,c),e.fitWidth=o["fit-width"],e.fitHeight=o["fit-height"],t&&t()})},currentScene:()=>cc.director.getScene(),title:()=>_Scene.EditMode.title(),updateTitle(e){Editor.Ipc.sendToMain("scene:update-title",this.Undo.dirty(),e)},save(e){if(_Scene.EditMode.curMode()!==this)return e(new Error("Creator's bug? Can not save scene in other edit mode, please save in scene mode."));var t=Editor.remote.currentSceneUuid,n=cc.director.getScene(),i=new cc.SceneAsset;i.scene=n,this.AnimUtils.stopAnimation(),cc.Object._deferredDestroy(),_Scene.PrefabUtils.validateAllSceneReferences(n);var o=new(0,Editor.require("app://editor/page/scene-utils/missing-class-reporter").MissingClassReporter)(i),r=new(Editor.require("app://editor/page/scene-utils/missing-object-reporter"))(i),c=Editor.serialize(i,{missingClassReporter:o.stash.bind(o),missingObjectReporter:r.stash.bind(r)});try{o.report(),r.report()}catch(e){Editor.error(e)}Editor.Ipc.sendToMain("scene:save-scene",c,t,e,-1)},confirmClose(){if(this.dirty()){var e="Untitled",t=Editor.remote.currentSceneUuid;if(t){var n=Editor.assetdb.remote.uuidToUrl(t);n&&(e=Url.basename(n))}return Editor.Dialog.messageBox({type:"warning",buttons:[Editor.T("MESSAGE.save"),Editor.T("MESSAGE.cancel"),Editor.T("MESSAGE.dont_save")],title:Editor.T("MESSAGE.scene.save_confirm_title"),message:Editor.T("MESSAGE.scene.save_confirm_message",{name:e}),detail:Editor.T("MESSAGE.scene.save_confirm_detail"),defaultId:0,cancelId:1,noLink:!0})}return 2},close(e,t){switch(e){case 0:this.save((n,i)=>{if(i)return t(n,1);t(n,e)});break;case 1:case 2:t(null,e)}},dirty:()=>_Scene.Undo.dirty(),copyNodes(e){_clipboard={};let t=e.map(e=>cc.engine.getInstanceById(e)).filter(e=>!!e);t=getTopLevelNodes(t).filter(e=>!!e);let n={sceneId:cc.director.getScene().uuid,nodes:{}};t.forEach(e=>{n.nodes[e.uuid]=cc.instantiate(e)}),_clipboard.data=n},pasteNodes(e){if(!_clipboard.data)return;let t;e&&(t=(t=cc.engine.getInstanceById(e)).parent),t||(t=cc.director.getScene());let n=_clipboard.data.nodes,i=[];for(let e in n){let o=cc.instantiate(n[e]);o.parent=t,i.push(o.uuid),_Scene.Undo.recordCreateNode(o.uuid)}_Scene.Undo.commit(),Editor.Selection.select("node",i)},adjustNumber(e,t){return t=t||Editor.Math.numOfDecimalsF(1/this.view.scale),Editor.Math.toPrecision(e,t)},adjustVec2(e,t){return t=t||Editor.Math.numOfDecimalsF(1/this.view.scale),e.x=Editor.Math.toPrecision(e.x,t),e.y=Editor.Math.toPrecision(e.y,t),e},adjustSize(e,t){return t=t||Editor.Math.numOfDecimalsF(1/this.view.scale),e.width=Editor.Math.toPrecision(e.width,t),e.height=Editor.Math.toPrecision(e.height,t),e},adjustNodePosition(e,t){void 0===t&&(t=Editor.Math.numOfDecimalsF(1/this.view.scale)),e.setPosition(Editor.Math.toPrecision(e.position.x,t),Editor.Math.toPrecision(e.position.y,t))},adjustNodeScale(e,t){void 0===t&&(t=Editor.Math.numOfDecimalsF(1/this.view.scale)),e.setScale(Editor.Math.toPrecision(e.scaleX,t),Editor.Math.toPrecision(e.scaleY,t))},adjustNodeRotation(e,t){void 0===t&&(t=Editor.Math.numOfDecimalsF(1/this.view.scale)),e.rotation=Editor.Math.toPrecision(e.rotation,t)},adjustNodeSize(e,t){void 0===t&&(t=Editor.Math.numOfDecimalsF(1/this.view.scale)),e.setContentSize(Editor.Math.toPrecision(e.width,t),Editor.Math.toPrecision(e.height,t))},adjustNodeAnchor(e,t){void 0===t&&(t=Editor.Math.numOfDecimalsF(1/this.view.scale)),e.setAnchorPoint(Editor.Math.toPrecision(e.anchorX,t),Editor.Math.toPrecision(e.anchorY,t))},createNodes(e,t,n){let i;t&&(i=cc.engine.getInstanceById(t)),i||(i=cc.director.getScene()),Editor.Selection.unselect("node",Editor.Selection.curSelection("node"),!1),Async.each(e,(e,t)=>{Async.waterfall([t=>{_Scene.createNodeFromAsset(e,t)},(e,t)=>{let n;e&&(n=e.uuid,i&&(e.parent=i),_Scene.Undo.recordCreateNode(n)),t(null,n)}],(i,o)=>{if(i)return Editor.failed(`Failed to drop asset ${e}, message: ${i.stack}`),void 0;if(o&&Editor.Selection.select("node",o,!1,!1),cc.engine.repaintInEditMode(),n&&n.unlinkPrefab){var r=cc.engine.getInstanceById(o);r&&r.parent&&r.parent._prefab||_Scene.breakPrefabInstance([o])}t(o)})},e=>{if(_Scene.Undo.commit(),e)return Editor.Selection.cancel(),void 0;Editor.Selection.confirm()})},createNodesAt(e,t,n,i){Editor.Selection.cancel(),Editor.Selection.clear("node"),Async.each(e,(e,o)=>{Async.waterfall([t=>{_Scene.createNodeFromAsset(e,t)},(e,i)=>{var o;e&&(o=e.uuid,e.setPosition(this.view.pixelToScene(cc.v2(t,n))),e.parent=cc.director.getScene(),this.adjustNodePosition(e)),_Scene.Undo.recordCreateNode(o),_Scene.Undo.commit(),i(null,o)}],(t,n)=>{if(t)return Editor.failed(`Failed to drop asset ${e}, message: ${t.stack}`),void 0;if(n&&Editor.Selection.select("node",n,!1,!0),cc.engine.repaintInEditMode(),i&&i.unlinkPrefab){var r=cc.engine.getInstanceById(n);r&&r.parent&&r.parent._prefab||_Scene.breakPrefabInstance([n])}o()})})},createNodeByClassID(e,t,n,i){let o;n&&(o=cc.engine.getInstanceById(n),i&&(o=o.parent)),o||(o=cc.director.getScene());let r=new cc.Node(e);if(r.parent=o,t){let e=cc.js._getClassById(t);e?r.addComponent(e):Editor.error(`Unknown node to create: ${t}`)}cc.engine.repaintInEditMode(),Editor.Selection.select("node",r.uuid,!0,!0),_Scene.Undo.recordCreateNode(r.uuid),_Scene.Undo.commit()},createNodeByPrefab(e,t,n,i){let o;_Scene.createNodeFromAsset(t,(t,r)=>{if(t)return Editor.error(t),void 0;_Scene.PrefabUtils.unlinkPrefab(r),r.name=e,n&&(o=cc.engine.getInstanceById(n),i&&(o=o.parent)),o||(o=cc.director.getScene());var c=r.getComponent(cc.Canvas);c&&_Scene._applyCanvasPreferences(c),r.parent=o,cc.engine.repaintInEditMode(),Editor.Selection.select("node",r.uuid,!0,!0),_Scene.Undo.recordCreateNode(r.uuid),_Scene.Undo.commit()})},deleteNodes(e){if(this.AnimUtils._recording)return;let t=[];for(let n=0;n<e.length;++n){let i=cc.engine.getInstanceById(e[n]);i&&t.push(i)}getTopLevelNodes(t).forEach(e=>{_Scene.NodeUtils._destroyForUndo(e,()=>{this.Undo.recordDeleteNode(e.uuid)})}),this.Undo.commit(),Editor.Selection.unselect("node",e,!0)},duplicateNodes(e){if(this.AnimUtils._recording)return;let t=[];for(let n=0;n<e.length;++n){let i=cc.engine.getInstanceById(e[n]);i&&t.push(i)}let n=[];getTopLevelNodes(t).forEach(e=>{let t=cc.instantiate(e);t.parent=e.parent,n.push(t.uuid),_Scene.Undo.recordCreateNode(t.uuid)}),_Scene.Undo.commit(),Editor.Selection.select("node",n)},moveNodes(e,t,n){function i(e){return e._parent._children.indexOf(e)}let o;o=t?cc.engine.getInstanceById(t):cc.director.getScene();let r=n?cc.engine.getInstanceById(n):null,c=r?i(r):-1;for(let t=0;t<e.length;t++){let n=e[t],s=cc.engine.getInstanceById(n);if(s&&(!o||!o.isChildOf(s)))if(_Scene.Undo.recordMoveNode(n),s.parent!==o){let e=this.NodeUtils.getWorldPosition(s),t=this.NodeUtils.getWorldRotation(s),n=this.NodeUtils.getWorldScale(s);if(s.parent=o,this.NodeUtils.setWorldPosition(s,e),this.NodeUtils.setWorldRotation(s,t),o){let e=_Scene.NodeUtils.getWorldScale(o);n.x/=e.x,n.y/=e.y,s.scale=n}else s.scale=n;this.adjustNodePosition(s,7),this.adjustNodeRotation(s,7),this.adjustNodeScale(s,7),r&&(s.setSiblingIndex(c),++c)}else if(r){let e=i(s),t=c;t>e&&--t,t!==e&&(s.setSiblingIndex(t),e>t?++c:--c)}else s.setSiblingIndex(-1)}_Scene.Undo.commit()},addComponent(e,t){if(!t){if(t=e,!t)return Editor.error("Component ID is undefined"),void 0;e=Editor.Selection.curActivate("node")}if(!e)return Editor.warn("Please select a node first"),void 0;let n=Editor.Utils.UuidUtils.isUuid(t),i=cc.js._getClassById(t);if(!i)return n?(Editor.error(`Can not find cc.Component in the script ${t}.`),void 0):(Editor.error(`Failed to get component ${t}`),void 0);let o=cc.engine.getInstanceById(e);if(!o)return Editor.error(`Can not find node ${e}`),void 0;if(!checkAddComponent(o,i))return;let r=o.addComponent(i);r&&(cc.director._nodeActivator.resetComp(r),this.Undo.recordAddComponent(e,r,o._components.indexOf(r)),this.Undo.commit(),this.AnimUtils.onAddComponent(o,r))},removeComponent(e,t){let n=cc.engine.getInstanceById(t);if(!n)return Editor.error(`Can not find component ${t}`),void 0;if(this.AnimUtils._recording&&n instanceof cc.Animation)return Editor.error("Can not remove cc.Animation Component in Animation Edit Mode"),void 0;let i=cc.engine.getInstanceById(e);if(!i)return Editor.error(`Can not find node ${e}`),void 0;let o=i._getDependComponent(n);if(o)return Editor.Dialog.messageBox({type:"warning",buttons:[Editor.T("MESSAGE.ok")],title:Editor.T("MESSAGE.warning"),message:Editor.T("MESSAGE.scene.cant_remove_component",{className:cc.js.getClassName(n)}),detail:Editor.T("MESSAGE.scene.cant_remove_component_detail",{className:cc.js.getClassName(o)}),noLink:!0}),void 0;_Scene.NodeUtils._destroyForUndo(n,()=>{this.Undo.recordRemoveComponent(e,n,i._components.indexOf(n))}),this.Undo.commit(),this.AnimUtils.onRemoveComponent(i,n)},copyComponent(e){_clipboard={};let t=cc.engine.getInstanceById(e);t&&(_clipboard.data=cc.instantiate(t,!0))},pasteComponent(e,t){let n=cc.engine.getInstanceById(e);if(n&&_clipboard.data instanceof cc.Component){let e=cc.instantiate(_clipboard.data,!0);n._addComponentAt(e,t),cc.director._nodeActivator.resetComp(e),_Scene.Undo.recordAddComponent(n.uuid,e,t,"Paste Component"),_Scene.Undo.commit()}},newProperty(e,t,n){let i=cc.engine.getInstanceById(e);if(i)try{let r;var o=cc.Class.attr(i.constructor,t);if(o&&Array.isArray(getDefault(o.default)))r=[];else{let e=cc.js._getClassById(n);if(e)try{r=new e}catch(n){return Editor.error(`Can not new property at ${t} for type ${cc.js.getClassName(e)}.\n${n.stack}`),void 0}}r&&(_Scene.Undo.recordObject(e),Editor.setDeepPropertyByPath(i,t,r,n),_Scene.Undo.commit(),cc.engine.repaintInEditMode())}catch(e){Editor.warn(`Failed to new property ${i.name} at ${t}, ${e.message}`)}},resetProperty(e,t,n){let i=cc.engine.getInstanceById(e);if(i){_Scene.Undo.recordObject(e);try{Editor.resetPropertyByPath(i,t,n)}catch(e){Editor.warn(`Failed to reset property ${i.name} at ${t}, ${e.message}`)}_Scene.Undo.commit(),cc.engine.repaintInEditMode()}},checkAsyncState(e){var t=e.__asyncStates;for(var n in t){if("start"===t[n].state)return!0}return!1},setProperty(e){let t=cc.engine.getInstanceById(e.id);if(t)try{let n=t;if(n instanceof cc.Component&&(n=t.node),_Scene.Undo.recordNode(n.uuid),Editor.setPropertyByPath(t,e),cc.engine.repaintInEditMode(),this.checkAsyncState(t)){let e=setInterval(()=>{this.checkAsyncState(t)||(clearInterval(e),this.AnimUtils.recordNodeChanged([n]))},100)}else this.AnimUtils.recordNodeChanged([n])}catch(n){n instanceof Editor.setPropertyByPath.ProhibitedException||Editor.warn(`Failed to set property ${t.name} to ${e.value} at ${e.path}, ${n.stack}`)}},walk(e,t,n){function i(e,t){let n=e._children;for(let e=0;e<n.length;e++){let o=n[e];t(o)||i(o,t)}}if(e){if(!n)return Editor.warn("walk need a callback"),void 0;if(t){if(n(e))return}i(e,n)}},ajustSceneToNodes(e,t){var n=cc.director.getScene();n.position=cc.Vec2.ZERO,n.scale=1,t=t||50;let i,o=-1e10,r=-1e10,c=1e10,s=1e10;e.forEach(e=>{let t=cc.engine.getInstanceById(e);i=t.getBoundingBoxToWorld(),o=Math.max(i.xMax,o),r=Math.max(i.yMax,r),c=Math.min(i.xMin,c),s=Math.min(i.yMin,s)}),i=cc.rect(c,s,o-c,r-s),_Scene.view.adjustToCenter(t,i)},createPrefab(e,t){let n=cc.engine.getInstanceById(e),i=_Scene.PrefabUtils.createPrefabFrom(n),o=Url.join(t,n.name+".prefab"),r=Editor.serialize(i);Editor.Ipc.sendToMain("scene:create-prefab",o,r,(e,t)=>{if(!e){i._uuid=t;Editor.globalProfile.data["auto-sync-prefab"]&&_Scene.PrefabUtils._setPrefabSync(n,!0)}})},applyPrefab(e){let t=cc.engine.getInstanceById(e);if(!t||!t._prefab)return;let n=t._prefab.asset._uuid;if(!!!Editor.assetdb.remote.uuidToFspath(n))return Editor.error(`Failed to apply "${t._prefab.root.name}" because the prefab asset is missing, please save the prefab to a new asset by dragging and drop the node from Node Tree into Assets.`);let i=_Scene.PrefabUtils.createAppliedPrefab(t),o=Editor.serialize(i);Editor.Ipc.sendToMain("scene:apply-prefab",n,o);"prefab"===_Scene.EditMode.curMode().name&&_Scene.Undo.save(),_Scene.Undo.syncedPrefabSave()},revertPrefab(e){let t=cc.engine.getInstanceById(e);t&&t._prefab&&(t=t._prefab.root,_Scene.PrefabUtils.revertPrefab(t),_Scene.Undo.syncedPrefabSave())},setPrefabSync(e){let t=cc.engine.getInstanceById(e);t&&t._prefab&&(t=t._prefab.root,_Scene.PrefabUtils.setPrefabSync(t,!t._prefab.sync))},breakPrefabInstance(e){if(e.length>0){let t=!1;for(let n of e){let e=cc.engine.getInstanceById(n);e&&e._prefab&&(this.Undo.recordNode(n),t=!0,e=e._prefab.root,_Scene.PrefabUtils.unlinkPrefab(e),Editor.Utils.refreshSelectedInspector("node",n))}t&&this.Undo.commit()}else Editor.Dialog.messageBox({type:"info",buttons:[Editor.T("MESSAGE.ok")],message:Editor.T("MESSAGE.prefab.select_prefab_first"),noLink:!0})},linkPrefab(){let e={type:"info",buttons:[Editor.T("MESSAGE.sure")],message:Editor.T("MESSAGE.prefab.select_asset_first")},t={type:"info",buttons:[Editor.T("MESSAGE.sure")],message:Editor.T("MESSAGE.prefab.select_node_first")},n=Editor.Selection.curActivate("node"),i=n&&cc.engine.getInstanceById(n);if(!i)return Editor.Dialog.messageBox(t);let o=Editor.Selection.curActivate("asset");o?Editor.assetdb.queryInfoByUuid(o,(t,n)=>{if(!t&&n){"prefab"===n.type?cc.AssetLibrary.loadAsset(o,(e,t)=>{t&&(i._prefab&&_Scene.PrefabUtils.unlinkPrefab(i._prefab.root),_Scene.PrefabUtils.linkPrefab(t,i),i.name.endsWith(_Scene.PrefabUtils.MISSING_PREFAB_SUFFIX)&&_Scene.PrefabUtils.setPrefabSync(i,!0,!0)&&(i.name=i.name.slice(0,-_Scene.PrefabUtils.MISSING_PREFAB_SUFFIX.length)))}):Editor.Dialog.messageBox(e)}}):Editor.Dialog.messageBox(e)},dumpNode(e){let t=cc.engine.getInstanceById(e);return Editor.getNodeDump(t)},select(e){this.gizmosView.select(e)},unselect(e){this.gizmosView.unselect(e)},hoverin(e){this.gizmosView.hoverin(e)},hoverout(e){this.gizmosView.hoverout(e)},activate(e){let t=cc.engine.getInstanceById(e);if(t){this.AnimUtils.activate(t);for(let e=0;e<t._components.length;++e){let n=t._components[e];n.constructor._executeInEditMode&&n.isValid&&n.onFocusInEditor&&callOnFocusInTryCatch(n)}cc.engine.updateAnimatingInEditMode()}},deactivate(e){let t=cc.engine.getInstanceById(e);if(!t||!t.isValid)return;if(!(_Scene.Tasks.runningTask&&_Scene.Tasks.runningTask.run===this._softReload)&&t._prefab&&t._prefab.root&&t._prefab.root._prefab.sync){"prefab"===_Scene.EditMode.curMode().name||_Scene.PrefabUtils.confirmPrefabSyncedLater(t._prefab.root)}this.AnimUtils.deactivate(t);for(let e=0;e<t._components.length;++e){let n=t._components[e];n.constructor._executeInEditMode&&n.isValid&&n.onLostFocusInEditor&&callOnLostFocusInTryCatch(n)}cc.engine.updateAnimatingInEditMode()},hitTest(e,t){let n,i=this.view.pixelToWorld(cc.v2(e,t)),o=Number.MAX_VALUE;return cc.engine.getIntersectionList(new cc.Rect(i.x,i.y,1,1)).forEach(e=>{let t=e.node;if(!t)return;let r=e.aabb||_Scene.NodeUtils.getWorldBounds(t),c=i.sub(r.center).magSqr();c-o<-1e-6&&(o=c,n=t)}),n},rectHitTest(e,t,n,i){let o=this.view.pixelToWorld(cc.v2(e,t)),r=this.view.pixelToWorld(cc.v2(e+n,t+i)),c=cc.Rect.fromMinMax(o,r),s=[];return cc.engine.getIntersectionList(c,!0).forEach(e=>{let t=e.node;t&&s.push(t)}),s},_syncPrefab(e,t){let n=Editor.Selection.curActivate("node"),i=n&&cc.engine.getInstanceById(n);if(i&&i._prefab&&i._prefab.asset._uuid===e.uuid&&i._prefab.root&&i._prefab.root._prefab.sync){if(_Scene.PrefabUtils.confirmPrefabSynced(i._prefab.root))return t()}_Scene.PrefabUtils.syncPrefab(e.uuid),t()},syncPrefab(e){_Scene.Tasks.push({name:"sync-prefab",target:this,run:this._syncPrefab,params:[e]})},assetChanged(e){if(this.AnimUtils.assetChanged(e),"prefab"===e.type){let t=_Scene.EditMode.curMode();"prefab"===t.name?t.prefabAssetChanged(e):this.syncPrefab(e)}},assetsMoved(e){this.AnimUtils.assetsMoved(e)},setTransformTool(e){this.transformTool=e,this.gizmosView&&(this.gizmosView.transformTool=e),cc.engine.isInitialized&&cc.engine.repaintInEditMode()},setPivot(e){this.pivot=e,this.gizmosView&&(this.gizmosView.pivot=e),cc.engine.isInitialized&&cc.engine.repaintInEditMode()},setCoordinate(e){this.coordinate=e,this.gizmosView&&(this.gizmosView.coordinate=e),cc.engine.isInitialized&&cc.engine.repaintInEditMode()},alignSelection(e){let t=Editor.Selection.curSelection("node");if(t.length<=1)return;let n=1e10,i=1e10,o=-1e10,r=-1e10,c=(t=(t=t.map(e=>cc.engine.getInstanceById(e))).filter(e=>{let n=e.parent;for(;n;){if(-1!==t.indexOf(n))return!1;n=n.parent}return!0})).map(e=>{let t=_Scene.NodeUtils.getWorldBounds(e);return n=Math.min(n,t.x),i=Math.min(i,t.y),o=Math.max(o,t.xMax),r=Math.max(r,t.yMax),{node:e,bounds:t}}),s=cc.rect(n,i,o-n,r-i);c.forEach(t=>{let n=t.node;this.Undo.recordNode(n.uuid);let i;switch(e){case"top":i=cc.v2(0,s.yMax-t.bounds.yMax);break;case"v-center":i=cc.v2(0,s.center.y-t.bounds.center.y);break;case"bottom":i=cc.v2(0,s.y-t.bounds.y);break;case"left":i=cc.v2(s.x-t.bounds.x,0);break;case"h-center":i=cc.v2(s.center.x-t.bounds.center.x,0);break;case"right":i=cc.v2(s.xMax-t.bounds.xMax,0);break;default:i=cc.v2()}let o=_Scene.NodeUtils.getWorldPosition(n);_Scene.NodeUtils.setWorldPosition(n,o.add(i));var r=Editor.Math.numOfDecimalsF(1/this.view.scale);this.adjustNodePosition(n,r),cc.engine.repaintInEditMode()}),this.Undo.commit()},distributeSelection:function(e){let t=Editor.Selection.curSelection("node");if(t.length<=2)return;let n=(t=(t=t.map(e=>cc.engine.getInstanceById(e))).filter(e=>{let n=e.parent;for(;n;){if(-1!==t.indexOf(n))return!1;n=n.parent}return!0})).map(e=>{return{node:e,bounds:_Scene.NodeUtils.getWorldBounds(e)}});n.sort((t,n)=>{let i=!0;switch(e){case"top":i=t.bounds.yMax>n.bounds.yMax;break;case"v-center":i=t.bounds.center.y>n.bounds.center.y;break;case"bottom":i=t.bounds.y>n.bounds.y;break;case"left":i=t.bounds.x>n.bounds.x;break;case"h-center":i=t.bounds.center.x>n.bounds.center.x;break;case"right":i=t.bounds.center.xMax>n.bounds.center.xMax}return i});let i=n.length-1,o=n[0].bounds,r=n[i].bounds;n.forEach((t,n)=>{let c=t.node,s=t.bounds;this.Undo.recordNode(c.uuid);let a;switch(e){case"top":a=cc.v2(0,o.yMax+(r.yMax-o.yMax)*n/i-s.yMax);break;case"v-center":a=cc.v2(0,o.center.y+(r.center.y-o.center.y)*n/i-s.center.y);break;case"bottom":a=cc.v2(0,o.y+(r.y-o.y)*n/i-s.y);break;case"left":a=cc.v2(o.x+(r.x-o.x)*n/i-s.x,0);break;case"h-center":a=cc.v2(o.center.x+(r.center.x-o.center.x)*n/i-s.center.x,0);break;case"right":a=cc.v2(o.xMax+(r.xMax-o.xMax)*n/i-s.xMax,0);break;default:a=cc.v2()}let d=_Scene.NodeUtils.getWorldPosition(c);_Scene.NodeUtils.setWorldPosition(c,d.add(a));var l=Editor.Math.numOfDecimalsF(1/this.view.scale);this.adjustNodePosition(c,l),cc.engine.repaintInEditMode()}),this.Undo.commit()},projectProfileUpdated:function(e){cc.game.collisionMatrix=e["collision-matrix"],cc.game.groupList=e["group-list"]},printSimulatorLog:function(e){if(-1!==e.indexOf("project.dev.js:")){let n=e.split(":"),i=Path.join(Editor.remote.projectPath,"library/bundle.project.js"),o=Number.parseInt(n[1]),r=e.substring(e.indexOf(":"+n[2])+1,e.length);var t=new Error(r);return t.stack=`Simulator: ${r}\n    at a (${i}?009:${o}:0)`,Editor.error(t),void 0}Editor.log("Simulator: "+e)}};window._Scene=Scene,require("./engine-extends"),require("./editor-engine/playable/playable"),require("./editor-engine/playable/ticker"),require("./editor-engine/playable/time"),require("./editor-engine/editor-engine"),require("./tasks").init(),require("./sandbox"),require("./source-maps").init(),require("./scene-undo-impl"),require("./scene-undo"),require("./engine-events"),require("./detect-conflict"),require("./edit-mode").init(),require("./anim-utils"),require("./prefab-utils"),require("./prefab-edit-mode"),require("./stash-scene"),require("./debug-helper"),require("./reset-node"),require("./particle-utils"),require("./utils"),require("./asset-watcher"),require("./dump"),require("./set-property-by-path"),require("./node-utils"),require("./spriteframe-utils"),require("./physics-utils");