"use strict";

function _url2path(e) {
    let t = e.hostname,
        r = "",
        i = "",
        o = Editor.isMainProcess ? Editor.App._profile.data : Editor.globalProfile.data;
    if (!_mapping[t]) return Editor.error("Unrecognized unpack host! Please validate your url."), null;
    if ("engine" === t && !o["use-default-js-engine"] && o["js-engine-path"]) r = e.pathname || "", i = Path.join(o["js-engine-path"], r);
    else if ("simulator" === t)
        if (r = e.pathname || "", o["use-default-cpp-engine"]) {
            let e = Editor.builtinCocosRoot || Editor.remote.builtinCocosRoot;
            i = Path.join(e, "simulator", r)
        } else o["cpp-engine-path"] && (i = Path.join(o["cpp-engine-path"], "simulator", r));
    else t = Editor.dev ? _mapping[t].dev : "../" + _mapping[t].release, r = e.pathname ? Path.join(t, e.pathname) : t, i = Path.join(Editor.isMainProcess ? Editor.App.path : Editor.appPath, r);
    return i
}
const Path = require("fire-path"),
    Url = require("fire-url"),
    Fs = require("fire-fs");
if (Editor.isMainProcess) {
    const e = require("electron").protocol;
    e.registerFileProtocol("unpack", (e, t) => {
        let r = decodeURIComponent(e.url),
            i = _url2path(Url.parse(r));
        t(i ? {
            path: i
        } : -6)
    }, e => {
        if (e) return Editor.failed("Failed to register protocol unpack, %s", e.message), void 0;
        Editor.success("protocol unpack registerred")
    });

    function disableCommonJS(e) {
        const t = "(function(){var require = undefined;var module = undefined; ";
        let r = e.lastIndexOf("\n");
        if (-1 !== r) {
            let i = e.slice(r).trimLeft();
            if (i || (r = e.lastIndexOf("\n", r - 1), i = e.slice(r).trimLeft()), i.startsWith("//")) return t + e.slice(0, r) + "\n})();\n" + i
        }
        return t + e + "\n})();\n"
    }
    e.registerStringProtocol("disable-commonjs", (e, t) => {
        let r = Url.parse(e.url);
        if (!r.slashes) return Editor.error('Please use "disable-commonjs://" + fspath.'), t(-6);
        let i, o = decodeURIComponent(r.hostname),
            s = decodeURIComponent(r.pathname);
        console.log(`Parsing disable-commonjs protocol, url: "${e.url}", hostname: "${o}", pathname: "${s}"`), (i = Editor.isWin32 ? o + ":" + s : s) ? Fs.readFile(i, "utf8", (e, r) => {
            if (e) return Editor.error(`Failed to read ${i}, ${e}`), t(-6);
            t({
                data: disableCommonJS(r),
                charset: "utf-8"
            })
        }) : t(-6)
    }, e => {
        if (e) return Editor.failed("Failed to register protocol disable-commonjs, %s", e.message), void 0;
        Editor.success("protocol disable-commonjs registerred")
    })
}
let _mapping = {
    engine: {
        dev: "engine",
        release: "engine"
    },
    simulator: {
        dev: "cocos2d-x/simulator",
        release: "cocos2d-x/simulator"
    },
    static: {
        dev: "editor/static",
        release: "static"
    },
    templates: {
        dev: "templates",
        release: "templates"
    },
    utils: {
        dev: "utils",
        release: "utils"
    },
    builtin: {
        dev: "builtin",
        release: "builtin"
    }
};
Editor.Protocol.register("unpack", _url2path);