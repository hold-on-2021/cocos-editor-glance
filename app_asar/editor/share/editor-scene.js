"use strict";
let Scene = {
    callSceneScript() {
        let e = Array.prototype.shift.call(arguments),
            t = Array.prototype.shift.call(arguments);
        Array.prototype.unshift.apply(arguments, ["scene", `${e}:${t}`]), Editor.Ipc.sendToPanel.apply(Editor.sendToPanel, arguments)
    }
};
module.exports = Scene;