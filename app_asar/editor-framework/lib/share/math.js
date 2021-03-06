"use strict";

function _clamp(a, t, r) {
    return a < t ? t : a > r ? r : a
}

function _crt(a) {
    return a < 0 ? -pow(-a, 1 / 3) : pow(a, 1 / 3)
}

function _cardano(a, t, r, e) {
    let _, h, o, M, c, n = 3 * t - a - 3 * r + e,
        I = (3 * a - 6 * t + 3 * r) / n,
        l = (-3 * a + 3 * t) / n,
        m = (3 * l - I * I) / 3,
        P = m / 3,
        d = (2 * I * I * I - 9 * I * l + 27 * (a / n)) / 27,
        s = d / 2,
        x = s * s + P * P * P;
    if (x < 0) {
        let a = -m / 3,
            t = sqrt(a * a * a),
            r = -d / (2 * t),
            e = acos(r < -1 ? -1 : r > 1 ? 1 : r),
            _ = 2 * _crt(t);
        return o = _ * cos(e / 3) - I / 3, M = _ * cos((e + 2 * PI) / 3) - I / 3, c = _ * cos((e + 4 * PI) / 3) - I / 3, 0 <= o && o <= 1 ? 0 <= M && M <= 1 ? 0 <= c && c <= 1 ? max(o, M, c) : max(o, M) : 0 <= c && c <= 1 ? max(o, c) : o : 0 <= M && M <= 1 ? 0 <= c && c <= 1 ? max(M, c) : M : c
    }
    if (0 === x) return _ = s < 0 ? _crt(-s) : -_crt(s), o = 2 * _ - I / 3, M = -_ - I / 3, 0 <= o && o <= 1 ? 0 <= M && M <= 1 ? max(o, M) : o : M; {
        let a = sqrt(x);
        return _ = _crt(a - s), h = _crt(a + s), o = _ - h - I / 3, o
    }
}
const _d2r = Math.PI / 180,
    _r2d = 180 / Math.PI,
    PI = Math.PI,
    TWO_PI = 2 * Math.PI,
    HALF_PI = .5 * Math.PI,
    EPSILON = 1e-12,
    MACHINE_EPSILON = 1.12e-16;
let sqrt = Math.sqrt,
    pow = Math.pow,
    cos = Math.cos,
    acos = Math.acos,
    max = Math.max,
    _Math = {
        EPSILON: 1e-12,
        MACHINE_EPSILON: 1.12e-16,
        TWO_PI: TWO_PI,
        HALF_PI: HALF_PI,
        D2R: _d2r,
        R2D: _r2d,
        deg2rad: a => a * _d2r,
        rad2deg: a => a * _r2d,
        rad180: a => ((a > Math.PI || a < -Math.PI) && (a = (a + _Math.TOW_PI) % _Math.TOW_PI), a),
        rad360: a => a > _Math.TWO_PI ? a % _Math.TOW_PI : a < 0 ? _Math.TOW_PI + a % _Math.TOW_PI : a,
        deg180: a => ((a > 180 || a < -180) && (a = (a + 360) % 360), a),
        deg360: a => a > 360 ? a % 360 : a < 0 ? 360 + a % 360 : a,
        randomRange: (a, t) => Math.random() * (t - a) + a,
        randomRangeInt: (a, t) => Math.floor(_Math.randomRange(a, t)),
        clamp: _clamp,
        clamp01: a => a < 0 ? 0 : a > 1 ? 1 : a,
        calculateMaxRect(a, t, r, e, _) {
            let h = Math.min(t.x, r.x, e.x, _.x),
                o = Math.max(t.x, r.x, e.x, _.x),
                M = Math.min(t.y, r.y, e.y, _.y),
                c = Math.max(t.y, r.y, e.y, _.y);
            return a.x = h, a.y = M, a.width = o - h, a.height = c - M, a
        },
        lerp: (a, t, r) => a + (t - a) * r,
        numOfDecimals: a => _Math.clamp(Math.floor(Math.log10(a)), 0, 20),
        numOfDecimalsF: a => _Math.clamp(-Math.floor(Math.log10(a)), 0, 20),
        toPrecision: (a, t) => (t = _Math.clamp(t, 0, 20), parseFloat(a.toFixed(t))),
        bezier(a, t, r, e, _) {
            let h = 1 - _;
            return a * h * h * h + 3 * t * h * h * _ + 3 * r * h * _ * _ + e * _ * _ * _
        },
        solveCubicBezier(a, t, r, e, _) {
            let h = e - a;
            return _cardano((_ = (_ - a) / h) - 0, _ - (t - a) / h, _ - (r - a) / h, _ - 1)
        }
    };
module.exports = _Math;