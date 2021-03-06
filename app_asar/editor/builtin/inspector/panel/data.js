"use strict";

function getValue(e, r, n, a) {
    if (e && r && -1 == exType.indexOf(e)) {
        var t = {};
        return Object.keys(r).forEach(e => {
            null == a[e] || Array.isArray(a[e]) ? t[e] = n.value[e] : t[e] = a[e]
        }), t
    }
    return a
}

function merge(e) {
    var r = e[0],
        n = {
            type: r.type,
            value: r.value,
            values: e.map(e => e.value)
        };
    return Object.keys(r).forEach(a => {
        if ("type" != a && "value" != a && "values" != a) {
            e.every(e => r[a] == e[a]) && (n[a] = r[a])
        }
    }), n
}

function mergeComponent(e, r, n) {
    var a = n[r],
        t = {
            type: r,
            value: {}
        };
    return Object.keys(a.properties || {}).forEach(r => {
        if ("_id" == r || "uuid" == r) return t.value[r] = e[0].value[r];
        var n = e.map(e => JSON.parse(JSON.stringify(e.value[r])));
        t.value[r] = merge(n)
    }), t
}

function getComponent(e, r) {
    if (!r) return e;
    var n = r.match(/target\.__comps__\[(\d+)\]/);
    return n ? e.value.__comps__[n[1]] : null
}

function send() {
    exports.onSendBegin && exports.onSendBegin(), clearTimeout(sendTimer), sendTimer = setTimeout(() => {
        for (let e in sendCache) Editor.Ipc.sendToPanel("scene", "scene:set-property", sendCache[e]), delete sendCache[e];
        exports.onSendEnd && exports.onSendEnd()
    }, 200)
}
var infos = [];
exports.add = function (e) {
    if (e) {
        var r = JSON.parse(e);
        infos.push(r)
    }
}, exports.get = function () {
    if (!infos) return null;
    var e = infos[0];
    if (!e || !e.value) return null;
    infos.forEach(e => {
        var r = {};
        e.value.__comps__.forEach(e => {
            var n = e.type;
            r[n] || (r[n] = 0), e.__orderedType = n + r[n], r[n] += 1
        })
    });
    var r = {
        types: {},
        value: {
            uuid: infos.map(e => e.value.uuid).join("+"),
            __type__: e.value.__type__,
            __comps__: []
        }
    };
    infos.every(e => {
        Object.keys(e.types).forEach(n => {
            r.types[n] || (r.types[n] = e.types[n])
        })
    });
    var n = ["__type__", "uuid", "__comps__", "__prefab__"];
    return Object.keys(e.value).forEach(e => {
        if (-1 === n.indexOf(e)) {
            var a = [];
            infos.every(r => {
                var n = r.value[e];
                return a.push(n), !!n
            }) && (r.value[e] = merge(a))
        }
    }), 1 === infos.length && e.value.__prefab__ && (r.value.__prefab__ = e.value.__prefab__), e.value.__comps__.forEach(e => {
        if (infos.every(r => {
                return r.value.__comps__.some(r => r.type == e.type)
            })) {
            var n = infos.map(r => {
                var n;
                return r.value.__comps__.some(r => {
                    r.__orderedType == e.__orderedType && (n = r)
                }), n
            });
            r.value.__comps__.push(mergeComponent(n, e.type, r.types))
        }
    }), r.multi = infos.length > 1, r
}, exports.onSendBegin = null, exports.onSendEnd = null;
var sendCache = {};
exports.change = function (e, r, n, a) {
    if (infos && infos[0]) {
        var t = infos[0].types[n];
        infos.forEach(o => {
            var u = getComponent(o, r),
                s = getValue(n, t ? t.properties : null, u.value[e], a),
                _ = u.value.uuid.value || u.value.uuid;
            let p = {
                id: _,
                path: e,
                type: n,
                value: s,
                isSubProp: !1
            };
            sendCache[`${_}.${e}`] = p
        }), send()
    }
};
var exType = ["cc.Color", "cc.Node"];
exports.clear = function () {
    infos.length = 0
};
var sendTimer = null;