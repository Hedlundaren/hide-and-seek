var Square = (function () {
    function Square(pos, type, size) {
        this._position = pos;
        this._center = this._position.add($V([size / 2, size / 2]));
        this._type = type;
        this._utility = 0.0;
        this._empty = true;
        this._graphics = new PIXI.Graphics();
        this._graphics.beginFill(0x444444);
        this._graphics.lineStyle(1, 0x555555);
        this._graphics.drawRect(pos.elements[0], pos.elements[1], size, size);
        Renderer._stage.addChild(this._graphics);
    }
    Square.prototype.update = function (deltaTime) {
        if (this._graphics.alpha < 1 && this._empty)
            this._graphics.alpha += 0.02;
        if (this._graphics.alpha > 1 && this._empty)
            this._graphics.alpha -= 0.01;
    };
    Square.prototype.getType = function () {
        return this._type;
    };
    Square.prototype.getUtility = function () {
        return this._utility;
    };
    Square.prototype.setUtility = function (U) {
        return this._utility += U;
    };
    Square.prototype.getReward = function () {
        switch (this._type) {
            case "neutral":
                return -0.04;
            case "green":
                return 1.0;
            case "red":
                return -1.0;
            default:
                return 0.0;
        }
    };
    Square.prototype.hitWall = function () {
        this._graphics.alpha = 0.1;
    };
    Square.prototype.enterSquare = function () {
        this._empty = false;
        this._graphics.alpha = 1.1;
    };
    Square.prototype.leaveSquare = function () {
        this._empty = true;
    };
    Square.prototype.setType = function (type) {
        this._type = type;
        switch (type) {
            case "neutral":
                this._graphics.tint = 16777215;
                break;
            case "start":
                this._graphics.tint = 999999999;
                break;
            case "green":
                this._graphics.tint = 57000000400;
                break;
            case "red":
                this._graphics.tint = 170001003900;
                this._graphics.tint = 15777215;
                break;
            case "orange":
                this._graphics.tint = 15577215;
                break;
            case "black":
                this._graphics.tint = 16777225;
                break;
            case "blue":
                this._graphics.tint = 233202;
                break;
            case "wall":
                this._graphics.tint = 16777225;
                break;
            case "wallhit":
                this._graphics.tint = 170001003900;
                this._graphics.tint = 16777215;
                break;
            default:
                this._graphics.tint = 16777215;
        }
    };
    return Square;
}());
