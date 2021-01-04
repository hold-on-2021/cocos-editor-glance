"use strict";const _=require("lodash"),Async=require("async"),Path=require("fire-path"),DiffPatch=require("jsondiffpatch"),Utils=Editor.require("packages://inspector/utils/utils"),Data=Editor.require("packages://inspector/panel/data");let ARRAY_MOVE=3,_genSessionID=1e3,_diffpatcher=DiffPatch.create({objectHash(e,t){if(!e)return-1;if(e.value){let t=e.value;if(t.uuid&&t.uuid.value)return t.uuid.value;if(t.name&&t.name.value&&t.attrs)return t.name.value}return`$$index:${t}`},arrays:{detectMove:!0}}),_compare={numerically:(e,t)=>e-t,numericallyBy:e=>(t,i)=>t[e]-i[e]};Editor.Panel.extend({style:"\n    @import url('theme://globals/fontello.css');\n    @import url('app://bower_components/fontawesome/css/font-awesome.min.css');\n\n    :host {\n      display: flex;\n      flex-direction: column;\n    }\n\n    #view {\n      position: relative;\n      overflow: hidden;\n    }\n\n    .props {\n      overflow-x: hidden;\n      overflow-y: scroll;\n      margin-left: 10px;\n      margin-bottom: 10px;\n    }\n\n    .props::-webkit-scrollbar-track {\n      border: 5px solid transparent;\n      background: none !important;\n      background-clip: content-box;\n    }\n\n    .highlight {\n      border: 2px solid #0f0;\n      background-color: rgba( 0, 128, 0, 0.2 );\n      box-sizing: border-box;\n      pointer-events: none;\n    }\n  ",template:`\n    <div id="view" class="flex-1"></div>\n    <ui-loader id="loader" class="fit" hidden>${Editor.T("SHARED.loading")}</ui-loader>\n    <div id="highlightBorder" class="highlight fit" hidden></div>\n  `,$:{view:"#view",loader:"#loader",highlightBorder:"#highlightBorder"},behaviors:[Editor.UI.Droppable],listeners:{"panel-resize"(){this._vm&&this._vm.resize&&this._vm.resize()},"drop-area-move"(e){e.preventDefault(),this._vm&&"node"===this._selectType&&(e.stopPropagation(),this.dropAccepted?Editor.UI.DragDrop.updateDropEffect(e.detail.dataTransfer,"copy"):Editor.UI.DragDrop.updateDropEffect(e.detail.dataTransfer,"none"))},"drop-area-enter"(e){if(e.stopPropagation(),!this._vm||"node"!==this._selectType)return;let t=e.detail.dragItems;this.highlightBorderFlag=!0,Editor.assetdb.queryInfoByUuid(t[0].id,(t,i)=>{let s=i.type;"javascript"!==s&&"coffeescript"!==s&&"typescript"!==s||(this.dropAccepted=!0,this.highlightBorderFlag&&(this.$highlightBorder.hidden=!1),Editor.UI.DragDrop.updateDropEffect(e.detail.dataTransfer,"none"))})},"drop-area-leave"(e){e.stopPropagation(),this._vm&&"node"===this._selectType&&(this.dropAccepted=!1,this.highlightBorderFlag=!1,this.$highlightBorder.hidden=!0)},"drop-area-accept"(e){if(e.stopPropagation(),!this._vm||"node"!==this._selectType)return;this.dropAccepted=!1,this.$highlightBorder.hidden=!0,Editor.Selection.cancel();let t=e.detail.dragItems[0].id;Editor.Ipc.sendToPanel("scene","scene:add-component",this._selectID,Editor.Utils.UuidUtils.compressUuid(t))},"meta-revert"(e){e.stopPropagation(),this.refresh()},"meta-apply"(e){e.stopPropagation();let t=this._vm.target,i=t.uuid,s={};t.subMetas&&t.subMetas.forEach(e=>{s[e.__name__]=e,delete e.__name__}),t.subMetas=s;let r=JSON.stringify(t),a=[];for(let e in t.subMetas){let i=t.subMetas[e];i.__name__=e,a.push(i)}t.subMetas=a,Editor.assetdb.saveMeta(i,r,e=>{e&&this.refresh()}),this.showLoaderAfter(0)},"reset-prop"(e){e.stopPropagation();let t=Utils.normalizePath(e.detail.path),i=Utils.compPath(e.detail.path),s=this._vm.$get(i),r=s?s.value.uuid.value:this._selectID;Editor.Ipc.sendToPanel("scene","scene:reset-property",{id:r,path:Utils.normalizePath(t),type:e.detail.type}),this._queryNode(this._selectID)},"new-prop"(e){e.stopPropagation();let t=Utils.normalizePath(e.detail.path),i=Utils.compPath(e.detail.path),s=this._vm.$get(i),r=s?s.value.uuid.value:this._selectID;Editor.Ipc.sendToPanel("scene","scene:new-property",{id:r,path:Utils.normalizePath(t),type:e.detail.type}),this._queryNode(this._selectID)},"prefab-select-asset"(e){e.stopPropagation();let t=this._vm.target.__prefab__.uuid;Editor.Ipc.sendToAll("assets:hint",t)},"prefab-select-root"(e){e.stopPropagation();let t=this._vm.target.__prefab__.rootUuid;Editor.Ipc.sendToAll("hierarchy:hint",t)},"prefab-revert"(e){e.stopPropagation(),Editor.Ipc.sendToPanel("scene","scene:revert-prefab",this._vm.target.uuid)},"prefab-apply"(e){e.stopPropagation(),Editor.Ipc.sendToPanel("scene","scene:apply-prefab",this._vm.target.uuid)},"prefab-set-sync"(e){e.stopPropagation(),Editor.Ipc.sendToPanel("scene","scene:set-prefab-sync",this._vm.target.uuid)}},ready(){this.droppable="asset",this.multi=!1,this._initDroppable(this),this.reset();let e=Editor.Selection.curGlobalActivate();e&&this._inspect(e.type,e.id);var t=e=>t=>{var i=t.path[0];if("node"!==this._inspectType)return i.expression&&Editor.UI.fire(this,"target-change",{detail:{path:i.expression}}),void 0;if(i.expression){var s=i.expression.replace(/\.value(s)?(\.[^\.]+)?$/,""),r=Utils.findRootVue(i);if(r){var a=r.$get(s);if(a){var o={};"UI-PROP"===i.tagName&&(a.value=t.detail.value),o.type="cc.Asset"===a.type?a.attrs.assetType:a.type,o.path=a.path,o.attrs=a.attrs,o.value=a.value,Editor.UI.fire(this,e,{detail:o})}}}};this._onChange=t("target-change"),this._onConfirm=t("target-confirm"),this._onCancel=t("target-cancel"),this.addEventListener("change",this._onChange),this.addEventListener("confirm",this._onConfirm),this.addEventListener("cancel",this._onCancel),Data.onSendBegin=(()=>{clearTimeout(this._queryNodeTimeoutID),this._queryNodeTimeoutID=null}),Data.onSendEnd=(()=>{this._queryNode()})},close(){this.removeEventListener("change",this._onChange),this.removeEventListener("confirm",this._onConfirm),this.removeEventListener("cancel",this._onCancel),this._clear()},reset(){this._selectType=null,this._selectID=null,this._inspectType=null,this._clear(),this.hideLoader()},refresh(){this._inspect(this._selectType,this._selectID)},uninspect(){this.reset()},_clear(){clearTimeout(this._queryNodeTimeoutID),this._vm&&(this._vm.$destroy(),this._vm=null),Editor.UI.clear(this.$view);let e=this.shadowRoot.getElementById("custom-style");e&&e.remove()},_inspect(e,t){if(!t)return this.uninspect(),void 0;this.showLoaderAfter(200),this._selectType=e,this._selectID=t,"node"==e&&(this._selectID=Editor.Selection.curSelection("node"));let i=++_genSessionID;this._curSessionID=_genSessionID,"asset"===e?this._loadMeta(t,(e,s,r)=>{if(e)return Editor.error(`Failed to load meta ${t}: ${e.message}`),void 0;i===this._curSessionID&&(this._doInspect(i,s,r,!1,e=>{e.addEventListener("target-change",()=>{this._vm.target.__dirty__=!0})}),this.hideLoader())}):"node"===e&&this._queryNode(this._selectID)},_doInspect(e,t,i,s,r,a){if(this._inspectType===t&&this._vm)return this._vm.target=i,this._vm.multi=!!s,void 0;this._clear(),this._inspectType=t,this._loadInspector(t,(s,o,n)=>{if(s)return Editor.error(`Failed to load inspector ${t}: ${s.stack}`),void 0;if(e===this._curSessionID){if(n=_.defaults(n,{el:o,data:{},methods:{}}),n.data.target=i,n.data.multi=!1,n.methods.T=Editor.T,n.beforeDestroy=(()=>{a&&a(this)}),this._vm=new Vue(n),n.$)for(let e in n.$)o[`$${e}`]?Editor.warn(`failed to assign selector $${e}, already used`):o[`$${e}`]=o.querySelector(n.$[e]);r&&r(this),this.$view.appendChild(o),n.ready&&n.ready.call(this._vm)}})},_loadInspector(e,t){let i=Editor.remote.inspectors[e];if(!i)return t(new Error(`Can not find inspector for ${e}, please register it first.`)),void 0;Editor.import(i).then(e=>{let i=document.createElement("div");i.classList.add("fit"),i.classList.add("layout"),i.classList.add("vertical");let s={};Editor.JS.assignExcept(s,e,["dependencies","template","style"]);let r=e.dependencies||[];Editor.import(r).then(()=>{if(e.template){"string"===typeof e.template&&(i.innerHTML=e.template)}if(e.style){let t=document.createElement("style");t.type="text/css",t.textContent=e.style,t.id="custom-style",this.shadowRoot.insertBefore(t,this.shadowRoot.firstChild)}t(null,i,s)}).catch(e=>{t(e)})}).catch(e=>{t(e)})},showLoaderAfter(e){!1!==this.$loader.hidden&&(this._loaderID||(this._loaderID=setTimeout(()=>{this.$loader.hidden=!1,this._loaderID=null},e)))},hideLoader(){clearTimeout(this._loaderID),this._loaderID=null,this.$loader.hidden=!0},_checkIfApply(){"asset"===this._selectType&&this._vm&&this._vm.target.__dirty__&&(this._selectID?Editor.assetdb.queryInfoByUuid(this._selectID,(e,t)=>{!e&&t&&this._applyPopup()}):this._applyPopup())},_applyPopup(){let e=this._vm.target;0===Editor.Dialog.messageBox({type:"warning",buttons:[Editor.T("MESSAGE.apply"),Editor.T("MESSAGE.revert")],title:Editor.T("MESSAGE.warning"),message:Editor.T("MESSAGE.inspector.apply_import_setting_message"),detail:Editor.T("MESSAGE.inspector.apply_import_setting_detail",{url:e.__url__}),defaultId:0,cancelId:1,noLink:!0})?Editor.UI.fire(this,"meta-apply"):Editor.UI.fire(this,"meta-revert",{detail:{uuid:e.uuid}})},_loadMeta(e,t){if(0===e.indexOf("mount-"))return t&&t(null,"mount",{__name__:e.substring(6),__path__:"",uuid:e}),void 0;Editor.assetdb.queryMetaInfoByUuid(e,(i,s)=>{if(!s)return t&&t(new Error(`Failed to query meta info by ${e}`)),void 0;let r=JSON.parse(s.json);if(r.__assetType__=s.assetType,r.__name__=Path.basenameNoExt(s.assetPath),r.__path__=s.assetPath,r.__url__=s.assetUrl,r.__mtime__=s.assetMtime,r.__dirty__=!1,r.subMetas){let e=[];for(let t in r.subMetas){let i=r.subMetas[t];i.__name__=t,e.push(i)}r.subMetas=e}t&&t(null,s.defaultType,r)})},messages:{"selection:activated"(e,t,i){this._checkIfApply(),this._inspect(t,i)},"selection:deactivated"(e,t,i){"node"===t&&"node"===this._selectType&&(this._checkIfApply(),this._selectID=null)},"scene:reloading"(){"node"===this._selectType&&this.uninspect()},"asset-db:assets-moved"(e,t){if("asset"===this._selectType)for(let e=0;e<t.length;++e)if(this._selectID===t[e].uuid){this.refresh();break}},"asset-db:asset-changed"(e,t){if(this._selectID===t.uuid&&this._vm)return this.refresh(),void 0;if("asset"===this._selectType&&this._vm&&this._vm.target){let e=this._vm.target;if(e.subMetas&&e.subMetas.some(e=>e.uuid===t.uuid))return this.refresh(),void 0}},"asset-db:asset-uuid-changed"(e,t){this._curInspector&&this._selectID===t.oldUuid&&(this._selectID=t.uuid,this.refresh())}},_queryNode(e){this._queryNodeTimeoutID&&(clearTimeout(this._queryNodeTimeoutID),this._queryNodeTimeoutID=null),this._queryNodeID&&(Editor.Ipc.cancelRequest(this._queryNodeID),this._queryNodeID=null);var t=e||Editor.Selection.curSelection("node"),i=t.length>1?300:100;this._queryNodeTimeoutID=setTimeout(()=>{var e;Async.map(t,(t,i)=>{e=Editor.Ipc.sendToPanel("scene","scene:query-node",t,(e,t)=>{i(e,t)}),this._queryNodeID=e,this._curSessionID=this._queryNodeID},(t,i)=>{if(t){if(this._selectID=Editor.Selection.curSelection("node"),!this._selectID)return;return this._queryNode(this._selectID),Editor.warn(t)}null!=this._queryNodeTimeoutID&&(Data.clear(),i.forEach(e=>{Data.add(e)}),this._handleQueryNode(Data.get(),e))})},i)},_handleQueryNode(e,t){if(!e)return;let i=e.value;if(!i)return;let s=i.uuid,r=e.types;if("node"===this._selectType)if(Utils.buildNode("target",i,r),this._vm&&"node"===this._inspectType&&this._vm.target.uuid===s){let e=_diffpatcher.diff(this._vm.target,i);e&&this._applyPatch(e),this.hideLoader(),this._queryNode(this._selectID)}else{let s={cancel:e=>{e.stopPropagation(),Editor.Ipc.sendToPanel("scene","scene:undo-cancel")},confirm:e=>{e.stopPropagation(),Editor.Ipc.sendToPanel("scene","scene:undo-commit")},setProp:e=>{e.stopPropagation();let t=Utils.normalizePath(e.detail.path),i=Utils.compPath(e.detail.path),s=e.detail.value;if("object"==typeof s){let e={};for(let t in s)e[t]=s[t];s=e}let r=e.detail.type;"cc.Node"===r&&(r=e.detail.attrs.typeid),Data.change(t,i,e.detail.type,s)}};this._doInspect(t,"node",i,e.multi,e=>{e.addEventListener("target-cancel",s.cancel),e.addEventListener("target-confirm",s.confirm),e.addEventListener("target-change",s.setProp),e.addEventListener("target-size-change",s.setProp)},e=>{e.removeEventListener("target-cancel",s.cancel),e.removeEventListener("target-confirm",s.confirm),e.removeEventListener("target-change",s.setProp),e.removeEventListener("target-size-change",s.setProp)}),this.hideLoader(),this._queryNode(this._selectID)}},_applyPatch(e){for(let t in e)this._patchAt(`target.${t}`,e[t])},_cloneData(e){function t(e){var i=null,s=typeof e;if(Array.isArray(e))i=e.map(function(e){return t(e)});else if("object"===s){i={};for(let s in e)i[s]=t(e[s])}else i=e;return i}return t(this._vm.$get(e))},_patchAt(e,t){if(Array.isArray(t)){let s,r,a;if(r=e.replace(/(\.value)?(\.[^\.]+)?$/,function(e){return a=e.split("."),a=a.filter(function(e){return e}),""}),s=this._cloneData(r),"target"===r)r=e,1===t.length?s=t[0]:2===t.length?s=t[1]:3===t.length&&(s=void 0);else{var i=s;a.forEach(function(e,s){s!==a.length-1?i=i[e]:1===t.length?i[e]=t[0]:2===t.length?i[e]=t[1]:3===t.length&&delete i[e]})}this._vm.$set(r,s)}else if("a"===t._t){let i=[],s=[],r=[];for(let e in t){if("_t"===e)continue;let a;a=t[e],"_"===e[0]?0!==a[2]&&a[2]!==ARRAY_MOVE||i.push(parseInt(e.slice(1),10)):1===a.length?s.push({index:parseInt(e,10),value:a[0]}):r.push({index:parseInt(e,10),delta:a})}let a=this._vm.$get(e),o=new Array(a.length);for(let e=0;e<a.length;++e)o[e]=a[e];for(let e=(i=i.sort(_compare.numerically)).length-1;e>=0;e--){let r=i[e],a=t["_"+r],n=o.splice(r,1)[0];a[2]===ARRAY_MOVE&&s.push({index:a[1],value:n})}s=s.sort(_compare.numericallyBy("index"));for(let e=0;e<s.length;e++){let t=s[e];o.splice(t.index,0,t.value)}if((i.length||s.length)&&this._vm.$set(e,o),r.length>0)for(let t=0;t<r.length;t++){let i=r[t];this._patchAt(`${e}[${i.index}]`,i.delta)}}else for(let i in t)this._patchAt(`${e}.${i}`,t[i])}});