var Environment = (function () {
    function Environment() {
        Environment._theme = "night";
        Environment._mapType = "random";
        Environment._sideLength = 6;
        Environment._start = 15;
        this.createGrid(Environment._sideLength, Environment._sideLength, 500);
        this._agent = new Agent();
    }
    Environment.prototype.update = function (deltaTime) {
        this._agent.update(deltaTime);
        Environment._background.update(deltaTime);
        for (var i = 0; i < Environment._squares.length; i++) {
            Environment._squares[i].update(deltaTime);
        }
    };
    Environment.setMap = function (type) {
        if (type == "standard") {
            Environment._squares[Environment._start].setType("start", Environment._theme);
            Environment._squares[0].setType("green", Environment._theme);
            Environment._squares[12].setType("green", Environment._theme);
            Environment._squares[30].setType("green", Environment._theme);
            Environment._squares[19].setType("green", Environment._theme);
            Environment._squares[26].setType("green", Environment._theme);
            Environment._squares[33].setType("green", Environment._theme);
            Environment._squares[7].setType("red", Environment._theme);
            Environment._squares[31].setType("red", Environment._theme);
            Environment._squares[14].setType("red", Environment._theme);
            Environment._squares[21].setType("red", Environment._theme);
            Environment._squares[28].setType("red", Environment._theme);
            Environment._squares[6].setType("wall", Environment._theme);
            Environment._squares[25].setType("wall", Environment._theme);
            Environment._squares[10].setType("wall", Environment._theme);
            Environment._squares[16].setType("wall", Environment._theme);
            Environment._squares[22].setType("wall", Environment._theme);
        }
        else if (type == "random") {
            Environment._squares[Environment._start].setType("start", Environment._theme);
            for (var i = 0; i < Environment._squares.length; i++) {
                if (i != Environment._start) {
                    var num = Math.floor(Math.random() * 36);
                    switch (true) {
                        case num < 4:
                            Environment._squares[i].setType("wall", Environment._theme);
                            break;
                        case (num > 3 && num < 9):
                            Environment._squares[i].setType("red", Environment._theme);
                            break;
                        case (num > 8 && num < 15):
                            Environment._squares[i].setType("green", Environment._theme);
                            break;
                        default: Environment._squares[i].setType("neutral", Environment._theme);
                    }
                }
            }
        }
    };
    Environment.prototype.createGrid = function (X, Y, envSize) {
        Environment._squares = [];
        var xStart = 20;
        var yStart = 20;
        var margin = 1;
        var squareSize = envSize / X - margin;
        var bg_margin = 20;
        var backdrop_radius = 5;
        var square_radius = 1;
        Environment._backdrop1 = new Square($V([xStart - bg_margin, yStart - bg_margin]), -1, "wallhit", X * (squareSize + margin) + 2 * bg_margin, backdrop_radius);
        Environment._backdrop1.setType("wallhit", Environment._theme);
        Environment._background = new Square($V([xStart - bg_margin, yStart - bg_margin]), -1, "wall", X * (squareSize + margin) + 2 * bg_margin, backdrop_radius);
        Environment._background.setType("wall", Environment._theme);
        Environment._backdrop2 = new Square($V([xStart, yStart]), -1, "wallhit", X * (squareSize), backdrop_radius);
        Environment._backdrop2.setType("wallhit", Environment._theme);
        for (var i = 0; i < X; i++) {
            for (var j = 0; j < Y; j++) {
                Environment._squares.push(new Square($V([xStart + (squareSize + margin) * i,
                    yStart + (squareSize + margin) * j]), j + i * X, "neutral", squareSize, square_radius));
                Environment._squares[j + X * i].setType("neutral", Environment._theme);
            }
        }
        Environment.setMap("random");
    };
    return Environment;
}());
