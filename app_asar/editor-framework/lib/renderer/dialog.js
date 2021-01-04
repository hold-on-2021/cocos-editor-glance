"use strict";
const Electron = require("electron"),
    ipcRenderer = Electron.ipcRenderer;
let Dialog = {
    openFile: (...e) => ipcRenderer.sendSync.apply(ipcRenderer, ["dialog:open-file", ...e]),
    saveFile: (...e) => ipcRenderer.sendSync.apply(ipcRenderer, ["dialog:save-file", ...e]),
    messageBox: (...e) => ipcRenderer.sendSync.apply(ipcRenderer, ["dialog:message-box", ...e])
};
module.exports = Dialog;