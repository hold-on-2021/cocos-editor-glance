"use strict";
const DEBUG = !1,
    Events = require("events");
module.exports = new Events.EventEmitter, module.exports.setMaxListeners(1e3);