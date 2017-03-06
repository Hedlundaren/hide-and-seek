"use strict";
var Main = (function () {
    function Main() {
        var _this = this;
        this.onMouseDown = function (e) {
            switch (e.target.value) {
                case "Theme":
                    _this.toggleTheme();
                    break;
            }
        };
        this.onKeyDown = function (e) {
            if (e) {
                switch (e.keyCode) {
                    case 84:
                        _this.toggleTheme();
                        break;
                }
            }
        };
        this._theme = "night";
        this._environment = new Environment("night");
        this._renderer = new Renderer();
        window.addEventListener('mousedown', this.onMouseDown, false);
        window.addEventListener('keydown', this.onKeyDown, false);
    }
    Main.prototype.start = function () {
        this.update();
    };
    Main.prototype.update = function () {
        var _this = this;
        var time = Date.now() / 1000;
        var deltaTime = 0.3;
        this._renderer.render();
        this._environment.update(deltaTime);
        requestAnimationFrame(function () { return _this.update(); });
    };
    Main.prototype.toggleTheme = function () {
        if (this._theme == "night")
            this._theme = "day";
        else if (this._theme == "day")
            this._theme = "night";
        if (this._theme == "night") {
            this._renderer.setBackground("0x222222");
            $("#HUD").css("opacity", "0.7");
            for (var i = 0; i < Environment._squares.length; i++) {
                Environment._squares[i].setType(Environment._squares[i].getType(), this._theme);
            }
            Environment._background.setType(Environment._background.getType(), this._theme);
        }
        else {
            this._renderer.setBackground("0xFFFFFF");
            $("#HUD").css("opacity", "1.0");
            for (var i = 0; i < Environment._squares.length; i++) {
                Environment._squares[i].setType(Environment._squares[i].getType(), this._theme);
            }
            Environment._background.setType(Environment._background.getType(), this._theme);
        }
    };
    return Main;
}());
window.onload = function () {
    var main = new Main();
    main.start();
};
