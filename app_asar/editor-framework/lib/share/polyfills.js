"use strict";
const util = require("util");
util.promisify || (util.promisify = function (i) {
    return function (...t) {
        return new Promise(function (u, n) {
            i(...t, (i, t) => {
                i ? n(i) : u(t)
            })
        })
    }
});