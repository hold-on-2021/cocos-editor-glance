"use strict";function _checkIfMountValid(e,t,s){/[\\/.]/.test(s)&&e.throw("normal",`Invalid character in ${s}, you can not contains '/', '\\' or '.'`),e._mounts[s]&&e.throw("normal",`Failed to mount ${t} to ${s}, already exists!`);for(let a in e._mounts){let i=e._mounts[a];Path.contains(i.path,t)&&e.throw("normal",`Failed to mount ${t} to ${s}, the path or its parent ${i.path} already mounted to ${a}`),Path.contains(t,i.path)&&e.throw("normal",`Failed to mount ${t} to ${s}, its child path ${i.path} already mounted to ${a}`)}}function _deleteImportedAssetsForUuid(e,t,s){let a=e._uuidToImportPathNoExt(t);Async.series([e=>{Del([a,a+".*"],{force:!0},e)},e=>{let t=Path.dirname(a),s=Path.join(t,"**/*");Globby(s,(s,a)=>{0===(a=a.map(e=>Path.normalize(e))).length?Del(t,{force:!0},e):e()})},s=>{let a=e.subAssetInfosByUuid(t);Async.each(a,(t,s)=>{let a=t.uuid;_deleteImportedAssetsForUuid(e,a,s)},a=>{a&&e.failed(`Fail to delete imported files for sub assets of ${t}: ${a.stack}`),s()})}],e=>{s&&s(e)})}function _deleteImportedAssets(e,t,s){Async.eachSeries(t,(t,s)=>{_deleteImportedAssetsForUuid(e,t,s)},e=>{s&&s(e)})}function _removeUnusedMeta(e,t){let s=e._metaToAssetPath(t);return!Fs.existsSync(s)&&(e.info(`remove unused meta: ${e._url(t)}`),Fs.unlinkSync(t),!0)}function _backupUnusedMeta(e,t,s){if(!e.metaBackupPath)return null;if("boolean"!=typeof s&&(s=!1),s||!Fs.existsSync(e._metaToAssetPath(t))){let s=e.getRelativePath(t),a=Path.normalize(Path.join(e.metaBackupPath,s)),i=Path.dirname(a);return Fs.ensureDirSync(i),Fs.copySync(t,a),Fs.unlinkSync(t),e.warn(`Backup unused meta file: ${e._url(t)}`),s}return null}function _backupAsset(e,t){if(!e.assetBackupPath||!Fs.existsSync(t))return;let s=e.getAssetBackupPath(t);if(!s)return;let a=Path.dirname(s);Fs.ensureDirSync(a),Fs.copySync(t,s)}function _removeUnusedImportFiles(e,t){let s=/\S{8}-\S{4}-\S{4}-\S{4}-\S{12}/;Globby(Path.join(e._importPath,"**/*"),(a,i)=>{Async.each(i,(t,a)=>{if(t=Path.normalize(t),Fs.isDirSync(t))return a(),void 0;let i=s.exec(t);if(i.length){if(i=i[0],void 0!==e._uuid2path[i])return a(),void 0;e.log(`remove unused import file ${i}`),_deleteImportedAssetsForUuid(e,i,t=>{t&&e.failed(`Failed to remove import file ${i}, message: ${t.stack}`),a()})}},e=>{t&&t(e)})})}function _removeUnusedMtimeInfo(e,t){let s=Object.keys(e._uuid2mtime);Async.each(s,(t,s)=>{let a=e.uuidToFspath(t);Fs.existsSync(a)||(delete e._uuid2mtime[t],e.log(`remove unused mtime info: ${t}`)),s()},e=>{t&&t(e)})}function _scan(e,t,s,a){"function"==typeof s&&(a=s,s=null),"boolean"!=typeof(s=s||{})["remove-unused-meta"]&&(s["remove-unused-meta"]=!0),"boolean"!=typeof s["filter-meta"]&&(s["filter-meta"]=!0);let i=t;Fs.isDirSync(t)&&(i=[i,Path.join(t,"**/*")]);let r=[],n=[];Globby(i,(t,i)=>{if(t)return a&&a(t),void 0;i.forEach(t=>{if(t=Path.normalize(t),e._isMountPath(t))return;if(".meta"!==Path.extname(t)||!s["filter-meta"])return r.push(t),void 0;if(s["remove-unused-meta"])_removeUnusedMeta(e,t);else{let s=_backupUnusedMeta(e,t);s&&n.push(s)}}),a&&(e._handleMetaBackupResults(n),a(null,r))})}function _checkIfReimport(e,t,s){if(e._isMountPath(t))return s&&s(null,!1),void 0;let a=e.fspathToUuid(t),i=t+".meta";if(!Fs.existsSync(i))return s&&s(null,!0),void 0;if(!a)return s&&s(null,!0),void 0;let r=Meta.load(e,i);if(r.ver!==r.constructor.version())return s(null,!0),void 0;let n=r.getSubMetas();for(let e in n){let t=n[e];if(t.ver!==t.constructor.version())return s(null,!0),void 0}let o=r.dests();for(let e=0;e<o.length;++e)if(!Fs.existsSync(o[e]))return s&&s(null,!0),void 0;let u=e._uuid2mtime[a];if(u){let a=Fs.statSync(t);if(u.asset!==a.mtime.getTime())return s&&s(null,!0),void 0;let i=Fs.statSync(t+".meta");if(u.meta!==i.mtime.getTime())return s&&s(null,!0),void 0;let r=e.getRelativePath(t);return u.relativePath!==r?(s&&s(null,!0),void 0):(s&&s(null,!1),void 0)}s&&s(null,!0)}function _initMetas(e,t,s,a,i){let r=t;Fs.isDirSync(t)&&(r=Path.join(t,"**/*"),e._isMountPath(t)||(r=[t,r]));let n=[];Globby(r,(t,r)=>{if(t)return i&&i(t),void 0;r.forEach(t=>{t=Path.normalize(t);let i;if(".meta"===Path.extname(t))return a&&_removeUnusedMeta(e,t),void 0;let r=t+".meta";if(r=t+".meta",Fs.existsSync(r)&&(i=Meta.load(e,r),i)){n.push({assetpath:t,meta:i});let e=i.getSubMetas();if(e)for(let s in e){let a=e[s],i=Path.join(t,s);n.push({assetpath:i,meta:a})}return}let o;s&&(o=s[t]),i=Meta.create(e,r,o),Meta.save(e,r,i),n.push({assetpath:t,meta:i})}),i&&i(null,n)})}function _importAsset(e,t,s){let a=!1,i=t+".meta",r=Meta.load(e,i);if(!r&&(r=Meta.create(e,i),a=!0,!r))return s&&s(new Error(`Can not create or load meta from ${t}`)),void 0;if(e.isSubAssetByPath(t))return s&&s(null,r),void 0;let n=r.constructor.version();r.ver!==n&&(r.ver=n,a=!0);let o=r.copySubMetas(),u={};Async.series([s=>{if(r.import)try{e.log(`import asset ${t}...`),r.import(t,e=>{u=r.getSubMetas()||{},a=!0,s(e)})}catch(e){s(e)}else s()},t=>{let s=Object.keys(o);for(let t=0;t<s.length;++t){let a=s[t],i=o[a],r=e.uuidToFspath(i.uuid);e._dbDelete(r)}s=Object.keys(u);for(let e=0;e<s.length;++e){let t=s[e],a=u[t];o[t]&&(a.uuid=o[t].uuid)}t()},s=>{let i=Object.keys(u);Async.eachLimit(i,2,(s,i)=>{let r=Path.join(t,s),n=u[s],o=n.constructor.version();n.ver!==o&&(n.ver=o),n.import?n.import(r,function(t){if(t)return i(t),void 0;a=!0,e._dbAdd(r,n.uuid),i()}):(e._dbAdd(r,n.uuid),i())},e=>{s(e)})}],t=>{if(t)return s&&s(t),void 0;a&&Meta.save(e,i,r),s&&s(null,r)})}function _postImportAsset(e,t,s){t.path||s(new Error("Incomplete asset info: no path included"));let a=!1,i=t.path,r=i+".meta",n=t.meta||Meta.get(e,e.fspathToUuid(i)),o=t.isSubAsset||e.isSubAssetByPath(i);if(!n||o)return s&&s(null,n),void 0;Async.series([t=>{if(n.postImport)try{e.log("post-import asset "+i+"..."),n.postImport(i,e=>{a=!0,t(e)})}catch(e){t(e)}else t()},e=>{let t=n.getSubMetas(),s=Object.keys(t);Async.eachLimit(s,2,Async.ensureAsync((e,s)=>{let r=Path.join(i,e),n=t[e];n.postImport?n.postImport(r,function(){a=!0,s()}):s()}),t=>{e(t)})}],t=>{if(t)return s&&s(t),void 0;a&&Meta.save(e,r,n),s&&s(null,n)})}function _fillInResults(e,t,s,a){let i=Path.dirname(t),r=e.fspathToUuid(i),n=e.mountInfoByPath(t);a.push({uuid:s.uuid,parentUuid:r,url:e._url(t),path:t,type:s.assetType(),hidden:!!n.hidden,readonly:!!n.readonly});let o=s.getSubMetas();if(o)for(let i in o){let r=o[i],u=Path.join(t,i);a.push({uuid:r.uuid,parentUuid:s.uuid,url:e._url(u),path:u,type:r.assetType(),isSubAsset:!0,hidden:!!n.hidden,readonly:!!n.readonly})}}function _refresh(e,t,s,a){Array.isArray(t)||(t=[t]);let i=[];for(var r=0,n=t.length;r<n;r++)e.isSubAssetByPath(t[r])||i.push(t[r]);Async.waterfall([t=>{let s=[];Async.eachSeries(i,(t,a)=>{e.log(`scan ${t}...`),_scan(e,t,{"remove-unused-meta":!1},(e,t)=>{if(e)return a(),void 0;s=s.concat(t),a()})},()=>{t(null,s)})},(t,a)=>{if(s)return a(null,t),void 0;e.log("check if reimport...");let i=[];Async.each(t,Async.ensureAsync((t,s)=>{_checkIfReimport(e,t,(a,r)=>{if(a)return e.failed(`Failed to check if reimport for ${t}, message: ${a.stack}`),s(),void 0;r&&i.push(t),s()})}),e=>{a(e,i)})},(t,s)=>{e.log("reimport assets...");let a=[];Async.eachLimit(t,2,Async.ensureAsync((t,s)=>{_importAsset(e,t,(i,r)=>{if(i)return e.failed(`Failed to import asset ${t}, message: ${i.stack}`),a.push({path:t,url:e._url(t),uuid:e.fspathToUuid(t),error:i}),s(),void 0;_fillInResults(e,t,r,a),s()})}),e=>{s(e,a)})},(t,s)=>{e.log("post import assets..."),Async.eachLimit(t,2,Async.ensureAsync((t,s)=>{if(t.isSubAsset)return s(),void 0;_postImportAsset(e,t,(a,i)=>{if(a)return e.failed(`Failed to post import asset ${t.path}, message: ${a.stack}`),s(),void 0;e.updateMtime(i.uuid),s()})}),e=>{s(e,t)})}],(e,t)=>{a&&a(e,t)})}function _checkMoveInput(e,t,s,a){let i=Path.dirname(s),r=Fs.existsSync(t),n=Fs.existsSync(s),o=Fs.isDirSync(t),u=Fs.isDirSync(s),l=Path.basename(t);return r?Fs.existsSync(i)?n&&t.toLowerCase()!==s.toLowerCase()?(a&&a(new Error(`Dest asset ${s} already exists`)),void 0):u&&o&&Fs.existsSync(Path.join(s,l))?(a&&a(new Error(`Dest normal asset ${s} already exists`)),void 0):(a&&a(),void 0):(a&&a(new Error(`Dest parent path ${i} is not exists`)),void 0):(a&&a(new Error(`Src asset ${t} is not exists`)),void 0)}function _preProcessMoveInput(e,t,s,a){_scan(e,t,null,(e,i)=>{let r=i.map(e=>{let a=Path.relative(t,e);return Path.join(s,a)});a&&a(null,i,r)})}function _copyFiles(e,t,s,a){Async.series([e=>{Fs.rename(t,s,e)},a=>{let i=t+".meta",r=s+".meta";if(!Fs.existsSync(i))return a(),void 0;Fs.rename(i,r,i=>{i&&Fs.rename(s,t,t=>{e.error(t)}),a(i)})}],a)}function _preProcessImportFiles(e,t,s,a){function i(t){if(e._isAssetPath(t))return e.failed(`Can not import file ${t}, already in the database`),-1;let a=Path.join(s,Path.basename(t));return Fs.existsSync(a)?0:1}if(!Fs.isDirSync(s))return a&&a(new Error("Invalid dest path, make sure it exists and it is a directory")),void 0;t.map(e=>Path.basename(e));t=e.arrayCmpFilter(t,(e,t)=>Path.contains(e,t)?1:Path.contains(t,e)?-1:0);for(var r=[],n=[],o=0;o<t.length;o++){let e=t[o];var u=i(e);u>0?r.push(e):0===u&&n.push(e)}a&&a(null,{importFiles:r,mergeFiles:n})}function _generateSubMetaDiff(e,t,s){let a=t.getSubMetas()||{},i=e.uuidToFspath(t.uuid),r=[],n=[],o=[],u=Object.keys(s);for(let e=0;e<u.length;++e){let t=u[e],n=s[t];a[t]||r.push({uuid:n.uuid,path:Path.join(i,t)})}u=Object.keys(a);for(let r=0;r<u.length;++r){let l=u[r],d=a[l],h=Path.join(i,l);if(s[l])o.push({uuid:d.uuid,parentUuid:t.uuid,path:h,url:e.uuidToUrl(d.uuid),type:d.assetType(),isSubAsset:!0});else{let s=e.mountInfoByUuid(d.uuid);n.push({uuid:d.uuid,parentUuid:t.uuid,path:h,url:e.uuidToUrl(d.uuid),type:d.assetType(),isSubAsset:!0,hidden:!!s.hidden,readonly:!!s.readonly})}}return{deleted:r,added:n,remained:o}}function _deleteAsset(e,t,s){if(!Fs.existsSync(t))return s&&s(new Error(`Asset ${t} is not exists`)),void 0;if(e.mountInfoByPath(t).readonly){if(s){let a=e.fspathToUrl(t);s(new Error(`${a} is readonly, CAN NOT delete it in Editor.`))}return}let a;Async.series([e=>{Del([t],{force:!0},e)},e=>{Del([t+".meta"],{force:!0},e)},s=>{Tasks.clearImports(e,t,null,(e,t)=>{a=t,s()})}],e=>{if(e)return s&&s(e),void 0;let t=[];for(let e=0;e<a.length;++e){let s=a[e];t.push({path:s.path,uuid:s.uuid})}s&&s(null,t)})}const Fs=require("fire-fs"),Path=require("fire-path"),Async=require("async"),Globby=require("globby"),Minimatch=require("minimatch"),Del=require("del"),_=require("lodash"),Meta=require("./meta");let Tasks={};module.exports=Tasks,Tasks.mount=function(e,t,s,a,i){if("string"!=typeof t)return i&&i(new Error("expect 1st param to be a string")),void 0;if(!Fs.isDirSync(t))return i&&i(new Error(`Failed to mount ${t}, path not found or it is not a directory!`)),void 0;if("string"!=typeof s)return i&&i(new Error("Expect 2nd param to be a string")),void 0;_checkIfMountValid(e,t=Path.resolve(t),s);let r={path:t,mountPath:s,attached:!1};_.assign(r,a),e._mounts[s]=r,e._dbAdd(t,e._mountIDByMountPath(s)),i&&i()},Tasks.unmount=function(e,t,s){return"string"!=typeof t?(s&&s(new Error("expect 1st param to be a string")),void 0):e._mounts[t]?(e._dbDelete(e._mounts[t].path),delete e._mounts[t],s&&s(),void 0):(s&&s(new Error("can not find the mount "+t)),void 0)},Tasks.init=function(e,t){let s=Object.keys(e._mounts),a=[];Async.series([t=>{Async.eachSeries(s,(t,s)=>{Tasks.attachMountPath(e,t,(e,t)=>{a=a.concat(t),s()})},t)},t=>{_removeUnusedImportFiles(e,s=>{s&&e.failed(`Failed to remove unused import files, message: ${s.stack}`),t()})},t=>{_removeUnusedMtimeInfo(e,s=>{s&&e.failed(`Failed to remove unused mtime info, message: ${s.stack}`),e.updateMtime(),t()})}],e=>{t&&t(e,a)})},Tasks.attachMountPath=function(e,t,s){var a=[],i=e._mounts[t];return i?i.attached?(e.log(`db://${t} already attached!`),s(null,a),void 0):(a.push({name:t,path:i.path,url:e._url(i.path),uuid:e._mountIDByMountPath(t),hidden:!!i.hidden,readonly:!!i.readonly,type:"mount"}),Async.series([s=>{let a=e._mounts[t].path;e.log(`init meta files at db://${t}`),_initMetas(e,a,null,!1,(t,a)=>{a.forEach(t=>{e._dbAdd(t.assetpath,t.meta.uuid)}),s()})},s=>{let i=e._mounts[t].path;e.log(`refresh at db://${t}`),_refresh(e,i,!1,(i,r)=>{if(i)return e.failed(`Failed to refresh db://${t}`),s(),void 0;e._handleErrorResults(r),a=a.concat(r),s()})}],i=>{a.forEach(e=>{e.command="create"}),e._mounts[t].attached=!0,s&&s(i,a)}),void 0):(e.failed(`db://${t} is not a mount path.`),s(new Error(`${t} is not a valid mount path. Please mount it first.`)),void 0)},Tasks.unattachMountPath=function(e,t,s){var a=[],i=e._mounts[t];if(!i)return e.failed(`db://${t} is not a mount path.`),s(new Error(`${t} is not a valid mount path.`)),void 0;if(!i.attached)return e.log(`db://${t} has not been attached!`),s(null,a),void 0;var r=e._allPaths(),n=Path.resolve(i.path);Async.waterfall([t=>{Async.eachLimit(r,3,(t,s)=>{0===t.indexOf(n)&&(a.push({path:t,url:e._url(t),uuid:e.fspathToUuid(t),command:"delete"}),e._dbDelete(t)),s()},t)},t=>{_removeUnusedImportFiles(e,s=>{s&&e.failed(`Failed to remove unused import files, message: ${s.stack}`),t()})},t=>{_removeUnusedMtimeInfo(e,s=>{s&&e.failed(`Failed to remove unused mtime info, message: ${s.stack}`),e.updateMtime(),t()})}],i=>{e._mounts[t].attached=!1,s&&s(i,a)})},Tasks.refresh=function(e,t,s){let a=[],i={};for(let t in e._path2uuid)i[t]=e._path2uuid[t];Array.isArray(t)||(t=[t]),t=t.map((t,s)=>(e.isSubAssetByPath(t)&&(t=Path.dirname(t)),t)),Async.waterfall([s=>{let a=[];Async.eachSeries(t,(t,s)=>{if(!e.fspathToUuid(t))return s(),void 0;Tasks.clearImports(e,t,i,(e,t)=>{if(e)return s(),void 0;a=a.concat(t),s()})},()=>{s(null,a)})},(e,t)=>{e.forEach(e=>{let t=e.path+".meta";Fs.existsSync(e.path)||(e.command="delete",a.push(e),Fs.existsSync(t)&&Fs.unlinkSync(t))}),t()},s=>{Async.eachSeries(t,(t,s)=>{_initMetas(e,t,i,!1,(t,a)=>{a.forEach(t=>{let s=e._path2uuid[t.assetpath],a=e._uuid2path[t.meta.uuid];s&&s===t.meta.uuid&&a&&a===t.assetpath||e._dbAdd(t.assetpath,t.meta.uuid)}),s()})},s)},s=>{_refresh(e,t,!0,s)}],(t,r)=>{if(t)return s&&s(t),void 0;r.forEach(t=>{let s=i[t.path],r=e.fspathToUuid(t.path);for(let e=0;e<a.length;++e)if(r===a[e].uuid){a.splice(e,1);break}if(s)s!==r?(t.command="uuid-change",t.oldUuid=s):t.command="change";else{t.command="create";let s=e.mountInfoByUuid(r);t.hidden=!!s.hidden,t.readonly=!!s.readonly}}),a=a.concat(r),s&&s(null,a)})},Tasks.deepQuery=function(e,t){let s=[],a=Object.keys(e._path2uuid);a.sort((e,t)=>e.length-t.length);for(let t=0;t<a.length;++t){let i,r,n,o=a[t],u=e._path2uuid[o],l=e._path2uuid[Path.dirname(o)],d=e.isSubAssetByPath(o);r=Path.extname(o);let h=e.mountInfoByPath(o);if(e.isMountByPath(o))i=Path.basenameNoExt(h.mountPath),n="mount";else{"folder"===(n=Meta.get(e,e.fspathToUuid(o)).assetType())?(i=Path.basename(o),r=""):i=Path.basenameNoExt(o)}let m={uuid:u,parentUuid:l,name:i,extname:r,type:n,isSubAsset:d,hidden:!!h.hidden,readonly:!!h.readonly};s.push(m)}t&&t(null,s)},Tasks.queryAssets=function(e,t,s,a){let i=[],r=Object.keys(e._path2uuid),n=r;t&&(n=Minimatch.match(r,t)),"string"==typeof(s=s||[])&&(s=[s]);for(let t=0;t<n.length;++t){let a=n[t],r=e._path2uuid[a],o=e.isSubAssetByPath(a),u=Meta.get(e,r);if(!u)continue;let l=u.assetType();if(s.length&&-1===s.indexOf(l))continue;let d=e.mountInfoByPath(a),h={url:e._url(a),path:a,uuid:r,type:l,readonly:!!d.readonly,hidden:!!d.hidden,isSubAsset:o,destPath:e._getDestPathByMeta(u)};i.push(h)}i.sort((e,t)=>e.path.localeCompare(t.path)),a&&a(null,i)},Tasks.queryMetas=function(e,t,s,a){let i=[],r=Object.keys(e._path2uuid);t&&(r=Minimatch.match(r,t));for(let t=0;t<r.length;++t){let a=r[t],n=Meta.get(e,e.fspathToUuid(a));if(!n){e._isMountPath(a)||console.warn(`Meta ${a} is not exists`);continue}let o=n.assetType();s&&o!==s||i.push(n)}a&&a(null,i)},Tasks.import=function(e,t,s,a){if(e.mountInfoByPath(s).readonly){let t=e.fspathToUrl(s);return a&&a(new Error(`${t} is readonly, CAN NOT import assets into it in Editor.`)),void 0}var i=null,r=[];Async.waterfall([a=>{_preProcessImportFiles(e,t,s,(e,t)=>{i=t,a(e)})},t=>{let a={importFiles:[],mergeFiles:[]},r=i.importFiles.concat(i.mergeFiles);Async.each(r,(t,r)=>{e.log(`copy file ${Path.basename(t)}...`);let n=Path.join(s,Path.basename(t)),o=i.mergeFiles.indexOf(t)>=0;Fs.copy(t,n,s=>{if(s)return e.failed(`Failed to copy file ${t}. ${s}`),r(),void 0;o?a.mergeFiles.indexOf(n)<0&&a.mergeFiles.push(n):a.importFiles.indexOf(n)<0&&a.importFiles.push(n),r()})},e=>{t(e,a)})},(t,s)=>{if(0===t.mergeFiles.length)return s(null,t.importFiles),void 0;Tasks.refresh(e,t.mergeFiles,(a,i)=>{if(a)return e.failed(`Failed to refresh assets ${t.mergeFiles}, message: ${a.stack}`),s(null,t.importFiles),void 0;r=r.concat(i),s(null,t.importFiles)})},(t,s)=>{let a=[];e.log("init metas..."),Async.each(t,(t,s)=>{_initMetas(e,t,null,!0,(t,i)=>{i.forEach(t=>{e._dbAdd(t.assetpath,t.meta.uuid),e.isSubAssetByPath(t.assetpath)||a.push(t.assetpath)}),s()})},e=>{s(e,a)})},(t,s)=>{e.log("import assets...");let a=[];Async.eachLimit(t,2,(t,s)=>{_importAsset(e,t,(i,r)=>{if(i)return e.failed(`Failed to import asset ${t}, message: ${i.stack}`),s(),void 0;_fillInResults(e,t,r,a),s()})},e=>{s(e,a)})},(t,s)=>{e.log("post import assets..."),Async.eachLimit(t,2,(t,s)=>{if(t.isSubAsset)return s(),void 0;_postImportAsset(e,t,(a,i)=>{if(a)return e.failed(`Failed to post import asset ${t.path}, message: ${a.stack}`),s(),void 0;s()})},e=>{s(e,t)})},(t,s)=>{t.forEach(t=>{e.updateMtime(t.uuid)}),t.sort((e,t)=>e.path.localeCompare(t.path)),s(null,t)}],(e,t)=>{r=r.concat(t),a&&a(e,r)})},Tasks.postImport=function(e,t,s){Async.waterfall([s=>{_postImportAsset(e,{path:t},(a,i)=>{a?(e.failed(`Failed to post import asset ${t}, message: ${a.stack}`),s(a)):s(null,i)})},(t,s)=>{t&&e.updateMtime(t.uuid),s(null,t)}],(e,t)=>{s&&s(e,t)})},Tasks.assetMove=function(e,t,s,a){let i,r,n,o,u=Fs.isDirSync(t),l=Path.basename(t)!==Path.basename(s),d=[];Async.series([a=>{_preProcessMoveInput(e,t,s,(t,s,u)=>{if(t)return a(t),void 0;r=u,n=(i=s).map(t=>e.fspathToUuid(t)),o=i.map(t=>{return Meta.get(e,e.fspathToUuid(t)).copySubMetas()}),a()})},t=>{if(u||!l)return t(),void 0;_deleteImportedAssets(e,n,t)},a=>{_copyFiles(e,t,s,a)},t=>{for(let t=0;t<i.length;t++){if(u||!l){let s=e.subAssetInfosByPath(i[t]),a=i[t],n=r[t];for(let t=0;t<s.length;++t){let i=s[t].path,r=i.replace(a,n);e._dbMove(i,r)}}e._dbMove(i[t],r[t])}t()},t=>{if(u||!l)return t(),void 0;Async.eachLimit(r,2,(t,a)=>{_importAsset(e,s,(t,i)=>{t&&e.failed(`Failed to import asset ${s}, message: ${t.stack}`),d.push(i),a()})},()=>{t()})},t=>{if(u||!l)return t(),void 0;Async.eachLimit(r,2,(t,a)=>{_postImportAsset(e,{path:s},(t,i)=>{t&&e.failed(`Failed to post import asset ${s}, message: ${t.stack}`),a()})},()=>{t()})},t=>{n.forEach(t=>{e.updateMtime(t)}),t()}],t=>{if(!a)return;if(t)return a(t),void 0;let s=[];for(let t=0;t<r.length;++t){let a=Path.dirname(r[t]),u=null;d[t]&&(u=_generateSubMetaDiff(e,d[t],o[t]));let l=e.mountInfoByUuid(n[t]);s.push({uuid:n[t],url:e.uuidToUrl(n[t]),parentUuid:e.fspathToUuid(a),srcPath:i[t],destPath:r[t],subMetas:u,hidden:!!l.hidden,readonly:!!l.readonly})}a(null,s)})},Tasks.delete=function(e,t,s){Array.isArray(t)||(t=[t]);let a=e.arrayCmpFilter(t,(e,t)=>Path.contains(e,t)?1:Path.contains(t,e)?-1:0).map(t=>e._fspath(t)),i=[];Async.each(a,(t,s)=>{_deleteAsset(e,t,(a,r)=>{if(a){let i=e.fspathToUuid(t);return e.error(`Failed to delete asset ${i}, messages: ${a.stack}`),s(a),void 0}i=i.concat(r),s()})},e=>{s(e,i)})},Tasks.create=function(e,t,s,a){if(!t)return a&&a(new Error(`Invalid path: ${t}`)),void 0;if(e.mountInfoByPath(t).readonly){if(a){let s=e.fspathToUrl(Path.dirname(t));a(new Error(`${s} is readonly, CAN NOT create it in Editor.`))}return}let i=t,r=0;for(;Fs.existsSync(i);)r+=1,i=Path.join(Path.dirname(t),Path.basenameNoExt(t)+" - "+e.padLeft(r,3,"0")+Path.extname(t));t=i;let n=Path.dirname(t);if(!Fs.existsSync(n))return a&&a(new Error(`Parent path ${n} is not exists`)),void 0;let o=t+".meta",u=Meta.create(e,o);if(!u)return a&&a(new Error(`Can not create meta from ${t}`)),void 0;if(!u.export)return a&&a(new Error(`asset-type [${u.assetType()}] not implement meta.export`)),void 0;let l=e._ensureDirSync(Path.dirname(t));Async.waterfall([a=>{try{e.log(`meta.export ${t}...`),u.export(t,s,a)}catch(e){a(e)}},s=>{_importAsset(e,t,s)},(s,a)=>{_postImportAsset(e,{path:t,meta:s},a)},(s,a)=>{e._dbAdd(t,s.uuid),e.updateMtime(s.uuid),a(null,s)}],(s,i)=>{if(s)return a&&a(s),void 0;let r=[];l.forEach(t=>{let s=e.uuidToFspath(t.uuid),a=Path.dirname(s),i=e.fspathToUuid(a),n=e.mountInfoByPath(s);r.push({uuid:t.uuid,parentUuid:i,url:e._url(s),path:s,type:t.assetType(),hidden:!!n.hidden,readonly:!!n.readonly})}),_fillInResults(e,t,i,r),a&&a(s,r)})},Tasks.saveExists=function(e,t,s,a){if(!e.existsByPath(t))return a&&a(new Error(t+" is not exists")),void 0;if(e.mountInfoByPath(t).readonly){if(a){let s=e.fspathToUrl(t);a(new Error(`${s} is readonly, CAN NOT save the changes in Editor.`))}return}let i=e.loadMetaByPath(t).copySubMetas(),r=e.fspathToUuid(t);Async.waterfall([e=>{Fs.writeFile(t,s,e)},s=>{_backupAsset(e,t),s()},t=>{_deleteImportedAssetsForUuid(e,r,s=>{s&&e.failed(`Failed to delete imported assets of ${r} during save, message: ${s.stack}`),t()})},s=>{_importAsset(e,t,s)},(s,a)=>{_postImportAsset(e,{path:t,meta:s},a)},(t,s)=>{e.updateMtime(r),s(null,t)}],(s,n)=>{if(s){if(a){let i={path:t,url:e._url(t),uuid:r,error:s};a(s,i)}}else if(a){let t=_generateSubMetaDiff(e,n,i);a(s,{meta:n,subMetas:t})}})},Tasks.saveMeta=function(e,t,s,a){let i=e.uuidToFspath(t);if(e.mountInfoByPath(i).readonly){if(a){let t=e.fspathToUrl(i);a(new Error(`${t} is readonly, CAN NOT save the changes in Editor.`))}return}let r;try{r=JSON.parse(s)}catch(e){return a&&a(new Error(`Failed to pase json string, message : ${e.message}`)),void 0}if(t!==r.uuid)return a&&a(new Error("Uuid is not equal to json uuid")),void 0;let n=i+".meta",o=e.loadMetaByPath(i);if(!o)return a&&a(new Error(`Can't load meta for : ${t}`)),void 0;let u=o.copySubMetas();if(o.deserialize(r),e.isSubAssetByPath(i)){let s=Path.basename(i);n=(i=Path.dirname(i))+".meta";let a=e.loadMetaByPath(i);t=a.uuid,u=a.copySubMetas();a.getSubMetas()[s]=o,o=a}Meta.save(e,n,o),Async.waterfall([s=>{_deleteImportedAssetsForUuid(e,t,a=>{a&&e.failed(`Failed to delete imported assets of ${t} during saveMeta, message: ${a.stack}`),s()})},t=>{_importAsset(e,i,t)},(t,s)=>{_postImportAsset(e,{path:i,meta:t},s)},(s,a)=>{let i=_generateSubMetaDiff(e,s,u);for(let t=0;t<i.added.length;++t){let s=i.added[t];e.existsByUuid(s.uuid)||(e._dbAdd(s.path,s.uuid),e.updateMtime(s.uuid))}for(let t=0;t<i.deleted.length;++t){let s=i.deleted[t];e.existsByUuid(s.uuid)&&e._dbDelete(s.path)}e.updateMtime(t),a(null,{meta:s,subMetas:i})}],(e,t)=>{if(e)return a&&a(e),void 0;a&&a(null,t)})},Tasks.clearImports=function(e,t,s,a){if(!e.fspathToUuid(t))return a&&a(new Error(`path-2-uuid does not contian: ${t}`)),void 0;e.log(`clear imports ${t}`);let i=[];for(let s in e._path2uuid)Path.contains(t,s)&&(e._isMountPath(s)||i.push(s));let r=[];Async.eachSeries(i,(t,a)=>{let i=e.assetInfoByPath(t),n=i.uuid;r.push(i),Async.series([a=>{let i,r=t+".meta",o=Fs.existsSync(r);if(o)i=Meta.load(e,r);else{i=new(Meta.findCtor(e,t))(e)}if(i&&i.delete)return o||e.warn(`Try to delete imported files from an un-exists path : ${r}.\n              This is not 100% work, please check them manually.`),i.uuid=s&&s[t]||n,e.log(`do meta.delete ${r}...`),i.delete(t,a),void 0;a()},t=>{_deleteImportedAssetsForUuid(e,n,s=>{s&&e.failed(`Failed to delete imported assets of ${n} during clearImports, message: ${s.stack}`),t()})},s=>{e._dbDelete(t),e.updateMtime(n),s()}],a)},e=>{a&&a(e,r)})},Tasks.copy=function(e,t,s,a,i){Async.series([e=>{Fs.copy(t,s,e)},e=>{if(!a)return e(),void 0;let i=t+".meta",r=s+".meta";Fs.existsSync(i)&&Fs.copy(i,r,e)},e=>{if(!Fs.isDirSync(s)||a)return e(),void 0;let t=[Path.join(s,"**/*.meta")];Globby(t,(t,s)=>{s=s.map(e=>Path.resolve(e)),Async.each(s,(e,t)=>{Del(e,{force:!0},t)},t=>{e(t)})})}],e=>{i&&i(e)})},Tasks.move=function(e,t,s,a){if(e.mountInfoByPath(t).readonly){let s=e.fspathToUrl(t);return a&&a(new Error(`${s} is readonly, CAN NOT move it in Editor.`)),void 0}if(e.mountInfoByPath(s).readonly){let t=e.fspathToUrl(s);return a&&a(new Error(`${t} is readonly, CAN NOT move asset into it in Editor.`)),void 0}Async.waterfall([a=>{Tasks._checkMoveInput(e,t,s,a)},a=>{Tasks.assetMove(e,t,s,a)}],(e,t)=>{if(e)return a&&a(e),void 0;a&&a(null,t)})},Tasks.exchangeUuid=function(e,t,s,a){let i=e.loadMetaByPath(t);if(!i)return a&&a(new Error(`Can't load meta for : ${t}`)),void 0;let r=e.loadMetaByPath(s);if(!r)return a&&a(new Error(`Can't load meta for : ${s}`)),void 0;let n=i.uuid;i.uuid=r.uuid,r.uuid=n,e._uuid2meta[i.uuid]=i,e._path2uuid[t]=i.uuid,e._uuid2path[i.uuid]=t,e._uuid2meta[r.uuid]=r,e._path2uuid[s]=r.uuid,e._uuid2path[r.uuid]=s,Async.series([t=>{Tasks.saveMeta(e,i.uuid,JSON.stringify(i.serialize(),null,2),t)},t=>{Tasks.saveMeta(e,r.uuid,JSON.stringify(r.serialize(),null,2),t)}],a)},Tasks._backupUnusedMeta=_backupUnusedMeta,Tasks._scan=_scan,Tasks._checkIfReimport=_checkIfReimport,Tasks._initMetas=_initMetas,Tasks._refresh=_refresh,Tasks._importAsset=_importAsset,Tasks._checkMoveInput=_checkMoveInput;