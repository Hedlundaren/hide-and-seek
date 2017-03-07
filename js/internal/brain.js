var Brain = (function () {
    function Brain(agent, type) {
        this._type = type;
        this._agent = agent;
    }
    Brain.prototype.setBrain = function (type) {
        this._agent.setBrainSelected(type, this._type);
        this._type = type;
    };
    Brain.prototype.getBrain = function () {
        return this._type;
    };
    Brain.prototype.thinkStupid = function () {
        var num = Math.floor(Math.random() * 4);
        switch (num) {
            case 0:
                this._agent.setMove("left");
                break;
            case 1:
                this._agent.setMove("up");
                break;
            case 2:
                this._agent.setMove("right");
                break;
            case 3:
                this._agent.setMove("down");
                break;
        }
    };
    Brain.prototype.thinkSimple = function () {
        this._agent.setMove("");
        while (this._agent.getMove() == "") {
            var num = Math.floor(Math.random() * 4);
            switch (num) {
                case 0:
                    if (this._agent.outerWallCheck("left")) {
                        var type = Environment._squares[this._agent.getLeftId()].getType();
                        if (type != "wall" && type != "red")
                            this._agent.setMove("left");
                    }
                    break;
                case 1:
                    if (this._agent.outerWallCheck("up")) {
                        var type = Environment._squares[this._agent.getUpId()].getType();
                        if (type != "wall" && type != "red")
                            this._agent.setMove("up");
                    }
                    break;
                case 2:
                    if (this._agent.outerWallCheck("right")) {
                        var type = Environment._squares[this._agent.getRightId()].getType();
                        if (type != "wall" && type != "red")
                            this._agent.setMove("right");
                    }
                    break;
                case 3:
                    if (this._agent.outerWallCheck("down")) {
                        var type = Environment._squares[this._agent.getDownId()].getType();
                        if (type != "wall" && type != "red")
                            this._agent.setMove("down");
                    }
                    break;
            }
        }
    };
    return Brain;
}());
