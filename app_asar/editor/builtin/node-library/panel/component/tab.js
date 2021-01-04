"use strict";
const fs = require("fs"),
    path = require("path");
module.exports = {
    name: "tab",
    template: fs.readFileSync(path.join(__dirname, "./tab.html"), "utf-8"),
    props: {
        tabindex: Number,
        toggletab: Function,
        tabs: Array
    }
};