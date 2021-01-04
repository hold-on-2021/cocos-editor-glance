"use strict";
let EditorR = require("./editor");
Object.assign(EditorR, require("../share/platform")), Object.assign(EditorR, require("./console")), EditorR.Easing = require("../share/easing"), EditorR.IpcListener = require("../share/ipc-listener"), EditorR.JS = require("../share/js-utils"), EditorR.KeyCode = require("../share/keycode"), EditorR.Math = require("../share/math"), EditorR.Selection = require("../share/selection"), EditorR.Undo = require("../share/undo"), EditorR.Utils = require("../share/utils"), EditorR.Audio = require("./audio"), EditorR.Dialog = require("./dialog"), EditorR.Ipc = require("./ipc"), EditorR.MainMenu = require("./main-menu"), EditorR.Menu = require("./menu"), EditorR.Package = require("./package"), EditorR.Panel = require("./panel"), EditorR.Profile = require("electron-profile"), EditorR.Protocol = require("./protocol"), EditorR.Window = require("./window"), EditorR.i18n = require("./i18n"), EditorR.T = EditorR.i18n.t, EditorR.UI = require("./ui"), EditorR.polymerPanel = EditorR.UI.PolymerUtils.registerPanel, EditorR.polymerElement = EditorR.UI.PolymerUtils.registerElement, window.unused = (() => {}), window.deprecate = function (r, e, i) {
    i = void 0 !== i && i;
    let o = !1;
    return function () {
        return i ? EditorR.trace("warn", e) : o || (EditorR.warn(e), o = !0), r.apply(this, arguments)
    }
}, window.Editor = EditorR, require("./deprecated"), module.exports = EditorR;