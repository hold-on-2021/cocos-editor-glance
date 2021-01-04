"use strict";

function _snapPixel(t) {
    return Math.floor(t)
}

function _uninterpolate(t, e) {
    return e = (e -= t) || 1 / e,
        function (i) {
            return (i - t) / e
        }
}

function _interpolate(t, e) {
    return function (i) {
        return t * (1 - i) + e * i
    }
}
const Numeral = require("numeral"),
    PIXI = require("pixi.js"),
    LinearTicks = require("./linear-ticks");
PIXI.utils._saidHello = !0;
class Grid extends window.HTMLElement {
    constructor() {
        super(), this.canvas = {
            element: document.createElement("canvas"),
            width: 0,
            height: 0
        }, this.label = {
            vElement: document.createElement("div"),
            vLabels: [],
            hElement: document.createElement("div"),
            hLabels: []
        }, this.hticks = null, this.xAxisScale = 1, this.xAxisOffset = 0, this.xAnchor = .5, this.vticks = null, this.yAxisScale = 1, this.yAxisOffset = 0, this.yAnchor = .5, this.renderer = null, this.stage = null, this.bgGraphics = null, this.attachShadow({
            mode: "open"
        });
        let t = document.createElement("style");
        t.type = "text/css", t.textContent = require("fs").readFileSync(require("path").join(__dirname, "./grid.css"), "utf-8"), this.shadowRoot.appendChild(t), this.shadowRoot.appendChild(this.canvas.element), this.label.vElement.className = "vLabels", this.shadowRoot.appendChild(this.label.vElement), this.label.hElement.className = "hLabels", this.shadowRoot.appendChild(this.label.hElement), this._xAnchorOffset = 0, this._yAnchorOffset = 0
    }
    connectedCallback() {
        let t = this.canvas.element.getBoundingClientRect();
        this.renderer = new PIXI.WebGLRenderer(t.width, t.height, {
            view: this.canvas.element,
            transparent: !0,
            antialias: !1,
            forceFXAA: !1
        }), this.stage = new PIXI.Container;
        let e = new PIXI.Container;
        this.stage.addChild(e), this.bgGraphics = new PIXI.Graphics, e.addChild(this.bgGraphics)
    }
    static get observedAttributes() {
        return ["show-label-h", "show-label-v"]
    }
    attributeChangedCallback(t, e, i) {
        switch (t) {
            case "show-label-h":
            case "show-label-v":
                this._updateLabel()
        }
    }
    setAnchor(t, e) {
        this.xAnchor = Editor.Math.clamp(t, -1, 1), this.yAnchor = Editor.Math.clamp(e, -1, 1)
    }
    setScaleH(t, e, i, s, h) {
        this.hticks = (new LinearTicks).initTicks(t, e, i).spacing(10, 80), this.xAxisScale = Editor.Math.clamp(this.xAxisScale, this.hticks.minValueScale, this.hticks.maxValueScale), "frame" === s && (this.hformat = (t => Editor.Utils.formatFrame(t, h || 60))), this.pixelToValueH = (t => (t - this.xAxisOffset) / this.xAxisScale), this.valueToPixelH = (t => t * this.xAxisScale + this.xAxisOffset)
    }
    setMappingH(t, e, i) {
        this._xAnchorOffset = t / (e - t), this.xDirection = e - t > 0 ? 1 : -1, this.pixelToValueH = (s => {
            let h = this.xAxisOffset,
                l = this.canvas.width / i,
                a = _uninterpolate(0, this.canvas.width);
            return _interpolate(t * l, e * l)(a(s - h)) / this.xAxisScale
        }), this.valueToPixelH = (s => {
            let h = this.xAxisOffset,
                l = this.canvas.width / i,
                a = _uninterpolate(t * l, e * l);
            return _interpolate(0, this.canvas.width)(a(s * this.xAxisScale)) + h
        })
    }
    setScaleV(t, e, i, s) {
        this.vticks = (new LinearTicks).initTicks(t, e, i).spacing(10, 80), this.yAxisScale = Editor.Math.clamp(this.yAxisScale, this.vticks.minValueScale, this.vticks.maxValueScale), "frame" === s && (this.vformat = (t => Editor.Utils.formatFrame(t, 60))), this.pixelToValueV = (t => (this.canvas.height - t + this.yAxisOffset) / this.yAxisScale), this.valueToPixelV = (t => -t * this.yAxisScale + this.canvas.height + this.yAxisOffset)
    }
    setMappingV(t, e, i) {
        this._yAnchorOffset = t / (e - t), this.yDirection = e - t > 0 ? 1 : -1, this.pixelToValueV = (s => {
            let h = this.yAxisOffset,
                l = this.canvas.height / i,
                a = _uninterpolate(0, this.canvas.height);
            return _interpolate(t * l, e * l)(a(s - h)) / this.yAxisScale
        }), this.valueToPixelV = (s => {
            let h = this.yAxisOffset,
                l = this.canvas.height / i,
                a = _uninterpolate(t * l, e * l);
            return _interpolate(0, this.canvas.height)(a(s * this.yAxisScale)) + h
        })
    }
    pan(t, e) {
        this.panX(t), this.panY(e)
    }
    panX(t) {
        if (!this.valueToPixelH) return;
        let e = this.xAxisOffset + t;
        this.xAxisOffset = 0, e >= 10 && (e = 10);
        let i, s;
        return void 0 !== this.xMinRange && null !== this.xMinRange && (i = this.valueToPixelH(this.xMinRange)), void 0 !== this.xMaxRange && null !== this.xMaxRange && (s = this.valueToPixelH(this.xMaxRange), s = Math.max(0, s - this.canvas.width)), this.xAxisOffset = e, void 0 !== i && void 0 !== s ? (this.xAxisOffset = Editor.Math.clamp(this.xAxisOffset, -s, -i), void 0) : void 0 !== i ? (this.xAxisOffset = Math.min(this.xAxisOffset, -i), void 0) : void 0 !== s ? (this.xAxisOffset = Math.max(this.xAxisOffset, -s), void 0) : void 0
    }
    panY(t) {
        if (!this.valueToPixelV) return;
        let e = this.yAxisOffset + t;
        this.yAxisOffset = 0;
        let i, s;
        return void 0 !== this.yMinRange && null !== this.yMinRange && (i = this.valueToPixelV(this.yMinRange)), void 0 !== this.yMaxRange && null !== this.yMaxRange && (s = this.valueToPixelV(this.yMaxRange), s = Math.max(0, s - this.canvas.height)), this.yAxisOffset = e, void 0 !== i && void 0 !== s ? (this.yAxisOffset = Editor.Math.clamp(this.yAxisOffset, -s, -i), void 0) : void 0 !== i ? (this.yAxisOffset = Math.min(this.yAxisOffset, -i), void 0) : void 0 !== s ? (this.yAxisOffset = Math.max(this.yAxisOffset, -s), void 0) : void 0
    }
    xAxisScaleAt(t, e) {
        let i = this.pixelToValueH(t);
        this.xAxisScale = Editor.Math.clamp(e, this.hticks.minValueScale, this.hticks.maxValueScale);
        let s = this.valueToPixelH(i);
        this.pan(t - s, 0)
    }
    yAxisScaleAt(t, e) {
        let i = this.pixelToValueV(t);
        this.yAxisScale = Editor.Math.clamp(e, this.vticks.minValueScale, this.vticks.maxValueScale);
        let s = this.valueToPixelV(i);
        this.pan(0, t - s)
    }
    xAxisSync(t, e) {
        this.xAxisOffset = t, this.xAxisScale = e
    }
    yAxisSync(t, e) {
        this.yAxisOffset = t, this.yAxisScale = e
    }
    resize(t, e) {
        if (!t || !e) {
            let i = this.canvas.element.getBoundingClientRect();
            t = t || i.width, e = e || i.height, t = Math.round(t), e = Math.round(e)
        }
        0 !== this.canvas.width && this.panX((t - this.canvas.width) * (this.xAnchor + this._xAnchorOffset)), 0 !== this.canvas.height && this.panY((e - this.canvas.height) * (this.yAnchor + this._yAnchorOffset)), this.canvas.width = t, this.canvas.height = e, this.renderer && this.renderer.resize(this.canvas.width, this.canvas.height)
    }
    repaint() {
        this.renderer && (this._updateGrids(), this._updateLabel(), this._requestID || (this._requestID = window.requestAnimationFrame(() => {
            this._requestID = null, this.renderer.render(this.stage)
        })))
    }
    _updateGrids() {
        let t, e, i, s;
        if (this.bgGraphics.clear(), this.bgGraphics.beginFill("#171717"), this.hticks) {
            let s = this.pixelToValueH(0),
                h = this.pixelToValueH(this.canvas.width);
            this.hticks.range(s, h, this.canvas.width);
            for (let s = this.hticks.minTickLevel; s <= this.hticks.maxTickLevel; ++s)
                if (e = this.hticks.tickRatios[s], e > 0) {
                    this.bgGraphics.lineStyle(1, "#171717", .5 * e), t = this.hticks.ticksAtLevel(s, !0);
                    for (let e = 0; e < t.length; ++e) i = this.valueToPixelH(t[e]), this.bgGraphics.moveTo(_snapPixel(i), -1), this.bgGraphics.lineTo(_snapPixel(i), this.canvas.height)
                }
        }
        if (this.vticks) {
            let i = this.pixelToValueV(0),
                h = this.pixelToValueV(this.canvas.height);
            this.vticks.range(i, h, this.canvas.height);
            for (let i = this.vticks.minTickLevel; i <= this.vticks.maxTickLevel; ++i)
                if (e = this.vticks.tickRatios[i], e > 0) {
                    this.bgGraphics.lineStyle(1, "#171717", .5 * e), t = this.vticks.ticksAtLevel(i, !0);
                    for (let e = 0; e < t.length; ++e) s = this.valueToPixelV(t[e]), this.bgGraphics.moveTo(0, _snapPixel(s)), this.bgGraphics.lineTo(this.canvas.width, _snapPixel(s))
                }
        }
        this.bgGraphics.endFill(), this.showDebugInfo && (this.set("debugInfo.xAxisScale", this.xAxisScale.toFixed(3)), this.set("debugInfo.xAxisOffset", this.xAxisOffset.toFixed(3)), this.hticks && (this.set("debugInfo.xMinLevel", this.hticks.minTickLevel), this.set("debugInfo.xMaxLevel", this.hticks.maxTickLevel)), this.set("debugInfo.yAxisScale", this.yAxisScale.toFixed(3)), this.set("debugInfo.yAxisOffset", this.yAxisOffset.toFixed(3)), this.vticks && (this.set("debugInfo.yMinLevel", this.vticks.minTickLevel), this.set("debugInfo.yMaxLevel", this.vticks.maxTickLevel)))
    }
    _updateLabel() {
        if (null !== this.getAttribute("show-label-h") && this.hticks) {
            let t = this.hticks.levelForStep(50),
                e = this.hticks.ticksAtLevel(t, !1),
                i = this.hticks.ticks[t],
                s = Math.max(0, -Math.floor(Math.log10(i))),
                h = "0," + Number(0).toFixed(s);
            for (e.forEach((t, e) => {
                    let i = _snapPixel(this.valueToPixelH(t)) + 5,
                        s = this.label.hElement.children[e];
                    s || (s = document.createElement("span"), this.label.hElement.appendChild(s)), this.hformat ? s.innerText = this.hformat(t) : s.innerText = Numeral(t).format(h), s.style.transform = `translateX(${_snapPixel(i)}px)`
                }); this.label.hElement.children.length > e.length;) {
                let t = this.label.hElement.children.length - 1,
                    e = this.label.hElement.children[t];
                this.label.hElement.removeChild(e)
            }
        } else
            for (; this.label.hElement.children.length > 0;) {
                let t = this.label.hElement.children.length - 1,
                    e = this.label.hElement.children[t];
                this.label.hElement.removeChild(e)
            }
        if (null !== this.getAttribute("show-label-v") && this.vticks) {
            let t = this.vticks.levelForStep(50),
                e = this.vticks.ticksAtLevel(t, !1),
                i = this.vticks.ticks[t],
                s = Math.max(0, -Math.floor(Math.log10(i))),
                h = "0," + Number(0).toFixed(s);
            for (e.forEach((t, e) => {
                    let i = _snapPixel(this.valueToPixelV(t)) - 15,
                        s = this.label.vElement.children[e];
                    s || (s = document.createElement("span"), this.label.vElement.appendChild(s)), this.vformat ? s.innerText = this.vformat(t) : s.innerText = Numeral(t).format(h), s.style.transform = `translateY(${_snapPixel(i)}px)`
                }); this.label.vElement.children.length > e.length;) {
                let t = this.label.vElement.children.length - 1,
                    e = this.label.vElement.children[t];
                this.label.vElement.removeChild(e)
            }
        } else
            for (; this.label.vElement.children.length > 0;) {
                let t = this.label.vElement.children.length - 1,
                    e = this.label.vElement.children[t];
                this.label.vElement.removeChild(e)
            }
    }
}
module.exports = Grid;