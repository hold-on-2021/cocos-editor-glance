"use strict";const Task=require("./tasks"),Meta=require("./meta"),Path=require("fire-path"),Fs=require("fire-fs");module.exports={urlToUuid(t){let s=this._fspath(t);return this.fspathToUuid(s)},fspathToUuid(t){return this._path2uuid[t]},uuidToFspath(t){return this._uuid2path[t]},uuidToUrl(t){let s=this.uuidToFspath(t);return this._url(s)},fspathToUrl(t){return this._url(t)},urlToFspath(t){return this._fspath(t)},exists(t){let s=this.urlToUuid(t);return this.existsByUuid(s)},existsByUuid(t){return!!this._uuid2path[t]},existsByPath(t){return!!this._path2uuid[t]},isSubAsset(t){let s=this._fspath(t);return!!s&&this.isSubAssetByPath(s)},isSubAssetByUuid(t){let s=this.uuidToFspath(t);return!!s&&this.isSubAssetByPath(s)},isSubAssetByPath:t=>!1===Fs.isDirSync(Path.dirname(t)),containsSubAssets(t){let s=this._fspath(t);return!!s&&this.containsSubAssetsByPath(s)},containsSubAssetsByUuid(t){let s=this.uuidToFspath(t);return!!s&&this.containsSubAssetsByPath(s)},containsSubAssetsByPath(t){if(""===Path.extname(t))return!1;let s=this._allPaths(),e=s.indexOf(t);if(e>=0){let a=s[++e];if(a&&Path.contains(t,a))return!0}return!1},assetInfo(t){let s=this._fspath(t);return s?this.assetInfoByPath(s):null},assetInfoByUuid(t){let s=this.uuidToFspath(t);return s?this.assetInfoByPath(s):null},assetInfoByPath(t){let s,e=this._url(t),a=this.fspathToUuid(t),i=Meta.get(this,a);if(i)s=i.assetType();else{s=Meta.findCtor(this,t).defaultType()}return{uuid:a,path:t,url:e,type:s,isSubAsset:this.isSubAssetByPath(t)}},subAssetInfos(t){let s=this._fspath(t);return this.subAssetInfosByPath(s)},subAssetInfosByUuid(t){let s=this.uuidToFspath(t);return this.subAssetInfosByPath(s)},subAssetInfosByPath(t){let s=[];if("string"==typeof t&&""!==Path.extname(t)){let e=this._allPaths(),a=e.indexOf(t);if(a>=0){let i,h=e[++a];for(;h&&Path.contains(t,h);)i=this.assetInfoByPath(h),s.push(i),h=e[++a]}}return s},loadMeta(t){let s=this._fspath(t);return this.loadMetaByPath(s)},loadMetaByUuid(t){let s=this.uuidToFspath(t);return this.loadMetaByPath(s)},loadMetaByPath(t){return Meta.load(this,t+".meta")},isMount(t){let s=this.urlToUuid(t);return this.isMountByUuid(s)},isMountByPath(t){let s=this.fspathToUuid(t);return this.isMountByUuid(s)},isMountByUuid(t){return t.startsWith(this._MOUNT_PREFIX)},mountInfo(t){let s=this._fspath(t);return this.mountInfoByPath(s)},mountInfoByUuid(t){let s=this.uuidToFspath(t);return this.mountInfoByPath(s)},mountInfoByPath(t){if(!t)return null;for(let s in this._mounts){let e=this._mounts[s];if(Path.contains(e.path,t))return e}return null},mount(t,s,e,a){"function"==typeof e&&(a=e,e={}),this._tasks.push({name:"mount",run:Task.mount,params:[t,s,e]},a)},attachMountPath(t,s){this._tasks.push({name:"attachMountPath",run:Task.attachMountPath,params:[t]},(t,e)=>{if(t)return s&&s(t),void 0;this._handleRefreshResults(e),s&&s(null,e)})},unattachMountPath(t,s){this._tasks.push({name:"unattachMountPath",run:Task.unattachMountPath,params:[t]},(t,e)=>{if(t)return s&&s(t),void 0;this._handleRefreshResults(e),s&&s(null,e)})},unmount(t,s){this._tasks.push({name:"unmount",run:Task.unmount,params:[t]},s)},init(t){this._tasks.push({name:"init",run:Task.init,params:[]},t)},refresh(t,s){let e=this._fspath(t);this._tasks.push({name:"refresh",run:Task.refresh,params:[e]},(t,e)=>{if(t)return s&&s(t),void 0;this._handleRefreshResults(e),s&&s(null,e)})},deepQuery(t){this._tasks.push({name:"deep-query",run:Task.deepQuery,params:[],silent:!0},t)},queryAssets(t,s,e){let a=this._fspath(t);this._tasks.push({name:"query-assets",run:Task.queryAssets,params:[a,s],silent:!0},e)},queryMetas(t,s,e){let a;if(t.startsWith("db://*")){if("db://**"!==t&&"db://**/*"!==t)return e(new Error(`Unsupported pattern "${t}"`));a=null}else a=this._fspath(t);this._tasks.push({name:"query-metas",run:Task.queryMetas,params:[a,s],silent:!0},e)},move(t,s,e){let a=this._fspath(t),i=this._fspath(s);this._tasks.push({name:"move",run:Task.move,params:[a,i]},(t,s)=>{if(t)return e&&e(t),void 0;let a=[],i=[];for(let t=0;t<s.length;++t){let e=s[t].subMetas;e&&(a=a.concat(e.deleted),i=i.concat(e.added),delete s[t].diff)}for(let t=a.length-1;t>=0;--t){let e=a[t];for(let h=i.length-1;h>=0;--h){let u=i[h];e.uuid===u.uuid&&s.push({uuid:u.uuid,url:Editor.assetdb.uuidToUrl(u.uuid),parentUuid:u.parentUuid,srcPath:e.path,destPath:u.path,isSubAsset:u.isSubAsset}),i.splice(h,1),a.splice(t,1);break}}this._dispatchEvent("asset-db:assets-moved",s),a.length>0&&this._dispatchEvent("asset-db:assets-deleted",a),i.length>0&&this._dispatchEvent("asset-db:assets-created",i),e&&e(null,s)})},delete(t,s){this._tasks.push({name:"delete",run:Task.delete,params:[t]},(t,e)=>{e&&e.length>0&&this._dispatchEvent("asset-db:assets-deleted",e),s&&s(t,e)})},create(t,s,e){let a=this._fspath(t);this._tasks.push({name:"create",run:Task.create,params:[a,s]},(s,a)=>{if(s)return this.error("Failed to create asset %s, messages: %s",t,s.stack),e&&e(s),void 0;this._dispatchEvent("asset-db:assets-created",a),e&&e(null,a)})},saveExists(t,s,e){let a=this._fspath(t);this._tasks.push({name:"update",run:Task.saveExists,params:[a,s]},(s,a)=>{if(s)return this.error(`Failed to update asset ${t}, messages: ${s.stack}`),a&&this._handleRefreshResults([a]),e&&e(s),void 0;let i=a.meta,h=a.subMetas;this._dispatchEvent("asset-db:asset-changed",{uuid:i.uuid,type:i.assetType()}),h.deleted.length>0&&this._dispatchEvent("asset-db:assets-deleted",h.deleted),h.added.length>0&&this._dispatchEvent("asset-db:assets-created",h.added),e&&e(null,a)})},import(t,s,e){let a=this._fspath(s);this._tasks.push({name:"import",run:Task.import,params:[t,a]},(t,a)=>{if(t)return this.error("Failed to import assets to %s, messages: %s",s,t.stack),e&&e(t),void 0;let i=[],h=[];for(var u=0;u<a.length;u++)a[u].command?h.push(a[u]):i.push(a[u]);i&&i.length>0&&this._dispatchEvent("asset-db:assets-created",i),h&&h.length>0&&this._handleRefreshResults(h),e&&e(null,a)})},saveMeta(t,s,e){this._tasks.push({name:"save-meta",run:Task.saveMeta,params:[t,s]},(s,a)=>{if(s)return this.error(`Failed to save meta ${s.stack}`),e&&e(s),void 0;let i=a.meta,h=a.subMetas;this._dispatchEvent("asset-db:asset-changed",{uuid:t,type:i.assetType()}),h.remained.length>0&&h.remained.forEach(t=>{this._dispatchEvent("asset-db:asset-changed",{uuid:t.uuid,type:t.type})}),h.deleted.length>0&&this._dispatchEvent("asset-db:assets-deleted",h.deleted),h.added.length>0&&this._dispatchEvent("asset-db:assets-created",h.added),e&&e(null,a)})},exchangeUuid(t,s,e){let a=this._fspath(t),i=this._fspath(s);this._tasks.push({name:"exchange-uuid",run:Task.exchangeUuid,params:[a,i]},e)},clearImports(t,s){let e=this._fspath(t);this._tasks.push({name:"clear-imports",run:Task.clearImports,params:[e,null]},s)},register(t,s,e){Meta.register(this,t,s,e)},unregister(t){Meta.unregister(this,t)},setDefaultMetaType(t){Meta.defaultMetaType=t},getRelativePath(t){let s=null;for(let e in this._mounts){let a=this._mounts[e].path;if(Path.contains(a,t)){s=Path.relative(a,t);break}}return s},getAssetBackupPath(t){if(!this.assetBackupPath)return null;let s=this.mountInfoByPath(t);if(!s)return null;let e=Path.relative(s.path,t);return Path.join(this.assetBackupPath,s.mountPath,e)},setEventCallback(t){this._eventCallback=t}};