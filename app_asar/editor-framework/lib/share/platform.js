"use strict";
let Platform = {};
if (module.exports = Platform, Platform.isNode = !("undefined" == typeof process || !process.versions || !process.versions.node), Platform.isElectron = !!(Platform.isNode && "electron" in process.versions), Platform.isNative = Platform.isElectron, Platform.isPureWeb = !Platform.isNode && !Platform.isNative, Platform.isElectron ? Platform.isRendererProcess = "undefined" != typeof process && "renderer" === process.type : Platform.isRendererProcess = "undefined" == typeof __dirname || null === __dirname, Platform.isMainProcess = "undefined" != typeof process && "browser" === process.type, Platform.isNode) Platform.isDarwin = "darwin" === process.platform, Platform.isWin32 = "win32" === process.platform;
else {
    let e = window.navigator.platform;
    Platform.isDarwin = "Mac" === e.substring(0, 3), Platform.isWin32 = "Win" === e.substring(0, 3)
}
Object.defineProperty(Platform, "isRetina", {
    enumerable: !0,
    get: () => Platform.isRendererProcess && window.devicePixelRatio && window.devicePixelRatio > 1
});