"use strict";

function _adjustWindow() {
    let e = DockUtils.root;
    if (!e) return;
    let t = Electron.remote.getCurrentWindow(),
        o = t.getSize(),
        i = o[0],
        r = o[1],
        l = window.innerWidth - e.clientWidth,
        n = window.innerHeight - e.clientHeight,
        a = e._computedMinWidth + l,
        c = e._computedMinHeight + n;
    a += l = i - window.innerWidth, c += n = r - window.innerHeight, t.setMinimumSize(a, c), i < a && (i = a), r < c && (r = c), t.setSize(i, r)
}

function _getPanels(e) {
    let t = [];
    for (let o = 0; o < e.children.length; ++o) {
        let i = e.children[o].id;
        t.push(i)
    }
    return t
}

function _getDocks(e) {
    let t = [];
    for (let o = 0; o < e.children.length; ++o) {
        let i = e.children[o];
        if (!i._dockable) continue;
        let r = i.getBoundingClientRect(),
            l = {
                width: r.width,
                height: r.height
            };
        if (DockUtils.isPanel(i)) l.type = "panel", l.active = i.activeIndex, l.children = _getPanels(i);
        else {
            let e = i.row ? "dock-h" : "dock-v";
            l.type = e, l.children = _getDocks(i)
        }
        t.push(l)
    }
    return t
}

function _createDocks(e, t, o) {
    if (t) {
        for (let i = 0; i < t.length; ++i) {
            let r, l = t[i];
            if ("dock-v" === l.type ? (r = document.createElement("ui-dock")).row = !1 : "dock-h" === l.type ? (r = document.createElement("ui-dock")).row = !0 : "panel" === l.type && (r = document.createElement("ui-dock-panel")), r) {
                if (void 0 !== l.width && (r._preferredWidth = l.width), void 0 !== l.height && (r._preferredHeight = l.height), "panel" === l.type)
                    for (let e = 0; e < l.children.length; ++e) o.push({
                        dockEL: r,
                        panelID: l.children[e],
                        active: e === l.active
                    });
                else _createDocks(r, l.children, o);
                e.appendChild(r)
            } else Editor.warn(`Failed to create layout from ${l}`)
        }
        e._initResizers()
    }
}

function _updateMask(e, t, o, i, r) {
    _dockMask || ((_dockMask = document.createElement("div")).classList.add("dock-mask"), _dockMask.oncontextmenu = function () {
        return !1
    }), "dock" === e ? (_dockMask.classList.remove("tab"), _dockMask.classList.add("dock")) : "tab" === e && (_dockMask.classList.remove("dock"), _dockMask.classList.add("tab")), _dockMask.style.left = `${t}px`, _dockMask.style.top = `${o}px`, _dockMask.style.width = `${i}px`, _dockMask.style.height = `${r}px`, _dockMask.parentElement || document.body.appendChild(_dockMask)
}

function _resetDragDrop() {
    _dockMask && _dockMask.remove(), _resultDock = null, _dragenterCnt = 0
}
let DockUtils = {};
module.exports = DockUtils;
const Electron = require("electron"),
    Async = require("async"),
    EditorR = require("../../editor"),
    Console = require("../../console"),
    Ipc = require("../../ipc"),
    Panel = require("../../panel"),
    Window = require("../../window"),
    DomUtils = require("./dom-utils"),
    DragDrop = require("./drag-drop"),
    _resizerSpace = 3,
    _tabbarSpace = 22,
    _panelSpace = 4;
let _resultDock = null,
    _potentialDocks = [],
    _dockMask = null,
    _dragenterCnt = 0,
    _layouting = !1;
