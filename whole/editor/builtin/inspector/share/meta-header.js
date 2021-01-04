"use strict";Vue.component("cc-meta-header",{template:'\n    <div :style="cssHost">\n      <img :style="cssIcon" :src="icon"></img>\n      <div :style="cssTitle">{{ target.__name__ }}</div>\n\n      <span class="flex-1"></span>\n\n      <ui-button class="tiny red transparent"\n        v-disabled="!target.__dirty__"\n        @confirm="revert"\n      >\n        <i class="icon-cancel"></i>\n      </ui-button>\n      <ui-button class="tiny green transparent"\n        v-disabled="!target.__dirty__"\n        @confirm="apply"\n      >\n        <i class="icon-ok"></i>\n      </ui-button>\n    </div>\n  ',data:()=>({cssHost:{display:"flex",flex:"none",flexDirection:"row",alignItems:"center",paddingBottom:"2px",margin:"5px 10px",marginBottom:"10px",borderBottom:"1px solid #666",height:"24px",overflow:"hidden"},cssIcon:{marginRight:"5px"},cssTitle:{fontWeight:"bold",textOverflow:"ellipsis",overflow:"hidden"}}),props:{icon:String,target:Object},methods:{revert(){Editor.UI.fire(this.$el,"meta-revert",{uuid:this.target.uuid})},apply(){Editor.UI.fire(this.$el,"meta-apply",{uuid:this.target.uuid})}}});