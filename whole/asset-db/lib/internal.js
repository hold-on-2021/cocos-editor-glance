"use strict";const Async=require("async"),Del=require("del"),Path=require("fire-path"),Url=require("fire-url"),Fs=require("fire-fs"),Meta=require("./meta");module.exports={_MOUNT_PREFIX:"mount-",_dbpath(t){let e,s=[].slice.call(arguments,1),i=Url.join.apply(Url,s);for(e=0;e<i.length&&"/"===i[e];++e);return i=i.substr(e),Url.format({protocol:t,host:i,slashes:!0})},_fspath(t){if(!t)return null;if(0!==t.indexOf("db://"))return null;let e=t.substring(5),s=e.split("/"),i="",h=null;for(let t=0;t<s.length;++t){i=Path.join(i,s[t]);let e=this._mounts[i];if(!e)break;h=e}return h?(e=Path.relative(h.mountPath,e),Path.resolve(Path.join(h.path,e))):null},_url(t){if(!t)return null;for(let e in this._mounts){let s=this._mounts[e].path;if(Path.contains(s,t))return Url.normalize(`db://${e}/${Path.relative(s,t)}`)}return Url.normalize("file://"+t)},_allPaths(){return this._pathsDirty&&(this._paths=Object.keys(this._path2uuid),this._paths.sort(),this._pathsDirty=!1),this._paths},_metaToAssetPath(t){let e=Path.basename(t,".meta");return Path.join(Path.dirname(t),e)},_isMountPath(t){let e=Path.resolve(t);for(let t in this._mounts)if(this._mounts[t].path===e)return!0;return!1},_isAssetPath(t){if(!t)return!1;for(let e in this._mounts){let s=this._mounts[e].path;if(Path.contains(s,t))return!0}return!1},_mountIDByMountPath(t){return this._mounts[t]?this._MOUNT_PREFIX+t:""},_mountIDByPath(t){for(let e in this._mounts)if(this._mounts[e].path===t)return this._MOUNT_PREFIX+e;return""},_mountPaths(){let t=[];for(let e in this._mounts)t.push(this._mounts[e].path);return t},_uuidToImportPathNoExt(t){return Path.join(this._importPath,t.substring(0,2),t)},_fspathToImportPathNoExt(t){let e=this.fspathToUuid(t);return e?this._uuidToImportPathNoExt(e):null},_getDestPathByMeta(t){if(t.useRawfile())return null;let e=t.dests();if(!e.length)return null;let s=e[0];return Fs.existsSync(s)?s:null},_rmMetas(t){let e=[];for(let t in this._mounts)e.push(this._mounts[t].path);Async.each(e,(t,e)=>{Del(Path.join(t,"**/*.meta"),{force:!0},e)},t)},_dbAdd(t,e){this._uuid2path[e]&&this.failed(`uuid collision, the uuid for ${t} is already in used by ${this._uuid2path[e]}. Assigning a new uuid.`),this._path2uuid[t]&&this.failed(`path collision, the path for ${e} is already in used by ${this._path2uuid[t]}. Assigning a new path.`),this._path2uuid[t]=e,this._uuid2path[e]=t,this._pathsDirty=!0},_dbMove(t,e){let s=this._path2uuid[t];delete this._path2uuid[t],this._path2uuid[e]=s,this._uuid2path[s]=e,this._pathsDirty=!0},_dbDelete(t){let e=this._path2uuid[t];delete this._path2uuid[t],delete this._uuid2path[e],delete this._uuid2meta[e],this._pathsDirty=!0},_dbReset(){this._mounts={},this._uuid2mtime={},this._uuid2path={},this._path2uuid={}},_handleRefreshResults(t){if(!this._eventCallback)return;let e=[],s=[];t.forEach(t=>{t.error||("uuid-change"===t.command?this._dispatchEvent("asset-db:asset-uuid-changed",{type:t.type,uuid:t.uuid,oldUuid:t.oldUuid}):"change"===t.command?this._dispatchEvent("asset-db:asset-changed",{type:t.type,uuid:t.uuid}):"create"===t.command?s.push({path:t.path,url:t.url,uuid:t.uuid,parentUuid:t.parentUuid,type:t.type,hidden:t.hidden,readonly:t.readonly,name:t.name}):"delete"===t.command&&e.push({path:t.path,url:t.url,uuid:t.uuid,type:t.type}))}),e.length>0&&this._dispatchEvent("asset-db:assets-deleted",e),s.length>0&&this._dispatchEvent("asset-db:assets-created",s),this._handleErrorResults(t)},_handleErrorResults(t){this._eventCallback&&t.forEach(t=>{t.error&&"ESCRIPTIMPORT"===t.error.code&&this._dispatchEvent("asset-db:script-import-failed",t)})},_handleMetaBackupResults(t){this._eventCallback&&t.length>0&&this._dispatchEvent("asset-db:meta-backup",t)},_ensureDirSync(t){if(!Path.isAbsolute(t))return[];let e=[];for(Fs.ensureDirSync(t);!this._isMountPath(t);){if(Fs.isDirSync(t)){let s=t+".meta";if(!Fs.existsSync(s)){let i=Meta.create(this,s);Meta.save(this,s,i),this._dbAdd(t,i.uuid),e.push(i)}}t=Path.dirname(t)}return e},_dispatchEvent(t,e){this._eventCallback&&this._eventCallback(t,e)}};