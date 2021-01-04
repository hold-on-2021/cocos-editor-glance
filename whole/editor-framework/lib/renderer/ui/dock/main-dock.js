"use strict";
const Console = require("../../console"),
    DockUtils = require("../utils/dock-utils"),
    FocusMgr = require("../utils/focus-mgr"),
    DragDrop = require("../utils/drag-drop"),
    Dock = require("./dock"),
    Ipc = require("../../ipc");
class MainDock extends Dock {
    static get tagName() {
        return "UI-MAIN-DOCK"
    }
    createdCallback() {
        super.createdCallback(), this.noCollapse = !0, this._initEvents(), DockUtils.root = this, this._loadLayout(t => {
            t && Console.error(`Failed to load layout: ${t.stack}`), FocusMgr._setFocusPanelFrame(null)
        })
    }
    _finalizeStyle() {
        super._finalizeStyle(), this.style.minWidth = "", this.style.minHeight = ""
    }
    _initEvents() {
        this.addEventListener("dragenter", t => {
            "tab" === DragDrop.type(t.dataTransfer) && (t.stopPropagation(), DockUtils.dragenterMainDock())
        }), this.addEventListener("dragleave", t => {
            "tab" === DragDrop.type(t.dataTransfer) && (t.stopPropagation(), DockUtils.dragleaveMainDock())
        }), this.addEventListener("dragover", t => {
            "tab" === DragDrop.type(t.dataTransfer) && (t.preventDefault(), t.stopPropagation(), DragDrop.updateDropEffect(t.dataTransfer, "move"), DockUtils.dragoverMainDock(t.x, t.y))
        }), this.addEventListener("drop", t => {
            if ("tab" !== DragDrop.type(t.dataTransfer)) return;
            t.preventDefault(), t.stopPropagation();
            let e = DragDrop.items(t.dataTransfer)[0];
            DockUtils.dropMainDock(e)
        })
    }
    _loadLayout(t) {
        Ipc.sendToMain("editor:window-query-layout", (e, r) => {
            if (e) return t && t(e), void 0;
            DockUtils.reset(this, r, e => {
                t && t(e)
            })
        })
    }
}
module.exports = MainDock;