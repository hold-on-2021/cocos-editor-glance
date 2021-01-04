"use strict";Vue.component("cc-object-prop",{template:'\n    <ui-prop\n      :tooltip="target.attrs.tooltip"\n      :name="target.name"\n      :indent="indent"\n      v-readonly="target.attrs.readonly"\n      foldable\n    >\n      <div class="child">\n        <template v-for="prop in target.value">\n          <component\n            v-if="prop.attrs.visible !== false"\n            :is="prop.compType"\n            :target.sync="prop"\n            :indent="indent+1"\n          ></component>\n        </template>\n      </div>\n    </ui-prop>\n  ',props:{indent:{type:Number,default:0},target:{twoWay:!0,type:Object}}});