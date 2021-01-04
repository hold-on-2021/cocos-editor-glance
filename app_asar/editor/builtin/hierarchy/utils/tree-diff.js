"use strict";

function compareItemProps(e, r, i) {
    var t = e.cmds;
    r.name !== i.name && t.push({
        op: "set-property",
        property: "name",
        id: r.id,
        value: i.name
    }), r.state !== i.state && t.push({
        op: "set-property",
        property: "state",
        id: r.id,
        value: i.state
    }), r.isActive !== i.isActive && t.push({
        op: "set-property",
        property: "isActive",
        id: r.id,
        value: i.isActive
    });
    var p, o, d = r.children,
        n = i.children;
    if (d)
        if (n) compareChildren(e, d, n, r.id);
        else
            for (p = 0, o = d.length; p < o; p++) {
                var s = d[p];
                t.push({
                    op: "remove",
                    id: s.id
                })
            } else if (n)
                for (p = 0, o = n.length; p < o; p++) t.push({
                    op: "append",
                    parentId: r.id,
                    node: n[p]
                })
}

function compareChildren(e, r, i, t) {
    for (var p = e.cmds, o = r.length, d = i.length, n = 0, s = 0; n < o || s < d;)
        if (n >= o) p.push({
            op: "append",
            parentId: t,
            node: i[s]
        }), s++;
        else {
            var a = r[n];
            if (s >= d) p.push({
                op: "remove",
                id: a.id
            }), n++;
            else {
                var c = i[s];
                if (a.id === c.id) compareItemProps(e, a, c), s++, n++;
                else {
                    var u = s + 1 < d && a.id === i[s + 1].id,
                        m = n + 1 < o && c.id === r[n + 1].id;
                    if (u) {
                        m ? (p.push({
                            op: "move",
                            id: a.id,
                            index: s + 1,
                            parentId: t
                        }), compareItemProps(e, a, i[s + 1]), compareItemProps(e, r[n + 1], c), s += 2, n += 2) : (p.push({
                            op: "insert",
                            index: s,
                            parentId: t,
                            node: c
                        }), s++);
                        continue
                    }
                    if (m) {
                        p.push({
                            op: "remove",
                            id: a.id
                        }), n++;
                        continue
                    }
                    p.push({
                        op: "remove",
                        id: a.id
                    }), p.push({
                        op: "insert",
                        index: s,
                        parentId: t,
                        node: i[s]
                    }), n++, s++
                }
            }
        }
}

function sortOperationsById(e) {
    for (var r = e.cmds, i = [], t = 0, p = r.length; t < p; t++) {
        var o = r[t];
        switch (o.op) {
            case "remove":
                i.push(o), r[t] = null
        }
    }
    var d = r.filter(function (e) {
        return e
    });
    e.cmds = i.concat(d)
}

function treeDiff(e, r) {
    var i = {
        cmds: []
    };
    return compareChildren(i, e = e || [], r, null), sortOperationsById(i), {
        cmds: i.cmds,
        get equal() {
            return 0 === this.cmds.length
        }
    }
}
module.exports = treeDiff;