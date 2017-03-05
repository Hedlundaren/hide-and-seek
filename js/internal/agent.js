"use strict";
var Stopwatch = (function () {
    function Stopwatch(time) {
        this._time = time;
        this._startTime = time;
        this._done = false;
    }
    Stopwatch.prototype.done = function () { return this._done; };
    Stopwatch.prototype.reset = function () { this._time = this._startTime; this._done = false; };
    Stopwatch.prototype.update = function (deltaTime) {
        if (this._time > 0)
            this._time -= deltaTime;
        else
            this._done = true;
    };
    return Stopwatch;
}());
var Agent = (function () {
    function Agent() {
        var _this = this;
        this.onMouseDown = function (e) {
            switch (e.target.value) {
                case "Reset":
                    _this.reset(15);
                    break;
                default:
            }
        };
        this.onKeyDown = function (e) {
            var size = Math.sqrt(Environment._squares.length);
            if (e) {
                switch (e.keyCode) {
                    case 37:
                    case 65:
                        _this.moveLeft(size);
                        break;
                    case 38:
                    case 87:
                        _this.moveUp(size);
                        break;
                    case 39:
                    case 68:
                        _this.moveRight(size);
                        break;
                    case 40:
                    case 83:
                        _this.moveDown(size);
                        break;
                    case 82:
                        _this.reset(15);
                        break;
                    case 72:
                        $("#ui").fadeToggle(300, null);
                        break;
                    default:
                }
            }
        };
        this._position = Environment._squares[15]._center;
        this._velocity = $V([0, 0]);
        this._acceleration = $V([0, 0]);
        this._mass = 0.8;
        this._totalReward = 0.0;
        this._sprite = new Sprite("textures/test.png");
        this._goalPosition = this._position;
        this._currentSquare = 15;
        this._numOfMoves = 0;
        this._iteration = 0;
        this._stopwatch = new Stopwatch(10.0);
        this._prev_pos_error = $V([0, 0]);
        this._pos_integral = $V([0, 0]);
        this.updateInfo();
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('mousedown', this.onMouseDown, false);
    }
    Agent.prototype.calcValueIteration = function (s) {
        return this._totalReward;
    };
    Agent.prototype.calcPolicyIteration = function () {
    };
    Agent.prototype.calculateMove = function (type) {
        switch (type) {
            case "value":
                var U = this.calcValueIteration(this._currentSquare);
                Environment._squares[this._currentSquare].addUtility(U);
                this._iteration = 0;
                break;
            case "policy":
                break;
            default:
        }
    };
    Agent.prototype.getLeftId = function (s) { return this._currentSquare - Math.sqrt(Environment._squares.length); };
    ;
    Agent.prototype.getUpId = function (s) { return this._currentSquare - 1; };
    ;
    Agent.prototype.getRightId = function (s) { return s + Math.sqrt(Environment._squares.length); };
    ;
    Agent.prototype.getDownId = function (s) { return this._currentSquare + 1; };
    ;
    Agent.prototype.moveLeft = function (size) {
        if (this._currentSquare > size - 1) {
            var temp = this.getLeftId(this._currentSquare);
            this.innerWallCheck(temp, this._currentSquare);
        }
        else
            this.hitWall();
    };
    Agent.prototype.moveUp = function (size) {
        if (this._currentSquare % 6 != 0) {
            var temp = this.getUpId(this._currentSquare);
            this.innerWallCheck(temp, this._currentSquare);
        }
        else
            this.hitWall();
    };
    Agent.prototype.moveRight = function (size) {
        if (this._currentSquare < Environment._squares.length - size) {
            var temp = this.getRightId(this._currentSquare);
            this.innerWallCheck(temp, this._currentSquare);
        }
        else
            this.hitWall();
    };
    Agent.prototype.moveDown = function (size) {
        if ((this._currentSquare + 1) % 6 != 0) {
            var temp = this.getDownId(this._currentSquare);
            this.innerWallCheck(temp, this._currentSquare);
        }
        else
            this.hitWall();
    };
    Agent.prototype.setGoal = function (goal, prev) {
        this._currentSquare = goal;
        Environment._squares[goal].enterSquare();
        Environment._squares[prev].leaveSquare();
        this._goalPosition = Environment._squares[this._currentSquare]._center;
        this._totalReward += Environment._squares[this._currentSquare].getReward();
        this._numOfMoves++;
        this.updateInfo();
        this.calculateMove("value");
    };
    Agent.prototype.hitWall = function () {
        Environment._background.hitWall();
        var agentHistoryDiv = document.getElementById('agent-history');
        agentHistoryDiv.innerHTML = '- wall -' + '<br>' + agentHistoryDiv.innerHTML;
    };
    Agent.prototype.hitInnerWall = function (wall) {
        Environment._squares[wall].hitWall();
        var agentHistoryDiv = document.getElementById('agent-history');
        agentHistoryDiv.innerHTML = '- wall -' + '<br>' + agentHistoryDiv.innerHTML;
    };
    Agent.prototype.innerWallCheck = function (temp, prev) {
        if (Environment._squares[temp].getType() != "wall")
            this.setGoal(temp, prev);
        else
            this.hitInnerWall(temp);
    };
    Agent.prototype.getGridPos = function () {
        var size = Math.sqrt(Environment._squares.length);
        var xPos = Math.floor(this._currentSquare / size);
        var yPos = this._currentSquare % 6;
        return $V([xPos, yPos]);
    };
    Agent.prototype.getInfoString = function () {
        var pos = this.getGridPos().elements;
        return '<p class= "' + Environment._squares[this._currentSquare].getType() + ' history-text"' +
            '>' + this._numOfMoves +
            ' | ' + '(' + pos[0] + ',' + pos[1] + ')' +
            ' | ' + Environment._squares[this._currentSquare].getReward() +
            ' | ' + Math.round(this._totalReward * 100) / 100 +
            '</p>';
    };
    Agent.prototype.updateGridPosInfo = function () {
        var agentPosDiv = document.getElementById('agent-pos');
        agentPosDiv.innerHTML = this.getInfoString();
        agentPosDiv.className = Environment._squares[this._currentSquare].getType();
    };
    Agent.prototype.updateHistoryInfo = function () {
        var agentHistoryDiv = document.getElementById('agent-history');
        agentHistoryDiv.innerHTML = this.getInfoString() + agentHistoryDiv.innerHTML;
    };
    Agent.prototype.clearHistory = function () {
        document.getElementById('agent-history').innerText = "";
    };
    Agent.prototype.updateInfo = function () {
        this.updateGridPosInfo();
        this.updateHistoryInfo();
    };
    Agent.prototype.reset = function (start) {
        this.setGoal(start, this._currentSquare);
        this._numOfMoves = 0;
        this._currentSquare = start;
        this._iteration = 0;
        this._totalReward = 0;
        for (var i = 0; i < Environment._squares.length; i++) {
            Environment._squares[i].setUtility(0);
        }
        this.updateGridPosInfo();
        this.clearHistory();
    };
    Agent.prototype.moveTowardsGoal = function (deltaTime) {
        var kP = .0004;
        var kI = .0;
        var kD = .7;
        var pos_error = this._goalPosition.add(this._position.multiply(-1));
        this._pos_integral = this._pos_integral.add(pos_error.multiply(deltaTime));
        var pos_derivative = pos_error.add(this._prev_pos_error.multiply(-1)).multiply(1.0 / deltaTime);
        var pos_adjustment = pos_error.multiply(kP).add(pos_derivative.multiply(kD)).add(this._pos_integral.multiply(kI));
        this._prev_pos_error = pos_error;
        this.addForce(pos_adjustment, deltaTime);
    };
    Agent.prototype.addForce = function (force, deltaTime) {
        this._acceleration = force.multiply(1.0 / this._mass);
        this._velocity = this._velocity.add(this._acceleration.multiply(deltaTime));
        this._position = this._position.add(this._velocity.multiply(deltaTime));
    };
    Agent.prototype.update = function (deltaTime) {
        this._stopwatch.update(deltaTime);
        this.moveTowardsGoal(deltaTime);
        this.updateSprite();
    };
    Agent.prototype.updateSprite = function () {
        this._sprite.setPosition(this._position.elements[0], this._position.elements[1]);
    };
    return Agent;
}());
