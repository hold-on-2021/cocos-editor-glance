"use strict";const RawAssetMeta=require("./raw-asset");class AssetMeta extends RawAssetMeta{constructor(s){super(s)}useRawfile(){return!1}dests(){return[this._assetdb._uuidToImportPathNoExt(this.uuid)+".json"]}import(s,t){this._assetdb.copyAssetToLibrary(this.uuid,s),t&&t()}static defaultType(){return"asset"}}module.exports=AssetMeta;