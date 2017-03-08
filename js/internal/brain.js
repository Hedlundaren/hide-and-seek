var Path = (function () {
    function Path() {
        this._path = [];
        this._pathIds = [];
        this._reward = 0;
    }
    Path.prototype.addReward = function (reward) { this._reward = this._reward + reward; };
    Path.prototype.addDirection = function (direction) { this._path.push(direction); };
    Path.prototype.addId = function (id) { this._pathIds.push(id); };
    Path.prototype.setArrayId = function (array_id) { this._arrayId = array_id; };
    Path.prototype.getArrayId = function () { return this._arrayId; };
    Path.prototype.getReward = function () { return this._reward; };
    Path.prototype.getFirst = function () { return this._path[0]; };
    ;
    Path.prototype.getFirstId = function () { return this._pathIds[0]; };
    ;
    Path.prototype.getLast = function () { return this._path[this._path.length - 1]; };
    ;
    Path.prototype.getLastId = function () { return this._pathIds[this._path.length - 1]; };
    ;
    Path.prototype.reset = function () {
        this._path = [];
        this._pathIds = [];
        this._reward = 0;
    };
    return Path;
}());
var Brain = (function () {
    function Brain(agent, type) {
        var _this = this;
        this.onKeyDown = function (e) {
            switch (e.key) {
                case "Control":
                    alert(_this.getId(_this._agent._currentSquare, "up"));
                    break;
            }
        };
        this._type = type;
        this._agent = agent;
        this._frontier = [];
        this._iterations = 0;
        window.addEventListener('keydown', this.onKeyDown, false);
    }
    Brain.prototype.reset = function () {
        for (var i = 0; i < this._frontier.length; i++) {
            this._frontier[i].reset();
        }
        this._iterations = 0;
        this._frontier = [];
    };
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
                this.thinkForward(50);
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
        this._agent.setMove(move);
    };
    Brain.prototype.addPath = function (direction, path, prev_square_id, array_id) {
        if (!this.wall(prev_square_id, direction)) {
            var current_square_id = this.getId(prev_square_id, direction);
            var temp = new Path();
            for (var i = 0; i < path._path.length; i++) {
                temp._path[i] = path._path[i];
                temp._pathIds[i] = path._pathIds[i];
            }
            temp.addReward(Environment._squares[current_square_id].getReward() + path.getReward());
            temp.addDirection(direction);
            temp.addId(current_square_id);
            temp.setArrayId(array_id);
            var already_expanded = false;
            for (var i = 0; i < this._frontier.length; i++) {
                for (var j = 0; j < this._frontier[i]._pathIds.length; j++) {
                    if (this._frontier[i]._pathIds[j] == current_square_id) {
                        already_expanded = true;
                        if (this._frontier[i].getReward() <= temp.getReward()) {
                            this._frontier.push(temp);
                            this._frontier.splice(this._frontier[i].getArrayId(), 1);
                        }
                        else
                            break;
                    }
                }
            }
            if (!already_expanded) {
                this._frontier.push(temp);
            }
        }
    };
    Brain.prototype.expandNode = function (square_id, step, path) {
        this._iterations++;
        var direction = "";
        this._frontier.splice(path.getArrayId(), 1);
        direction = "left";
        this.addPath(direction, path, square_id, this._frontier.length);
        direction = "up";
        this.addPath(direction, path, square_id, this._frontier.length);
        direction = "right";
        this.addPath(direction, path, square_id, this._frontier.length);
        direction = "down";
        this.addPath(direction, path, square_id, this._frontier.length);
    };
    Brain.prototype.thinkForward = function (step) {
        var move = "";
        var path = new Path();
        var square_id = this._agent._currentSquare;
        this.expandNode(square_id, step, path);
        while (step > this._iterations) {
            var next = 0;
            var maxReward = this._frontier[next].getReward();
            for (var i = 1; i < this._frontier.length; i++) {
                if (this._frontier[i].getReward() > maxReward) {
                    next = i;
                    maxReward = this._frontier[i].getReward();
                }
            }
            var newId = this._frontier[next].getLastId();
            this.expandNode(newId, step, this._frontier[next]);
        }
        var next = 0;
        var maxReward = this._frontier[0].getReward();
        for (var i = 1; i < this._frontier.length; i++) {
            if (this._frontier[i].getReward() > maxReward) {
                next = i;
                maxReward = this._frontier[i].getReward();
            }
        }
        move = this._frontier[next].getFirst();
        this._agent.setMove(move);
        this.reset();
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
    Brain.prototype.getId = function (id, move) {
        switch (move) {
            case "left": return this.getLeftId(id);
            case "up": return this.getUpId(id);
            case "right": return this.getRightId(id);
            case "down": return this.getDownId(id);
            default: return id;
        }
    };
    Brain.prototype.getLeftId = function (id) { return id - Environment._sideLength; };
    ;
    Brain.prototype.getUpId = function (id) { return id - 1; };
    ;
    Brain.prototype.getRightId = function (id) { return id + Environment._sideLength; };
    ;
    Brain.prototype.getDownId = function (id) { return id + 1; };
    ;
    Brain.prototype.outerWall = function (id, direction) {
        switch (direction) {
            case "left": return id <= (Environment._sideLength - 1);
            case "up": return id % Environment._sideLength == 0;
            case "right": return id >= Environment._squares.length - Environment._sideLength;
            case "down": return (id + 1) % Environment._sideLength == 0;
        }
    };
    Brain.prototype.wall = function (id, direction) {
        if (!this.outerWall(id, direction)) {
            var slot = this.getId(id, direction);
            if (Environment._squares[slot].getType() == "wall") {
                return true;
            }
        }
        else {
            return true;
        }
        return false;
    };
    return Brain;
}());
