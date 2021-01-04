"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    advice = require("../libs/advice"),
    manager = require("../libs/manager"),
    dump = require("../libs/dump"),
    utils = require("../libs/utils");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/home.html"), "utf-8"), exports.watch = {
    width() {
        let e = this.$els.grid;
        e.resize(), e.repaint()
    },
    frame() {
        let e = this.$els.grid,
            i = this.frame * this.scale,
            t = e.clientWidth,
            a = i + e.xAxisOffset;
        (a < 0 || a > t) && advice.emit("drag-move", e.xAxisOffset + i - t / 2), dump.update()
    },
    clip() {
        this.clip && this.clip.id;
        this.updateState(), this.updateMNodes(), advice.emit("change-info"), advice.emit("select-frame", 0)
    },
    hierarchy() {
        let e = Editor.Selection.curActivate("node");
        this.hierarchy.some(i => i.id === e && (advice.emit("change-node", i), !0)), this.updateState(), this.updateClips()
    },
    sample() {
        this.initGrid()
    },
    node() {},
    record() {
        if (!(this.hierarchy && this.hierarchy.length && this.clip && this.clip.id)) return advice.emit("change-frame", 0), void 0;
        for (; this.selected.length;) this.selected.pop();
        Editor.Ipc.sendToPanel("scene", "scene:query-animation-time", {
            rootId: this.hierarchy[0].id,
            clip: this.clip.id
        }, (e, i) => {
            if (e) return Editor.warn(e), void 0;
            let t = Math.round(i.time * this.sample);
            advice.emit("change-frame", t)
        })
    }
}, exports.data = function () {
    return {
        state: -1,
        record: !1,
        paused: !0,
        event: -1,
        eline: null,
        scale: 20,
        offset: -10,
        width: 0,
        height: 0,
        duration: 0,
        speed: 1,
        sample: 60,
        mode: 0,
        ignore_pointer: !1,
        frame: 0,
        node: "",
        clip: "",
        hierarchy: [],
        mnodes: [],
        clips: [],
        props: [],
        selected: []
    }
}, exports.methods = {
    t: (e, ...i) => Editor.T(`timeline.home.${e}`, ...i),
    init() {
        let e = Editor.Selection.curActivate("node"),
            i = Editor.Selection.curSelection("node");
        this.hierarchy.every(e => -1 === i.indexOf(e.id)) && (this.hierarchy = []), e && Editor.Ipc.sendToPanel("timeline", "selection:activated", "node", e), i && i.length && Editor.Ipc.sendToPanel("timeline", "selection:selected", "node", i), Editor.Ipc.sendToPanel("scene", "scene:query-animation-record", (e, i) => {
            if (e) return Editor.warn(e), void 0;
            i.record && Editor.Ipc.sendToPanel("timeline", "selection:activated", "node", i.root), setTimeout(() => {
                i.clip && (this.clip = i.clip || {}), this.record = i.record
            }, 200)
        })
    },
    initEngine() {
        return this._initEngineFlag || window._Scene ? Promise.resolve() : new Promise((e, i) => {
            window._Scene = {}, cc.game.run({
                id: this.$els.game
            }, () => {
                this._initEngineFlag = !0, e()
            })
        })
    },
    initGrid() {
        let e = this.$els.grid;
        e.setScaleH([5, 2, 3, 2], 20, 100, "frame", this.sample), e.xAxisScaleAt(this.offset, this.scale), requestAnimationFrame(() => {
            e.resize(), e.repaint(), this.offset = e.xAxisOffset
        })
    },
    updateState() {
        this.state = -1, clearTimeout(this._updateStateTimer), this._updateStateTimer = setTimeout(() => {
            this.hierarchy && this.hierarchy.length ? dump.hasAnimaiton(this.hierarchy[0].id) ? this.clips && this.clips.length ? this.state = 3 : this.state = 2 : this.state = 1 : this.state = 0
        }, 500)
    },
    async updateClips() {
        if (!this.hierarchy || !this.hierarchy.length || !this.hierarchy[0].id) return advice.emit("change-clips", []), void 0;
        let e = this.hierarchy[0].id,
            i = await utils.promisify(Editor.Ipc.sendToPanel)("scene", "scene:query-animation-list", e),
            t = [];
        for (let e = 0; e < i.length; e++) {
            let a = i[e],
                n = await utils.promisify(Editor.Ipc.sendToPanel)("scene", "scene:query-animation-clip", a);
            n ? (n = await utils.promisify(cc.AssetLibrary.loadJson)(n))._uuid = a : n = await utils.promisify(cc.AssetLibrary.loadAsset)(a), t.push(n)
        }
        this.clips.every(e => t.some(i => i._uuid === e.id)) && this.clips.length === t.length || advice.emit("change-clips", t)
    },
    updateMNodes() {
        let e = this.clip ? this.clip.id : "",
            i = this.hierarchy[0],
            t = manager.Clip.queryPaths(e) || [];
        this.mnodes = t.map(e => ({
            state: 0,
            name: `/${i.name}/${e}`,
            path: e
        })).filter(e => !this.hierarchy.some(i => i.path === e.name))
    },
    scaleToChart(e, i) {
        let t = this.$els.grid,
            a = Editor.Utils.smoothScale(this.scale, e);
        a = Editor.Math.clamp(a, t.hticks.minValueScale, t.hticks.maxValueScale), this.scale = a, t.xAxisScaleAt(i, a), t.repaint(), this.offset = t.xAxisOffset
    },
    moveToChart(e) {
        let i = this.$els.grid;
        i.pan(-e, 0), i.repaint(), this.offset = i.xAxisOffset
    },
    queryPinterStyle: (e, i, t) => `transform: translateX(${e+i*t-1|0}px);`,
    _onClipChanged(e) {
        this.clips.some(i => i.name === e.target.value && (this.clip = i, Editor.Ipc.sendToPanel("scene", "scene:animation-current-clip-changed", {
            rootId: this.hierarchy[0].id,
            clip: i.name
        }), !0))
    },
    _onSampleChanged(e) {
        let i = this.clip ? this.clip.id : "";
        manager.Clip.changeSample(i, e.target.value), advice.emit("change-info")
    },
    _onSpeedChanged(e) {
        let i = this.clip ? this.clip.id : "";
        manager.Clip.changeSpeed(i, e.target.value), advice.emit("change-info")
    },
    _onModeChanged() {
        let e = this.clip ? this.clip.id : "";
        manager.Clip.changeMode(e, event.target.value), advice.emit("change-info")
    },
    _onPointerMouseDown(e) {
        let i = 0,
            t = this.frame;
        Editor.UI.startDrag("ew-resize", e, (e, a, n, s, r) => {
            i += isNaN(a) ? 0 : a;
            let c = Math.round(i / this.scale);
            advice.emit("select-frame", Math.max(c + t, 0))
        }, (...e) => {
            let a = Math.round(i / this.scale);
            advice.emit("select-frame", Math.max(a + t, 0))
        })
    },
    _onAddPropertyClick(e) {
        Editor.Ipc.sendToMain("timeline:menu-add-property", {
            x: e.pageX,
            y: e.pageY,
            nodeId: this.node.id
        })
    },
    _onAddAnimationComponentClick() {
        this.hierarchy && this.hierarchy.length && Editor.Ipc.sendToPanel("scene", "scene:add-component", this.hierarchy[0].id, "cc.Animation")
    },
    _onCreateClipClick() {
        this.hierarchy && this.hierarchy.length && Editor.Ipc.sendToMain("timeline:create-clip-file", this.hierarchy[0].id, e => {
            setTimeout(() => {
                this.updateClips()
            }, 200)
        }, -1)
    }
}, exports.created = function () {
    let e = null;
    advice.on("drag-zoom", (i, t) => {
        this.ignore_pointer = !0, this.scaleToChart(-i, t), clearTimeout(e), e = setTimeout(() => {
            this.ignore_pointer = !1
        }, 500)
    }), advice.on("drag-move", i => {
        this.ignore_pointer = !0, this.moveToChart(i), clearTimeout(e), e = setTimeout(() => {
            this.ignore_pointer = !1
        }, 500)
    }), advice.on("drag-key-end", e => {
        let i = this.selected.map(e => manager.Clip.queryKey(e.id, e.path, e.component, e.property, e.frame)),
            t = this.selected.filter(t => {
                let a = manager.Clip.queryKey(t.id, t.path, t.component, t.property, t.frame + e);
                return !(!a || -1 !== i.indexOf(a))
            });
        if (t && t.length) {
            let i = t.map(i => {
                manager.Clip.queryInfo(i.id);
                return `${i.path.replace(/\/[^\/]+/,"")} - ${i.component?`${i.component}.${i.property}`:i.property} - ${i.frame+e|0}`
            });
            i.length > 5 && (i.length = 5, i.push("..."));
            if (0 === Editor.Dialog.messageBox({
                    type: "question",
                    buttons: [Editor.T("timeline.manager.move_key_button_cancel"), Editor.T("timeline.manager.move_key_button_confirm")],
                    title: "",
                    message: Editor.T("timeline.manager.move_key_button_title"),
                    detail: `${i.join("\n")}\n${Editor.T("timeline.manager.move_key_button_title")}`,
                    defaultId: 0,
                    cancelId: 0,
                    noLink: !0
                })) return !1
        }
        t.forEach(i => {
            manager.Clip.deleteKey(i.id, i.path, i.component, i.property, i.frame + e)
        });
        let a = this.selected.map(e => {
            return manager.Clip.deleteKey(e.id, e.path, e.component, e.property, e.frame)
        });
        this.selected.forEach((i, t) => {
            let n = a[t];
            manager.Clip.addKey(i.id, i.path, i.component, i.property, i.frame + e, n.value)
        }), this.selected.forEach(i => {
            i.frame += e
        }), advice.emit("change-info")
    }), advice.on("ignore-pointer", e => {
        this.ignore_pointer = e
    }), advice.on("clip-data-update", () => {
        this.updateMNodes(), advice.emit("change-info")
    }), advice.on("change-hierarchy", e => {
        this.hierarchy = e
    }), advice.on("change-node", e => {
        this.node = e
    }), advice.on("change-clips", e => {
        for (; this.clips.length;) this.clips.pop();
        manager.clear(), e.forEach(e => {
            manager.register(e), this.clips.push({
                id: e._uuid,
                name: e.name
            })
        }), this.clip && this.clip.id && !this.clips.every(e => e._uuid !== this.clip.id) || (this.clip = this.clips && this.clips.length ? this.clips[0] : {}), dump.update(() => {
            this.updateState()
        })
    });
    let i = null;
    advice.on("change-frame", e => {
        this.frame = e, clearTimeout(i), i = setTimeout(() => {
            dump.update()
        }, 500)
    }), advice.on("change-record", e => {
        this.record = e
    });
    let t = null;
    advice.on("change-paused", async e => {
        if (this.paused = e, Editor.Ipc.sendToPanel("scene", "scene:animation-state-changed", {
                nodeId: this.node.id,
                clip: this.clip.name,
                state: e ? "pause" : "play"
            }), e) return clearTimeout(t), t = null, void 0;
        if (null !== t) return;
        let i = () => {
            t = setTimeout(() => {
                Editor.Ipc.sendToPanel("scene", "scene:query-animation-time", {
                    rootId: this.hierarchy[0].id,
                    clip: this.clip.name
                }, (e, t) => {
                    if (e) return Editor.warn(e), void 0;
                    let a = Math.round(t.time * this.sample);
                    advice.emit("change-frame", a), t.isPlaying ? i() : advice.emit("change-paused", !0)
                })
            }, 20)
        };
        i()
    }), advice.on("change-info", () => {
        let e = this.clip ? this.clip.id : "",
            i = manager.Clip.queryInfo(e);
        this.duration = i.duration, this.speed = i.speed, this.sample = i.sample, this.mode = i.wrapMode
    }), advice.on("change-event", e => {
        this.event = e
    }), advice.on("change-eline", e => {
        this.eline = e
    }), advice.on("select-frame", e => {
        Editor.Ipc.sendToPanel("scene", "scene:animation-time-changed", {
            nodeId: this.node.id,
            clip: this.clip.name,
            time: e / this.sample
        }), advice.emit("change-frame", e)
    });
    require("../message/selection").activated(null, "node", Editor.Selection.curActivate("node"))
}, exports.compiled = function () {
    this.initEngine(), this.initGrid(), Editor.Ipc.sendToPanel("scene", "scene:is-ready", (e, i) => {
        i && this.init()
    }, -1)
};