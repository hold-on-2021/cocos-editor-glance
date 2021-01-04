function MissingReporter(e) {
    this.missingObjects = new Set, this.missingOwners = new Map, this.root = e
}
MissingReporter.prototype.reset = function () {
    this.missingObjects.clear(), this.missingOwners.clear(), this.root = null
}, MissingReporter.prototype.stash = function (e) {
    this.missingObjects.add(e)
}, MissingReporter.prototype.stashByOwner = function (e, s, t) {
    var n = this.missingOwners.get(e);
    n || (n = {}, this.missingOwners.set(e, n)), n[s] = t
}, MissingReporter.prototype.removeStashedByOwner = function (e, s) {
    var t = this.missingOwners.get(e);
    if (t && s in t) {
        var n = t[s];
        delete t[s];
        for (var i in t) return n;
        return this.missingOwners.delete(e), n
    }
}, MissingReporter.prototype.report = null, MissingReporter.prototype.reportByOwner = null, MissingReporter.getObjectType = function (e) {
    return e instanceof cc.Component ? "component" : e instanceof cc.Prefab ? "prefab" : e instanceof cc.SceneAsset ? "scene" : "asset"
}, MissingReporter.INFO_DETAILED = " Detailed information:\n", module.exports = MissingReporter;