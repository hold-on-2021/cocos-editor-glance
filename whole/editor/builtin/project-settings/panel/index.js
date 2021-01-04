"use strict";const Fs=require("fire-fs"),Path=require("fire-path"),Utils=Editor.require("packages://project-settings/panel/utils");var createVue=function(e,t){return new Vue({el:e,data:{loaded:!0,tab:t,loading:!1,group:{list:Utils.queryGroupList(),collision:Utils.queryCollision()},module:{excluded:Utils.queryExcluded()},preview:{project:Utils.queryPreview(),simulator:Utils.querySimulator()},service:{analytics:Utils.queryAnalytics()}},methods:{T:Editor.T,_selectTab(e){this.tab=e,Editor.Ipc.sendToMain("project-settings:update-tab",e)},_save(){this.loading=!0,Utils.setGroupList(this.group.list),Utils.setCollision(this.group.collision),Utils.setExcluded(this.module.excluded),Utils.setPreview(this.preview.project),Utils.setSimulator(this.preview.simulator),Utils.setAnalytics(this.service.analytics),Utils.save(),setTimeout(()=>{this.loading=!1},500)}},components:{group:Editor.require("packages://project-settings/panel/components/group"),module:Editor.require("packages://project-settings/panel/components/module"),preview:Editor.require("packages://project-settings/panel/components/preview"),service:Editor.require("packages://project-settings/panel/components/service")}})};Editor.Panel.extend({style:Fs.readFileSync(Editor.url("packages://project-settings/panel/style/home.css")),template:Fs.readFileSync(Editor.url("packages://project-settings/panel/template/home.html")),ready(){Utils.init().then(()=>new Promise((e,t)=>{Editor.Ipc.sendToMain("project-settings:query-tab",function(t,s){e(t?0:s)})})).then(e=>{createVue(this.shadowRoot.getElementById("settings"),e)})}});