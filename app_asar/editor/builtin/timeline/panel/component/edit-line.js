"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    advice = require("../libs/advice"),
    manager = require("../libs/manager"),
    easeMap = {
        linear: {
            e: "Linear",
            c: "Default"
        },
        quadIn: {
            e: "Ease In",
            c: "Quad"
        },
        quadOut: {
            e: "Ease Out",
            c: "Quad"
        },
        quadInOut: {
            e: "Ease In Out",
            c: "Quad"
        },
        cubicIn: {
            e: "Ease In",
            c: "Cubic"
        },
        cubicOut: {
            e: "Ease Out",
            c: "Cubic"
        },
        cubicInOut: {
            e: "Ease In Out",
            c: "Cubic"
        },
        quartIn: {
            e: "Ease In",
            c: "Quart"
        },
        quartOut: {
            e: "Ease Out",
            c: "Quart"
        },
        quartInOut: {
            e: "Ease In Out",
            c: "Quart"
        },
        quintIn: {
            e: "Ease In",
            c: "Quint"
        },
        quintOut: {
            e: "Ease Out",
            c: "Quint"
        },
        quintInOut: {
            d: "Ease In Out",
            c: "Quint"
        },
        sineIn: {
            e: "Ease In",
            c: "Sine"
        },
        sineOut: {
            e: "Ease Out",
            c: "Sine"
        },
        sineInOut: {
            e: "Ease In Out",
            c: "Sine"
        },
        expoIn: {
            e: "Ease In",
            c: "Expo"
        },
        expoOut: {
            e: "Ease Out",
            c: "Expo"
        },
        expoInOut: {
            e: "Ease In Out",
            c: "Expo"
        },
        circIn: {
            e: "Ease In",
            c: "Circ"
        },
        circOut: {
            e: "Ease Out",
            c: "Circ"
        },
        circInOut: {
            e: "Ease In Out",
            c: "Circ"
        },
        constant: {
            e: "Constant",
            c: "Default"
        }
    };
