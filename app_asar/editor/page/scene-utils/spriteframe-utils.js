"use strict";

function chooseAtlas(e) {
    if (!e) return;
    let t = Path.join(Editor.remote.projectPath, "assets"),
        r = Editor.Dialog.openFile({
            defaultPath: t,
            properties: ["openFile"],
            filters: [{
                name: "Texture Atlas",
                extensions: ["plist"]
            }],
            title: "Select a Texture Atlas to exchange spriteframes"
        });
    if (!r || !r[0]) return e(), void 0;
    let i = r[0];
    if (!Path.contains(t, i)) return e(new Error("Please select the Texture Atlas in the assets folder")), void 0;
    let s = Editor.remote.assetdb.fspathToUuid(i);
    if (!s) return e(new Error(`Cannot find uuid for path [${i}]`)), void 0;
    cc.AssetLibrary.loadAsset(s, (t, r) => {
        e(t, r)
    })
}
const Async = require("async"),
    Path = require("fire-path"),
    spriteFramePropMap = {
        "cc.Sprite": ["spriteFrame"],
        "cc.Button": ["normalSprite", "pressedSprite", "hoverSprite", "disabledSprite"],
        "cc.EditBox": ["backgroundImage"]
    };
let SpriteframeUtils = {};
_Scene.SpriteframeUtils = SpriteframeUtils, SpriteframeUtils.exchangeSceneSpriteFrames = function () {
    chooseAtlas((e, t) => {
        if (e) return Editor.error(e), void 0;
        if (!t) return;
        let r = t._spriteFrames,
            i = cc.director.getScene();
        _Scene.walk(i, !1, e => {
            for (let t in spriteFramePropMap) {
                let i = e.getComponent(t);
                if (!i) continue;
                let s = spriteFramePropMap[t];
                for (let t = 0; t < s.length; t++) {
                    let o = s[t],
                        a = i[o];
                    if (!a) continue;
                    let n = r[a.name];
                    n && a._uuid !== n._uuid && (_Scene.Undo.recordNode(e.uuid), i[o] = n)
                }
            }
        }), _Scene.Undo.commit()
    })
}, SpriteframeUtils.exchangeAnimationClipSpriteFrames = function () {
    chooseAtlas((e, t) => {
        function r(e) {
            let t = e.comps;
            if (!t) return !1;
            let r = !1;
            for (let e in spriteFramePropMap) {
                let s = t[e];
                if (!s) continue;
                let o = spriteFramePropMap[e];
                for (let e = 0; e < o.length; e++) {
                    let t = s[o[e]];
                    if (t)
                        for (let e = 0; e < t.length; e++) {
                            let s = t[e].value,
                                o = i[s.name];
                            o && s._uuid !== o._uuid && (r = !0, t[e].value = o)
                        }
                }
            }
            return r
        }
        if (e) return Editor.error(e), void 0;
        if (!t) return;
        let i = t._spriteFrames;
        Editor.assetdb.queryAssets("db://assets/**/*", "animation-clip", (e, t) => {
            if (e) return Editor.error(e), void 0;
            Async.eachSeries(t, (e, t) => {
                cc.AssetLibrary.loadAsset(e.uuid, (e, i) => {
                    if (e) return t(e), void 0;
                    let s = r(i.curveData);
                    if (i.paths)
                        for (var o in i.paths) r(i.paths[o]) && (s = !0);
                    s && Editor.assetdb.queryUrlByUuid(i._uuid, (e, t) => {
                        Editor.Ipc.sendToMain("asset-db:save-exists", t, i.serialize())
                    }), t()
                })
            }, e => {
                if (e) return Editor.error(e), void 0
            })
        }, 500)
    })
};