DockUtils.root = null, Object.defineProperty(DockUtils, "resizerSpace", {
    enumerable: !0,
    get: () => 3
}), Object.defineProperty(DockUtils, "tabbarSpace", {
    enumerable: !0,
    get: () => 22
}), Object.defineProperty(DockUtils, "panelSpace", {
    enumerable: !0,
    get: () => 4
}), DockUtils.dragstart = function (e, t) {
    let o = t.frameEL,
        i = o.id,
        r = o.parentNode,
        l = r.getBoundingClientRect(),
        n = {
            panelID: i,
            panelRectWidth: l.width,
            panelRectHeight: l.height,
            panelPreferredWidth: r._preferredWidth,
            panelPreferredHeight: r._preferredHeight
        };
    DragDrop.start(e.dataTransfer, {
        effect: "move",
        type: "tab",
        items: n
    })
}, DockUtils.dragend = function () {
    _resetDragDrop(), DragDrop.end()
}, DockUtils.dragoverTab = function (e) {
    Window.focus(), _potentialDocks = [], _resultDock = null, _dockMask && _dockMask.remove();
    let t = e.getBoundingClientRect();
    _updateMask("tab", t.left, t.top, t.width, t.height + 2)
}, DockUtils.dragleaveTab = function () {
    _dockMask && _dockMask.remove()
}, DockUtils.dropTab = function (e, t) {
    let o = DragDrop.items()[0].panelID,
        i = Panel.find(o);
    if (i) {
        let o = i.parentNode,
            r = e.panelEL,
            l = o !== r,
            n = o.$tabs.findTab(i);
        l && o.closeNoCollapse(n);
        let a = r.insert(n, i, t);
        r.select(a), l && o._collapse(), _resetDragDrop(), DockUtils.finalize(), DockUtils.saveLayout(), i.focus(), Panel.isDirty(i.id) && r.outOfDate(i)
    } else Panel.close(o, (i, r) => {
        if (i) return Console.error(`Failed to close panel ${o}: ${i.stack}`), void 0;
        r && Panel.newFrame(o, (o, i) => {
            if (o) return Console.error(o.stack), void 0;
            window.requestAnimationFrame(() => {
                let o = e.panelEL,
                    r = document.createElement("ui-dock-tab");
                r.name = i.name;
                let l = o.insert(r, i, t);
                if (o.select(l), Panel.dock(i), _resetDragDrop(), DockUtils.finalize(), DockUtils.saveLayout(), i.focus(), Panel.isDirty(i.id) && o.outOfDate(i), "polymer" === i._info.ui) return i["panel-ready"] && i["panel-ready"](), void 0;
                i.load(e => {
                    if (e) return Console.error(e.stack), void 0;
                    i.ready && i.ready()
                })
            })
        })
    })
}, DockUtils.dragoverDock = function (e) {
    "tab" === DragDrop.type() && _potentialDocks.push(e)
}, DockUtils.dragenterMainDock = function () {
    ++_dragenterCnt
}, DockUtils.dragleaveMainDock = function () {
    0 === --_dragenterCnt && _dockMask && _dockMask.remove()
}, DockUtils.dragoverMainDock = function (e, t) {
    Window.focus();
    let o = null;
    _resultDock = null;
    for (let i = 0; i < _potentialDocks.length; ++i) {
        let r = _potentialDocks[i],
            l = r.getBoundingClientRect(),
            n = l.left + l.width / 2,
            a = l.top + l.height / 2,
            c = null,
            s = Math.abs(e - l.left),
            d = Math.abs(e - l.right),
            u = Math.abs(t - l.top),
            k = Math.abs(t - l.bottom),
            p = 100,
            f = -1;
        s < p && (p = s, f = Math.abs(t - a), c = "left"), d < p && (p = d, f = Math.abs(t - a), c = "right"), u < p && (p = u, f = Math.abs(e - n), c = "top"), k < p && (p = k, f = Math.abs(e - n), c = "bottom"), null !== c && (null === o || f < o) && (o = f, _resultDock = {
            target: r,
            position: c
        })
    }
    if (_resultDock) {
        let e = DragDrop.items()[0],
            t = _resultDock.target.getBoundingClientRect(),
            o = null,
            i = e.panelPreferredWidth,
            r = e.panelPreferredHeight,
            l = i;
        l >= Math.floor(t.width) && (l = Math.floor(.5 * t.width));
        let n = r;
        n >= Math.floor(t.height) && (n = Math.floor(.5 * t.height)), "top" === _resultDock.position ? o = {
            left: t.left,
            top: t.top,
            width: t.width,
            height: n
        } : "bottom" === _resultDock.position ? o = {
            left: t.left,
            top: t.bottom - n,
            width: t.width,
            height: n
        } : "left" === _resultDock.position ? o = {
            left: t.left,
            top: t.top,
            width: l,
            height: t.height
        } : "right" === _resultDock.position && (o = {
            left: t.right - l,
            top: t.top,
            width: l,
            height: t.height
        }), _updateMask("dock", o.left, o.top, o.width, o.height)
    } else _dockMask && _dockMask.remove();
    _potentialDocks = []
}, DockUtils.dropMainDock = function (e) {
    if (null === _resultDock) return;
    let t = e.panelID,
        o = e.panelRectWidth,
        i = e.panelRectHeight,
        r = e.panelPreferredWidth,
        l = e.panelPreferredHeight,
        n = _resultDock.target,
        a = _resultDock.position,
        c = Panel.find(t);
    if (!c) return Panel.close(t, (e, o) => {
        if (e) return Console.error(`Failed to close panel ${t}: ${e.stack}`), void 0;
        o && Panel.newFrame(t, (e, t) => {
            if (e) return Console.error(e.stack), void 0;
            window.requestAnimationFrame(() => {
                let e = document.createElement("ui-dock-panel");
                if (e.add(t), e.select(0), e._preferredWidth = r, e._preferredHeight = l, n.addDock(a, e), Panel.dock(t), _resetDragDrop(), DockUtils.finalize(), DockUtils.saveLayout(), t.focus(), Panel.isDirty(t.id) && e.outOfDate(t), "polymer" === t._info.ui) return t["panel-ready"] && t["panel-ready"](), void 0;
                t.load(e => {
                    if (e) return Console.error(e.stack), void 0;
                    t.ready && t.ready()
                })
            })
        })
    }), void 0;
    let s = c.parentNode;
    if (n === s && 1 === n.tabCount) return;
    let d = s.parentNode,
        u = d === n.parentNode,
        k = s.$tabs.findTab(c);
    s.closeNoCollapse(k);
    let p = document.createElement("ui-dock-panel");
    p.add(c), p.select(0), p._preferredWidth = r, p._preferredHeight = l, n.addDock(a, p, u);
    let f = 0 === s.children.length;
    if (s._collapse(), f) {
        let e = !1;
        if (p.parentNode !== d) {
            let t = p,
                r = p.parentNode;
            for (; r && r._dockable;) {
                if (r === d) {
                    e = !0;
                    break
                }
                t = r, r = r.parentNode
            }
            if (e) {
                let e = 0;
                d.row ? (e = t.offsetWidth + 3 + o, t._preferredWidth = e) : (e = t.offsetHeight + 3 + i, t._preferredHeight = e), t.style.flex = `0 0 ${e}px`
            }
        }
    }
    _resetDragDrop(), DockUtils.finalize(), DockUtils.saveLayout(), c.focus(), Panel.isDirty(c.id) && p.outOfDate(c)
}, DockUtils.collapse = function () {
    DockUtils.root && DockUtils.root._collapseRecursively()
}, DockUtils.finalize = function () {
    DockUtils.root && (DockUtils.root._finalizeMinMaxRecursively(), DockUtils.root._finalizePreferredSizeRecursively(), DockUtils.root._finalizeStyleRecursively(), DockUtils.root._reflowRecursively(), DockUtils.root._updatePreferredSizeRecursively(), DockUtils.root._notifyResize(), _adjustWindow())
}, DockUtils.resize = function () {
    DockUtils.root && (DockUtils.root._reflowRecursively(), DockUtils.root._notifyResize(), window.requestAnimationFrame(() => {
        DockUtils.root._updatePreferredSizeRecursively()
    }))
}, DockUtils.reset = function (e, t, o) {
    _layouting = !0, Async.waterfall([e => {
        Panel._unloadAll(e)
    }, o => {
        if (DomUtils.clear(e), !t || !t.type || 0 !== t.type.indexOf("dock")) return o(null, []), void 0;
        "dock-v" === t.type ? e.row = !1 : "dock-h" === t.type && (e.row = !0);
        let i = [];
        _createDocks(e, t.children, i), o(null, i)
    }, (e, t) => {
        let o = [],
            i = Editor.remote.Window.windows;
        Async.each(e, (e, t) => {
            i.some(t => -1 !== t._panels.indexOf(e.panelID)) && Panel.close(e.panelID), Panel.newFrame(e.panelID, (i, r) => {
                if (i) return Console.error(i.stack), t(), void 0;
                let l = e.dockEL;
                l.add(r), e.active && l.select(r), Panel.dock(r), o.push(r), t()
            })
        }, e => {
            _layouting = !1, DockUtils.collapse(), DockUtils.finalize(), DockUtils.saveLayout(), t(e, o)
        })
    }, (e, t) => {
        let o = EditorR.argv && EditorR.argv.panelID && EditorR.argv.panelArgv;
        e.forEach(e => {
            if ("polymer" === e._info.ui) return e["panel-ready"] && e["panel-ready"](), o && EditorR.argv.panelID === e.id && e.run && e.run(EditorR.argv.panelArgv), void 0;
            e.load(t => {
                if (t) return Console.error(t.stack), void 0;
                e.ready && e.ready(), o && EditorR.argv.panelID === e.id && e.run && e.run(EditorR.argv.panelArgv)
            })
        }), t()
    }], e => {
        o && o(e)
    })
}, DockUtils.saveLayout = function () {
    _layouting || window.requestAnimationFrame(() => {
        Ipc.sendToMain("editor:window-save-layout", DockUtils.dumpLayout())
    })
}, DockUtils.dumpLayout = function () {
    let e = DockUtils.root;
    if (!e) return null;
    if (e._dockable) {
        return {
            type: e.row ? "dock-h" : "dock-v",
            children: _getDocks(e)
        }
    } {
        let t = e.getAttribute("id"),
            o = e.getBoundingClientRect();
        return {
            type: "standalone",
            panel: t,
            width: o.width,
            height: o.height
        }
    }
}, DockUtils.isPanel = function (e) {
    return "UI-DOCK-PANEL" === e.tagName
}, DockUtils.isPanelFrame = function (e) {
    return "UI-PANEL-FRAME" === e.tagName
}, DockUtils.isResizer = function (e) {
    return "UI-DOCK-RESIZER" === e.tagName
}, DockUtils.isTab = function (e) {
    return "UI-DOCK-TAB" === e.tagName
}, DockUtils.isTabBar = function (e) {
    return "UI-DOCK-TABS" === e.tagName
};
const ipcRenderer = Electron.ipcRenderer;
ipcRenderer.on("editor:reset-layout", (e, t) => {
    Ipc._closeAllSessions(), DockUtils.reset(DockUtils.root, t, e => {
        e && Console.error(`Failed to reset layout: ${e.stack}`)
    })
}), window.addEventListener("resize", () => {
    DockUtils.resize()
});