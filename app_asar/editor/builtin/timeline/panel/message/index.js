"use strict";
const editor = require("./editor"),
    scene = require("./scene"),
    asset = require("./asset"),
    animation = require("./animation"),
    selection = require("./selection"),
    timeline = require("./timeline");
let messages = {};
Object.keys(editor).forEach(e => {
    messages[`editor:${e}`] = editor[e]
}), Object.keys(scene).forEach(e => {
    messages[`scene:${e}`] = scene[e]
}), Object.keys(asset).forEach(e => {
    messages[`asset-db:${e}`] = asset[e]
}), Object.keys(animation).forEach(e => {
    messages[`animation:${e}`] = animation[e]
}), Object.keys(selection).forEach(e => {
    messages[`selection:${e}`] = selection[e]
}), Object.keys(timeline).forEach(e => {
    messages[`timeline:${e}`] = timeline[e]
}), module.exports = messages;