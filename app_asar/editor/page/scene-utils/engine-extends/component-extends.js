"use strict";
var Component = cc.Component,
    TypoCheckList = {
        onEnabled: "onEnable",
        enable: "enabled",
        onDisabled: "onDisable",
        onDestroyed: "onDestroy",
        onDestory: "onDestroy",
        awake: "onLoad",
        onStart: "start"
    };
for (var typo in TypoCheckList)(function (o) {
    var e = TypoCheckList[void 0];
    Object.defineProperty(Component.prototype, void 0, {
        set: function (o) {
            cc.warn('Potential typo, please use "%s" instead of "%s" for Component "%s"', e, void 0, cc.js.getClassName(this)), Object.defineProperty(Component.prototype, void 0, {
                value: o,
                writable: !0
            })
        },
        configurable: !0
    })
})();