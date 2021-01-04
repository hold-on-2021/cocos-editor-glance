"use strict";const fs=require("fs"),template=fs.readFileSync(Editor.url("packages://node-library/panel/index.html")),components={tab:require(Editor.url("packages://node-library/panel/component/tab.js")),tabItem:require(Editor.url("packages://node-library/panel/component/tab-item.js"))},define=require(Editor.url("packages://node-library/define.js")),defaultArr=[define.creator];let nodeLibrary={template:template,ready(){let e=this.profiles.global||{data:{},save(){Editor.warn("The console settings are problematic")}},a=this.profiles.local||{data:{},save(){Editor.warn("The console settings are problematic")}};this.vm=new Vue({el:this.shadowRoot,components:components,data:{size:e.data.prefabSize||3,tabContents:[],local:a,tabindex:0,popclickobj:{clickType:""},matchid:""},methods:{onChangeSize(a){e&&(this.size=a.detail.value,e.data.prefabSize=a.detail.value,e.save())},toggletab(e){this.tabindex=e}},directives:{init(e){let t=[];null===e&&(e=define.user,a.save()),e.title=Editor.T("NODE_LIBRARY.user"),(t=defaultArr.map(e=>e)).push(e),this.vm.tabContents=t}}})},messages:{"node-library:delete-prefab"(e,a){this.vm.$data.matchid=a.id,this.vm.$data.popclickobj={clickType:"delete"}},"node-library:rename-prefab"(e,a){this.vm.$data.matchid=a.id,this.vm.$data.popclickobj={clickType:"rename"}}}};Editor.Panel.extend(nodeLibrary);