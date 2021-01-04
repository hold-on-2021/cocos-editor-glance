"use strict";
const utils = require("../utils"),
    clipUtils = require("./clip");
let uuidToClip = {},
    register = function (i) {
        return uuidToClip[i._uuid] ? null : uuidToClip[i._uuid] = i
    },
    unregister = function (i) {
        return uuidToClip[i._uuid] ? (delete uuidToClip[i._uuid], i) : null
    },
    clear = function () {
        Object.keys(uuidToClip).forEach(i => {
            delete uuidToClip[i]
        })
    },
    _syncQueue = [],
    _syncTimer = null,
    sync = function (i) {
        -1 === _syncQueue.indexOf(i) && _syncQueue.push(i), clearTimeout(_syncTimer), _syncTimer = setTimeout(() => {
            for (; _syncQueue.length;) {
                let i = _syncQueue.pop(),
                    e = uuidToClip[i];
                e && Editor.Ipc.sendToPanel("scene", "scene:animation-clip-changed", {
                    uuid: e._uuid,
                    clip: e.name,
                    data: e.serialize(),
                    dirty: !0
                })
            }
        }, 500)
    },
    isExists = function (i) {
        return !!uuidToClip[i]
    },
    equal = function (i, e) {
        let u = uuidToClip[i];
        return !!u && Editor.serialize(u) === Editor.serialize(e)
    };
module.exports = {
    register: register,
    unregister: unregister,
    clear: clear,
    sync: sync,
    isExists: isExists,
    equal: equal,
    Clip: clipUtils,
    Undo: null
}, Object.keys(clipUtils).forEach(i => {
    let e = clipUtils[i];
    0 === i.indexOf("query") ? clipUtils[i] = function (i, ...u) {
        return sync(i), e(uuidToClip[i], ...u)
    } : clipUtils[i] = function (i, ...u) {
        return e(uuidToClip[i], ...u)
    }
});