cc.Font.prototype.createNode = function (e) {
    var n = new cc.Node(this.name);
    return n.addComponent(cc.Label).font = this, e(null, n)
};