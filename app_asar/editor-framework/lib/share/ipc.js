"use strict";
let IpcBase = {};
IpcBase._checkReplyArgs = function (r) {
    if (0 === r.length) return !0;
    let e = r[0];
    return null === e || e instanceof Error
}, IpcBase._popOptions = function (r) {
    let e = r[r.length - 1];
    return e && "object" == typeof e && e.__ipc__ ? (r.pop(), e) : null
}, IpcBase._popReplyAndTimeout = function (r) {
    let e, t, s = r[r.length - 1];
    if ("number" == typeof s) {
        if (r.length < 2) return null;
        if (t = s, s = r[r.length - 2], "function" != typeof s) return null;
        e = s, r.splice(-2, 2)
    } else {
        if ("function" != typeof s) return null;
        e = s, t = 5e3, r.pop()
    }
    return {
        reply: e,
        timeout: t
    }
}, IpcBase.option = function (r) {
    return r.__ipc__ = !0, r
};
class ErrorTimeout extends Error {
    constructor(r, e, t) {
        super(`ipc timeout. message: ${r}, session: ${e}`), this.code = "ETIMEOUT", this.ipc = r, this.sessionId = e, this.timeout = t
    }
}
IpcBase._wrapError = function (r) {
    if (0 === r.length) return !0;
    let e = r[0];
    if (null === e) return !0;
    if (e instanceof Error) return e = {
        __error__: !0,
        stack: e.stack,
        message: e.message,
        code: e.code,
        errno: e.errno,
        syscall: e.syscall
    }, r[0] = e, !0;
    let t = new Error;
    return r.unshift({
        __error__: !0,
        stack: t.stack,
        message: "Invalid argument for event.reply(), first argument must be null or Error",
        code: "EINVALIDARGS"
    }), !1
}, IpcBase._unwrapError = function (r) {
    let e = r[0];
    return e && e.__error__ ? e : null
};
class ErrorNoPanel extends Error {
    constructor(r, e) {
        super(`ipc failed to send, panel not found. panel: ${r}, message: ${e}`), this.code = "ENOPANEL", this.ipc = e, this.panelID = r
    }
}
class ErrorNoMsg extends Error {
    constructor(r, e) {
        super(`ipc failed to send, message not found. panel: ${r}, message: ${e}`), this.code = "ENOMSG", this.ipc = e, this.panelID = r
    }
}
class ErrorInterrupt extends Error {
    constructor(r) {
        super(`Ipc will not have a callback. message: ${r}`), this.code = "EINTERRUPT", this.ipc = r
    }
}
IpcBase.ErrorTimeout = ErrorTimeout, IpcBase.ErrorNoPanel = ErrorNoPanel, IpcBase.ErrorNoMsg = ErrorNoMsg, IpcBase.ErrorInterrupt = ErrorInterrupt, module.exports = IpcBase;