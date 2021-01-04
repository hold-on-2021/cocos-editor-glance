"use strict";
var Ticker = cc._Ticker,
    Time = cc.Time,
    EditorEngine = cc.Class({
        name: "EditorEngine",
        extends: cc.Playable,
        ctor: function () {
            var e = arguments[0];
            this._requestId = -1, this._useDefaultMainLoop = e, this._isInitializing = !1, this._isInitialized = !1, this._loadingScene = "", this._bindedTick = (CC_EDITOR || e) && this._tick.bind(this), this.maxDeltaTimeInEM = .2, this.animatingInEditMode = !1, this._shouldRepaintInEM = !1, this._forceRepaintId = -1, this.attachedObjsForEditor = {}, this._designWidth = 0, this._designHeight = 0
        },
        properties: {
            isInitialized: {
                get: function () {
                    return this._isInitialized
                }
            },
            loadingScene: {
                get: function () {
                    return this._loadingScene
                }
            },
            forceRepaintIntervalInEM: {
                default: 500,
                notify: CC_EDITOR && function () {
                    if (-1 !== this._forceRepaintId && clearInterval(this._forceRepaintId), this.forceRepaintIntervalInEM > 0) {
                        var e = this;
                        this._forceRepaintId = setInterval(function () {
                            e.repaintInEditMode()
                        }, this.forceRepaintIntervalInEM)
                    }
                }
            },
            editingRootNode: {
                default: null,
                type: cc.Node
            }
        },
        init: function (e, t) {
            if (this._isInitializing) return cc.error("Editor Engine already initialized"), void 0;
            this._isInitializing = !0;
            var i = this;
            this.createGame(e, function (n) {
                i._isInitialized = !0, i._isInitializing = !1, t(n), CC_EDITOR && !e.dontTick && i.startTick()
            })
        },
        createGame: function (e, t) {
            if (cc.game._prepareCalled) return cc.error("cc.Game.prepare called, but not done yet."), void 0;
            cc.macro.ENABLE_TRANSPARENT_CANVAS = !0;
            var i = {
                width: e.width,
                height: e.height,
                showFPS: !1,
                debugMode: cc.DebugMode.INFO,
                frameRate: 60,
                id: e.id,
                renderMode: CC_EDITOR ? 2 : e.renderMode,
                registerSystemEvent: !CC_EDITOR,
                jsList: [],
                noCache: !0,
                groupList: e.groupList,
                collisionMatrix: e.collisionMatrix
            };
            cc.game.run(i, function () {
                CC_EDITOR && (cc.view.enableRetina(!1), cc.game.canvas.style.imageRendering = "pixelated", cc.director.setClearColor(cc.color(0, 0, 0, 0))), cc.view.setDesignResolutionSize(e.designWidth, e.designHeight, cc.ResolutionPolicy.SHOW_ALL), cc.view.setCanvasSize(i.width, i.height);
                var n = new cc.Scene;
                cc.director.runSceneImmediate(n), cc.game.pause(), CC_EDITOR && (cc.game.canvas.setAttribute("tabindex", -1), cc.game.canvas.style.backgroundColor = ""), t && t()
            })
        },
        playInEditor: function () {
            if (CC_EDITOR) {
                Editor.require("unpack://engine/cocos2d/core/platform/CCInputManager").registerSystemEvent(cc.game.canvas), cc.game.canvas.setAttribute("tabindex", 99), cc.game.canvas.style.backgroundColor = "black", cc.imeDispatcher._domInputControl && cc.imeDispatcher._domInputControl.setAttribute("tabindex", 2)
            }
            cc.director.resume()
        },
        tick: function (e, t) {
            cc.director.mainLoop(e, t)
        },
        tickInEditMode: function (e, t) {
            CC_EDITOR && cc.director.mainLoop(e, t)
        },
        repaintInEditMode: function () {
            CC_EDITOR && !this._isUpdating && (this._shouldRepaintInEM = !0)
        },
        getInstanceById: function (e) {
            return this.attachedObjsForEditor[e] || null
        },
        getIntersectionList: function (e, t) {
            function i(i, n) {
                if (n._getLocalBounds) {
                    var c = u;
                    if (n._getLocalBounds(c), c.width <= 0 || c.height <= 0) return null;
                    var r = i.getNodeToWorldTransform();
                    cc.engine.obbApplyAffineTransform(r, c, a, o, s, d);
                    var g = h;
                    if (Editor.Math.calculateMaxRect(g, a, o, s, d), t) return e.containsRect(g) ? {
                        aabb: g
                    } : null;
                    if (e.intersects(g) && Editor.Utils.Intersection.rectPolygon(e, l)) return {
                        aabb: g,
                        obb: l
                    }
                }
                return n.gizmo && n.gizmo.rectHitTest(e, t) ? {} : null
            }
            var n = this.editingRootNode,
                c = !0;
            n || (c = !1, n = cc.director.getScene());
            var r = [],
                a = new cc.Vec2,
                o = new cc.Vec2,
                s = new cc.Vec2,
                d = new cc.Vec2,
                l = new Editor.Utils.Polygon([a, o, s, d]),
                u = new cc.Rect,
                h = new cc.Rect;
            return function (e, t, i) {
                function n(e, t) {
                    for (var i = e.children, c = i.length - 1; c >= 0; c--) {
                        var r = i[c];
                        n(r, t), t(r)
                    }
                }
                i && n(e, i), t && i && i(e)
            }(n, c, function (n) {
                if (n.activeInHierarchy) {
                    if (!n.getComponent(cc.Canvas)) {
                        var c = function (i, n) {
                            if (0 === n.width || 0 === n.height) return null;
                            var c = _Scene.NodeUtils.getWorldBounds(i, n);
                            if (t) return e.containsRect(c) ? {
                                aabb: c
                            } : null;
                            if (e.intersects(c)) {
                                var r = _Scene.NodeUtils.getWorldOrientedBounds(i, n),
                                    a = new Editor.Utils.Polygon(r);
                                if (Editor.Utils.Intersection.rectPolygon(e, a)) return {
                                    aabb: c,
                                    obb: a
                                }
                            }
                            return null
                        }(n, n.getContentSize());
                        if (c) return c.node = n, r.push(c), void 0;
                        for (var a = n._components, o = 0, s = a.length; o < s; o++) {
                            var d = a[o];
                            if (d.enabled && (c = i(n, d), c)) {
                                c.node = n, r.push(c);
                                break
                            }
                        }
                    }
                }
            }), r
        },
        setDesignResolutionSize: function (e, t, i) {
            this._designWidth = e, this._designHeight = t, this.emit("design-resolution-changed")
        },
        getDesignResolutionSize: function () {
            return cc.size(this._designWidth, this._designHeight)
        },
        obbApplyAffineTransform(e, t, i, n, c, r) {
            var a = t.x,
                o = t.y,
                s = t.width,
                d = t.height,
                l = e.a * a + e.c * o + e.tx,
                u = e.b * a + e.d * o + e.ty,
                h = e.a * s,
                g = e.b * s,
                _ = e.c * d,
                f = e.d * d;
            n.x = l, n.y = u, c.x = h + l, c.y = g + u, i.x = _ + l, i.y = f + u, r.x = h + _ + l, r.y = g + f + u
        },
        onError: function (e) {
            if (CC_EDITOR) switch (e) {
                case "already-playing":
                    cc.warn("Fireball is already playing")
            }
        },
        onResume: function () {
            CC_EDITOR && cc.Object._clearDeferredDestroyTimer(), cc.game.resume(), CC_DEV && !this._useDefaultMainLoop && this._tickStop()
        },
        onPause: function () {
            cc.game.pause(), CC_EDITOR && this._tickStart()
        },
        onPlay: function () {
            if (CC_EDITOR && !this._isPaused && cc.Object._clearDeferredDestroyTimer(), this.playInEditor(), this._shouldRepaintInEM = !1, this._useDefaultMainLoop) {
                var e = Ticker.now();
                Time._restart(e), this._tickStart()
            } else CC_EDITOR && this._tickStop()
        },
        onStop: function () {
            cc.game.pause(), this._loadingScene = "", CC_EDITOR && (this.repaintInEditMode(), this._tickStart())
        },
        startTick: function () {
            this._tickStart(), this.forceRepaintIntervalInEM = this.forceRepaintIntervalInEM
        },
        _tick: function () {
            this._requestId = Ticker.requestAnimationFrame(this._bindedTick);
            var e = Ticker.now();
            this._isUpdating || this._stepOnce ? (Time._update(e, !1, this._stepOnce ? 1 / 60 : 0), this._stepOnce = !1, this.tick(Time.deltaTime, !0)) : CC_EDITOR && (Time._update(e, !1, this.maxDeltaTimeInEM), (this._shouldRepaintInEM || this.animatingInEditMode) && (this.tickInEditMode(Time.deltaTime, this.animatingInEditMode), this._shouldRepaintInEM = !1))
        },
        _tickStart: function () {
            -1 === this._requestId && this._tick()
        },
        _tickStop: function () {
            -1 !== this._requestId && (Ticker.cancelAnimationFrame(this._requestId), this._requestId = -1)
        },
        reset: function () {
            cc.game._prepared = !1, cc.game._prepareCalled = !1, cc.game._rendererInitialized = !1, cc.textureCache._clear(), cc.loader.releaseAll(), cc._vertexAttribPosition = !1, cc._vertexAttribColor = !1, cc._vertexAttribTexCoords = !1
        },
        updateAnimatingInEditMode: function () {
            if (_Scene.AnimUtils.isPlaying()) return;
            let e = Editor.Selection.curSelection("node").map(e => this.getInstanceById(e));
            for (let t = 0; t < e.length; t++) {
                let i = e[t];
                if (!i) continue;
                let n = i._components;
                for (let e = 0; e < n.length; e++) {
                    let t = n[e];
                    if (t && t.constructor._executeInEditMode && t.isValid && t.enabledInHierarchy && t.constructor._playOnFocus) return this.animatingInEditMode = !0, void 0
                }
            }
            this.animatingInEditMode = !1
        }
    });
cc.engine = new EditorEngine(!1);