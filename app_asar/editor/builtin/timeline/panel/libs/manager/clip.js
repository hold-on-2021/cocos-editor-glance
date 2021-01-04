"use strict";
let queryPaths = function (e) {
        let t = (e = e || {}).curveData || {};
        return Object.keys(t.paths || {})
    },
    queryInfo = function (e) {
        return e = e || {}, {
            name: e.name || "",
            sample: e.sample || 0,
            duration: e.duration || 0,
            speed: e.speed || 1,
            wrapMode: e.wrapMode || 0
        }
    },
    queryCurve = function (e, t) {
        let r, n, a = (e = e || {}).curveData || {};
        if (t = t.replace(/^\/[^\/]+\/?/, "")) {
            a = (a.paths || {})[t] || {}
        }
        return r = a.comps || {}, n = a.props || {}, {
            comps: r,
            props: n
        }
    },
    queryProperty = function (e, t, r, n) {
        let a = queryCurve(e = e || {}, t);
        return a = r ? a.comps[r] || {} : a.props, a[n] || []
    },
    queryKey = function (e, t, r, n, a) {
        let u = (e = e || {}).sample,
            l = queryProperty(e, t, r, n);
        for (let e = 0; e < l.length; e++) {
            let t = l[e];
            if (Math.round(t.frame * u) === a) return t
        }
        return null
    },
    queryEvents = function (e) {
        return e = e || {}, e.events || []
    },
    addCurve = function (e, t, r) {
        if (!e) return null;
        t = t.replace(/\/[^\/]+(\/)?/, "");
        let n = e.curveData;
        if (t) {
            let e = n.paths = n.paths || {};
            n = e[t] = e[t] || {}
        }
        return n.comps = r.comps, n.props = r.props, _queryDuration(e), r
    },
    deleteCurve = function (e, t) {
        if (!e) return null;
        if (t = t.replace(/\/[^\/]+(\/)?/, ""), t && (!e.curveData.paths || !e.curveData.paths[t])) return null;
        if (0 === Editor.Dialog.messageBox({
                type: "question",
                buttons: [Editor.T("timeline.manager.delete_path_button_cancel"), Editor.T("timeline.manager.delete_path_button_confirm")],
                title: "",
                message: `${Editor.T("timeline.manager.delete_path_title")}\n/\${root}/${t}`,
                detail: Editor.T("timeline.manager.delete_path_info"),
                defaultId: 0,
                cancelId: 0,
                noLink: !0
            })) return null;
        let r = queryCurve(e, t);
        return t ? delete e.curveData.paths[t] : (delete e.curveData.props, delete e.curveData.comps), _queryDuration(e), r
    },
    addProperty = function (e, t, r, n) {
        if (!e) return null;
        let a = e.curveData;
        if (t = t.replace(/^\/[^\/]+\/?/, ""), t) {
            let e = a.paths = a.paths || {};
            e[t] = e[t] || {}, a = e[t]
        }
        let u;
        if (r) {
            let e = a.comps = a.comps || {},
                t = e[r] = e[r] || {};
            u = t[n] = t[n] || []
        } else {
            let e = a.props = a.props || {};
            u = e[n] = e[n] || []
        }
        return _queryDuration(e), u
    },
    deleteProperty = function (e, t, r, n) {
        if (!e) return null;
        let a = e.curveData;
        if (t = t.replace(/^\/[^\/]+\/?/, ""), t) {
            if (!a.paths || !a.paths[t]) return null;
            a = a.paths[t]
        }
        let u;
        if (r) {
            if (!a.comps || !a.comps[r] || !a.comps[r][n]) return null;
            u = a.comps[r][n]
        } else {
            if (!a.props || !a.props[n]) return null;
            u = a.props[n]
        }
        if (u && u.length > 0) {
            if (0 === Editor.Dialog.messageBox({
                    type: "question",
                    buttons: [Editor.T("timeline.manager.delete_property_button_cancel"), Editor.T("timeline.manager.delete_property_button_confirm")],
                    title: "",
                    message: Editor.T("timeline.manager.delete_property_title"),
                    detail: Editor.T("timeline.manager.delete_property_info"),
                    defaultId: 0,
                    cancelId: 0,
                    noLink: !0
                })) return null
        }
        return r ? (delete a.comps[r][n], 0 === Object.keys(a.comps[r]).length && (delete a.comps[r], 0 === Object.keys(a.comps).length && delete a.comps)) : (delete a.props[n], 0 === Object.keys(a.props).length && delete a.props), 0 === Object.keys(a).length && (t ? (delete e.curveData.paths[t], 0 === Object.keys(e.curveData.paths).length && delete e.curveData.paths) : (delete e.curveData.props, delete e.curveData.comps)), _queryDuration(e), u
    },
    addKey = function (e, t, r, n, a, u) {
        if (!e) return null;
        let l = addProperty(e, t, r, n),
            o = e.sample;
        if (l.some(e => Math.floor(e.frame * o) === a)) return Editor.Dialog.messageBox({
            type: "question",
            buttons: [Editor.T("timeline.manager.add_key_button_confirm")],
            title: "",
            message: Editor.T("timeline.manager.add_key_button_exists"),
            detail: Editor.T("timeline.manager.add_key_info"),
            defaultId: 0,
            cancelId: 0,
            noLink: !0
        }), null;
        let p = {
            frame: a / o,
            value: u
        };
        return l.push(p), l.sort((e, t) => e.frame - t.frame), _queryDuration(e), p
    },
    deleteKey = function (e, t, r, n, a) {
        if (!e) return null;
        let u = e.sample,
            l = queryProperty(e, t, r, n);
        for (let t = 0; t < l.length; t++) {
            let r = l[t];
            if (Math.round(r.frame * u) === a) return l.splice(t, 1), _queryDuration(e), r
        }
        return null
    },
    addEvent = function (e, t, r, n) {
        if (!e) return null;
        let a = {
            frame: t / e.sample,
            func: r || "",
            params: n || []
        };
        return e.events = e.events || [], e.events.push(a), e.events.sort((e, t) => e.frame - t.frame), _queryDuration(e), a
    },
    deleteEvent = function (e, t) {
        if (!e) return null;
        let r = queryEvents(e);
        for (let e = 0; e < r.length; e++) {
            let n = r[e];
            if (JSON.stringify(n) === JSON.stringify(t)) return r.splice(e, 1), n
        }
        return _queryDuration(e), null
    },
    mountCurveToKey = function (e, t, r, n, a, u) {
        if (!e) return !1;
        let l = queryKey(e, t, r, n, a);
        return !!l && (l.curve = u, !0)
    },
    changeSample = function (e, t) {
        if (!e) return;
        let r = queryPaths(e);
        r.splice(0, 0, ""), r.forEach(r => {
            let n = queryCurve(e, r);
            eachCurve(n, (r, n, a) => {
                a.forEach(r => {
                    let n = Math.round(r.frame * e.sample);
                    r.frame = n / t
                })
            })
        });
        queryEvents(e).forEach(r => {
            let n = Math.round(r.frame * e.sample);
            r.frame = n / t
        }), e.sample = t, _queryDuration(e)
    },
    changeSpeed = function (e, t) {
        e && (e.speed = t)
    },
    changeMode = function (e, t) {
        e && (e.wrapMode = t)
    },
    eachCurve = function (e, t) {
        e && (e.props && Object.keys(e.props).forEach(r => {
            let n = e.props[r];
            t(null, r, n)
        }), e.comps && Object.keys(e.comps).forEach(r => {
            let n = e.comps[r];
            n && Object.keys(n).forEach(e => {
                let a = n[e];
                t(r, e, a)
            })
        }))
    },
    _queryDuration = function (e) {
        let t = queryPaths(e);
        e._duration = 0, t.push(""), t.forEach(t => {
            let r = queryCurve(e, t);
            eachCurve(r, (t, r, n) => {
                if (!n.length) return;
                let a = n[n.length - 1];
                e._duration = "cc.Sprite" === t && "spriteFrame" === r ? Math.max((Math.round(a.frame * e.sample) + 1) / e.sample, e._duration) : Math.max(a.frame, e._duration)
            })
        });
        let r = queryEvents(e),
            n = r[r.length - 1];
        n && (e._duration = Math.max(n.frame, e._duration))
    };
module.exports = {
    queryPaths: queryPaths,
    queryInfo: queryInfo,
    queryCurve: queryCurve,
    queryProperty: queryProperty,
    queryKey: queryKey,
    queryEvents: queryEvents,
    addCurve: addCurve,
    deleteCurve: deleteCurve,
    addProperty: addProperty,
    deleteProperty: deleteProperty,
    addKey: addKey,
    deleteKey: deleteKey,
    addEvent: addEvent,
    deleteEvent: deleteEvent,
    mountCurveToKey: mountCurveToKey,
    changeSample: changeSample,
    changeSpeed: changeSpeed,
    changeMode: changeMode
};