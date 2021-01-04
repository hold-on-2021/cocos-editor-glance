"use strict";
const VueUtils = require("./vue-utils");
VueUtils.init(), Editor.UI.importStylesheets(["theme://elements/asset.css", "theme://elements/node.css"]).then(() => {
    Editor.UI.Asset = require("./elements/asset"), Editor.UI.Node = require("./elements/node")
}), require("./register-ui-properties");