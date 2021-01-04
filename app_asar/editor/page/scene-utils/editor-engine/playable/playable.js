var JS = cc.js,
    EventTarget = Editor.require("unpack://engine/cocos2d/core/event/event-target"),
    CCObject = Editor.require("unpack://engine/cocos2d/core/platform/CCObject"),
    Playable = function () {
        function i() {
            EventTarget.call(this), this._isPlaying = !1, this._isPaused = !1, this._isUpdating = !1, this._stepOnce = !1
        }
        JS.extend(i, CCObject);
        var t = i.prototype;
        JS.mixin(t, EventTarget.prototype), JS.get(t, "isPlaying", function () {
            return this._isPlaying
        }, !0), JS.get(t, "isUpdating", function () {
            return this._isUpdating
        }, !0), JS.get(t, "isPaused", function () {
            return this._isPaused
        }, !0);
        var s = function () {};
        return t.onPlay = s, t.onPause = s, t.onResume = s, t.onStop = s, t.onError = s, t.play = function () {
            this._isPlaying ? this._isPaused ? (this._isPaused = !1, this._isUpdating = !0, this.onResume(), this.emit("resume")) : this.onError("already-playing") : (this._isPlaying = !0, this._isUpdating = !this._isPaused, this.onPlay(), this.emit("play"))
        }, t.stop = function () {
            this._isPlaying && (this._isPlaying = !1, this._isPaused = !1, this._isUpdating = !1, this.emit("stop"), this.onStop())
        }, t.pause = function () {
            this._isPaused = !0, this._isUpdating = !1, this.emit("pause"), this.onPause()
        }, t.step = function () {
            this.pause(), this._stepOnce = !0, this._isPlaying || this.play()
        }, i
    }();
cc.Playable = Playable, module.exports = Playable;