var Path = (function () {
    function Path() {
        this._path = [];
        this._pathIds = [];
        this._reward = 0;
    }
    Path.prototype.addReward = function (reward) { this._reward += reward; };
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
    Path.prototype.copy = function (other) {
        this._reward = other._reward;
        for (var i = 0; i < other._path.length; i++) {
            this._path[i] = other._path[i];
            this._pathIds[i] = other._pathIds[i];
        }
    };
    Path.prototype.reset = function () {
        this._path = [];
        this._pathIds = [];
        this._reward = 0;
    };
    return Path;
}());
var Brain = (function () {
    function Brain(agent, type) {
        this._type = type;
        this._agent = agent;
        this._frontier = [];
        this._iterations = 0;
    }
    Brain.prototype.reset = function () {
        this._iterations = 0;
        this._frontier = [];
        for (var i = 0; i < this._frontier.length; i++) {
            this._frontier[i].reset();
        }
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
                this.thinkForward(200);
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
    Brain.prototype.addPath = function (direction, path, id, array_id) {
        if (!this.wall(id, direction)) {
            var temp = new Path();
            temp.copy(path);
            temp.addDirection(direction);
            temp.setArrayId(array_id);
            temp.addId(id);
            temp.addReward(Environment._squares[this.getId(id, direction)].getReward());
            this._frontier.push(temp);
        }
    };
    Brain.prototype.expandNode = function (id, step, path) {
        var direction = "";
        direction = "left";
        this.addPath(direction, path, id, this._frontier.length - 1);
        direction = "up";
        this.addPath(direction, path, id, this._frontier.length - 1);
        direction = "right";
        this.addPath(direction, path, id, this._frontier.length - 1);
        direction = "down";
        this.addPath(direction, path, id, this._frontier.length - 1);
        var next = 0;
        var maxReward = this._frontier[next].getReward();
        for (var i = 1; i < this._frontier.length; i++) {
            if (this._frontier[i].getReward() > maxReward) {
                next = i;
                maxReward = this._frontier[i].getReward();
            }
        }
        this._iterations++;
        while (step > this._iterations) {
            var newDirection = this._frontier[next].getFirst();
            var newId = this._frontier[next].getFirstId();
            this.expandNode(newId, step, this._frontier[next]);
        }
    };
    Brain.prototype.thinkForward = function (step) {
        var move = "";
        var path = new Path();
        var id = this._agent._currentSquare;
        this.expandNode(id, step, path);
        var next = 0;
        var maxReward = this._frontier[0].getReward();
        for (var i = 1; i < this._frontier.length; i++) {
            if (this._frontier[i].getReward() > maxReward) {
                next = i;
                maxReward = this._frontier[i].getReward();
            }
        }
        move = this._frontier[next].getFirst();
        console.log(this._frontier.length);
        this.reset();
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
    Brain.prototype.getUpId = function (id) { return Environment._sideLength - 1; };
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
