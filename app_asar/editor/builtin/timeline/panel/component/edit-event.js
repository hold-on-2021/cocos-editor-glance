"use strict";
const fs = require("fire-fs"),
    ps = require("path"),
    advice = require("../libs/advice"),
    manager = require("../libs/manager");
exports.template = fs.readFileSync(ps.join(__dirname, "../template/edit-event.html"), "utf-8"), exports.props = ["event", "clip"], exports.watch = {}, exports.data = function () {
    return {
        dirty: !1,
        keys: []
    }
}, exports.methods = {
    t: Editor.T,
    updateKeys() {
        let e = manager.Clip.queryInfo(this.clip.id),
            t = manager.Clip.queryEvents(this.clip.id);
        for (; this.keys.length;) this.keys.pop();
        t.forEach(t => {
            (t.frame * e.sample | 0) === this.event && this.keys.push({
                name: t.func,
                params: t.params.map(e => {
                    let t = e + "",
                        i = parseInt(e),
                        s = !!e;
                    return isNaN(i) && (i = 0), {
                        type: typeof e,
                        s: t,
                        n: i,
                        b: s
                    }
                })
            })
        })
    },
    save() {
        let e = manager.Clip.queryEvents(this.clip.id),
            t = manager.Clip.queryInfo(this.clip.id);
        for (let i = 0; i < e.length; i++) {
            let s = e[i];
            Math.round(s.frame * t.sample) === this.event && (manager.Clip.deleteEvent(this.clip.id, s), i--)
        }
        this.keys.forEach(e => {
            let t = e.params.map(e => "string" === e.type ? e.s : "number" === e.type ? e.n : e.b);
            manager.Clip.addEvent(this.clip.id, this.event, e.name, t)
        }), this.dirty = !1
    },
    _onAddFuncClick() {
        this.dirty = !0, this.keys.push({
            name: "",
            params: []
        })
    },
    _onCloseClick() {
        if (this.dirty) {
            let e = Editor.Dialog.messageBox({
                type: "question",
                buttons: ["取消", "保存", "放弃修改"],
                title: "是否保存",
                message: "数据已经修改，是否保存？",
                detail: "",
                defaultId: 0,
                cancelId: 0,
                noLink: !0
            });
            if (0 === e) return;
            1 === e && this.save()
        }
        advice.emit("change-event", -1)
    },
    _onFuncNameChanged(e) {
        this.dirty = !0, e.name = event.target.value
    },
    _onFuncAddParamClick(e) {
        this.dirty = !0, e.params.push({
            type: "string",
            s: "",
            n: 0,
            b: !1
        })
    },
    _onFuncRemoveParamClick(e) {
        this.dirty = !0, e.params.pop()
    },
    _onFuncDeleteClick(e) {
        0 !== Editor.Dialog.messageBox({
            type: "question",
            buttons: ["取消", "确认删除"],
            title: "是否删除",
            message: "事件帧删除后将会移除所有的参数",
            detail: "是否删除移除？",
            defaultId: 0,
            cancelId: 0,
            noLink: !0
        }) && (this.dirty = !0, this.keys.some((t, i) => t === e && (this.keys.splice(i, 1), !0)))
    },
    _onItemTypeChanged(e) {
        this.dirty = !0, e.type = event.target.value
    },
    _onItemSChanged(e) {
        this.dirty = !0, e.s = event.target.value + ""
    },
    _onItemNChanged(e) {
        this.dirty = !0, e.n = event.target.value - 0
    },
    _onItemBChanged(e) {
        this.dirty = !0, e.b = !!event.target.value
    }
}, exports.created = function () {
    this.dirty = !1, this.updateKeys()
};