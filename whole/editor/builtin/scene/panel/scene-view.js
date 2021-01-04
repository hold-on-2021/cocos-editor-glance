(function(){"use strict";Editor.polymerElement({listeners:{mousedown:"_onMouseDown",mousewheel:"_onMouseWheel",mousemove:"_onMouseMove",mouseleave:"_onMouseLeave",keydown:"_onKeyDown",keyup:"_onKeyUp"},properties:{scale:{type:Number,value:1},mode:{type:String,value:"scene"}},_policy:null,ready:function(){var i=[0,1,1],e=[1,0,1];this.$.grid.setScaleH([5,2],.01,1e3),this.$.grid.setMappingH(i[0],i[1],i[2]),this.$.grid.setScaleV([5,2],.01,1e3),this.$.grid.setMappingV(e[0],e[1],e[2]),this.$.grid.setAnchor(.5,.5),this.addEventListener("mousedown",this._onCaptureMousedown.bind(this),!0),this.$.editButtons.addEventListener("mousedown",i=>i.stopPropagation())},_T:function(i){return Editor.T(i)},detached:function(){clearInterval(this._initTimer)},init:function(){this._initTimer=setInterval(()=>{let i=this.getBoundingClientRect();0===i.width&&0===i.height||(clearInterval(this._initTimer),cc.engine.isInitialized?(this.fire("engine-ready"),this.fire("scene-view-ready"),this._resize()):this._initEngine(()=>{this.$.gizmosView.sceneToPixel=this.sceneToPixel.bind(this),this.$.gizmosView.worldToPixel=this.worldToPixel.bind(this),this.$.gizmosView.pixelToScene=this.pixelToScene.bind(this),this.$.gizmosView.pixelToWorld=this.pixelToWorld.bind(this),this._resize()}))},100);var i=cc.ContainerStrategy.extend({apply:function(i,e){var t,n,o=i._frameSize.width,s=i._frameSize.height,r=cc.container.style,c=e.width,d=e.height,h=o/c,a=s/d;h<a?(t=o,n=d*h):(t=c*a,n=s);t=o-2*Math.round((o-t)/2),n=s-2*Math.round((s-n)/2),this._setupContainer(i,t,n),r.margin="0"}});this._policy=new cc.ResolutionPolicy(new i,cc.ContentStrategy.SHOW_ALL)},initPosition:function(i,e,t){this.scale=t,this.$.grid.xAxisSync(i,t),this.$.grid.yAxisSync(e,t),this.$.grid.repaint(),this.$.gizmosView.scale=t;["_position","_rotationX","_rotationY","_scaleX","_scaleY","_skewX","_skewY","_name"].forEach(function(i){cc.Class.Attr.setClassAttr(cc.Scene,i,"serializable",!1)});var n=cc.director.getScene();n.scale=cc.v2(this.$.grid.xAxisScale,this.$.grid.yAxisScale),n.setPosition(cc.v2(this.$.grid.xDirection*this.$.grid.xAxisOffset,this.$.grid.yDirection*this.$.grid.yAxisOffset)),cc.engine.repaintInEditMode()},_resize:function(){let i=this.getBoundingClientRect();if((0!==i.width||0!==i.height)&&(this.$.grid.resize(),this.$.grid.repaint(),this.$.gizmosView.resize(),cc.engine.isInitialized)){var e=cc.director.getScene();e&&(cc.view.setCanvasSize(i.width,i.height),cc.view.setDesignResolutionSize(i.width,i.height,this._policy||cc.ResolutionPolicy.SHOW_ALL),e.scale=cc.v2(this.$.grid.xAxisScale,this.$.grid.yAxisScale),e.setPosition(cc.v2(this.$.grid.xDirection*this.$.grid.xAxisOffset,this.$.grid.yDirection*this.$.grid.yAxisOffset)),cc.engine.repaintInEditMode())}},_initEngine:function(i){var e=this.$["engine-canvas"],t=this.getBoundingClientRect();e.width=t.width,e.height=t.height;var n=Editor.remote._projectProfile,o={id:"engine-canvas",width:t.width,height:t.height,designWidth:t.width,designHeight:t.height,groupList:n.data["group-list"],collisionMatrix:n.data["collision-matrix"]};cc.engine.init(o,()=>{this.fire("engine-ready"),_Scene.initScene(e=>{if(e)return this.fire("scene-view-init-error",e),void 0;this.fire("scene-view-ready"),i&&i()})})},adjustToCenter:function(i,e){var t,n,o,s;if(e)o=e.width,s=e.height,t=e.x,n=e.y;else{var r=cc.engine.getDesignResolutionSize();o=r.width,s=r.height,t=0,n=0}var c,d=this.getBoundingClientRect(),h=d.width-2*i,a=d.height-2*i;if(o<=h&&s<=a)c=1;else{var l=Editor.Utils.fitSize(o,s,h,a);c=l[0]<l[1]?o<=0?1:l[0]/o:s<=0?1:l[1]/s,o=l[0],s=l[1]}this.initPosition(this.$.grid.xDirection*((d.width-o)/2-t*c),this.$.grid.yDirection*((d.height-s)/2-n*c),c)},sceneToPixel:function(i){return cc.v2(this.$.grid.valueToPixelH(i.x),this.$.grid.valueToPixelV(i.y))},worldToPixel:function(i){var e=cc.director.getScene().convertToNodeSpaceAR(i);return this.sceneToPixel(e)},pixelToScene:function(i){return cc.v2(this.$.grid.pixelToValueH(i.x),this.$.grid.pixelToValueV(i.y))},pixelToWorld:function(i){var e=cc.director.getScene();return cc.v2(e.convertToWorldSpaceAR(this.pixelToScene(i)))},_onCaptureMousedown:function(i){if(3===i.which||2===i.which||this.movingScene)return i.stopPropagation(),Editor.UI.startDrag("-webkit-grabbing",i,(i,e,t)=>{this.$.grid.pan(e,t),this.$.grid.repaint();cc.director.getScene().setPosition(cc.v2(this.$.grid.xDirection*this.$.grid.xAxisOffset,this.$.grid.yDirection*this.$.grid.yAxisOffset)),cc.engine.repaintInEditMode()},i=>{i.shiftKey?this.style.cursor="-webkit-grab":this.style.cursor=""}),void 0},_onMouseDown:function(i){if(i.stopPropagation(),1===i.which){var e=!1,t=Editor.Selection.curSelection("node");(i.metaKey||i.ctrlKey)&&(e=!0);var n=i.offsetX,o=i.offsetY;Editor.UI.startDrag("default",i,function(i,s,r,c,d){if(!(c*c+d*d<4)){var h=n,a=o;c<0&&(h+=c,c=-c),d<0&&(a+=d,d=-d),this.$.gizmosView.updateSelectRect(h,a,c,d);var l,g,u=_Scene.rectHitTest(h,a,c,d);if(e)for(g=t.slice(),l=0;l<u.length;++l)-1===g.indexOf(u[l].uuid)&&g.push(u[l].uuid);else for(g=[],l=0;l<u.length;++l)g.push(u[l].uuid);Editor.Selection.select("node",g,!0,!1)}}.bind(this),function(i,s,r,c,d){if(c*c+d*d<4){var h=_Scene.hitTest(n,o);e?h&&(-1===t.indexOf(h.uuid)?Editor.Selection.select("node",h.uuid,!1,!0):Editor.Selection.unselect("node",h.uuid,!0)):h?Editor.Selection.select("node",h.uuid,!0,!0):Editor.Selection.clear("node")}else Editor.Selection.confirm(),this.$.gizmosView.fadeoutSelectRect()}.bind(this))}},_onMouseWheel:function(i){i.stopPropagation();var e=Editor.Utils.smoothScale(this.scale,i.wheelDelta);e=Editor.Math.clamp(e,this.$.grid.hticks.minValueScale,this.$.grid.hticks.maxValueScale),this.scale=e,this.$.grid.xAxisScaleAt(i.offsetX,e),this.$.grid.yAxisScaleAt(i.offsetY,e),this.$.grid.repaint(),this.$.gizmosView.scale=e;var t=cc.director.getScene();t.scale=cc.v2(this.$.grid.xAxisScale,this.$.grid.yAxisScale),t.setPosition(cc.v2(this.$.grid.xDirection*this.$.grid.xAxisOffset,this.$.grid.yDirection*this.$.grid.yAxisOffset)),cc.engine.repaintInEditMode()},_onMouseMove:function(i){if(i.stopPropagation(),!this.movingScene){var e=_Scene.hitTest(i.offsetX,i.offsetY),t=e?e.uuid:null;Editor.Selection.hover("node",t)}},_onMouseLeave:function(){Editor.Selection.hover("node",null)},_onKeyDown:function(i){i.stopPropagation(),"space"===Editor.KeyCode(i.which)&&(this.style.cursor="-webkit-grab",this.movingScene=!0)},_onKeyUp:function(i){i.stopPropagation(),"space"===Editor.KeyCode(i.which)&&(this.style.cursor="",this.movingScene=!1)},_inEditMode:function(i){return"scene"!==i},_editModeIcon:function(i){return"scene"===i?"":Editor.url(`app://editor/builtin/scene/icon/${i}.png`)},_onSaveEditMode:function(){_Scene.EditMode.save()},_onCloseEditMode:function(){_Scene.EditMode.pop()}})})();