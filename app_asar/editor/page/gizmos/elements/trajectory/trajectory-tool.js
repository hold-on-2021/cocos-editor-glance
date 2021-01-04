"use strict";

function SegmentTool(e, t, o) {
    function n(e) {
        return e.fill({
            color: "#fff"
        }).stroke({
            color: "#000"
        })
    }

    function l(e) {
        return {
            start: function () {
                s.select(), x = t.clone(), o.start && o.start(s, e)
            },
            update: function (n, l) {
                if (0 === n && 0 === l) return;
                let r = v2(n, l);
                t[e] = x[e].add(r), "pos" === e && (t.inControl = x.inControl.add(r), t.outControl = x.outControl.add(r)), s.plot(), o.update && o.update(s, e, n, l)
            },
            end: function () {
                o.end && o.end(s, e)
            }
        }
    }

    function r(e) {
        e.stopPropagation(), !t.keyframe && o.onDelete && o.onDelete(s)
    }
    let s = e.group();
    s.segment = t, s.curveTools = [];
    let c = s.group(),
        i = t.pos,
        d = t.inControl,
        u = t.outControl,
        a = c.line(i.x, i.y, d.x, d.y).stroke({
            color: "#eee",
            width: 1
        }),
        f = c.line(i.x, i.y, u.x, u.y).stroke({
            color: "#eee",
            width: 1
        }),
        y = s.rect(5, 5).style("cursor", "move");
    y.center(i.x, i.y);
    let p = n(c.circle(8, 8)).style("cursor", "move");
    p.center(d.x, d.y);
    let m = n(c.circle(8, 8)).style("cursor", "move");
    m.center(u.x, u.y), s.select = function () {
        o.beforeSelected && o.beforeSelected(s), n(y), t.keyframe || c.show()
    }, s.unselect = function () {
        y.fill({
            color: "#4793e2"
        }), t.keyframe || c.hide()
    };
    let h = s.show;
    s.show = function () {
        let e = t.pos;
        y.width(10), y.height(10), y.center(e.x, e.y), y.stroke({
            color: "#000"
        }), t.keyframe || h.call(s)
    };
    let g = s.hide;
    s.hide = function () {
        let e = t.pos;
        y.width(5), y.height(5), y.center(e.x, e.y), y.stroke("none"), t.keyframe || g.call(s)
    }, c.hide(), s.unselect(), s.hide(), s.plot = function () {
        let e = t.pos,
            o = t.inControl,
            n = t.outControl;
        y.center(e.x, e.y), a.plot(e.x, e.y, o.x, o.y), p.center(o.x, o.y), f.plot(e.x, e.y, n.x, n.y), m.center(n.x, n.y)
    };
    let x = null;
    addMoveHandles(y, l("pos")), addMoveHandles(p, l("inControl")), addMoveHandles(m, l("outControl")), s.node.tabIndex = -1;
    let k = Mousetrap(s.node);
    return k.bind("command+backspace", r), k.bind("del", r), s
}

function CurveTool(e, t, o) {
    function n() {
        let e = _Scene.view.scale;
        return e < 1 && (e = 1), 3 * e
    }
    let l = e.group();
    l.segmentTools = [];
    let r = l.path(t).fill("none").stroke({
            color: "#4793e2",
            width: 5
        }),
        s = l.path(t).fill("none").stroke({
            color: "#4793e2",
            width: 1
        }).style("stroke-dasharray", n());
    return l.select = function () {
        o.beforeSelected && o.beforeSelected(l), l.segmentTools.forEach(function (e) {
            e.show()
        }), r.style("stroke-opacity", 1).style("cursor", "copy"), l._selected = !0
    }, l.unselect = function () {
        l.segmentTools.forEach(function (e) {
            e.unselect(), e.hide()
        }), r.style("stroke-opacity", 0).style("cursor", "default"), l._selected = !1
    }, l.on("mouseover", function () {
        l._selected || r.style("stroke-opacity", .5)
    }), l.on("mouseout", function () {
        l._selected || r.style("stroke-opacity", 0)
    }), l.on("mousedown", function (e) {
        e.stopPropagation(), l._selected ? o.addSegment && o.addSegment(e.offsetX, e.offsetY) : l.select()
    }), l.plot = function () {
        let e = l.segmentTools;
        if (!e[e.length - 1].segment.keyframe) return;
        let t = "";
        for (let o = 0, n = e.length; o < n; o++) {
            let n = e[o].segment,
                l = n.pos;
            if (0 === o) {
                t = `M ${l.x} ${l.y}`;
                continue
            }
            let r = e[o - 1].segment.outControl,
                s = n.inControl;
            t += ` C ${r.x} ${r.y} ${s.x} ${s.y} ${l.x} ${l.y}`
        }
        r.plot(t), s.plot(t).style("stroke-dasharray", n())
    }, l.unselect(), l
}
let v2 = cc.v2,
    addMoveHandles = Editor.GizmosUtils.addMoveHandles;
module.exports = {
    SegmentTool: SegmentTool,
    CurveTool: CurveTool
};