exports.template = fs.readFileSync(ps.join(__dirname, "../template/edit-line.html"), "utf-8"), exports.props = ["eline", "width", "height"], exports.watch = {
    scale() {
        this.drawSquares(), this.updateSide(), this.updateControls()
    },
    width() {
        this.drawSquares(), this.updateSide(), this.updateControls()
    },
    height() {
        this.drawSquares(), this.updateSide(), this.updateControls()
    },
    side() {
        this.drawSquares()
    },
    ease() {
        this.updateControls()
    },
    class() {
        this.updateControls()
    },
    controls() {
        this.updateBezier()
    }
}, exports.data = function () {
    return {
        dirty: !1,
        scale: 1,
        side: 0,
        num: 10,
        hlines: [],
        vlines: [],
        bezier: "",
        controls: [],
        ease: "Linear",
        class: "Default",
        types: {
            Custom: {
                Custom: [.4, .4, .6, .6]
            },
            Constant: {
                Default: []
            },
            Linear: {
                Default: [.3, .3, .7, .7]
            },
            "Ease In": {
                Cubic: [.4, 0, .5, .5],
                Quad: [.55, .08, .68, .53],
                Quart: [.89, .03, .68, .21],
                Quint: [.75, .05, .85, .06],
                Sine: [.48, 0, .73, .71],
                Expo: [.95, .04, .79, .03],
                Circ: [.6, .04, .98, .33]
            },
            "Ease Out": {
                Cubic: [.06, .12, .58, 1],
                Quad: [.25, .46, .45, .95],
                Quart: [.16, .84, .43, 1],
                Quint: [.22, 1, .31, 1],
                Sine: [.39, .59, .56, 1],
                Expo: [.18, 1, .22, 1],
                Circ: [.08, .82, .01, 1]
            },
            "Ease In Out": {
                Cubic: [.42, 0, .58, 1],
                Quad: [.48, .04, .52, .96],
                Quart: [.83, 0, .17, 1],
                Quint: [.94, 0, .06, 1],
                Sine: [.46, .05, .54, .95],
                Expo: [1, 0, 0, 1],
                Circ: [.86, .14, .14, .86]
            },
            Back: {
                Forward: [.18, .89, .31, 1.21],
                Reverse: [.6, -.27, .73, .04]
            }
        }
    }
}, exports.methods = {
    t: Editor.T,
    save() {
        let e;
        Object.keys(easeMap).some(t => {
            let s = easeMap[t];
            return s.e === this.ease && s.c === this.class && (e = t, !0)
        }), e || (e = this.types[this.ease][this.class]);
        let t = this.eline;
        manager.Clip.mountCurveToKey(t.id, t.path, t.component, t.property, t.frame, e), this.dirty = !1
    },
    updateSide() {
        let e = this.$el.clientHeight - 2,
            t = this.$el.clientWidth - 224 - 2;
        this.side = Math.min(e, t)
    },
    updateControls() {
        let e = this.types[this.ease][this.class];
        if (!e || !e.length) return this.controls = [], void 0;
        let t = .8 * this.scale,
            s = this.side * t,
            i = (this.side - s) / 2,
            a = i,
            r = i,
            n = {
                x: a + e[0] * s,
                y: r + (1 - e[1]) * s,
                lx: a + 0,
                ly: r + s
            },
            u = {
                x: a + e[2] * s,
                y: r + (1 - e[3]) * s,
                lx: a + s,
                ly: r + 0
            };
        this.controls = [n, u]
    },
    drawSquares() {
        let e = .8 * this.scale,
            t = this.side * e,
            s = (this.side - t) / 2,
            i = {
                x: s,
                y: s
            },
            a = t / this.num;
        for (let e = 0; e <= this.num; e++) {
            let s = this.hlines[e];
            s || (s = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
                color: "#2D2D2D"
            }, this.hlines.splice(e, 0, s)), s.x1 = Math.floor(i.x) + .5, s.y1 = Math.floor(i.y + a * e) + .5, s.x2 = Math.floor(i.x + t) + .5, s.y2 = Math.floor(i.y + a * e) + .5
        }
        for (let e = 0; e < this.num - 1; e++) {
            let s = this.vlines[e];
            s || (s = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
                color: "#2D2D2D"
            }, this.vlines.splice(e, 0, s)), s.x1 = Math.floor(i.x + a * (e + 1)) + .5, s.y1 = Math.floor(i.y) + .5, s.x2 = Math.floor(i.x + a * (e + 1)) + .5, s.y2 = Math.floor(i.y + t) + .5
        }
    },
    updateBezier() {
        let e = .8 * this.scale,
            t = this.side * e,
            s = (this.side - t) / 2,
            i = s,
            a = s,
            r = `M ${i} ${a+t}`,
            n = this.controls;
        r = `${r=n&&n.length>0?`${r} C ${n[0].x},${n[0].y} ${n[1].x},${n[1].y}`:`${r} L ${i+t},${a+t}`} ${i+t},${a}`, this.bezier = r
    },
    _onEaseClick(e) {
        this.ease = e;
        let t = Object.keys(this.types[e]);
        this.class = t[0], this.dirty = !0
    },
    _onClassClick(e) {
        this.class = e, this.dirty = !0
    },
    _onCloseClick() {
        if (this.dirty) {
            let e = Editor.Dialog.messageBox({
                type: "question",
                buttons: ["取消", "保存", "放弃修改"],
                title: "是否保存",
                message: "数据已经修改，是否保存？",
                detail: "",
                defaultId: 0,
                cancelId: 0,
                noLink: !0
            });
            if (0 === e) return;
            1 === e && this.save()
        }
        advice.emit("change-eline", null)
    },
    _onSvgMouseWheel(e) {
        e.stopPropagation();
        let t = this.scale + e.wheelDelta / 1e3;
        t > 1 && (t = 1), t < .1 && (t = .1), this.scale = t
    },
    _onControlPointMouseDown(e) {
        let t = .8 * this.scale,
            s = this.side * t,
            i = (this.side - s) / 2,
            a = i,
            r = i,
            n = this.types[this.ease][this.class],
            u = this.controls.indexOf(e);
        this.ease = "Custom", this.class = "Custom";
        let o = this.types.Custom.Custom;
        n.forEach((e, t) => {
            o[t] = e
        }), Editor.UI.startDrag("", event, (e, t, i, n, l) => {
            if (0 === t && 0 === i) return;
            this.dirty = !0;
            let h = this.controls[u];
            return h.x += t, h.x < 0 || h.x > this.side ? (h.x -= t, void 0) : (h.y += i, h.y < 0 || h.y > this.side ? (h.x -= t, h.y -= i, void 0) : (u ? (o[2] = (h.x - a) / s, o[3] = 1 - (h.y - r) / s) : (o[0] = (h.x - a) / s, o[1] = 1 - (h.y - r) / s), this.updateBezier(), void 0))
        }, (e, t, s, i, a) => {})
    }
}, exports.created = function () {
    this.dirty = !1
}, exports.compiled = function () {
    let e = this.eline,
        t = manager.Clip.queryInfo(e.id),
        s = manager.Clip.queryProperty(e.id, e.path, e.component, e.property),
        i = "";
    for (let a = 0; a < s.length; a++) {
        let r = s[a];
        r.frame * t.sample === e.frame && (i = r.curve)
    }
    i ? "string" == typeof i && easeMap[i] ? (this.ease = easeMap[i].e, this.class = easeMap[i].c) : (Array.isArray(i) && (this.types.Custom.Custom = i), this.ease = "Custom", this.class = "Custom") : (this.ease = "Linear", this.class = "Default"), setTimeout(() => {
        this.drawSquares(), this.updateSide(), this.updateControls()
    }, 50)
};