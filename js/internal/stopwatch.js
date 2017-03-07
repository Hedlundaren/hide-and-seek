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
    Stopwatch.prototype.setStartTime = function (t) {
        this._startTime = t;
    };
    Stopwatch.prototype.getStartTime = function () { return this._startTime; };
    return Stopwatch;
}());
