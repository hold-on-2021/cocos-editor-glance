"use strict";const fs=require("fire-fs");let name="timeline";const Grid=Editor.require(`packages://${name}/panel/grid`);window.customElements.define("timeline-grid",Grid);const home=Editor.require(`packages://${name}/panel/component/home`),components={tools:Editor.require(`packages://${name}/panel/component/tools`),events:Editor.require(`packages://${name}/panel/component/events`),nodes:Editor.require(`packages://${name}/panel/component/nodes`),props:Editor.require(`packages://${name}/panel/component/props`),"preview-list":Editor.require(`packages://${name}/panel/component/preview-list`),"prop-list":Editor.require(`packages://${name}/panel/component/prop-list`),"edit-event":Editor.require(`packages://${name}/panel/component/edit-event`),"edit-line":Editor.require(`packages://${name}/panel/component/edit-line`)},manager=Editor.require(`packages://${name}/panel/libs/manager`),advice=Editor.require(`packages://${name}/panel/libs/advice`);var createVue=function(e,t){return new Vue({el:e,watch:home.watch,data:home.data(),methods:home.methods,components:components,created:home.created,compiled:home.compiled})};Editor.Panel.extend({style:fs.readFileSync(Editor.url(`packages://${name}/panel/style/index.css`),"utf-8"),template:home.template,listeners:{"panel-resize"(e){e.target;this.vm&&(this.vm.width=e.target.clientWidth,this.vm.height=e.target.clientHeight)},"panel-show"(e){e.target;this.vm&&(this.vm.width=e.target.clientWidth,this.vm.height=e.target.clientHeight)}},messages:Editor.require(`packages://${name}/panel/message`),ready(){this.vm=createVue(this.shadowRoot);let e=document.createElement("canvas");e.id="game",e.style.display="none",this.appendChild(e),this.vm.width=this.clientWidth,this.vm.height=this.clientHeight},deleteTheSelectedKeys(){let e=this.vm.selected;if(!e||!e.length)return;let t=[];e.forEach(e=>{-1===t.indexOf(e.path)&&t.push(e.path)}),t=t.map(e=>(e.length>40&&(e="..."+e.substr(e.length-37,37)),e));if(0!==Editor.Dialog.messageBox({type:"question",buttons:[Editor.T("timeline.shortcuts.cancel"),Editor.T("timeline.shortcuts.confirm_and_delete")],title:"",message:Editor.T("timeline.shortcuts.delete_keys_info"),detail:t.join("\n")+Editor.T("timeline.shortcuts.delete_keys_ask"),defaultId:1,cancelId:0,noLink:!0})){for(e.forEach(e=>{manager.Clip.deleteKey(e.id,e.path,e.component,e.property,e.frame)});e.length;)e.pop();advice.emit("clip-data-update")}},jumpPrevFrame(){let e=this.vm.frame-1;advice.emit("select-frame",e>=0?e:0)},jumpNextFrame(){let e=this.vm.frame;advice.emit("select-frame",e+1)},jumpFirstFrame(){advice.emit("select-frame",0)},jumpLastFrame(){let e=Math.round(this.vm.duration*this.vm.sample);advice.emit("select-frame",e)},copyTheSelectedKeys(){this._copyCache=[];let e=1/0;this.vm.selected.forEach(t=>{let a=manager.Clip.queryKey(t.id,t.path,t.component,t.property,t.frame);a&&(e=Math.min(e,t.frame),this._copyCache.push({id:t.id,path:t.path,component:t.component,property:t.property,frame:t.frame,data:Editor.serialize(a)}))}),this._copyCache.forEach(t=>{t.offset=t.frame-e})},pasteTheCopiedKeys(){if(!this.vm.clip)return;let e=this.vm.frame,t=this.vm.clip.id,a=this._copyCache.some((e,t)=>t>0&&e.path!==this._copyCache[t-1].path)?"":this.vm.node.path,i=[];if(this._copyCache.forEach((n,r)=>{manager.Clip.queryKey(t,a||n.path,n.component,n.property,n.offset+e)&&i.push(n)}),i.length){let t=i.map(t=>{let a=t.path;t.path.length>35&&(a="..."+t.path.substr(t.path.length-32,32));return`path: ${a}\nproperty: ${t.component?t.component+"."+t.property:t.property} frame: ${t.offset+e}`});t.length>5&&(t.length=4,t.push("..."));if(0===Editor.Dialog.messageBox({type:"question",buttons:[Editor.T("timeline.shortcuts.cancel"),Editor.T("timeline.shortcuts.confirm_and_cover")],title:"",message:Editor.T("timeline.shortcuts.paste_keys_info"),detail:t.join("\n\n")+Editor.T("timeline.shortcuts.paste_keys_ask"),defaultId:0,cancelId:0,noLink:!0}))return}i.forEach(i=>{manager.Clip.deleteKey(t,a||i.path,i.component,i.property,i.offset+e)});let n=null;this._copyCache.forEach(i=>{cc.AssetLibrary.loadJson(i.data,(r,o)=>{let s=o.value;manager.Clip.addKey(t,a||i.path,i.component,i.property,i.offset+e,s),clearTimeout(n),n=setTimeout(()=>{advice.emit("clip-data-update")},400)})})}});