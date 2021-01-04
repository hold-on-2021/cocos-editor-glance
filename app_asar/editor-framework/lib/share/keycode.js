"use strict";
exports = module.exports = function (e) {
    if (e && "object" == typeof e) {
        let o = e.which || e.keyCode || e.charCode;
        o && (e = o)
    }
    if ("number" == typeof e) return names[e];
    let o = String(e),
        s = codes[o.toLowerCase()];
    return s || (s = aliases[o.toLowerCase()], s || (1 === o.length ? o.charCodeAt(0) : void 0))
};
let codes = exports.code = exports.codes = {
        backspace: 8,
        tab: 9,
        enter: 13,
        shift: 16,
        ctrl: 17,
        alt: 18,
        "pause/break": 19,
        "caps lock": 20,
        esc: 27,
        space: 32,
        "page up": 33,
        "page down": 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        insert: 45,
        delete: 46,
        command: 91,
        "right click": 93,
        "numpad *": 106,
        "numpad +": 107,
        "numpad -": 109,
        "numpad .": 110,
        "numpad /": 111,
        "num lock": 144,
        "scroll lock": 145,
        "my computer": 182,
        "my calculator": 183,
        ";": 186,
        "=": 187,
        ",": 188,
        "-": 189,
        ".": 190,
        "/": 191,
        "`": 192,
        "[": 219,
        "\\": 220,
        "]": 221,
        "'": 222
    },
    aliases = exports.aliases = {
        windows: 91,
        "⇧": 16,
        "⌥": 18,
        "⌃": 17,
        "⌘": 91,
        ctl: 17,
        control: 17,
        option: 18,
        pause: 19,
        break: 19,
        caps: 20,
        return: 13,
        escape: 27,
        spc: 32,
        pgup: 33,
        pgdn: 33,
        ins: 45,
        del: 46,
        cmd: 91
    };
for (let e = 97; e < 123; e++) codes[String.fromCharCode(e)] = e - 32;
for (let e = 48; e < 58; e++) codes[e - 48] = e;
for (let e = 1; e < 13; e++) codes["f" + e] = e + 111;
for (let e = 0; e < 10; e++) codes["numpad " + e] = e + 96;
let names = exports.names = exports.title = {};
for (let e in codes) names[codes[e]] = e;
for (let e in aliases) codes[e] = aliases[e];