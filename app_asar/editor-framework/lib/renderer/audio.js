"use strict";
const EventEmitter = require("events");
let _audioContext, _volumeNode, _sessionIds = {},
    _curSessionID = 1e3;
class AudioControl extends EventEmitter {
    constructor() {
        super(), this._currentAudioSource = null, this._buffer = null, this._played = 0, this._started = !1, this._state = "stopped", this.loop = !1, this.playbackRate = 1, this.volume = 1
    }
    state() {
        return this._state
    }
    play(t) {
        t = t || 0, this._started && this._reset(this._buffer), this._timestamp = _audioContext.currentTime, this._played = t, this._started = !0, this._currentAudioSource.start(0, t), this._state = "playing", this.emit("started")
    }
    stop() {
        if ("paused" === this._state) return this._state = "stopped", this._played = 0, this.emit("ended"), void 0;
        if (!this._currentAudioSource) return;
        if (!this._started) return;
        let t = this._currentAudioSource;
        t.stop(0), t.onended = null, this._currentAudioSource = null, this._state = "stopped", this._played = 0, this.emit("ended")
    }
    pause() {
        if (!this._currentAudioSource) return;
        if (!this._started) return;
        this._played = this.time();
        let t = this._currentAudioSource;
        t.stop(0), t.onended = null, this._currentAudioSource = null, this._state = "paused", this.emit("paused")
    }
    resume() {
        this.play(this._played)
    }
    length() {
        return this._buffer.length
    }
    buffer() {
        return this._buffer
    }
    time() {
        return "paused" === this._state ? this._played : "playing" === this._state ? (_audioContext.currentTime - this._timestamp) * this.playbackRate + this._played : 0
    }
    mute(t) {
        _volumeNode.gain.value = t ? -1 : this.volume
    }
    setVolume(t) {
        this.volume = t, _volumeNode.gain.value = t
    }
    setLoop(t) {
        this.loop = t, this._currentAudioSource && (this._currentAudioSource.loop = t)
    }
    setPlaybackRate(t) {
        this.playbackRate = t, this._currentAudioSource && (this._currentAudioSource.playbackRate.value = t, "paused" !== this._state && (this.pause(), this.play()))
    }
    _reset(t) {
        this.stop();
        let e = _audioContext.createBufferSource();
        e.buffer = t, e.loop = this.loop, e.playbackRate.value = this.playbackRate, e.connect(_volumeNode), e.onended = (() => {
            this.stop()
        }), this._currentAudioSource = e, this._buffer = t, this._started = !1, this._startAt = 0, this._state = "stopped"
    }
}
let EditorAudio = {
    context: () => (_audioContext || (_audioContext = new window.AudioContext, (_volumeNode = _audioContext.createGain()).gain.value = 1, _volumeNode.connect(_audioContext.destination)), _audioContext),
    load(t, e) {
        let s = new window.XMLHttpRequest;
        return s.open("GET", t, !0), s.responseType = "arraybuffer", s.onreadystatechange = (i => {
            if (4 === s.readyState) {
                if (-1 === [0, 200, 304].indexOf(s.status)) throw delete _sessionIds[s._session], new Error(`While loading from url ${t} server responded with a status of ${s.status}`);
                _sessionIds[s._session] && (delete _sessionIds[s._session], function (t, s) {
                    t.decodeAudioData(s, t => {
                        let s = new AudioControl;
                        s._reset(t), e && e(null, s)
                    }, t => {
                        e && e(t.err)
                    })
                }(this.context(), i.target.response))
            }
        }), s._session = _curSessionID, _sessionIds[_curSessionID] = s, ++_curSessionID, s.send(), s._session
    },
    cancel(t) {
        let e = _sessionIds[t];
        e && (delete _sessionIds[t], e.onreadystatechange = null, e.abort())
    }
};
module.exports = EditorAudio;