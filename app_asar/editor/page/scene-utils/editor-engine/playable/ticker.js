var Ticker = function () {
    var n = {};
    return window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame, 0, window.requestAnimationFrame ? n.requestAnimationFrame = function (n) {
        return window.requestAnimationFrame(n)
    } : n.requestAnimationFrame = function (n) {
        return window.setTimeout(n, 1e3 / 60)
    }, window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame, window.cancelAnimationFrame ? n.cancelAnimationFrame = function (n) {
        window.cancelAnimationFrame(n)
    } : n.cancelAnimationFrame = function (n) {
        window.clearTimeout(n)
    }, window.performance && window.performance.now ? n.now = function () {
        return window.performance.now() / 1e3
    } : n.now = function () {
        return Date.now() / 1e3
    }, n
}();
cc._Ticker = Ticker, module.exports = Ticker;