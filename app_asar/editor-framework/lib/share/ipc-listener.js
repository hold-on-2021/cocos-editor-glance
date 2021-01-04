"use strict";
const Electron = require("electron"),
    Platform = require("./platform");
let _ipc = null;
_ipc = Platform.isMainProcess ? Electron.ipcMain : Electron.ipcRenderer;
class IpcListener {
    constructor() {
        this.listeningIpcs = []
    }
    on(e, i) {
        _ipc.on(e, i), this.listeningIpcs.push([e, i])
    }
    once(e, i) {
        _ipc.once(e, i), this.listeningIpcs.push([e, i])
    }
    clear() {
        for (let e = 0; e < this.listeningIpcs.length; e++) {
            let i = this.listeningIpcs[e];
            _ipc.removeListener(i[0], i[1])
        }
        this.listeningIpcs.length = 0
    }
}
module.exports = IpcListener;