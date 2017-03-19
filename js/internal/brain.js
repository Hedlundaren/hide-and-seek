var Path = (function () {
    function Path() {
        this._directions = [];
        this._squareIds = [];
        this._reward = 0;
        this._squares = [];
        this.resetSquares();
    }
    Path.prototype.addReward = function (reward) { this._reward = this._reward + reward; };
    Path.prototype.addDirection = function (direction) { this._directions.push(direction); };
    Path.prototype.addSquareId = function (id) { this._squareIds.push(id); };
    Path.prototype.getReward = function () { return this._reward; };
    Path.prototype.getFirst_Direction = function () { return this._directions[0]; };
    ;
    Path.prototype.getFirst_SquareId = function () { return this._squareIds[0]; };
    ;
    Path.prototype.getLast_Direction = function () { return this._directions[this._directions.length - 1]; };
    ;
    Path.prototype.getLast_SquareId = function () { return this._squareIds[this._squareIds.length - 1]; };
    ;
    Path.prototype.copy = function (path) {
        this._reward = path.getReward();
        for (var i = 0; i < path._directions.length; i++) {
            this.addSquareId(path._squareIds[i]);
            this.addDirection(path._directions[i]);
        }
        this._squares = [];
        for (var i = 0; i < path._squares.length; i++) {
            this._squares.push(path._squares[i]);
        }
    };
    Path.prototype.resetSquares = function () {
        this._squares = [];
        for (var i = 0; i < Environment._squares.length; i++) {
            var newSquare;
            newSquare = new Square($V([0, 0]), Environment._squares[i].getId(), Environment._squares[i].getType, 0, 0);
            newSquare.copy(Environment._squares[i]);
            this._squares.push(newSquare);
        }
    };
    Path.prototype.reset = function () {
        this._directions = [];
        this._squareIds = [];
        this._reward = 0;
        this.resetSquares();
    };
    return Path;
}());
var Brain = (function () {
    function Brain(agent, type) {
        this.onKeyDown = function (e) {
            switch (e.key) {
                case "Control":
                    break;
            }
        };
        this._type = type;
        this._agent = agent;
        this._frontier = [];
        this._iterations = 0;
        this._sloppy = false;
        this._done = false;
        this._avoid_red = false;
        window.addEventListener('keydown', this.onKeyDown, false);
    }
    Brain.prototype.Done = function () {
        this._done = true;
        this._agent.toggleAutoMove();
    };
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
        if (type == "careful")
            this._avoid_red = true;
        else
            this._avoid_red = false;
        Sprite.setTexture("textures/" + type + ".png");
    };
    Brain.prototype.getBrain = function () {
        return this._type;
    };
    Brain.prototype.addFrontier = function (path) {
        this._frontier.push(path);
    };
    Brain.prototype.setMove = function (move) {
        if (this._sloppy) {
            move = this.slipRisk(move);
        }
        this._agent.setMove(move);
    };
    Brain.prototype.toggleSloppy = function () {
        this._sloppy = !this._sloppy;
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
                this.thinkForward(250);
                this._avoid_red = false;
                break;
            case "careful":
                this.thinkForward(250);
                this._avoid_red = true;
                break;
            case "value":
                this.thinkValue(50);
                break;
            case "policy":
                this.thinkPolicy(50);
                break;
        }
    };
    Brain.prototype.thinkValue = function (N_ITERATIONS) {
        var N_STATES = Environment._squares.length;
        for (var square_id = 0; square_id < N_STATES; square_id++) {
            Environment._squares[square_id].setUtility(0);
        }
        for (var i = 0; i < N_ITERATIONS; i++) {
            this.valueDetermination(Environment._squares);
            console.log("(" + i + ") : " + Environment._squares[this._agent._currentSquare].getUtility());
        }
        var best_move = this.getBestPolicy(Environment._squares, this._agent._currentSquare);
        if (Environment._squares[this._agent._currentSquare].getUtility() < 0) {
            this.Done();
            this.setMove("");
        }
        else {
            this.setMove(best_move);
        }
    };
    Brain.prototype.thinkPolicy = function (N_ITERATIONS) {
        var N_STATES = Environment._squares.length;
        for (var square_id = 0; square_id < N_STATES; square_id++) {
            Environment._squares[square_id].setUtility(0);
        }
        this.policyUpdate(Environment._squares, this._agent._currentSquare);
        for (var i = 0; i < N_ITERATIONS; i++) {
            this.policyEvaluation(Environment._squares);
            this.policyUpdate(Environment._squares, this._agent._currentSquare);
        }
        var best_move = Environment._squares[this._agent._currentSquare].getPolicy();
        if (Environment._squares[this._agent._currentSquare].getUtility() < 0) {
            this.Done();
            this.setMove("");
        }
        else {
            this.setMove(best_move);
        }
    };
    Brain.prototype.valueDetermination = function (squares) {
        var N_STATES = squares.length;
        for (var square_id = 0; square_id < N_STATES; square_id++) {
            var PU = [];
            var PU_dir = [];
            var R = squares[square_id].getReward();
            var gamma = 0.99;
            if (!this.wall(square_id, "left")) {
                var PU_left = 0.8 * squares[this.getId(square_id, "left")].getUtility();
                if (!this.wall(square_id, "down"))
                    PU_left += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
                if (!this.wall(square_id, "up"))
                    PU_left += 0.1 * (squares[this.getId(square_id, "up")].getUtility());
                PU.push(PU_left);
                PU_dir.push("left");
            }
            if (!this.wall(square_id, "up")) {
                var PU_up = 0.8 * squares[this.getId(square_id, "up")].getUtility();
                if (!this.wall(square_id, "left"))
                    PU_up += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
                if (!this.wall(square_id, "right"))
                    PU_up += 0.1 * (squares[this.getId(square_id, "right")].getUtility());
                PU.push(PU_up);
                PU_dir.push("up");
            }
            if (!this.wall(square_id, "right")) {
                var PU_right = 0.8 * squares[this.getId(square_id, "right")].getUtility();
                if (!this.wall(square_id, "up"))
                    PU_right += 0.1 * (squares[this.getId(square_id, "up")].getUtility());
                if (!this.wall(square_id, "down"))
                    PU_right += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
                PU.push(PU_right);
                PU_dir.push("right");
            }
            if (!this.wall(square_id, "down")) {
                var PU_down = 0.8 * squares[this.getId(square_id, "down")].getUtility();
                if (!this.wall(square_id, "right"))
                    PU_down += 0.1 * (squares[this.getId(square_id, "right")].getUtility());
                if (!this.wall(square_id, "left"))
                    PU_down += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
                PU.push(PU_down);
                PU_dir.push("down");
            }
            var best_value = PU[0];
            var best_choice = 0;
            for (var choice = 1; choice < PU.length; choice++) {
                if (best_value < PU[choice]) {
                    best_value = PU[choice];
                    best_choice = choice;
                }
            }
            var U = R + gamma * best_value;
            squares[square_id].setUtility(U);
        }
    };
    Brain.prototype.policyEvaluation = function (squares) {
        var N_STATES = squares.length;
        for (var square_id = 0; square_id < N_STATES; square_id++) {
            var direction = squares[square_id].getPolicy();
            var PU = [];
            var PU_dir = [];
            var R = squares[square_id].getReward();
            var gamma = 0.99;
            if (direction == "left" && !this.wall(square_id, "left")) {
                var PU_left = 0.8 * squares[this.getId(square_id, "left")].getUtility();
                if (!this.wall(square_id, "down"))
                    PU_left += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
                if (!this.wall(square_id, "up"))
                    PU_left += 0.1 * (squares[this.getId(square_id, "up")].getUtility());
                PU.push(PU_left);
                PU_dir.push("left");
            }
            if (direction == "up" && !this.wall(square_id, "up")) {
                var PU_up = 0.8 * squares[this.getId(square_id, "up")].getUtility();
                if (!this.wall(square_id, "left"))
                    PU_up += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
                if (!this.wall(square_id, "right"))
                    PU_up += 0.1 * (squares[this.getId(square_id, "right")].getUtility());
                PU.push(PU_up);
                PU_dir.push("up");
            }
            if (direction == "right" && !this.wall(square_id, "right")) {
                var PU_right = 0.8 * squares[this.getId(square_id, "right")].getUtility();
                if (!this.wall(square_id, "up"))
                    PU_right += 0.1 * (squares[this.getId(square_id, "up")].getUtility());
                if (!this.wall(square_id, "down"))
                    PU_right += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
                PU.push(PU_right);
                PU_dir.push("right");
            }
            if (direction == "down" && !this.wall(square_id, "down")) {
                var PU_down = 0.8 * squares[this.getId(square_id, "down")].getUtility();
                if (!this.wall(square_id, "right"))
                    PU_down += 0.1 * (squares[this.getId(square_id, "right")].getUtility());
                if (!this.wall(square_id, "left"))
                    PU_down += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
                PU.push(PU_down);
                PU_dir.push("down");
            }
            var best_value = PU[0];
            var best_choice = 0;
            for (var choice = 1; choice < PU.length; choice++) {
                if (best_value < PU[choice]) {
                    best_value = PU[choice];
                    best_choice = choice;
                }
            }
            var U = R + gamma * best_value;
            Environment._squares[square_id].setUtility(U);
        }
    };
    Brain.prototype.policyUpdate = function (squares, square_id) {
        var N_STATES = squares.length;
        for (var square_id = 0; square_id < N_STATES; square_id++) {
            var PU = [];
            var PU_dir = [];
            if (!this.wall(square_id, "left")) {
                var PU_left = 0.8 * squares[this.getId(square_id, "left")].getUtility();
                if (!this.wall(square_id, "down"))
                    PU_left += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
                if (!this.wall(square_id, "up"))
                    PU_left += 0.1 * (squares[this.getId(square_id, "up")].getUtility());
                PU.push(PU_left);
                PU_dir.push("left");
            }
            if (!this.wall(square_id, "up")) {
                var PU_up = 0.8 * squares[this.getId(square_id, "up")].getUtility();
                if (!this.wall(square_id, "left"))
                    PU_up += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
                if (!this.wall(square_id, "right"))
                    PU_up += 0.1 * (squares[this.getId(square_id, "right")].getUtility());
                PU.push(PU_up);
                PU_dir.push("up");
            }
            if (!this.wall(square_id, "right")) {
                var PU_right = 0.8 * squares[this.getId(square_id, "right")].getUtility();
                if (!this.wall(square_id, "up"))
                    PU_right += 0.1 * (squares[this.getId(square_id, "up")].getUtility());
                if (!this.wall(square_id, "down"))
                    PU_right += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
                PU.push(PU_right);
                PU_dir.push("right");
            }
            if (!this.wall(square_id, "down")) {
                var PU_down = 0.8 * squares[this.getId(square_id, "down")].getUtility();
                if (!this.wall(square_id, "right"))
                    PU_down += 0.1 * (squares[this.getId(square_id, "right")].getUtility());
                if (!this.wall(square_id, "left"))
                    PU_down += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
                PU.push(PU_down);
                PU_dir.push("down");
            }
            var best_value = PU[0];
            var best_choice = 0;
            for (var choice = 1; choice < PU.length; choice++) {
                if (best_value < PU[choice]) {
                    best_value = PU[choice];
                    best_choice = choice;
                }
            }
            squares[square_id].setPolicy(PU_dir[best_choice]);
        }
    };
    Brain.prototype.getBestPolicy = function (squares, current_square_id) {
        var Utilities = [];
        var Dirs = [];
        if (!this.wall(current_square_id, "left")) {
            var Utility_left = squares[this.getId(current_square_id, "left")].getUtility();
            Utilities.push(Utility_left);
            Dirs.push("left");
        }
        if (!this.wall(current_square_id, "up")) {
            var Utility_up = squares[this.getId(current_square_id, "up")].getUtility();
            Utilities.push(Utility_up);
            Dirs.push("up");
        }
        if (!this.wall(current_square_id, "right")) {
            var Utility_right = squares[this.getId(current_square_id, "right")].getUtility();
            Utilities.push(Utility_right);
            Dirs.push("right");
        }
        if (!this.wall(current_square_id, "down")) {
            var Utility_down = squares[this.getId(current_square_id, "down")].getUtility();
            Utilities.push(Utility_down);
            Dirs.push("down");
        }
        var best_value = Utilities[0];
        var best_choice = 0;
        for (var choice = 1; choice < Utilities.length; choice++) {
            if (best_value < Utilities[choice]) {
                best_value = Utilities[choice];
                best_choice = choice;
            }
        }
        return Dirs[best_choice];
    };
    Brain.prototype.displayAllUtilities = function () {
        for (var j = 0; j < Environment._sideLength; j++) {
            for (var i = 0; i < Environment._sideLength; i++) {
                var id = j * Environment._sideLength + i;
                if (Environment._squares[id].getType() != "wall") {
                    console.log("(" + j + "," + i + ") : " + Environment._squares[id].getUtility() + "-> " + this.getBestPolicy(Environment._squares, id));
                }
                else {
                    console.log("(" + j + "," + i + ") : wall");
                }
            }
        }
    };
    Brain.prototype.tryAddDirection = function (direction, path, prev_square_id) {
        var current_square_id = this.getId(prev_square_id, direction);
        var red_check = true;
        if (this._avoid_red && !this.wall(prev_square_id, direction) && path._squares[current_square_id].getType() == "red") {
            red_check = false;
        }
        this._iterations++;
        if (!this.wall(prev_square_id, direction) && red_check) {
            var newPath = new Path();
            newPath.copy(path);
            newPath.addDirection(direction);
            newPath.addSquareId(current_square_id);
            newPath.addReward(path._squares[current_square_id].getReward());
            var bad_expansion = false;
            var bad_node = false;
            var bad_id = -1;
            for (var i = 0; i < this._frontier.length; i++) {
                if (this._frontier[i].getLast_SquareId() == current_square_id) {
                    if (this._frontier[i].getReward() > newPath.getReward()) {
                        bad_expansion = true;
                    }
                    else {
                        bad_node = true;
                        bad_id = i;
                    }
                }
            }
            if (bad_node) {
                var temp_frontier = [];
                for (var i = 0; i < this._frontier.length; i++) {
                    if (i != bad_id) {
                        temp_frontier.push(this._frontier[i]);
                    }
                }
                this._frontier = temp_frontier;
            }
            if (!bad_expansion) {
                if (this._agent.UPDATE_SQUARES)
                    newPath._squares[current_square_id].setType("neutral");
                this.addFrontier(newPath);
            }
        }
    };
    Brain.prototype.shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };
    Brain.prototype.expandNode = function (square_id, path) {
        var dirs = ["left", "up", "right", "down"];
        dirs = this.shuffle(dirs);
        for (var i = 0; i < dirs.length; i++) {
            this.tryAddDirection(dirs[i], path, square_id);
        }
    };
    Brain.prototype.thinkForward = function (steps) {
        var move = "right";
        var first_square_id = this._agent._currentSquare;
        var empty_path = new Path();
        this.expandNode(first_square_id, empty_path);
        while (this._iterations < steps) {
            var num_expansions = this._frontier.length;
            for (var i = 0; i < num_expansions; i++) {
                this.expandNode(this._frontier[i].getLast_SquareId(), this._frontier[i]);
            }
        }
        var maxReward = -99;
        var next_frontier_id = -1;
        for (var i = 0; i < this._frontier.length; i++) {
            if (this._frontier[i].getReward() > maxReward) {
                maxReward = this._frontier[i].getReward();
                next_frontier_id = i;
            }
        }
        if (this._frontier[next_frontier_id].getReward() < 0) {
            this.Done();
            this.setMove("");
        }
        else {
            move = this._frontier[next_frontier_id].getFirst_Direction();
            this.setMove(move);
            this.reset();
        }
    };
    Brain.prototype.thinkStupid = function () {
        var dirs = ["left", "up", "right", "down"];
        this.shuffle(dirs);
        this.setMove(dirs[0]);
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
        this.setMove(move);
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
    Brain.prototype.wall = function (prev_square_id, direction) {
        if (!this.outerWall(prev_square_id, direction)) {
            var slot = this.getId(prev_square_id, direction);
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
