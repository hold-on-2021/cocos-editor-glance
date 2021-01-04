"use strict";

function _initSocket(e) {
    var t = 0;
    (socketIO = require("socket.io")(e)).on("connection", function (e) {
        e.emit("connected"), t += 1, Editor.Ipc.sendToMainWin("preview-server:connects-changed", t), e.on("disconnect", function () {
            t -= 1, Editor.Ipc.sendToMainWin("preview-server:connects-changed", t)
        })
    })
}

function listen(e, t, i) {
    function r() {
        e.removeListener("error", s), i(null, t)
    }

    function s(s) {
        if (e.removeListener("listening", r), "EADDRINUSE" !== s.code && "EACCES" !== s.code) return i(s);
        listen(e, ++t, i)
    }
    e.once("error", s), e.once("listening", r), e.listen(t)
}

function getStashedSceneWithAssetSettings() {
    var e = Editor.require("app://asset-db/lib/meta").get(Editor.assetdb, Editor.currentSceneUuid),
        t = Editor.stashedScene.sceneJson;
    if (e) {
        var i = JSON.parse(t),
            r = Editor.serialize.findRootObject(i, "cc.SceneAsset");
        r ? r.asyncLoadAssets = e.asyncLoadAssets : Editor.warn("Can not find cc.SceneAsset in stashed scene");
        var s = Editor.serialize.findRootObject(i, "cc.Scene");
        return s ? s.autoReleaseAssets = e.autoReleaseAssets : Editor.warn("Can not find cc.Scene in stashed scene"), JSON.stringify(i)
    }
    return t
}
var socketIO, app, server, _buildMiddleware, _browserReload = !1;
module.exports = {
    userMiddlewares: [],
    previewPort: 7456,
    start: function (e, t) {
        var i = require("fire-fs"),
            r = require("fire-path"),
            s = require("os"),
            n = require("del"),
            o = require("express"),
            a = require("http"),
            d = require("mobile-detect"),
            c = require("async"),
            p = this;
        this._validateStashedScene = e;
        var u = r.join(s.tmpdir(), "fireball-game-builds");
        n.sync(r.join(u, "**/*"), {
            force: !0
        }), (app = o()).set("views", Editor.url("unpack://static/preview-templates")), app.set("view engine", "jade"), app.locals.basedir = app.get("views"), app.use(function (e, t, i) {
            var r = p.userMiddlewares;
            Array.isArray(r) && r.length > 0 ? c.eachSeries(r, (i, r) => {
                i(e, t, r)
            }, i) : i()
        }), app.use("/build", function (e, t, i) {
            _buildMiddleware ? _buildMiddleware(e, t, i) : t.send("Please build your game project first!")
        }), app.get("/", function (e, t) {
            var s = e.headers["user-agent"],
                n = new d(s),
                o = i.existsSync(r.join(Editor.projectPath, "library", "bundle.project.js")),
                a = "AndroidOS" === n.os() && (-1 !== s.indexOf("baidubrowser") || -1 !== s.indexOf("baiduboxapp")),
                c = -1 !== s.indexOf("MicroMessenger"),
                p = Editor._projectProfile.data["cocos-analytics"];
            t.render("index", {
                title: "CocosCreator | " + Editor.projectInfo.name,
                cocos2d: "cocos2d-js-for-preview.js",
                hasProjectScript: o,
                tip_sceneIsEmpty: Editor.T("PREVIEW.scene_is_empty"),
                enableDebugger: (!!n.mobile() || c) && !a,
                CA: p && p.enable && {
                    appID: JSON.stringify(p.appID) || '""',
                    appSecret: JSON.stringify(p.appSecret) || '""',
                    channel: JSON.stringify(p.channel) || '""',
                    version: JSON.stringify(p.version) || '""'
                }
            })
        }), app.get("/compile", function (e, t) {
            Editor.Compiler.compileScripts(!1, (e, i) => {
                i || (e ? (t.send("Compiling script successful!"), Editor.Compiler.reload()) : t.send("Compile failed!"))
            })
        }), app.get("/update-db", function (e, t) {
            Editor.assetdb.submitChanges(), t.send("Changes submitted")
        }), app.get(["/app/engine/*", "/engine/*"], function (e, t) {
            var i = r.join(Editor.url("unpack://engine"), e.params[0]);
            t.sendFile(i)
        }), app.get("/app/editor/static/*", function (e, t) {
            var i = Editor.url("unpack://static/" + e.params[0]);
            t.sendFile(i)
        }), app.get("/app/*", function (e, t) {
            var i = Editor.url("app://" + e.params[0]);
            t.sendFile(i)
        }), app.get("/project/*", function (e, t) {
            var i = r.join(Editor.projectPath, e.params[0]);
            t.sendFile(i)
        }), app.get("/preview-scripts/*", function (e, t) {
            let i = Editor.QuickCompiler.getTempPath();
            var s = r.join(i, e.params[0]);
            t.sendFile(s)
        }), app.get("/res/raw-*", function (e, t) {
            var i = e.params[0];
            i = Editor.assetdb._fspath("db://" + i), t.sendFile(i)
        }), app.get("/res/import/*", function (e, t) {
            var i = e.params[0];
            if (Editor.stashedScene && Editor.currentSceneUuid) {
                if (r.basenameNoExt(i) === Editor.currentSceneUuid) return t.send(getStashedSceneWithAssetSettings()), void 0
            }
            i = r.join(Editor.importPath, i), t.sendFile(i)
        }), app.get("/settings.js", function (e, i) {
            p.query("settings.js", function (e, r) {
                if (e) return t(e);
                i.send(r)
            })
        }), app.get("/preview-scene.json", function (e, i) {
            p.getPreviewScene(function (e) {
                return t(e)
            }, function (e) {
                i.send(e)
            }, function (e) {
                i.sendFile(e)
            })
        }), app.use(function (e, t, i, r) {
            console.error(e.stack), r(e)
        }), app.use(function (e, t, i, r) {
            t.xhr ? i.status(e.status || 500).send({
                error: e.message
            }) : r(e)
        }), app.use(function (e, t) {
            t.status(404).send({
                error: "404 Error."
            })
        }), listen(server = a.createServer(app), this.previewPort, (e, i) => {
            if (e) return t && t(e), void 0;
            this.previewPort = i, Editor.success(`preview server running at http://localhost:${this.previewPort}`), t && t()
        }), _initSocket(server)
    }, query: function (e, t, i) {
        if (this._validateStashedScene) switch (void 0 === i && (i = t, t = "web-desktop"), e) {
        case "settings.js":
            this._validateStashedScene(() => {
                var e = Editor.Profile.load("profile://project/project.json"),
                    r = {
                        designWidth: Editor.stashedScene.designWidth,
                        designHeight: Editor.stashedScene.designHeight,
                        groupList: e.data["group-list"],
                        collisionMatrix: e.data["collision-matrix"],
                        platform: t,
                        scripts: Editor.QuickCompiler.scripts
                    };
                require("./gulp-build").buildSettings({
                    customSettings: r,
                    sceneList: Editor.sceneList,
                    debug: !0,
                    preview: !0
                }, i)
            });
            break;
        case "stashed-scene.json":
            this._validateStashedScene(() => {
                i && i(null, getStashedSceneWithAssetSettings())
            })
        }
    }, getPreviewScene(e, t, i) {
        let r = Editor._projectProfile.data["start-scene"];
        if ("current" !== r && r !== Editor.currentSceneUuid && Editor.assetdb.existsByUuid(r)) {
            i(Editor.assetdb._uuidToImportPathNoExt(r) + ".json")
        } else this.query("stashed-scene.json", (i, r) => {
            if (i) return e(i);
            t(r)
        })
    }, stop: function () {
        server && server.close(function () {
            Editor.info("shutdown preview server"), server = null
        })
    }, browserReload: function () {
        _browserReload || (_browserReload = setTimeout(function () {
            socketIO.emit("browser:reload"), clearTimeout(_browserReload), _browserReload = !1
        }, 50))
    }, setPreviewBuildPath: function (e) {
        var t = require("express");
        _buildMiddleware = t.static(e)
    }, _validateStashedScene: null
};