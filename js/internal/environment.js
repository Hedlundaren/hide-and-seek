var Environment = (function () {
    function Environment(theme) {
        this._theme = theme;
        this.createGrid(6, 6, 427);
        this._agent = new Agent();
    }
    Environment.prototype.update = function (deltaTime) {
        this._agent.update(deltaTime);
        Environment._background.update(deltaTime);
        for (var i = 0; i < Environment._squares.length; i++) {
            Environment._squares[i].update(deltaTime);
        }
    };
    Environment.prototype.createGrid = function (X, Y, envSize) {
        Environment._squares = [];
        var xStart = 160;
        var yStart = 100;
        var margin = 1;
        var squareSize = envSize / X - margin;
        var bg_margin = 20;
        var backdrop_radius = 5;
        var square_radius = 1;
        var backdrop1 = new Square($V([xStart - bg_margin, yStart - bg_margin]), "wallhit", X * (squareSize + margin) + 2 * bg_margin, backdrop_radius);
        backdrop1.setType("wallhit", this._theme);
        Environment._background = new Square($V([xStart - bg_margin, yStart - bg_margin]), "wall", X * (squareSize + margin) + 2 * bg_margin, backdrop_radius);
        Environment._background.setType("wall", this._theme);
        var backdrop2 = new Square($V([xStart, yStart]), "wallhit", X * (squareSize), backdrop_radius);
        backdrop2.setType("wallhit", this._theme);
        for (var i = 0; i < X; i++) {
            for (var j = 0; j < Y; j++) {
                Environment._squares.push(new Square($V([xStart + (squareSize + margin) * i,
                    yStart + (squareSize + margin) * j]), "neutral", squareSize, square_radius));
                Environment._squares[j + X * i].setType("neutral", this._theme);
            }
        }
        Environment._squares[15].setType("start", this._theme);
        Environment._squares[0].setType("green", this._theme);
        Environment._squares[12].setType("green", this._theme);
        Environment._squares[30].setType("green", this._theme);
        Environment._squares[19].setType("green", this._theme);
        Environment._squares[26].setType("green", this._theme);
        Environment._squares[33].setType("green", this._theme);
        Environment._squares[7].setType("red", this._theme);
        Environment._squares[31].setType("red", this._theme);
        Environment._squares[14].setType("red", this._theme);
        Environment._squares[21].setType("red", this._theme);
        Environment._squares[28].setType("red", this._theme);
        Environment._squares[6].setType("wall", this._theme);
        Environment._squares[25].setType("wall", this._theme);
        Environment._squares[10].setType("wall", this._theme);
        Environment._squares[16].setType("wall", this._theme);
        Environment._squares[22].setType("wall", this._theme);
    };
    return Environment;
}());
