"use strict";
class LinearTicks {
    constructor() {
        this.ticks = [], this.tickLods = [], this.tickRatios = [], this.minScale = .1, this.maxScale = 1e3, this.minValueScale = 1, this.maxValueScale = 1, this.minValue = -500, this.maxValue = 500, this.pixelRange = 500, this.minSpacing = 10, this.maxSpacing = 80
    }
    initTicks(i, t, s) {
        t <= 0 && (t = 1), s <= 0 && (s = 1), s < t && (s = t), this.tickLods = i, this.minScale = t, this.maxScale = s, this.ticks = [];
        let h = 1,
            e = 0;
        this.ticks.push(h);
        let a = t,
            c = s,
            l = 1,
            n = 1;
        for (; h * this.tickLods[e] <= c;) h *= this.tickLods[e], e = e + 1 > this.tickLods.length - 1 ? 0 : e + 1, this.ticks.push(h), l = h;
        for (this.minValueScale = 1 / l * 100, e = this.tickLods.length - 1, h = 1; h / this.tickLods[e] >= a;) h /= this.tickLods[e], e = e - 1 < 0 ? this.tickLods.length - 1 : e - 1, this.ticks.unshift(h), n = h;
        return this.maxValueScale = 1 / n * 100, this
    }
    spacing(i, t) {
        return this.minSpacing = i, this.maxSpacing = t, this
    }
    range(i, t, s) {
        this.minValue = Math.fround(Math.min(i, t)), this.maxValue = Math.fround(Math.max(i, t)), this.pixelRange = s, this.minTickLevel = 0, this.maxTickLevel = this.ticks.length - 1;
        for (let i = this.ticks.length - 1; i >= 0; --i) {
            let t = this.ticks[i] * this.pixelRange / (this.maxValue - this.minValue);
            if (this.tickRatios[i] = (t - this.minSpacing) / (this.maxSpacing - this.minSpacing), this.tickRatios[i] >= 1 && (this.maxTickLevel = i), t <= this.minSpacing) {
                this.minTickLevel = i;
                break
            }
        }
        for (let i = this.minTickLevel; i <= this.maxTickLevel; ++i) this.tickRatios[i] = Editor.Math.clamp01(this.tickRatios[i]);
        return this
    }
    ticksAtLevel(i, t) {
        let s = [],
            h = this.ticks[i],
            e = Math.floor(this.minValue / h),
            a = Math.ceil(this.maxValue / h);
        for (let c = e; c <= a; ++c)(!t || i >= this.maxTickLevel || c % Math.round(this.ticks[i + 1] / h) != 0) && s.push(c * h);
        return s
    }
    levelForStep(i) {
        for (let t = 0; t < this.ticks.length; ++t) {
            if (this.ticks[t] * this.pixelRange / (this.maxValue - this.minValue) >= i) return t
        }
        return -1
    }
}
module.exports = LinearTicks;