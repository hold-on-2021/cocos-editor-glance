cc.SpriteFrame.prototype.createNode = function (e) {
    var t = new cc.Node(this.name);
    return t.addComponent(cc.Sprite).spriteFrame = this, e(null, t)
};