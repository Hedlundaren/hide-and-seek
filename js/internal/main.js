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
        this._environment = new Environment();
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
        if (Environment._theme == "night")
            Environment._theme = "day";
        else if (Environment._theme == "day")
            Environment._theme = "night";
        for (var i = 0; i < Environment._squares.length; i++) {
            Environment._squares[i].setType(Environment._squares[i].getType(), Environment._theme);
        }
        Environment._background.setType(Environment._background.getType(), Environment._theme);
        Environment._backdrop1.setType(Environment._backdrop1.getType(), Environment._theme);
        Environment._backdrop2.setType(Environment._backdrop2.getType(), Environment._theme);
        if (Environment._theme == "night") {
            $("#HUD").css("opacity", "0.7");
            $("#all-holder").css("background", "RGBA(70,60,70,0.15)");
            $("body").css("background", "RGBA(20, 20, 20,1.0)");
            this._renderer.setBackground("0x222222");
        }
        else {
            this._renderer.setBackground("0xFFFFFF");
            $("#HUD").css("opacity", "1.0");
            $("#all-holder").css("background", "RGBA(255,255,255,1.0)");
            $("body").css("background", "RGBA(200, 200, 200,1.0)");
        }
    };
    return Main;
}());
window.onload = function () {
    var main = new Main();
    main.start();
};
