(() => {
    "use strict";
    Editor.metas && (Editor.metas.mount = {
        "asset-icon": "unpack://static/icon/assets/mount.png"
    }, Editor.metas.asset["asset-icon"] = "unpack://static/icon/assets/asset.png", Editor.metas.folder["asset-icon"] = "unpack://static/icon/assets/folder.png", Editor.metas["custom-asset"] = Editor.require("app://editor/share/assets/meta/custom-asset"));
    var t = {
        "animation-clip": cc.AnimationClip,
        "audio-clip": cc.AudioClip,
        "bitmap-font": cc.BitmapFont,
        coffeescript: cc._CoffeeScript,
        typescript: cc._TypeScript,
        javascript: cc._JavaScript,
        particle: cc.ParticleAsset,
        prefab: cc.Prefab,
        scene: cc.SceneAsset,
        "sprite-atlas": cc.SpriteAtlas,
        "sprite-frame": cc.SpriteFrame,
        texture: cc.Texture2D,
        "texture-packer": cc.SpriteAtlas,
        "ttf-font": cc.TTFFont,
        markdown: cc.RawAsset,
        text: cc.RawAsset,
        "label-atlas": cc.LabelAtlas
    };
    for (var e in t) Editor.assets && (Editor.assets[e] = t[e]), Editor.metas && (Editor.metas[e] = Editor.require(`app://editor/share/assets/meta/${e}`), Editor.metas[e]["asset-icon"] = `unpack://static/icon/assets/${e}.png`), Editor.assettype2name && (Editor.assettype2name[cc.js.getClassName(t[e])] = e);
    Editor.assets.font = cc.Font, Editor.assets.spine = sp.SkeletonData, Editor.metas && (Editor.metas.spine = Editor.require("unpack://engine/extensions/spine/editor/spine-meta"), Editor.metas.spine["asset-icon"] = "unpack://engine/extensions/spine/editor/spine-asset.png"), Editor.assets.dragonbones = dragonBones.DragonBonesAsset, Editor.assets["dragonbones-atlas"] = dragonBones.DragonBonesAtlasAsset, Editor.metas && (Editor.metas.dragonbones = Editor.require("unpack://engine/extensions/dragonbones/editor/dragonbones-meta"), Editor.metas.dragonbones["asset-icon"] = "unpack://engine/extensions/spine/editor/spine-asset.png", Editor.metas["dragonbones-atlas"] = Editor.require("unpack://engine/extensions/dragonbones/editor/dragonbones-atlas-meta"), Editor.metas["dragonbones-atlas"]["asset-icon"] = "unpack://static/icon/assets/dragonbones-atlas.png"), Editor.assets["tiled-map"] = cc.TiledMapAsset, Editor.metas && (Editor.metas["tiled-map"] = Editor.require("unpack://engine/cocos2d/tilemap/editor/tiled-map"), Editor.metas["tiled-map"]["asset-icon"] = "unpack://engine/cocos2d/tilemap/editor/tiled-map.png"), Editor.assets["auto-atlas"] = cc.SpriteAtlas, Editor.metas && (Editor.metas["auto-atlas"] = Editor.require("app://editor/share/assets/meta/auto-atlas"), Editor.metas["auto-atlas"]["asset-icon"] = "unpack://static/icon/assets/auto-atlas.png"), Editor.assettype2name && (Editor.assettype2name["cc.RawAsset"] = "raw-asset", Editor.assettype2name["cc.Script"] = "script", Editor.assettype2name["cc.Font"] = "font", Editor.assettype2name["sp.SkeletonData"] = "spine", Editor.assettype2name["cc.TiledMapAsset"] = "tiled-map", Editor.assettype2name["dragonBones.DragonBonesAsset"] = "dragonbones", Editor.assettype2name["dragonBones.DragonBonesAtlasAsset"] = "dragonbones-atlas")
})();