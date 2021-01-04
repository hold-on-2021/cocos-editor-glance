"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    advice = require("../libs/advice");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/tools.html"), "utf-8"), exports.props = ["frame", "sample", "record", "paused"], exports.watch = {}, exports.data = function () {
    return {}
}, exports.methods = {
    t: (e, ...t) => Editor.T(`timeline.tools.${e}`, ...t),
    queryNum(e, t) {
        void 0 === e && (e = 0), void 0 === t && (t = 60);
        let i = e / t | 0;
        i < 10 && (i = `0${i}`);
        let r = e % t | 0;
        return r < 10 && (r = `0${r}`), `${i}-${r}`
    },
    _onRecordClick() {
        Editor.Ipc.sendToPanel("scene", "scene:change-animation-record", !this.record)
    },
    _onJumpFirstFrameClick() {
        advice.emit("select-frame", 0)
    },
    _onJumpPrevFrameClick() {
        let e = this.frame - 1;
        advice.emit("select-frame", e >= 0 ? e : 0)
    },
    _onJumpNextFrameClick() {
        advice.emit("select-frame", this.frame + 1)
    },
    _onPausedClick() {
        let e = !this.paused;
        advice.emit("change-paused", e)
    },
    _onAddClipClick() {},
    _onAddEventClick() {
        advice.emit("add-empty-event")
    }
}, exports.created = function () {};