"use strict";function _syncChanges(t,a,s){function e(a,s){let e=a+".meta";if(Fs.existsSync(e))if(t.metaBackupPath){let a=Tasks._backupUnusedMeta(t,e,!0);a&&n.push(a)}else Fs.unlinkSync(e),t.warn(`Delete unused meta file: ${t._url(e)}`);Tasks.clearImports(t,a,null,(e,h)=>{if(e)return t.error(`Failed to delete asset ${a}`),s(),void 0;t._dispatchEvent("asset-db:assets-deleted",h),s()})}let h=[],n=[],c=[],i=[];for(let s=0;s<a.length;++s){let e=a[s],h=e.path;if(".meta"!==Path.extname(h))"delete"!==e.command?"new"!==e.command&&"change"!==e.command?Editor.warn(`Unknown changes ${e.command}, ${h}`):_tryAddItem(i,h):c.push(h);else{let a=e.path,s=Path.join(Path.dirname(a),Path.basenameNoExt(a)),h=Fs.existsSync(s);"delete"===e.command&&h||"change"===e.command?_tryAddItem(i,s):"new"!==e.command||h||(Fs.unlinkSync(a),t.warn(`Delete unused meta file: ${t._url(a)}`))}}Async.series([t=>{Async.eachSeries(c,e,t)},a=>{Tasks.refresh(t,i,(s,e)=>{if(s)return a(),void 0;t._handleRefreshResults(e),a()})}],a=>{t._handleMetaBackupResults(n),s&&s(a,h)})}function _mapSnapshotResult(t){let a=[];return t.deletes.forEach(t=>{a.push({command:"delete",path:t})}),t.changes.forEach(t=>{a.push({command:"change",path:t})}),t.creates.forEach(t=>{a.push({command:"new",path:t})}),a}function _tryAddItem(t,a){t.indexOf(a)<0&&t.push(a)}function _taskWatchON(t,a){if(t._snapshot)return a&&a(new Error("Failed to watch asset-db, already watched.")),void 0;let s=t._mountPaths();s=s.map(t=>`${t}/**/*`),t._snapshot=fsnap.create(s),a&&a()}function _taskWatchOFF(t,a){if(!t._snapshot)return a&&a(new Error("Failed to stop watching asset-db, Already stopped.")),void 0;let s=t._mountPaths();s=s.map(t=>`${t}/**/*`);let e=fsnap.create(s),h=fsnap.diff(t._snapshot,e);t._snapshot=null;let n=_mapSnapshotResult(h=fsnap.simplify(h));t.syncChanges(n),a&&a()}const Async=require("async"),Path=require("fire-path"),Fs=require("fire-fs"),fsnap=require("fsnap"),Tasks=require("../lib/tasks.js"),WATCH_STATE_STARTING="watch-starting",WATCH_STATE_ON="watch-on",WATCH_STATE_STOPPING="watch-stopping",WATCH_STATE_OFF="watch-off";module.exports={watchON(){this._expectWatchON=!0,"watch-starting"!==this._watchState&&"watch-stopping"!==this._watchState&&"watch-on"!==this._watchState&&(this._watchState="watch-starting",this._dispatchEvent("asset-db:watch-state-changed",this._watchState),this._tasks.push({name:"watch-on",run:_taskWatchON,params:[],silent:!0},t=>{this._watchState="watch-on",this._dispatchEvent("asset-db:watch-state-changed",this._watchState),!1===this._expectWatchON&&this.watchOFF()}))},watchOFF(){this._expectWatchON=!1,"watch-starting"!==this._watchState&&"watch-stopping"!==this._watchState&&"watch-off"!==this._watchState&&(this._watchState="watch-stopping",this._dispatchEvent("asset-db:watch-state-changed",this._watchState),this._tasks.push({name:"watch-off",run:_taskWatchOFF,params:[],silent:!0},t=>{this._watchState="watch-off",this._dispatchEvent("asset-db:watch-state-changed",this._watchState),this._expectWatchON&&this.watchON()}))},submitChanges(t){if(!this._snapshot)return t&&t(new Error("Failed to stop watching asset-db, Already stopped.")),void 0;let a=this._mountPaths();a=a.map(t=>`${t}/**/*`);let s=fsnap.create(a),e=fsnap.diff(this._snapshot,s),h=_mapSnapshotResult(e=fsnap.simplify(e));h.length>0&&(this._snapshot=s,this.syncChanges(h))},syncChanges(t){this._tasks.push({name:"sync-changes",run:_syncChanges,params:[t]},(t,a)=>{})},getWatchState(){return this._watchState}};