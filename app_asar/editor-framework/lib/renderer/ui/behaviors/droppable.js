"use strict";
const DomUtils = require("../utils/dom-utils"),
    DragDrop = require("../utils/drag-drop");
let Droppable = {
    get droppable() {
        return this.getAttribute("droppable")
    },
    set droppable(t) {
        this.setAttribute("droppable", t)
    },
    get multi() {
        return null !== this.getAttribute("multi")
    },
    set multi(t) {
        t ? this.setAttribute("multi", "") : this.removeAttribute("multi")
    },
    get canDrop() {
        return this._canDrop
    },
    _initDroppable(t) {
        this._dragenterCnt = 0, this._canDrop = !1, t.addEventListener("dragenter", t => {
            if (++this._dragenterCnt, 1 === this._dragenterCnt) {
                this._canDrop = !1;
                let e = [];
                null !== this.droppable && (e = this.droppable.split(","));
                let r = DragDrop.type(t.dataTransfer),
                    a = !1;
                for (let t = 0; t < e.length; ++t)
                    if (r === e[t]) {
                        a = !0;
                        break
                    } if (!a) return this._canDrop = !1, void 0;
                let i = "file" === r ? t.dataTransfer.items.length : DragDrop.getLength();
                if (!this.multi && i > 1) return this._canDrop = !1, void 0;
                t.stopPropagation(), this._canDrop = !0, this.setAttribute("drag-hovering", ""), DomUtils.fire(this, "drop-area-enter", {
                    bubbles: !0,
                    detail: {
                        target: t.target,
                        dataTransfer: t.dataTransfer,
                        clientX: t.clientX,
                        clientY: t.clientY,
                        offsetX: t.offsetX,
                        offsetY: t.offsetY,
                        dragType: r,
                        dragItems: DragDrop.items(t.dataTransfer),
                        dragOptions: DragDrop.options()
                    }
                })
            }
        }), t.addEventListener("dragleave", t => {
            if (--this._dragenterCnt, 0 === this._dragenterCnt) {
                if (!this._canDrop) return;
                t.stopPropagation(), this.removeAttribute("drag-hovering"), DomUtils.fire(this, "drop-area-leave", {
                    bubbles: !0,
                    detail: {
                        target: t.target,
                        dataTransfer: t.dataTransfer
                    }
                })
            }
        }), t.addEventListener("drop", t => {
            this._dragenterCnt = 0, this._canDrop && (t.preventDefault(), t.stopPropagation(), this.removeAttribute("drag-hovering"), DomUtils.fire(this, "drop-area-accept", {
                bubbles: !0,
                detail: {
                    target: t.target,
                    dataTransfer: t.dataTransfer,
                    clientX: t.clientX,
                    clientY: t.clientY,
                    offsetX: t.offsetX,
                    offsetY: t.offsetY,
                    dragType: DragDrop.type(t.dataTransfer),
                    dragItems: DragDrop.items(t.dataTransfer),
                    dragOptions: DragDrop.options()
                }
            }))
        }), t.addEventListener("dragover", t => {
            this._canDrop && (t.preventDefault(), t.stopPropagation(), DomUtils.fire(this, "drop-area-move", {
                bubbles: !0,
                detail: {
                    target: t.target,
                    clientX: t.clientX,
                    clientY: t.clientY,
                    offsetX: t.offsetX,
                    offsetY: t.offsetY,
                    dataTransfer: t.dataTransfer,
                    dragType: DragDrop.type(t.dataTransfer),
                    dragItems: DragDrop.items(t.dataTransfer),
                    dragOptions: DragDrop.options()
                }
            }))
        })
    }
};
module.exports = Droppable;