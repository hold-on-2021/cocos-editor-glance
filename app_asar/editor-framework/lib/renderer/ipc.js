"use strict";

function _newSession(e, n, r, o) {
    let i, s = `${n}:${_nextSessionId++}`;
    return -1 !== o && (i = setTimeout(() => {
        let n = _id2sessionInfo[s];
        n && (delete _id2sessionInfo[s], n.callback(new ErrorTimeout(e, s, o)))
    }, o)), _id2sessionInfo[s] = {
        sessionId: s,
        timeoutId: i,
        callback: r
    }, s
}

function _closeSession(e) {
    let n = _id2sessionInfo[e];
    return n && (delete _id2sessionInfo[n.sessionId], n.timeoutId && clearTimeout(n.timeoutId)), n
}

function _main2rendererOpts(e, n, ...r) {
    if (0 === r.length) return ipcRenderer.emit(n, e);
    let o = _popOptions(r);
    if (o && o.waitForReply) {
        let r = e.sender,
            i = n;
        e.reply = function (...e) {
            !1 === _wrapError(e) && Console.warn(`Invalid argument for event.reply of "${i}": the first argument must be an instance of Error or null`);
            return e = ["editor:ipc-reply", ...e, Ipc.option({
                sessionId: o.sessionId
            })], r.send.apply(r, e)
        }
    }
    return r = [n, e, ...r], ipcRenderer.emit.apply(ipcRenderer, r)
}
let Ipc = {};
module.exports = Ipc;
const Electron = require("electron"),
    IpcBase = require("../share/ipc"),
    Console = require("./console"),
    Panel = require("./panel"),
    ipcRenderer = Electron.ipcRenderer,
    winID = Electron.remote.getCurrentWindow().id;
let _nextSessionId = 1e3,
    _id2sessionInfo = {},
    _debug = !1,
    _checkReplyArgs = IpcBase._checkReplyArgs,
    _popOptions = IpcBase._popOptions,
    _popReplyAndTimeout = IpcBase._popReplyAndTimeout,
    _wrapError = IpcBase._wrapError,
    _unwrapError = IpcBase._unwrapError,
    ErrorTimeout = IpcBase.ErrorTimeout,
    ErrorInterrupt = IpcBase.ErrorInterrupt;
Ipc.option = IpcBase.option, Ipc.sendToAll = function (e, ...n) {
    if ("string" != typeof e) return Console.error("Call to `sendToAll` failed. The message must be a string."), void 0;
    ipcRenderer.send.apply(ipcRenderer, ["editor:ipc-renderer2all", e, ...n])
}, Ipc.sendToWins = function (e, ...n) {
    if ("string" != typeof e) return Console.error("Call to `sendToWins` failed. The message must be a string."), void 0;
    ipcRenderer.send.apply(ipcRenderer, ["editor:ipc-renderer2wins", e, ...n])
}, Ipc.sendToMainSync = function (e, ...n) {
    return "string" != typeof e ? (Console.error("Call to `sendToMainSync` failed. The message must be a string."), void 0) : ipcRenderer.sendSync.apply(ipcRenderer, [e, ...n])
}, Ipc.sendToMain = function (e, ...n) {
    if ("string" != typeof e) return Console.error("Call to `sendToMain` failed. The message must be a string."), void 0;
    let r, o = _popReplyAndTimeout(n);
    return o ? (r = _newSession(e, `${winID}@renderer`, o.reply, o.timeout), n = ["editor:ipc-renderer2main", e, ...n, Ipc.option({
        sessionId: r,
        waitForReply: !0,
        timeout: o.timeout
    })]) : n = [e, ...n], ipcRenderer.send.apply(ipcRenderer, n), r
}, Ipc.sendToPackage = function (e, n, ...r) {
    return Ipc.sendToMain.apply(null, [`${e}:${n}`, ...r])
}, Ipc.sendToPanel = function (e, n, ...r) {
    if ("string" != typeof n) return Console.error("Call to `sendToPanel` failed. The sent message must be a string."), void 0;
    let o, i = _popReplyAndTimeout(r);
    return i ? (o = _newSession(n, `${e}@renderer`, i.reply, i.timeout), r = ["editor:ipc-renderer2panel", e, n, ...r, Ipc.option({
        sessionId: o,
        waitForReply: !0,
        timeout: i.timeout
    })]) : r = ["editor:ipc-renderer2panel", e, n, ...r], ipcRenderer.send.apply(ipcRenderer, r), o
}, Ipc.sendToMainWin = function (e, ...n) {
    if ("string" != typeof e) return Console.error("Call to `sendToMainWin` failed. The message must be a string."), void 0;
    ipcRenderer.send.apply(ipcRenderer, ["editor:ipc-renderer2mainwin", e, ...n])
}, Ipc.cancelRequest = function (e) {
    _closeSession(e)
}, Object.defineProperty(Ipc, "debug", {
    enumerable: !0,
    get: () => _debug,
    set(e) {
        _debug = e
    }
}), Ipc._closeAllSessions = function () {
    let e = Object.keys(_id2sessionInfo);
    for (let n = 0; n < e.length; ++n) {
        let r = e[n],
            o = _closeSession(r);
        o.callback && o.callback(new ErrorInterrupt(r))
    }
}, ipcRenderer.on("editor:ipc-main2panel", (e, n, r, ...o) => {
    let i = _popOptions(o);
    if (i && i.waitForReply) {
        let n = e.sender,
            o = r;
        e.reply = function (...e) {
            _debug && !_checkReplyArgs(e) && Console.warn(`Invalid argument for event.reply of "${o}": the first argument must be an instance of Error or null`);
            return e = ["editor:ipc-reply", ...e, Ipc.option({
                sessionId: i.sessionId
            })], n.send.apply(n, e)
        }
    }
    o = [n, r, e, ...o], Panel._dispatch.apply(Panel, o)
}), ipcRenderer.on("editor:ipc-main2renderer", (e, n, ...r) => {
    !1 === _main2rendererOpts.apply(null, [e, n, ...r]) && Console.failed(`Message "${n}" from main to renderer failed, no response was received.`)
}), ipcRenderer.on("editor:ipc-reply", (e, ...n) => {
    let r = _popOptions(n),
        o = _unwrapError(n);
    if (o) {
        let e = o.stack.split("\n");
        e.shift();
        let r = new Error(o.message);
        r.stack += "\n\t--------------------\n" + e.join("\n"), r.code = o.code, r.code = o.code, r.errno = o.errno, r.syscall = o.syscall, n[0] = r
    }
    let i = _closeSession(r.sessionId);
    i && i.callback.apply(null, n)
});