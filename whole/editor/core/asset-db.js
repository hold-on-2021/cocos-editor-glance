"use strict";const Path=require("path"),AssetDB=require("../../asset-db");Editor.assetdb=new AssetDB({cwd:Path.join(Editor.projectPath),library:"library",dev:Editor.dev,metaBackupPath:Path.join(Editor.projectPath,Editor.metaBackupPath),assetBackupPath:Path.join(Editor.projectPath,Editor.assetBackupPath)});const mainWinEvents=["asset-db:watch-state-changed","asset-db:state-changed"];Editor.assetdb.setEventCallback((t,a)=>{mainWinEvents.indexOf(t)>=0?Editor.Window.main&&Editor.Ipc.sendToMainWin(t,a):Editor.Ipc.sendToAll(t,a)});