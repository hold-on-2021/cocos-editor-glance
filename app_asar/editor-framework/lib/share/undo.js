"use strict";
const Electron = require("electron"),
    EventEmitter = require("events"),
    Platform = require("./platform");
let Ipc, Console;
Platform.isMainProcess ? (Ipc = require("../main/ipc"), Console = require("../main/console")) : (Ipc = require("../renderer/ipc"), Console = require("../renderer/console"));
let _global;
class Command {
    constructor(o) {
        this.info = o
    }
    undo() {
        Console.warn('Please implement the "undo" function in your command')
    }
    redo() {
        Console.warn('Please implement the "redo" function in your command')
    }
    dirty() {
        return !0
    }
}
class CommandGroup {
    constructor() {
        this._commands = [], this.desc = ""
    }
    undo() {
        for (let o = this._commands.length - 1; o >= 0; --o) this._commands[o].undo()
    }
    redo() {
        for (let o = 0; o < this._commands.length; ++o) this._commands[o].redo()
    }
    dirty() {
        for (let o = 0; o < this._commands.length; ++o)
            if (this._commands[o].dirty()) return !0;
        return !1
    }
    add(o) {
        this._commands.push(o)
    }
    clear() {
        this._commands = []
    }
    canCommit() {
        return this._commands.length
    }
}
class UndoList extends EventEmitter {
    constructor(o) {
        super(), this._silent = !1, this._type = o, this._curGroup = new CommandGroup, this._groups = [], this._position = -1, this._savePosition = -1, this._id2cmdDef = {}
    }
    register(o, e) {
        this._id2cmdDef[o] = e
    }
    reset() {
        this.clear(), this._id2cmdDef = {}
    }
    undo() {
        if (this._curGroup.canCommit()) return this._curGroup.undo(), this._changed("undo-cache"), this._curGroup.clear(), void 0;
        if (this._position < 0) return;
        this._groups[this._position].undo(), this._position--, this._changed("undo")
    }
    redo() {
        if (this._position >= this._groups.length - 1) return;
        this._position++;
        this._groups[this._position].redo(), this._changed("redo")
    }
    add(o, e) {
        let s = this._id2cmdDef[o];
        if (!s) return Console.error(`Cannot find undo command ${o}, please register it first`), void 0;
        this._clearRedo();
        let i = new s(e);
        this._curGroup.add(i), this._changed("add-command")
    }
    commit() {
        this._curGroup.canCommit() && (this._groups.push(this._curGroup), this._position++, this._changed("commit")), this._curGroup = new CommandGroup
    }
    cancel() {
        this._curGroup.clear()
    }
    collapseTo(o) {
        if (o > this._position || o < 0) return Console.warn(`Cannot collapse undos to ${o}`), void 0;
        if (o === this._position) return;
        let e = this._groups[o];
        for (let s = o + 1; s < this._groups.length; ++s) {
            this._groups[s]._commands.forEach(o => {
                e.add(o)
            })
        }
        this._groups = this._groups.slice(0, o + 1), this._position = o, this._savePosition > this._position && (this._savePosition = this._position), this._changed("collapse")
    }
    save() {
        this._savePosition = this._position, this._changed("save")
    }
    clear() {
        this._curGroup = new CommandGroup, this._groups = [], this._position = -1, this._savePosition = -1, this._changed("clear")
    }
    dirty() {
        if (this._savePosition !== this._position) {
            let o = Math.min(this._position, this._savePosition),
                e = Math.max(this._position, this._savePosition);
            for (let s = o + 1; s <= e; s++)
                if (this._groups[s].dirty()) return !0
        }
        return !1
    }
    setCurrentDescription(o) {
        this._curGroup.desc = o
    }
    _clearRedo() {
        this._position + 1 !== this._groups.length && (this._groups = this._groups.slice(0, this._position + 1), this._curGroup.clear(), this._savePosition > this._position && (this._savePosition = this._position), this._changed("clear-redo"))
    }
    _changed(o) {
        if (!this._silent) return "local" === this._type ? (this.emit("changed", o), void 0) : (Ipc.sendToAll("undo:changed", o), void 0)
    }
}
Platform.isMainProcess && (_global = new UndoList("global"));
let Undo = {
    undo() {
        if (Platform.isRendererProcess) return Ipc.sendToMain("undo:perform-undo"), void 0;
        _global.undo()
    },
    redo() {
        if (Platform.isRendererProcess) return Ipc.sendToMain("undo:perform-redo"), void 0;
        _global.redo()
    },
    add(o, e) {
        if (Platform.isRendererProcess) return Ipc.sendToMain("undo:add", o, e), void 0;
        _global.add(o, e)
    },
    commit() {
        if (Platform.isRendererProcess) return Ipc.sendToMain("undo:commit"), void 0;
        _global.commit()
    },
    cancel() {
        if (Platform.isRendererProcess) return Ipc.sendToMain("undo:cancel"), void 0;
        _global.cancel()
    },
    collapseTo(o) {
        if (Platform.isRendererProcess) return Ipc.sendToMain("undo:collapse", o), void 0;
        _global.collapseTo(o)
    },
    save() {
        if (Platform.isRendererProcess) return Ipc.sendToMain("undo:save"), void 0;
        _global.save()
    },
    clear() {
        if (Platform.isRendererProcess) return Ipc.sendToMain("undo:clear"), void 0;
        _global.clear()
    },
    reset: () => Platform.isRendererProcess ? (Ipc.sendToMain("undo:reset"), void 0) : _global.reset(),
    dirty: () => Platform.isRendererProcess ? Ipc.sendToMainSync("undo:dirty") : _global.dirty(),
    setCurrentDescription: o => Platform.isRendererProcess ? Ipc.sendToMainSync("undo:set-desc", o) : _global.setCurrentDescription(o),
    register(o, e) {
        _global.register(o, e)
    },
    local: () => new UndoList("local"),
    Command: Command,
    _global: _global
};
if (module.exports = Undo, Platform.isMainProcess) {
    const o = Electron.ipcMain;
    o.on("undo:perform-undo", () => {
        Undo.undo()
    }), o.on("undo:perform-redo", () => {
        Undo.redo()
    }), o.on("undo:add", (o, e, s) => {
        Undo.add(e, s)
    }), o.on("undo:commit", () => {
        Undo.commit()
    }), o.on("undo:cancel", () => {
        Undo.cancel()
    }), o.on("undo:collapse", o => {
        Undo.collapseTo(o)
    }), o.on("undo:save", () => {
        Undo.save()
    }), o.on("undo:clear", () => {
        Undo.clear()
    }), o.on("undo:dirty", o => {
        o.returnValue = Undo.dirty()
    }), o.on("undo:set-desc", (o, e) => {
        Undo.setCurrentDescription(e)
    }), o.on("undo:reset", () => {
        Undo.reset()
    })
}