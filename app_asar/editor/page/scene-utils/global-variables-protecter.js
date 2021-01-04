function Protecter(o) {
    this.info = "", this.onIntroduced = this.onModified = this.onDeleted = null, this.dontRestoreIntroduce = this.dontRestoreModify = this.dontRestoreDelete = !1;
    var t = DefaultIgnoreGlobalVars;
    if (o) {
        o.ignoreNames && (t = t.concat(o.ignoreNames));
        var e = o.callbacks;
        e && ("function" == typeof e ? this.onIntroduced = this.onModified = this.onDeleted = e : (this.onIntroduced = e.introduced, this.onModified = e.modified, this.onDeleted = e.deleted));
        var i = o.dontRestore;
        i && ("object" != typeof i ? this.dontRestoreIntroduce = this.dontRestoreModify = this.dontRestoreDelete = i : (this.dontRestoreIntroduce = i.introduced, this.dontRestoreModify = i.modified, this.dontRestoreDelete = i.deleted)), this.info = o.info
    }
    this.ignoreNames = t.reduce(function (o, t) {
        return o[t] = !0, o
    }, {}), this._snapshot = {}
}
var isPlainEmptyObj = Editor.require("unpack://engine/cocos2d/core/platform/utils").isPlainEmptyObj_DEV,
    DefaultIgnoreGlobalVars = ["currentImport", "webkitIndexedDB", "webkitStorageInfo"],
    TypesToCheckModification = ["object", "function", "boolean"],
    globals = window;
Protecter.prototype = {
    record: function () {
        this._snapshot = {};
        for (var o in globals) globals.hasOwnProperty(o) && !this.ignoreNames[o] && (this._snapshot[o] = globals[o]);
        return this
    },
    isRecorded: function () {
        return !isPlainEmptyObj(this._snapshot)
    },
    restore: function () {
        console.assert(this.isRecorded(), "Should recorded");
        var o;
        for (o in globals)
            if (globals.hasOwnProperty(o) && !this.ignoreNames[o]) {
                var t = globals[o];
                if (o in this._snapshot) {
                    var e = this._snapshot[o];
                    if (t === e) continue;
                    if (void 0 !== e) {
                        if (TypesToCheckModification.includes(typeof e)) {
                            if (this.onModified) {
                                var i = Editor.Utils.toString(e) || '""',
                                    s = Editor.Utils.toString(globals[o]) || '""';
                                this.onModified(`Modified global variable while ${this.info}: ${o}\nBefore: ${i}\nAfter: ${s}`)
                            }
                            this.dontRestoreModify || (globals[o] = e)
                        }
                        continue
                    }
                }
                if (this.onIntroduced && this.onIntroduced(`Introduced global variable while ${this.info}: ${o}`), !this.dontRestoreIntroduce) {
                    var n = !1;
                    try {
                        n = delete globals[o]
                    } catch (o) {}
                    n || (this._snapshot[o] = globals[o] = void 0)
                }
            } for (o in this._snapshot) o in globals || this.ignoreNames[o] || (this.onDeleted && this.onDeleted(`Deleted global variable while ${this.info}: ${o}`), this.dontRestoreDelete || (globals[o] = this._snapshot[o]))
    }
}, module.exports = Protecter;