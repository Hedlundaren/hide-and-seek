var Square = (function () {
    function Square(pos, id, type, size, radius) {
        this._position = pos;
        this._id = id;
        this._center = this._position.add($V([size / 2, size / 2]));
        this._type = type;
        this._empty = true;
        this._utility = 0.0;
        this._envSize = Math.sqrt(Environment._squares.length);
        this._graphics = new PIXI.Graphics();
        this._graphics.beginFill(0xffffff);
        this._graphics.lineStyle(1, 0xdddddd);
        this._graphics.drawRoundedRect(pos.elements[0], pos.elements[1], size, size, radius);
        Renderer._stage.addChild(this._graphics);
    }
    Square.prototype.update = function (deltaTime) {
        if (this._graphics.alpha < 1 && this._empty)
            this._graphics.alpha += 0.05;
        if (this._graphics.alpha > 1 && this._empty)
            this._graphics.alpha -= 0.05;
    };
    Square.prototype.getId = function () {
        return this._id;
    };
    Square.prototype.getType = function () {
        return this._type;
    };
    Square.prototype.getUtility = function () {
        return this._utility;
    };
    Square.prototype.addUtility = function (U) {
        return this._utility += U;
    };
    Square.prototype.setUtility = function (U) {
        return this._utility = U;
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
    Square.prototype.getLeftId = function () { return this._id - this._envSize; };
    ;
    Square.prototype.getUpId = function () { return this._id - 1; };
    ;
    Square.prototype.getRightId = function () { return this._id + this._envSize; };
    ;
    Square.prototype.getDownId = function () { return this._id + 1; };
    ;
    Square.prototype.hitWall = function () {
        this._graphics.alpha = 0.1;
    };
    Square.prototype.enterSquare = function () {
        this._empty = false;
        this._graphics.alpha = 1.05;
    };
    Square.prototype.leaveSquare = function () {
        this._empty = true;
    };
    Square.prototype.setColor = function (type, theme) {
        if (theme == "night") {
            switch (type) {
                case "neutral":
                    this._graphics.tint = 0xaaaaaa;
                    break;
                case "start":
                    this._graphics.tint = 0xcccccc;
                    break;
                case "green":
                    this._graphics.tint = 0x77bb77;
                    break;
                case "red":
                    this._graphics.tint = 0xbb7777;
                    break;
                case "wall":
                    this._graphics.tint = 0x666666;
                    break;
                case "wallhit":
                    this._graphics.tint = 0xdd5555;
                    break;
                default:
                    this._graphics.tint = 16777215;
            }
        }
        else if (theme == "day") {
            switch (type) {
                case "neutral":
                    this._graphics.tint = 16777215;
                    break;
                case "start":
                    this._graphics.tint = 0xdddddd;
                    break;
                case "green":
                    this._graphics.tint = 0x99dd99;
                    break;
                case "red":
                    this._graphics.tint = 0xdd9999;
                    break;
                case "black":
                    this._graphics.tint = 16777225;
                    break;
                case "blue":
                    this._graphics.tint = 16777215;
                    break;
                case "wall":
                    this._graphics.tint = 0xaaaaaa;
                    break;
                case "wallhit":
                    this._graphics.tint = 0xff9999;
                    break;
                default:
                    this._graphics.tint = 16777215;
            }
        }
    };
    Square.prototype.setType = function (type, theme) {
        this._type = type;
        this.setColor(type, theme);
    };
    return Square;
}());
