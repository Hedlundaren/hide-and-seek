"use strict";
var Agent = (function () {
    function Agent() {
        var _this = this;
        this.onMouseDown = function (e) {
            switch (e.target.value) {
                case "Reset":
                    _this.reset(15);
                    break;
                case "Auto":
                    _this.toggleAutoMove();
                    break;
                case "Speed":
                    _this.toggleSpeed();
                    break;
                case "HUD":
                    _this.toggleHUD();
                    break;
                case "Stupid":
                    _this._brain.setBrain("stupid");
                    break;
                case "Simple":
                    _this._brain.setBrain("simple");
                    break;
                case "Forward":
                    _this._brain.setBrain("forward");
                    break;
                case "Careful":
                    _this._brain.setBrain("careful");
                    break;
                case "Value":
                    _this._brain.setBrain("value");
                    break;
                case "Policy":
                    _this._brain.setBrain("policy");
                    break;
                case "Random Map":
                    var current = document.getElementById("random_map");
                    if (Environment._mapType != "standard") {
                        Environment._mapType = "standard";
                        $(current).css("border-left", "7px solid RGBA(240,140,140,1)");
                    }
                    else {
                        $(current).css("border-left", "7px solid RGBA(140,240,140,1)");
                        Environment._mapType = "random";
                    }
                    _this.reset(15);
                    break;
                case "Update Squares":
                    _this.UPDATE_SQUARES = !_this.UPDATE_SQUARES;
                    var current = document.getElementById("update_squares");
                    if (_this.UPDATE_SQUARES) {
                        $(current).css("border-left", "7px solid RGBA(140,240,140,1)");
                    }
                    else {
                        $(current).css("border-left", "7px solid RGBA(240,140,140,1)");
                    }
                    break;
                default:
            }
        };
        this.onKeyDown = function (e) {
            if (e) {
                switch (e.keyCode) {
                    case 37:
                    case 65:
                        _this._nextMove = "left";
                        _this.moveLeft();
                        break;
                    case 38:
                    case 87:
                        _this._nextMove = "up";
                        _this.moveUp();
                        break;
                    case 39:
                    case 68:
                        _this._nextMove = "right";
                        _this.moveRight();
                        break;
                    case 40:
                    case 83:
                        _this._nextMove = "down";
                        _this.moveDown();
                        break;
                    case 82:
                        _this.reset(15);
                        _this._nextMove = "";
                        break;
                    case 72:
                        _this.toggleHUD();
                        break;
                    case 32:
                        _this.toggleAutoMove();
                        break;
                    case 81:
                        _this.toggleSpeed();
                        break;
                    case 49:
                        _this._brain.setBrain("stupid");
                        break;
                    case 50:
                        _this._brain.setBrain("simple");
                        break;
                    case 51:
                        _this._brain.setBrain("forward");
                        break;
                    case 52:
                        _this._brain.setBrain("careful");
                        break;
                    case 53:
                        _this._brain.setBrain("value");
                        break;
                    case 54:
                        _this._brain.setBrain("policy");
                        break;
                    default:
                }
            }
        };
        this._position = Environment._squares[15]._center;
        this._velocity = $V([0, 0]);
        this._acceleration = $V([0, 0]);
        this._mass = 0.3;
        this._fast = true;
        this._brain = new Brain(this, "");
        this._totalReward = 0.0;
        this._sprite = new Sprite("textures/AI.png");
        this._goalPosition = this._position;
        this._currentSquare = 15;
        this._numOfMoves = 0;
        this._iteration = 0;
        this._travelTimer = new Stopwatch(0.1);
        this._autoMove = false;
        this._nextMove = "";
        this._HUD = false;
        this.UPDATE_SQUARES = false;
        this._prev_pos_error = $V([0, 0]);
        this._pos_integral = $V([0, 0]);
        this.updateInfo();
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('mousedown', this.onMouseDown, false);
        this._brain.setBrain("policy");
        $('.fa-rocket').toggleClass('fa-blind');
        this.toggleSpeed();
        this.toggleHUD();
    }
    Agent.prototype.setMove = function (direction) {
        this._nextMove = direction;
    };
    Agent.prototype.getMove = function () {
        return this._nextMove;
    };
    Agent.prototype.toggleAutoMove = function () {
        this._autoMove = !this._autoMove;
        $('.fa-play').toggleClass('fa-pause');
        if (!this._autoMove) {
            var playbtn = document.getElementById('play-div');
            playbtn.innerHTML = 'play';
        }
        else {
            var playbtn = document.getElementById('play-div');
            playbtn.innerHTML = 'stop';
        }
    };
    Agent.prototype.update = function (deltaTime) {
        this._travelTimer.update(deltaTime);
        if (this._travelTimer.done()) {
            if (this._autoMove) {
                this._brain.think();
                switch (this._nextMove) {
                    case "left":
                        this.moveLeft();
                        break;
                    case "up":
                        this.moveUp();
                        break;
                    case "right":
                        this.moveRight();
                        break;
                    case "down":
                        this.moveDown();
                        break;
                }
            }
            this._travelTimer.reset();
        }
        else {
            this.moveTowardsGoal(deltaTime);
            this.updateSprite();
        }
    };
    Agent.prototype.reset = function (start) {
        this.setGoal(start, this._currentSquare);
        this._numOfMoves = 0;
        this._currentSquare = start;
        this._iteration = 0;
        this._totalReward = 0;
        this._nextMove = "";
        this._brain.reset();
        for (var i = 0; i < Environment._squares.length; i++) {
            Environment._squares[i].setUtility(0);
        }
        this.updateCurrentStatusInfo();
        this.clearHistory();
        Environment.setMap(Environment._mapType);
    };
    Agent.prototype.setBrainSelected = function (current_id, prev_id) {
        var current = document.getElementById(current_id);
        var prev = document.getElementById(prev_id);
        $(prev).css("opacity", "0.5");
        $(prev).css("color", " RGBA(120,120,120,1)");
        $(prev).css("box-shadow", "0px 0px 0px #888888");
        $(current).css("opacity", "1.0");
        $(current).css("color", "RGBA(200,200,200,1)");
        $(current).css("box-shadow", "3px 2px 3px RGBA(100,100,100,0.5)");
    };
    Agent.prototype.toggleHUD = function () {
        var fadeSpeed = 300;
        if (this._HUD) {
            $("#agent-current-status").fadeTo(fadeSpeed, 0.0);
            $("#agent-history-holder").fadeTo(fadeSpeed, 0.0);
        }
        else {
            $("#agent-current-status").fadeTo(fadeSpeed, 1);
            $("#agent-history-holder").fadeTo(fadeSpeed, 1);
        }
        this._HUD = !this._HUD;
    };
    Agent.prototype.getInfoString = function () {
        var pos = this.getGridPos().elements;
        return '<p class= "' + Environment._squares[this._currentSquare].getType() + ' history-text"' +
            '>' + this._numOfMoves +
            ' | ' + '(' + pos[0] + ',' + pos[1] + ')' +
            ' | ' + Math.round(Environment._squares[this._currentSquare].getUtility() * 100) / 100 +
            ' | ' + Math.round(this._totalReward * 100) / 100 +
            '</p>';
    };
    Agent.prototype.updateCurrentStatusInfo = function () {
        var pos = this.getGridPos().elements;
        var agentCurrentStatusDiv = document.getElementById('agent-current-status');
        var agentNMovesDiv = document.getElementById('agent-n-moves');
        var agentPosDiv = document.getElementById('agent-pos');
        var agentRewardDiv = document.getElementById('agent-reward');
        var agentTotRewardDiv = document.getElementById('agent-tot-reward');
        agentNMovesDiv.innerHTML = '' + this._numOfMoves;
        agentPosDiv.innerHTML = '(' + pos[0] + ',' + pos[1] + ')';
        agentRewardDiv.innerHTML = '' + Math.round(Environment._squares[this._currentSquare].getUtility() * 100) / 100;
        agentTotRewardDiv.innerHTML = '' + Math.round(this._totalReward * 100) / 100;
        agentCurrentStatusDiv.className = Environment._squares[this._currentSquare].getType();
    };
    Agent.prototype.updateHistoryInfo = function () {
        var agentHistoryDiv = document.getElementById('agent-history');
        agentHistoryDiv.innerHTML = this.getInfoString() + agentHistoryDiv.innerHTML.substring(0, 2000);
    };
    Agent.prototype.clearHistory = function () {
        document.getElementById('agent-history').innerText = "";
    };
    Agent.prototype.updateInfo = function () {
        this.updateCurrentStatusInfo();
        this.updateHistoryInfo();
    };
    Agent.prototype.getLeftId = function () { return this._currentSquare - Environment._sideLength; };
    ;
    Agent.prototype.getUpId = function () { return this._currentSquare - 1; };
    ;
    Agent.prototype.getRightId = function () { return this._currentSquare + Environment._sideLength; };
    ;
    Agent.prototype.getDownId = function () { return this._currentSquare + 1; };
    ;
    Agent.prototype.outerWallCheck = function (direction) {
        switch (direction) {
            case "left": return this._currentSquare > Environment._sideLength - 1;
            case "up": return this._currentSquare % Environment._sideLength != 0;
            case "right": return this._currentSquare < Environment._squares.length - Environment._sideLength;
            case "down": return (this._currentSquare + 1) % Environment._sideLength != 0;
        }
    };
    Agent.prototype.moveLeft = function () {
        if (this.outerWallCheck("left")) {
            var temp = this.getLeftId();
            this.innerWallCheck(temp, this._currentSquare);
        }
        else {
            this.bumpTowards("left");
            this.hitWall();
        }
    };
    Agent.prototype.moveUp = function () {
        if (this.outerWallCheck("up")) {
            var temp = this.getUpId();
            this.innerWallCheck(temp, this._currentSquare);
        }
        else {
            this.hitWall();
            this.bumpTowards("up");
        }
    };
    Agent.prototype.moveRight = function () {
        if (this.outerWallCheck("right")) {
            var temp = this.getRightId();
            this.innerWallCheck(temp, this._currentSquare);
        }
        else {
            this.hitWall();
            this.bumpTowards("right");
        }
    };
    Agent.prototype.moveDown = function () {
        if (this.outerWallCheck("down")) {
            var temp = this.getDownId();
            this.innerWallCheck(temp, this._currentSquare);
        }
        else {
            this.hitWall();
            this.bumpTowards("down");
        }
    };
    Agent.prototype.setGoal = function (goal, prev) {
        this._travelTimer.reset();
        this._currentSquare = goal;
        this._goalPosition = Environment._squares[this._currentSquare]._center;
        Environment._squares[goal].enterSquare();
        this._totalReward += Environment._squares[this._currentSquare].getReward();
        Environment._squares[prev].leaveSquare();
        this._numOfMoves++;
        this.updateInfo();
        if (Environment._squares[goal].getType() != "start") {
            if (this.UPDATE_SQUARES)
                Environment._squares[goal].setType("neutral");
        }
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
        else {
            this.hitInnerWall(temp);
            this.bumpTowards(this._nextMove);
        }
    };
    Agent.prototype.getGridPos = function () {
        var size = Math.sqrt(Environment._squares.length);
        var xPos = Math.floor(this._currentSquare / size);
        var yPos = this._currentSquare % 6;
        return $V([xPos, yPos]);
    };
    Agent.prototype.multiplySpeed = function (factor) {
        var newTime = this._travelTimer.getStartTime() * (1 / factor);
        this._travelTimer.setStartTime(newTime);
    };
    Agent.prototype.toggleSpeed = function () {
        $('.fa-rocket').toggleClass('fa-blind');
        this._fast = !this._fast;
        var speedbtn = document.getElementById('speed');
        if (this._fast) {
            this.speedUp();
            speedbtn.innerHTML = 'slow';
        }
        else {
            this.speedDown();
            speedbtn.innerHTML = 'fast';
        }
    };
    Agent.prototype.speedUp = function () {
        this.setSpeed(0.1);
        this._fast = true;
    };
    Agent.prototype.speedDown = function () {
        this.setSpeed(10);
        this._fast = false;
    };
    Agent.prototype.setSpeed = function (speed) {
        this._travelTimer.setStartTime(speed);
    };
    Agent.prototype.bumpTowards = function (direction) {
        var bump = 30;
        switch (direction) {
            case "left":
                this._position.elements[0] -= bump;
                break;
            case "up":
                this._position.elements[1] -= bump;
                break;
            case "right":
                this._position.elements[0] += bump;
                break;
            case "down":
                this._position.elements[1] += bump;
                break;
        }
    };
    Agent.prototype.moveTowardsGoal = function (deltaTime) {
        var kP = .0004;
        var kI = .0;
        var kD = 0.5;
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
    Agent.prototype.updateSprite = function () {
        this._sprite.setPosition(this._position.elements[0], this._position.elements[1]);
    };
    return Agent;
}());
