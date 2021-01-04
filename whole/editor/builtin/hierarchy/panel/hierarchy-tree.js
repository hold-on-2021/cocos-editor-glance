(()=>{"use strict";const e=require("fire-path"),t=Editor.require("app://editor/builtin/hierarchy/utils/tree-diff");var i=cc.Enum({EXPAND_ALL:1,COLLAPSE_ALL:2,MEMORY_LAST_STATE:3});Editor.polymerElement({behaviors:[Editor.UI.PolymerFocusable,Editor.UI.Droppable,Editor.UI.idtree],hostAttributes:{droppable:"asset,node"},listeners:{focus:"_onFocus",blur:"_onBlur",mousedown:"_onMouseDown",contextmenu:"_onContextMenu",dragstart:"_onDragStart",dragend:"_onDragEnd","drop-area-move":"_onDropAreaMove","drop-area-enter":"_onDropAreaEnter","drop-area-leave":"_onDropAreaLeave","drop-area-accept":"_onDropAreaAccept","item-selecting":"_onItemSelecting","item-select":"_onItemSelect","item-db-click":"_onItemDbClick","item-rename":"_onItemRename"},properties:{recording:{type:Boolean,value:!1},allowAssign:{type:Boolean,value:!1}},ready(){this.multi=!0,this._shiftStartElement=null,this._lastSnapshot=null,this._lastNodeTreeState=null,this._refreshTreeState=!1,this._states={},this._localStates={},this._sceneID="",this._filterText="",this._initFocusable(this),this._initDroppable(this)},filter(e,t){if(this._filterText=e,!e)return;var i=function(i,n){let r=[];for(let e in t)-1!==n.indexOf(e)&&r.push(t[e]);this.clear(),r.forEach(t=>{if(-1===t.name.toLowerCase().indexOf(e))return;let i=document.createElement("hierarchy-item");this.addItem(this,i,{id:t.id,name:t.name,folded:!1,prefab:t.prefab,deactivated:t.deactivated})})}.bind(this);let n=e.split(" ");if(/^t:.*/.test(e)){let r=n[0].substring(2).trim();return e=n[1]||"","cc.Node"===r?i(null,Object.keys(t)):(Editor.Ipc.cancelRequest(this._queryID),this._queryID=Editor.Ipc.sendToPanel("scene","scene:query-nodes-by-comp-name",r,i,-1),void 0)}let r=[];for(let e in t)r.push(t[e]);this.clear(),e=e.toLowerCase(),r.forEach(t=>{if(t.name.toLowerCase().indexOf(e)>-1){let e=document.createElement("hierarchy-item");this.addItem(this,e,{id:t.id,name:t.name,folded:!1,prefab:t.prefab,deactivated:t.deactivated})}})},rename(e){let t=this.getBoundingClientRect(),i=e.getBoundingClientRect(),n=i.top-t.top-1,r=i.left-t.left+10-4;this.$.nameInput.style.top=this.$.content.scrollTop+n+"px",this.$.nameInput.style.left=r+"px",this.$.nameInput.style.width="calc(100% - "+r+"px)",this.$.nameInput.hidden=!1,this.$.nameInput.value=e.name,this.$.nameInput.focus(),this.$.nameInput._renamingEL=e,window.requestAnimationFrame(()=>{this.$.nameInput.select()})},hoverinItemById(e){let t=this._id2el[e];t&&(t.hovering=!0)},hoveroutItemById(e){let t=this._id2el[e];t&&(t.hovering=!1)},select(e){Editor.Selection.select("node",e._userId,!0,!0)},clearSelection(){Editor.Selection.clear("node"),this._activeElement=null,this._shiftStartElement=null},selectAll(){let e=Polymer.dom(this).firstElementChild;if(!e)return;let t=[],i=e,n=e;for(;;){if(!n){if(n=i,n===e)break;i=Polymer.dom(i).parentNode,n=Polymer.dom(n).nextElementSibling}n&&(t.push(n.id),Polymer.dom(n).children.length?(i=n,n=Polymer.dom(n).children[0]):n=Polymer.dom(n).nextElementSibling)}Editor.Selection.select("node",t,!0,!0)},selectPrev(e){if(!this._activeElement)return;let t=this.prevItem(this._activeElement);if(t&&t!==this._activeElement){if(e){null===this._shiftStartElement&&(this._shiftStartElement=this._activeElement);let e=this._getShiftSelects(t);Editor.Selection.select("node",e,!0,!0)}else this._shiftStartElement=null,Editor.Selection.select("node",t._userId,!0,!0);this.activeItem(t),window.requestAnimationFrame(()=>{t.offsetTop<=this.$.content.scrollTop&&(this.$.content.scrollTop=t.offsetTop-2)})}},selectNext(e){if(!this._activeElement)return;let t=this.nextItem(this._activeElement,!1);if(t&&t!==this._activeElement){if(e){null===this._shiftStartElement&&(this._shiftStartElement=this._activeElement);let e=this._getShiftSelects(t);Editor.Selection.select("node",e,!0,!0)}else this._shiftStartElement=null,Editor.Selection.select("node",t._userId,!0,!0);this.activeItem(t),window.requestAnimationFrame(()=>{let e=t.$.header.offsetHeight,i=this.offsetHeight-3;t.offsetTop+e>=this.$.content.scrollTop+i&&(this.$.content.scrollTop=t.offsetTop+e-i)})}},getPath(t){if(!t)return"";if("HIERARCHY-ITEM"!==t.tagName)return"";let i=t.name,n=Polymer.dom(t).parentNode;for(;"HIERARCHY-ITEM"===n.tagName;)i=e.join(n.name,i),n=Polymer.dom(n).parentNode;return i},getPathByID(e){let t=this._id2el[e];return this.getPath(t)},enterRecord(e){this.set("recording",!0),this._recordRootId=e;var t=this._currentRecords=[];for(let e in this._id2el){let i=this._id2el[e];this.isSelfOrChildOf(i)||(i.sleeping||(t.push(e),i.set("sleeping",!0)))}},exitRecord(){this.set("recording",!1),this._recordRootId=null,this._currentRecords.forEach(e=>{this._id2el[e].set("sleeping",!1)}),this._currentRecords=null},isSelfOrChildOf(e){var t=this._recordRootId;do{if(e.id===t)return!0;e=Polymer.dom(e).parentNode}while(e&&"HIERARCHY-ITEM"===e.tagName);return!1},_onItemSelecting(e){e.stopPropagation();let t=e.target,i=this._shiftStartElement;if(this._shiftStartElement=null,!this.recording||this.isSelfOrChildOf(t))if(e.detail.shift){this._shiftStartElement=null===i?this._activeElement:i;let e=this._getShiftSelects(t);Editor.Selection.select("node",e,!0,!1)}else e.detail.toggle?t.selected?Editor.Selection.unselect("node",t._userId,!1):Editor.Selection.select("node",t._userId,!1,!1):t.selected||Editor.Selection.select("node",t._userId,!0,!1)},_onItemSelect(e){e.stopPropagation();var t=e.target;if(this.recording&&!this.isSelfOrChildOf(t))return Editor.warn("Can not select this node in Animation Edit Mode");e.detail.shift?Editor.Selection.confirm():e.detail.toggle?Editor.Selection.confirm():Editor.Selection.select("node",t._userId,!0)},_onItemDbClick(e){e.stopPropagation(),this.recording||Editor.Ipc.sendToWins("scene:center-nodes",[e.target._userId])},_onItemRename(e){this.recording||this.rename(e.target)},_onMouseDown(e){1===e.which&&(e.stopPropagation(),this.clearSelection())},_onContextMenu(e){e.preventDefault(),e.stopPropagation();let t=Polymer.dom(e).localTarget;Editor.Selection.setContext("node",t._userId),Editor.Ipc.sendToMain("hierarchy:popup-context-menu",e.clientX,e.clientY,this.recording,this.allowAssign)},_onScroll(){this.$.content.scrollLeft=0},_onDragStart(e){if(e.stopPropagation(),this.recording)return;let t=Editor.Selection.curSelection("node");Editor.UI.DragDrop.start(e.dataTransfer,{buildImage:!0,effect:"copyMove",type:"node",items:t.map(e=>{let t=this._id2el[e];return{id:e,name:t.name,icon:t.$.icon}})})},_onDragEnd(){Editor.UI.DragDrop.end(),this.recording||(Editor.Selection.cancel(),this._cancelHighligting(),this._curInsertParentEL=null)},_onDropAreaMove(e){if(this.recording)return;e.stopPropagation();let t=e.detail.dragType;if(e.detail.target){let t,i=this.getBoundingClientRect(),n=e.detail.clientY-i.top+this.$.content.scrollTop,r=e.detail.target,s=r=Polymer.dom(r).getOwnerRoot().host,o=Polymer.dom(this);0===o.children.length?this._highlightInsert():(r===this&&(r=n<=o.firstElementChild.offsetTop?o.firstElementChild:o.lastElementChild),(s="inside"===(t=n<=r.offsetTop+.3*r.offsetHeight?"before":n>=r.offsetTop+.7*r.offsetHeight?"after":"inside")?r:Polymer.dom(r).parentNode)!==this._curInsertParentEL&&(this._cancelHighligting(),this._curInsertParentEL=s,this._highlightBorder(s)),this._highlightInsert(r,s,t))}let i="none";"asset"===t?i="copy":"node"===t&&(i="move"),Editor.UI.DragDrop.updateDropEffect(e.detail.dataTransfer,i)},_onDropAreaEnter(e){e.stopPropagation()},_onDropAreaLeave(e){e.stopPropagation(),this._cancelHighligting(),this._curInsertParentEL=null},_onDropAreaAccept(e){e.stopPropagation(),Editor.Selection.cancel(),this._cancelHighligting(),this._curInsertParentEL=null;let t=e.detail.dragType,i=e.detail.dragItems,n=e.detail.dragOptions;if(0===i.length)return;let r=e.detail.target;r=Polymer.dom(r).getOwnerRoot().host;let s=null,o=null,l=this.getBoundingClientRect(),a=e.detail.clientY-l.top+this.$.content.scrollTop,d=Polymer.dom(this),h=Polymer.dom(r);if(r===this?(s=null,d.firstElementChild&&a<=d.firstElementChild.offsetTop&&(o=d.firstElementChild._userId)):a<=r.offsetTop+.3*r.offsetHeight?(o=r._userId,s=h.parentNode):a>=r.offsetTop+.7*r.offsetHeight?(o=h.nextElementSibling?h.nextElementSibling._userId:null,s=h.parentNode):(o=null,s=r,h.firstElementChild&&(o=h.firstElementChild._userId)),s===this&&(s=null),s&&(s.folded=!1),"node"===t)i=i.map(e=>e.id),this._sortDraggingItems(i),Editor.Ipc.sendToPanel("scene","scene:move-nodes",i,s?s._userId:null,o);else if("asset"===t){i=i.map(e=>e.id),this.setFocus();let e=n.unlinkPrefab;Editor.Ipc.sendToPanel("scene","scene:create-nodes-by-uuids",i,s?s._userId:null,{unlinkPrefab:e})}},_onRenameMouseDown(e){e.stopPropagation()},_onRenameKeyDown(e){e.stopPropagation()},_onRenameValueChanged(){let e=this.$.nameInput._renamingEL;e&&(Editor.Ipc.sendToPanel("scene","scene:set-property",{id:e._userId,path:"name",type:"String",value:this.$.nameInput.value,isSubProp:!1}),Editor.Ipc.sendToPanel("scene","scene:undo-commit"),this.$.nameInput._renamingEL=null,this.$.nameInput.hidden=!0)},_onRenameFocusChanged(e){this.$.nameInput._renamingEL&&(this._renameFocused=e.detail.value,setTimeout(()=>{this._renameFocused||(this.$.nameInput._renamingEL=null,this.$.nameInput.hidden=!0)},1))},_rebuild(e){for(let e in this._id2el){let t=this._id2el[e],i=Polymer.dom(t).parentNode;Polymer.dom(i).removeChild(t)}let t=this._id2el;this._id2el={};try{this._build(e,t),t=null}catch(e){Editor.error("Failed to build hierarchy tree: %s",e.stack),this.fire("update-scene-failed")}},hintItemById(e){this.expand(e,!0);let t=this._id2el[e];t&&(this.scrollToItem(t),t.hint())},_hintNew(e){window.requestAnimationFrame(()=>{e.hint("green",500)})},_hintRename(e){window.requestAnimationFrame(()=>{e.hint("orange",500)})},_applyCmds(e){let t,i,n,r,s,o=this._id2el;for(let l=0;l<e.length;l++){let a=e[l];switch(a.op){case"append":i=a.node,s=this._newEntryRecursively(i,o),(r=null!==a.parentId?o[a.parentId]:this).folded=!1,this.addItem(r,s,{id:i.id,name:i.name,state:i.state,deactivated:!i.isActive}),this._hintNew(s);break;case"remove":this.removeItemById(a.id);break;case"set-property":"name"===a.property?(this.renameItemById(a.id,a.value),this._hintRename(this._id2el[a.id])):(t=o[a.id],"state"===a.property?t.state=a.value:"isActive"===a.property&&(t.deactivated=!a.value));break;case"move":t=o[a.id];let e;if((r=null!==a.parentId?o[a.parentId]:this)!==Polymer.dom(t).parentNode)this.setItemParent(t,r),e=Polymer.dom(r).childNodes;else if(e=Polymer.dom(r).childNodes,e.indexOf(t)<a.index&&(a.index+=1),a.index>e.length-1){Polymer.dom(r).appendChild(t);break}(n=e[a.index])&&n!==t&&Polymer.dom(r).insertBefore(t,n);break;case"insert":i=a.node,s=this._newEntryRecursively(i,o),(r=null!==a.parentId?o[a.parentId]:this).folded=!1,this.addItem(r,s,{id:i.id,name:i.name,state:i.state,deactivated:!i.isActive}),this._hintNew(s),(n=Polymer.dom(r).childNodes[a.index])&&n!==s&&Polymer.dom(r).insertBefore(s,n);break;default:Editor.error("Unsupported operation",a.op)}}},_storeItemStates(e){this._states[e]=this.dumpItemStates()},_restoreItemStates(e){this.restoreItemStates(this._states),this._syncSelection()},_updateNodeTreeState(){let e=Editor.globalProfile.data["node-tree-state"];if(e!==i.MEMORY_LAST_STATE){for(let t in this._id2el){this._id2el[t].folded=e===i.COLLAPSE_ALL}this._lastNodeTreeState=e}else this._states=this._localStates,this._restoreItemStates()},_updateSceneGraph(e,i){e||(e="empty");let n=t(this._lastSnapshot,i);n.equal||(this._sceneID,n.cmds.length>100?this._rebuild(i):this._applyCmds(n.cmds),this._lastSnapshot=i,this.fire("tree-changed"),this._syncSelection(),this._refreshTreeState&&(this._refreshTreeState=!1,this._updateNodeTreeState())),this._refreshTreeState&&(this._refreshTreeState=!1,this._updateNodeTreeState()),this._sceneID=e},_build(e,t){e.forEach(e=>{var n=this._newEntryRecursively(e,t);this.addItem(this,n,{id:e.id,name:e.name,state:e.state,deactivated:!e.isActive}),n.folded=this._lastNodeTreeState===i.COLLAPSE_ALL}),this._syncSelection()},_newEntryRecursively(e,t){var i=t[e.id];return i||(i=document.createElement("hierarchy-item")),e.children&&e.children.forEach(e=>{var n=this._newEntryRecursively(e,t);this.addItem(i,n,{id:e.id,name:e.name,state:e.state,deactivated:!e.isActive})}),i},_getShiftSelects(e){let t=this._shiftStartElement,i=[];if(this._shiftStartElement!==e)if(this._shiftStartElement.offsetTop<e.offsetTop)for(;t!==e;)i.push(t._userId),t=this.nextItem(t);else for(;t!==e;)i.push(t._userId),t=this.prevItem(t);return i.push(e._userId),i},_highlightBorder(e){if(e&&"HIERARCHY-ITEM"===e.tagName){var t=this.$.highlightBorder.style;t.display="block",t.left=e.offsetLeft-2+"px",t.top=e.offsetTop-1+"px",t.width=e.offsetWidth+4+"px",t.height=e.offsetHeight+3+"px",e.highlighted=!0}else this.$.highlightBorder.style.display="none"},_highlightInsert(e,t,i){var n=this.$.insertLine.style;if(!e)return n.display="block",n.left=this.offsetLeft-2+"px",n.width=this.offsetWidth+4+"px",n.top="0px",n.height="0px",void 0;if("inside"===i){var r=Polymer.dom(e);!e.folded&&r.firstElementChild?(n.display="block",n.top=r.firstElementChild.offsetTop+"px",n.left=r.firstElementChild.offsetLeft+"px",n.width=r.firstElementChild.offsetWidth+"px",n.height="0px"):n.display="none"}else n.display="block",n.left=e.offsetLeft+"px","before"===i?n.top=e.offsetTop+"px":"after"===i&&(n.top=e.offsetTop+e.offsetHeight+"px"),n.width=e.offsetWidth+"px",n.height="0px"},_cancelHighligting(){this.$.highlightBorder.style.display="none",this.$.highlightBorder.removeAttribute("invalid"),this.$.insertLine.style.display="none",this._curInsertParentEL&&(this._curInsertParentEL.invalid=!1,this._curInsertParentEL.highlighted=!1)},_sortDraggingItems(e){let t=this._id2el;e.sort(function(e,i){let n,r,s=t[e],o=t[i],l=Polymer.dom(s),a=Polymer.dom(o),d=Polymer.dom(l.parentNode);if(d===Polymer.dom(a.parentNode)){let e=d.childNodes;return n=Array.prototype.indexOf.call(e,s),r=Array.prototype.indexOf.call(e,o),n-r}})},_syncSelection(){Editor.Selection.curSelection("node").forEach(e=>{this.selectItemById(e)}),this.activeItemById(Editor.Selection.curActivate("node"))}})})();