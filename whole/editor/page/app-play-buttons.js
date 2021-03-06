(() => {
    "use strict";
    Polymer({
        is: "app-play-buttons",
        properties: {
            platform: {
                type: String,
                value: "",
                reflectToAttribute: !0
            },
            platformList: {
                type: Array,
                value: function () {
                    return [{
                        value: "simulator",
                        text: "EDITOR_MAIN.preview.simulator"
                    }, {
                        value: "browser",
                        text: "EDITOR_MAIN.preview.browser"
                    }]
                }
            },
            disabled: {
                type: Boolean,
                value: !1,
                reflectToAttribute: !0
            }
        },
        observers: ["_platformChanged(platform)"],
        ready() {
            Editor.Profile.load("profile://global/settings.json", (e, t) => {
                this.platform = t.data["preview-platform"], this.loaded = !0
            })
        },
        _onPlayClick(e) {
            e.stopPropagation(), Editor.Ipc.sendToWins("scene:play-on-device"), Editor.Ipc.sendToMain("metrics:track-event", {
                category: "Project",
                action: "Preview Game",
                label: this.platform
            })
        },
        _onReloadClick(e) {
            e.stopPropagation(), Editor.Ipc.sendToWins("scene:reload-on-device"), Editor.Ipc.sendToMain("metrics:track-event", {
                category: "Project",
                action: "Preview Game",
                label: this.platform
            })
        },
        _platformChanged() {
            this.loaded && Editor.Profile.load("profile://global/settings.json", (e, t) => {
                t.data["preview-platform"] = this.platform, t.save()
            })
        },
        _T: e => Editor.T(e)
    })
})();