"use strict";
const Chroma = require("chroma-js"),
    addMoveHandles = require("../utils").addMoveHandles;
var Tools = {};
module.exports = Tools, Tools.scaleSlider = function (o, t, e, r) {
    var l = o.group(),
        n = l.line(0, 0, t, 0).stroke({
            width: 1,
            color: e
        }),
        a = l.polygon([
            [t, 5],
            [t, -5],
            [t + 10, -5],
            [t + 10, 5]
        ]).fill({
            color: e
        }).stroke({
            width: 1,
            color: e
        }),
        c = !1;
    return l.style("pointer-events", "bounding-box"), l.resize = function (o) {
        n.plot(0, 0, o, 0), a.plot([
            [o, 5],
            [o, -5],
            [o + 10, -5],
            [o + 10, 5]
        ])
    }, l.on("mouseover", function (o) {
        var t = Chroma(e).brighter().hex();
        n.stroke({
            color: t
        }), a.fill({
            color: t
        }).stroke({
            width: 1,
            color: t
        })
    }), l.on("mouseout", function (o) {
        o.stopPropagation(), c || (n.stroke({
            color: e
        }), a.fill({
            color: e
        }).stroke({
            width: 1,
            color: e
        }))
    }), addMoveHandles(l, {
        start: function (o, t, e) {
            c = !0, n.stroke({
                color: "#ff0"
            }), a.fill({
                color: "#ff0"
            }).stroke({
                width: 1,
                color: "#ff0"
            }), r.start && r.start.call(l, o, t, e)
        },
        update: function (o, t, e) {
            r.update && r.update.call(l, o, t, e)
        },
        end: function (o) {
            c = !1, n.stroke({
                color: e
            }), a.fill({
                color: e
            }).stroke({
                width: 1,
                color: e
            }), r.end && r.end.call(l, o)
        }
    }), l
}, Tools.freemoveTool = function (o, t, e, r) {
    var l = !1,
        n = o.circle(t, t).move(.5 * -t, .5 * -t).fill({
            color: e,
            opacity: .6
        }).stroke({
            width: 2,
            color: e
        });
    return n.on("mouseover", function (o) {
        var t = Chroma(e).brighter().hex();
        this.fill({
            color: t
        }).stroke({
            color: t
        })
    }), n.on("mouseout", function (o) {
        o.stopPropagation(), l || this.fill({
            color: e
        }).stroke({
            color: e
        })
    }), addMoveHandles(n, {
        start: function (o, t, e) {
            l = !0, this.fill({
                color: "#cc5"
            }).stroke({
                color: "#cc5"
            }), r.start && r.start.call(n, o, t, e)
        },
        update: function (o, t, e) {
            r.update && r.update.call(n, o, t, e)
        },
        end: function (o) {
            l = !1, this.fill({
                color: e
            }).stroke({
                color: e
            }), r.end && r.end.call(n, o)
        }
    }), n
}, Tools.arrowTool = function (o, t, e, r) {
    var l = o.group(),
        n = l.line(0, 0, t, 0).stroke({
            width: 1,
            color: e
        }),
        a = l.polygon([
            [t, 5],
            [t, -5],
            [t + 15, 0]
        ]).fill({
            color: e
        }).stroke({
            width: 1,
            color: e
        }),
        c = !1;
    return l.style("pointer-events", "bounding-box"), l.on("mouseover", function (o) {
        var t = Chroma(e).brighter().hex();
        n.stroke({
            color: t
        }), a.fill({
            color: t
        }).stroke({
            width: 1,
            color: t
        })
    }), l.on("mouseout", function (o) {
        o.stopPropagation(), c || (n.stroke({
            color: e
        }), a.fill({
            color: e
        }).stroke({
            width: 1,
            color: e
        }))
    }), addMoveHandles(l, {
        start: function (o, t, e) {
            c = !0, n.stroke({
                color: "#ff0"
            }), a.fill({
                color: "#ff0"
            }).stroke({
                width: 1,
                color: "#ff0"
            }), r.start && r.start.call(l, o, t, e)
        },
        update: function (o, t, e) {
            r.update && r.update.call(l, o, t, e)
        },
        end: function (o) {
            c = !1, n.stroke({
                color: e
            }), a.fill({
                color: e
            }).stroke({
                width: 1,
                color: e
            }), r.end && r.end.call(l, o)
        }
    }), l
}, Tools.positionTool = function (o, t) {
    var e, r, l, n = o.group();
    n.position = cc.v2(0, 0), n.rotation = 0, (e = Tools.arrowTool(o, 80, "#f00", {
        start: function (o, e, r) {
            t.start && t.start.call(n, o, e, r)
        },
        update: function (o, e, r) {
            var l = Editor.Math.deg2rad(n.rotation),
                a = Math.cos(l),
                c = Math.sin(l),
                i = Math.sqrt(o * o + e * e),
                s = Math.atan2(c, a) - Math.atan2(e, o);
            i *= Math.cos(s), t.update && t.update.call(n, a * i, c * i, r)
        },
        end: function (o) {
            t.end && t.end.call(n, o)
        }
    })).translate(20, 0), n.add(e), (r = Tools.arrowTool(o, 80, "#5c5", {
        start: function (o, e, r) {
            t.start && t.start.call(n, o, e, r)
        },
        update: function (o, e, r) {
            var l = Editor.Math.deg2rad(n.rotation + 90),
                a = Math.cos(l),
                c = Math.sin(l),
                i = Math.sqrt(o * o + e * e),
                s = Math.atan2(c, a) - Math.atan2(e, o);
            i *= Math.cos(s), t.update && t.update.call(n, a * i, c * i, r)
        },
        end: function (o) {
            t.end && t.end.call(n, o)
        }
    })).translate(0, -20), r.rotate(-90, 0, 0), n.add(r);
    var a = !1;
    return l = n.rect(20, 20).move(0, -20).fill({
        color: "#05f",
        opacity: .4
    }).stroke({
        width: 1,
        color: "#05f"
    }), l.on("mouseover", function (o) {
        var t = Chroma("#05f").brighter().hex();
        this.fill({
            color: t
        }).stroke({
            color: t
        })
    }), l.on("mouseout", function (o) {
        o.stopPropagation(), a || this.fill({
            color: "#05f"
        }).stroke({
            color: "#05f"
        })
    }), addMoveHandles(l, {
        start: function (o, e, r) {
            a = !0, this.fill({
                color: "#cc5"
            }).stroke({
                color: "#cc5"
            }), t.start && t.start.call(n, o, e, r)
        },
        update: function (o, e, r) {
            t.update && t.update.call(n, o, e, r)
        },
        end: function (o) {
            a = !1, this.fill({
                color: "#05f"
            }).stroke({
                color: "#05f"
            }), t.end && t.end.call(n, o)
        }
    }), n
}, Tools.rotationTool = function (o, t) {
    var e, r, l, n, a, c = o.group(),
        i = !1;
    c.position = new cc.Vec2(0, 0), c.rotation = 0, e = c.path("M50,-10 A50,50, 0 1,0 50,10").fill("none").stroke({
        width: 2,
        color: "#f00"
    }), (n = c.path().fill({
        color: "#f00",
        opacity: .4
    }).stroke({
        width: 1,
        color: "#f00"
    })).hide();
    r = c.line(0, 0, 50, 0).stroke({
        width: 1,
        color: "#f00"
    }), l = c.polygon([
        [50, 5],
        [50, -5],
        [65, 0]
    ]).fill({
        color: "#f00"
    }).stroke({
        width: 1,
        color: "#f00"
    }), a = c.text("0").plain("").fill({
        color: "white"
    }).font({
        anchor: "middle"
    }).hide().translate(30, 0), c.style("pointer-events", "visibleFill"), c.on("mouseover", function (o) {
        var t = Chroma("#f00").brighter().hex();
        e.fill({
            color: t,
            opacity: .1
        }).stroke({
            color: t
        }), r.stroke({
            color: t
        }), l.fill({
            color: t
        }).stroke({
            width: 1,
            color: t
        })
    }), c.on("mouseout", function (o) {
        o.stopPropagation(), i || (e.fill({
            color: "none"
        }).stroke({
            color: "#f00"
        }), r.stroke({
            color: "#f00"
        }), l.fill({
            color: "#f00"
        }).stroke({
            width: 1,
            color: "#f00"
        }))
    });
    var s, u;
    return addMoveHandles(c, {
        start: function (o, d, f) {
            i = !0, e.fill({
                color: "none"
            }).stroke({
                color: "#cc5"
            }), r.stroke({
                color: "#cc5"
            }), l.fill({
                color: "#cc5"
            }).stroke({
                width: 1,
                color: "#cc5"
            }), n.show(), n.plot("M40,0 A40,40, 0 0,1 40,0 L0,0 Z"), a.plain("0°"), a.rotate(0, -30, 0), a.show(), s = o - c.position.x, u = d - c.position.y, t.start && t.start.call(c, o, d, f)
        },
        update: function (o, e, r) {
            var l = new cc.Vec2(s, u),
                i = new cc.Vec2(s + o, u + e),
                d = l.magSqr(),
                f = i.magSqr();
            if (d > 0 && f > 0) {
                var h = l.dot(i),
                    p = l.cross(i),
                    y = Math.sign(p) * Math.acos(h / Math.sqrt(d * f)),
                    T = Math.cos(y),
                    x = Math.sin(y),
                    v = Editor.Math.rad2deg(y);
                a.rotate(v, -30, 0), v = -v, (y = -y) > 0 ? (n.plot("M40,0 A40,40, 0 0,0 " + 40 * T + "," + 40 * x + " L0,0"), a.plain("+" + v.toFixed(0) + "°")) : (n.plot("M40,0 A40,40, 0 0,1 " + 40 * T + "," + 40 * x + " L0,0"), a.plain(v.toFixed(0) + "°"))
            }
            var k = Math.atan2(l.y, l.x) - Math.atan2(i.y, i.x);
            t.update && t.update.call(c, Editor.Math.rad2deg(k), r)
        },
        end: function (o) {
            i = !1, e.stroke({
                color: "#f00"
            }), r.stroke({
                color: "#f00"
            }), l.fill({
                color: "#f00"
            }).stroke({
                width: 1,
                color: "#f00"
            }), n.hide(), a.hide(), t.end && t.end.call(c, o)
        }
    }), c
}, Tools.scaleTool = function (o, t) {
    var e, r, l, n = o.group();
    n.position = new cc.Vec2(0, 0), n.rotation = 0, e = Tools.scaleSlider(o, 100, "#f00", {
        start: function (o, e, r) {
            t.start && t.start.call(n, o, e, r)
        },
        update: function (o, r, l) {
            var a = n.rotation * Math.PI / 180,
                c = Math.cos(a),
                i = Math.sin(a),
                s = Math.sqrt(o * o + r * r),
                u = Math.atan2(i, c) - Math.atan2(r, o);
            s *= Math.cos(u), e.resize(s + 100), t.update && t.update.call(n, s / 100, 0, l)
        },
        end: function (o) {
            e.resize(100), t.end && t.end.call(n, o)
        }
    }), n.add(e), (r = Tools.scaleSlider(o, 100, "#5c5", {
        start: function (o, e, r) {
            t.start && t.start.call(n, o, e, r)
        },
        update: function (o, e, l) {
            var a = (n.rotation + 90) * Math.PI / 180,
                c = Math.cos(a),
                i = Math.sin(a),
                s = Math.sqrt(o * o + e * e),
                u = Math.atan2(i, c) - Math.atan2(e, o);
            s *= Math.cos(u), r.resize(-1 * s + 100), t.update && t.update.call(n, 0, s / 100, l)
        },
        end: function (o) {
            r.resize(100), t.end && t.end.call(n, o)
        }
    })).rotate(-90, 0, 0), n.add(r);
    var a = !1;
    return l = n.rect(20, 20).move(-10, -10).fill({
        color: "#aaa",
        opacity: .4
    }).stroke({
        width: 1,
        color: "#aaa"
    }), l.on("mouseover", function (o) {
        var t = Chroma("#aaa").brighter().hex();
        this.fill({
            color: t
        }).stroke({
            color: t
        })
    }), l.on("mouseout", function (o) {
        o.stopPropagation(), a || this.fill({
            color: "#aaa"
        }).stroke({
            color: "#aaa"
        })
    }), addMoveHandles(l, {
        start: function (o, e, r) {
            a = !0, this.fill({
                color: "#cc5"
            }).stroke({
                color: "#cc5"
            }), t.start && t.start.call(n, o, e, r)
        },
        update: function (o, l, a) {
            var c = Math.sqrt(o * o + l * l),
                i = Math.atan2(-1, 1) - Math.atan2(l, o);
            c *= Math.cos(i), e.resize(c + 100), r.resize(c + 100), t.update && t.update.call(n, 1 * c / 100, -1 * c / 100, a)
        },
        end: function (o) {
            a = !1, this.fill({
                color: "#aaa"
            }).stroke({
                color: "#aaa"
            }), e.resize(100), r.resize(100), t.end && t.end.call(n, o)
        }
    }), n
}, Tools.circleTool = function (o, t, e, r, l, n) {
    "string" != typeof l && (n = l, l = "default");
    let a, c = o.group().style("cursor", l).fill(e || "none").stroke(r || "none"),
        i = c.circle().radius(t / 2);
    r && (a = c.circle().stroke({
        width: 8
    }).fill("none").style("stroke-opacity", 0).radius(t / 2));
    let s = !1;
    return c.style("pointer-events", "bounding-box"), c.on("mouseover", function () {
        if (e) {
            let o = Chroma(e.color).brighter().hex();
            c.fill({
                color: o
            })
        }
        if (r) {
            let o = Chroma(r.color).brighter().hex();
            c.stroke({
                color: o
            })
        }
    }), c.on("mouseout", function (o) {
        o.stopPropagation(), s || (e && c.fill(e), r && c.stroke(r))
    }), addMoveHandles(c, {
        cursor: l
    }, {
        start: function (o, t, l) {
            if (s = !0, e) {
                let o = Chroma(e.color).brighter().brighter().hex();
                c.fill({
                    color: o
                })
            }
            if (r) {
                let o = Chroma(r.color).brighter().brighter().hex();
                c.stroke({
                    color: o
                })
            }
            n.start && n.start(o, t, l)
        },
        update: function (o, t, e) {
            n.update && n.update(o, t, e)
        },
        end: function (o) {
            s = !1, e && c.fill(e), r && c.stroke(r), n.end && n.end(o)
        }
    }), c.radius = function (o) {
        return i.radius(o), a && a.radius(o), this
    }, c.cx = function (o) {
        return this.x(o)
    }, c.cy = function (o) {
        return this.y(o)
    }, c
}, Tools.lineTool = function (o, t, e, r, l, n) {
    var a = o.group().style("cursor", l).stroke({
            color: r
        }),
        c = a.line(t.x, t.y, e.x, e.y).style("stroke-width", 1),
        i = a.line(t.x, t.y, e.x, e.y).style("stroke-width", 8).style("stroke-opacity", 0),
        s = !1;
    return a.on("mouseover", function (o) {
        var t = Chroma(r).brighter().hex();
        a.stroke({
            color: t
        })
    }), a.on("mouseout", function (o) {
        o.stopPropagation(), s || a.stroke({
            color: r
        })
    }), addMoveHandles(a, {
        cursor: l
    }, {
        start: function (o, t, e) {
            s = !0;
            var l = Chroma(r).brighter().brighter().hex();
            a.stroke({
                color: l
            }), n.start && n.start(o, t, e)
        },
        update: function (o, t, e) {
            n.update && n.update(o, t, e)
        },
        end: function (o) {
            s = !1, a.stroke({
                color: r
            }), n.end && n.end(o)
        }
    }), a.plot = function () {
        return c.plot.apply(c, arguments), i.plot.apply(i, arguments), this
    }, a
}, Tools.positionLineTool = function (o, t, e, r, l, n) {
    var a = o.group(),
        c = a.line(t.x, e.y, e.x, e.y).stroke({
            width: 1,
            color: l
        }),
        i = a.line(e.x, t.y, e.x, e.y).stroke({
            width: 1,
            color: l
        }),
        s = a.text("" + r.x).fill(n),
        u = a.text("" + r.y).fill(n);
    let d = function (o) {
        let t = o.offset(0, 0).in(o.sourceAlpha).gaussianBlur(1);
        o.blend(o.source, t)
    };
    return s.filter(d), u.filter(d), a.style("stroke-dasharray", "5 5"), a.style("stroke-opacity", .8), a.plot = function (o, t, e) {
        return c.plot.call(i, o.x, t.y, t.x, t.y), i.plot.call(c, t.x, o.y, t.x, t.y), s.text("" + Math.floor(e.x)).move(o.x + (t.x - o.x) / 2, t.y), u.text("" + Math.floor(e.y)).move(t.x, o.y + (t.y - o.y) / 2), this
    }, a
};
var RectToolType = {
    None: 0,
    LeftBottom: 1,
    LeftTop: 2,
    RightTop: 3,
    RightBottom: 4,
    Left: 5,
    Right: 6,
    Top: 7,
    Bottom: 8,
    Center: 9,
    Anchor: 10
};
Tools.rectTool = function (o, t) {
    function e(o) {
        return {
            start: function (e, r, l) {
                g.type = o, t.start && t.start.call(g, e, r, l, o)
            },
            update: function (e, r, l) {
                t.update && t.update.call(g, e, r, l, o)
            },
            end: function (e) {
                g.type = RectToolType.None, t.end && t.end.call(g, e, o)
            }
        }
    }

    function r(o, t) {
        return Tools.lineTool(M, cc.v2(0, 0), cc.v2(0, 0), "#8c8c8c", t, e(o))
    }

    function l(o, t) {
        return Tools.circleTool(M, m, {
            color: "#0e6dde"
        }, null, t, e(o)).style("cursor", t)
    }
    var n, a, c, i, s, u, d, f, h, p, y, T, x, v, k, g = o.group(),
        M = g.group();
    g.type = RectToolType.None, (h = g.polygon("0,0,0,0,0,0").fill("none").stroke("none")).style("pointer-events", "fill"), h.ignoreMouseMove = !0, addMoveHandles(h, {
        ignoreWhenHoverOther: !0
    }, e(RectToolType.Center));
    k = Tools.circleTool(g, 20, {
        color: "#eee",
        opacity: .3
    }, {
        color: "#eee",
        opacity: .5,
        width: 2
    }, e(RectToolType.Center)), s = r(RectToolType.Left, "col-resize"), u = r(RectToolType.Top, "row-resize"), d = r(RectToolType.Right, "col-resize"), f = r(RectToolType.Bottom, "row-resize");
    var m = 8;
    n = l(RectToolType.LeftBottom, "nwse-resize"), a = l(RectToolType.LeftTop, "nesw-resize"), c = l(RectToolType.RightTop, "nwse-resize"), i = l(RectToolType.RightBottom, "nesw-resize"), y = Tools.positionLineTool(g, cc.v2(0, 0), cc.v2(0, 0), cc.v2(0, 0), "#8c8c8c", "#eee");
    p = Tools.circleTool(g, 10, null, {
        width: 3,
        color: "#0e6dde"
    }, e(RectToolType.Anchor)).style("cursor", "pointer"), T = g.group(), x = T.text("0").fill("#eee"), v = T.text("0").fill("#eee");
    let w = function (o) {
        let t = o.offset(0, 0).in(o.sourceAlpha).gaussianBlur(1);
        o.blend(o.source, t)
    };
    return x.filter(w), v.filter(w), g.setBounds = function (o) {
        Math.abs(o[2].x - o[0].x) < 10 && Math.abs(o[2].y - o[0].y) < 10 ? (M.hide(), p.hide(), k.show(), k.center(o[0].x + (o[2].x - o[0].x) / 2, o[0].y + (o[2].y - o[0].y) / 2)) : (M.show(), k.hide(), h.plot([
            [o[0].x, o[0].y],
            [o[1].x, o[1].y],
            [o[2].x, o[2].y],
            [o[3].x, o[3].y]
        ]), s.plot(o[0].x, o[0].y, o[1].x, o[1].y), u.plot(o[1].x, o[1].y, o[2].x, o[2].y), d.plot(o[2].x, o[2].y, o[3].x, o[3].y), f.plot(o[3].x, o[3].y, o[0].x, o[0].y), n.center(o[0].x, o[0].y), a.center(o[1].x, o[1].y), c.center(o[2].x, o[2].y), i.center(o[3].x, o[3].y), o.anchor ? (p.show(), p.center(o.anchor.x, o.anchor.y)) : p.hide()), !o.origin || g.type !== RectToolType.Center && g.type !== RectToolType.Anchor ? y.hide() : (y.show(), y.plot(o.origin, o.anchor, o.localPosition)), o.localSize && g.type >= RectToolType.LeftBottom && g.type <= RectToolType.Bottom ? (T.show(), x.text("" + Math.floor(o.localSize.width)), v.text("" + Math.floor(o.localSize.height)), x.center(o[1].x + (o[2].x - o[1].x) / 2, o[1].y + (o[2].y - o[1].y) / 2 + 5), v.center(o[2].x + (o[3].x - o[2].x) / 2 + 15, o[2].y + (o[3].y - o[2].y) / 2)) : T.hide()
    }, g
}, Tools.rectTool.Type = RectToolType, Tools.icon = function (o, t, e, r) {
    var l = o.image(t).move(.5 * -e, .5 * -r).size(e, r);
    return l.on("mouseover", function (o) {
        o.stopPropagation()
    }), l
}, Tools.dashLength = function (o) {
    let t = _Scene.view.scale;
    return t < 1 && (t = 1), "number" == typeof o ? o * t : Array.isArray(o) ? o.map(o => o * t) : 3 * t
};