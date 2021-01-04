(()=>{"use strict";require("electron").ipcRenderer.on("app:compile-worker-start",function(e,r){function t(e){return n.basenameNoExt(e)}function i(e,t,i){var o=_.proj,s={debug:r.sourceMaps,basedir:o,builtins:["assert","buffer","console","constants","crypto","domain","events","http","https","os","path","punycode","querystring","stream","_stream_duplex","_stream_passthrough","_stream_readable","_stream_transform","_stream_writable","string_decoder","sys","timers","tty","url","util","vm","zlib","_process"],extensions:[".ts",".coffee"]};e.sort();var a;(function(e){if(!e._bresolve){let e=new Error("Failed to patch browserify");return l.isRunning&&l.stop(e),void 0}e.__bresolve=e._bresolve,e._bresolve=function r(t,i,o){e.__bresolve(t,i,function(e,s,a){if(e){if(i&&i.filename){var l=x[i.filename]||x[i.filename.toLowerCase()];if(l)return i.filename=l,i.basedir=n.dirname(l),r(t,i,o);console.warn(`Failed to resolve script "${t}" in raw directory: `,i)}return o(e,s,a)}var u=q[s];return u||(u=q[s.toLowerCase()])&&console.log(`resolve "${t}" to "${u}" by ignoring case mistake`),s=u||s,o(e,s,a)})}})(a=r.cacheDir?c(s,{recreate:r.recreateCache,cacheId:r.platform+"_"+!!r.debug+"_"+!!r.sourceMaps,cacheDir:r.cacheDir}):new p(s));for(let r=0;r<e.length;++r){var u=e[r];a.add(u),a.require(u,{expose:n.basenameNoExt(u)})}var h=a.bundle().on("error",function(e){e=new Error(function(e){function r(e,r,t){if(e.startsWith(r)){if(!t)return e.slice(r.length);if(e.endsWith(t))return e.slice(r.length,-t.length)}return""}var t=(e.message||e.toString()).trim();if(!t)return e;var i;if(i=r(t,"ENOENT, open '",".js'"),i){let e=n.basenameNoExt(i);return`${E} Cannot require '${e}', module not found, ${t}`}if(i=r(t,"ENOENT: no such file or directory, open '",".js'"),i){let e=n.basenameNoExt(i);return`${E} Cannot require '${e}', module not found, ${t}`}if(r(t,w)){let e=w.length+1,r=t.indexOf("'",e);if(-1===r)return t;let i=t.slice(e,r);if(n.basename(i)===i&&n.extname(i))return`${E} Cannot require '${i}', module not found, please remove file extension and retry. ( just "require('${n.basenameNoExt(i)}');"`;t=t.replace(w,"Cannot require ")+". Module not found."}return e.annotated&&(t=t+"\n"+e.annotated),E+" "+t}(e)),l.isRunning&&l.stop(e)}).pipe(d(i));if("editor"!==r.platform){h=h.pipe(f()),r.sourceMaps&&(h=h.pipe(m.init({loadMaps:!0})));var y=require("../share/build-platforms")[r.platform].isNative;h=h.pipe(b(v("build",{jsb:y,wechatgame:"wechatgame"===r.platform,bkgame:"bkgame"===r.platform,debug:r.debug}))),r.sourceMaps&&(h=h.pipe(g(q,o)).pipe(m.write("./")))}else r.sourceMaps&&(h=h.pipe(f()).pipe(m.init({loadMaps:!0})).pipe(g(q,o)).pipe(m.write("./")));return h.pipe(l.dest(t))}function o(e,r){l.task("get-scripts-"+e,function(e){(function(e,r){function i(e,r){if(e===y.project||e===y.all_in_one)return n.relative(u.cwd,r);if(e===y.builtin){let r=e.subDir,t=n.relative(_.builtinPluginDir,t);return`[${r}] ${t}`}if(e===y.global){let r=e.subDir,t=n.relative(_.globalPluginDir,t);return`[${r}] ${t}`}}function o(e,r,t){e[r]=t;let i=r.toLowerCase();i in e||(e[i]=t)}var s=n.join(h,"**/*.js"),l=_.proj,u={cwd:l};e.scripts.length=0;var p={};a(s,u,(s,a)=>{if(s)return r(s);for(var u=0;u<a.length;u++){var c=a[u],d=t(c),f=Editor.assetdb.remote.uuidToFspath(d);if(f){var m=n.resolve(l,c);o(x,m,f),o(q,f,m);var b=n.basenameNoExt(f);if(p[b]){var g=i(e,f),v=i(e,f),h=new Error(`${E} Filename conflict, the module "${b}" both defined in "${g}" and "${v}"`);return r(h)}p[b]=f,e.scripts.push(f)}else Editor.warn("Can not get fspath of: "+d+" from assetdb, but script found in library.")}r()})})(r,e)}),l.task("browserify-"+e,["clean","get-scripts-"+e],function(){var e=n.dirname(_.dest),t=n.basename(_.dest);return r.suffix&&(t=n.basenameNoExt(t)+r.suffix+n.extname(t)),console.log("Output "+n.join(e,t)),i(r.scripts,e,t)})}var n=require("fire-path"),s=require("async"),a=require("globby"),l=require("gulp"),u=require("del");Editor.isDarwin&&require("graceful-fs").gracefulify(require("fs"));var p=r.cacheDir?null:require("browserify"),c=r.cacheDir?require("persistify"):null,d=require("vinyl-source-stream"),f=require("vinyl-buffer"),m=require("gulp-sourcemaps"),b=require("gulp-uglify"),g=Editor.require("app://editor/page/refine-sourcemap"),v=Editor.require("unpack://engine/gulp/util/utils").getUglifyOptions;window.onerror=function(e,r,t,i,o){window.onerror=null;var n=o.stack||o;if(Editor&&Editor.Ipc&&Editor.Ipc.sendToMain&&Editor.Ipc.sendToMain("metrics:track-exception",n),l&&l.isRunning)return l.stop(o),!0;Editor&&Editor.Ipc&&Editor.Ipc.sendToMain&&Editor.Ipc.sendToMain("editor:renderer-console-error",n)},Editor.require("app://editor/share/editor-utils"),Editor.require("app://editor/page/asset-db");var h="library/imports",E="Compile error:",w="Cannot find module ",y={all_in_one:{suffix:"",subDir:"",scriptGlobs:[],scripts:[]},project:{suffix:".project",subDir:"assets",scriptGlobs:[],scripts:[]}};r.dest=r.dest||"library/bundle.js",r.platform=r.platform||"editor",r.debug=!!r.debug,r.sourceMaps="sourceMaps"in r?r.sourceMaps:r.debug;var _={dest:r.dest,proj:n.resolve(r.project)};_.dest=n.resolve(_.proj,_.dest);r.platform;if(n.contains(Editor.appPath,_.proj)){return e.reply(null,new Error(`${E} Invalid project path: ${r.project}`).stack),void 0}console.log("Compiling "+_.proj);var q={},x={};l.task("do-clean",function(e){var r=n.join(n.dirname(_.dest),n.basenameNoExt(_.dest)),t=n.extname(_.dest);s.forEachOf(y,(e,i,o)=>{var n=r+e.suffix+t;u(n,{force:!0},e=>{e&&Editor.error(`Failed to delete ${n}, press [F7] to try again.`),o(e)})},e)}),l.task("clean",["do-clean"],function(e){setTimeout(e,100)});for(var $ in y){o($,y[$])}"editor"===r.platform?l.task("compile",["browserify-project"]):l.task("compile",["browserify-all_in_one"]),l.start("compile",function(r){if(r){var t=Editor.Utils.toString(r);if("string"==typeof r.stack){if(r=r.stack,!r.startsWith(t)){var i=/^.*/.exec(t)[0];r.startsWith(i)&&(r=(r=r.slice(i.length)).trimLeft()),r=t+"\n"+r}r.startsWith("Error: "+E)&&(r=r.slice("Error: ".length))}else r=t}e.reply(null,r),console.log("Compile Worker Finished")})})})();