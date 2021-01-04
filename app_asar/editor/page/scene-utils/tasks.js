const Async = require("async");
let Tasks = {
    _stashArray: null,
    init() {
        this.silence = !0, this._genTaskID = -1, this._queue = Async.queue((s, t) => {
            let e = function (e) {
                    e ? this._handleError(s, e) : this.silence || Editor.log(`Finish task ${s.name}`), t.apply(null, arguments)
                }.bind(this),
                i = s.params || [];
            i.push(e);
            let a = s.target || this;
            s.id = ++this._genTaskID % 100;
            try {
                this.silence || Editor.log(`Handling task ${s.name}`), s.run.apply(a, i)
            } catch (e) {
                this._handleError(s, e), t(e)
            }
        })
    },
    stash() {
        this._stashArray = []
    },
    unshiftStash() {
        var s = this._stashArray;
        if (s) {
            for (let t = s.length - 1; t >= 0; t--) this._queue.unshift(s[t][0], s[t][1]);
            this._stashArray = null
        }
    },
    push(s, t) {
        this.silence || Editor.log(`Push task ${s.name}`), this._stashArray ? this._stashArray.push([s, t]) : this._queue.push(s, t)
    },
    kill() {
        this._queue.kill()
    },
    _handleError(s, t) {
        Editor.failed(`Task [${s.name}] run error, stop running other tasks.\n ${t.stack||t}`), this.kill()
    },
    get runningTask() {
        let s = this._queue.workersList();
        return s.length > 0 ? s[0].data : null
    }
};
module.exports = _Scene.Tasks = Tasks;