function isNodeModulePath(e) {
    return -1 !== e.replace(/\\/g, "/").indexOf("/node_modules/")
}

function addModule(e, t) {
    t = t || Path.basenameNoExt(e);
    let r = modules[t];
    return r || (r = modules[t] = {
        name: t,
        path: e,
        children: []
    }), r
}

function unregisterPathClass(e) {
    let t = Path.basenameNoExt(e);
    delete require.cache[e], delete modules[t]
}

function registerPathClass(e) {
    try {
        require(e)
    } catch (t) {
        Editor.failed(`load script [${e}] failed : ${t.stack}`)
    }
}
const Path = require("fire-path"),
    Globby = require("globby"),
    Async = require("async"),
    FireUrl = require("fire-url"),
    Lodash = require("lodash"),
    DISABLE_COMMONJS_PROTOCOL = "disable-commonjs://",
    tempScriptsPath = Editor.remote.QuickCompiler.getTempPath();
let modules = {},
    plugins = [],
    Module = require("module"),
    loadingProjectScripts = 0;
cc.require = function (e, t) {
    t = t || require, loadingProjectScripts++;
    let r;
    try {
        r = t(e)
    } catch (t) {
        Editor.failed(`load script [${e}] failed : ${t.stack}`)
    }
    return loadingProjectScripts--, r
}, Module._resolveFilenameVendor = Module._resolveFilename, Module._resolveFilename = function (e, t, r) {
    if (loadingProjectScripts > 0) {
        let r = Path.basename(e);
        r.endsWith(".js") && (r = r.slice(0, -3));
        let o = modules[r];
        if (!isNodeModulePath(t.filename) && o && modules.hasOwnProperty(r)) return o.path
    }
    return Module._resolveFilenameVendor(e, t, r)
}, module.exports = {
    load: function (e) {
        Async.series([this.loadPlugins.bind(this), this.loadCommon.bind(this)], e)
    },
    loadScript: function (e, t) {
        var r = document.createElement("script");
        r.onload = function () {
            r.remove(), t()
        }, r.onerror = function () {
            r.remove(), Editor.error("Failed to load %s", e), t(new Error("Failed to load " + e))
        }, r.setAttribute("type", "text/javascript"), r.setAttribute("charset", "utf-8"), r.setAttribute("src", FireUrl.addRandomQuery(e)), document.head.appendChild(r)
    },
    loadPlugins: function (e) {
        console.time("query plugin scripts"), Editor.Ipc.sendToMain("app:query-plugin-scripts", "editor", (t, r) => {
            if (console.timeEnd("query plugin scripts"), t) return e(t);
            plugins = r.map(e => Path.stripSep(e)), Async.eachSeries(r, (e, t) => {
                this.loadScript("disable-commonjs://" + e, t)
            }, e)
        }, 3e4)
    },
    loadCommon: function (e) {
        for (let e in modules) {
            unregisterPathClass(modules[e].path)
        }
        modules = {};
        let t = [Path.join(tempScriptsPath, "/**/*.js"), "!" + Path.join(tempScriptsPath, "__node_modules/**")];
        Globby(t, (t, r) => {
            (r = Lodash(r).map(e => Path.stripSep(e)).filter(e => -1 === plugins.indexOf(e)).sortBy().value()).forEach(e => {
                addModule(e)
            }), loadingProjectScripts++;
            for (let e = 0; e < r.length; e++) registerPathClass(r[e]);
            loadingProjectScripts--, e && e()
        })
    }
};