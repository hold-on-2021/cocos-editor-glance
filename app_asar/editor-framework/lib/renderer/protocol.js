"use strict";

function _url2path(o) {
    return t => t.pathname ? Path.join(o, t.host, t.pathname) : Path.join(o, t.host)
}
let Protocol = {};
module.exports = Protocol;
const Path = require("fire-path"),
    Url = require("fire-url");
let _appPath, _frameworkPath, _remoteEditor, _defaultProtocols = ["http:", "https:", "ftp:", "ssh:", "file:"],
    _protocol2fn = {};
Protocol.init = function (o) {
    _appPath = o.appPath, _frameworkPath = o.frameworkPath, _remoteEditor = o.remote, o.Protocol.register("editor-framework", _url2path(_frameworkPath)), o.Protocol.register("app", _url2path(_appPath))
}, Protocol.url = function (o) {
    let t = Url.parse(o);
    if (!t.protocol) return o;
    if (-1 !== _defaultProtocols.indexOf(t.protocol)) return o;
    let r = _protocol2fn[t.protocol];
    return r ? r(t) : _remoteEditor.url(o)
}, Protocol.register = function (o, t) {
    _protocol2fn[o + ":"] = t
};