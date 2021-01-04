"use strict";
let VueUtils = {};
module.exports = VueUtils, VueUtils.init = function () {
    let e = window.Vue;
    e && (e.directive("value", {
        twoWay: !0,
        bind() {
            this.handler = (e => {
                this.set(e.detail.value)
            }), this.el.addEventListener("change", this.handler)
        },
        unbind() {
            this.el.removeEventListener("change", this.handler)
        },
        update(e) {
            this.el.value = e
        }
    }), e.directive("disabled", {
        update(e) {
            this.el.disabled = e
        }
    }), e.directive("readonly", {
        update(e) {
            this.el.readonly = e
        }
    }))
};