"use strict";

function close(e, t) {
    return Math.abs(e - t) < EPSILON
}
let SegmentTool = require("./trajectory-tool").SegmentTool,
    CurveTool = require("./trajectory-tool").CurveTool,
    Utils = require("./utils"),
    Segment = Utils.Segment,
    sampleMotionPaths = Editor.require("unpack://engine/cocos2d/animation/motion-path-helper").sampleMotionPaths,
    v2 = cc.v2,
    EPSILON = 1e-6;
class TrajectoryGizmo extends Editor.Gizmo {
    init() {
        this._selectedSegTool = null, this._selectedCurveTool = null, this._animationState = null, this._sampledCurve = null, this._clip = null, this._childPath = "", this._lastMapping = null, this._lastParentTransform = null, this._segments = [], this._processing = !1, this._clipChanging = !1
    }
}
TrajectoryGizmo.prototype.show = function (e, t, o) {
    if (!e) return;
    let i = e.getComponent(cc.Animation);
    if (!i) return;
    let n = i.getAnimationState(t.name);
    if (!n) return Editor.error(`Cant't find animation state with clip name [${t.name}]`), void 0;
    Editor.Gizmo.prototype.show.call(this), this._animationState = n, this._clip = t, this._childPath = o, this._initSampledCurve(), this._initSegments()
}, TrajectoryGizmo.prototype.onCreateRoot = function () {
    let e = this._root;
    this._sampledCurveGroup = e.group(), this._curveGroup = e.group(), this._segmentGroup = e.group()
}, TrajectoryGizmo.prototype._viewDirty = function () {
    let e = cc.director.getScene(),
        t = _Scene.NodeUtils.getWorldPosition(e),
        o = this._view.worldToPixel(t),
        i = !1;
    return this._lastMapping && close(this._lastMapping.x, o.x) && close(this._lastMapping.y, o.y) || (i = !0), this._lastMapping = o, i
}, TrajectoryGizmo.prototype._parentDirty = function () {
    let e = this.target.parent.getNodeToWorldTransform(),
        t = this._lastParentTransform,
        o = !1;
    return t && close(t.a, e.a) && close(t.b, e.b) && close(t.c, e.c) && close(t.d, e.d) && close(t.tx, e.tx) && close(t.ty, e.ty) || (o = !0), this._lastParentTransform = e, o
}, TrajectoryGizmo.prototype.visible = function () {
    return !this._hidden && (this._viewDirty() || this._parentDirty())
}, TrajectoryGizmo.prototype.update = function () {
    this.targetValid() && this.visible() && this._updateSegments()
}, TrajectoryGizmo.prototype._pixelVecToArray = function (e) {
    let t = this._view,
        o = this.target.parent.convertToNodeSpaceAR(t.pixelToWorld(e));
    return [o.x, o.y]
}, TrajectoryGizmo.prototype._segToArray = function (e) {
    let t = this._pixelVecToArray(e.pos),
        o = this._pixelVecToArray(e.inControl),
        i = this._pixelVecToArray(e.outControl);
    return t.concat(o).concat(i)
}, TrajectoryGizmo.prototype._initSegments = function () {
    let e = this._clip.getProperty("position", "", this._childPath) || [],
        t = [];
    for (let o = 0, i = e.length; o < i; o++) {
        let i = e[o],
            n = new Segment;
        n.originValue = i.value, n.keyframe = i, t.push(n);
        let r = i.motionPath || [];
        for (let e = 0; e < r.length; e++) {
            let o = r[e],
                i = new Segment;
            i.originValue = o, t.push(i)
        }
    }
    this._segments = t, this.initCurveTools(), this._updateSegments()
}, TrajectoryGizmo.prototype._updateSegments = function () {
    function e(e, i) {
        let n = cc.v2(e, i);
        return n = t.convertToWorldSpaceAR(n), o.worldToPixel(n)
    }
    let t = this.target.parent,
        o = this._view,
        i = this._segments;
    for (let t = 0, o = i.length; t < o; t++) {
        let o = i[t],
            n = o.originValue;
        2 === n.length ? (o.pos = e(n[0], n[1]), o.inControl = o.pos.clone(), o.outControl = o.pos.clone()) : 6 === n.length && (o.pos = e(n[0], n[1]), o.inControl = e(n[2], n[3]), o.outControl = e(n[4], n[5])), o.tool.plot(), o.keyframe && o.tool.curveTools[0].plot()
    }
}, TrajectoryGizmo.prototype._createSegmentTool = function (e) {
    let t = this._segmentGroup,
        o = this,
        i = !1,
        n = new SegmentTool(t, e, {
            beforeSelected: function (e) {
                -1 === e.curveTools.indexOf(o._selectedCurveTool) && e.curveTools[0].select(), o._selectedSegTool && o._selectedSegTool.unselect(), o._selectedSegTool = e
            },
            onDelete: function (e) {
                o._removeSegment(e)
            },
            start: function () {
                o._processing = !0, o._initSampledCurve(), i = !1
            },
            update: function (e) {
                i = !0, e.curveTools.forEach(function (e) {
                    e.plot()
                }), o._updateSampledCurves(), o._animationState.sample(), cc.engine.repaintInEditMode()
            },
            end: function () {
                o._processing = !1, i && o._clipChanged()
            }
        });
    return e.tool = n, n
}, TrajectoryGizmo.prototype.initCurveTools = function () {
    let e = this._segments,
        t = this._curveGroup,
        o = this._segmentGroup;
    t.clear(), o.clear();
    let i = this,
        n = {
            beforeSelected: function (e) {
                i._selectedCurveTool && i._selectedCurveTool.unselect(), i._selectedCurveTool = e
            },
            addSegment: function (e, t) {
                let o = v2(e, t);
                i._addSegment(o)
            }
        },
        r = CurveTool(t, "", n);
    for (let o = 0, i = e.length; o < i; o++) {
        let s = e[o],
            l = this._createSegmentTool(s);
        l.curveTools.push(r), r.segmentTools.push(l), o > 0 && s.keyframe && (r.plot(), o < i - 1 && ((r = CurveTool(t, "", n)).segmentTools.push(l), l.curveTools.push(r)))
    }
}, TrajectoryGizmo.prototype._addSegment = function (e) {
    let t = this._selectedCurveTool;
    if (!t) return;
    let o, i, n = t.segmentTools;
    for (let t = 0, r = n.length - 1; t < r; t++) {
        i = n[t];
        let r = n[t + 1],
            s = Utils.getNearestParameter(i.segment, r.segment, e);
        (!o || s.dist < o.dist) && ((o = s).seg1 = i, o.seg2 = r)
    }
    let r = Utils.createSegmentWithNearset(o);
    r.originValue = this._segToArray(r);
    let s = this._segments,
        l = s.indexOf(o.seg2.segment);
    s.splice(l, 0, r), i = this._createSegmentTool(r);
    let a = t.segmentTools.indexOf(o.seg2);
    t.segmentTools.splice(a, 0, i), i.curveTools.push(t), i.show(), i.select(), t.plot(), this._updateSampledCurves(), this._clipChanged()
}, TrajectoryGizmo.prototype._addKeySegment = function (e, t, o) {
    let i, n;
    if (0 === o.length || t < o[0].frame) i = 0;
    else
        for (i = 0, n = o.length; i < n && !(o[i].frame > t); i++);
    let r = {
        frame: t,
        value: [e.x, e.y],
        motionPath: []
    };
    return o.splice(i, 0, r), i
}, TrajectoryGizmo.prototype._removeSegment = function (e) {
    let t = this._segments,
        o = e.segment,
        i = e.curveTools[0],
        n = i.segmentTools;
    e.hide(), t.splice(t.indexOf(o), 1), n.splice(n.indexOf(e), 1), i.plot(), this._updateSampledCurves(), this._clipChanged(), this._selectedSegTool === e && (this._selectedSegTool = null)
}, TrajectoryGizmo.prototype._clipChanged = function () {
    this._clipChanging = !0, Editor.Ipc.sendToWins("scene:animation-clip-changed", {
        uuid: this._clip._uuid,
        data: this._clip.serialize(),
        clip: this._clip.name
    })
}, TrajectoryGizmo.prototype._initSampledCurve = function () {
    let e, t = this._animationState.curves;
    for (let o = 0, i = t.length; o < i; o++) {
        let i = t[o];
        if (i.target === this.target && "position" === i.prop) {
            e = i;
            break
        }
    }
    this._sampledCurve = e
}, TrajectoryGizmo.prototype._updateSampledCurves = function () {
    function e(e) {
        for (let t = 0, o = e.length; t < o; t++) e[t] = Editor.Math.toPrecision(e[t], a);
        return e
    }
    let t, o = this._segments,
        i = [],
        n = this._clip,
        r = this._sampledCurve;
    if (!r) return;
    let s, l, a = Editor.Math.numOfDecimalsF(1 / this._view.scale);
    for (s = 0, l = o.length; s < l; s++) {
        let n = o[s];
        if (n.keyframe) {
            t = n.keyframe, n.originValue = t.value = e(this._pixelVecToArray(n.pos)), t.motionPath = [], i.push(t);
            continue
        }
        let r = n.originValue = e(this._segToArray(n));
        t.motionPath.push(r)
    }
    let c = [];
    for (r.ratios = [], r.types = [], r.values = [], s = 0, l = i.length; s < l; s++) {
        let e = (t = i[s]).frame / n.duration;
        r.ratios.push(e), r.values.push(t.value), r.types.push(t.curve), t.motionPath && t.motionPath.length > 0 ? c.push(t.motionPath) : c.push(null)
    }
    sampleMotionPaths(c, r, n.duration, n.sample)
}, TrajectoryGizmo.prototype.assetChanged = function (e) {
    let t = this._clip;
    t && t._uuid === e && !this._hidden && cc.AssetLibrary.loadAsset(e, function (e, t) {
        this.updateClip(t)
    }.bind(this))
}, TrajectoryGizmo.prototype.updateClip = function (e) {
    if (this._clipChanging) return this._clipChanging = !1, void 0;
    this._clip._uuid !== e._uuid || this._hidden || (this._clip = e, this._initSampledCurve(), this._initSegments())
}, TrajectoryGizmo.animationChanged = !1, TrajectoryGizmo.state = "segment", module.exports = TrajectoryGizmo;