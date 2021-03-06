"use strict";
let _stepFloat = .1,
    _stepInt = 1,
    _shiftStep = 10;
module.exports = {
    get stepFloat() {
        return _stepFloat
    },
    set stepFloat(t) {
        t = parseFloat(t), _stepFloat = 0 === t || isNaN(t) ? .1 : t
    },
    get stepInt() {
        return _stepInt
    },
    set stepInt(t) {
        t = parseInt(t), _stepInt = 0 === t || isNaN(t) ? 1 : t
    },
    get shiftStep() {
        return _shiftStep
    },
    set shiftStep(t) {
        t = parseInt(t), _shiftStep = 0 === t || isNaN(t) ? 10 : t
    }
};