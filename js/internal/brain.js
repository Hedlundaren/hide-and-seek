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
    Brain.prototype.think = function () {
        switch (this.getBrain()) {
            case "stupid":
                this.thinkStupid();
                break;
            case "simple":
                this.thinkSimple();
                break;
            case "forward":
                this.thinkForward();
                break;
        }
    };
    Brain.prototype.thinkStupid = function () {
        var move = "";
        var num = Math.floor(Math.random() * 4);
        switch (num) {
            case 0:
                move = "left";
                break;
            case 1:
                move = "up";
                break;
            case 2:
                move = "right";
                break;
            case 3:
                move = "down";
                break;
        }
        this._agent.setMove(move);
    };
    Brain.prototype.thinkSimple = function () {
        var move = "";
        while (move == "") {
            var num = Math.floor(Math.random() * 4);
            switch (num) {
                case 0:
                    if (this._agent.outerWallCheck("left")) {
                        var type = Environment._squares[this._agent.getLeftId()].getType();
                        if (type != "wall" && type != "red")
                            move = "left";
                    }
                    break;
                case 1:
                    if (this._agent.outerWallCheck("up")) {
                        var type = Environment._squares[this._agent.getUpId()].getType();
                        if (type != "wall" && type != "red")
                            move = "up";
                    }
                    break;
                case 2:
                    if (this._agent.outerWallCheck("right")) {
                        var type = Environment._squares[this._agent.getRightId()].getType();
                        if (type != "wall" && type != "red")
                            move = "right";
                    }
                    break;
                case 3:
                    if (this._agent.outerWallCheck("down")) {
                        var type = Environment._squares[this._agent.getDownId()].getType();
                        if (type != "wall" && type != "red")
                            move = "down";
                    }
                    break;
            }
        }
        move = this.slipRisk(move);
        this._agent.setMove(move);
    };
    Brain.prototype.thinkForward = function () {
        var reward = -999999;
        var temp_reward = -999999;
        var move = "";
        var id = this._agent._currentSquare;
        if (this.wallCheck(id, "left")) {
            temp_reward = Environment._squares[this._agent.getLeftId()].getReward();
            if (temp_reward > reward) {
                reward = temp_reward;
                move = "left";
            }
        }
        if (this.wallCheck(id, "up")) {
            temp_reward = Environment._squares[this._agent.getUpId()].getReward();
            if (temp_reward > reward) {
                reward = temp_reward;
                move = "up";
            }
        }
        if (this.wallCheck(id, "right")) {
            temp_reward = Environment._squares[this._agent.getRightId()].getReward();
            if (temp_reward > reward) {
                reward = temp_reward;
                move = "right";
            }
        }
        if (this.wallCheck(id, "down")) {
            temp_reward = Environment._squares[this._agent.getDownId()].getReward();
            if (temp_reward > reward) {
                reward = temp_reward;
                move = "down";
            }
        }
        this._agent.setMove(move);
    };
    Brain.prototype.slipRisk = function (move) {
        var num = Math.random();
        if (num <= 0.2) {
            switch (move) {
                case "left":
                    if (num <= 0.1)
                        return "down";
                    else
                        return "up";
                case "up":
                    if (num <= 0.1)
                        return "left";
                    else
                        return "right";
                case "right":
                    if (num <= 0.1)
                        return "up";
                    else
                        return "down";
                case "down":
                    if (num <= 0.1)
                        return "right";
                    else
                        return "left";
            }
        }
        return move;
    };
    Brain.prototype.wallCheck = function (id, direction) {
        switch (direction) {
            case "left":
                if (this._agent.outerWallCheck("left")) {
                    if (Environment._squares[this._agent.getLeftId()].getType() != "wall") {
                        return true;
                    }
                }
                break;
            case "up":
                if (this._agent.outerWallCheck("up")) {
                    if (Environment._squares[this._agent.getUpId()].getType() != "wall") {
                        return true;
                    }
                }
                break;
            case "right":
                if (this._agent.outerWallCheck("right")) {
                    if (Environment._squares[this._agent.getRightId()].getType() != "wall") {
                        return true;
                    }
                }
                break;
            case "down":
                if (this._agent.outerWallCheck("down")) {
                    if (Environment._squares[this._agent.getDownId()].getType() != "wall") {
                        return true;
                    }
                }
                break;
        }
    };
    return Brain;
}());
