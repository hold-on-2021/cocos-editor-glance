const Path=require("fire-path"),Async=require("async"),Lodash=require("lodash"),Fs=require("fire-fs"),Utils=require("./utils");class TexturePacker{init(e,t){this.writer=e.writer,this.dest=e.dest,this.spriteFrames=[],this.pacInfos=[],this.textureUuids=[],this.needPackSpriteFrames=[],Utils.queryAtlases(e.files,(e,i)=>{if(e)return t(e);this.spriteFrames=i.spriteFrames,this.pacInfos=i.pacInfos,this.textureUuids=this.spriteFrames.map(e=>e.getTexture()._uuid),this.textureUuids=Lodash.uniq(this.textureUuids),t()})}needPack(e){if(-1!==this.textureUuids.indexOf(e))return!0;let t=this.spriteFrames;for(let r=0;r<t.length;r++){var i=t[r];if(i._uuid===e)return-1===this.needPackSpriteFrames.indexOf(i)&&this.needPackSpriteFrames.push(i),!1}return!1}pack(e){let t={},i=[],r={dest:this.dest,pacInfos:this.pacInfos,needPackSpriteFrames:this.needPackSpriteFrames};Editor.url("db://assets/resources");Utils.pack(r,(r,s)=>{if(r)return e&&e(r),void 0;Async.forEach(s,(e,r)=>{i=i.concat(e.unpackedTextures);let s=e.pacInfo,a=new cc.SpriteAtlas;a._uuid=s.info.uuid,Async.forEach(e.atlases,(e,i)=>{let r=require("../hash-uuid"),s=e.files.map(function(e){return e.uuid}),n=r.calculate([s],r.BuiltinHashType.AutoAtlasTexture)[0];t[n]=[Path.relative(this.dest,e.imagePath),"cc.Texture2D"],Async.forEach(e.files,(e,t)=>{if(-1===this.needPackSpriteFrames.indexOf(e.spriteFrame))return t();let i=this.generateSpriteFrame(e,a._uuid,n);a._spriteFrames[e.name]=Editor.serialize.asAsset(i._uuid),this.write(i,t)},e=>{i(e)})},e=>{if(e)return r(e);this.write(a,r)})},r=>{if("win32"===process.platform)for(let e in t){let i=t[e];i[0]=i[0].replace(/\\/g,"/")}e&&e(r,t,i)})})}generateSpriteFrame(e,t,i){let r=new cc.SpriteFrame,s=e.spriteFrame;r._name=e.name,r._atlasUuid=t,r._uuid=s._uuid;let a=e.trim;r._rect=cc.rect(a.x,a.y,a.width,a.height),r._offset=s.getOffset(),r._originalSize=cc.size(e.rawWidth,e.rawHeight),r._rotated=e.rotated,r.insetLeft=s.insetLeft,r.insetTop=s.insetTop,r.insetRight=s.insetRight,r.insetBottom=s.insetBottom;let n=new cc.Asset;return n._uuid=i,r._textureFilename=n,r}write(e,t){let i=Editor.serialize(e,{exporting:!0,nicify:!0,stringify:!1,dontStripDefault:!1});this.writer.writeJsonByUuid(e._uuid,i,t)}}TexturePacker.generatePreviewFiles=function(e,t){let i=Editor.remote.assetdb.assetInfoByUuid(e),r=Path.join(Editor.remote.projectPath,"temp/TexturePacker");Utils.queryAtlases(i,(e,i)=>{if(e)return t(e);i.pacInfos.forEach(e=>{e.relativeDir=Path.join(e.relativeDir,Path.basename(e.info.path))}),Utils.pack({dest:r,pacInfos:i.pacInfos,clear:!0},(e,i)=>{if(e)return t(e);let r=i[0];if(!r)return;let s=r.atlases.map(e=>({path:e.imagePath,name:Path.basename(e.imagePath),size:e.width+"x"+e.height})),a=r.unpackedTextures.map(e=>{let t=e.originalPath||e.path;return{path:t,name:Path.basename(t),size:e.width+"x"+e.height}}),n=JSON.stringify({packedTextures:s,unpackedTextures:a},null,2);Fs.writeFileSync(Path.join(r.path,"info.json"),n),t(null)})})},TexturePacker.queryPreviewInfo=function(e,t){let i=Editor.url("db://assets"),r=Editor.remote.assetdb.assetInfoByUuid(e),s=Path.relative(i,Path.dirname(r.path)),a=Path.join(Editor.remote.projectPath,"temp/TexturePacker",s,Path.basename(r.path)),n=Path.join(a,"info.json");if(!Fs.existsSync(n))return t(null);t(null,Fs.readJSONSync(n))},module.exports=TexturePacker;