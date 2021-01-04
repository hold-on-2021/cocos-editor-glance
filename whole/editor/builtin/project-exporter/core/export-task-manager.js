function tickIndex(t){var s=!1,e=Path.parse(t);return e.name=e.name.replace(INDEX_RE,function(t,e){var i=Number.parseInt(e,10);return!isNaN(i)&&i>=0?(s=!0,"_"+(i+1)):"_"===t?(s=!0,"_2"):t}),s||(e.name+="_2"),e.base=void 0,Path.format(e)}const Path=require("fire-path");class ExportTask{constructor(t,s,e,i){this.src=t,this.dest=s,this.uuid=e,this.isRaw=i}}var INDEX_RE=/_([^_]*)$/;class ExportTaskManager{constructor(){this.uuidToTask={},this.destToTask={}}_resolveConflict(t){do{t=tickIndex(t)}while(t in this.destToTask);return t}add(t,s,e,i){var r=this.destToTask[s];if(r)if(e){if(r.isRaw){var a=`can not export ${i} because ${r.uuid} already exists in ${s}`;return Editor.error(a)}delete this.destToTask[s],r.dest=this._resolveConflict(s),this.destToTask[r.dest]=r,console.log(`${r.uuid}'s dest conflict with ${i}: ${s}, auto rename to ${r.dest}`)}else s=this._resolveConflict(s),console.log(`${i}'s dest conflict with ${r.uuid}: ${r.dest}, auto renam to ${s}`);var o=new ExportTask(t,s,i,e);if(this.destToTask[s]=o,i){if(i in this.uuidToTask)return Editor.error(`uuid already exists: ${i}`);this.uuidToTask[i]=o}}}module.exports=ExportTaskManager;