"use strict";

function _makeOutIn(n, t) {
    return function (u) {
        return u < .5 ? t(2 * u) / 2 : n(2 * u - 1) / 2 + .5
    }
}
let Easing = {};
module.exports = Easing, Easing.linear = function (n) {
    return n
}, Easing.quadIn = function (n) {
    return n * n
}, Easing.quadOut = function (n) {
    return n * (2 - n)
}, Easing.quadInOut = function (n) {
    return (n *= 2) < 1 ? .5 * n * n : -.5 * (--n * (n - 2) - 1)
}, Easing.quadOutIn = _makeOutIn(Easing.quadIn, Easing.quadOut), Easing.cubicIn = function (n) {
    return n * n * n
}, Easing.cubicOut = function (n) {
    return --n * n * n + 1
}, Easing.cubicInOut = function (n) {
    return (n *= 2) < 1 ? .5 * n * n * n : .5 * ((n -= 2) * n * n + 2)
}, Easing.cubicOutIn = _makeOutIn(Easing.cubicIn, Easing.cubicOut), Easing.quartIn = function (n) {
    return n * n * n * n
}, Easing.quartOut = function (n) {
    return 1 - --n * n * n * n
}, Easing.quartInOut = function (n) {
    return (n *= 2) < 1 ? .5 * n * n * n * n : -.5 * ((n -= 2) * n * n * n - 2)
}, Easing.quartOutIn = _makeOutIn(Easing.quartIn, Easing.quartOut), Easing.quintIn = function (n) {
    return n * n * n * n * n
}, Easing.quintOut = function (n) {
    return --n * n * n * n * n + 1
}, Easing.quintInOut = function (n) {
    return (n *= 2) < 1 ? .5 * n * n * n * n * n : .5 * ((n -= 2) * n * n * n * n + 2)
}, Easing.quintOutIn = _makeOutIn(Easing.quintIn, Easing.quintOut), Easing.sineIn = function (n) {
    return 1 - Math.cos(n * Math.PI / 2)
}, Easing.sineOut = function (n) {
    return Math.sin(n * Math.PI / 2)
}, Easing.sineInOut = function (n) {
    return .5 * (1 - Math.cos(Math.PI * n))
}, Easing.sineOutIn = _makeOutIn(Easing.sineIn, Easing.sineOut), Easing.expoIn = function (n) {
    return 0 === n ? 0 : Math.pow(1024, n - 1)
}, Easing.expoOut = function (n) {
    return 1 === n ? 1 : 1 - Math.pow(2, -10 * n)
}, Easing.expoInOut = function (n) {
    return 0 === n ? 0 : 1 === n ? 1 : (n *= 2) < 1 ? .5 * Math.pow(1024, n - 1) : .5 * (2 - Math.pow(2, -10 * (n - 1)))
}, Easing.expoOutIn = _makeOutIn(Easing.expoIn, Easing.expoOut), Easing.circIn = function (n) {
    return 1 - Math.sqrt(1 - n * n)
}, Easing.circOut = function (n) {
    return Math.sqrt(1 - --n * n)
}, Easing.circInOut = function (n) {
    return (n *= 2) < 1 ? -.5 * (Math.sqrt(1 - n * n) - 1) : .5 * (Math.sqrt(1 - (n -= 2) * n) + 1)
}, Easing.circOutIn = _makeOutIn(Easing.circIn, Easing.circOut), Easing.elasticIn = function (n) {
    var t, u = .1;
    return 0 === n ? 0 : 1 === n ? 1 : (!u || u < 1 ? (u = 1, t = .1) : t = .4 * Math.asin(1 / u) / (2 * Math.PI), -u * Math.pow(2, 10 * (n -= 1)) * Math.sin((n - t) * (2 * Math.PI) / .4))
}, Easing.elasticOut = function (n) {
    var t, u = .1;
    return 0 === n ? 0 : 1 === n ? 1 : (!u || u < 1 ? (u = 1, t = .1) : t = .4 * Math.asin(1 / u) / (2 * Math.PI), u * Math.pow(2, -10 * n) * Math.sin((n - t) * (2 * Math.PI) / .4) + 1)
}, Easing.elasticInOut = function (n) {
    var t, u = .1;
    return 0 === n ? 0 : 1 === n ? 1 : (!u || u < 1 ? (u = 1, t = .1) : t = .4 * Math.asin(1 / u) / (2 * Math.PI), (n *= 2) < 1 ? u * Math.pow(2, 10 * (n -= 1)) * Math.sin((n - t) * (2 * Math.PI) / .4) * -.5 : u * Math.pow(2, -10 * (n -= 1)) * Math.sin((n - t) * (2 * Math.PI) / .4) * .5 + 1)
}, Easing.elasticOutIn = _makeOutIn(Easing.elasticIn, Easing.elasticOut), Easing.backIn = function (n) {
    return n * n * (2.70158 * n - 1.70158)
}, Easing.backOut = function (n) {
    return --n * n * (2.70158 * n + 1.70158) + 1
}, Easing.backInOut = function (n) {
    return (n *= 2) < 1 ? n * n * (3.5949095 * n - 2.5949095) * .5 : .5 * ((n -= 2) * n * (3.5949095 * n + 2.5949095) + 2)
}, Easing.backOutIn = _makeOutIn(Easing.backIn, Easing.backOut), Easing.bounceIn = function (n) {
    return 1 - Easing.bounceOut(1 - n)
}, Easing.bounceOut = function (n) {
    return n < 1 / 2.75 ? 7.5625 * n * n : n < 2 / 2.75 ? 7.5625 * (n -= 1.5 / 2.75) * n + .75 : n < 2.5 / 2.75 ? 7.5625 * (n -= 2.25 / 2.75) * n + .9375 : 7.5625 * (n -= 2.625 / 2.75) * n + .984375
}, Easing.bounceInOut = function (n) {
    return n < .5 ? .5 * Easing.bounceIn(2 * n) : .5 * Easing.bounceOut(2 * n - 1) + .5
}, Easing.bounceOutIn = _makeOutIn(Easing.bounceIn, Easing.bounceOut), Easing.smooth = function (n) {
    return n <= 0 ? 0 : n >= 1 ? 1 : n * n * (3 - 2 * n)
}, Easing.fade = function (n) {
    return n <= 0 ? 0 : n >= 1 ? 1 : n * n * n * (n * (6 * n - 15) + 10)
};